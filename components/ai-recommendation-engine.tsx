"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  Target,
  TrendingUp,
  Zap,
  Lightbulb,
  BarChart3,
  Users,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Sparkles,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  Filter,
  Search,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertTriangle,
  Info,
  ThumbsUp,
  ThumbsDown,
  Save,
  ExternalLink,
  X
} from "lucide-react"

interface Recommendation {
  id: string
  type: 'content' | 'timing' | 'audience' | 'strategy' | 'optimization'
  priority: 'high' | 'medium' | 'low'
  confidence: number
  title: string
  description: string
  rationale: string
  expectedImpact: {
    metric: string
    improvement: string
    timeframe: string
  }
  actionSteps: string[]
  resources: Array<{
    title: string
    url: string
    type: 'article' | 'video' | 'tool' | 'template'
  }>
  tags: string[]
  relatedRecommendations: string[]
  userFeedback?: 'positive' | 'negative' | 'neutral'
  implementationStatus?: 'pending' | 'in_progress' | 'completed' | 'dismissed'
}

interface RecommendationContext {
  userProfile: {
    industry: string
    role: string
    experience: string
    goals: string[]
  }
  performanceData: {
    currentMetrics: Record<string, number>
    benchmarks: Record<string, number>
    trends: Record<string, number>
  }
  marketContext: {
    seasonality: string
    trends: string[]
    competition: string[]
  }
}

interface PersonalizationEngine {
  learningRate: number
  userPreferences: Record<string, number>
  successPatterns: Record<string, number>
  failurePatterns: Record<string, number>
}

