"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Shield,
  Activity,
  Database,
  Settings,
  Users,
  Play,
  Square,
  RotateCcw,
  Download,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Cpu,
  HardDrive,
  MemoryStickIcon as Memory,
  Network,
  Server,
  Eye,
  FileText,
  Calendar,
} from "lucide-react"

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: string
  temperature: number
}

interface ServiceStatus {
  name: string
  status: "running" | "stopped" | "error"
  cpu: number
  memory: number
  uptime: string
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  ip: string
  status: "success" | "failed" | "warning"
}

export function Admin() {
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 68,
    disk: 72,
    network: 23,
    uptime: "7d 14h 32m",
    temperature: 42,
  })

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Camera Service", status: "running", cpu: 15, memory: 256, uptime: "7d 14h" },
    { name: "Network Scanner", status: "running", cpu: 8, memory: 128, uptime: "7d 14h" },
    { name: "Database", status: "running", cpu: 12, memory: 512, uptime: "7d 14h" },
    { name: "Media Server", status: "running", cpu: 25, memory: 1024, uptime: "7d 14h" },
    { name: "Alert System", status: "running", cpu: 3, memory: 64, uptime: "7d 14h" },
    { name: "Backup Service", status: "stopped", cpu: 0, memory: 0, uptime: "0m" },
  ])

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "1",
      timestamp: "2024-01-15 14:30:25",
      user: "admin",
      action: "Login",
      resource: "Dashboard",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: "2",
      timestamp: "2024-01-15 14:25:12",
      user: "operator",
      action: "Camera Configuration",
      resource: "Camera-001",
      ip: "192.168.1.105",
      status: "success",
    },
    {
      id: "3",
      timestamp: "2024-01-15 14:20:45",
      user: "guest",
      action: "Failed Login",
      resource: "Dashboard",
      ip: "192.168.1.200",
      status: "failed",
    },
    {
      id: "4",
      timestamp: "2024-01-15 14:15:33",
      user: "admin",
      action: "System Settings",
      resource: "Security Config",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: "5",
      timestamp: "2024-01-15 14:10:18",
      user: "system",
      action: "Backup",
      resource: "Database",
      ip: "localhost",
      status: "warning",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || log.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const controlService = (serviceName: string, action: "start" | "stop" | "restart") => {
    setServices((prev) =>
      prev.map((service) => {
        if (service.name === serviceName) {
          switch (action) {
            case "start":
              return { ...service, status: "running" as const }
            case "stop":
              return { ...service, status: "stopped" as const, cpu: 0, memory: 0, uptime: "0m" }
            case "restart":
              return { ...service, status: "running" as const, uptime: "0m" }
            default:
              return service
          }
        }
        return service
      }),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
      case "success":
        return "text-green-600 dark:text-green-400"
      case "stopped":
      case "failed":
        return "text-red-600 dark:text-red-400"
      case "error":
      case "warning":
        return "text-amber-600 dark:text-amber-400"
      default:
        return "text-slate-600 dark:text-slate-400"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "running":
      case "success":
        return "default"
      case "stopped":
      case "failed":
        return "destructive"
      case "error":
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">System Administration</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor and manage system performance, services, and security
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.cpu.toFixed(1)}%</div>
                <Progress value={metrics.cpu} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Memory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.memory}%</div>
                <Progress value={metrics.memory} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.disk}%</div>
                <Progress value={metrics.disk} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.network.toFixed(1)}%</div>
                <Progress value={metrics.network} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* System Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Uptime</span>
                  <span className="text-sm font-medium">{metrics.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Temperature</span>
                  <span className="text-sm font-medium">{metrics.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Load Average</span>
                  <span className="text-sm font-medium">0.45, 0.52, 0.48</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Active Connections</span>
                  <span className="text-sm font-medium">24</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Database Cleanup
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  System Backup
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Scan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Service Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            service.status === "running"
                              ? "bg-green-500"
                              : service.status === "stopped"
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                        />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <Badge variant={getStatusBadgeVariant(service.status)}>{service.status}</Badge>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        CPU: {service.cpu}% | RAM: {service.memory}MB | Uptime: {service.uptime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => controlService(service.name, "start")}
                          disabled={service.status === "running"}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => controlService(service.name, "stop")}
                          disabled={service.status === "stopped"}
                        >
                          <Square className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => controlService(service.name, "restart")}>
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Performance charts would be displayed here</p>
                    <p className="text-sm">Real-time CPU, Memory, and Network usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Security Score</span>
                    <span className="text-sm font-medium">92/100</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Performance Score</span>
                    <span className="text-sm font-medium">87/100</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Reliability Score</span>
                    <span className="text-sm font-medium">95/100</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Overall Health</span>
                    <Badge variant="default" className="bg-green-600">
                      Excellent
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Audit Logs
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{log.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{log.user}</span>
                      </div>
                      <span className="text-sm">{log.action}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">on {log.resource}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">{log.ip}</span>
                      <Badge variant={getStatusBadgeVariant(log.status)} className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredLogs.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">No logs match your search criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
