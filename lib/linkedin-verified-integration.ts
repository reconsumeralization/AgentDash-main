/**
 * LinkedIn Verified Integration
 * Integrates with LinkedIn's Verified on LinkedIn API for enhanced profile verification
 * Based on: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/verified-on-linkedin/api-guide/api-development-guide
 */

import { errorHandler, ErrorCategory } from './error-handling'
import { performanceMonitor } from './performance-monitor'

export interface LinkedInVerifiedProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
  headline?: string
  industry?: string
  location?: string
  verifiedStatus: {
    isVerified: boolean
    verificationType: 'identity' | 'workplace' | 'education' | 'none'
    verificationDate?: Date
    verificationProvider?: string
  }
  experience: {
    currentPosition?: {
      title: string
      company: string
      companyId: string
      startDate: Date
      description?: string
    }
    previousPositions: Array<{
      title: string
      company: string
      startDate: Date
      endDate?: Date
      description?: string
    }>
  }
  education: {
    mostRecent?: {
      school: string
      degree: string
      fieldOfStudy?: string
      startDate: Date
      endDate?: Date
    }
    allEducation: Array<{
      school: string
      degree: string
      fieldOfStudy?: string
      startDate: Date
      endDate?: Date
    }>
  }
  skills: string[]
  connections: number
  followers: number
  profileViews: number
  lastActive: Date
}

export interface VerifiedInfluenceScore {
  userId: string
  score: number
  factors: {
    verificationStatus: number
    networkSize: number
    engagementRate: number
    contentQuality: number
    industryAuthority: number
    recency: number
  }
  breakdown: {
    verifiedBonus: number
    networkInfluence: number
    contentEngagement: number
    authorityScore: number
    activityScore: number
  }
  lastCalculated: Date
}

export interface LinkedInVerifiedConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  baseUrl: string
  apiVersion: string
}

export class LinkedInVerifiedIntegration {
  private config: LinkedInVerifiedConfig
  private accessToken?: string
  private tokenExpiry?: Date

  constructor(config: LinkedInVerifiedConfig) {
    this.config = {
      baseUrl: 'https://api.linkedin.com/rest',
      apiVersion: '202412',
      scopes: [
        'r_verify_details',
        'r_profile_basicinfo', 
        'r_primary_current_experience',
        'r_most_recent_education'
      ],
      ...config
    }
  }

