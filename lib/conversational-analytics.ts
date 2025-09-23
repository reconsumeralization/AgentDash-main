import { AgentOrchestrationSystem, Agent, AgentTask } from './agent-orchestration'
import { ConversationalWorkflowEngine, WorkflowExecution } from './conversational-workflows'

export interface ConversationMetrics {
  totalConversations: number
  totalMessages: number
  averageMessagesPerConversation: number
  averageResponseTime: number
  userSatisfactionScore: number
  agentUtilizationRate: number
  workflowSuccessRate: number
  mostUsedCommands: CommandUsage[]
  mostActiveAgents: AgentActivity[]
  conversationTrends: ConversationTrend[]
  performanceInsights: PerformanceInsight[]
}

export interface CommandUsage {
  commandId: string
  commandName: string
  usageCount: number
  successRate: number
  averageExecutionTime: number
  userSatisfaction: number
  lastUsed: Date
}

export interface AgentActivity {
  agentId: string
  agentName: string
  taskCount: number
  averageTaskTime: number
  successRate: number
  specialization: string
  lastActive: Date
}

export interface ConversationTrend {
  date: Date
  conversationCount: number
  messageCount: number
  averageResponseTime: number
  userSatisfaction: number
  workflowExecutions: number
}

export interface PerformanceInsight {
  id: string
  type: 'optimization' | 'bottleneck' | 'success' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  recommendations: string[]
  metrics: Record<string, number>
  createdAt: Date
}

export interface UserBehaviorPattern {
  userId: string
  preferredCommands: string[]
  averageSessionLength: number
  peakUsageHours: number[]
  interactionStyle: 'direct' | 'exploratory' | 'collaborative'
  satisfactionTrend: number[]
  learningProgress: LearningProgress[]
}

export interface LearningProgress {
  skill: string
  proficiency: number
  practiceCount: number
  improvementRate: number
  lastPracticed: Date
}

export interface ConversationQuality {
  conversationId: string
  clarity: number
  relevance: number
  helpfulness: number
  efficiency: number
  overallScore: number
  feedback: string[]
  improvementAreas: string[]
}

export interface AgentPerformance {
  agentId: string
  responseAccuracy: number
  taskCompletionRate: number
  userSatisfaction: number
  efficiency: number
  knowledgeUtilization: number
  collaborationScore: number
  improvementSuggestions: string[]
}

export class ConversationalAnalytics {
  private agentOrchestration: AgentOrchestrationSystem
  private workflowEngine: ConversationalWorkflowEngine
  private metrics: ConversationMetrics
  private userPatterns: Map<string, UserBehaviorPattern> = new Map()
  private conversationQuality: Map<string, ConversationQuality> = new Map()
  private agentPerformance: Map<string, AgentPerformance> = new Map()

  constructor(
    agentOrchestration: AgentOrchestrationSystem,
    workflowEngine: ConversationalWorkflowEngine
  ) {
    this.agentOrchestration = agentOrchestration
    this.workflowEngine = workflowEngine
    this.metrics = this.initializeMetrics()
  }

  private initializeMetrics(): ConversationMetrics {
    return {
      totalConversations: 0,
      totalMessages: 0,
      averageMessagesPerConversation: 0,
      averageResponseTime: 0,
      userSatisfactionScore: 0,
      agentUtilizationRate: 0,
      workflowSuccessRate: 0,
      mostUsedCommands: [],
      mostActiveAgents: [],
      conversationTrends: [],
      performanceInsights: []
    }
  }

  public async trackConversation(
    conversationId: string,
    userId: string,
    message: string,
    response: string,
    responseTime: number,
    agentId?: string,
    workflowId?: string
  ): Promise<void> {
    // Update basic metrics
    this.metrics.totalMessages++
    this.metrics.averageResponseTime = this.calculateMovingAverage(
      this.metrics.averageResponseTime,
      responseTime,
      this.metrics.totalMessages
    )

    // Track user behavior
    await this.updateUserBehaviorPattern(userId, message, responseTime)

    // Track agent performance
    if (agentId) {
      await this.updateAgentPerformance(agentId, response, responseTime)
    }

    // Track workflow performance
    if (workflowId) {
      await this.updateWorkflowPerformance(workflowId, responseTime)
    }

    // Update conversation quality
    await this.updateConversationQuality(conversationId, message, response, responseTime)

    // Generate insights
    await this.generatePerformanceInsights()
  }

