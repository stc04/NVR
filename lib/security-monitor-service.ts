/**
 * AI-IT Inc - Security Monitor Service
 * Creator: Steven Chason
 * Company: AI-IT Inc
 * Address: 88 Perch St, Winterhaven FL 33881
 * Phone: 863-308-4979
 *
 * NOT FOR RESALE - Proprietary Software
 * © 2024 AI-IT Inc. All rights reserved.
 */

export interface SecurityEvent {
  id: string
  type:
    | "intrusion_attempt"
    | "unauthorized_access"
    | "suspicious_activity"
    | "vulnerability_detected"
    | "device_offline"
    | "configuration_change"
  severity: "low" | "medium" | "high" | "critical"
  source: string
  target?: string
  description: string
  timestamp: Date
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
  evidence?: string[]
  recommendations?: string[]
}

export interface SecurityStatus {
  overallScore: number // 0-100
  threatLevel: "low" | "medium" | "high" | "critical"
  activeThreats: number
  vulnerabilities: number
  lastScanTime: Date
  networkHealth: {
    devicesOnline: number
    devicesOffline: number
    unauthorizedDevices: number
    suspiciousActivity: number
  }
  recommendations: string[]
}

export interface ThreatIntelligence {
  id: string
  type: "malware" | "botnet" | "scanning" | "brute_force" | "ddos"
  source: string
  confidence: number // 0-100
  description: string
  indicators: string[]
  firstSeen: Date
  lastSeen: Date
  active: boolean
}

class SecurityMonitorService {
  private events = new Map<string, SecurityEvent>()
  private threats = new Map<string, ThreatIntelligence>()
  private monitoringRules: SecurityRule[] = []
  private lastSecurityScan = new Date()

  constructor() {
    this.initializeDefaultRules()
  }

  async getSecurityStatus(): Promise<SecurityStatus> {
    const events = Array.from(this.events.values())
    const activeEvents = events.filter((e) => !e.resolved)
    const recentEvents = events.filter(
      (e) => e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    )

    // Calculate overall security score
    const overallScore = this.calculateSecurityScore(activeEvents, recentEvents)

    // Determine threat level
    const threatLevel = this.determineThreatLevel(overallScore, activeEvents)

    // Count vulnerabilities
    const vulnerabilities = activeEvents.filter((e) => e.type === "vulnerability_detected").length

    // Network health metrics
    const networkHealth = await this.getNetworkHealth()

    // Generate recommendations
    const recommendations = this.generateSecurityRecommendations(activeEvents, networkHealth)

    return {
      overallScore,
      threatLevel,
      activeThreats: activeEvents.filter((e) => e.severity === "high" || e.severity === "critical").length,
      vulnerabilities,
      lastScanTime: this.lastSecurityScan,
      networkHealth,
      recommendations,
    }
  }

  async createSecurityEvent(eventData: {
    type: SecurityEvent["type"]
    severity: SecurityEvent["severity"]
    source: string
    target?: string
    description: string
    evidence?: string[]
  }): Promise<string> {
    const eventId = this.generateEventId()

    const event: SecurityEvent = {
      id: eventId,
      type: eventData.type,
      severity: eventData.severity,
      source: eventData.source,
      target: eventData.target,
      description: eventData.description,
      timestamp: new Date(),
      resolved: false,
      evidence: eventData.evidence || [],
      recommendations: this.generateEventRecommendations(eventData.type, eventData.severity),
    }

    this.events.set(eventId, event)

    console.log(`[AI-IT Security Monitor] Created ${eventData.severity} security event: ${eventData.description}`)

    // Auto-escalate critical events
    if (eventData.severity === "critical") {
      await this.escalateEvent(eventId)
    }

    return eventId
  }

  async resolveSecurityEvent(eventId: string, resolvedBy: string, resolution?: string): Promise<void> {
    const event = this.events.get(eventId)
    if (!event) {
      throw new Error(`Security event not found: ${eventId}`)
    }

    event.resolved = true
    event.resolvedBy = resolvedBy
    event.resolvedAt = new Date()

    if (resolution) {
      event.evidence = event.evidence || []
      event.evidence.push(`Resolution: ${resolution}`)
    }

    console.log(`[AI-IT Security Monitor] Resolved security event: ${eventId}`)
  }

