/**
 * Social Media Connector Registry
 * 
 * Central registry for managing social media connector configurations,
 * credentials, and connection states.
 */

import { SupportedPlatform, ConnectorInstance, PlatformConfig } from './connector-factory'
import { AuthCredentials } from './base-connector'

export interface ConnectorRegistryConfig {
  platforms: PlatformConfig
  credentials: Map<SupportedPlatform, AuthCredentials>
  autoConnect: boolean
  retryFailedConnections: boolean
  maxRetryAttempts: number
}

export interface ConnectionStatus {
  platform: SupportedPlatform
  isConnected: boolean
  lastConnected?: Date
  lastError?: string
  retryCount: number
  nextRetryAt?: Date
}

/**
 * Registry for managing social media connectors
 */
export class SocialMediaConnectorRegistry {
  private config: ConnectorRegistryConfig
  private connectionStatuses: Map<SupportedPlatform, ConnectionStatus> = new Map()
  private retryTimeouts: Map<SupportedPlatform, NodeJS.Timeout> = new Map()

  constructor(config: ConnectorRegistryConfig) {
    this.config = config
    this.initializeConnectionStatuses()
    
    if (config.autoConnect) {
      this.autoConnectPlatforms()
    }
  }

  /**
   * Initialize connection statuses for all configured platforms
   */
  private initializeConnectionStatuses(): void {
    Object.keys(this.config.platforms).forEach(platform => {
      this.connectionStatuses.set(platform as SupportedPlatform, {
        platform: platform as SupportedPlatform,
        isConnected: false,
        retryCount: 0
      })
    })
  }

  /**
   * Auto-connect to all configured platforms
   */
  private async autoConnectPlatforms(): Promise<void> {
    const platforms = Object.keys(this.config.platforms) as SupportedPlatform[]
    
    for (const platform of platforms) {
      try {
        await this.connectPlatform(platform)
      } catch (error) {
        console.warn(`Failed to auto-connect to ${platform}:`, error)
      }
    }
  }

  /**
   * Connect to a specific platform
   */
  async connectPlatform(platform: SupportedPlatform): Promise<ConnectorInstance> {
    const credentials = this.config.credentials.get(platform)
    const platformConfig = this.config.platforms[platform]

    if (!credentials) {
      throw new Error(`No credentials configured for ${platform}`)
    }

    if (!platformConfig) {
      throw new Error(`No configuration found for ${platform}`)
    }

    try {
      // Import the factory dynamically to avoid circular dependencies
      const { SocialMediaConnectorFactory } = await import('./connector-factory')
      
      const instance = await SocialMediaConnectorFactory.connect(platform, credentials, platformConfig)
      
      // Update connection status
      this.updateConnectionStatus(platform, {
        isConnected: true,
        lastConnected: new Date(),
        retryCount: 0
      })

      console.log(`Successfully connected to ${platform}`)
      return instance
    } catch (error) {
      this.handleConnectionError(platform, error)
      throw error
    }
  }

