export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "admin" | "manager" | "tenant" | "viewer"
  status: "active" | "inactive" | "pending"
  lastLogin?: string
  createdDate: string
  unitIds?: string[]
  permissions: string[]
}

export interface StorageUnit {
  id: string
  name: string
  size: string
  location: string
  status: "available" | "rented" | "maintenance"
  monthlyRate: number
  renterName?: string
  renterEmail?: string
  leaseStart?: string
  leaseEnd?: string
  features: string[]
}

export interface CameraDevice {
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

export interface NetworkDevice {
  id: string
  ip: string
  mac: string
  manufacturer: string
  deviceType: "camera" | "nvr" | "smart_device" | "router" | "unknown"
  model?: string
  status: "online" | "offline" | "unknown"
  protocol: string
  port: number
  lastSeen: string
}

export interface Payment {
  id: string
  tenantName: string
  unitId: string
  amount: number
  dueDate: string
  paidDate?: string
  status: "paid" | "pending" | "overdue"
  method?: "credit_card" | "bank_transfer" | "cash" | "check"
  invoiceNumber: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  tenantName: string
  unitId: string
  amount: number
  issueDate: string
  dueDate: string
  status: "draft" | "sent" | "paid" | "overdue"
  items: {
    description: string
    amount: number
  }[]
}

export interface Alert {
  id: number
  type: "security" | "system" | "access"
  message: string
  time: string
  severity: "high" | "medium" | "low"
}
