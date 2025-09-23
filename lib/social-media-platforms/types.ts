/**
 * 🌐 SOCIAL MEDIA PLATFORM TYPES
 * Unified types for cross-platform social media integration
 */

// Platform identifiers
export type PlatformId = 
  | 'linkedin'
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'reddit'
  | 'discord'
  | 'telegram'
  | 'mastodon'

// Platform capabilities matrix
export interface PlatformCapabilities {
  // Content operations
  canPost: boolean
  canPostMedia: boolean
  canPostVideo: boolean
  canPostStories: boolean
  canPostLive: boolean
  canSchedule: boolean
  canEdit: boolean
  canDelete: boolean
  
  // Engagement operations
  canLike: boolean
  canComment: boolean
  canShare: boolean
  canReact: boolean
  
  // Messaging operations
  canSendDM: boolean
  canReceiveDM: boolean
  canGroupMessage: boolean
  
  // Analytics operations
  canGetAnalytics: boolean
  canGetEngagement: boolean
  canGetReach: boolean
  canGetDemographics: boolean
  
  // Search operations
  canSearchPosts: boolean
  canSearchUsers: boolean
  canSearchHashtags: boolean
  
  // Webhook support
  supportsWebhooks: boolean
  webhookTypes: WebhookType[]
  
  // Rate limits
  rateLimits: {
    posts: { requests: number; window: number }
    messages: { requests: number; window: number }
    analytics: { requests: number; window: number }
    search: { requests: number; window: number }
  }
  
  // Content constraints
  constraints: {
    maxTextLength: number
    maxMediaCount: number
    supportedMediaTypes: string[]
    maxVideoSize: number
    maxVideoDuration: number
    hashtagSupport: boolean
    mentionSupport: boolean
    linkSupport: boolean
  }
  
  // Approval requirements
  requiresApproval: {
    posting: boolean
    messaging: boolean
    analytics: boolean
    webhooks: boolean
  }
  
  // Partner program requirements
  partnerProgram: {
    required: boolean
    tier: 'basic' | 'premium' | 'enterprise'
    features: string[]
  }
}

// Webhook types
export type WebhookType = 
  | 'post_created'
  | 'post_updated'
  | 'post_deleted'
  | 'comment_created'
  | 'comment_updated'
  | 'comment_deleted'
  | 'message_received'
  | 'message_sent'
  | 'user_followed'
  | 'user_unfollowed'
  | 'like_received'
  | 'share_received'
  | 'mention_received'
  | 'analytics_updated'

// Unified content types
export interface UnifiedPost {
  id: string
  platform: PlatformId
  platformPostId: string
  authorId: string
  author: UnifiedUser
  content: {
    text?: string
    media: UnifiedMedia[]
    hashtags: string[]
    mentions: string[]
    links: string[]
  }
  metadata: {
    createdAt: Date
    updatedAt?: Date
    publishedAt?: Date
    scheduledFor?: Date
    isScheduled: boolean
    isEdited: boolean
    language?: string
    location?: string
  }
  engagement: {
    likes: number
    comments: number
    shares: number
    views?: number
    reactions?: Record<string, number>
  }
  visibility: 'public' | 'private' | 'followers' | 'custom'
  rawData: any // Platform-specific raw data
}

export interface UnifiedUser {
  id: string
  platform: PlatformId
  platformUserId: string
  username: string
  displayName: string
  bio?: string
  avatar?: string
  verified: boolean
  followers: number
  following: number
  posts: number
  metadata: {
    createdAt: Date
    lastActive?: Date
    location?: string
    website?: string
    language?: string
  }
  rawData: any
}

export interface UnifiedMedia {
  id: string
  type: 'image' | 'video' | 'gif' | 'audio' | 'document'
  url: string
  thumbnailUrl?: string
  altText?: string
  metadata: {
    width?: number
    height?: number
    duration?: number
    size: number
    format: string
    createdAt: Date
  }
  rawData: any
}

export interface UnifiedComment {
  id: string
  platform: PlatformId
  platformCommentId: string
  postId: string
  authorId: string
  author: UnifiedUser
  content: {
    text: string
    media: UnifiedMedia[]
    mentions: string[]
    links: string[]
  }
  metadata: {
    createdAt: Date
    updatedAt?: Date
    isEdited: boolean
    parentId?: string
    replies: number
  }
  engagement: {
    likes: number
    replies: number
  }
  rawData: any
}

export interface UnifiedMessage {
  id: string
  platform: PlatformId
  platformMessageId: string
  conversationId: string
  senderId: string
  sender: UnifiedUser
  recipientId?: string
  recipient?: UnifiedUser
  content: {
    text?: string
    media: UnifiedMedia[]
    attachments: UnifiedMedia[]
  }
  metadata: {
    sentAt: Date
    readAt?: Date
    isRead: boolean
    isEdited: boolean
    messageType: 'text' | 'media' | 'system' | 'call' | 'file'
  }
  rawData: any
}

