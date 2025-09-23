"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Switch } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import {
  Github,
  Twitter,
  Mail,
  MessageCircle,
  Calendar,
  FileText,
  Database,
  Zap,
  CheckCircle,
  AlertCircle,
  Settings,
  Link,
  Unlink,
  RefreshCw,
  Globe,
  Code,
  Briefcase,
  Users,
  TrendingUp,
  CreditCard
} from 'lucide-react'
import { useToast } from '@/components/providers'

export interface AddonPlatform {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'social' | 'communication' | 'productivity' | 'analytics' | 'development' | 'business'
  isConnected: boolean
  lastSync?: Date
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  config?: Record<string, any>
  capabilities: string[]
  authType: 'oauth' | 'api_key' | 'webhook' | 'none'
  dataTypes: ('profile' | 'posts' | 'connections' | 'analytics' | 'events' | 'messages')[]
}

export interface IntegrationMapping {
  id: string
  linkedinField: string
  addonField: string
  platformId: string
  syncDirection: 'linkedin_to_addon' | 'addon_to_linkedin' | 'bidirectional'
  isActive: boolean
  lastSync?: Date
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
}

export interface UniversalAddonState {
  platforms: AddonPlatform[]
  mappings: IntegrationMapping[]
  activeIntegrations: string[]
  globalSyncStatus: 'idle' | 'syncing' | 'completed' | 'error'
  syncProgress: number
  lastGlobalSync?: Date
}

const DEFAULT_PLATFORMS: AddonPlatform[] = [
  // Social Platforms
  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Connect your Twitter network and content',
    icon: Twitter,
    category: 'social',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['profile_sync', 'content_sharing', 'engagement_tracking'],
    authType: 'oauth',
    dataTypes: ['profile', 'posts', 'connections', 'analytics']
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link your development projects and contributions',
    icon: Github,
    category: 'development',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['project_sync', 'contribution_tracking', 'collaboration'],
    authType: 'oauth',
    dataTypes: ['profile', 'posts', 'analytics']
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Integrate community engagement and discussions',
    icon: MessageCircle,
    category: 'communication',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['community_sync', 'engagement_tracking', 'messaging'],
    authType: 'oauth',
    dataTypes: ['connections', 'messages', 'analytics']
  },

  // Communication Platforms
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect workplace communications and teams',
    icon: MessageCircle,
    category: 'communication',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['team_sync', 'message_tracking', 'collaboration'],
    authType: 'oauth',
    dataTypes: ['connections', 'messages', 'analytics']
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Sync email communications and calendar',
    icon: Mail,
    category: 'communication',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['email_sync', 'calendar_sync', 'contact_sync'],
    authType: 'oauth',
    dataTypes: ['messages', 'events', 'connections']
  },

  // Productivity Platforms
  {
    id: 'notion',
    name: 'Notion',
    description: 'Link knowledge base and project documentation',
    icon: FileText,
    category: 'productivity',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['document_sync', 'knowledge_base', 'project_tracking'],
    authType: 'oauth',
    dataTypes: ['posts', 'analytics']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync scheduling and event management',
    icon: Calendar,
    category: 'productivity',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['calendar_sync', 'event_management', 'reminder_sync'],
    authType: 'oauth',
    dataTypes: ['events']
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Connect project boards and task management',
    icon: Briefcase,
    category: 'productivity',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['project_sync', 'task_tracking', 'collaboration'],
    authType: 'oauth',
    dataTypes: ['posts', 'analytics']
  },

  // Analytics Platforms
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track website engagement and LinkedIn referral analytics',
    icon: TrendingUp,
    category: 'analytics',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['traffic_analysis', 'conversion_tracking', 'referral_analytics'],
    authType: 'oauth',
    dataTypes: ['analytics']
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Advanced user behavior and engagement analytics',
    icon: Database,
    category: 'analytics',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['behavior_tracking', 'funnel_analysis', 'cohort_analysis'],
    authType: 'api_key',
    dataTypes: ['analytics']
  },

  // Business Platforms
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM integration for lead management and sales',
    icon: Users,
    category: 'business',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['crm_sync', 'lead_tracking', 'sales_automation'],
    authType: 'oauth',
    dataTypes: ['connections', 'analytics']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM and customer relationship management',
    icon: Database,
    category: 'business',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['crm_sync', 'lead_management', 'pipeline_tracking'],
    authType: 'oauth',
    dataTypes: ['connections', 'analytics']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and revenue analytics',
    icon: CreditCard,
    category: 'business',
    isConnected: false,
    status: 'disconnected',
    capabilities: ['payment_sync', 'revenue_tracking', 'subscription_management'],
    authType: 'api_key',
    dataTypes: ['analytics']
  }
]

