"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { WindowsMediaPlayer } from "./windows-media-player"
import { mediaServerClient } from "@/lib/media-server-client"

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

export function Dashboard() {
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

  useEffect(() => {
    checkSystemStatus()
    const interval = setInterval(checkSystemStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkSystemStatus = async () => {
    // Check media server
    try {
      const status = await mediaServerClient.getServerStatus()
      setMediaServerStatus(status)
      // Only set to online if the status is actually "online"
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

    // Check network bridge (placeholder)
    try {
      const response = await fetch("http://localhost:3001/health")
      setSystemStatus((prev) => ({
        ...prev,
        networkBridge: response.ok ? "online" : "offline",
      }))
    } catch (error) {
      setSystemStatus((prev) => ({ ...prev, networkBridge: "offline" }))
    }

    // Simulate camera status check
    setSystemStatus((prev) => ({
      ...prev,
      cameras: prev.mediaServer === "online" ? "online" : "offline",
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600"
      case "offline":
        return "text-red-600"
      case "unavailable":
        return "text-red-600"
      case "error":
        return "text-yellow-600"
      default:
        return "text-gray-600"
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

  const occupancyRate = Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
  const cameraHealth = Math.round((stats.activeCameras / stats.totalCameras) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">System overview and real-time monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMediaPlayer(!showMediaPlayer)}>
            <Camera className="w-4 h-4 mr-2" />
            {showMediaPlayer ? "Hide" : "Show"} Media Player
          </Button>
          <Button variant="outline" onClick={checkSystemStatus}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      <Alert>
        <Server className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center gap-4 text-sm">
            <span>System Status:</span>
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
              <span className={getStatusColor(systemStatus.cameras)}>Cameras</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Media Server Status */}
      {mediaServerStatus && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
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
        <Card>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Unit Occupancy</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{occupancyRate}%</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {stats.occupiedUnits} of {stats.totalUnits} units
                </p>
              </div>
              <Users className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <Progress value={occupancyRate} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
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
              <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Camera Health</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{cameraHealth}%</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {stats.activeCameras} of {stats.totalCameras} online
                </p>
              </div>
              <Camera className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
            <Progress value={cameraHealth} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Security Status</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.securityAlerts}</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">Active alerts</p>
              </div>
              <Shield className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="mt-4">
              {stats.securityAlerts > 0 ? (
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

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="font-medium">Motion Detected - Parking Lot</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">18 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Camera className="w-6 h-6" />
              <span className="text-sm">View Cameras</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">Manage Units</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Process Payment</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Shield className="w-6 h-6" />
              <span className="text-sm">Security Scan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
