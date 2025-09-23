import { AgentOrchestrationSystem, Agent } from './agent-orchestration'
import { ConversationalWorkflowEngine } from './conversational-workflows'

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  type: 'general' | 'specialized' | 'project' | 'personal'
  ownerId: string
  isPublic: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
  documentCount: number
  totalSize: number
  lastAccessed: Date
  accessLevel: 'read' | 'write' | 'admin'
  attachedAgents: string[] // Agent IDs
  metadata: KnowledgeBaseMetadata
}

export interface KnowledgeBaseMetadata {
  language: string
  domain: string
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  lastIndexed: Date
  searchable: boolean
  version: string
  schema?: Record<string, any>
}

export interface KnowledgeDocument {
  id: string
  knowledgeBaseId: string
  title: string
  content: string
  type: 'text' | 'markdown' | 'pdf' | 'html' | 'json' | 'csv' | 'image' | 'video' | 'audio'
  mimeType: string
  size: number
  url?: string
  metadata: DocumentMetadata
  embeddings?: number[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
  accessedAt: Date
  accessCount: number
  version: number
  isActive: boolean
}

export interface DocumentMetadata {
  author?: string
  source?: string
  language: string
  summary?: string
  keywords: string[]
  category?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  expiresAt?: Date
  customFields: Record<string, any>
}

export interface KnowledgeSearchResult {
  document: KnowledgeDocument
  relevanceScore: number
  matchedSnippets: string[]
  context: string
  agentRecommendations: AgentRecommendation[]
}

export interface AgentRecommendation {
  agentId: string
  agentName: string
  specialization: string
  confidence: number
  reasoning: string
  suggestedAction: string
}

export interface KnowledgeQuery {
  id: string
  query: string
  userId: string
  context: Record<string, any>
  filters: QueryFilters
  timestamp: Date
  results: KnowledgeSearchResult[]
  selectedAgent?: string
  executionTime: number
  satisfaction?: number
}

export interface QueryFilters {
  knowledgeBaseIds?: string[]
  documentTypes?: string[]
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  priority?: string[]
  agents?: string[]
  language?: string
  domain?: string
}

export interface AgentKnowledgeMapping {
  agentId: string
  knowledgeBaseIds: string[]
  accessLevel: 'read' | 'write' | 'admin'
  specialization: string
  expertise: number // 0-1 score
  lastUpdated: Date
  usageStats: {
    queriesHandled: number
    successRate: number
    averageResponseTime: number
    userSatisfaction: number
  }
}

export class AgentKnowledgeIntegration {
  private agentOrchestration: AgentOrchestrationSystem
  private workflowEngine: ConversationalWorkflowEngine
  private knowledgeBases: Map<string, KnowledgeBase> = new Map()
  private documents: Map<string, KnowledgeDocument> = new Map()
  private agentMappings: Map<string, AgentKnowledgeMapping> = new Map()
  private searchHistory: Map<string, KnowledgeQuery> = new Map()

  constructor(
    agentOrchestration: AgentOrchestrationSystem,
    workflowEngine: ConversationalWorkflowEngine
  ) {
    this.agentOrchestration = agentOrchestration
    this.workflowEngine = workflowEngine
    this.initializeDefaultKnowledgeBases()
    this.initializeAgentMappings()
  }

