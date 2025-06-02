/**
 * AI-IT Inc - Network Scanner Service
 * Creator: Steven Chason
 * Company: AI-IT Inc
 * Address: 88 Perch St, Winterhaven FL 33881
 * Phone: 863-308-4979
 *
 * NOT FOR RESALE - Proprietary Software
 * © 2024 AI-IT Inc. All rights reserved.
 */

import { exec } from "child_process"
import { promisify } from "util"
import * as os from "os"

const execAsync = promisify(exec)

export interface NetworkDevice {
  ip: string
  hostname?: string
  mac?: string
  vendor?: string
  deviceType: string
  status: "online" | "offline" | "unknown"
  ports: number[]
  services: string[]
  lastSeen: Date
  responseTime?: number
  riskLevel: "low" | "medium" | "high"
  capabilities: string[]
}

export interface ScanOptions {
  timeout?: number
  ports?: number[]
  aggressive?: boolean
}

class NetworkScannerService {
  private deviceCache = new Map<string, NetworkDevice>()
  private scanHistory: Array<{ timestamp: Date; devicesFound: number }> = []

  async scanRange(range: string, options: ScanOptions = {}): Promise<NetworkDevice[]> {
    const {
      timeout = 5000,
      ports = [22, 23, 53, 80, 135, 139, 443, 445, 993, 995, 1723, 3389, 5900, 8080],
      aggressive = false,
    } = options

    console.log(`[AI-IT Network Scanner] Starting scan of ${range}...`)

    try {
      const devices: NetworkDevice[] = []
      const ips = this.generateIPRange(range)

      // Limit concurrent scans to prevent overwhelming the network
      const batchSize = 20
      for (let i = 0; i < ips.length; i += batchSize) {
        const batch = ips.slice(i, i + batchSize)
        const batchPromises = batch.map((ip) => this.scanDevice(ip, { timeout, ports, aggressive }))

        const batchResults = await Promise.allSettled(batchPromises)

        for (const result of batchResults) {
          if (result.status === "fulfilled" && result.value) {
            devices.push(result.value)
            this.deviceCache.set(result.value.ip, result.value)
          }
        }
      }

      // Update scan history
      this.scanHistory.push({
        timestamp: new Date(),
        devicesFound: devices.length,
      })

      // Keep only last 100 scan records
      if (this.scanHistory.length > 100) {
        this.scanHistory = this.scanHistory.slice(-100)
      }

      console.log(`[AI-IT Network Scanner] Scan complete. Found ${devices.length} devices.`)
      return devices
    } catch (error) {
      console.error("[AI-IT Network Scanner] Scan error:", error)
      return []
    }
  }

  private async scanDevice(ip: string, options: ScanOptions): Promise<NetworkDevice | null> {
    try {
      const startTime = Date.now()

      // Check if device is reachable
      const isReachable = await this.pingHost(ip, options.timeout || 5000)
      if (!isReachable) {
        return null
      }

      const responseTime = Date.now() - startTime

      // Get hostname and MAC address
      const hostname = await this.getHostname(ip)
      const mac = await this.getMacAddress(ip)
      const vendor = mac ? await this.getVendorFromMac(mac) : undefined

      // Scan common ports
      const openPorts = await this.scanPorts(ip, options.ports || [])

      // Identify services and device type
      const services = this.identifyServices(openPorts)
      const deviceType = this.identifyDeviceType(openPorts, hostname, vendor)
      const capabilities = this.identifyCapabilities(openPorts, services)
      const riskLevel = this.assessRiskLevel(openPorts, services, deviceType)

      const device: NetworkDevice = {
        ip,
        hostname,
        mac,
        vendor,
        deviceType,
        status: "online",
        ports: openPorts,
        services,
        lastSeen: new Date(),
        responseTime,
        riskLevel,
        capabilities,
      }

      return device
    } catch (error) {
      console.error(`[AI-IT Network Scanner] Error scanning ${ip}:`, error)
      return null
    }
  }

  private async pingHost(ip: string, timeout: number): Promise<boolean> {
    try {
      const platform = os.platform()
      let command: string

      if (platform === "win32") {
        command = `ping -n 1 -w ${timeout} ${ip}`
      } else {
        command = `ping -c 1 -W ${Math.ceil(timeout / 1000)} ${ip}`
      }

      const { stdout } = await execAsync(command)

      if (platform === "win32") {
        return stdout.includes("TTL=") || stdout.includes("time<")
      } else {
        return stdout.includes("1 received") || stdout.includes("1 packets received")
      }
    } catch (error) {
      return false
    }
  }

