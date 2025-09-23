/**
 * LinkedIn API Service - Real OAuth 2.0 Integration
 * Implements actual LinkedIn Marketing Solutions API calls
 */

interface LinkedInConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

interface LinkedInTokens {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
  scope: string
}

interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
  headline?: string
  industry?: string
  location?: string
  summary?: string
}

interface LinkedInCampaign {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT'
  objectiveType: string
  account: string
  campaignGroup: string
  budget?: {
    amount: number
    currencyCode: string
    type: 'DAILY' | 'LIFETIME'
  }
  createdAt: string
  updatedAt: string
}

interface LinkedInCampaignAnalytics {
  campaignId: string
  dateRange: {
    start: string
    end: string
  }
  metrics: {
    impressions: number
    clicks: number
    costInLocalCurrency: number
    conversions: number
    externalWebsiteConversions: number
    ctr: number
    cpc: number
    cpa: number
  }
}

export class LinkedInAPIService {
  private config: LinkedInConfig
  private tokens: LinkedInTokens | null = null
  private baseURL = 'https://api.linkedin.com/v2'

  constructor(config: LinkedInConfig) {
    this.config = config
  }

  /**
   * Generate OAuth 2.0 authorization URL
   */
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: state || this.generateState()
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(code: string): Promise<LinkedInTokens> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LinkedIn OAuth error: ${response.status} ${error}`)
    }

    const data = await response.json()
    this.tokens = data
    return data
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<LinkedInTokens> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LinkedIn token refresh error: ${response.status} ${error}`)
    }

    const data = await response.json()
    this.tokens = { ...this.tokens, ...data }
    return data
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<LinkedInProfile> {
    await this.ensureValidToken()

    const response = await fetch(`${this.baseURL}/people/~`, {
      headers: {
        'Authorization': `Bearer ${this.tokens!.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get user's LinkedIn Marketing campaigns
   */
  async getCampaigns(accountId: string): Promise<LinkedInCampaign[]> {
    await this.ensureValidToken()

    const response = await fetch(
      `${this.baseURL}/adCampaignsV2?q=search&account=urn:li:sponsoredAccount:${accountId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.tokens!.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.elements || []
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(
    campaignId: string,
    dateRange: { start: string; end: string }
  ): Promise<LinkedInCampaignAnalytics> {
    await this.ensureValidToken()

    const queryParams = new URLSearchParams({
      q: 'analytics',
      pivot: 'CAMPAIGN',
      timeGranularity: 'DAILY',
      dateRange: `(start:(year:${new Date(dateRange.start).getFullYear()},month:${new Date(dateRange.start).getMonth() + 1},day:${new Date(dateRange.start).getDate()}),end:(year:${new Date(dateRange.end).getFullYear()},month:${new Date(dateRange.end).getMonth() + 1},day:${new Date(dateRange.end).getDate()}))`,
      campaigns: `(values:List(urn:li:sponsoredCampaign:${campaignId}))`,
      fields: 'impressions,clicks,costInLocalCurrency,conversions,externalWebsiteConversions'
    })

    const response = await fetch(`${this.baseURL}/adAnalyticsV2?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${this.tokens!.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Process and aggregate analytics data
    const metrics = this.aggregateAnalytics(data.elements || [])
    
    return {
      campaignId,
      dateRange,
      metrics
    }
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaign: Omit<LinkedInCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<LinkedInCampaign> {
    await this.ensureValidToken()

    const response = await fetch(`${this.baseURL}/adCampaignsV2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.tokens!.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(campaign)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LinkedIn API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  /**
   * Get user's sponsored accounts (for campaign management)
   */
  async getSponsoredAccounts(): Promise<any[]> {
    await this.ensureValidToken()

    const response = await fetch(`${this.baseURL}/adAccountsV2?q=search`, {
      headers: {
        'Authorization': `Bearer ${this.tokens!.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.elements || []
  }

  /**
   * Private helper methods
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.tokens) {
      throw new Error('No access token available. Please authenticate first.')
    }

    // Check if token is expired (with 5-minute buffer)
    const now = Date.now()
    const expiresAt = this.tokens.expiresIn * 1000 + now
    const buffer = 5 * 60 * 1000 // 5 minutes

    if (now >= (expiresAt - buffer)) {
      await this.refreshAccessToken()
    }
  }

  private aggregateAnalytics(elements: any[]): LinkedInCampaignAnalytics['metrics'] {
    const aggregated = elements.reduce((acc, element) => {
      return {
        impressions: acc.impressions + (element.impressions || 0),
        clicks: acc.clicks + (element.clicks || 0),
        costInLocalCurrency: acc.costInLocalCurrency + (element.costInLocalCurrency || 0),
        conversions: acc.conversions + (element.conversions || 0),
        externalWebsiteConversions: acc.externalWebsiteConversions + (element.externalWebsiteConversions || 0)
      }
    }, {
      impressions: 0,
      clicks: 0,
      costInLocalCurrency: 0,
      conversions: 0,
      externalWebsiteConversions: 0
    })

    // Calculate derived metrics
    const ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions) * 100 : 0
    const cpc = aggregated.clicks > 0 ? aggregated.costInLocalCurrency / aggregated.clicks : 0
    const cpa = aggregated.conversions > 0 ? aggregated.costInLocalCurrency / aggregated.conversions : 0

    return {
      ...aggregated,
      ctr: Math.round(ctr * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      cpa: Math.round(cpa * 100) / 100
    }
  }

  /**
   * Set tokens (for persistence across sessions)
   */
  setTokens(tokens: LinkedInTokens): void {
    this.tokens = tokens
  }

  /**
   * Get current tokens
   */
  getTokens(): LinkedInTokens | null {
    return this.tokens
  }

  /**
   * Clear tokens (for logout)
   */
  clearTokens(): void {
    this.tokens = null
  }
}

// Default configuration
export const defaultLinkedInConfig: LinkedInConfig = {
  clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  redirectUri: process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/linkedin/callback`,
  scopes: [
    'r_liteprofile',
    'r_emailaddress',
    'w_member_social',
    'rw_ads',
    'r_ads_reporting'
  ]
}

// Create singleton instance
export const linkedInAPI = new LinkedInAPIService(defaultLinkedInConfig)
