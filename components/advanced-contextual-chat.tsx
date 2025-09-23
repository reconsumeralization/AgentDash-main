"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Badge } from "@/components/ui"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  Settings,
  Minimize2,
  Maximize2,
  X,
  Zap,
  Brain,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Share2,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  Star,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ExternalLink,
  MoreHorizontal,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Users,
  MessageCircle,
  Hash,
  Tag
} from "lucide-react"
import { cn } from "@/lib"
import { useContextSurfacer } from '@/lib'
import { getSocialSkin, type SocialPlatform } from '@/lib/social-skins'

interface ChatMessage {
  id: string
  type: 'user' | 'agent' | 'system' | 'suggestion' | 'insight'
  content: string
  timestamp: Date
  context?: string
  actions?: ChatAction[]
  metadata?: Record<string, any>
  isStreaming?: boolean
  sentiment?: 'positive' | 'negative' | 'neutral'
  confidence?: number
  tags?: string[]
  relatedMessages?: string[]
  isBookmarked?: boolean
  rating?: number
}

interface ChatAction {
  id: string
  label: string
  action: string
  type: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  icon?: React.ReactNode
  shortcut?: string
}

interface ChatInsight {
  id: string
  type: 'trend' | 'opportunity' | 'risk' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  category: string
  timestamp: Date
  actions: ChatAction[]
}

interface ConversationAnalytics {
  messageCount: number
  averageResponseTime: number
  sentimentTrend: number
  topTopics: Array<{ topic: string; count: number }>
  engagementScore: number
  productivityScore: number
}

interface AdvancedContextualChatProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'sidebar' | 'floating'
  platform?: SocialPlatform
  persistent?: boolean
  showAnalytics?: boolean
  enableInsights?: boolean
}

