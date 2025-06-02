"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Camera,
  Network,
  Users,
  DollarSign,
  Building,
  Activity,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Lock,
  Zap,
  Eye,
  Settings,
  Database,
  Server,
  Globe,
  CheckCircle,
  Monitor,
  Wifi,
  Clock,
  TrendingUp,
  RefreshCw,
} from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [systemStatus, setSystemStatus] = useState({
    cameras: { online: 12, total: 15, status: "warning" },
    network: { devices: 45, threats: 2, status: "warning" },
    units: { occupied: 89, total: 120, revenue: 45670 },
    users: { active: 23, total: 156, newToday: 3 },
    security: { score: 85, alerts: 3, status: "good" },
  })

  const [realTimeData, setRealTimeData] = useState({
    networkActivity: 0,
    cameraFeeds: 0,
    securityEvents: 0,
    systemLoad: 0,
  })

  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected")
  const [lastUpdate, setLastUpdate] = useState<string>("")

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData({
        networkActivity: Math.floor(Math.random() * 100),
        cameraFeeds: Math.floor(Math.random() * 15),
        securityEvents: Math.floor(Math.random() * 10),
        systemLoad: Math.floor(Math.random() * 80) + 20,
      })
      setLastUpdate(new Date().toLocaleTimeString())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const occupancyRate = Math.round((systemStatus.units.occupied / systemStatus.units.total) * 100)
  const cameraHealth = Math.round((systemStatus.cameras.online / systemStatus.cameras.total) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI-IT Security POS</h1>
                  <p className="text-sm text-gray-500">Professional Security Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>863-308-4979</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Steven Chason</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>AI-IT Inc</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-400 animate-pulse"
                      : connectionStatus === "connecting"
                        ? "bg-yellow-400 animate-pulse"
                        : "bg-red-400"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {connectionStatus === "connected"
                    ? "Live"
                    : connectionStatus === "connecting"
                      ? "Connecting"
                      : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Created by Steven Chason</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">AI-IT Inc</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">863-308-4979</span>
            <span className="text-gray-400">•</span>
            <Badge variant="outline" className="text-xs text-red-600 border-red-200">
              NOT FOR RESALE
            </Badge>
          </div>
        </div>

        {/* Real-Time Status Bar */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Activity className="w-5 h-5" />
                    <span className="font-semibold">Network Activity</span>
                  </div>
                  <div className="text-2xl font-bold">{realTimeData.networkActivity}%</div>
                  <div className="text-sm opacity-80">Real-time monitoring</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Camera className="w-5 h-5" />
                    <span className="font-semibold">Camera Feeds</span>
                  </div>
                  <div className="text-2xl font-bold">{realTimeData.cameraFeeds}/15</div>
                  <div className="text-sm opacity-80">Live streams active</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Security Events</span>
                  </div>
                  <div className="text-2xl font-bold">{realTimeData.securityEvents}</div>
                  <div className="text-sm opacity-80">Events detected</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Server className="w-5 h-5" />
                    <span className="font-semibold">System Load</span>
                  </div>
                  <div className="text-2xl font-bold">{realTimeData.systemLoad}%</div>
                  <div className="text-sm opacity-80">CPU utilization</div>
                </div>
              </div>
              {lastUpdate && <div className="text-center mt-4 text-sm opacity-75">Last updated: {lastUpdate}</div>}
            </CardContent>
          </Card>
        </div>

        {/* System Status Alert */}
        <Alert className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <Server className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">System Status:</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Media Server Online</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Network Bridge Active</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600">3 Cameras Offline</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-blue-600">Database Connected</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="cameras" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Cameras</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center space-x-2">
              <Network className="w-4 h-4" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Units</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Camera Status */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Camera System</CardTitle>
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStatus.cameras.online}/{systemStatus.cameras.total}
                  </div>
                  <p className="text-xs text-muted-foreground">Cameras Online</p>
                  <Progress value={cameraHealth} className="mt-2 h-2" />
                  <div className="mt-2">
                    <Badge className={getStatusColor(systemStatus.cameras.status)}>
                      {systemStatus.cameras.status === "warning" ? "Some Offline" : "All Online"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Network Status */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network Security</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.network.devices}</div>
                  <p className="text-xs text-muted-foreground">Devices Monitored</p>
                  <div className="mt-2">
                    <Badge className={getStatusColor(systemStatus.network.status)}>
                      {systemStatus.network.threats} Threats Detected
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Security Score: {systemStatus.security.score}%</div>
                </CardContent>
              </Card>

              {/* Revenue Status */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${systemStatus.units.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus.units.occupied}/{systemStatus.units.total} Units Occupied
                  </p>
                  <Progress value={occupancyRate} className="mt-2 h-2" />
                  <div className="mt-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <Badge className="text-green-600 bg-green-50 border-green-200">+12% from last month</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Perform common security and management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center space-y-2 hover:bg-blue-50"
                    onClick={() => setActiveTab("network")}
                  >
                    <Globe className="w-6 h-6" />
                    <span>Live Network Scan</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center space-y-2 hover:bg-green-50"
                    onClick={() => setActiveTab("cameras")}
                  >
                    <Eye className="w-6 h-6" />
                    <span>Discover Cameras</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center space-y-2 hover:bg-purple-50"
                    onClick={() => setActiveTab("security")}
                  >
                    <Lock className="w-6 h-6" />
                    <span>Security Scan</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center space-y-2 hover:bg-orange-50"
                    onClick={() => setActiveTab("database")}
                  >
                    <Database className="w-6 h-6" />
                    <span>Database Status</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Live Activity Feed</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">Network scan completed</p>
                      <p className="text-sm text-gray-600">45 devices discovered • 2 minutes ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      LIVE
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">Camera 12 back online</p>
                      <p className="text-sm text-gray-600">Connection restored • 5 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium">Security alert resolved</p>
                      <p className="text-sm text-gray-600">Unauthorized access attempt blocked • 8 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div className="flex-1">
                      <p className="font-medium">New user registration</p>
                      <p className="text-sm text-gray-600">Unit A-15 tenant account created • 12 minutes ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5" />
                    <span>System Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>{realTimeData.systemLoad}%</span>
                    </div>
                    <Progress value={realTimeData.systemLoad} className="h-2" />
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
                      <span>Network Usage</span>
                      <span>{realTimeData.networkActivity}%</span>
                    </div>
                    <Progress value={realTimeData.networkActivity} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <Wifi className="w-6 h-6 mx-auto mb-1 text-green-500" />
                        <p className="font-medium">156ms</p>
                        <p className="text-gray-600">Latency</p>
                      </div>
                      <div className="text-center">
                        <RefreshCw className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                        <p className="font-medium">99.8%</p>
                        <p className="text-gray-600">Uptime</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs would contain the respective components */}
          <TabsContent value="cameras">
            <Card>
              <CardHeader>
                <CardTitle>Camera Management</CardTitle>
                <CardDescription>Manage IP cameras, RTSP streams, and PTZ controls</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">Camera management interface would be loaded here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle>Network Discovery</CardTitle>
                <CardDescription>Scan and discover network devices and security vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">Network discovery interface would be loaded here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Assessment</CardTitle>
                <CardDescription>Comprehensive security analysis and vulnerability scanning</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">Security assessment interface would be loaded here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="units">
            <Card>
              <CardHeader>
                <CardTitle>Units Management</CardTitle>
                <CardDescription>Manage storage units, rentals, and tenant information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">Units management interface would be loaded here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing System</CardTitle>
                <CardDescription>Process payments, generate invoices, and manage financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">Billing system interface would be loaded here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">User management interface would be loaded here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Dashboard</CardTitle>
                <CardDescription>Monitor database health, performance, and data management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">Database dashboard interface would be loaded here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system preferences, security settings, and integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">Settings interface would be loaded here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Professional Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">AI-IT Inc Security POS System</span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="font-medium">Creator:</span>
                <span>Steven Chason</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>863-308-4979</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>88 Perch St, Winterhaven FL 33881</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p>© 2024 AI-IT Inc. All rights reserved. • NOT FOR RESALE - Proprietary Software</p>
              <p className="mt-1">Professional Security Management System • Licensed Client Installation</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
