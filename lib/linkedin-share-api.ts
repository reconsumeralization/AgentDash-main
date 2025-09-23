"use client"

/**
 * LinkedIn Share API Integration
 * Based on LinkedIn Share API documentation
 * @see https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
 */

import { useState, useMemo, useCallback } from 'react'

// LinkedIn Share API Types
export interface LinkedInShareRequest {
  author: string // URN of the person sharing the content
  lifecycleState: 'PUBLISHED' // Content lifecycle state
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string // The text content of the share
      }
      shareMediaCategory: 'NONE' | 'IMAGE' | 'VIDEO' | 'ARTICLE' // Type of media being shared
      media?: LinkedInShareMedia[] // Media objects to share
    }
  }
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' | 'CONNECTIONS' // Visibility level
  }
}

export interface LinkedInShareMedia {
  status: 'READY' // Media upload status
  description?: {
    text: string // Description of the media
  }
  media?: string // URN of the uploaded media
  originalUrl?: string // Original URL for articles
  title?: {
    text: string // Title of the content
  }
}

export interface LinkedInShareResponse {
  id: string // URN of the created share
  activity: string // URN of the activity
  created: {
    actor: string // URN of the person who created the share
    time: number // Timestamp of creation
  }
  lastModified: {
    actor: string // URN of the person who last modified the share
    time: number // Timestamp of last modification
  }
  content?: {
    contentEntities?: Array<{
      entityLocation: string // URL of the shared content
      thumbnails?: Array<{
        resolvedUrl: string // URL of the thumbnail image
      }>
    }>
  }
  author: string // URN of the person who created the share
  ugcPost?: {
    id: string // URN of the UGC post
    author: string // URN of the author
    lifecycleState: string // Lifecycle state of the post
    specificContent: any // Specific content of the post
    visibility: any // Visibility settings
    created: {
      actor: string
      time: number
    }
    lastModified: {
      actor: string
      time: number
    }
  }
}

export interface LinkedInShareAnalytics {
  shareId: string
  viewCount: number
  likeCount: number
  commentCount: number
  clickCount: number
  impressionCount: number
  shareCount: number
  engagementRate: number
  timestamp: string
}

export interface LinkedInMediaUploadResponse {
  value: {
    uploadUrlExpiresAt: number // Expiration timestamp for upload URL
    uploadUrl: string // URL to upload media
    asset: string // URN of the media asset
  }
}

// LinkedIn Share API Client
export class LinkedInShareApi {
  private accessToken: string
  private baseUrl: string = 'https://api.linkedin.com/v2'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * Create a text-only share
   * @see https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin#create-a-text-share
   */
  async createTextShare(
    text: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ): Promise<LinkedInShareResponse> {
    const shareRequest: LinkedInShareRequest = {
      author: await this.getCurrentUserUrn(),
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility
      }
    }

    return this.createShare(shareRequest)
  }

  /**
   * Create a share with an image
   * @see https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin#create-an-image-share
   */
  async createImageShare(
    text: string,
    imageUrl: string,
    imageDescription?: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ): Promise<LinkedInShareResponse> {
    // First upload the image
    const mediaAsset = await this.uploadImage(imageUrl, imageDescription)

    const shareRequest: LinkedInShareRequest = {
      author: await this.getCurrentUserUrn(),
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text
          },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              description: imageDescription ? { text: imageDescription } : undefined,
              media: mediaAsset.asset
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility
      }
    }

    return this.createShare(shareRequest)
  }

  /**
   * Create a share with an article link
   * @see https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin#create-an-article-share
   */
  async createArticleShare(
    text: string,
    articleUrl: string,
    articleTitle: string,
    articleDescription?: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ): Promise<LinkedInShareResponse> {
    const shareRequest: LinkedInShareRequest = {
      author: await this.getCurrentUserUrn(),
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text
          },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              originalUrl: articleUrl,
              title: { text: articleTitle },
              description: articleDescription ? { text: articleDescription } : undefined
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility
      }
    }

    return this.createShare(shareRequest)
  }

  /**
   * Upload an image to LinkedIn
   */
  async uploadImage(imageUrl: string, description?: string): Promise<LinkedInMediaUploadResponse['value']> {
    // First, register the image upload
    const registerResponse = await this.makeRequest<LinkedInMediaUploadResponse>('/assets?action=registerUpload', {
      method: 'POST',
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: await this.getCurrentUserUrn(),
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      })
    })

    // Upload the image to the provided URL
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()

    await fetch(registerResponse.value.uploadUrl, {
      method: 'POST',
      body: imageBlob,
      headers: {
        'Content-Type': imageBlob.type
      }
    })

    return registerResponse.value
  }

  /**
   * Create a share (internal method)
   */
  private async createShare(shareRequest: LinkedInShareRequest): Promise<LinkedInShareResponse> {
    return this.makeRequest<LinkedInShareResponse>('/ugcPosts', {
      method: 'POST',
      body: JSON.stringify(shareRequest)
    })
  }

  /**
   * Get current user URN
   */
  private async getCurrentUserUrn(): Promise<string> {
    const profile = await this.makeRequest<any>('/me')
    return profile.id
  }

  /**
   * Get share analytics (requires additional permissions)
   */
  async getShareAnalytics(shareId: string): Promise<LinkedInShareAnalytics> {
    // Note: This requires the r_analytics permission and access to LinkedIn Analytics API
    const analytics = await this.makeRequest<any>(`/ugcPosts/${shareId}/analytics`)
    
    return {
      shareId,
      viewCount: analytics.views || 0,
      likeCount: analytics.likes || 0,
      commentCount: analytics.comments || 0,
      clickCount: analytics.clicks || 0,
      impressionCount: analytics.impressions || 0,
      shareCount: analytics.shares || 0,
      engagementRate: analytics.engagementRate || 0,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Delete a share
   */
  async deleteShare(shareId: string): Promise<void> {
    await this.makeRequest(`/ugcPosts/${shareId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Make authenticated request to LinkedIn API
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-RestLi-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`)
    }

    return response.json()
  }
}

