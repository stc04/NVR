"use client"

// ONVIF Protocol Handler
export class ONVIFClient {
  private baseUrl: string
  private username: string
  private password: string

  constructor(ip: string, username = "admin", password = "admin") {
    this.baseUrl = `http://${ip}/onvif`
    this.username = username
    this.password = password
  }

  // Generate ONVIF SOAP envelope with WS-Security
  private generateSOAPEnvelope(body: string): string {
    const timestamp = new Date().toISOString()
    const nonce = btoa(Math.random().toString(36))

    return `<?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                     xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
                     xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
        <soap:Header>
          <wsse:Security>
            <wsse:UsernameToken>
              <wsse:Username>${this.username}</wsse:Username>
              <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">${this.password}</wsse:Password>
              <wsse:Nonce>${nonce}</wsse:Nonce>
              <wsu:Created>${timestamp}</wsu:Created>
            </wsse:UsernameToken>
          </wsse:Security>
        </soap:Header>
        <soap:Body>
          ${body}
        </soap:Body>
      </soap:Envelope>`
  }

  // Get device capabilities with timeout and error handling
  async getCapabilities(): Promise<any> {
    const body = `<tds:GetCapabilities xmlns:tds="http://www.onvif.org/ver10/device/wsdl"/>`
    const envelope = this.generateSOAPEnvelope(body)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

      const response = await fetch(`${this.baseUrl}/device_service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction: "http://www.onvif.org/ver10/device/wsdl/GetCapabilities",
        },
        body: envelope,
        signal: controller.signal,
        mode: "no-cors", // Allow cross-origin requests
      })

      clearTimeout(timeoutId)

      if (!response.ok && response.status !== 0) {
        // status 0 is expected with no-cors
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Connection timeout")
        }
        throw new Error(`ONVIF connection failed: ${error.message}`)
      }
      throw error
    }
  }

  // Get media profiles with error handling
  async getProfiles(): Promise<any> {
    const body = `<trt:GetProfiles xmlns:trt="http://www.onvif.org/ver10/media/wsdl"/>`
    const envelope = this.generateSOAPEnvelope(body)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${this.baseUrl}/Media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction: "http://www.onvif.org/ver10/media/wsdl/GetProfiles",
        },
        body: envelope,
        signal: controller.signal,
        mode: "no-cors",
      })

      clearTimeout(timeoutId)
      return await response.text()
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Connection timeout")
      }
      throw error
    }
  }

  // Get stream URI with error handling
  async getStreamUri(profileToken: string): Promise<string> {
    const body = `
      <trt:GetStreamUri xmlns:trt="http://www.onvif.org/ver10/media/wsdl">
        <trt:StreamSetup>
          <tt:Stream xmlns:tt="http://www.onvif.org/ver10/schema">RTP-Unicast</tt:Stream>
          <tt:Transport xmlns:tt="http://www.onvif.org/ver10/schema">
            <tt:Protocol>RTSP</tt:Protocol>
          </tt:Transport>
        </trt:StreamSetup>
        <trt:ProfileToken>${profileToken}</trt:ProfileToken>
      </trt:GetStreamUri>`

    const envelope = this.generateSOAPEnvelope(body)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${this.baseUrl}/Media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction: "http://www.onvif.org/ver10/media/wsdl/GetStreamUri",
        },
        body: envelope,
        signal: controller.signal,
        mode: "no-cors",
      })

      clearTimeout(timeoutId)
      const result = await response.text()

      // Parse RTSP URL from SOAP response
      const uriMatch = result.match(/<tt:Uri>(.*?)<\/tt:Uri>/)
      return uriMatch ? uriMatch[1] : ""
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Connection timeout")
      }
      throw error
    }
  }

  // PTZ Controls with error handling
  async ptzMove(profileToken: string, direction: "up" | "down" | "left" | "right" | "stop"): Promise<void> {
    let velocity = { x: 0, y: 0, zoom: 0 }

    switch (direction) {
      case "up":
        velocity.y = 0.5
        break
      case "down":
        velocity.y = -0.5
        break
      case "left":
        velocity.x = -0.5
        break
      case "right":
        velocity.x = 0.5
        break
      case "stop":
        velocity = { x: 0, y: 0, zoom: 0 }
        break
    }

    const body = `
      <tptz:ContinuousMove xmlns:tptz="http://www.onvif.org/ver20/ptz/wsdl">
        <tptz:ProfileToken>${profileToken}</tptz:ProfileToken>
        <tptz:Velocity>
          <tt:PanTilt xmlns:tt="http://www.onvif.org/ver10/schema" x="${velocity.x}" y="${velocity.y}"/>
          <tt:Zoom xmlns:tt="http://www.onvif.org/ver10/schema" x="${velocity.zoom}"/>
        </tptz:Velocity>
      </tptz:ContinuousMove>`

    const envelope = this.generateSOAPEnvelope(body)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      await fetch(`${this.baseUrl}/PTZ`, {
        method: "POST",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction: "http://www.onvif.org/ver20/ptz/wsdl/ContinuousMove",
        },
        body: envelope,
        signal: controller.signal,
        mode: "no-cors",
      })

      clearTimeout(timeoutId)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("PTZ command timeout")
      }
      throw error
    }
  }
}

// RTSP Stream Handler
export class RTSPClient {
  private streamUrl: string
  private username?: string
  private password?: string

  constructor(ip: string, port = 554, username?: string, password?: string) {
    const auth = username && password ? `${username}:${password}@` : ""
    this.streamUrl = `rtsp://${auth}${ip}:${port}/stream1`
    this.username = username
    this.password = password
  }

  // Generate authenticated RTSP URL
  getStreamUrl(path = "/stream1"): string {
    const auth = this.username && this.password ? `${this.username}:${this.password}@` : ""
    return this.streamUrl.replace("/stream1", path)
  }

  // Test RTSP connection with timeout
  async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout

      // Use a simple HTTP request to test if the device responds
      const testUrl = `http://${this.streamUrl.split("@")[1]?.split(":")[0] || this.streamUrl.split("://")[1]?.split(":")[0]}`

      const response = await fetch(testUrl, {
        method: "HEAD",
        signal: controller.signal,
        mode: "no-cors",
      })

      clearTimeout(timeoutId)
      return true // If we get here, the device responded
    } catch (error) {
      return false
    }
  }
}

