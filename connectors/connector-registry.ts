/**
 * Connector Registry
 * Central registry for all available connectors and their configurations
 */

import { ConnectorType, ConnectorFactory, CONNECTOR_TEMPLATES } from './connector-factory'
import type { ConnectorConfig } from './base-connector'
import { DocumentProcessorConnector, DocumentProcessingConfig } from './document-processor-connector'
import { GuidanceConnector, GuidanceConnectorConfig } from './guidance-connector'

export interface ConnectorDefinition {
  type: ConnectorType
  name: string
  description: string
  category: 'social' | 'communication' | 'productivity' | 'analytics' | 'development' | 'business' | 'storage' | 'integration'
  icon: string
  capabilities: string[]
  configTemplate: ConnectorConfig
  requiredCredentials: string[]
  documentation?: string
}

export class ConnectorRegistryManager {
  private static definitions = new Map<ConnectorType, ConnectorDefinition>()

  static register(definition: ConnectorDefinition): void {
    this.definitions.set(definition.type, definition)
  }

  static get(type: ConnectorType): ConnectorDefinition | undefined {
    return this.definitions.get(type)
  }

  static getAll(): ConnectorDefinition[] {
    return Array.from(this.definitions.values())
  }

  static getByCategory(category: ConnectorDefinition['category']): ConnectorDefinition[] {
    return Array.from(this.definitions.values()).filter(def => def.category === category)
  }

  static createConnector(type: ConnectorType, config: Partial<ConnectorConfig>, credentials?: any) {
    const definition = this.get(type)
    if (!definition) {
      throw new Error(`Unknown connector type: ${type}`)
    }

    const fullConfig = {
      ...definition.configTemplate,
      ...config
    }

    return ConnectorFactory.create({
      type,
      config: fullConfig,
      credentials
    })
  }
}

// Register all available connectors
ConnectorRegistryManager.register({
  type: 'linkedin',
  name: 'LinkedIn',
  description: 'Professional networking and career platform integration',
  category: 'social',
  icon: 'linkedin',
  capabilities: [
    'profile_access',
    'connections_sync',
    'messaging',
    'posting',
    'analytics',
    'engagement_tracking'
  ],
  configTemplate: CONNECTOR_TEMPLATES.linkedin.config,
  requiredCredentials: ['accessToken', 'clientId', 'clientSecret'],
  documentation: 'Connect to LinkedIn for comprehensive professional networking data'
})

ConnectorRegistryManager.register({
  type: 'data-transfer',
  name: 'Data Transfer Orchestrator',
  description: 'Advanced data synchronization and transformation engine',
  category: 'integration',
  icon: 'database',
  capabilities: [
    'data_sync',
    'transformation',
    'batch_processing',
    'real_time_sync',
    'conflict_resolution'
  ],
  configTemplate: CONNECTOR_TEMPLATES.dataTransfer.config,
  requiredCredentials: [],
  documentation: 'Orchestrate complex data transfers between multiple systems'
})

ConnectorRegistryManager.register({
  type: 'messaging',
  name: 'Unified Messaging',
  description: 'Consolidate messaging across multiple platforms',
  category: 'communication',
  icon: 'message-circle',
  capabilities: [
    'multi_platform_messaging',
    'message_routing',
    'notification_management',
    'real_time_chat'
  ],
  configTemplate: CONNECTOR_TEMPLATES.messaging.config,
  requiredCredentials: ['apiKey'],
  documentation: 'Unified messaging interface for all communication platforms'
})

ConnectorRegistryManager.register({
  type: 'document-processor',
  name: 'Document Processor',
  description: 'Advanced document processing with AI-powered analysis',
  category: 'productivity',
  icon: 'file-text',
  capabilities: [
    'document_processing',
    'text_extraction',
    'ai_analysis',
    'ocr_processing',
    'file_conversion',
    'metadata_extraction'
  ],
  configTemplate: {
    id: 'document-processor-main',
    name: 'Document Processor',
    type: 'file',
    direction: 'inbound',
    protocol: 'http',
    auth: { type: 'none' },
    rateLimit: { requests: 10, period: 60, strategy: 'fixed' },
    retry: { maxAttempts: 3, backoff: 'exponential', baseDelay: 1000 },
    timeout: 120000,
    healthCheck: { enabled: true, interval: 300 }
  },
  requiredCredentials: [],
  documentation: 'Process documents with AI analysis, OCR, and conversion capabilities'
})

ConnectorRegistryManager.register({
  type: 'guidance',
  name: 'Guidance Code Generator',
  description: 'Enterprise-grade code generation with comprehensive security analysis and quality metrics',
  category: 'development',
  icon: 'code',
  capabilities: [
    'code_generation',
    'security_analysis',
    'quality_metrics',
    'performance_optimization',
    'accessibility_compliance',
    'comprehensive_testing',
    'documentation_generation',
    'alternative_implementations',
    'dependency_analysis'
  ],
  configTemplate: {
    id: 'guidance-main',
    name: 'Guidance Code Generator',
    type: 'guidance',
    direction: 'bidirectional',
    protocol: 'http',
    auth: { type: 'none' },
    rateLimit: { requests: 100, period: 900, strategy: 'sliding' },
    retry: { maxAttempts: 3, backoff: 'exponential', baseDelay: 1000 },
    timeout: 300000,
    healthCheck: { enabled: true, interval: 60 },
    guidanceConfig: {
      defaultLanguage: 'typescript',
      securityLevel: 'high',
      enableSecurityAnalysis: true,
      enableQualityMetrics: true,
      enablePerformanceOptimization: true,
      enableAccessibility: true,
      enableTesting: true,
      enableDocumentation: true
    }
  },
  requiredCredentials: [],
  documentation: 'Generate enterprise-grade code with comprehensive security analysis, quality metrics, and optimization'
})

// Export the registry for use throughout the application
export { ConnectorRegistryManager as ConnectorRegistry }
