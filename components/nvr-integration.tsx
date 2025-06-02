"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Server,
  Camera,
  Settings,
  Play,
  Square,
  RotateCcw,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Plus,
  Eye,
  Activity,
  Shield,
  Network,
  HardDrive,
} from "lucide-react"
import { networkBridge } from "@/lib/network-bridge"

interface NVRSystem {
  id: string
  name: string
  ip: string
  port: number
  brand: string
  model: string
  version: string
  status: "online" | "offline" | "connecting"
  channels: number
  usedChannels: number
  storage: {
    total: number
    used: number
    available: number
  }
  cameras: NVRCamera[]
}

interface NVRCamera {
  id: string
  nvrId: string
  channel: number
  name: string
  ip: string
  status: "online" | "offline" | "recording"
  resolution: string
  fps: number
  bitrate: number
  codec: string
  hasPTZ: boolean
  isRecording: boolean
  streamUrls: {
    main: string
    sub: string
  }
}

export function NVRIntegration() {
  const [nvrSystems, setNVRSystems] = useState<NVRSystem[]>([])
  const [selectedNVR, setSelectedNVR] = useState<NVRSystem | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<NVRCamera | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showAddNVR, setShowAddNVR] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>("")

  const [newNVR, setNewNVR] = useState({
    name: "",
    ip: "",
    port: 8000,
    username: "admin",
    password: "admin",
    brand: "hikvision",
  })

  useEffect(() => {
    // Load saved NVR systems
    const savedNVRs = localStorage.getItem("nvrSystems")
    if (savedNVRs) {
      try {
        setNVRSystems(JSON.parse(savedNVRs))
      } catch (error) {
        console.error("Failed to load NVR systems:", error)
      }
    }

    // Initialize network bridge
    initializeNetworkBridge()

    return () => {
      networkBridge.disconnect()
    }
  }, [])

  const initializeNetworkBridge = async () => {
    try {
      await networkBridge.initializeWebSocket()

      // Set up event handlers
      networkBridge.onDeviceStatusChanged = (device) => {
        updateDeviceStatus(device)
      }

      networkBridge.onStreamStatus = (stream) => {
        updateStreamStatus(stream)
      }

      // Load existing NVR systems
      await loadNVRSystems()
    } catch (error) {
      console.error("Failed to initialize network bridge:", error)
      setConnectionStatus("Network bridge unavailable - using demo mode")
    }
  }

  const loadNVRSystems = async () => {
    try {
      const systems = await networkBridge.getNVRSystems()
      setNVRSystems(systems)
      localStorage.setItem("nvrSystems", JSON.stringify(systems))
    } catch (error) {
      console.error("Failed to load NVR systems:", error)
      // Load demo NVR systems
      loadDemoNVRSystems()
    }
  }

  const loadDemoNVRSystems = () => {
    const demoSystems: NVRSystem[] = [
      {
        id: "demo-nvr-1",
        name: "Main Building NVR",
        ip: "192.168.1.100",
        port: 8000,
        brand: "Hikvision",
        model: "DS-7616NI-K2",
        version: "V4.30.000",
        status: "online",
        channels: 16,
        usedChannels: 8,
        storage: {
          total: 8000,
          used: 3200,
          available: 4800,
        },
        cameras: [
          {
            id: "demo-cam-1",
            nvrId: "demo-nvr-1",
            channel: 1,
            name: "Main Entrance",
            ip: "192.168.1.101",
            status: "recording",
            resolution: "1920x1080",
            fps: 25,
            bitrate: 4096,
            codec: "H.264",
            hasPTZ: false,
            isRecording: true,
            streamUrls: {
              main: "rtsp://192.168.1.100:554/Streaming/Channels/101",
              sub: "rtsp://192.168.1.100:554/Streaming/Channels/102",
            },
          },
          {
            id: "demo-cam-2",
            nvrId: "demo-nvr-1",
            channel: 2,
            name: "Parking Lot",
            ip: "192.168.1.102",
            status: "recording",
            resolution: "1920x1080",
            fps: 25,
            bitrate: 4096,
            codec: "H.265",
            hasPTZ: true,
            isRecording: true,
            streamUrls: {
              main: "rtsp://192.168.1.100:554/Streaming/Channels/201",
              sub: "rtsp://192.168.1.100:554/Streaming/Channels/202",
            },
          },
        ],
      },
    ]

    setNVRSystems(demoSystems)
    localStorage.setItem("nvrSystems", JSON.stringify(demoSystems))
  }

  const connectToNVR = async () => {
    if (!newNVR.name || !newNVR.ip) return

    setIsConnecting(true)
    setConnectionStatus("Connecting to NVR...")

    try {
      const nvrConfig = {
        ip: newNVR.ip,
        port: newNVR.port,
        username: newNVR.username,
        password: newNVR.password,
        brand: newNVR.brand,
      }

      const result = await networkBridge.connectToNVR(nvrConfig)

      const newNVRSystem: NVRSystem = {
        id: result.id || `nvr-${Date.now()}`,
        name: newNVR.name,
        ip: newNVR.ip,
        port: newNVR.port,
        brand: newNVR.brand,
        model: result.model || "Unknown",
        version: result.version || "Unknown",
        status: "online",
        channels: result.channels || 16,
        usedChannels: result.usedChannels || 0,
        storage: result.storage || { total: 0, used: 0, available: 0 },
        cameras: result.cameras || [],
      }

      const updatedSystems = [...nvrSystems, newNVRSystem]
      setNVRSystems(updatedSystems)
      localStorage.setItem("nvrSystems", JSON.stringify(updatedSystems))

      setConnectionStatus("Successfully connected to NVR")
      setShowAddNVR(false)
      setNewNVR({
        name: "",
        ip: "",
        port: 8000,
        username: "admin",
        password: "admin",
        brand: "hikvision",
      })
    } catch (error) {
      console.error("Failed to connect to NVR:", error)
      setConnectionStatus(`Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const updateDeviceStatus = (device: any) => {
    setNVRSystems((prev) =>
      prev.map((nvr) => ({
        ...nvr,
        cameras: nvr.cameras.map((cam) => (cam.id === device.id ? { ...cam, status: device.status } : cam)),
      })),
    )
  }

  const updateStreamStatus = (stream: any) => {
    // Update stream status in UI
    console.log("Stream status update:", stream)
  }

  const startRecording = async (camera: NVRCamera) => {
    try {
      // Implementation would call NVR API to start recording
      console.log("Starting recording for camera:", camera.name)
      // Update local state
      updateCameraRecordingStatus(camera.id, true)
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const stopRecording = async (camera: NVRCamera) => {
    try {
      // Implementation would call NVR API to stop recording
      console.log("Stopping recording for camera:", camera.name)
      // Update local state
      updateCameraRecordingStatus(camera.id, false)
    } catch (error) {
      console.error("Failed to stop recording:", error)
    }
  }

  const updateCameraRecordingStatus = (cameraId: string, isRecording: boolean) => {
    setNVRSystems((prev) =>
      prev.map((nvr) => ({
        ...nvr,
        cameras: nvr.cameras.map((cam) => (cam.id === cameraId ? { ...cam, isRecording } : cam)),
      })),
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "recording":
        return <Activity className="w-4 h-4 text-red-500" />
      case "offline":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800">Online</Badge>
      case "recording":
        return <Badge className="bg-red-100 text-red-800">Recording</Badge>
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">NVR Integration</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Connect and manage Network Video Recorders and their cameras
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadNVRSystems}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddNVR(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add NVR
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <Alert>
          <Network className="h-4 w-4" />
          <AlertDescription>{connectionStatus}</AlertDescription>
        </Alert>
      )}

      {/* Add NVR Form */}
      {showAddNVR && (
        <Card>
          <CardHeader>
            <CardTitle>Connect to NVR System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nvr-name">NVR Name</Label>
                <Input
                  id="nvr-name"
                  value={newNVR.name}
                  onChange={(e) => setNewNVR((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Main Building NVR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nvr-ip">IP Address</Label>
                <Input
                  id="nvr-ip"
                  value={newNVR.ip}
                  onChange={(e) => setNewNVR((prev) => ({ ...prev, ip: e.target.value }))}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nvr-port">Port</Label>
                <Input
                  id="nvr-port"
                  type="number"
                  value={newNVR.port}
                  onChange={(e) => setNewNVR((prev) => ({ ...prev, port: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nvr-brand">Brand</Label>
                <select
                  id="nvr-brand"
                  value={newNVR.brand}
                  onChange={(e) => setNewNVR((prev) => ({ ...prev, brand: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="hikvision">Hikvision</option>
                  <option value="dahua">Dahua</option>
                  <option value="uniview">Uniview</option>
                  <option value="axis">Axis</option>
                  <option value="bosch">Bosch</option>
                  <option value="generic">Generic ONVIF</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nvr-username">Username</Label>
                <Input
                  id="nvr-username"
                  value={newNVR.username}
                  onChange={(e) => setNewNVR((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nvr-password">Password</Label>
                <Input
                  id="nvr-password"
                  type="password"
                  value={newNVR.password}
                  onChange={(e) => setNewNVR((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={connectToNVR} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddNVR(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="systems" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="systems">NVR Systems</TabsTrigger>
          <TabsTrigger value="cameras">Cameras</TabsTrigger>
          <TabsTrigger value="recording">Recording</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-4">
          {/* NVR Systems */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {nvrSystems.map((nvr) => (
              <Card
                key={nvr.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedNVR?.id === nvr.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedNVR(nvr)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      {nvr.name}
                    </div>
                    {getStatusIcon(nvr.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Brand:</span>
                      <span className="font-medium">{nvr.brand}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Model:</span>
                      <span className="font-medium">{nvr.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IP Address:</span>
                      <span className="font-mono text-xs">
                        {nvr.ip}:{nvr.port}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Channels:</span>
                      <span className="font-medium">
                        {nvr.usedChannels}/{nvr.channels}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {getStatusBadge(nvr.status)}
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {nvrSystems.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Server className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No NVR systems connected</p>
                  <Button onClick={() => setShowAddNVR(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Your First NVR
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cameras" className="space-y-4">
          {/* Cameras from all NVR systems */}
          <div className="space-y-4">
            {nvrSystems.flatMap((nvr) =>
              nvr.cameras.map((camera) => (
                <Card key={camera.id} className="cursor-pointer hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{camera.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Channel {camera.channel} • {camera.resolution} • {camera.fps}fps
                          </p>
                          <p className="text-xs text-slate-500">
                            {camera.codec} • {(camera.bitrate / 1024).toFixed(1)}Mbps
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(camera.status)}
                        <div className="flex gap-1">
                          {camera.isRecording ? (
                            <Button size="sm" variant="outline" onClick={() => stopRecording(camera)}>
                              <Square className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => startRecording(camera)}>
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )),
            )}
          </div>
        </TabsContent>

        <TabsContent value="recording" className="space-y-4">
          {/* Recording Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Active Recordings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nvrSystems
                    .flatMap((nvr) => nvr.cameras)
                    .filter((camera) => camera.isRecording)
                    .map((camera) => (
                      <div key={camera.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{camera.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Recording since: {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => stopRecording(camera)}>
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Recording Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100">24/7 Recording</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">All cameras recording continuously</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Motion Detection</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Recording triggered by motion events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          {/* Storage Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {nvrSystems.map((nvr) => (
              <Card key={nvr.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5" />
                    {nvr.name} Storage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used Storage:</span>
                      <span>
                        {nvr.storage.used}GB / {nvr.storage.total}GB
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(nvr.storage.used / nvr.storage.total) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500">
                      {nvr.storage.available}GB available • {Math.round((nvr.storage.used / nvr.storage.total) * 100)}%
                      used
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <p className="text-slate-600 dark:text-slate-400">Retention</p>
                      <p className="font-bold">30 days</p>
                    </div>
                    <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <p className="text-slate-600 dark:text-slate-400">Backup</p>
                      <p className="font-bold">Enabled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
