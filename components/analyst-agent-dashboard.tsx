"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Zap, 
  Target, 
  Users, 
  DollarSign, 
  Eye, 
  MousePointer, 
  MessageSquare, 
  Share2, 
  Heart, 
  Star,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  PieChart,
  LineChart,
  Scatter,
  Map,
  Globe,
  Smartphone,
  Laptop,
  Monitor,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
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
  Shield,
  Award,
  Trophy,
  Crown,
  Flame,
  Sparkles,
  Lightbulb,
  Rocket,
  Plane,
  Car,
  Home,
  Building,
  Factory,
  Store,
  Bank,
  School,
  Hospital,
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
  Smartphone as Phone,
  Mail,
  Phone as PhoneCall,
  MessageCircle,
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
  Hash as Number,
  DollarSign as Money,
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
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Timer,
  Stopwatch,
  Hourglass,
  Watch,
  AlarmClock,
  Bell,
  BellOff,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Camera as CameraIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Headphones as HeadphonesIcon,
  Radio as RadioIcon,
  Tv as TvIcon,
  Smartphone as PhoneIcon,
  Mail as MailIcon,
  Phone as PhoneCallIcon,
  MessageCircle as MessageCircleIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Archive as ArchiveIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  Tag as TagIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  Percent as PercentIcon,
  Hash as NumberIcon,
  DollarSign as MoneyIcon,
  Euro as EuroIcon,
  Pound as PoundIcon,
  Yen as YenIcon,
  Bitcoin as BitcoinIcon,
  CreditCard as CreditCardIcon,
  ShoppingCart as ShoppingCartIcon,
  Package as PackageIcon,
  Truck as TruckIcon,
  Box as BoxIcon,
  Gift as GiftIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  Calculator as CalculatorIcon,
  Calendar as CalendarIcon2,
  Clock as ClockIcon2,
  Timer as TimerIcon,
  Stopwatch as StopwatchIcon,
  Hourglass as HourglassIcon,
  Watch as WatchIcon,
  AlarmClock as AlarmClockIcon,
  Bell as BellIcon,
  BellOff as BellOffIcon
} from "lucide-react"

interface MarketingCampaignData {
  id: string
  name: string
  objective: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
  roas: number
  startDate: Date
  endDate: Date
  targetAudience: {
    age: string
    location: string
    interests: string[]
  }
  creative: {
    headline: string
    description: string
    imageUrl: string
  }
}

interface Insight {
  id: string
  type: 'performance' | 'optimization' | 'trend' | 'recommendation' | 'warning'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  data: any
  actionable: boolean
  action?: string
  priority: number
  createdAt: Date
}

interface Visualization {
  id: string
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'table'
  title: string
  data: any
  config: any
  insights: string[]
}

interface AnalystAgentDashboardProps {
  className?: string
}

