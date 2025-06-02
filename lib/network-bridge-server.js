/**
 * AI-IT Inc - Network Bridge Server (LIVE DATA ONLY)
 * Creator: Steven Chason
 * Company: AI-IT Inc
 * Address: 88 Perch St, Winterhaven FL 33881
 * Phone: 863-308-4979
 *
 * NOT FOR RESALE - Proprietary Software
 * © 2024 AI-IT Inc. All rights reserved.
 */

const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const { exec } = require("child_process")
const { promisify } = require("util")
const os = require("os")
const net = require("net")
const axios = require("axios")

const execAsync = promisify(exec)

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
})

const PORT = process.env.NETWORK_BRIDGE_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Live data storage
const liveDevices = new Map()
const liveCameras = new Map()
let liveSecurityEvents = []
let scanInProgress = false
let lastScanTime = null

// Professional startup banner
console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                          AI-IT Inc Network Bridge                            ║
║                              LIVE DATA MODE                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Creator: Steven Chason                                                      ║
║  Company: AI-IT Inc                                                          ║
║  Address: 88 Perch St, Winterhaven FL 33881                                 ║
║  Phone: 863-308-4979                                                         ║
║  Email: support@ai-itinc.com                                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  NOT FOR RESALE - Proprietary Software                                      ║
║  © 2024 AI-IT Inc. All rights reserved.                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
`)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "AI-IT Network Bridge",
    version: "2.0.0",
    mode: "LIVE DATA",
    creator: "Steven Chason",
    company: "AI-IT Inc",
    phone: "863-308-4979",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    networkInterfaces: Object.keys(os.networkInterfaces()),
  })
})

// LIVE Network scanning endpoint
app.get("/api/network/scan", async (req, res) => {
  if (scanInProgress) {
    return res.json({
      success: false,
      message: "Scan already in progress",
      devices: Array.from(liveDevices.values()),
    })
  }

  try {
    scanInProgress = true
    console.log("🔍 [AI-IT] Starting LIVE network scan...")

    const range = req.query.range || (await getLocalNetworkRange())
    const devices = await performLiveNetworkScan(range)

    // Update live devices
    liveDevices.clear()
    devices.forEach((device) => {
      liveDevices.set(device.ip, device)
    })

    lastScanTime = new Date()

    // Broadcast to all connected clients
    io.emit("scan-complete", {
      success: true,
      devices: Array.from(liveDevices.values()),
      scanTime: lastScanTime,
      devicesFound: devices.length,
    })

    console.log(`✅ [AI-IT] LIVE scan complete. Found ${devices.length} devices.`)

    res.json({
      success: true,
      devices: Array.from(liveDevices.values()),
      scanTime: lastScanTime,
      devicesFound: devices.length,
    })
  } catch (error) {
    console.error("❌ [AI-IT] Network scan error:", error)
    res.status(500).json({
      success: false,
      error: error.message,
      devices: Array.from(liveDevices.values()),
    })
  } finally {
    scanInProgress = false
  }
})

// LIVE Camera discovery endpoint
app.get("/api/cameras/discover", async (req, res) => {
  try {
    console.log("📹 [AI-IT] Starting LIVE camera discovery...")

    const range = req.query.range || (await getLocalNetworkRange())
    const cameras = await performLiveCameraDiscovery(range)

    // Update live cameras
    liveCameras.clear()
    cameras.forEach((camera) => {
      liveCameras.set(camera.ip, camera)
    })

    // Broadcast to all connected clients
    io.emit("cameras-discovered", {
      success: true,
      cameras: Array.from(liveCameras.values()),
      discoveryTime: new Date(),
      camerasFound: cameras.length,
    })

    console.log(`✅ [AI-IT] LIVE camera discovery complete. Found ${cameras.length} cameras.`)

    res.json({
      success: true,
      cameras: Array.from(liveCameras.values()),
      discoveryTime: new Date(),
      camerasFound: cameras.length,
    })
  } catch (error) {
    console.error("❌ [AI-IT] Camera discovery error:", error)
    res.status(500).json({
      success: false,
      error: error.message,
      cameras: Array.from(liveCameras.values()),
    })
  }
})

// LIVE Security status endpoint
app.get("/api/security/status", async (req, res) => {
  try {
    const securityStatus = await calculateLiveSecurityStatus()

    // Broadcast to all connected clients
    io.emit("security-status", {
      status: securityStatus,
      timestamp: new Date(),
    })

    res.json({
      success: true,
      status: securityStatus,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("❌ [AI-IT] Security status error:", error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// LIVE Security events endpoint
app.get("/api/security/events", async (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 50
  const events = liveSecurityEvents.slice(-limit).reverse()

  res.json({
    success: true,
    events,
    total: liveSecurityEvents.length,
  })
})

// LIVE Devices endpoint
app.get("/api/devices", async (req, res) => {
  res.json({
    success: true,
    devices: Array.from(liveDevices.values()),
    cameras: Array.from(liveCameras.values()),
    lastScan: lastScanTime,
    totalDevices: liveDevices.size,
    totalCameras: liveCameras.size,
  })
})

// LIVE Network scanning functions
async function getLocalNetworkRange() {
  try {
    const interfaces = os.networkInterfaces()
    for (const [name, addrs] of Object.entries(interfaces)) {
      for (const addr of addrs) {
        if (addr.family === "IPv4" && !addr.internal && addr.address.startsWith("192.168.")) {
          const parts = addr.address.split(".")
          return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`
        }
      }
    }
    return "192.168.1.0/24" // Default fallback
  } catch (error) {
    console.error("Error getting network range:", error)
    return "192.168.1.0/24"
  }
}

