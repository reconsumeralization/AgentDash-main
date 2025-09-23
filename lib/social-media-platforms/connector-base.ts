/**
 * 🔌 SOCIAL MEDIA CONNECTOR BASE
 * Base class for platform-specific connectors with common functionality
 */

import { 
  PlatformId, 
  PlatformConfig, 
  PlatformConnection, 
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
} from './types'
import { getPlatformCapabilities } from './capability-matrix'

export abstract class SocialMediaConnector {
  protected platformId: PlatformId
  protected config: PlatformConfig
  protected connection: PlatformConnection | null = null
  protected rateLimitInfo: RateLimitInfo | null = null

  constructor(platformId: PlatformId, config: PlatformConfig) {
    this.platformId = platformId
    this.config = config
  }

  // Abstract methods that must be implemented by platform-specific connectors
  abstract authenticate(accessToken: string, refreshToken?: string): Promise<PlatformConnection>
  abstract refreshToken(refreshToken: string): Promise<PlatformConnection>
  abstract revokeToken(): Promise<void>

  // Content operations
  abstract createPost(content: any): Promise<UnifiedPost>
  abstract updatePost(postId: string, content: any): Promise<UnifiedPost>
  abstract deletePost(postId: string): Promise<void>
  abstract getPost(postId: string): Promise<UnifiedPost>
  abstract getPosts(filters?: any): Promise<UnifiedPost[]>

  // User operations
  abstract getCurrentUser(): Promise<UnifiedUser>
  abstract getUser(userId: string): Promise<UnifiedUser>
  abstract searchUsers(query: string, filters?: any): Promise<UnifiedUser[]>

  // Engagement operations
  abstract likePost(postId: string): Promise<void>
  abstract unlikePost(postId: string): Promise<void>
  abstract createComment(postId: string, content: string): Promise<UnifiedComment>
  abstract getComments(postId: string, filters?: any): Promise<UnifiedComment[]>
  abstract sharePost(postId: string, message?: string): Promise<void>

  // Messaging operations
  abstract sendMessage(recipientId: string, content: any): Promise<UnifiedMessage>
  abstract getMessages(conversationId?: string, filters?: any): Promise<UnifiedMessage[]>
  abstract getConversations(): Promise<any[]>

  // Analytics operations
  abstract getAnalytics(entityId: string, entityType: string, period: any): Promise<UnifiedAnalytics>
  abstract getEngagementMetrics(postId: string): Promise<any>

  // Search operations
  abstract searchPosts(query: string, filters?: any): Promise<UnifiedPost[]>
  abstract searchHashtags(query: string): Promise<any[]>

  // Webhook operations
  abstract setupWebhook(webhookUrl: string, events: string[]): Promise<void>
  abstract deleteWebhook(webhookId: string): Promise<void>
  abstract verifyWebhook(payload: any, signature: string): Promise<boolean>
  abstract processWebhook(payload: any): Promise<WebhookPayload>

  // Bulk operations
  abstract importData(type: string, options: any): Promise<BulkOperation>
  abstract exportData(type: string, options: any): Promise<BulkOperation>
  abstract getBulkOperationStatus(operationId: string): Promise<BulkOperation>

