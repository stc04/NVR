"use client"

export interface LocalSystemData {
  storage: StorageInfo[]
  network: NetworkInterface[]
  system: SystemInfo
}

export interface StorageInfo {
  name: string
  type: "browser" | "filesystem" | "network" | "usb"
  path?: string
  size?: number
  used?: number
  available: boolean
  permissions?: string[]
  filesystem?: string
}

export interface NetworkInterface {
  name: string
  ip: string
  mac?: string
  type: "ethernet" | "wifi" | "loopback" | "vpn"
  status: "up" | "down"
  speed?: number
}

export interface SystemInfo {
  hostname?: string
  platform: string
  arch?: string
  version?: string
  uptime?: number
  memory?: {
    total: number
    free: number
    used: number
  }
  cpu?: {
    model: string
    cores: number
    speed: number
  }
}

export interface LocalShare {
  id: string
  name: string
  path: string
  type: "disk" | "network" | "removable" | "cd" | "ram"
  size: number
  used: number
  available: number
  filesystem: string
  isShared: boolean
  permissions: string[]
  description?: string
}

export interface LocalSystemInfo {
  hostname: string
  platform: string
  userAgent: string
  language: string
  timezone: string
  screenResolution: string
  cores: number
  memory: number
  shares: LocalShare[]
  networkInterfaces: NetworkInterface[]
  browserInfo: BrowserInfo
}

export interface BrowserInfo {
  name: string
  version: string
  engine: string
  os: string
  isMobile: boolean
  cookieEnabled: boolean
  javaEnabled: boolean
  onlineStatus: boolean
}

export class LocalSystemScanner {
  private storageQuota: StorageEstimate | null = null

  async scanStorage(): Promise<StorageInfo[]> {
    const storage: StorageInfo[] = []

    // Browser storage APIs
    if (typeof window !== "undefined") {
      // IndexedDB
      if ("indexedDB" in window) {
        try {
          const estimate = await navigator.storage?.estimate()
          storage.push({
            name: "IndexedDB",
            type: "browser",
            size: estimate?.quota || 0,
            used: estimate?.usage || 0,
            available: true,
            filesystem: "IndexedDB",
          })
        } catch (error) {
          storage.push({
            name: "IndexedDB",
            type: "browser",
            available: false,
            permissions: ["storage-access-denied"],
          })
        }
      }

      // File System Access API
      if ("showDirectoryPicker" in window) {
        storage.push({
          name: "File System Access",
          type: "filesystem",
          available: true,
          permissions: ["user-activation-required"],
          filesystem: "Native",
        })
      }

      // Web Share API for file sharing
      if ("share" in navigator) {
        storage.push({
          name: "Web Share API",
          type: "network",
          available: true,
          permissions: ["user-gesture-required"],
        })
      }
    }

    return storage
  }

