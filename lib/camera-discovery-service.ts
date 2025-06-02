/**
 * AI-IT Inc - Camera Discovery Service
 * Creator: Steven Chason
 * Company: AI-IT Inc
 * Address: 88 Perch St, Winterhaven FL 33881
 * Phone: 863-308-4979
 *
 * NOT FOR RESALE - Proprietary Software
 * © 2024 AI-IT Inc. All rights reserved.
 */

import axios from "axios"

export interface Camera {
  ip: string
  brand: string
  model?: string
  firmware?: string
  capabilities: string[]
  rtspUrls: string[]
  webInterface?: string
  defaultCredentials?: { username: string; password: string }[]
  riskLevel: "low" | "medium" | "high"
  status: "online" | "offline" | "unauthorized"
  lastSeen: Date
  ports: number[]
  onvifSupport: boolean
  httpsSupport: boolean
  ptzSupport: boolean
}

class CameraDiscoveryService {
  private cameraCache = new Map<string, Camera>()

  // Common camera ports
  private readonly CAMERA_PORTS = [80, 443, 554, 8080, 8000, 8443, 37777, 34567]

  // Camera brand detection patterns
  private readonly BRAND_PATTERNS = {
    hikvision: ["/ISAPI/", "Hikvision", "DS-", "iVMS", "webComponents"],
    dahua: ["/cgi-bin/magicBox.cgi", "Dahua", "DH-", "NetSDK"],
    axis: ["/axis-cgi/", "AXIS", "vapix"],
    foscam: ["/cgi-bin/CGIProxy.fcgi", "Foscam", "FI8"],
    uniview: ["/cgi-bin/main-cgi", "Uniview", "IPC"],
  }

  async discoverCameras(range: string): Promise<Camera[]> {
    console.log(`[AI-IT Camera Discovery] Starting camera discovery for ${range}...`)

    try {
      const cameras: Camera[] = []
      const ips = this.generateIPRange(range)

      // Scan in batches to prevent overwhelming the network
      const batchSize = 15
      for (let i = 0; i < ips.length; i += batchSize) {
        const batch = ips.slice(i, i + batchSize)
        const batchPromises = batch.map((ip) => this.scanForCamera(ip))

        const batchResults = await Promise.allSettled(batchPromises)

        for (const result of batchResults) {
          if (result.status === "fulfilled" && result.value) {
            cameras.push(result.value)
            this.cameraCache.set(result.value.ip, result.value)
          }
        }
      }

      console.log(`[AI-IT Camera Discovery] Discovery complete. Found ${cameras.length} cameras.`)
      return cameras
    } catch (error) {
      console.error("[AI-IT Camera Discovery] Discovery error:", error)
      return []
    }
  }

  private async scanForCamera(ip: string): Promise<Camera | null> {
    try {
      // Check if any camera ports are open
      const openPorts = await this.scanCameraPorts(ip)
      if (openPorts.length === 0) {
        return null
      }

      // Try to identify the camera brand and model
      const cameraInfo = await this.identifyCamera(ip, openPorts)
      if (!cameraInfo) {
        return null
      }

      // Test ONVIF support
      const onvifSupport = await this.testOnvifSupport(ip)

      // Check HTTPS support
      const httpsSupport = openPorts.includes(443)

      // Test PTZ capabilities
      const ptzSupport = await this.testPtzSupport(ip, cameraInfo.brand)

      // Generate RTSP URLs
      const rtspUrls = this.generateRtspUrls(ip, cameraInfo.brand)

      // Assess risk level
      const riskLevel = this.assessCameraRisk(cameraInfo, openPorts, httpsSupport)

      const camera: Camera = {
        ip,
        brand: cameraInfo.brand,
        model: cameraInfo.model,
        firmware: cameraInfo.firmware,
        capabilities: cameraInfo.capabilities,
        rtspUrls,
        webInterface: `http://${ip}`,
        defaultCredentials: this.getDefaultCredentials(cameraInfo.brand),
        riskLevel,
        status: "online",
        lastSeen: new Date(),
        ports: openPorts,
        onvifSupport,
        httpsSupport,
        ptzSupport,
      }

      return camera
    } catch (error) {
      console.error(`[AI-IT Camera Discovery] Error scanning ${ip}:`, error)
      return null
    }
  }

