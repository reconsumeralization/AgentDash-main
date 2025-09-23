/**
 * Intelligent News Dashboard
 * Displays synthesized news feed and leading intelligent indicators
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  MessageSquare, 
  Heart,
  Share2,
  Eye,
  Clock,
  Target,
  Zap,
  Brain,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
  Linkedin,
  Shield
} from 'lucide-react'
import { cn } from '@/lib'
import type { 
  NewsItem, 
  SynthesizedInsight, 
  LeadingIndicator 
} from '@/lib/intelligent-news-synthesis'

interface IntelligentNewsDashboardProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function IntelligentNewsDashboard({ 
  className,
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes
}: IntelligentNewsDashboardProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [insights, setInsights] = useState<SynthesizedInsight[]>([])
  const [indicators, setIndicators] = useState<LeadingIndicator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState('indicators')

  // Fetch synthesized news data
  const fetchNewsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/intelligent-news/synthesis')
      if (!response.ok) {
        throw new Error('Failed to fetch news data')
      }
      
      const data = await response.json()
      setNewsItems(data.newsItems || [])
      setInsights(data.insights || [])
      setIndicators(data.indicators || [])
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Initial load and auto-refresh
  useEffect(() => {
    fetchNewsData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchNewsData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  // Manual refresh
  const handleRefresh = () => {
    fetchNewsData()
  }

  if (loading && newsItems.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Synthesizing intelligent indicators...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intelligent News Synthesis</h1>
          <p className="text-muted-foreground">
            Leading indicators from synthesized user content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indicators">Leading Indicators</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="news">News Feed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Leading Indicators Tab */}
        <TabsContent value="indicators" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {indicators.map((indicator) => (
              <IndicatorCard key={indicator.id} indicator={indicator} />
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </TabsContent>

        {/* News Feed Tab */}
        <TabsContent value="news" className="space-y-4">
          <div className="space-y-4">
            {newsItems.slice(0, 20).map((item) => (
              <NewsItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsView newsItems={newsItems} insights={insights} indicators={indicators} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Indicator Card Component
function IndicatorCard({ indicator }: { indicator: LeadingIndicator }) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'falling': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'volatile': return <Activity className="h-4 w-4 text-yellow-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return <Users className="h-4 w-4" />
      case 'sentiment': return <Heart className="h-4 w-4" />
      case 'growth': return <TrendingUp className="h-4 w-4" />
      case 'innovation': return <Zap className="h-4 w-4" />
      case 'collaboration': return <MessageSquare className="h-4 w-4" />
      case 'market': return <BarChart3 className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(indicator.category)}
            <CardTitle className="text-lg">{indicator.name}</CardTitle>
          </div>
          {getTrendIcon(indicator.trend)}
        </div>
        <CardDescription>{indicator.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Value Display */}
        <div className="text-center">
          <div className="text-3xl font-bold">{indicator.value.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">
            Confidence: <span className={getConfidenceColor(indicator.confidence)}>
              {(indicator.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Indicator Strength</span>
            <span>{(indicator.value * 10).toFixed(0)}%</span>
          </div>
          <Progress value={indicator.value * 10} className="h-2" />
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Sources</div>
            <div className="text-muted-foreground">{indicator.metadata.sourceCount}</div>
          </div>
          <div>
            <div className="font-medium">Users</div>
            <div className="text-muted-foreground">{indicator.metadata.userCount}</div>
          </div>
        </div>

        {/* Related Insights */}
        {indicator.insights.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Key Insights</div>
            <div className="space-y-1">
              {indicator.insights.slice(0, 2).map((insight) => (
                <div key={insight.id} className="text-xs text-muted-foreground">
                  • {insight.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Insight Card Component
function InsightCard({ insight }: { insight: SynthesizedInsight }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />
      case 'sentiment': return <Heart className="h-4 w-4" />
      case 'engagement': return <Activity className="h-4 w-4" />
      case 'topic': return <MessageSquare className="h-4 w-4" />
      case 'influence': return <Users className="h-4 w-4" />
      case 'prediction': return <Brain className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'decrease': return <TrendingDown className="h-3 w-3 text-red-500" />
      default: return <Activity className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(insight.type)}
            <CardTitle className="text-lg">{insight.title}</CardTitle>
          </div>
          <Badge className={getImpactColor(insight.impact)}>
            {insight.impact}
          </Badge>
        </div>
        <CardDescription>{insight.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Display */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{insight.data.value.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">{insight.data.timeframe}</div>
          </div>
          <div className="flex items-center space-x-2">
            {getChangeIcon(insight.data.changeType)}
            <span className="text-sm">
              {insight.data.change > 0 ? '+' : ''}{insight.data.change.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Confidence</span>
            <span>{(insight.confidence * 100).toFixed(0)}%</span>
          </div>
          <Progress value={insight.confidence * 100} className="h-2" />
        </div>

        {/* Tags */}
        {insight.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {insight.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Predictions */}
        {insight.predictions && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Predictions</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Next Week</div>
                <div className="font-medium">{insight.predictions.nextWeek.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Next Month</div>
                <div className="font-medium">{insight.predictions.nextMonth.toFixed(1)}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// News Item Card Component
function NewsItemCard({ item }: { item: NewsItem }) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return '💼'
      case 'twitter': return '🐦'
      case 'facebook': return '📘'
      case 'instagram': return '📷'
      case 'youtube': return '📺'
      default: return '💬'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {item.userName.charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <span className="font-medium">{item.userName}</span>
              {/* LinkedIn Lite Profile indicator */}
              {(item as any).linkedinProfile && (
                <Badge variant="outline" className="text-xs">
                  <Linkedin className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {item.timestamp.toLocaleTimeString()}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm">{getPlatformIcon(item.platform)}</span>
            </div>

            {/* Content */}
            <p className="text-sm">{item.content}</p>

            {/* Engagement */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{item.engagement.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{item.engagement.comments}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share2 className="h-3 w-3" />
                <span>{item.engagement.shares}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{item.engagement.views}</span>
              </div>
            </div>

            {/* Tags and Sentiment */}
            <div className="flex items-center space-x-2">
              {item.metadata.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <span className={cn("text-xs", getSentimentColor(item.metadata.sentiment))}>
                {item.metadata.sentiment}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Analytics View Component
function AnalyticsView({ 
  newsItems, 
  insights, 
  indicators 
}: { 
  newsItems: NewsItem[]
  insights: SynthesizedInsight[]
  indicators: LeadingIndicator[]
}) {
  const totalEngagement = newsItems.reduce((sum, item) => 
    sum + item.engagement.likes + item.engagement.comments + item.engagement.shares, 0)

  const platformBreakdown = newsItems.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sentimentBreakdown = newsItems.reduce((acc, item) => {
    acc[item.metadata.sentiment] = (acc[item.metadata.sentiment] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // LinkedIn Lite Profile analytics
  const linkedinProfiles = newsItems.filter(item => (item as any).linkedinProfile)
  const verifiedUsers = linkedinProfiles.length
  const totalUsers = newsItems.length
  const verificationRate = totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* LinkedIn Lite Profile Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Linkedin className="h-5 w-5 text-blue-600" />
            <span>LinkedIn Profiles</span>
          </CardTitle>
          <CardDescription>
            LinkedIn Lite Profile integration statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{verifiedUsers}</div>
              <div className="text-sm text-muted-foreground">Verified Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{verificationRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Verification Rate</div>
            </div>
          </div>
          <Progress value={verificationRate} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {verifiedUsers} of {totalUsers} users have LinkedIn Lite Profile data
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{newsItems.length}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalEngagement}</div>
              <div className="text-sm text-muted-foreground">Total Engagement</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{insights.length}</div>
              <div className="text-sm text-muted-foreground">Insights</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{indicators.length}</div>
              <div className="text-sm text-muted-foreground">Indicators</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(platformBreakdown).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="capitalize">{platform}</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(count / newsItems.length) * 100} 
                    className="w-20 h-2" 
                  />
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(sentimentBreakdown).map(([sentiment, count]) => (
              <div key={sentiment} className="flex items-center justify-between">
                <span className="capitalize">{sentiment}</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(count / newsItems.length) * 100} 
                    className="w-20 h-2" 
                  />
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Top Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {indicators
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((indicator) => (
                <div key={indicator.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{indicator.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {indicator.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{indicator.value.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">
                      {(indicator.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
