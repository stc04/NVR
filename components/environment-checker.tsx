"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, XCircle, Info, ExternalLink, Copy, Eye, EyeOff } from "lucide-react"

interface EnvironmentVariable {
  name: string
  value: string | undefined
  required: boolean
  description: string
  example?: string
}

export function EnvironmentChecker() {
  const [showValues, setShowValues] = useState(false)
  const [copiedVar, setCopiedVar] = useState<string>("")

  const environmentVars: EnvironmentVariable[] = [
    {
      name: "NEXT_PUBLIC_MEDIA_SERVER_URL",
      value: process.env.NEXT_PUBLIC_MEDIA_SERVER_URL,
      required: true,
      description: "URL for the Windows media server",
      example: "http://localhost:8000",
    },
    {
      name: "NEXT_PUBLIC_WEBSOCKET_URL",
      value: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
      required: true,
      description: "WebSocket URL for real-time communication",
      example: "ws://localhost:8001",
    },
    {
      name: "NEXT_PUBLIC_NETWORK_BRIDGE_URL",
      value: process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL,
      required: false,
      description: "URL for the network bridge service",
      example: "http://localhost:3001",
    },
    {
      name: "NODE_ENV",
      value: process.env.NODE_ENV,
      required: false,
      description: "Node.js environment mode",
      example: "development",
    },
  ]

  const copyToClipboard = async (text: string, varName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedVar(varName)
      setTimeout(() => setCopiedVar(""), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const getVariableStatus = (envVar: EnvironmentVariable) => {
    if (envVar.required && !envVar.value) return "error"
    if (!envVar.value) return "warning"
    return "success"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    }
  }

  const requiredVars = environmentVars.filter((v) => v.required)
  const missingRequired = requiredVars.filter((v) => !v.value)
  const hasAllRequired = missingRequired.length === 0

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Alert className={hasAllRequired ? "border-green-200" : "border-red-200"}>
        {hasAllRequired ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">
                Environment Status:{" "}
                {hasAllRequired ? "All Required Variables Set" : `${missingRequired.length} Required Variables Missing`}
              </span>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {hasAllRequired
                  ? "Your environment is properly configured for Windows localhost setup."
                  : "Some required environment variables are missing. The system may not function correctly."}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)}>
              {showValues ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showValues ? "Hide" : "Show"} Values
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {environmentVars.map((envVar) => {
              const status = getVariableStatus(envVar)
              return (
                <div key={envVar.name} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(status)}
                        <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {envVar.name}
                        </code>
                        <Badge className={getStatusColor(status)} variant="outline">
                          {envVar.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{envVar.description}</p>

                      {/* Current Value */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">Current Value:</span>
                          {envVar.value ? (
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                {showValues ? envVar.value : "••••••••"}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(envVar.value!, envVar.name)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              {copiedVar === envVar.name && <span className="text-xs text-green-600">Copied!</span>}
                            </div>
                          ) : (
                            <span className="text-xs text-red-600">Not set</span>
                          )}
                        </div>

                        {/* Example Value */}
                        {envVar.example && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Example:</span>
                            <code className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              {envVar.example}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Windows Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Windows Localhost Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            For Windows localhost development with media server on port 8000:
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="font-medium mb-2">1. Local Development (.env.local)</div>
              <code className="text-xs block whitespace-pre-wrap">
                {`NEXT_PUBLIC_MEDIA_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8001
NEXT_PUBLIC_NETWORK_BRIDGE_URL=http://localhost:3001`}
              </code>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="font-medium mb-2">2. Network Access (LAN)</div>
              <code className="text-xs block whitespace-pre-wrap">
                {`NEXT_PUBLIC_MEDIA_SERVER_URL=http://192.168.1.100:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://192.168.1.100:8001
NEXT_PUBLIC_NETWORK_BRIDGE_URL=http://192.168.1.100:3001`}
              </code>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="font-medium mb-2">3. Production Deployment</div>
              <code className="text-xs block whitespace-pre-wrap">
                {`NEXT_PUBLIC_MEDIA_SERVER_URL=https://your-domain.com:8000
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com:8001
NEXT_PUBLIC_NETWORK_BRIDGE_URL=https://your-domain.com:3001`}
              </code>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Quick Setup Commands:</div>
                <div className="text-sm">
                  <div>
                    1. Run the Windows installation script: <code>.\install-windows.ps1</code>
                  </div>
                  <div>
                    2. Start services: <code>.\start-system.bat</code>
                  </div>
                  <div>
                    3. Access frontend: <code>http://localhost:3000</code>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Service URLs */}
      <Card>
        <CardHeader>
          <CardTitle>Service Access URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium">Frontend Application</div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1">
                  {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(window.location.origin, "_blank")}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Media Server</div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1">
                  {process.env.NEXT_PUBLIC_MEDIA_SERVER_URL || "http://localhost:8000"}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(process.env.NEXT_PUBLIC_MEDIA_SERVER_URL || "http://localhost:8000", "_blank")
                  }
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Network Bridge</div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1">
                  {process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_NETWORK_BRIDGE_URL || "http://localhost:3001"}/health`,
                      "_blank",
                    )
                  }
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">WebSocket Connection</div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1">
                  {process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8001"}
                </code>
                <Badge variant="outline" className="text-xs">
                  WebSocket
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
