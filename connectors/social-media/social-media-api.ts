/**
 * Unified Social Media API Service
 * 
 * Provides a unified interface for managing multiple social media platforms.
 * Handles authentication, content posting, analytics, and cross-platform operations.
 */

import {
  BaseSocialMediaConnector,
  AuthCredentials,
  ContentData,
  PostResult,
  AnalyticsData,
  UserInfo,
  TimeFrame,
  APIError
} from './base-connector'
import {
  SocialMediaConnectorFactory,
  SupportedPlatform,
  ConnectorInstance,
  PlatformCapabilities,
  PlatformInfo
} from './connector-factory'

export interface CrossPlatformPost {
  content: ContentData
  platforms: SupportedPlatform[]
  scheduleTime?: Date
  id?: string
  status?: 'draft' | 'scheduled' | 'published' | 'failed'
  results?: PostResult[]
  createdAt: Date
  updatedAt: Date
}

export interface UnifiedAnalytics {
  platforms: Array<{
    platform: SupportedPlatform
    data: AnalyticsData
  }>
  aggregated: {
    totalImpressions: number
    totalReach: number
    totalEngagement: number
    totalLikes: number
    totalComments: number
    totalShares: number
    averageEngagementRate: number
  }
  timeframe: TimeFrame
  generatedAt: Date
}

export interface SocialMediaCampaign {
  id: string
  name: string
  description: string
  platforms: SupportedPlatform[]
  posts: CrossPlatformPost[]
  startDate: Date
  endDate: Date
  status: 'draft' | 'active' | 'paused' | 'completed'
  metrics?: UnifiedAnalytics
  createdAt: Date
  updatedAt: Date
}

/**
 * Unified Social Media API Service
 */
export class SocialMediaAPI {
  private campaigns: Map<string, SocialMediaCampaign> = new Map()
  private scheduledPosts: Map<string, CrossPlatformPost> = new Map()

  /**
   * Connect to a social media platform
   */
  async connect(
    platform: SupportedPlatform,
    credentials: AuthCredentials,
    config: any
  ): Promise<ConnectorInstance> {
    try {
      const instance = await SocialMediaConnectorFactory.connect(platform, credentials, config)
      
      // Log connection event
      console.log(`Connected to ${platform} successfully`)
      
      return instance
    } catch (error) {
      console.error(`Failed to connect to ${platform}:`, error)
      throw error
    }
  }

  /**
   * Disconnect from a platform
   */
  disconnect(platform: SupportedPlatform): void {
    SocialMediaConnectorFactory.disconnect(platform)
    console.log(`Disconnected from ${platform}`)
  }

  /**
   * Get all connected platforms
   */
  getConnectedPlatforms(): SupportedPlatform[] {
    return SocialMediaConnectorFactory.getConnectedPlatforms()
  }

  /**
   * Check if a platform is connected
   */
  isConnected(platform: SupportedPlatform): boolean {
    return SocialMediaConnectorFactory.isConnected(platform)
  }

  /**
   * Post content to a single platform
   */
  async postToPlatform(
    platform: SupportedPlatform,
    content: ContentData
  ): Promise<PostResult> {
    const instance = SocialMediaConnectorFactory.getInstance(platform)
    
    if (!instance || !instance.isConnected) {
      throw new APIError({
        platform,
        code: 'NOT_CONNECTED',
        message: `Platform ${platform} is not connected`,
        retryable: false
      })
    }

    try {
      const result = await instance.connector.postContent(content)
      
      // Log posting event
      console.log(`Posted to ${platform}:`, result.postId)
      
      return result
    } catch (error) {
      console.error(`Failed to post to ${platform}:`, error)
      throw error
    }
  }