  private initializeDefaultKnowledgeBases(): void {
    const defaultKnowledgeBases: KnowledgeBase[] = [
      {
        id: 'general-knowledge',
        name: 'General Knowledge Base',
        description: 'Comprehensive knowledge base for general queries and information',
        type: 'general',
        ownerId: 'system',
        isPublic: true,
        tags: ['general', 'information', 'reference'],
        createdAt: new Date(),
        updatedAt: new Date(),
        documentCount: 0,
        totalSize: 0,
        lastAccessed: new Date(),
        accessLevel: 'read',
        attachedAgents: ['main-assistant', 'knowledge-agent'],
        metadata: {
          language: 'en',
          domain: 'general',
          complexity: 'intermediate',
          lastIndexed: new Date(),
          searchable: true,
          version: '1.0.0'
        }
      },
      {
        id: 'project-management',
        name: 'Project Management Knowledge',
        description: 'Knowledge base for project management methodologies and best practices',
        type: 'specialized',
        ownerId: 'system',
        isPublic: true,
        tags: ['project-management', 'methodology', 'best-practices'],
        createdAt: new Date(),
        updatedAt: new Date(),
        documentCount: 0,
        totalSize: 0,
        lastAccessed: new Date(),
        accessLevel: 'read',
        attachedAgents: ['project-agent', 'workflow-agent'],
        metadata: {
          language: 'en',
          domain: 'project-management',
          complexity: 'advanced',
          lastIndexed: new Date(),
          searchable: true,
          version: '1.0.0'
        }
      },
      {
        id: 'network-analysis',
        name: 'Network Analysis Knowledge',
        description: 'Knowledge base for network analysis, social media insights, and relationship mapping',
        type: 'specialized',
        ownerId: 'system',
        isPublic: true,
        tags: ['network-analysis', 'social-media', 'relationships'],
        createdAt: new Date(),
        updatedAt: new Date(),
        documentCount: 0,
        totalSize: 0,
        lastAccessed: new Date(),
        accessLevel: 'read',
        attachedAgents: ['network-agent', 'analytics-agent'],
        metadata: {
          language: 'en',
          domain: 'network-analysis',
          complexity: 'expert',
          lastIndexed: new Date(),
          searchable: true,
          version: '1.0.0'
        }
      },
      {
        id: 'user-personas',
        name: 'User Personas & Demographics',
        description: 'Knowledge base for user personas, psychographic profiles, and demographic insights',
        type: 'specialized',
        ownerId: 'system',
        isPublic: true,
        tags: ['personas', 'demographics', 'psychographics'],
        createdAt: new Date(),
        updatedAt: new Date(),
        documentCount: 0,
        totalSize: 0,
        lastAccessed: new Date(),
        accessLevel: 'read',
        attachedAgents: ['persona-agent', 'demographics-agent'],
        metadata: {
          language: 'en',
          domain: 'user-research',
          complexity: 'advanced',
          lastIndexed: new Date(),
          searchable: true,
          version: '1.0.0'
        }
      }
    ]

    defaultKnowledgeBases.forEach(kb => {
      this.knowledgeBases.set(kb.id, kb)
    })
  }

  private initializeAgentMappings(): void {
    const mappings: AgentKnowledgeMapping[] = [
      {
        agentId: 'main-assistant',
        knowledgeBaseIds: ['general-knowledge', 'project-management'],
        accessLevel: 'read',
        specialization: 'general-assistance',
        expertise: 0.9,
        lastUpdated: new Date(),
        usageStats: {
          queriesHandled: 0,
          successRate: 0.0,
          averageResponseTime: 0,
          userSatisfaction: 0.0
        }
      },
      {
        agentId: 'knowledge-agent',
        knowledgeBaseIds: ['general-knowledge', 'user-personas'],
        accessLevel: 'admin',
        specialization: 'knowledge-management',
        expertise: 0.95,
        lastUpdated: new Date(),
        usageStats: {
          queriesHandled: 0,
          successRate: 0.0,
          averageResponseTime: 0,
          userSatisfaction: 0.0
        }
      },
      {
        agentId: 'project-agent',
        knowledgeBaseIds: ['project-management'],
        accessLevel: 'write',
        specialization: 'project-management',
        expertise: 0.92,
        lastUpdated: new Date(),
        usageStats: {
          queriesHandled: 0,
          successRate: 0.0,
          averageResponseTime: 0,
          userSatisfaction: 0.0
        }
      },
      {
        agentId: 'network-agent',
        knowledgeBaseIds: ['network-analysis'],
        accessLevel: 'write',
        specialization: 'network-analysis',
        expertise: 0.88,
        lastUpdated: new Date(),
        usageStats: {
          queriesHandled: 0,
          successRate: 0.0,
          averageResponseTime: 0,
          userSatisfaction: 0.0
        }
      },
      {
        agentId: 'persona-agent',
        knowledgeBaseIds: ['user-personas'],
        accessLevel: 'write',
        specialization: 'user-personas',
        expertise: 0.85,
        lastUpdated: new Date(),
        usageStats: {
          queriesHandled: 0,
          successRate: 0.0,
          averageResponseTime: 0,
          userSatisfaction: 0.0
        }
      }
    ]

    mappings.forEach(mapping => {
      this.agentMappings.set(mapping.agentId, mapping)
    })
  }