  private async updateUserBehaviorPattern(
    userId: string,
    message: string,
    responseTime: number
  ): Promise<void> {
    let pattern = this.userPatterns.get(userId)
    
    if (!pattern) {
      pattern = {
        userId,
        preferredCommands: [],
        averageSessionLength: 0,
        peakUsageHours: [],
        interactionStyle: 'direct',
        satisfactionTrend: [],
        learningProgress: []
      }
      this.userPatterns.set(userId, pattern)
    }

    // Update interaction style based on message patterns
    pattern.interactionStyle = this.analyzeInteractionStyle(message, pattern.interactionStyle)

    // Update peak usage hours
    const currentHour = new Date().getHours()
    if (!pattern.peakUsageHours.includes(currentHour)) {
      pattern.peakUsageHours.push(currentHour)
    }

    // Update satisfaction trend (simplified - would need actual feedback)
    const satisfaction = this.calculateSatisfactionScore(responseTime, message.length)
    pattern.satisfactionTrend.push(satisfaction)
    if (pattern.satisfactionTrend.length > 30) {
      pattern.satisfactionTrend.shift() // Keep only last 30 interactions
    }
  }

  private async updateAgentPerformance(
    agentId: string,
    response: string,
    responseTime: number
  ): Promise<void> {
    let performance = this.agentPerformance.get(agentId)
    
    if (!performance) {
      performance = {
        agentId,
        responseAccuracy: 0,
        taskCompletionRate: 0,
        userSatisfaction: 0,
        efficiency: 0,
        knowledgeUtilization: 0,
        collaborationScore: 0,
        improvementSuggestions: []
      }
      this.agentPerformance.set(agentId, performance)
    }

    // Update efficiency based on response time and quality
    const efficiency = this.calculateEfficiency(response, responseTime)
    performance.efficiency = this.calculateMovingAverage(
      performance.efficiency,
      efficiency,
      this.getAgentTaskCount(agentId)
    )

    // Update knowledge utilization
    const knowledgeUtilization = this.calculateKnowledgeUtilization(response)
    performance.knowledgeUtilization = this.calculateMovingAverage(
      performance.knowledgeUtilization,
      knowledgeUtilization,
      this.getAgentTaskCount(agentId)
    )
  }

  private async updateWorkflowPerformance(
    workflowId: string,
    responseTime: number
  ): Promise<void> {
    // Update workflow success rate
    const executions = this.workflowEngine.getActiveExecutions()
    const successfulExecutions = executions.filter(exec => exec.status === 'completed')
    this.metrics.workflowSuccessRate = successfulExecutions.length / executions.length || 0
  }

  private async updateConversationQuality(
    conversationId: string,
    message: string,
    response: string,
    responseTime: number
  ): Promise<void> {
    let quality = this.conversationQuality.get(conversationId)
    
    if (!quality) {
      quality = {
        conversationId,
        clarity: 0,
        relevance: 0,
        helpfulness: 0,
        efficiency: 0,
        overallScore: 0,
        feedback: [],
        improvementAreas: []
      }
      this.conversationQuality.set(conversationId, quality)
    }

    // Calculate quality metrics
    quality.clarity = this.calculateClarity(response)
    quality.relevance = this.calculateRelevance(message, response)
    quality.helpfulness = this.calculateHelpfulness(response)
    quality.efficiency = this.calculateEfficiency(response, responseTime)
    quality.overallScore = (quality.clarity + quality.relevance + quality.helpfulness + quality.efficiency) / 4

    // Identify improvement areas
    quality.improvementAreas = this.identifyImprovementAreas(quality)
  }

  private analyzeInteractionStyle(message: string, currentStyle: string): string {
    const messageLength = message.length
    const questionCount = (message.match(/\?/g) || []).length
    const commandCount = (message.match(/^(create|setup|analyze|upload|show)/i) || []).length

    if (commandCount > 0) {
      return 'direct'
    } else if (questionCount > 2) {
      return 'exploratory'
    } else if (messageLength > 100) {
      return 'collaborative'
    }

    return currentStyle
  }

  private calculateSatisfactionScore(responseTime: number, messageLength: number): number {
    // Simplified satisfaction calculation
    const timeScore = Math.max(0, 1 - (responseTime / 10000)) // 10 seconds max
    const lengthScore = Math.min(1, messageLength / 50) // 50 chars optimal
    return (timeScore + lengthScore) / 2
  }

