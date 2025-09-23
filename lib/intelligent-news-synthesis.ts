/**
 * Intelligent News Feed Synthesis System
 * Aggregates all users' content into leading intelligent indicators
 */

import { supabase } from './supabase'
import { errorHandler, ErrorCategory } from './error-handling'
import { performanceMonitor } from './performance-monitor'
import { VerifiedNewsSynthesis, linkedinVerifiedIntegration } from './linkedin-verified-integration'
import { linkedinLiteProfileService, NewsItemLiteProfileEnhancer } from './linkedin-lite-profile-service'

export interface NewsItem {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type: 'post' | 'comment' | 'share' | 'achievement' | 'milestone'
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'internal'
  timestamp: Date
  engagement: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  metadata: {
    tags: string[]
    sentiment: 'positive' | 'negative' | 'neutral'
    category: string
    industry?: string
    location?: string
    language: string
  }
  originalPostId?: string
  parentId?: string
}

export interface SynthesizedInsight {
  id: string
  type: 'trend' | 'sentiment' | 'engagement' | 'topic' | 'influence' | 'prediction'
  title: string
  description: string
  confidence: number // 0-1
  impact: 'low' | 'medium' | 'high' | 'critical'
  data: {
    value: number
    change: number
    changeType: 'increase' | 'decrease' | 'stable'
    timeframe: string
  }
  relatedItems: string[] // News item IDs
  tags: string[]
  timestamp: Date
  predictions?: {
    nextWeek: number
    nextMonth: number
    confidence: number
  }
}

export interface LeadingIndicator {
  id: string
  name: string
  description: string
  category: 'engagement' | 'sentiment' | 'growth' | 'innovation' | 'collaboration' | 'market'
  value: number
  trend: 'rising' | 'falling' | 'stable' | 'volatile'
  confidence: number
  lastUpdated: Date
  insights: SynthesizedInsight[]
  metadata: {
    sourceCount: number
    userCount: number
    platformCount: number
    timeRange: string
  }
}

export interface NewsSynthesisConfig {
  timeWindow: number // hours
  minEngagement: number
  maxItems: number
  platforms: string[]
  categories: string[]
  languages: string[]
  sentimentWeights: {
    positive: number
    negative: number
    neutral: number
  }
  engagementWeights: {
    likes: number
    comments: number
    shares: number
    views: number
  }
}

export class IntelligentNewsSynthesis {
  private config: NewsSynthesisConfig
  private cache = new Map<string, any>()
  private realTimeSubscriptions: any[] = []
  private verifiedSynthesis: VerifiedNewsSynthesis
  private liteProfileEnhancer: NewsItemLiteProfileEnhancer

  constructor(config?: Partial<NewsSynthesisConfig>) {
    this.config = {
      timeWindow: 24, // 24 hours
      minEngagement: 5,
      maxItems: 1000,
      platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'internal'],
      categories: ['technology', 'business', 'innovation', 'career', 'networking'],
      languages: ['en', 'es', 'fr', 'de'],
      sentimentWeights: {
        positive: 1.2,
        negative: 0.8,
        neutral: 1.0
      },
      engagementWeights: {
        likes: 1.0,
        comments: 2.0,
        shares: 3.0,
        views: 0.1
      },
      ...config
    }
    
    // Initialize verified synthesis
    this.verifiedSynthesis = new VerifiedNewsSynthesis({
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      redirectUri: process.env.LINKEDIN_REDIRECT_URI || '',
      scopes: [
        'r_verify_details',
        'r_profile_basicinfo',
        'r_primary_current_experience',
        'r_most_recent_education'
      ],
      baseUrl: 'https://api.linkedin.com',
      apiVersion: 'v2'
    })
    
