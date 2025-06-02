"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dashboard } from "@/components/dashboard"
import { CameraManagementEnhanced } from "@/components/camera-management-enhanced"
import { NetworkDiscovery } from "@/components/network-discovery"
import { NetworkLevelDashboard } from "@/components/network-level-dashboard"
import { NetworkTopologyMap } from "@/components/network-topology-map"
import { NVRIntegration } from "@/components/nvr-integration"
import { LiveNetworkMonitor } from "@/components/live-network-monitor"
import { UnitsManagement } from "@/components/units-management"
import { BillingSystem } from "@/components/billing-system"
import { UserManagement } from "@/components/user-management"
import { Settings } from "@/components/settings"
import { Admin } from "@/components/admin"
import { DatabaseDashboard } from "@/components/database-dashboard"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Rental & Storage Security POS</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Comprehensive network-level security and management system
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 lg:grid-cols-12 gap-1 h-auto p-1">
            <TabsTrigger value="dashboard" className="text-xs">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="network-monitor" className="text-xs">
              Live Monitor
            </TabsTrigger>
            <TabsTrigger value="network-level" className="text-xs">
              Network Level
            </TabsTrigger>
            <TabsTrigger value="topology" className="text-xs">
              Topology
            </TabsTrigger>
            <TabsTrigger value="nvr" className="text-xs">
              NVR Systems
            </TabsTrigger>
            <TabsTrigger value="cameras" className="text-xs">
              Cameras
            </TabsTrigger>
            <TabsTrigger value="discovery" className="text-xs">
              Discovery
            </TabsTrigger>
            <TabsTrigger value="units" className="text-xs">
              Units
            </TabsTrigger>
            <TabsTrigger value="billing" className="text-xs">
              Billing
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs">
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              Settings
            </TabsTrigger>
            <TabsTrigger value="admin" className="text-xs">
              Admin
            </TabsTrigger>
            <TabsTrigger value="database" className="text-xs">
              Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="network-monitor">
            <LiveNetworkMonitor />
          </TabsContent>

          <TabsContent value="network-level">
            <NetworkLevelDashboard />
          </TabsContent>

          <TabsContent value="topology">
            <NetworkTopologyMap />
          </TabsContent>

          <TabsContent value="nvr">
            <NVRIntegration />
          </TabsContent>

          <TabsContent value="cameras">
            <CameraManagementEnhanced />
          </TabsContent>

          <TabsContent value="discovery">
            <NetworkDiscovery />
          </TabsContent>

          <TabsContent value="units">
            <UnitsManagement />
          </TabsContent>

          <TabsContent value="billing">
            <BillingSystem />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>

          <TabsContent value="admin">
            <Admin />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