  /**
   * Initialize OAuth flow for LinkedIn verification
   */
  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
      scope: this.config.scopes.join(' ')
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<{
    accessToken: string
    expiresIn: number
    scope: string
    tokenType: string
    idToken?: string
  }> {
    const perfLogger = performanceMonitor.createPerformanceLogger('linkedin_token_exchange')
    
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
        throw new Error(`Token exchange failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      this.accessToken = data.access_token
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000)
      
      perfLogger.end()
      
      return data
    } catch (error) {
      errorHandler.log('error', 'Failed to exchange LinkedIn authorization code', {
        category: ErrorCategory.API,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Get verified profile details using LinkedIn Lite Profile API
   * Based on: https://learn.microsoft.com/en-us/linkedin/shared/references/v2/profile/lite-profile
   */
  async getVerifiedProfile(accessToken?: string): Promise<LinkedInVerifiedProfile> {
    const token = accessToken || this.accessToken
    if (!token) {
      throw new Error('No access token available')
    }

    const perfLogger = performanceMonitor.createPerformanceLogger('linkedin_verified_profile')
    
    try {
      // Get lite profile info using the proper API endpoint
      const liteProfileResponse = await this.makeApiRequest('/v2/people/~', token, {
        projection: '(id,firstName,lastName,profilePicture(displayImage~:playableStreams))'
      })
      
      // Get verification details
      const verificationResponse = await this.makeApiRequest('/v2/verificationDetails', token)
      
      // Get current experience
      const experienceResponse = await this.makeApiRequest('/v2/people/~/primaryCurrentExperience', token)
      
      // Get most recent education
      const educationResponse = await this.makeApiRequest('/v2/people/~/mostRecentEducation', token)

      // Extract profile picture URL from the lite profile response
      const profilePictureUrl = this.extractProfilePictureUrl(liteProfileResponse.profilePicture)

      const profile: LinkedInVerifiedProfile = {
        id: liteProfileResponse.id,
        firstName: liteProfileResponse.firstName?.localized?.en_US || liteProfileResponse.localizedFirstName || '',
        lastName: liteProfileResponse.lastName?.localized?.en_US || liteProfileResponse.localizedLastName || '',
        profilePicture: profilePictureUrl,
        headline: undefined, // Not available in lite profile
        industry: undefined, // Not available in lite profile
        location: undefined, // Not available in lite profile
        verifiedStatus: {
          isVerified: verificationResponse?.isVerified || false,
          verificationType: verificationResponse?.verificationType || 'none',
          verificationDate: verificationResponse?.verificationDate ? new Date(verificationResponse.verificationDate) : undefined,
          verificationProvider: verificationResponse?.verificationProvider
        },
        experience: {
          currentPosition: experienceResponse ? {
            title: experienceResponse.title,
            company: experienceResponse.companyName,
            companyId: experienceResponse.company,
            startDate: new Date(experienceResponse.startDate),
            description: experienceResponse.description
          } : undefined,
          previousPositions: [] // Would need additional API call to get full experience
        },
        education: {
          mostRecent: educationResponse ? {
            school: educationResponse.schoolName,
            degree: educationResponse.degreeName,
            fieldOfStudy: educationResponse.fieldOfStudy,
            startDate: new Date(educationResponse.startDate),
            endDate: educationResponse.endDate ? new Date(educationResponse.endDate) : undefined
          } : undefined,
          allEducation: [] // Would need additional API call to get full education
        },
        skills: [], // Would need additional API call
        connections: 0, // Would need additional API call
        followers: 0, // Would need additional API call
        profileViews: 0, // Would need additional API call
        lastActive: new Date()
      }

      perfLogger.finish()
      return profile
    } catch (error) {
      errorHandler.log('error', 'Failed to get verified LinkedIn profile', {
        category: ErrorCategory.API,
        data: { error: error instanceof Error ? error.message : String(error) }
      })
      throw error
    }
  }

  /**
   * Extract profile picture URL from LinkedIn Lite Profile response
   */
  private extractProfilePictureUrl(profilePicture: any): string | undefined {
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
   * Calculate verified influence score
   */
  calculateVerifiedInfluenceScore(
    profile: LinkedInVerifiedProfile,
    engagementData: {
      likes: number
      comments: number
      shares: number
      views: number
      posts: number
    }
  ): VerifiedInfluenceScore {
    const now = new Date()
    const daysSinceActive = Math.floor((now.getTime() - profile.lastActive.getTime()) / (1000 * 60 * 60 * 24))
    
    // Verification status factor (0-1)
    const verificationStatus = profile.verifiedStatus.isVerified ? 
      (profile.verifiedStatus.verificationType === 'identity' ? 1.0 : 0.8) : 0.3
    
    // Network size factor (0-1)
    const networkSize = Math.min(1.0, (profile.connections + profile.followers) / 10000)
    
    // Engagement rate factor (0-1)
    const totalEngagement = engagementData.likes + engagementData.comments + engagementData.shares
    const engagementRate = engagementData.posts > 0 ? 
      Math.min(1.0, totalEngagement / (engagementData.posts * 100)) : 0
    
    // Content quality factor (0-1) - based on engagement per view
    const contentQuality = engagementData.views > 0 ? 
      Math.min(1.0, totalEngagement / engagementData.views) : 0
    
    // Industry authority factor (0-1) - based on experience and education
    const experienceYears = profile.experience.currentPosition ? 
      Math.floor((now.getTime() - profile.experience.currentPosition.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0
    const industryAuthority = Math.min(1.0, experienceYears / 20)
    
    // Recency factor (0-1)
    const recency = Math.max(0, 1 - (daysSinceActive / 30))
    
    // Calculate weighted score
    const weights = {
      verificationStatus: 0.25,
      networkSize: 0.20,
      engagementRate: 0.20,
      contentQuality: 0.15,
      industryAuthority: 0.15,
      recency: 0.05
    }
    
    const score = 
      verificationStatus * weights.verificationStatus +
      networkSize * weights.networkSize +
      engagementRate * weights.engagementRate +
      contentQuality * weights.contentQuality +
      industryAuthority * weights.industryAuthority +
      recency * weights.recency
    
    return {
      userId: profile.id,
      score: Math.round(score * 100) / 100,
      factors: {
        verificationStatus,
        networkSize,
        engagementRate,
        contentQuality,
        industryAuthority,
        recency
      },
      breakdown: {
        verifiedBonus: verificationStatus * weights.verificationStatus,
        networkInfluence: networkSize * weights.networkSize,
        contentEngagement: (engagementRate + contentQuality) * 0.5 * (weights.engagementRate + weights.contentQuality),
        authorityScore: industryAuthority * weights.industryAuthority,
        activityScore: recency * weights.recency
      },
      lastCalculated: now
    }
  }

  /**
   * Make authenticated API request to LinkedIn
   * Enhanced to support query parameters and proper API versioning
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
   * Refresh access token if needed
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    if (this.isTokenValid()) {
      return true
    }

    // In a real implementation, you would use a refresh token here
    // For now, we'll return false to indicate re-authentication is needed
    return false
  }
}

/**
 * Enhanced News Synthesis with LinkedIn Verification
 */
export class VerifiedNewsSynthesis {
  private linkedinIntegration: LinkedInVerifiedIntegration
  private verifiedProfiles = new Map<string, LinkedInVerifiedProfile>()
  private influenceScores = new Map<string, VerifiedInfluenceScore>()

  constructor(linkedinConfig: LinkedInVerifiedConfig) {
    this.linkedinIntegration = new LinkedInVerifiedIntegration(linkedinConfig)
  }

  /**
   * Enhance news items with verification data
   */
  async enhanceNewsItemsWithVerification(newsItems: any[]): Promise<any[]> {
    const enhancedItems = await Promise.all(
      newsItems.map(async (item) => {
        try {
          // Get or fetch verified profile data
          let verifiedProfile = this.verifiedProfiles.get(item.userId)
          
          if (!verifiedProfile) {
            // In a real implementation, you would fetch this from your database
            // or make an API call to get the user's LinkedIn verification status
            verifiedProfile = await this.getUserVerifiedProfile(item.userId)
            if (verifiedProfile) {
              this.verifiedProfiles.set(item.userId, verifiedProfile)
            }
          }

          if (verifiedProfile) {
            // Calculate influence score
            const influenceScore = this.linkedinIntegration.calculateVerifiedInfluenceScore(
              verifiedProfile,
              item.engagement
            )
            this.influenceScores.set(item.userId, influenceScore)

            // Enhance the news item
            return {
              ...item,
              verification: {
                isVerified: verifiedProfile.verifiedStatus.isVerified,
                verificationType: verifiedProfile.verifiedStatus.verificationType,
                influenceScore: influenceScore.score,
                authorityLevel: this.calculateAuthorityLevel(influenceScore),
                trustworthiness: this.calculateTrustworthiness(verifiedProfile, influenceScore)
              }
            }
          }

          return item
        } catch (error) {
          errorHandler.log('warn', 'Failed to enhance news item with verification', {
            category: ErrorCategory.API,
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: item.userId
          })
          return item
        }
      })
    )

    return enhancedItems
  }

  /**
   * Calculate authority level based on verification and influence
   */
  private calculateAuthorityLevel(influenceScore: VerifiedInfluenceScore): 'low' | 'medium' | 'high' | 'expert' {
    if (influenceScore.score >= 0.8) return 'expert'
    if (influenceScore.score >= 0.6) return 'high'
    if (influenceScore.score >= 0.4) return 'medium'
    return 'low'
  }

  /**
   * Calculate trustworthiness score
   */
  private calculateTrustworthiness(
    profile: LinkedInVerifiedProfile, 
    influenceScore: VerifiedInfluenceScore
  ): number {
    let trustScore = 0.5 // Base score

    // Verification bonus
    if (profile.verifiedStatus.isVerified) {
      trustScore += 0.3
      if (profile.verifiedStatus.verificationType === 'identity') {
        trustScore += 0.1
      }
    }

    // Experience bonus
    if (profile.experience.currentPosition) {
      const experienceYears = Math.floor(
        (Date.now() - profile.experience.currentPosition.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      )
      trustScore += Math.min(0.1, experienceYears / 20)
    }

    // Education bonus
    if (profile.education.mostRecent) {
      trustScore += 0.05
    }

    // Influence factor
    trustScore += influenceScore.score * 0.1

    return Math.min(1.0, trustScore)
  }

  /**
   * Get user's verified profile (placeholder implementation)
   */
  private async getUserVerifiedProfile(userId: string): Promise<LinkedInVerifiedProfile | null> {
    // In a real implementation, this would:
    // 1. Check if user has linked their LinkedIn account
    // 2. Fetch their verification status from your database
    // 3. Optionally make API calls to refresh verification data
    
    // For now, return null to indicate no verification data available
    return null
  }

  /**
   * Generate verified insights
   */
  generateVerifiedInsights(enhancedNewsItems: any[]): any[] {
    const insights = []

    // Verified user engagement insight
    const verifiedItems = enhancedNewsItems.filter(item => item.verification?.isVerified)
    const totalEngagement = enhancedNewsItems.reduce((sum, item) => 
      sum + item.engagement.likes + item.engagement.comments + item.engagement.shares, 0)
    const verifiedEngagement = verifiedItems.reduce((sum, item) => 
      sum + item.engagement.likes + item.engagement.comments + item.engagement.shares, 0)

    if (verifiedItems.length > 0) {
      const verifiedEngagementRate = verifiedEngagement / totalEngagement
      
      insights.push({
        id: 'verified-engagement',
        type: 'verification',
        title: 'Verified User Engagement',
        description: `Verified users contribute ${(verifiedEngagementRate * 100).toFixed(1)}% of total engagement`,
        confidence: 0.9,
        impact: verifiedEngagementRate > 0.3 ? 'high' : 'medium',
        data: {
          value: verifiedEngagementRate,
          change: 0,
          changeType: 'stable',
          timeframe: '24h'
        },
        relatedItems: verifiedItems.map(item => item.id),
        tags: ['verification', 'engagement', 'trust'],
        timestamp: new Date()
      })
    }

    // Authority distribution insight
    const authorityDistribution = enhancedNewsItems.reduce((acc, item) => {
      const authority = item.verification?.authorityLevel || 'low'
      acc[authority] = (acc[authority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    if (Object.keys(authorityDistribution).length > 0) {
      insights.push({
        id: 'authority-distribution',
        type: 'authority',
        title: 'Content Authority Distribution',
        description: `Content from ${Object.keys(authorityDistribution).length} authority levels`,
        confidence: 0.8,
        impact: 'medium',
        data: {
          value: Object.keys(authorityDistribution).length,
          change: 0,
          changeType: 'stable',
          timeframe: '24h'
        },
        relatedItems: enhancedNewsItems.map(item => item.id),
        tags: ['authority', 'distribution', 'content'],
        timestamp: new Date(),
        metadata: {
          distribution: authorityDistribution
        }
      })
    }

    return insights
  }
}

// Export singleton instance
export const linkedinVerifiedIntegration = new LinkedInVerifiedIntegration({
  clientId: process.env.LINKEDIN_CLIENT_ID || '',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  redirectUri: process.env.LINKEDIN_REDIRECT_URI || '',
  scopes: [
    'r_verify_details',
    'r_profile_basicinfo',
    'r_primary_current_experience', 
    'r_most_recent_education'
  ]
})
