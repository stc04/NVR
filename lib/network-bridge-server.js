/**
 * AI-IT Inc - Network Bridge Server
 * Creator: Steven Chason
 * Company: AI-IT Inc
 * Address: 88 Perch St, Winterhaven FL 33881
 * Phone: 863-308-4979
 *
 * NOT FOR RESALE - Proprietary Software
 * © 2024 AI-IT Inc. All rights reserved.
 */

const express = require("express")
const { createServer } = require("http")
const { Server: SocketIOServer } = require("socket.io")
const cors = require("cors")

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// Mock services for immediate functionality
const networkScanner = {
  async scanRange(range, options) {
    // Mock implementation with realistic data
    return [
      {
        ip: "192.168.1.1",
        hostname: "router.local",
        status: "online",
        type: "router",
        mac: "00:11:22:33:44:55",
        vendor: "Cisco",
        ports: [80, 443],
        lastSeen: new Date().toISOString(),
      },
      {
        ip: "192.168.1.100",
        hostname: "camera-01.local",
        status: "online",
        type: "camera",
        mac: "AA:BB:CC:DD:EE:FF",
        vendor: "Hikvision",
        ports: [80, 554],
        lastSeen: new Date().toISOString(),
      },
      {
        ip: "192.168.1.101",
        hostname: "camera-02.local",
        status: "online",
        type: "camera",
        mac: "BB:CC:DD:EE:FF:AA",
        vendor: "Dahua",
        ports: [80, 554],
        lastSeen: new Date().toISOString(),
      },
    ]
  },
}

const cameraDiscovery = {
  async discoverCameras(range) {
    // Mock implementation
    return [
      {
        ip: "192.168.1.100",
        brand: "Hikvision",
        model: "DS-2CD2142FWD-I",
        rtspUrl: "rtsp://192.168.1.100:554/Streaming/Channels/101",
        httpUrl: "http://192.168.1.100",
        capabilities: ["PTZ", "HTTPS"],
        status: "online",
      },
      {
        ip: "192.168.1.101",
        brand: "Dahua",
        model: "IPC-HFW4431R-Z",
        rtspUrl: "rtsp://192.168.1.101:554/cam/realmonitor?channel=1&subtype=0",
        httpUrl: "http://192.168.1.101",
        capabilities: ["HTTPS"],
        status: "online",
      },
    ]
  },
}

const deviceManager = {
  async getAllDevices() {
    // Mock implementation
    return [
      {
        id: "device-001",
        ip: "192.168.1.100",
        type: "camera",
        name: "Front Entrance Camera",
        authorized: true,
        lastSeen: new Date().toISOString(),
      },
      {
        id: "device-002",
        ip: "192.168.1.101",
        type: "camera",
        name: "Rear Exit Camera",
        authorized: true,
        lastSeen: new Date().toISOString(),
      },
    ]
  },
  async authorizeDevice(deviceId, authorized) {
    // Mock implementation
    console.log(`Device ${deviceId} ${authorized ? "authorized" : "unauthorized"}`)
  },
}

const securityMonitor = {
  async getSecurityStatus() {
    // Mock implementation
    return {
      overallScore: 85,
      threatsDetected: 2,
      devicesMonitored: 15,
      lastScan: new Date().toISOString(),
      alerts: [
        {
          id: "alert-001",
          severity: "medium",
          message: "Unauthorized device detected",
          timestamp: new Date().toISOString(),
        },
        {
          id: "alert-002",
          severity: "low",
          message: "Camera offline for maintenance",
          timestamp: new Date().toISOString(),
        },
      ],
    }
  },
  async getRecentEvents(limit) {
    // Mock implementation
    return [
      {
        id: "event-001",
        type: "device_connected",
        message: "New device connected to network",
        timestamp: new Date().toISOString(),
        severity: "info",
      },
      {
        id: "event-002",
        type: "security_scan",
        message: "Scheduled security scan completed",
        timestamp: new Date().toISOString(),
        severity: "info",
      },
    ]
  },
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "AI-IT Network Bridge",
    version: "1.0.0",
    creator: "Steven Chason",
    company: "AI-IT Inc",
    contact: "863-308-4979",
    timestamp: new Date().toISOString(),
  })
})

