/**
 * LinkedIn Data Processor
 * Processes and analyzes LinkedIn feed data for DefConect platform
 */

import { LinkedInProfile, LinkedInConnection } from '../connectors/linkedin/linkedin-connector'

export interface LinkedInPost {
  id: string
  author: string
  content: string
  timestamp: Date
  type: 'post' | 'comment' | 'repost' | 'reaction'
  engagement: {
    reactions: number
    comments: number
    shares: number
    impressions: number
  }
  topics: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export interface LinkedInNotification {
  id: string
  type: 'profile_view' | 'comment' | 'mention' | 'follow' | 'engagement' | 'search'
  fromUser: string
  content: string
  timestamp: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface ContentAnalysis {
  cybersecurityMentions: number
  aiMentions: number
  businessOpportunities: number
  networkStrengthIndicators: number
  riskAlerts: RiskAlert[]
  engagementOpportunities: EngagementSuggestion[]
}

export interface RiskAlert {
  type: 'security' | 'compliance' | 'reputation' | 'opportunity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  sourcePost: string
  recommendedAction: string
}

export interface EngagementSuggestion {
  type: 'comment' | 'share' | 'connect' | 'message'
  target: string
  reason: string
  confidence: number
  suggestedContent?: string
}

export class LinkedInDataProcessor {
  private keywordPatterns = {
    cybersecurity: [
      'cybersecurity', 'cyber attack', 'breach', 'hack', 'ransomware', 'malware',
      'phishing', 'zero trust', 'encryption', 'vulnerability', 'exploit', 'threat',
      'CMMC', 'NIST', 'GDPR', 'HIPAA', 'PCI DSS'
    ],
    ai: [
      'artificial intelligence', 'AI', 'machine learning', 'claude', 'gpt', 'llm',
      'neural network', 'deep learning', 'automation', 'agentic', 'prompt engineering'
    ],
    business: [
      'investment', 'funding', 'partnership', 'acquisition', 'merger', 'startup',
      'venture capital', 'business development', 'deal flow', 'market opportunity'
    ],
    networking: [
      'connection', 'network', 'collaboration', 'partnership', 'mutual', 'introduce',
      'referral', 'relationship', 'alliance', 'ecosystem'
    ]
  }

  async processLinkedInFeed(rawFeedData: string): Promise<ContentAnalysis> {
    console.log('Processing LinkedIn feed data...')

    const posts = this.extractPosts(rawFeedData)
    const notifications = this.extractNotifications(rawFeedData)

    const analysis: ContentAnalysis = {
      cybersecurityMentions: 0,
      aiMentions: 0,
      businessOpportunities: 0,
      networkStrengthIndicators: 0,
      riskAlerts: [],
      engagementOpportunities: []
    }

    // Analyze posts
    for (const post of posts) {
      this.analyzePost(post, analysis)
    }

    // Analyze notifications
    for (const notification of notifications) {
      this.analyzeNotification(notification, analysis)
    }

    // Generate risk alerts
    analysis.riskAlerts = this.generateRiskAlerts(posts, analysis)

    // Generate engagement suggestions
    analysis.engagementOpportunities = this.generateEngagementSuggestions(notifications, analysis)

    return analysis
  }

  private extractPosts(rawData: string): LinkedInPost[] {
    const posts: LinkedInPost[] = []

    // Extract post patterns from the raw feed
    const postPatterns = [
      // Match author and content patterns
      /([A-Za-z\s]+)\s+(?:posted|reposted|commented):\s*([^.!?]+[.!?])/g,
      // Match engagement metrics
      /(\d+)\s+reactions?\s+(\d+)\s+comments?/g
    ]

    // Process the raw data to extract structured posts
    const lines = rawData.split('\n').filter(line => line.trim())

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Look for post indicators
      if (line.includes('posted:') || line.includes('commented on') || line.includes('reposted')) {
        const post = this.parsePostLine(line, lines[i + 1] || '')
        if (post) {
          posts.push(post)
        }
      }
    }

    return posts
  }

  private extractNotifications(rawData: string): LinkedInNotification[] {
    const notifications: LinkedInNotification[] = []

    // Extract notification patterns
    const notificationPatterns = [
      /([A-Za-z\s]+)\s+viewed your profile/g,
      /([A-Za-z\s]+)\s+commented on/g,
      /([A-Za-z\s]+)\s+mentioned you/g,
      /DefConect gained (\d+) followers/g,
      /DefConect appeared in (\d+) searches/g
    ]

    const lines = rawData.split('\n').filter(line => line.trim())

    for (const line of lines) {
      for (const pattern of notificationPatterns) {
        const match = line.match(pattern)
        if (match) {
          const notification = this.parseNotificationLine(line)
          if (notification) {
            notifications.push(notification)
          }
          break
        }
      }
    }

    return notifications
  }

  private parsePostLine(line: string, nextLine?: string): LinkedInPost | null {
    try {
      // Extract author
      const authorMatch = line.match(/^([A-Za-z\s]+(?:\s*[^\w\s]+\s*)?)\s+(?:posted|reposted|commented)/)
      if (!authorMatch) return null

      const author = authorMatch[1].trim()

      // Extract content (everything after the colon)
      const contentMatch = line.match(/(?:posted|reposted|commented):\s*(.+)$/)
      const content = contentMatch ? contentMatch[1].trim() : ''

      // Determine post type
      let type: LinkedInPost['type'] = 'post'
      if (line.includes('commented')) type = 'comment'
      if (line.includes('reposted')) type = 'repost'

      // Extract engagement from next line if available
      let engagement = { reactions: 0, comments: 0, shares: 0, impressions: 0 }
      if (nextLine) {
        const engagementMatch = nextLine.match(/(\d+)\s+reactions?\s+(\d+)\s+comments?/)
        if (engagementMatch) {
          engagement.reactions = parseInt(engagementMatch[1])
          engagement.comments = parseInt(engagementMatch[2])
        }
      }

      // Analyze content for topics and sentiment
      const topics = this.extractTopics(content)
      const sentiment = this.analyzeSentiment(content)
      const urgency = this.assessUrgency(content, topics)

      return {
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        author,
        content,
        timestamp: new Date(), // Would parse actual timestamp
        type,
        engagement,
        topics,
        sentiment,
        urgency
      }
    } catch (error) {
      console.warn('Failed to parse post line:', line, error)
      return null
    }
  }

  private parseNotificationLine(line: string): LinkedInNotification | null {
    try {
      let type: LinkedInNotification['type'] = 'engagement'
      let fromUser = ''
      let content = line
      let priority: LinkedInNotification['priority'] = 'low'

      if (line.includes('viewed your profile')) {
        type = 'profile_view'
        const match = line.match(/([A-Za-z\s]+)\s+viewed your profile/)
        fromUser = match ? match[1] : 'Unknown'
        priority = 'medium'
      } else if (line.includes('commented on')) {
        type = 'comment'
        const match = line.match(/([A-Za-z\s]+)\s+commented on/)
        fromUser = match ? match[1] : 'Unknown'
        priority = 'high'
      } else if (line.includes('mentioned you')) {
        type = 'mention'
        const match = line.match(/([A-Za-z\s]+)\s+mentioned you/)
        fromUser = match ? match[1] : 'Unknown'
        priority = 'high'
      } else if (line.includes('gained') && line.includes('followers')) {
        type = 'follow'
        fromUser = 'LinkedIn'
        priority = 'medium'
      } else if (line.includes('appeared in') && line.includes('searches')) {
        type = 'search'
        fromUser = 'LinkedIn'
        priority = 'medium'
      }

      return {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        fromUser,
        content,
        timestamp: new Date(),
        isRead: false,
        priority
      }
    } catch (error) {
      console.warn('Failed to parse notification line:', line, error)
      return null
    }
  }

  private extractTopics(content: string): string[] {
    const topics: string[] = []
    const lowerContent = content.toLowerCase()

    // Check each category
    Object.entries(this.keywordPatterns).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword =>
        lowerContent.includes(keyword.toLowerCase())
      )
      if (matches.length > 0) {
        topics.push(category)
      }
    })

    return [...new Set(topics)] // Remove duplicates
  }

  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['great', 'excellent', 'amazing', 'fantastic', 'wonderful', 'brilliant', 'excited', 'opportunity', 'success']
    const negativeWords = ['breach', 'attack', 'vulnerable', 'risk', 'threat', 'failure', 'problem', 'concern', 'dangerous', 'negligence']

    const lowerContent = content.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private assessUrgency(content: string, topics: string[]): 'low' | 'medium' | 'high' | 'critical' {
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // High urgency keywords
    const highUrgencyWords = ['breach', 'attack', 'critical', 'urgent', 'emergency', 'immediate', 'asap']
    const criticalWords = ['ransomware', 'nation-state', 'espionage', 'compromise']

    const lowerContent = content.toLowerCase()

    if (criticalWords.some(word => lowerContent.includes(word))) {
      urgency = 'critical'
    } else if (highUrgencyWords.some(word => lowerContent.includes(word))) {
      urgency = 'high'
    } else if (topics.includes('cybersecurity') || topics.includes('business')) {
      urgency = 'medium'
    }

    return urgency
  }

  private analyzePost(post: LinkedInPost, analysis: ContentAnalysis): void {
    // Count mentions by category
    if (post.topics.includes('cybersecurity')) {
      analysis.cybersecurityMentions++
    }
    if (post.topics.includes('ai')) {
      analysis.aiMentions++
    }
    if (post.topics.includes('business')) {
      analysis.businessOpportunities++
    }
    if (post.topics.includes('networking')) {
      analysis.networkStrengthIndicators++
    }
  }

  private analyzeNotification(notification: LinkedInNotification, analysis: ContentAnalysis): void {
    // Profile views indicate network interest
    if (notification.type === 'profile_view') {
      analysis.networkStrengthIndicators++
    }

    // Comments and mentions show engagement
    if (notification.type === 'comment' || notification.type === 'mention') {
      analysis.networkStrengthIndicators += 2
    }

    // Followers gained show growth
    if (notification.type === 'follow' && notification.content.includes('gained')) {
      analysis.businessOpportunities++
    }
  }

  private generateRiskAlerts(posts: LinkedInPost[], analysis: ContentAnalysis): RiskAlert[] {
    const alerts: RiskAlert[] = []

    // Cybersecurity risk alerts
    if (analysis.cybersecurityMentions > 3) {
      alerts.push({
        type: 'security',
        severity: 'high',
        description: `High volume of cybersecurity discussions (${analysis.cybersecurityMentions} mentions)`,
        sourcePost: 'multiple',
        recommendedAction: 'Review network security posture and engage with cybersecurity community'
      })
    }

    // Business opportunity alerts
    if (analysis.businessOpportunities > 2) {
      alerts.push({
        type: 'opportunity',
        severity: 'medium',
        description: `Multiple business opportunities detected (${analysis.businessOpportunities} signals)`,
        sourcePost: 'multiple',
        recommendedAction: 'Prepare networking outreach and partnership proposals'
      })
    }

    // Specific post-based alerts
    posts.forEach(post => {
      if (post.urgency === 'critical') {
        alerts.push({
          type: 'security',
          severity: 'critical',
          description: `Critical security alert in post by ${post.author}`,
          sourcePost: post.id,
          recommendedAction: 'Immediate review and potential security response required'
        })
      }
    })

    return alerts
  }

  private generateEngagementSuggestions(
    notifications: LinkedInNotification[],
    analysis: ContentAnalysis
  ): EngagementSuggestion[] {
    const suggestions: EngagementSuggestion[] = []

    // Suggest engagement based on notifications
    notifications.forEach(notification => {
      if (notification.type === 'comment') {
        suggestions.push({
          type: 'comment',
          target: notification.fromUser,
          reason: 'Respond to comment to build relationship',
          confidence: 0.8,
          suggestedContent: 'Thank you for the insightful comment! I agree that...'
        })
      }

      if (notification.type === 'profile_view') {
        suggestions.push({
          type: 'connect',
          target: notification.fromUser,
          reason: 'Profile view indicates interest - send connection request',
          confidence: 0.6,
          suggestedContent: 'I noticed you viewed my profile. Would love to connect and discuss...'
        })
      }
    })

    // AI-related engagement opportunities
    if (analysis.aiMentions > 2) {
      suggestions.push({
        type: 'share',
        target: 'network',
        reason: 'High AI discussion volume - share expertise',
        confidence: 0.7,
        suggestedContent: 'Great to see the AI community growing! Here are my thoughts on...'
      })
    }

    return suggestions
  }

  // Public API methods
  async processFeedData(feedData: string): Promise<{
    analysis: ContentAnalysis
    insights: string[]
    recommendations: string[]
  }> {
    const analysis = await this.processLinkedInFeed(feedData)

    const insights = this.generateInsights(analysis)
    const recommendations = this.generateRecommendations(analysis)

    return {
      analysis,
      insights,
      recommendations
    }
  }

  private generateInsights(analysis: ContentAnalysis): string[] {
    const insights = []

    if (analysis.cybersecurityMentions > 0) {
      insights.push(`Detected ${analysis.cybersecurityMentions} cybersecurity-related discussions`)
    }

    if (analysis.aiMentions > 0) {
      insights.push(`AI technology mentioned ${analysis.aiMentions} times - growing interest in the field`)
    }

    if (analysis.businessOpportunities > 0) {
      insights.push(`${analysis.businessOpportunities} potential business opportunities identified`)
    }

    if (analysis.networkStrengthIndicators > 0) {
      insights.push(`Network strength indicators: ${analysis.networkStrengthIndicators} positive signals`)
    }

    if (analysis.riskAlerts.length > 0) {
      insights.push(`${analysis.riskAlerts.length} risk alerts generated for review`)
    }

    return insights
  }

  private generateRecommendations(analysis: ContentAnalysis): string[] {
    const recommendations = []

    if (analysis.cybersecurityMentions > 2) {
      recommendations.push('Engage with cybersecurity community - position as thought leader')
    }

    if (analysis.aiMentions > 2) {
      recommendations.push('Share AI expertise and participate in technical discussions')
    }

    if (analysis.businessOpportunities > 1) {
      recommendations.push('Pursue identified business opportunities proactively')
    }

    if (analysis.engagementOpportunities.length > 0) {
      recommendations.push(`${analysis.engagementOpportunities.length} engagement opportunities available`)
    }

    return recommendations
  }
}

// Export singleton instance
export const linkedInDataProcessor = new LinkedInDataProcessor()
