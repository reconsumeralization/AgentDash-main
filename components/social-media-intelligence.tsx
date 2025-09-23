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
  Eye,
  Heart,
  Share2,
  MessageSquare,
  Users,
  Globe,
  Clock,
  Zap,
  Target,
  Brain,
  Search,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Play,
  Pause,
  Download,
  Settings,
  Maximize2,
  Minimize2
} from "lucide-react"

interface SocialTrend {
  hashtag: string
  mentions: number
  engagement: number
  sentiment: 'positive' | 'negative' | 'neutral'
  growth: number
  influencers: string[]
  relatedTopics: string[]
}

interface InfluencerInsight {
  name: string
  platform: string
  followers: number
  engagement: number
  relevanceScore: number
  recentPosts: number
  avgEngagement: number
  topics: string[]
  collaborationPotential: 'high' | 'medium' | 'low'
}

interface ContentPerformance {
  platform: string
  contentType: string
  performance: number
  engagement: number
  reach: number
  optimalTiming: string[]
  bestPractices: string[]
}

interface CompetitorActivity {
  competitor: string
  recentPosts: number
  engagement: number
  topContent: string
  audienceGrowth: number
  campaignTypes: string[]
  strengths: string[]
  weaknesses: string[]
}

interface SentimentAnalysis {
  overall: number
  positive: number
  negative: number
  neutral: number
  trends: Array<{
    date: string
    sentiment: number
  }>
}

