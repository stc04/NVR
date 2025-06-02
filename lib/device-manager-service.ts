/**
 * AI-IT Inc - Device Manager Service
 * Creator: Steven Chason
 * Company: AI-IT Inc
 * Address: 88 Perch St, Winterhaven FL 33881
 * Phone: 863-308-4979
 *
 * NOT FOR RESALE - Proprietary Software
 * © 2024 AI-IT Inc. All rights reserved.
 */

import type { NetworkDevice } from "./network-scanner-service"
import type { Camera } from "./camera-discovery-service"

export interface ManagedDevice {
  id: string
  ip: string
  hostname?: string
  deviceType: string
  brand?: string
  model?: string
  status: "online" | "offline" | "unauthorized" | "maintenance"
  authorized: boolean
  tags: string[]
  group?: string
  notes?: string
  lastSeen: Date
  firstSeen: Date
  riskLevel: "low" | "medium" | "high"
  capabilities: string[]
  ports: number[]
  services: string[]
  credentials?: { username: string; password: string }
  configuration?: Record<string, any>
  alerts: DeviceAlert[]
  maintenanceSchedule?: MaintenanceSchedule[]
}

export interface DeviceAlert {
  id: string
  deviceId: string
  type: "security" | "performance" | "connectivity" | "maintenance"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: Date
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
}

export interface MaintenanceSchedule {
  id: string
  deviceId: string
  type: "firmware_update" | "password_change" | "configuration_backup" | "health_check"
  scheduledDate: Date
  completed: boolean
  completedAt?: Date
  notes?: string
}

export interface DeviceGroup {
  id: string
  name: string
  description?: string
  devices: string[]
  tags: string[]
  policies: GroupPolicy[]
}

export interface GroupPolicy {
  id: string
  name: string
  type: "access_control" | "monitoring" | "maintenance" | "security"
  rules: Record<string, any>
  enabled: boolean
}

class DeviceManagerService {
  private devices = new Map<string, ManagedDevice>()
  private groups = new Map<string, DeviceGroup>()
  private alerts = new Map<string, DeviceAlert>()
  private maintenanceSchedules = new Map<string, MaintenanceSchedule>()

  async addDevice(device: NetworkDevice | Camera): Promise<string> {
    const deviceId = this.generateDeviceId(device.ip)

    const managedDevice: ManagedDevice = {
      id: deviceId,
      ip: device.ip,
      hostname: "hostname" in device ? device.hostname : undefined,
      deviceType: "deviceType" in device ? device.deviceType : "IP Camera",
      brand: "brand" in device ? device.brand : undefined,
      model: "model" in device ? device.model : undefined,
      status: device.status,
      authorized: false,
      tags: [],
      lastSeen: device.lastSeen,
      firstSeen: new Date(),
      riskLevel: device.riskLevel,
      capabilities: device.capabilities || [],
      ports: device.ports,
      services: "services" in device ? device.services : [],
      alerts: [],
      maintenanceSchedule: [],
    }

    this.devices.set(deviceId, managedDevice)

    // Create initial security alert if high risk
    if (device.riskLevel === "high") {
      await this.createAlert(deviceId, {
        type: "security",
        severity: "high",
        message: `High-risk device detected: ${device.ip}. Immediate attention required.`,
      })
    }

    console.log(`[AI-IT Device Manager] Added device: ${device.ip} (${deviceId})`)
    return deviceId
  }

