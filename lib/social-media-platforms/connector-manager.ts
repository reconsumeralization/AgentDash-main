/**
 * 🎛️ CONNECTOR MANAGER
 * Manages multiple platform connectors and provides unified interface
 */

import { 
  PlatformId, 
  PlatformConnection, 
  UnifiedPost, 
  UnifiedUser, 
  UnifiedComment, 
  UnifiedMessage, 
  UnifiedNotification, 
  UnifiedAnalytics,
  CrossPostConfig,
  SearchFilters,
  SearchResult,
  PlatformError,
  BulkOperation
} from './types'
import { SocialMediaConnector } from './connector-base'
import { getPlatformCapabilities, getSupportedPlatforms } from './capability-matrix'

// Platform-specific connector imports
import { LinkedInConnector } from './connectors/linkedin-connector'
import { TwitterConnector } from './connectors/twitter-connector'
import { FacebookConnector } from './connectors/facebook-connector'
import { InstagramConnector } from './connectors/instagram-connector'
import { YouTubeConnector } from './connectors/youtube-connector'
import { RedditConnector } from './connectors/reddit-connector'

export class ConnectorManager {
  private connectors: Map<PlatformId, SocialMediaConnector> = new Map()
  private connections: Map<PlatformId, PlatformConnection> = new Map()
  private rateLimiters: Map<PlatformId, any> = new Map()

  constructor() {
    this.initializeConnectors()
  }

  private initializeConnectors(): void {
    // Initialize platform-specific connectors
    // Note: These would be imported from separate files
    // this.connectors.set('linkedin', new LinkedInConnector())
    // this.connectors.set('twitter', new TwitterConnector())
    // this.connectors.set('facebook', new FacebookConnector())
    // this.connectors.set('instagram', new InstagramConnector())
    // this.connectors.set('youtube', new YouTubeConnector())
    // this.connectors.set('reddit', new RedditConnector())
  }

  // Connection management
  public async connectPlatform(
    platformId: PlatformId, 
    accessToken: string, 
    refreshToken?: string
  ): Promise<PlatformConnection> {
    const connector = this.connectors.get(platformId)
    if (!connector) {
      throw new Error(`Connector not found for platform: ${platformId}`)
    }

    const connection = await connector.authenticate(accessToken, refreshToken)
    this.connections.set(platformId, connection)
    connector.setConnection(connection)

    return connection
  }

  public async disconnectPlatform(platformId: PlatformId): Promise<void> {
    const connector = this.connectors.get(platformId)
    if (connector) {
      await connector.revokeToken()
    }
    
    this.connections.delete(platformId)
    this.connectors.delete(platformId)
  }

  public getConnection(platformId: PlatformId): PlatformConnection | null {
    return this.connections.get(platformId) || null
  }

  public getConnectedPlatforms(): PlatformId[] {
    return Array.from(this.connections.keys())
  }

  public isPlatformConnected(platformId: PlatformId): boolean {
    const connection = this.connections.get(platformId)
    return connection !== undefined && connection.status === 'active'
  }

