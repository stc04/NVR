"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Wifi,
  Camera,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Monitor,
  Clock,
  WifiOff,
} from "lucide-react"
import { io, type Socket } from "socket.io-client"

interface NetworkDevice {
  ip: string
  hostname: string
  status: "online" | "offline"
  type: string
  mac: string
  vendor: string
  ports: number[]
  lastSeen: string
  riskLevel: "low" | "medium" | "high"
}

interface CameraDevice {
  ip: string
  brand: string
  model: string
  rtspUrl: string
  httpUrl: string
  capabilities: string[]
  status: "online" | "offline"
  firmware: string
  resolution: string
}

interface SecurityStatus {
  overallScore: number
  threatsDetected: number
  devicesMonitored: number
  lastScan: string
  networkHealth: string
  alerts: Array<{
    id: string
    severity: "low" | "medium" | "high"
    message: string
    timestamp: string
    resolved: boolean
  }>
}

interface SecurityEvent {
  id: string
  type: string
  message: string
  timestamp: string
  severity: "info" | "warning" | "error"
  details?: any
}

export function RealTimeDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [devices, setDevices] = useState<NetworkDevice[]>([])
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null)
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)

  // Initialize WebSocket connection
  useEffect(() => {
    const bridgeUrl = process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"
    console.log("Connecting to Network Bridge:", bridgeUrl)

    const newSocket = io(bridgeUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
    })

    newSocket.on("connect", () => {
      console.log("✅ Connected to AI-IT Network Bridge")
      setConnectionStatus("connected")
      setSocket(newSocket)

      // Join monitoring rooms
      newSocket.emit("join-network-monitor")
      newSocket.emit("join-security-monitor")
    })

    newSocket.on("connected", (data) => {
      console.log("Welcome message:", data)
      setLastUpdate(new Date().toLocaleTimeString())
    })

    newSocket.on("joined-room", (data) => {
      console.log("Joined room:", data.room)
    })

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from Network Bridge")
      setConnectionStatus("disconnected")
    })

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error)
      setConnectionStatus("disconnected")
    })

    // Real-time event handlers
    newSocket.on("network-status", (data) => {
      console.log("📡 Network status update:", data)
      setDevices(data.devices || [])
      setLastUpdate(new Date().toLocaleTimeString())
    })

    newSocket.on("scan-complete", (data) => {
      console.log("🔍 Scan complete:", data)
      setDevices(data.devices || [])
      setIsScanning(false)
      setLastUpdate(new Date().toLocaleTimeString())
    })

    newSocket.on("cameras-discovered", (data) => {
      console.log("📹 Cameras discovered:", data)
      setCameras(data.cameras || [])
      setLastUpdate(new Date().toLocaleTimeString())
    })

    newSocket.on("security-status", (data) => {
      console.log("🛡️ Security status update:", data)
      setSecurityStatus(data.status)
      setLastUpdate(new Date().toLocaleTimeString())
    })

    newSocket.on("device-authorized", (data) => {
      console.log("✅ Device authorization update:", data)
      // Update device status in real-time
      setDevices((prev) =>
        prev.map((device) => (device.ip === data.deviceId ? { ...device, authorized: data.authorized } : device)),
      )
      setLastUpdate(new Date().toLocaleTimeString())
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Load initial data
  useEffect(() => {
    if (connectionStatus === "connected") {
      loadInitialData()
    }
  }, [connectionStatus])

  const loadInitialData = async () => {
    try {
      const bridgeUrl = process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"

      // Load devices
      const devicesResponse = await fetch(`${bridgeUrl}/api/devices`)
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json()
        setDevices(devicesData.devices || [])
      }

      // Load security status
      const securityResponse = await fetch(`${bridgeUrl}/api/security/status`)
      if (securityResponse.ok) {
        const securityData = await securityResponse.json()
        setSecurityStatus(securityData.status)
      }

      // Load recent events
      const eventsResponse = await fetch(`${bridgeUrl}/api/security/events?limit=10`)
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setRecentEvents(eventsData.events || [])
      }

      setLastUpdate(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Failed to load initial data:", error)
    }
  }

  const requestNetworkScan = useCallback(() => {
    if (socket && connectionStatus === "connected") {
      setIsScanning(true)
      console.log("🔍 Requesting network scan...")
      socket.emit("request-network-scan", { range: "192.168.1.0/24" })

      // Listen for scan result
      socket.on("scan-result", (data) => {
        console.log("Scan result:", data)
        if (data.success) {
          setDevices(data.devices || [])
        }
        setIsScanning(false)
        setLastUpdate(new Date().toLocaleTimeString())
      })
    }
  }, [socket, connectionStatus])

  const discoverCameras = useCallback(async () => {
    try {
      const bridgeUrl = process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"
      const response = await fetch(`${bridgeUrl}/api/cameras/discover`)
      if (response.ok) {
        const data = await response.json()
        setCameras(data.cameras || [])
        setLastUpdate(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error("Failed to discover cameras:", error)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600"
      case "offline":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">AI-IT Security Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Real-time network monitoring and security management</p>
          <p className="text-sm text-slate-500">Created by Steven Chason • AI-IT Inc • 863-308-4979</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium">
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Disconnected"}
            </span>
          </div>
          <div className="text-sm text-slate-500">Last update: {lastUpdate || "Never"}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={requestNetworkScan} disabled={isScanning || connectionStatus !== "connected"}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />
          {isScanning ? "Scanning..." : "Scan Network"}
        </Button>
        <Button variant="outline" onClick={discoverCameras} disabled={connectionStatus !== "connected"}>
          <Camera className="w-4 h-4 mr-2" />
          Discover Cameras
        </Button>
        <Button variant="outline" onClick={loadInitialData} disabled={connectionStatus !== "connected"}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Network Devices</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {devices.filter((d) => d.status === "online").length}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{devices.length} total discovered</p>
              </div>
              <Wifi className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">IP Cameras</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {cameras.filter((c) => c.status === "online").length}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">{cameras.length} total found</p>
              </div>
              <Camera className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Security Score</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {securityStatus?.overallScore || 0}%
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  {securityStatus?.networkHealth || "Unknown"} health
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Active Threats</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {securityStatus?.threatsDetected || 0}
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  {securityStatus?.alerts?.filter((a) => !a.resolved).length || 0} unresolved
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Network Devices ({devices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {devices.length > 0 ? (
                devices.map((device) => (
                  <div key={device.ip} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${device.status === "online" ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      <div>
                        <p className="font-medium">{device.hostname || device.ip}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {device.vendor} • {device.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(device.riskLevel)}>{device.riskLevel}</Badge>
                      <span className={`text-sm ${getStatusColor(device.status)}`}>{device.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <WifiOff className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">No devices discovered</p>
                  <p className="text-sm text-slate-500">Click "Scan Network" to discover devices</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Alerts ({securityStatus?.alerts?.filter((a) => !a.resolved).length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {securityStatus?.alerts && securityStatus.alerts.length > 0 ? (
                securityStatus.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border rounded-lg ${alert.resolved ? "opacity-50 bg-slate-50 dark:bg-slate-800" : "bg-white dark:bg-slate-900"}`}
                  >
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                        {alert.resolved && (
                          <Badge variant="outline" className="mt-2">
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <p className="text-slate-600 dark:text-slate-400">No security alerts</p>
                  <p className="text-sm text-slate-500">All systems secure</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IP Cameras */}
      {cameras.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              IP Cameras ({cameras.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cameras.map((camera) => (
                <div key={camera.ip} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {camera.brand} {camera.model}
                    </h4>
                    <span className={`text-sm ${getStatusColor(camera.status)}`}>{camera.status}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{camera.ip}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{camera.resolution}</p>
                  <div className="flex flex-wrap gap-1">
                    {camera.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Activity className="w-4 h-4 mt-0.5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.message}</p>
                    <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No recent events</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
