"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Lock,
  Wifi,
  Camera,
  Router,
  Monitor,
  Info,
  ExternalLink,
  FileText,
  Activity,
} from "lucide-react"
import type { NetworkDevice } from "@/types"
import { securityScanner, type SecurityAssessment } from "@/lib/security-scanner"

interface SecurityAssessmentProps {
  devices: NetworkDevice[]
}

export function SecurityAssessmentComponent({ devices }: SecurityAssessmentProps) {
  const [assessments, setAssessments] = useState<SecurityAssessment[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<SecurityAssessment | null>(null)

  useEffect(() => {
    // Load saved assessments
    const savedAssessments = localStorage.getItem("securityAssessments")
    if (savedAssessments) {
      setAssessments(JSON.parse(savedAssessments))
    }
  }, [])

  const saveAssessments = (newAssessments: SecurityAssessment[]) => {
    setAssessments(newAssessments)
    localStorage.setItem("securityAssessments", JSON.stringify(newAssessments))
  }

  const scanAllDevices = async () => {
    setIsScanning(true)
    setScanProgress(0)

    const newAssessments: SecurityAssessment[] = []
    const totalDevices = devices.length

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i]
      try {
        const assessment = await securityScanner.assessDevice(device)
        newAssessments.push(assessment)

        // Update existing assessments or add new ones
        const existingIndex = assessments.findIndex((a) => a.deviceId === device.id)
        if (existingIndex >= 0) {
          const updated = [...assessments]
          updated[existingIndex] = assessment
          saveAssessments(updated)
        } else {
          saveAssessments([...assessments, assessment])
        }
      } catch (error) {
        console.error(`Failed to assess device ${device.ip}:`, error)
      }

      setScanProgress(Math.round(((i + 1) / totalDevices) * 100))
    }

    setIsScanning(false)
  }

  const scanSingleDevice = async (device: NetworkDevice) => {
    try {
      const assessment = await securityScanner.assessDevice(device)

      const existingIndex = assessments.findIndex((a) => a.deviceId === device.id)
      if (existingIndex >= 0) {
        const updated = [...assessments]
        updated[existingIndex] = assessment
        saveAssessments(updated)
      } else {
        saveAssessments([...assessments, assessment])
      }

      setSelectedAssessment(assessment)
    } catch (error) {
      console.error(`Failed to assess device ${device.ip}:`, error)
    }
  }

  const exportAssessments = () => {
    const data = {
      securityAssessments: assessments,
      summary: getOverallSummary(),
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `security-assessment-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getOverallSummary = () => {
    const totalDevices = assessments.length
    const criticalDevices = assessments.filter((a) => a.overallRisk === "critical").length
    const highRiskDevices = assessments.filter((a) => a.overallRisk === "high").length
    const totalVulnerabilities = assessments.reduce((sum, a) => sum + a.vulnerabilities.length, 0)
    const criticalVulns = assessments.reduce(
      (sum, a) => sum + a.vulnerabilities.filter((v) => v.severity === "critical").length,
      0,
    )

    return {
      totalDevices,
      criticalDevices,
      highRiskDevices,
      totalVulnerabilities,
      criticalVulns,
      averageRiskScore:
        totalDevices > 0 ? Math.round(assessments.reduce((sum, a) => sum + a.riskScore, 0) / totalDevices) : 0,
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-red-600 dark:text-red-400"
      case "high":
        return "text-orange-600 dark:text-orange-400"
      case "medium":
        return "text-yellow-600 dark:text-yellow-400"
      case "low":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "camera":
        return <Camera className="w-5 h-5" />
      case "router":
        return <Router className="w-5 h-5" />
      case "nvr":
        return <Monitor className="w-5 h-5" />
      default:
        return <Wifi className="w-5 h-5" />
    }
  }

  const summary = getOverallSummary()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Security Assessment</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Comprehensive security analysis of discovered network devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAssessments} disabled={assessments.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={scanAllDevices} disabled={isScanning || devices.length === 0}>
            {isScanning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
            {isScanning ? "Scanning..." : "Scan All Devices"}
          </Button>
        </div>
      </div>

      {/* Security Assessment Limitations */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <div className="space-y-2">
            <p className="font-semibold">Browser-Based Security Assessment Limitations:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Cannot perform deep packet inspection or advanced vulnerability scanning</li>
              <li>Limited to HTTP/HTTPS and basic protocol testing</li>
              <li>Cannot detect all types of malware or advanced persistent threats</li>
              <li>Results should be supplemented with professional security tools</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Scan Progress */}
      {isScanning && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scanning devices for security vulnerabilities...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Security Summary */}
      {assessments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Critical Risk</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{summary.criticalDevices}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">High Risk</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{summary.highRiskDevices}</p>
                </div>
                <XCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Vulnerabilities</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summary.totalVulnerabilities}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Avg Risk Score</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{summary.averageRiskScore}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices">Device Assessments</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          {/* Device List with Security Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Devices ({devices.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devices.map((device) => {
                  const assessment = assessments.find((a) => a.deviceId === device.id)
                  return (
                    <div
                      key={device.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        selectedDevice?.id === device.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => {
                        setSelectedDevice(device)
                        setSelectedAssessment(assessment || null)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(device.deviceType)}
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {device.manufacturer} {device.model}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{device.ip}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {assessment ? (
                            <>
                              <Badge className={getSeverityColor(assessment.overallRisk)}>
                                {assessment.overallRisk}
                              </Badge>
                              <span className={`text-sm font-medium ${getRiskColor(assessment.overallRisk)}`}>
                                {assessment.riskScore}
                              </span>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                scanSingleDevice(device)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Scan
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {devices.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400">No devices available for assessment</p>
                    <p className="text-sm text-slate-500 mt-2">Discover devices first using Network Discovery</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device Assessment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Assessment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAssessment ? (
                  <div className="space-y-6">
                    {/* Risk Overview */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Risk Assessment</h3>
                        <Badge className={getSeverityColor(selectedAssessment.overallRisk)}>
                          {selectedAssessment.overallRisk}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Risk Score:</span>
                          <span className={getRiskColor(selectedAssessment.overallRisk)}>
                            {selectedAssessment.riskScore}/100
                          </span>
                        </div>
                        <Progress value={selectedAssessment.riskScore} className="h-2" />
                        <div className="text-xs text-slate-500">
                          Scanned: {new Date(selectedAssessment.scanDate).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Security Checks */}
                    <div>
                      <h3 className="font-semibold mb-3">Security Checks</h3>
                      <div className="space-y-2">
                        {selectedAssessment.securityChecks.map((check) => (
                          <div key={check.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              {check.status === "pass" && <CheckCircle className="w-4 h-4 text-green-500" />}
                              {check.status === "fail" && <XCircle className="w-4 h-4 text-red-500" />}
                              {check.status === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                              {check.status === "unknown" && <Info className="w-4 h-4 text-gray-500" />}
                              <span className="text-sm font-medium">{check.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {check.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Vulnerabilities */}
                    {selectedAssessment.vulnerabilities.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">
                          Vulnerabilities ({selectedAssessment.vulnerabilities.length})
                        </h3>
                        <div className="space-y-2">
                          {selectedAssessment.vulnerabilities.slice(0, 3).map((vuln) => (
                            <div key={vuln.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">{vuln.title}</h4>
                                <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{vuln.description}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">{vuln.recommendation}</p>
                            </div>
                          ))}
                          {selectedAssessment.vulnerabilities.length > 3 && (
                            <p className="text-sm text-slate-500 text-center">
                              +{selectedAssessment.vulnerabilities.length - 3} more vulnerabilities
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div>
                      <h3 className="font-semibold mb-3">Recommendations</h3>
                      <ul className="space-y-1">
                        {selectedAssessment.recommendations.slice(0, 5).map((rec, index) => (
                          <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : selectedDevice ? (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No security assessment available</p>
                    <Button onClick={() => scanSingleDevice(selectedDevice)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Run Security Scan
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400">Select a device to view assessment details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          {/* All Vulnerabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                All Vulnerabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.length > 0 ? (
                <div className="space-y-4">
                  {assessments.flatMap((assessment) =>
                    assessment.vulnerabilities.map((vuln) => (
                      <div key={vuln.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{vuln.title}</h3>
                              <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                              {vuln.cvss && (
                                <Badge variant="outline" className="text-xs">
                                  CVSS: {vuln.cvss}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{vuln.description}</p>
                            <p className="text-sm text-slate-800 dark:text-slate-200 mb-2">
                              <strong>Impact:</strong> {vuln.impact}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Recommendation:</strong> {vuln.recommendation}
                            </p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <p>{assessments.find((a) => a.vulnerabilities.includes(vuln))?.deviceIP}</p>
                            {vuln.cve && (
                              <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                                <a
                                  href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vuln.cve}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {vuln.cve} <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )),
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">No vulnerability assessments available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {/* Compliance Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["GDPR", "HIPAA", "PCI DSS", "NIST"].map((standard) => {
              const compliantDevices = assessments.filter((a) => {
                switch (standard) {
                  case "GDPR":
                    return a.complianceStatus.gdpr
                  case "HIPAA":
                    return a.complianceStatus.hipaa
                  case "PCI DSS":
                    return a.complianceStatus.pci
                  case "NIST":
                    return a.complianceStatus.nist
                  default:
                    return false
                }
              }).length

              const complianceRate =
                assessments.length > 0 ? Math.round((compliantDevices / assessments.length) * 100) : 0

              return (
                <Card key={standard}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {complianceRate >= 80 ? (
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : complianceRate >= 60 ? (
                          <AlertTriangle className="w-8 h-8 text-yellow-500" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{standard}</h3>
                      <p className="text-2xl font-bold mt-1">{complianceRate}%</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {compliantDevices}/{assessments.length} compliant
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Compliance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Compliance Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> This assessment provides basic compliance indicators. For official compliance
                  certification, consult with qualified security professionals and conduct comprehensive audits.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">GDPR Requirements</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 mt-0.5 text-blue-500" />
                      Data encryption in transit and at rest
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 mt-0.5 text-blue-500" />
                      Strong authentication mechanisms
                    </li>
                    <li className="flex items-start gap-2">
                      <Eye className="w-4 h-4 mt-0.5 text-blue-500" />
                      Access controls and audit logging
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">NIST Framework</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 mt-0.5 text-green-500" />
                      Identify and protect critical assets
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-green-500" />
                      Detect and respond to threats
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 mt-0.5 text-green-500" />
                      Recover from security incidents
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
