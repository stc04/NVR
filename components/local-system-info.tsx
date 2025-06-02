"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  HardDrive,
  Network,
  Monitor,
  Cpu,
  MemoryStickIcon as Memory,
  Wifi,
  Globe,
  Server,
  Database,
  Folder,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Cloud,
} from "lucide-react"

interface StorageInfo {
  name: string
  type: "indexeddb" | "localstorage" | "sessionstorage" | "cache" | "filesystem" | "network"
  used: number
  total: number
  available: boolean
  permissions?: string
}

interface NetworkInterface {
  name: string
  ip: string
  type: "ethernet" | "wifi" | "loopback" | "unknown"
  status: "connected" | "disconnected"
}

interface SystemInfo {
  platform: string
  userAgent: string
  language: string
  timezone: string
  screen: {
    width: number
    height: number
    colorDepth: number
  }
  hardware: {
    cores: number
    memory: number
  }
}

export function LocalSystemInfo() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo[]>([])
  const [networkInterfaces, setNetworkInterfaces] = useState<NetworkInterface[]>([])
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const scanLocalSystem = async () => {
    setIsScanning(true)

    try {
      // Get storage information
      const storage: StorageInfo[] = []

      // IndexedDB
      if ("indexedDB" in window) {
        try {
          const estimate = await navigator.storage?.estimate()
          storage.push({
            name: "IndexedDB",
            type: "indexeddb",
            used: estimate?.usage || 0,
            total: estimate?.quota || 0,
            available: true,
          })
        } catch (error) {
          storage.push({
            name: "IndexedDB",
            type: "indexeddb",
            used: 0,
            total: 0,
            available: false,
          })
        }
      }

      // LocalStorage
      if ("localStorage" in window) {
        try {
          let localStorageSize = 0
          for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
              localStorageSize += localStorage[key].length + key.length
            }
          }
          storage.push({
            name: "LocalStorage",
            type: "localstorage",
            used: localStorageSize,
            total: 5 * 1024 * 1024, // Typical 5MB limit
            available: true,
          })
        } catch (error) {
          storage.push({
            name: "LocalStorage",
            type: "localstorage",
            used: 0,
            total: 0,
            available: false,
          })
        }
      }

      // SessionStorage
      if ("sessionStorage" in window) {
        try {
          let sessionStorageSize = 0
          for (const key in sessionStorage) {
            if (sessionStorage.hasOwnProperty(key)) {
              sessionStorageSize += sessionStorage[key].length + key.length
            }
          }
          storage.push({
            name: "SessionStorage",
            type: "sessionstorage",
            used: sessionStorageSize,
            total: 5 * 1024 * 1024, // Typical 5MB limit
            available: true,
          })
        } catch (error) {
          storage.push({
            name: "SessionStorage",
            type: "sessionstorage",
            used: 0,
            total: 0,
            available: false,
          })
        }
      }

      // Cache Storage
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys()
          let totalCacheSize = 0
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName)
            const requests = await cache.keys()
            for (const request of requests) {
              const response = await cache.match(request)
              if (response) {
                const blob = await response.blob()
                totalCacheSize += blob.size
              }
            }
          }
          storage.push({
            name: "Cache Storage",
            type: "cache",
            used: totalCacheSize,
            total: 50 * 1024 * 1024, // Estimated 50MB
            available: true,
          })
        } catch (error) {
          storage.push({
            name: "Cache Storage",
            type: "cache",
            used: 0,
            total: 0,
            available: false,
          })
        }
      }

      // File System Access (if supported)
      if ("showDirectoryPicker" in window) {
        storage.push({
          name: "File System Access",
          type: "filesystem",
          used: 0,
          total: 0,
          available: true,
          permissions: "User permission required",
        })
      }

      setStorageInfo(storage)

      // Get network interfaces using WebRTC
      const interfaces: NetworkInterface[] = []

      try {
        const pc = new RTCPeerConnection({ iceServers: [] })
        pc.createDataChannel("")

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const ips = new Set<string>()

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate
            const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
            if (ipMatch) {
              ips.add(ipMatch[1])
            }
          }
        }

        // Wait for ICE gathering
        await new Promise((resolve) => setTimeout(resolve, 1000))

        ips.forEach((ip) => {
          let type: "ethernet" | "wifi" | "loopback" | "unknown" = "unknown"
          let name = "Network Interface"

          if (ip.startsWith("127.")) {
            type = "loopback"
            name = "Loopback"
          } else if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
            type = "ethernet"
            name = "Local Network"
          }

          interfaces.push({
            name,
            ip,
            type,
            status: "connected",
          })
        })

        pc.close()
      } catch (error) {
        console.error("Error detecting network interfaces:", error)
      }

      // Add online status
      interfaces.push({
        name: "Internet Connection",
        ip: "N/A",
        type: "unknown",
        status: navigator.onLine ? "connected" : "disconnected",
      })

      setNetworkInterfaces(interfaces)

      // Get system information
      const sysInfo: SystemInfo = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
        },
        hardware: {
          cores: navigator.hardwareConcurrency || 0,
          memory: (navigator as any).deviceMemory || 0,
        },
      }

      setSystemInfo(sysInfo)
    } catch (error) {
      console.error("Error scanning local system:", error)
    } finally {
      setIsScanning(false)
    }
  }

  useEffect(() => {
    scanLocalSystem()
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStorageIcon = (type: string) => {
    switch (type) {
      case "indexeddb":
        return <Database className="w-4 h-4" />
      case "localstorage":
      case "sessionstorage":
        return <Folder className="w-4 h-4" />
      case "cache":
        return <Server className="w-4 h-4" />
      case "filesystem":
        return <HardDrive className="w-4 h-4" />
      case "network":
        return <Cloud className="w-4 h-4" />
      default:
        return <HardDrive className="w-4 h-4" />
    }
  }

  const getNetworkIcon = (type: string) => {
    switch (type) {
      case "wifi":
        return <Wifi className="w-4 h-4" />
      case "ethernet":
        return <Network className="w-4 h-4" />
      case "loopback":
        return <Server className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Local System Information</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Detected storage, network interfaces, and system capabilities
          </p>
        </div>
        <Button onClick={scanLocalSystem} disabled={isScanning}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />
          {isScanning ? "Scanning..." : "Refresh"}
        </Button>
      </div>

      <Tabs defaultValue="storage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="storage">Storage & Shares</TabsTrigger>
          <TabsTrigger value="network">Network Interfaces</TabsTrigger>
          <TabsTrigger value="system">System Information</TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Detected Storage & Shares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storageInfo.map((storage, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStorageIcon(storage.type)}
                      <div>
                        <div className="font-medium">{storage.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {storage.permissions ||
                            `${storage.type.charAt(0).toUpperCase() + storage.type.slice(1)} Storage`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {storage.available ? (
                        <>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {formatBytes(storage.used)} / {formatBytes(storage.total)}
                            </div>
                            {storage.total > 0 && (
                              <Progress value={(storage.used / storage.total) * 100} className="w-24 mt-1" />
                            )}
                          </div>
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Unavailable
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Browser Storage Limitations</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      This system can only detect browser-accessible storage. For full system drive and network share
                      detection, a native application or server-side component would be required.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Interfaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkInterfaces.map((iface, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getNetworkIcon(iface.type)}
                      <div>
                        <div className="font-medium">{iface.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {iface.ip !== "N/A" ? `IP: ${iface.ip}` : "Connection Status"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={iface.status === "connected" ? "default" : "destructive"}
                        className={iface.status === "connected" ? "text-green-700 bg-green-100" : ""}
                      >
                        {iface.status === "connected" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {iface.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {iface.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {systemInfo && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Hardware Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">CPU Cores</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {systemInfo.hardware.cores || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Device Memory</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Memory className="w-3 h-3" />
                      {systemInfo.hardware.memory ? `${systemInfo.hardware.memory} GB` : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Screen Resolution</span>
                    <span className="text-sm font-medium">
                      {systemInfo.screen.width} × {systemInfo.screen.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Color Depth</span>
                    <span className="text-sm font-medium">{systemInfo.screen.colorDepth}-bit</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Platform Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Platform</span>
                    <span className="text-sm font-medium">{systemInfo.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Language</span>
                    <span className="text-sm font-medium">{systemInfo.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Timezone</span>
                    <span className="text-sm font-medium">{systemInfo.timezone}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">User Agent</span>
                    <p className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded break-all">
                      {systemInfo.userAgent}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
