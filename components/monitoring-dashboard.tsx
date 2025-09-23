/**
 * Comprehensive Monitoring Dashboard
 * Real-time monitoring and analytics for the AgentDash platform
 * Provides insights into performance, security, strategic objectives, and system health
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Lock,
  Server,
  TrendingUp,
  Users,
  Zap,
  Target,
  Brain,
  Shield,
  Network,
  BarChart3,
  RefreshCw
} from 'lucide-react'

// ========== Interfaces ==========

interface MonitoringData {
  performance: PerformanceMetrics
  security: SecurityMetrics
  strategic: StrategicMetrics
  system: SystemHealth
  realtime: RealtimeMetrics
  user: UserMetrics
  api: APIMetrics
}

interface PerformanceMetrics {
  averageResponseTime: number
  throughput: number
  errorRate: number
  cacheHitRate: number
  memoryUsage: number
  cpuUsage: number
  activeConnections: number
  slowQueries: SlowQuery[]
}

interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  blockedRequests: number
  suspiciousActivity: number
  failedAuthAttempts: number
  activeThreats: SecurityThreat[]
  complianceScore: number
}

interface StrategicMetrics {
  totalObjectives: number
  completedObjectives: number
  inProgressObjectives: number
  averageProgress: number
  upcomingMilestones: number
  overdueMilestones: number
  riskDistribution: Record<string, number>
  domainProgress: DomainProgress[]
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical'
  uptime: number
  database: ComponentHealth
  storage: ComponentHealth
  cache: ComponentHealth
  api: ComponentHealth
  services: ServiceHealth[]
}

interface RealtimeMetrics {
  activeConnections: number
  messagesPerSecond: number
  subscriptions: number
  latency: number
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'
}

interface UserMetrics {
  activeUsers: number
  newUsers: number
  userGrowthRate: number
  engagementRate: number
  averageSessionDuration: number
  topFeatures: FeatureUsage[]
}

interface APIMetrics {
  totalRequests: number
  requestsPerSecond: number
  successRate: number
  averageLatency: number
  topEndpoints: EndpointMetrics[]
  errorsByType: Record<string, number>
}

interface SlowQuery {
  query: string
  duration: number
  frequency: number
  table: string
}

interface SecurityThreat {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  timestamp: Date
  status: 'active' | 'mitigated' | 'resolved'
}

interface DomainProgress {
  domain: string
  progress: number
  objectives: number
  completion: number
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'critical'
  responseTime: number
  uptime: number
  lastCheck: Date
}

interface ServiceHealth {
  name: string
  status: 'online' | 'offline' | 'degraded'
  version: string
  lastHeartbeat: Date
  dependencies: string[]
}

interface FeatureUsage {
  feature: string
  usage: number
  trend: 'up' | 'down' | 'stable'
}

interface EndpointMetrics {
  endpoint: string
  requests: number
  averageLatency: number
  errorRate: number
}

// ========== Main Component ==========

export function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  // Fetch monitoring data
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/monitoring/dashboard')
      if (!response.ok) throw new Error('Failed to fetch monitoring data')

      const result = await response.json()
      setData(result.data)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh effect
  useEffect(() => {
    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  // Calculate overall system health
  const systemHealthStatus = useMemo(() => {
    if (!data) return 'unknown'

    const components = [
      data.system.database,
      data.system.storage,
      data.system.cache,
      data.system.api
    ]

    const criticalCount = components.filter(c => c.status === 'critical').length
    const degradedCount = components.filter(c => c.status === 'degraded').length

    if (criticalCount > 0) return 'critical'
    if (degradedCount > 1) return 'degraded'
    if (degradedCount > 0) return 'warning'
    return 'healthy'
  }, [data])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'degraded': return 'text-orange-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'degraded': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading monitoring data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Monitoring Error</AlertTitle>
        <AlertDescription>
          Failed to load monitoring data: {error}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time insights into platform performance and health
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${getStatusColor(systemHealthStatus)}`}>
            {getStatusIcon(systemHealthStatus)}
            <span className="font-medium capitalize">{systemHealthStatus}</span>
          </div>

          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="Performance"
          value={`${data.performance.averageResponseTime}ms`}
          subtitle="Avg Response Time"
          trend={data.performance.errorRate < 1 ? 'up' : 'down'}
          icon={<Zap className="h-4 w-4" />}
          color="blue"
        />

        <OverviewCard
          title="Security"
          value={data.security.threatLevel}
          subtitle={`${data.security.blockedRequests} threats blocked`}
          trend="stable"
          icon={<Shield className="h-4 w-4" />}
          color={data.security.threatLevel === 'low' ? 'green' :
                 data.security.threatLevel === 'medium' ? 'yellow' : 'red'}
        />

        <OverviewCard
          title="Active Users"
          value={data.user.activeUsers.toString()}
          subtitle={`${data.user.newUsers} new today`}
          trend="up"
          icon={<Users className="h-4 w-4" />}
          color="green"
        />

        <OverviewCard
          title="Objectives"
          value={`${data.strategic.completedObjectives}/${data.strategic.totalObjectives}`}
          subtitle="Completed"
          trend={data.strategic.averageProgress > 70 ? 'up' : 'stable'}
          icon={<Target className="h-4 w-4" />}
          color="purple"
        />
      </div>

      {/* Main Monitoring Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="strategic">Strategic</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>
                  Average response time over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateMockTimeSeriesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Current system performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricRow
                  label="Throughput"
                  value={`${data.performance.throughput} req/s`}
                  progress={Math.min(data.performance.throughput / 100 * 100, 100)}
                />
                <MetricRow
                  label="Cache Hit Rate"
                  value={`${data.performance.cacheHitRate}%`}
                  progress={data.performance.cacheHitRate}
                />
                <MetricRow
                  label="Memory Usage"
                  value={`${data.performance.memoryUsage}%`}
                  progress={data.performance.memoryUsage}
                />
                <MetricRow
                  label="Error Rate"
                  value={`${data.performance.errorRate}%`}
                  progress={data.performance.errorRate}
                  warning={data.performance.errorRate > 1}
                />
              </CardContent>
            </Card>

            {data.performance.slowQueries.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Slow Queries</CardTitle>
                  <CardDescription>Database queries requiring optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.performance.slowQueries.map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <p className="font-mono text-sm">{query.query}</p>
                          <p className="text-sm text-muted-foreground">
                            Table: {query.table} • Frequency: {query.frequency}x
                          </p>
                        </div>
                        <Badge variant="destructive">{query.duration}ms</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>Current security status and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Threat Level</span>
                  <Badge
                    variant={
                      data.security.threatLevel === 'low' ? 'default' :
                      data.security.threatLevel === 'medium' ? 'secondary' :
                      data.security.threatLevel === 'high' ? 'destructive' : 'destructive'
                    }
                  >
                    {data.security.threatLevel.toUpperCase()}
                  </Badge>
                </div>

                <MetricRow
                  label="Compliance Score"
                  value={`${data.security.complianceScore}%`}
                  progress={data.security.complianceScore}
                />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Blocked Requests</span>
                    <span className="font-medium">{data.security.blockedRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suspicious Activity</span>
                    <span className="font-medium">{data.security.suspiciousActivity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Auth Attempts</span>
                    <span className="font-medium">{data.security.failedAuthAttempts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {data.security.activeThreats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Threats</CardTitle>
                  <CardDescription>Detected security threats requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.security.activeThreats.slice(0, 5).map((threat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{threat.type}</p>
                          <p className="text-sm text-muted-foreground">
                            From: {threat.source}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              threat.severity === 'critical' ? 'destructive' :
                              threat.severity === 'high' ? 'destructive' :
                              threat.severity === 'medium' ? 'secondary' : 'default'
                            }
                          >
                            {threat.severity}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {threat.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Strategic Tab */}
        <TabsContent value="strategic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Objectives Progress</CardTitle>
                <CardDescription>Strategic objectives completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {Math.round(data.strategic.averageProgress)}%
                    </div>
                    <p className="text-muted-foreground">Average Progress</p>
                  </div>

                  <Progress value={data.strategic.averageProgress} className="h-3" />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {data.strategic.completedObjectives}
                      </div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {data.strategic.inProgressObjectives}
                      </div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {data.strategic.overdueMilestones}
                      </div>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain Progress</CardTitle>
                <CardDescription>Progress by strategic domain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.strategic.domainProgress.map((domain, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{domain.domain}</span>
                        <span className="text-sm text-muted-foreground">
                          {domain.completion}/{domain.objectives}
                        </span>
                      </div>
                      <Progress value={domain.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Risk levels across strategic objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(data.strategic.riskDistribution).map(([key, value]) => ({
                        name: key,
                        value,
                        fill: key === 'low' ? '#10b981' :
                              key === 'medium' ? '#f59e0b' :
                              key === 'high' ? '#ef4444' : '#dc2626'
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {Object.entries(data.strategic.riskDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Components</CardTitle>
                <CardDescription>Health status of core system components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ComponentHealthRow
                  name="Database"
                  status={data.system.database.status}
                  responseTime={data.system.database.responseTime}
                  uptime={data.system.database.uptime}
                  icon={<Database className="h-4 w-4" />}
                />
                <ComponentHealthRow
                  name="Storage"
                  status={data.system.storage.status}
                  responseTime={data.system.storage.responseTime}
                  uptime={data.system.storage.uptime}
                  icon={<Server className="h-4 w-4" />}
                />
                <ComponentHealthRow
                  name="Cache"
                  status={data.system.cache.status}
                  responseTime={data.system.cache.responseTime}
                  uptime={data.system.cache.uptime}
                  icon={<Zap className="h-4 w-4" />}
                />
                <ComponentHealthRow
                  name="API"
                  status={data.system.api.status}
                  responseTime={data.system.api.responseTime}
                  uptime={data.system.api.uptime}
                  icon={<Globe className="h-4 w-4" />}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services Status</CardTitle>
                <CardDescription>External services and dependencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.system.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          v{service.version} • {service.dependencies.length} dependencies
                        </p>
                      </div>
                      <Badge
                        variant={
                          service.status === 'online' ? 'default' :
                          service.status === 'degraded' ? 'secondary' : 'destructive'
                        }
                      >
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>User engagement and activity metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricRow
                  label="Active Users"
                  value={data.user.activeUsers.toString()}
                  progress={Math.min(data.user.activeUsers / 1000 * 100, 100)}
                />
                <MetricRow
                  label="Engagement Rate"
                  value={`${data.user.engagementRate}%`}
                  progress={data.user.engagementRate}
                />
                <MetricRow
                  label="Growth Rate"
                  value={`${data.user.userGrowthRate}%`}
                  progress={Math.abs(data.user.userGrowthRate)}
                />

                <div className="flex justify-between">
                  <span>Avg Session Duration</span>
                  <span className="font-medium">
                    {Math.round(data.user.averageSessionDuration / 60)}m
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most popular platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.user.topFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{feature.feature}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{feature.usage}</span>
                        <TrendIcon trend={feature.trend} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
                <CardDescription>API request metrics and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricRow
                  label="Requests per Second"
                  value={data.api.requestsPerSecond.toString()}
                  progress={Math.min(data.api.requestsPerSecond / 100 * 100, 100)}
                />
                <MetricRow
                  label="Success Rate"
                  value={`${data.api.successRate}%`}
                  progress={data.api.successRate}
                />
                <MetricRow
                  label="Average Latency"
                  value={`${data.api.averageLatency}ms`}
                  progress={Math.max(100 - data.api.averageLatency / 10, 0)}
                />

                <div className="flex justify-between">
                  <span>Total Requests</span>
                  <span className="font-medium">{data.api.totalRequests.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
                <CardDescription>Most frequently accessed API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.api.topEndpoints.map((endpoint, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-mono">{endpoint.endpoint}</span>
                        <span className="text-sm text-muted-foreground">
                          {endpoint.requests} reqs
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{endpoint.averageLatency}ms avg</span>
                        <span>{endpoint.errorRate}% errors</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ========== Helper Components ==========

function OverviewCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color
}: {
  title: string
  value: string
  subtitle: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
}) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    yellow: 'border-yellow-500 bg-yellow-50',
    red: 'border-red-500 bg-red-50',
    purple: 'border-purple-500 bg-purple-50'
  }

  return (
    <Card className={`border-l-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="text-2xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricRow({
  label,
  value,
  progress,
  warning = false
}: {
  label: string
  value: string
  progress: number
  warning?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-sm">{label}</span>
        <span className={`text-sm font-medium ${warning ? 'text-red-600' : ''}`}>
          {value}
        </span>
      </div>
      <Progress
        value={progress}
        className={`h-2 ${warning ? '[&>div]:bg-red-500' : ''}`}
      />
    </div>
  )
}

function ComponentHealthRow({
  name,
  status,
  responseTime,
  uptime,
  icon
}: {
  name: string
  status: string
  responseTime: number
  uptime: number
  icon: React.ReactNode
}) {
  const statusColor = status === 'healthy' ? 'text-green-600' :
                     status === 'degraded' ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div className="flex items-center space-x-3">
        <div className={statusColor}>{icon}</div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">
            {responseTime}ms • {uptime}% uptime
          </p>
        </div>
      </div>
      <Badge
        variant={status === 'healthy' ? 'default' :
                status === 'degraded' ? 'secondary' : 'destructive'}
      >
        {status}
      </Badge>
    </div>
  )
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-600" />
    case 'down':
      return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
    case 'stable':
      return <Activity className="h-4 w-4 text-gray-600" />
  }
}

// ========== Mock Data Generators ==========

function generateMockTimeSeriesData() {
  const data = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responseTime: Math.floor(Math.random() * 200) + 100,
      throughput: Math.floor(Math.random() * 50) + 20,
      errorRate: Math.random() * 2
    })
  }

  return data
}

export default MonitoringDashboard