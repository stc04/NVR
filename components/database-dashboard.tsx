"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Building,
  Camera,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  XCircle,
} from "lucide-react"
import {
  getDashboardStats,
  getAllFacilities,
  getAllUsers,
  getSecurityEventsByFacility,
  isDatabaseConnected,
} from "@/lib/database"

export function DatabaseDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [facilities, setFacilities] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [dbConnected, setDbConnected] = useState(false)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Check database connection first
      const connected = isDatabaseConnected()
      setDbConnected(connected)

      if (!connected) {
        setError("Database not connected. Please check your DATABASE_URL environment variable.")
        setStats({
          totalUnits: 0,
          occupiedUnits: 0,
          availableUnits: 0,
          totalCameras: 0,
          onlineCameras: 0,
          offlineCameras: 0,
          recentEvents: 0,
          totalCustomers: 0,
          occupancyRate: "0",
        })
        setFacilities([])
        setUsers([])
        setRecentEvents([])
        return
      }

      const [dashboardStats, facilitiesData, usersData] = await Promise.all([
        getDashboardStats(),
        getAllFacilities(),
        getAllUsers(),
      ])

      setStats(dashboardStats)
      setFacilities(facilitiesData)
      setUsers(usersData)

      // Load recent events from the first facility if available
      if (facilitiesData.length > 0) {
        const events = await getSecurityEventsByFacility(facilitiesData[0].id, 10)
        setRecentEvents(events)
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : "Unknown error"}`)
      setDbConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading database dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Database Connection Status */}
      <Alert className={dbConnected ? "border-green-200" : "border-red-200"}>
        {dbConnected ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {dbConnected ? "Database Connected Successfully" : "Database Connection Failed"}
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={dbConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
              >
                {dbConnected ? "Neon PostgreSQL" : "Disconnected"}
              </Badge>
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </AlertDescription>
      </Alert>

      {/* Environment Variables Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Environment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">DATABASE_URL</div>
                <div className="text-sm text-muted-foreground">Neon PostgreSQL connection string</div>
              </div>
              <Badge variant={process.env.DATABASE_URL ? "default" : "destructive"}>
                {process.env.DATABASE_URL ? "Set" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">NEXT_PUBLIC_MEDIA_SERVER_URL</div>
                <div className="text-sm text-muted-foreground">Media server endpoint</div>
              </div>
              <Badge variant={process.env.NEXT_PUBLIC_MEDIA_SERVER_URL ? "default" : "secondary"}>
                {process.env.NEXT_PUBLIC_MEDIA_SERVER_URL ? "Set" : "Not Set"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">NEXT_PUBLIC_NETWORK_BRIDGE_URL</div>
                <div className="text-sm text-muted-foreground">Network bridge endpoint</div>
              </div>
              <Badge variant={process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL ? "default" : "secondary"}>
                {process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL ? "Set" : "Not Set"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUnits || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.occupancyRate || 0}% occupied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.onlineCameras || 0}</div>
            <p className="text-xs text-muted-foreground">of {stats?.totalCameras || 0} total cameras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentEvents || 0}</div>
            <p className="text-xs text-muted-foreground">in the last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">registered customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Database Setup Instructions */}
      {!dbConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Database Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To use the database features, you need to set up your Neon PostgreSQL connection:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your Vercel project dashboard</li>
                <li>Navigate to Settings → Environment Variables</li>
                <li>Add the DATABASE_URL variable with your Neon connection string</li>
                <li>Redeploy your application or restart your development server</li>
                <li>Run the database table creation script from the previous setup</li>
              </ol>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  The application will continue to work with mock data until the database is properly configured.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Facilities Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Facilities Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {facilities.length > 0 ? (
            <div className="space-y-3">
              {facilities.map((facility) => (
                <div key={facility.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{facility.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {facility.city}, {facility.state} • Manager: {facility.manager_name || "Unassigned"}
                    </div>
                  </div>
                  <Badge variant={facility.is_active ? "default" : "secondary"}>
                    {facility.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {dbConnected
                ? "No facilities found. Create your first facility to get started."
                : "Database not connected. Please configure your DATABASE_URL."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email} • {user.username}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{user.role}</Badge>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
              {users.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">And {users.length - 5} more users...</div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {dbConnected
                ? "No users found. Create your first admin user to get started."
                : "Database not connected. Please configure your DATABASE_URL."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{event.event_type}</div>
                    <div className="text-sm text-muted-foreground">{event.description}</div>
                    <div className="text-xs text-muted-foreground">{new Date(event.event_time).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        event.severity === "critical"
                          ? "destructive"
                          : event.severity === "high"
                            ? "destructive"
                            : event.severity === "medium"
                              ? "default"
                              : "secondary"
                      }
                    >
                      {event.severity}
                    </Badge>
                    <Badge variant={event.resolved ? "default" : "outline"}>
                      {event.resolved ? "Resolved" : "Open"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {dbConnected
                ? "No recent security events found."
                : "Database not connected. Please configure your DATABASE_URL."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