export interface UnifiedNotification {
  id: string
  platform: PlatformId
  platformNotificationId: string
  userId: string
  type: 'like' | 'comment' | 'mention' | 'follow' | 'message' | 'share' | 'system'
  title: string
  message: string
  metadata: {
    createdAt: Date
    isRead: boolean
    readAt?: Date
    actionUrl?: string
    relatedEntityId?: string
    relatedEntityType?: 'post' | 'comment' | 'user' | 'message'
  }
  rawData: any
}

export interface UnifiedAnalytics {
  id: string
  platform: PlatformId
  entityId: string
  entityType: 'post' | 'user' | 'page' | 'account'
  period: {
    start: Date
    end: Date
    granularity: 'hour' | 'day' | 'week' | 'month'
  }
  metrics: {
    // Reach metrics
    impressions: number
    reach: number
    uniqueReach: number
    
    // Engagement metrics
    likes: number
    comments: number
    shares: number
    saves: number
    clicks: number
    
    // Video metrics
    videoViews: number
    videoCompletions: number
    averageWatchTime: number
    
    // Audience metrics
    demographics: {
      age: Record<string, number>
      gender: Record<string, number>
      location: Record<string, number>
      interests: Record<string, number>
    }
    
    // Performance metrics
    engagementRate: number
    clickThroughRate: number
    conversionRate: number
  }
  rawData: any
}

// Platform-specific configuration
export interface PlatformConfig {
  platformId: PlatformId
  name: string
  capabilities: PlatformCapabilities
  oauth: {
    clientId: string
    clientSecret: string
    redirectUri: string
    scopes: string[]
    authUrl: string
    tokenUrl: string
  }
  api: {
    baseUrl: string
    version: string
    endpoints: Record<string, string>
  }
  webhooks?: {
    endpoint: string
    secret: string
    events: WebhookType[]
  }
  rateLimits: {
    global: { requests: number; window: number }
    endpoints: Record<string, { requests: number; window: number }>
  }
}

// Connection status
export interface PlatformConnection {
  id: string
  userId: string
  platformId: PlatformId
  platformUserId: string
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: Date
  scopes: string[]
  status: 'active' | 'expired' | 'revoked' | 'error'
  metadata: {
    connectedAt: Date
    lastUsedAt?: Date
    lastError?: string
    errorCount: number
  }
  capabilities: PlatformCapabilities
}

// Cross-posting configuration
export interface CrossPostConfig {
  id: string
  userId: string
  platforms: PlatformId[]
  content: {
    text: string
    media: UnifiedMedia[]
    hashtags: string[]
    mentions: string[]
  }
  scheduling?: {
    publishAt: Date
    timezone: string
  }
  platformSpecific: Record<PlatformId, {
    text?: string
    media?: UnifiedMedia[]
    hashtags?: string[]
    mentions?: string[]
    metadata?: any
  }>
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'
  results: Record<PlatformId, {
    postId?: string
    status: 'success' | 'failed' | 'pending'
    error?: string
    publishedAt?: Date
  }>
}

// Search and filtering
export interface SearchFilters {
  platforms?: PlatformId[]
  contentTypes?: ('post' | 'comment' | 'message' | 'user')[]
  dateRange?: {
    start: Date
    end: Date
  }
  authors?: string[]
  hashtags?: string[]
  mentions?: string[]
  keywords?: string[]
  engagement?: {
    minLikes?: number
    minComments?: number
    minShares?: number
  }
  visibility?: ('public' | 'private' | 'followers')[]
}

export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  facets: {
    platforms: Record<PlatformId, number>
    contentTypes: Record<string, number>
    authors: Record<string, number>
    hashtags: Record<string, number>
    dates: Record<string, number>
  }
}

// Error handling
export interface PlatformError {
  code: string
  message: string
  platform: PlatformId
  endpoint?: string
  statusCode?: number
  retryable: boolean
  details?: any
}

// Webhook payload
export interface WebhookPayload {
  platform: PlatformId
  event: WebhookType
  timestamp: Date
  data: any
  signature?: string
  rawPayload: any
}

// Rate limiting
export interface RateLimitInfo {
  platform: PlatformId
  endpoint: string
  limit: number
  remaining: number
  resetAt: Date
  retryAfter?: number
}

// Bulk operations
export interface BulkOperation {
  id: string
  type: 'import' | 'export' | 'sync' | 'cleanup'
  platform: PlatformId
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: {
    total: number
    processed: number
    failed: number
    skipped: number
  }
  metadata: {
    startedAt: Date
    completedAt?: Date
    error?: string
    options: any
  }
  results?: any[]
}