  /**
   * Disconnect from a platform
   */
  disconnectPlatform(platform: SupportedPlatform): void {
    try {
      // Import the factory dynamically
      import('./connector-factory').then(({ SocialMediaConnectorFactory }) => {
        SocialMediaConnectorFactory.disconnect(platform)
      })

      // Update connection status
      this.updateConnectionStatus(platform, {
        isConnected: false
      })

      // Clear any retry timeout
      const timeout = this.retryTimeouts.get(platform)
      if (timeout) {
        clearTimeout(timeout)
        this.retryTimeouts.delete(platform)
      }

      console.log(`Disconnected from ${platform}`)
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error)
    }
  }

  /**
   * Get connection status for a platform
   */
  getConnectionStatus(platform: SupportedPlatform): ConnectionStatus | undefined {
    return this.connectionStatuses.get(platform)
  }

  /**
   * Get all connection statuses
   */
  getAllConnectionStatuses(): ConnectionStatus[] {
    return Array.from(this.connectionStatuses.values())
  }

  /**
   * Get connected platforms
   */
  getConnectedPlatforms(): SupportedPlatform[] {
    return Array.from(this.connectionStatuses.values())
      .filter(status => status.isConnected)
      .map(status => status.platform)
  }

  /**
   * Check if a platform is connected
   */
  isConnected(platform: SupportedPlatform): boolean {
    const status = this.connectionStatuses.get(platform)
    return status?.isConnected || false
  }

  /**
   * Update credentials for a platform
   */
  updateCredentials(platform: SupportedPlatform, credentials: AuthCredentials): void {
    this.config.credentials.set(platform, credentials)
    
    // If platform is currently connected, reconnect with new credentials
    if (this.isConnected(platform)) {
      this.disconnectPlatform(platform)
      this.connectPlatform(platform).catch(error => {
        console.error(`Failed to reconnect ${platform} with new credentials:`, error)
      })
    }
  }

  /**
   * Update platform configuration
   */
  updatePlatformConfig(platform: SupportedPlatform, config: any): void {
    this.config.platforms[platform] = config
    
    // If platform is currently connected, reconnect with new config
    if (this.isConnected(platform)) {
      this.disconnectPlatform(platform)
      this.connectPlatform(platform).catch(error => {
        console.error(`Failed to reconnect ${platform} with new config:`, error)
      })
    }
  }

  /**
   * Handle connection errors and implement retry logic
   */
  private handleConnectionError(platform: SupportedPlatform, error: any): void {
    const status = this.connectionStatuses.get(platform)
    if (!status) return

    const newRetryCount = status.retryCount + 1
    const shouldRetry = this.config.retryFailedConnections && 
                       newRetryCount <= this.config.maxRetryAttempts

    this.updateConnectionStatus(platform, {
      isConnected: false,
      lastError: error instanceof Error ? error.message : 'Unknown error',
      retryCount: newRetryCount
    })

    if (shouldRetry) {
      const retryDelay = this.calculateRetryDelay(newRetryCount)
      const nextRetryAt = new Date(Date.now() + retryDelay)
      
      this.updateConnectionStatus(platform, {
        nextRetryAt
      })

      const timeout = setTimeout(() => {
        this.retryConnection(platform)
      }, retryDelay)

      this.retryTimeouts.set(platform, timeout)
      
      console.log(`Will retry connection to ${platform} in ${retryDelay}ms (attempt ${newRetryCount}/${this.config.maxRetryAttempts})`)
    } else {
      console.error(`Max retry attempts reached for ${platform}. Connection failed.`)
    }
  }

  /**
   * Retry connection to a platform
   */
  private async retryConnection(platform: SupportedPlatform): Promise<void> {
    try {
      await this.connectPlatform(platform)
    } catch (error) {
      // Error handling is done in handleConnectionError
      this.handleConnectionError(platform, error)
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = 1000 // 1 second
    const maxDelay = 300000 // 5 minutes
    const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay)
    return delay
  }

  /**
   * Update connection status for a platform
   */
  private updateConnectionStatus(platform: SupportedPlatform, updates: Partial<ConnectionStatus>): void {
    const currentStatus = this.connectionStatuses.get(platform)
    if (currentStatus) {
      this.connectionStatuses.set(platform, {
        ...currentStatus,
        ...updates
      })
    }
  }

  /**
   * Get registry configuration
   */
  getConfig(): ConnectorRegistryConfig {
    return { ...this.config }
  }

  /**
   * Update registry configuration
   */
  updateConfig(updates: Partial<ConnectorRegistryConfig>): void {
    this.config = {
      ...this.config,
      ...updates
    }
  }

  /**
   * Get health status of all platforms
   */
  getHealthStatus(): {
    healthy: SupportedPlatform[]
    unhealthy: SupportedPlatform[]
    retrying: SupportedPlatform[]
  } {
    const healthy: SupportedPlatform[] = []
    const unhealthy: SupportedPlatform[] = []
    const retrying: SupportedPlatform[] = []

    this.connectionStatuses.forEach((status, platform) => {
      if (status.isConnected) {
        healthy.push(platform)
      } else if (status.nextRetryAt && status.nextRetryAt > new Date()) {
        retrying.push(platform)
      } else {
        unhealthy.push(platform)
      }
    })

    return { healthy, unhealthy, retrying }
  }

  /**
   * Force retry all failed connections
   */
  async retryAllFailedConnections(): Promise<void> {
    const failedPlatforms = Array.from(this.connectionStatuses.values())
      .filter(status => !status.isConnected && !status.nextRetryAt)
      .map(status => status.platform)

    for (const platform of failedPlatforms) {
      try {
        await this.connectPlatform(platform)
      } catch (error) {
        console.warn(`Failed to retry connection to ${platform}:`, error)
      }
    }
  }

  /**
   * Clear all retry timeouts
   */
  clearAllRetryTimeouts(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts.clear()
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearAllRetryTimeouts()
    
    // Disconnect all platforms
    this.connectionStatuses.forEach((_, platform) => {
      this.disconnectPlatform(platform)
    })
  }
}

/**
 * Default registry configuration
 */
export const defaultRegistryConfig: ConnectorRegistryConfig = {
  platforms: {},
  credentials: new Map(),
  autoConnect: false,
  retryFailedConnections: true,
  maxRetryAttempts: 3
}

/**
 * Create a registry instance with default configuration
 */
export function createConnectorRegistry(config?: Partial<ConnectorRegistryConfig>): SocialMediaConnectorRegistry {
  const finalConfig = {
    ...defaultRegistryConfig,
    ...config
  }
  
  return new SocialMediaConnectorRegistry(finalConfig)
}
