/**
 * Base Social Media Connector Interface
 * 
 * This file defines the core interfaces and base classes for social media platform connectors.
 * All platform-specific connectors should extend the BaseSocialMediaConnector class.
 */

export interface AuthCredentials {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes?: string[]
  [key: string]: any
}

export interface AuthResult {
  success: boolean
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  tokenType?: string
  error?: string
  errorCode?: string
}

export interface ContentData {
  text?: string
  media?: MediaData[]
  hashtags?: string[]
  mentions?: string[]
  link?: string
  scheduledTime?: Date
  visibility?: 'public' | 'private' | 'unlisted'
  [key: string]: any
}

export interface MediaData {
  type: 'image' | 'video' | 'gif'
  url: string
  altText?: string
  caption?: string
  thumbnail?: string
}

export interface PostResult {
  success: boolean
  postId?: string
  url?: string
  platform: string
  timestamp: Date
  error?: string
  errorCode?: string
}

export interface AnalyticsData {
  platform: string
  timeframe: TimeFrame
  metrics: {
    impressions?: number
    reach?: number
    engagement?: number
    likes?: number
    comments?: number
    shares?: number
    clicks?: number
    saves?: number
  }
  breakdown?: {
    demographics?: any
    devices?: any
    locations?: any
  }
}

export interface UserInfo {
  id: string
  username: string
  displayName: string
  profilePicture?: string
  bio?: string
  followers?: number
  following?: number
  verified?: boolean
  [key: string]: any
}

export interface TimeFrame {
  start: Date
  end: Date
  granularity?: 'hour' | 'day' | 'week' | 'month'
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: Date
  retryAfter?: number
}

export interface APIError {
  platform: string
  code: string
  message: string
  retryable: boolean
  rateLimitInfo?: RateLimitInfo
  originalError?: any
}

export interface ConnectorConfig {
  platform: string
  baseUrl: string
  version: string
  rateLimits: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  retryConfig: {
    maxRetries: number
    backoffMultiplier: number
    maxBackoffTime: number
  }
}

/**
 * Base class for all social media connectors
 */
export abstract class BaseSocialMediaConnector {
  protected config: ConnectorConfig
  protected accessToken?: string
  protected refreshToken?: string
  protected tokenExpiry?: Date
  protected rateLimitTracker: Map<string, RateLimitInfo> = new Map()

  constructor(config: ConnectorConfig) {
    this.config = config
  }

  /**
   * Authenticate with the platform
   */
  abstract authenticate(credentials: AuthCredentials): Promise<AuthResult>

  /**
   * Refresh the access token
   */
  abstract refreshToken(): Promise<AuthResult>

  /**
   * Post content to the platform
   */
  abstract postContent(content: ContentData): Promise<PostResult>

  /**
   * Get analytics data
   */
  abstract getAnalytics(timeframe: TimeFrame): Promise<AnalyticsData>

  /**
   * Get user information
   */
  abstract getUserInfo(): Promise<UserInfo>

  /**
   * Check if the connector is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && (!this.tokenExpiry || this.tokenExpiry > new Date())
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    if (expiresIn) {
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000)
    }
  }

  /**
   * Make an authenticated API request
   */
  protected async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new APIError({
        platform: this.config.platform,
        code: 'NOT_AUTHENTICATED',
        message: 'Connector is not authenticated',
        retryable: false
      })
    }

    const url = `${this.config.baseUrl}${endpoint}`
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': `AgentDash/${this.config.version}`,
        ...options.headers
      }
    }

    try {
      const response = await fetch(url, requestOptions)
      
      // Handle rate limiting
      if (response.status === 429) {
        const rateLimitInfo = this.extractRateLimitInfo(response.headers)
        this.rateLimitTracker.set(endpoint, rateLimitInfo)
        
        if (retryCount < this.config.retryConfig.maxRetries) {
          const delay = this.calculateBackoffDelay(retryCount, rateLimitInfo)
          await this.sleep(delay)
          return this.makeRequest(endpoint, options, retryCount + 1)
        }
        
        throw new APIError({
          platform: this.config.platform,
          code: 'RATE_LIMITED',
          message: 'Rate limit exceeded',
          retryable: true,
          rateLimitInfo
        })
      }

      // Handle authentication errors
      if (response.status === 401) {
        if (this.refreshToken && retryCount === 0) {
          const refreshResult = await this.refreshToken()
          if (refreshResult.success) {
            return this.makeRequest(endpoint, options, retryCount + 1)
          }
        }
        
        throw new APIError({
          platform: this.config.platform,
          code: 'UNAUTHORIZED',
          message: 'Authentication failed',
          retryable: false
        })
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError({
          platform: this.config.platform,
          code: `HTTP_${response.status}`,
          message: errorData.message || response.statusText,
          retryable: response.status >= 500,
          originalError: errorData
        })
      }

      return response
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      
      throw new APIError({
        platform: this.config.platform,
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown network error',
        retryable: true,
        originalError: error
      })
    }
  }

  /**
   * Extract rate limit information from response headers
   */
  private extractRateLimitInfo(headers: Headers): RateLimitInfo {
    const limit = parseInt(headers.get('X-RateLimit-Limit') || '0')
    const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '0')
    const resetTime = new Date(parseInt(headers.get('X-RateLimit-Reset') || '0') * 1000)
    const retryAfter = parseInt(headers.get('Retry-After') || '0')

    return {
      limit,
      remaining,
      resetTime,
      retryAfter
    }
  }

  /**
   * Calculate backoff delay for retries
   */
  private calculateBackoffDelay(retryCount: number, rateLimitInfo?: RateLimitInfo): number {
    if (rateLimitInfo?.retryAfter) {
      return rateLimitInfo.retryAfter * 1000
    }

    const baseDelay = 1000 // 1 second
    const delay = baseDelay * Math.pow(this.config.retryConfig.backoffMultiplier, retryCount)
    return Math.min(delay, this.config.retryConfig.maxBackoffTime)
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Validate content data
   */
  protected validateContent(content: ContentData): void {
    if (!content.text && !content.media?.length && !content.link) {
      throw new APIError({
        platform: this.config.platform,
        code: 'INVALID_CONTENT',
        message: 'Content must include text, media, or link',
        retryable: false
      })
    }
  }

  /**
   * Get current rate limit info for an endpoint
   */
  getRateLimitInfo(endpoint: string): RateLimitInfo | undefined {
    return this.rateLimitTracker.get(endpoint)
  }

  /**
   * Clear rate limit tracking
   */
  clearRateLimitTracking(): void {
    this.rateLimitTracker.clear()
  }
}

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  public readonly platform: string
  public readonly code: string
  public readonly retryable: boolean
  public readonly rateLimitInfo?: RateLimitInfo
  public readonly originalError?: any

  constructor(error: {
    platform: string
    code: string
    message: string
    retryable: boolean
    rateLimitInfo?: RateLimitInfo
    originalError?: any
  }) {
    super(error.message)
    this.name = 'APIError'
    this.platform = error.platform
    this.code = error.code
    this.retryable = error.retryable
    this.rateLimitInfo = error.rateLimitInfo
    this.originalError = error.originalError
  }
}
