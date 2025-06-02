"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Info,
} from "lucide-react"

export function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-slate-600" />
                Terms of Service
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-2">AI-IT Inc Rental & Storage Security POS System</p>
            </div>
            <Badge variant="outline" className="text-slate-600 border-slate-600">
              Effective: December 2024
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* License Grant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            License Grant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div className="font-semibold text-blue-800 dark:text-blue-200">Limited License</div>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              AI-IT Inc grants you a non-exclusive, non-transferable license to use this software solely for your
              internal business operations at the licensed facility.
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 mt-1 text-green-500" />
              <div>
                <div className="font-medium">Permitted Use</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Internal business operations at your licensed facility location
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 mt-1 text-green-500" />
              <div>
                <div className="font-medium">Security Monitoring</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Camera surveillance and network security monitoring
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 mt-1 text-green-500" />
              <div>
                <div className="font-medium">Data Management</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Customer and rental unit management for your facility
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restrictions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <XCircle className="w-5 h-5" />
            License Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <div className="font-medium mb-2">STRICTLY PROHIBITED ACTIVITIES</div>
              <div className="text-sm">
                The following activities are expressly forbidden and may result in immediate license termination.
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <XCircle className="w-4 h-4 mt-1 text-red-500" />
              <div>
                <div className="font-medium text-red-800 dark:text-red-200">No Resale</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  This software may not be resold, sublicensed, or distributed to third parties
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-4 h-4 mt-1 text-red-500" />
              <div>
                <div className="font-medium text-red-800 dark:text-red-200">No Reverse Engineering</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Decompilation, disassembly, or reverse engineering is prohibited
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-4 h-4 mt-1 text-red-500" />
              <div>
                <div className="font-medium text-red-800 dark:text-red-200">Single Facility Use</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  License is valid for one facility location only
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-4 h-4 mt-1 text-red-500" />
              <div>
                <div className="font-medium text-red-800 dark:text-red-200">No Unauthorized Modifications</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Core system modifications require written authorization from AI-IT Inc
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support and Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Support and Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Technical Support
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                  Available during business hours (EST)
                  <br />
                  Phone: 863-308-4979
                  <br />
                  Email: support@ai-it.com
                </div>
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Software Updates
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                  Regular updates provided for active license holders
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Security Patches
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                  Critical security updates provided immediately
                </div>
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Training
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                  Initial setup and user training included with license
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liability Limitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Liability Limitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Important Liability Information</div>
              <div className="text-sm">
                Please read these limitations carefully as they affect your rights and our responsibilities.
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <div className="font-medium">System Availability</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                We target 99.5% uptime but cannot guarantee continuous availability. Planned maintenance windows may
                affect system access.
              </div>
            </div>
            <div>
              <div className="font-medium">Data Protection</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                While we implement robust security measures, you are responsible for regular backups. AI-IT Inc is not
                liable for data loss due to hardware failure or user error.
              </div>
            </div>
            <div>
              <div className="font-medium">Security Configuration</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                The system provides security tools and monitoring capabilities. Proper configuration and monitoring are
                the user's responsibility.
              </div>
            </div>
            <div>
              <div className="font-medium">Third-Party Services</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                AI-IT Inc is not responsible for failures or issues with third-party integrations, camera hardware, or
                network infrastructure.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creator Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Creator & Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">Creator</div>
                <div className="text-slate-600 dark:text-slate-400">Steven Chason</div>
              </div>
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">Company</div>
                <div className="text-slate-600 dark:text-slate-400">AI-IT Inc</div>
              </div>
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">Address</div>
                <div className="text-slate-600 dark:text-slate-400">
                  88 Perch St
                  <br />
                  Winterhaven, FL 33881
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">Phone</div>
                <div className="text-slate-600 dark:text-slate-400">863-308-4979</div>
              </div>
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">Support Email</div>
                <div className="text-slate-600 dark:text-slate-400">support@ai-it.com</div>
              </div>
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">Legal Email</div>
                <div className="text-slate-600 dark:text-slate-400">legal@ai-it.com</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copyright Notice */}
      <Card className="border-slate-300 bg-slate-50 dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-slate-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                © 2024 AI-IT Inc. All rights reserved.
              </span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Designed and developed by Steven Chason • Winterhaven, FL
            </div>
            <Badge variant="destructive" className="mt-2">
              PROPRIETARY SOFTWARE - NOT FOR RESALE
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Card className="bg-slate-50 dark:bg-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: December 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Version 1.0.0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
