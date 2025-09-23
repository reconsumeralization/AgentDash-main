"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import {
  Linkedin as LinkedIn,
  Zap,
  Users,
  TrendingUp,
  MessageSquare,
  Share2,
  Target,
  Globe,
  Settings,
  BarChart3,
  Network,
  Lightbulb,
  Rocket,
  Shield,
  Database,
  Code,
  Briefcase,
  Mail,
  Calendar,
  FileText
} from 'lucide-react'
import { UniversalAddonConnector } from './universal-addon-connector'

export interface LinkedInAddonMetrics {
  totalConnections: number
  activeIntegrations: number
  dataPointsSynced: number
  engagementRate: number
  lastSync: Date
  pendingActions: number
}

export function LinkedInAddonDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics] = useState<LinkedInAddonMetrics>({
    totalConnections: 29847,
    activeIntegrations: 12,
    dataPointsSynced: 2456800,
    engagementRate: 8.5,
    lastSync: new Date(),
    pendingActions: 7
  })

  const quickActions = [
    {
      id: 'sync-all',
      label: 'Sync All Platforms',
      description: 'Update data across all connected platforms',
      icon: Zap,
      action: () => console.log('Sync all platforms')
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      description: 'Create comprehensive LinkedIn analytics report',
      icon: BarChart3,
      action: () => console.log('Generate report')
    },
    {
      id: 'optimize-network',
      label: 'Optimize Network',
      description: 'AI-powered network optimization suggestions',
      icon: Target,
      action: () => console.log('Optimize network')
    },
    {
      id: 'engage-contacts',
      label: 'Smart Engagement',
      description: 'Automated engagement with high-value connections',
      icon: MessageSquare,
      action: () => console.log('Smart engagement')
    }
  ]

  const integrationCategories = [
    {
      name: 'Social Platforms',
      count: 4,
      platforms: ['Twitter/X', 'GitHub', 'Discord', 'Reddit'],
      icon: Globe
    },
    {
      name: 'Communication',
      count: 3,
      platforms: ['Slack', 'Outlook', 'Discord'],
      icon: MessageSquare
    },
    {
      name: 'Productivity',
      count: 5,
      platforms: ['Notion', 'Google Calendar', 'Trello', 'Asana', 'Evernote'],
      icon: Briefcase
    },
    {
      name: 'Analytics',
      count: 3,
      platforms: ['Google Analytics', 'Mixpanel', 'Hotjar'],
      icon: BarChart3
    },
    {
      name: 'Business',
      count: 4,
      platforms: ['HubSpot', 'Salesforce', 'Stripe', 'QuickBooks'],
      icon: Database
    },
    {
      name: 'Development',
      count: 6,
      platforms: ['GitHub', 'GitLab', 'Jira', 'Figma', 'Postman', 'VS Code'],
      icon: Code
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LinkedIn className="w-8 h-8 text-blue-600" />
            LinkedIn Addon Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive LinkedIn integration with 20+ platforms for ultimate professional networking
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="w-3 h-3 mr-1" />
            Enterprise Grade
          </Badge>
          <Button onClick={() => window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI}&scope=r_liteprofile%20r_emailaddress%20w_member_social`}>
            <LinkedIn className="w-4 h-4 mr-2" />
            Connect LinkedIn
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Connections</p>
                <p className="text-2xl font-bold">{metrics.totalConnections.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                <p className="text-2xl font-bold">{metrics.activeIntegrations}</p>
              </div>
              <Network className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Zap className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-blue-600">20+ platforms available</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Points Synced</p>
                <p className="text-2xl font-bold">{(metrics.dataPointsSynced / 1000000).toFixed(1)}M</p>
              </div>
              <Database className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Last sync: {metrics.lastSync.toLocaleTimeString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">{metrics.engagementRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">{metrics.pendingActions} pending actions</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Powerful automation tools to supercharge your LinkedIn presence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={action.action}
              >
                <action.icon className="w-6 h-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Platform Ecosystem
          </CardTitle>
          <CardDescription>
            20+ platforms integrated with LinkedIn for comprehensive professional networking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationCategories.map((category) => (
              <div key={category.name} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <category.icon className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-500">{category.count} platforms</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {category.platforms.slice(0, 3).map((platform) => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                  {category.platforms.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{category.platforms.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">LinkedIn Core</TabsTrigger>
          <TabsTrigger value="integrations">Universal Addons</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>LinkedIn AI Command Center:</strong> Your professional network is now enhanced with AI-powered insights,
              automated engagement, and cross-platform synchronization. Connect with 4-star generals, optimize your network,
              and scale your professional relationships like never before.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Universal Integration Hub:</strong> Seamlessly connect LinkedIn with all your professional tools.
              Sync contacts, share content, track engagement, and automate workflows across 20+ platforms.
            </AlertDescription>
          </Alert>

          <UniversalAddonConnector />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              <strong>Advanced Analytics:</strong> Comprehensive insights into your professional network performance,
              cross-platform engagement metrics, and AI-powered recommendations for growth.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Growth</CardTitle>
                <CardDescription>Connection acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Network growth chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Content performance and interaction rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Profile Views</span>
                    <span className="font-medium">1,250</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Post Impressions</span>
                    <span className="font-medium">15,400</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Connection Requests</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Messages Received</span>
                    <span className="font-medium">67</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cross-Platform Insights</CardTitle>
                <CardDescription>Integrated analytics across all connected platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">89%</div>
                    <div className="text-sm text-gray-500">Twitter Engagement Lift</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <div className="text-sm text-gray-500">GitHub Contributions</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">42</div>
                    <div className="text-sm text-gray-500">Calendar Events Synced</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">🚀 Ready to Scale Your Professional Network?</h3>
            <p className="text-gray-600 mb-4">
              With LinkedIn Addon Hub, you're not just networking—you're building an integrated professional ecosystem
              that works 24/7 to expand your influence and opportunities.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Rocket className="w-4 h-4 mr-2" />
                Start Full Integration
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