  /**
   * Post content to multiple platforms simultaneously
   */
  async postToMultiplePlatforms(
    platforms: SupportedPlatform[],
    content: ContentData
  ): Promise<PostResult[]> {
    const results: PostResult[] = []
    
    // Post to all platforms in parallel
    const promises = platforms.map(async (platform) => {
      try {
        const result = await this.postToPlatform(platform, content)
        return result
      } catch (error) {
        return {
          success: false,
          platform,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Post failed'
        } as PostResult
      }
    })

    const postResults = await Promise.all(promises)
    results.push(...postResults)

    // Log cross-platform posting results
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    console.log(`Cross-platform post completed: ${successful} successful, ${failed} failed`)

    return results
  }

  /**
   * Schedule a post for later
   */
  async schedulePost(
    platforms: SupportedPlatform[],
    content: ContentData,
    scheduleTime: Date
  ): Promise<CrossPlatformPost> {
    const post: CrossPlatformPost = {
      content,
      platforms,
      scheduleTime,
      id: this.generatePostId(),
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.scheduledPosts.set(post.id, post)
    
    // In a real implementation, you would store this in a database
    // and have a background job process scheduled posts
    
    console.log(`Scheduled post for ${platforms.join(', ')} at ${scheduleTime}`)
    
    return post
  }

  /**
   * Get analytics for a single platform
   */
  async getPlatformAnalytics(
    platform: SupportedPlatform,
    timeframe: TimeFrame
  ): Promise<AnalyticsData> {
    const instance = SocialMediaConnectorFactory.getInstance(platform)
    
    if (!instance || !instance.isConnected) {
      throw new APIError({
        platform,
        code: 'NOT_CONNECTED',
        message: `Platform ${platform} is not connected`,
        retryable: false
      })
    }

    try {
      const analytics = await instance.connector.getAnalytics(timeframe)
      return analytics
    } catch (error) {
      console.error(`Failed to get analytics for ${platform}:`, error)
      throw error
    }
  }

  /**
   * Get unified analytics across all connected platforms
   */
  async getUnifiedAnalytics(timeframe: TimeFrame): Promise<UnifiedAnalytics> {
    const connectedPlatforms = this.getConnectedPlatforms()
    const platformData: Array<{ platform: SupportedPlatform; data: AnalyticsData }> = []

    // Get analytics from all connected platforms
    for (const platform of connectedPlatforms) {
      try {
        const data = await this.getPlatformAnalytics(platform, timeframe)
        platformData.push({ platform, data })
      } catch (error) {
        console.warn(`Failed to get analytics for ${platform}:`, error)
        // Continue with other platforms
      }
    }

    // Calculate aggregated metrics
    const aggregated = this.calculateAggregatedMetrics(platformData)

    return {
      platforms: platformData,
      aggregated,
      timeframe,
      generatedAt: new Date()
    }
  }

  /**
   * Get user information from a platform
   */
  async getPlatformUserInfo(platform: SupportedPlatform): Promise<UserInfo> {
    const instance = SocialMediaConnectorFactory.getInstance(platform)
    
    if (!instance || !instance.isConnected) {
      throw new APIError({
        platform,
        code: 'NOT_CONNECTED',
        message: `Platform ${platform} is not connected`,
        retryable: false
      })
    }

    try {
      const userInfo = await instance.connector.getUserInfo()
      return userInfo
    } catch (error) {
      console.error(`Failed to get user info for ${platform}:`, error)
      throw error
    }
  }

  /**
   * Get user information from all connected platforms
   */
  async getAllUserInfo(): Promise<Array<{ platform: SupportedPlatform; userInfo: UserInfo }>> {
    const connectedPlatforms = this.getConnectedPlatforms()
    const results: Array<{ platform: SupportedPlatform; userInfo: UserInfo }> = []

    for (const platform of connectedPlatforms) {
      try {
        const userInfo = await this.getPlatformUserInfo(platform)
        results.push({ platform, userInfo })
      } catch (error) {
        console.warn(`Failed to get user info for ${platform}:`, error)
        // Continue with other platforms
      }
    }

    return results
  }

  /**
   * Create a social media campaign
   */
  createCampaign(
    name: string,
    description: string,
    platforms: SupportedPlatform[],
    startDate: Date,
    endDate: Date
  ): SocialMediaCampaign {
    const campaign: SocialMediaCampaign = {
      id: this.generateCampaignId(),
      name,
      description,
      platforms,
      posts: [],
      startDate,
      endDate,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.campaigns.set(campaign.id, campaign)
    
    console.log(`Created campaign: ${name} for platforms: ${platforms.join(', ')}`)
    
    return campaign
  }

  /**
   * Add a post to a campaign
   */
  addPostToCampaign(
    campaignId: string,
    content: ContentData,
    scheduleTime?: Date
  ): CrossPlatformPost {
    const campaign = this.campaigns.get(campaignId)
    
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`)
    }

    const post: CrossPlatformPost = {
      content,
      platforms: campaign.platforms,
      scheduleTime,
      id: this.generatePostId(),
      status: scheduleTime ? 'scheduled' : 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    campaign.posts.push(post)
    campaign.updatedAt = new Date()

    if (scheduleTime) {
      this.scheduledPosts.set(post.id, post)
    }

    console.log(`Added post to campaign ${campaign.name}`)
    
    return post
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<UnifiedAnalytics> {
    const campaign = this.campaigns.get(campaignId)
    
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`)
    }

    const timeframe: TimeFrame = {
      start: campaign.startDate,
      end: campaign.endDate
    }

    return this.getUnifiedAnalytics(timeframe)
  }