// React Hook for LinkedIn Share API
export function useLinkedInShare(accessToken?: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastShare, setLastShare] = useState<LinkedInShareResponse | null>(null)

  const shareApi = useMemo(() => {
    if (!accessToken) return null
    return new LinkedInShareApi(accessToken)
  }, [accessToken])

  const createTextShare = useCallback(async (
    text: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ) => {
    if (!shareApi) return null

    setLoading(true)
    setError(null)

    try {
      const share = await shareApi.createTextShare(text, visibility)
      setLastShare(share)
      return share
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create text share')
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [shareApi])

  const createImageShare = useCallback(async (
    text: string,
    imageUrl: string,
    imageDescription?: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ) => {
    if (!shareApi) return null

    setLoading(true)
    setError(null)

    try {
      const share = await shareApi.createImageShare(text, imageUrl, imageDescription, visibility)
      setLastShare(share)
      return share
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create image share')
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [shareApi])

  const createArticleShare = useCallback(async (
    text: string,
    articleUrl: string,
    articleTitle: string,
    articleDescription?: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ) => {
    if (!shareApi) return null

    setLoading(true)
    setError(null)

    try {
      const share = await shareApi.createArticleShare(text, articleUrl, articleTitle, articleDescription, visibility)
      setLastShare(share)
      return share
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create article share')
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [shareApi])

  const getShareAnalytics = useCallback(async (shareId: string) => {
    if (!shareApi) return null

    setLoading(true)
    setError(null)

    try {
      return await shareApi.getShareAnalytics(shareId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get share analytics')
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [shareApi])

  const deleteShare = useCallback(async (shareId: string) => {
    if (!shareApi) return false

    setLoading(true)
    setError(null)

    try {
      await shareApi.deleteShare(shareId)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete share')
      setError(error)
      return false
    } finally {
      setLoading(false)
    }
  }, [shareApi])

  return {
    shareApi,
    loading,
    error,
    lastShare,
    createTextShare,
    createImageShare,
    createArticleShare,
    getShareAnalytics,
    deleteShare
  }
}

// Utility functions for LinkedIn Share API
export class LinkedInShareUtils {
  /**
   * Validate share text length
   */
  static validateShareText(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'Share text cannot be empty' }
    }

    if (text.length > 3000) {
      return { isValid: false, error: 'Share text cannot exceed 3000 characters' }
    }

    return { isValid: true }
  }

  /**
   * Format share text with hashtags and mentions
   */
  static formatShareText(text: string, hashtags?: string[], mentions?: string[]): string {
    let formattedText = text

    // Add hashtags
    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags.map(tag => `#${tag.replace('#', '')}`).join(' ')
      formattedText += ` ${hashtagString}`
    }

    // Add mentions
    if (mentions && mentions.length > 0) {
      const mentionString = mentions.map(mention => `@${mention.replace('@', '')}`).join(' ')
      formattedText += ` ${mentionString}`
    }

    return formattedText.trim()
  }

  /**
   * Extract hashtags from text
   */
  static extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g
    const matches = text.match(hashtagRegex)
    return matches ? matches.map(tag => tag.substring(1)) : []
  }

  /**
   * Extract mentions from text
   */
  static extractMentions(text: string): string[] {
    const mentionRegex = /@[\w\u0590-\u05ff]+/g
    const matches = text.match(mentionRegex)
    return matches ? matches.map(mention => mention.substring(1)) : []
  }

  /**
   * Get share visibility options
   */
  static getVisibilityOptions(): Array<{ value: 'PUBLIC' | 'CONNECTIONS'; label: string; description: string }> {
    return [
      {
        value: 'PUBLIC',
        label: 'Public',
        description: 'Visible to everyone on LinkedIn'
      },
      {
        value: 'CONNECTIONS',
        label: 'Connections Only',
        description: 'Visible only to your connections'
      }
    ]
  }

  /**
   * Get media category options
   */
  static getMediaCategoryOptions(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'NONE',
        label: 'Text Only',
        description: 'Share text without media'
      },
      {
        value: 'IMAGE',
        label: 'Image',
        description: 'Share with an image'
      },
      {
        value: 'ARTICLE',
        label: 'Article',
        description: 'Share with an article link'
      },
      {
        value: 'VIDEO',
        label: 'Video',
        description: 'Share with a video (requires additional setup)'
      }
    ]
  }
}

// Types are already exported above in their interface declarations
