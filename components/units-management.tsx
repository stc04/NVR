"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, Lock, Unlock, User, Calendar, DollarSign, MapPin, Settings } from "lucide-react"
import type { StorageUnit } from "@/types"

export function UnitsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "rented" | "maintenance">("all")
  const [units, setUnits] = useState<StorageUnit[]>([])

  useEffect(() => {
    // Load units from localStorage
    const savedUnits = localStorage.getItem("units")
    if (savedUnits) {
      setUnits(JSON.parse(savedUnits))
    } else {
      // Initialize with empty array
      setUnits([])
    }
  }, [])

  const saveUnits = (updatedUnits: StorageUnit[]) => {
    setUnits(updatedUnits)
    localStorage.setItem("units", JSON.stringify(updatedUnits))
  }

  const addUnit = () => {
    const newUnit: StorageUnit = {
      id: `unit-${Date.now()}`,
      name: `Unit ${units.length + 1}`,
      size: "5x10",
      location: "Building A",
      status: "available",
      monthlyRate: 125,
      features: ["Climate Controlled"],
    }
    saveUnits([...units, newUnit])
  }

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.renterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || unit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "rented":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "maintenance":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <Unlock className="w-4 h-4" />
      case "rented":
        return <Lock className="w-4 h-4" />
      case "maintenance":
        return <Settings className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const totalRevenue = units.filter((unit) => unit.status === "rented").reduce((sum, unit) => sum + unit.monthlyRate, 0)
  const occupancyRate =
    units.length > 0 ? Math.round((units.filter((unit) => unit.status === "rented").length / units.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Units Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage storage units, rentals, and tenant information</p>
        </div>
        <Button onClick={addUnit} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Units</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{units.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Occupancy Rate</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{occupancyRate}%</p>
              </div>
              <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">${totalRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Available Units</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {units.filter((unit) => unit.status === "available").length}
                </p>
              </div>
              <Unlock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search units, tenants, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(["all", "available", "rented", "maintenance"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units Grid */}
      {filteredUnits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <Card key={unit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{unit.name}</CardTitle>
                  <Badge className={getStatusColor(unit.status)}>
                    {getStatusIcon(unit.status)}
                    <span className="ml-1 capitalize">{unit.status}</span>
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{unit.location}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Size:</span>
                    <p className="font-semibold">{unit.size}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Rate:</span>
                    <p className="font-semibold">${unit.monthlyRate}/mo</p>
                  </div>
                </div>

                {unit.status === "rented" && unit.renterName && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{unit.renterName}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{unit.renterEmail}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Lease: {unit.leaseStart} - {unit.leaseEnd}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Features:</span>
                  <div className="flex flex-wrap gap-1">
                    {unit.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {units.length === 0 ? "No units configured" : "No units match your search"}
            </p>
            {units.length === 0 && (
              <Button onClick={addUnit}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Unit
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