  async scanNetworkInterfaces(): Promise<NetworkInterface[]> {
    const interfaces: NetworkInterface[] = []

    if (typeof window !== "undefined") {
      try {
        // Use WebRTC to discover local IP addresses
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        })

        pc.createDataChannel("")
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            pc.close()
            resolve(interfaces)
          }, 2000)

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              const candidate = event.candidate.candidate
              const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)

              if (ipMatch) {
                const ip = ipMatch[1]
                let type: "ethernet" | "wifi" | "loopback" | "vpn" = "ethernet"
                let name = "Network Interface"

                if (ip.startsWith("127.")) {
                  type = "loopback"
                  name = "Loopback Interface"
                } else if (
                  ip.startsWith("192.168.") ||
                  ip.startsWith("10.") ||
                  (ip.startsWith("172.") &&
                    Number.parseInt(ip.split(".")[1]) >= 16 &&
                    Number.parseInt(ip.split(".")[1]) <= 31)
                ) {
                  type = "ethernet"
                  name = "Private Network Interface"
                } else if (ip.startsWith("169.254.")) {
                  type = "ethernet"
                  name = "Link-Local Interface"
                }

                // Avoid duplicates
                if (!interfaces.find((iface) => iface.ip === ip)) {
                  interfaces.push({
                    name,
                    ip,
                    type,
                    status: "up",
                  })
                }
              }
            }
          }

          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === "complete") {
              clearTimeout(timeout)
              pc.close()
              resolve(interfaces)
            }
          }
        })
      } catch (error) {
        console.error("Error scanning network interfaces:", error)
      }

      // Add connection status
      interfaces.push({
        name: "Internet Connection",
        ip: "external",
        type: "ethernet",
        status: navigator.onLine ? "up" : "down",
      })
    }

    return interfaces
  }

  async scanSystemInfo(): Promise<SystemInfo> {
    const info: SystemInfo = {
      platform: "unknown",
    }

    if (typeof window !== "undefined") {
      info.platform = navigator.platform

      // Hardware concurrency (CPU cores)
      if ("hardwareConcurrency" in navigator) {
        info.cpu = {
          model: "Unknown",
          cores: navigator.hardwareConcurrency,
          speed: 0,
        }
      }

      // Device memory (if available)
      if ("deviceMemory" in navigator) {
        const deviceMemory = (navigator as any).deviceMemory
        info.memory = {
          total: deviceMemory * 1024 * 1024 * 1024, // Convert GB to bytes
          free: 0,
          used: 0,
        }
      }

      // User agent parsing for more details
      const ua = navigator.userAgent
      if (ua.includes("Windows")) {
        info.platform = "Windows"
        const versionMatch = ua.match(/Windows NT ([\d.]+)/)
        if (versionMatch) {
          info.version = versionMatch[1]
        }
      } else if (ua.includes("Mac")) {
        info.platform = "macOS"
        const versionMatch = ua.match(/Mac OS X ([\d_]+)/)
        if (versionMatch) {
          info.version = versionMatch[1].replace(/_/g, ".")
        }
      } else if (ua.includes("Linux")) {
        info.platform = "Linux"
      }

      // Architecture detection
      if (ua.includes("x86_64") || ua.includes("Win64")) {
        info.arch = "x64"
      } else if (ua.includes("ARM") || ua.includes("arm")) {
        info.arch = "arm"
      } else {
        info.arch = "x86"
      }
    }

    return info
  }

  async scanAll(): Promise<LocalSystemData> {
    const [storage, network, system] = await Promise.all([
      this.scanStorage(),
      this.scanNetworkInterfaces(),
      this.scanSystemInfo(),
    ])

    return {
      storage,
      network,
      system,
    }
  }

  // Get comprehensive local system information
  async getLocalSystemInfo(): Promise<LocalSystemInfo> {
    const [shares, networkInterfaces, browserInfo] = await Promise.all([
      this.detectLocalShares(),
      this.detectNetworkInterfaces(),
      this.getBrowserInfo(),
    ])

    return {
      hostname: this.getHostname(),
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      cores: navigator.hardwareConcurrency || 1,
      memory: (navigator as any).deviceMemory ? (navigator as any).deviceMemory * 1024 : 0,
      shares,
      networkInterfaces,
      browserInfo,
    }
  }

  // Detect local shares and storage
  private async detectLocalShares(): Promise<LocalShare[]> {
    const shares: LocalShare[] = []

    try {
      // Get storage quota information
      if ("storage" in navigator && "estimate" in navigator.storage) {
        this.storageQuota = await navigator.storage.estimate()
      }

      // Browser storage
      const browserStorage = await this.getBrowserStorageInfo()
      shares.push(...browserStorage)

      // Try to detect file system access if available
      if ("showDirectoryPicker" in window) {
        const fileSystemShares = await this.getFileSystemShares()
        shares.push(...fileSystemShares)
      }

      // Network drives detection (limited in browser)
      const networkShares = await this.detectNetworkShares()
      shares.push(...networkShares)

      // USB/Removable media detection
      if ("usb" in navigator) {
        const usbShares = await this.detectUSBShares()
        shares.push(...usbShares)
      }
    } catch (error) {
      console.error("Error detecting local shares:", error)
    }

    return shares
  }

  // Get browser storage information
  private async getBrowserStorageInfo(): Promise<LocalShare[]> {
    const shares: LocalShare[] = []

    try {
      // IndexedDB storage
      if ("indexedDB" in window) {
        const idbUsage = await this.getIndexedDBUsage()
        shares.push({
          id: "browser-indexeddb",
          name: "Browser IndexedDB",
          path: "/browser/indexeddb",
          type: "disk",
          size: this.storageQuota?.quota || 0,
          used: idbUsage,
          available: (this.storageQuota?.quota || 0) - idbUsage,
          filesystem: "IndexedDB",
          isShared: false,
          permissions: ["read", "write"],
          description: "Browser local database storage",
        })
      }

      // Local Storage
      const localStorageUsage = this.getLocalStorageUsage()
      shares.push({
        id: "browser-localstorage",
        name: "Browser Local Storage",
        path: "/browser/localstorage",
        type: "disk",
        size: 10 * 1024 * 1024, // ~10MB typical limit
        used: localStorageUsage,
        available: 10 * 1024 * 1024 - localStorageUsage,
        filesystem: "LocalStorage",
        isShared: false,
        permissions: ["read", "write"],
        description: "Browser local key-value storage",
      })

      // Session Storage
      const sessionStorageUsage = this.getSessionStorageUsage()
      shares.push({
        id: "browser-sessionstorage",
        name: "Browser Session Storage",
        path: "/browser/sessionstorage",
        type: "ram",
        size: 5 * 1024 * 1024, // ~5MB typical limit
        used: sessionStorageUsage,
        available: 5 * 1024 * 1024 - sessionStorageUsage,
        filesystem: "SessionStorage",
        isShared: false,
        permissions: ["read", "write"],
        description: "Browser session-based storage",
      })

      // Cache Storage
      if ("caches" in window) {
        const cacheUsage = await this.getCacheStorageUsage()
        shares.push({
          id: "browser-cache",
          name: "Browser Cache Storage",
          path: "/browser/cache",
          type: "disk",
          size: this.storageQuota?.quota || 0,
          used: cacheUsage,
          available: (this.storageQuota?.quota || 0) - cacheUsage,
          filesystem: "CacheAPI",
          isShared: false,
          permissions: ["read", "write"],
          description: "Browser cache storage for offline content",
        })
      }
    } catch (error) {
      console.error("Error getting browser storage info:", error)
    }

    return shares
  }

  // Get File System Access API shares (if available)
  private async getFileSystemShares(): Promise<LocalShare[]> {
    const shares: LocalShare[] = []

    try {
      // This would require user permission and interaction
      // We can only detect if the API is available
      shares.push({
        id: "filesystem-access",
        name: "File System Access",
        path: "/filesystem",
        type: "disk",
        size: 0,
        used: 0,
        available: 0,
        filesystem: "Native",
        isShared: false,
        permissions: ["read", "write"],
        description: "Native file system access (requires user permission)",
      })
    } catch (error) {
      console.error("Error accessing file system:", error)
    }

    return shares
  }

  // Detect network shares (limited in browser)
  private async detectNetworkShares(): Promise<LocalShare[]> {
    const shares: LocalShare[] = []

    try {
      // Check for common network share indicators
      const commonNetworkPaths = ["\\\\server\\share", "/mnt/network", "/Volumes/NetworkDrive", "Z:\\", "Y:\\", "X:\\"]

      // In browser, we can only simulate or detect based on URL patterns
      if (window.location.protocol === "file:" || window.location.hostname !== "localhost") {
        shares.push({
          id: "network-detected",
          name: "Network Location",
          path: window.location.origin,
          type: "network",
          size: 0,
          used: 0,
          available: 0,
          filesystem: "Network",
          isShared: true,
          permissions: ["read"],
          description: "Detected network-based access",
        })
      }
    } catch (error) {
      console.error("Error detecting network shares:", error)
    }

    return shares
  }

  // Detect USB/Removable media
  private async detectUSBShares(): Promise<LocalShare[]> {
    const shares: LocalShare[] = []

    try {
      if ("usb" in navigator) {
        const devices = await (navigator as any).usb.getDevices()

        devices.forEach((device: any, index: number) => {
          shares.push({
            id: `usb-${index}`,
            name: `USB Device ${index + 1}`,
            path: `/usb/device${index + 1}`,
            type: "removable",
            size: 0,
            used: 0,
            available: 0,
            filesystem: "USB",
            isShared: false,
            permissions: ["read", "write"],
            description: `USB device: ${device.productName || "Unknown"}`,
          })
        })
      }
    } catch (error) {
      console.error("Error detecting USB devices:", error)
    }

    return shares
  }

  // Get network interfaces information
  private async detectNetworkInterfaces(): Promise<NetworkInterface[]> {
    const interfaces: NetworkInterface[] = []

    try {
      // Use WebRTC to detect local IP addresses
      const localIPs = await this.getLocalIPAddresses()

      localIPs.forEach((ip, index) => {
        const isLoopback = ip.startsWith("127.") || ip === "::1"
        const isPrivate = this.isPrivateIP(ip)

        interfaces.push({
          name: isLoopback ? "Loopback" : isPrivate ? `Local Network ${index + 1}` : `Public Interface ${index + 1}`,
          ip,
          type: isLoopback ? "loopback" : isPrivate ? "ethernet" : "unknown",
          status: "up",
        })
      })

      // Add connection info
      if ("connection" in navigator) {
        const connection = (navigator as any).connection
        if (connection) {
          interfaces.push({
            name: "Active Connection",
            ip: "dynamic",
            type: connection.type === "wifi" ? "wifi" : "ethernet",
            status: navigator.onLine ? "up" : "down",
          })
        }
      }
    } catch (error) {
      console.error("Error detecting network interfaces:", error)
    }

    return interfaces
  }

  // Get local IP addresses using WebRTC
  private async getLocalIPAddresses(): Promise<string[]> {
    return new Promise((resolve) => {
      const ips: string[] = []
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      })

      pc.createDataChannel("")

      pc.onicecandidate = (ice) => {
        if (ice.candidate) {
          const candidate = ice.candidate.candidate
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
          if (ipMatch && !ips.includes(ipMatch[1])) {
            ips.push(ipMatch[1])
          }
        }
      }

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {})

      setTimeout(() => {
        pc.close()
        resolve(ips)
      }, 3000)
    })
  }

  // Check if IP is private
  private isPrivateIP(ip: string): boolean {
    const privateRanges = [/^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./, /^127\./]
    return privateRanges.some((range) => range.test(ip))
  }

  // Get browser information
  private getBrowserInfo(): BrowserInfo {
    const userAgent = navigator.userAgent
    let browserName = "Unknown"
    let browserVersion = "Unknown"
    let browserEngine = "Unknown"
    let osName = "Unknown"

    // Detect browser
    if (userAgent.includes("Chrome")) {
      browserName = "Chrome"
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown"
      browserEngine = "Blink"
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox"
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown"
      browserEngine = "Gecko"
    } else if (userAgent.includes("Safari")) {
      browserName = "Safari"
      browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Unknown"
      browserEngine = "WebKit"
    } else if (userAgent.includes("Edge")) {
      browserName = "Edge"
      browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || "Unknown"
      browserEngine = "EdgeHTML"
    }

    // Detect OS
    if (userAgent.includes("Windows")) {
      osName = "Windows"
    } else if (userAgent.includes("Mac")) {
      osName = "macOS"
    } else if (userAgent.includes("Linux")) {
      osName = "Linux"
    } else if (userAgent.includes("Android")) {
      osName = "Android"
    } else if (userAgent.includes("iOS")) {
      osName = "iOS"
    }

    return {
      name: browserName,
      version: browserVersion,
      engine: browserEngine,
      os: osName,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      cookieEnabled: navigator.cookieEnabled,
      javaEnabled: (navigator as any).javaEnabled ? (navigator as any).javaEnabled() : false,
      onlineStatus: navigator.onLine,
    }
  }

  // Get hostname
  private getHostname(): string {
    return window.location.hostname || "localhost"
  }

  // Calculate storage usage
  private async getIndexedDBUsage(): Promise<number> {
    try {
      if (this.storageQuota?.usage) {
        return this.storageQuota.usage
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  private getLocalStorageUsage(): number {
    try {
      let total = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
      return total
    } catch (error) {
      return 0
    }
  }

  private getSessionStorageUsage(): number {
    try {
      let total = 0
      for (const key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          total += sessionStorage[key].length + key.length
        }
      }
      return total
    } catch (error) {
      return 0
    }
  }

  private async getCacheStorageUsage(): Promise<number> {
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys()
        let totalSize = 0

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName)
          const requests = await cache.keys()

          for (const request of requests) {
            const response = await cache.match(request)
            if (response) {
              const blob = await response.blob()
              totalSize += blob.size
            }
          }
        }

        return totalSize
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  // Monitor storage changes
  async monitorStorageChanges(callback: (shares: LocalShare[]) => void): Promise<void> {
    const updateShares = async () => {
      const shares = await this.detectLocalShares()
      callback(shares)
    }

    // Initial update
    await updateShares()

    // Monitor storage events
    window.addEventListener("storage", updateShares)

    // Monitor online/offline status
    window.addEventListener("online", updateShares)
    window.addEventListener("offline", updateShares)

    // Periodic updates
    setInterval(updateShares, 30000) // Update every 30 seconds
  }
}

// Export singleton instance
export const localSystemScanner = new LocalSystemScanner()
