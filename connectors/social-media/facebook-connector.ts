/**
 * Facebook Graph API Connector
 * 
 * Implements the Facebook Graph API for both Facebook Pages and Instagram Business accounts.
 * Supports content posting, analytics, and page management.
 */

import {
  BaseSocialMediaConnector,
  AuthCredentials,
  AuthResult,
  ContentData,
  PostResult,
  AnalyticsData,
  UserInfo,
  TimeFrame,
  ConnectorConfig,
  APIError
} from './base-connector'

export interface FacebookConfig extends ConnectorConfig {
  appId: string
  appSecret: string
  pageId?: string
  instagramAccountId?: string
}

export interface FacebookPage {
  id: string
  name: string
  about?: string
  website?: string
  fan_count?: number
  picture?: {
    data: {
      url: string
    }
  }
  access_token?: string
}

export interface FacebookPost {
  id: string
  message?: string
  created_time: string
  permalink_url: string
  insights?: {
    data: Array<{
      name: string
      values: Array<{
        value: number
        end_time: string
      }>
    }>
  }
}

export interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  caption?: string
  timestamp: string
  permalink: string
  insights?: {
    data: Array<{
      name: string
      values: Array<{
        value: number
        end_time: string
      }>
    }>
  }
}

export class FacebookConnector extends BaseSocialMediaConnector {
  private appId: string
  private appSecret: string
  private pageId?: string
  private instagramAccountId?: string
  private pageAccessToken?: string

  constructor(config: FacebookConfig) {
    super({
      ...config,
      baseUrl: 'https://graph.facebook.com/v18.0',
      version: '18.0',
      rateLimits: {
        requestsPerMinute: 200,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      },
      retryConfig: {
        maxRetries: 3,
        backoffMultiplier: 2,
        maxBackoffTime: 30000
      }
    })
    this.appId = config.appId
    this.appSecret = config.appSecret
    this.pageId = config.pageId
    this.instagramAccountId = config.instagramAccountId
  }

