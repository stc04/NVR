"use client"

export interface NetworkMetrics {
  timestamp: number
  bandwidth: {
    download: number
    upload: number
    total: number
  }
  latency: {
    min: number
    max: number
    avg: number
  }
  packetLoss: number
  connectedDevices: number
  activeConnections: number
}

export interface NetworkAlert {
  id: string
  type: "bandwidth" | "latency" | "security" | "device" | "connection"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: number
  resolved: boolean
  deviceId?: string
  details?: Record<string, any>
}

export class NetworkMonitor {
  private metrics: NetworkMetrics[] = []
  private alerts: NetworkAlert[] = []
  private isMonitoring = false
  private monitoringInterval: NodeJS.Timeout | null = null
  private callbacks: {
    onMetrics?: (metrics: NetworkMetrics) => void
    onAlert?: (alert: NetworkAlert) => void
  } = {}

  // Start real-time network monitoring
  startMonitoring(callbacks?: {
    onMetrics?: (metrics: NetworkMetrics) => void
    onAlert?: (alert: NetworkAlert) => void
  }) {
    if (this.isMonitoring) return

    this.callbacks = callbacks || {}
    this.isMonitoring = true

    // Collect metrics every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
    }, 5000)

    console.log("Network monitoring started")
  }

  // Stop monitoring
  stopMonitoring() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log("Network monitoring stopped")
  }

  // Collect current network metrics
  private async collectMetrics() {
    try {
      const metrics: NetworkMetrics = {
        timestamp: Date.now(),
        bandwidth: await this.measureBandwidth(),
        latency: await this.measureLatency(),
        packetLoss: await this.measurePacketLoss(),
        connectedDevices: await this.countConnectedDevices(),
        activeConnections: await this.countActiveConnections(),
      }

      this.metrics.push(metrics)

      // Keep only last 100 metrics (about 8 minutes of data)
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100)
      }

      // Check for alerts
      this.checkForAlerts(metrics)

      // Notify callback
      this.callbacks.onMetrics?.(metrics)
    } catch (error) {
      console.error("Failed to collect network metrics:", error)
    }
  }

  // Measure bandwidth using browser APIs
  private async measureBandwidth(): Promise<{ download: number; upload: number; total: number }> {
    try {
      // Use Navigator.connection API if available
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      if (connection) {
        const downlink = connection.downlink || 0 // Mbps
        const effectiveType = connection.effectiveType || "unknown"

        // Estimate upload based on connection type
        const uploadEstimate = downlink * 0.1 // Rough estimate: 10% of download

        return {
          download: downlink,
          upload: uploadEstimate,
          total: downlink + uploadEstimate,
        }
      }

      // Fallback: simulate bandwidth measurement
      return {
        download: Math.random() * 100 + 50,
        upload: Math.random() * 20 + 10,
        total: 0,
      }
    } catch (error) {
      return { download: 0, upload: 0, total: 0 }
    }
  }

  // Measure network latency
  private async measureLatency(): Promise<{ min: number; max: number; avg: number }> {
    const measurements: number[] = []

    // Test latency to multiple endpoints
    const endpoints = [
      "https://www.google.com/favicon.ico",
      "https://www.cloudflare.com/favicon.ico",
      "https://www.github.com/favicon.ico",
    ]

    for (const endpoint of endpoints) {
      try {
        const start = performance.now()
        await fetch(endpoint, { method: "HEAD", mode: "no-cors", cache: "no-cache" })
        const end = performance.now()
        measurements.push(end - start)
      } catch (error) {
        // Endpoint unreachable, skip
      }
    }

    if (measurements.length === 0) {
      return { min: 0, max: 0, avg: 0 }
    }

    const min = Math.min(...measurements)
    const max = Math.max(...measurements)
    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length

    return { min, max, avg }
  }

  // Estimate packet loss (simplified)
  private async measurePacketLoss(): Promise<number> {
    try {
      // In a browser environment, we can't directly measure packet loss
      // This is a simplified simulation based on failed requests
      const testRequests = 10
      let failedRequests = 0

      const promises = Array.from({ length: testRequests }, async () => {
        try {
          await fetch("https://www.google.com/favicon.ico", {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-cache",
            signal: AbortSignal.timeout(2000),
          })
        } catch (error) {
          failedRequests++
        }
      })

      await Promise.allSettled(promises)

      return (failedRequests / testRequests) * 100
    } catch (error) {
      return 0
    }
  }

  // Count connected devices (from local storage)
  private async countConnectedDevices(): Promise<number> {
    try {
      const devices = JSON.parse(localStorage.getItem("networkDevices") || "[]")
      return devices.filter((device: any) => device.status === "online").length
    } catch (error) {
      return 0
    }
  }

  // Count active connections (estimated)
  private async countActiveConnections(): Promise<number> {
    try {
      // In browser, we can estimate based on open resources
      const performance = window.performance
      const entries = performance.getEntriesByType("resource")

      // Count recent network requests (last 30 seconds)
      const recentEntries = entries.filter((entry) => entry.startTime > performance.now() - 30000)

      return recentEntries.length
    } catch (error) {
      return 0
    }
  }

  // Check for network alerts
  private checkForAlerts(metrics: NetworkMetrics) {
    const alerts: NetworkAlert[] = []

    // High latency alert
    if (metrics.latency.avg > 500) {
      alerts.push({
        id: `latency-${Date.now()}`,
        type: "latency",
        severity: metrics.latency.avg > 1000 ? "high" : "medium",
        message: `High network latency detected: ${metrics.latency.avg.toFixed(0)}ms`,
        timestamp: metrics.timestamp,
        resolved: false,
        details: { latency: metrics.latency },
      })
    }

    // High packet loss alert
    if (metrics.packetLoss > 5) {
      alerts.push({
        id: `packet-loss-${Date.now()}`,
        type: "connection",
        severity: metrics.packetLoss > 10 ? "high" : "medium",
        message: `High packet loss detected: ${metrics.packetLoss.toFixed(1)}%`,
        timestamp: metrics.timestamp,
        resolved: false,
        details: { packetLoss: metrics.packetLoss },
      })
    }

    // Low bandwidth alert
    if (metrics.bandwidth.download < 10) {
      alerts.push({
        id: `bandwidth-${Date.now()}`,
        type: "bandwidth",
        severity: "medium",
        message: `Low bandwidth detected: ${metrics.bandwidth.download.toFixed(1)} Mbps`,
        timestamp: metrics.timestamp,
        resolved: false,
        details: { bandwidth: metrics.bandwidth },
      })
    }

    // Add new alerts
    alerts.forEach((alert) => {
      this.alerts.push(alert)
      this.callbacks.onAlert?.(alert)
    })

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50)
    }
  }

  // Get recent metrics
  getMetrics(count = 20): NetworkMetrics[] {
    return this.metrics.slice(-count)
  }

  // Get active alerts
  getAlerts(): NetworkAlert[] {
    return this.alerts.filter((alert) => !alert.resolved)
  }

  // Resolve an alert
  resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  // Get network health score (0-100)
  getHealthScore(): number {
    if (this.metrics.length === 0) return 100

    const latest = this.metrics[this.metrics.length - 1]
    let score = 100

    // Deduct points for high latency
    if (latest.latency.avg > 100) score -= 10
    if (latest.latency.avg > 500) score -= 20
    if (latest.latency.avg > 1000) score -= 30

    // Deduct points for packet loss
    score -= latest.packetLoss * 2

    // Deduct points for low bandwidth
    if (latest.bandwidth.download < 10) score -= 20
    if (latest.bandwidth.download < 5) score -= 30

    return Math.max(0, Math.min(100, score))
  }

  // Export metrics data
  exportMetrics(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        alerts: this.alerts,
        exportTime: new Date().toISOString(),
      },
      null,
      2,
    )
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor()