  public async processKnowledgeQuery(
    query: string,
    userId: string,
    context: Record<string, any> = {},
    filters: QueryFilters = {}
  ): Promise<KnowledgeQuery> {
    const startTime = Date.now()
    const queryId = `query_${Date.now()}`

    // Determine relevant knowledge bases
    const relevantKnowledgeBases = this.findRelevantKnowledgeBases(query, filters)
    
    // Find best agents for the query
    const recommendedAgents = this.recommendAgentsForQuery(query, relevantKnowledgeBases, context)
    
    // Perform knowledge search
    const searchResults = await this.searchKnowledgeBases(query, relevantKnowledgeBases, filters)
    
    // Enhance results with agent recommendations
    const enhancedResults = this.enhanceResultsWithAgentRecommendations(searchResults, recommendedAgents)
    
    const executionTime = Date.now() - startTime

    const knowledgeQuery: KnowledgeQuery = {
      id: queryId,
      query,
      userId,
      context,
      filters,
      timestamp: new Date(),
      results: enhancedResults,
      selectedAgent: recommendedAgents[0]?.agentId,
      executionTime
    }

    this.searchHistory.set(queryId, knowledgeQuery)
    
    // Update agent usage statistics
    if (knowledgeQuery.selectedAgent) {
      this.updateAgentUsageStats(knowledgeQuery.selectedAgent, executionTime, true)
    }

    return knowledgeQuery
  }

  private findRelevantKnowledgeBases(query: string, filters: QueryFilters): KnowledgeBase[] {
    const queryLower = query.toLowerCase()
    const relevantKBs: KnowledgeBase[] = []

    for (const kb of this.knowledgeBases.values()) {
      // Check if explicitly requested
      if (filters.knowledgeBaseIds?.includes(kb.id)) {
        relevantKBs.push(kb)
        continue
      }

      // Check tags and metadata
      const isRelevant = 
        kb.tags.some(tag => queryLower.includes(tag.toLowerCase())) ||
        kb.metadata.domain.toLowerCase().includes(queryLower) ||
        kb.name.toLowerCase().includes(queryLower) ||
        kb.description.toLowerCase().includes(queryLower)

      if (isRelevant) {
        relevantKBs.push(kb)
      }
    }

    return relevantKBs
  }

  private recommendAgentsForQuery(
    query: string,
    knowledgeBases: KnowledgeBase[],
    context: Record<string, any>
  ): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = []
    const queryLower = query.toLowerCase()

    for (const mapping of this.agentMappings.values()) {
      // Check if agent has access to relevant knowledge bases
      const hasRelevantAccess = knowledgeBases.some(kb => 
        mapping.knowledgeBaseIds.includes(kb.id)
      )

      if (!hasRelevantAccess) continue

      // Calculate relevance score
      let relevanceScore = 0

      // Check specialization match
      if (queryLower.includes(mapping.specialization.replace('-', ' '))) {
        relevanceScore += 0.4
      }

      // Check knowledge base overlap
      const kbOverlap = knowledgeBases.filter(kb => 
        mapping.knowledgeBaseIds.includes(kb.id)
      ).length / knowledgeBases.length
      relevanceScore += kbOverlap * 0.3

      // Factor in expertise and usage stats
      relevanceScore += mapping.expertise * 0.2
      relevanceScore += mapping.usageStats.successRate * 0.1

      if (relevanceScore > 0.3) {
        recommendations.push({
          agentId: mapping.agentId,
          agentName: this.getAgentName(mapping.agentId),
          specialization: mapping.specialization,
          confidence: relevanceScore,
          reasoning: this.generateAgentReasoning(mapping, query, knowledgeBases),
          suggestedAction: this.generateSuggestedAction(mapping, query)
        })
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence)
  }