  // Common utility methods
  protected async makeRequest(
    endpoint: string, 
    options: RequestInit = {}, 
    retryCount: number = 0
  ): Promise<Response> {
    const maxRetries = 3
    const baseDelay = 1000

    try {
      // Check rate limits
      await this.checkRateLimit(endpoint)

      // Add authentication headers
      const headers = {
        'Authorization': `Bearer ${this.connection?.accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AgentDash/1.0',
        ...options.headers
      }

      // Make the request
      const response = await fetch(`${this.config.api.baseUrl}${endpoint}`, {
        ...options,
        headers
      })

      // Update rate limit info from response headers
      this.updateRateLimitInfo(response, endpoint)

      // Handle rate limit errors
      if (response.status === 429) {
        if (retryCount < maxRetries) {
          const retryAfter = this.getRetryAfter(response)
          await this.delay(retryAfter)
          return this.makeRequest(endpoint, options, retryCount + 1)
        }
        throw this.createRateLimitError(response)
      }

      // Handle authentication errors
      if (response.status === 401) {
        if (this.connection?.refreshToken && retryCount === 0) {
          await this.refreshToken(this.connection.refreshToken)
          return this.makeRequest(endpoint, options, retryCount + 1)
        }
        throw await this.createAuthError(response)
      }

      // Handle other errors
      if (!response.ok) {
        throw this.createPlatformError(response, endpoint)
      }

      return response

    } catch (error) {
      if (retryCount < maxRetries && this.isRetryableError(error)) {
        const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000
        await this.delay(delay)
        return this.makeRequest(endpoint, options, retryCount + 1)
      }
      throw error
    }
  }

  protected async checkRateLimit(endpoint: string): Promise<void> {
    if (!this.rateLimitInfo) return

    const now = Date.now()
    if (now < this.rateLimitInfo.resetAt.getTime() && this.rateLimitInfo.remaining <= 0) {
      const waitTime = this.rateLimitInfo.resetAt.getTime() - now
      throw new Error(`Rate limit exceeded. Retry after ${waitTime}ms`)
    }
  }

  protected updateRateLimitInfo(response: Response, endpoint: string): void {
    const limit = response.headers.get('X-RateLimit-Limit')
    const remaining = response.headers.get('X-RateLimit-Remaining')
    const reset = response.headers.get('X-RateLimit-Reset')

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        platform: this.platformId,
        endpoint,
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        resetAt: new Date(parseInt(reset) * 1000)
      }
    }
  }

  protected getRetryAfter(response: Response): number {
    const retryAfter = response.headers.get('Retry-After')
    return retryAfter ? parseInt(retryAfter) * 1000 : 60000 // Default 1 minute
  }

  protected createRateLimitError(response: Response): PlatformError {
    return {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit exceeded',
      platform: this.platformId,
      statusCode: 429,
      retryable: true,
      details: {
        retryAfter: this.getRetryAfter(response)
      }
    }
  }

  protected async createAuthError(response: Response): Promise<PlatformError> {
    return {
      code: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
      platform: this.platformId,
      statusCode: 401,
      retryable: false,
      details: {
        response: await response.text()
      }
    }
  }

  protected createPlatformError(response: Response, endpoint: string): PlatformError {
    return {
      code: 'PLATFORM_ERROR',
      message: `Platform error: ${response.status} ${response.statusText}`,
      platform: this.platformId,
      endpoint,
      statusCode: response.status,
      retryable: response.status >= 500,
      details: {
        response: response.text()
      }
    }
  }

  protected isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      return error.message.includes('network') || 
             error.message.includes('timeout') ||
             error.message.includes('ECONNRESET')
    }
    return false
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Content validation
  protected validateContent(content: any): void {
    const capabilities = getPlatformCapabilities(this.platformId)
    const constraints = capabilities.constraints

    if (content.text && content.text.length > constraints.maxTextLength) {
      throw new Error(`Text too long. Maximum ${constraints.maxTextLength} characters allowed.`)
    }

    if (content.media && content.media.length > constraints.maxMediaCount) {
      throw new Error(`Too many media files. Maximum ${constraints.maxMediaCount} allowed.`)
    }

    if (content.media) {
      for (const media of content.media) {
        if (!constraints.supportedMediaTypes.includes(media.type)) {
          throw new Error(`Unsupported media type: ${media.type}`)
        }

        if (media.size > constraints.maxVideoSize) {
          throw new Error(`Media file too large. Maximum ${constraints.maxVideoSize} bytes allowed.`)
        }
      }
    }
  }

  // Content transformation
  protected transformContent(content: any, targetPlatform?: PlatformId): any {
    if (!targetPlatform || targetPlatform === this.platformId) {
      return content
    }

    const sourceCapabilities = getPlatformCapabilities(this.platformId)
    const targetCapabilities = getPlatformCapabilities(targetPlatform)

    // Truncate text if target platform has shorter limit
    if (content.text && content.text.length > targetCapabilities.constraints.maxTextLength) {
      content.text = content.text.substring(0, targetCapabilities.constraints.maxTextLength - 3) + '...'
    }

    // Filter media if target platform supports fewer files
    if (content.media && content.media.length > targetCapabilities.constraints.maxMediaCount) {
      content.media = content.media.slice(0, targetCapabilities.constraints.maxMediaCount)
    }

    // Filter media types
    if (content.media) {
      content.media = content.media.filter((media: any) => 
        targetCapabilities.constraints.supportedMediaTypes.includes(media.type)
      )
    }

    // Remove hashtags if not supported
    if (!targetCapabilities.constraints.hashtagSupport && content.hashtags) {
      content.hashtags = []
    }

    // Remove mentions if not supported
    if (!targetCapabilities.constraints.mentionSupport && content.mentions) {
      content.mentions = []
    }

    return content
  }

  // Connection management
  public setConnection(connection: PlatformConnection): void {
    this.connection = connection
  }

  public getConnection(): PlatformConnection | null {
    return this.connection
  }

  public isConnected(): boolean {
    return this.connection !== null && this.connection.status === 'active'
  }

  public getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo
  }

  // Platform information
  public getPlatformId(): PlatformId {
    return this.platformId
  }

  public getCapabilities() {
    return getPlatformCapabilities(this.platformId)
  }

  public supportsFeature(feature: keyof ReturnType<typeof getPlatformCapabilities>): boolean {
    const capabilities = this.getCapabilities()
    return Boolean(capabilities[feature])
  }
}
