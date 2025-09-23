/**
 * Data Flow Orchestrator
 * Manages complex data flows between multiple connectors and systems
 */

import { BaseConnector, DataPacket } from '@/connectors'
import { ConnectorFactory } from '@/connectors/connector-factory'
import { ConnectorRegistry } from '@/connectors/connector-registry'

export interface DataFlow {
  id: string
  name: string
  description: string
  sourceConnector: string
  targetConnectors: string[]
  transformation?: {
    type: 'map' | 'filter' | 'aggregate' | 'split' | 'merge'
    config: any
  }
  routing: {
    strategy: 'broadcast' | 'round-robin' | 'priority' | 'conditional'
    conditions?: Array<{
      field: string
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
      value: any
      targetConnector: string
    }>
  }
  errorHandling: {
    onFailure: 'skip' | 'retry' | 'dead_letter' | 'compensate'
    maxRetries: number
    backoffStrategy: 'linear' | 'exponential'
  }
  monitoring: {
    enabled: boolean
    metrics: string[]
    alerts: Array<{
      condition: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      notification: string
    }>
  }
  schedule?: {
    type: 'once' | 'recurring' | 'event-driven'
    cron?: string
    interval?: number
    eventType?: string
  }
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FlowExecution {
  id: string
  flowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt?: Date
  completedAt?: Date
  progress: number
  processedPackets: number
  successfulPackets: number
  failedPackets: number
  errors: Array<{
    packetId: string
    error: string
    timestamp: Date
    retryCount: number
  }>
  metrics: {
    throughput: number // packets per second
    latency: number // average processing time
    successRate: number // percentage
  }
}

export class DataFlowOrchestrator {
  private flows = new Map<string, DataFlow>()
  private executions = new Map<string, FlowExecution>()
  private activeFlows = new Set<string>()

