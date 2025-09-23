/**
 * Unified Data Types for Social Media Platforms
 * 
 * This file defines common data structures that can be used across all social media platforms,
 * enabling unified viewing and management of content, analytics, and interactions.
 */

export interface UnifiedPost {
  id: string
  platform: string
  platformPostId: string
  author: UnifiedUser
  content: UnifiedContent
  engagement: UnifiedEngagement
  metadata: UnifiedMetadata
  visibility: 'public' | 'private' | 'unlisted' | 'connections' | 'followers'
  createdAt: Date
  updatedAt?: Date
  scheduledAt?: Date
  publishedAt?: Date
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'deleted'
  tags: string[]
  mentions: UnifiedUser[]
  hashtags: string[]
  links: UnifiedLink[]
  location?: UnifiedLocation
  campaign?: UnifiedCampaign
  originalPost?: UnifiedPost // For reposts/shares
}

export interface UnifiedUser {
  id: string
  platform: string
  platformUserId: string
  username: string
  displayName: string
  profilePicture?: string
  bio?: string
  verified: boolean
  followerCount?: number
  followingCount?: number
  postCount?: number
  location?: string
  website?: string
  joinedAt?: Date
  lastActiveAt?: Date
  metrics?: {
    engagementRate?: number
    averageLikes?: number
    averageComments?: number
    averageShares?: number
  }
  customFields?: Record<string, any>
}

export interface UnifiedContent {
  text?: string
  media: UnifiedMedia[]
  poll?: UnifiedPoll
  linkPreview?: UnifiedLinkPreview
  formattedText?: string // HTML or markdown formatted text
  language?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  topics?: string[]
  categories?: string[]
}

export interface UnifiedMedia {
  id: string
  type: 'image' | 'video' | 'audio' | 'gif' | 'document'
  url: string
  thumbnailUrl?: string
  altText?: string
  caption?: string
  duration?: number // for video/audio
  size?: number // file size in bytes
  dimensions?: {
    width: number
    height: number
  }
  format?: string // jpg, png, mp4, etc.
  metadata?: Record<string, any>
}

export interface UnifiedPoll {
  id: string
  question: string
  options: Array<{
    id: string
    text: string
    votes: number
  }>
  totalVotes: number
  expiresAt?: Date
  allowMultipleVotes: boolean
  showVoteCounts: boolean
}

export interface UnifiedLinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  domain?: string
  favicon?: string
}

export interface UnifiedEngagement {
  likes: number
  comments: number
  shares: number
  saves?: number
  views?: number
  clicks?: number
  reactions?: Record<string, number> // platform-specific reactions
  engagementRate?: number
  reach?: number
  impressions?: number
  lastEngagementAt?: Date
  topEngagers?: UnifiedUser[]
}

export interface UnifiedComment {
  id: string
  platform: string
  platformCommentId: string
  postId: string
  author: UnifiedUser
  content: string
  parentCommentId?: string // for replies
  replies: UnifiedComment[]
  engagement: {
    likes: number
    replies: number
  }
  createdAt: Date
  updatedAt?: Date
  isEdited: boolean
  isPinned: boolean
  isHidden: boolean
  sentiment?: 'positive' | 'negative' | 'neutral'
  mentions: UnifiedUser[]
  hashtags: string[]
}

export interface UnifiedMessage {
  id: string
  platform: string
  platformMessageId: string
  conversationId: string
  sender: UnifiedUser
  recipients: UnifiedUser[]
  content: UnifiedContent
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'system'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  createdAt: Date
  readAt?: Date
  deliveredAt?: Date
  isEdited: boolean
  replyTo?: UnifiedMessage
  attachments?: UnifiedMedia[]
  reactions?: Record<string, UnifiedUser[]>
}

export interface UnifiedConversation {
  id: string
  platform: string
  platformConversationId: string
  participants: UnifiedUser[]
  lastMessage?: UnifiedMessage
  unreadCount: number
  isGroup: boolean
  isArchived: boolean
  isMuted: boolean
  createdAt: Date
  updatedAt: Date
  metadata?: {
    title?: string
    description?: string
    avatar?: string
    settings?: Record<string, any>
  }
}

export interface UnifiedInbox {
  id: string
  name: string
  description?: string
  type: 'universal' | 'platform' | 'category' | 'custom'
  platforms: string[]
  filters: InboxFilter[]
  sortBy: 'date' | 'platform' | 'sender' | 'priority' | 'engagement'
  sortOrder: 'asc' | 'desc'
  isActive: boolean
  unreadCount: number
  totalCount: number
  lastUpdated: Date
  settings: InboxSettings
}

export interface InboxFilter {
  field: 'platform' | 'sender' | 'content' | 'type' | 'status' | 'date' | 'tags'
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  isActive: boolean
}

export interface InboxSettings {
  autoMarkAsRead: boolean
  showNotifications: boolean
  groupByPlatform: boolean
  groupByDate: boolean
  groupBySender: boolean
  showEngagementMetrics: boolean
  showSentimentAnalysis: boolean
  autoReply?: {
    enabled: boolean
    message: string
    conditions: InboxFilter[]
  }
  forwarding?: {
    enabled: boolean
    rules: ForwardingRule[]
  }
}

export interface ForwardingRule {
  id: string
  name: string
  conditions: InboxFilter[]
  actions: Array<{
    type: 'forward_to_email' | 'forward_to_platform' | 'assign_to_user' | 'add_tag' | 'mark_priority'
    value: any
  }>
  isActive: boolean
}