  // Unified content operations
  public async createPost(
    content: any, 
    platforms: PlatformId[],
    scheduling?: { publishAt: Date; timezone: string }
  ): Promise<CrossPostConfig> {
    const crossPostConfig: CrossPostConfig = {
      id: `crosspost_${Date.now()}`,
      userId: 'current_user', // This would come from context
      platforms,
      content,
      scheduling,
      platformSpecific: {},
      status: 'draft',
      results: {}
    }

    // Validate content for each platform
    for (const platformId of platforms) {
      const connector = this.connectors.get(platformId)
      if (!connector || !this.isPlatformConnected(platformId)) {
        crossPostConfig.results[platformId] = {
          status: 'failed',
          error: 'Platform not connected'
        }
        continue
      }

      try {
        // Transform content for platform-specific requirements
        const platformContent = connector.transformContent(content, platformId)
        crossPostConfig.platformSpecific[platformId] = platformContent

        // Validate content
        connector.validateContent(platformContent)

        crossPostConfig.results[platformId] = {
          status: 'pending'
        }
      } catch (error) {
        crossPostConfig.results[platformId] = {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // If scheduling, store for later execution
    if (scheduling) {
      crossPostConfig.status = 'scheduled'
      // Store in database for scheduled execution
      await this.storeScheduledPost(crossPostConfig)
    } else {
      // Execute immediately
      await this.executeCrossPost(crossPostConfig)
    }

    return crossPostConfig
  }

  private async executeCrossPost(crossPostConfig: CrossPostConfig): Promise<void> {
    crossPostConfig.status = 'publishing'

    const promises = crossPostConfig.platforms.map(async (platformId) => {
      const connector = this.connectors.get(platformId)
      if (!connector || !this.isPlatformConnected(platformId)) {
        return
      }

      try {
        const platformContent = crossPostConfig.platformSpecific[platformId]
        const post = await connector.createPost(platformContent)
        
        crossPostConfig.results[platformId] = {
          status: 'success',
          postId: post.id,
          publishedAt: new Date()
        }
      } catch (error) {
        crossPostConfig.results[platformId] = {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    await Promise.allSettled(promises)

    // Check if all posts succeeded
    const allSuccessful = Object.values(crossPostConfig.results).every(
      result => result.status === 'success'
    )

    crossPostConfig.status = allSuccessful ? 'published' : 'failed'
  }

  private async storeScheduledPost(crossPostConfig: CrossPostConfig): Promise<void> {
    // Store in database for scheduled execution
    // This would integrate with your existing database
    console.log('Storing scheduled post:', crossPostConfig.id)
  }

  // Unified search operations
  public async searchContent(
    query: string, 
    filters: SearchFilters = {}
  ): Promise<SearchResult<UnifiedPost>> {
    const results: UnifiedPost[] = []
    const facets = {
      platforms: {} as Record<PlatformId, number>,
      contentTypes: {} as Record<string, number>,
      authors: {} as Record<string, number>,
      hashtags: {} as Record<string, number>,
      dates: {} as Record<string, number>
    }

    const platforms = filters.platforms || this.getConnectedPlatforms()

    for (const platformId of platforms) {
      const connector = this.connectors.get(platformId)
      if (!connector || !this.isPlatformConnected(platformId)) {
        continue
      }

      try {
        const platformResults = await connector.searchPosts(query, filters)
        results.push(...platformResults)

        // Update facets
        for (const post of platformResults) {
          facets.platforms[platformId] = (facets.platforms[platformId] || 0) + 1
          facets.authors[post.author.username] = (facets.authors[post.author.username] || 0) + 1
          
          for (const hashtag of post.content.hashtags) {
            facets.hashtags[hashtag] = (facets.hashtags[hashtag] || 0) + 1
          }

          const dateKey = post.metadata.createdAt.toISOString().split('T')[0]
          facets.dates[dateKey] = (facets.dates[dateKey] || 0) + 1
        }
      } catch (error) {
        console.error(`Search failed for platform ${platformId}:`, error)
      }
    }

    // Sort results by engagement or date
    results.sort((a, b) => {
      const aEngagement = a.engagement.likes + a.engagement.comments + a.engagement.shares
      const bEngagement = b.engagement.likes + b.engagement.comments + b.engagement.shares
      return bEngagement - aEngagement
    })

    return {
      items: results,
      total: results.length,
      page: 1,
      limit: 50,
      hasMore: false,
      facets
    }
  }

  // Unified analytics
  public async getCrossPlatformAnalytics(
    entityId: string,
    entityType: string,
    period: { start: Date; end: Date; granularity: 'day' | 'week' | 'month' },
    platforms: PlatformId[]
  ): Promise<Record<PlatformId, UnifiedAnalytics>> {
    const results: Record<PlatformId, UnifiedAnalytics> = {}

    for (const platformId of platforms) {
      const connector = this.connectors.get(platformId)
      if (!connector || !this.isPlatformConnected(platformId)) {
        continue
      }

      try {
        const analytics = await connector.getAnalytics(entityId, entityType, period)
        results[platformId] = analytics
      } catch (error) {
        console.error(`Analytics failed for platform ${platformId}:`, error)
      }
    }

    return results
  }

  // Universal inbox
  public async getUniversalInbox(
    filters: {
      platforms?: PlatformId[]
      types?: ('message' | 'comment' | 'mention' | 'like' | 'follow')[]
      unreadOnly?: boolean
      dateRange?: { start: Date; end: Date }
    } = {}
  ): Promise<UnifiedNotification[]> {
    const notifications: UnifiedNotification[] = []
    const platforms = filters.platforms || this.getConnectedPlatforms()

    for (const platformId of platforms) {
      const connector = this.connectors.get(platformId)
      if (!connector || !this.isPlatformConnected(platformId)) {
        continue
      }

      try {
        // This would be implemented in each connector
        // const platformNotifications = await connector.getNotifications(filters)
        // notifications.push(...platformNotifications)
      } catch (error) {
        console.error(`Failed to get notifications for platform ${platformId}:`, error)
      }
    }

    // Sort by date (newest first)
    notifications.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime())

    return notifications
  }

  // Bulk operations
  public async importData(
    platformId: PlatformId,
    type: 'posts' | 'messages' | 'analytics',
    options: any
  ): Promise<BulkOperation> {
    const connector = this.connectors.get(platformId)
    if (!connector || !this.isPlatformConnected(platformId)) {
      throw new Error(`Platform ${platformId} not connected`)
    }

    return connector.importData(type, options)
  }

  public async exportData(
    platformId: PlatformId,
    type: 'posts' | 'messages' | 'analytics',
    options: any
  ): Promise<BulkOperation> {
    const connector = this.connectors.get(platformId)
    if (!connector || !this.isPlatformConnected(platformId)) {
      throw new Error(`Platform ${platformId} not connected`)
    }

    return connector.exportData(type, options)
  }

  // Webhook management
  public async setupWebhooks(
    platformId: PlatformId,
    webhookUrl: string,
    events: string[]
  ): Promise<void> {
    const connector = this.connectors.get(platformId)
    if (!connector || !this.isPlatformConnected(platformId)) {
      throw new Error(`Platform ${platformId} not connected`)
    }

    await connector.setupWebhook(webhookUrl, events)
  }

  public async processWebhook(
    platformId: PlatformId,
    payload: any,
    signature: string
  ): Promise<any> {
    const connector = this.connectors.get(platformId)
    if (!connector) {
      throw new Error(`Connector not found for platform: ${platformId}`)
    }

    // Verify webhook signature
    const isValid = await connector.verifyWebhook(payload, signature)
    if (!isValid) {
      throw new Error('Invalid webhook signature')
    }

    // Process webhook
    return connector.processWebhook(payload)
  }

  // Rate limiting
  public getRateLimitInfo(platformId: PlatformId): any {
    const connector = this.connectors.get(platformId)
    return connector?.getRateLimitInfo() || null
  }

  public getAllRateLimitInfo(): Record<PlatformId, any> {
    const info: Record<PlatformId, any> = {}
    
    for (const [platformId, connector] of this.connectors) {
      const rateLimitInfo = connector.getRateLimitInfo()
      if (rateLimitInfo) {
        info[platformId] = rateLimitInfo
      }
    }

    return info
  }

  // Platform capabilities
  public getSupportedFeatures(feature: string): PlatformId[] {
    return getSupportedPlatforms(feature as any)
  }

  public getPlatformCapabilities(platformId: PlatformId) {
    return getPlatformCapabilities(platformId)
  }

  // Error handling
  public handlePlatformError(error: any, platformId: PlatformId): PlatformError {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      platform: platformId,
      retryable: error.retryable || false,
      details: error.details || {}
    }
  }

  // Cleanup
  public async cleanup(): Promise<void> {
    for (const [platformId, connector] of this.connectors) {
      try {
        await connector.revokeToken()
      } catch (error) {
        console.error(`Failed to cleanup connector for ${platformId}:`, error)
      }
    }

    this.connectors.clear()
    this.connections.clear()
    this.rateLimiters.clear()
  }
}
