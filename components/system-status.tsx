"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Server,
  Wifi,
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Monitor,
  Globe,
  Activity,
} from "lucide-react"
import { mediaServerClient } from "@/lib/media-server-client"

interface SystemHealth {
  mediaServer: {
    status: "online" | "offline" | "error"
    url: string
    uptime?: number
    activeStreams?: number
    lastCheck: Date
  }
  websocket: {
    status: "connected" | "disconnected" | "error"
    url: string
    lastMessage?: Date
  }
  networkBridge: {
    status: "online" | "offline" | "error"
    url: string
    lastCheck: Date
  }
  frontend: {
    status: "online"
    url: string
    environment: string
  }
}

export function SystemStatus() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    mediaServer: {
      status: "offline",
      url: process.env.NEXT_PUBLIC_MEDIA_SERVER_URL || "http://localhost:8000",
      lastCheck: new Date(),
    },
    websocket: {
      status: "disconnected",
      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8001",
    },
    networkBridge: {
      status: "offline",
      url: process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001",
      lastCheck: new Date(),
    },
    frontend: {
      status: "online",
      url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      environment: process.env.NODE_ENV || "development",
    },
  })

  const [isChecking, setIsChecking] = useState(false)
  const [lastFullCheck, setLastFullCheck] = useState<Date>(new Date())

  useEffect(() => {
    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkSystemHealth = async () => {
    setIsChecking(true)
    const now = new Date()

    try {
      // Check Media Server
      try {
        const mediaStatus = await mediaServerClient.getServerStatus()
        setSystemHealth((prev) => ({
          ...prev,
          mediaServer: {
            ...prev.mediaServer,
            status: "online",
            uptime: mediaStatus.uptime,
            activeStreams: mediaStatus.activeStreams,
            lastCheck: now,
          },
        }))
      } catch (error) {
        setSystemHealth((prev) => ({
          ...prev,
          mediaServer: {
            ...prev.mediaServer,
            status: "offline",
            lastCheck: now,
          },
        }))
      }

      // Check WebSocket
      try {
        if (mediaServerClient.wsConnection?.readyState === WebSocket.OPEN) {
          setSystemHealth((prev) => ({
            ...prev,
            websocket: {
              ...prev.websocket,
              status: "connected",
              lastMessage: now,
            },
          }))
        } else {
          setSystemHealth((prev) => ({
            ...prev,
            websocket: {
              ...prev.websocket,
              status: "disconnected",
            },
          }))
        }
      } catch (error) {
        setSystemHealth((prev) => ({
          ...prev,
          websocket: {
            ...prev.websocket,
            status: "error",
          },
        }))
      }

      // Check Network Bridge
      try {
        const bridgeUrl = process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"
        const response = await fetch(`${bridgeUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        })
        setSystemHealth((prev) => ({
          ...prev,
          networkBridge: {
            ...prev.networkBridge,
            status: response.ok ? "online" : "error",
            lastCheck: now,
          },
        }))
      } catch (error) {
        setSystemHealth((prev) => ({
          ...prev,
          networkBridge: {
            ...prev.networkBridge,
            status: "offline",
            lastCheck: now,
          },
        }))
      }

      setLastFullCheck(now)
    } catch (error) {
      console.error("System health check failed:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "offline":
      case "disconnected":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Monitor className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "connected":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "offline":
      case "disconnected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "error":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getOverallHealth = () => {
    const statuses = [systemHealth.mediaServer.status, systemHealth.websocket.status, systemHealth.networkBridge.status]

    if (statuses.every((s) => s === "online" || s === "connected")) return "healthy"
    if (statuses.some((s) => s === "error")) return "warning"
    return "critical"
  }

  const overallHealth = getOverallHealth()

  return (
    <div className="space-y-6">
      {/* Overall System Health */}
      <Alert
        className={
          overallHealth === "healthy"
            ? "border-green-200"
            : overallHealth === "warning"
              ? "border-yellow-200"
              : "border-red-200"
        }
      >
        <Activity className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">
                System Status:{" "}
                {overallHealth === "healthy"
                  ? "All Systems Operational"
                  : overallHealth === "warning"
                    ? "Some Issues Detected"
                    : "Critical Issues"}
              </span>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Last checked: {lastFullCheck.toLocaleTimeString()}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={checkSystemHealth} disabled={isChecking}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Frontend */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Frontend
              </div>
              {getStatusIcon(systemHealth.frontend.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge className={getStatusColor(systemHealth.frontend.status)} variant="outline">
              {systemHealth.frontend.status}
            </Badge>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <div>URL: {systemHealth.frontend.url}</div>
              <div>Env: {systemHealth.frontend.environment}</div>
            </div>
          </CardContent>
        </Card>

        {/* Media Server */}
        <Card className={systemHealth.mediaServer.status === "online" ? "border-green-200" : "border-red-200"}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Media Server
              </div>
              {getStatusIcon(systemHealth.mediaServer.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge className={getStatusColor(systemHealth.mediaServer.status)} variant="outline">
              {systemHealth.mediaServer.status}
            </Badge>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <div>URL: {systemHealth.mediaServer.url}</div>
              {systemHealth.mediaServer.uptime && <div>Uptime: {formatUptime(systemHealth.mediaServer.uptime)}</div>}
              {systemHealth.mediaServer.activeStreams !== undefined && (
                <div>Streams: {systemHealth.mediaServer.activeStreams}</div>
              )}
              <div>Last: {systemHealth.mediaServer.lastCheck.toLocaleTimeString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* WebSocket */}
        <Card className={systemHealth.websocket.status === "connected" ? "border-green-200" : "border-red-200"}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                WebSocket
              </div>
              {getStatusIcon(systemHealth.websocket.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge className={getStatusColor(systemHealth.websocket.status)} variant="outline">
              {systemHealth.websocket.status}
            </Badge>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <div>URL: {systemHealth.websocket.url}</div>
              {systemHealth.websocket.lastMessage && (
                <div>Last: {systemHealth.websocket.lastMessage.toLocaleTimeString()}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Network Bridge */}
        <Card className={systemHealth.networkBridge.status === "online" ? "border-green-200" : "border-red-200"}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Network Bridge
              </div>
              {getStatusIcon(systemHealth.networkBridge.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge className={getStatusColor(systemHealth.networkBridge.status)} variant="outline">
              {systemHealth.networkBridge.status}
            </Badge>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <div>URL: {systemHealth.networkBridge.url}</div>
              <div>Last: {systemHealth.networkBridge.lastCheck.toLocaleTimeString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Environment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium">Service URLs:</div>
              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <div>Media Server: {process.env.NEXT_PUBLIC_MEDIA_SERVER_URL || "http://localhost:8000"}</div>
                <div>WebSocket: {process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8001"}</div>
                <div>Network Bridge: {process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Environment:</div>
              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <div>Node Environment: {process.env.NODE_ENV || "development"}</div>
                <div>Build Time: {new Date().toLocaleString()}</div>
                <div>User Agent: {typeof window !== "undefined" ? navigator.userAgent.split(" ")[0] : "Server"}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-16 flex flex-col gap-1"
              onClick={() => window.open(systemHealth.mediaServer.url, "_blank")}
            >
              <Server className="w-5 h-5" />
              <span className="text-xs">Media Server</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex flex-col gap-1"
              onClick={() => window.open(`${systemHealth.networkBridge.url}/health`, "_blank")}
            >
              <Database className="w-5 h-5" />
              <span className="text-xs">Network Bridge</span>
            </Button>

            <Button variant="outline" className="h-16 flex flex-col gap-1" onClick={checkSystemHealth}>
              <RefreshCw className="w-5 h-5" />
              <span className="text-xs">Refresh All</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex flex-col gap-1"
              onClick={() => mediaServerClient.initializeWebSocket()}
            >
              <Wifi className="w-5 h-5" />
              <span className="text-xs">Reconnect WS</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
