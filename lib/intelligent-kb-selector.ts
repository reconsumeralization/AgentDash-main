// Intelligent Knowledge Base Selection System

import {
  KnowledgeBase,
  Agent,
  IntelligentKBSelection,
  AttachmentCondition,
  ATTACHMENT_TYPES
} from './knowledge-base-types'

export interface KBSelectionContext {
  userQuery: string
  userRole: string
  projectContext?: string
  conversationHistory?: string[]
  currentTask?: string
  userPreferences?: {
    preferredKBTypes: string[]
    excludedKBs: string[]
    maxKBs: number
  }
  sessionContext?: {
    currentAgent?: string
    previousSelections?: string[]
    sessionDuration: number
  }
}

export interface KBRelevanceScore {
  knowledgeBaseId: string
  score: number
  reasoning: string
  matchedKeywords: string[]
  confidence: number
  suggestedAttachmentType: string
  conditions?: AttachmentCondition[]
}

export class IntelligentKBSelector {
  private knowledgeBases: KnowledgeBase[]
  private agents: Agent[]

  constructor(knowledgeBases: KnowledgeBase[], agents: Agent[]) {
    this.knowledgeBases = knowledgeBases
    this.agents = agents
  }

  /**
   * Select the most relevant knowledge bases for a given context
   */
  async selectKnowledgeBases(
    agentId: string,
    context: KBSelectionContext
  ): Promise<IntelligentKBSelection> {
    const agent = this.agents.find(a => a.id === agentId)
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`)
    }

    // Get candidate knowledge bases
    const candidateKBs = this.getCandidateKnowledgeBases(agent, context)
    
    // Score each knowledge base
    const scoredKBs = await this.scoreKnowledgeBases(candidateKBs, context, agent)
    
    // Sort by relevance score
    const sortedKBs = scoredKBs.sort((a, b) => b.score - a.score)
    
    // Apply selection strategy
    const selectedKBs = this.applySelectionStrategy(sortedKBs, agent, context)
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(selectedKBs, context)
    
    return {
      agentId,
      context,
      selectedKnowledgeBases: selectedKBs.map(kb => ({
        knowledgeBaseId: kb.knowledgeBaseId,
        relevanceScore: kb.score,
        reasoning: kb.reasoning,
        suggestedAttachmentType: kb.suggestedAttachmentType
      })),
      confidence,
      generatedAt: new Date()
    }
  }

  /**
   * Get candidate knowledge bases based on agent and context
   */
  private getCandidateKnowledgeBases(
    agent: Agent,
    context: KBSelectionContext
  ): KnowledgeBase[] {
    let candidates = this.knowledgeBases.filter(kb => kb.isActive)

    // Filter by user preferences
    if (context.userPreferences) {
      if (context.userPreferences.excludedKBs.length > 0) {
        candidates = candidates.filter(kb => 
          !context.userPreferences!.excludedKBs.includes(kb.id)
        )
      }
      
      if (context.userPreferences.preferredKBTypes.length > 0) {
        candidates = candidates.filter(kb => 
          context.userPreferences!.preferredKBTypes.includes(kb.type)
        )
      }
    }

    // Filter by agent's existing knowledge bases if manual strategy
    if (agent.settings.kbSelectionStrategy === 'manual') {
      const agentKBIds = agent.knowledgeBases.map(kb => kb.knowledgeBaseId)
      candidates = candidates.filter(kb => agentKBIds.includes(kb.id))
    }

    return candidates
  }

  /**
   * Score knowledge bases based on relevance to context
   */
  private async scoreKnowledgeBases(
    candidates: KnowledgeBase[],
    context: KBSelectionContext,
    agent: Agent
  ): Promise<KBRelevanceScore[]> {
    const scores: KBRelevanceScore[] = []

    for (const kb of candidates) {
      const score = await this.calculateRelevanceScore(kb, context, agent)
      scores.push(score)
    }

    return scores
  }

  /**
   * Calculate relevance score for a knowledge base
   */
  private async calculateRelevanceScore(
    kb: KnowledgeBase,
    context: KBSelectionContext,
    agent: Agent
  ): Promise<KBRelevanceScore> {
    let score = 0
    const matchedKeywords: string[] = []
    const reasoning: string[] = []

    // 1. Query-based scoring (40% weight)
    const queryScore = this.scoreByQuery(kb, context.userQuery, matchedKeywords)
    score += queryScore * 0.4
    if (queryScore > 0) {
      reasoning.push(`High relevance to query: "${context.userQuery}"`)
    }

    // 2. Agent capability matching (25% weight)
    const capabilityScore = this.scoreByAgentCapabilities(kb, agent)
    score += capabilityScore * 0.25
    if (capabilityScore > 0.7) {
      reasoning.push(`Strong match with agent capabilities: ${agent.capabilities.join(', ')}`)
    }

    // 3. Context-based scoring (20% weight)
    const contextScore = this.scoreByContext(kb, context)
    score += contextScore * 0.2
    if (contextScore > 0.5) {
      reasoning.push(`Relevant to current context: ${context.projectContext || context.currentTask}`)
    }

    // 4. Historical usage (10% weight)
    const usageScore = this.scoreByHistoricalUsage(kb, agent)
    score += usageScore * 0.1
    if (usageScore > 0.6) {
      reasoning.push('Frequently used by this agent')
    }

    // 5. Knowledge base quality (5% weight)
    const qualityScore = this.scoreByQuality(kb)
    score += qualityScore * 0.05
    if (qualityScore > 0.8) {
      reasoning.push('High-quality knowledge base with good metadata')
    }

    // Determine attachment type based on score and context
    const suggestedAttachmentType = this.determineAttachmentType(score, context, agent)
    
    // Calculate confidence based on score distribution
    const confidence = Math.min(score, 1.0)

    return {
      knowledgeBaseId: kb.id,
      score,
      reasoning: reasoning.join('; '),
      matchedKeywords,
      confidence,
      suggestedAttachmentType,
      conditions: this.generateAttachmentConditions(kb, context, agent)
    }
  }

  /**
   * Score knowledge base based on query relevance
   */
  private scoreByQuery(kb: KnowledgeBase, query: string, matchedKeywords: string[]): number {
    if (!query) return 0

    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/)
    let score = 0

    // Check name and description
    const nameScore = this.calculateTextSimilarity(kb.name.toLowerCase(), queryLower)
    const descScore = this.calculateTextSimilarity(kb.description.toLowerCase(), queryLower)
    score += (nameScore + descScore) * 0.3

    // Check tags
    const tagMatches = kb.tags.filter(tag => 
      queryWords.some(word => tag.toLowerCase().includes(word))
    )
    score += tagMatches.length * 0.2
    matchedKeywords.push(...tagMatches)

    // Check category
    if (queryWords.some(word => kb.category.toLowerCase().includes(word))) {
      score += 0.2
      matchedKeywords.push(kb.category)
    }

    return Math.min(score, 1.0)
  }

  /**
   * Score based on agent capabilities
   */
  private scoreByAgentCapabilities(kb: KnowledgeBase, agent: Agent): number {
    let score = 0

    // Check if KB type matches agent type
    const typeMatches = {
      'assistant': ['general', 'domain-specific'],
      'specialist': ['domain-specific', 'project-specific'],
      'analyst': ['domain-specific', 'project-specific'],
      'researcher': ['general', 'domain-specific'],
      'writer': ['domain-specific', 'project-specific'],
      'developer': ['domain-specific', 'project-specific'],
      'custom': ['general', 'domain-specific', 'project-specific', 'personal']
    }

    const compatibleTypes = typeMatches[agent.type] || ['general']
    if (compatibleTypes.includes(kb.type)) {
      score += 0.4
    }

    // Check capability overlap
    const kbKeywords = [...kb.tags, kb.category, kb.type]
    const capabilityMatches = agent.capabilities.filter(cap =>
      kbKeywords.some(keyword => 
        keyword.toLowerCase().includes(cap.toLowerCase()) ||
        cap.toLowerCase().includes(keyword.toLowerCase())
      )
    )
    score += (capabilityMatches.length / agent.capabilities.length) * 0.6

    return Math.min(score, 1.0)
  }

  /**
   * Score based on context relevance
   */
  private scoreByContext(kb: KnowledgeBase, context: KBSelectionContext): number {
    let score = 0

    // Project context matching
    if (context.projectContext) {
      const projectLower = context.projectContext.toLowerCase()
      if (kb.name.toLowerCase().includes(projectLower) ||
          kb.description.toLowerCase().includes(projectLower) ||
          kb.tags.some(tag => tag.toLowerCase().includes(projectLower))) {
        score += 0.5
      }
    }

    // Task context matching
    if (context.currentTask) {
      const taskLower = context.currentTask.toLowerCase()
      if (kb.description.toLowerCase().includes(taskLower) ||
          kb.tags.some(tag => tag.toLowerCase().includes(taskLower))) {
        score += 0.3
      }
    }

    // User role matching
    if (context.userRole) {
      const roleLower = context.userRole.toLowerCase()
      if (kb.category.toLowerCase().includes(roleLower) ||
          kb.tags.some(tag => tag.toLowerCase().includes(roleLower))) {
        score += 0.2
      }
    }

    return Math.min(score, 1.0)
  }

  /**
   * Score based on historical usage
   */
  private scoreByHistoricalUsage(kb: KnowledgeBase, agent: Agent): number {
    // Check if KB is already attached to agent
    const existingAttachment = agent.knowledgeBases.find(akb => akb.knowledgeBaseId === kb.id)
    if (existingAttachment && existingAttachment.isActive) {
      return 0.8 // High score for already attached KBs
    }

    // Check access count (popular KBs get higher scores)
    const accessScore = Math.min(kb.metadata.accessCount / 1000, 1.0) * 0.3

    // Check if KB was recently accessed
    const recentAccessScore = kb.metadata.lastAccessed ? 
      Math.max(0, 1 - (Date.now() - kb.metadata.lastAccessed.getTime()) / (30 * 24 * 60 * 60 * 1000)) * 0.7 : 0

    return accessScore + recentAccessScore
  }

  /**
   * Score based on knowledge base quality
   */
  private scoreByQuality(kb: KnowledgeBase): number {
    let score = 0

    // File count (more files = higher quality)
    score += Math.min(kb.metadata.totalFiles / 100, 1.0) * 0.3

    // Metadata completeness
    const metadataScore = [
      kb.description.length > 50,
      kb.tags.length > 2,
      kb.category.length > 0,
      kb.metadata.version !== '1.0.0'
    ].filter(Boolean).length / 4
    score += metadataScore * 0.4

    // Activity level
    const activityScore = Math.min(kb.metadata.accessCount / 500, 1.0) * 0.3

    return score + activityScore
  }

  /**
   * Determine the best attachment type based on score and context
   */
  private determineAttachmentType(
    score: number,
    context: KBSelectionContext,
    agent: Agent
  ): string {
    if (score >= 0.8) {
      return ATTACHMENT_TYPES.FULL_ACCESS
    } else if (score >= 0.6) {
      return ATTACHMENT_TYPES.CONTEXTUAL
    } else if (score >= 0.4) {
      return ATTACHMENT_TYPES.READ_ONLY
    } else {
      return ATTACHMENT_TYPES.CONDITIONAL
    }
  }

  /**
   * Generate attachment conditions for conditional access
   */
  private generateAttachmentConditions(
    kb: KnowledgeBase,
    context: KBSelectionContext,
    agent: Agent
  ): AttachmentCondition[] {
    const conditions: AttachmentCondition[] = []

    // User role condition
    if (context.userRole) {
      conditions.push({
        type: 'user-role',
        operator: 'equals',
        value: context.userRole,
        description: `Only accessible to users with role: ${context.userRole}`
      })
    }

    // Project context condition
    if (context.projectContext) {
      conditions.push({
        type: 'project-context',
        operator: 'contains',
        value: context.projectContext,
        description: `Only accessible in project context: ${context.projectContext}`
      })
    }

    // Agent capability condition
    if (agent.capabilities.length > 0) {
      conditions.push({
        type: 'agent-capability',
        operator: 'contains',
        value: agent.capabilities[0], // Primary capability
        description: `Only accessible to agents with capability: ${agent.capabilities[0]}`
      })
    }

    return conditions
  }

  /**
   * Apply selection strategy to choose final knowledge bases
   */
  private applySelectionStrategy(
    scoredKBs: KBRelevanceScore[],
    agent: Agent,
    context: KBSelectionContext
  ): KBRelevanceScore[] {
    const maxKBs = context.userPreferences?.maxKBs || agent.settings.maxKBItems
    const minScore = 0.3 // Minimum relevance score

    // Filter by minimum score
    const qualifiedKBs = scoredKBs.filter(kb => kb.score >= minScore)

    // Apply strategy-specific selection
    switch (agent.settings.kbSelectionStrategy) {
      case 'intelligent':
        return qualifiedKBs.slice(0, maxKBs)
      
      case 'manual':
        // For manual strategy, only return already attached KBs
        const agentKBIds = agent.knowledgeBases.map(kb => kb.knowledgeBaseId)
        return qualifiedKBs.filter(kb => agentKBIds.includes(kb.knowledgeBaseId))
      
      case 'hybrid':
        // Mix of intelligent and manual
        const manualKBs = qualifiedKBs.filter(kb => 
          agent.knowledgeBases.some(akb => akb.knowledgeBaseId === kb.knowledgeBaseId)
        )
        const intelligentKBs = qualifiedKBs.filter(kb => 
          !agent.knowledgeBases.some(akb => akb.knowledgeBaseId === kb.knowledgeBaseId)
        )
        
        const manualCount = Math.min(manualKBs.length, Math.ceil(maxKBs / 2))
        const intelligentCount = Math.min(intelligentKBs.length, maxKBs - manualCount)
        
        return [
          ...manualKBs.slice(0, manualCount),
          ...intelligentKBs.slice(0, intelligentCount)
        ]
      
      default:
        return qualifiedKBs.slice(0, maxKBs)
    }
  }

  /**
   * Calculate overall confidence in the selection
   */
  private calculateOverallConfidence(
    selectedKBs: KBRelevanceScore[],
    context: KBSelectionContext
  ): number {
    if (selectedKBs.length === 0) return 0

    const avgScore = selectedKBs.reduce((sum, kb) => sum + kb.score, 0) / selectedKBs.length
    const scoreVariance = selectedKBs.reduce((sum, kb) => sum + Math.pow(kb.score - avgScore, 2), 0) / selectedKBs.length
    const scoreStdDev = Math.sqrt(scoreVariance)

    // Higher confidence for higher average scores and lower variance
    const scoreConfidence = avgScore * (1 - Math.min(scoreStdDev, 0.5))
    
    // Context completeness bonus
    const contextBonus = [
      context.userQuery,
      context.userRole,
      context.projectContext,
      context.currentTask
    ].filter(Boolean).length / 4

    return Math.min(scoreConfidence + contextBonus * 0.2, 1.0)
  }

  /**
   * Calculate text similarity using simple word overlap
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/))
    const words2 = new Set(text2.split(/\s+/))
    
    const intersection = new Set([...words1].filter(word => words2.has(word)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }

  /**
   * Get explanation for why certain knowledge bases were selected
   */
  getSelectionExplanation(selection: IntelligentKBSelection): string {
    const explanations = selection.selectedKnowledgeBases.map(kb => 
      `${kb.knowledgeBaseId}: ${kb.reasoning} (Score: ${(kb.relevanceScore * 100).toFixed(1)}%)`
    )

    return `Selected ${selection.selectedKnowledgeBases.length} knowledge bases with ${(selection.confidence * 100).toFixed(1)}% confidence:\n${explanations.join('\n')}`
  }

  /**
   * Suggest knowledge bases for a new agent
   */
  async suggestKnowledgeBasesForNewAgent(
    agentCapabilities: string[],
    agentType: string,
    context: KBSelectionContext
  ): Promise<KBRelevanceScore[]> {
    const mockAgent: Agent = {
      id: 'temp-agent',
      name: 'Temporary Agent',
      description: 'Temporary agent for suggestions',
      type: agentType as any,
      capabilities: agentCapabilities,
      personality: {
        tone: 'professional',
        expertise: agentCapabilities,
        communication_style: 'detailed'
      },
      knowledgeBases: [],
      settings: {
        autoAttachKB: true,
        maxKBItems: 5,
        kbSelectionStrategy: 'intelligent',
        contextWindow: 4000,
        responseLength: 'medium'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      usage: {
        totalInteractions: 0,
        averageRating: 0,
        totalRating: 0
      }
    }

    const candidates = this.getCandidateKnowledgeBases(mockAgent, context)
    const scoredKBs = await this.scoreKnowledgeBases(candidates, context, mockAgent)
    
    return scoredKBs.sort((a, b) => b.score - a.score).slice(0, 5)
  }
}

// Export utility functions
export const KBSelectionUtils = {
  /**
   * Create a context from user input
   */
  createContext(
    userQuery: string,
    userRole: string,
    options?: Partial<KBSelectionContext>
  ): KBSelectionContext {
    return {
      userQuery,
      userRole,
      ...options
    }
  },

  /**
   * Format selection results for display
   */
  formatSelectionResults(selection: IntelligentKBSelection): string {
    const { selectedKnowledgeBases, confidence } = selection
    
    if (selectedKnowledgeBases.length === 0) {
      return 'No relevant knowledge bases found for the current context.'
    }

    const results = selectedKnowledgeBases.map((kb, index) => 
      `${index + 1}. ${kb.knowledgeBaseId} (${(kb.relevanceScore * 100).toFixed(1)}% relevance)\n   ${kb.reasoning}`
    ).join('\n\n')

    return `Found ${selectedKnowledgeBases.length} relevant knowledge bases (${(confidence * 100).toFixed(1)}% confidence):\n\n${results}`
  }
}