async function performLiveNetworkScan(range) {
  console.log(`🔍 [AI-IT] Scanning network range: ${range}`)

  const devices = []
  const ips = generateIPRange(range)

  // Limit concurrent scans to prevent network overload
  const batchSize = 20
  for (let i = 0; i < ips.length; i += batchSize) {
    const batch = ips.slice(i, i + batchSize)
    const batchPromises = batch.map((ip) => scanLiveDevice(ip))

    const results = await Promise.allSettled(batchPromises)

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        devices.push(result.value)
        console.log(`✅ [AI-IT] Found device: ${result.value.ip} (${result.value.hostname || "Unknown"})`)
      }
    }

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return devices
}

async function scanLiveDevice(ip) {
  try {
    const startTime = Date.now()

    // Real ping test
    const isReachable = await pingHost(ip)
    if (!isReachable) {
      return null
    }

    const responseTime = Date.now() - startTime

    // Get real hostname
    const hostname = await getHostname(ip)

    // Get real MAC address
    const mac = await getMacAddress(ip)

    // Get vendor from MAC
    const vendor = mac ? getVendorFromMac(mac) : "Unknown"

    // Scan real ports
    const openPorts = await scanPorts(ip, [22, 23, 53, 80, 135, 139, 443, 445, 554, 993, 995, 1723, 3389, 5900, 8080])

    // Identify services and device type
    const services = identifyServices(openPorts)
    const deviceType = identifyDeviceType(openPorts, hostname, vendor)
    const riskLevel = assessRiskLevel(openPorts, services, deviceType)

    const device = {
      ip,
      hostname: hostname || ip,
      mac: mac || "Unknown",
      vendor,
      deviceType,
      status: "online",
      ports: openPorts,
      services,
      lastSeen: new Date().toISOString(),
      responseTime,
      riskLevel,
      capabilities: identifyCapabilities(openPorts, services),
      discoveredAt: new Date().toISOString(),
    }

    // Add security event for new device
    addSecurityEvent("device_discovered", `New device discovered: ${device.hostname} (${device.ip})`, "info", {
      device,
    })

    return device
  } catch (error) {
    console.error(`Error scanning ${ip}:`, error)
    return null
  }
}

async function pingHost(ip) {
  try {
    const platform = os.platform()
    let command

    if (platform === "win32") {
      command = `ping -n 1 -w 3000 ${ip}`
    } else {
      command = `ping -c 1 -W 3 ${ip}`
    }

    const { stdout } = await execAsync(command)

    if (platform === "win32") {
      return stdout.includes("TTL=") || stdout.includes("time<")
    } else {
      return stdout.includes("1 received") || stdout.includes("1 packets received")
    }
  } catch (error) {
    return false
  }
}

