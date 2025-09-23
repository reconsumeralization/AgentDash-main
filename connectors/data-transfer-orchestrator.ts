/**
 * Data Transfer Orchestrator
 * Manages data flow between connectors and the modular architecture
 */

import { BaseConnector, DataPacket } from './base-connector'
import type { ConnectorConfig } from './base-connector'
import { LinkedInConnector, LinkedInCredentials } from './linkedin-connector'
import { AudioVideoConnector } from './audio-video-connector'
import { MessagingConnector } from './messaging-connector'
import { benignitasOrchestrator } from '../modules/benignitas-orchestrator'

export interface ConnectorRegistry {
  [key: string]: BaseConnector
}

export interface DataFlowRule {
  id: string
  name: string
  source: {
    connectorId: string
    packetType: string
    conditions?: Record<string, any>
  }
  destination: {
    connectorId: string
    moduleId: string
    transform?: {
      pipeline: any
      mapping: Record<string, string>
    }
  }
  priority: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  stats: {
    processed: number
    errors: number
    avgProcessingTime: number
  }
}

export interface TransferMetrics {
  totalPackets: number
  processedPackets: number
  failedPackets: number
  avgProcessingTime: number
  activeFlows: number
  connectorHealth: Record<string, 'healthy' | 'degraded' | 'unhealthy'>
}

export class DataTransferOrchestrator extends BaseConnector {
  private connectors: ConnectorRegistry = {}
  private flowRules: Map<string, DataFlowRule> = new Map()
  private packetQueue: DataPacket[] = []
  private isRunning = false

  constructor(config: ConnectorConfig) {
    super(config)
    this.initializeConnectors()
  }

  private metrics: TransferMetrics = {
    totalPackets: 0,
    processedPackets: 0,
    failedPackets: 0,
    avgProcessingTime: 0,
    activeFlows: 0,
    connectorHealth: {}
  }

  // Connector Management
  private async initializeConnectors(): Promise<void> {
    // LinkedIn Connector
    const linkedinConfig = {
      id: 'linkedin_connector',
      name: 'LinkedIn Integration',
      type: 'api' as const,
      direction: 'bidirectional' as const,
      protocol: 'http' as const,
      auth: { type: 'bearer' as const },
      rateLimit: { requests: 100, period: 60, strategy: 'fixed' as const },
      retry: { maxAttempts: 3, backoff: 'exponential' as const, baseDelay: 1000 },
      timeout: 30000,
      healthCheck: { enabled: true, interval: 300 }
    }

    const linkedinCredentials: LinkedInCredentials = {
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    }

    this.connectors.linkedin = new LinkedInConnector(linkedinConfig, linkedinCredentials)

    // Audio/Video Connector
    const audioConfig = {
      id: 'audio_video_connector',
      name: 'Audio/Video Processing',
      type: 'api' as const,
      direction: 'bidirectional' as const,
      protocol: 'http' as const,
      auth: { type: 'bearer' as const },
      rateLimit: { requests: 50, period: 60, strategy: 'fixed' as const },
      retry: { maxAttempts: 3, backoff: 'exponential' as const, baseDelay: 2000 },
      timeout: 60000,
      healthCheck: { enabled: true, interval: 300 }
    }

    this.connectors.audio_video = new AudioVideoConnector(audioConfig)

    // Messaging Connector
    const messagingConfig = {
      id: 'messaging_connector',
      name: 'Unified Messaging',
      type: 'api' as const,
      direction: 'bidirectional' as const,
      protocol: 'http' as const,
      auth: { type: 'bearer' as const },
      rateLimit: { requests: 200, period: 60, strategy: 'fixed' as const },
      retry: { maxAttempts: 3, backoff: 'exponential' as const, baseDelay: 1000 },
      timeout: 30000,
      healthCheck: { enabled: true, interval: 300 }
    }

    this.connectors.messaging = new MessagingConnector(messagingConfig)
  }

