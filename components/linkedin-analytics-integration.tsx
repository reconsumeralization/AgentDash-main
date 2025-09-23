"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Linkedin, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Target,
  Zap,
  Brain,
  RefreshCw,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Smartphone,
  Laptop,
  Building,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Lightbulb,
  Rocket,
  Shield,
  Award,
  Trophy,
  Star,
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Stop,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Layers,
  Grid,
  List,
  Table,
  Database,
  FileText,
  Image,
  Video,
  Music,
  Link,
  ExternalLink,
  Lock,
  Unlock,
  Key,
  Coffee,
  Gamepad2,
  Camera,
  Palette,
  Code,
  Wrench,
  Hammer,
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Radio,
  Tv,
  Mail,
  Phone,
  Send,
  Reply,
  Forward,
  Archive,
  Bookmark,
  Flag,
  Tag,
  Hash,
  AtSign,
  Percent,
  Number,
  Euro,
  Pound,
  Yen,
  Bitcoin,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  Box,
  Gift,
  ShoppingBag,
  Receipt,
  Calculator,
  Timer,
  Stopwatch,
  Hourglass,
  Watch,
  AlarmClock,
  Bell,
  BellOff
} from "lucide-react"

interface LinkedInCampaign {
  id: string
  name: string
  account: string
  campaignGroup: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT'
  objectiveType: 'BRAND_AWARENESS' | 'CONSIDERATION' | 'LEAD_GENERATION' | 'WEBSITE_VISITS'
  budget: {
    amount: number
    currencyCode: string
    type: 'DAILY' | 'LIFETIME'
  }
  targetAudience: {
    locations: string[]
    industries: string[]
    jobTitles: string[]
    seniorities: string[]
  }
  creative: {
    headline: string
    description: string
    imageUrl?: string
  }
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    cpc: number
    cpm: number
    roas: number
    spend: number
  }
  performance: {
    daily: Array<{ date: string; impressions: number; clicks: number; spend: number }>
    weekly: Array<{ week: string; impressions: number; clicks: number; spend: number }>
    monthly: Array<{ month: string; impressions: number; clicks: number; spend: number }>
  }
}

interface LinkedInAnalytics {
  campaigns: LinkedInCampaign[]
  accountMetrics: {
    totalSpend: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    averageCTR: number
    averageCPC: number
    averageCPM: number
    averageROAS: number
  }
  insights: {
    topPerformingCampaign: string
    bestPerformingAudience: string
    optimalBidStrategy: string
    recommendedOptimizations: string[]
  }
  trends: {
    impressionTrend: 'up' | 'down' | 'stable'
    clickTrend: 'up' | 'down' | 'stable'
    costTrend: 'up' | 'down' | 'stable'
    conversionTrend: 'up' | 'down' | 'stable'
  }
}

interface LinkedInAnalyticsIntegrationProps {
  className?: string
}

