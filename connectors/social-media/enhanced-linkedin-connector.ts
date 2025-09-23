/**
 * Enhanced LinkedIn Connector
 * 
 * Comprehensive LinkedIn API v2 connector with all available endpoints
 * for professional networking, content management, and analytics.
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
import {
  UnifiedPost,
  UnifiedUser,
  UnifiedComment,
  UnifiedMessage,
  UnifiedConversation,
  UnifiedAnalytics,
  UnifiedNotification,
  UnifiedCampaign
} from './unified-data-types'

export interface LinkedInConfig extends ConnectorConfig {
  scopes: string[]
  companyId?: string
  organizationId?: string
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
  emailAddress?: string
  phoneNumbers?: Array<{
    number: string
    type: string
  }>
  positions?: Array<{
    title: string
    company: string
    startDate: string
    endDate?: string
    isCurrent: boolean
  }>
  educations?: Array<{
    school: string
    degree: string
    fieldOfStudy: string
    startDate: string
    endDate?: string
  }>
  skills?: string[]
  languages?: Array<{
    name: string
    proficiency: string
  }>
}

export interface LinkedInCompany {
  id: string
  name: string
  description?: string
  website?: string
  industry?: string
  companySize?: string
  headquarters?: string
  foundedYear?: number
  logoUrl?: string
  coverPhotoUrl?: string
  followerCount?: number
  employeeCount?: number
  specialties?: string[]
  locations?: Array<{
    name: string
    address: string
    isHeadquarters: boolean
  }>
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
    impressions?: number
  }
  media?: Array<{
    type: 'image' | 'video' | 'document'
    url: string
    thumbnailUrl?: string
  }>
  reshareCount?: number
  commentCount?: number
  likeCount?: number
  shareCount?: number
}

export interface LinkedInComment {
  id: string
  postId: string
  author: string
  text: string
  createdAt: Date
  likes: number
  replies: LinkedInComment[]
  isEdited: boolean
}

export interface LinkedInMessage {
  id: string
  conversationId: string
  sender: string
  recipients: string[]
  content: string
  type: 'text' | 'image' | 'video' | 'file'
  createdAt: Date
  readAt?: Date
  deliveredAt?: Date
  attachments?: Array<{
    type: string
    url: string
    name: string
    size: number
  }>
}

export interface LinkedInConversation {
  id: string
  participants: string[]
  lastMessage?: LinkedInMessage
  unreadCount: number
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LinkedInNotification {
  id: string
  type: 'like' | 'comment' | 'share' | 'mention' | 'connection_request' | 'message'
  actor: string
  target?: string
  message: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}

export class EnhancedLinkedInConnector extends BaseSocialMediaConnector {
  private scopes: string[]
  private companyId?: string
  private organizationId?: string

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
    this.organizationId = config.organizationId
  }

  // Authentication methods
  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      const authUrl = this.buildAuthUrl(credentials)
      
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
          client_id: 'client_id', // This should be the actual client ID
          client_secret: 'client_secret' // This should be the actual client secret
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

  // Content posting methods
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

  async postToCompanyPage(content: ContentData, companyId?: string): Promise<PostResult> {
    const targetCompanyId = companyId || this.companyId
    if (!targetCompanyId) {
      throw new APIError({
        platform: 'linkedin',
        code: 'NO_COMPANY_ID',
        message: 'Company ID is required for company page posting',
        retryable: false
      })
    }

    try {
      const postData = this.buildCompanyPostData(content, targetCompanyId)
      
      const response = await this.makeRequest(`/organizations/${targetCompanyId}/shares`, {
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
        error: error instanceof Error ? error.message : 'Company post failed'
      }
    }
  }

  // Profile and user methods
  async getUserInfo(): Promise<UserInfo> {
    try {
      const response = await this.makeRequest('/people/~?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline,summary,location,industry,publicProfileUrl,emailAddress)')
      
      const profile = await response.json()
      
      return {
        id: profile.id,
        username: profile.publicProfileUrl?.split('/').pop() || '',
        displayName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
        bio: profile.headline,
        verified: false
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

  async getFullProfile(): Promise<LinkedInProfile> {
    try {
      const response = await this.makeRequest('/people/~?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline,summary,location,industry,publicProfileUrl,emailAddress,phoneNumbers,positions,educations,skills,languages)')
      
      return await response.json()
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'PROFILE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get full profile',
        retryable: true
      })
    }
  }

  async updateProfile(updates: Partial<LinkedInProfile>): Promise<LinkedInProfile> {
    try {
      const response = await this.makeRequest('/people/~', {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })

      return await response.json()
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'PROFILE_UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to update profile',
        retryable: true
      })
    }
  }

  // Connections methods
  async getConnections(): Promise<LinkedInProfile[]> {
    try {
      const response = await this.makeRequest('/people/~/connections?projection=(elements*(id,firstName,lastName,headline,profilePicture(displayImage~:playableStreams)))')
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

  async sendConnectionRequest(profileId: string, message?: string): Promise<void> {
    try {
      const requestData = {
        recipients: [profileId],
        subject: 'Connection Request',
        body: message || 'I would like to connect with you on LinkedIn.',
        itemContent: {
          'com.linkedin.ugc.InvitationToConnect': {
            customMessage: message || 'I would like to connect with you on LinkedIn.'
          }
        }
      }

      await this.makeRequest('/messaging/conversations', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'CONNECTION_REQUEST_ERROR',
        message: error instanceof Error ? error.message : 'Failed to send connection request',
        retryable: true
      })
    }
  }

  // Company methods
  async getCompanyInfo(companyId?: string): Promise<LinkedInCompany> {
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
      const response = await this.makeRequest(`/organizations/${id}?projection=(id,name,description,websiteUrl,logoV2(original~:playableStreams),coverPhotoV2(original~:playableStreams),followerCount,employeeCount,specialties,locations)`)
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

  async getUserCompanies(): Promise<LinkedInCompany[]> {
    try {
      const response = await this.makeRequest('/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(organizationalTarget~(id,name,description,websiteUrl,logoV2(original~:playableStreams))))')
      const data = await response.json()
      return data.elements?.map((element: any) => element.organizationalTarget) || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'COMPANIES_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get user companies',
        retryable: true
      })
    }
  }

  // Posts and content methods
  async getUserPosts(limit = 20): Promise<LinkedInPost[]> {
    try {
      const response = await this.makeRequest(`/shares?q=owners&owners=me&count=${limit}&projection=(elements*(id,author,text,createdAt,visibility,engagement,media))`)
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'POSTS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get user posts',
        retryable: true
      })
    }
  }

  async getPostComments(postId: string): Promise<LinkedInComment[]> {
    try {
      const response = await this.makeRequest(`/socialActions/${postId}/comments?projection=(elements*(id,author,text,createdAt,likes,replies,isEdited))`)
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'COMMENTS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get post comments',
        retryable: true
      })
    }
  }

  async commentOnPost(postId: string, comment: string): Promise<LinkedInComment> {
    try {
      const commentData = {
        actor: 'urn:li:person:' + this.getUserId(),
        object: `urn:li:share:${postId}`,
        message: {
          text: comment
        }
      }

      const response = await this.makeRequest('/socialActions', {
        method: 'POST',
        body: JSON.stringify(commentData)
      })

      return await response.json()
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'COMMENT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to comment on post',
        retryable: true
      })
    }
  }

  async likePost(postId: string): Promise<void> {
    try {
      const likeData = {
        actor: 'urn:li:person:' + this.getUserId(),
        object: `urn:li:share:${postId}`
      }

      await this.makeRequest('/socialActions', {
        method: 'POST',
        body: JSON.stringify(likeData)
      })
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'LIKE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to like post',
        retryable: true
      })
    }
  }

  async sharePost(postId: string, message?: string): Promise<PostResult> {
    try {
      const shareData = {
        author: 'urn:li:person:' + this.getUserId(),
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: message || ''
            },
            shareMediaCategory: 'ARTICLE',
            media: [{
              status: 'READY',
              description: {
                text: message || ''
              },
              originalUrl: `https://www.linkedin.com/feed/update/${postId}`
            }]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }

      const response = await this.makeRequest('/shares', {
        method: 'POST',
        body: JSON.stringify(shareData)
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
        error: error instanceof Error ? error.message : 'Share failed'
      }
    }
  }

  // Messaging methods
  async getConversations(): Promise<LinkedInConversation[]> {
    try {
      const response = await this.makeRequest('/messaging/conversations?projection=(elements*(id,participants,lastMessage,unreadCount,isArchived,createdAt,updatedAt))')
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'CONVERSATIONS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get conversations',
        retryable: true
      })
    }
  }

  async getConversationMessages(conversationId: string): Promise<LinkedInMessage[]> {
    try {
      const response = await this.makeRequest(`/messaging/conversations/${conversationId}/messages?projection=(elements*(id,sender,recipients,content,type,createdAt,readAt,deliveredAt,attachments))`)
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'MESSAGES_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get conversation messages',
        retryable: true
      })
    }
  }

  async sendMessage(recipientId: string, content: string, attachments?: any[]): Promise<LinkedInMessage> {
    try {
      const messageData = {
        recipients: [recipientId],
        subject: 'Message',
        body: content,
        attachments: attachments || []
      }

      const response = await this.makeRequest('/messaging/conversations', {
        method: 'POST',
        body: JSON.stringify(messageData)
      })

      return await response.json()
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'MESSAGE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to send message',
        retryable: true
      })
    }
  }

  // Notifications methods
  async getNotifications(): Promise<LinkedInNotification[]> {
    try {
      const response = await this.makeRequest('/notifications?projection=(elements*(id,type,actor,target,message,isRead,createdAt,actionUrl))')
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'NOTIFICATIONS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get notifications',
        retryable: true
      })
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.makeRequest(`/notifications/${notificationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isRead: true })
      })
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'NOTIFICATION_UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to mark notification as read',
        retryable: true
      })
    }
  }

  // Analytics methods
  async getAnalytics(timeframe: TimeFrame): Promise<AnalyticsData> {
    try {
      const response = await this.makeRequest('/shares?q=owners&owners=me&projection=(elements*(id,engagement))')
      const data = await response.json()
      
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

  async getPostAnalytics(postId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/socialActions/${postId}/analytics?projection=(elements*(id,metrics))`)
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'POST_ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get post analytics',
        retryable: true
      })
    }
  }

  // Search methods
  async searchPeople(query: string, limit = 10): Promise<LinkedInProfile[]> {
    try {
      const response = await this.makeRequest(`/people?q=keywords&keywords=${encodeURIComponent(query)}&count=${limit}&projection=(elements*(id,firstName,lastName,headline,profilePicture(displayImage~:playableStreams)))`)
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'SEARCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to search people',
        retryable: true
      })
    }
  }

  async searchCompanies(query: string, limit = 10): Promise<LinkedInCompany[]> {
    try {
      const response = await this.makeRequest(`/organizations?q=keywords&keywords=${encodeURIComponent(query)}&count=${limit}&projection=(elements*(id,name,description,websiteUrl,logoV2(original~:playableStreams)))`)
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      throw new APIError({
        platform: 'linkedin',
        code: 'SEARCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to search companies',
        retryable: true
      })
    }
  }

  // Utility methods
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

  private buildPostData(content: ContentData): any {
    const postData: any = {
      author: 'urn:li:person:' + this.getUserId(),
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

  private buildCompanyPostData(content: ContentData, companyId: string): any {
    const postData: any = {
      author: `urn:li:organization:${companyId}`,
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
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

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

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private getUserId(): string {
    // In a real implementation, you would decode the JWT token or make an API call
    // to get the user ID. This is a placeholder.
    return 'user_id_placeholder'
  }
}
