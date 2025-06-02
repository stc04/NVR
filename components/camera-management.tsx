"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Play, Pause, Settings, Wifi, WifiOff, Eye, EyeOff, RotateCcw, Maximize, Volume2 } from "lucide-react"

interface CameraDevice {
  id: string
  name: string
  ip: string
  status: "online" | "offline" | "recording"
  location: string
  type: "IP Camera" | "PTZ Camera" | "Dome Camera"
  manufacturer: string
  model: string
  streamUrl?: string
  isRecording: boolean
  hasAudio: boolean
  resolution: string
}

export function CameraManagement() {
  const [cameras, setCameras] = useState<CameraDevice[]>([
    {
      id: "cam-001",
      name: "Entrance Gate",
      ip: "192.168.1.101",
      status: "online",
      location: "Main Entrance",
      type: "IP Camera",
      manufacturer: "Uniview",
      model: "IPC322LR3-VSPF28-D",
      isRecording: true,
      hasAudio: true,
      resolution: "1920x1080",
    },
    {
      id: "cam-002",
      name: "Storage Area A",
      ip: "192.168.1.102",
      status: "online",
      location: "Building A - Corridor",
      type: "Dome Camera",
      manufacturer: "Uniview",
      model: "IPC322LR3-VSPF28-D",
      isRecording: true,
      hasAudio: false,
      resolution: "1920x1080",
    },
    {
      id: "cam-003",
      name: "Parking Lot",
      ip: "192.168.1.103",
      status: "offline",
      location: "Parking Area",
      type: "PTZ Camera",
      manufacturer: "Uniview",
      model: "IPC6322LR3-X22P-D",
      isRecording: false,
      hasAudio: true,
      resolution: "2560x1440",
    },
  ])

  const [selectedCamera, setSelectedCamera] = useState<CameraDevice | null>(null)
  const [isLiveView, setIsLiveView] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-red-500"
      case "recording":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="w-4 h-4" />
      case "offline":
        return <WifiOff className="w-4 h-4" />
      case "recording":
        return <Camera className="w-4 h-4" />
      default:
        return <Camera className="w-4 h-4" />
    }
  }

  const toggleRecording = (cameraId: string) => {
    setCameras(
      cameras.map((cam) =>
        cam.id === cameraId
          ? { ...cam, isRecording: !cam.isRecording, status: cam.isRecording ? "online" : "recording" }
          : cam,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Camera Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Monitor and control security cameras across the facility</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Camera className="w-4 h-4 mr-2" />
          Add Camera
        </Button>
      </div>

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
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(camera.status)}`} />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{camera.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {camera.location} • {camera.ip}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {camera.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant={camera.isRecording ? "destructive" : "default"}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleRecording(camera.id)
                      }}
                    >
                      {camera.isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Resolution: {camera.resolution}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(camera.status)}
                      {camera.status}
                    </span>
                    {camera.hasAudio && <Volume2 className="w-4 h-4" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Camera Details & Live View */}
        <div className="space-y-4">
          {selectedCamera ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    {selectedCamera.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {isLiveView ? (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm opacity-75">Live Feed</p>
                          <p className="text-xs opacity-50">{selectedCamera.resolution}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        <EyeOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-75">Camera Offline</p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Maximize className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => setIsLiveView(!isLiveView)}
                      >
                        {isLiveView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Status:</span>
                      <Badge variant={selectedCamera.status === "online" ? "default" : "destructive"}>
                        {selectedCamera.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">IP Address:</span>
                      <span className="font-mono">{selectedCamera.ip}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Manufacturer:</span>
                      <span>{selectedCamera.manufacturer}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Model:</span>
                      <span>{selectedCamera.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Recording:</span>
                      <Badge variant={selectedCamera.isRecording ? "default" : "secondary"}>
                        {selectedCamera.isRecording ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">Select a camera to view details and live feed</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
