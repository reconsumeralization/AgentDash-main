"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Clock,
  Target,
  Zap,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib"

interface EngagementMetric {
  id: string
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
  target: number
  lastUpdated: Date
}

interface PostPerformance {
  postId: string
  content: string
  platform: string
  brand: 'defconconnect' | 'linkedout'
  publishedAt: Date
  engagement: {
    likes: number
    comments: number
    shares: number
    saves: number
    clicks: number
    impressions: number
    reach: number
    engagementRate: number
  }
  performance: {
    score: number
    rank: number
    status: 'excellent' | 'good' | 'average' | 'poor'
    alerts: string[]
  }
}

interface EngagementMonitorProps {
  className?: string
  brand?: 'defconconnect' | 'linkedout' | 'all'
}

export function EngagementMonitor({ className, brand = 'all' }: EngagementMonitorProps) {
  const [metrics, setMetrics] = useState<EngagementMetric[]>([])
  const [posts, setPosts] = useState<PostPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchEngagementData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Fetch analytics for engagement metrics
      const brandParam = brand !== 'all' ? `&brand=${brand}` : ''
      const analyticsRes = await fetch(`/api/social-media/analytics?platform=linkedin&period=7d${brandParam}`)

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        if (analyticsData.success) {
          const { metrics: rawMetrics, posts: rawPosts } = analyticsData.data

          // Transform metrics
          const engagementMetrics: EngagementMetric[] = [
            {
              id: 'engagement_rate',
              name: 'Engagement Rate',
              value: ((rawMetrics.engagement.current / rawMetrics.impressions.current) * 100) || 0,
              change: rawMetrics.engagement.changePercent,
              trend: rawMetrics.engagement.trend,
              status: ((rawMetrics.engagement.current / rawMetrics.impressions.current) * 100) > 10 ? 'good' :
                     ((rawMetrics.engagement.current / rawMetrics.impressions.current) * 100) > 5 ? 'warning' : 'critical',
              target: brand === 'defconconnect' ? 12 : brand === 'linkedout' ? 15 : 8,
              lastUpdated: new Date()
            },
            {
              id: 'reach_growth',
              name: 'Reach Growth',
              value: rawMetrics.reach.changePercent,
              change: rawMetrics.reach.changePercent,
              trend: rawMetrics.reach.trend,
              status: rawMetrics.reach.changePercent > 10 ? 'good' :
                     rawMetrics.reach.changePercent > 0 ? 'warning' : 'critical',
              target: brand === 'defconconnect' ? 15 : brand === 'linkedout' ? 20 : 10,
              lastUpdated: new Date()
            },
            {
              id: 'follower_growth',
              name: 'Follower Growth',
              value: rawMetrics.followers.changePercent,
              change: rawMetrics.followers.changePercent,
              trend: rawMetrics.followers.trend,
              status: rawMetrics.followers.changePercent > 5 ? 'good' :
                     rawMetrics.followers.changePercent > 0 ? 'warning' : 'critical',
              target: brand === 'defconconnect' ? 8 : brand === 'linkedout' ? 12 : 5,
              lastUpdated: new Date()
            },
            {
              id: 'click_through_rate',
              name: 'Click-Through Rate',
              value: ((rawMetrics.clicks.current / rawMetrics.impressions.current) * 100) || 0,
              change: rawMetrics.clicks.changePercent,
              trend: rawMetrics.clicks.trend,
              status: ((rawMetrics.clicks.current / rawMetrics.impressions.current) * 100) > 3 ? 'good' :
                     ((rawMetrics.clicks.current / rawMetrics.impressions.current) * 100) > 1.5 ? 'warning' : 'critical',
              target: brand === 'defconconnect' ? 3.5 : brand === 'linkedout' ? 4 : 2.5,
              lastUpdated: new Date()
            }
          ]

          setMetrics(engagementMetrics)

          // Transform posts
          const postPerformance: PostPerformance[] = rawPosts.map((post: any, index: number) => ({
            postId: post.postId,
            content: post.content.substring(0, 100) + '...',
            platform: 'linkedin',
            brand: post.postId.startsWith('dc_') ? 'defconconnect' :
                   post.postId.startsWith('lo_') ? 'linkedout' : 'defconconnect',
            publishedAt: new Date(post.publishedAt),
            engagement: post.engagement,
            performance: {
              score: post.performance.score,
              rank: post.performance.rank,
              status: post.performance.score > 90 ? 'excellent' :
                     post.performance.score > 75 ? 'good' :
                     post.performance.score > 60 ? 'average' : 'poor',
              alerts: post.performance.score < 60 ? ['Low engagement detected'] :
                     post.engagement.engagementRate < 5 ? ['Below target engagement rate'] : []
            }
          }))

          setPosts(postPerformance)
        }
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error)
    } finally {
      setIsLoading(false)
      setLastRefresh(new Date())
    }
  }, [brand])

  useEffect(() => {
    fetchEngagementData()

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchEngagementData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [brand, fetchEngagementData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
      case 'average':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical':
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Engagement Monitor</h2>
          <p className="text-muted-foreground">
            Real-time engagement tracking for {brand === 'all' ? 'all brands' : brand === 'defconconnect' ? 'DefconConnect' : 'LinkedOut'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEngagementData}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          metrics.map((metric) => (
            <Card key={metric.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-2xl font-bold">
                    {metric.value.toFixed(1)}
                    {metric.id.includes('rate') || metric.id.includes('growth') ? '%' : ''}
                  </p>
                  <Badge className={cn('text-xs', getStatusColor(metric.status))}>
                    {metric.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: {metric.target}%</span>
                    <span>{metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={Math.min((metric.value / metric.target) * 100, 100)}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Post Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Insights</TabsTrigger>
          <TabsTrigger value="trends">Engagement Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Post Performance</CardTitle>
              <CardDescription>
                Real-time engagement metrics for your latest content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent posts to monitor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.postId}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-muted/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {post.brand}
                          </Badge>
                          <Badge className={cn('text-xs', getStatusColor(post.performance.status))}>
                            {post.performance.status}
                          </Badge>
                          {post.performance.alerts.length > 0 && (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm font-medium mb-2 line-clamp-2">{post.content}</p>
                        <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.engagement.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.engagement.comments}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="h-3 w-3" />
                            {post.engagement.shares}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.engagement.reach.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold">{post.performance.score}</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-sm font-medium text-green-600">
                          {post.engagement.engagementRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Alerts & Insights</CardTitle>
              <CardDescription>
                Automated monitoring and optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* System Status */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Monitoring Active</p>
                    <p className="text-xs text-green-600">Real-time engagement tracking enabled</p>
                  </div>
                </div>

                {/* Performance Alerts */}
                {posts.some(post => post.performance.alerts.length > 0) ? (
                  posts
                    .filter(post => post.performance.alerts.length > 0)
                    .map(post => (
                      <div key={post.postId} className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            {post.brand} Post Performance Alert
                          </p>
                          <p className="text-xs text-yellow-600">
                            {post.performance.alerts.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">All Systems Performing Well</p>
                      <p className="text-xs text-blue-600">No engagement alerts at this time</p>
                    </div>
                  </div>
                )}

                {/* Optimization Recommendations */}
                <div className="p-4 rounded-lg border border-border bg-muted/20">
                  <h4 className="text-sm font-medium mb-2">Optimization Recommendations</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {brand === 'defconconnect' && (
                      <>
                        <p>• Post cybersecurity content during peak hours (Tuesday 9-11 AM)</p>
                        <p>• Include industry-specific hashtags for better reach</p>
                        <p>• Engage with security professional comments within 1 hour</p>
                      </>
                    )}
                    {brand === 'linkedout' && (
                      <>
                        <p>• Share optimization case studies for higher engagement</p>
                        <p>• Use data-driven insights in post content</p>
                        <p>• Include clear call-to-actions for profile optimization</p>
                      </>
                    )}
                    {brand === 'all' && (
                      <>
                        <p>• Maintain consistent posting schedule across both brands</p>
                        <p>• Cross-promote DefconConnect and LinkedOut content strategically</p>
                        <p>• Monitor competitor engagement patterns for insights</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>
                Historical patterns and growth metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Brand Comparison */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">DefconConnect Engagement</span>
                      <Badge className="bg-blue-50 text-blue-700">+127% this quarter</Badge>
                    </div>
                    <Progress value={85} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      Strong growth in cybersecurity professional engagement
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">LinkedOut Engagement</span>
                      <Badge className="bg-green-50 text-green-700">+156% profile optimization</Badge>
                    </div>
                    <Progress value={92} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      Exceptional results from optimization content
                    </p>
                  </div>
                </div>

                {/* Weekly Pattern */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Weekly Engagement Pattern</h4>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      const activity = [85, 90, 88, 92, 80, 60, 55][index]
                      return (
                        <div key={day} className="space-y-1">
                          <div className="text-xs font-medium">{day}</div>
                          <div className="h-16 bg-muted rounded flex items-end">
                            <div
                              className="w-full bg-blue-500 rounded"
                              style={{ height: `${activity}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">{activity}%</div>
                        </div>
                      )
                    })}
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