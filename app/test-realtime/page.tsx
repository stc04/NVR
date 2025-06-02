"use client"

import { RealTimeDashboard } from "@/components/real-time-dashboard"

export default function TestRealTimePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        <RealTimeDashboard />
      </div>
    </div>
  )
}