  private async searchKnowledgeBases(
    query: string,
    knowledgeBases: KnowledgeBase[],
    filters: QueryFilters
  ): Promise<KnowledgeSearchResult[]> {
    const results: KnowledgeSearchResult[] = []

    for (const kb of knowledgeBases) {
      // Simulate document search within knowledge base
      const mockDocuments = this.generateMockDocuments(kb.id, query)
      
      for (const doc of mockDocuments) {
        const relevanceScore = this.calculateRelevanceScore(query, doc)
        
        if (relevanceScore > 0.5) {
          results.push({
            document: doc,
            relevanceScore,
            matchedSnippets: this.extractMatchedSnippets(query, doc.content),
            context: this.generateContext(doc, kb),
            agentRecommendations: [] // Will be filled later
          })
        }
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  private enhanceResultsWithAgentRecommendations(
    results: KnowledgeSearchResult[],
    agentRecommendations: AgentRecommendation[]
  ): KnowledgeSearchResult[] {
    return results.map(result => ({
      ...result,
      agentRecommendations: agentRecommendations.filter(rec => 
        this.agentHasAccessToDocument(rec.agentId, result.document.knowledgeBaseId)
      )
    }))
  }

  private generateMockDocuments(knowledgeBaseId: string, query: string): KnowledgeDocument[] {
    const mockDocs: KnowledgeDocument[] = []

    switch (knowledgeBaseId) {
      case 'general-knowledge':
        mockDocs.push({
          id: `doc_${Date.now()}_1`,
          knowledgeBaseId,
          title: 'General Information Guide',
          content: 'This is a comprehensive guide covering general topics and information that users commonly ask about.',
          type: 'text',
          mimeType: 'text/plain',
          size: 1024,
          metadata: {
            language: 'en',
            keywords: ['general', 'information', 'guide'],
            priority: 'medium',
            customFields: {}
          },
          tags: ['general', 'guide'],
          createdAt: new Date(),
          updatedAt: new Date(),
          accessedAt: new Date(),
          accessCount: 0,
          version: 1,
          isActive: true
        })
        break

      case 'project-management':
        mockDocs.push({
          id: `doc_${Date.now()}_2`,
          knowledgeBaseId,
          title: 'Project Management Best Practices',
          content: 'Essential project management methodologies including Agile, Scrum, and traditional waterfall approaches.',
          type: 'markdown',
          mimeType: 'text/markdown',
          size: 2048,
          metadata: {
            language: 'en',
            keywords: ['project-management', 'agile', 'scrum', 'methodology'],
            priority: 'high',
            customFields: {}
          },
          tags: ['project-management', 'methodology'],
          createdAt: new Date(),
          updatedAt: new Date(),
          accessedAt: new Date(),
          accessCount: 0,
          version: 1,
          isActive: true
        })
        break

      case 'network-analysis':
        mockDocs.push({
          id: `doc_${Date.now()}_3`,
          knowledgeBaseId,
          title: 'Network Analysis Techniques',
          content: 'Advanced techniques for analyzing social networks, identifying influencers, and mapping relationships.',
          type: 'text',
          mimeType: 'text/plain',
          size: 3072,
          metadata: {
            language: 'en',
            keywords: ['network-analysis', 'social-networks', 'influencers'],
            priority: 'high',
            customFields: {}
          },
          tags: ['network-analysis', 'social-networks'],
          createdAt: new Date(),
          updatedAt: new Date(),
          accessedAt: new Date(),
          accessCount: 0,
          version: 1,
          isActive: true
        })
        break

      case 'user-personas':
        mockDocs.push({
          id: `doc_${Date.now()}_4`,
          knowledgeBaseId,
          title: 'User Persona Development Guide',
          content: 'Comprehensive guide to creating and managing user personas, including psychographic profiling and demographic analysis.',
          type: 'text',
          mimeType: 'text/plain',
          size: 4096,
          metadata: {
            language: 'en',
            keywords: ['personas', 'demographics', 'psychographics'],
            priority: 'medium',
            customFields: {}
          },
          tags: ['personas', 'user-research'],
          createdAt: new Date(),
          updatedAt: new Date(),
          accessedAt: new Date(),
          accessCount: 0,
          version: 1,
          isActive: true
        })
        break
    }

    return mockDocs
  }

  private calculateRelevanceScore(query: string, document: KnowledgeDocument): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const contentWords = document.content.toLowerCase().split(/\s+/)
    const titleWords = document.title.toLowerCase().split(/\s+/)
    
    let score = 0
    
    // Title matches are weighted higher
    for (const word of queryWords) {
      if (titleWords.includes(word)) {
        score += 0.3
      }
      if (contentWords.includes(word)) {
        score += 0.1
      }
    }
    
    // Check metadata keywords
    for (const keyword of document.metadata.keywords) {
      if (queryWords.some(word => keyword.toLowerCase().includes(word))) {
        score += 0.2
      }
    }
    
    // Check tags
    for (const tag of document.tags) {
      if (queryWords.some(word => tag.toLowerCase().includes(word))) {
        score += 0.15
      }
    }
    
    return Math.min(1, score)
  }

  private extractMatchedSnippets(query: string, content: string): string[] {
    const queryWords = query.toLowerCase().split(/\s+/)
    const sentences = content.split(/[.!?]+/)
    const snippets: string[] = []
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase()
      if (queryWords.some(word => sentenceLower.includes(word))) {
        snippets.push(sentence.trim())
      }
    }
    
    return snippets.slice(0, 3) // Return top 3 snippets
  }

  private generateContext(document: KnowledgeDocument, knowledgeBase: KnowledgeBase): string {
    return `From ${knowledgeBase.name}: ${document.metadata.summary || document.content.substring(0, 100)}...`
  }

  private agentHasAccessToDocument(agentId: string, knowledgeBaseId: string): boolean {
    const mapping = this.agentMappings.get(agentId)
    return mapping?.knowledgeBaseIds.includes(knowledgeBaseId) || false
  }

  private getAgentName(agentId: string): string {
    const nameMap: Record<string, string> = {
      'main-assistant': 'Main Assistant',
      'knowledge-agent': 'Knowledge Agent',
      'project-agent': 'Project Agent',
      'network-agent': 'Network Agent',
      'persona-agent': 'Persona Agent'
    }
    return nameMap[agentId] || agentId
  }

  private generateAgentReasoning(
    mapping: AgentKnowledgeMapping,
    query: string,
    knowledgeBases: KnowledgeBase[]
  ): string {
    const kbNames = knowledgeBases
      .filter(kb => mapping.knowledgeBaseIds.includes(kb.id))
      .map(kb => kb.name)
      .join(', ')
    
    return `Specialized in ${mapping.specialization} with access to ${kbNames}. Expertise level: ${Math.round(mapping.expertise * 100)}%`
  }

  private generateSuggestedAction(mapping: AgentKnowledgeMapping, query: string): string {
    const actions: Record<string, string> = {
      'general-assistance': 'Provide comprehensive assistance and guidance',
      'knowledge-management': 'Manage and organize knowledge resources',
      'project-management': 'Help with project planning and execution',
      'network-analysis': 'Analyze networks and relationships',
      'user-personas': 'Create and manage user personas'
    }
    
    return actions[mapping.specialization] || 'Provide specialized assistance'
  }

  private updateAgentUsageStats(agentId: string, executionTime: number, success: boolean): void {
    const mapping = this.agentMappings.get(agentId)
    if (!mapping) return

    mapping.usageStats.queriesHandled++
    mapping.usageStats.averageResponseTime = 
      (mapping.usageStats.averageResponseTime * (mapping.usageStats.queriesHandled - 1) + executionTime) / 
      mapping.usageStats.queriesHandled
    
    if (success) {
      const currentSuccessRate = mapping.usageStats.successRate
      const newSuccessRate = (currentSuccessRate * (mapping.usageStats.queriesHandled - 1) + 1) / 
        mapping.usageStats.queriesHandled
      mapping.usageStats.successRate = newSuccessRate
    } else {
      const currentSuccessRate = mapping.usageStats.successRate
      const newSuccessRate = (currentSuccessRate * (mapping.usageStats.queriesHandled - 1)) / 
        mapping.usageStats.queriesHandled
      mapping.usageStats.successRate = newSuccessRate
    }

    mapping.lastUpdated = new Date()
  }

  // Public methods
  public getKnowledgeBases(): KnowledgeBase[] {
    return Array.from(this.knowledgeBases.values())
  }

  public getKnowledgeBaseById(id: string): KnowledgeBase | undefined {
    return this.knowledgeBases.get(id)
  }

  public getAgentMappings(): AgentKnowledgeMapping[] {
    return Array.from(this.agentMappings.values())
  }

  public getAgentMapping(agentId: string): AgentKnowledgeMapping | undefined {
    return this.agentMappings.get(agentId)
  }

  public getSearchHistory(): KnowledgeQuery[] {
    return Array.from(this.searchHistory.values())
  }

  public getQueryById(id: string): KnowledgeQuery | undefined {
    return this.searchHistory.get(id)
  }

  public createKnowledgeBase(knowledgeBase: Omit<KnowledgeBase, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessed' | 'documentCount' | 'totalSize'>): KnowledgeBase {
    const newKB: KnowledgeBase = {
      ...knowledgeBase,
      id: `kb_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessed: new Date(),
      documentCount: 0,
      totalSize: 0
    }
    
    this.knowledgeBases.set(newKB.id, newKB)
    return newKB
  }

  public attachAgentToKnowledgeBase(agentId: string, knowledgeBaseId: string, accessLevel: 'read' | 'write' | 'admin'): void {
    const kb = this.knowledgeBases.get(knowledgeBaseId)
    if (!kb) return

    if (!kb.attachedAgents.includes(agentId)) {
      kb.attachedAgents.push(agentId)
    }

    // Update agent mapping
    let mapping = this.agentMappings.get(agentId)
    if (!mapping) {
      mapping = {
        agentId,
        knowledgeBaseIds: [],
        accessLevel,
        specialization: 'general',
        expertise: 0.5,
        lastUpdated: new Date(),
        usageStats: {
          queriesHandled: 0,
          successRate: 0.0,
          averageResponseTime: 0,
          userSatisfaction: 0.0
        }
      }
    }

    if (!mapping.knowledgeBaseIds.includes(knowledgeBaseId)) {
      mapping.knowledgeBaseIds.push(knowledgeBaseId)
    }
    mapping.accessLevel = accessLevel
    mapping.lastUpdated = new Date()

    this.agentMappings.set(agentId, mapping)
  }

  public detachAgentFromKnowledgeBase(agentId: string, knowledgeBaseId: string): void {
    const kb = this.knowledgeBases.get(knowledgeBaseId)
    if (kb) {
      kb.attachedAgents = kb.attachedAgents.filter(id => id !== agentId)
    }

    const mapping = this.agentMappings.get(agentId)
    if (mapping) {
      mapping.knowledgeBaseIds = mapping.knowledgeBaseIds.filter(id => id !== knowledgeBaseId)
      mapping.lastUpdated = new Date()
    }
  }
}

export { AgentKnowledgeIntegration }