  /**
   * Authenticate with Facebook using OAuth 2.0
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // Step 1: Get authorization code (this would typically be done via redirect)
      const authUrl = this.buildAuthUrl(credentials)
      
      // Step 2: Exchange authorization code for access token
      const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: credentials.redirectUri,
          code: credentials.authorizationCode || ''
        })
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        return {
          success: false,
          error: errorData.error?.message || 'Authentication failed',
          errorCode: errorData.error?.code?.toString()
        }
      }

      const tokenData = await tokenResponse.json()
      
      this.setTokens(tokenData.access_token, undefined, tokenData.expires_in)

      // Get long-lived token
      const longLivedResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${tokenData.access_token}`)
      
      if (longLivedResponse.ok) {
        const longLivedData = await longLivedResponse.json()
        this.setTokens(longLivedData.access_token, undefined, longLivedData.expires_in)
      }

      return {
        success: true,
        accessToken: this.accessToken,
        expiresIn: tokenData.expires_in,
        tokenType: 'Bearer'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }
    }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<AuthResult> {
    // Facebook tokens are long-lived and don't need refresh in the traditional sense
    // But we can extend the token if needed
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${this.accessToken}`)
      
      if (response.ok) {
        const data = await response.json()
        this.setTokens(data.access_token, undefined, data.expires_in)
        
        return {
          success: true,
          accessToken: data.access_token,
          expiresIn: data.expires_in,
          tokenType: 'Bearer'
        }
      }
      
      return {
        success: false,
        error: 'Token refresh failed'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      }
    }
  }

  /**
   * Post content to Facebook Page
   */
  async postContent(content: ContentData): Promise<PostResult> {
    this.validateContent(content)

    try {
      if (!this.pageId) {
        throw new APIError({
          platform: 'facebook',
          code: 'NO_PAGE_ID',
          message: 'Page ID is required for posting',
          retryable: false
        })
      }

      const postData = this.buildPostData(content)
      
      const response = await this.makeRequest(`/${this.pageId}/feed`, {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const result = await response.json()
      
      return {
        success: true,
        postId: result.id,
        url: result.permalink_url,
        platform: 'facebook',
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        platform: 'facebook',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Post failed'
      }
    }
  }

  /**
   * Post content to Instagram
   */
  async postToInstagram(content: ContentData): Promise<PostResult> {
    this.validateContent(content)

    try {
      if (!this.instagramAccountId) {
        throw new APIError({
          platform: 'instagram',
          code: 'NO_INSTAGRAM_ID',
          message: 'Instagram Account ID is required for posting',
          retryable: false
        })
      }

      // Step 1: Create media container
      const mediaData = this.buildInstagramMediaData(content)
      const containerResponse = await this.makeRequest(`/${this.instagramAccountId}/media`, {
        method: 'POST',
        body: JSON.stringify(mediaData)
      })

      const containerResult = await containerResponse.json()
      const creationId = containerResult.id

      // Step 2: Publish the media
      const publishResponse = await this.makeRequest(`/${this.instagramAccountId}/media_publish`, {
        method: 'POST',
        body: JSON.stringify({
          creation_id: creationId
        })
      })

      const publishResult = await publishResponse.json()
      
      return {
        success: true,
        postId: publishResult.id,
        url: `https://www.instagram.com/p/${publishResult.id}/`,
        platform: 'instagram',
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        platform: 'instagram',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Instagram post failed'
      }
    }
  }

  /**
   * Get analytics data for Facebook Page
   */
  async getAnalytics(timeframe: TimeFrame): Promise<AnalyticsData> {
    try {
      if (!this.pageId) {
        throw new APIError({
          platform: 'facebook',
          code: 'NO_PAGE_ID',
          message: 'Page ID is required for analytics',
          retryable: false
        })
      }

      const metrics = [
        'page_impressions',
        'page_reach',
        'page_engaged_users',
        'page_post_engagements',
        'page_fan_adds',
        'page_fan_removes'
      ]

      const response = await this.makeRequest(`/${this.pageId}/insights?metric=${metrics.join(',')}&period=day&since=${Math.floor(timeframe.start.getTime() / 1000)}&until=${Math.floor(timeframe.end.getTime() / 1000)}`)
      
      const data = await response.json()
      
      // Process insights data
      const metricsData = this.processInsightsData(data.data || [])
      
      return {
        platform: 'facebook',
        timeframe,
        metrics: metricsData
      }
    } catch (error) {
      throw new APIError({
        platform: 'facebook',
        code: 'ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get analytics',
        retryable: true
      })
    }
  }

  /**
   * Get Instagram analytics
   */
  async getInstagramAnalytics(timeframe: TimeFrame): Promise<AnalyticsData> {
    try {
      if (!this.instagramAccountId) {
        throw new APIError({
          platform: 'instagram',
          code: 'NO_INSTAGRAM_ID',
          message: 'Instagram Account ID is required for analytics',
          retryable: false
        })
      }

      const metrics = [
        'impressions',
        'reach',
        'profile_views',
        'website_clicks',
        'email_contacts',
        'phone_call_clicks',
        'text_message_clicks',
        'get_directions_clicks'
      ]

      const response = await this.makeRequest(`/${this.instagramAccountId}/insights?metric=${metrics.join(',')}&period=day&since=${Math.floor(timeframe.start.getTime() / 1000)}&until=${Math.floor(timeframe.end.getTime() / 1000)}`)
      
      const data = await response.json()
      
      const metricsData = this.processInsightsData(data.data || [])
      
      return {
        platform: 'instagram',
        timeframe,
        metrics: metricsData
      }
    } catch (error) {
      throw new APIError({
        platform: 'instagram',
        code: 'ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get Instagram analytics',
        retryable: true
      })
    }
  }

  /**
   * Get user information (Facebook Page info)
   */
  async getUserInfo(): Promise<UserInfo> {
    try {
      if (!this.pageId) {
        throw new APIError({
          platform: 'facebook',
          code: 'NO_PAGE_ID',
          message: 'Page ID is required',
          retryable: false
        })
      }

      const response = await this.makeRequest(`/${this.pageId}?fields=id,name,about,website,fan_count,picture`)
      
      const page = await response.json()
      
      return {
        id: page.id,
        username: page.name,
        displayName: page.name,
        profilePicture: page.picture?.data?.url,
        bio: page.about,
        followers: page.fan_count,
        verified: false
      }
    } catch (error) {
      throw new APIError({
        platform: 'facebook',
        code: 'PROFILE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get user info',
        retryable: true
      })
    }
  }

  /**
   * Get user's pages
   */
  async getUserPages(): Promise<FacebookPage[]> {
    try {
      const response = await this.makeRequest('/me/accounts?fields=id,name,access_token,fan_count,picture')
      const data = await response.json()
      
      return data.data || []
    } catch (error) {
      throw new APIError({
        platform: 'facebook',
        code: 'PAGES_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get pages',
        retryable: true
      })
    }
  }

  /**
   * Get Instagram account info
   */
  async getInstagramAccountInfo(): Promise<UserInfo> {
    try {
      if (!this.instagramAccountId) {
        throw new APIError({
          platform: 'instagram',
          code: 'NO_INSTAGRAM_ID',
          message: 'Instagram Account ID is required',
          retryable: false
        })
      }

      const response = await this.makeRequest(`/${this.instagramAccountId}?fields=id,username,account_type,media_count`)
      
      const account = await response.json()
      
      return {
        id: account.id,
        username: account.username,
        displayName: account.username,
        verified: account.account_type === 'BUSINESS'
      }
    } catch (error) {
      throw new APIError({
        platform: 'instagram',
        code: 'INSTAGRAM_PROFILE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get Instagram account info',
        retryable: true
      })
    }
  }

  /**
   * Build OAuth authorization URL
   */
  private buildAuthUrl(credentials: AuthCredentials): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: credentials.redirectUri,
      scope: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish',
      response_type: 'code',
      state: this.generateState()
    })

