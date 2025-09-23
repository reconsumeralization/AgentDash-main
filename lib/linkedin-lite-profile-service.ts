/**
 * LinkedIn Lite Profile Service
 * Specialized service for LinkedIn Lite Profile API integration
 * Based on: https://learn.microsoft.com/en-us/linkedin/shared/references/v2/profile/lite-profile
 */

import { errorHandler, ErrorCategory } from './error-handling'
import { performanceMonitor } from './performance-monitor'

export interface LinkedInLiteProfile {
  id: string
  firstName: string
  localizedFirstName: string
  lastName: string
  localizedLastName: string
  profilePicture?: {
    displayImageUrl?: string
    elements?: Array<{
      identifiers: Array<{
        identifier: string
        index: number
        mediaType: string
        file: string
        identifierType: string
        identifierExpiresInSeconds: number
      }>
      data?: {
        width: number
        height: number
      }
    }>
  }
}

export interface LinkedInLiteProfileConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  baseUrl: string
  apiVersion: string
}

export class LinkedInLiteProfileService {
  private config: LinkedInLiteProfileConfig
  private accessToken?: string
  private tokenExpiry?: Date

  constructor(config: LinkedInLiteProfileConfig) {
    this.config = {
      baseUrl: 'https://api.linkedin.com',
      apiVersion: '202412',
      ...config
    }
  }

  /**
   * Generate OAuth authorization URL for Lite Profile access
   * Requires r_liteprofile scope
   */
  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
      scope: 'r_liteprofile' // Required scope for lite profile access
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<{
    access_token: string
    expires_in: number
    scope: string
    token_type: string
  }> {
    const perfLogger = performanceMonitor.createPerformanceLogger('linkedin_lite_token_exchange')
    
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          state
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      
      this.accessToken = data.access_token
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000)
      
      perfLogger.finish()
      
