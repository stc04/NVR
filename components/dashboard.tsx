"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Camera,
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Server,
  Wifi,
  HardDrive,
  Monitor,
  Play,
  Settings,
  RefreshCw,
  Clock,
  WifiOff,
} from "lucide-react"
import { WindowsMediaPlayer } from "./windows-media-player"
import { mediaServerClient } from "@/lib/media-server-client"
import { io, type Socket } from "socket.io-client"

interface DashboardStats {
  totalUnits: number
  occupiedUnits: number
  totalRevenue: number
  monthlyRevenue: number
  activeCameras: number
  totalCameras: number
  securityAlerts: number
  systemHealth: "good" | "warning" | "critical"
}

interface SystemStatusType {
  mediaServer: "online" | "offline" | "error" | "unavailable"
  networkBridge: "online" | "offline" | "error"
  database: "online" | "offline" | "error"
  cameras: "online" | "offline" | "error"
}

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

export function Dashboard() {
  // Existing dashboard state
  const [stats, setStats] = useState<DashboardStats>({
    totalUnits: 150,
    occupiedUnits: 127,
    totalRevenue: 45230,
    monthlyRevenue: 12450,
    activeCameras: 8,
    totalCameras: 12,
    securityAlerts: 2,
    systemHealth: "good",
  })

  const [systemStatus, setSystemStatus] = useState<SystemStatusType>({
    mediaServer: "offline",
    networkBridge: "offline",
    database: "online",
    cameras: "offline",
  })

  const [mediaServerStatus, setMediaServerStatus] = useState<any>(null)
  const [showMediaPlayer, setShowMediaPlayer] = useState(false)

  // New real-time state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [devices, setDevices] = useState<NetworkDevice[]>([])
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null)
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  // Initialize WebSocket connection for real-time updates
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
      newSocket.emit("join-network-monitor")
      newSocket.emit("join-security-monitor")
    })

    newSocket.on("connected", (data) => {
      console.log("🎉 Welcome message:", data)
      setLastUpdate(new Date().toLocaleTimeString())
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

      // Update dashboard stats with real data
      setStats((prev) => ({
        ...prev,
        activeCameras:
          data.devices?.filter((d: any) => d.type === "camera" && d.status === "online").length || prev.activeCameras,
        totalCameras: data.devices?.filter((d: any) => d.type === "camera").length || prev.totalCameras,
      }))
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

      // Update dashboard stats with real security data
      setStats((prev) => ({
        ...prev,
        securityAlerts: data.status?.threatsDetected || prev.securityAlerts,
        systemHealth: data.status?.overallScore > 80 ? "good" : data.status?.overallScore > 60 ? "warning" : "critical",
      }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Existing system status check with real-time integration
  useEffect(() => {
    checkSystemStatus()
    const interval = setInterval(checkSystemStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load initial real-time data
  useEffect(() => {
    if (connectionStatus === "connected") {
      loadInitialData()
    }
  }, [connectionStatus])

  const checkSystemStatus = async () => {
    // Check media server
    try {
      const status = await mediaServerClient.getServerStatus()
      setMediaServerStatus(status)
      setSystemStatus((prev) => ({
        ...prev,
        mediaServer:
          status.status === "offline" || status.status === "unavailable" || status.status === "error"
            ? status.status
            : "online",
      }))
    } catch (error) {
      console.error("Media server check failed:", error)
      setSystemStatus((prev) => ({ ...prev, mediaServer: "offline" }))
    }

    // Check network bridge
    try {
      const response = await fetch("http://localhost:3001/health")
      setSystemStatus((prev) => ({
        ...prev,
        networkBridge: response.ok ? "online" : "offline",
      }))
    } catch (error) {
      setSystemStatus((prev) => ({ ...prev, networkBridge: "offline" }))
    }

    // Update camera status based on real data
    setSystemStatus((prev) => ({
      ...prev,
      cameras: cameras.length > 0 && cameras.some((c) => c.status === "online") ? "online" : "offline",
    }))
  }

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
      case "unavailable":
        return "text-red-600 dark:text-red-400"
      case "error":
        return "text-yellow-600 dark:text-yellow-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "offline":
      case "unavailable":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Monitor className="w-4 h-4 text-gray-500" />
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

  const occupancyRate = Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
  const cameraHealth = Math.round((stats.activeCameras / stats.totalCameras) * 100)
  const onlineDevices = devices.filter((d) => d.status === "online").length
  const onlineCameras = cameras.filter((c) => c.status === "online").length
  const unresolvedAlerts = securityStatus?.alerts?.filter((a) => !a.resolved).length || 0

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Real-time Status */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-IT Security Dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
              Enterprise security management and real-time monitoring
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
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
              <Button variant="outline" onClick={() => setShowMediaPlayer(!showMediaPlayer)}>
                <Camera className="w-4 h-4 mr-2" />
                {showMediaPlayer ? "Hide" : "Show"} Media Player
              </Button>
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

      {/* Real-time Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={requestNetworkScan}
          disabled={isScanning || connectionStatus !== "connected"}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />
          {isScanning ? "Scanning..." : "🔍 Live Network Scan"}
        </Button>
        <Button
          variant="outline"
          onClick={discoverCameras}
          disabled={connectionStatus !== "connected"}
          className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
        >
          <Camera className="w-4 h-4 mr-2" />📹 Discover Cameras
        </Button>
        <Button variant="outline" onClick={checkSystemStatus}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* System Status Alert with Real-time Data */}
      <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <Server className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">System Status:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(systemStatus.mediaServer)}
              <span className={getStatusColor(systemStatus.mediaServer)}>Media Server</span>
            </div>
            <div className="flex items-center gap-1">
              {getStatusIcon(systemStatus.networkBridge)}
              <span className={getStatusColor(systemStatus.networkBridge)}>Network Bridge</span>
            </div>
            <div className="flex items-center gap-1">
              {getStatusIcon(systemStatus.cameras)}
              <span className={getStatusColor(systemStatus.cameras)}>Cameras ({onlineCameras} live)</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400">Devices ({onlineDevices} online)</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Media Server Status */}
      {mediaServerStatus && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Windows Media Server Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Status</p>
                <p className="font-semibold text-green-600">{mediaServerStatus.status}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Port</p>
                <p className="font-semibold">{mediaServerStatus.port}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Active Streams</p>
                <p className="font-semibold">{mediaServerStatus.activeStreams || 0}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Uptime</p>
                <p className="font-semibold">{Math.floor(mediaServerStatus.uptime / 60)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Player */}
      {showMediaPlayer && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Live Media Player
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WindowsMediaPlayer
              streamId="dashboard-stream"
              rtspUrl=""
              autoStart={false}
              quality="medium"
              showControls={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Enhanced Key Metrics with Real-time Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Unit Occupancy</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{occupancyRate}%</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {stats.occupiedUnits} of {stats.totalUnits} units
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <Progress value={occupancyRate} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Monthly Revenue</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  ${stats.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Total: ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Camera Health</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{cameraHealth}%</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {onlineCameras || stats.activeCameras} of {cameras.length || stats.totalCameras} online
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Camera className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <Progress value={cameraHealth} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Security Status</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {securityStatus?.threatsDetected || stats.securityAlerts}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">{unresolvedAlerts} unresolved alerts</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              {(securityStatus?.threatsDetected || stats.securityAlerts) > 0 ? (
                <Badge variant="destructive" className="text-xs">
                  Requires Attention
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800 text-xs">All Clear</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced System Overview with Real-time Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Network Devices */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              Live Network Devices ({devices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {devices.length > 0 ? (
                devices.slice(0, 6).map((device) => (
                  <div
                    key={device.ip}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          device.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{device.hostname || device.ip}</p>
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
                  <p className="text-sm text-slate-500">Click "Live Network Scan" to discover devices</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>62%</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Network Usage</span>
                <span>23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <HardDrive className="w-6 h-6 mx-auto mb-1 text-slate-500" />
                  <p className="font-medium">2.1TB</p>
                  <p className="text-slate-600 dark:text-slate-400">Available</p>
                </div>
                <div className="text-center">
                  <Wifi className="w-6 h-6 mx-auto mb-1 text-slate-500" />
                  <p className="font-medium">156ms</p>
                  <p className="text-slate-600 dark:text-slate-400">Latency</p>
                </div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cameras.map((camera) => (
                <div
                  key={camera.ip}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {camera.brand} {camera.model}
                    </h4>
                    <span className={`text-sm ${getStatusColor(camera.status)}`}>{camera.status}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">📍 {camera.ip}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">📺 {camera.resolution}</p>
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

      {/* Enhanced Recent Activity with Real-time Events */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Live Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Real-time events first */}
            {recentEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <Activity className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{event.message}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  LIVE
                </Badge>
              </div>
            ))}

            {/* Static activity items */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">Unit A-15 Payment Received</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Camera className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Camera 8 Back Online</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">5 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Users className="w-5 h-5 text-purple-500" />
              <div className="flex-1">
                <p className="font-medium">New Customer Registration</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">12 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Camera className="w-6 h-6" />
              <span className="text-sm">View Cameras</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-900/20">
              <Users className="w-6 h-6" />
              <span className="text-sm">Manage Units</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Process Payment</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              onClick={requestNetworkScan}
              disabled={isScanning || connectionStatus !== "connected"}
            >
              <Shield className="w-6 h-6" />
              <span className="text-sm">Security Scan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
