"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Shield, Phone, Mail, MapPin, ExternalLink, Lock, FileText, Info, Copyright } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-100 mt-auto">
      <div className="container mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold">AI-IT Inc</h3>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                <div>
                  <div>88 Perch St</div>
                  <div>Winterhaven, FL 33881</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href="tel:863-308-4979" className="hover:text-blue-400 transition-colors">
                  863-308-4979
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href="mailto:support@ai-it.com" className="hover:text-blue-400 transition-colors">
                  support@ai-it.com
                </a>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div>Rental & Storage Security POS</div>
              <div>Version 1.0.0</div>
              <div>Enterprise Security Platform</div>
              <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                Windows Compatible
              </Badge>
            </div>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="h-8 text-slate-300 hover:text-blue-400 p-0 justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Documentation
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-slate-300 hover:text-blue-400 p-0 justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                Support Portal
              </Button>
            </div>
          </div>

          {/* Legal & Privacy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal & Privacy</h3>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="h-8 text-slate-300 hover:text-blue-400 p-0 justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-slate-300 hover:text-blue-400 p-0 justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-slate-300 hover:text-blue-400 p-0 justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Security Policy
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-slate-300 hover:text-blue-400 p-0 justify-start">
                <Info className="w-4 h-4 mr-2" />
                Compliance
              </Button>
            </div>
          </div>

          {/* Creator & License */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Creator</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="font-medium">Steven Chason</div>
              <div>Lead Developer & Architect</div>
              <div>AI-IT Inc Founder</div>
            </div>
            <div className="space-y-2">
              <Badge variant="destructive" className="text-xs">
                NOT FOR RESALE
              </Badge>
              <div className="text-xs text-slate-400">Proprietary Software</div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Copyright className="w-4 h-4" />
            <span>{currentYear} AI-IT Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Designed by Steven Chason</span>
            <Separator orientation="vertical" className="h-4 bg-slate-600" />
            <span>Winterhaven, FL</span>
          </div>
        </div>

        {/* Legal Notice */}
        <Card className="mt-6 bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="space-y-2">
                <div className="font-medium text-yellow-400">Proprietary Software Notice</div>
                <div className="text-sm text-slate-300">
                  This software is the exclusive property of AI-IT Inc and is protected by copyright law. This system is
                  provided for authorized use only and is <strong>NOT FOR RESALE</strong>, redistribution, or commercial
                  licensing without explicit written permission from AI-IT Inc.
                </div>
                <div className="text-xs text-slate-400">
                  Unauthorized use, copying, distribution, or modification is strictly prohibited.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </footer>
  )
}