export interface UnifiedAnalytics {
  platform: string
  timeframe: {
    start: Date
    end: Date
    granularity: 'hour' | 'day' | 'week' | 'month'
  }
  metrics: {
    // Content Metrics
    totalPosts: number
    totalComments: number
    totalShares: number
    
    // Engagement Metrics
    totalLikes: number
    totalViews: number
    totalClicks: number
    totalSaves: number
    
    // Reach Metrics
    totalReach: number
    totalImpressions: number
    uniqueReach: number
    
    // Audience Metrics
    followerGrowth: number
    followerLoss: number
    netFollowerGrowth: number
    engagementRate: number
    clickThroughRate: number
    saveRate: number
    
    // Demographics
    demographics?: {
      ageGroups: Record<string, number>
      genders: Record<string, number>
      locations: Record<string, number>
      languages: Record<string, number>
    }
    
    // Device/Platform Metrics
    devices?: Record<string, number>
    platforms?: Record<string, number>
    
    // Time-based Metrics
    bestPostingTimes?: Array<{
      hour: number
      day: string
      engagement: number
    }>
    
    // Content Performance
    topPosts?: UnifiedPost[]
    topHashtags?: Array<{ tag: string; count: number }>
    topMentions?: Array<{ user: UnifiedUser; count: number }>
  }
  breakdown?: {
    byPlatform?: Record<string, UnifiedAnalytics>
    byContentType?: Record<string, UnifiedAnalytics>
    byCampaign?: Record<string, UnifiedAnalytics>
  }
  generatedAt: Date
}

export interface UnifiedCampaign {
  id: string
  name: string
  description?: string
  platforms: string[]
  posts: UnifiedPost[]
  startDate: Date
  endDate: Date
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  budget?: {
    total: number
    spent: number
    currency: string
    dailyLimit?: number
  }
  objectives: string[]
  targetAudience?: {
    demographics?: Record<string, any>
    interests?: string[]
    behaviors?: string[]
    locations?: string[]
  }
  metrics?: UnifiedAnalytics
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface UnifiedNotification {
  id: string
  platform: string
  platformNotificationId: string
  type: 'like' | 'comment' | 'share' | 'mention' | 'follow' | 'message' | 'system'
  title: string
  message: string
  actor: UnifiedUser
  target?: UnifiedPost | UnifiedComment | UnifiedMessage
  isRead: boolean
  isImportant: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: Date
  readAt?: Date
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface UnifiedLink {
  url: string
  title?: string
  description?: string
  domain: string
  clicks: number
  firstClickedAt?: Date
  lastClickedAt?: Date
  topReferrers?: Array<{
    platform: string
    count: number
  }>
}

export interface UnifiedLocation {
  name: string
  address?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  city?: string
  country?: string
  type?: 'venue' | 'city' | 'country' | 'custom'
}

export interface UnifiedMetadata {
  originalData?: any // Platform-specific raw data
  processingInfo?: {
    processedAt: Date
    version: string
    transformations: string[]
  }
  customFields?: Record<string, any>
  tags?: string[]
  categories?: string[]
  sentiment?: {
    score: number
    label: 'positive' | 'negative' | 'neutral'
    confidence: number
  }
  topics?: Array<{
    name: string
    confidence: number
  }>
  entities?: Array<{
    type: 'person' | 'organization' | 'location' | 'product' | 'event'
    name: string
    confidence: number
  }>
}

// Category-based data structures for unified viewing
export interface CategoryView {
  id: string
  name: string
  description?: string
  type: 'engagement' | 'content' | 'audience' | 'performance' | 'custom'
  platforms: string[]
  filters: InboxFilter[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  isActive: boolean
  items: Array<UnifiedPost | UnifiedComment | UnifiedMessage | UnifiedNotification>
  totalCount: number
  lastUpdated: Date
}

export interface PlatformView {
  platform: string
  isConnected: boolean
  lastSyncAt?: Date
  totalPosts: number
  totalMessages: number
  totalNotifications: number
  unreadCount: number
  recentActivity: Array<UnifiedPost | UnifiedComment | UnifiedMessage | UnifiedNotification>
  topPerformers: UnifiedPost[]
  engagement: UnifiedEngagement
  settings: PlatformSettings
}

export interface PlatformSettings {
  autoSync: boolean
  syncInterval: number // minutes
  includeArchived: boolean
  includeDeleted: boolean
  maxItemsPerSync: number
  customFields: Record<string, any>
  filters: InboxFilter[]
}

// Data transformation utilities
export interface DataTransformer {
  fromPlatform(platform: string, data: any): UnifiedPost | UnifiedComment | UnifiedMessage | UnifiedNotification
  toPlatform(platform: string, data: UnifiedPost | UnifiedComment | UnifiedMessage): any
  normalize(data: any): any
  validate(data: any): boolean
}

// Search and filtering interfaces
export interface SearchQuery {
  query: string
  platforms?: string[]
  types?: Array<'post' | 'comment' | 'message' | 'notification'>
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: InboxFilter[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface SearchResult {
  items: Array<UnifiedPost | UnifiedComment | UnifiedMessage | UnifiedNotification>
  totalCount: number
  hasMore: boolean
  facets?: {
    platforms: Record<string, number>
    types: Record<string, number>
    dates: Record<string, number>
    users: Record<string, number>
  }
  query: SearchQuery
  executedAt: Date
}

// Real-time update interfaces
export interface RealtimeUpdate {
  id: string
  type: 'new_post' | 'new_comment' | 'new_message' | 'new_notification' | 'engagement_update' | 'status_change'
  platform: string
  data: UnifiedPost | UnifiedComment | UnifiedMessage | UnifiedNotification
  timestamp: Date
  priority: 'low' | 'medium' | 'high'
}

export interface RealtimeSubscription {
  id: string
  platforms: string[]
  types: string[]
  filters?: InboxFilter[]
  callback: (update: RealtimeUpdate) => void
  isActive: boolean
  createdAt: Date
}