  private async scanCameraPorts(ip: string): Promise<number[]> {
    const openPorts: number[] = []
    const timeout = 3000

    const portPromises = this.CAMERA_PORTS.map((port) => this.checkPort(ip, port, timeout))
    const results = await Promise.allSettled(portPromises)

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        openPorts.push(this.CAMERA_PORTS[index])
      }
    })

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

  private async identifyCamera(
    ip: string,
    ports: number[],
  ): Promise<{
    brand: string
    model?: string
    firmware?: string
    capabilities: string[]
  } | null> {
    // Try HTTP first, then HTTPS
    const protocols = ["http", "https"]
    const testPorts = ports.filter((p) => [80, 443, 8080, 8000].includes(p))

    for (const protocol of protocols) {
      for (const port of testPorts) {
        if ((protocol === "https" && port !== 443 && port !== 8443) || (protocol === "http" && port === 443)) {
          continue
        }

        try {
          const baseUrl = `${protocol}://${ip}:${port}`

          // Try to get the main page
          const response = await axios.get(baseUrl, {
            timeout: 5000,
            validateStatus: () => true,
            headers: {
              "User-Agent": "AI-IT Security Scanner",
            },
          })

          const content = response.data.toLowerCase()
          const headers = response.headers

          // Check for brand patterns
          for (const [brand, patterns] of Object.entries(this.BRAND_PATTERNS)) {
            for (const pattern of patterns) {
              if (
                content.includes(pattern.toLowerCase()) ||
                JSON.stringify(headers).toLowerCase().includes(pattern.toLowerCase())
              ) {
                const model = this.extractModel(content, brand)
                const firmware = this.extractFirmware(content, brand)
                const capabilities = this.extractCapabilities(content, brand)

                return {
                  brand: brand.charAt(0).toUpperCase() + brand.slice(1),
                  model,
                  firmware,
                  capabilities,
                }
              }
            }
          }

          // Generic camera detection
          if (
            content.includes("camera") ||
            content.includes("ipcam") ||
            content.includes("surveillance") ||
            content.includes("nvr")
          ) {
            return {
              brand: "Generic",
              capabilities: ["Video Streaming"],
            }
          }
        } catch (error) {
          // Continue to next port/protocol
          continue
        }
      }
    }

    return null
  }

  private extractModel(content: string, brand: string): string | undefined {
    const modelPatterns: Record<string, RegExp[]> = {
      hikvision: [/DS-[\w\d-]+/i, /model["\s:]+([^"<>\s]+)/i],
      dahua: [/DH-[\w\d-]+/i, /IPC-[\w\d-]+/i],
      axis: [/AXIS\s+[\w\d-]+/i],
      foscam: [/FI[\w\d]+/i, /R[\d]+/i],
    }

    const patterns = modelPatterns[brand] || []
    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) {
        return match[0] || match[1]
      }
    }

    return undefined
  }

  private extractFirmware(content: string, brand: string): string | undefined {
    const firmwarePatterns = [/firmware["\s:]+([^"<>\s]+)/i, /version["\s:]+([^"<>\s]+)/i, /build["\s:]+([^"<>\s]+)/i]

    for (const pattern of firmwarePatterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return undefined
  }

  private extractCapabilities(content: string, brand: string): string[] {
    const capabilities: string[] = ["Video Streaming"]

    if (content.includes("ptz") || content.includes("pan") || content.includes("tilt")) {
      capabilities.push("PTZ Control")
    }

    if (content.includes("audio") || content.includes("microphone")) {
      capabilities.push("Audio Recording")
    }

    if (content.includes("motion") || content.includes("detection")) {
      capabilities.push("Motion Detection")
    }

    if (content.includes("night") || content.includes("infrared") || content.includes("ir")) {
      capabilities.push("Night Vision")
    }

    if (content.includes("zoom") || content.includes("optical")) {
      capabilities.push("Optical Zoom")
    }

    if (content.includes("onvif")) {
      capabilities.push("ONVIF Support")
    }

    return capabilities
  }

  private async testOnvifSupport(ip: string): Promise<boolean> {
    try {
      // Test common ONVIF ports and endpoints
      const onvifPorts = [80, 8080, 8000]
      const onvifPaths = ["/onvif/device_service", "/onvif/Device"]

      for (const port of onvifPorts) {
        for (const path of onvifPaths) {
          try {
            const response = await axios.post(
              `http://${ip}:${port}${path}`,
              `<?xml version="1.0" encoding="UTF-8"?>
               <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
                 <soap:Body>
                   <tds:GetCapabilities xmlns:tds="http://www.onvif.org/ver10/device/wsdl"/>
                 </soap:Body>
               </soap:Envelope>`,
              {
                timeout: 3000,
                headers: {
                  "Content-Type": "application/soap+xml",
                  SOAPAction: "http://www.onvif.org/ver10/device/wsdl/GetCapabilities",
                },
              },
            )

            if (response.data.includes("onvif") || response.data.includes("Capabilities")) {
              return true
            }
          } catch (error) {
            continue
          }
        }
      }

      return false
    } catch (error) {
      return false
    }
  }

  private async testPtzSupport(ip: string, brand: string): Promise<boolean> {
    // This would require brand-specific API calls
    // For now, return false as a placeholder
    return false
  }

  private generateRtspUrls(ip: string, brand: string): string[] {
    const urls: string[] = []

    const rtspPatterns: Record<string, string[]> = {
      hikvision: [
        `rtsp://${ip}:554/Streaming/Channels/101`,
        `rtsp://${ip}:554/Streaming/Channels/102`,
        `rtsp://${ip}:554/h264/ch1/main/av_stream`,
        `rtsp://${ip}:554/h264/ch1/sub/av_stream`,
      ],
      dahua: [
        `rtsp://${ip}:554/cam/realmonitor?channel=1&subtype=0`,
        `rtsp://${ip}:554/cam/realmonitor?channel=1&subtype=1`,
        `rtsp://${ip}:554/live/ch1`,
        `rtsp://${ip}:554/live/ch2`,
      ],
      axis: [
        `rtsp://${ip}:554/axis-media/media.amp`,
        `rtsp://${ip}:554/axis-media/media.amp?videocodec=h264`,
        `rtsp://${ip}:554/live/ch1`,
      ],
      foscam: [`rtsp://${ip}:554/videoMain`, `rtsp://${ip}:554/videoSub`, `rtsp://${ip}:88/videoMain`],
      uniview: [`rtsp://${ip}:554/media/video1`, `rtsp://${ip}:554/media/video2`],
    }

    const patterns = rtspPatterns[brand.toLowerCase()] || [
      `rtsp://${ip}:554/live`,
      `rtsp://${ip}:554/stream1`,
      `rtsp://${ip}:554/video1`,
    ]

    return patterns
  }

  private getDefaultCredentials(brand: string): { username: string; password: string }[] {
    const credentials: Record<string, { username: string; password: string }[]> = {
      hikvision: [
        { username: "admin", password: "12345" },
        { username: "admin", password: "admin" },
        { username: "admin", password: "" },
      ],
      dahua: [
        { username: "admin", password: "admin" },
        { username: "admin", password: "" },
        { username: "root", password: "admin" },
      ],
      axis: [
        { username: "root", password: "pass" },
        { username: "admin", password: "admin" },
        { username: "viewer", password: "viewer" },
      ],
      foscam: [
        { username: "admin", password: "" },
        { username: "admin", password: "foscam" },
        { username: "user", password: "user" },
      ],
      uniview: [
        { username: "admin", password: "123456" },
        { username: "admin", password: "admin" },
      ],
    }

    return (
      credentials[brand.toLowerCase()] || [
        { username: "admin", password: "admin" },
        { username: "admin", password: "" },
      ]
    )
  }

  private assessCameraRisk(
    cameraInfo: { brand: string; model?: string; firmware?: string },
    ports: number[],
    httpsSupport: boolean,
  ): "low" | "medium" | "high" {
    let riskScore = 0

    // No HTTPS support
    if (!httpsSupport) riskScore += 2

    // Default credentials likely
    if (["Generic", "Unknown"].includes(cameraInfo.brand)) riskScore += 2

    // Telnet port open
    if (ports.includes(23)) riskScore += 3

    // Multiple web ports (potential backdoors)
    const webPorts = ports.filter((p) => [80, 8080, 8000, 8443].includes(p))
    if (webPorts.length > 2) riskScore += 1

    // Old firmware (placeholder - would need actual version checking)
    if (!cameraInfo.firmware) riskScore += 1

    if (riskScore >= 5) return "high"
    if (riskScore >= 2) return "medium"
    return "low"
  }

  private generateIPRange(range: string): string[] {
    const ips: string[] = []

    if (range.includes("/")) {
      const [network, prefixLength] = range.split("/")
      const prefix = Number.parseInt(prefixLength)
      const [a, b, c, d] = network.split(".").map(Number)

      if (prefix === 24) {
        for (let i = 1; i < 255; i++) {
          ips.push(`${a}.${b}.${c}.${i}`)
        }
      }
    } else if (range.includes("-")) {
      const [start, end] = range.split("-")
      const startParts = start.split(".").map(Number)
      const endParts = end.split(".").map(Number)

      const startLast = startParts[3]
      const endLast = endParts[3]

      for (let i = startLast; i <= endLast; i++) {
        ips.push(`${startParts[0]}.${startParts[1]}.${startParts[2]}.${i}`)
      }
    } else {
      ips.push(range)
    }

    return ips
  }

  async getCameraById(ip: string): Promise<Camera | null> {
    return this.cameraCache.get(ip) || null
  }

  async getAllCameras(): Promise<Camera[]> {
    return Array.from(this.cameraCache.values())
  }

  async testCameraConnection(ip: string, rtspUrl: string): Promise<boolean> {
    try {
      // This would require a proper RTSP client
      // For now, just test if the RTSP port is open
      return await this.checkPort(ip, 554, 5000)
    } catch (error) {
      return false
    }
  }
}

export const cameraDiscovery = new CameraDiscoveryService()