async function getHostname(ip) {
  try {
    const platform = os.platform()
    let command

    if (platform === "win32") {
      command = `nslookup ${ip}`
    } else {
      command = `dig -x ${ip} +short`
    }

    const { stdout } = await execAsync(command)

    if (platform === "win32") {
      const match = stdout.match(/Name:\s+(.+)/i)
      return match ? match[1].trim() : undefined
    } else {
      const hostname = stdout.trim()
      return hostname && !hostname.includes("NXDOMAIN") ? hostname : undefined
    }
  } catch (error) {
    return undefined
  }
}

async function getMacAddress(ip) {
  try {
    const platform = os.platform()
    let command

    if (platform === "win32") {
      command = `arp -a ${ip}`
    } else {
      command = `arp -n ${ip}`
    }

    const { stdout } = await execAsync(command)
    const macMatch = stdout.match(/([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}/)
    return macMatch ? macMatch[0] : undefined
  } catch (error) {
    return undefined
  }
}

function getVendorFromMac(mac) {
  const oui = mac.replace(/[:-]/g, "").substring(0, 6).toUpperCase()

  const vendors = {
    "001B63": "Apple",
    "00E04C": "Realtek",
    "001E58": "WistronNeweb",
    "0050F2": "Microsoft",
    "001CF0": "Liverpool",
    "00D0C9": "Intel",
    "000C29": "VMware",
    "005056": "VMware",
    "0003FF": "Microsoft",
    "001DD8": "Hewlett Packard",
    "002608": "Hewlett Packard Enterprise",
    "00259C": "Hikvision",
    "001E06": "Dahua",
    "00408C": "Axis Communications",
    "002608": "Foscam",
  }

  return vendors[oui] || "Unknown"
}

async function scanPorts(ip, ports) {
  const openPorts = []
  const timeout = 3000

  // Scan ports in smaller batches
  const batchSize = 5
  for (let i = 0; i < ports.length; i += batchSize) {
    const batch = ports.slice(i, i + batchSize)
    const batchPromises = batch.map((port) => checkPort(ip, port, timeout))

    const results = await Promise.allSettled(batchPromises)

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        openPorts.push(batch[index])
      }
    })

    // Small delay between port batches
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  return openPorts
}

async function checkPort(ip, port, timeout) {
  return new Promise((resolve) => {
    const socket = new net.Socket()

    const timer = setTimeout(() => {
      socket.destroy()
      resolve(false)
    }, timeout)

    socket.connect(port, ip, () => {
      clearTimeout(timer)
      socket.destroy()
      resolve(true)
    })

    socket.on("error", () => {
      clearTimeout(timer)
      resolve(false)
    })
  })
}

