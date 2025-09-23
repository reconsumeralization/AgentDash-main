/**
 * Sentiment Analysis Module
 * Blends LinkedIn communications with FileFlex governance signals
 */

import { LinkedInMessage, LinkedInPost } from '../connectors/linkedin-connector'

export interface SentimentScore {
  polarity: number // -1 to 1
  magnitude: number // 0 to 1
  confidence: number // 0 to 1
  tone: 'positive' | 'neutral' | 'negative'
  keywords: string[]
}

export interface ConversationInsight {
  conversationId: string
  averageSentiment: SentimentScore
  trendingTopics: string[]
  recommendedResponses: string[]
  escalationRisk: 'low' | 'medium' | 'high'
}

export interface SentimentAnalysisConfig {
  positiveKeywords: string[]
  negativeKeywords: string[]
  zeroTrustTopics: string[]
}

export class SentimentAnalysisEngine {
  private config: SentimentAnalysisConfig

  constructor(config?: Partial<SentimentAnalysisConfig>) {
    this.config = {
      positiveKeywords: ['secure', 'success', 'trusted', 'compliant', 'scalable'],
      negativeKeywords: ['breach', 'incident', 'concern', 'delay', 'problem'],
      zeroTrustTopics: ['fileflex', 'zero trust', 'zt', 'nac', 'token'],
      ...config
    }
  }

  analyzeMessage(message: LinkedInMessage): SentimentScore {
    const content = message.content.toLowerCase()
    const positives = this.countKeywords(content, this.config.positiveKeywords)
    const negatives = this.countKeywords(content, this.config.negativeKeywords)
    const polarity = Math.max(-1, Math.min(1, positives - negatives))
    const magnitude = Math.min(1, (positives + negatives) / 5)
    const confidence = this.deriveConfidence(content, polarity)

    return {
      polarity,
      magnitude,
      confidence,
      tone: polarity > 0.2 ? 'positive' : polarity < -0.2 ? 'negative' : 'neutral',
      keywords: this.extractKeywords(content)
    }
  }

  analyzeConversation(messages: LinkedInMessage[]): ConversationInsight {
    const scores = messages.map(message => this.analyzeMessage(message))
    const aggregate = this.aggregateScores(scores)

    return {
      conversationId: messages[0]?.conversationId || 'unknown',
      averageSentiment: aggregate,
      trendingTopics: this.identifyTopics(messages),
      recommendedResponses: this.recommendResponses(aggregate),
      escalationRisk: this.calculateRisk(aggregate)
    }
  }

  analyzePosts(posts: LinkedInPost[]): SentimentScore {
    const scores = posts.map(post => this.analyzeText(post.content))
    return this.aggregateScores(scores)
  }

  private analyzeText(content: string): SentimentScore {
    const lower = content.toLowerCase()
    const positives = this.countKeywords(lower, this.config.positiveKeywords)
    const negatives = this.countKeywords(lower, this.config.negativeKeywords)
    const polarity = Math.max(-1, Math.min(1, positives - negatives))

    return {
      polarity,
      magnitude: Math.min(1, (positives + negatives) / 10),
      confidence: 0.5 + Math.abs(polarity) / 2,
      tone: polarity > 0.2 ? 'positive' : polarity < -0.2 ? 'negative' : 'neutral',
      keywords: this.extractKeywords(lower)
    }
  }

  private countKeywords(content: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => count + (content.includes(keyword) ? 1 : 0), 0)
  }

  private extractKeywords(content: string): string[] {
    const tokens = content.split(/\W+/).filter(Boolean)
    const important = tokens.filter(token => token.length > 4)
    const unique = Array.from(new Set(important))
    return unique.slice(0, 6)
  }

  private deriveConfidence(content: string, polarity: number): number {
    const hasZeroTrustTerm = this.config.zeroTrustTopics.some(topic => content.includes(topic))
    const base = 0.4 + Math.abs(polarity) * 0.4
    return hasZeroTrustTerm ? Math.min(1, base + 0.2) : base
  }

  private aggregateScores(scores: SentimentScore[]): SentimentScore {
    if (scores.length === 0) {
      return { polarity: 0, magnitude: 0, confidence: 0, tone: 'neutral', keywords: [] }
    }

    const polarity = scores.reduce((acc, score) => acc + score.polarity, 0) / scores.length
    const magnitude = scores.reduce((acc, score) => acc + score.magnitude, 0) / scores.length
    const confidence = scores.reduce((acc, score) => acc + score.confidence, 0) / scores.length

    return {
      polarity,
      magnitude,
      confidence,
      tone: polarity > 0.2 ? 'positive' : polarity < -0.2 ? 'negative' : 'neutral',
      keywords: Array.from(new Set(scores.flatMap(score => score.keywords))).slice(0, 10)
    }
  }

  private identifyTopics(messages: LinkedInMessage[]): string[] {
    const allKeywords = messages.flatMap(message =>
      this.extractKeywords(message.content.toLowerCase())
    )
    return Array.from(new Set(allKeywords)).slice(0, 10)
  }

  private recommendResponses(score: SentimentScore): string[] {
    if (score.tone === 'positive') {
      return ['Send gratitude message', 'Share FileFlex success story']
    }
    if (score.tone === 'negative') {
      return ['Offer security workshop', 'Escalate to customer success']
    }
    return ['Schedule discovery call', 'Share zero trust overview deck']
  }

  private calculateRisk(score: SentimentScore): 'low' | 'medium' | 'high' {
    if (score.tone === 'negative' && score.magnitude > 0.6) return 'high'
    if (score.tone === 'negative' && score.magnitude > 0.3) return 'medium'
    return 'low'
  }
}

export function execute(portionId: string): {
  portionId: string
  status: 'completed'
  insight: ConversationInsight
} {
  const engine = new SentimentAnalysisEngine()
  const messages: LinkedInMessage[] = [
    {
      id: 'msg-1',
      conversationId: 'conv-123',
      senderId: 'user-a',
      recipientId: 'user-b',
      content: 'We are impressed with the zero trust controls FileFlex provides for remote teams.',
      timestamp: new Date(),
      attachments: [],
      reactions: []
    },
    {
      id: 'msg-2',
      conversationId: 'conv-123',
      senderId: 'user-b',
      recipientId: 'user-a',
      content: 'Our only concern is ensuring activity logs feed into our SIEM for compliance.',
      timestamp: new Date(),
      attachments: [],
      reactions: []
    }
  ]

  const insight = engine.analyzeConversation(messages)

  return {
    portionId,
    status: 'completed',
    insight
  }
}
