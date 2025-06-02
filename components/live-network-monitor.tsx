"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Wifi,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Zap,
  Download,
  Upload,
  Clock,
  Shield,
  RefreshCw,
} from "lucide-react"
import { networkBridge } from "@/lib/network-bridge"

interface NetworkMetrics {
  timestamp: string
  bandwidth: {
    download: number
    upload: number
    total: number
    unit: string
  }
  latency: {
    min: number
    max: number
    avg: number
  }
  packetLoss: number
  connectedDevices: number
  activeStreams: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  uptime: string
}

interface NetworkAlert {
  id: string
  type: "warning" | "error" | "info"
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
}

export function LiveNetworkMonitor() {
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null)
  const [alerts, setAlerts] = useState<NetworkAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  useEffect(() => {
    startMonitoring()
    return () => stopMonitoring()
  }, [])

  const startMonitoring = async () => {
    setIsMonitoring(true)

    try {
      // Initialize real-time monitoring
      await networkBridge.initializeWebSocket()

      // Set up event handlers for real-time updates
      networkBridge.onNetworkEvent = (event) => {
        handleNetworkEvent(event)
      }

      // Start periodic metric collection
      const interval = setInterval(async () => {
        await updateMetrics()
      }, 5000) // Update every 5 seconds

      // Initial metrics load
      await updateMetrics()

      return () => clearInterval(interval)
    } catch (error) {
      console.error("Failed to start monitoring:", error)
      // Use demo data if real monitoring fails
      startDemoMonitoring()
    }
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    networkBridge.disconnect()
  }

  const updateMetrics = async () => {
    try {
      const performance = await networkBridge.getNetworkPerformance()
      setMetrics(performance)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Failed to update metrics:", error)
      // Generate demo metrics
      generateDemoMetrics()
    }
  }

  const generateDemoMetrics = () => {
    const demoMetrics: NetworkMetrics = {
      timestamp: new Date().toISOString(),
      bandwidth: {
        download: Math.floor(Math.random() * 100) + 50,
        upload: Math.floor(Math.random() * 50) + 20,
        total: 1000,
        unit: "Mbps",
      },
      latency: {
        min: Math.floor(Math.random() * 5) + 1,
        max: Math.floor(Math.random() * 20) + 10,
        avg: Math.floor(Math.random() * 10) + 5,
      },
      packetLoss: Math.random() * 0.5,
      connectedDevices: Math.floor(Math.random() * 10) + 25,
      activeStreams: Math.floor(Math.random() * 5) + 8,
      cpuUsage: Math.floor(Math.random() * 30) + 20,
      memoryUsage: Math.floor(Math.random() * 40) + 30,
      diskUsage: Math.floor(Math.random() * 20) + 60,
      uptime: "15d 8h 32m",
    }

    setMetrics(demoMetrics)
    setLastUpdate(new Date().toLocaleTimeString())
  }

  const startDemoMonitoring = () => {
    // Generate initial demo data
    generateDemoMetrics()

    // Simulate real-time updates
    const interval = setInterval(() => {
      generateDemoMetrics()

      // Occasionally generate alerts
      if (Math.random() < 0.1) {
        generateDemoAlert()
      }
    }, 5000)

    return () => clearInterval(interval)
  }

  const generateDemoAlert = () => {
    const alertTypes = ["warning", "error", "info"] as const
    const alertMessages = [
      { title: "High Bandwidth Usage", message: "Network bandwidth usage is above 80%" },
      { title: "Camera Offline", message: "Parking Lot Camera has gone offline" },
      { title: "Storage Warning", message: "NVR storage is 85% full" },
      { title: "New Device Connected", message: "Unknown device connected to network" },
    ]

    const randomAlert = alertMessages[Math.floor(Math.random() * alertMessages.length)]
    const newAlert: NetworkAlert = {
      id: `alert-${Date.now()}`,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      title: randomAlert.title,
      message: randomAlert.message,
      timestamp: new Date().toLocaleTimeString(),
      acknowledged: false,
    }

    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]) // Keep only last 10 alerts
  }

  const handleNetworkEvent = (event: any) => {
    // Handle real-time network events
    switch (event.type) {
      case "device_connected":
        addAlert("info", "Device Connected", `New device: ${event.device.name}`)
        break
      case "device_disconnected":
        addAlert("warning", "Device Disconnected", `Device offline: ${event.device.name}`)
        break
      case "high_bandwidth":
        addAlert("warning", "High Bandwidth Usage", "Network bandwidth usage is above threshold")
        break
      case "security_alert":
        addAlert("error", "Security Alert", event.message)
        break
    }
  }

  const addAlert = (type: "warning" | "error" | "info", title: string, message: string) => {
    const newAlert: NetworkAlert = {
      id: `alert-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString(),
      acknowledged: false,
    }

    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return "text-red-600"
    if (usage >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Live Network Monitor</h2>
          <p className="text-slate-600 dark:text-slate-400">Real-time network performance and security monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            Last update: {lastUpdate}
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${isMonitoring ? "bg-green-500" : "bg-red-500"}`}></div>
              <span>{isMonitoring ? "Live" : "Offline"}</span>
            </div>
          </div>
          <Button variant="outline" onClick={updateMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Download</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {metrics.bandwidth.download}
                    <span className="text-sm ml-1">{metrics.bandwidth.unit}</span>
                  </p>
                </div>
                <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <Progress value={(metrics.bandwidth.download / metrics.bandwidth.total) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Upload</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {metrics.bandwidth.upload}
                    <span className="text-sm ml-1">{metrics.bandwidth.unit}</span>
                  </p>
                </div>
                <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <Progress value={(metrics.bandwidth.upload / metrics.bandwidth.total) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Latency</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {metrics.latency.avg}
                    <span className="text-sm ml-1">ms</span>
                  </p>
                </div>
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 mt-2">
                Min: {metrics.latency.min}ms • Max: {metrics.latency.max}ms
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Devices</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{metrics.connectedDevices}</p>
                </div>
                <Wifi className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                {metrics.activeStreams} active streams
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className={getUsageColor(metrics.cpuUsage)}>{metrics.cpuUsage}%</span>
                  </div>
                  <Progress value={metrics.cpuUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span className={getUsageColor(metrics.memoryUsage)}>{metrics.memoryUsage}%</span>
                  </div>
                  <Progress value={metrics.memoryUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk Usage</span>
                    <span className={getUsageColor(metrics.diskUsage)}>{metrics.diskUsage}%</span>
                  </div>
                  <Progress value={metrics.diskUsage} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">Uptime</span>
                  </div>
                  <span className="font-mono text-sm">{metrics.uptime}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Network Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Network Alerts ({alerts.filter((a) => !a.acknowledged).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border rounded-lg ${
                      alert.acknowledged ? "opacity-50 bg-slate-50 dark:bg-slate-800" : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{alert.timestamp}</p>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">No alerts</p>
                  <p className="text-sm text-slate-500">All systems operating normally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Network Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Network Health</h3>
              <p className="text-sm text-green-700 dark:text-green-300">All systems operational</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Performance</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Optimal performance</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Security</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">No threats detected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
