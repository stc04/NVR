"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Lock,
  Eye,
  Database,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react"

export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Privacy Policy
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-2">AI-IT Inc Rental & Storage Security POS System</p>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Effective: December 2024
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="font-semibold">Company Name</div>
                <div className="text-slate-600 dark:text-slate-400">AI-IT Inc</div>
              </div>
              <div>
                <div className="font-semibold">Creator & Privacy Officer</div>
                <div className="text-slate-600 dark:text-slate-400">Steven Chason</div>
              </div>
              <div>
                <div className="font-semibold">Address</div>
                <div className="text-slate-600 dark:text-slate-400">
                  88 Perch St
                  <br />
                  Winterhaven, FL 33881
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="font-semibold">Phone</div>
                <div className="text-slate-600 dark:text-slate-400">863-308-4979</div>
              </div>
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-slate-600 dark:text-slate-400">privacy@ai-it.com</div>
              </div>
              <div>
                <div className="font-semibold">Support</div>
                <div className="text-slate-600 dark:text-slate-400">support@ai-it.com</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Collection and Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="font-semibold text-green-800 dark:text-green-200">Privacy-First Design</div>
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Our system is designed with privacy as a core principle. All security monitoring and camera feeds are
              processed locally on your premises with no external data transmission.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Information We Collect</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Eye className="w-4 h-4 mt-1 text-blue-500" />
                  <div>
                    <div className="font-medium">System Performance Metrics</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      CPU, memory, and network usage for optimization
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 mt-1 text-blue-500" />
                  <div>
                    <div className="font-medium">Security Event Logs</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Motion detection, access logs, and security alerts
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database className="w-4 h-4 mt-1 text-blue-500" />
                  <div>
                    <div className="font-medium">Network Device Information</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      IP addresses and device types for monitoring
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">How We Use Your Data</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 mt-1 text-green-500" />
                  <div>
                    <div className="font-medium">Local Processing Only</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      All data remains on your local systems
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 mt-1 text-green-500" />
                  <div>
                    <div className="font-medium">Security Enhancement</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Improve threat detection and system security
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 mt-1 text-green-500" />
                  <div>
                    <div className="font-medium">System Optimization</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Performance monitoring and improvement
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Data Security and Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Encryption</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                AES-256 encryption for all sensitive data at rest and in transit
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Access Control</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                Role-based access with multi-factor authentication
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Local Storage</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                All data remains on your local systems and networks
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Audit Trails</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                Comprehensive logging for security compliance
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Your Privacy Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Data Access
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                  View all data collected about your facility
                </div>
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Data Deletion
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                  Request deletion of historical data
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Data Portability
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                  Export your data in standard formats
                </div>
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Opt-Out Options
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">
                  Disable non-essential data collection features
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertTriangle className="w-5 h-5" />
            Proprietary Software Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Badge variant="destructive" className="mb-2">
              NOT FOR RESALE
            </Badge>
            <div className="text-sm text-red-700 dark:text-red-300">
              This software is the exclusive property of AI-IT Inc and is protected by copyright law. This system is
              provided for authorized use only and is <strong>NOT FOR RESALE</strong>, redistribution, or commercial
              licensing without explicit written permission from AI-IT Inc.
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              Unauthorized use, copying, distribution, or modification is strictly prohibited.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="font-medium">Privacy Questions</div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-500" />
                <a href="mailto:privacy@ai-it.com" className="text-blue-600 hover:underline">
                  privacy@ai-it.com
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Technical Support</div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-500" />
                <a href="tel:863-308-4979" className="text-blue-600 hover:underline">
                  863-308-4979
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">General Inquiries</div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-500" />
                <a href="mailto:support@ai-it.com" className="text-blue-600 hover:underline">
                  support@ai-it.com
                </a>
              </div>
            </div>
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
              <Info className="w-4 h-4" />
              <span>© 2024 AI-IT Inc. All rights reserved.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