  /**
   * Get platform capabilities
   */
  getPlatformCapabilities(platform: SupportedPlatform): PlatformCapabilities {
    return SocialMediaConnectorFactory.getPlatformCapabilities(platform)
  }

  /**
   * Get platform information
   */
  getPlatformInfo(platform: SupportedPlatform): PlatformInfo {
    return SocialMediaConnectorFactory.getPlatformInfo(platform)
  }

  /**
   * Get all available platforms with their info
   */
  getAllPlatformsInfo(): Array<{ platform: SupportedPlatform; info: PlatformInfo; capabilities: PlatformCapabilities; isConnected: boolean }> {
    const allPlatforms: SupportedPlatform[] = ['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube', 'pinterest', 'reddit']
    
    return allPlatforms.map(platform => ({
      platform,
      info: this.getPlatformInfo(platform),
      capabilities: this.getPlatformCapabilities(platform),
      isConnected: this.isConnected(platform)
    }))
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return SocialMediaConnectorFactory.getUsageStats()
  }

  /**
   * Calculate aggregated metrics from multiple platforms
   */
  private calculateAggregatedMetrics(
    platformData: Array<{ platform: SupportedPlatform; data: AnalyticsData }>
  ): UnifiedAnalytics['aggregated'] {
    let totalImpressions = 0
    let totalReach = 0
    let totalEngagement = 0
    let totalLikes = 0
    let totalComments = 0
    let totalShares = 0
    let totalPosts = 0

    platformData.forEach(({ data }) => {
      const metrics = data.metrics
      totalImpressions += metrics.impressions || 0
      totalReach += metrics.reach || 0
      totalEngagement += metrics.engagement || 0
      totalLikes += metrics.likes || 0
      totalComments += metrics.comments || 0
      totalShares += metrics.shares || 0
      totalPosts += 1
    })

    const averageEngagementRate = totalPosts > 0 ? totalEngagement / totalPosts : 0

    return {
      totalImpressions,
      totalReach,
      totalEngagement,
      totalLikes,
      totalComments,
      totalShares,
      averageEngagementRate
    }
  }

  /**
   * Generate unique post ID
   */
  private generatePostId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Generate unique campaign ID
   */
  private generateCampaignId(): string {
    return `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }
}

// Export singleton instance
export const socialMediaAPI = new SocialMediaAPI()
