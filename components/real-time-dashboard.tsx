"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  const [scanProgress, setScanProgress] = useState(0)

  // Initialize WebSocket connection
  useEffect(() => {
    const bridgeUrl = process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"
    console.log("🌉 Connecting to AI-IT Network Bridge:", bridgeUrl)

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
      console.log("🎉 Welcome message:", data)
      setLastUpdate(new Date().toLocaleTimeString())
    })

    newSocket.on("joined-room", (data) => {
      console.log("🏠 Joined room:", data.room)
    })

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from Network Bridge")
      setConnectionStatus("disconnected")
    })

    newSocket.on("connect_error", (error) => {
      console.error("🚫 Connection error:", error)
      setConnectionStatus("disconnected")
    })

    // Real-time event handlers
    newSocket.on("network-status", (data) => {
      console.log("📡 Network status update:", data)
      setDevices(data.devices || [])
      setLastUpdate(new Date().toLocaleTimeString())
    })

    newSocket.on("scan-progress", (data) => {
      console.log("📊 Scan progress:", data.progress + "%")
      setScanProgress(data.progress)
    })

    newSocket.on("scan-complete", (data) => {
      console.log("🔍 Scan complete:", data)
      setDevices(data.devices || [])
      setIsScanning(false)
      setScanProgress(100)
      setLastUpdate(new Date().toLocaleTimeString())
      setTimeout(() => setScanProgress(0), 2000)
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
      console.error("❌ Failed to load initial data:", error)
    }
  }

  const requestNetworkScan = useCallback(() => {
    if (socket && connectionStatus === "connected") {
      setIsScanning(true)
      setScanProgress(0)
      console.log("🔍 Requesting live network scan...")
      socket.emit("request-network-scan", { range: "192.168.1.0/24" })

      // Listen for scan result
      socket.on("scan-result", (data) => {
        console.log("📊 Scan result:", data)
        if (data.success) {
          setDevices(data.devices || [])
        }
        setIsScanning(false)
        setScanProgress(100)
        setLastUpdate(new Date().toLocaleTimeString())
        setTimeout(() => setScanProgress(0), 2000)
      })
    }
  }, [socket, connectionStatus])

  const discoverCameras = useCallback(async () => {
    try {
      const bridgeUrl = process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"
      console.log("📹 Discovering live cameras...")
      const response = await fetch(`${bridgeUrl}/api/cameras/discover`)
      if (response.ok) {
        const data = await response.json()
        setCameras(data.cameras || [])
        setLastUpdate(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error("❌ Failed to discover cameras:", error)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 dark:text-green-400"
      case "offline":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
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

  const onlineDevices = devices.filter((d) => d.status === "online").length
  const onlineCameras = cameras.filter((c) => c.status === "online").length
  const unresolvedAlerts = securityStatus?.alerts?.filter((a) => !a.resolved).length || 0

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-IT Security Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
              Real-time network monitoring and security management
            </p>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Created by <span className="font-semibold text-blue-600">Steven Chason</span> • AI-IT Inc
              </p>
              <Badge variant="outline" className="text-xs">
                📞 863-308-4979
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500 animate-pulse"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm font-medium">
                {connectionStatus === "connected"
                  ? "🟢 Live Connection"
                  : connectionStatus === "connecting"
                    ? "🟡 Connecting..."
                    : "🔴 Disconnected"}
              </span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Last update: {lastUpdate || "Never"}</div>
            {isScanning && scanProgress > 0 && (
              <div className="w-48">
                <div className="flex justify-between text-xs mb-1">
                  <span>Scanning...</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={requestNetworkScan}
          disabled={isScanning || connectionStatus !== "connected"}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />
          {isScanning ? "Scanning Network..." : "🔍 Live Network Scan"}
        </Button>
        <Button
          variant="outline"
          onClick={discoverCameras}
          disabled={connectionStatus !== "connected"}
          className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
        >
          <Camera className="w-4 h-4 mr-2" />📹 Discover Cameras
        </Button>
        <Button
          variant="outline"
          onClick={loadInitialData}
          disabled={connectionStatus !== "connected"}
          className="border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
        >
          <Activity className="w-4 h-4 mr-2" />🔄 Refresh Data
        </Button>
      </div>

      {/* Live Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Network Devices</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{onlineDevices}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{devices.length} total discovered</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Wifi className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">IP Cameras</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{onlineCameras}</p>
                <p className="text-xs text-green-700 dark:text-green-300">{cameras.length} total found</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Camera className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Security Score</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {securityStatus?.overallScore || 0}%
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  {securityStatus?.networkHealth || "Unknown"} health
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Active Threats</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {securityStatus?.threatsDetected || 0}
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">{unresolvedAlerts} unresolved</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Live Network Devices */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              Live Network Devices ({devices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {devices.length > 0 ? (
                devices.map((device) => (
                  <div
                    key={device.ip}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          device.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{device.hostname || device.ip}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {device.vendor} • {device.type}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">MAC: {device.mac}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRiskColor(device.riskLevel)}>{device.riskLevel}</Badge>
                      <span className={`text-sm font-medium ${getStatusColor(device.status)}`}>{device.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <WifiOff className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No devices discovered</p>
                  <p className="text-sm text-slate-500 mt-2">Click "Live Network Scan" to discover devices</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Security Alerts */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              Live Security Alerts ({unresolvedAlerts})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {securityStatus?.alerts && securityStatus.alerts.length > 0 ? (
                securityStatus.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg transition-all ${
                      alert.resolved
                        ? "opacity-60 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        : "bg-white dark:bg-slate-900 border-orange-200 dark:border-orange-800 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                        {alert.resolved && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            ✅ Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No security alerts</p>
                  <p className="text-sm text-slate-500 mt-2">All systems secure</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live IP Cameras */}
      {cameras.length > 0 && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-600" />
              Live IP Cameras ({cameras.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cameras.map((camera) => (
                <div
                  key={camera.ip}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {camera.brand} {camera.model}
                    </h4>
                    <span className={`text-sm font-medium ${getStatusColor(camera.status)}`}>{camera.status}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600 dark:text-slate-400">📍 {camera.ip}</p>
                    <p className="text-slate-600 dark:text-slate-400">📺 {camera.resolution}</p>
                    <p className="text-slate-600 dark:text-slate-400">🔧 {camera.firmware}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
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

      {/* Live Recent Events */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            Live Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Activity className="w-4 h-4 mt-0.5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{event.message}</p>
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