  async updateDevice(deviceId: string, updates: Partial<ManagedDevice>): Promise<void> {
    const device = this.devices.get(deviceId)
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`)
    }

    const updatedDevice = { ...device, ...updates }
    this.devices.set(deviceId, updatedDevice)

    console.log(`[AI-IT Device Manager] Updated device: ${deviceId}`)
  }

  async removeDevice(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId)
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`)
    }

    this.devices.delete(deviceId)

    // Remove from all groups
    for (const group of this.groups.values()) {
      group.devices = group.devices.filter((id) => id !== deviceId)
    }

    // Remove alerts
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.deviceId === deviceId) {
        this.alerts.delete(alertId)
      }
    }

    console.log(`[AI-IT Device Manager] Removed device: ${deviceId}`)
  }

  async authorizeDevice(deviceId: string, authorized: boolean): Promise<void> {
    const device = this.devices.get(deviceId)
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`)
    }

    device.authorized = authorized
    device.status = authorized ? "online" : "unauthorized"

    await this.createAlert(deviceId, {
      type: "security",
      severity: "medium",
      message: `Device ${authorized ? "authorized" : "unauthorized"}: ${device.ip}`,
    })

    console.log(`[AI-IT Device Manager] Device ${authorized ? "authorized" : "unauthorized"}: ${deviceId}`)
  }

  async getAllDevices(): Promise<ManagedDevice[]> {
    return Array.from(this.devices.values())
  }

  async getDeviceById(deviceId: string): Promise<ManagedDevice | null> {
    return this.devices.get(deviceId) || null
  }

  async getDevicesByGroup(groupId: string): Promise<ManagedDevice[]> {
    const group = this.groups.get(groupId)
    if (!group) {
      return []
    }

    return group.devices
      .map((deviceId) => this.devices.get(deviceId))
      .filter((device): device is ManagedDevice => device !== undefined)
  }

  async getDevicesByTag(tag: string): Promise<ManagedDevice[]> {
    return Array.from(this.devices.values()).filter((device) => device.tags.includes(tag))
  }

  async getDevicesByRiskLevel(riskLevel: "low" | "medium" | "high"): Promise<ManagedDevice[]> {
    return Array.from(this.devices.values()).filter((device) => device.riskLevel === riskLevel)
  }

  async addDeviceTag(deviceId: string, tag: string): Promise<void> {
    const device = this.devices.get(deviceId)
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`)
    }

    if (!device.tags.includes(tag)) {
      device.tags.push(tag)
    }
  }

  async removeDeviceTag(deviceId: string, tag: string): Promise<void> {
    const device = this.devices.get(deviceId)
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`)
    }

    device.tags = device.tags.filter((t) => t !== tag)
  }

  async createGroup(name: string, description?: string): Promise<string> {
    const groupId = this.generateGroupId(name)

    const group: DeviceGroup = {
      id: groupId,
      name,
      description,
      devices: [],
      tags: [],
      policies: [],
    }

    this.groups.set(groupId, group)
    console.log(`[AI-IT Device Manager] Created group: ${name} (${groupId})`)
    return groupId
  }

  async addDeviceToGroup(deviceId: string, groupId: string): Promise<void> {
    const device = this.devices.get(deviceId)
    const group = this.groups.get(groupId)

    if (!device) {
      throw new Error(`Device not found: ${deviceId}`)
    }

    if (!group) {
      throw new Error(`Group not found: ${groupId}`)
    }

    if (!group.devices.includes(deviceId)) {
      group.devices.push(deviceId)
      device.group = groupId
    }
  }

  async removeDeviceFromGroup(deviceId: string, groupId: string): Promise<void> {
    const device = this.devices.get(deviceId)
    const group = this.groups.get(groupId)

    if (!device || !group) {
      return
    }

    group.devices = group.devices.filter((id) => id !== deviceId)
    if (device.group === groupId) {
      device.group = undefined
    }
  }

  async createAlert(
    deviceId: string,
    alertData: {
      type: "security" | "performance" | "connectivity" | "maintenance"
      severity: "low" | "medium" | "high" | "critical"
      message: string
    },
  ): Promise<string> {
    const alertId = this.generateAlertId()

    const alert: DeviceAlert = {
      id: alertId,
      deviceId,
      type: alertData.type,
      severity: alertData.severity,
      message: alertData.message,
      timestamp: new Date(),
      resolved: false,
    }

    this.alerts.set(alertId, alert)

    const device = this.devices.get(deviceId)
    if (device) {
      device.alerts.push(alert)
    }

    console.log(`[AI-IT Device Manager] Created ${alertData.severity} ${alertData.type} alert for device ${deviceId}`)
    return alertId
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const alert = this.alerts.get(alertId)
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`)
    }

    alert.resolved = true
    alert.resolvedBy = resolvedBy
    alert.resolvedAt = new Date()

    console.log(`[AI-IT Device Manager] Resolved alert: ${alertId}`)
  }

  async getActiveAlerts(): Promise<DeviceAlert[]> {
    return Array.from(this.alerts.values()).filter((alert) => !alert.resolved)
  }

  async getAlertsByDevice(deviceId: string): Promise<DeviceAlert[]> {
    return Array.from(this.alerts.values()).filter((alert) => alert.deviceId === deviceId)
  }

  async scheduleMaintenanceTask(
    deviceId: string,
    task: {
      type: "firmware_update" | "password_change" | "configuration_backup" | "health_check"
      scheduledDate: Date
      notes?: string
    },
  ): Promise<string> {
    const taskId = this.generateMaintenanceId()

    const maintenanceTask: MaintenanceSchedule = {
      id: taskId,
      deviceId,
      type: task.type,
      scheduledDate: task.scheduledDate,
      completed: false,
      notes: task.notes,
    }

    this.maintenanceSchedules.set(taskId, maintenanceTask)

    const device = this.devices.get(deviceId)
    if (device) {
      device.maintenanceSchedule = device.maintenanceSchedule || []
      device.maintenanceSchedule.push(maintenanceTask)
    }

    console.log(`[AI-IT Device Manager] Scheduled ${task.type} for device ${deviceId}`)
    return taskId
  }

  async completeMaintenanceTask(taskId: string, notes?: string): Promise<void> {
    const task = this.maintenanceSchedules.get(taskId)
    if (!task) {
      throw new Error(`Maintenance task not found: ${taskId}`)
    }

    task.completed = true
    task.completedAt = new Date()
    if (notes) {
      task.notes = notes
    }

    console.log(`[AI-IT Device Manager] Completed maintenance task: ${taskId}`)
  }

  async getUpcomingMaintenance(): Promise<MaintenanceSchedule[]> {
    const now = new Date()
    const upcoming = Array.from(this.maintenanceSchedules.values()).filter(
      (task) => !task.completed && task.scheduledDate > now,
    )

    return upcoming.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  }

  async getOverdueMaintenance(): Promise<MaintenanceSchedule[]> {
    const now = new Date()
    return Array.from(this.maintenanceSchedules.values()).filter((task) => !task.completed && task.scheduledDate < now)
  }

  async exportDeviceData(): Promise<string> {
    const data = {
      devices: Array.from(this.devices.values()),
      groups: Array.from(this.groups.values()),
      alerts: Array.from(this.alerts.values()),
      maintenanceSchedules: Array.from(this.maintenanceSchedules.values()),
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    }

    return JSON.stringify(data, null, 2)
  }

  async importDeviceData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData)

      // Import devices
      if (data.devices) {
        for (const device of data.devices) {
          this.devices.set(device.id, device)
        }
      }

      // Import groups
      if (data.groups) {
        for (const group of data.groups) {
          this.groups.set(group.id, group)
        }
      }

      // Import alerts
      if (data.alerts) {
        for (const alert of data.alerts) {
          this.alerts.set(alert.id, alert)
        }
      }

      // Import maintenance schedules
      if (data.maintenanceSchedules) {
        for (const schedule of data.maintenanceSchedules) {
          this.maintenanceSchedules.set(schedule.id, schedule)
        }
      }

      console.log("[AI-IT Device Manager] Successfully imported device data")
    } catch (error) {
      console.error("[AI-IT Device Manager] Error importing device data:", error)
      throw new Error("Failed to import device data: Invalid format")
    }
  }

  async getDeviceStatistics(): Promise<{
    totalDevices: number
    authorizedDevices: number
    onlineDevices: number
    highRiskDevices: number
    devicesByType: Record<string, number>
    alertsByType: Record<string, number>
    maintenanceDue: number
  }> {
    const devices = Array.from(this.devices.values())
    const activeAlerts = Array.from(this.alerts.values()).filter((alert) => !alert.resolved)
    const overdueMaintenance = await this.getOverdueMaintenance()

    const devicesByType: Record<string, number> = {}
    const alertsByType: Record<string, number> = {}

    for (const device of devices) {
      devicesByType[device.deviceType] = (devicesByType[device.deviceType] || 0) + 1
    }

    for (const alert of activeAlerts) {
      alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1
    }

    return {
      totalDevices: devices.length,
      authorizedDevices: devices.filter((d) => d.authorized).length,
      onlineDevices: devices.filter((d) => d.status === "online").length,
      highRiskDevices: devices.filter((d) => d.riskLevel === "high").length,
      devicesByType,
      alertsByType,
      maintenanceDue: overdueMaintenance.length,
    }
  }

  private generateDeviceId(ip: string): string {
    return `device_${ip.replace(/\./g, "_")}_${Date.now()}`
  }

  private generateGroupId(name: string): string {
    return `group_${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMaintenanceId(): string {
    return `maintenance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const deviceManager = new DeviceManagerService()
