"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Heart,
  Share2,
  MessageSquare,
  Users,
  Globe,
  Clock,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Play,
  Pause,
  Square,
  Settings,
  Filter,
  Download,
  Maximize2,
  Minimize2
} from "lucide-react"

interface RealTimeMetrics {
  impressions: number
  clicks: number
  engagement: number
  reach: number
  conversions: number
  cost: number
  lastUpdated: Date
}

interface MetricTrend {
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  sparkline: number[]
}

interface AudienceInsight {
  segment: string
  size: number
  engagement: number
  growth: number
  demographics: {
    age: Record<string, number>
    location: Record<string, number>
    interests: string[]
  }
}

interface PerformanceAlert {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  action?: string
}

export function RealTimeAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    impressions: 0,
    clicks: 0,
    engagement: 0,
    reach: 0,
    conversions: 0,
    cost: 0,
    lastUpdated: new Date()
  })
  
  const [trends, setTrends] = useState<MetricTrend[]>([])
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight[]>([])
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isLive, setIsLive] = useState(true)
  const [refreshRate, setRefreshRate] = useState(5000) // 5 seconds
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [expandedMetrics, setExpandedMetrics] = useState<string[]>([])

  // Real-time data simulation
  const updateMetrics = useCallback(() => {
    setMetrics(prev => ({
      impressions: prev.impressions + Math.floor(Math.random() * 100),
      clicks: prev.clicks + Math.floor(Math.random() * 10),
      engagement: prev.engagement + Math.floor(Math.random() * 15),
      reach: prev.reach + Math.floor(Math.random() * 80),
      conversions: prev.conversions + Math.floor(Math.random() * 3),
      cost: prev.cost + Math.random() * 5,
      lastUpdated: new Date()
    }))
  }, [])

  // Generate metric trends
  const generateTrends = useCallback(() => {
    const trendData: MetricTrend[] = [
      {
        name: 'Impressions',
        value: metrics.impressions,
        change: Math.random() * 20 - 10,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        sparkline: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
      },
      {
        name: 'Clicks',
        value: metrics.clicks,
        change: Math.random() * 15 - 7.5,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        sparkline: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50))
      },
      {
        name: 'Engagement',
        value: metrics.engagement,
        change: Math.random() * 25 - 12.5,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        sparkline: Array.from({ length: 12 }, () => Math.floor(Math.random() * 30))
      },
      {
        name: 'Reach',
        value: metrics.reach,
        change: Math.random() * 18 - 9,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        sparkline: Array.from({ length: 12 }, () => Math.floor(Math.random() * 80))
      }
    ]
    setTrends(trendData)
  }, [metrics])

  // Generate audience insights
  const generateAudienceInsights = useCallback(() => {
    const insights: AudienceInsight[] = [
      {
        segment: 'AI Professionals',
        size: 12500,
        engagement: 8.7,
        growth: 23.4,
        demographics: {
          age: { '25-34': 45, '35-44': 35, '45-54': 20 },
          location: { 'US': 40, 'UK': 15, 'Canada': 12, 'Germany': 10, 'Other': 23 },
          interests: ['Machine Learning', 'Data Science', 'Automation', 'Innovation']
        }
      },
      {
        segment: 'Tech Leaders',
        size: 8900,
        engagement: 12.3,
        growth: 18.7,
        demographics: {
          age: { '35-44': 50, '45-54': 35, '55-64': 15 },
          location: { 'US': 35, 'UK': 20, 'Germany': 15, 'France': 8, 'Other': 22 },
          interests: ['Leadership', 'Strategy', 'Innovation', 'Digital Transformation']
        }
      },
      {
        segment: 'Startup Founders',
        size: 6700,
        engagement: 15.8,
        growth: 31.2,
        demographics: {
          age: { '25-34': 60, '35-44': 30, '45-54': 10 },
          location: { 'US': 50, 'UK': 12, 'Canada': 10, 'Australia': 8, 'Other': 20 },
          interests: ['Entrepreneurship', 'Venture Capital', 'Innovation', 'Growth']
        }
      }
    ]
    setAudienceInsights(insights)
  }, [])

  // Generate performance alerts
  const generateAlerts = useCallback(() => {
    const alertTypes: Array<PerformanceAlert['type']> = ['success', 'warning', 'error', 'info']
    const alertMessages = {
      success: [
        'Campaign performance exceeded targets by 15%',
        'New audience segment showing 40% higher engagement',
        'Cost per acquisition decreased by 22%'
      ],
      warning: [
        'Engagement rate dropped 8% in the last hour',
        'Budget burn rate is 15% higher than projected',
        'Click-through rate below industry average'
      ],
      error: [
        'Campaign paused due to budget limit reached',
        'Ad creative rejected by platform',
        'Targeting parameters causing delivery issues'
      ],
      info: [
        'New optimization recommendations available',
        'Competitor launched similar campaign',
        'Market trends suggest timing adjustment'
      ]
    }

    if (Math.random() > 0.7) { // 30% chance of new alert
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const messages = alertMessages[type]
      const message = messages[Math.floor(Math.random() * messages.length)]
      
      const newAlert: PerformanceAlert = {
        id: `alert-${Date.now()}`,
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Alert`,
        message,
        timestamp: new Date()
      }
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]) // Keep last 10 alerts
    }
  }, [])

  // Auto-refresh effect
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        updateMetrics()
        generateTrends()
        generateAlerts()
      }, refreshRate)
      
      return () => clearInterval(interval)
    }
  }, [isLive, refreshRate, updateMetrics, generateTrends, generateAlerts])

  // Initial data generation
  useEffect(() => {
    generateTrends()
    generateAudienceInsights()
    generateAlerts()
  }, [generateTrends, generateAudienceInsights, generateAlerts])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getAlertColor = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Real-Time Analytics
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Live performance monitoring and insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">{isLive ? 'LIVE' : 'PAUSED'}</span>
              </div>
              <Button
                onClick={() => setIsLive(!isLive)}
                variant={isLive ? "destructive" : "default"}
                size="sm"
              >
                {isLive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isLive ? 'Pause' : 'Resume'}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Impressions', value: metrics.impressions, icon: Eye, color: 'blue' },
          { name: 'Clicks', value: metrics.clicks, icon: MousePointer, color: 'green' },
          { name: 'Engagement', value: metrics.engagement, icon: Heart, color: 'purple' },
          { name: 'Reach', value: metrics.reach, icon: Users, color: 'orange' }
        ].map((metric) => (
          <Card key={metric.name} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold">{formatNumber(metric.value)}</p>
                </div>
                <div className={`p-3 bg-${metric.color}-100 rounded-lg`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trends.map((trend) => (
                    <div key={trend.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(trend.trend)}
                        <div>
                          <p className="font-medium">{trend.name}</p>
                          <p className="text-2xl font-bold">{formatNumber(trend.value)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getTrendColor(trend.trend, trend.change)}`}>
                          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">vs last period</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Live Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last updated:</span>
                    <span className="text-sm font-medium">
                      {metrics.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Impressions', value: metrics.impressions, color: 'bg-blue-500' },
                      { label: 'Clicks', value: metrics.clicks, color: 'bg-green-500' },
                      { label: 'Engagement', value: metrics.engagement, color: 'bg-purple-500' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm flex-1">{item.label}</span>
                        <span className="text-sm font-medium">{formatNumber(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6">
            {trends.map((trend) => (
              <Card key={trend.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {trend.name} Trend
                    </CardTitle>
                    <Badge variant="outline" className={getTrendColor(trend.trend, trend.change)}>
                      {getTrendIcon(trend.trend)}
                      {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold">{formatNumber(trend.value)}</p>
                      <p className="text-sm text-gray-600">Current value</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Trend</p>
                      <p className={`text-lg font-semibold ${getTrendColor(trend.trend, trend.change)}`}>
                        {trend.trend === 'up' ? '↗️ Rising' : trend.trend === 'down' ? '↘️ Falling' : '→ Stable'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 h-8">
                    {trend.sparkline.map((value, index) => (
                      <div
                        key={index}
                        className="bg-blue-500 rounded-sm flex-1"
                        style={{ height: `${(value / 100) * 100}%` }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid gap-6">
            {audienceInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {insight.segment}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {formatNumber(insight.size)} members
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        +{insight.growth.toFixed(1)}% growth
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Engagement Rate</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={insight.engagement * 10} className="flex-1" />
                        <span className="text-sm font-medium">{insight.engagement}%</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Age Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(insight.demographics.age).map(([age, percentage]) => (
                          <div key={age} className="flex items-center justify-between text-sm">
                            <span>{age}</span>
                            <span>{percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Top Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {insight.demographics.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No alerts at the moment</p>
                  <p className="text-sm text-gray-500">We'll notify you when something important happens</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.type === 'success' ? 'bg-green-100' :
                          alert.type === 'warning' ? 'bg-yellow-100' :
                          alert.type === 'error' ? 'bg-red-100' :
                          'bg-blue-100'
                        }`}>
                          {alert.type === 'success' ? <Target className="h-4 w-4 text-green-600" /> :
                           alert.type === 'warning' ? <Activity className="h-4 w-4 text-yellow-600" /> :
                           alert.type === 'error' ? <Zap className="h-4 w-4 text-red-600" /> :
                           <Globe className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {alert.action && (
                        <Button size="sm" variant="outline">
                          {alert.action}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
