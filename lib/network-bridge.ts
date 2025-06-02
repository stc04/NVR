"use client"

// Network Bridge Service - Handles communication with backend services
export class NetworkBridge {
  private baseUrl: string
  private wsConnection: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    // Use environment variable or default to local development
    this.baseUrl = process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"
  }

  // Initialize WebSocket connection for real-time updates
  async initializeWebSocket(): Promise<void> {
    try {
      const wsUrl = this.baseUrl.replace("http", "ws") + "/ws"
      this.wsConnection = new WebSocket(wsUrl)

      this.wsConnection.onopen = () => {
        console.log("Network bridge WebSocket connected")
        this.reconnectAttempts = 0
      }

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      this.wsConnection.onclose = () => {
        console.log("Network bridge WebSocket disconnected")
        this.attemptReconnect()
      }

      this.wsConnection.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error)
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.initializeWebSocket()
      }, 5000 * this.reconnectAttempts)
    }
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case "device_discovered":
        this.onDeviceDiscovered?.(data.device)
        break
      case "device_status_changed":
        this.onDeviceStatusChanged?.(data.device)
        break
      case "network_event":
        this.onNetworkEvent?.(data.event)
        break
      case "stream_status":
        this.onStreamStatus?.(data.stream)
        break
    }
  }

  // Event handlers (can be overridden)
  onDeviceDiscovered?: (device: any) => void
  onDeviceStatusChanged?: (device: any) => void
  onNetworkEvent?: (event: any) => void
  onStreamStatus?: (stream: any) => void

  // Network discovery using backend service
  async discoverNetworkDevices(
    options: {
      ipRange?: string
      protocols?: string[]
      timeout?: number
    } = {},
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/network/discover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ipRange: options.ipRange || "auto",
          protocols: options.protocols || ["onvif", "rtsp", "http"],
          timeout: options.timeout || 5000,
        }),
      })

      if (!response.ok) {
        throw new Error(`Network discovery failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Network discovery error:", error)
      throw error
    }
  }

  // Get NVR systems
  async getNVRSystems(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/nvr/systems`)
      if (!response.ok) {
        throw new Error(`Failed to get NVR systems: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Failed to get NVR systems:", error)
      return []
    }
  }

  // Connect to NVR system
  async connectToNVR(nvrConfig: {
    ip: string
    port: number
    username: string
    password: string
    brand: string
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/nvr/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nvrConfig),
      })

      if (!response.ok) {
        throw new Error(`NVR connection failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("NVR connection error:", error)
      throw error
    }
  }

  // Get cameras from NVR
  async getNVRCameras(nvrId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/nvr/${nvrId}/cameras`)
      if (!response.ok) {
        throw new Error(`Failed to get NVR cameras: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Failed to get NVR cameras:", error)
      return []
    }
  }

  // Get live stream URL
  async getStreamUrl(deviceId: string, streamType: "main" | "sub" = "main"): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stream/url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId, streamType }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get stream URL: ${response.statusText}`)
      }

      const data = await response.json()
      return data.streamUrl
    } catch (error) {
      console.error("Failed to get stream URL:", error)
      throw error
    }
  }

  // Control PTZ camera
  async controlPTZ(
    deviceId: string,
    command: {
      action: "move" | "stop" | "preset"
      direction?: "up" | "down" | "left" | "right" | "zoom_in" | "zoom_out"
      preset?: number
      speed?: number
    },
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/camera/${deviceId}/ptz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      })

      if (!response.ok) {
        throw new Error(`PTZ control failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error("PTZ control error:", error)
      throw error
    }
  }

  // Get network topology
  async getNetworkTopology(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/network/topology`)
      if (!response.ok) {
        throw new Error(`Failed to get network topology: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Failed to get network topology:", error)
      throw error
    }
  }

  // Monitor network performance
  async getNetworkPerformance(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/network/performance`)
      if (!response.ok) {
        throw new Error(`Failed to get network performance: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Failed to get network performance:", error)
      throw error
    }
  }

  // Security scan
  async performSecurityScan(targets: string[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/security/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targets }),
      })

      if (!response.ok) {
        throw new Error(`Security scan failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Security scan error:", error)
      throw error
    }
  }

  // Cleanup
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }
}

// Singleton instance
export const networkBridge = new NetworkBridge()