    // Initialize lite profile enhancer
    this.liteProfileEnhancer = new NewsItemLiteProfileEnhancer(linkedinLiteProfileService)
  }

  /**
   * Synthesize news feed from all users' content
   */
  async synthesizeNewsFeed(): Promise<{
    newsItems: NewsItem[]
    insights: SynthesizedInsight[]
    indicators: LeadingIndicator[]
  }> {
    const perfLogger = performanceMonitor.createPerformanceLogger('news_synthesis')
    
    try {
      // Step 1: Collect all news items
      const newsItems = await this.collectNewsItems()
      
      // Step 2: Enhance with LinkedIn Lite Profile data
      const liteProfileEnhancedItems = await this.liteProfileEnhancer.enhanceNewsItemsWithLiteProfiles(newsItems)
      
      // Step 3: Enhance with LinkedIn verification data
      const enhancedNewsItems = await this.verifiedSynthesis.enhanceNewsItemsWithVerification(liteProfileEnhancedItems)
      
      // Step 4: Analyze and synthesize insights
      const insights = await this.analyzeInsights(enhancedNewsItems)
      
      // Step 5: Generate verified insights
      const verifiedInsights = this.verifiedSynthesis.generateVerifiedInsights(enhancedNewsItems)
      
      // Step 6: Generate leading indicators
      const indicators = await this.generateLeadingIndicators([...insights, ...verifiedInsights], enhancedNewsItems)
      
      // Step 7: Cache results
      await this.cacheResults(enhancedNewsItems, [...insights, ...verifiedInsights], indicators)
      
      perfLogger.finish()
      
      return {
        newsItems: enhancedNewsItems,
        insights: [...insights, ...verifiedInsights],
        indicators
      }
    } catch (error) {
      errorHandler.log('error', 'Failed to synthesize news feed', {
        category: ErrorCategory.AI,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
      throw error
    }
  }

  /**
   * Collect news items from all platforms and users
   */
  private async collectNewsItems(): Promise<NewsItem[]> {
    const perfLogger = performanceMonitor.createPerformanceLogger('collect_news_items')
    
    try {
      const timeThreshold = new Date(Date.now() - this.config.timeWindow * 60 * 60 * 1000)
      
      // Collect from internal platform
      const internalItems = await this.collectInternalItems(timeThreshold)
      
      // Collect from social media platforms
      const socialItems = await this.collectSocialMediaItems(timeThreshold)
      
      // Combine and process
      const allItems = [...internalItems, ...socialItems]
      
      // Filter and rank by engagement
      const filteredItems = this.filterAndRankItems(allItems)
      
      perfLogger.finish()
      return filteredItems
    } catch (error) {
      errorHandler.log('error', 'Failed to collect news items', {
        category: ErrorCategory.DATABASE,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
      throw error
    }
  }

  /**
   * Collect internal platform items (posts, comments, achievements)
   */
  private async collectInternalItems(timeThreshold: Date): Promise<NewsItem[]> {
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        created_at,
        engagement_metrics,
        metadata,
        users!inner(
          id,
          name,
          avatar_url
        )
      `)
      .gte('created_at', timeThreshold.toISOString())
      .order('created_at', { ascending: false })

    if (postsError) throw postsError

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        content,
        created_at,
        post_id,
        users!inner(
          id,
          name,
          avatar_url
        )
      `)
      .gte('created_at', timeThreshold.toISOString())

    if (commentsError) throw commentsError

    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        id,
        user_id,
        achievement_type,
        description,
        created_at,
        users!inner(
          id,
          name,
          avatar_url
        )
      `)
      .gte('created_at', timeThreshold.toISOString())

    if (achievementsError) throw achievementsError

    // Transform to NewsItem format
    const items: NewsItem[] = []

    // Posts
    posts?.forEach((post: any) => {
      items.push({
        id: post.id,
        userId: post.user_id,
        userName: post.users.name,
        userAvatar: post.users.avatar_url,
        content: post.content,
        type: 'post',
        platform: 'internal',
        timestamp: new Date(post.created_at),
        engagement: post.engagement_metrics || { likes: 0, comments: 0, shares: 0, views: 0 },
        metadata: {
          tags: post.metadata?.tags || [],
          sentiment: this.analyzeSentiment(post.content),
          category: post.metadata?.category || 'general',
          language: 'en'
        }
      })
    })

    // Comments
    comments?.forEach((comment: any) => {
      items.push({
        id: comment.id,
        userId: comment.user_id,
        userName: comment.users.name,
        userAvatar: comment.users.avatar_url,
        content: comment.content,
        type: 'comment',
        platform: 'internal',
        timestamp: new Date(comment.created_at),
        engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
        metadata: {
          tags: [],
          sentiment: this.analyzeSentiment(comment.content),
          category: 'discussion',
          language: 'en'
        },
        originalPostId: comment.post_id
      })
    })

    // Achievements
    achievements?.forEach((achievement: any) => {
      items.push({
        id: achievement.id,
        userId: achievement.user_id,
        userName: achievement.users.name,
        userAvatar: achievement.users.avatar_url,
        content: `Achieved: ${achievement.description}`,
        type: 'achievement',
        platform: 'internal',
        timestamp: new Date(achievement.created_at),
        engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
        metadata: {
          tags: [achievement.achievement_type],
          sentiment: 'positive',
          category: 'achievement',
          language: 'en'
        }
      })
    })

    return items
  }

  /**
   * Collect items from social media platforms
   */
  private async collectSocialMediaItems(timeThreshold: Date): Promise<NewsItem[]> {
    const { data: socialPosts, error } = await supabase
      .from('social_media_posts')
      .select(`
        id,
        user_id,
        platform,
        content,
        created_at,
        engagement_metrics,
        metadata,
        users!inner(
          id,
          name,
          avatar_url
        )
      `)
      .gte('created_at', timeThreshold.toISOString())
      .in('platform', this.config.platforms)

    if (error) throw error

    return socialPosts?.map((post: any) => ({
      id: post.id,
      userId: post.user_id,
      userName: post.users.name,
      userAvatar: post.users.avatar_url,
      content: post.content,
      type: 'post',
      platform: post.platform as any,
      timestamp: new Date(post.created_at),
      engagement: post.engagement_metrics || { likes: 0, comments: 0, shares: 0, views: 0 },
      metadata: {
        tags: post.metadata?.tags || [],
        sentiment: this.analyzeSentiment(post.content),
        category: post.metadata?.category || 'social',
        language: post.metadata?.language || 'en'
      }
    })) || []
  }

  /**
   * Filter and rank items by engagement and relevance
   */
  private filterAndRankItems(items: NewsItem[]): NewsItem[] {
    return items
      .filter(item => {
        const totalEngagement = this.calculateEngagementScore(item.engagement)
        return totalEngagement >= this.config.minEngagement
      })
      .sort((a, b) => {
        const scoreA = this.calculateItemScore(a)
        const scoreB = this.calculateItemScore(b)
        return scoreB - scoreA
      })
      .slice(0, this.config.maxItems)
  }

  /**
   * Calculate engagement score for an item
   */
  private calculateEngagementScore(engagement: NewsItem['engagement']): number {
    return (
      engagement.likes * this.config.engagementWeights.likes +
      engagement.comments * this.config.engagementWeights.comments +
      engagement.shares * this.config.engagementWeights.shares +
      engagement.views * this.config.engagementWeights.views
    )
  }

  /**
   * Calculate overall score for an item
   */
  private calculateItemScore(item: NewsItem): number {
    const engagementScore = this.calculateEngagementScore(item.engagement)
    const sentimentMultiplier = this.config.sentimentWeights[item.metadata.sentiment]
    const recencyScore = this.calculateRecencyScore(item.timestamp)
    
    return engagementScore * sentimentMultiplier * recencyScore
  }

  /**
   * Calculate recency score (newer items get higher scores)
   */
  private calculateRecencyScore(timestamp: Date): number {
    const hoursAgo = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60)
    return Math.max(0.1, 1 - (hoursAgo / this.config.timeWindow))
  }

  /**
   * Analyze sentiment of text content
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    // Simple sentiment analysis - in production, use a proper NLP service
    const positiveWords = ['great', 'amazing', 'excellent', 'wonderful', 'fantastic', 'love', 'best', 'awesome']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointed', 'frustrated']
    
    const words = text.toLowerCase().split(/\s+/)
    const positiveCount = words.filter(word => positiveWords.includes(word)).length
    const negativeCount = words.filter(word => negativeWords.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  /**
   * Analyze insights from news items
   */
  private async analyzeInsights(newsItems: NewsItem[]): Promise<SynthesizedInsight[]> {
    const insights: SynthesizedInsight[] = []
    
    // Trend analysis
    insights.push(...this.analyzeTrends(newsItems))
    
    // Sentiment analysis
    insights.push(...this.analyzeSentimentTrends(newsItems))
    
    // Engagement analysis
    insights.push(...this.analyzeEngagementPatterns(newsItems))
    
    // Topic analysis
    insights.push(...this.analyzeTopics(newsItems))
    
    // Influence analysis
    insights.push(...this.analyzeInfluence(newsItems))
    
    return insights
  }

  /**
   * Analyze trending topics and themes
   */
  private analyzeTrends(newsItems: NewsItem[]): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = []
    
    // Group by tags and analyze frequency
    const tagFrequency = new Map<string, number>()
    const tagEngagement = new Map<string, number>()
    
    newsItems.forEach(item => {
      item.metadata.tags.forEach(tag => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1)
        tagEngagement.set(tag, (tagEngagement.get(tag) || 0) + this.calculateEngagementScore(item.engagement))
      })
    })
    
    // Find trending tags
    const trendingTags = Array.from(tagFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
    
    trendingTags.forEach(([tag, frequency]) => {
      const previousFrequency = this.getPreviousTagFrequency(tag)
      const change = frequency - previousFrequency
      const changeType = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
      
      insights.push({
        id: `trend-${tag}`,
        type: 'trend',
        title: `Trending: ${tag}`,
        description: `${tag} is trending with ${frequency} mentions`,
        confidence: Math.min(0.9, frequency / 10),
        impact: frequency > 20 ? 'high' : frequency > 10 ? 'medium' : 'low',
        data: {
          value: frequency,
          change: Math.abs(change),
          changeType,
          timeframe: '24h'
        },
        relatedItems: newsItems.filter(item => item.metadata.tags.includes(tag)).map(item => item.id),
        tags: [tag],
        timestamp: new Date()
      })
    })
    
    return insights
  }

  /**
   * Analyze sentiment trends
   */
  private analyzeSentimentTrends(newsItems: NewsItem[]): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = []
    
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0
    }
    
    newsItems.forEach(item => {
      sentimentCounts[item.metadata.sentiment]++
    })
    
    const total = newsItems.length
    const positiveRatio = sentimentCounts.positive / total
    const negativeRatio = sentimentCounts.negative / total
    
    // Overall sentiment insight
    insights.push({
      id: 'overall-sentiment',
      type: 'sentiment',
      title: 'Overall Community Sentiment',
      description: `${Math.round(positiveRatio * 100)}% positive sentiment across all content`,
      confidence: 0.8,
      impact: positiveRatio > 0.7 ? 'high' : positiveRatio > 0.5 ? 'medium' : 'low',
      data: {
        value: positiveRatio,
        change: this.getSentimentChange(),
        changeType: this.getSentimentChangeType(),
        timeframe: '24h'
      },
      relatedItems: newsItems.map(item => item.id),
      tags: ['sentiment', 'community'],
      timestamp: new Date()
    })
    
    return insights
  }

  /**
   * Analyze engagement patterns
   */
  private analyzeEngagementPatterns(newsItems: NewsItem[]): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = []
    
    const totalEngagement = newsItems.reduce((sum, item) => 
      sum + this.calculateEngagementScore(item.engagement), 0)
    
    const avgEngagement = totalEngagement / newsItems.length
    
    insights.push({
      id: 'engagement-trend',
      type: 'engagement',
      title: 'Community Engagement Level',
      description: `Average engagement score: ${avgEngagement.toFixed(1)}`,
      confidence: 0.7,
      impact: avgEngagement > 50 ? 'high' : avgEngagement > 20 ? 'medium' : 'low',
      data: {
        value: avgEngagement,
        change: this.getEngagementChange(),
        changeType: this.getEngagementChangeType(),
        timeframe: '24h'
      },
      relatedItems: newsItems.map(item => item.id),
      tags: ['engagement', 'community'],
      timestamp: new Date()
    })
    
    return insights
  }

  /**
   * Analyze topic clusters
   */
  private analyzeTopics(newsItems: NewsItem[]): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = []
    
    // Group by category
    const categoryCounts = new Map<string, number>()
    newsItems.forEach(item => {
      const category = item.metadata.category
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
    })
    
    // Find most discussed topics
    const topCategories = Array.from(categoryCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
    
    topCategories.forEach(([category, count]) => {
      insights.push({
        id: `topic-${category}`,
        type: 'topic',
        title: `Hot Topic: ${category}`,
        description: `${count} posts about ${category}`,
        confidence: Math.min(0.9, count / 20),
        impact: count > 30 ? 'high' : count > 15 ? 'medium' : 'low',
        data: {
          value: count,
          change: 0,
          changeType: 'stable',
          timeframe: '24h'
        },
        relatedItems: newsItems.filter(item => item.metadata.category === category).map(item => item.id),
        tags: [category],
        timestamp: new Date()
      })
    })
    
    return insights
  }

  /**
   * Analyze influence patterns
   */
  private analyzeInfluence(newsItems: NewsItem[]): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = []
    
    // Find most influential users (by engagement)
    const userInfluence = new Map<string, number>()
    newsItems.forEach(item => {
      const influence = this.calculateEngagementScore(item.engagement)
      userInfluence.set(item.userId, (userInfluence.get(item.userId) || 0) + influence)
    })
    
    const topInfluencers = Array.from(userInfluence.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
    
    if (topInfluencers.length > 0) {
      const [topUserId, topInfluence] = topInfluencers[0]
      const topUser = newsItems.find(item => item.userId === topUserId)
      
      insights.push({
        id: 'top-influencer',
        type: 'influence',
        title: 'Top Community Influencer',
        description: `${topUser?.userName} leading with ${topInfluence.toFixed(1)} influence score`,
        confidence: 0.8,
        impact: 'medium',
        data: {
          value: topInfluence,
          change: 0,
          changeType: 'stable',
          timeframe: '24h'
        },
        relatedItems: newsItems.filter(item => item.userId === topUserId).map(item => item.id),
        tags: ['influence', 'leadership'],
        timestamp: new Date()
      })
    }
    
    return insights
  }

  /**
   * Generate leading indicators from insights
   */
  private async generateLeadingIndicators(
    insights: SynthesizedInsight[], 
    newsItems: NewsItem[]
  ): Promise<LeadingIndicator[]> {
    const indicators: LeadingIndicator[] = []
    
    // Community Health Indicator
    const sentimentInsight = insights.find(i => i.type === 'sentiment')
    const engagementInsight = insights.find(i => i.type === 'engagement')
    
    if (sentimentInsight && engagementInsight) {
      const healthScore = (sentimentInsight.data.value * 0.6) + (engagementInsight.data.value / 100 * 0.4)
      
      indicators.push({
        id: 'community-health',
        name: 'Community Health Index',
        description: 'Overall health and engagement of the community',
        category: 'engagement',
        value: healthScore,
        trend: this.determineTrend(sentimentInsight.data.changeType, engagementInsight.data.changeType),
        confidence: (sentimentInsight.confidence + engagementInsight.confidence) / 2,
        lastUpdated: new Date(),
        insights: [sentimentInsight, engagementInsight],
        metadata: {
          sourceCount: newsItems.length,
          userCount: new Set(newsItems.map(item => item.userId)).size,
          platformCount: new Set(newsItems.map(item => item.platform)).size,
          timeRange: '24h'
        }
      })
    }
    
    // Innovation Index
    const innovationInsights = insights.filter(i => 
      i.tags.some(tag => ['technology', 'innovation', 'startup', 'ai', 'blockchain'].includes(tag))
    )
    
    if (innovationInsights.length > 0) {
      const innovationScore = innovationInsights.reduce((sum, insight) => sum + insight.data.value, 0) / innovationInsights.length
      
      indicators.push({
        id: 'innovation-index',
        name: 'Innovation Index',
        description: 'Level of innovation and technology discussion',
        category: 'innovation',
        value: innovationScore,
        trend: this.determineTrendFromInsights(innovationInsights),
        confidence: innovationInsights.reduce((sum, insight) => sum + insight.confidence, 0) / innovationInsights.length,
        lastUpdated: new Date(),
        insights: innovationInsights,
        metadata: {
          sourceCount: newsItems.filter(item => 
            item.metadata.tags.some(tag => ['technology', 'innovation', 'startup', 'ai', 'blockchain'].includes(tag))
          ).length,
          userCount: new Set(newsItems.filter(item => 
            item.metadata.tags.some(tag => ['technology', 'innovation', 'startup', 'ai', 'blockchain'].includes(tag))
          ).map(item => item.userId)).size,
          platformCount: new Set(newsItems.map(item => item.platform)).size,
          timeRange: '24h'
        }
      })
    }
    
    // Growth Momentum
    const growthInsights = insights.filter(i => i.type === 'trend' && i.impact === 'high')
    
    if (growthInsights.length > 0) {
      const growthScore = growthInsights.length * 10 // Simple scoring
      
      indicators.push({
        id: 'growth-momentum',
        name: 'Growth Momentum',
        description: 'Momentum in trending topics and discussions',
        category: 'growth',
        value: growthScore,
        trend: 'rising',
        confidence: 0.7,
        lastUpdated: new Date(),
        insights: growthInsights,
        metadata: {
          sourceCount: growthInsights.reduce((sum, insight) => sum + insight.relatedItems.length, 0),
          userCount: new Set(growthInsights.flatMap(insight => 
            newsItems.filter(item => insight.relatedItems.includes(item.id)).map(item => item.userId)
          )).size,
          platformCount: new Set(newsItems.map(item => item.platform)).size,
          timeRange: '24h'
        }
      })
    }
    
    return indicators
  }

  /**
   * Helper methods for trend analysis
   */
  private getPreviousTagFrequency(tag: string): number {
    // In production, this would query historical data
    return Math.random() * 10
  }

  private getSentimentChange(): number {
    // In production, this would compare with previous period
    return Math.random() * 0.2 - 0.1
  }

  private getSentimentChangeType(): 'increase' | 'decrease' | 'stable' {
    const change = this.getSentimentChange()
    if (change > 0.05) return 'increase'
    if (change < -0.05) return 'decrease'
    return 'stable'
  }

  private getEngagementChange(): number {
    // In production, this would compare with previous period
    return Math.random() * 20 - 10
  }

  private getEngagementChangeType(): 'increase' | 'decrease' | 'stable' {
    const change = this.getEngagementChange()
    if (change > 5) return 'increase'
    if (change < -5) return 'decrease'
    return 'stable'
  }

  private determineTrend(sentimentChange: string, engagementChange: string): 'rising' | 'falling' | 'stable' | 'volatile' {
    if (sentimentChange === 'increase' && engagementChange === 'increase') return 'rising'
    if (sentimentChange === 'decrease' && engagementChange === 'decrease') return 'falling'
    if (sentimentChange === 'stable' && engagementChange === 'stable') return 'stable'
    return 'volatile'
  }

  private determineTrendFromInsights(insights: SynthesizedInsight[]): 'rising' | 'falling' | 'stable' | 'volatile' {
    const increaseCount = insights.filter(i => i.data.changeType === 'increase').length
    const decreaseCount = insights.filter(i => i.data.changeType === 'decrease').length
    
    if (increaseCount > decreaseCount) return 'rising'
    if (decreaseCount > increaseCount) return 'falling'
    return 'stable'
  }

  /**
   * Cache results for performance
   */
  private async cacheResults(
    newsItems: NewsItem[], 
    insights: SynthesizedInsight[], 
    indicators: LeadingIndicator[]
  ): Promise<void> {
    const cacheKey = 'news_synthesis'
    const cacheData = {
      newsItems,
      insights,
      indicators,
      timestamp: new Date()
    }
    
    this.cache.set(cacheKey, cacheData)
    
    // Also store in database for persistence
    try {
      await supabase.from('synthesized_news_cache').upsert({
        id: cacheKey,
        data: cacheData,
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      errorHandler.log('warn', 'Failed to cache synthesis results', {
        category: ErrorCategory.DATABASE,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  /**
   * Get cached results
   */
  async getCachedResults(): Promise<{
    newsItems: NewsItem[]
    insights: SynthesizedInsight[]
    indicators: LeadingIndicator[]
  } | null> {
    const cacheKey = 'news_synthesis'
    const cached = this.cache.get(cacheKey)
    
    if (cached) {
      const age = Date.now() - cached.timestamp.getTime()
      if (age < 30 * 60 * 1000) { // 30 minutes
        return cached
      }
    }
    
    return null
  }

  /**
   * Start real-time updates
   */
  async startRealTimeUpdates(): Promise<void> {
    // Subscribe to new posts
    const postsSubscription = supabase
      .channel('new_posts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload: any) => {
          await this.handleNewPost(payload.new)
        }
      )
      .subscribe()

    // Subscribe to new comments
    const commentsSubscription = supabase
      .channel('new_comments')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        async (payload: any) => {
          await this.handleNewComment(payload.new)
        }
      )
      .subscribe()

    this.realTimeSubscriptions.push(postsSubscription, commentsSubscription)
  }

  /**
   * Stop real-time updates
   */
  async stopRealTimeUpdates(): Promise<void> {
    this.realTimeSubscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
    this.realTimeSubscriptions = []
  }

  /**
   * Handle new post in real-time
   */
  private async handleNewPost(post: any): Promise<void> {
    // Trigger re-synthesis if significant
    const engagement = post.engagement_metrics || { likes: 0, comments: 0, shares: 0, views: 0 }
    const engagementScore = this.calculateEngagementScore(engagement)
    
    if (engagementScore > this.config.minEngagement * 2) {
      // High engagement post - trigger re-synthesis
      setTimeout(() => this.synthesizeNewsFeed(), 5000) // Delay to allow for more engagement
    }
  }

  /**
   * Handle new comment in real-time
   */
  private async handleNewComment(comment: any): Promise<void> {
    // Comments can indicate trending topics
    setTimeout(() => this.synthesizeNewsFeed(), 10000) // Less frequent updates for comments
  }
}

// Export singleton instance
export const intelligentNewsSynthesis = new IntelligentNewsSynthesis()
