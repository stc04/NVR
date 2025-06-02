"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Building, Phone, Mail, MapPin, Shield, Code, Award, Calendar, Star } from "lucide-react"

export function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            About AI-IT Inc
          </CardTitle>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
            Innovative Security Solutions for Modern Businesses
          </p>
        </CardHeader>
      </Card>

      {/* Creator Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Creator & Founder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">Steven Chason</h3>
                <p className="text-slate-600 dark:text-slate-400">Founder & Lead Developer</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Steven Chason is the visionary founder and lead developer of AI-IT Inc, bringing decades of experience
                  in enterprise security systems and network infrastructure. Based in Winterhaven, Florida, Steven has
                  dedicated his career to developing cutting-edge security solutions that protect businesses and their
                  assets.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  With a passion for innovation and a deep understanding of modern security challenges, Steven has
                  created the Rental & Storage Security POS system to address the unique needs of storage facility
                  operators who require comprehensive, reliable, and user-friendly security management tools.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <Code className="w-3 h-3 mr-1" />
                  Software Architect
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Shield className="w-3 h-3 mr-1" />
                  Security Expert
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  <Award className="w-3 h-3 mr-1" />
                  Innovation Leader
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <a href="tel:863-308-4979" className="text-blue-600 hover:underline">
                      863-308-4979
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <a href="mailto:steven@ai-it.com" className="text-blue-600 hover:underline">
                      steven@ai-it.com
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div>
                      88 Perch St
                      <br />
                      Winterhaven, FL 33881
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Company Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">AI-IT Inc</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Artificial Intelligence & Information Technology Solutions
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI-IT Inc specializes in developing intelligent security and management systems that leverage
                  cutting-edge technology to protect businesses and streamline operations. Our flagship product, the
                  Rental & Storage Security POS system, represents years of research and development in network
                  security, surveillance technology, and business management software.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Founded with the mission to make enterprise-grade security accessible to businesses of all sizes,
                  AI-IT Inc continues to innovate and evolve our solutions to meet the changing needs of modern security
                  challenges.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Core Values</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span>Innovation in Security Technology</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span>Privacy-First Design</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span>Customer-Centric Solutions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span>Reliable Support & Service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Rental & Storage Security POS</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Enterprise-grade network security and management platform
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Key Features:</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Real-time network monitoring and device discovery</li>
                  <li>• Advanced camera management with RTSP streaming</li>
                  <li>• Comprehensive security assessment tools</li>
                  <li>• Customer and billing management system</li>
                  <li>• Windows-native media server integration</li>
                  <li>• Privacy-focused local data processing</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Technical Specifications</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Platform:</strong> Windows 10/11
                  </div>
                  <div>
                    <strong>Technology:</strong> Next.js, Node.js, WebSocket
                  </div>
                  <div>
                    <strong>Media Server:</strong> FFmpeg-based streaming
                  </div>
                  <div>
                    <strong>Network:</strong> Nmap integration
                  </div>
                  <div>
                    <strong>Security:</strong> AES-256 encryption
                  </div>
                  <div>
                    <strong>Deployment:</strong> Local/LAN/Cloud ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal & Licensing */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <Shield className="w-5 h-5" />
            Legal & Licensing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">NOT FOR RESALE</Badge>
              <span className="text-sm text-red-700 dark:text-red-300">Proprietary Software</span>
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              This software is the exclusive property of AI-IT Inc and Steven Chason. It is protected by copyright law
              and is provided for authorized use only. Resale, redistribution, or commercial licensing without explicit
              written permission is strictly prohibited.
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              © 2024 AI-IT Inc. All rights reserved. Unauthorized use, copying, distribution, or modification is
              strictly prohibited.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact & Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Sales & Licensing</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <a href="tel:863-308-4979" className="text-blue-600 hover:underline">
                    863-308-4979
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <a href="mailto:sales@ai-it.com" className="text-blue-600 hover:underline">
                    sales@ai-it.com
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Technical Support</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <a href="tel:863-308-4979" className="text-blue-600 hover:underline">
                    863-308-4979
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <a href="mailto:support@ai-it.com" className="text-blue-600 hover:underline">
                    support@ai-it.com
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Business Hours</h4>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div>Monday - Friday</div>
                <div>9:00 AM - 5:00 PM EST</div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    24/7 Emergency Support Available
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-slate-50 dark:bg-slate-800">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Established 2024 • Winterhaven, Florida
              </span>
            </div>
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              AI-IT Inc - Securing Your Future
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
