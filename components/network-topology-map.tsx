"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Globe,
  Router,
  Camera,
  Monitor,
  Server,
  Network,
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react"

interface NetworkNode {
  id: string
  type: "router" | "switch" | "camera" | "server" | "device" | "gateway"
  name: string
  ip: string
  x: number
  y: number
  status: "online" | "offline" | "warning"
  connections: string[]
  details?: any
}

interface NetworkConnection {
  from: string
  to: string
  type: "ethernet" | "wifi" | "fiber" | "vpn"
  bandwidth: string
  status: "active" | "inactive" | "congested"
}

export function NetworkTopologyMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [connections, setConnections] = useState<NetworkConnection[]>([])
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [isInteractive, setIsInteractive] = useState(true)

  useEffect(() => {
    initializeTopology()
    drawTopology()
  }, [nodes, connections])

  const initializeTopology = () => {
    // Create network topology nodes
    const topologyNodes: NetworkNode[] = [
      {
        id: "gateway-1",
        type: "gateway",
        name: "Internet Gateway",
        ip: "192.168.1.1",
        x: 400,
        y: 50,
        status: "online",
        connections: ["router-1"],
      },
      {
        id: "router-1",
        type: "router",
        name: "Main Router",
        ip: "192.168.1.1",
        x: 400,
        y: 150,
        status: "online",
        connections: ["switch-1", "switch-2", "wifi-ap-1"],
      },
      {
        id: "switch-1",
        type: "switch",
        name: "Camera Switch",
        ip: "192.168.1.10",
        x: 200,
        y: 250,
        status: "online",
        connections: ["camera-1", "camera-2", "camera-3", "camera-4"],
      },
      {
        id: "switch-2",
        type: "switch",
        name: "Server Switch",
        ip: "192.168.1.11",
        x: 600,
        y: 250,
        status: "online",
        connections: ["server-1", "server-2"],
      },
      {
        id: "wifi-ap-1",
        type: "device",
        name: "WiFi Access Point",
        ip: "192.168.1.20",
        x: 400,
        y: 250,
        status: "online",
        connections: ["device-1", "device-2"],
      },
      // Cameras
      {
        id: "camera-1",
        type: "camera",
        name: "Entrance Camera",
        ip: "192.168.1.101",
        x: 50,
        y: 350,
        status: "online",
        connections: [],
      },
      {
        id: "camera-2",
        type: "camera",
        name: "Parking Camera",
        ip: "192.168.1.102",
        x: 150,
        y: 350,
        status: "online",
        connections: [],
      },
      {
        id: "camera-3",
        type: "camera",
        name: "Hallway Camera",
        ip: "192.168.1.103",
        x: 250,
        y: 350,
        status: "warning",
        connections: [],
      },
      {
        id: "camera-4",
        type: "camera",
        name: "Exit Camera",
        ip: "192.168.1.104",
        x: 350,
        y: 350,
        status: "online",
        connections: [],
      },
      // Servers
      {
        id: "server-1",
        type: "server",
        name: "NVR Server",
        ip: "192.168.1.200",
        x: 550,
        y: 350,
        status: "online",
        connections: [],
      },
      {
        id: "server-2",
        type: "server",
        name: "Database Server",
        ip: "192.168.1.201",
        x: 650,
        y: 350,
        status: "online",
        connections: [],
      },
      // Wireless devices
      {
        id: "device-1",
        type: "device",
        name: "Admin Tablet",
        ip: "192.168.1.50",
        x: 350,
        y: 320,
        status: "online",
        connections: [],
      },
      {
        id: "device-2",
        type: "device",
        name: "Mobile Scanner",
        ip: "192.168.1.51",
        x: 450,
        y: 320,
        status: "online",
        connections: [],
      },
    ]

    // Create connections
    const topologyConnections: NetworkConnection[] = [
      { from: "gateway-1", to: "router-1", type: "fiber", bandwidth: "1Gbps", status: "active" },
      { from: "router-1", to: "switch-1", type: "ethernet", bandwidth: "1Gbps", status: "active" },
      { from: "router-1", to: "switch-2", type: "ethernet", bandwidth: "1Gbps", status: "active" },
      { from: "router-1", to: "wifi-ap-1", type: "ethernet", bandwidth: "1Gbps", status: "active" },
      { from: "switch-1", to: "camera-1", type: "ethernet", bandwidth: "100Mbps", status: "active" },
      { from: "switch-1", to: "camera-2", type: "ethernet", bandwidth: "100Mbps", status: "active" },
      { from: "switch-1", to: "camera-3", type: "ethernet", bandwidth: "100Mbps", status: "congested" },
      { from: "switch-1", to: "camera-4", type: "ethernet", bandwidth: "100Mbps", status: "active" },
      { from: "switch-2", to: "server-1", type: "ethernet", bandwidth: "1Gbps", status: "active" },
      { from: "switch-2", to: "server-2", type: "ethernet", bandwidth: "1Gbps", status: "active" },
      { from: "wifi-ap-1", to: "device-1", type: "wifi", bandwidth: "300Mbps", status: "active" },
      { from: "wifi-ap-1", to: "device-2", type: "wifi", bandwidth: "300Mbps", status: "active" },
    ]

    setNodes(topologyNodes)
    setConnections(topologyConnections)
  }

  const drawTopology = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections first (so they appear behind nodes)
    connections.forEach((connection) => {
      const fromNode = nodes.find((n) => n.id === connection.from)
      const toNode = nodes.find((n) => n.id === connection.to)

      if (fromNode && toNode) {
        drawConnection(ctx, fromNode, toNode, connection)
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      drawNode(ctx, node)
    })
  }

  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    from: NetworkNode,
    to: NetworkNode,
    connection: NetworkConnection,
  ) => {
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)

    // Set line style based on connection type and status
    switch (connection.status) {
      case "active":
        ctx.strokeStyle = "#10b981" // green
        break
      case "congested":
        ctx.strokeStyle = "#f59e0b" // yellow
        break
      case "inactive":
        ctx.strokeStyle = "#ef4444" // red
        break
    }

    switch (connection.type) {
      case "fiber":
        ctx.lineWidth = 4
        ctx.setLineDash([])
        break
      case "ethernet":
        ctx.lineWidth = 2
        ctx.setLineDash([])
        break
      case "wifi":
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        break
      case "vpn":
        ctx.lineWidth = 2
        ctx.setLineDash([10, 5, 2, 5])
        break
    }

    ctx.stroke()

    // Draw bandwidth label
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    ctx.fillStyle = "#374151"
    ctx.font = "10px sans-serif"
    ctx.fillText(connection.bandwidth, midX + 5, midY - 5)
  }

  const drawNode = (ctx: CanvasRenderingContext2D, node: NetworkNode) => {
    const radius = 20

    // Draw node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)

    // Set color based on status
    switch (node.status) {
      case "online":
        ctx.fillStyle = "#10b981" // green
        break
      case "warning":
        ctx.fillStyle = "#f59e0b" // yellow
        break
      case "offline":
        ctx.fillStyle = "#ef4444" // red
        break
    }

    ctx.fill()

    // Draw node border
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw node icon (simplified)
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    let icon = ""
    switch (node.type) {
      case "router":
        icon = "R"
        break
      case "switch":
        icon = "S"
        break
      case "camera":
        icon = "C"
        break
      case "server":
        icon = "SV"
        break
      case "gateway":
        icon = "G"
        break
      default:
        icon = "D"
    }

    ctx.fillText(icon, node.x, node.y)

    // Draw node label
    ctx.fillStyle = "#374151"
    ctx.font = "11px sans-serif"
    ctx.fillText(node.name, node.x, node.y + radius + 15)
    ctx.fillText(node.ip, node.x, node.y + radius + 28)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInteractive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked node
    const clickedNode = nodes.find((node) => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= 20
    })

    setSelectedNode(clickedNode || null)
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "router":
        return <Router className="w-5 h-5" />
      case "switch":
        return <Network className="w-5 h-5" />
      case "camera":
        return <Camera className="w-5 h-5" />
      case "server":
        return <Server className="w-5 h-5" />
      case "gateway":
        return <Globe className="w-5 h-5" />
      default:
        return <Monitor className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "offline":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Network Topology Map</h2>
          <p className="text-slate-600 dark:text-slate-400">Interactive visualization of network infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button variant={isInteractive ? "default" : "outline"} onClick={() => setIsInteractive(!isInteractive)}>
            <Settings className="w-4 h-4 mr-2" />
            {isInteractive ? "Interactive" : "View Only"}
          </Button>
          <Button variant="outline" onClick={initializeTopology}>
            <Zap className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Topology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={400}
                  className="border rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900"
                  onClick={handleCanvasClick}
                />

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
                  <h4 className="font-semibold text-sm mb-2">Legend</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-green-500"></div>
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-yellow-500"></div>
                      <span>Congested</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                {selectedNode ? "Node Details" : "Network Overview"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getNodeIcon(selectedNode.type)}
                    <div>
                      <h3 className="font-semibold">{selectedNode.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedNode.ip}</p>
                    </div>
                    {getStatusIcon(selectedNode.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Type:</span>
                      <Badge variant="outline" className="capitalize">
                        {selectedNode.type}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge
                        variant={selectedNode.status === "online" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {selectedNode.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Connections:</span>
                      <span className="text-sm font-medium">{selectedNode.connections.length}</span>
                    </div>
                  </div>

                  {selectedNode.connections.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Connected To:</h4>
                      <div className="space-y-1">
                        {selectedNode.connections.map((connId) => {
                          const connectedNode = nodes.find((n) => n.id === connId)
                          return connectedNode ? (
                            <div key={connId} className="text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded">
                              {connectedNode.name}
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  <Button className="w-full" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <Network className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Click on any node to view details</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Nodes:</span>
                      <span className="font-medium">{nodes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Online:</span>
                      <span className="font-medium text-green-600">
                        {nodes.filter((n) => n.status === "online").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Warnings:</span>
                      <span className="font-medium text-yellow-600">
                        {nodes.filter((n) => n.status === "warning").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Offline:</span>
                      <span className="font-medium text-red-600">
                        {nodes.filter((n) => n.status === "offline").length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