  private calculateEfficiency(response: string, responseTime: number): number {
    const responseLength = response.length
    const wordsPerSecond = responseLength / (responseTime / 1000)
    return Math.min(1, wordsPerSecond / 10) // 10 words per second is optimal
  }

  private calculateKnowledgeUtilization(response: string): number {
    // Analyze response for knowledge base references, citations, etc.
    const knowledgeIndicators = [
      'according to',
      'based on',
      'research shows',
      'studies indicate',
      'data suggests',
      'analysis reveals'
    ]
    
    const indicatorCount = knowledgeIndicators.reduce((count, indicator) => {
      return count + (response.toLowerCase().includes(indicator) ? 1 : 0)
    }, 0)

    return Math.min(1, indicatorCount / 3) // 3 indicators is optimal
  }

  private calculateClarity(response: string): number {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const averageSentenceLength = sentences.reduce((sum, sentence) => sum + sentence.length, 0) / sentences.length
    
    // Optimal sentence length is 15-20 words
    const optimalLength = 17
    const clarity = 1 - Math.abs(averageSentenceLength - optimalLength) / optimalLength
    return Math.max(0, Math.min(1, clarity))
  }

  private calculateRelevance(message: string, response: string): number {
    // Simple relevance calculation based on keyword overlap
    const messageWords = new Set(message.toLowerCase().split(/\s+/))
    const responseWords = new Set(response.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...messageWords].filter(word => responseWords.has(word)))
    const union = new Set([...messageWords, ...responseWords])
    
