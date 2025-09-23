/**
 * Connector Factory
 * Central registry and factory for all data connectors
 */

import { BaseConnector, ConnectorConfig } from './base-connector'
import { LinkedInConnector, LinkedInCredentials } from './linkedin/linkedin-connector'
import { initializeDataTransferOrchestrator } from './data-transfer-orchestrator'
import { MessagingConnector } from './messaging-connector'
import { DocumentProcessorConnector, DocumentProcessingConfig } from './document-processor-connector'
import { GuidanceConnector, GuidanceConnectorConfig } from './guidance-connector'

export type ConnectorType =
  | 'linkedin'
  | 'data-transfer'
  | 'messaging'
  | 'audio-video'
  | 'webhook'
  | 'database'
  | 'api'
  | 'document-processor'
  | 'guidance'

export interface ConnectorFactoryConfig {
  type: ConnectorType
  config: ConnectorConfig
  credentials?: any
}

export class ConnectorFactory {
  private static connectors = new Map<string, BaseConnector>()

  static create(config: ConnectorFactoryConfig): BaseConnector {
    const key = `${config.type}-${config.config.id}`

    if (this.connectors.has(key)) {
      return this.connectors.get(key)!
    }

    let connector: BaseConnector

    switch (config.type) {
      case 'linkedin':
        if (!config.credentials) {
          throw new Error('LinkedIn credentials are required')
        }
        connector = new LinkedInConnector(config.config, config.credentials as LinkedInCredentials)
        break

      case 'data-transfer':
        connector = initializeDataTransferOrchestrator(config.config)
        break

      case 'messaging':
        connector = new MessagingConnector(config.config)
        break

      case 'document-processor':
        const processingConfig: DocumentProcessingConfig = {
          supportedFormats: [
            'application/pdf',
            'text/plain',
            'text/markdown',
            'application/json',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/html',
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp'
          ],
          maxFileSize: 50 * 1024 * 1024, // 50MB
          aiEnabled: true,
          ocrEnabled: true,
          languageDetection: true,
          textExtraction: true,
          metadataExtraction: true,
          conversionEnabled: true,
          targetFormats: ['application/pdf', 'text/plain', 'text/html']
        }
        connector = new DocumentProcessorConnector(config.config, processingConfig)
        break

      case 'guidance':
        const guidanceConfig: GuidanceConnectorConfig = {
          ...config.config,
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
        }
        connector = new GuidanceConnector(guidanceConfig)
        break

      default:
        throw new Error(`Unsupported connector type: ${config.type}`)
    }

    this.connectors.set(key, connector)
    return connector
  }

  static get(id: string): BaseConnector | undefined {
    return Array.from(this.connectors.values()).find(connector =>
      (connector as any).config?.id === id
    )
  }

  static getAll(): BaseConnector[] {
    return Array.from(this.connectors.values())
  }

  static getByType(type: ConnectorType): BaseConnector[] {
    return Array.from(this.connectors.values()).filter(connector => {
      const config = (connector as any).config
      return config?.type === type
    })
  }

  static remove(id: string): boolean {
    const connector = this.get(id)
    if (connector) {
      // Gracefully disconnect
      connector.disconnect().catch(console.error)
      return this.connectors.delete(`${(connector as any).config?.type}-${id}`)
    }
    return false
  }

  static async connectAll(): Promise<void> {
    const connectors = this.getAll()
    await Promise.allSettled(
      connectors.map(async (connector) => {
        try {
          await connector.connect()
        } catch (error) {
          console.error(`Failed to connect ${connector.constructor.name}:`, error)
        }
      })
    )
  }

  static async disconnectAll(): Promise<void> {
    const connectors = this.getAll()
    await Promise.allSettled(
      connectors.map(async (connector) => {
        try {
          await connector.disconnect()
        } catch (error) {
          console.error(`Failed to disconnect ${connector.constructor.name}:`, error)
        }
      })
    )
  }

  static getHealthStatus(): Array<{
    id: string
    type: string
    status: string
    uptime: number
    errorCount: number
  }> {
    return this.getAll().map(connector => ({
      id: (connector as any).config?.id || 'unknown',
      type: (connector as any).config?.type || 'unknown',
      status: (connector as any).status?.status || 'unknown',
      uptime: (connector as any).status?.uptime || 0,
      errorCount: (connector as any).status?.errorCount || 0
    }))
  }
}

// Pre-configured connector templates
export const CONNECTOR_TEMPLATES = {
  linkedin: {
    type: 'linkedin' as const,
    config: {
      id: 'linkedin-main',
      name: 'LinkedIn Integration',
      type: 'api',
      direction: 'bidirectional',
      protocol: 'http',
      auth: {
        type: 'oauth'
      },
      rateLimit: {
        requests: 100,
        period: 60,
        strategy: 'fixed' as const
      },
      retry: {
        maxAttempts: 3,
        backoff: 'exponential' as const,
        baseDelay: 1000
      },
      timeout: 30000,
      healthCheck: {
        enabled: true,
        interval: 300
      }
    }
  },

  dataTransfer: {
    type: 'data-transfer' as const,
    config: {
      id: 'data-transfer-main',
      name: 'Data Transfer Orchestrator',
      type: 'batch',
      direction: 'bidirectional',
      protocol: 'http',
      auth: {
        type: 'none'
      },
      rateLimit: {
        requests: 50,
        period: 60,
        strategy: 'sliding' as const
      },
      retry: {
        maxAttempts: 5,
        backoff: 'exponential' as const,
        baseDelay: 2000
      },
      timeout: 120000,
      healthCheck: {
        enabled: true,
        interval: 60
      }
    }
  },

  messaging: {
    type: 'messaging' as const,
    config: {
      id: 'messaging-main',
      name: 'Unified Messaging',
      type: 'stream',
      direction: 'bidirectional',
      protocol: 'websocket',
      auth: {
        type: 'bearer'
      },
      rateLimit: {
        requests: 200,
        period: 60,
        strategy: 'token_bucket' as const
      },
      retry: {
        maxAttempts: 3,
        backoff: 'linear' as const,
        baseDelay: 500
      },
      timeout: 10000,
      healthCheck: {
        enabled: true,
        interval: 30
      }
    }
  }
} as const
