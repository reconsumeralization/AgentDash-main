"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  Brain,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Eye,
  MousePointer,
  Heart,
  Share2,
  Users,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Download,
  Filter,
  Search,
  Maximize2,
  Minimize2
} from "lucide-react"

interface Prediction {
  id: string
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  timeframe: string
  trend: 'up' | 'down' | 'stable'
  factors: Array<{
    name: string
    impact: number
    direction: 'positive' | 'negative' | 'neutral'
  }>
  scenarios: {
    optimistic: number
    realistic: number
    pessimistic: number
  }
}

interface MarketForecast {
  period: string
  trends: Array<{
    category: string
    impact: number
    probability: number
    description: string
  }>
  opportunities: string[]
  threats: string[]
}

interface PerformanceProjection {
  metric: string
  historical: Array<{
    date: string
    value: number
  }>
  projected: Array<{
    date: string
    value: number
    confidence: number
  }>
  seasonality: {
    pattern: string
    impact: number
  }
}

interface RiskAssessment {
  category: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  impact: number
  mitigation: string
  monitoring: string[]
}

export function PredictiveAnalyticsEngine() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [marketForecast, setMarketForecast] = useState<MarketForecast | null>(null)
  const [performanceProjections, setPerformanceProjections] = useState<PerformanceProjection[]>([])
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([])
  const [activeTab, setActiveTab] = useState('predictions')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  // Generate predictions
  const generatePredictions = useCallback(async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 10, 100))
    }, 200)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const predictionData: Prediction[] = [
        {
          id: 'pred-1',
          metric: 'Engagement Rate',
          currentValue: 8.7,
          predictedValue: 11.2,
          confidence: 0.87,
          timeframe: '30 days',
          trend: 'up',
          factors: [
            { name: 'Seasonal Q4 Effect', impact: 0.23, direction: 'positive' },
            { name: 'Content Strategy Optimization', impact: 0.18, direction: 'positive' },
            { name: 'Audience Growth', impact: 0.15, direction: 'positive' },
            { name: 'Competition Increase', impact: -0.08, direction: 'negative' }
          ],
          scenarios: {
            optimistic: 13.5,
            realistic: 11.2,
            pessimistic: 9.1
          }
        },
        {
          id: 'pred-2',
          metric: 'Reach',
          currentValue: 45000,
          predictedValue: 58000,
          confidence: 0.82,
          timeframe: '30 days',
          trend: 'up',
          factors: [
            { name: 'Algorithm Changes', impact: 0.25, direction: 'positive' },
            { name: 'Content Frequency Increase', impact: 0.12, direction: 'positive' },
            { name: 'Cross-Platform Promotion', impact: 0.08, direction: 'positive' },
            { name: 'Market Saturation', impact: -0.05, direction: 'negative' }
          ],
          scenarios: {
            optimistic: 65000,
            realistic: 58000,
            pessimistic: 48000
          }
        },
        {
          id: 'pred-3',
          metric: 'Cost Per Click',
          currentValue: 2.89,
          predictedValue: 3.45,
          confidence: 0.79,
          timeframe: '30 days',
          trend: 'up',
          factors: [
            { name: 'Seasonal Competition', impact: 0.28, direction: 'positive' },
            { name: 'Audience Demand Increase', impact: 0.15, direction: 'positive' },
            { name: 'Platform Algorithm Updates', impact: 0.08, direction: 'positive' },
            { name: 'Budget Optimization', impact: -0.12, direction: 'negative' }
          ],
          scenarios: {
            optimistic: 3.15,
            realistic: 3.45,
            pessimistic: 3.85
          }
        },
        {
          id: 'pred-4',
          metric: 'Conversion Rate',
          currentValue: 3.2,
          predictedValue: 4.1,
          confidence: 0.91,
          timeframe: '30 days',
          trend: 'up',
          factors: [
            { name: 'Landing Page Optimization', impact: 0.35, direction: 'positive' },
            { name: 'Audience Targeting Refinement', impact: 0.22, direction: 'positive' },
            { name: 'Content Personalization', impact: 0.18, direction: 'positive' },
            { name: 'Market Fatigue', impact: -0.06, direction: 'negative' }
          ],
          scenarios: {
            optimistic: 4.8,
            realistic: 4.1,
            pessimistic: 3.5
          }
        },
        {
          id: 'pred-5',
          metric: 'Audience Growth',
          currentValue: 1250,
          predictedValue: 1680,
          confidence: 0.85,
          timeframe: '30 days',
          trend: 'up',
          factors: [
            { name: 'Viral Content Potential', impact: 0.31, direction: 'positive' },
            { name: 'Referral Program Launch', impact: 0.19, direction: 'positive' },
            { name: 'Industry Event Participation', impact: 0.14, direction: 'positive' },
            { name: 'Competition for Attention', impact: -0.08, direction: 'negative' }
          ],
          scenarios: {
            optimistic: 2100,
            realistic: 1680,
            pessimistic: 1350
          }
        }
      ]

      setPredictions(predictionData)
    } catch (error) {
      console.error('Error generating predictions:', error)
    } finally {
      clearInterval(progressInterval)
      setIsAnalyzing(false)
      setAnalysisProgress(100)
    }
  }, [])

  // Generate market forecast
  const generateMarketForecast = useCallback(() => {
    const forecastData: MarketForecast = {
      period: 'Q1 2024',
      trends: [
        {
          category: 'AI Integration',
          impact: 0.85,
          probability: 0.92,
          description: 'Increasing adoption of AI-powered marketing tools will reshape campaign optimization strategies'
        },
        {
          category: 'Privacy Regulations',
          impact: -0.45,
          probability: 0.78,
          description: 'Stricter data privacy laws may impact targeting capabilities and require strategy adjustments'
        },
        {
          category: 'Video Content Dominance',
          impact: 0.72,
          probability: 0.89,
          description: 'Short-form video content continues to drive engagement across all platforms'
        },
        {
          category: 'Economic Uncertainty',
          impact: -0.38,
          probability: 0.65,
          description: 'Potential economic headwinds may affect advertising budgets and consumer behavior'
        }
      ],
      opportunities: [
        'Early adoption of AI-powered personalization tools',
        'Expansion into emerging markets with lower competition',
        'Development of privacy-compliant targeting strategies',
        'Investment in video content production capabilities'
      ],
      threats: [
        'Increased competition from AI-enhanced campaigns',
        'Platform algorithm changes affecting organic reach',
        'Economic downturn impacting advertising budgets',
        'Regulatory changes limiting data usage'
      ]
    }
    setMarketForecast(forecastData)
  }, [])

  // Generate performance projections
  const generatePerformanceProjections = useCallback(() => {
    const projectionData: PerformanceProjection[] = [
      {
        metric: 'Engagement Rate',
        historical: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: 8.2 + Math.sin(i * 0.2) * 0.8 + Math.random() * 0.4
        })),
        projected: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: 9.5 + Math.sin(i * 0.2) * 0.6 + Math.random() * 0.3,
          confidence: 0.85 + Math.random() * 0.1
        })),
        seasonality: {
          pattern: 'Weekly cycles with weekend dips',
          impact: 0.15
        }
      },
      {
        metric: 'Reach',
        historical: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: 42000 + Math.sin(i * 0.1) * 3000 + Math.random() * 2000
        })),
        projected: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: 52000 + Math.sin(i * 0.1) * 4000 + Math.random() * 1500,
          confidence: 0.82 + Math.random() * 0.08
        })),
        seasonality: {
          pattern: 'Monthly growth with mid-week peaks',
          impact: 0.22
        }
      }
    ]
    setPerformanceProjections(projectionData)
  }, [])

  // Generate risk assessments
  const generateRiskAssessments = useCallback(() => {
    const riskData: RiskAssessment[] = [
      {
        category: 'Algorithm Changes',
        riskLevel: 'medium',
        probability: 0.75,
        impact: 0.65,
        mitigation: 'Diversify content formats and engagement strategies',
        monitoring: ['Organic reach metrics', 'Engagement pattern changes', 'Platform announcements']
      },
      {
        category: 'Competition Increase',
        riskLevel: 'high',
        probability: 0.85,
        impact: 0.55,
        mitigation: 'Focus on unique value proposition and niche targeting',
        monitoring: ['Competitor activity', 'Market share trends', 'Audience overlap']
      },
      {
        category: 'Budget Constraints',
        riskLevel: 'medium',
        probability: 0.45,
        impact: 0.70,
        mitigation: 'Optimize for organic reach and cost-efficient channels',
        monitoring: ['Cost per acquisition', 'Budget utilization', 'ROI trends']
      },
      {
        category: 'Audience Fatigue',
        riskLevel: 'low',
        probability: 0.30,
        impact: 0.40,
        mitigation: 'Vary content types and maintain engagement quality',
        monitoring: ['Engagement rates', 'Unfollow rates', 'Content performance']
      }
    ]
    setRiskAssessments(riskData)
  }, [])

  useEffect(() => {
    generatePredictions()
    generateMarketForecast()
    generatePerformanceProjections()
    generateRiskAssessments()
  }, [generatePredictions, generateMarketForecast, generatePerformanceProjections, generateRiskAssessments])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toFixed(1)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600'
    if (impact < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Predictive Analytics Engine
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  AI-powered forecasting and trend analysis for strategic decision making
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAnalyzing && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                  <span className="text-sm text-gray-600">Analyzing...</span>
                  <Progress value={analysisProgress} className="w-24" />
                </div>
              )}
              <Button
                onClick={generatePredictions}
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Refresh Forecast
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Predictions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {predictions.slice(0, 5).map((prediction) => (
          <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-600">{prediction.metric}</div>
                {getTrendIcon(prediction.trend)}
              </div>
              <div className="text-2xl font-bold mb-1">{formatNumber(prediction.currentValue)}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Predicted:</span>
                <span className={`text-sm font-medium ${getImpactColor(prediction.predictedValue - prediction.currentValue)}`}>
                  {formatNumber(prediction.predictedValue)}
                </span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Confidence:</span>
                  <span>{Math.round(prediction.confidence * 100)}%</span>
                </div>
                <Progress value={prediction.confidence * 100} className="mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="forecast">Market Forecast</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {prediction.metric}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {prediction.timeframe}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {Math.round(prediction.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Current Value</p>
                          <p className="text-2xl font-bold">{formatNumber(prediction.currentValue)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Predicted Value</p>
                          <p className="text-2xl font-bold text-blue-600">{formatNumber(prediction.predictedValue)}</p>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-3">Impact Factors</h4>
                      <div className="space-y-2">
                        {prediction.factors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{factor.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${getImpactColor(factor.impact)}`}>
                                {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(1)}%
                              </span>
                              {factor.direction === 'positive' ? (
                                <ArrowUpRight className="h-3 w-3 text-green-600" />
                              ) : factor.direction === 'negative' ? (
                                <ArrowDownRight className="h-3 w-3 text-red-600" />
                              ) : (
                                <Activity className="h-3 w-3 text-gray-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Scenario Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-green-800">Optimistic</span>
                          <span className="text-lg font-bold text-green-600">{formatNumber(prediction.scenarios.optimistic)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-800">Realistic</span>
                          <span className="text-lg font-bold text-blue-600">{formatNumber(prediction.scenarios.realistic)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <span className="text-sm font-medium text-orange-800">Pessimistic</span>
                          <span className="text-lg font-bold text-orange-600">{formatNumber(prediction.scenarios.pessimistic)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Market Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          {marketForecast && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Market Trends - {marketForecast.period}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {marketForecast.trends.map((trend, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{trend.category}</h4>
                            <Badge variant="outline">
                              {Math.round(trend.probability * 100)}% probability
                            </Badge>
                            <Badge className={getImpactColor(trend.impact) === 'text-green-600' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {(trend.impact * 100).toFixed(0)}% impact
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{trend.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {marketForecast.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Threats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {marketForecast.threats.map((threat, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <span className="text-sm">{threat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-4">
          <div className="grid gap-6">
            {performanceProjections.map((projection) => (
              <Card key={projection.metric}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    {projection.metric} Projection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Seasonal Pattern:</span>
                      <span className="text-sm font-medium">{projection.seasonality.pattern}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Seasonal Impact:</span>
                      <span className="text-sm font-medium">{(projection.seasonality.impact * 100).toFixed(1)}%</span>
                    </div>
                    
                    <div className="h-64 bg-gray-50 rounded-lg p-4">
                      <div className="text-center text-gray-500 mt-20">
                        <LineChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Interactive projection chart would be rendered here</p>
                        <p className="text-xs mt-1">Historical data + AI projections with confidence intervals</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-2">Historical Performance</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Average:</span>
                            <span>{formatNumber(projection.historical.reduce((sum, item) => sum + item.value, 0) / projection.historical.length)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Peak:</span>
                            <span>{formatNumber(Math.max(...projection.historical.map(item => item.value)))}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Projected Performance</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Average:</span>
                            <span>{formatNumber(projection.projected.reduce((sum, item) => sum + item.value, 0) / projection.projected.length)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confidence:</span>
                            <span>{Math.round(projection.projected.reduce((sum, item) => sum + item.confidence, 0) / projection.projected.length * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-4">
          <div className="grid gap-4">
            {riskAssessments.map((risk, index) => (
              <Card key={index} className="border-l-4 border-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{risk.category}</h3>
                          <Badge className={getRiskColor(risk.riskLevel)}>
                            {risk.riskLevel} risk
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Probability</p>
                            <p className="text-lg font-semibold">{Math.round(risk.probability * 100)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Impact</p>
                            <p className="text-lg font-semibold">{Math.round(risk.impact * 100)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Risk Score</p>
                            <p className="text-lg font-semibold text-orange-600">
                              {Math.round(risk.probability * risk.impact * 100)}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-orange-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium text-orange-800 mb-2">Mitigation Strategy</h4>
                          <p className="text-sm text-orange-700">{risk.mitigation}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Monitoring Indicators</h4>
                          <div className="flex flex-wrap gap-2">
                            {risk.monitoring.map((indicator) => (
                              <Badge key={indicator} variant="outline" className="text-xs">
                                {indicator}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