// LIVE Camera discovery functions
async function performLiveCameraDiscovery(range) {
  console.log(`📹 [AI-IT] Discovering cameras in range: ${range}`)

  const cameras = []
  const ips = generateIPRange(range)

  // Camera-specific ports
  const cameraPorts = [80, 443, 554, 8080, 8000, 8443, 37777, 34567]

  const batchSize = 15
  for (let i = 0; i < ips.length; i += batchSize) {
    const batch = ips.slice(i, i + batchSize)
    const batchPromises = batch.map((ip) => scanForLiveCamera(ip, cameraPorts))

    const results = await Promise.allSettled(batchPromises)

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        cameras.push(result.value)
        console.log(`📹 [AI-IT] Found camera: ${result.value.brand} at ${result.value.ip}`)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return cameras
}

async function scanForLiveCamera(ip, cameraPorts) {
  try {
    // Check if camera ports are open
    const openPorts = []
    for (const port of cameraPorts) {
      const isOpen = await checkPort(ip, port, 2000)
      if (isOpen) {
        openPorts.push(port)
      }
    }

    if (openPorts.length === 0) {
      return null
    }

    // Try to identify camera brand and model
    const cameraInfo = await identifyLiveCamera(ip, openPorts)
    if (!cameraInfo) {
      return null
    }

    // Test ONVIF support
    const onvifSupport = await testOnvifSupport(ip)

    const camera = {
      ip,
      brand: cameraInfo.brand,
      model: cameraInfo.model || "Unknown Model",
      firmware: cameraInfo.firmware || "Unknown",
      capabilities: cameraInfo.capabilities,
      rtspUrls: generateRtspUrls(ip, cameraInfo.brand),
      webInterface: `http://${ip}`,
      status: "online",
      lastSeen: new Date().toISOString(),
      ports: openPorts,
      onvifSupport,
      httpsSupport: openPorts.includes(443),
      ptzSupport: cameraInfo.capabilities.includes("PTZ Control"),
      riskLevel: assessCameraRisk(cameraInfo, openPorts),
      discoveredAt: new Date().toISOString(),
    }

    // Add security event for new camera
    addSecurityEvent("camera_discovered", `New IP camera discovered: ${camera.brand} at ${camera.ip}`, "info", {
      camera,
    })

    return camera
  } catch (error) {
    console.error(`Error scanning camera at ${ip}:`, error)
    return null
  }
}

async function identifyLiveCamera(ip, ports) {
  const protocols = ["http", "https"]
  const testPorts = ports.filter((p) => [80, 443, 8080, 8000].includes(p))

  for (const protocol of protocols) {
    for (const port of testPorts) {
      if ((protocol === "https" && port !== 443 && port !== 8443) || (protocol === "http" && port === 443)) {
        continue
      }

      try {
        const baseUrl = `${protocol}://${ip}:${port}`

        const response = await axios.get(baseUrl, {
          timeout: 5000,
          validateStatus: () => true,
          headers: {
            "User-Agent": "AI-IT Security Scanner",
          },
          maxRedirects: 3,
        })

        const content = response.data.toLowerCase()
        const headers = JSON.stringify(response.headers).toLowerCase()

        // Brand detection patterns
        const brandPatterns = {
          hikvision: ["/isapi/", "hikvision", "ds-", "ivms", "webcomponents"],
          dahua: ["/cgi-bin/magicbox.cgi", "dahua", "dh-", "netsdk"],
          axis: ["/axis-cgi/", "axis", "vapix"],
          foscam: ["/cgi-bin/cgiproxy.fcgi", "foscam", "fi8"],
          uniview: ["/cgi-bin/main-cgi", "uniview", "ipc"],
          reolink: ["reolink", "/cgi-bin/api.cgi"],
          amcrest: ["amcrest", "/cgi-bin/snapshot.cgi"],
        }

        for (const [brand, patterns] of Object.entries(brandPatterns)) {
          for (const pattern of patterns) {
            if (content.includes(pattern) || headers.includes(pattern)) {
              return {
                brand: brand.charAt(0).toUpperCase() + brand.slice(1),
                model: extractModel(content, brand),
                firmware: extractFirmware(content),
                capabilities: extractCapabilities(content),
              }
            }
          }
        }

        // Generic camera detection
        if (
          content.includes("camera") ||
          content.includes("ipcam") ||
          content.includes("surveillance") ||
          content.includes("nvr") ||
          content.includes("video")
        ) {
          return {
            brand: "Generic",
            capabilities: ["Video Streaming"],
          }
        }
      } catch (error) {
        continue
      }
    }
  }

  return null
}

async function testOnvifSupport(ip) {
  const onvifPorts = [80, 8080, 8000]
  const onvifPaths = ["/onvif/device_service", "/onvif/Device"]

  for (const port of onvifPorts) {
    for (const path of onvifPaths) {
      try {
        const response = await axios.post(
          `http://${ip}:${port}${path}`,
          `<?xml version="1.0" encoding="UTF-8"?>
           <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
             <soap:Body>
               <tds:GetCapabilities xmlns:tds="http://www.onvif.org/ver10/device/wsdl"/>
             </soap:Body>
           </soap:Envelope>`,
          {
            timeout: 3000,
            headers: {
              "Content-Type": "application/soap+xml",
              SOAPAction: "http://www.onvif.org/ver10/device/wsdl/GetCapabilities",
            },
          },
        )

        if (response.data.includes("onvif") || response.data.includes("Capabilities")) {
          return true
        }
      } catch (error) {
        continue
      }
    }
  }

  return false
}

// Utility functions
function generateIPRange(range) {
  const ips = []

  if (range.includes("/")) {
    const [network, prefixLength] = range.split("/")
    const prefix = Number.parseInt(prefixLength)
    const [a, b, c, d] = network.split(".").map(Number)

    if (prefix === 24) {
      for (let i = 1; i < 255; i++) {
        ips.push(`${a}.${b}.${c}.${i}`)
      }
    }
  } else if (range.includes("-")) {
    const [start, end] = range.split("-")
    const startParts = start.split(".").map(Number)
    const endParts = end.split(".").map(Number)

    const startLast = startParts[3]
    const endLast = endParts[3]

    for (let i = startLast; i <= endLast; i++) {
      ips.push(`${startParts[0]}.${startParts[1]}.${startParts[2]}.${i}`)
    }
  } else {
    ips.push(range)
  }

  return ips
}

function identifyServices(ports) {
  const services = []
  const serviceMap = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    135: "RPC",
    139: "NetBIOS",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    554: "RTSP",
    993: "IMAPS",
    995: "POP3S",
    1723: "PPTP",
    3389: "RDP",
    5900: "VNC",
    8080: "HTTP-Alt",
  }

  for (const port of ports) {
    if (serviceMap[port]) {
      services.push(serviceMap[port])
    }
  }

  return services
}