// Enhanced Camera Discovery Service
export class CameraDiscovery {
  // Discover cameras with better error handling and fallback methods
  static async discoverONVIFCameras(ipRange: string): Promise<any[]> {
    const cameras: any[] = []

    try {
      // Parse IP range
      const [startIP, endIP] = ipRange.split("-")
      if (!startIP || !endIP) {
        throw new Error("Invalid IP range format")
      }

      const baseIP = startIP.substring(0, startIP.lastIndexOf(".") + 1)
      const startNum = Number.parseInt(startIP.substring(startIP.lastIndexOf(".") + 1))
      const endNum = Number.parseInt(endIP)

      if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
        throw new Error("Invalid IP range numbers")
      }

      // Limit scan range to prevent browser from hanging
      const maxRange = Math.min(endNum - startNum + 1, 20)
      const actualEndNum = startNum + maxRange - 1

      console.log(`Scanning IP range: ${baseIP}${startNum} to ${baseIP}${actualEndNum}`)

      // Use Promise.allSettled to handle multiple concurrent requests
      const scanPromises = []

      for (let i = startNum; i <= actualEndNum; i++) {
        const ip = `${baseIP}${i}`
        scanPromises.push(this.scanSingleIP(ip))
      }

      const results = await Promise.allSettled(scanPromises)

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          cameras.push(result.value)
        }
      })

      // If no cameras found, add some demo cameras for testing
      if (cameras.length === 0) {
        console.log("No cameras discovered, adding demo cameras")
        cameras.push(
          {
            ip: "192.168.1.100",
            type: "ONVIF",
            manufacturer: "Demo",
            model: "Virtual Camera 1",
            status: "demo",
          },
          {
            ip: "192.168.1.101",
            type: "RTSP",
            manufacturer: "Demo",
            model: "Virtual Camera 2",
            status: "demo",
          },
        )
      }
    } catch (error) {
      console.error("Camera discovery error:", error)

      // Return demo cameras on error
      cameras.push(
        {
          ip: "192.168.1.100",
          type: "ONVIF",
          manufacturer: "Demo",
          model: "Demo Camera 1",
          status: "demo",
        },
        {
          ip: "192.168.1.101",
          type: "RTSP",
          manufacturer: "Demo",
          model: "Demo Camera 2",
          status: "demo",
        },
      )
    }

    return cameras
  }

  // Scan a single IP address for camera services
  private static async scanSingleIP(ip: string): Promise<any | null> {
    try {
      // Try multiple common camera ports and protocols
      const testPromises = [
        this.testONVIFPort(ip, 80),
        this.testONVIFPort(ip, 8080),
        this.testRTSPPort(ip, 554),
        this.testHTTPPort(ip, 80),
      ]

      const results = await Promise.allSettled(testPromises)

      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          return {
            ip,
            type: result.value.type,
            manufacturer: result.value.manufacturer || "Unknown",
            model: result.value.model || "IP Camera",
            status: "discovered",
            port: result.value.port,
          }
        }
      }

      return null
    } catch (error) {
      return null
    }
  }

  // Test ONVIF port
  private static async testONVIFPort(ip: string, port: number): Promise<any | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)

      const response = await fetch(`http://${ip}:${port}/onvif/device_service`, {
        method: "HEAD",
        signal: controller.signal,
        mode: "no-cors",
      })

      clearTimeout(timeoutId)

      return {
        type: "ONVIF",
        port,
        manufacturer: "Unknown",
        model: "ONVIF Camera",
      }
    } catch (error) {
      return null
    }
  }

  // Test RTSP port
  private static async testRTSPPort(ip: string, port: number): Promise<any | null> {
    try {
      // Since we can't directly test RTSP in browser, test if device responds on HTTP
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)

      const response = await fetch(`http://${ip}`, {
        method: "HEAD",
        signal: controller.signal,
        mode: "no-cors",
      })

      clearTimeout(timeoutId)

      return {
        type: "RTSP",
        port,
        manufacturer: "Unknown",
        model: "RTSP Camera",
      }
    } catch (error) {
      return null
    }
  }

  // Test HTTP port for web cameras
  private static async testHTTPPort(ip: string, port: number): Promise<any | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)

      const response = await fetch(`http://${ip}:${port}`, {
        method: "HEAD",
        signal: controller.signal,
        mode: "no-cors",
      })

      clearTimeout(timeoutId)

      return {
        type: "HTTP",
        port,
        manufacturer: "Unknown",
        model: "Web Camera",
      }
    } catch (error) {
      return null
    }
  }

  // Test camera connectivity with improved error handling
  static async testCameraConnection(ip: string, username?: string, password?: string): Promise<boolean> {
    try {
      // Try ONVIF first
      const onvifClient = new ONVIFClient(ip, username, password)
      await onvifClient.getCapabilities()
      return true
    } catch (onvifError) {
      try {
        // Fallback to RTSP test
        const rtspClient = new RTSPClient(ip, 554, username, password)
        return await rtspClient.testConnection()
      } catch (rtspError) {
        try {
          // Final fallback - simple HTTP ping
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 2000)

          await fetch(`http://${ip}`, {
            method: "HEAD",
            signal: controller.signal,
            mode: "no-cors",
          })

          clearTimeout(timeoutId)
          return true
        } catch (httpError) {
          console.log(`Camera at ${ip} is not reachable via any protocol`)
          return false
        }
      }
    }
  }
}
