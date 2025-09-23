// LinkedIn Addon Ecosystem - Complete Integration Suite
// This module provides comprehensive LinkedIn integration with 20+ platforms

export { UniversalAddonConnector } from './universal-addon-connector'
export { LinkedInAddonDashboard } from './linkedin-addon-dashboard'

// Core interfaces and types
export type {
  AddonPlatform,
  IntegrationMapping
} from './universal-addon-connector'

export type { LinkedInAddonMetrics } from './linkedin-addon-dashboard'

// LinkedIn API integration utilities
export { default as LinkedInAPI } from './linkedin-api'

// Addon management utilities
export { default as AddonManager } from './addon-manager'

// Data synchronization utilities
export { default as DataSync } from './data-sync'

// Analytics and reporting
export { default as LinkedInAnalytics } from './linkedin-analytics'

// LinkedIn Connector (from connectors infrastructure)
export { LinkedInConnector, type LinkedInCredentials, type LinkedInProfile, type LinkedInConnection } from '../../connectors/linkedin/linkedin-connector'