      return data
    } catch (error) {
      errorHandler.log('error', 'Failed to exchange LinkedIn authorization code', {
        category: ErrorCategory.API,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
      throw error
    }
  }

  /**
   * Get LinkedIn Lite Profile
   * Fetches basic profile information using the Lite Profile API
   */
  async getLiteProfile(accessToken?: string): Promise<LinkedInLiteProfile> {
    const token = accessToken || this.accessToken
    if (!token) {
      throw new Error('No access token available')
    }

    const perfLogger = performanceMonitor.createPerformanceLogger('linkedin_lite_profile')
    
    try {
      // Use the Lite Profile endpoint with proper projection
      const response = await this.makeApiRequest('/v2/people/~', token, {
        projection: '(id,firstName,lastName,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))'
      })

      const profile: LinkedInLiteProfile = {
        id: response.id,
        firstName: response.firstName?.localized?.en_US || '',
        localizedFirstName: response.localizedFirstName || '',
        lastName: response.lastName?.localized?.en_US || '',
        localizedLastName: response.localizedLastName || '',
        profilePicture: response.profilePicture ? {
          displayImageUrl: this.extractDisplayImageUrl(response.profilePicture),
          elements: response.profilePicture['displayImage~']?.elements || []
        } : undefined
      }

      perfLogger.finish()
      return profile
    } catch (error) {
      errorHandler.log('error', 'Failed to get LinkedIn lite profile', {
        category: ErrorCategory.API,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
      throw error
    }
  }

  /**
   * Get multiple lite profiles by IDs
   * Useful for batch processing in news synthesis
   */
  async getMultipleLiteProfiles(userIds: string[], accessToken?: string): Promise<LinkedInLiteProfile[]> {
    const token = accessToken || this.accessToken
    if (!token) {
      throw new Error('No access token available')
    }

    const perfLogger = performanceMonitor.createPerformanceLogger('linkedin_multiple_lite_profiles')
    
    try {
      // LinkedIn API supports batch requests for multiple profiles
      const idsParam = userIds.map(id => `id:${id}`).join(',')
      
      const response = await this.makeApiRequest('/v2/people', token, {
        ids: `List(${idsParam})`,
        projection: '(id,firstName,lastName,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))'
      })

      const profiles: LinkedInLiteProfile[] = Object.values(response.results || {}).map((profile: any) => ({
        id: profile.id,
        firstName: profile.firstName?.localized?.en_US || '',
        localizedFirstName: profile.localizedFirstName || '',
        lastName: profile.lastName?.localized?.en_US || '',
        localizedLastName: profile.localizedLastName || '',
        profilePicture: profile.profilePicture ? {
          displayImageUrl: this.extractDisplayImageUrl(profile.profilePicture),
          elements: profile.profilePicture['displayImage~']?.elements || []
        } : undefined
      }))

      perfLogger.finish()
      return profiles
    } catch (error) {
      errorHandler.log('error', 'Failed to get multiple LinkedIn lite profiles', {
        category: ErrorCategory.API,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
      throw error
    }
  }

  /**
   * Extract display image URL from profile picture data
   */
  private extractDisplayImageUrl(profilePicture: any): string | undefined {
    if (!profilePicture || !profilePicture['displayImage~']) {
      return undefined
    }

    const elements = profilePicture['displayImage~'].elements
    if (!elements || elements.length === 0) {
      return undefined
    }

    // Get the highest resolution image available
    const sortedElements = elements.sort((a: any, b: any) => {
      const aSize = (a.data?.width || 0) * (a.data?.height || 0)
      const bSize = (b.data?.width || 0) * (b.data?.height || 0)
      return bSize - aSize
    })

    return sortedElements[0]?.identifiers?.[0]?.identifier
  }

  /**
   * Make authenticated API request to LinkedIn
   */
  private async makeApiRequest(
    endpoint: string, 
    accessToken: string, 
    queryParams?: Record<string, any>
  ): Promise<any> {
    let url = `${this.config.baseUrl}${endpoint}`
    
    // Add query parameters if provided
    if (queryParams) {
      const params = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'LinkedIn-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LinkedIn API request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Check if token is valid and not expired
   */
  isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false
    }
    
    return new Date() < this.tokenExpiry
  }

  /**
   * Set access token manually (useful for server-side token management)
   */
  setAccessToken(token: string, expiresIn: number): void {
    this.accessToken = token
    this.tokenExpiry = new Date(Date.now() + expiresIn * 1000)
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | undefined {
    return this.accessToken
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    this.accessToken = undefined
    this.tokenExpiry = undefined
  }
}

/**
 * Enhanced News Item with LinkedIn Lite Profile Data
 */
export interface EnhancedNewsItemWithLiteProfile {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type: 'post' | 'comment' | 'share' | 'achievement' | 'milestone'
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'internal'
  timestamp: Date
  engagement: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  metadata: {
    tags: string[]
    sentiment: 'positive' | 'negative' | 'neutral'
    category: string
    industry?: string
    location?: string
    language: string
  }
  linkedinProfile?: LinkedInLiteProfile
  originalPostId?: string
  parentId?: string
}

/**
 * Service for enhancing news items with LinkedIn Lite Profile data
 */
export class NewsItemLiteProfileEnhancer {
  private liteProfileService: LinkedInLiteProfileService
  private profileCache = new Map<string, LinkedInLiteProfile>()

  constructor(liteProfileService: LinkedInLiteProfileService) {
    this.liteProfileService = liteProfileService
  }

  /**
   * Enhance news items with LinkedIn Lite Profile data
   */
  async enhanceNewsItemsWithLiteProfiles(
    newsItems: any[],
    accessToken?: string
  ): Promise<EnhancedNewsItemWithLiteProfile[]> {
    const perfLogger = performanceMonitor.createPerformanceLogger('enhance_news_with_lite_profiles')
    
    try {
      // Extract unique user IDs from news items
      const userIds = [...new Set(newsItems.map(item => item.userId))]
      
      // Fetch lite profiles for all users
      const liteProfiles = await this.liteProfileService.getMultipleLiteProfiles(userIds, accessToken)
      
      // Cache the profiles
      liteProfiles.forEach(profile => {
        this.profileCache.set(profile.id, profile)
      })

      // Enhance news items with profile data
      const enhancedItems: EnhancedNewsItemWithLiteProfile[] = newsItems.map(item => {
        const liteProfile = this.profileCache.get(item.userId)
        
        return {
          ...item,
          userName: liteProfile ? 
            `${liteProfile.firstName} ${liteProfile.lastName}` : 
            item.userName,
          userAvatar: liteProfile?.profilePicture?.displayImageUrl,
          linkedinProfile: liteProfile
        }
      })

      perfLogger.finish()
      return enhancedItems
    } catch (error) {
      errorHandler.log('error', 'Failed to enhance news items with lite profiles', {
        category: ErrorCategory.API,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
      
      // Return original items if enhancement fails
      return newsItems.map(item => ({
        ...item,
        linkedinProfile: undefined
      }))
    }
  }

  /**
   * Get cached lite profile
   */
  getCachedLiteProfile(userId: string): LinkedInLiteProfile | undefined {
    return this.profileCache.get(userId)
  }

  /**
   * Clear profile cache
   */
  clearCache(): void {
    this.profileCache.clear()
  }
}

// Export singleton instance
export const linkedinLiteProfileService = new LinkedInLiteProfileService({
  clientId: process.env.LINKEDIN_CLIENT_ID || '',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  redirectUri: process.env.LINKEDIN_REDIRECT_URI || ''
})
