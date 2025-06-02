"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Layers, Camera, Wifi, MapPin, Settings, Eye, EyeOff } from "lucide-react"

interface MapDevice {
  id: string
  type: "camera" | "sensor" | "access_point" | "nvr"
  name: string
  x: number
  y: number
  status: "online" | "offline" | "unknown"
  unitId?: string
}

interface StorageUnit {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  status: "available" | "rented" | "maintenance"
  renterName?: string
}

export function FacilityMap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showLayers, setShowLayers] = useState({
    units: true,
    devices: true,
    zones: true,
    grid: false,
  })
  const [isAddingDevice, setIsAddingDevice] = useState(false)
  const [selectedDeviceType, setSelectedDeviceType] = useState<"camera" | "sensor" | "access_point" | "nvr">("camera")

  const [storageUnits] = useState<StorageUnit[]>([
    { id: "A1", name: "A-1", x: 50, y: 50, width: 80, height: 60, status: "rented", renterName: "John Doe" },
    { id: "A2", name: "A-2", x: 150, y: 50, width: 80, height: 60, status: "available" },
    { id: "A3", name: "A-3", x: 250, y: 50, width: 80, height: 60, status: "rented", renterName: "Jane Smith" },
    { id: "B1", name: "B-1", x: 50, y: 130, width: 80, height: 60, status: "maintenance" },
    { id: "B2", name: "B-2", x: 150, y: 130, width: 80, height: 60, status: "available" },
    { id: "B3", name: "B-3", x: 250, y: 130, width: 80, height: 60, status: "rented", renterName: "Bob Wilson" },
  ])

  const [devices, setDevices] = useState<MapDevice[]>([
    { id: "cam-1", type: "camera", name: "Entrance Camera", x: 25, y: 25, status: "online" },
    { id: "cam-2", type: "camera", name: "Corridor A Camera", x: 200, y: 25, status: "online", unitId: "A2" },
    { id: "sensor-1", type: "sensor", name: "Motion Sensor", x: 100, y: 100, status: "online", unitId: "A1" },
    { id: "ap-1", type: "access_point", name: "WiFi AP", x: 300, y: 150, status: "online" },
  ])

  const getUnitColor = (status: string) => {
    switch (status) {
      case "available":
        return "#10b981" // green
      case "rented":
        return "#3b82f6" // blue
      case "maintenance":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "camera":
        return "📹"
      case "sensor":
        return "🔍"
      case "access_point":
        return "📡"
      case "nvr":
        return "💾"
      default:
        return "📍"
    }
  }

  const getDeviceColor = (status: string) => {
    switch (status) {
      case "online":
        return "#10b981"
      case "offline":
        return "#ef4444"
      default:
        return "#f59e0b"
    }
  }

  const handleZoom = (direction: "in" | "out") => {
    const newZoom = direction === "in" ? Math.min(zoom + 25, 300) : Math.max(zoom - 25, 30)
    setZoom(newZoom)
  }

  const resetView = () => {
    setZoom(100)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAddingDevice) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAddingDevice) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingDevice) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / (zoom / 100)
    const y = (e.clientY - rect.top - pan.y) / (zoom / 100)

    const newDevice: MapDevice = {
      id: `${selectedDeviceType}-${Date.now()}`,
      type: selectedDeviceType,
      name: `New ${selectedDeviceType}`,
      x,
      y,
      status: "online",
    }

    setDevices([...devices, newDevice])
    setIsAddingDevice(false)
  }

  const toggleLayer = (layer: keyof typeof showLayers) => {
    setShowLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Interactive Facility Map</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Visual overview of storage units, cameras, and security devices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Map Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Zoom Controls */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom: {zoom}%</label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleZoom("out")}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleZoom("in")}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={resetView}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Layer Controls */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Layers
              </label>
              <div className="space-y-2">
                {Object.entries(showLayers).map(([layer, visible]) => (
                  <div key={layer} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{layer}</span>
                    <Button size="sm" variant="ghost" onClick={() => toggleLayer(layer as keyof typeof showLayers)}>
                      {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Addition */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Device</label>
              <div className="grid grid-cols-2 gap-2">
                {(["camera", "sensor", "access_point", "nvr"] as const).map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedDeviceType === type ? "default" : "outline"}
                    onClick={() => setSelectedDeviceType(type)}
                    className="text-xs"
                  >
                    {getDeviceIcon(type)} {type}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                variant={isAddingDevice ? "destructive" : "default"}
                onClick={() => setIsAddingDevice(!isAddingDevice)}
                className="w-full"
              >
                {isAddingDevice ? "Cancel" : "Add Device"}
              </Button>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Legend</label>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Rented</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Maintenance</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div
              className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-lg"
              style={{ height: "600px" }}
            >
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 400 300"
                className={`cursor-${isAddingDevice ? "crosshair" : isDragging ? "grabbing" : "grab"}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleMapClick}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                }}
              >
                {/* Grid */}
                {showLayers.grid && (
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.5" />
                    </pattern>
                  </defs>
                )}
                {showLayers.grid && <rect width="100%" height="100%" fill="url(#grid)" />}

                {/* Storage Units */}
                {showLayers.units &&
                  storageUnits.map((unit) => (
                    <g key={unit.id}>
                      <rect
                        x={unit.x}
                        y={unit.y}
                        width={unit.width}
                        height={unit.height}
                        fill={getUnitColor(unit.status)}
                        fillOpacity="0.3"
                        stroke={getUnitColor(unit.status)}
                        strokeWidth="2"
                        rx="4"
                      />
                      <text
                        x={unit.x + unit.width / 2}
                        y={unit.y + unit.height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-semibold fill-slate-900 dark:fill-slate-100"
                      >
                        {unit.name}
                      </text>
                      {unit.status === "rented" && (
                        <text
                          x={unit.x + unit.width / 2}
                          y={unit.y + unit.height / 2 + 15}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs fill-slate-600 dark:fill-slate-400"
                        >
                          🔒
                        </text>
                      )}
                    </g>
                  ))}

                {/* Zones */}
                {showLayers.zones && (
                  <>
                    {/* Entrance Zone */}
                    <rect
                      x="10"
                      y="10"
                      width="380"
                      height="30"
                      fill="rgba(59, 130, 246, 0.1)"
                      stroke="rgba(59, 130, 246, 0.3)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      rx="4"
                    />
                    <text x="200" y="28" textAnchor="middle" className="text-xs fill-blue-600 font-medium">
                      Entrance Area
                    </text>

                    {/* Office Zone */}
                    <rect
                      x="350"
                      y="50"
                      width="40"
                      height="100"
                      fill="rgba(16, 185, 129, 0.1)"
                      stroke="rgba(16, 185, 129, 0.3)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      rx="4"
                    />
                    <text x="370" y="105" textAnchor="middle" className="text-xs fill-green-600 font-medium">
                      Office
                    </text>
                  </>
                )}

                {/* Devices */}
                {showLayers.devices &&
                  devices.map((device) => (
                    <g key={device.id}>
                      <circle
                        cx={device.x}
                        cy={device.y}
                        r="8"
                        fill={getDeviceColor(device.status)}
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={device.x}
                        y={device.y + 3}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs"
                      >
                        {getDeviceIcon(device.type)}
                      </text>
                      <text
                        x={device.x}
                        y={device.y - 15}
                        textAnchor="middle"
                        className="text-xs fill-slate-900 dark:fill-slate-100 font-medium"
                      >
                        {device.name}
                      </text>
                    </g>
                  ))}
              </svg>

              {/* Instructions Overlay */}
              {isAddingDevice && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
                  Click on the map to place a {selectedDeviceType}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4 text-center">
            <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              {devices.filter((d) => d.type === "camera").length} Cameras
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {devices.filter((d) => d.type === "camera" && d.status === "online").length} Online
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              {devices.filter((d) => d.type === "sensor").length} Sensors
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              {devices.filter((d) => d.type === "sensor" && d.status === "online").length} Active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4 text-center">
            <Wifi className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
              {devices.filter((d) => d.type === "access_point").length} Access Points
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {devices.filter((d) => d.type === "access_point" && d.status === "online").length} Connected
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-orange-600 flex items-center justify-center text-lg">💾</div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">{storageUnits.length} Units</h3>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              {storageUnits.filter((u) => u.status === "rented").length} Occupied
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