export function LinkedInAnalyticsIntegration({ className }: LinkedInAnalyticsIntegrationProps) {
  const [analytics, setAnalytics] = useState<LinkedInAnalytics>({
    campaigns: [],
    accountMetrics: {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      averageCTR: 0,
      averageCPC: 0,
      averageCPM: 0,
      averageROAS: 0
    },
    insights: {
      topPerformingCampaign: '',
      bestPerformingAudience: '',
      optimalBidStrategy: '',
      recommendedOptimizations: []
    },
    trends: {
      impressionTrend: 'stable',
      clickTrend: 'stable',
      costTrend: 'stable',
      conversionTrend: 'stable'
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Simulate LinkedIn API connection and data fetching
  const connectToLinkedIn = async () => {
    setIsLoading(true)
    try {
      // Simulate OAuth flow and API connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsConnected(true)
      setLastSync(new Date())
      
      // Simulate fetching campaign data
      const mockCampaigns: LinkedInCampaign[] = [
        {
          id: 'linkedin-camp-1',
          name: 'LinkedOut Brand Awareness',
          account: 'urn:li:sponsoredAccount:123456',
          campaignGroup: 'urn:li:sponsoredCampaignGroup:789',
          status: 'ACTIVE',
          objectiveType: 'BRAND_AWARENESS',
          budget: {
            amount: 5000,
            currencyCode: 'USD',
            type: 'DAILY'
          },
          targetAudience: {
            locations: ['United States', 'Canada'],
            industries: ['Technology', 'Professional Services'],
            jobTitles: ['Software Engineer', 'Product Manager', 'Data Scientist'],
            seniorities: ['SENIOR', 'EXECUTIVE']
          },
          creative: {
            headline: 'Transform Your Professional Network with AI',
            description: 'Join LinkedOut - the future of professional networking powered by artificial intelligence.',
            imageUrl: '/images/linkedout-linkedin-ad.jpg'
          },
          metrics: {
            impressions: 125000,
            clicks: 4200,
            conversions: 180,
            ctr: 3.36,
            cpc: 1.19,
            cpm: 4.00,
            roas: 3.8,
            spend: 5000
          },
          performance: {
            daily: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              impressions: Math.floor(Math.random() * 5000) + 3000,
              clicks: Math.floor(Math.random() * 200) + 100,
              spend: Math.floor(Math.random() * 200) + 150
            })),
            weekly: Array.from({ length: 4 }, (_, i) => ({
              week: `Week ${i + 1}`,
              impressions: Math.floor(Math.random() * 30000) + 25000,
              clicks: Math.floor(Math.random() * 1000) + 800,
              spend: Math.floor(Math.random() * 1200) + 1000
            })),
            monthly: Array.from({ length: 3 }, (_, i) => ({
              month: `Month ${i + 1}`,
              impressions: Math.floor(Math.random() * 120000) + 100000,
              clicks: Math.floor(Math.random() * 4000) + 3000,
              spend: Math.floor(Math.random() * 5000) + 4000
            }))
          }
        },
        {
          id: 'linkedin-camp-2',
          name: 'Tribe Growth Lead Gen',
          account: 'urn:li:sponsoredAccount:123456',
          campaignGroup: 'urn:li:sponsoredCampaignGroup:790',
          status: 'ACTIVE',
          objectiveType: 'LEAD_GENERATION',
          budget: {
            amount: 3000,
            currencyCode: 'USD',
            type: 'DAILY'
          },
          targetAudience: {
            locations: ['Global'],
            industries: ['Technology', 'Consulting', 'Education'],
            jobTitles: ['Manager', 'Director', 'VP'],
            seniorities: ['SENIOR', 'EXECUTIVE']
          },
          creative: {
            headline: 'Build Your Professional Tribe',
            description: 'Connect with like-minded professionals and grow your network through AI-powered matching.',
            imageUrl: '/images/tribe-linkedin-ad.jpg'
          },
          metrics: {
            impressions: 89000,
            clicks: 3100,
            conversions: 95,
            ctr: 3.48,
            cpc: 0.97,
            cpm: 3.37,
            roas: 5.2,
            spend: 3000
          },
          performance: {
            daily: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              impressions: Math.floor(Math.random() * 3500) + 2500,
              clicks: Math.floor(Math.random() * 150) + 80,
              spend: Math.floor(Math.random() * 120) + 90
            })),
            weekly: Array.from({ length: 4 }, (_, i) => ({
              week: `Week ${i + 1}`,
              impressions: Math.floor(Math.random() * 22000) + 18000,
              clicks: Math.floor(Math.random() * 800) + 600,
              spend: Math.floor(Math.random() * 800) + 600
            })),
            monthly: Array.from({ length: 3 }, (_, i) => ({
              month: `Month ${i + 1}`,
              impressions: Math.floor(Math.random() * 90000) + 70000,
              clicks: Math.floor(Math.random() * 3000) + 2000,
              spend: Math.floor(Math.random() * 3000) + 2000
            }))
          }
        }
      ]

      const totalSpend = mockCampaigns.reduce((sum, campaign) => sum + campaign.metrics.spend, 0)
      const totalImpressions = mockCampaigns.reduce((sum, campaign) => sum + campaign.metrics.impressions, 0)
      const totalClicks = mockCampaigns.reduce((sum, campaign) => sum + campaign.metrics.clicks, 0)
      const totalConversions = mockCampaigns.reduce((sum, campaign) => sum + campaign.metrics.conversions, 0)
      const averageCTR = mockCampaigns.reduce((sum, campaign) => sum + campaign.metrics.ctr, 0) / mockCampaigns.length
      const averageCPC = mockCampaigns.reduce((sum, campaign) => sum + campaign.metrics.cpc, 0) / mockCampaigns.length
      const averageCPM = mockCampaigns.reduce((sum, campaign) => sum + campaign.metrics.cpm, 0) / mockCampaigns.length
      const averageROAS = mockCampaigns.reduce((sum, campaign) => sum + campaign.metrics.roas, 0) / mockCampaigns.length

      setAnalytics({
        campaigns: mockCampaigns,
        accountMetrics: {
          totalSpend,
          totalImpressions,
          totalClicks,
          totalConversions,
          averageCTR,
          averageCPC,
          averageCPM,
          averageROAS
        },
        insights: {
          topPerformingCampaign: 'Tribe Growth Lead Gen',
          bestPerformingAudience: 'Senior Technology Professionals',
          optimalBidStrategy: 'Enhanced CPC with 15% bid adjustment',
          recommendedOptimizations: [
            'Increase budget for Tribe Growth campaign by 25%',
            'Expand targeting to include European markets',
            'A/B test new creative variations for Brand Awareness',
            'Implement retargeting campaigns for website visitors'
          ]
        },
        trends: {
          impressionTrend: 'up',
          clickTrend: 'up',
          costTrend: 'stable',
          conversionTrend: 'up'
        }
      })

    } catch (error) {
      console.error('Failed to connect to LinkedIn:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncData = async () => {
    setIsLoading(true)
    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 1500))
      setLastSync(new Date())
    } catch (error) {
      console.error('Failed to sync data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUp
      case 'down': return ArrowDown
      case 'stable': return Minus
      default: return Minus
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'stable': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LinkedIn Analytics Integration</h1>
          <p className="text-gray-600">Connect your LinkedIn campaigns to the Analyst Agent for intelligent insights</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isConnected ? (
            <Button
              onClick={connectToLinkedIn}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Linkedin className="h-4 w-4" />
              <span>{isLoading ? 'Connecting...' : 'Connect LinkedIn'}</span>
            </Button>
          ) : (
            <Button
              onClick={syncData}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Data</span>
            </Button>
          )}
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {isConnected && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Successfully connected to LinkedIn Marketing API. 
            Last sync: {lastSync?.toLocaleString() || 'Never'}
          </AlertDescription>
        </Alert>
      )}

      {!isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connect to LinkedIn to import your campaign data and enable AI-powered insights.
          </AlertDescription>
        </Alert>
      )}

      {isConnected && (
        <>
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spend</p>
                    <p className="text-3xl font-bold text-blue-600">${analytics.accountMetrics.totalSpend.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  {React.createElement(getTrendIcon(analytics.trends.costTrend), { 
                    className: `h-4 w-4 ${getTrendColor(analytics.trends.costTrend)}` 
                  })}
                  <span className="text-xs text-gray-500">
                    {analytics.trends.costTrend} this month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Impressions</p>
                    <p className="text-3xl font-bold text-green-600">{(analytics.accountMetrics.totalImpressions / 1000).toFixed(0)}K</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  {React.createElement(getTrendIcon(analytics.trends.impressionTrend), { 
                    className: `h-4 w-4 ${getTrendColor(analytics.trends.impressionTrend)}` 
                  })}
                  <span className="text-xs text-gray-500">
                    {analytics.trends.impressionTrend} this month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average CTR</p>
                    <p className="text-3xl font-bold text-purple-600">{analytics.accountMetrics.averageCTR.toFixed(2)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  {React.createElement(getTrendIcon(analytics.trends.clickTrend), { 
                    className: `h-4 w-4 ${getTrendColor(analytics.trends.clickTrend)}` 
                  })}
                  <span className="text-xs text-gray-500">
                    {analytics.trends.clickTrend} this month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average ROAS</p>
                    <p className="text-3xl font-bold text-orange-600">{analytics.accountMetrics.averageROAS.toFixed(1)}x</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  {React.createElement(getTrendIcon(analytics.trends.conversionTrend), { 
                    className: `h-4 w-4 ${getTrendColor(analytics.trends.conversionTrend)}` 
                  })}
                  <span className="text-xs text-gray-500">
                    {analytics.trends.conversionTrend} this month
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="campaigns" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Linkedin className="h-5 w-5" />
                    <span>LinkedIn Campaigns</span>
                  </CardTitle>
                  <CardDescription>
                    Your active LinkedIn advertising campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.campaigns.map((campaign) => (
                      <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              campaign.status === 'ACTIVE' ? 'bg-green-500' :
                              campaign.status === 'PAUSED' ? 'bg-yellow-500' :
                              campaign.status === 'ARCHIVED' ? 'bg-gray-500' : 'bg-blue-500'
                            }`} />
                            <div>
                              <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                              <p className="text-sm text-gray-600">{campaign.objectiveType.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <Badge className={
                            campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                            campaign.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                          }>
                            {campaign.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Budget</p>
                            <p className="text-lg font-semibold text-gray-900">${campaign.budget.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{campaign.budget.type}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Impressions</p>
                            <p className="text-lg font-semibold text-gray-900">{(campaign.metrics.impressions / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-gray-500">{campaign.metrics.clicks.toLocaleString()} clicks</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">CTR</p>
                            <p className="text-lg font-semibold text-gray-900">{campaign.metrics.ctr}%</p>
                            <p className="text-xs text-gray-500">${campaign.metrics.cpc.toFixed(2)} CPC</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">ROAS</p>
                            <p className="text-lg font-semibold text-gray-900">{campaign.metrics.roas.toFixed(1)}x</p>
                            <p className="text-xs text-gray-500">{campaign.metrics.conversions} conversions</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">Target Audience</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{campaign.targetAudience.locations.join(', ')}</Badge>
                            <Badge variant="outline">{campaign.targetAudience.industries.join(', ')}</Badge>
                            <Badge variant="outline">{campaign.targetAudience.seniorities.join(', ')}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>AI-Generated Insights</span>
                  </CardTitle>
                  <CardDescription>
                    Intelligent analysis of your LinkedIn campaign performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Top Performing Campaign</h3>
                          <p className="text-sm text-gray-600">Performance analysis</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">
                        <strong>{analytics.insights.topPerformingCampaign}</strong> is delivering the best results with 
                        a 5.2x ROAS. The lead generation objective is resonating well with your target audience.
                      </p>
                      <div className="flex items-center space-x-4">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Duplicate Campaign
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Best Performing Audience</h3>
                          <p className="text-sm text-gray-600">Audience analysis</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">
                        <strong>{analytics.insights.bestPerformingAudience}</strong> are showing the highest engagement 
                        rates. Consider expanding this audience segment for better campaign performance.
                      </p>
                      <div className="flex items-center space-x-4">
                        <Button size="sm" variant="outline">
                          Expand Audience
                        </Button>
                        <Button size="sm" variant="outline">
                          Create Lookalike
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Optimal Bid Strategy</h3>
                          <p className="text-sm text-gray-600">Bidding optimization</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">
                        <strong>{analytics.insights.optimalBidStrategy}</strong> is recommended based on your current 
                        campaign performance and market conditions.
                      </p>
                      <div className="flex items-center space-x-4">
                        <Button size="sm" variant="outline">
                          Apply Strategy
                        </Button>
                        <Button size="sm" variant="outline">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Performance Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed performance metrics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Key Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Spend</span>
                            <span className="font-semibold">${analytics.accountMetrics.totalSpend.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Impressions</span>
                            <span className="font-semibold">{(analytics.accountMetrics.totalImpressions / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Clicks</span>
                            <span className="font-semibold">{analytics.accountMetrics.totalClicks.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Conversions</span>
                            <span className="font-semibold">{analytics.accountMetrics.totalConversions}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Performance Trends</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Impressions</span>
                            <div className="flex items-center space-x-2">
                              {React.createElement(getTrendIcon(analytics.trends.impressionTrend), { 
                                className: `h-4 w-4 ${getTrendColor(analytics.trends.impressionTrend)}` 
                              })}
                              <span className="text-sm font-medium capitalize">{analytics.trends.impressionTrend}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Clicks</span>
                            <div className="flex items-center space-x-2">
                              {React.createElement(getTrendIcon(analytics.trends.clickTrend), { 
                                className: `h-4 w-4 ${getTrendColor(analytics.trends.clickTrend)}` 
                              })}
                              <span className="text-sm font-medium capitalize">{analytics.trends.clickTrend}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Cost</span>
                            <div className="flex items-center space-x-2">
                              {React.createElement(getTrendIcon(analytics.trends.costTrend), { 
                                className: `h-4 w-4 ${getTrendColor(analytics.trends.costTrend)}` 
                              })}
                              <span className="text-sm font-medium capitalize">{analytics.trends.costTrend}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Conversions</span>
                            <div className="flex items-center space-x-2">
                              {React.createElement(getTrendIcon(analytics.trends.conversionTrend), { 
                                className: `h-4 w-4 ${getTrendColor(analytics.trends.conversionTrend)}` 
                              })}
                              <span className="text-sm font-medium capitalize">{analytics.trends.conversionTrend}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>AI Recommendations</span>
                  </CardTitle>
                  <CardDescription>
                    Actionable recommendations to optimize your LinkedIn campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.insights.recommendedOptimizations.map((recommendation, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">{recommendation}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Apply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
