"use client"

import { useState, useCallback, useEffect } from "react"
import type { Alert } from "@/types"

interface SystemStats {
  totalUnits: number
  occupiedUnits: number
  totalCameras: number
  activeCameras: number
  totalRevenue: number
  revenueChange: number
  pendingAlerts: number
  onlineDevices: number
  totalDevices: number
}

interface SystemStatus {
  security_system: boolean
  camera_network: boolean
  access_control: boolean
  billing_system: boolean
}

export function useSystemData() {
  const [stats, setStats] = useState<SystemStats>({
    totalUnits: 0,
    occupiedUnits: 0,
    totalCameras: 0,
    activeCameras: 0,
    totalRevenue: 0,
    revenueChange: 0,
    pendingAlerts: 0,
    onlineDevices: 0,
    totalDevices: 0,
  })

  const [alerts, setAlerts] = useState<Alert[]>([])

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    security_system: true,
    camera_network: true,
    access_control: true,
    billing_system: true,
  })

  const calculateStats = useCallback(() => {
    // Get data from localStorage
    const units = JSON.parse(localStorage.getItem("units") || "[]")
    const cameras = JSON.parse(localStorage.getItem("cameras") || "[]")
    const payments = JSON.parse(localStorage.getItem("payments") || "[]")
    const devices = JSON.parse(localStorage.getItem("devices") || "[]")

    // Calculate unit statistics
    const totalUnits = units.length
    const occupiedUnits = units.filter((unit: any) => unit.status === "rented").length

    // Calculate camera statistics
    const totalCameras = cameras.length
    const activeCameras = cameras.filter((camera: any) => camera.status === "online").length

    // Calculate revenue statistics
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyPayments = payments.filter((payment: any) => {
      const paymentDate = new Date(payment.dueDate)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    })
    const totalRevenue = monthlyPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0)

    // Calculate device statistics
    const totalDevices = devices.length + cameras.length
    const onlineDevices = devices.filter((device: any) => device.status === "online").length + activeCameras

    // Get alerts
    const storedAlerts = JSON.parse(localStorage.getItem("alerts") || "[]")

    setStats({
      totalUnits,
      occupiedUnits,
      totalCameras,
      activeCameras,
      totalRevenue,
      revenueChange: 0, // Would calculate from historical data
      pendingAlerts: storedAlerts.length,
      onlineDevices,
      totalDevices,
    })

    setAlerts(storedAlerts)

    // Update system status based on actual data
    setSystemStatus({
      security_system: true,
      camera_network: activeCameras > 0,
      access_control: true,
      billing_system: true,
    })
  }, [])

  const refreshData = useCallback(() => {
    calculateStats()
  }, [calculateStats])

  const addAlert = useCallback((alert: Omit<Alert, "id">) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now(),
    }

    setAlerts((prev) => {
      const updated = [newAlert, ...prev].slice(0, 50) // Keep only last 50 alerts
      localStorage.setItem("alerts", JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAlert = useCallback((alertId: number) => {
    setAlerts((prev) => {
      const updated = prev.filter((alert) => alert.id !== alertId)
      localStorage.setItem("alerts", JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAllAlerts = useCallback(() => {
    setAlerts([])
    localStorage.removeItem("alerts")
  }, [])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  return {
    stats,
    alerts,
    systemStatus,
    refreshData,
    addAlert,
    clearAlert,
    clearAllAlerts,
  }
}