function identifyDeviceType(ports, hostname, vendor) {
  // Camera detection
  if (ports.includes(554) || ports.includes(37777)) {
    return "IP Camera"
  }

  if (
    (ports.includes(80) || ports.includes(443)) &&
    (hostname?.toLowerCase().includes("camera") ||
      hostname?.toLowerCase().includes("ipc") ||
      vendor?.toLowerCase().includes("hikvision") ||
      vendor?.toLowerCase().includes("dahua") ||
      vendor?.toLowerCase().includes("axis"))
  ) {
    return "IP Camera"
  }

  // Router/Gateway detection
  if (ports.includes(80) && ports.includes(443) && (ports.includes(22) || ports.includes(23))) {
    return "Router/Gateway"
  }

  // Server detection
  if (ports.includes(22) && (ports.includes(80) || ports.includes(443))) {
    return "Server"
  }

  // Windows computer
  if (ports.includes(135) && ports.includes(139) && ports.includes(445)) {
    return "Windows Computer"
  }

  // Printer detection
  if (ports.includes(631) || ports.includes(9100)) {
    return "Printer"
  }

  // NAS detection
  if (ports.includes(139) && ports.includes(445) && ports.includes(548)) {
    return "NAS Device"
  }

  return "Unknown Device"
}

function identifyCapabilities(ports, services) {
  const capabilities = []

  if (services.includes("HTTP") || services.includes("HTTPS")) {
    capabilities.push("Web Interface")
  }

  if (services.includes("SSH")) {
    capabilities.push("Remote Shell")
  }

  if (services.includes("RDP")) {
    capabilities.push("Remote Desktop")
  }

  if (services.includes("VNC")) {
    capabilities.push("VNC Access")
  }

  if (services.includes("SMB")) {
    capabilities.push("File Sharing")
  }

  if (services.includes("FTP")) {
    capabilities.push("File Transfer")
  }

  if (services.includes("RTSP")) {
    capabilities.push("Video Streaming")
  }

  return capabilities
}

function assessRiskLevel(ports, services, deviceType) {
  let riskScore = 0

  // High-risk services
  if (services.includes("Telnet")) riskScore += 3
  if (services.includes("FTP")) riskScore += 2
  if (services.includes("RDP")) riskScore += 2
  if (services.includes("VNC")) riskScore += 2

  // Medium-risk services
  if (services.includes("SSH")) riskScore += 1
  if (services.includes("SMB")) riskScore += 1

  // Device-specific risks
  if (deviceType === "IP Camera") riskScore += 1
  if (deviceType === "Router/Gateway") riskScore += 2

  // Port-based risks
  if (ports.includes(23)) riskScore += 3 // Telnet
  if (ports.includes(21)) riskScore += 2 // FTP
  if (ports.includes(135)) riskScore += 1 // RPC

  if (riskScore >= 5) return "high"
  if (riskScore >= 2) return "medium"
  return "low"
}

function extractModel(content, brand) {
  const modelPatterns = {
    hikvision: [/DS-[\w\d-]+/i, /model["\s:]+([^"<>\s]+)/i],
    dahua: [/DH-[\w\d-]+/i, /IPC-[\w\d-]+/i],
    axis: [/AXIS\s+[\w\d-]+/i],
    foscam: [/FI[\w\d]+/i, /R[\d]+/i],
  }

  const patterns = modelPatterns[brand] || []
  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) {
      return match[0] || match[1]
    }
  }

  return undefined
}

function extractFirmware(content) {
  const firmwarePatterns = [/firmware["\s:]+([^"<>\s]+)/i, /version["\s:]+([^"<>\s]+)/i, /build["\s:]+([^"<>\s]+)/i]

  for (const pattern of firmwarePatterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return undefined
}

