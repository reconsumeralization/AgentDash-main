"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Clock,
  Award,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Settings,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import { cn } from "@/lib"

interface AnalyticsMetric {
  id: string
  label: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  format: 'number' | 'percentage' | 'currency'
  icon: React.ReactNode
  description: string
  trend: number[]
}

interface PostPerformance {
  id: string
  title: string
  content: string
  publishedAt: Date
  impressions: number
  clicks: number
  likes: number
  comments: number
  shares: number
  engagementRate: number
  clickThroughRate: number
  sentiment: 'positive' | 'negative' | 'neutral'
  topics: string[]
  performance: 'excellent' | 'good' | 'average' | 'poor'
}

interface AudienceInsight {
  id: string
  category: string
  percentage: number
  growth: number
  description: string
}

interface EngagementTrend {
  date: string
  impressions: number
  clicks: number
  likes: number
  comments: number
  shares: number
  engagementRate: number
}

interface ModernLinkedInAnalyticsProps {
  className?: string
  timeRange?: '7d' | '30d' | '90d' | '1y'
  showAdvanced?: boolean
}

export function ModernLinkedInAnalytics({ 
  className,
  timeRange = '30d',
  showAdvanced = true
}: ModernLinkedInAnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - in production, this would come from your API
  const analyticsData = useMemo(() => {
    const baseMetrics = {
      impressions: 125000,
      clicks: 3250,
      likes: 1850,
      comments: 420,
      shares: 180,
      followers: 12500,
      engagementRate: 4.2,
      clickThroughRate: 2.6
    }

    const multiplier = selectedTimeRange === '7d' ? 0.25 : selectedTimeRange === '90d' ? 2.5 : selectedTimeRange === '1y' ? 12 : 1

    return {
      ...baseMetrics,
      impressions: Math.round(baseMetrics.impressions * multiplier),
      clicks: Math.round(baseMetrics.clicks * multiplier),
      likes: Math.round(baseMetrics.likes * multiplier),
      comments: Math.round(baseMetrics.comments * multiplier),
      shares: Math.round(baseMetrics.shares * multiplier),
      followers: Math.round(baseMetrics.followers * (1 + multiplier * 0.1))
    }
  }, [selectedTimeRange])

  const metrics: AnalyticsMetric[] = useMemo(() => [
    {
      id: 'impressions',
      label: 'Impressions',
      value: analyticsData.impressions,
      change: 12.5,
      changeType: 'increase',
      format: 'number',
      icon: <Eye className="w-4 h-4" />,
      description: 'Total views of your content',
      trend: [12000, 15000, 18000, 22000, 25000, 28000, 32000]
    },
    {
      id: 'clicks',
      label: 'Clicks',
      value: analyticsData.clicks,
      change: 8.3,
      changeType: 'increase',
      format: 'number',
      icon: <Target className="w-4 h-4" />,
      description: 'Total clicks on your content',
      trend: [300, 350, 400, 450, 500, 550, 600]
    },
    {
      id: 'engagement-rate',
      label: 'Engagement Rate',
      value: analyticsData.engagementRate,
      change: -2.1,
      changeType: 'decrease',
      format: 'percentage',
      icon: <Heart className="w-4 h-4" />,
      description: 'Percentage of engaged viewers',
      trend: [4.5, 4.3, 4.2, 4.1, 4.0, 3.9, 3.8]
    },
    {
      id: 'followers',
      label: 'Followers',
      value: analyticsData.followers,
      change: 15.7,
      changeType: 'increase',
      format: 'number',
      icon: <Users className="w-4 h-4" />,
      description: 'Total followers count',
      trend: [10000, 10500, 11000, 11500, 12000, 12300, 12500]
    }
  ], [analyticsData])

  const topPosts: PostPerformance[] = useMemo(() => [
    {
      id: '1',
      title: 'The Future of AI in Cybersecurity',
      content: 'Exploring how artificial intelligence is revolutionizing cybersecurity...',
      publishedAt: new Date('2024-01-15'),
      impressions: 15420,
      clicks: 420,
      likes: 180,
      comments: 45,
      shares: 25,
      engagementRate: 6.2,
      clickThroughRate: 2.7,
      sentiment: 'positive',
      topics: ['AI', 'Cybersecurity', 'Technology'],
      performance: 'excellent'
    },
    {
      id: '2',
      title: 'LinkedIn Growth Strategies',
      content: '5 proven strategies to grow your LinkedIn presence...',
      publishedAt: new Date('2024-01-12'),
      impressions: 12800,
      clicks: 380,
      likes: 150,
      comments: 32,
      shares: 18,
      engagementRate: 5.8,
      clickThroughRate: 3.0,
      sentiment: 'positive',
      topics: ['LinkedIn', 'Growth', 'Marketing'],
      performance: 'good'
    },
    {
      id: '3',
      title: 'DevOps Best Practices',
      content: 'Essential DevOps practices every team should implement...',
      publishedAt: new Date('2024-01-10'),
      impressions: 9800,
      clicks: 290,
      likes: 120,
      comments: 28,
      shares: 15,
      engagementRate: 4.9,
      clickThroughRate: 2.9,
      sentiment: 'neutral',
      topics: ['DevOps', 'Best Practices', 'Development'],
      performance: 'average'
    }
  ], [])

  const audienceInsights: AudienceInsight[] = useMemo(() => [
    {
      id: '1',
      category: 'Software Engineers',
      percentage: 35,
      growth: 8.2,
      description: 'Your primary audience segment'
    },
    {
      id: '2',
      category: 'Cybersecurity Professionals',
      percentage: 25,
      growth: 12.5,
      description: 'Growing segment with high engagement'
    },
    {
      id: '3',
      category: 'DevOps Engineers',
      percentage: 20,
      growth: 5.8,
      description: 'Technical audience with strong interest'
    },
    {
      id: '4',
      category: 'Tech Leaders',
      percentage: 15,
      growth: 15.3,
      description: 'High-value audience for networking'
    },
    {
      id: '5',
      category: 'Others',
      percentage: 5,
      growth: -2.1,
      description: 'Miscellaneous professional categories'
    }
  ], [])

  const engagementTrend: EngagementTrend[] = useMemo(() => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : selectedTimeRange === '90d' ? 90 : 365
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 2000) + 1000,
      clicks: Math.floor(Math.random() * 100) + 20,
      likes: Math.floor(Math.random() * 50) + 10,
      comments: Math.floor(Math.random() * 20) + 2,
      shares: Math.floor(Math.random() * 10) + 1,
      engagementRate: Math.random() * 3 + 2
    }))
  }, [selectedTimeRange])

  const formatValue = useCallback((value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'currency':
        return `$${value.toLocaleString()}`
      case 'number':
      default:
        return value.toLocaleString()
    }
  }, [])

  const getChangeIcon = useCallback((changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />
      case 'decrease':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4" />
    }
  }, [])

  const getChangeColor = useCallback((changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }, [])

  const getPerformanceBadge = useCallback((performance: string) => {
    const variants = {
      excellent: { variant: 'default' as const, icon: <Award className="w-3 h-3" /> },
      good: { variant: 'secondary' as const, icon: <CheckCircle className="w-3 h-3" /> },
      average: { variant: 'outline' as const, icon: <Info className="w-3 h-3" /> },
      poor: { variant: 'destructive' as const, icon: <AlertTriangle className="w-3 h-3" /> }
    }
    return variants[performance as keyof typeof variants] || variants.average
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }, [])

  const handleExport = useCallback(() => {
    // Export functionality would be implemented here
    console.log('Exporting analytics data...')
  }, [])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">LinkedIn Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into your LinkedIn performance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Time Range:</span>
        {['7d', '30d', '90d', '1y'].map((range) => (
          <Button
            key={range}
            variant={selectedTimeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeRange(range as any)}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">{formatValue(metric.value, metric.format)}</p>
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(metric.changeType)}
                    <span className={cn("text-sm", getChangeColor(metric.changeType))}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Engagement Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Likes</span>
                  </div>
                  <span className="font-medium">{analyticsData.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Comments</span>
                  </div>
                  <span className="font-medium">{analyticsData.comments.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Share2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Shares</span>
                  </div>
                  <span className="font-medium">{analyticsData.shares.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Clicks</span>
                  </div>
                  <span className="font-medium">{analyticsData.clicks.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Performance Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Best performing day</span>
                    <Badge variant="secondary">Tuesday</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak engagement time</span>
                    <Badge variant="secondary">9:00 AM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Top content type</span>
                    <Badge variant="secondary">Industry insights</Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Post more industry insights on Tuesdays</li>
                    <li>• Increase video content to boost engagement</li>
                    <li>• Engage more with comments to improve reach</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="grid gap-4">
            {topPosts.map((post) => {
              const performanceBadge = getPerformanceBadge(post.performance)
              return (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{post.content}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{post.publishedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant={performanceBadge.variant} className="flex items-center space-x-1">
                        {performanceBadge.icon}
                        <span>{post.performance}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs text-muted-foreground">Impressions</span>
                        </div>
                        <p className="font-medium">{post.impressions.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Heart className="w-3 h-3" />
                          <span className="text-xs text-muted-foreground">Likes</span>
                        </div>
                        <p className="font-medium">{post.likes.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <MessageCircle className="w-3 h-3" />
                          <span className="text-xs text-muted-foreground">Comments</span>
                        </div>
                        <p className="font-medium">{post.comments.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Share2 className="w-3 h-3" />
                          <span className="text-xs text-muted-foreground">Shares</span>
                        </div>
                        <p className="font-medium">{post.shares.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {post.topics.map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>Engagement: {post.engagementRate}%</span>
                        <span>CTR: {post.clickThroughRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audience Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Audience Demographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {audienceInsights.map((insight) => (
                  <div key={insight.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{insight.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{insight.percentage}%</span>
                        <div className="flex items-center space-x-1">
                          {insight.growth > 0 ? (
                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-red-500" />
                          )}
                          <span className={cn(
                            "text-xs",
                            insight.growth > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {Math.abs(insight.growth)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress value={insight.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Geographic Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { country: 'United States', percentage: 45, growth: 8.2 },
                  { country: 'United Kingdom', percentage: 20, growth: 12.5 },
                  { country: 'Canada', percentage: 15, growth: 5.8 },
                  { country: 'Australia', percentage: 10, growth: 15.3 },
                  { country: 'Germany', percentage: 10, growth: -2.1 }
                ].map((geo, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{geo.country}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{geo.percentage}%</span>
                        <div className="flex items-center space-x-1">
                          {geo.growth > 0 ? (
                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-red-500" />
                          )}
                          <span className={cn(
                            "text-xs",
                            geo.growth > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {Math.abs(geo.growth)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress value={geo.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Engagement Trends</span>
              </CardTitle>
              <CardDescription>
                Track your performance over time and identify patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Impressions Trend</p>
                    <p className="text-lg font-bold text-green-600">+12.5%</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Engagement Trend</p>
                    <p className="text-lg font-bold text-blue-600">+8.3%</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click Trend</p>
                    <p className="text-lg font-bold text-purple-600">+15.7%</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">CTR Trend</p>
                    <p className="text-lg font-bold text-red-600">-2.1%</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Key Insights</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Your impressions have increased by 12.5% this period, indicating better content visibility.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Engagement rate is trending upward, showing your audience is more active.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>Click-through rate has decreased slightly - consider optimizing your call-to-actions.</span>
                    </div>
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

export default ModernLinkedInAnalytics
