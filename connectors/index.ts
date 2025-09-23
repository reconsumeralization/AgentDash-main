/**
 * Connectors Module
 * Enterprise-grade data connector infrastructure
 */

// Base connector infrastructure
export { BaseConnector } from './base-connector'
export type { ConnectorConfig, DataPacket, ConnectionStatus, TransformPipeline } from './base-connector'

// Connector factory and registry
export { ConnectorFactory, CONNECTOR_TEMPLATES } from './connector-factory'
export type { ConnectorFactoryConfig } from './connector-factory'
export { ConnectorRegistry } from './connector-registry'
export type { ConnectorDefinition } from './connector-registry'
export type { ConnectorType } from './connector-factory'

// LinkedIn connector
export { LinkedInConnector } from './linkedin/linkedin-connector'
export type {
  LinkedInCredentials,
  LinkedInProfile,
  LinkedInConnection,
  LinkedInMessage,
  LinkedInPost,
  LinkedInAnalytics
} from './linkedin/linkedin-connector'

// Data transfer orchestrator
export { DataTransferOrchestrator } from './data-transfer-orchestrator'

// Messaging connector
export { MessagingConnector } from './messaging-connector'

// Audio/Video connector
export { AudioVideoConnector } from './audio-video-connector'

// Social Media Connectors
export * from './social-media/base-connector'
export * from './social-media/linkedin-connector'
export * from './social-media/twitter-connector'
export * from './social-media/facebook-connector'
export * from './social-media/connector-factory'
export * from './social-media/connector-registry'
export * from './social-media/social-media-api'