function extractCapabilities(content) {
  const capabilities = ["Video Streaming"]

  if (content.includes("ptz") || content.includes("pan") || content.includes("tilt")) {
    capabilities.push("PTZ Control")
  }

  if (content.includes("audio") || content.includes("microphone")) {
    capabilities.push("Audio Recording")
  }

  if (content.includes("motion") || content.includes("detection")) {
    capabilities.push("Motion Detection")
  }

  if (content.includes("night") || content.includes("infrared") || content.includes("ir")) {
    capabilities.push("Night Vision")
  }

  if (content.includes("zoom") || content.includes("optical")) {
    capabilities.push("Optical Zoom")
  }

  if (content.includes("onvif")) {
    capabilities.push("ONVIF Support")
  }

  return capabilities
}

function generateRtspUrls(ip, brand) {
  const rtspPatterns = {
    hikvision: [
      `rtsp://${ip}:554/Streaming/Channels/101`,
      `rtsp://${ip}:554/Streaming/Channels/102`,
      `rtsp://${ip}:554/h264/ch1/main/av_stream`,
      `rtsp://${ip}:554/h264/ch1/sub/av_stream`,
    ],
    dahua: [
      `rtsp://${ip}:554/cam/realmonitor?channel=1&subtype=0`,
      `rtsp://${ip}:554/cam/realmonitor?channel=1&subtype=1`,
      `rtsp://${ip}:554/live/ch1`,
      `rtsp://${ip}:554/live/ch2`,
    ],
    axis: [
      `rtsp://${ip}:554/axis-media/media.amp`,
      `rtsp://${ip}:554/axis-media/media.amp?videocodec=h264`,
      `rtsp://${ip}:554/live/ch1`,
    ],
    foscam: [`rtsp://${ip}:554/videoMain`, `rtsp://${ip}:554/videoSub`, `rtsp://${ip}:88/videoMain`],
    uniview: [`rtsp://${ip}:554/media/video1`, `rtsp://${ip}:554/media/video2`],
    reolink: [`rtsp://${ip}:554/h264Preview_01_main`, `rtsp://${ip}:554/h264Preview_01_sub`],
    amcrest: [`rtsp://${ip}:554/cam/realmonitor?channel=1&subtype=0`],
  }

  return (
    rtspPatterns[brand.toLowerCase()] || [
      `rtsp://${ip}:554/live`,
      `rtsp://${ip}:554/stream1`,
      `rtsp://${ip}:554/video1`,
    ]
  )
}

function assessCameraRisk(cameraInfo, ports) {
  let riskScore = 0

  // No HTTPS support
  if (!ports.includes(443)) riskScore += 2

  // Default credentials likely
  if (["Generic", "Unknown"].includes(cameraInfo.brand)) riskScore += 2

  // Telnet port open
  if (ports.includes(23)) riskScore += 3

  // Multiple web ports (potential backdoors)
  const webPorts = ports.filter((p) => [80, 8080, 8000, 8443].includes(p))
  if (webPorts.length > 2) riskScore += 1

  // Old firmware
  if (!cameraInfo.firmware) riskScore += 1

  if (riskScore >= 5) return "high"
  if (riskScore >= 2) return "medium"
  return "low"
}

