/**
 * 🖥️ SERVER-ONLY EXPORTS
 * This file contains server-only modules that should not be imported by client components
 */

// Security middleware and API wrapper (server-only)
export * from './security-middleware'
export * from './secure-api-wrapper'

// Database operations (server-only)
export { db } from './supabase'

// Rate limiting (server-only)
export * from './rate-limit'

// Security patches (server-only)
export * from './security-patches'

// Re-export common types that are safe for server use
export type { 
  PlatformId, 
  PlatformCapabilities, 
  UnifiedPost, 
  UnifiedUser, 
  UnifiedComment, 
  UnifiedMessage, 
  UnifiedNotification, 
  UnifiedAnalytics,
  PlatformError,
  RateLimitInfo,
  WebhookPayload,
  BulkOperation
} from './social-media-platforms/types'

export { 
  getPlatformCapabilities, 
  getSupportedPlatforms, 
  getPlatformConstraints, 
  getPlatformRateLimits, 
  requiresApproval, 
  getPartnerProgramTier 
} from './social-media-platforms/capability-matrix'

export { SocialMediaConnector } from './social-media-platforms/connector-base'
export { ConnectorManager } from './social-media-platforms/connector-manager'