  private initializeFlowRules(): void {
    // Define data flow rules between connectors and modules
    const rules: DataFlowRule[] = [
      // LinkedIn to Communication Module
      {
        id: 'linkedin_to_communication',
        name: 'LinkedIn Messages to Communication',
        source: {
          connectorId: 'linkedin_connector',
          packetType: 'linkedin_message'
        },
        destination: {
          connectorId: 'communication-module',
          moduleId: 'communication-module',
          transform: {
            pipeline: {
              steps: [
                { type: 'enrich', config: { addContext: true } },
                { type: 'validate', config: { schema: 'linkedin_message' } }
              ]
            },
            mapping: {
              'payload.content': 'content',
              'payload.senderId': 'sender',
              'metadata.timestamp': 'timestamp'
            }
          }
        },
        priority: 'high',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Communication Module to LinkedIn
      {
        id: 'communication_to_linkedin',
        name: 'Communication to LinkedIn Messages',
        source: {
          connectorId: 'communication-module',
          packetType: 'outbound_message',
          conditions: { platform: 'linkedin' }
        },
        destination: {
          connectorId: 'linkedin_connector',
          moduleId: 'linkedin_connector'
        },
        priority: 'high',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Audio Processing Requests
      {
        id: 'communication_to_audio',
        name: 'Audio Processing Requests',
        source: {
          connectorId: 'communication-module',
          packetType: 'audio_request'
        },
        destination: {
          connectorId: 'audio_video_connector',
          moduleId: 'audio_video_connector'
        },
        priority: 'medium',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Audio Results to Communication
      {
        id: 'audio_to_communication',
        name: 'Audio Results to Communication',
        source: {
          connectorId: 'audio_video_connector',
          packetType: 'tts_job_completed'
        },
        destination: {
          connectorId: 'communication-module',
          moduleId: 'communication-module'
        },
        priority: 'medium',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Unified Messaging
      {
        id: 'messaging_unified',
        name: 'Unified Messaging Flow',
        source: {
          connectorId: 'messaging_connector',
          packetType: 'unified_message'
        },
        destination: {
          connectorId: 'communication-module',
          moduleId: 'communication-module'
        },
        priority: 'high',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Incoming Messages to Communication
      {
        id: 'incoming_to_communication',
        name: 'Incoming Messages to Communication',
        source: {
          connectorId: 'messaging_connector',
          packetType: 'incoming_message'
        },
        destination: {
          connectorId: 'communication-module',
          moduleId: 'communication-module'
        },
        priority: 'critical',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Product Spec Updates to Communication
      {
        id: 'product_to_communication',
        name: 'Product Updates to Communication',
        source: {
          connectorId: 'product-specification-module',
          packetType: 'product_update'
        },
        destination: {
          connectorId: 'communication-module',
          moduleId: 'communication-module'
        },
        priority: 'medium',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Integration Updates to Communication
      {
        id: 'integration_to_communication',
        name: 'Integration Updates to Communication',
        source: {
          connectorId: 'integration-architecture-module',
          packetType: 'integration_update'
        },
        destination: {
          connectorId: 'communication-module',
          moduleId: 'communication-module'
        },
        priority: 'medium',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Timeline Updates to Communication
      {
        id: 'timeline_to_communication',
        name: 'Timeline Updates to Communication',
        source: {
          connectorId: 'timeline-management-module',
          packetType: 'timeline_update'
        },
        destination: {
          connectorId: 'communication-module',
          moduleId: 'communication-module'
        },
        priority: 'low',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Infrastructure Alerts to Communication
      {
        id: 'infrastructure_to_communication',
        name: 'Infrastructure Alerts to Communication',
        source: {
          connectorId: 'infrastructure-module',
          packetType: 'infrastructure_alert',
          conditions: { severity: ['high', 'critical'] }
        },
        destination: {
          connectorId: 'communication-module',
          moduleId: 'communication-module'
        },
        priority: 'critical',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      },

      // Testing Results to Communication
      {
        id: 'testing_to_communication',
        name: 'Testing Results to Communication',
        source: {
          connectorId: 'testing-module',
          packetType: 'test_results'
        },
        destination: {
          connectorId: 'communication-module',
          moduleId: 'communication-module'
        },
        priority: 'medium',
        enabled: true,
        stats: { processed: 0, errors: 0, avgProcessingTime: 0 }
      }
    ]

    for (const rule of rules) {
      this.flowRules.set(rule.id, rule)
    }
  }

  // Core Orchestration Methods
  async start(): Promise<void> {
    console.log('Starting Data Transfer Orchestrator...')

    // Start all connectors
    for (const [id, connector] of Object.entries(this.connectors)) {
      try {
        await connector.start()
        console.log(`Started connector: ${id}`)
      } catch (error) {
        console.error(`Failed to start connector ${id}:`, error)
      }
    }

    this.isRunning = true
    this.startPacketProcessing()
    this.startHealthMonitoring()

    console.log('Data Transfer Orchestrator started successfully')
  }

  async stop(): Promise<void> {
    console.log('Stopping Data Transfer Orchestrator...')

    this.isRunning = false

    // Stop all connectors
    for (const [id, connector] of Object.entries(this.connectors)) {
      try {
        await connector.stop()
        console.log(`Stopped connector: ${id}`)
      } catch (error) {
        console.error(`Failed to stop connector ${id}:`, error)
      }
    }

    console.log('Data Transfer Orchestrator stopped')
  }

  // Packet Processing
  private startPacketProcessing(): void {
    const processPackets = async () => {
      if (!this.isRunning) return

      try {
        // Process packets from connectors
        for (const [connectorId, connector] of Object.entries(this.connectors)) {
          const packet = await connector.receive()
          if (packet) {
            this.packetQueue.push(packet)
          }
        }

        // Process queued packets
        while (this.packetQueue.length > 0) {
          const packet = this.packetQueue.shift()!
          await this.processPacket(packet)
        }

      } catch (error) {
        console.error('Error in packet processing:', error)
      }

      // Continue processing
      if (this.isRunning) {
        setTimeout(processPackets, 1000) // Process every second
      }
    }

    processPackets()
  }

  private async processPacket(packet: DataPacket): Promise<void> {
    const startTime = Date.now()
    this.metrics.totalPackets++

    try {
      // Find matching flow rules
      const matchingRules = Array.from(this.flowRules.values())
        .filter(rule =>
          rule.enabled &&
          rule.source.connectorId === packet.source &&
          rule.source.packetType === packet.type &&
          this.checkRuleConditions(rule, packet)
        )

      if (matchingRules.length === 0) {
        console.log(`No matching rules for packet: ${packet.type} from ${packet.source}`)
        return
      }

      // Process through matching rules
      for (const rule of matchingRules) {
        try {
          await this.executeFlowRule(rule, packet)
          rule.stats.processed++
        } catch (error) {
          rule.stats.errors++
          console.error(`Error executing rule ${rule.id}:`, error)
        }
      }

      this.metrics.processedPackets++

    } catch (error) {
      this.metrics.failedPackets++
      console.error('Error processing packet:', error)
    }

    // Update metrics
    const processingTime = Date.now() - startTime
    this.metrics.avgProcessingTime =
      (this.metrics.avgProcessingTime + processingTime) / 2
  }

  private checkRuleConditions(rule: DataFlowRule, packet: DataPacket): boolean {
    if (!rule.source.conditions) return true

    // Check conditions against packet data
    for (const [key, expectedValue] of Object.entries(rule.source.conditions)) {
      const actualValue = this.getNestedValue(packet, key)
      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(actualValue)) return false
      } else if (actualValue !== expectedValue) {
        return false
      }
    }

    return true
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private async executeFlowRule(rule: DataFlowRule, packet: DataPacket): Promise<void> {
    const startTime = Date.now()

    // Apply transformation if specified
    let transformedPacket = packet
    if (rule.destination.transform) {
      transformedPacket = await this.applyTransformation(packet, rule.destination.transform)
    }

    // Route to destination
    if (rule.destination.connectorId.startsWith('module-')) {
      // Send to module
      await this.sendToModule(rule.destination.moduleId, transformedPacket)
    } else {
      // Send to connector
      const connector = this.connectors[rule.destination.connectorId]
      if (connector) {
        await connector.send(transformedPacket)
      }
    }

    // Update rule stats
    const processingTime = Date.now() - startTime
    rule.stats.avgProcessingTime =
      (rule.stats.avgProcessingTime + processingTime) / 2
  }

  private async applyTransformation(packet: DataPacket, transform: any): Promise<DataPacket> {
    let transformed = { ...packet }

    // Apply transformation pipeline
    if (transform.pipeline) {
      for (const step of transform.pipeline.steps) {
        transformed = await this.applyTransformStep(transformed, step)
      }
    }

    // Apply field mapping
    if (transform.mapping) {
      transformed = this.applyFieldMapping(transformed, transform.mapping)
    }

    return transformed
  }

  private async applyTransformStep(packet: DataPacket, step: any): Promise<DataPacket> {
    // Implementation of transformation steps
    switch (step.type) {
      case 'enrich':
        return await this.enrichPacket(packet, step.config)
      case 'validate':
        this.validatePacket(packet, step.config)
        return packet
      case 'map':
        return this.mapPacketFields(packet, step.config)
      default:
        return packet
    }
  }

  private applyFieldMapping(packet: DataPacket, mapping: Record<string, string>): DataPacket {
    const mapped: any = {}

    for (const [sourcePath, destPath] of Object.entries(mapping)) {
      const value = this.getNestedValue(packet, sourcePath)
      this.setNestedValue(mapped, destPath, value)
    }

    return { ...packet, ...mapped }
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }

  private async enrichPacket(packet: DataPacket, config: any): Promise<DataPacket> {
    // Add enrichment logic based on config
    if (config.addContext) {
      const now = new Date();
      (packet.metadata as any).enrichedAt = now;
      (packet.metadata as any).orchestratorVersion = '1.0.0'
    }
    return packet
  }

  private validatePacket(packet: DataPacket, config: any): void {
    // Basic validation logic
    if (config.schema === 'linkedin_message') {
      if (!packet.payload?.content) {
        throw new Error('LinkedIn message missing content')
      }
    }
  }

  private mapPacketFields(packet: DataPacket, config: any): DataPacket {
    // Field mapping logic
    return packet
  }

  private async sendToModule(moduleId: string, packet: DataPacket): Promise<void> {
    // Route to appropriate module in the orchestrator
    switch (moduleId) {
      case 'communication-module':
        await this.sendToCommunicationModule(packet)
        break
      case 'product-specification-module':
        await this.sendToProductModule(packet)
        break
      case 'integration-architecture-module':
        await this.sendToIntegrationModule(packet)
        break
      case 'timeline-management-module':
        await this.sendToTimelineModule(packet)
        break
      case 'infrastructure-module':
        await this.sendToInfrastructureModule(packet)
        break
      case 'testing-module':
        await this.sendToTestingModule(packet)
        break
      default:
        console.warn(`Unknown module: ${moduleId}`)
    }
  }

  private async sendToCommunicationModule(packet: DataPacket): Promise<void> {
    const commModule = benignitasOrchestrator.getCommunicationModule()
    // Convert packet to communication item
    const communicationItem = {
      type: 'update' as const,
      title: `Data Transfer: ${packet.type}`,
      content: JSON.stringify(packet.payload),
      priority: packet.metadata.priority,
      stakeholders: ['system'], // Default stakeholders
      channel: 'system_notifications',
      requiresResponse: false
    }
    await commModule.sendCommunication(communicationItem)
  }

  private async sendToProductModule(packet: DataPacket): Promise<void> {
    // Implementation for product module
    console.log('Sending to product module:', packet.type)
  }

  private async sendToIntegrationModule(packet: DataPacket): Promise<void> {
    // Implementation for integration module
    console.log('Sending to integration module:', packet.type)
  }

  private async sendToTimelineModule(packet: DataPacket): Promise<void> {
    // Implementation for timeline module
    console.log('Sending to timeline module:', packet.type)
  }

  private async sendToInfrastructureModule(packet: DataPacket): Promise<void> {
    // Implementation for infrastructure module
    console.log('Sending to infrastructure module:', packet.type)
  }

  private async sendToTestingModule(packet: DataPacket): Promise<void> {
    // Implementation for testing module
    console.log('Sending to testing module:', packet.type)
  }

  // Health Monitoring
  private startHealthMonitoring(): void {
    setInterval(async () => {
      if (!this.isRunning) return

      // Check connector health
      for (const [id, connector] of Object.entries(this.connectors)) {
        try {
          const isHealthy = await connector.healthCheck()
          this.metrics.connectorHealth[id] = isHealthy ? 'healthy' : 'unhealthy'
        } catch (error) {
          this.metrics.connectorHealth[id] = 'unhealthy'
        }
      }

      // Update active flows count
      this.metrics.activeFlows = Array.from(this.flowRules.values())
        .filter(rule => rule.enabled).length

    }, 60000) // Check every minute
  }

  // Public API Methods
  async sendPacket(packet: DataPacket): Promise<void> {
    this.packetQueue.push(packet)
  }

  async getMetrics(): Promise<TransferMetrics> {
    return { ...this.metrics }
  }

  async getFlowRules(): Promise<DataFlowRule[]> {
    return Array.from(this.flowRules.values())
  }

  async enableFlowRule(ruleId: string): Promise<void> {
    const rule = this.flowRules.get(ruleId)
    if (rule) {
      rule.enabled = true
    }
  }

  async disableFlowRule(ruleId: string): Promise<void> {
    const rule = this.flowRules.get(ruleId)
    if (rule) {
      rule.enabled = false
    }
  }

  async addFlowRule(rule: DataFlowRule): Promise<void> {
    this.flowRules.set(rule.id, rule)
  }

  async getConnectorHealth(): Promise<Record<string, 'healthy' | 'degraded' | 'unhealthy'>> {
    return { ...this.metrics.connectorHealth }
  }

  // Utility method to send data from modules to connectors
  async routeFromModule(moduleId: string, packet: DataPacket): Promise<void> {
    // Find rules that match this module as source
    const matchingRules = Array.from(this.flowRules.values())
      .filter(rule =>
        rule.enabled &&
        rule.source.connectorId === moduleId &&
        rule.source.packetType === packet.type
      )

    for (const rule of matchingRules) {
      await this.executeFlowRule(rule, packet)
    }
  }

  // Implement abstract methods from BaseConnector
  async connect(): Promise<void> {
    this.isRunning = true
    // Initialize orchestrator-specific connection logic
  }

  async disconnect(): Promise<void> {
    this.isRunning = false
    // Cleanup orchestrator-specific resources
  }

  async send(packet: DataPacket): Promise<void> {
    // Route packet through the orchestrator
    await this.routePacket(packet)
  }

  private async routePacket(packet: DataPacket): Promise<void> {
    // Find appropriate connector based on packet destination/routing rules
    const targetConnectorId = this.determineTargetConnector(packet)

    if (targetConnectorId && this.connectors[targetConnectorId]) {
      const connector = this.connectors[targetConnectorId]

      // Apply transformations if needed
      const transformedPacket = await this.applyTransformations(packet)

      // Send through connector
      await connector.send(transformedPacket)
    } else {
      // Queue packet for later processing or handle error
      this.packetQueue.push(packet)
    }
  }

  private determineTargetConnector(packet: DataPacket): string | null {
    // Simple routing logic - can be enhanced with complex rules
    if (packet.destination.includes('linkedin')) return 'linkedin'
    if (packet.destination.includes('audio') || packet.destination.includes('video')) return 'audio_video'
    if (packet.destination.includes('message') || packet.destination.includes('slack')) return 'messaging'

    return null
  }

  private async applyTransformations(packet: DataPacket): Promise<DataPacket> {
    // Apply any configured transformations
    return packet
  }

  async receive(): Promise<DataPacket | null> {
    // Return next packet from queue
    return this.packetQueue.shift() || null
  }
}

// Export singleton instance (will be initialized with config when needed)
export let dataTransferOrchestrator: DataTransferOrchestrator

export function initializeDataTransferOrchestrator(config: ConnectorConfig): DataTransferOrchestrator {
  dataTransferOrchestrator = new DataTransferOrchestrator(config)
  return dataTransferOrchestrator
}