// LIVE Security monitoring functions
async function calculateLiveSecurityStatus() {
  const devices = Array.from(liveDevices.values())
  const cameras = Array.from(liveCameras.values())

  // Calculate real security metrics
  const totalDevices = devices.length + cameras.length
  const highRiskDevices = [...devices, ...cameras].filter((d) => d.riskLevel === "high").length
  const mediumRiskDevices = [...devices, ...cameras].filter((d) => d.riskLevel === "medium").length

  // Calculate security score based on real data
  let securityScore = 100
  securityScore -= highRiskDevices * 15 // High risk devices reduce score significantly
  securityScore -= mediumRiskDevices * 5 // Medium risk devices reduce score moderately
  securityScore = Math.max(0, Math.min(100, securityScore))

  // Determine network health
  let networkHealth = "Excellent"
  if (securityScore < 60) networkHealth = "Poor"
  else if (securityScore < 80) networkHealth = "Fair"
  else if (securityScore < 95) networkHealth = "Good"

  // Generate real alerts based on discovered devices
  const alerts = []
  let alertId = 1

  // Check for high-risk devices
  for (const device of [...devices, ...cameras]) {
    if (device.riskLevel === "high") {
      alerts.push({
        id: `alert_${alertId++}`,
        severity: "high",
        message: `High-risk device detected: ${device.hostname || device.ip} (${device.deviceType || device.brand})`,
        timestamp: new Date().toISOString(),
        resolved: false,
        deviceIp: device.ip,
      })
    }

    // Check for insecure services
    if (device.services?.includes("Telnet")) {
      alerts.push({
        id: `alert_${alertId++}`,
        severity: "high",
        message: `Insecure Telnet service detected on ${device.hostname || device.ip}`,
        timestamp: new Date().toISOString(),
        resolved: false,
        deviceIp: device.ip,
      })
    }

    if (device.services?.includes("FTP")) {
      alerts.push({
        id: `alert_${alertId++}`,
        severity: "medium",
        message: `Unencrypted FTP service detected on ${device.hostname || device.ip}`,
        timestamp: new Date().toISOString(),
        resolved: false,
        deviceIp: device.ip,
      })
    }
  }

  // Check for cameras without HTTPS
  for (const camera of cameras) {
    if (!camera.httpsSupport) {
      alerts.push({
        id: `alert_${alertId++}`,
        severity: "medium",
        message: `Camera ${camera.ip} does not support HTTPS encryption`,
        timestamp: new Date().toISOString(),
        resolved: false,
        deviceIp: camera.ip,
      })
    }
  }

  return {
    overallScore: Math.round(securityScore),
    threatsDetected: highRiskDevices,
    devicesMonitored: totalDevices,
    lastScan: lastScanTime?.toISOString() || null,
    networkHealth,
    alerts,
    riskDistribution: {
      high: highRiskDevices,
      medium: mediumRiskDevices,
      low: totalDevices - highRiskDevices - mediumRiskDevices,
    },
    deviceBreakdown: {
      totalDevices: devices.length,
      totalCameras: cameras.length,
      onlineDevices: devices.filter((d) => d.status === "online").length,
      onlineCameras: cameras.filter((c) => c.status === "online").length,
    },
  }
}

function addSecurityEvent(type, message, severity, details = {}) {
  const event = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    severity,
    timestamp: new Date().toISOString(),
    details,
  }

  liveSecurityEvents.push(event)

  // Keep only last 1000 events
  if (liveSecurityEvents.length > 1000) {
    liveSecurityEvents = liveSecurityEvents.slice(-1000)
  }

  // Broadcast security event to all connected clients
  io.emit("security-event", event)

  console.log(`🛡️ [AI-IT] Security Event: ${message}`)
}

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log(`🔌 [AI-IT] Client connected: ${socket.id}`)

  // Send welcome message
  socket.emit("connected", {
    message: "Connected to AI-IT Network Bridge",
    service: "Live Network Monitoring",
    creator: "Steven Chason",
    company: "AI-IT Inc",
    timestamp: new Date().toISOString(),
  })

  // Handle room joining
  socket.on("join-network-monitor", () => {
    socket.join("network-monitor")
    socket.emit("joined-room", { room: "network-monitor" })
    console.log(`📡 [AI-IT] Client ${socket.id} joined network monitoring`)

    // Send current network status
    socket.emit("network-status", {
      devices: Array.from(liveDevices.values()),
      lastScan: lastScanTime,
      timestamp: new Date().toISOString(),
    })
  })

  socket.on("join-security-monitor", () => {
    socket.join("security-monitor")
    socket.emit("joined-room", { room: "security-monitor" })
    console.log(`🛡️ [AI-IT] Client ${socket.id} joined security monitoring`)
  })

  // Handle scan requests
  socket.on("request-network-scan", async (data) => {
    console.log(`🔍 [AI-IT] Scan requested by client ${socket.id}`)

    if (scanInProgress) {
      socket.emit("scan-result", {
        success: false,
        message: "Scan already in progress",
        devices: Array.from(liveDevices.values()),
      })
      return
    }

    try {
      scanInProgress = true
      const range = data.range || (await getLocalNetworkRange())
      const devices = await performLiveNetworkScan(range)

      liveDevices.clear()
      devices.forEach((device) => {
        liveDevices.set(device.ip, device)
      })

      lastScanTime = new Date()

      // Broadcast to all clients in network-monitor room
      io.to("network-monitor").emit("scan-complete", {
        success: true,
        devices: Array.from(liveDevices.values()),
        scanTime: lastScanTime,
        devicesFound: devices.length,
      })

      socket.emit("scan-result", {
        success: true,
        devices: Array.from(liveDevices.values()),
        scanTime: lastScanTime,
        devicesFound: devices.length,
      })
    } catch (error) {
      console.error("❌ [AI-IT] Scan error:", error)
      socket.emit("scan-result", {
        success: false,
        error: error.message,
        devices: Array.from(liveDevices.values()),
      })
    } finally {
      scanInProgress = false
    }
  })

  socket.on("disconnect", () => {
    console.log(`🔌 [AI-IT] Client disconnected: ${socket.id}`)
  })
})