    return intersection.size / union.size
  }

  private calculateHelpfulness(response: string): number {
    // Analyze response for helpful indicators
    const helpfulIndicators = [
      'here\'s how',
      'you can',
      'try this',
      'consider',
      'suggest',
      'recommend',
      'solution',
      'help',
      'guide',
      'steps'
    ]
    
    const indicatorCount = helpfulIndicators.reduce((count, indicator) => {
      return count + (response.toLowerCase().includes(indicator) ? 1 : 0)
    }, 0)

    return Math.min(1, indicatorCount / 5) // 5 indicators is optimal
  }

  private identifyImprovementAreas(quality: ConversationQuality): string[] {
    const areas: string[] = []
    
    if (quality.clarity < 0.7) areas.push('clarity')
    if (quality.relevance < 0.7) areas.push('relevance')
    if (quality.helpfulness < 0.7) areas.push('helpfulness')
    if (quality.efficiency < 0.7) areas.push('efficiency')
    
    return areas
  }

  private calculateMovingAverage(current: number, newValue: number, count: number): number {
    if (count === 0) return newValue
    return (current * (count - 1) + newValue) / count
  }

  private getAgentTaskCount(agentId: string): number {
    // This would typically query the agent orchestration system
    return 1 // Simplified for now
  }

  private async generatePerformanceInsights(): Promise<void> {
    const insights: PerformanceInsight[] = []

    // Analyze response times
    if (this.metrics.averageResponseTime > 5000) {
      insights.push({
        id: `insight_${Date.now()}`,
        type: 'bottleneck',
        title: 'High Response Times',
        description: 'Average response time is above optimal threshold',
        impact: 'high',
        recommendations: [
          'Optimize agent response algorithms',
          'Implement response caching',
          'Scale agent infrastructure'
        ],
        metrics: { averageResponseTime: this.metrics.averageResponseTime },
        createdAt: new Date()
      })
    }

    // Analyze workflow success rate
    if (this.metrics.workflowSuccessRate < 0.8) {
      insights.push({
        id: `insight_${Date.now() + 1}`,
        type: 'warning',
        title: 'Low Workflow Success Rate',
        description: 'Workflow execution success rate is below target',
        impact: 'medium',
        recommendations: [
          'Review failed workflow steps',
          'Improve error handling',
          'Add retry mechanisms'
        ],
        metrics: { workflowSuccessRate: this.metrics.workflowSuccessRate },
        createdAt: new Date()
      })
    }

    // Analyze user satisfaction
    if (this.metrics.userSatisfactionScore < 0.7) {
      insights.push({
        id: `insight_${Date.now() + 2}`,
        type: 'optimization',
        title: 'User Satisfaction Below Target',
        description: 'User satisfaction scores indicate room for improvement',
        impact: 'high',
        recommendations: [
          'Gather more user feedback',
          'Improve response quality',
          'Enhance user experience'
        ],
        metrics: { userSatisfactionScore: this.metrics.userSatisfactionScore },
        createdAt: new Date()
      })
    }

    // Update insights
    this.metrics.performanceInsights = insights.slice(-10) // Keep last 10 insights
  }

  public async generateReport(timeRange: 'day' | 'week' | 'month' | 'year'): Promise<ConversationAnalyticsReport> {
    const endDate = new Date()
    const startDate = this.getStartDate(endDate, timeRange)

    // Filter data by time range
    const filteredTrends = this.metrics.conversationTrends.filter(
      trend => trend.date >= startDate && trend.date <= endDate
    )

    // Calculate trends
    const conversationGrowth = this.calculateGrowthRate(
      filteredTrends.map(t => t.conversationCount)
    )
    const satisfactionTrend = this.calculateGrowthRate(
      filteredTrends.map(t => t.userSatisfaction)
    )

    // Get top performers
    const topCommands = this.metrics.mostUsedCommands
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
    
    const topAgents = this.metrics.mostActiveAgents
      .sort((a, b) => b.taskCount - a.taskCount)
      .slice(0, 5)

    return {
      timeRange,
      startDate,
      endDate,
      summary: {
        totalConversations: this.metrics.totalConversations,
        totalMessages: this.metrics.totalMessages,
        averageResponseTime: this.metrics.averageResponseTime,
        userSatisfactionScore: this.metrics.userSatisfactionScore,
        workflowSuccessRate: this.metrics.workflowSuccessRate
      },
      trends: {
        conversationGrowth,
        satisfactionTrend,
        responseTimeTrend: this.calculateGrowthRate(
          filteredTrends.map(t => t.averageResponseTime)
        )
      },
      topPerformers: {
        commands: topCommands,
        agents: topAgents
      },
      insights: this.metrics.performanceInsights,
      recommendations: this.generateRecommendations()
    }
  }

  private getStartDate(endDate: Date, timeRange: string): Date {
    const startDate = new Date(endDate)
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }
    
    return startDate
  }

  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0
    
    const first = values[0]
    const last = values[values.length - 1]
    
    if (first === 0) return last > 0 ? 100 : 0
    
    return ((last - first) / first) * 100
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    if (this.metrics.averageResponseTime > 3000) {
      recommendations.push('Consider implementing response caching to reduce average response time')
    }
    
    if (this.metrics.workflowSuccessRate < 0.9) {
      recommendations.push('Review and improve workflow error handling mechanisms')
    }
    
    if (this.metrics.userSatisfactionScore < 0.8) {
      recommendations.push('Implement user feedback collection to improve satisfaction scores')
    }
    
    if (this.metrics.agentUtilizationRate < 0.7) {
      recommendations.push('Optimize agent task distribution to improve utilization rates')
    }
    
    return recommendations
  }

  // Public getters
  public getMetrics(): ConversationMetrics {
    return { ...this.metrics }
  }

  public getUserPattern(userId: string): UserBehaviorPattern | undefined {
    return this.userPatterns.get(userId)
  }

  public getConversationQuality(conversationId: string): ConversationQuality | undefined {
    return this.conversationQuality.get(conversationId)
  }

  public getAgentPerformance(agentId: string): AgentPerformance | undefined {
    return this.agentPerformance.get(agentId)
  }

  public getAllUserPatterns(): UserBehaviorPattern[] {
    return Array.from(this.userPatterns.values())
  }

  public getAllAgentPerformance(): AgentPerformance[] {
    return Array.from(this.agentPerformance.values())
  }
}

// Supporting interfaces
interface ConversationAnalyticsReport {
  timeRange: string
  startDate: Date
  endDate: Date
  summary: {
    totalConversations: number
    totalMessages: number
    averageResponseTime: number
    userSatisfactionScore: number
    workflowSuccessRate: number
  }
  trends: {
    conversationGrowth: number
    satisfactionTrend: number
    responseTimeTrend: number
  }
  topPerformers: {
    commands: CommandUsage[]
    agents: AgentActivity[]
  }
  insights: PerformanceInsight[]
  recommendations: string[]
}

export { ConversationalAnalytics }