export function UniversalAddonConnector() {
  const [state, setState] = useState<UniversalAddonState>({
    platforms: DEFAULT_PLATFORMS,
    mappings: [],
    activeIntegrations: [],
    globalSyncStatus: 'idle',
    syncProgress: 0
  })

  const [selectedPlatform, setSelectedPlatform] = useState<AddonPlatform | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const toast = useToast()

  const connectPlatform = useCallback(async (platformId: string) => {
    setState(prev => ({
      ...prev,
      platforms: prev.platforms.map(p =>
        p.id === platformId ? { ...p, status: 'syncing' as const } : p
      )
    }))

    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000))

      setState(prev => ({
        ...prev,
        platforms: prev.platforms.map(p =>
          p.id === platformId
            ? { ...p, isConnected: true, status: 'connected' as const, lastSync: new Date() }
            : p
        ),
        activeIntegrations: [...prev.activeIntegrations, platformId]
      }))

      const platform = state.platforms.find(p => p.id === platformId)
      toast.success(`${platform?.name} Connected`, `Successfully connected to ${platform?.name}!`)
    } catch (error) {
      setState(prev => ({
        ...prev,
        platforms: prev.platforms.map(p =>
          p.id === platformId ? { ...p, status: 'error' as const } : p
        )
      }))
      toast.error('Connection Failed', 'Failed to connect to platform')
    }
  }, [state.platforms, toast])

  const disconnectPlatform = useCallback(async (platformId: string) => {
    setState(prev => ({
      ...prev,
      platforms: prev.platforms.map(p =>
        p.id === platformId
          ? { ...p, isConnected: false, status: 'disconnected' as const }
          : p
      ),
      activeIntegrations: prev.activeIntegrations.filter(id => id !== platformId)
    }))

    const platform = state.platforms.find(p => p.id === platformId)
    toast.success(`${platform?.name} Disconnected`, `Disconnected from ${platform?.name}`)
  }, [state.platforms, toast])

  const syncAllPlatforms = useCallback(async () => {
    setState(prev => ({ ...prev, globalSyncStatus: 'syncing', syncProgress: 0 }))

    try {
      const connectedPlatforms = state.platforms.filter(p => p.isConnected)

      for (let i = 0; i < connectedPlatforms.length; i++) {
        const platform = connectedPlatforms[i]
        const progress = ((i + 1) / connectedPlatforms.length) * 100

        setState(prev => ({ ...prev, syncProgress: progress }))

        // Simulate sync for each platform
        await new Promise(resolve => setTimeout(resolve, 1000))

        setState(prev => ({
          ...prev,
          platforms: prev.platforms.map(p =>
            p.id === platform.id ? { ...p, lastSync: new Date() } : p
          )
        }))
      }

      setState(prev => ({
        ...prev,
        globalSyncStatus: 'completed',
        lastGlobalSync: new Date()
      }))

      toast.success('Sync Complete', `Synchronized ${connectedPlatforms.length} platforms successfully!`)
    } catch (error) {
      setState(prev => ({ ...prev, globalSyncStatus: 'error' }))
      toast.error('Sync Failed', 'Failed to sync all platforms')
    }
  }, [state.platforms, toast])

  const createMapping = useCallback((mapping: Omit<IntegrationMapping, 'id'>) => {
    const newMapping: IntegrationMapping = {
      ...mapping,
      id: `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    setState(prev => ({
      ...prev,
      mappings: [...prev.mappings, newMapping]
    }))

    toast.success('Mapping Created', 'Integration mapping created successfully')
  }, [toast])

  const getPlatformIcon = (platform: AddonPlatform) => {
    const IconComponent = platform.icon
    return <IconComponent className="w-5 h-5" />
  }

  const getCategoryColor = (category: AddonPlatform['category']) => {
    switch (category) {
      case 'social': return 'bg-blue-100 text-blue-800'
      case 'communication': return 'bg-green-100 text-green-800'
      case 'productivity': return 'bg-purple-100 text-purple-800'
      case 'analytics': return 'bg-orange-100 text-orange-800'
      case 'development': return 'bg-red-100 text-red-800'
      case 'business': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: AddonPlatform['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'syncing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Unlink className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Universal Addon Connector
              </CardTitle>
              <CardDescription>
                Connect LinkedIn to all your favorite platforms for seamless data synchronization
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                {state.activeIntegrations.length} Connected
              </Badge>
              <Button
                onClick={syncAllPlatforms}
                disabled={state.globalSyncStatus === 'syncing' || state.activeIntegrations.length === 0}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${state.globalSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Sync All
              </Button>
            </div>
          </div>
        </CardHeader>
        {state.globalSyncStatus === 'syncing' && (
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm">Syncing platforms...</span>
              <Progress value={state.syncProgress} className="flex-1 max-w-xs" />
              <span className="text-sm">{Math.round(state.syncProgress)}%</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Platform Categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        {(['all', 'social', 'communication', 'productivity', 'analytics', 'development', 'business'] as const).map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.platforms
                .filter(platform => category === 'all' || platform.category === category)
                .map((platform) => (
                  <Card key={platform.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(platform)}
                          <div>
                            <CardTitle className="text-base">{platform.name}</CardTitle>
                            <Badge className={`text-xs ${getCategoryColor(platform.category)}`}>
                              {platform.category}
                            </Badge>
                          </div>
                        </div>
                        {getStatusIcon(platform.status)}
                      </div>
                      <CardDescription className="text-sm">
                        {platform.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {platform.capabilities.slice(0, 3).map((capability, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {capability.replace('_', ' ')}
                            </Badge>
                          ))}
                          {platform.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{platform.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {platform.isConnected && platform.lastSync && (
                              <>Last sync: {platform.lastSync.toLocaleDateString()}</>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!platform.isConnected ? (
                              <Button
                                size="sm"
                                onClick={() => connectPlatform(platform.id)}
                                disabled={platform.status === 'syncing'}
                              >
                                <Link className="w-3 h-3 mr-1" />
                                Connect
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedPlatform(platform)}
                                >
                                  <Settings className="w-3 h-3 mr-1" />
                                  Config
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => disconnectPlatform(platform.id)}
                                >
                                  <Unlink className="w-3 h-3 mr-1" />
                                  Disconnect
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Platform Configuration Modal */}
      {selectedPlatform && (
        <Card className="fixed inset-4 z-50 m-auto max-w-2xl max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPlatformIcon(selectedPlatform)}
                <div>
                  <CardTitle>{selectedPlatform.name} Configuration</CardTitle>
                  <CardDescription>Configure integration settings and data mappings</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedPlatform(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Authentication Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Authentication</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" placeholder="Enter API key" />
                </div>
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input id="webhook-url" placeholder="https://your-app.com/webhook" />
                </div>
              </div>
            </div>

            {/* Data Mapping */}
            <div className="space-y-4">
              <h4 className="font-medium">Data Mapping</h4>
              <div className="space-y-3">
                {selectedPlatform.dataTypes.map((dataType) => (
                  <div key={dataType} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium capitalize">{dataType}</span>
                      <p className="text-sm text-gray-500">Sync {dataType} data between platforms</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>

            {/* Sync Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Sync Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sync-frequency">Sync Frequency</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sync-direction">Sync Direction</Label>
                  <Select defaultValue="bidirectional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin_to_addon">LinkedIn → Addon</SelectItem>
                      <SelectItem value="addon_to_linkedin">Addon → LinkedIn</SelectItem>
                      <SelectItem value="bidirectional">Bidirectional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedPlatform(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Configuration Saved', 'Platform configuration updated successfully')
                setSelectedPlatform(null)
              }}>
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Overview</CardTitle>
          <CardDescription>
            Connected platforms and their sync status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{state.platforms.filter(p => p.isConnected).length}</div>
              <div className="text-sm text-gray-500">Connected Platforms</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{state.mappings.length}</div>
              <div className="text-sm text-gray-500">Active Mappings</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {state.lastGlobalSync ? state.lastGlobalSync.toLocaleDateString() : 'Never'}
              </div>
              <div className="text-sm text-gray-500">Last Global Sync</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