export function AnalystAgentDashboard({ className }: AnalystAgentDashboardProps) {
  const [campaigns, setCampaigns] = useState<MarketingCampaignData[]>([
    {
      id: 'camp-1',
      name: 'LinkedOut Launch Campaign',
      objective: 'BRAND_AWARENESS',
      status: 'ACTIVE',
      budget: 10000,
      spent: 7500,
      impressions: 245000,
      clicks: 8500,
      conversions: 340,
      ctr: 3.47,
      cpc: 0.88,
      cpm: 3.06,
      roas: 4.2,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      targetAudience: {
        age: '25-45',
        location: 'North America',
        interests: ['Technology', 'Professional Development', 'Networking']
      },
      creative: {
        headline: 'Transform Your Professional Network with AI',
        description: 'Join LinkedOut - the future of professional networking',
        imageUrl: '/images/linkedout-campaign.jpg'
      }
    },
    {
      id: 'camp-2',
      name: 'Tribe Growth Campaign',
      objective: 'LEAD_GENERATION',
      status: 'ACTIVE',
      budget: 5000,
      spent: 3200,
      impressions: 180000,
      clicks: 6200,
      conversions: 280,
      ctr: 3.44,
      cpc: 0.52,
      cpm: 1.78,
      roas: 6.8,
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      targetAudience: {
        age: '28-50',
        location: 'Global',
        interests: ['Community Building', 'Leadership', 'Innovation']
      },
      creative: {
        headline: 'Build Your Professional Tribe',
        description: 'Connect with like-minded professionals and grow together',
        imageUrl: '/images/tribe-campaign.jpg'
      }
    },
    {
      id: 'camp-3',
      name: 'Security Focus Campaign',
      objective: 'CONSIDERATION',
      status: 'PAUSED',
      budget: 8000,
      spent: 2100,
      impressions: 95000,
      clicks: 2800,
      conversions: 95,
      ctr: 2.95,
      cpc: 0.75,
      cpm: 2.21,
      roas: 2.1,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      targetAudience: {
        age: '30-55',
        location: 'Enterprise Markets',
        interests: ['Cybersecurity', 'Data Protection', 'Enterprise Software']
      },
      creative: {
        headline: 'Enterprise-Grade Security for Professionals',
        description: 'FortKnox-level protection for your professional data',
        imageUrl: '/images/security-campaign.jpg'
      }
    }
  ])

  const [insights, setInsights] = useState<Insight[]>([
    {
      id: 'insight-1',
      type: 'performance',
      title: 'LinkedOut Campaign Outperforming Benchmarks',
      description: 'Your brand awareness campaign is achieving 40% higher CTR than industry average',
      impact: 'high',
      confidence: 94,
      data: { benchmark: 2.5, actual: 3.47, improvement: 38.8 },
      actionable: true,
      action: 'Consider increasing budget allocation to this campaign',
      priority: 1,
      createdAt: new Date()
    },
    {
      id: 'insight-2',
      type: 'optimization',
      title: 'Security Campaign Underperforming',
      description: 'CTR is 15% below average. Consider refreshing creative assets',
      impact: 'medium',
      confidence: 87,
      data: { benchmark: 3.5, actual: 2.95, gap: 15.7 },
      actionable: true,
      action: 'A/B test new creative variations',
      priority: 2,
      createdAt: new Date()
    },
    {
      id: 'insight-3',
      type: 'trend',
      title: 'Mobile Traffic Increasing',
      description: 'Mobile engagement up 25% week-over-week across all campaigns',
      impact: 'medium',
      confidence: 91,
      data: { mobileTraffic: 68, desktopTraffic: 32, trend: 'up' },
      actionable: true,
      action: 'Optimize campaigns for mobile-first experience',
      priority: 3,
      createdAt: new Date()
    },
    {
      id: 'insight-4',
      type: 'recommendation',
      title: 'Expand to European Markets',
      description: 'High engagement from European audiences suggests strong market fit',
      impact: 'high',
      confidence: 89,
      data: { europeanEngagement: 4.2, globalAverage: 3.1 },
      actionable: true,
      action: 'Create region-specific campaigns for Europe',
      priority: 4,
      createdAt: new Date()
    }
  ])

  const [visualizations, setVisualizations] = useState<Visualization[]>([
    {
      id: 'viz-1',
      type: 'line',
      title: 'Campaign Performance Over Time',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'LinkedOut Campaign',
            data: [2.1, 2.8, 3.2, 3.47],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Tribe Campaign',
            data: [2.9, 3.1, 3.3, 3.44],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          },
          {
            label: 'Security Campaign',
            data: [3.2, 3.0, 2.8, 2.95],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)'
          }
        ]
      },
      config: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Click-Through Rate (%)'
            }
          }
        }
      },
      insights: ['LinkedOut campaign shows strong upward trend', 'Tribe campaign maintaining consistent performance']
    },
    {
      id: 'viz-2',
      type: 'bar',
      title: 'ROAS by Campaign',
      data: {
        labels: ['LinkedOut', 'Tribe', 'Security'],
        datasets: [{
          label: 'Return on Ad Spend',
          data: [4.2, 6.8, 2.1],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
        }]
      },
      config: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'ROAS'
            }
          }
        }
      },
      insights: ['Tribe campaign delivering highest returns', 'Security campaign needs optimization']
    }
  ])

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  const handleAnalyzeCampaigns = async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
    
    // Generate new insights
    const newInsight: Insight = {
      id: `insight-${Date.now()}`,
      type: 'recommendation',
      title: 'AI-Generated Optimization Recommendation',
      description: 'Based on current performance data, consider reallocating 20% of Security campaign budget to Tribe campaign for better ROI',
      impact: 'high',
      confidence: 92,
      data: { recommendedReallocation: 20, expectedROI: 5.2 },
      actionable: true,
      action: 'Implement budget reallocation',
      priority: 1,
      createdAt: new Date()
    }
    
    setInsights(prev => [newInsight, ...prev])
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance': return TrendingUp
      case 'optimization': return Zap
      case 'trend': return BarChart3
      case 'recommendation': return Lightbulb
      case 'warning': return AlertTriangle
      default: return Info
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'performance': return 'text-green-600 bg-green-100'
      case 'optimization': return 'text-blue-600 bg-blue-100'
      case 'trend': return 'text-purple-600 bg-purple-100'
      case 'recommendation': return 'text-yellow-600 bg-yellow-100'
      case 'warning': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0)
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0)
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0)
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0)
  const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0)
  const averageCTR = campaigns.reduce((sum, campaign) => sum + campaign.ctr, 0) / campaigns.length
  const averageROAS = campaigns.reduce((sum, campaign) => sum + campaign.roas, 0) / campaigns.length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analyst Agent Dashboard</h1>
          <p className="text-gray-600">Your AI-powered data analyst for marketing insights and optimization</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleAnalyzeCampaigns}
            disabled={isAnalyzing}
            className="flex items-center space-x-2"
          >
            <Brain className={`h-4 w-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}</span>
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-blue-600">${totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                ${totalBudget.toLocaleString()} budget allocated
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-3xl font-bold text-green-600">{(totalImpressions / 1000).toFixed(0)}K</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {totalClicks.toLocaleString()} clicks
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average CTR</p>
                <p className="text-3xl font-bold text-purple-600">{averageCTR.toFixed(2)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {totalConversions.toLocaleString()} conversions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average ROAS</p>
                <p className="text-3xl font-bold text-orange-600">{averageROAS.toFixed(1)}x</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Return on ad spend
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI-Generated Insights</span>
              </CardTitle>
              <CardDescription>
                Intelligent analysis of your marketing campaign performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => {
                  const InsightIcon = getInsightIcon(insight.type)
                  return (
                    <div key={insight.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                            <InsightIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <p className="text-sm text-gray-600">{insight.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      
                      {insight.actionable && insight.action && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900">Recommended Action</p>
                              <p className="text-sm text-blue-800">{insight.action}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Implement
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Campaign Performance</span>
              </CardTitle>
              <CardDescription>
                Detailed analysis of your marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          campaign.status === 'ACTIVE' ? 'bg-green-500' :
                          campaign.status === 'PAUSED' ? 'bg-yellow-500' :
                          campaign.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">{campaign.objective}</p>
                        </div>
                      </div>
                      <Badge className={
                        campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                        campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Budget</p>
                        <p className="text-lg font-semibold text-gray-900">${campaign.budget.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">${campaign.spent.toLocaleString()} spent</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">CTR</p>
                        <p className="text-lg font-semibold text-gray-900">{campaign.ctr}%</p>
                        <p className="text-xs text-gray-500">{campaign.clicks.toLocaleString()} clicks</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">ROAS</p>
                        <p className="text-lg font-semibold text-gray-900">{campaign.roas}x</p>
                        <p className="text-xs text-gray-500">{campaign.conversions} conversions</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Impressions</p>
                        <p className="text-lg font-semibold text-gray-900">{(campaign.impressions / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-500">${campaign.cpm.toFixed(2)} CPM</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Target Audience</p>
                      <p className="text-sm text-gray-900">
                        {campaign.targetAudience.age} • {campaign.targetAudience.location} • {campaign.targetAudience.interests.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visualizations.map((viz) => (
              <Card key={viz.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {viz.type === 'line' && <LineChart className="h-5 w-5" />}
                    {viz.type === 'bar' && <BarChart3 className="h-5 w-5" />}
                    {viz.type === 'pie' && <PieChart className="h-5 w-5" />}
                    <span>{viz.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Interactive Chart</p>
                      <p className="text-xs text-gray-500">Click to expand</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Key Insights:</p>
                    {viz.insights.map((insight, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <p className="text-sm text-gray-600">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                Actionable insights to optimize your marketing performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Optimize Budget Allocation</h3>
                      <p className="text-sm text-gray-600">High-impact recommendation</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Reallocate 20% of your Security campaign budget to the Tribe campaign. 
                    Based on current performance data, this could increase your overall ROAS by 23%.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Button className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Apply Recommendation</span>
                    </Button>
                    <Button variant="outline">Learn More</Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Expand Mobile Targeting</h3>
                      <p className="text-sm text-gray-600">Trend-based recommendation</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Mobile engagement is up 25% week-over-week. Consider increasing mobile bid adjustments 
                    by 15% across all campaigns to capitalize on this trend.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Button className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Optimize Mobile</span>
                    </Button>
                    <Button variant="outline">View Trends</Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Enter European Markets</h3>
                      <p className="text-sm text-gray-600">Growth opportunity</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    European audiences are showing 35% higher engagement rates than global averages. 
                    Create region-specific campaigns to capture this high-value market.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Button className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Create EU Campaigns</span>
                    </Button>
                    <Button variant="outline">Market Analysis</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
