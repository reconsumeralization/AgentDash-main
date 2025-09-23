import { PsychographicPreset, UserPersona, Project, KnowledgeBase } from './supabase'

export interface Agent {
  id: string
  name: string
  description: string
  expertise: string[]
  personality: PsychographicPreset
  capabilities: AgentCapability[]
  knowledgeBases: string[]
  learningRate: number
  collaborationStyle: 'directive' | 'collaborative' | 'supportive' | 'analytical'
  currentTask?: AgentTask
  status: 'available' | 'busy' | 'learning' | 'offline'
  performance: {
    tasksCompleted: number
    successRate: number
    userSatisfaction: number
    averageResponseTime: number
  }
}

export interface AgentCapability {
  id: string
  name: string
  description: string
  category: 'knowledge' | 'network' | 'project' | 'analytics' | 'automation' | 'communication'
  parameters: Record<string, any>
  confidence: number
  lastUsed?: Date
  successRate: number
}

export interface AgentTask {
  id: string
  type: string
  description: string
  parameters: Record<string, any>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  assignedAgent?: string
  createdAt: Date
  updatedAt: Date
  estimatedDuration?: number
  actualDuration?: number
  result?: any
  error?: string
}

export interface ConversationContext {
  userId: string
  currentDomain: string
  userPersona?: UserPersona
  activeProject?: Project
  recentActions: string[]
  conversationHistory: ConversationMessage[]
  userPreferences: Record<string, any>
  emotionalState: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'excited'
  urgency: 'low' | 'medium' | 'high'
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  intent?: string
  entities?: Record<string, any>
  sentiment?: 'positive' | 'negative' | 'neutral'
  confidence?: number
  agentId?: string
}

export interface AgentCollaboration {
  id: string
  primaryAgent: string
  collaboratingAgents: string[]
  task: AgentTask
  communication: CollaborationMessage[]
  status: 'planning' | 'executing' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
}

export interface CollaborationMessage {
  id: string
  fromAgent: string
  toAgent: string
  content: string
  timestamp: Date
  type: 'request' | 'response' | 'update' | 'question'
}

export class AgentOrchestrationSystem {
  private agents: Map<string, Agent> = new Map()
  private tasks: Map<string, AgentTask> = new Map()
  private collaborations: Map<string, AgentCollaboration> = new Map()
  private conversationContext: ConversationContext

  constructor(userId: string) {
    this.conversationContext = {
      userId,
      currentDomain: 'general',
      recentActions: [],
      conversationHistory: [],
      userPreferences: {},
      emotionalState: 'neutral',
      urgency: 'medium'
    }
    this.initializeDefaultAgents()
  }

  private initializeDefaultAgents(): void {
    // Knowledge Management Agent
    const knowledgeAgent: Agent = {
      id: 'knowledge-agent',
      name: 'Knowledge Manager',
      description: 'Specialized in knowledge base management, file organization, and information retrieval',
      expertise: ['knowledge_management', 'file_organization', 'search', 'content_analysis'],
      personality: {
        id: 'analytical-persona',
        name: 'Analytical Expert',
        description: 'Methodical and detail-oriented',
        category: 'professional',
        traits: { conscientiousness: 'high', openness: 'medium', extraversion: 'low' },
        demographics: {},
        behaviors: {},
        communication_style: { tone: 'professional', detail_level: 'high' },
        content_preferences: {},
        platform_usage: {},
        is_public: false,
        created_by: 'system',
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      capabilities: [
        {
          id: 'upload-files',
          name: 'File Upload',
          description: 'Upload and organize files in knowledge bases',
          category: 'knowledge',
          parameters: { supportedFormats: ['pdf', 'doc', 'txt', 'md', 'json'] },
          confidence: 0.9,
          successRate: 0.95
        },
        {
          id: 'search-knowledge',
          name: 'Knowledge Search',
          description: 'Search through knowledge bases with semantic understanding',
          category: 'knowledge',
          parameters: { searchTypes: ['semantic', 'keyword', 'fuzzy'] },
          confidence: 0.85,
          successRate: 0.88
        },
        {
          id: 'organize-content',
          name: 'Content Organization',
          description: 'Automatically categorize and tag content',
          category: 'knowledge',
          parameters: { autoTagging: true, categorization: true },
          confidence: 0.8,
          successRate: 0.82
        }
      ],
      knowledgeBases: [],
      learningRate: 0.1,
      collaborationStyle: 'analytical',
      status: 'available',
      performance: {
        tasksCompleted: 0,
        successRate: 0.0,
        userSatisfaction: 0.0,
        averageResponseTime: 0
      }
    }

    // Network Analysis Agent
    const networkAgent: Agent = {
      id: 'network-agent',
      name: 'Network Analyst',
      description: 'Expert in network analysis, connection mapping, and relationship insights',
      expertise: ['network_analysis', 'graph_visualization', 'relationship_mapping', 'influence_analysis'],
      personality: {
        id: 'strategic-persona',
        name: 'Strategic Thinker',
        description: 'Big-picture oriented and relationship-focused',
        category: 'professional',
        traits: { openness: 'high', conscientiousness: 'medium', extraversion: 'high' },
        demographics: {},
        behaviors: {},
        communication_style: { tone: 'strategic', detail_level: 'medium' },
        content_preferences: {},
        platform_usage: {},
        is_public: false,
        created_by: 'system',
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      capabilities: [
        {
          id: 'visualize-network',
          name: 'Network Visualization',
          description: 'Create interactive network graphs and relationship maps',
          category: 'network',
          parameters: { layoutTypes: ['force', 'hierarchical', 'circular'] },
          confidence: 0.9,
          successRate: 0.92
        },
        {
          id: 'analyze-connections',
          name: 'Connection Analysis',
          description: 'Analyze connection strength, influence, and collaboration potential',
          category: 'network',
          parameters: { metrics: ['strength', 'influence', 'collaboration'] },
          confidence: 0.85,
          successRate: 0.87
        },
        {
          id: 'recommend-connections',
          name: 'Connection Recommendations',
          description: 'Suggest new connections based on network analysis',
          category: 'network',
          parameters: { recommendationTypes: ['mutual', 'industry', 'interest'] },
          confidence: 0.8,
          successRate: 0.75
        }
      ],
      knowledgeBases: [],
      learningRate: 0.15,
      collaborationStyle: 'collaborative',
      status: 'available',
      performance: {
        tasksCompleted: 0,
        successRate: 0.0,
        userSatisfaction: 0.0,
        averageResponseTime: 0
      }
    }

    // Project Management Agent
    const projectAgent: Agent = {
      id: 'project-agent',
      name: 'Project Coordinator',
      description: 'Specialized in project management, team coordination, and workflow optimization',
      expertise: ['project_management', 'team_coordination', 'workflow_optimization', 'task_delegation'],
      personality: {
        id: 'directive-persona',
        name: 'Project Leader',
        description: 'Goal-oriented and action-focused',
        category: 'professional',
        traits: { conscientiousness: 'high', extraversion: 'high', agreeableness: 'medium' },
        demographics: {},
        behaviors: {},
        communication_style: { tone: 'directive', detail_level: 'medium' },
        content_preferences: {},
        platform_usage: {},
        is_public: false,
        created_by: 'system',
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      capabilities: [
        {
          id: 'create-project',
          name: 'Project Creation',
          description: 'Create and configure new projects with team setup',
          category: 'project',
          parameters: { projectTypes: ['collaboration', 'research', 'automation'] },
          confidence: 0.9,
          successRate: 0.94
        },
        {
          id: 'manage-tasks',
          name: 'Task Management',
          description: 'Create, assign, and track project tasks',
          category: 'project',
          parameters: { taskTypes: ['development', 'research', 'analysis'] },
          confidence: 0.85,
          successRate: 0.89
        },
        {
          id: 'coordinate-team',
          name: 'Team Coordination',
          description: 'Facilitate team collaboration and communication',
          category: 'project',
          parameters: { coordinationTypes: ['meetings', 'updates', 'reviews'] },
          confidence: 0.8,
          successRate: 0.83
        }
      ],
      knowledgeBases: [],
      learningRate: 0.12,
      collaborationStyle: 'directive',
      status: 'available',
      performance: {
        tasksCompleted: 0,
        successRate: 0.0,
        userSatisfaction: 0.0,
        averageResponseTime: 0
      }
    }

    // LinkedIn Automation Agent
    const linkedinAgent: Agent = {
      id: 'linkedin-agent',
      name: 'LinkedIn Specialist',
      description: 'Expert in LinkedIn automation, connection strategies, and professional networking',
      expertise: ['linkedin_automation', 'connection_strategy', 'content_optimization', 'engagement_analysis'],
      personality: {
        id: 'social-persona',
        name: 'Network Builder',
        description: 'Social and relationship-focused',
        category: 'professional',
        traits: { extraversion: 'high', agreeableness: 'high', openness: 'medium' },
        demographics: {},
        behaviors: {},
        communication_style: { tone: 'friendly', detail_level: 'low' },
        content_preferences: {},
        platform_usage: {},
        is_public: false,
        created_by: 'system',
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      capabilities: [
        {
          id: 'automate-connections',
          name: 'Connection Automation',
          description: 'Automate LinkedIn connection requests and follow-ups',
          category: 'automation',
          parameters: { automationTypes: ['connection', 'followup', 'engagement'] },
          confidence: 0.85,
          successRate: 0.78
        },
        {
          id: 'optimize-content',
          name: 'Content Optimization',
          description: 'Optimize LinkedIn posts and profile for better engagement',
          category: 'automation',
          parameters: { optimizationTypes: ['posts', 'profile', 'headline'] },
          confidence: 0.8,
          successRate: 0.82
        },
        {
          id: 'analyze-engagement',
          name: 'Engagement Analysis',
          description: 'Analyze LinkedIn engagement patterns and performance',
          category: 'analytics',
          parameters: { metrics: ['likes', 'comments', 'shares', 'views'] },
          confidence: 0.9,
          successRate: 0.91
        }
      ],
      knowledgeBases: [],
      learningRate: 0.18,
      collaborationStyle: 'supportive',
      status: 'available',
      performance: {
        tasksCompleted: 0,
        successRate: 0.0,
        userSatisfaction: 0.0,
        averageResponseTime: 0
      }
    }

    // Persona Management Agent
    const personaAgent: Agent = {
      id: 'persona-agent',
      name: 'Persona Specialist',
      description: 'Expert in psychographic analysis, audience segmentation, and persona development',
      expertise: ['psychographic_analysis', 'audience_segmentation', 'persona_development', 'behavioral_analysis'],
      personality: {
        id: 'analytical-persona',
        name: 'Behavioral Analyst',
        description: 'Insightful and data-driven',
        category: 'professional',
        traits: { openness: 'high', conscientiousness: 'high', extraversion: 'low' },
        demographics: {},
        behaviors: {},
        communication_style: { tone: 'analytical', detail_level: 'high' },
        content_preferences: {},
        platform_usage: {},
        is_public: false,
        created_by: 'system',
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      capabilities: [
        {
          id: 'create-personas',
          name: 'Persona Creation',
          description: 'Create detailed psychographic personas and presets',
          category: 'analytics',
          parameters: { personaTypes: ['psychographic', 'demographic', 'behavioral'] },
          confidence: 0.9,
          successRate: 0.93
        },
        {
          id: 'segment-audience',
          name: 'Audience Segmentation',
          description: 'Segment audiences based on psychographic and behavioral data',
          category: 'analytics',
          parameters: { segmentationTypes: ['psychographic', 'behavioral', 'demographic'] },
          confidence: 0.85,
          successRate: 0.87
        },
        {
          id: 'analyze-behavior',
          name: 'Behavioral Analysis',
          description: 'Analyze user behavior patterns and preferences',
          category: 'analytics',
          parameters: { analysisTypes: ['engagement', 'preferences', 'patterns'] },
          confidence: 0.8,
          successRate: 0.84
        }
      ],
      knowledgeBases: [],
      learningRate: 0.14,
      collaborationStyle: 'analytical',
      status: 'available',
      performance: {
        tasksCompleted: 0,
        successRate: 0.0,
        userSatisfaction: 0.0,
        averageResponseTime: 0
      }
    }

    // Register all agents
    this.agents.set(knowledgeAgent.id, knowledgeAgent)
    this.agents.set(networkAgent.id, networkAgent)
    this.agents.set(projectAgent.id, projectAgent)
    this.agents.set(linkedinAgent.id, linkedinAgent)
    this.agents.set(personaAgent.id, personaAgent)
  }

  public processMessage(message: string, context: ConversationContext): Promise<AgentResponse> {
    return new Promise(async (resolve) => {
      // Update conversation context
      this.conversationContext = { ...this.conversationContext, ...context }

      // Analyze message intent and entities
      const analysis = await this.analyzeMessage(message)
      
      // Select appropriate agent(s)
      const selectedAgents = this.selectAgents(analysis)
      
      // Create task
      const task = this.createTask(analysis, selectedAgents)
      
      // Execute task
      const result = await this.executeTask(task, selectedAgents)
      
      // Generate response
      const response = this.generateResponse(result, selectedAgents)
      
      resolve(response)
    })
  }

  private async analyzeMessage(message: string): Promise<MessageAnalysis> {
    // Simulate AI-powered message analysis
    const lowerMessage = message.toLowerCase()
    
    let intent = 'general'
    let entities: Record<string, any> = {}
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    let urgency: 'low' | 'medium' | 'high' = 'medium'
    let confidence = 0.8

    // Intent detection
    if (lowerMessage.includes('create') && lowerMessage.includes('project')) {
      intent = 'create_project'
      entities.projectType = this.extractProjectType(message)
    } else if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      intent = 'upload_file'
      entities.fileTypes = this.extractFileTypes(message)
    } else if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      intent = 'analyze_network'
      entities.analysisType = this.extractAnalysisType(message)
    } else if (lowerMessage.includes('knowledge') || lowerMessage.includes('base')) {
      intent = 'knowledge_management'
      entities.operation = this.extractKnowledgeOperation(message)
    } else if (lowerMessage.includes('persona') || lowerMessage.includes('psychographic')) {
      intent = 'persona_management'
      entities.personaType = this.extractPersonaType(message)
    } else if (lowerMessage.includes('linkedin') || lowerMessage.includes('connect')) {
      intent = 'linkedin_automation'
      entities.linkedinAction = this.extractLinkedInAction(message)
    }

    // Sentiment analysis
    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('quickly')) {
      urgency = 'high'
    } else if (lowerMessage.includes('whenever') || lowerMessage.includes('no rush')) {
      urgency = 'low'
    }

    if (lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('perfect')) {
      sentiment = 'positive'
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('error')) {
      sentiment = 'negative'
    }

    return {
      intent,
      entities,
      sentiment,
      urgency,
      confidence,
      originalMessage: message
    }
  }

  private selectAgents(analysis: MessageAnalysis): Agent[] {
    const suitableAgents: Agent[] = []

    // Select agents based on intent and capabilities
    for (const agent of this.agents.values()) {
      if (agent.status !== 'available') continue

      let relevance = 0

      // Check expertise match
      for (const expertise of agent.expertise) {
        if (analysis.intent.includes(expertise.replace('_', ''))) {
          relevance += 0.3
        }
      }

      // Check capability match
      for (const capability of agent.capabilities) {
        if (analysis.intent.includes(capability.id.replace('_', ''))) {
          relevance += 0.4
        }
      }

      // Check personality match with user context
      if (this.conversationContext.userPersona) {
        const personalityMatch = this.calculatePersonalityMatch(agent, this.conversationContext.userPersona)
        relevance += personalityMatch * 0.3
      }

      if (relevance > 0.5) {
        suitableAgents.push(agent)
      }
    }

    // Sort by relevance and performance
    suitableAgents.sort((a, b) => {
      const aScore = a.performance.successRate * a.performance.userSatisfaction
      const bScore = b.performance.successRate * b.performance.userSatisfaction
      return bScore - aScore
    })

    return suitableAgents.slice(0, 3) // Return top 3 agents
  }

  private createTask(analysis: MessageAnalysis, agents: Agent[]): AgentTask {
    const task: AgentTask = {
      id: `task_${Date.now()}`,
      type: analysis.intent,
      description: analysis.originalMessage,
      parameters: analysis.entities,
      priority: analysis.urgency === 'high' ? 'high' : analysis.urgency === 'low' ? 'low' : 'medium',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDuration: this.estimateTaskDuration(analysis.intent, agents)
    }

    this.tasks.set(task.id, task)
    return task
  }

  private async executeTask(task: AgentTask, agents: Agent[]): Promise<TaskResult> {
    task.status = 'in_progress'
    task.assignedAgent = agents[0]?.id

    const startTime = Date.now()

    try {
      let result: any

      if (agents.length === 1) {
        // Single agent execution
        result = await this.executeWithSingleAgent(task, agents[0])
      } else {
        // Multi-agent collaboration
        result = await this.executeWithCollaboration(task, agents)
      }

      task.status = 'completed'
      task.result = result
      task.actualDuration = Date.now() - startTime

      // Update agent performance
      this.updateAgentPerformance(agents[0], true, task.actualDuration)

      return {
        success: true,
        result,
        agents: agents.map(a => a.id),
        duration: task.actualDuration
      }
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      task.actualDuration = Date.now() - startTime

      // Update agent performance
      this.updateAgentPerformance(agents[0], false, task.actualDuration)

      return {
        success: false,
        error: task.error,
        agents: agents.map(a => a.id),
        duration: task.actualDuration
      }
    }
  }

  private async executeWithSingleAgent(task: AgentTask, agent: Agent): Promise<any> {
    // Simulate agent execution
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Mock execution based on task type
    switch (task.type) {
      case 'create_project':
        return {
          projectId: `project_${Date.now()}`,
          name: task.parameters.projectName || 'New Project',
          status: 'created',
          teamMembers: []
        }
      case 'upload_file':
        return {
          fileId: `file_${Date.now()}`,
          filename: task.parameters.filename || 'uploaded_file',
          status: 'uploaded',
          knowledgeBaseId: task.parameters.knowledgeBaseId
        }
      case 'analyze_network':
        return {
          analysisId: `analysis_${Date.now()}`,
          connections: 150,
          influenceScore: 0.85,
          recommendations: ['Connect with industry leaders', 'Engage with content creators']
        }
      default:
        return { message: 'Task completed successfully' }
    }
  }

  private async executeWithCollaboration(task: AgentTask, agents: Agent[]): Promise<any> {
    // Create collaboration
    const collaboration: AgentCollaboration = {
      id: `collab_${Date.now()}`,
      primaryAgent: agents[0].id,
      collaboratingAgents: agents.slice(1).map(a => a.id),
      task,
      communication: [],
      status: 'planning',
      createdAt: new Date()
    }

    this.collaborations.set(collaboration.id, collaboration)

    // Simulate collaboration process
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    collaboration.status = 'completed'
    collaboration.completedAt = new Date()

    return {
      collaborationId: collaboration.id,
      result: 'Collaborative task completed',
      participants: agents.map(a => a.id)
    }
  }

  private generateResponse(result: TaskResult, agents: Agent[]): AgentResponse {
    const primaryAgent = agents[0]
    const agentName = primaryAgent?.name || 'DefConect Assistant'

    let content = ''
    let actions: ConversationalAction[] = []

    if (result.success) {
      content = `${agentName} has successfully completed your request. ${this.generateSuccessMessage(result.result, primaryAgent)}`
      actions = this.generateSuccessActions(result.result, primaryAgent)
    } else {
      content = `I apologize, but ${agentName} encountered an issue: ${result.error}. Let me try a different approach.`
      actions = this.generateErrorActions(result.error, primaryAgent)
    }

    return {
      content,
      actions,
      agentId: primaryAgent?.id,
      agentName,
      confidence: 0.9,
      metadata: {
        taskResult: result,
        participatingAgents: agents.map(a => a.id),
        executionTime: result.duration
      }
    }
  }

  // Helper methods
  private extractProjectType(message: string): string {
    if (message.toLowerCase().includes('linkedin')) return 'linkedin_automation'
    if (message.toLowerCase().includes('research')) return 'research'
    if (message.toLowerCase().includes('collaboration')) return 'collaboration'
    return 'general'
  }

  private extractFileTypes(message: string): string[] {
    const fileTypes: string[] = []
    if (message.toLowerCase().includes('pdf')) fileTypes.push('pdf')
    if (message.toLowerCase().includes('doc')) fileTypes.push('doc')
    if (message.toLowerCase().includes('image')) fileTypes.push('image')
    return fileTypes
  }

  private extractAnalysisType(message: string): string {
    if (message.toLowerCase().includes('visualize')) return 'visualization'
    if (message.toLowerCase().includes('strength')) return 'strength_analysis'
    if (message.toLowerCase().includes('influence')) return 'influence_analysis'
    return 'general_analysis'
  }

  private extractKnowledgeOperation(message: string): string {
    if (message.toLowerCase().includes('search')) return 'search'
    if (message.toLowerCase().includes('organize')) return 'organize'
    if (message.toLowerCase().includes('create')) return 'create'
    return 'manage'
  }

  private extractPersonaType(message: string): string {
    if (message.toLowerCase().includes('psychographic')) return 'psychographic'
    if (message.toLowerCase().includes('demographic')) return 'demographic'
    if (message.toLowerCase().includes('behavioral')) return 'behavioral'
    return 'general'
  }

  private extractLinkedInAction(message: string): string {
    if (message.toLowerCase().includes('connect')) return 'connection'
    if (message.toLowerCase().includes('post')) return 'posting'
    if (message.toLowerCase().includes('engage')) return 'engagement'
    return 'automation'
  }

  private calculatePersonalityMatch(agent: Agent, userPersona: UserPersona): number {
    // Simple personality matching algorithm
    let match = 0.5 // Base match

    // Compare communication styles
    if (agent.personality.communication_style.tone === userPersona.communication_style.tone) {
      match += 0.2
    }

    // Compare collaboration styles
    if (agent.collaborationStyle === 'collaborative' && userPersona.preferences.collaboration === 'high') {
      match += 0.2
    }

    return Math.min(match, 1.0)
  }

  private estimateTaskDuration(intent: string, agents: Agent[]): number {
    const baseDurations: Record<string, number> = {
      'create_project': 30000,
      'upload_file': 10000,
      'analyze_network': 45000,
      'knowledge_management': 20000,
      'persona_management': 35000,
      'linkedin_automation': 25000
    }

    const baseDuration = baseDurations[intent] || 15000
    const agentMultiplier = agents.length > 1 ? 1.5 : 1.0

    return baseDuration * agentMultiplier
  }

  private updateAgentPerformance(agent: Agent, success: boolean, duration: number): void {
    agent.performance.tasksCompleted++
    
    if (success) {
      agent.performance.successRate = (agent.performance.successRate * (agent.performance.tasksCompleted - 1) + 1) / agent.performance.tasksCompleted
    } else {
      agent.performance.successRate = (agent.performance.successRate * (agent.performance.tasksCompleted - 1)) / agent.performance.tasksCompleted
    }

    agent.performance.averageResponseTime = (agent.performance.averageResponseTime * (agent.performance.tasksCompleted - 1) + duration) / agent.performance.tasksCompleted
  }

  private generateSuccessMessage(result: any, agent: Agent): string {
    switch (agent.id) {
      case 'knowledge-agent':
        return 'Your knowledge base has been updated with the new information.'
      case 'network-agent':
        return 'Network analysis is complete. I found some interesting patterns in your connections.'
      case 'project-agent':
        return 'Project setup is complete. Your team is ready to start collaborating.'
      case 'linkedin-agent':
        return 'LinkedIn automation is configured and ready to optimize your networking.'
      case 'persona-agent':
        return 'Persona analysis is complete. I have insights about your target audience.'
      default:
        return 'Task completed successfully.'
    }
  }

  private generateSuccessActions(result: any, agent: Agent): ConversationalAction[] {
    const actions: ConversationalAction[] = []

    switch (agent.id) {
      case 'knowledge-agent':
        actions.push({
          id: 'view-knowledge',
          label: 'View Knowledge Base',
          action: 'view_knowledge_base',
          type: 'primary'
        })
        break
      case 'network-agent':
        actions.push({
          id: 'view-network',
          label: 'View Network Graph',
          action: 'view_network_graph',
          type: 'primary'
        })
        break
      case 'project-agent':
        actions.push({
          id: 'view-project',
          label: 'View Project',
          action: 'view_project',
          type: 'primary'
        })
        break
    }

    return actions
  }

  private generateErrorActions(error: string, agent: Agent): ConversationalAction[] {
    return [
      {
        id: 'retry-task',
        label: 'Try Again',
        action: 'retry_task',
        type: 'primary'
      },
      {
        id: 'different-approach',
        label: 'Different Approach',
        action: 'different_approach',
        type: 'secondary'
      }
    ]
  }

  // Public methods for external access
  public getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(agent => agent.status === 'available')
  }

  public getAgentById(id: string): Agent | undefined {
    return this.agents.get(id)
  }

  public getActiveTasks(): AgentTask[] {
    return Array.from(this.tasks.values()).filter(task => task.status === 'in_progress')
  }

  public getConversationContext(): ConversationContext {
    return this.conversationContext
  }

  public updateConversationContext(updates: Partial<ConversationContext>): void {
    this.conversationContext = { ...this.conversationContext, ...updates }
  }
}

// Supporting interfaces
interface MessageAnalysis {
  intent: string
  entities: Record<string, any>
  sentiment: 'positive' | 'negative' | 'neutral'
  urgency: 'low' | 'medium' | 'high'
  confidence: number
  originalMessage: string
}

interface TaskResult {
  success: boolean
  result?: any
  error?: string
  agents: string[]
  duration: number
}

interface AgentResponse {
  content: string
  actions: ConversationalAction[]
  agentId?: string
  agentName?: string
  confidence: number
  metadata?: Record<string, any>
}

interface ConversationalAction {
  id: string
  label: string
  action: string
  type: 'primary' | 'secondary' | 'danger'
  icon?: string
  parameters?: Record<string, any>
  requiresConfirmation?: boolean
}

export { AgentOrchestrationSystem }
