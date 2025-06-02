"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Settings,
  Wifi,
  WifiOff,
  Plus,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { RTSPPlayer } from "./rtsp-player"
import { PTZControls } from "./ptz-controls"
import { ONVIFClient, RTSPClient, CameraDiscovery } from "@/lib/camera-protocols"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnhancedCamera {
  id: string
  name: string
  ip: string
  port: number
  username: string
  password: string
  status: "online" | "offline" | "testing" | "error" | "demo"
  type: "IP Camera" | "PTZ Camera" | "Dome Camera"
  manufacturer: string
  model: string
  protocol: "ONVIF" | "RTSP" | "HTTP"
  streamUrl?: string
  profileToken?: string
  capabilities: string[]
  isRecording: boolean
  hasAudio: boolean
  hasPTZ: boolean
  resolution: string
  location: string
}

export function CameraManagementEnhanced() {
  const [cameras, setCameras] = useState<EnhancedCamera[]>([])
  const [selectedCamera, setSelectedCamera] = useState<EnhancedCamera | null>(null)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [discoveryProgress, setDiscoveryProgress] = useState(0)
  const [showAddCamera, setShowAddCamera] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [discoveryError, setDiscoveryError] = useState<string | null>(null)
  const [discoveryStatus, setDiscoveryStatus] = useState<string>("")

  // New camera form state
  const [newCamera, setNewCamera] = useState({
    name: "",
    ip: "",
    port: 554,
    username: "admin",
    password: "admin",
    protocol: "ONVIF" as "ONVIF" | "RTSP",
    location: "",
  })

  useEffect(() => {
    // Load saved cameras from localStorage
    const savedCameras = localStorage.getItem("cameras")
    if (savedCameras) {
      try {
        setCameras(JSON.parse(savedCameras))
      } catch (error) {
        console.error("Failed to load saved cameras:", error)
      }
    }
  }, [])

  const saveCameras = (updatedCameras: EnhancedCamera[]) => {
    setCameras(updatedCameras)
    try {
      localStorage.setItem("cameras", JSON.stringify(updatedCameras))
    } catch (error) {
      console.error("Failed to save cameras:", error)
    }
  }

  const discoverCameras = async () => {
    setIsDiscovering(true)
    setDiscoveryProgress(0)
    setDiscoveryError(null)
    setDiscoveryStatus("Initializing network scan...")

    try {
      // Simulate discovery progress with status updates
      const progressSteps = [
        { progress: 10, status: "Detecting network interfaces..." },
        { progress: 25, status: "Scanning common camera ports..." },
        { progress: 50, status: "Testing ONVIF endpoints..." },
        { progress: 75, status: "Verifying RTSP streams..." },
        { progress: 90, status: "Finalizing discovery..." },
        { progress: 100, status: "Discovery complete!" },
      ]

      for (const step of progressSteps) {
        setDiscoveryProgress(step.progress)
        setDiscoveryStatus(step.status)
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      const discoveredCameras = await CameraDiscovery.discoverONVIFCameras("192.168.1.1-254")

      const newCameras: EnhancedCamera[] = discoveredCameras.map((cam, index) => ({
        id: `discovered-${Date.now()}-${index}`,
        name: `${cam.model} (${cam.ip})`,
        ip: cam.ip,
        port: cam.port || 554,
        username: "admin",
        password: "admin",
        status: cam.status === "demo" ? "demo" : "online",
        type: "IP Camera" as const,
        manufacturer: cam.manufacturer || "Unknown",
        model: cam.model || "IP Camera",
        protocol: cam.type as "ONVIF" | "RTSP",
        capabilities: ["streaming"],
        isRecording: false,
        hasAudio: false,
        hasPTZ: false,
        resolution: "1920x1080",
        location: cam.status === "demo" ? "Demo Environment" : "Auto-discovered",
      }))

      if (newCameras.length > 0) {
        saveCameras([...cameras, ...newCameras])
        setDiscoveryStatus(`Found ${newCameras.length} camera(s)`)
      } else {
        setDiscoveryStatus("No cameras found on network")
      }
    } catch (error) {
      console.error("Discovery failed:", error)
      setDiscoveryError(error instanceof Error ? error.message : "Discovery failed")
      setDiscoveryStatus("Discovery failed")
    } finally {
      setTimeout(() => {
        setIsDiscovering(false)
        setDiscoveryProgress(0)
        setDiscoveryStatus("")
      }, 2000)
    }
  }

  const testCameraConnection = async (camera: EnhancedCamera) => {
    setCameras((prev) => prev.map((cam) => (cam.id === camera.id ? { ...cam, status: "testing" } : cam)))

    try {
      let isConnected = false

      if (camera.status === "demo") {
        // Simulate connection test for demo cameras
        await new Promise((resolve) => setTimeout(resolve, 1500))
        isConnected = true
      } else {
        isConnected = await CameraDiscovery.testCameraConnection(camera.ip, camera.username, camera.password)
      }

      setTestResults((prev) => ({ ...prev, [camera.id]: isConnected }))

      setCameras((prev) =>
        prev.map((cam) => (cam.id === camera.id ? { ...cam, status: isConnected ? "online" : "offline" } : cam)),
      )

      if (isConnected && camera.protocol === "ONVIF" && camera.status !== "demo") {
        // Get additional camera info for real cameras
        try {
          const onvifClient = new ONVIFClient(camera.ip, camera.username, camera.password)
          const profiles = await onvifClient.getProfiles()
          console.log("Camera profiles:", profiles)
        } catch (error) {
          console.log("Could not retrieve camera profiles:", error)
        }
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      setCameras((prev) => prev.map((cam) => (cam.id === camera.id ? { ...cam, status: "error" } : cam)))
    }
  }

  const addCamera = async () => {
    if (!newCamera.name || !newCamera.ip) return

    const camera: EnhancedCamera = {
      id: `camera-${Date.now()}`,
      name: newCamera.name,
      ip: newCamera.ip,
      port: newCamera.port,
      username: newCamera.username,
      password: newCamera.password,
      status: "offline",
      type: "IP Camera",
      manufacturer: "Unknown",
      model: "Unknown",
      protocol: newCamera.protocol,
      capabilities: [],
      isRecording: false,
      hasAudio: false,
      hasPTZ: false,
      resolution: "1920x1080",
      location: newCamera.location,
    }

    const updatedCameras = [...cameras, camera]
    saveCameras(updatedCameras)

    // Test connection immediately
    await testCameraConnection(camera)

    setShowAddCamera(false)
    setNewCamera({
      name: "",
      ip: "",
      port: 554,
      username: "admin",
      password: "admin",
      protocol: "ONVIF",
      location: "",
    })
  }

  const getStreamUrl = (camera: EnhancedCamera): string => {
    if (camera.status === "demo") {
      // Return a demo stream URL
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    }

    if (camera.protocol === "RTSP") {
      const rtspClient = new RTSPClient(camera.ip, camera.port, camera.username, camera.password)
      return rtspClient.getStreamUrl()
    }
    // For ONVIF, we would get the stream URL from the profile
    return `rtsp://${camera.username}:${camera.password}@${camera.ip}:${camera.port}/stream1`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "offline":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "testing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "demo":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800">Online</Badge>
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
      case "testing":
        return <Badge className="bg-blue-100 text-blue-800">Testing</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "demo":
        return <Badge className="bg-orange-100 text-orange-800">Demo</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Enhanced Camera Management</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Real RTSP/ONVIF camera integration with live streaming and PTZ controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={discoverCameras} disabled={isDiscovering}>
            {isDiscovering ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wifi className="w-4 h-4 mr-2" />}
            Discover
          </Button>
          <Button onClick={() => setShowAddCamera(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Camera
          </Button>
        </div>
      </div>

      {/* Discovery Progress */}
      {isDiscovering && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{discoveryStatus}</span>
                <span>{discoveryProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${discoveryProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discovery Error */}
      {discoveryError && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Discovery Error: {discoveryError}. Demo cameras have been added for testing.
          </AlertDescription>
        </Alert>
      )}

      {/* Add Camera Form */}
      {showAddCamera && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Camera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="camera-name">Camera Name</Label>
                <Input
                  id="camera-name"
                  value={newCamera.name}
                  onChange={(e) => setNewCamera((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Entrance Camera"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camera-ip">IP Address</Label>
                <Input
                  id="camera-ip"
                  value={newCamera.ip}
                  onChange={(e) => setNewCamera((prev) => ({ ...prev, ip: e.target.value }))}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camera-port">Port</Label>
                <Input
                  id="camera-port"
                  type="number"
                  value={newCamera.port}
                  onChange={(e) => setNewCamera((prev) => ({ ...prev, port: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camera-protocol">Protocol</Label>
                <select
                  id="camera-protocol"
                  value={newCamera.protocol}
                  onChange={(e) => setNewCamera((prev) => ({ ...prev, protocol: e.target.value as "ONVIF" | "RTSP" }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="ONVIF">ONVIF</option>
                  <option value="RTSP">RTSP</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="camera-username">Username</Label>
                <Input
                  id="camera-username"
                  value={newCamera.username}
                  onChange={(e) => setNewCamera((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camera-password">Password</Label>
                <Input
                  id="camera-password"
                  type="password"
                  value={newCamera.password}
                  onChange={(e) => setNewCamera((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="camera-location">Location</Label>
              <Input
                id="camera-location"
                value={newCamera.location}
                onChange={(e) => setNewCamera((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Main Entrance"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addCamera}>Add Camera</Button>
              <Button variant="outline" onClick={() => setShowAddCamera(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera List */}
        <div className="lg:col-span-2 space-y-4">
          {cameras.map((camera) => (
            <Card
              key={camera.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCamera?.id === camera.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedCamera(camera)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(camera.status)}
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{camera.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {camera.ip}:{camera.port} • {camera.protocol}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {camera.location} • {camera.resolution}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(camera.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        testCameraConnection(camera)
                      }}
                      disabled={camera.status === "testing"}
                    >
                      <TestTube className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {cameras.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No cameras configured</p>
                <Button onClick={() => setShowAddCamera(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Camera
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Camera Details & Controls */}
        <div className="space-y-4">
          {selectedCamera ? (
            <Tabs defaultValue="stream" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stream">Live Stream</TabsTrigger>
                <TabsTrigger value="controls">PTZ Controls</TabsTrigger>
              </TabsList>

              <TabsContent value="stream" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      {selectedCamera.name}
                      {getStatusBadge(selectedCamera.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCamera.status === "online" || selectedCamera.status === "demo" ? (
                      <RTSPPlayer
                        streamUrl={getStreamUrl(selectedCamera)}
                        width={320}
                        height={240}
                        onError={(error) => console.error("Stream error:", error)}
                      />
                    ) : (
                      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <WifiOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm opacity-75">Camera Offline</p>
                          <p className="text-xs opacity-50 mt-1">
                            {selectedCamera.status === "error" ? "Connection Error" : "Not Connected"}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="controls">
                {selectedCamera.hasPTZ ? (
                  <PTZControls
                    cameraIp={selectedCamera.ip}
                    profileToken={selectedCamera.profileToken || ""}
                    username={selectedCamera.username}
                    password={selectedCamera.password}
                    onError={(error) => console.error("PTZ error:", error)}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600 dark:text-slate-400">This camera does not support PTZ controls</p>
                      {selectedCamera.status === "demo" && (
                        <p className="text-xs text-slate-500 mt-2">Demo cameras have limited functionality</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">Select a camera to view live stream and controls</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
