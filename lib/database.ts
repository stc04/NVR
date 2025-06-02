import { neon } from "@neondatabase/serverless"

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL environment variable is not set. Database functions will not work.")
}

// Initialize the SQL client with error handling
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

// Helper function to check database connection
export function isDatabaseConnected(): boolean {
  return !!sql && !!process.env.DATABASE_URL
}

// Wrapper function for database operations
async function executeQuery<T>(operation: () => Promise<T>): Promise<T> {
  if (!sql) {
    throw new Error("Database not connected. Please check your DATABASE_URL environment variable.")
  }
  return await operation()
}

// User management functions
export async function createUser(userData: {
  username: string
  email: string
  password_hash: string
  full_name: string
  role: string
  phone?: string
}) {
  return executeQuery(async () => {
    const result = await sql!`
      INSERT INTO users (username, email, password_hash, full_name, role, phone)
      VALUES (${userData.username}, ${userData.email}, ${userData.password_hash}, 
              ${userData.full_name}, ${userData.role}, ${userData.phone})
      RETURNING id, username, email, full_name, role, created_at
    `
    return result[0]
  })
}

export async function getUserByEmail(email: string) {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT id, username, email, full_name, role, is_active, last_login
      FROM users 
      WHERE email = ${email} AND is_active = true
    `
    return result[0]
  })
}

export async function getAllUsers() {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT id, username, email, full_name, role, phone, created_at, last_login, is_active
      FROM users 
      ORDER BY created_at DESC
    `
    return result
  })
}

// Facility management functions
export async function createFacility(facilityData: {
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone?: string
  email?: string
  manager_id?: number
}) {
  return executeQuery(async () => {
    const result = await sql!`
      INSERT INTO facilities (name, address, city, state, zip_code, phone, email, manager_id)
      VALUES (${facilityData.name}, ${facilityData.address}, ${facilityData.city}, 
              ${facilityData.state}, ${facilityData.zip_code}, ${facilityData.phone}, 
              ${facilityData.email}, ${facilityData.manager_id})
      RETURNING *
    `
    return result[0]
  })
}

export async function getAllFacilities() {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT f.*, u.full_name as manager_name
      FROM facilities f
      LEFT JOIN users u ON f.manager_id = u.id
      WHERE f.is_active = true
      ORDER BY f.name
    `
    return result
  })
}

// Unit management functions
export async function createUnit(unitData: {
  facility_id: number
  unit_number: string
  unit_type_id?: number
  floor: number
  section?: string
  climate_controlled: boolean
  has_alarm: boolean
  monthly_rate: number
}) {
  return executeQuery(async () => {
    const result = await sql!`
      INSERT INTO units (facility_id, unit_number, unit_type_id, floor, section, 
                        climate_controlled, has_alarm, monthly_rate, status)
      VALUES (${unitData.facility_id}, ${unitData.unit_number}, ${unitData.unit_type_id}, 
              ${unitData.floor}, ${unitData.section}, ${unitData.climate_controlled}, 
              ${unitData.has_alarm}, ${unitData.monthly_rate}, 'available')
      RETURNING *
    `
    return result[0]
  })
}

export async function getUnitsByFacility(facilityId: number) {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT u.*, ut.name as unit_type_name, ut.width, ut.length, ut.height
      FROM units u
      LEFT JOIN unit_types ut ON u.unit_type_id = ut.id
      WHERE u.facility_id = ${facilityId}
      ORDER BY u.unit_number
    `
    return result
  })
}

export async function updateUnitStatus(unitId: number, status: string) {
  return executeQuery(async () => {
    const result = await sql!`
      UPDATE units 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${unitId}
      RETURNING *
    `
    return result[0]
  })
}

