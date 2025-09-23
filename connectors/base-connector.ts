/**
 * Base Connector Infrastructure
 * Core interfaces and utilities for data connectors
 */

export interface ConnectorConfig {
  id: string
  name: string
  type: 'api' | 'webhook' | 'stream' | 'batch' | 'file' | 'database'
  direction: 'inbound' | 'outbound' | 'bidirectional'
  protocol: 'http' | 'websocket' | 'mqtt' | 'grpc' | 'ftp' | 's3' | 'database'
  auth: {
    type: 'none' | 'basic' | 'bearer' | 'oauth' | 'api_key' | 'certificate'
    credentials?: Record<string, any>
  }
  rateLimit?: {
    requests: number
    period: number // seconds
    strategy: 'fixed' | 'sliding' | 'token_bucket'
  }
  retry: {
    maxAttempts: number
    backoff: 'linear' | 'exponential' | 'fibonacci'
    baseDelay: number // milliseconds
  }
  timeout: number // milliseconds
  healthCheck: {
    enabled: boolean
    interval: number // seconds
    endpoint?: string
  }
}

export interface DataPacket {
  id: string
  source: string
  destination: string
  type: string
  format: 'json' | 'xml' | 'binary' | 'text' | 'multipart'
  schema?: any // JSON schema or type definition
  payload: any
  metadata: {
    timestamp: Date
    correlationId: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    ttl?: number // time to live in seconds
    tags: string[]
    headers?: Record<string, string>
  }
  routing: {
    path: string[]
    nextHop?: string
    finalDestination: string
  }
}

export interface ConnectionStatus {
  connectorId: string
  status: 'connected' | 'disconnected' | 'connecting' | 'error' | 'maintenance'
  lastConnected?: Date
  lastDisconnected?: Date
  uptime: number // percentage
  errorCount: number
  lastError?: {
    message: string
    code: string
    timestamp: Date
  }
  metrics: {
    messagesSent: number
    messagesReceived: number
    bytesTransferred: number
    averageLatency: number
    errorRate: number
  }
}

export interface TransformPipeline {
  id: string
  name: string
  steps: Array<{
    type: 'map' | 'filter' | 'validate' | 'enrich' | 'aggregate' | 'split' | 'merge'
    config: any
    condition?: string // conditional execution
  }>
  inputSchema?: any
  outputSchema?: any
  errorHandling: {
    onError: 'skip' | 'retry' | 'dead_letter' | 'transform'
    deadLetterQueue?: string
  }
}

export abstract class BaseConnector<T = void> {
  protected config: ConnectorConfig
  protected status: ConnectionStatus
  protected transformPipeline?: TransformPipeline

  constructor(config: ConnectorConfig) {
    this.config = config
    this.status = {
      connectorId: config.id,
      status: 'disconnected',
      uptime: 0,
      errorCount: 0,
      metrics: {
        messagesSent: 0,
        messagesReceived: 0,
        bytesTransferred: 0,
        averageLatency: 0,
        errorRate: 0
      }
    }
  }

  // Core connector methods
  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract send(packet: DataPacket): Promise<T>
  abstract receive(): Promise<DataPacket | null>

