/**
 * Standardized Integration Framework
 * Unified approach to 3rd party integrations with consistent interfaces
 */

import { BaseConnector, DataPacket, ConnectorConfig } from '@/connectors/base-connector'
import { ConnectorFactory } from '@/connectors/connector-factory'

export interface IntegrationDefinition {
  id: string
  name: string
  category: 'communication' | 'productivity' | 'analytics' | 'storage' | 'ai' | 'social' | 'finance' | 'development'
  description: string
  icon: string
  authType: 'oauth' | 'api_key' | 'basic' | 'bearer' | 'none'
  requiredScopes: string[]
  endpoints: {
    baseUrl: string
    auth?: string
    api?: string
  }
  rateLimits: {
    requests: number
    period: number
    strategy: 'fixed' | 'sliding' | 'token_bucket'
  }
  webhooks?: {
    supported: boolean
    signature?: string
  }
  dataMappings: {
    [key: string]: {
      source: string
      target: string
      transform?: (value: any) => any
    }
  }
}

export interface IntegrationInstance {
  id: string
  definitionId: string
  name: string
  config: ConnectorConfig
  credentials: any
  status: 'active' | 'inactive' | 'error' | 'maintenance'
  lastSync?: Date
  errorCount: number
  metrics: {
    requests: number
    errors: number
    latency: number
  }
  webhooks: {
    enabled: boolean
    endpoint?: string
    secret?: string
  }
}

export interface IntegrationWorkflow {
  id: string
  name: string
  description: string
  trigger: {
    integrationId: string
    event: string
    conditions?: Record<string, any>
  }
  actions: Array<{
    integrationId: string
    action: string
    parameters: Record<string, any>
  }>
  enabled: boolean
  lastExecuted?: Date
  successCount: number
  errorCount: number
}

export class IntegrationFramework {
  private definitions: Map<string, IntegrationDefinition> = new Map()
  private instances: Map<string, IntegrationInstance> = new Map()
  private workflows: Map<string, IntegrationWorkflow> = new Map()
  private connectors: Map<string, BaseConnector> = new Map()

  constructor() {
    this.registerBuiltInIntegrations()
  }

  /**
   * Register a new integration definition
   */
  registerIntegration(definition: IntegrationDefinition): void {
    this.definitions.set(definition.id, definition)
    console.log(`Registered integration: ${definition.name} (${definition.id})`)
  }