  // Flow management
  createFlow(flow: Omit<DataFlow, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newFlow: DataFlow = {
      ...flow,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.flows.set(id, newFlow)
    return id
  }

  updateFlow(id: string, updates: Partial<DataFlow>): void {
    const flow = this.flows.get(id)
    if (flow) {
      this.flows.set(id, { ...flow, ...updates, updatedAt: new Date() })
    }
  }

  deleteFlow(id: string): boolean {
    return this.flows.delete(id)
  }

  getFlow(id: string): DataFlow | undefined {
    return this.flows.get(id)
  }

  getAllFlows(): DataFlow[] {
    return Array.from(this.flows.values())
  }

  getActiveFlows(): DataFlow[] {
    return Array.from(this.flows.values()).filter(flow => flow.active)
  }

  // Flow execution
  async executeFlow(flowId: string, inputData?: any): Promise<string> {
    const flow = this.flows.get(flowId)
    if (!flow) {
      throw new Error(`Flow ${flowId} not found`)
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const execution: FlowExecution = {
      id: executionId,
      flowId,
      status: 'running',
      startedAt: new Date(),
      progress: 0,
      processedPackets: 0,
      successfulPackets: 0,
      failedPackets: 0,
      errors: [],
      metrics: {
        throughput: 0,
        latency: 0,
        successRate: 0
      }
    }

    this.executions.set(executionId, execution)
    this.activeFlows.add(executionId)

    try {
      await this.processFlow(flow, execution, inputData)
      execution.status = 'completed'
      execution.completedAt = new Date()
      execution.progress = 100
    } catch (error) {
      execution.status = 'failed'
      execution.completedAt = new Date()
      execution.errors.push({
        packetId: 'flow-error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retryCount: 0
      })
    } finally {
      this.activeFlows.delete(executionId)
    }

    return executionId
  }

  private async processFlow(flow: DataFlow, execution: FlowExecution, inputData?: any): Promise<void> {
    const sourceConnector = ConnectorRegistry.get(flow.sourceConnector as any)
    if (!sourceConnector) {
      throw new Error(`Source connector ${flow.sourceConnector} not found`)
    }

    // Get data from source
    let packets: DataPacket[] = []

    if (inputData) {
      // Use provided input data
      packets = Array.isArray(inputData) ? inputData : [inputData]
    } else {
      // Pull data from source connector
      const connector = ConnectorFactory.create({
        type: sourceConnector.type,
        config: sourceConnector.configTemplate
      })

      // This would need to be implemented based on connector capabilities
      // For now, we'll simulate
      packets = await this.simulateDataPull(connector)
    }

    // Process packets through transformation
    if (flow.transformation) {
      packets = packets.map(packet => this.transformPacket(packet, flow.transformation!))
    }

    // Route to target connectors
    const routingPromises = packets.map(packet =>
      this.routePacket(packet, flow, execution)
    )

    await Promise.allSettled(routingPromises)

    // Update execution metrics
    execution.processedPackets = packets.length
    execution.successfulPackets = packets.length - execution.failedPackets
    execution.metrics.successRate = (execution.successfulPackets / execution.processedPackets) * 100
  }

  private transformPacket(packet: DataPacket, transformation: DataFlow['transformation']): DataPacket {
    if (!transformation) return packet

    let transformedPayload = { ...packet.payload }

    switch (transformation.type) {
      case 'map':
        if (transformation.config.fieldMapping) {
          for (const [source, target] of Object.entries(transformation.config.fieldMapping)) {
            if (transformedPayload[source]) {
              transformedPayload[target as string] = transformedPayload[source]
              delete transformedPayload[source]
            }
          }
        }
        break

      case 'filter':
        if (transformation.config.condition) {
          // Simple filtering logic
          const shouldKeep = this.evaluateCondition(transformedPayload, transformation.config.condition)
          if (!shouldKeep) {
            return null as any // Will be filtered out
          }
        }
        break

      case 'aggregate':
        // Basic aggregation - would need more sophisticated implementation
        transformedPayload = this.aggregateData([transformedPayload], transformation.config)
        break
    }

    return { ...packet, payload: transformedPayload }
  }

  private async routePacket(packet: DataPacket, flow: DataFlow, execution: FlowExecution): Promise<void> {
    const targetConnectors = this.determineTargets(packet, flow)

    const sendPromises = targetConnectors.map(async (targetId) => {
      try {
        const targetDefinition = ConnectorRegistry.get(targetId as any)
        if (!targetDefinition) {
          throw new Error(`Target connector ${targetId} not found`)
        }

        const targetConnector = ConnectorFactory.create({
          type: targetDefinition.type,
          config: targetDefinition.configTemplate
        })

        await targetConnector.send(packet)
      } catch (error) {
        execution.failedPackets++
        execution.errors.push({
          packetId: packet.id,
          error: error instanceof Error ? error.message : 'Send failed',
          timestamp: new Date(),
          retryCount: 0
        })
      }
    })

    await Promise.allSettled(sendPromises)
  }

  private determineTargets(packet: DataPacket, flow: DataFlow): string[] {
    switch (flow.routing.strategy) {
      case 'broadcast':
        return flow.targetConnectors

      case 'round-robin':
        // Simple round-robin implementation
        const index = Math.floor(Math.random() * flow.targetConnectors.length)
        return [flow.targetConnectors[index]]

      case 'conditional':
        if (flow.routing.conditions) {
          for (const condition of flow.routing.conditions) {
            if (this.evaluateCondition(packet.payload, condition)) {
              return [condition.targetConnector]
            }
          }
        }
        return flow.targetConnectors

      default:
        return flow.targetConnectors
    }
  }

  private evaluateCondition(data: any, condition: any): boolean {
    try {
      // Simple condition evaluation - in production, use a proper expression engine
      const context = { data, payload: data }
      return new Function('context', `return ${condition}`)(context)
    } catch {
      return false
    }
  }

  private aggregateData(data: any[], config: any): any {
    // Basic aggregation implementation
    if (config.groupBy && config.aggregations) {
      const groups = new Map()

      for (const item of data) {
        const key = item[config.groupBy]
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key).push(item)
      }

      const result: any[] = []
      for (const [key, items] of groups) {
        const aggregated: any = { [config.groupBy]: key }

        for (const [field, operation] of Object.entries(config.aggregations)) {
          switch (operation) {
            case 'sum':
              aggregated[field] = items.reduce((sum: number, item: Record<string, any>) => sum + (item[field] || 0), 0)
              break
            case 'avg':
              aggregated[field] = items.reduce((sum: number, item: Record<string, any>) => sum + (item[field] || 0), 0) / items.length
              break
            case 'count':
              aggregated[field] = items.length
              break
            case 'max':
              aggregated[field] = Math.max(...items.map((item: Record<string, any>) => item[field] || 0))
              break
            case 'min':
              aggregated[field] = Math.min(...items.map((item: Record<string, any>) => item[field] || 0))
              break
          }
        }

        result.push(aggregated)
      }

      return result
    }

    return data
  }

  private async simulateDataPull(connector: BaseConnector): Promise<DataPacket[]> {
    // Simulate pulling data from a connector
    // In production, this would call the connector's receive method
    return []
  }

  // Monitoring and analytics
  getFlowMetrics(): {
    totalFlows: number
    activeFlows: number
    completedExecutions: number
    failedExecutions: number
    averageThroughput: number
  } {
    const executions = Array.from(this.executions.values())
    const completed = executions.filter(e => e.status === 'completed')
    const failed = executions.filter(e => e.status === 'failed')

    return {
      totalFlows: this.flows.size,
      activeFlows: this.activeFlows.size,
      completedExecutions: completed.length,
      failedExecutions: failed.length,
      averageThroughput: completed.length > 0
        ? completed.reduce((sum, e) => sum + e.metrics.throughput, 0) / completed.length
        : 0
    }
  }

  getExecutionStatus(executionId: string): FlowExecution | undefined {
    return this.executions.get(executionId)
  }

  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId)
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled'
      execution.completedAt = new Date()
      this.activeFlows.delete(executionId)
      return true
    }
    return false
  }
}