  // Health and monitoring
  async getStatus(): Promise<ConnectionStatus> {
    return this.status
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Default implementation - override in subclasses
      return this.status.status === 'connected'
    } catch (error) {
      this.updateStatus('error', error as Error)
      return false
    }
  }

  // Data transformation
  setTransformPipeline(pipeline: TransformPipeline): void {
    this.transformPipeline = pipeline
  }

  protected async transformData(packet: DataPacket): Promise<DataPacket> {
    if (!this.transformPipeline) {
      return packet
    }

    let transformedPacket = { ...packet }

    for (const step of this.transformPipeline.steps) {
      try {
        transformedPacket = await this.executeTransformStep(transformedPacket, step)
      } catch (error) {
        if (this.transformPipeline.errorHandling.onError === 'dead_letter') {
          await this.sendToDeadLetterQueue(transformedPacket, error as Error)
          throw error
        }
        // Continue with other error handling strategies
      }
    }

    return transformedPacket
  }

  private async executeTransformStep(packet: DataPacket, step: TransformPipeline['steps'][0]): Promise<DataPacket> {
    switch (step.type) {
      case 'map':
        return this.mapData(packet, step.config)
      case 'filter':
        return this.filterData(packet, step.config) ? packet : null as any
      case 'validate':
        this.validateData(packet, step.config)
        return packet
      case 'enrich':
        return await this.enrichData(packet, step.config)
      case 'aggregate':
        return await this.aggregateData(packet, step.config)
      case 'split':
        // Handle splitting logic
        return packet
      case 'merge':
        // Handle merging logic
        return packet
      default:
        return packet
    }
  }

  protected mapData(packet: DataPacket, config: any): DataPacket {
    // Default mapping implementation
    if (config.fieldMapping) {
      const mappedPayload = { ...packet.payload }
      for (const [source, target] of Object.entries(config.fieldMapping)) {
        if (mappedPayload[source]) {
          mappedPayload[target as string] = mappedPayload[source]
          delete mappedPayload[source]
        }
      }
      return { ...packet, payload: mappedPayload }
    }
    return packet
  }

  protected filterData(packet: DataPacket, config: any): boolean {
    // Default filtering logic
    if (config.condition) {
      // Simple condition evaluation
      return this.evaluateCondition(packet, config.condition)
    }
    return true
  }

  protected validateData(packet: DataPacket, config: any): void {
    // Default validation logic
    if (config.schema) {
      this.validateAgainstSchema(packet.payload, config.schema)
    }
  }

  protected async enrichData(packet: DataPacket, config: any): Promise<DataPacket> {
    // Default enrichment - override in subclasses
    return packet
  }

  protected async aggregateData(packet: DataPacket, config: any): Promise<DataPacket> {
    // Default aggregation - override in subclasses
    return packet
  }

  // Utility methods
  protected updateStatus(status: ConnectionStatus['status'], error?: Error): void {
    this.status.status = status
    this.status.lastError = error ? {
      message: error.message,
      code: error.name,
      timestamp: new Date()
    } : undefined

    if (status === 'connected') {
      this.status.lastConnected = new Date()
    } else if (status === 'disconnected' || status === 'error') {
      this.status.lastDisconnected = new Date()
    }

    if (error) {
      this.status.errorCount++
    }
  }

  protected updateMetrics(sent: boolean, bytes: number, latency: number): void {
    if (sent) {
      this.status.metrics.messagesSent++
    } else {
      this.status.metrics.messagesReceived++
    }

    this.status.metrics.bytesTransferred += bytes
    this.status.metrics.averageLatency =
      (this.status.metrics.averageLatency + latency) / 2

    const totalMessages = this.status.metrics.messagesSent + this.status.metrics.messagesReceived
    this.status.metrics.errorRate = totalMessages > 0 ? this.status.errorCount / totalMessages : 0
  }

  private evaluateCondition(packet: DataPacket, condition: string): boolean {
    // Simple condition evaluator - in production, use a proper expression engine
    try {
      // Support basic conditions like "payload.status == 'active'"
      const context = { packet, payload: packet.payload, metadata: packet.metadata }
      return new Function('context', `return ${condition}`)(context)
    } catch {
      return false
    }
  }

  private validateAgainstSchema(data: any, schema: any): void {
    // Basic schema validation - in production, use a proper validator
    if (schema.type === 'object' && typeof data !== 'object') {
      throw new Error('Data does not match schema type')
    }
    // Add more validation logic as needed
  }

  private async sendToDeadLetterQueue(packet: DataPacket, error: Error): Promise<void> {
    // Implementation would send to configured dead letter queue
    console.error(`Sending to dead letter queue: ${packet.id}`, error)
  }

  // Lifecycle methods
  async start(): Promise<void> {
    await this.connect()

    if (this.config.healthCheck.enabled) {
      this.startHealthChecks()
    }
  }

  async stop(): Promise<void> {
    await this.disconnect()
  }

  private startHealthChecks(): void {
    setInterval(async () => {
      const healthy = await this.healthCheck()
      if (!healthy && this.status.status === 'connected') {
        this.updateStatus('error')
        // Attempt reconnection
        try {
          await this.connect()
        } catch (error) {
          console.error(`Failed to reconnect ${this.config.id}:`, error)
        }
      }
    }, this.config.healthCheck.interval * 1000)
  }
}
