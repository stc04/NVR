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

import express, { type Request, type Response } from "express"
import { createServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import cors from "cors"
import { networkScanner } from "./network-scanner-service"
import { cameraDiscovery } from "./camera-discovery-service"
import { deviceManager } from "./device-manager-service"
import { securityMonitor } from "./security-monitor-service"

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

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
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
app.get("/api/network/scan", async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || "192.168.1.0/24"
    const timeout = Number.parseInt(req.query.timeout as string) || 5000

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

app.get("/api/devices", async (req: Request, res: Response) => {
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
app.get("/api/cameras/discover", async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || "192.168.1.0/24"
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
app.get("/api/security/status", async (req: Request, res: Response) => {
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

app.get("/api/security/events", async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string) || 50
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
app.post("/api/devices/:id/authorize", async (req: Request, res: Response) => {
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
let monitoringInterval: NodeJS.Timeout

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

export { app, server, io }