  private async getHostname(ip: string): Promise<string | undefined> {
    try {
      const platform = os.platform()
      let command: string

      if (platform === "win32") {
        command = `nslookup ${ip}`
      } else {
        command = `dig -x ${ip} +short`
      }

      const { stdout } = await execAsync(command)

      if (platform === "win32") {
        const match = stdout.match(/Name:\s+(.+)/i)
        return match ? match[1].trim() : undefined
      } else {
        const hostname = stdout.trim()
        return hostname && !hostname.includes("NXDOMAIN") ? hostname : undefined
      }
    } catch (error) {
      return undefined
    }
  }

  private async getMacAddress(ip: string): Promise<string | undefined> {
    try {
      const platform = os.platform()
      let command: string

      if (platform === "win32") {
        command = `arp -a ${ip}`
      } else {
        command = `arp -n ${ip}`
      }

      const { stdout } = await execAsync(command)

      const macMatch = stdout.match(/([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}/)
      return macMatch ? macMatch[0] : undefined
    } catch (error) {
      return undefined
    }
  }

  private async getVendorFromMac(mac: string): Promise<string | undefined> {
    // Simple vendor identification based on OUI (first 3 octets)
    const oui = mac.replace(/[:-]/g, "").substring(0, 6).toUpperCase()

    const vendors: Record<string, string> = {
      "001B63": "Apple",
      "00E04C": "Realtek",
      "001E58": "WistronNeweb",
      "0050F2": "Microsoft",
      "001CF0": "Liverpool",
      "00D0C9": "Intel",
      "000C29": "VMware",
      "005056": "VMware",
      "0003FF": "Microsoft",
      "001DD8": "Hewlett Packard",
      "002608": "Hewlett Packard Enterprise",
    }

    return vendors[oui] || "Unknown"
  }

  private async scanPorts(ip: string, ports: number[]): Promise<number[]> {
    const openPorts: number[] = []
    const timeout = 3000

    // Scan ports in batches to avoid overwhelming the target
    const batchSize = 10
    for (let i = 0; i < ports.length; i += batchSize) {
      const batch = ports.slice(i, i + batchSize)
      const batchPromises = batch.map((port) => this.checkPort(ip, port, timeout))

      const results = await Promise.allSettled(batchPromises)

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          openPorts.push(batch[index])
        }
      })
    }

    return openPorts
  }

  private async checkPort(ip: string, port: number, timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require("net")
      const socket = new net.Socket()

      const timer = setTimeout(() => {
        socket.destroy()
        resolve(false)
      }, timeout)

      socket.connect(port, ip, () => {
        clearTimeout(timer)
        socket.destroy()
        resolve(true)
      })

      socket.on("error", () => {
        clearTimeout(timer)
        resolve(false)
      })
    })
  }

  private identifyServices(ports: number[]): string[] {
    const services: string[] = []

    const serviceMap: Record<number, string> = {
      21: "FTP",
      22: "SSH",
      23: "Telnet",
      25: "SMTP",
      53: "DNS",
      80: "HTTP",
      110: "POP3",
      135: "RPC",
      139: "NetBIOS",
      143: "IMAP",
      443: "HTTPS",
      445: "SMB",
      993: "IMAPS",
      995: "POP3S",
      1723: "PPTP",
      3389: "RDP",
      5900: "VNC",
      8080: "HTTP-Alt",
    }

    for (const port of ports) {
      if (serviceMap[port]) {
        services.push(serviceMap[port])
      }
    }

    return services
  }

  private identifyDeviceType(ports: number[], hostname?: string, vendor?: string): string {
    // Camera detection
    if (ports.includes(80) || ports.includes(443) || ports.includes(554) || ports.includes(8080)) {
      if (
        hostname?.toLowerCase().includes("camera") ||
        hostname?.toLowerCase().includes("ipc") ||
        vendor?.toLowerCase().includes("hikvision") ||
        vendor?.toLowerCase().includes("dahua")
      ) {
        return "IP Camera"
      }
    }

    // Router/Gateway detection
    if (ports.includes(80) && ports.includes(443) && (ports.includes(22) || ports.includes(23))) {
      return "Router/Gateway"
    }

    // Server detection
    if (ports.includes(22) && (ports.includes(80) || ports.includes(443))) {
      return "Server"
    }

    // Windows computer
    if (ports.includes(135) && ports.includes(139) && ports.includes(445)) {
      return "Windows Computer"
    }

    // Printer detection
    if (ports.includes(631) || ports.includes(9100)) {
      return "Printer"
    }

    // NAS detection
    if (ports.includes(139) && ports.includes(445) && ports.includes(548)) {
      return "NAS Device"
    }

    return "Unknown Device"
  }

  private identifyCapabilities(ports: number[], services: string[]): string[] {
    const capabilities: string[] = []

    if (services.includes("HTTP") || services.includes("HTTPS")) {
      capabilities.push("Web Interface")
    }

    if (services.includes("SSH")) {
      capabilities.push("Remote Shell")
    }

    if (services.includes("RDP")) {
      capabilities.push("Remote Desktop")
    }

    if (services.includes("VNC")) {
      capabilities.push("VNC Access")
    }

    if (services.includes("SMB")) {
      capabilities.push("File Sharing")
    }

    if (services.includes("FTP")) {
      capabilities.push("File Transfer")
    }

    return capabilities
  }

  private assessRiskLevel(ports: number[], services: string[], deviceType: string): "low" | "medium" | "high" {
    let riskScore = 0

    // High-risk services
    if (services.includes("Telnet")) riskScore += 3
    if (services.includes("FTP")) riskScore += 2
    if (services.includes("RDP")) riskScore += 2
    if (services.includes("VNC")) riskScore += 2

    // Medium-risk services
    if (services.includes("SSH")) riskScore += 1
    if (services.includes("SMB")) riskScore += 1

    // Device-specific risks
    if (deviceType === "IP Camera") riskScore += 1
    if (deviceType === "Router/Gateway") riskScore += 2

    // Port-based risks
    if (ports.includes(23)) riskScore += 3 // Telnet
    if (ports.includes(21)) riskScore += 2 // FTP
    if (ports.includes(135)) riskScore += 1 // RPC

    if (riskScore >= 5) return "high"
    if (riskScore >= 2) return "medium"
    return "low"
  }

  private generateIPRange(range: string): string[] {
    const ips: string[] = []

    if (range.includes("/")) {
      // CIDR notation
      const [network, prefixLength] = range.split("/")
      const prefix = Number.parseInt(prefixLength)
      const [a, b, c, d] = network.split(".").map(Number)

      if (prefix === 24) {
        // /24 network (256 addresses)
        for (let i = 1; i < 255; i++) {
          ips.push(`${a}.${b}.${c}.${i}`)
        }
      } else if (prefix === 16) {
        // /16 network (65536 addresses) - limit to reasonable range
        for (let i = 1; i < 255; i++) {
          for (let j = 1; j < 255; j++) {
            ips.push(`${a}.${b}.${i}.${j}`)
          }
        }
      }
    } else if (range.includes("-")) {
      // Range notation (e.g., 192.168.1.1-192.168.1.50)
      const [start, end] = range.split("-")
      const startParts = start.split(".").map(Number)
      const endParts = end.split(".").map(Number)

      const startLast = startParts[3]
      const endLast = endParts[3]

      for (let i = startLast; i <= endLast; i++) {
        ips.push(`${startParts[0]}.${startParts[1]}.${startParts[2]}.${i}`)
      }
    } else {
      // Single IP
      ips.push(range)
    }

    return ips
  }

  async getDeviceHistory(ip: string): Promise<NetworkDevice[]> {
    // In a real implementation, this would query a database
    const device = this.deviceCache.get(ip)
    return device ? [device] : []
  }

  async getScanHistory(): Promise<Array<{ timestamp: Date; devicesFound: number }>> {
    return this.scanHistory
  }

  async getNetworkStatistics(): Promise<{
    totalDevices: number
    onlineDevices: number
    deviceTypes: Record<string, number>
    riskDistribution: Record<string, number>
  }> {
    const devices = Array.from(this.deviceCache.values())

    const deviceTypes: Record<string, number> = {}
    const riskDistribution: Record<string, number> = { low: 0, medium: 0, high: 0 }

    for (const device of devices) {
      deviceTypes[device.deviceType] = (deviceTypes[device.deviceType] || 0) + 1
      riskDistribution[device.riskLevel]++
    }

    return {
      totalDevices: devices.length,
      onlineDevices: devices.filter((d) => d.status === "online").length,
      deviceTypes,
      riskDistribution,
    }
  }
}

export const networkScanner = new NetworkScannerService()
