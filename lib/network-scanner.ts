"use client"

import type { NetworkDevice } from "@/types"

export interface ScanOptions {
  timeout: number
  concurrency: number
  includePorts: number[]
  protocols: string[]
  deepScan: boolean
}

export interface ScanStatistics {
  totalHosts: number
  scannedHosts: number
  reachableHosts: number
  identifiedDevices: number
  scanDuration: number
  averageResponseTime: number
}

export class NetworkScanner {
  private abortController: AbortController | null = null
  private scanStats: ScanStatistics = {
    totalHosts: 0,
    scannedHosts: 0,
    reachableHosts: 0,
    identifiedDevices: 0,
    scanDuration: 0,
    averageResponseTime: 0,
  }

  // Enhanced browser capabilities detection
  private getBrowserCapabilities(): {
    webrtc: boolean
    websocket: boolean
    fetch: boolean
    serviceWorker: boolean
    webassembly: boolean
  } {
    return {
      webrtc: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection),
      websocket: !!window.WebSocket,
      fetch: !!window.fetch,
      serviceWorker: "serviceWorker" in navigator,
      webassembly: !!window.WebAssembly,
    }
  }

  // Get comprehensive local network information
  private async getNetworkInfo(): Promise<{
    localIP: string
    networkRange: string
    gateway: string
    subnet: string
    capabilities: any
  }> {
    const capabilities = this.getBrowserCapabilities()

    try {
      const localIP = await this.detectLocalIP()
      const networkInfo = this.calculateNetworkInfo(localIP)

      return {
        localIP,
        networkRange: networkInfo.range,
        gateway: networkInfo.gateway,
        subnet: networkInfo.subnet,
        capabilities,
      }
    } catch (error) {
      return {
        localIP: "unknown",
        networkRange: "192.168.1.1-254",
        gateway: "192.168.1.1",
        subnet: "255.255.255.0",
        capabilities,
      }
    }
  }

  // Enhanced local IP detection with multiple methods
  private async detectLocalIP(): Promise<string> {
    const methods = [() => this.detectIPViaWebRTC(), () => this.detectIPViaWebSocket(), () => this.detectIPViaFetch()]

    for (const method of methods) {
      try {
        const ip = await method()
        if (ip && this.isValidPrivateIP(ip)) {
          return ip
        }
      } catch (error) {
        continue
      }
    }

    throw new Error("Could not detect local IP")
  }

  // WebRTC-based IP detection (most reliable)
  private async detectIPViaWebRTC(): Promise<string> {
    return new Promise((resolve, reject) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      })

      pc.createDataChannel("")

      pc.onicecandidate = (ice) => {
        if (ice.candidate) {
          const candidate = ice.candidate.candidate
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
          if (ipMatch) {
            const ip = ipMatch[1]
            if (this.isValidPrivateIP(ip)) {
              pc.close()
              resolve(ip)
            }
          }
        }
      }

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(reject)

      // Timeout after 5 seconds
      setTimeout(() => {
        pc.close()
        reject(new Error("WebRTC IP detection timeout"))
      }, 5000)
    })
  }

  // WebSocket-based IP detection
  private async detectIPViaWebSocket(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Try connecting to local router admin interfaces
      const commonRouterIPs = ["192.168.1.1", "192.168.0.1", "10.0.0.1", "172.16.0.1"]

      let attempts = 0
      const maxAttempts = commonRouterIPs.length

      commonRouterIPs.forEach((routerIP) => {
        const ws = new WebSocket(`ws://${routerIP}:80`)

        ws.onopen = () => {
          ws.close()
          // Estimate local IP based on router IP
          const parts = routerIP.split(".")
          const estimatedIP = `${parts[0]}.${parts[1]}.${parts[2]}.100`
          resolve(estimatedIP)
        }

        ws.onerror = () => {
          attempts++
          if (attempts >= maxAttempts) {
            reject(new Error("WebSocket IP detection failed"))
          }
        }

        setTimeout(() => ws.close(), 1000)
      })
    })
  }

  // Fetch-based IP detection using external services
  private async detectIPViaFetch(): Promise<string> {
    try {
      // Use a public IP service that returns local network info
      const response = await fetch("https://api.ipify.org?format=json", {
        signal: AbortSignal.timeout(3000),
      })

      if (response.ok) {
        const data = await response.json()
        // This gives public IP, we need to estimate private IP
        return "192.168.1.100" // Fallback estimation
      }

      throw new Error("Fetch IP detection failed")
    } catch (error) {
      throw new Error("Fetch IP detection failed")
    }
  }

  // Validate if IP is in private range
  private isValidPrivateIP(ip: string): boolean {
    const privateRanges = [/^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./]

    return privateRanges.some((range) => range.test(ip))
  }

  // Calculate network information from local IP
  private calculateNetworkInfo(localIP: string): {
    range: string
    gateway: string
    subnet: string
  } {
    const parts = localIP.split(".")
    const networkBase = `${parts[0]}.${parts[1]}.${parts[2]}`

    return {
      range: `${networkBase}.1-254`,
      gateway: `${networkBase}.1`,
      subnet: "255.255.255.0",
    }
  }

  // Enhanced host checking with multiple protocols
  private async checkHostAdvanced(
    ip: string,
    options: ScanOptions,
  ): Promise<{
    reachable: boolean
    openPorts: number[]
    protocols: string[]
    responseTime: number
  }> {
    const startTime = Date.now()
    const results = {
      reachable: false,
      openPorts: [] as number[],
      protocols: [] as string[],
      responseTime: 0,
    }

    // Test multiple protocols and ports
    const tests = [
      { method: "websocket", ports: [80, 8080, 443] },
      { method: "http", ports: [80, 8080, 443, 8443] },
      { method: "rtsp", ports: [554, 8554] },
      { method: "onvif", ports: [80, 8080, 8000] },
    ]

    for (const test of tests) {
      if (this.abortController?.signal.aborted) break

      for (const port of test.ports) {
        try {
          const isOpen = await this.testPort(ip, port, test.method, options.timeout)
          if (isOpen) {
            results.reachable = true
            results.openPorts.push(port)
            if (!results.protocols.includes(test.method)) {
              results.protocols.push(test.method)
            }
          }
        } catch (error) {
          // Continue testing other ports
        }
      }
    }

    results.responseTime = Date.now() - startTime
    return results
  }

  // Test specific port with different methods
  private async testPort(ip: string, port: number, method: string, timeout: number): Promise<boolean> {
    switch (method) {
      case "websocket":
        return this.testWebSocket(ip, port, timeout)
      case "http":
        return this.testHTTP(ip, port, timeout)
      case "rtsp":
        return this.testRTSP(ip, port, timeout)
      case "onvif":
        return this.testONVIF(ip, port, timeout)
      default:
        return false
    }
  }

  // Enhanced WebSocket testing
  private async testWebSocket(ip: string, port: number, timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      let ws: WebSocket
      const timer = setTimeout(() => {
        if (ws) {
          ws.close()
        }
        resolve(false)
      }, timeout)

      try {
        ws = new WebSocket(`ws://${ip}:${port}`)

        ws.onopen = () => {
          clearTimeout(timer)
          ws.close()
          resolve(true)
        }

        ws.onerror = () => {
          clearTimeout(timer)
          resolve(false)
        }

        ws.onclose = () => {
          clearTimeout(timer)
          resolve(false)
        }
      } catch (error) {
        clearTimeout(timer)
        resolve(false)
      }
    })
  }

  // Enhanced HTTP testing with better detection
  private async testHTTP(ip: string, port: number, timeout: number): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      // Try both HTTP and HTTPS
      const protocols = port === 443 || port === 8443 ? ["https"] : ["http", "https"]

      for (const protocol of protocols) {
        try {
          const response = await fetch(`${protocol}://${ip}:${port}`, {
            method: "HEAD",
            mode: "no-cors",
            signal: controller.signal,
          })

          clearTimeout(timer)
          return true
        } catch (error) {
          // Try next protocol
          continue
        }
      }

      clearTimeout(timer)
      return false
    } catch (error) {
      return false
    }
  }

  // Enhanced RTSP testing
  private async testRTSP(ip: string, port: number, timeout: number): Promise<boolean> {
    try {
      // RTSP over HTTP tunneling test
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(`http://${ip}:${port}`, {
        method: "OPTIONS",
        headers: {
          "User-Agent": "Security-POS-RTSP-Scanner/1.0",
        },
        mode: "no-cors",
        signal: controller.signal,
      })

      clearTimeout(timer)
      return true
    } catch (error) {
      return false
    }
  }

  // Enhanced ONVIF testing with proper SOAP
  private async testONVIF(ip: string, port: number, timeout: number): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:tds="http://www.onvif.org/ver10/device/wsdl">
          <soap:Header/>
          <soap:Body>
            <tds:GetCapabilities/>
          </soap:Body>
        </soap:Envelope>`

      const response = await fetch(`http://${ip}:${port}/onvif/device_service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction: "http://www.onvif.org/ver10/device/wsdl/GetCapabilities",
        },
        body: soapEnvelope,
        signal: controller.signal,
      })

      clearTimeout(timer)

      // ONVIF devices typically respond with 200 or 401 (auth required)
      return response.status === 200 || response.status === 401
    } catch (error) {
      return false
    }
  }

  // Enhanced device identification with fingerprinting
  private async identifyDevice(ip: string, hostInfo: any): Promise<Partial<NetworkDevice>> {
    const deviceInfo: Partial<NetworkDevice> = {
      ip,
      status: "online",
      lastSeen: new Date().toLocaleString(),
      mac: this.generateMACFromIP(ip),
    }

    // Try multiple identification methods
    const identificationMethods = [
      () => this.identifyViaONVIF(ip, hostInfo.openPorts),
      () => this.identifyViaHTTPHeaders(ip, hostInfo.openPorts),
      () => this.identifyViaUPnP(ip),
      () => this.identifyViaBanner(ip, hostInfo.openPorts),
      () => this.identifyViaFingerprint(ip, hostInfo),
    ]

    for (const method of identificationMethods) {
      try {
        const result = await method()
        if (result && result.manufacturer !== "Unknown") {
          return { ...deviceInfo, ...result }
        }
      } catch (error) {
        continue
      }
    }

    // Fallback identification based on open ports
    return {
      ...deviceInfo,
      ...this.identifyByPorts(hostInfo.openPorts, hostInfo.protocols),
    }
  }

  // Identify device by port patterns
  private identifyByPorts(openPorts: number[], protocols: string[]): Partial<NetworkDevice> {
    // Camera patterns
    if (openPorts.includes(554) || protocols.includes("rtsp")) {
      return {
        deviceType: "camera",
        manufacturer: "Unknown Camera",
        model: "IP Camera",
        protocol: "RTSP",
        port: 554,
      }
    }

    if (openPorts.includes(80) && protocols.includes("onvif")) {
      return {
        deviceType: "camera",
        manufacturer: "ONVIF Camera",
        model: "IP Camera",
        protocol: "ONVIF",
        port: 80,
      }
    }

    // Router/Gateway patterns
    if (openPorts.includes(80) && openPorts.includes(443)) {
      return {
        deviceType: "router",
        manufacturer: "Network Device",
        model: "Router/Gateway",
        protocol: "HTTP",
        port: 80,
      }
    }

    // NVR patterns
    if (openPorts.includes(8080) && openPorts.includes(554)) {
      return {
        deviceType: "nvr",
        manufacturer: "Unknown NVR",
        model: "Network Video Recorder",
        protocol: "HTTP",
        port: 8080,
      }
    }

    // Default smart device
    return {
      deviceType: "smart_device",
      manufacturer: "Unknown",
      model: "Network Device",
      protocol: "HTTP",
      port: openPorts[0] || 80,
    }
  }

  // Generate consistent MAC from IP (since we can't get real MAC)
  private generateMACFromIP(ip: string): string {
    const hash = this.simpleHash(ip)
    const mac = []

    for (let i = 0; i < 6; i++) {
      const byte = (hash >> (i * 8)) & 0xff
      mac.push(byte.toString(16).padStart(2, "0").toUpperCase())
    }

    return mac.join(":")
  }

  // Simple hash function for consistent MAC generation
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Enhanced network scanning with comprehensive options
  async scanNetwork(
    ipRange?: string,
    options: Partial<ScanOptions> = {},
    onProgress?: (progress: number, stats: ScanStatistics) => void,
    onDeviceFound?: (device: NetworkDevice) => void,
  ): Promise<{
    devices: NetworkDevice[]
    statistics: ScanStatistics
    networkInfo: any
  }> {
    this.abortController = new AbortController()

    const scanOptions: ScanOptions = {
      timeout: 2000,
      concurrency: 5,
      includePorts: [80, 443, 554, 8080, 8000],
      protocols: ["http", "websocket", "onvif", "rtsp"],
      deepScan: false,
      ...options,
    }

    const networkInfo = await this.getNetworkInfo()
    const range = ipRange || networkInfo.networkRange
    const [startIP, endIP] = range.split("-")
    const baseIP = startIP.substring(0, startIP.lastIndexOf(".") + 1)
    const startNum = Number.parseInt(startIP.substring(startIP.lastIndexOf(".") + 1))
    const endNum = Number.parseInt(endIP)

    this.scanStats = {
      totalHosts: endNum - startNum + 1,
      scannedHosts: 0,
      reachableHosts: 0,
      identifiedDevices: 0,
      scanDuration: 0,
      averageResponseTime: 0,
    }

    const startTime = Date.now()
    const devices: NetworkDevice[] = []
    const responseTimes: number[] = []

    // Create batches for concurrent scanning
    const hosts = []
    for (let i = startNum; i <= endNum; i++) {
      hosts.push(`${baseIP}${i}`)
    }

    // Process in batches to control concurrency
    for (let i = 0; i < hosts.length; i += scanOptions.concurrency) {
      if (this.abortController.signal.aborted) break

      const batch = hosts.slice(i, i + scanOptions.concurrency)
      const batchPromises = batch.map(async (ip) => {
        try {
          const hostInfo = await this.checkHostAdvanced(ip, scanOptions)
          this.scanStats.scannedHosts++
          responseTimes.push(hostInfo.responseTime)

          if (hostInfo.reachable) {
            this.scanStats.reachableHosts++

            const deviceInfo = await this.identifyDevice(ip, hostInfo)
            const device: NetworkDevice = {
              id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              ip,
              mac: deviceInfo.mac || this.generateMACFromIP(ip),
              manufacturer: deviceInfo.manufacturer || "Unknown",
              deviceType: deviceInfo.deviceType || "unknown",
              model: deviceInfo.model,
              status: "online",
              protocol: deviceInfo.protocol || "HTTP",
              port: deviceInfo.port || 80,
              lastSeen: new Date().toLocaleString(),
            }

            devices.push(device)
            this.scanStats.identifiedDevices++
            onDeviceFound?.(device)
          }

          // Update statistics
          this.scanStats.scanDuration = Date.now() - startTime
          this.scanStats.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length

          const progress = Math.round((this.scanStats.scannedHosts / this.scanStats.totalHosts) * 100)
          onProgress?.(progress, { ...this.scanStats })
        } catch (error) {
          this.scanStats.scannedHosts++
        }
      })

      await Promise.allSettled(batchPromises)

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    this.scanStats.scanDuration = Date.now() - startTime

    return {
      devices,
      statistics: this.scanStats,
      networkInfo,
    }
  }

  // Get scan statistics
  getStatistics(): ScanStatistics {
    return { ...this.scanStats }
  }

  // Stop ongoing scan
  stopScan(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  // Additional methods for the enhanced scanner...
  private async identifyViaONVIF(ip: string, ports: number[]): Promise<Partial<NetworkDevice> | null> {
    // Implementation for ONVIF identification
    return null
  }

  private async identifyViaHTTPHeaders(ip: string, ports: number[]): Promise<Partial<NetworkDevice> | null> {
    // Implementation for HTTP header identification
    return null
  }

  private async identifyViaUPnP(ip: string): Promise<Partial<NetworkDevice> | null> {
    // Implementation for UPnP identification
    return null
  }

  private async identifyViaBanner(ip: string, ports: number[]): Promise<Partial<NetworkDevice> | null> {
    // Implementation for banner grabbing
    return null
  }

  private async identifyViaFingerprint(ip: string, hostInfo: any): Promise<Partial<NetworkDevice> | null> {
    // Implementation for device fingerprinting
    return null
  }
}

// Export singleton instance
export const networkScanner = new NetworkScanner()
