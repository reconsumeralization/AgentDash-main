/**
 * Social Media Connector Factory
 * 
 * Factory class for creating and managing social media platform connectors.
 * Provides a unified interface for all social media platforms.
 */

import { BaseSocialMediaConnector, AuthCredentials, ConnectorConfig } from './base-connector'
import { LinkedInConnector, LinkedInConfig } from './linkedin-connector'
import { TwitterConnector, TwitterConfig } from './twitter-connector'
import { FacebookConnector, FacebookConfig } from './facebook-connector'

export type SupportedPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | 'reddit'

export interface PlatformConfig {
  linkedin?: LinkedInConfig
  twitter?: TwitterConfig
  facebook?: FacebookConfig
  // Add other platform configs as needed
}

export interface ConnectorInstance {
  platform: SupportedPlatform
  connector: BaseSocialMediaConnector
  isConnected: boolean
  lastUsed: Date
  config: ConnectorConfig
}

/**
 * Factory class for creating social media connectors
 */
export class SocialMediaConnectorFactory {
  private static instances: Map<SupportedPlatform, ConnectorInstance> = new Map()

  /**
   * Create a connector for a specific platform
   */
  static createConnector(
    platform: SupportedPlatform,
    config: ConnectorConfig
  ): BaseSocialMediaConnector {
    switch (platform) {
      case 'linkedin':
        return new LinkedInConnector(config as LinkedInConfig)
      
      case 'twitter':
        return new TwitterConnector(config as TwitterConfig)
      
      case 'facebook':
      case 'instagram':
        return new FacebookConnector(config as FacebookConfig)
      
      case 'tiktok':
        // TODO: Implement TikTok connector
        throw new Error('TikTok connector not yet implemented')
      
      case 'youtube':
        // TODO: Implement YouTube connector
        throw new Error('YouTube connector not yet implemented')
      
      case 'pinterest':
        // TODO: Implement Pinterest connector
        throw new Error('Pinterest connector not yet implemented')
      
      case 'reddit':
        // TODO: Implement Reddit connector
        throw new Error('Reddit connector not yet implemented')
      
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * Get or create a connector instance
   */
  static getConnector(
    platform: SupportedPlatform,
    config: ConnectorConfig
  ): ConnectorInstance {
    const existing = this.instances.get(platform)
    
    if (existing) {
      existing.lastUsed = new Date()
      return existing
    }

    const connector = this.createConnector(platform, config)
    const instance: ConnectorInstance = {
      platform,
      connector,
      isConnected: false,
      lastUsed: new Date(),
      config
    }

    this.instances.set(platform, instance)
    return instance
  }

  /**
   * Connect to a platform
   */
  static async connect(
    platform: SupportedPlatform,
    credentials: AuthCredentials,
    config: ConnectorConfig
  ): Promise<ConnectorInstance> {
    const instance = this.getConnector(platform, config)
    
    try {
      const authResult = await instance.connector.authenticate(credentials)
      
      if (authResult.success) {
        instance.isConnected = true
        instance.lastUsed = new Date()
        return instance
      } else {
        throw new Error(authResult.error || 'Authentication failed')
      }
    } catch (error) {
      instance.isConnected = false
      throw error
    }
  }

  /**
   * Disconnect from a platform
   */
  static disconnect(platform: SupportedPlatform): void {
    const instance = this.instances.get(platform)
    if (instance) {
      instance.isConnected = false
      // Clear tokens
      instance.connector.setTokens('', '', 0)
    }
  }

  /**
   * Get all connected platforms
   */
  static getConnectedPlatforms(): SupportedPlatform[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.isConnected)
      .map(instance => instance.platform)
  }

  /**
   * Get connector instance for a platform
   */
  static getInstance(platform: SupportedPlatform): ConnectorInstance | undefined {
    return this.instances.get(platform)
  }

  /**
   * Check if a platform is connected
   */
  static isConnected(platform: SupportedPlatform): boolean {
    const instance = this.instances.get(platform)
    return instance?.isConnected || false
  }

  /**
   * Get platform capabilities
   */
  static getPlatformCapabilities(platform: SupportedPlatform): PlatformCapabilities {
    const capabilities: Record<SupportedPlatform, PlatformCapabilities> = {
      linkedin: {
        posting: true,
        analytics: true,
        media: true,
        scheduling: false,
        stories: false,
        live: false,
        messaging: false,
        groups: false
      },
      twitter: {
        posting: true,
        analytics: true,
        media: true,
        scheduling: true,
        stories: false,
        live: false,
        messaging: true,
        groups: false
      },
      facebook: {
        posting: true,
        analytics: true,
        media: true,
        scheduling: true,
        stories: true,
        live: true,
        messaging: true,
        groups: true
      },
      instagram: {
        posting: true,
        analytics: true,
        media: true,
        scheduling: true,
        stories: true,
        live: true,
        messaging: false,
        groups: false
      },
      tiktok: {
        posting: true,
        analytics: true,
        media: true,
        scheduling: false,
        stories: false,
        live: true,
        messaging: false,
        groups: false
      },
      youtube: {
        posting: true,
        analytics: true,
        media: true,
        scheduling: true,
        stories: false,
        live: true,
        messaging: false,
        groups: false
      },
      pinterest: {
        posting: true,
        analytics: true,
        media: true,
        scheduling: false,
        stories: false,
        live: false,
        messaging: false,
        groups: false
      },
      reddit: {
        posting: true,
        analytics: false,
        media: true,
        scheduling: false,
        stories: false,
        live: false,
        messaging: true,
        groups: true
      }
    }

    return capabilities[platform] || {
      posting: false,
      analytics: false,
      media: false,
      scheduling: false,
      stories: false,
      live: false,
      messaging: false,
      groups: false
    }
  }

  /**
   * Get platform display information
   */
  static getPlatformInfo(platform: SupportedPlatform): PlatformInfo {
    const info: Record<SupportedPlatform, PlatformInfo> = {
      linkedin: {
        name: 'LinkedIn',
        description: 'Professional networking and B2B content',
        color: '#0077B5',
        icon: 'linkedin',
        category: 'professional'
      },
      twitter: {
        name: 'Twitter/X',
        description: 'Real-time social media and news',
        color: '#1DA1F2',
        icon: 'twitter',
        category: 'social'
      },
      facebook: {
        name: 'Facebook',
        description: 'Social networking and community building',
        color: '#1877F2',
        icon: 'facebook',
        category: 'social'
      },
      instagram: {
        name: 'Instagram',
        description: 'Visual content and storytelling',
        color: '#E4405F',
        icon: 'instagram',
        category: 'visual'
      },
      tiktok: {
        name: 'TikTok',
        description: 'Short-form video content',
        color: '#000000',
        icon: 'tiktok',
        category: 'video'
      },
      youtube: {
        name: 'YouTube',
        description: 'Video content and live streaming',
        color: '#FF0000',
        icon: 'youtube',
        category: 'video'
      },
      pinterest: {
        name: 'Pinterest',
        description: 'Visual discovery and inspiration',
        color: '#BD081C',
        icon: 'pinterest',
        category: 'visual'
      },
      reddit: {
        name: 'Reddit',
        description: 'Community discussions and content',
        color: '#FF4500',
        icon: 'reddit',
        category: 'community'
      }
    }

    return info[platform] || {
      name: 'Unknown',
      description: 'Unknown platform',
      color: '#666666',
      icon: 'question',
      category: 'other'
    }
  }

  /**
   * Clear all instances (useful for testing)
   */
  static clearInstances(): void {
    this.instances.clear()
  }

  /**
   * Get usage statistics
   */
  static getUsageStats(): UsageStats {
    const instances = Array.from(this.instances.values())
    
    return {
      totalPlatforms: instances.length,
      connectedPlatforms: instances.filter(i => i.isConnected).length,
      lastUsed: instances.reduce((latest, instance) => 
        instance.lastUsed > latest ? instance.lastUsed : latest, 
        new Date(0)
      ),
      platforms: instances.map(instance => ({
        platform: instance.platform,
        isConnected: instance.isConnected,
        lastUsed: instance.lastUsed
      }))
    }
  }
}

export interface PlatformCapabilities {
  posting: boolean
  analytics: boolean
  media: boolean
  scheduling: boolean
  stories: boolean
  live: boolean
  messaging: boolean
  groups: boolean
}

export interface PlatformInfo {
  name: string
  description: string
  color: string
  icon: string
  category: 'professional' | 'social' | 'visual' | 'video' | 'community' | 'other'
}

export interface UsageStats {
  totalPlatforms: number
  connectedPlatforms: number
  lastUsed: Date
  platforms: Array<{
    platform: SupportedPlatform
    isConnected: boolean
    lastUsed: Date
  }>
}