// Pre-configured data flows for common use cases
export const PREDEFINED_FLOWS = {
  linkedinContactSync: {
    name: 'LinkedIn Contact Synchronization',
    description: 'Sync LinkedIn connections with DefConect contact database',
    sourceConnector: 'linkedin',
    targetConnectors: ['defconect-db'],
    transformation: {
      type: 'map',
      config: {
        fieldMapping: {
          'name': 'fullName',
          'headline': 'jobTitle',
          'company': 'organization'
        }
      }
    },
    routing: {
      strategy: 'broadcast'
    },
    errorHandling: {
      onFailure: 'retry',
      maxRetries: 3,
      backoffStrategy: 'exponential'
    },
    monitoring: {
      enabled: true,
      metrics: ['throughput', 'latency', 'success_rate'],
      alerts: [
        {
          condition: 'success_rate < 95',
          severity: 'medium',
          notification: 'LinkedIn contact sync success rate dropped below 95%'
        }
      ]
    },
    schedule: {
      type: 'recurring',
      interval: 3600000 // 1 hour
    },
    active: true
  },

  crossPlatformEngagement: {
    name: 'Cross-Platform Engagement Sync',
    description: 'Sync engagement data across all social platforms',
    sourceConnector: 'analytics-aggregator',
    targetConnectors: ['linkedin', 'twitter', 'facebook'],
    transformation: {
      type: 'aggregate',
      config: {
        groupBy: 'platform',
        aggregations: {
          'engagement': 'sum',
          'reach': 'sum',
          'conversions': 'count'
        }
      }
    },
    routing: {
      strategy: 'conditional',
      conditions: [
        {
          field: 'platform',
          operator: 'equals',
          value: 'linkedin',
          targetConnector: 'linkedin'
        }
      ]
    },
    errorHandling: {
      onFailure: 'dead_letter',
      maxRetries: 2,
      backoffStrategy: 'linear'
    },
    monitoring: {
      enabled: true,
      metrics: ['throughput', 'latency'],
      alerts: []
    },
    schedule: {
      type: 'recurring',
      interval: 1800000 // 30 minutes
    },
    active: true
  }
} as const
