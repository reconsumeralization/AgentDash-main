"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  useOffice365ManagementApi,
  Office365Utils,
  ActivityRecordType,
  WorkloadType,
  type ServiceHealthStatus,
  type ActivityRecord,
  type Subscription
} from '@/lib/office365-management-api'
import { 
  Building2, 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Globe,
  BarChart3,
  Loader2,
  RefreshCw,
  Settings,
  Bell,
  FileText,
  Database
} from 'lucide-react'

interface Office365ManagementDemoProps {
  config?: {
    tenantId: string
    clientId: string
    clientSecret: string
  }
  className?: string
}

export function Office365ManagementDemo({ config, className }: Office365ManagementDemoProps) {
  const [selectedTab, setSelectedTab] = useState('service-health')
  const [serviceHealth, setServiceHealth] = useState<ServiceHealthStatus[]>([])
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [activitySummary, setActivitySummary] = useState<any>(null)
  const [selectedWorkload, setSelectedWorkload] = useState<WorkloadType>(WorkloadType.GENERAL)
  const [selectedRecordType, setSelectedRecordType] = useState<ActivityRecordType>(ActivityRecordType.GENERAL)
  const [userId, setUserId] = useState('')
  const [dateRange, setDateRange] = useState({
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endTime: new Date().toISOString().split('T')[0]
  })

  const {
    api,
    loading,
    error,
    initializeApi,
    getServiceHealthStatus,
    getServiceHealthStatusForService,
    getServiceHealthHistory,
    getActivityRecords,
    getActivityRecordsByWorkload,
    getActivityRecordsByType,
    getUserActivity,
    getAdminActivity,
    getFailedOperations,
    getActivitySummary,
    getSubscriptions,
    createSubscription,
    stopSubscription
  } = useOffice365ManagementApi()

  // Initialize API when config is provided
  useEffect(() => {
    if (config) {
      initializeApi(config)
    }
  }, [config, initializeApi])

  // Service Health Methods
  const handleGetServiceHealth = async () => {
    const result = await getServiceHealthStatus()
    if (result) setServiceHealth(result)
  }

  const handleGetServiceHealthForService = async (serviceName: string) => {
    const result = await getServiceHealthStatusForService(serviceName)
    if (result) setServiceHealth(result)
  }

  const handleGetServiceHealthHistory = async () => {
    const result = await getServiceHealthHistory({
      startTime: dateRange.startTime,
      endTime: dateRange.endTime
    })
    if (result) setServiceHealth(result)
  }

  // Activity Methods
  const handleGetActivityRecords = async () => {
    const result = await getActivityRecords('Audit.General', {
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
      top: 100
    })
    if (result) setActivityRecords(result)
  }

  const handleGetActivityByWorkload = async () => {
    const result = await getActivityRecordsByWorkload(selectedWorkload, {
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
      top: 100
    })
    if (result) setActivityRecords(result)
  }

  const handleGetActivityByType = async () => {
    const result = await getActivityRecordsByType(selectedRecordType, {
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
      top: 100
    })
    if (result) setActivityRecords(result)
  }

  const handleGetUserActivity = async () => {
    if (!userId.trim()) return
    const result = await getUserActivity(userId.trim(), {
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
      top: 100
    })
    if (result) setActivityRecords(result)
  }

  const handleGetAdminActivity = async () => {
    const result = await getAdminActivity({
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
      top: 100
    })
    if (result) setActivityRecords(result)
  }

  const handleGetFailedOperations = async () => {
    const result = await getFailedOperations({
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
      top: 100
    })
    if (result) setActivityRecords(result)
  }

  const handleGetActivitySummary = async () => {
    const result = await getActivitySummary({
      startTime: dateRange.startTime,
      endTime: dateRange.endTime
    })
    if (result) setActivitySummary(result)
  }

  // Subscription Methods
  const handleGetSubscriptions = async () => {
    const result = await getSubscriptions()
    if (result) setSubscriptions(result)
  }

  const handleCreateSubscription = async () => {
    const subscription = {
      contentType: 'Audit.General',
      webhook: {
        address: 'https://your-webhook-url.com/webhook',
        authId: 'your-auth-id',
        expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
    const result = await createSubscription(subscription)
    if (result) {
      await handleGetSubscriptions() // Refresh subscriptions
    }
  }

  const handleStopSubscription = async (contentType: string) => {
    await stopSubscription(contentType)
    await handleGetSubscriptions() // Refresh subscriptions
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ServiceOperational':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'ServiceDegradation':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'ServiceInterruption':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'ServiceRestored':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getResultStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Office 365 Management API Demo
          </CardTitle>
          <CardDescription>
            Demonstration of Office 365 Management API integration based on the official documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* Configuration Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Configuration Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Tenant ID:</span>
                <p className="font-mono text-xs">{config?.tenantId || 'Not configured'}</p>
              </div>
              <div>
                <span className="font-medium">Client ID:</span>
                <p className="font-mono text-xs">{config?.clientId || 'Not configured'}</p>
              </div>
              <div>
                <span className="font-medium">Client Secret:</span>
                <p className="font-mono text-xs">{config?.clientSecret ? '***configured***' : 'Not configured'}</p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error.message}</p>
            </div>
          )}

          {/* Main Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="service-health" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Service Health
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Subscriptions
              </TabsTrigger>
            </TabsList>

            {/* Service Health Tab */}
            <TabsContent value="service-health" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Service Communications API</CardTitle>
                  <CardDescription>
                    Monitor Office 365 service health and communications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Service Health Controls */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={handleGetServiceHealth}
                      disabled={!api || loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                      Get Current Status
                    </Button>
                    
                    <Button 
                      onClick={handleGetServiceHealthHistory}
                      disabled={!api || loading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Get History
                    </Button>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={dateRange.startTime}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <Input
                        type="date"
                        value={dateRange.endTime}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Service Health Results */}
                  {serviceHealth.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Service Health Status</h4>
                      {serviceHealth.map((service, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(service.status)}
                                <h5 className="font-medium">{service.title}</h5>
                                <Badge variant={Office365Utils.getServiceStatusBadgeVariant(service.status)}>
                                  {service.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{service.impactDescription}</p>
                              <div className="text-xs text-gray-500">
                                <p>Last Updated: {new Date(service.lastUpdatedTime).toLocaleString()}</p>
                                {service.startTime && (
                                  <p>Start Time: {new Date(service.startTime).toLocaleString()}</p>
                                )}
                                {service.endTime && (
                                  <p>End Time: {new Date(service.endTime).toLocaleString()}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Management Activity API</CardTitle>
                  <CardDescription>
                    Monitor user, admin, system, and policy actions and events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Activity Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Workload Type</label>
                      <select
                        value={selectedWorkload}
                        onChange={(e) => setSelectedWorkload(e.target.value as WorkloadType)}
                        className="w-full border rounded px-3 py-2"
                      >
                        {Object.values(WorkloadType).map(workload => (
                          <option key={workload} value={workload}>
                            {Office365Utils.getWorkloadDisplayName(workload)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Record Type</label>
                      <select
                        value={selectedRecordType}
                        onChange={(e) => setSelectedRecordType(Number(e.target.value) as ActivityRecordType)}
                        className="w-full border rounded px-3 py-2"
                      >
                        {Object.entries(ActivityRecordType)
                          .filter(([key]) => isNaN(Number(key)))
                          .map(([key, value]) => (
                            <option key={key} value={value}>
                              {Office365Utils.getRecordTypeDisplayName(value as ActivityRecordType)}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={handleGetActivityRecords}
                      disabled={!api || loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                      Get All Activity
                    </Button>
                    
                    <Button 
                      onClick={handleGetActivityByWorkload}
                      disabled={!api || loading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Database className="h-4 w-4" />
                      By Workload
                    </Button>
                    
                    <Button 
                      onClick={handleGetActivityByType}
                      disabled={!api || loading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      By Type
                    </Button>
                    
                    <Button 
                      onClick={handleGetAdminActivity}
                      disabled={!api || loading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Admin Activity
                    </Button>
                    
                    <Button 
                      onClick={handleGetFailedOperations}
                      disabled={!api || loading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Failed Operations
                    </Button>
                  </div>

                  {/* User Activity Search */}
                  <div className="flex gap-2">
                    <Input
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter User ID"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleGetUserActivity}
                      disabled={!api || loading || !userId.trim()}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      User Activity
                    </Button>
                  </div>

                  {/* Activity Results */}
                  {activityRecords.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Activity Records ({activityRecords.length})</h4>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {activityRecords.map((record, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getResultStatusIcon(record.ResultStatus)}
                                  <span className="font-medium text-sm">{record.Operation}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {Office365Utils.getWorkloadDisplayName(record.Workload)}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <p>User: {record.UserId}</p>
                                  <p>IP: {record.ClientIP}</p>
                                  <p>Time: {new Date(record.CreationTime).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Analytics</CardTitle>
                  <CardDescription>
                    Get insights and summaries from activity data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <Button 
                    onClick={handleGetActivitySummary}
                    disabled={!api || loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                    Get Activity Summary
                  </Button>

                  {/* Analytics Results */}
                  {activitySummary && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Activity Summary</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{activitySummary.totalRecords}</div>
                          <div className="text-sm text-gray-600">Total Records</div>
                        </Card>
                        
                        <Card className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{activitySummary.successRate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Success Rate</div>
                        </Card>
                        
                        <Card className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">{Object.keys(activitySummary.byWorkload).length}</div>
                          <div className="text-sm text-gray-600">Workloads</div>
                        </Card>
                        
                        <Card className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">{Object.keys(activitySummary.byUser).length}</div>
                          <div className="text-sm text-gray-600">Users</div>
                        </Card>
                      </div>

                      {/* Top Workloads */}
                      <Card className="p-4">
                        <h5 className="font-medium mb-3">Top Workloads</h5>
                        <div className="space-y-2">
                        {Object.entries(activitySummary.byWorkload)
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 5)
                          .map(([workload, count]) => (
                            <div key={workload} className="flex justify-between items-center">
                              <span className="text-sm">{Office365Utils.getWorkloadDisplayName(workload)}</span>
                              <Badge variant="outline">{count as number}</Badge>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Top Operations */}
                      <Card className="p-4">
                        <h5 className="font-medium mb-3">Top Operations</h5>
                        <div className="space-y-2">
                        {Object.entries(activitySummary.byOperation)
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 5)
                          .map(([operation, count]) => (
                            <div key={operation} className="flex justify-between items-center">
                              <span className="text-sm">{operation}</span>
                              <Badge variant="outline">{count as number}</Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Webhook Subscriptions</CardTitle>
                  <CardDescription>
                    Manage webhook subscriptions for real-time notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleGetSubscriptions}
                      disabled={!api || loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                      Get Subscriptions
                    </Button>
                    
                    <Button 
                      onClick={handleCreateSubscription}
                      disabled={!api || loading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Create Subscription
                    </Button>
                  </div>

                  {/* Subscriptions Results */}
                  {subscriptions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Active Subscriptions</h4>
                      {subscriptions.map((subscription, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={subscription.status === 'enabled' ? 'default' : 'secondary'}>
                                  {subscription.status}
                                </Badge>
                                <span className="font-medium">{subscription.contentType}</span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Webhook: {subscription.webhook.address}</p>
                                <p>Expires: {new Date(subscription.webhook.expiration).toLocaleString()}</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleStopSubscription(subscription.contentType)}
                              disabled={!api || loading}
                              variant="outline"
                              size="sm"
                            >
                              Stop
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* API Documentation Reference */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">API Documentation Reference</CardTitle>
              <CardDescription>
                Based on Office 365 Management APIs documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Service Communications API:</strong> Monitor service health and communications
                </p>
                <p>
                  <strong>Management Activity API:</strong> Access user, admin, system, and policy activity logs
                </p>
                <p>
                  <strong>Authentication:</strong> OAuth 2.0 with client credentials flow
                </p>
                <p>
                  <strong>Data Format:</strong> OData v4 and JSON
                </p>
                <p>
                  <strong>Rate Limits:</strong> Subject to Office 365 API throttling policies
                </p>
              </div>
              <div className="mt-4">
                <a 
                  href="https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-apis-overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Full Office 365 Management APIs Documentation →
                </a>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
