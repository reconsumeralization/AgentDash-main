/**
 * Twitter/X API Connector
 * 
 * Implements the Twitter API v2 for social media management.
 * Supports posting tweets, retrieving user data, and analytics.
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

export interface TwitterConfig extends ConnectorConfig {
  bearerToken?: string
  apiKey?: string
  apiSecret?: string
}

export interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url?: string
  description?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
  verified?: boolean
}

export interface TwitterTweet {
  id: string
  text: string
  created_at: string
  author_id: string
  public_metrics?: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  attachments?: {
    media_keys?: string[]
  }
}

export class TwitterConnector extends BaseSocialMediaConnector {
  private bearerToken?: string
  private apiKey?: string
  private apiSecret?: string

  constructor(config: TwitterConfig) {
    super({
      ...config,
      baseUrl: 'https://api.twitter.com/2',
      version: '2.0.0',
      rateLimits: {
        requestsPerMinute: 300,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      },
      retryConfig: {
        maxRetries: 3,
        backoffMultiplier: 2,
        maxBackoffTime: 30000
      }
    })
    this.bearerToken = config.bearerToken
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
  }

  /**
   * Authenticate with Twitter using OAuth 2.0
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // For Twitter API v2, we can use Bearer Token authentication
      if (credentials.bearerToken) {
        this.bearerToken = credentials.bearerToken
        this.setTokens(credentials.bearerToken)
        
        // Verify the token by making a test request
        const response = await fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${credentials.bearerToken}`
          }
        })

        if (response.ok) {
          return {
            success: true,
            accessToken: credentials.bearerToken,
            tokenType: 'Bearer'
          }
        }
      }

      // OAuth 2.0 flow for user authentication
      const authUrl = this.buildAuthUrl(credentials)
      
      // In a real implementation, you would redirect the user to this URL
      // and handle the callback to get the authorization code
      
      return {
        success: false,
        error: 'OAuth flow not implemented in this example'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }
    }
  }

  /**
   * Refresh the access token (Twitter doesn't use refresh tokens in the same way)
   */
  async refreshToken(): Promise<AuthResult> {
    return {
      success: false,
      error: 'Twitter API v2 does not support token refresh in the traditional sense'
    }
  }

  /**
   * Post a tweet
   */
  async postContent(content: ContentData): Promise<PostResult> {
    this.validateContent(content)

    try {
      const tweetData = this.buildTweetData(content)
      
      const response = await this.makeRequest('/tweets', {
        method: 'POST',
        body: JSON.stringify(tweetData)
      })

      const result = await response.json()
      
      return {
        success: true,
        postId: result.data.id,
        url: `https://twitter.com/user/status/${result.data.id}`,
        platform: 'twitter',
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        platform: 'twitter',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Tweet failed'
      }
    }
  }

  /**
   * Get analytics data for tweets
   */
  async getAnalytics(timeframe: TimeFrame): Promise<AnalyticsData> {
    try {
      // Get user's tweets from the timeframe
      const tweets = await this.getUserTweets(timeframe)
      
      // Calculate aggregated metrics
      const metrics = this.calculateMetrics(tweets)
      
      return {
        platform: 'twitter',
        timeframe,
        metrics
      }
    } catch (error) {
      throw new APIError({
        platform: 'twitter',
        code: 'ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get analytics',
        retryable: true
      })
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<UserInfo> {
    try {
      const response = await this.makeRequest('/users/me?user.fields=public_metrics,verified,description,profile_image_url')
      
      const user = await response.json()
      const userData = user.data
      
      return {
        id: userData.id,
        username: userData.username,
        displayName: userData.name,
        profilePicture: userData.profile_image_url,
        bio: userData.description,
        followers: userData.public_metrics?.followers_count,
        following: userData.public_metrics?.following_count,
        verified: userData.verified
      }
    } catch (error) {
      throw new APIError({
        platform: 'twitter',
        code: 'PROFILE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get user info',
        retryable: true
      })
    }
  }

  /**
   * Get user's tweets
   */
  async getUserTweets(timeframe?: TimeFrame): Promise<TwitterTweet[]> {
    try {
      const params = new URLSearchParams({
        'tweet.fields': 'created_at,public_metrics,attachments',
        'max_results': '100'
      })

      if (timeframe) {
        params.append('start_time', timeframe.start.toISOString())
        params.append('end_time', timeframe.end.toISOString())
      }

      const response = await this.makeRequest(`/users/me/tweets?${params}`)
      const data = await response.json()
      
      return data.data || []
    } catch (error) {
      throw new APIError({
        platform: 'twitter',
        code: 'TWEETS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get tweets',
        retryable: true
      })
    }
  }

  /**
   * Get tweet by ID
   */
  async getTweet(tweetId: string): Promise<TwitterTweet> {
    try {
      const response = await this.makeRequest(`/tweets/${tweetId}?tweet.fields=created_at,public_metrics,attachments`)
      const data = await response.json()
      
      return data.data
    } catch (error) {
      throw new APIError({
        platform: 'twitter',
        code: 'TWEET_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get tweet',
        retryable: true
      })
    }
  }

  /**
   * Search tweets
   */
  async searchTweets(query: string, maxResults = 10): Promise<TwitterTweet[]> {
    try {
      const params = new URLSearchParams({
        query,
        'tweet.fields': 'created_at,public_metrics,author_id',
        'max_results': maxResults.toString()
      })

      const response = await this.makeRequest(`/tweets/search/recent?${params}`)
      const data = await response.json()
      
      return data.data || []
    } catch (error) {
      throw new APIError({
        platform: 'twitter',
        code: 'SEARCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to search tweets',
        retryable: true
      })
    }
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(woeid = 1): Promise<any[]> {
    try {
      // Note: This would require Twitter API v1.1 endpoint
      // For v2, you might need to use the academic research track
      const response = await this.makeRequest(`/trends/by/woeid/${woeid}`)
      const data = await response.json()
      
      return data[0]?.trends || []
    } catch (error) {
      throw new APIError({
        platform: 'twitter',
        code: 'TRENDS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get trending topics',
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
      scope: 'tweet.read tweet.write users.read',
      state: this.generateState()
    })

    return `https://twitter.com/i/oauth2/authorize?${params}`
  }

  /**
   * Build tweet data for Twitter API
   */
  private buildTweetData(content: ContentData): any {
    const tweetData: any = {
      text: content.text || ''
    }

    // Add media if present (requires media upload first)
    if (content.media?.length) {
      // In a real implementation, you would upload media first
      // and then reference the media IDs in the tweet
      tweetData.media = {
        media_ids: content.media.map(media => 'media_id_placeholder')
      }
    }

    // Add reply settings if this is a reply
    if (content.replyToTweetId) {
      tweetData.reply = {
        in_reply_to_tweet_id: content.replyToTweetId
      }
    }

    return tweetData
  }

  /**
   * Calculate aggregated metrics from tweets
   */
  private calculateMetrics(tweets: TwitterTweet[]): any {
    return tweets.reduce((acc, tweet) => {
      const metrics = tweet.public_metrics || {}
      acc.likes = (acc.likes || 0) + (metrics.like_count || 0)
      acc.retweets = (acc.retweets || 0) + (metrics.retweet_count || 0)
      acc.replies = (acc.replies || 0) + (metrics.reply_count || 0)
      acc.quotes = (acc.quotes || 0) + (metrics.quote_count || 0)
      acc.impressions = (acc.impressions || 0) + (metrics.impression_count || 0)
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
   * Override makeRequest to handle Twitter's specific authentication
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
        'Authorization': `Bearer ${this.bearerToken}`,
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
          message: errorData.detail || response.statusText,
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
   * Extract rate limit information from Twitter response headers
   */
  private extractRateLimitInfo(headers: Headers): any {
    const limit = parseInt(headers.get('x-rate-limit-limit') || '0')
    const remaining = parseInt(headers.get('x-rate-limit-remaining') || '0')
    const resetTime = new Date(parseInt(headers.get('x-rate-limit-reset') || '0') * 1000)

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
