"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Key,
  FileText,
  Users,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Smartphone,
  Laptop,
  Database,
  Network,
  Zap,
  Brain,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  Info,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Sort,
  MoreHorizontal
} from "lucide-react"

interface SecurityThreat {
  id: string
  type: 'malware' | 'phishing' | 'brute_force' | 'data_breach' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  target: string
  timestamp: Date
  status: 'active' | 'blocked' | 'investigating' | 'resolved'
  description: string
  impact: string
  action: string
}

interface SecurityMetrics {
  totalThreats: number
  threatsBlocked: number
  threatsActive: number
  threatsResolved: number
  securityScore: number
  uptime: number
  lastScan: Date
  encryptionStatus: 'active' | 'inactive'
  firewallStatus: 'active' | 'inactive'
  antivirusStatus: 'active' | 'inactive'
}

interface EncryptionStatus {
  messaging: boolean
  fileStorage: boolean
  videoCalls: boolean
  dataTransmission: boolean
  database: boolean
  backups: boolean
}

interface ComplianceReport {
  gdpr: boolean
  ccpa: boolean
  sox: boolean
  hipaa: boolean
  iso27001: boolean
  lastAudit: Date
  nextAudit: Date
  complianceScore: number
}

interface FortKnoxSecurityDashboardProps {
  className?: string
}

export function FortKnoxSecurityDashboard({ className }: FortKnoxSecurityDashboardProps) {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalThreats: 1247,
    threatsBlocked: 1189,
    threatsActive: 12,
    threatsResolved: 46,
    securityScore: 94,
    uptime: 99.9,
    lastScan: new Date(),
    encryptionStatus: 'active',
    firewallStatus: 'active',
    antivirusStatus: 'active'
  })

  const [encryption, setEncryption] = useState<EncryptionStatus>({
    messaging: true,
    fileStorage: true,
    videoCalls: true,
    dataTransmission: true,
    database: true,
    backups: true
  })

  const [compliance, setCompliance] = useState<ComplianceReport>({
    gdpr: true,
    ccpa: true,
    sox: true,
    hipaa: true,
    iso27001: true,
    lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextAudit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    complianceScore: 98
  })

  const [threats, setThreats] = useState<SecurityThreat[]>([
    {
      id: '1',
      type: 'phishing',
      severity: 'high',
      source: 'suspicious-email@example.com',
      target: 'user@linkedout.com',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'blocked',
      description: 'Phishing attempt detected in email',
      impact: 'Potential credential theft',
      action: 'Email blocked and user notified'
    },
    {
      id: '2',
      type: 'brute_force',
      severity: 'medium',
      source: '192.168.1.100',
      target: 'login endpoint',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'blocked',
      description: 'Multiple failed login attempts',
      impact: 'Account compromise risk',
      action: 'IP address blocked for 24 hours'
    },
    {
      id: '3',
      type: 'malware',
      severity: 'critical',
      source: 'malicious-file.exe',
      target: 'user workstation',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'investigating',
      description: 'Malware detected in uploaded file',
      impact: 'System compromise',
      action: 'File quarantined, system scan initiated'
    }
  ])

  const [isScanning, setIsScanning] = useState(false)

  const handleScan = async () => {
    setIsScanning(true)
    // Simulate scan
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsScanning(false)
    setMetrics(prev => ({
      ...prev,
      lastScan: new Date(),
      securityScore: Math.min(100, prev.securityScore + 2)
    }))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-red-100 text-red-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FortKnox Security Dashboard</h1>
          <p className="text-gray-600">Enterprise-grade security for your LinkedOut platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Run Security Scan'}</span>
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-3xl font-bold text-green-600">{metrics.securityScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress value={metrics.securityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threats Blocked</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.threatsBlocked}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {((metrics.threatsBlocked / metrics.totalThreats) * 100).toFixed(1)}% success rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-3xl font-bold text-red-600">{metrics.threatsActive}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {metrics.threatsActive > 0 ? 'Requires attention' : 'All clear'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-3xl font-bold text-green-600">{metrics.uptime}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Last 30 days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="threats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Threat Detection Tab */}
        <TabsContent value="threats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Recent Security Threats</span>
              </CardTitle>
              <CardDescription>
                Real-time threat detection and response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.map((threat) => (
                  <div key={threat.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(threat.status)}>
                          {threat.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {threat.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {threat.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Source</p>
                        <p className="text-sm text-gray-900">{threat.source}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Target</p>
                        <p className="text-sm text-gray-900">{threat.target}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Description</p>
                      <p className="text-sm text-gray-900">{threat.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Impact</p>
                        <p className="text-sm text-gray-900">{threat.impact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Action Taken</p>
                        <p className="text-sm text-gray-900">{threat.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Encryption Tab */}
        <TabsContent value="encryption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Encryption Status</span>
              </CardTitle>
              <CardDescription>
                End-to-end encryption across all platform components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(encryption).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {value ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                      <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {value ? 'Encrypted' : 'Unencrypted'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">All Systems Encrypted</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your data is protected with end-to-end encryption across all platform components.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Compliance Status</span>
              </CardTitle>
              <CardDescription>
                Regulatory compliance and audit status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(compliance).filter(([key]) => !['lastAudit', 'nextAudit', 'complianceScore'].includes(key)).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {value ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {key.toUpperCase()}
                        </span>
                      </div>
                      <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {value ? 'Compliant' : 'Non-Compliant'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Compliance Score</p>
                    <p className="text-3xl font-bold text-green-600">{compliance.complianceScore}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Last Audit</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {compliance.lastAudit.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Next Audit</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {compliance.nextAudit.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Threat Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Malware</span>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">-12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phishing</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">+8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Brute Force</span>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">-5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Threat Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Phishing</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Malware</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Brute Force</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Other</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
