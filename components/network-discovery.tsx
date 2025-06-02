"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Wifi,
  Camera,
  Router,
  Smartphone,
  Monitor,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  StopCircle,
  Info,
  Settings,
  Download,
  ExternalLink,
  AlertTriangle,
  Activity,
} from "lucide-react"
import type { NetworkDevice } from "@/types"
import { networkScanner, type ScanOptions, type ScanStatistics } from "@/lib/network-scanner"
import { SecurityAssessmentComponent } from "./security-assessment"

export function NetworkDiscovery() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [ipRange, setIpRange] = useState("192.168.1.1-254")
  const [discoveredDevices, setDiscoveredDevices] = useState<NetworkDevice[]>([])
  const [scanStats, setScanStats] = useState<ScanStatistics>({
    totalHosts: 0,
    scannedHosts: 0,
    reachableHosts: 0,
    identifiedDevices: 0,
    scanDuration: 0,
    averageResponseTime: 0,
  })
  const [networkInfo, setNetworkInfo] = useState<any>(null)
  const [scanOptions, setScanOptions] = useState<Partial<ScanOptions>>({
    timeout: 2000,
    concurrency: 5,
    deepScan: false,
  })
  const [activeTab, setActiveTab] = useState("scan")

  useEffect(() => {
    // Load discovered devices from localStorage
    const savedDevices = localStorage.getItem("discoveredDevices")
    if (savedDevices) {
      setDiscoveredDevices(JSON.parse(savedDevices))
    }

    // Auto-detect network range on component mount
    detectNetworkRange()
  }, [])

  const saveDevices = (devices: NetworkDevice[]) => {
    setDiscoveredDevices(devices)
    localStorage.setItem("discoveredDevices", JSON.stringify(devices))
  }

  const detectNetworkRange = async () => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] })
      pc.createDataChannel("")

      pc.onicecandidate = (ice) => {
        if (ice.candidate) {
          const localIP = ice.candidate.candidate.split(" ")[4]
          if (localIP && localIP.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[01])\./)) {
            const parts = localIP.split(".")
            const networkBase = `${parts[0]}.${parts[1]}.${parts[2]}`
            setIpRange(`${networkBase}.1-254`)
            pc.close()
          }
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      setTimeout(() => pc.close(), 3000)
    } catch (error) {
      console.error("Failed to detect network range:", error)
    }
  }

  const startScan = async () => {
    setIsScanning(true)
    setScanProgress(0)
    setScanStats({
      totalHosts: 0,
      scannedHosts: 0,
      reachableHosts: 0,
      identifiedDevices: 0,
      scanDuration: 0,
      averageResponseTime: 0,
    })

    try {
      const result = await networkScanner.scanNetwork(
        ipRange,
        scanOptions,
        (progress, stats) => {
          setScanProgress(progress)
          setScanStats(stats)
        },
        (device) => {
          setDiscoveredDevices((prev) => {
            const exists = prev.find((d) => d.ip === device.ip)
            if (!exists) {
              return [...prev, device]
            }
            return prev
          })
        },
      )

      setNetworkInfo(result.networkInfo)

      const existingIPs = discoveredDevices.map((d) => d.ip)
      const newDevices = result.devices.filter((d) => !existingIPs.includes(d.ip))
      const updatedDevices = [...discoveredDevices, ...newDevices]

      saveDevices(updatedDevices)
      setScanStats(result.statistics)
    } catch (error) {
      console.error("Network scan failed:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const stopScan = () => {
    networkScanner.stopScan()
    setIsScanning(false)
  }

  const exportResults = () => {
    const data = {
      scanResults: {
        devices: discoveredDevices,
        statistics: scanStats,
        networkInfo,
        timestamp: new Date().toISOString(),
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `network-scan-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "camera":
        return <Camera className="w-5 h-5" />
      case "nvr":
        return <Monitor className="w-5 h-5" />
      case "smart_device":
        return <Smartphone className="w-5 h-5" />
      case "router":
        return <Router className="w-5 h-5" />
      default:
        return <Wifi className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "offline":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const addToSystem = (device: NetworkDevice) => {
    if (device.deviceType === "camera") {
      const cameras = JSON.parse(localStorage.getItem("cameras") || "[]")
      const newCamera = {
        id: `cam-${Date.now()}`,
        name: `${device.manufacturer} Camera`,
        ip: device.ip,
        port: device.port,
        username: "admin",
        password: "admin",
        status: "online",
        type: "IP Camera",
        manufacturer: device.manufacturer,
        model: device.model || "Unknown",
        protocol: device.protocol === "ONVIF" ? "ONVIF" : "RTSP",
        capabilities: [],
        isRecording: false,
        hasAudio: false,
        hasPTZ: false,
        resolution: "1920x1080",
        location: "Auto-discovered",
      }
      cameras.push(newCamera)
      localStorage.setItem("cameras", JSON.stringify(cameras))
    } else {
      const devices = JSON.parse(localStorage.getItem("devices") || "[]")
      devices.push(device)
      localStorage.setItem("devices", JSON.stringify(devices))
    }

    const updatedDevices = discoveredDevices.filter((d) => d.id !== device.id)
    saveDevices(updatedDevices)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Network Discovery & Security</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Advanced network scanning with comprehensive security assessment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults} disabled={discoveredDevices.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scan">Network Scan</TabsTrigger>
          <TabsTrigger value="devices">Discovered Devices</TabsTrigger>
          <TabsTrigger value="security">Security Assessment</TabsTrigger>
          <TabsTrigger value="tools">External Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-4">
          {/* Enhanced Browser Limitations Alert */}
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="space-y-2">
                <p className="font-semibold">Browser Network Scanning Limitations:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Cannot perform true ICMP ping or raw socket operations</li>
                  <li>Limited to HTTP/WebSocket probes and CORS-allowed requests</li>
                  <li>Cannot detect MAC addresses or perform ARP scanning</li>
                  <li>Some firewalls may block cross-origin requests</li>
                </ul>
                <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                  <p className="text-sm font-medium">For comprehensive network discovery, consider:</p>
                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                    <li>
                      <strong>Nmap:</strong> Professional network scanner with full protocol support
                    </li>
                    <li>
                      <strong>Advanced IP Scanner:</strong> Windows-based network discovery tool
                    </li>
                    <li>
                      <strong>Fing:</strong> Mobile and desktop network scanner
                    </li>
                    <li>
                      <strong>Angry IP Scanner:</strong> Cross-platform IP scanner
                    </li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Scan Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Scan Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ip-range">IP Range</Label>
                  <Input
                    id="ip-range"
                    value={ipRange}
                    onChange={(e) => setIpRange(e.target.value)}
                    placeholder="192.168.1.1-254"
                    disabled={isScanning}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={scanOptions.timeout}
                    onChange={(e) => setScanOptions((prev) => ({ ...prev, timeout: Number(e.target.value) }))}
                    disabled={isScanning}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concurrency">Concurrent Scans</Label>
                  <Input
                    id="concurrency"
                    type="number"
                    min="1"
                    max="20"
                    value={scanOptions.concurrency}
                    onChange={(e) => setScanOptions((prev) => ({ ...prev, concurrency: Number(e.target.value) }))}
                    disabled={isScanning}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scan Methods</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">HTTP Probe</Badge>
                    <Badge variant="outline">WebSocket</Badge>
                    <Badge variant="outline">ONVIF Discovery</Badge>
                    <Badge variant="outline">RTSP Detection</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!isScanning ? (
                  <Button onClick={startScan} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="w-4 h-4 mr-2" />
                    Start Enhanced Scan
                  </Button>
                ) : (
                  <Button onClick={stopScan} variant="destructive">
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop Scan
                  </Button>
                )}

                <Button variant="outline" onClick={detectNetworkRange} disabled={isScanning}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Auto-detect Range
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scan Progress and Statistics */}
          {(isScanning || scanStats.totalHosts > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Scan Progress & Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isScanning && (
                  <div>
                    <Progress value={scanProgress} className="h-3" />
                    <div className="flex justify-between text-sm text-slate-500 mt-2">
                      <span>Progress: {scanProgress}%</span>
                      <span>
                        Scanned: {scanStats.scannedHosts}/{scanStats.totalHosts}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{scanStats.reachableHosts}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Reachable Hosts</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{scanStats.identifiedDevices}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Identified Devices</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(scanStats.scanDuration / 1000)}s
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Scan Duration</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(scanStats.averageResponseTime)}ms
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          {/* Discovered Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Discovered Devices ({discoveredDevices.length})
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => saveDevices([])}>
                    Clear All
                  </Button>
                  <Button variant="outline" size="sm" onClick={startScan}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {discoveredDevices.length > 0 ? (
                <div className="space-y-4">
                  {discoveredDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          {getDeviceIcon(device.deviceType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {device.manufacturer} {device.model || "Unknown Model"}
                            </h3>
                            {getStatusIcon(device.status)}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {device.ip} • {device.mac} • {device.protocol}:{device.port}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Last seen: {device.lastSeen}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={device.deviceType === "camera" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {device.deviceType.replace("_", " ")}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => addToSystem(device)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wifi className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No devices discovered</p>
                  <p className="text-sm text-slate-500 mb-4">
                    Start a network scan to discover devices on your network
                  </p>
                  <Button onClick={startScan} variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Start Network Scan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecurityAssessmentComponent devices={discoveredDevices} />
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          {/* External Tools Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Professional Network Scanning Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Nmap (Network Mapper)</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    The industry standard for network discovery and security auditing
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Features:</strong> Port scanning, OS detection, service enumeration
                    </div>
                    <div>
                      <strong>Platform:</strong> Windows, macOS, Linux
                    </div>
                    <div>
                      <strong>License:</strong> Free and Open Source
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <a href="https://nmap.org" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Advanced IP Scanner</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Fast and easy-to-use network scanner for Windows
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Features:</strong> Device detection, remote access, wake-on-LAN
                    </div>
                    <div>
                      <strong>Platform:</strong> Windows
                    </div>
                    <div>
                      <strong>License:</strong> Free
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <a href="https://www.advanced-ip-scanner.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Fing Network Scanner</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Professional network discovery for mobile and desktop
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Features:</strong> Device identification, network security, monitoring
                    </div>
                    <div>
                      <strong>Platform:</strong> iOS, Android, Windows, macOS
                    </div>
                    <div>
                      <strong>License:</strong> Freemium
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <a href="https://www.fing.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Angry IP Scanner</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Cross-platform network scanner with plugin support
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Features:</strong> Multi-threaded scanning, export options, plugins
                    </div>
                    <div>
                      <strong>Platform:</strong> Windows, macOS, Linux
                    </div>
                    <div>
                      <strong>License:</strong> Free and Open Source
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <a href="https://angryip.org" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> For security system installations, use Nmap or Advanced IP Scanner
                  for comprehensive device discovery, then use this browser tool for ongoing monitoring and quick
                  checks.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
