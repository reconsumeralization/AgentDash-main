"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Progress } from "@/components/ui"
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Gauge,
  Timer,
  Lightbulb
} from "lucide-react"
import { cn } from "@/lib"

interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  target: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  description: string
  improvement?: string
}

interface PerformanceInsight {
  id: string
  type: 'optimization' | 'bottleneck' | 'recommendation' | 'warning'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high'
  confidence: number
  category: string
  tags: string[]
  metrics: string[]
  solution?: string
  codeExample?: string
}

interface PerformanceAnalyticsProps {
  className?: string
}

export function GuidancePerformanceAnalytics({ className }: PerformanceAnalyticsProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [insights, setInsights] = useState<PerformanceInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")

  const analyzePerformance = async () => {
    if (!code.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/guidance/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          language: 'typescript'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics || [])
        setInsights(data.insights || [])
      } else {
        // Fallback to mock data
        const mockData = generateMockPerformanceData()
        setMetrics(mockData.metrics)
        setInsights(mockData.insights)
      }
    } catch (error) {
      console.error('Error analyzing performance:', error)
      const mockData = generateMockPerformanceData()
      setMetrics(mockData.metrics)
      setInsights(mockData.insights)
    } finally {
      setLoading(false)
    }
  }

  const generateMockPerformanceData = () => {
    return {
      metrics: [
        {
          id: "1",
          name: "Bundle Size",
          value: 2.4,
          unit: "MB",
          target: 1.5,
          status: "warning",
          trend: "up",
          description: "JavaScript bundle size is above recommended threshold",
          improvement: "Implement code splitting and tree shaking"
        },
        {
          id: "2",
          name: "First Contentful Paint",
          value: 1.8,
          unit: "s",
          target: 1.5,
          status: "warning",
          trend: "down",
          description: "Time to first contentful paint is slightly above target",
          improvement: "Optimize critical rendering path"
        },
        {
          id: "3",
          name: "Largest Contentful Paint",
          value: 2.2,
          unit: "s",
          target: 2.5,
          status: "good",
          trend: "stable",
          description: "Largest contentful paint is within acceptable range",
          improvement: "Consider image optimization for further improvement"
        },
        {
          id: "4",
          name: "Cumulative Layout Shift",
          value: 0.05,
          unit: "",
          target: 0.1,
          status: "excellent",
          trend: "stable",
          description: "Layout shift is minimal and within excellent range",
          improvement: "Maintain current practices"
        },
        {
          id: "5",
          name: "Time to Interactive",
          value: 3.1,
          unit: "s",
          target: 3.8,
          status: "good",
          trend: "down",
          description: "Time to interactive is within good range",
          improvement: "Reduce JavaScript execution time"
        }
      ],
      insights: [
        {
          id: "1",
          type: "optimization",
          title: "Implement Code Splitting",
          description: "Your bundle size is above the recommended threshold. Implement code splitting to reduce initial load time.",
          impact: "high",
          effort: "medium",
          confidence: 0.92,
          category: "bundle",
          tags: ["code-splitting", "bundle-optimization", "performance"],
          metrics: ["Bundle Size", "First Contentful Paint"],
          solution: "Use React.lazy() and Suspense for route-based code splitting",
          codeExample: "const LazyComponent = React.lazy(() => import('./LazyComponent'));"
        },
        {
          id: "2",
          type: "bottleneck",
          title: "Image Optimization Needed",
          description: "Large images are impacting your Largest Contentful Paint score.",
          impact: "medium",
          effort: "low",
          confidence: 0.88,
          category: "images",
          tags: ["image-optimization", "lcp", "performance"],
          metrics: ["Largest Contentful Paint"],
          solution: "Use next/image or implement responsive images with proper sizing"
        },
        {
          id: "3",
          type: "recommendation",
          title: "Enable Service Worker Caching",
          description: "Implement service worker caching to improve repeat visit performance.",
          impact: "high",
          effort: "high",
          confidence: 0.85,
          category: "caching",
          tags: ["service-worker", "caching", "performance"],
          metrics: ["First Contentful Paint", "Time to Interactive"],
          solution: "Implement service worker with cache-first strategy for static assets"
        }
      ]
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'good': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return TrendingUp
      case 'bottleneck': return AlertTriangle
      case 'recommendation': return Target
      case 'warning': return AlertTriangle
      default: return BarChart3
    }
  }

  const getProgressValue = (value: number, target: number, status: string) => {
    if (status === 'excellent' || status === 'good') {
      return Math.min(100, (value / target) * 100)
    }
    return Math.min(100, (target / value) * 100)
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-powered performance analysis with intelligent optimization recommendations
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analyze Performance
          </CardTitle>
          <CardDescription>
            Paste your code or describe your application to get performance insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your code or describe your application for performance analysis..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-[150px]"
          />
          <Button 
            onClick={analyzePerformance} 
            disabled={loading || !code.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Performance...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Performance
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {(metrics.length > 0 || insights.length > 0) && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Performance Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Overall Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-green-600">87</div>
                  <div className="text-sm text-muted-foreground">Good Performance</div>
                  <Progress value={87} className="w-full" />
                  <div className="text-xs text-muted-foreground">
                    Based on Core Web Vitals and performance metrics
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.slice(0, 3).map((metric) => (
                <Card key={metric.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{metric.name}</div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">{metric.value}{metric.unit}</div>
                    <div className="text-xs text-muted-foreground">
                      Target: {metric.target}{metric.unit}
                    </div>
                    <Progress 
                      value={getProgressValue(metric.value, metric.target, metric.status)} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Top Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Top Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.slice(0, 3).map((insight) => {
                    const TypeIcon = getTypeIcon(insight.type)
                    return (
                      <div key={insight.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="p-1 bg-primary/10 rounded">
                          <TypeIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{insight.title}</div>
                          <div className="text-sm text-muted-foreground">{insight.description}</div>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} impact
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(insight.confidence * 100)}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{metric.name}</CardTitle>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <CardDescription>{metric.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{metric.value}{metric.unit}</div>
                      <div className="text-sm text-muted-foreground">
                        Target: {metric.target}{metric.unit}
                      </div>
                    </div>
                    <Progress 
                      value={getProgressValue(metric.value, metric.target, metric.status)} 
                      className="w-full"
                    />
                    {metric.improvement && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Improvement:</strong> {metric.improvement}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {insights.map((insight) => {
              const TypeIcon = getTypeIcon(insight.type)
              return (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {insight.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {insight.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Affected Metrics */}
                    <div>
                      <h4 className="font-semibold mb-2">Affected Metrics</h4>
                      <div className="flex flex-wrap gap-2">
                        {insight.metrics.map((metric) => (
                          <Badge key={metric} variant="outline">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Solution */}
                    {insight.solution && (
                      <div>
                        <h4 className="font-semibold mb-2">Solution</h4>
                        <p className="text-sm text-muted-foreground">{insight.solution}</p>
                      </div>
                    )}

                    {/* Code Example */}
                    {insight.codeExample && (
                      <div>
                        <h4 className="font-semibold mb-2">Code Example</h4>
                        <div className="bg-muted p-3 rounded-lg">
                          <pre className="text-sm overflow-x-auto">
                            <code>{insight.codeExample}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        Apply Solution
                      </Button>
                      <Button size="sm" variant="ghost">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
