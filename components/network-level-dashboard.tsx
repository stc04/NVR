"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  Router,
  Server,
  Database,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Monitor,
  Camera,
  Lock,
  Zap,
  Network,
  Eye,
  Download,
  Upload,
  Clock,
  MapPin,
  Info,
  ExternalLink,
  Terminal,
  Gauge,
} from "lucide-react"
import { networkScanner } from "@/lib/network-scanner"
import type { NetworkDevice } from "@/types"

interface NetworkTopology {
  subnets: Array<{
    id: string
    range: string
    gateway: string
    devices: number
    status: "active" | "inactive"
  }>
  vlans: Array<{
    id: string
    name: string
    vlanId: number
    devices: number
  }>
  routes: Array<{
    destination: string
    gateway: string
    interface: string
    metric: number
  }>
}

interface NetworkPerformance {
  bandwidth: {
    download: number
    upload: number
    unit: "Mbps" | "Gbps"
  }
  latency: {
    gateway: number
    dns: number
    internet: number
  }
  packetLoss: number
  jitter: number
}

export function NetworkLevelDashboard() {
  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([])
  const [networkTopology, setNetworkTopology] = useState<NetworkTopology | null>(null)
  const [networkPerformance, setNetworkPerformance] = useState<NetworkPerformance | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("topology")
  const [realTimeData, setRealTimeData] = useState({
    connectedDevices: 32,
    totalBandwidth: 1000,
    usedBandwidth: 245,
    securityThreats: 0,
    uptime: "99.8%",
  })

  useEffect(() => {
    // Load saved network data
    const savedDevices = localStorage.getItem("networkDevices")
    if (savedDevices) {
      setNetworkDevices(JSON.parse(savedDevices))
    }

    // Initialize network topology
    initializeNetworkTopology()

    // Start real-time monitoring
    const interval = setInterval(updateRealTimeData, 5000)
    return () => clearInterval(interval)
  }, [])

  const initializeNetworkTopology = () => {
    const topology: NetworkTopology = {
      subnets: [
        {
          id: "subnet-1",
          range: "192.168.1.0/24",
          gateway: "192.168.1.1",
          devices: 28,
          status: "active",
        },
        {
          id: "subnet-2",
          range: "192.168.2.0/24",
          gateway: "192.168.2.1",
          devices: 4,
          status: "active",
        },
        {
          id: "subnet-3",
          range: "10.0.0.0/24",
          gateway: "10.0.0.1",
          devices: 0,
          status: "inactive",
        },
      ],
      vlans: [
        { id: "vlan-1", name: "Management", vlanId: 10, devices: 8 },
        { id: "vlan-2", name: "Cameras", vlanId: 20, devices: 24 },
        { id: "vlan-3", name: "Guest", vlanId: 30, devices: 0 },
      ],
      routes: [
        {
          destination: "0.0.0.0/0",
          gateway: "192.168.1.1",
          interface: "eth0",
          metric: 100,
        },
        {
          destination: "192.168.2.0/24",
          gateway: "192.168.1.254",
          interface: "eth0",
          metric: 200,
        },
      ],
    }

    setNetworkTopology(topology)
  }

  const updateRealTimeData = () => {
    setRealTimeData((prev) => ({
      ...prev,
      usedBandwidth: Math.floor(Math.random() * 300) + 200,
      connectedDevices: Math.floor(Math.random() * 5) + 30,
    }))
  }

  const performNetworkScan = async () => {
    setIsScanning(true)
    setScanProgress(0)

    try {
      const result = await networkScanner.scanNetwork(
        "192.168.1.1-254",
        { timeout: 2000, concurrency: 10 },
        (progress) => setScanProgress(progress),
        (device) => {
          setNetworkDevices((prev) => {
            const exists = prev.find((d) => d.ip === device.ip)
            if (!exists) {
              return [...prev, device]
            }
            return prev
          })
        },
      )

      localStorage.setItem("networkDevices", JSON.stringify(result.devices))
    } catch (error) {
      console.error("Network scan failed:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const performNetworkSpeedTest = async () => {
    // Simulate network speed test
    const performance: NetworkPerformance = {
      bandwidth: {
        download: Math.floor(Math.random() * 500) + 500,
        upload: Math.floor(Math.random() * 100) + 50,
        unit: "Mbps",
      },
      latency: {
        gateway: Math.floor(Math.random() * 5) + 1,
        dns: Math.floor(Math.random() * 20) + 10,
        internet: Math.floor(Math.random() * 50) + 20,
      },
      packetLoss: Math.random() * 0.5,
      jitter: Math.floor(Math.random() * 10) + 1,
    }

    setNetworkPerformance(performance)
  }

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case "camera":
        return <Camera className="w-4 h-4" />
      case "router":
        return <Router className="w-4 h-4" />
      case "nvr":
        return <Monitor className="w-4 h-4" />
      default:
        return <Network className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 dark:text-green-400"
      case "offline":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-yellow-600 dark:text-yellow-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Network Level Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Comprehensive network monitoring, topology mapping, and security analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={performNetworkSpeedTest}>
            <Gauge className="w-4 h-4 mr-2" />
            Speed Test
          </Button>
          <Button onClick={performNetworkScan} disabled={isScanning}>
            {isScanning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
            {isScanning ? "Scanning..." : "Full Network Scan"}
          </Button>
        </div>
      </div>

      {/* Real-time Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Connected Devices</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{realTimeData.connectedDevices}</p>
              </div>
              <Network className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Bandwidth Usage</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{realTimeData.usedBandwidth}MB</p>
              </div>
              <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Network Uptime</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{realTimeData.uptime}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Security Threats</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {realTimeData.securityThreats}
                </p>
              </div>
              <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Total Bandwidth</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{realTimeData.totalBandwidth}MB</p>
              </div>
              <Zap className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Progress */}
      {isScanning && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scanning network infrastructure...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="topology">Network Topology</TabsTrigger>
          <TabsTrigger value="devices">Device Management</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="tools">Network Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="topology" className="space-y-4">
          {/* Network Topology Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Network Subnets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {networkTopology?.subnets.map((subnet) => (
                  <div
                    key={subnet.id}
                    className={`p-4 border rounded-lg ${
                      subnet.status === "active" ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{subnet.range}</h3>
                      <Badge variant={subnet.status === "active" ? "default" : "secondary"}>{subnet.status}</Badge>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <p>Gateway: {subnet.gateway}</p>
                      <p>Devices: {subnet.devices}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  VLANs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {networkTopology?.vlans.map((vlan) => (
                  <div key={vlan.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{vlan.name}</h3>
                      <Badge variant="outline">VLAN {vlan.vlanId}</Badge>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <p>Devices: {vlan.devices}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Routing Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Router className="w-5 h-5" />
                Routing Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Destination</th>
                      <th className="text-left p-2">Gateway</th>
                      <th className="text-left p-2">Interface</th>
                      <th className="text-left p-2">Metric</th>
                    </tr>
                  </thead>
                  <tbody>
                    {networkTopology?.routes.map((route, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-mono">{route.destination}</td>
                        <td className="p-2 font-mono">{route.gateway}</td>
                        <td className="p-2">{route.interface}</td>
                        <td className="p-2">{route.metric}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          {/* Device Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Network Devices ({networkDevices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {networkDevices.length > 0 ? (
                <div className="space-y-4">
                  {networkDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          {getDeviceTypeIcon(device.deviceType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{device.manufacturer}</h3>
                            <span className={`text-sm ${getStatusColor(device.status)}`}>●</span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {device.ip} • {device.mac}
                          </p>
                          <p className="text-xs text-slate-400">
                            {device.protocol}:{device.port} • Last seen: {device.lastSeen}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {device.deviceType.replace("_", " ")}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Network className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No network devices discovered</p>
                  <Button onClick={performNetworkScan}>
                    <Globe className="w-4 h-4 mr-2" />
                    Start Network Discovery
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Network Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Bandwidth Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {networkPerformance ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-green-600" />
                        <span>Download</span>
                      </div>
                      <span className="font-bold text-green-900 dark:text-green-100">
                        {networkPerformance.bandwidth.download} {networkPerformance.bandwidth.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Upload</span>
                      </div>
                      <span className="font-bold text-blue-900 dark:text-blue-100">
                        {networkPerformance.bandwidth.upload} {networkPerformance.bandwidth.unit}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <p className="text-slate-600 dark:text-slate-400">Packet Loss</p>
                        <p className="font-bold">{networkPerformance.packetLoss.toFixed(2)}%</p>
                      </div>
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <p className="text-slate-600 dark:text-slate-400">Jitter</p>
                        <p className="font-bold">{networkPerformance.jitter}ms</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gauge className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No speed test results available</p>
                    <Button onClick={performNetworkSpeedTest}>
                      <Gauge className="w-4 h-4 mr-2" />
                      Run Speed Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Latency Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {networkPerformance ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Gateway Latency</span>
                      <span className="font-bold">{networkPerformance.latency.gateway}ms</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>DNS Latency</span>
                      <span className="font-bold">{networkPerformance.latency.dns}ms</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Internet Latency</span>
                      <span className="font-bold">{networkPerformance.latency.internet}ms</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400">Run a speed test to see latency data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {/* Network Security */}
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <Shield className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Network Security Status:</strong> All systems operational. No threats detected in the last 24
              hours.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Firewall Active</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Intrusion Detection</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span>VPN Access</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Limited
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Threat Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold text-green-900 dark:text-green-100">All Clear</p>
                  <p className="text-sm text-green-700 dark:text-green-300">No security threats detected</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="text-slate-600 dark:text-slate-400">Blocked IPs</p>
                    <p className="font-bold">0</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="text-slate-600 dark:text-slate-400">Suspicious Activity</p>
                    <p className="font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          {/* Real-time Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-time Network Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Bandwidth Usage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used</span>
                      <span>
                        {realTimeData.usedBandwidth}MB / {realTimeData.totalBandwidth}MB
                      </span>
                    </div>
                    <Progress value={(realTimeData.usedBandwidth / realTimeData.totalBandwidth) * 100} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Device Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Online: {realTimeData.connectedDevices}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Offline: 0</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Network Health</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{realTimeData.uptime}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Uptime</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          {/* Network Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Network Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Ping Test
                </Button>
                <Button className="w-full" variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Traceroute
                </Button>
                <Button className="w-full" variant="outline">
                  <Server className="w-4 h-4 mr-2" />
                  Port Scanner
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Network Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Packet Capture
                </Button>
                <Button className="w-full" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Vulnerability Scan
                </Button>
                <Button className="w-full" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Network Mapping
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  External Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline" asChild>
                  <a href="https://nmap.org" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Nmap
                  </a>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <a href="https://www.wireshark.org" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Wireshark
                  </a>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <a href="https://angryip.org" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Angry IP Scanner
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Professional Tools:</strong> For advanced network analysis, consider using dedicated tools like
              Nmap, Wireshark, or commercial network monitoring solutions alongside this browser-based interface.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