export function SocialMediaIntelligence() {
  const [trends, setTrends] = useState<SocialTrend[]>([])
  const [influencers, setInfluencers] = useState<InfluencerInsight[]>([])
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([])
  const [competitors, setCompetitors] = useState<CompetitorActivity[]>([])
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState('trends')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [filters, setFilters] = useState({
    platforms: ['linkedin', 'twitter', 'facebook', 'instagram'],
    topics: ['ai', 'technology', 'business', 'innovation'],
    minEngagement: 100
  })

  // Generate trending topics
  const generateTrends = useCallback(async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 15, 100))
    }, 300)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const trendData: SocialTrend[] = [
        {
          hashtag: '#AIInnovation',
          mentions: 45600,
          engagement: 8.7,
          sentiment: 'positive',
          growth: 234.5,
          influencers: ['@TechLeader', '@AIFounder', '@InnovationHub'],
          relatedTopics: ['Machine Learning', 'Automation', 'Future Tech']
        },
        {
          hashtag: '#SustainableTech',
          mentions: 32100,
          engagement: 12.3,
          sentiment: 'positive',
          growth: 187.2,
          influencers: ['@GreenTech', '@SustainabilityPro', '@EcoInnovator'],
          relatedTopics: ['Green Technology', 'Climate Tech', 'ESG']
        },
        {
          hashtag: '#RemoteWork',
          mentions: 28900,
          engagement: 6.8,
          sentiment: 'neutral',
          growth: 45.3,
          influencers: ['@RemoteWorkGuru', '@WFHExpert', '@DigitalNomad'],
          relatedTopics: ['Productivity', 'Digital Tools', 'Work-Life Balance']
        },
        {
          hashtag: '#Cybersecurity',
          mentions: 18700,
          engagement: 15.2,
          sentiment: 'positive',
          growth: 156.7,
          influencers: ['@SecurityExpert', '@CyberDefender', '@InfoSecPro'],
          relatedTopics: ['Data Protection', 'Privacy', 'Threat Intelligence']
        },
        {
          hashtag: '#Web3',
          mentions: 15200,
          engagement: 9.4,
          sentiment: 'neutral',
          growth: 78.9,
          influencers: ['@BlockchainDev', '@CryptoAnalyst', '@Web3Builder'],
          relatedTopics: ['Blockchain', 'DeFi', 'NFTs', 'Metaverse']
        }
      ]

      setTrends(trendData)
    } catch (error) {
      console.error('Error generating trends:', error)
    } finally {
      clearInterval(progressInterval)
      setIsAnalyzing(false)
      setAnalysisProgress(100)
    }
  }, [])

  // Generate influencer insights
  const generateInfluencers = useCallback(() => {
    const influencerData: InfluencerInsight[] = [
      {
        name: 'Sarah Chen',
        platform: 'LinkedIn',
        followers: 125000,
        engagement: 8.7,
        relevanceScore: 94,
        recentPosts: 12,
        avgEngagement: 6.2,
        topics: ['AI', 'Leadership', 'Innovation'],
        collaborationPotential: 'high'
      },
      {
        name: 'Marcus Rodriguez',
        platform: 'Twitter',
        followers: 89000,
        engagement: 12.3,
        relevanceScore: 87,
        recentPosts: 45,
        avgEngagement: 9.8,
        topics: ['Tech', 'Startups', 'Venture Capital'],
        collaborationPotential: 'high'
      },
      {
        name: 'Dr. Emily Watson',
        platform: 'LinkedIn',
        followers: 67000,
        engagement: 15.8,
        relevanceScore: 91,
        recentPosts: 8,
        avgEngagement: 12.4,
        topics: ['Research', 'AI Ethics', 'Technology'],
        collaborationPotential: 'medium'
      },
      {
        name: 'Alex Thompson',
        platform: 'Instagram',
        followers: 156000,
        engagement: 6.2,
        relevanceScore: 73,
        recentPosts: 23,
        avgEngagement: 4.8,
        topics: ['Lifestyle', 'Tech Reviews', 'Entrepreneurship'],
        collaborationPotential: 'medium'
      }
    ]
    setInfluencers(influencerData)
  }, [])

  // Generate content performance data
  const generateContentPerformance = useCallback(() => {
    const performanceData: ContentPerformance[] = [
      {
        platform: 'LinkedIn',
        contentType: 'Educational Articles',
        performance: 92,
        engagement: 8.7,
        reach: 45000,
        optimalTiming: ['Tuesday 10-11 AM', 'Wednesday 2-3 PM', 'Thursday 9-10 AM'],
        bestPractices: [
          'Use professional tone',
          'Include industry insights',
          'Add relevant hashtags (3-5)',
          'Engage with comments within 2 hours'
        ]
      },
      {
        platform: 'Twitter',
        contentType: 'Quick Insights',
        performance: 87,
        engagement: 12.3,
        reach: 28000,
        optimalTiming: ['Monday 8-9 AM', 'Wednesday 12-1 PM', 'Friday 3-4 PM'],
        bestPractices: [
          'Keep under 280 characters',
          'Use trending hashtags',
          'Include visuals when possible',
          'Engage in conversations'
        ]
      },
      {
        platform: 'Instagram',
        contentType: 'Visual Stories',
        performance: 78,
        engagement: 6.2,
        reach: 35000,
        optimalTiming: ['Monday 6-7 PM', 'Wednesday 5-6 PM', 'Friday 7-8 PM'],
        bestPractices: [
          'High-quality visuals',
          'Consistent brand aesthetic',
          'Use Stories features',
          'Post user-generated content'
        ]
      }
    ]
    setContentPerformance(performanceData)
  }, [])

  // Generate competitor analysis
  const generateCompetitors = useCallback(() => {
    const competitorData: CompetitorActivity[] = [
      {
        competitor: 'TechCorp Solutions',
        recentPosts: 23,
        engagement: 7.8,
        topContent: 'AI Integration Guide',
        audienceGrowth: 12.5,
        campaignTypes: ['Educational', 'Product Demo', 'Thought Leadership'],
        strengths: ['Strong video content', 'Expert team', 'Industry connections'],
        weaknesses: ['Limited social media presence', 'Inconsistent posting']
      },
      {
        competitor: 'InnovateNow Inc',
        recentPosts: 18,
        engagement: 9.2,
        topContent: 'Future of Work Series',
        audienceGrowth: 18.7,
        campaignTypes: ['Storytelling', 'Case Studies', 'Industry Reports'],
        strengths: ['Excellent storytelling', 'Strong thought leadership', 'Engaging visuals'],
        weaknesses: ['Niche audience', 'Limited video content']
      },
      {
        competitor: 'FutureTech Labs',
        recentPosts: 31,
        engagement: 6.4,
        topContent: 'Technical Deep Dives',
        audienceGrowth: 8.3,
        campaignTypes: ['Technical Content', 'Product Updates', 'Webinars'],
        strengths: ['Technical expertise', 'Regular posting', 'Community engagement'],
        weaknesses: ['Complex content', 'Limited visual appeal']
      }
    ]
    setCompetitors(competitorData)
  }, [])

  // Generate sentiment analysis
  const generateSentiment = useCallback(() => {
    const sentimentData: SentimentAnalysis = {
      overall: 0.72,
      positive: 68,
      negative: 12,
      neutral: 20,
      trends: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sentiment: 0.65 + Math.random() * 0.3
      }))
    }
    setSentiment(sentimentData)
  }, [])

  useEffect(() => {
    generateTrends()
    generateInfluencers()
    generateContentPerformance()
    generateCompetitors()
    generateSentiment()
  }, [generateTrends, generateInfluencers, generateContentPerformance, generateCompetitors, generateSentiment])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCollaborationColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Social Media Intelligence
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Advanced analytics and insights across all social platforms
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAnalyzing && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">Analyzing...</span>
                  <Progress value={analysisProgress} className="w-24" />
                </div>
              )}
              <Button
                onClick={generateTrends}
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Refresh Analysis
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sentiment Overview */}
      {sentiment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{sentiment.positive}%</div>
                <div className="text-sm text-gray-600">Positive</div>
                <Progress value={sentiment.positive} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{sentiment.negative}%</div>
                <div className="text-sm text-gray-600">Negative</div>
                <Progress value={sentiment.negative} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{sentiment.neutral}%</div>
                <div className="text-sm text-gray-600">Neutral</div>
                <Progress value={sentiment.neutral} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{(sentiment.overall * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Overall Score</div>
                <Progress value={sentiment.overall * 100} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="influencers">Influencers</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4">
            {trends.map((trend, index) => (
              <Card key={trend.hashtag} className="border-l-4 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold">#{trend.hashtag}</h3>
                          <Badge className={getSentimentColor(trend.sentiment)}>
                            {trend.sentiment}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            +{trend.growth.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Mentions</p>
                            <p className="text-lg font-semibold">{formatNumber(trend.mentions)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Engagement Rate</p>
                            <p className="text-lg font-semibold">{trend.engagement}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Growth</p>
                            <p className="text-lg font-semibold text-green-600">+{trend.growth.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Top Influencers</p>
                          <div className="flex flex-wrap gap-2">
                            {trend.influencers.map((influencer) => (
                              <Badge key={influencer} variant="outline" className="text-xs">
                                {influencer}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Related Topics</p>
                          <div className="flex flex-wrap gap-1">
                            {trend.relatedTopics.map((topic) => (
                              <Badge key={topic} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Target className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Influencers Tab */}
        <TabsContent value="influencers" className="space-y-4">
          <div className="grid gap-4">
            {influencers.map((influencer, index) => (
              <Card key={influencer.name}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold">{influencer.name}</h3>
                          <Badge variant="outline">{influencer.platform}</Badge>
                          <Badge className={getCollaborationColor(influencer.collaborationPotential)}>
                            {influencer.collaborationPotential} potential
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Followers</p>
                            <p className="text-lg font-semibold">{formatNumber(influencer.followers)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Engagement</p>
                            <p className="text-lg font-semibold">{influencer.engagement}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Relevance Score</p>
                            <p className="text-lg font-semibold">{influencer.relevanceScore}/100</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Recent Posts</p>
                            <p className="text-lg font-semibold">{influencer.recentPosts}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Topics</p>
                          <div className="flex flex-wrap gap-1">
                            {influencer.topics.map((topic) => (
                              <Badge key={topic} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Performance Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4">
            {contentPerformance.map((content, index) => (
              <Card key={`${content.platform}-${content.contentType}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>{content.platform}</CardTitle>
                        <p className="text-sm text-gray-600">{content.contentType}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {content.performance}% performance
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Engagement Rate</span>
                          <span className="font-medium">{content.engagement}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Average Reach</span>
                          <span className="font-medium">{formatNumber(content.reach)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Performance Score</span>
                          <span className="font-medium">{content.performance}/100</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Optimal Timing</h4>
                      <div className="space-y-2">
                        {content.optimalTiming.map((time, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-blue-500" />
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Best Practices</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {content.bestPractices.map((practice, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {practice}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-4">
          <div className="grid gap-4">
            {competitors.map((competitor, index) => (
              <Card key={competitor.competitor}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {competitor.competitor}
                    </CardTitle>
                    <Badge variant="outline">
                      +{competitor.audienceGrowth}% growth
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Activity Overview</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Recent Posts</span>
                          <span className="font-medium">{competitor.recentPosts}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg Engagement</span>
                          <span className="font-medium">{competitor.engagement}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Top Content</span>
                          <span className="font-medium text-blue-600">{competitor.topContent}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Campaign Types</h5>
                        <div className="flex flex-wrap gap-1">
                          {competitor.campaignTypes.map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Analysis</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-green-700 mb-2">Strengths</h5>
                          <ul className="space-y-1">
                            {competitor.strengths.map((strength, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-red-700 mb-2">Weaknesses</h5>
                          <ul className="space-y-1">
                            {competitor.weaknesses.map((weakness, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              AI-powered insights and recommendations based on comprehensive social media analysis.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {[
              {
                title: 'Optimal Content Strategy',
                insight: 'Educational content performs 45% better on LinkedIn during Tuesday-Thursday 10-11 AM slots. Consider shifting your content calendar to align with these peak engagement periods.',
                action: 'Adjust posting schedule',
                impact: 'high'
              },
              {
                title: 'Influencer Collaboration Opportunity',
                insight: 'Sarah Chen (@TechLeader) has 94% relevance score and high engagement. A collaboration could reach 125K+ relevant professionals in your target market.',
                action: 'Initiate partnership discussion',
                impact: 'high'
              },
              {
                title: 'Trending Topic Alignment',
                insight: '#AIInnovation is trending with 234% growth and positive sentiment. Creating content around this hashtag could increase visibility by 40%.',
                action: 'Create AI-focused content',
                impact: 'medium'
              },
              {
                title: 'Competitive Advantage',
                insight: 'Your engagement rate (12.3%) is 35% higher than industry average. Leverage this strength to differentiate in thought leadership content.',
                action: 'Amplify thought leadership',
                impact: 'medium'
              }
            ].map((insight, index) => (
              <Card key={index} className="border-l-4 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                        <p className="text-gray-600 mb-4">{insight.insight}</p>
                        <div className="flex items-center gap-4">
                          <Badge className={insight.impact === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                            {insight.impact} impact
                          </Badge>
                          <span className="text-sm text-gray-500">Recommended Action: {insight.action}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-1" />
                      Execute
                    </Button>
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