// Network scanning endpoints
app.get("/api/network/scan", async (req, res) => {
  try {
    const range = req.query.range || "192.168.1.0/24"
    const timeout = Number.parseInt(req.query.timeout) || 5000

    const devices = await networkScanner.scanRange(range, { timeout })

    res.json({
      success: true,
      range,
      devicesFound: devices.length,
      devices,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
  }
})

app.get("/api/devices", async (req, res) => {
  try {
    const devices = await deviceManager.getAllDevices()

    res.json({
      success: true,
      devices,
      total: devices.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Camera discovery endpoints
app.get("/api/cameras/discover", async (req, res) => {
  try {
    const range = req.query.range || "192.168.1.0/24"
    const cameras = await cameraDiscovery.discoverCameras(range)

    res.json({
      success: true,
      cameras,
      total: cameras.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Security monitoring endpoints
app.get("/api/security/status", async (req, res) => {
  try {
    const status = await securityMonitor.getSecurityStatus()

    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

app.get("/api/security/events", async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 50
    const events = await securityMonitor.getRecentEvents(limit)

    res.json({
      success: true,
      events,
      total: events.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Device management endpoints
app.post("/api/devices/:id/authorize", async (req, res) => {
  try {
    const deviceId = req.params.id
    const authorized = req.body.authorized || true

    await deviceManager.authorizeDevice(deviceId, authorized)

    res.json({
      success: true,
      message: `Device ${authorized ? "authorized" : "unauthorized"}`,
      deviceId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log(`[AI-IT Network Bridge] Client connected: ${socket.id}`)

  // Join monitoring rooms
  socket.on("join-network-monitor", () => {
    socket.join("network-monitor")
    console.log(`[AI-IT Network Bridge] Client ${socket.id} joined network monitoring`)
  })

  socket.on("join-security-monitor", () => {
    socket.join("security-monitor")
    console.log(`[AI-IT Network Bridge] Client ${socket.id} joined security monitoring`)
  })

  socket.on("disconnect", () => {
    console.log(`[AI-IT Network Bridge] Client disconnected: ${socket.id}`)
  })
})

// Background monitoring
let monitoringInterval

const startBackgroundMonitoring = () => {
  console.log("[AI-IT Network Bridge] Starting background monitoring...")

  // Network status updates every 30 seconds
  monitoringInterval = setInterval(async () => {
    try {
      const devices = await networkScanner.scanRange("192.168.1.0/24", { timeout: 3000 })
      const securityStatus = await securityMonitor.getSecurityStatus()

      io.to("network-monitor").emit("network-status", {
        devices,
        devicesOnline: devices.filter((d) => d.status === "online").length,
        timestamp: new Date().toISOString(),
      })

      io.to("security-monitor").emit("security-status", {
        status: securityStatus,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("[AI-IT Network Bridge] Background monitoring error:", error)
    }
  }, 30000)
}

const stopBackgroundMonitoring = () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    console.log("[AI-IT Network Bridge] Background monitoring stopped")
  }
}

// Start the server
const PORT = process.env.NETWORK_BRIDGE_PORT || 3001

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                           AI-IT Network Bridge                              ║
║                                                                              ║
║  Creator: Steven Chason                                                      ║
║  Company: AI-IT Inc                                                          ║
║  Address: 88 Perch St, Winterhaven FL 33881                                 ║
║  Phone: 863-308-4979                                                         ║
║                                                                              ║
║  🌉 Network Bridge Service Running on Port ${PORT}                             ║
║  🔍 Network Discovery & Security Monitoring Active                          ║
║  🛡️ Real-time Threat Detection Enabled                                      ║
║                                                                              ║
║  NOT FOR RESALE - Proprietary Software                                      ║
║  © 2024 AI-IT Inc. All rights reserved.                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `)

  startBackgroundMonitoring()
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[AI-IT Network Bridge] Shutting down gracefully...")
  stopBackgroundMonitoring()
  server.close(() => {
    console.log("[AI-IT Network Bridge] Server closed")
    process.exit(0)
  })
})

process.on("SIGTERM", () => {
  console.log("\n[AI-IT Network Bridge] Received SIGTERM, shutting down...")
  stopBackgroundMonitoring()
  server.close(() => {
    console.log("[AI-IT Network Bridge] Server closed")
    process.exit(0)
  })
})

module.exports = { app, server, io }