// Customer management functions
export async function createCustomer(customerData: {
  first_name: string
  last_name: string
  email?: string
  phone: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  id_type?: string
  id_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}) {
  return executeQuery(async () => {
    const result = await sql!`
      INSERT INTO customers (first_name, last_name, email, phone, address, city, state, 
                            zip_code, id_type, id_number, emergency_contact_name, emergency_contact_phone)
      VALUES (${customerData.first_name}, ${customerData.last_name}, ${customerData.email}, 
              ${customerData.phone}, ${customerData.address}, ${customerData.city}, 
              ${customerData.state}, ${customerData.zip_code}, ${customerData.id_type}, 
              ${customerData.id_number}, ${customerData.emergency_contact_name}, 
              ${customerData.emergency_contact_phone})
      RETURNING *
    `
    return result[0]
  })
}

export async function getAllCustomers() {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT * FROM customers 
      ORDER BY last_name, first_name
    `
    return result
  })
}

// Camera management functions
export async function createCamera(cameraData: {
  facility_id: number
  name: string
  ip_address: string
  mac_address?: string
  model?: string
  manufacturer?: string
  username?: string
  password_hash?: string
  rtsp_url?: string
  http_url?: string
  location?: string
  area_covered?: string
  ptz_capable: boolean
}) {
  return executeQuery(async () => {
    const result = await sql!`
      INSERT INTO cameras (facility_id, name, ip_address, mac_address, model, manufacturer,
                          username, password_hash, rtsp_url, http_url, location, area_covered,
                          ptz_capable, status)
      VALUES (${cameraData.facility_id}, ${cameraData.name}, ${cameraData.ip_address}, 
              ${cameraData.mac_address}, ${cameraData.model}, ${cameraData.manufacturer},
              ${cameraData.username}, ${cameraData.password_hash}, ${cameraData.rtsp_url},
              ${cameraData.http_url}, ${cameraData.location}, ${cameraData.area_covered},
              ${cameraData.ptz_capable}, 'offline')
      RETURNING *
    `
    return result[0]
  })
}

export async function getCamerasByFacility(facilityId: number) {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT * FROM cameras 
      WHERE facility_id = ${facilityId}
      ORDER BY name
    `
    return result
  })
}

export async function updateCameraStatus(cameraId: number, status: string) {
  return executeQuery(async () => {
    const result = await sql!`
      UPDATE cameras 
      SET status = ${status}, last_online = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${cameraId}
      RETURNING *
    `
    return result[0]
  })
}

// Security events functions
export async function createSecurityEvent(eventData: {
  facility_id: number
  event_type: string
  source: string
  source_id?: number
  severity: string
  description: string
}) {
  return executeQuery(async () => {
    const result = await sql!`
      INSERT INTO security_events (facility_id, event_type, source, source_id, severity, description)
      VALUES (${eventData.facility_id}, ${eventData.event_type}, ${eventData.source}, 
              ${eventData.source_id}, ${eventData.severity}, ${eventData.description})
      RETURNING *
    `
    return result[0]
  })
}

export async function getSecurityEventsByFacility(facilityId: number, limit = 50) {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT * FROM security_events 
      WHERE facility_id = ${facilityId}
      ORDER BY event_time DESC
      LIMIT ${limit}
    `
    return result
  })
}

// Network devices functions
export async function createNetworkDevice(deviceData: {
  facility_id: number
  ip_address: string
  mac_address?: string
  hostname?: string
  device_type?: string
  manufacturer?: string
  model?: string
  os_type?: string
  os_version?: string
  open_ports?: any
  services?: any
}) {
  return executeQuery(async () => {
    const result = await sql!`
      INSERT INTO network_devices (facility_id, ip_address, mac_address, hostname, device_type,
                                  manufacturer, model, os_type, os_version, open_ports, services, status)
      VALUES (${deviceData.facility_id}, ${deviceData.ip_address}, ${deviceData.mac_address},
              ${deviceData.hostname}, ${deviceData.device_type}, ${deviceData.manufacturer},
              ${deviceData.model}, ${deviceData.os_type}, ${deviceData.os_version},
              ${JSON.stringify(deviceData.open_ports)}, ${JSON.stringify(deviceData.services)}, 'unknown')
      ON CONFLICT (facility_id, ip_address) 
      DO UPDATE SET 
        mac_address = EXCLUDED.mac_address,
        hostname = EXCLUDED.hostname,
        device_type = EXCLUDED.device_type,
        manufacturer = EXCLUDED.manufacturer,
        model = EXCLUDED.model,
        os_type = EXCLUDED.os_type,
        os_version = EXCLUDED.os_version,
        open_ports = EXCLUDED.open_ports,
        services = EXCLUDED.services,
        last_seen = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    return result[0]
  })
}

