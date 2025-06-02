"use client"

// Media Server Client - Handles communication with Windows media server on localhost:8000
export class MediaServerClient {
  private baseUrl: string
  private wsUrl: string
  private wsConnection: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    // Use environment variable first, then fallback to localhost for development
    this.baseUrl = process.env.NEXT_PUBLIC_MEDIA_SERVER_URL || "http://localhost:8000"
    this.wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8001"

    // Log the URLs being used for debugging
    if (typeof window !== "undefined") {
      console.log("Media Server Client initialized:", {
        baseUrl: this.baseUrl,
        wsUrl: this.wsUrl,
        environment: process.env.NODE_ENV,
      })
    }
  }

  // Initialize WebSocket connection for real-time stream updates
  async initializeWebSocket(): Promise<void> {
    try {
      this.wsConnection = new WebSocket(this.wsUrl)

      this.wsConnection.onopen = () => {
        console.log("Media server WebSocket connected")
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
        console.log("Media server WebSocket disconnected")
        this.attemptReconnect()
      }

      this.wsConnection.onerror = (error) => {
        console.error("Media server WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to initialize media server WebSocket:", error)
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(
          `Attempting to reconnect to media server... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        )
        this.initializeWebSocket()
      }, 5000 * this.reconnectAttempts)
    }
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case "stream_started":
        this.onStreamStarted?.(data)
        break
      case "stream_ended":
        this.onStreamEnded?.(data)
        break
      case "stream_error":
        this.onStreamError?.(data)
        break
      case "recording_started":
        this.onRecordingStarted?.(data)
        break
      case "recording_completed":
        this.onRecordingCompleted?.(data)
        break
    }
  }

  // Event handlers (can be overridden)
  onStreamStarted?: (data: any) => void
  onStreamEnded?: (data: any) => void
  onStreamError?: (data: any) => void
  onRecordingStarted?: (data: any) => void
  onRecordingCompleted?: (data: any) => void

  // Get media server status
  async getServerStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/status`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        // Add a timeout to prevent long waits
        signal: AbortSignal.timeout(5000),
      })

      // Check if response is JSON by examining content-type
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // Return a mock status object when server returns non-JSON
        console.warn("Media server returned non-JSON response. Server may be unavailable or misconfigured.")
        return this.getMockServerStatus("unavailable")
      }

      if (!response.ok) {
        throw new Error(`Media server status check failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.warn("Failed to get media server status:", error)
      // Return a mock status object instead of throwing
      return this.getMockServerStatus("offline")
    }
  }

  // Add this new method to provide mock status when server is unavailable
  private getMockServerStatus(status: "offline" | "unavailable" | "error"): any {
    return {
      status: status,
      port: this.baseUrl.includes(":") ? this.baseUrl.split(":").pop()?.split("/")[0] : "unknown",
      activeStreams: 0,
      uptime: 0,
      version: "unknown",
      message:
        status === "offline"
          ? "Media server is offline. Please check server status."
          : "Media server returned invalid response. Check configuration.",
    }
  }

  // Start RTSP stream conversion to HLS
  async startStream(streamConfig: {
    streamId: string
    rtspUrl: string
    quality?: "low" | "medium" | "high"
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stream/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(streamConfig),
      })

      if (!response.ok) {
        throw new Error(`Stream start failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Subscribe to stream updates via WebSocket
      if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
        this.wsConnection.send(
          JSON.stringify({
            type: "subscribe_stream",
            streamId: streamConfig.streamId,
          }),
        )
      }

      return result
    } catch (error) {
      console.error("Failed to start stream:", error)
      throw error
    }
  }

  // Stop stream
  async stopStream(streamId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stream/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streamId }),
      })

      if (!response.ok) {
        throw new Error(`Stream stop failed: ${response.statusText}`)
      }

      // Unsubscribe from stream updates
      if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
        this.wsConnection.send(
          JSON.stringify({
            type: "unsubscribe_stream",
            streamId: streamId,
          }),
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to stop stream:", error)
      throw error
    }
  }

  // Get active streams
  async getActiveStreams(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/streams`)
      if (!response.ok) {
        throw new Error(`Failed to get streams: ${response.statusText}`)
      }
      const data = await response.json()
      return data.streams || []
    } catch (error) {
      console.error("Failed to get active streams:", error)
      return []
    }
  }

  // Start recording
  async startRecording(recordingConfig: {
    streamId: string
    rtspUrl: string
    duration?: number // seconds
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/recording/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordingConfig),
      })

      if (!response.ok) {
        throw new Error(`Recording start failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to start recording:", error)
      throw error
    }
  }

  // Get HLS stream URL for a given stream ID
  getHLSUrl(streamId: string): string {
    return `${this.baseUrl}/hls/${streamId}/index.m3u8`
  }

  // Get recording download URL
  getRecordingUrl(recordingId: string): string {
    return `${this.baseUrl}/recordings/${recordingId}.mp4`
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch (error) {
      console.error("Media server health check failed:", error)
      return false
    }
  }

  // Test stream with demo RTSP URL
  async testStream(): Promise<any> {
    const testConfig = {
      streamId: "test-stream",
      rtspUrl: "rtsp://demo:demo@ipvmdemo.dyndns.org:5541/onvif-media/media.amp",
      quality: "medium" as const,
    }

    return await this.startStream(testConfig)
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
export const mediaServerClient = new MediaServerClient()
