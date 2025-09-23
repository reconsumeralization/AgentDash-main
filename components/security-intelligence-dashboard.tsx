'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  Activity, 
  BarChart3,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react'

interface SecurityUpdate {
  id: string
  alias: string
  document_title: string
  severity: string
  initial_release_date: string
  current_release_date: string
  cvrf_url: string
}

interface VulnerabilityAnalysis {
  commonProducts: Array<{ product: string; count: number }>
  commonVulnerabilityTypes: Array<{ type: string; count: number }>
  severityDistribution: Record<string, number>
  monthlyTrends: Array<{ month: string; count: number }>
}

interface FuzzingCampaign {
  name: string
  description: string
  targets: string[]
  priority: 'high' | 'medium' | 'low'
  vulnerabilityTypes: string[]
  estimatedDuration: number
  successCriteria: string[]
}

interface SecurityIntelligenceDashboardProps {
  className?: string
}

export function SecurityIntelligenceDashboard({ className }: SecurityIntelligenceDashboardProps) {
  const [securityUpdates, setSecurityUpdates] = useState<SecurityUpdate[]>([])
  const [vulnerabilityAnalysis, setVulnerabilityAnalysis] = useState<VulnerabilityAnalysis | null>(null)
  const [fuzzingCampaigns, setFuzzingCampaigns] = useState<FuzzingCampaign[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d')

  // Simulate data loading
  useEffect(() => {
    loadSecurityData()
  }, [selectedTimeframe])

  const loadSecurityData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock data
      const mockUpdates: SecurityUpdate[] = [
        {
          id: '2024-01',
          alias: 'CVE-2024-0001',
          document_title: 'Windows Remote Code Execution Vulnerability',
          severity: 'Critical',
          initial_release_date: '2024-01-15T00:00:00Z',
          current_release_date: '2024-01-15T00:00:00Z',
          cvrf_url: 'https://api.msrc.microsoft.com/cvrf/v3.0/cvrf/2024-01'
        },
        {
          id: '2024-02',
          alias: 'CVE-2024-0002',
          document_title: 'Office Elevation of Privilege Vulnerability',
          severity: 'Important',
          initial_release_date: '2024-01-20T00:00:00Z',
          current_release_date: '2024-01-20T00:00:00Z',
          cvrf_url: 'https://api.msrc.microsoft.com/cvrf/v3.0/cvrf/2024-02'
        },
        {
          id: '2024-03',
          alias: 'CVE-2024-0003',
          document_title: 'Edge Information Disclosure Vulnerability',
          severity: 'Important',
          initial_release_date: '2024-01-25T00:00:00Z',
          current_release_date: '2024-01-25T00:00:00Z',
          cvrf_url: 'https://api.msrc.microsoft.com/cvrf/v3.0/cvrf/2024-03'
        }
      ]

      const mockAnalysis: VulnerabilityAnalysis = {
        commonProducts: [
          { product: 'Windows', count: 45 },
          { product: 'Office', count: 32 },
          { product: 'Edge', count: 28 },
          { product: 'SQL Server', count: 15 },
          { product: 'Exchange', count: 12 }
        ],
        commonVulnerabilityTypes: [
          { type: 'Remote Code Execution', count: 38 },
          { type: 'Elevation of Privilege', count: 29 },
          { type: 'Information Disclosure', count: 22 },
          { type: 'Denial of Service', count: 18 },
          { type: 'Cross-Site Scripting', count: 15 }
        ],
        severityDistribution: {
          'Critical': 12,
          'Important': 45,
          'Moderate': 23,
          'Low': 8
        },
        monthlyTrends: [
          { month: '2023-10', count: 15 },
          { month: '2023-11', count: 18 },
          { month: '2023-12', count: 22 },
          { month: '2024-01', count: 28 }
        ]
      }

      const mockCampaigns: FuzzingCampaign[] = [
        {
          name: 'Critical Vulnerability Fuzzing',
          description: 'High-priority fuzzing campaign targeting critical vulnerabilities from MSRC',
          targets: ['2024-01', '2024-02'],
          priority: 'high',
          vulnerabilityTypes: ['Remote Code Execution', 'Buffer Overflow'],
          estimatedDuration: 120,
          successCriteria: [
            'Identify buffer overflow vulnerabilities',
            'Detect memory corruption issues',
            'Find injection vulnerabilities'
          ]
        },
        {
          name: 'Important Vulnerability Fuzzing',
          description: 'Medium-priority fuzzing campaign targeting important vulnerabilities',
          targets: ['2024-03'],
          priority: 'medium',
          vulnerabilityTypes: ['Elevation of Privilege', 'Information Disclosure'],
          estimatedDuration: 60,
          successCriteria: [
            'Identify privilege escalation vectors',
            'Detect information disclosure issues'
          ]
        }
      ]

      setSecurityUpdates(mockUpdates)
      setVulnerabilityAnalysis(mockAnalysis)
      setFuzzingCampaigns(mockCampaigns)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load security data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'important': return 'text-orange-600 bg-orange-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            MSRC CVRF API integration for vulnerability intelligence and fuzzing
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d')}
              className="px-3 py-1 border rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <Button
            onClick={loadSecurityData}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vulnerabilities</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityUpdates.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedTimeframe} timeframe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityUpdates.filter(u => u.severity === 'Critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              High priority vulnerabilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuzzing Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuzzingCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              Active campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Data freshness
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="vulnerabilities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="campaigns">Fuzzing Campaigns</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Updates</span>
              </CardTitle>
              <CardDescription>
                Recent security vulnerabilities from Microsoft Security Response Center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getSeverityColor(update.severity)}>
                          {update.severity}
                        </Badge>
                        <span className="font-mono text-sm text-muted-foreground">
                          {update.alias}
                        </span>
                      </div>
                      <h3 className="font-medium mb-1">{update.document_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Released: {formatDate(update.current_release_date)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View CVRF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {vulnerabilityAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Severity Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(vulnerabilityAnalysis.severityDistribution).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{severity}</span>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(count / Object.values(vulnerabilityAnalysis.severityDistribution).reduce((a, b) => a + b, 0)) * 100} 
                            className="w-20" 
                          />
                          <span className="text-sm text-muted-foreground w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Monthly Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vulnerabilityAnalysis.monthlyTrends.map((trend) => (
                      <div key={trend.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{trend.month}</span>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(trend.count / Math.max(...vulnerabilityAnalysis.monthlyTrends.map(t => t.count))) * 100} 
                            className="w-20" 
                          />
                          <span className="text-sm text-muted-foreground w-8">{trend.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Common Products</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vulnerabilityAnalysis.commonProducts.slice(0, 5).map((product) => (
                      <div key={product.product} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{product.product}</span>
                        <Badge variant="secondary">{product.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Vulnerability Types</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vulnerabilityAnalysis.commonVulnerabilityTypes.slice(0, 5).map((type) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type.type}</span>
                        <Badge variant="secondary">{type.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Intelligent Fuzzing Campaigns</span>
              </CardTitle>
              <CardDescription>
                AI-generated fuzzing campaigns based on MSRC vulnerability data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fuzzingCampaigns.map((campaign, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{campaign.name}</h3>
                          <Badge className={getPriorityColor(campaign.priority)}>
                            {campaign.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {campaign.description}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Zap className="h-4 w-4 mr-2" />
                        Start Campaign
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Targets</p>
                        <p className="text-sm">{campaign.targets.length} vulnerabilities</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Duration</p>
                        <p className="text-sm">{campaign.estimatedDuration} minutes</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Vulnerability Types</p>
                        <div className="flex flex-wrap gap-1">
                          {campaign.vulnerabilityTypes.slice(0, 2).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {campaign.vulnerabilityTypes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{campaign.vulnerabilityTypes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Success Criteria</p>
                      <ul className="text-sm space-y-1">
                        {campaign.successCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Real-time Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">MSRC API Status</span>
                    <Badge className="text-green-600 bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Vulnerability Check</span>
                    <span className="text-sm text-muted-foreground">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-fuzzing Trigger</span>
                    <Badge className="text-blue-600 bg-blue-100">
                      <Zap className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Intelligence Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">MSRC CVRF API Integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Automated Vulnerability Analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Intelligent Fuzzing Campaign Generation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Real-time Threat Monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Pattern Recognition & Trend Analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This dashboard integrates with Microsoft's Security Response Center (MSRC) CVRF API 
              to provide real-time vulnerability intelligence and automatically generate targeted 
              fuzzing campaigns based on the latest security threats.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