export async function getNetworkDevicesByFacility(facilityId: number) {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT * FROM network_devices 
      WHERE facility_id = ${facilityId}
      ORDER BY ip_address
    `
    return result
  })
}

// Settings functions
export async function getSetting(key: string) {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT setting_value, setting_type FROM settings 
      WHERE setting_key = ${key}
    `
    return result[0]
  })
}

export async function setSetting(key: string, value: string, type = "string", description?: string) {
  return executeQuery(async () => {
    const result = await sql!`
      INSERT INTO settings (setting_key, setting_value, setting_type, description)
      VALUES (${key}, ${value}, ${type}, ${description})
      ON CONFLICT (setting_key) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        setting_type = EXCLUDED.setting_type,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    return result[0]
  })
}

export async function getAllSettings() {
  return executeQuery(async () => {
    const result = await sql!`
      SELECT * FROM settings 
      ORDER BY setting_key
    `
    return result
  })
}

// Audit logging function
export async function createAuditLog(auditData: {
  user_id?: number
  action: string
  entity_type: string
  entity_id?: number
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
}) {
  return executeQuery(async () => {
    const result = await sql!`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
      VALUES (${auditData.user_id}, ${auditData.action}, ${auditData.entity_type}, 
              ${auditData.entity_id}, ${JSON.stringify(auditData.old_values)}, 
              ${JSON.stringify(auditData.new_values)}, ${auditData.ip_address}, ${auditData.user_agent})
      RETURNING *
    `
    return result[0]
  })
}

// Dashboard statistics with mock data fallback
export async function getDashboardStats(facilityId?: number) {
  if (!isDatabaseConnected()) {
    // Return mock data when database is not connected
    return {
      totalUnits: 0,
      occupiedUnits: 0,
      availableUnits: 0,
      totalCameras: 0,
      onlineCameras: 0,
      offlineCameras: 0,
      recentEvents: 0,
      totalCustomers: 0,
      occupancyRate: "0",
    }
  }

  return executeQuery(async () => {
    const facilityFilter = facilityId ? sql!`WHERE facility_id = ${facilityId}` : sql!``

    const [totalUnits, occupiedUnits, totalCameras, onlineCameras, recentEvents, totalCustomers] = await Promise.all([
      sql!`SELECT COUNT(*) as count FROM units ${facilityFilter}`,
      sql!`SELECT COUNT(*) as count FROM units ${facilityFilter} AND status = 'occupied'`,
      sql!`SELECT COUNT(*) as count FROM cameras ${facilityFilter}`,
      sql!`SELECT COUNT(*) as count FROM cameras ${facilityFilter} AND status = 'online'`,
      sql!`SELECT COUNT(*) as count FROM security_events ${facilityFilter} AND event_time > NOW() - INTERVAL '24 hours'`,
      sql!`SELECT COUNT(*) as count FROM customers`,
    ])

    return {
      totalUnits: totalUnits[0].count,
      occupiedUnits: occupiedUnits[0].count,
      availableUnits: totalUnits[0].count - occupiedUnits[0].count,
      totalCameras: totalCameras[0].count,
      onlineCameras: onlineCameras[0].count,
      offlineCameras: totalCameras[0].count - onlineCameras[0].count,
      recentEvents: recentEvents[0].count,
      totalCustomers: totalCustomers[0].count,
      occupancyRate: totalUnits[0].count > 0 ? ((occupiedUnits[0].count / totalUnits[0].count) * 100).toFixed(1) : "0",
    }
  })
}