export function AdvancedContextualChat({ 
  className, 
  position = 'bottom-right',
  persistent = true,
  platform,
  showAnalytics = true,
  enableInsights = true
}: AdvancedContextualChatProps) {
  const { 
    contextSurfacer, 
    guidance, 
    adaptiveState,
    updateUserContext,
    updateAgenticContext,
    updateUseCaseContext 
  } = useContextSurfacer()

  const skin = platform ? getSocialSkin(platform) : null
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Enhanced state management
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [insights, setInsights] = useState<ChatInsight[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [aiPersonality, setAiPersonality] = useState<'professional' | 'creative' | 'analytical' | 'empathetic'>('professional')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [conversationMode, setConversationMode] = useState<'chat' | 'insights' | 'analytics'>('chat')
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<string>>(new Set())
  const [analytics, setAnalytics] = useState<ConversationAnalytics>({
    messageCount: 0,
    averageResponseTime: 0,
    sentimentTrend: 0,
    topTopics: [],
    engagementScore: 0,
    productivityScore: 0
  })

  // Memoized quick actions with enhanced functionality
  const generateQuickActions = useMemo((): ChatAction[] => {
    if (!contextSurfacer) return []
    
    const context = contextSurfacer.getContextSummary()
    const { useCase, user } = context

    if (useCase.domain === 'linkedin') {
      return [
        { id: 'connect', label: 'Find Connections', action: 'find_connections', type: 'primary', icon: <Target className="w-4 h-4" /> },
        { id: 'content', label: 'Create Content', action: 'create_content', type: 'secondary', icon: <Zap className="w-4 h-4" /> },
        { id: 'analytics', label: 'View Analytics', action: 'view_analytics', type: 'secondary', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'insights', label: 'AI Insights', action: 'generate_insights', type: 'success', icon: <Lightbulb className="w-4 h-4" /> }
      ]
    } else if (useCase.domain === 'vulnerability-research') {
      return [
        { id: 'scan', label: 'Run Security Scan', action: 'run_security_scan', type: 'primary', icon: <Target className="w-4 h-4" /> },
        { id: 'compliance', label: 'Check Compliance', action: 'check_compliance', type: 'secondary', icon: <CheckCircle className="w-4 h-4" /> },
        { id: 'report', label: 'Generate Report', action: 'generate_report', type: 'secondary', icon: <Download className="w-4 h-4" /> },
        { id: 'threats', label: 'Threat Analysis', action: 'threat_analysis', type: 'warning', icon: <AlertCircle className="w-4 h-4" /> }
      ]
    } else if (useCase.domain === 'devops') {
      return [
        { id: 'deploy', label: 'Deploy Application', action: 'deploy_app', type: 'primary', icon: <Upload className="w-4 h-4" /> },
        { id: 'monitor', label: 'Check Status', action: 'check_status', type: 'secondary', icon: <RefreshCw className="w-4 h-4" /> },
        { id: 'logs', label: 'View Logs', action: 'view_logs', type: 'secondary', icon: <Search className="w-4 h-4" /> },
        { id: 'optimize', label: 'Performance Analysis', action: 'performance_analysis', type: 'success', icon: <Sparkles className="w-4 h-4" /> }
      ]
    } else {
      return [
        { id: 'help', label: 'Get Help', action: 'get_help', type: 'primary', icon: <Brain className="w-4 h-4" /> },
        { id: 'explore', label: 'Explore Features', action: 'explore_features', type: 'secondary', icon: <Zap className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', action: 'open_settings', type: 'secondary', icon: <Settings className="w-4 h-4" /> },
        { id: 'insights', label: 'Smart Insights', action: 'smart_insights', type: 'success', icon: <Lightbulb className="w-4 h-4" /> }
      ]
    }
  }, [contextSurfacer])

  // Enhanced AI personality and conversation flow
  const generatePersonalityResponse = useCallback((message: string, personality: string): string => {
    const responses = {
      professional: `I understand your request. Let me provide you with a comprehensive analysis and actionable recommendations.`,
      creative: `That's an interesting perspective! Let me explore some innovative approaches and creative solutions for you.`,
      analytical: `Let me break this down systematically and provide you with data-driven insights and detailed analysis.`,
      empathetic: `I can sense this is important to you. Let me help you work through this with care and understanding.`
    }
    return responses[personality as keyof typeof responses] || responses.professional
  }, [])

  // Advanced context analysis
  const analyzeContext = useCallback(async () => {
    setIsAnalyzing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newInsights: ChatInsight[] = [
        {
          id: 'insight-1',
          type: 'opportunity',
          title: 'Growth Opportunity Detected',
          description: 'Based on your recent activity, there are 3 potential growth opportunities in your network.',
          confidence: 0.87,
          impact: 'high',
          category: 'networking',
          timestamp: new Date(),
          actions: [
            { id: 'explore', label: 'Explore Opportunities', action: 'explore_opportunities', type: 'primary' },
            { id: 'dismiss', label: 'Dismiss', action: 'dismiss_insight', type: 'secondary' }
          ]
        },
        {
          id: 'insight-2',
          type: 'trend',
          title: 'Engagement Pattern Identified',
          description: 'Your posts perform 23% better when posted on Tuesday mornings.',
          confidence: 0.92,
          impact: 'medium',
          category: 'content',
          timestamp: new Date(),
          actions: [
            { id: 'schedule', label: 'Schedule Content', action: 'schedule_content', type: 'primary' },
            { id: 'analyze', label: 'Deep Dive', action: 'analyze_trend', type: 'secondary' }
          ]
        }
      ]
      
      setInsights(prev => [...prev, ...newInsights])
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  // Filter messages based on search and tags
  const filteredMessages = useMemo(() => {
    let filtered = messages
    
    if (searchQuery) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.context?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter(msg => 
        msg.tags?.some(tag => selectedTags.includes(tag))
      )
    }
    
    return filtered
  }, [messages, searchQuery, selectedTags])

  // Update analytics
  const updateAnalytics = useCallback(() => {
    const messageCount = messages.length
    const sentimentScores: number[] = messages
      .filter(msg => msg.sentiment)
      .map(msg => msg.sentiment === 'positive' ? 1 : msg.sentiment === 'negative' ? -1 : 0)
    
    const sentimentTrend = sentimentScores.length > 0 
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length 
      : 0

    const topics = messages
      .flatMap(msg => msg.tags || [])
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const topTopics = Object.entries(topics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }))

    setAnalytics(prev => ({
      ...prev,
      messageCount,
      sentimentTrend,
      topTopics,
      engagementScore: Math.min(100, messageCount * 2),
      productivityScore: Math.min(100, (sentimentTrend + 1) * 50)
    }))
  }, [messages])

  // Initialize with contextual welcome message
  useEffect(() => {
    if (!contextSurfacer) return
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'agent',
      content: `Welcome! I'm your AI assistant, powered by advanced contextual understanding. I can help you with ${contextSurfacer.getContextSummary().useCase.domain} tasks and provide personalized insights.`,
      timestamp: new Date(),
      actions: generateQuickActions,
      tags: ['welcome', 'introduction'],
      sentiment: 'positive',
      confidence: 0.95
    }
    
    setMessages([welcomeMessage])
  }, [contextSurfacer, generateQuickActions])

  // Update analytics when messages change
  useEffect(() => {
    updateAnalytics()
  }, [updateAnalytics])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filteredMessages])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      sentiment: 'neutral'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      const aiResponse: ChatMessage = {
        id: `agent-${Date.now()}`,
        type: 'agent',
        content: generatePersonalityResponse(content, aiPersonality),
        timestamp: new Date(),
        actions: generateQuickActions,
        tags: ['response', 'ai-generated'],
        sentiment: 'positive',
        confidence: 0.85
      }

      setMessages(prev => [...prev, aiResponse])

      // Generate insights occasionally
      if (Math.random() < 0.3 && enableInsights) {
        await analyzeContext()
      }
    } finally {
      setIsTyping(false)
    }
  }, [aiPersonality, generatePersonalityResponse, generateQuickActions, analyzeContext, enableInsights])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }, [inputValue, handleSendMessage])

  const handleActionClick = useCallback((action: ChatAction) => {
    handleSendMessage(`Execute action: ${action.label}`)
  }, [handleSendMessage])

  const toggleBookmark = useCallback((messageId: string) => {
    setBookmarkedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }, [])

  const getMessageIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />
      case 'agent': return <Bot className="w-4 h-4" />
      case 'system': return <Settings className="w-4 h-4" />
      case 'suggestion': return <Lightbulb className="w-4 h-4" />
      case 'insight': return <Sparkles className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      case 'neutral': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  if (isMinimized) {
    return (
      <div className={cn(
        "fixed z-50 transition-all duration-300",
        position === 'bottom-right' && "bottom-4 right-4",
        position === 'bottom-left' && "bottom-4 left-4",
        className
      )}>
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          AI Assistant
          {messages.length > 1 && (
            <Badge variant="secondary" className="ml-2">
              {messages.length - 1}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300",
      position === 'bottom-right' && "bottom-4 right-4",
      position === 'bottom-left' && "bottom-4 left-4",
      position === 'sidebar' && "top-4 right-4 bottom-4 w-96",
      position === 'floating' && "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      className
    )}>
      <Card className="w-96 h-[600px] shadow-2xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              {isAnalyzing && (
                <div className="flex items-center space-x-1">
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Analyzing...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConversationMode(conversationMode === 'chat' ? 'insights' : 'chat')}
              >
                {conversationMode === 'chat' ? <BarChart3 className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <Tabs value={conversationMode} onValueChange={(value) => setConversationMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
              <TabsTrigger value="chat" className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center space-x-1">
                <Lightbulb className="w-4 h-4" />
                <span>Insights</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              {/* Search and Filter */}
              <div className="px-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-8"
                  />
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start space-x-3",
                        message.type === 'user' && "flex-row-reverse space-x-reverse"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        message.type === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {getMessageIcon(message.type)}
                      </div>
                      
                      <div className={cn(
                        "flex-1 max-w-[80%] space-y-1",
                        message.type === 'user' && "text-right"
                      )}>
                        <div className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          message.type === 'user' 
                            ? "bg-primary text-primary-foreground" 
                            : message.type === 'agent'
                            ? "bg-muted"
                            : message.type === 'system'
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-50 text-blue-800"
                        )}>
                          {message.content}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                            {message.sentiment && (
                              <span className={getSentimentColor(message.sentiment)}>
                                {message.sentiment}
                              </span>
                            )}
                            {message.confidence && (
                              <span>{(message.confidence * 100).toFixed(0)}%</span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(message.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Star className={cn(
                                "w-3 h-3",
                                bookmarkedMessages.has(message.id) ? "fill-yellow-400 text-yellow-400" : ""
                              )} />
                            </Button>
                            {message.actions && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(message.content)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {message.actions && message.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.actions.map((action) => (
                              <Button
                                key={action.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleActionClick(action)}
                                className="h-7 text-xs"
                              >
                                {action.icon}
                                <span className="ml-1">{action.label}</span>
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Tags */}
                        {message.tags && message.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs h-5"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="insights" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <Card key={insight.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={insight.type === 'opportunity' ? 'default' : 'secondary'}>
                              {insight.type}
                            </Badge>
                            <Badge variant="outline">
                              {insight.impact}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        
                        <h4 className="font-medium mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                        
                        <div className="flex flex-wrap gap-1">
                          {insight.actions.map((action) => (
                            <Button
                              key={action.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleActionClick(action)}
                              className="h-7 text-xs"
                            >
                              {action.icon}
                              <span className="ml-1">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {insights.length === 0 && (
                    <div className="text-center py-8">
                      <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No insights yet. Start a conversation to generate insights!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Messages</span>
                        </div>
                        <p className="text-2xl font-bold">{analytics.messageCount}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Engagement</span>
                        </div>
                        <p className="text-2xl font-bold">{analytics.engagementScore}%</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Topics */}
                  {analytics.topTopics.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Top Topics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.topTopics.map(({ topic, count }) => (
                            <div key={topic} className="flex items-center justify-between">
                              <span className="text-sm">{topic}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sentiment Trend */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Sentiment Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          analytics.sentimentTrend > 0 ? "bg-green-500" : 
                          analytics.sentimentTrend < 0 ? "bg-red-500" : "bg-gray-500"
                        )} />
                        <span className="text-sm">
                          {analytics.sentimentTrend > 0 ? "Positive" : 
                           analytics.sentimentTrend < 0 ? "Negative" : "Neutral"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({analytics.sentimentTrend.toFixed(2)})
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* Quick Actions */}
            {generateQuickActions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {generateQuickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleActionClick(action)}
                    className="h-7 text-xs"
                  >
                    {action.icon}
                    <span className="ml-1">{action.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedContextualChat
