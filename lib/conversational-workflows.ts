import { AgentOrchestrationSystem, Agent, AgentTask } from './agent-orchestration'

export interface ConversationalWorkflow {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
  status: 'active' | 'inactive' | 'draft'
  createdBy: string
  createdAt: Date
  updatedAt: Date
  executionCount: number
  successRate: number
  averageExecutionTime: number
}

export interface WorkflowTrigger {
  type: 'conversation' | 'schedule' | 'event' | 'manual'
  conditions: TriggerCondition[]
  parameters: Record<string, any>
}

export interface TriggerCondition {
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'greater_than' | 'less_than'
  value: any
  required: boolean
}

export interface WorkflowStep {
  id: string
  name: string
  type: 'agent_action' | 'user_input' | 'condition' | 'delay' | 'notification' | 'data_processing'
  agentId?: string
  action: string
  parameters: Record<string, any>
  conditions?: WorkflowCondition[]
  timeout?: number
  retryCount?: number
  onSuccess?: string // Next step ID
  onFailure?: string // Next step ID
  onTimeout?: string // Next step ID
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists'
  value: any
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
  currentStep?: string
  context: Record<string, any>
  results: Record<string, any>
  errors: Record<string, string>
  startedAt: Date
  completedAt?: Date
  executedBy: string
  agentTasks: string[] // Agent task IDs
}

export interface ConversationalCommand {
  id: string
  name: string
  description: string
  pattern: string // Regex pattern for matching
  parameters: CommandParameter[]
  workflowId: string
  examples: string[]
  category: 'knowledge' | 'network' | 'project' | 'automation' | 'analysis'
}

export interface CommandParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description: string
  defaultValue?: any
  validation?: ParameterValidation
}

export interface ParameterValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number
  max?: number
  allowedValues?: any[]
}

export class ConversationalWorkflowEngine {
  private workflows: Map<string, ConversationalWorkflow> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private commands: Map<string, ConversationalCommand> = new Map()
  private agentOrchestration: AgentOrchestrationSystem

  constructor(agentOrchestration: AgentOrchestrationSystem) {
    this.agentOrchestration = agentOrchestration
    this.initializeDefaultWorkflows()
    this.initializeDefaultCommands()
  }

  private initializeDefaultWorkflows(): void {
    // Knowledge Base Creation Workflow
    const knowledgeWorkflow: ConversationalWorkflow = {
      id: 'knowledge-base-creation',
      name: 'Knowledge Base Creation',
      description: 'Automatically creates a knowledge base based on user conversation',
      trigger: {
        type: 'conversation',
        conditions: [
          {
            field: 'intent',
            operator: 'equals',
            value: 'create_knowledge_base',
            required: true
          }
        ],
        parameters: {}
      },
      steps: [
        {
          id: 'analyze-requirements',
          name: 'Analyze Requirements',
          type: 'agent_action',
          agentId: 'knowledge-agent',
          action: 'analyze_knowledge_requirements',
          parameters: {
            extractFromConversation: true,
            askForMissingInfo: true
          },
          onSuccess: 'create-knowledge-base',
          onFailure: 'request-clarification'
        },
        {
          id: 'create-knowledge-base',
          name: 'Create Knowledge Base',
          type: 'agent_action',
          agentId: 'knowledge-agent',
          action: 'create_knowledge_base',
          parameters: {
            autoConfigure: true,
            setPermissions: true
          },
          onSuccess: 'setup-initial-content',
          onFailure: 'handle-creation-error'
        },
        {
          id: 'setup-initial-content',
          name: 'Setup Initial Content',
          type: 'agent_action',
          agentId: 'knowledge-agent',
          action: 'setup_initial_content',
          parameters: {
            createDefaultCategories: true,
            addSampleContent: false
          },
          onSuccess: 'notify-completion',
          onFailure: 'notify-partial-completion'
        },
        {
          id: 'notify-completion',
          name: 'Notify Completion',
          type: 'notification',
          action: 'notify_user',
          parameters: {
            message: 'Knowledge base created successfully!',
            includeSummary: true
          }
        }
      ],
      status: 'active',
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      successRate: 0.0,
      averageExecutionTime: 0
    }

    // Project Setup Workflow
    const projectWorkflow: ConversationalWorkflow = {
      id: 'project-setup',
      name: 'Project Setup',
      description: 'Sets up a new project with team and file structure',
      trigger: {
        type: 'conversation',
        conditions: [
          {
            field: 'intent',
            operator: 'equals',
            value: 'create_project',
            required: true
          }
        ],
        parameters: {}
      },
      steps: [
        {
          id: 'gather-project-details',
          name: 'Gather Project Details',
          type: 'agent_action',
          agentId: 'project-agent',
          action: 'gather_project_details',
          parameters: {
            askForName: true,
            askForDescription: true,
            askForTeamMembers: true
          },
          onSuccess: 'create-project',
          onFailure: 'request-more-info'
        },
        {
          id: 'create-project',
          name: 'Create Project',
          type: 'agent_action',
          agentId: 'project-agent',
          action: 'create_project',
          parameters: {
            enableFileSharing: true,
            enableVersionControl: true,
            setAccessLevel: 'tribe'
          },
          onSuccess: 'setup-project-structure',
          onFailure: 'handle-creation-error'
        },
        {
          id: 'setup-project-structure',
          name: 'Setup Project Structure',
          type: 'agent_action',
          agentId: 'project-agent',
          action: 'setup_project_structure',
          parameters: {
            createDefaultFolders: true,
            setupPermissions: true
          },
          onSuccess: 'invite-team-members',
          onFailure: 'notify-partial-setup'
        },
        {
          id: 'invite-team-members',
          name: 'Invite Team Members',
          type: 'agent_action',
          agentId: 'project-agent',
          action: 'invite_team_members',
          parameters: {
            sendNotifications: true,
            setRoles: true
          },
          onSuccess: 'notify-completion',
          onFailure: 'notify-partial-completion'
        },
        {
          id: 'notify-completion',
          name: 'Notify Completion',
          type: 'notification',
          action: 'notify_user',
          parameters: {
            message: 'Project setup complete!',
            includeProjectLink: true
          }
        }
      ],
      status: 'active',
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      successRate: 0.0,
      averageExecutionTime: 0
    }

    // Network Analysis Workflow
    const networkWorkflow: ConversationalWorkflow = {
      id: 'network-analysis',
      name: 'Network Analysis',
      description: 'Performs comprehensive network analysis and provides insights',
      trigger: {
        type: 'conversation',
        conditions: [
          {
            field: 'intent',
            operator: 'equals',
            value: 'analyze_network',
            required: true
          }
        ],
        parameters: {}
      },
      steps: [
        {
          id: 'collect-network-data',
          name: 'Collect Network Data',
          type: 'agent_action',
          agentId: 'network-agent',
          action: 'collect_network_data',
          parameters: {
            includeConnections: true,
            includeInteractions: true,
            includeEngagement: true
          },
          onSuccess: 'analyze-connections',
          onFailure: 'handle-data-error'
        },
        {
          id: 'analyze-connections',
          name: 'Analyze Connections',
          type: 'agent_action',
          agentId: 'network-agent',
          action: 'analyze_connections',
          parameters: {
            calculateStrength: true,
            identifyInfluencers: true,
            findClusters: true
          },
          onSuccess: 'generate-insights',
          onFailure: 'handle-analysis-error'
        },
        {
          id: 'generate-insights',
          name: 'Generate Insights',
          type: 'agent_action',
          agentId: 'network-agent',
          action: 'generate_insights',
          parameters: {
            createRecommendations: true,
            identifyOpportunities: true,
            suggestActions: true
          },
          onSuccess: 'create-visualization',
          onFailure: 'notify-partial-analysis'
        },
        {
          id: 'create-visualization',
          name: 'Create Visualization',
          type: 'agent_action',
          agentId: 'network-agent',
          action: 'create_visualization',
          parameters: {
            layoutType: 'force',
            includeLabels: true,
            interactive: true
          },
          onSuccess: 'notify-completion',
          onFailure: 'notify-partial-completion'
        },
        {
          id: 'notify-completion',
          name: 'Notify Completion',
          type: 'notification',
          action: 'notify_user',
          parameters: {
            message: 'Network analysis complete!',
            includeInsights: true,
            includeVisualization: true
          }
        }
      ],
      status: 'active',
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      successRate: 0.0,
      averageExecutionTime: 0
    }

    // Register workflows
    this.workflows.set(knowledgeWorkflow.id, knowledgeWorkflow)
    this.workflows.set(projectWorkflow.id, projectWorkflow)
    this.workflows.set(networkWorkflow.id, networkWorkflow)
  }

  private initializeDefaultCommands(): void {
    const commands: ConversationalCommand[] = [
      {
        id: 'create-knowledge-base',
        name: 'Create Knowledge Base',
        description: 'Create a new knowledge base with specified parameters',
        pattern: 'create\\s+(?:a\\s+)?knowledge\\s+base(?:\\s+called\\s+(?<name>\\w+))?(?:\\s+for\\s+(?<purpose>\\w+))?',
        parameters: [
          {
            name: 'name',
            type: 'string',
            required: false,
            description: 'Name of the knowledge base',
            defaultValue: 'My Knowledge Base'
          },
          {
            name: 'purpose',
            type: 'string',
            required: false,
            description: 'Purpose of the knowledge base',
            defaultValue: 'general'
          }
        ],
        workflowId: 'knowledge-base-creation',
        examples: [
          'Create a knowledge base',
          'Create a knowledge base called "AI Research"',
          'Create a knowledge base for project documentation'
        ],
        category: 'knowledge'
      },
      {
        id: 'setup-project',
        name: 'Setup Project',
        description: 'Set up a new project with team and structure',
        pattern: 'setup\\s+(?:a\\s+)?project(?:\\s+called\\s+(?<name>\\w+))?(?:\\s+with\\s+(?<team>\\w+))?',
        parameters: [
          {
            name: 'name',
            type: 'string',
            required: false,
            description: 'Name of the project',
            defaultValue: 'New Project'
          },
          {
            name: 'team',
            type: 'string',
            required: false,
            description: 'Team members to include',
            defaultValue: ''
          }
        ],
        workflowId: 'project-setup',
        examples: [
          'Setup a project',
          'Setup a project called "AI Innovation"',
          'Setup a project with the development team'
        ],
        category: 'project'
      },
      {
        id: 'analyze-network',
        name: 'Analyze Network',
        description: 'Analyze network connections and provide insights',
        pattern: 'analyze\\s+(?:my\\s+)?network(?:\\s+(?<type>\\w+))?',
        parameters: [
          {
            name: 'type',
            type: 'string',
            required: false,
            description: 'Type of analysis to perform',
            defaultValue: 'comprehensive',
            validation: {
              allowedValues: ['comprehensive', 'connections', 'influence', 'engagement']
            }
          }
        ],
        workflowId: 'network-analysis',
        examples: [
          'Analyze my network',
          'Analyze network connections',
          'Analyze network influence'
        ],
        category: 'network'
      },
      {
        id: 'upload-files',
        name: 'Upload Files',
        description: 'Upload files to a knowledge base',
        pattern: 'upload\\s+(?<files>\\w+(?:,\\s*\\w+)*)(?:\\s+to\\s+(?<knowledgeBase>\\w+))?',
        parameters: [
          {
            name: 'files',
            type: 'array',
            required: true,
            description: 'Files to upload'
          },
          {
            name: 'knowledgeBase',
            type: 'string',
            required: false,
            description: 'Target knowledge base',
            defaultValue: 'default'
          }
        ],
        workflowId: 'file-upload',
        examples: [
          'Upload document.pdf',
          'Upload file1.pdf, file2.doc to Research KB',
          'Upload images to Media Library'
        ],
        category: 'knowledge'
      },
      {
        id: 'create-persona',
        name: 'Create Persona',
        description: 'Create a new psychographic persona',
        pattern: 'create\\s+(?:a\\s+)?persona(?:\\s+called\\s+(?<name>\\w+))?(?:\\s+for\\s+(?<audience>\\w+))?',
        parameters: [
          {
            name: 'name',
            type: 'string',
            required: false,
            description: 'Name of the persona',
            defaultValue: 'New Persona'
          },
          {
            name: 'audience',
            type: 'string',
            required: false,
            description: 'Target audience',
            defaultValue: 'general'
          }
        ],
        workflowId: 'persona-creation',
        examples: [
          'Create a persona',
          'Create a persona called "Tech Entrepreneur"',
          'Create a persona for startup founders'
        ],
        category: 'analysis'
      }
    ]

    commands.forEach(command => {
      this.commands.set(command.id, command)
    })
  }

  public async processConversationalInput(
    message: string,
    context: Record<string, any>
  ): Promise<WorkflowExecutionResult> {
    // Find matching command
    const matchingCommand = this.findMatchingCommand(message)
    
    if (!matchingCommand) {
      return {
        success: false,
        error: 'No matching command found',
        suggestions: this.generateSuggestions(message)
      }
    }

    // Extract parameters from message
    const parameters = this.extractParameters(message, matchingCommand)
    
    // Validate parameters
    const validationResult = this.validateParameters(parameters, matchingCommand.parameters)
    if (!validationResult.valid) {
      return {
        success: false,
        error: `Invalid parameters: ${validationResult.errors.join(', ')}`,
        suggestions: this.generateParameterSuggestions(matchingCommand)
      }
    }

    // Get workflow
    const workflow = this.workflows.get(matchingCommand.workflowId)
    if (!workflow) {
      return {
        success: false,
        error: 'Workflow not found',
        suggestions: []
      }
    }

    // Execute workflow
    return await this.executeWorkflow(workflow, parameters, context)
  }

  private findMatchingCommand(message: string): ConversationalCommand | null {
    for (const command of this.commands.values()) {
      const regex = new RegExp(command.pattern, 'i')
      if (regex.test(message)) {
        return command
      }
    }
    return null
  }

  private extractParameters(message: string, command: ConversationalCommand): Record<string, any> {
    const regex = new RegExp(command.pattern, 'i')
    const match = message.match(regex)
    
    if (!match) return {}

    const parameters: Record<string, any> = {}
    
    // Extract named groups
    for (const [key, value] of Object.entries(match.groups || {})) {
      if (value) {
        parameters[key] = value
      }
    }

    // Apply default values
    for (const param of command.parameters) {
      if (!(param.name in parameters) && param.defaultValue !== undefined) {
        parameters[param.name] = param.defaultValue
      }
    }

    return parameters
  }

  private validateParameters(
    parameters: Record<string, any>,
    parameterDefinitions: CommandParameter[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const paramDef of parameterDefinitions) {
      const value = parameters[paramDef.name]

      // Check required parameters
      if (paramDef.required && (value === undefined || value === null || value === '')) {
        errors.push(`${paramDef.name} is required`)
        continue
      }

      // Skip validation if value is not provided and not required
      if (value === undefined || value === null) continue

      // Type validation
      if (!this.validateParameterType(value, paramDef.type)) {
        errors.push(`${paramDef.name} must be of type ${paramDef.type}`)
        continue
      }

      // Custom validation
      if (paramDef.validation) {
        const validationErrors = this.validateParameterValue(value, paramDef.validation)
        errors.push(...validationErrors)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private validateParameterType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      default:
        return true
    }
  }

  private validateParameterValue(value: any, validation: ParameterValidation): string[] {
    const errors: string[] = []

    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`Minimum length is ${validation.minLength}`)
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`Maximum length is ${validation.maxLength}`)
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        errors.push(`Value does not match required pattern`)
      }
    }

    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push(`Minimum value is ${validation.min}`)
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push(`Maximum value is ${validation.max}`)
      }
    }

    if (validation.allowedValues && !validation.allowedValues.includes(value)) {
      errors.push(`Value must be one of: ${validation.allowedValues.join(', ')}`)
    }

    return errors
  }

  private async executeWorkflow(
    workflow: ConversationalWorkflow,
    parameters: Record<string, any>,
    context: Record<string, any>
  ): Promise<WorkflowExecutionResult> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflowId: workflow.id,
      status: 'running',
      context: { ...context, ...parameters },
      results: {},
      errors: {},
      startedAt: new Date(),
      executedBy: context.userId || 'system',
      agentTasks: []
    }

    this.executions.set(execution.id, execution)

    try {
      // Execute workflow steps
      let currentStep = workflow.steps[0]
      const stepResults: Record<string, any> = {}

      while (currentStep) {
        execution.currentStep = currentStep.id
        
        try {
          const stepResult = await this.executeStep(currentStep, execution.context, stepResults)
          stepResults[currentStep.id] = stepResult
          execution.results[currentStep.id] = stepResult

          // Determine next step
          if (stepResult.success) {
            currentStep = workflow.steps.find(s => s.id === currentStep.onSuccess) || null
          } else {
            currentStep = workflow.steps.find(s => s.id === currentStep.onFailure) || null
          }
        } catch (error) {
          execution.errors[currentStep.id] = error instanceof Error ? error.message : 'Unknown error'
          currentStep = workflow.steps.find(s => s.id === currentStep.onTimeout) || null
        }
      }

      execution.status = 'completed'
      execution.completedAt = new Date()

      // Update workflow statistics
      this.updateWorkflowStatistics(workflow, execution)

      return {
        success: true,
        executionId: execution.id,
        results: execution.results,
        duration: execution.completedAt.getTime() - execution.startedAt.getTime()
      }
    } catch (error) {
      execution.status = 'failed'
      execution.completedAt = new Date()
      execution.errors['workflow'] = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        error: execution.errors['workflow'],
        executionId: execution.id,
        results: execution.results
      }
    }
  }

  private async executeStep(
    step: WorkflowStep,
    context: Record<string, any>,
    stepResults: Record<string, any>
  ): Promise<StepExecutionResult> {
    const startTime = Date.now()

    try {
      switch (step.type) {
        case 'agent_action':
          return await this.executeAgentAction(step, context, stepResults)
        case 'user_input':
          return await this.executeUserInput(step, context, stepResults)
        case 'condition':
          return await this.executeCondition(step, context, stepResults)
        case 'delay':
          return await this.executeDelay(step, context, stepResults)
        case 'notification':
          return await this.executeNotification(step, context, stepResults)
        case 'data_processing':
          return await this.executeDataProcessing(step, context, stepResults)
        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      }
    }
  }

  private async executeAgentAction(
    step: WorkflowStep,
    context: Record<string, any>,
    stepResults: Record<string, any>
  ): Promise<StepExecutionResult> {
    if (!step.agentId) {
      throw new Error('Agent ID is required for agent action steps')
    }

    // Create agent task
    const task: AgentTask = {
      id: `task_${Date.now()}`,
      type: step.action,
      description: step.name,
      parameters: { ...step.parameters, ...context },
      priority: 'medium',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Execute through agent orchestration system
    const result = await this.agentOrchestration.processMessage(
      `Execute ${step.action} with parameters: ${JSON.stringify(step.parameters)}`,
      this.agentOrchestration.getConversationContext()
    )

    return {
      success: true,
      result: result,
      duration: 0 // Will be updated by agent orchestration
    }
  }

  private async executeUserInput(
    step: WorkflowStep,
    context: Record<string, any>,
    stepResults: Record<string, any>
  ): Promise<StepExecutionResult> {
    // Simulate user input collection
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      success: true,
      result: { userInput: 'Simulated user input' },
      duration: 1000
    }
  }

  private async executeCondition(
    step: WorkflowStep,
    context: Record<string, any>,
    stepResults: Record<string, any>
  ): Promise<StepExecutionResult> {
    if (!step.conditions) {
      return { success: true, result: { condition: true }, duration: 0 }
    }

    let conditionResult = true

    for (const condition of step.conditions) {
      const value = this.getNestedValue(context, condition.field)
      const conditionMet = this.evaluateCondition(value, condition.operator, condition.value)
      
      if (!conditionMet) {
        conditionResult = false
        break
      }
    }

    return {
      success: true,
      result: { condition: conditionResult },
      duration: 0
    }
  }

  private async executeDelay(
    step: WorkflowStep,
    context: Record<string, any>,
    stepResults: Record<string, any>
  ): Promise<StepExecutionResult> {
    const delay = step.parameters.delay || 1000
    await new Promise(resolve => setTimeout(resolve, delay))

    return {
      success: true,
      result: { delayed: true },
      duration: delay
    }
  }

  private async executeNotification(
    step: WorkflowStep,
    context: Record<string, any>,
    stepResults: Record<string, any>
  ): Promise<StepExecutionResult> {
    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      success: true,
      result: { notification: 'sent' },
      duration: 500
    }
  }

  private async executeDataProcessing(
    step: WorkflowStep,
    context: Record<string, any>,
    stepResults: Record<string, any>
  ): Promise<StepExecutionResult> {
    // Simulate data processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    return {
      success: true,
      result: { processed: true },
      duration: 2000
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected
      case 'not_equals':
        return value !== expected
      case 'greater_than':
        return value > expected
      case 'less_than':
        return value < expected
      case 'contains':
        return typeof value === 'string' && value.includes(expected)
      case 'exists':
        return value !== undefined && value !== null
      default:
        return false
    }
  }

  private updateWorkflowStatistics(workflow: ConversationalWorkflow, execution: WorkflowExecution): void {
    workflow.executionCount++
    
    if (execution.status === 'completed') {
      const successRate = (workflow.successRate * (workflow.executionCount - 1) + 1) / workflow.executionCount
      workflow.successRate = successRate
    } else {
      const successRate = (workflow.successRate * (workflow.executionCount - 1)) / workflow.executionCount
      workflow.successRate = successRate
    }

    const executionTime = execution.completedAt!.getTime() - execution.startedAt.getTime()
    workflow.averageExecutionTime = (workflow.averageExecutionTime * (workflow.executionCount - 1) + executionTime) / workflow.executionCount
    workflow.updatedAt = new Date()
  }

  private generateSuggestions(message: string): string[] {
    const suggestions: string[] = []
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('create') || lowerMessage.includes('make')) {
      suggestions.push('Create a knowledge base', 'Create a project', 'Create a persona')
    }
    if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      suggestions.push('Upload files to knowledge base', 'Upload documents')
    }
    if (lowerMessage.includes('analyze') || lowerMessage.includes('show')) {
      suggestions.push('Analyze my network', 'Show network visualization', 'Analyze connections')
    }
    if (lowerMessage.includes('project') || lowerMessage.includes('team')) {
      suggestions.push('Setup a new project', 'Create project with team')
    }

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }

  private generateParameterSuggestions(command: ConversationalCommand): string[] {
    return command.examples.slice(0, 3)
  }

  // Public methods
  public getAvailableCommands(): ConversationalCommand[] {
    return Array.from(this.commands.values())
  }

  public getCommandById(id: string): ConversationalCommand | undefined {
    return this.commands.get(id)
  }

  public getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(exec => exec.status === 'running')
  }

  public getExecutionById(id: string): WorkflowExecution | undefined {
    return this.executions.get(id)
  }

  public createCustomWorkflow(workflow: ConversationalWorkflow): void {
    this.workflows.set(workflow.id, workflow)
  }

  public createCustomCommand(command: ConversationalCommand): void {
    this.commands.set(command.id, command)
  }
}

// Supporting interfaces
interface WorkflowExecutionResult {
  success: boolean
  executionId?: string
  results?: Record<string, any>
  error?: string
  suggestions?: string[]
  duration?: number
}

interface StepExecutionResult {
  success: boolean
  result?: any
  error?: string
  duration: number
}

export { ConversationalWorkflowEngine }