export function AIRecommendationEngine() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [context, setContext] = useState<RecommendationContext | null>(null)
  const [personalization, setPersonalization] = useState<PersonalizationEngine | null>(null)
  const [activeTab, setActiveTab] = useState('personalized')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  const [filters, setFilters] = useState({
    types: ['content', 'timing', 'audience', 'strategy', 'optimization'],
    priorities: ['high', 'medium', 'low'],
    minConfidence: 0.7
  })

  // Generate personalized recommendations
  const generateRecommendations = useCallback(async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 12, 100))
    }, 250)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const recommendationData: Recommendation[] = [
        {
          id: 'rec-1',
          type: 'content',
          priority: 'high',
          confidence: 0.94,
          title: 'Create Aspiration-Focused Content Series',
          description: 'Develop a 4-part content series around "Future-Focused Professional Goals" to align with your audience\'s aspiration-based networking approach.',
          rationale: 'Your audience shows 67% higher engagement with future-oriented content, and competitor analysis reveals a gap in aspiration-focused thought leadership.',
          expectedImpact: {
            metric: 'Engagement Rate',
            improvement: '+45%',
            timeframe: '4-6 weeks'
          },
          actionSteps: [
            'Research trending future-focused topics in your industry',
            'Create content calendar for 4-part series',
            'Develop interactive content (polls, surveys)',
            'Schedule posts during peak engagement times (Tuesday 10-11 AM)',
            'Prepare follow-up content for high-performing posts'
          ],
          resources: [
            { title: 'Content Strategy Template', url: '#', type: 'template' },
            { title: 'Future of Work Trends 2024', url: '#', type: 'article' },
            { title: 'Interactive Content Best Practices', url: '#', type: 'video' }
          ],
          tags: ['content-strategy', 'engagement', 'thought-leadership'],
          relatedRecommendations: ['rec-2', 'rec-3']
        },
        {
          id: 'rec-2',
          type: 'timing',
          priority: 'high',
          confidence: 0.89,
          title: 'Optimize Posting Schedule for Aspiration Cycles',
          description: 'Align your content calendar with monthly goal-setting periods when professionals are most receptive to aspiration-focused content.',
          rationale: 'Data analysis shows 78% higher engagement during the first week of each month when professionals set new goals and aspirations.',
          expectedImpact: {
            metric: 'Reach',
            improvement: '+32%',
            timeframe: '2-3 weeks'
          },
          actionSteps: [
            'Analyze historical engagement data by day of month',
            'Identify peak aspiration-setting periods',
            'Reschedule high-impact content to optimal times',
            'Create recurring content themes for each cycle',
            'Monitor and adjust based on performance'
          ],
          resources: [
            { title: 'Optimal Timing Calculator', url: '#', type: 'tool' },
            { title: 'Content Calendar Template', url: '#', type: 'template' }
          ],
          tags: ['timing', 'optimization', 'psychology'],
          relatedRecommendations: ['rec-1', 'rec-4']
        },
        {
          id: 'rec-3',
          type: 'audience',
          priority: 'medium',
          confidence: 0.82,
          title: 'Expand to Adjacent Professional Communities',
          description: 'Target professionals in related industries who share similar future aspirations but are currently underserved by your content.',
          rationale: 'Audience analysis reveals 23% of your most engaged followers come from adjacent industries, indicating strong cross-industry appeal.',
          expectedImpact: {
            metric: 'Audience Growth',
            improvement: '+28%',
            timeframe: '6-8 weeks'
          },
          actionSteps: [
            'Identify 3-5 adjacent industries with shared aspirations',
            'Research their unique challenges and goals',
            'Create industry-specific content variations',
            'Engage with thought leaders in these communities',
            'Measure cross-industry engagement rates'
          ],
          resources: [
            { title: 'Industry Research Framework', url: '#', type: 'template' },
            { title: 'Cross-Industry Networking Guide', url: '#', type: 'article' }
          ],
          tags: ['audience-expansion', 'growth', 'diversification'],
          relatedRecommendations: ['rec-1', 'rec-5']
        },
        {
          id: 'rec-4',
          type: 'strategy',
          priority: 'medium',
          confidence: 0.87,
          title: 'Implement Aspiration-Based Segmentation',
          description: 'Segment your audience based on their future goals and aspirations rather than traditional demographics for more targeted messaging.',
          rationale: 'Aspiration-based segmentation shows 34% higher conversion rates compared to demographic-based targeting in your industry.',
          expectedImpact: {
            metric: 'Conversion Rate',
            improvement: '+34%',
            timeframe: '8-10 weeks'
          },
          actionSteps: [
            'Survey audience about their 5-year professional goals',
            'Create aspiration-based audience segments',
            'Develop segment-specific content strategies',
            'Implement targeted messaging for each segment',
            'Track performance by aspiration segment'
          ],
          resources: [
            { title: 'Audience Segmentation Tool', url: '#', type: 'tool' },
            { title: 'Aspiration Survey Template', url: '#', type: 'template' },
            { title: 'Segmented Content Strategy', url: '#', type: 'article' }
          ],
          tags: ['segmentation', 'personalization', 'strategy'],
          relatedRecommendations: ['rec-3', 'rec-6']
        },
        {
          id: 'rec-5',
          type: 'optimization',
          priority: 'low',
          confidence: 0.76,
          title: 'A/B Test Visual Content Formats',
          description: 'Experiment with different visual formats (infographics, videos, carousels) to optimize for aspiration-focused storytelling.',
          rationale: 'Visual content performs 67% better than text-only posts, but optimal format varies by aspiration type and audience segment.',
          expectedImpact: {
            metric: 'Visual Engagement',
            improvement: '+25%',
            timeframe: '4-5 weeks'
          },
          actionSteps: [
            'Identify top-performing visual content types',
            'Create A/B test framework for different formats',
            'Develop aspiration-themed visual templates',
            'Test with different audience segments',
            'Implement winning formats across content calendar'
          ],
          resources: [
            { title: 'Visual Content A/B Testing Guide', url: '#', type: 'article' },
            { title: 'Aspiration-Themed Templates', url: '#', type: 'template' },
            { title: 'Visual Content Creation Tools', url: '#', type: 'tool' }
          ],
          tags: ['visual-content', 'testing', 'optimization'],
          relatedRecommendations: ['rec-1', 'rec-4']
        },
        {
          id: 'rec-6',
          type: 'strategy',
          priority: 'low',
          confidence: 0.71,
          title: 'Develop Thought Leadership Partnership Program',
          description: 'Create a structured program to collaborate with aspiration-focused thought leaders in your industry.',
          rationale: 'Partnership content generates 89% more engagement than solo content, and your audience highly values diverse perspectives on future goals.',
          expectedImpact: {
            metric: 'Thought Leadership Score',
            improvement: '+52%',
            timeframe: '12-16 weeks'
          },
          actionSteps: [
            'Identify 10-15 aspiration-focused thought leaders',
            'Develop partnership proposal framework',
            'Create collaborative content formats',
            'Establish partnership success metrics',
            'Launch pilot program with 3-5 partners'
          ],
          resources: [
            { title: 'Partnership Proposal Template', url: '#', type: 'template' },
            { title: 'Thought Leader Identification Tool', url: '#', type: 'tool' },
            { title: 'Collaborative Content Best Practices', url: '#', type: 'article' }
          ],
          tags: ['partnerships', 'thought-leadership', 'collaboration'],
          relatedRecommendations: ['rec-4', 'rec-1']
        }
      ]

      setRecommendations(recommendationData)
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
      setGenerationProgress(100)
    }
  }, [])

  // Generate context data
  const generateContext = useCallback(() => {
    const contextData: RecommendationContext = {
      userProfile: {
        industry: 'Technology',
        role: 'Marketing Director',
        experience: '5-10 years',
        goals: ['Brand Awareness', 'Lead Generation', 'Thought Leadership']
      },
      performanceData: {
        currentMetrics: {
          engagement: 8.7,
          reach: 45000,
          impressions: 125000,
          clicks: 1250
        },
        benchmarks: {
          engagement: 6.2,
          reach: 38000,
          impressions: 95000,
          clicks: 980
        },
        trends: {
          engagement: 23.4,
          reach: 18.7,
          impressions: 31.6,
          clicks: 27.5
        }
      },
      marketContext: {
        seasonality: 'Q4 Planning',
        trends: ['AI Integration', 'Remote Work Evolution', 'Sustainability Focus'],
        competition: ['TechCorp Solutions', 'InnovateNow Inc', 'FutureTech Labs']
      }
    }
    setContext(contextData)
  }, [])

  // Generate personalization engine
  const generatePersonalization = useCallback(() => {
    const personalizationData: PersonalizationEngine = {
      learningRate: 0.85,
      userPreferences: {
        'content-strategy': 0.92,
        'timing': 0.78,
        'audience-expansion': 0.85,
        'visual-content': 0.67,
        'partnerships': 0.71
      },
      successPatterns: {
        'aspiration-focused': 0.94,
        'interactive-content': 0.87,
        'cross-industry': 0.82,
        'visual-storytelling': 0.79
      },
      failurePatterns: {
        'generic-content': 0.23,
        'poor-timing': 0.34,
        'demographic-targeting': 0.41
      }
    }
    setPersonalization(personalizationData)
  }, [])

  useEffect(() => {
    generateRecommendations()
    generateContext()
    generatePersonalization()
  }, [generateRecommendations, generateContext, generatePersonalization])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content': return <MessageSquare className="h-4 w-4" />
      case 'timing': return <Clock className="h-4 w-4" />
      case 'audience': return <Users className="h-4 w-4" />
      case 'strategy': return <Target className="h-4 w-4" />
      case 'optimization': return <Zap className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const filteredRecommendations = recommendations.filter(rec => 
    filters.types.includes(rec.type) && 
    filters.priorities.includes(rec.priority) && 
    rec.confidence >= filters.minConfidence
  )

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Recommendation Engine
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Personalized insights powered by machine learning and behavioral analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isGenerating && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-600">Generating...</span>
                  <Progress value={generationProgress} className="w-24" />
                </div>
              )}
              <Button
                onClick={generateRecommendations}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Refresh Recommendations
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Context Overview */}
      {context && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recommendation Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-3">Your Profile</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry:</span>
                    <span className="font-medium">{context.userProfile.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">{context.userProfile.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{context.userProfile.experience}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Performance vs Benchmark</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(context.performanceData.currentMetrics).map(([metric, value]) => (
                    <div key={metric} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{metric}:</span>
                      <span className="font-medium">{value}</span>
                      <span className={`text-xs ${
                        value > (context.performanceData.benchmarks as any)[metric] ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(context.performanceData.trends as any)[metric] > 0 ? '+' : ''}{(context.performanceData.trends as any)[metric]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Market Context</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Season:</span>
                    <span className="ml-2 font-medium">{context.marketContext.seasonality}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trending:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {context.marketContext.trends.map((trend) => (
                        <Badge key={trend} variant="outline" className="text-xs">
                          {trend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personalized">Personalized</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="high-impact">High Impact</TabsTrigger>
          <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
        </TabsList>

        {/* Personalized Recommendations */}
        <TabsContent value="personalized" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Personalized for You</h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm text-gray-600">Filtered by relevance</span>
            </div>
          </div>
          
          <div className="grid gap-4">
            {filteredRecommendations.map((recommendation) => (
              <Card 
                key={recommendation.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
                  selectedRecommendation?.id === recommendation.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedRecommendation(recommendation)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        {getTypeIcon(recommendation.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority} priority
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(recommendation.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{recommendation.description}</p>
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <p className="text-sm font-medium text-blue-800 mb-2">Expected Impact:</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm">
                                {recommendation.expectedImpact.metric}: <strong>{recommendation.expectedImpact.improvement}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">Timeline: {recommendation.expectedImpact.timeframe}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          {recommendation.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-1" />
                            Implement
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-1 ml-auto">
                            <Button size="sm" variant="ghost">
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
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

        {/* Trending Recommendations */}
        <TabsContent value="trending" className="space-y-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Based on current industry trends and successful patterns from similar profiles.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {filteredRecommendations
              .sort((a, b) => b.confidence - a.confidence)
              .slice(0, 3)
              .map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                          <Badge className="bg-orange-100 text-orange-800">
                            Trending
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{recommendation.rationale}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            Expected: {recommendation.expectedImpact.improvement} improvement
                          </span>
                          <span className="text-sm text-gray-500">
                            Confidence: {Math.round(recommendation.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* High Impact Recommendations */}
        <TabsContent value="high-impact" className="space-y-4">
          <div className="grid gap-4">
            {filteredRecommendations
              .filter(rec => rec.priority === 'high')
              .map((recommendation) => (
                <Card key={recommendation.id} className="border-l-4 border-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <Zap className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                          <Badge className="bg-red-100 text-red-800">
                            High Impact
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{recommendation.description}</p>
                        <div className="bg-red-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium text-red-800 mb-2">Action Steps:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-red-700">
                            {recommendation.actionSteps.slice(0, 3).map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button size="sm" variant="default" className="bg-red-600 hover:bg-red-700">
                            <Play className="h-4 w-4 mr-1" />
                            Start Implementation
                          </Button>
                          <Button size="sm" variant="outline">
                            View All Steps
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Quick Wins */}
        <TabsContent value="quick-wins" className="space-y-4">
          <div className="grid gap-4">
            {filteredRecommendations
              .filter(rec => rec.expectedImpact.timeframe.includes('week') && !rec.expectedImpact.timeframe.includes('8') && !rec.expectedImpact.timeframe.includes('10'))
              .map((recommendation) => (
                <Card key={recommendation.id} className="border-l-4 border-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Clock className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                          <Badge className="bg-green-100 text-green-800">
                            Quick Win
                          </Badge>
                          <Badge variant="outline">
                            {recommendation.expectedImpact.timeframe}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{recommendation.description}</p>
                        <div className="bg-green-50 p-4 rounded-lg mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">
                              Expected Impact: {recommendation.expectedImpact.improvement}
                            </span>
                            <span className="text-sm text-green-700">
                              Timeline: {recommendation.expectedImpact.timeframe}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                            <Zap className="h-4 w-4 mr-1" />
                            Quick Start
                          </Button>
                          <Button size="sm" variant="outline">
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                {getTypeIcon(selectedRecommendation.type)}
                {selectedRecommendation.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRecommendation(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Description</h4>
                <p className="text-gray-600 mb-4">{selectedRecommendation.description}</p>
                
                <h4 className="font-medium mb-3">Rationale</h4>
                <p className="text-gray-600 mb-4">{selectedRecommendation.rationale}</p>
                
                <h4 className="font-medium mb-3">Expected Impact</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedRecommendation.expectedImpact.metric}</span>
                    <span className="text-lg font-bold text-green-600">
                      {selectedRecommendation.expectedImpact.improvement}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Timeline: {selectedRecommendation.expectedImpact.timeframe}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Action Steps</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {selectedRecommendation.actionSteps.map((step, index) => (
                    <li key={index} className="text-gray-600">{step}</li>
                  ))}
                </ol>
                
                <h4 className="font-medium mb-3 mt-6">Resources</h4>
                <div className="space-y-2">
                  {selectedRecommendation.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <a href={resource.url} className="text-blue-600 hover:underline">
                        {resource.title}
                      </a>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Not Helpful
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button>
                  <Play className="h-4 w-4 mr-1" />
                  Implement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