  /**
   * Create a new integration instance
   */
  async createInstance(
    definitionId: string,
    name: string,
    credentials: any,
    config: Partial<ConnectorConfig> = {}
  ): Promise<IntegrationInstance> {
    const definition = this.definitions.get(definitionId)
    if (!definition) {
      throw new Error(`Integration definition not found: ${definitionId}`)
    }

    const instanceId = `${definitionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const instance: IntegrationInstance = {
      id: instanceId,
      definitionId,
      name,
      config: {
        id: instanceId,
        name,
        type: 'api',
        direction: 'bidirectional',
        protocol: 'http',
        auth: { type: definition.authType },
        rateLimit: definition.rateLimits,
        retry: { maxAttempts: 3, backoff: 'exponential', baseDelay: 1000 },
        timeout: 30000,
        healthCheck: { enabled: true, interval: 300 },
        ...config
      },
      credentials,
      status: 'inactive',
      errorCount: 0,
      metrics: {
        requests: 0,
        errors: 0,
        latency: 0
      },
      webhooks: {
        enabled: false
      }
    }

    this.instances.set(instanceId, instance)

    // Create and initialize connector
    try {
      const connector = await this.createConnector(instance)
      this.connectors.set(instanceId, connector)
      instance.status = 'active'
    } catch (error) {
      console.error(`Failed to create connector for ${instanceId}:`, error)
      instance.status = 'error'
    }

    return instance
  }

  /**
   * Execute an integration action
   */
  async executeAction(
    instanceId: string,
    action: string,
    parameters: Record<string, any> = {}
  ): Promise<any> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Integration instance not found: ${instanceId}`)
    }

    const connector = this.connectors.get(instanceId)
    if (!connector) {
      throw new Error(`Connector not found for instance: ${instanceId}`)
    }

    const startTime = Date.now()

    try {
      // Create data packet for the action
      const packet: DataPacket = {
        id: `action-${Date.now()}`,
        source: 'integration-framework',
        destination: instance.definitionId,
        type: action,
        format: 'json',
        payload: {
          action,
          parameters,
          instance: instance
        },
        metadata: {
          timestamp: new Date(),
          correlationId: `corr-${Date.now()}`,
          priority: 'medium',
          tags: ['integration', instance.definitionId],
          headers: {}
        },
        routing: {
          path: [instance.definitionId],
          finalDestination: instance.definitionId
        }
      }

      // Execute the action
      await connector.send(packet)

      // Update metrics
      instance.metrics.requests++
      const latency = Date.now() - startTime
      instance.metrics.latency = (instance.metrics.latency + latency) / 2

      return { success: true, latency }

    } catch (error) {
      instance.metrics.errors++
      instance.errorCount++
      console.error(`Integration action failed for ${instanceId}:`, error)
      throw error
    }
  }

  /**
   * Create a workflow between integrations
   */
  createWorkflow(workflow: Omit<IntegrationWorkflow, 'id' | 'successCount' | 'errorCount'>): IntegrationWorkflow {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newWorkflow: IntegrationWorkflow = {
      id: workflowId,
      ...workflow,
      successCount: 0,
      errorCount: 0
    }

    this.workflows.set(workflowId, newWorkflow)
    return newWorkflow
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, triggerData?: any): Promise<void> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow || !workflow.enabled) {
      throw new Error(`Workflow not found or disabled: ${workflowId}`)
    }

    try {
      // Check trigger conditions
      if (!this.checkWorkflowConditions(workflow, triggerData)) {
        return
      }

      // Execute actions sequentially
      for (const action of workflow.actions) {
        await this.executeAction(action.integrationId, action.action, action.parameters)
      }

      workflow.successCount++
      workflow.lastExecuted = new Date()

    } catch (error) {
      workflow.errorCount++
      console.error(`Workflow execution failed for ${workflowId}:`, error)
      throw error
    }
  }

  /**
   * Get integration analytics
   */
  getAnalytics(): {
    totalIntegrations: number
    activeIntegrations: number
    totalWorkflows: number
    activeWorkflows: number
    errorRate: number
    avgLatency: number
    topIntegrations: Array<{ id: string; requests: number }>
  } {
    const instances = Array.from(this.instances.values())
    const workflows = Array.from(this.workflows.values())

    const totalRequests = instances.reduce((sum, inst) => sum + inst.metrics.requests, 0)
    const totalErrors = instances.reduce((sum, inst) => sum + inst.metrics.errors, 0)
    const avgLatency = instances.length > 0
      ? instances.reduce((sum, inst) => sum + inst.metrics.latency, 0) / instances.length
      : 0

    const topIntegrations = instances
      .sort((a, b) => b.metrics.requests - a.metrics.requests)
      .slice(0, 5)
      .map(inst => ({ id: inst.id, requests: inst.metrics.requests }))

    return {
      totalIntegrations: instances.length,
      activeIntegrations: instances.filter(inst => inst.status === 'active').length,
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(wf => wf.enabled).length,
      errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
      avgLatency,
      topIntegrations
    }
  }

  /**
   * Health check for all integrations
   */
  async healthCheck(): Promise<Record<string, 'healthy' | 'degraded' | 'unhealthy'>> {
    const health: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {}

    for (const [instanceId, connector] of this.connectors) {
      try {
        const isHealthy = await connector.healthCheck()
        health[instanceId] = isHealthy ? 'healthy' : 'unhealthy'
      } catch {
        health[instanceId] = 'unhealthy'
      }
    }

    return health
  }

  private async createConnector(instance: IntegrationInstance): Promise<BaseConnector> {
    // Use the existing connector factory
    return ConnectorFactory.create({
      type: 'api', // Generic API connector for now
      config: instance.config,
      credentials: instance.credentials
    })
  }

  private checkWorkflowConditions(workflow: IntegrationWorkflow, triggerData?: any): boolean {
    if (!workflow.trigger.conditions || !triggerData) {
      return true
    }

    // Check if trigger data matches conditions
    for (const [key, expectedValue] of Object.entries(workflow.trigger.conditions)) {
      const actualValue = this.getNestedValue(triggerData, key)
      if (actualValue !== expectedValue) {
        return false
      }
    }

    return true
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private registerBuiltInIntegrations(): void {
    // Register common integrations
    this.registerIntegration({
      id: 'github',
      name: 'GitHub',
      category: 'development',
      description: 'Repository management and CI/CD integration',
      icon: 'github',
      authType: 'oauth',
      requiredScopes: ['repo', 'workflow'],
      endpoints: {
        baseUrl: 'https://api.github.com',
        auth: 'https://github.com/login/oauth/authorize'
      },
      rateLimits: {
        requests: 5000,
        period: 3600,
        strategy: 'sliding'
      },
      webhooks: {
        supported: true,
        signature: 'X-Hub-Signature-256'
      },
      dataMappings: {
        repository: {
          source: 'repository.full_name',
          target: 'repo_name'
        },
        commit: {
          source: 'head_commit.message',
          target: 'commit_message'
        }
      }
    })

    this.registerIntegration({
      id: 'slack',
      name: 'Slack',
      category: 'communication',
      description: 'Team communication and notifications',
      icon: 'slack',
      authType: 'oauth',
      requiredScopes: ['channels:read', 'chat:write', 'users:read'],
      endpoints: {
        baseUrl: 'https://slack.com/api',
        auth: 'https://slack.com/oauth/v2/authorize'
      },
      rateLimits: {
        requests: 100,
        period: 60,
        strategy: 'fixed'
      },
      webhooks: {
        supported: true,
        signature: 'X-Slack-Signature'
      },
      dataMappings: {
        message: {
          source: 'event.text',
          target: 'message_text'
        },
        user: {
          source: 'event.user',
          target: 'user_id'
        }
      }
    })

    this.registerIntegration({
      id: 'openai',
      name: 'OpenAI',
      category: 'ai',
      description: 'AI model access and completions',
      icon: 'brain',
      authType: 'bearer',
      requiredScopes: [],
      endpoints: {
        baseUrl: 'https://api.openai.com/v1'
      },
      rateLimits: {
        requests: 100,
        period: 60,
        strategy: 'token_bucket'
      },
      dataMappings: {
        completion: {
          source: 'choices[0].text',
          target: 'generated_text'
        },
        usage: {
          source: 'usage.total_tokens',
          target: 'tokens_used'
        }
      }
    })

    this.registerIntegration({
      id: 'stripe',
      name: 'Stripe',
      category: 'finance',
      description: 'Payment processing and subscriptions',
      icon: 'credit-card',
      authType: 'bearer',
      requiredScopes: [],
      endpoints: {
        baseUrl: 'https://api.stripe.com/v1'
      },
      rateLimits: {
        requests: 100,
        period: 60,
        strategy: 'fixed'
      },
      webhooks: {
        supported: true,
        signature: 'Stripe-Signature'
      },
      dataMappings: {
        payment: {
          source: 'data.object.amount',
          target: 'payment_amount',
          transform: (value: number) => value / 100 // Convert cents to dollars
        },
        customer: {
          source: 'data.object.customer',
          target: 'customer_id'
        }
      }
    })

    this.registerIntegration({
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      description: 'Document and knowledge base integration',
      icon: 'file-text',
      authType: 'bearer',
      requiredScopes: [],
      endpoints: {
        baseUrl: 'https://api.notion.com/v1'
      },
      rateLimits: {
        requests: 3,
        period: 1,
        strategy: 'fixed'
      },
      dataMappings: {
        page: {
          source: 'properties.title.title[0].plain_text',
          target: 'page_title'
        },
        content: {
          source: 'properties.content.rich_text[0].plain_text',
          target: 'page_content'
        }
      }
    })
  }
}

// Singleton instance
export const integrationFramework = new IntegrationFramework()