  async getRecentEvents(limit = 50): Promise<SecurityEvent[]> {
    const events = Array.from(this.events.values())
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
  }

  async getActiveEvents(): Promise<SecurityEvent[]> {
    return Array.from(this.events.values()).filter((event) => !event.resolved)
  }

  async getEventsByType(type: SecurityEvent["type"]): Promise<SecurityEvent[]> {
    return Array.from(this.events.values()).filter((event) => event.type === type)
  }

  async getEventsBySeverity(severity: SecurityEvent["severity"]): Promise<SecurityEvent[]> {
    return Array.from(this.events.values()).filter((event) => event.severity === severity)
  }

  async addThreatIntelligence(threatData: {
    type: ThreatIntelligence["type"]
    source: string
    confidence: number
    description: string
    indicators: string[]
  }): Promise<string> {
    const threatId = this.generateThreatId()

    const threat: ThreatIntelligence = {
      id: threatId,
      type: threatData.type,
      source: threatData.source,
      confidence: threatData.confidence,
      description: threatData.description,
      indicators: threatData.indicators,
      firstSeen: new Date(),
      lastSeen: new Date(),
      active: true,
    }

    this.threats.set(threatId, threat)

    console.log(`[AI-IT Security Monitor] Added threat intelligence: ${threatData.description}`)
    return threatId
  }

  async scanForThreats(networkData: any[]): Promise<SecurityEvent[]> {
    const detectedEvents: SecurityEvent[] = []
    this.lastSecurityScan = new Date()

    for (const device of networkData) {
      // Check for unauthorized devices
      if (!device.authorized && device.status === "online") {
        const eventId = await this.createSecurityEvent({
          type: "unauthorized_access",
          severity: "medium",
          source: device.ip,
          description: `Unauthorized device detected: ${device.ip} (${device.deviceType})`,
        })

        const event = this.events.get(eventId)
        if (event) detectedEvents.push(event)
      }

      // Check for high-risk devices
      if (device.riskLevel === "high") {
        const eventId = await this.createSecurityEvent({
          type: "vulnerability_detected",
          severity: "high",
          source: device.ip,
          description: `High-risk device detected: ${device.ip}. Immediate security review required.`,
        })

        const event = this.events.get(eventId)
        if (event) detectedEvents.push(event)
      }

      // Check for suspicious ports
      const suspiciousPorts = [23, 21, 135, 139] // Telnet, FTP, RPC, NetBIOS
      const openSuspiciousPorts = device.ports?.filter((port: number) => suspiciousPorts.includes(port)) || []

      if (openSuspiciousPorts.length > 0) {
        const eventId = await this.createSecurityEvent({
          type: "suspicious_activity",
          severity: "medium",
          source: device.ip,
          description: `Suspicious ports detected on ${device.ip}: ${openSuspiciousPorts.join(", ")}`,
        })

        const event = this.events.get(eventId)
        if (event) detectedEvents.push(event)
      }

      // Check for devices that have gone offline
      if (device.status === "offline" && device.lastSeen) {
        const timeSinceLastSeen = Date.now() - new Date(device.lastSeen).getTime()
        if (timeSinceLastSeen > 60 * 60 * 1000) {
          // 1 hour
          const eventId = await this.createSecurityEvent({
            type: "device_offline",
            severity: "low",
            source: device.ip,
            description: `Device offline for extended period: ${device.ip}`,
          })

          const event = this.events.get(eventId)
          if (event) detectedEvents.push(event)
        }
      }
    }

    console.log(`[AI-IT Security Monitor] Threat scan complete. Found ${detectedEvents.length} new security events.`)
    return detectedEvents
  }

  private calculateSecurityScore(activeEvents: SecurityEvent[], recentEvents: SecurityEvent[]): number {
    let score = 100

    // Deduct points for active events
    for (const event of activeEvents) {
      switch (event.severity) {
        case "critical":
          score -= 20
          break
        case "high":
          score -= 10
          break
        case "medium":
          score -= 5
          break
        case "low":
          score -= 2
          break
      }
    }

    // Deduct points for recent event frequency
    if (recentEvents.length > 10) {
      score -= Math.min(20, (recentEvents.length - 10) * 2)
    }

    return Math.max(0, score)
  }