// Background monitoring (every 5 minutes for live data)
setInterval(
  async () => {
    if (!scanInProgress) {
      try {
        console.log("🔄 [AI-IT] Running background network scan...")
        const range = await getLocalNetworkRange()
        const devices = await performLiveNetworkScan(range)

        // Update devices and broadcast changes
        const previousDeviceCount = liveDevices.size
        liveDevices.clear()
        devices.forEach((device) => {
          liveDevices.set(device.ip, device)
        })

        lastScanTime = new Date()

        // Broadcast to all connected clients
        io.to("network-monitor").emit("network-status", {
          devices: Array.from(liveDevices.values()),
          lastScan: lastScanTime,
          timestamp: new Date().toISOString(),
          backgroundScan: true,
        })

        // Add security event if device count changed
        if (devices.length !== previousDeviceCount) {
          addSecurityEvent(
            "network_change",
            `Network topology changed: ${devices.length} devices (was ${previousDeviceCount})`,
            "info",
            { newCount: devices.length, previousCount: previousDeviceCount },
          )
        }

        // Update security status
        const securityStatus = await calculateLiveSecurityStatus()
        io.to("security-monitor").emit("security-status", {
          status: securityStatus,
          timestamp: new Date(),
          backgroundUpdate: true,
        })
      } catch (error) {
        console.error("❌ [AI-IT] Background scan error:", error)
      }
    }
  },
  5 * 60 * 1000,
) // 5 minutes

// Start server
server.listen(PORT, () => {
  console.log(`
🚀 AI-IT Network Bridge Server Started (LIVE DATA MODE)
🌐 Service available at: http://localhost:${PORT}
📊 Health check endpoint: http://localhost:${PORT}/health
🔍 Network scanning: LIVE
📹 Camera discovery: LIVE  
🛡️ Security monitoring: LIVE
📞 Support: Steven Chason - 863-308-4979

Press Ctrl+C to stop the service
`)

  // Initial network scan on startup
  setTimeout(async () => {
    try {
      console.log("🔍 [AI-IT] Performing initial network scan...")
      const range = await getLocalNetworkRange()
      const devices = await performLiveNetworkScan(range)

      devices.forEach((device) => {
        liveDevices.set(device.ip, device)
      })

      lastScanTime = new Date()

      console.log(`✅ [AI-IT] Initial scan complete. Found ${devices.length} devices.`)

      // Discover cameras
      const cameras = await performLiveCameraDiscovery(range)
      cameras.forEach((camera) => {
        liveCameras.set(camera.ip, camera)
      })

      console.log(`✅ [AI-IT] Camera discovery complete. Found ${cameras.length} cameras.`)

      addSecurityEvent("system_startup", "AI-IT Network Bridge started with live monitoring", "info", {
        devicesFound: devices.length,
        camerasFound: cameras.length,
      })
    } catch (error) {
      console.error("❌ [AI-IT] Initial scan error:", error)
    }
  }, 2000)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 [AI-IT] Shutting down Network Bridge...")
  addSecurityEvent("system_shutdown", "AI-IT Network Bridge shutting down", "info")
  server.close(() => {
    console.log("✅ [AI-IT] Network Bridge stopped gracefully")
    process.exit(0)
  })
})

process.on("SIGTERM", () => {
  console.log("\n🛑 [AI-IT] Received SIGTERM, shutting down...")
  server.close(() => {
    console.log("✅ [AI-IT] Network Bridge stopped")
    process.exit(0)
  })
})
