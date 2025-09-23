// LinkedIn API Integration Module
// Handles all LinkedIn API interactions and data synchronization

interface LinkedInAPIConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

class LinkedInAPI {
  private config: LinkedInAPIConfig
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(config: LinkedInAPIConfig) {
    this.config = config
  }

  // Authentication methods
  async authenticate(code: string): Promise<void> {
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
          client_secret: this.config.clientSecret
        })
      })

      const data = await response.json()
      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token

      // Store tokens securely
      this.storeTokens()
    } catch (error) {
      console.error('LinkedIn authentication failed:', error)
      throw error
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
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
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        })
      })

      const data = await response.json()
      this.accessToken = data.access_token

      this.storeTokens()
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw error
    }
  }

  // Profile methods
  async getProfile(): Promise<any> {
    return this.makeRequest('/v2/people/~')
  }

  async getConnections(): Promise<any> {
    return this.makeRequest('/v2/connections?projection=(id,firstName,lastName,headline,publicProfileUrl)')
  }

  async getNetworkUpdates(): Promise<any> {
    return this.makeRequest('/v2/networkUpdates?type=SHAR&count=50')
  }

  // Content methods
  async shareContent(content: { text: string; visibility?: string }): Promise<any> {
    return this.makeRequest('/v2/shares', {
      method: 'POST',
      body: JSON.stringify({
        owner: 'urn:li:person:~',
        text: { text: content.text },
        distribution: {
          linkedInDistributionTarget: {}
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': content.visibility || 'PUBLIC'
        }
      })
    })
  }

  async getShares(): Promise<any> {
    return this.makeRequest('/v2/shares?q=owners&owners=urn:li:person:~&count=50')
  }

  // Messaging methods
  async sendMessage(recipientId: string, message: string): Promise<any> {
    return this.makeRequest('/v2/messages', {
      method: 'POST',
      body: JSON.stringify({
        recipients: [`urn:li:person:${recipientId}`],
        body: message,
        subject: 'Message from LinkedIn Integration'
      })
    })
  }

  async getConversations(): Promise<any> {
    return this.makeRequest('/v2/conversations?q=participants&participants=urn:li:person:~&count=20')
  }

  // Analytics methods
  async getProfileAnalytics(): Promise<any> {
    return this.makeRequest('/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:12345')
  }

  async getContentAnalytics(shareId: string): Promise<any> {
    return this.makeRequest(`/v2/organizationalEntityShareStatistics/${shareId}`)
  }

  // Private methods
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated')
    }

    const url = `https://api.linkedin.com${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken()
        return this.makeRequest(endpoint, options)
      }

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('LinkedIn API request failed:', error)
      throw error
    }
  }

  private storeTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('linkedin_access_token', this.accessToken || '')
      localStorage.setItem('linkedin_refresh_token', this.refreshToken || '')
    }
  }

  private loadTokens(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('linkedin_access_token')
      this.refreshToken = localStorage.getItem('linkedin_refresh_token')
    }
  }

  // Initialize from stored tokens
  initialize(): void {
    this.loadTokens()
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Logout
  logout(): void {
    this.accessToken = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('linkedin_access_token')
      localStorage.removeItem('linkedin_refresh_token')
    }
  }

  // Get authorization URL
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' ')
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`
  }
}

export default LinkedInAPI