  private determineThreatLevel(score: number, activeEvents: SecurityEvent[]): "low" | "medium" | "high" | "critical" {
    const criticalEvents = activeEvents.filter((e) => e.severity === "critical").length
    const highEvents = activeEvents.filter((e) => e.severity === "high").length

    if (criticalEvents > 0 || score < 30) return "critical"
    if (highEvents > 2 || score < 50) return "high"
    if (score < 70) return "medium"
    return "low"
  }

  private async getNetworkHealth(): Promise<SecurityStatus["networkHealth"]> {
    // This would integrate with the device manager and network scanner
    // For now, return mock data
    return {
      devicesOnline: 15,
      devicesOffline: 2,
      unauthorizedDevices: 1,
      suspiciousActivity: 3,
    }
  }

  private generateSecurityRecommendations(activeEvents: SecurityEvent[], networkHealth: any): string[] {
    const recommendations: string[] = []

    // Check for unauthorized devices
    if (networkHealth.unauthorizedDevices > 0) {
      recommendations.push("Review and authorize or block unauthorized devices on the network")
    }

    // Check for offline devices
    if (networkHealth.devicesOffline > 0) {
      recommendations.push("Investigate offline devices and restore connectivity")
    }

    // Check for high-severity events
    const criticalEvents = activeEvents.filter((e) => e.severity === "critical")
    if (criticalEvents.length > 0) {
      recommendations.push("Address critical security events immediately")
    }

    // Check for vulnerability events
    const vulnerabilityEvents = activeEvents.filter((e) => e.type === "vulnerability_detected")
    if (vulnerabilityEvents.length > 0) {
      recommendations.push("Update firmware and patch vulnerabilities on affected devices")
    }

    // General recommendations
    if (activeEvents.length > 5) {
      recommendations.push("Consider implementing additional security monitoring tools")
    }

    if (recommendations.length === 0) {
      recommendations.push("Network security status is good. Continue regular monitoring.")
    }

    return recommendations
  }

  private generateEventRecommendations(type: SecurityEvent["type"], severity: SecurityEvent["severity"]): string[] {
    const recommendations: string[] = []

    switch (type) {
      case "unauthorized_access":
        recommendations.push("Block unauthorized device access")
        recommendations.push("Review network access controls")
        if (severity === "high" || severity === "critical") {
          recommendations.push("Immediately isolate the device from the network")
        }
        break

      case "vulnerability_detected":
        recommendations.push("Update device firmware")
        recommendations.push("Change default credentials")
        recommendations.push("Disable unnecessary services")
        break

      case "suspicious_activity":
        recommendations.push("Monitor device activity closely")
        recommendations.push("Review device logs")
        recommendations.push("Consider network segmentation")
        break

      case "intrusion_attempt":
        recommendations.push("Block source IP address")
        recommendations.push("Review firewall rules")
        recommendations.push("Enable intrusion detection")
        break

      case "device_offline":
        recommendations.push("Check device power and connectivity")
        recommendations.push("Verify network configuration")
        break

      case "configuration_change":
        recommendations.push("Verify authorized configuration changes")
        recommendations.push("Review change management procedures")
        break
    }

    return recommendations
  }

  private async escalateEvent(eventId: string): Promise<void> {
    const event = this.events.get(eventId)
    if (!event) return

    console.log(`[AI-IT Security Monitor] CRITICAL EVENT ESCALATION: ${event.description}`)

    // In a real implementation, this would:
    // - Send notifications to security team
    // - Create tickets in incident management system
    // - Trigger automated response procedures
  }

  private initializeDefaultRules(): void {
    // Initialize default security monitoring rules
    this.monitoringRules = [
      {
        id: "unauthorized-device",
        name: "Unauthorized Device Detection",
        enabled: true,
        conditions: ["device.authorized === false", 'device.status === "online"'],
        action: "create_event",
        severity: "medium",
      },
      {
        id: "high-risk-device",
        name: "High Risk Device Detection",
        enabled: true,
        conditions: ['device.riskLevel === "high"'],
        action: "create_event",
        severity: "high",
      },
      {
        id: "suspicious-ports",
        name: "Suspicious Port Detection",
        enabled: true,
        conditions: ["device.ports.includes(23)", "device.ports.includes(21)"],
        action: "create_event",
        severity: "medium",
      },
    ]
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

interface SecurityRule {
  id: string
  name: string
  enabled: boolean
  conditions: string[]
  action: string
  severity: string
}

export const securityMonitor = new SecurityMonitorService()
