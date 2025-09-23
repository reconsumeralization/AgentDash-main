/**
 * LinkedIn API Connector
 * 
 * Implements the LinkedIn API v2 for professional networking features.
 * Supports profile management, content sharing, and company page operations.
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

export interface LinkedInConfig extends ConnectorConfig {
  scopes: string[]
  companyId?: string
}

export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
  headline?: string
  summary?: string
  location?: string
  industry?: string
  publicProfileUrl?: string
}

export interface LinkedInPost {
  id: string
  author: string
  text: string
  createdAt: Date
  visibility: 'PUBLIC' | 'CONNECTIONS'
  engagement?: {
    likes: number
    comments: number
    shares: number
  }
}

export class LinkedInConnector extends BaseSocialMediaConnector {
  private scopes: string[]
  private companyId?: string

  constructor(config: LinkedInConfig) {
    super({
      ...config,
      baseUrl: 'https://api.linkedin.com/v2',
      version: '2.0.0',
      rateLimits: {
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      },
      retryConfig: {
        maxRetries: 3,
        backoffMultiplier: 2,
        maxBackoffTime: 30000
      }
    })
    this.scopes = config.scopes
    this.companyId = config.companyId
  }

  /**
   * Authenticate with LinkedIn using OAuth 2.0
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // Step 1: Get authorization code (this would typically be done via redirect)
      const authUrl = this.buildAuthUrl(credentials)
      
      // For server-side applications, you would redirect the user to this URL
      // and handle the callback to get the authorization code
      
      // Step 2: Exchange authorization code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: credentials.authorizationCode || '',
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          redirect_uri: credentials.redirectUri
        })
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        return {
          success: false,
          error: errorData.error_description || 'Authentication failed',
          errorCode: errorData.error
        }
      }

      const tokenData = await tokenResponse.json()
      
      this.setTokens(
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_in
      )

      return {
        success: true,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type
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
    if (!this.refreshToken) {
      return {
        success: false,
        error: 'No refresh token available'
      }
    }

    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.config.platform, // This should be the client ID
          client_secret: 'client_secret' // This should be the client secret
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.error_description || 'Token refresh failed',
          errorCode: errorData.error
        }
      }

      const tokenData = await response.json()
      this.setTokens(
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_in
      )

      return {
        success: true,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      }
    }
  }

  /**
   * Post content to LinkedIn
   */
  async postContent(content: ContentData): Promise<PostResult> {
    this.validateContent(content)

    try {
      const postData = this.buildPostData(content)
      
      const response = await this.makeRequest('/shares', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const result = await response.json()
      
      return {
        success: true,
        postId: result.id,
        url: result.permalink,
        platform: 'linkedin',
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        platform: 'linkedin',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Post failed'
      }
    }
  }

  /**
   * Get analytics data for LinkedIn posts
   */
  async getAnalytics(timeframe: TimeFrame): Promise<AnalyticsData> {
    try {
      const response = await this.makeRequest('/shares', {
        method: 'GET'
      })

      const data = await response.json()
      
      // Calculate aggregated metrics
      const metrics = this.calculateMetrics(data.elements || [])
      
      return {
        platform: 'linkedin',
        timeframe,
        metrics
      }
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get analytics',
        retryable: true
      })
    }
  }

  /**
   * Get user profile information
   */
  async getUserInfo(): Promise<UserInfo> {
    try {
      const response = await this.makeRequest('/people/~?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline,summary,location,industry,publicProfileUrl)')
      
      const profile = await response.json()
      
      return {
        id: profile.id,
        username: profile.publicProfileUrl?.split('/').pop() || '',
        displayName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
        bio: profile.headline,
        verified: false // LinkedIn doesn't have a verified badge system
      }
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'PROFILE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get user info',
        retryable: true
      })
    }
  }

  /**
   * Get company page information
   */
  async getCompanyInfo(companyId?: string): Promise<any> {
    const id = companyId || this.companyId
    if (!id) {
      throw new APIError({
        platform: 'linkedin',
        code: 'NO_COMPANY_ID',
        message: 'Company ID is required',
        retryable: false
      })
    }

    try {
      const response = await this.makeRequest(`/organizations/${id}?projection=(id,name,description,websiteUrl,logoV2(original~:playableStreams))`)
      return await response.json()
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'COMPANY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get company info',
        retryable: true
      })
    }
  }

  /**
   * Get user's connections
   */
  async getConnections(): Promise<any[]> {
    try {
      const response = await this.makeRequest('/people/~/connections?projection=(elements*(id,firstName,lastName,headline))')
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'CONNECTIONS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get connections',
        retryable: true
      })
    }
  }

  /**
   * Build OAuth authorization URL
   */
  private buildAuthUrl(credentials: AuthCredentials): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: credentials.clientId,
      redirect_uri: credentials.redirectUri,
      scope: this.scopes.join(' '),
      state: this.generateState()
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`
  }

  /**
   * Build post data for LinkedIn API
   */
  private buildPostData(content: ContentData): any {
    const postData: any = {
      author: 'urn:li:person:' + this.getUserId(), // This would need to be implemented
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text || ''
          },
          shareMediaCategory: content.media?.length ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': content.visibility?.toUpperCase() || 'PUBLIC'
      }
    }

    // Add media if present
    if (content.media?.length) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = content.media.map(media => ({
        status: 'READY',
        description: {
          text: media.caption || ''
        },
        media: media.url,
        title: {
          text: media.altText || ''
        }
      }))
    }

    return postData
  }

  /**
   * Calculate aggregated metrics from posts
   */
  private calculateMetrics(posts: any[]): any {
    return posts.reduce((acc, post) => {
      const engagement = post.engagement || {}
      acc.likes = (acc.likes || 0) + (engagement.likes || 0)
      acc.comments = (acc.comments || 0) + (engagement.comments || 0)
      acc.shares = (acc.shares || 0) + (engagement.shares || 0)
      acc.impressions = (acc.impressions || 0) + (engagement.impressions || 0)
      return acc
    }, {})
  }

  /**
   * Generate random state for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Get user ID from access token (simplified implementation)
   */
  private getUserId(): string {
    // In a real implementation, you would decode the JWT token or make an API call
    // to get the user ID. This is a placeholder.
    return 'user_id_placeholder'
  }
}