    return `https://www.facebook.com/v18.0/dialog/oauth?${params}`
  }

  /**
   * Build post data for Facebook API
   */
  private buildPostData(content: ContentData): any {
    const postData: any = {
      message: content.text || ''
    }

    // Add link if present
    if (content.link) {
      postData.link = content.link
    }

    // Add media if present
    if (content.media?.length) {
      // For Facebook, you would typically upload photos first
      // and then reference them in the post
      postData.attached_media = content.media.map(media => ({
        media_fbid: 'media_id_placeholder'
      }))
    }

    return postData
  }

  /**
   * Build Instagram media data
   */
  private buildInstagramMediaData(content: ContentData): any {
    if (!content.media?.length) {
      throw new APIError({
        platform: 'instagram',
        code: 'NO_MEDIA',
        message: 'Instagram posts require media',
        retryable: false
      })
    }

    const media = content.media[0] // Instagram typically supports one media item per post
    
    return {
      image_url: media.url,
      caption: content.text || '',
      access_token: this.accessToken
    }
  }

  /**
   * Process insights data from Facebook API
   */
  private processInsightsData(insights: any[]): any {
    const metrics: any = {}
    
    insights.forEach(insight => {
      const name = insight.name
      const values = insight.values || []
      
      if (values.length > 0) {
        const totalValue = values.reduce((sum: number, value: any) => sum + (value.value || 0), 0)
        
        switch (name) {
          case 'page_impressions':
          case 'impressions':
            metrics.impressions = totalValue
            break
          case 'page_reach':
          case 'reach':
            metrics.reach = totalValue
            break
          case 'page_engaged_users':
            metrics.engagement = totalValue
            break
          case 'page_post_engagements':
            metrics.engagement = totalValue
            break
        }
      }
    })
    
    return metrics
  }

  /**
   * Generate random state for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Override makeRequest to handle Facebook's specific authentication
   */
  protected async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError({
          platform: this.config.platform,
          code: `HTTP_${response.status}`,
          message: errorData.error?.message || response.statusText,
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
   * Extract rate limit information from Facebook response headers
   */
  private extractRateLimitInfo(headers: Headers): any {
    const limit = parseInt(headers.get('x-app-usage') || '0')
    const remaining = parseInt(headers.get('x-page-usage') || '0')
    const resetTime = new Date(Date.now() + 3600000) // Facebook resets hourly

    return {
      limit,
      remaining,
      resetTime
    }
  }

  /**
   * Calculate backoff delay for retries
   */
  private calculateBackoffDelay(retryCount: number, rateLimitInfo?: any): number {
    if (rateLimitInfo?.retryAfter) {
      return rateLimitInfo.retryAfter * 1000
    }

    const baseDelay = 1000
    const delay = baseDelay * Math.pow(this.config.retryConfig.backoffMultiplier, retryCount)
    return Math.min(delay, this.config.retryConfig.maxBackoffTime)
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
