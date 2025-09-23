/**
 * Universal Inbox System
 * 
 * Comprehensive inbox management system that aggregates messages, notifications,
 * comments, and interactions from all connected social media platforms.
 */

import {
  UnifiedPost,
  UnifiedComment,
  UnifiedMessage,
  UnifiedNotification,
  UnifiedConversation,
  UnifiedInbox,
  InboxFilter,
  InboxSettings,
  ForwardingRule,
  SearchQuery,
  SearchResult,
  RealtimeUpdate,
  RealtimeSubscription,
  CategoryView,
  PlatformView
} from './unified-data-types'

export interface InboxItem {
  id: string
  type: 'post' | 'comment' | 'message' | 'notification'
  platform: string
  data: UnifiedPost | UnifiedComment | UnifiedMessage | UnifiedNotification
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  isImportant: boolean
  isArchived: boolean
  tags: string[]
  categories: string[]
  createdAt: Date
  updatedAt: Date
  metadata: {
    source: string
    originalId: string
    processedAt: Date
    transformations: string[]
  }
}

export interface InboxConfiguration {
  id: string
  name: string
  description?: string
  type: 'universal' | 'platform' | 'category' | 'custom'
  platforms: string[]
  filters: InboxFilter[]
  sortBy: 'date' | 'platform' | 'sender' | 'priority' | 'engagement'
  sortOrder: 'asc' | 'desc'
  isActive: boolean
  autoRefresh: boolean
  refreshInterval: number // minutes
  maxItems: number
  settings: InboxSettings
  createdAt: Date
  updatedAt: Date
}

export interface InboxStats {
  totalItems: number
  unreadItems: number
  importantItems: number
  archivedItems: number
  itemsByPlatform: Record<string, number>
  itemsByType: Record<string, number>
  itemsByPriority: Record<string, number>
  averageResponseTime: number
  lastActivity: Date
  trends: {
    daily: Array<{ date: string; count: number }>
    weekly: Array<{ week: string; count: number }>
    monthly: Array<{ month: string; count: number }>
  }
}

/**
 * Universal Inbox Manager
 */
export class UniversalInboxManager {
  private inboxes: Map<string, UnifiedInbox> = new Map()
  private items: Map<string, InboxItem> = new Map()
  private configurations: Map<string, InboxConfiguration> = new Map()
  private realtimeSubscriptions: Map<string, RealtimeSubscription> = new Map()
  private categoryViews: Map<string, CategoryView> = new Map()
  private platformViews: Map<string, PlatformView> = new Map()

  constructor() {
    this.initializeDefaultInboxes()
  }

  /**
   * Initialize default inbox configurations
   */
  private initializeDefaultInboxes(): void {
    // Universal inbox - all platforms
    this.createInbox({
      name: 'Universal Inbox',
      description: 'All messages, notifications, and interactions from all platforms',
      type: 'universal',
      platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube', 'pinterest', 'reddit'],
      filters: [],
      sortBy: 'date',
      sortOrder: 'desc',
      isActive: true,
      settings: {
        autoMarkAsRead: false,
        showNotifications: true,
        groupByPlatform: true,
        groupByDate: true,
        groupBySender: false,
        showEngagementMetrics: true,
        showSentimentAnalysis: true
      }
    })

    // High priority inbox
    this.createInbox({
      name: 'High Priority',
      description: 'Important messages and notifications requiring immediate attention',
      type: 'custom',
      platforms: ['linkedin', 'twitter', 'facebook', 'instagram'],
      filters: [
        { field: 'priority', operator: 'in', value: ['high', 'urgent'], isActive: true }
      ],
      sortBy: 'priority',
      sortOrder: 'desc',
      isActive: true,
      settings: {
        autoMarkAsRead: false,
        showNotifications: true,
        groupByPlatform: false,
        groupByDate: false,
        groupBySender: true,
        showEngagementMetrics: true,
        showSentimentAnalysis: true
      }
    })

    // Mentions and tags inbox
    this.createInbox({
      name: 'Mentions & Tags',
      description: 'Posts and messages that mention you or contain specific tags',
      type: 'custom',
      platforms: ['linkedin', 'twitter', 'facebook', 'instagram'],
      filters: [
        { field: 'content', operator: 'contains', value: '@yourusername', isActive: true }
      ],
      sortBy: 'date',
      sortOrder: 'desc',
      isActive: true,
      settings: {
        autoMarkAsRead: false,
        showNotifications: true,
        groupByPlatform: true,
        groupByDate: true,
        groupBySender: false,
        showEngagementMetrics: true,
        showSentimentAnalysis: true
      }
    })
  }

  /**
   * Create a new inbox configuration
   */
  createInbox(config: Omit<InboxConfiguration, 'id' | 'createdAt' | 'updatedAt'>): UnifiedInbox {
    const inboxId = this.generateInboxId()
    const now = new Date()

    const inbox: UnifiedInbox = {
      id: inboxId,
      name: config.name,
      description: config.description,
      type: config.type,
      platforms: config.platforms,
      filters: config.filters,
      sortBy: config.sortBy,
      sortOrder: config.sortOrder,
      isActive: config.isActive,
      unreadCount: 0,
      totalCount: 0,
      lastUpdated: now,
      settings: config.settings
    }

    this.inboxes.set(inboxId, inbox)

    const inboxConfig: InboxConfiguration = {
      ...config,
      id: inboxId,
      createdAt: now,
      updatedAt: now
    }

    this.configurations.set(inboxId, inboxConfig)

    return inbox
  }

  /**
   * Add an item to the inbox system
   */
  addItem(item: Omit<InboxItem, 'id' | 'createdAt' | 'updatedAt'>): InboxItem {
    const itemId = this.generateItemId()
    const now = new Date()

    const inboxItem: InboxItem = {
      ...item,
      id: itemId,
      createdAt: now,
      updatedAt: now
    }

    this.items.set(itemId, inboxItem)

    // Update inbox counts
    this.updateInboxCounts()

    // Check if item matches any inbox filters
    this.processItemForInboxes(inboxItem)

    // Notify real-time subscribers
    this.notifyRealtimeSubscribers({
      id: this.generateUpdateId(),
      type: this.getUpdateTypeFromItemType(item.type),
      platform: item.platform,
      data: item.data,
      timestamp: now,
      priority: item.priority
    })

    return inboxItem
  }

  /**
   * Get items for a specific inbox
   */
  getInboxItems(inboxId: string, limit = 50, offset = 0): InboxItem[] {
    const inbox = this.inboxes.get(inboxId)
    if (!inbox) {
      throw new Error(`Inbox ${inboxId} not found`)
    }

    let items = Array.from(this.items.values())

    // Apply platform filter
    if (inbox.platforms.length > 0) {
      items = items.filter(item => inbox.platforms.includes(item.platform))
    }

    // Apply custom filters
    items = this.applyFilters(items, inbox.filters)

    // Apply sorting
    items = this.applySorting(items, inbox.sortBy, inbox.sortOrder)

    // Apply pagination
    return items.slice(offset, offset + limit)
  }

  /**
   * Mark item as read
   */
  markAsRead(itemId: string): void {
    const item = this.items.get(itemId)
    if (item && !item.isRead) {
      item.isRead = true
      item.updatedAt = new Date()
      this.updateInboxCounts()
    }
  }

  /**
   * Mark item as important
   */
  markAsImportant(itemId: string, important: boolean = true): void {
    const item = this.items.get(itemId)
    if (item) {
      item.isImportant = important
      item.updatedAt = new Date()
    }
  }

  /**
   * Archive item
   */
  archiveItem(itemId: string): void {
    const item = this.items.get(itemId)
    if (item) {
      item.isArchived = true
      item.updatedAt = new Date()
      this.updateInboxCounts()
    }
  }

  /**
   * Add tags to item
   */
  addTags(itemId: string, tags: string[]): void {
    const item = this.items.get(itemId)
    if (item) {
      item.tags = [...new Set([...item.tags, ...tags])]
      item.updatedAt = new Date()
    }
  }

  /**
   * Remove tags from item
   */
  removeTags(itemId: string, tags: string[]): void {
    const item = this.items.get(itemId)
    if (item) {
      item.tags = item.tags.filter(tag => !tags.includes(tag))
      item.updatedAt = new Date()
    }
  }

  /**
   * Search items across all inboxes
   */
  searchItems(query: SearchQuery): SearchResult {
    let items = Array.from(this.items.values())

    // Apply platform filter
    if (query.platforms && query.platforms.length > 0) {
      items = items.filter(item => query.platforms!.includes(item.platform))
    }

    // Apply type filter
    if (query.types && query.types.length > 0) {
      items = items.filter(item => query.types!.includes(item.type))
    }

    // Apply date range filter
    if (query.dateRange) {
      items = items.filter(item => 
        item.createdAt >= query.dateRange!.start && 
        item.createdAt <= query.dateRange!.end
      )
    }

    // Apply custom filters
    if (query.filters && query.filters.length > 0) {
      items = this.applyFilters(items, query.filters)
    }

    // Apply text search
    if (query.query) {
      const searchTerm = query.query.toLowerCase()
      items = items.filter(item => {
        const data = item.data as any
        return (
          data.text?.toLowerCase().includes(searchTerm) ||
          data.content?.text?.toLowerCase().includes(searchTerm) ||
          data.message?.toLowerCase().includes(searchTerm) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      })
    }

    // Apply sorting
    if (query.sortBy) {
      items = this.applySorting(items, query.sortBy, query.sortOrder || 'desc')
    }

    // Calculate facets
    const facets = this.calculateFacets(items)

    // Apply pagination
    const offset = query.offset || 0
    const limit = query.limit || 50
    const paginatedItems = items.slice(offset, offset + limit)

    return {
      items: paginatedItems,
      totalCount: items.length,
      hasMore: offset + limit < items.length,
      facets,
      query,
      executedAt: new Date()
    }
  }

  /**
   * Get inbox statistics
   */
  getInboxStats(inboxId?: string): InboxStats {
    let items = Array.from(this.items.values())

    if (inboxId) {
      const inbox = this.inboxes.get(inboxId)
      if (inbox) {
        items = this.applyFilters(items, inbox.filters)
        if (inbox.platforms.length > 0) {
          items = items.filter(item => inbox.platforms.includes(item.platform))
        }
      }
    }

    const stats: InboxStats = {
      totalItems: items.length,
      unreadItems: items.filter(item => !item.isRead).length,
      importantItems: items.filter(item => item.isImportant).length,
      archivedItems: items.filter(item => item.isArchived).length,
      itemsByPlatform: {},
      itemsByType: {},
      itemsByPriority: {},
      averageResponseTime: 0,
      lastActivity: new Date(),
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      }
    }

    // Calculate platform distribution
    items.forEach(item => {
      stats.itemsByPlatform[item.platform] = (stats.itemsByPlatform[item.platform] || 0) + 1
      stats.itemsByType[item.type] = (stats.itemsByType[item.type] || 0) + 1
      stats.itemsByPriority[item.priority] = (stats.itemsByPriority[item.priority] || 0) + 1
    })

    // Calculate trends
    stats.trends = this.calculateTrends(items)

    return stats
  }

  /**
   * Create category view
   */
  createCategoryView(config: Omit<CategoryView, 'id' | 'items' | 'totalCount' | 'lastUpdated'>): CategoryView {
    const viewId = this.generateViewId()
    const now = new Date()

    const view: CategoryView = {
      ...config,
      id: viewId,
      items: [],
      totalCount: 0,
      lastUpdated: now
    }

    this.categoryViews.set(viewId, view)
    this.refreshCategoryView(viewId)

    return view
  }

  /**
   * Refresh category view
   */
  refreshCategoryView(viewId: string): void {
    const view = this.categoryViews.get(viewId)
    if (!view) return

    let items = Array.from(this.items.values())

    // Apply platform filter
    if (view.platforms.length > 0) {
      items = items.filter(item => view.platforms.includes(item.platform))
    }

    // Apply filters
    items = this.applyFilters(items, view.filters)

    // Apply sorting
    items = this.applySorting(items, view.sortBy, view.sortOrder)

    view.items = items
    view.totalCount = items.length
    view.lastUpdated = new Date()
  }

  /**
   * Create platform view
   */
  createPlatformView(platform: string): PlatformView {
    const viewId = this.generateViewId()
    const now = new Date()

    const view: PlatformView = {
      platform,
      isConnected: true, // This would be checked against actual connections
      lastSyncAt: now,
      totalPosts: 0,
      totalMessages: 0,
      totalNotifications: 0,
      unreadCount: 0,
      recentActivity: [],
      topPerformers: [],
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        engagementRate: 0
      },
      settings: {
        autoSync: true,
        syncInterval: 15,
        includeArchived: false,
        includeDeleted: false,
        maxItemsPerSync: 100,
        customFields: {},
        filters: []
      }
    }

    this.platformViews.set(viewId, view)
    this.refreshPlatformView(viewId)

    return view
  }

  /**
   * Refresh platform view
   */
  refreshPlatformView(viewId: string): void {
    const view = this.platformViews.get(viewId)
    if (!view) return

    const platformItems = Array.from(this.items.values())
      .filter(item => item.platform === view.platform)

    view.totalPosts = platformItems.filter(item => item.type === 'post').length
    view.totalMessages = platformItems.filter(item => item.type === 'message').length
    view.totalNotifications = platformItems.filter(item => item.type === 'notification').length
    view.unreadCount = platformItems.filter(item => !item.isRead).length

    // Get recent activity (last 10 items)
    view.recentActivity = platformItems
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)

    // Calculate engagement metrics
    const posts = platformItems.filter(item => item.type === 'post')
    view.engagement = this.calculateEngagementMetrics(posts)
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates(subscription: Omit<RealtimeSubscription, 'id' | 'createdAt'>): RealtimeSubscription {
    const subscriptionId = this.generateSubscriptionId()
    const now = new Date()

    const realtimeSubscription: RealtimeSubscription = {
      ...subscription,
      id: subscriptionId,
      createdAt: now
    }

    this.realtimeSubscriptions.set(subscriptionId, realtimeSubscription)

    return realtimeSubscription
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromUpdates(subscriptionId: string): void {
    this.realtimeSubscriptions.delete(subscriptionId)
  }

  /**
   * Apply filters to items
   */
  private applyFilters(items: InboxItem[], filters: InboxFilter[]): InboxItem[] {
    return items.filter(item => {
      return filters.every(filter => {
        if (!filter.isActive) return true

        switch (filter.field) {
          case 'platform':
            return this.compareValue(item.platform, filter.operator, filter.value)
          case 'sender':
            const sender = this.getSenderFromItem(item)
            return this.compareValue(sender, filter.operator, filter.value)
          case 'content':
            const content = this.getContentFromItem(item)
            return this.compareValue(content, filter.operator, filter.value)
          case 'type':
            return this.compareValue(item.type, filter.operator, filter.value)
          case 'status':
            return this.compareValue(item.isRead ? 'read' : 'unread', filter.operator, filter.value)
          case 'date':
            return this.compareValue(item.createdAt, filter.operator, filter.value)
          case 'tags':
            return this.compareValue(item.tags, filter.operator, filter.value)
          default:
            return true
        }
      })
    })
  }

  /**
   * Apply sorting to items
   */
  private applySorting(items: InboxItem[], sortBy: string, sortOrder: 'asc' | 'desc'): InboxItem[] {
    return items.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'date':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        case 'platform':
          aValue = a.platform
          bValue = b.platform
          break
        case 'sender':
          aValue = this.getSenderFromItem(a)
          bValue = this.getSenderFromItem(b)
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'engagement':
          aValue = this.getEngagementFromItem(a)
          bValue = this.getEngagementFromItem(b)
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  /**
   * Compare values based on operator
   */
  private compareValue(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected
      case 'contains':
        return String(actual).toLowerCase().includes(String(expected).toLowerCase())
      case 'starts_with':
        return String(actual).toLowerCase().startsWith(String(expected).toLowerCase())
      case 'ends_with':
        return String(actual).toLowerCase().endsWith(String(expected).toLowerCase())
      case 'greater_than':
        return actual > expected
      case 'less_than':
        return actual < expected
      case 'in':
        return Array.isArray(expected) ? expected.includes(actual) : false
      case 'not_in':
        return Array.isArray(expected) ? !expected.includes(actual) : true
      default:
        return true
    }
  }

  /**
   * Get sender from item
   */
  private getSenderFromItem(item: InboxItem): string {
    const data = item.data as any
    return data.author?.displayName || data.sender?.displayName || 'Unknown'
  }

  /**
   * Get content from item
   */
  private getContentFromItem(item: InboxItem): string {
    const data = item.data as any
    return data.text || data.content?.text || data.message || ''
  }

  /**
   * Get engagement from item
   */
  private getEngagementFromItem(item: InboxItem): number {
    const data = item.data as any
    const engagement = data.engagement || {}
    return (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
  }

  /**
   * Calculate facets for search results
   */
  private calculateFacets(items: InboxItem[]): any {
    const facets = {
      platforms: {} as Record<string, number>,
      types: {} as Record<string, number>,
      dates: {} as Record<string, number>,
      users: {} as Record<string, number>
    }

    items.forEach(item => {
      facets.platforms[item.platform] = (facets.platforms[item.platform] || 0) + 1
      facets.types[item.type] = (facets.types[item.type] || 0) + 1
      
      const dateKey = item.createdAt.toISOString().split('T')[0]
      facets.dates[dateKey] = (facets.dates[dateKey] || 0) + 1
      
      const sender = this.getSenderFromItem(item)
      facets.users[sender] = (facets.users[sender] || 0) + 1
    })

    return facets
  }

  /**
   * Calculate trends
   */
  private calculateTrends(items: InboxItem[]): any {
    const now = new Date()
    const trends = {
      daily: [] as Array<{ date: string; count: number }>,
      weekly: [] as Array<{ week: string; count: number }>,
      monthly: [] as Array<{ month: string; count: number }>
    }

    // Group items by date
    const dailyCounts = new Map<string, number>()
    const weeklyCounts = new Map<string, number>()
    const monthlyCounts = new Map<string, number>()

    items.forEach(item => {
      const date = item.createdAt
      const dayKey = date.toISOString().split('T')[0]
      const weekKey = this.getWeekKey(date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      dailyCounts.set(dayKey, (dailyCounts.get(dayKey) || 0) + 1)
      weeklyCounts.set(weekKey, (weeklyCounts.get(weekKey) || 0) + 1)
      monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1)
    })

    // Convert to arrays
    trends.daily = Array.from(dailyCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    trends.weekly = Array.from(weeklyCounts.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))

    trends.monthly = Array.from(monthlyCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return trends
  }

  /**
   * Calculate engagement metrics
   */
  private calculateEngagementMetrics(posts: InboxItem[]): any {
    let totalLikes = 0
    let totalComments = 0
    let totalShares = 0

    posts.forEach(post => {
      const data = post.data as any
      const engagement = data.engagement || {}
      totalLikes += engagement.likes || 0
      totalComments += engagement.comments || 0
      totalShares += engagement.shares || 0
    })

    const totalEngagement = totalLikes + totalComments + totalShares
    const engagementRate = posts.length > 0 ? totalEngagement / posts.length : 0

    return {
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      engagementRate
    }
  }

  /**
   * Process item for inboxes
   */
  private processItemForInboxes(item: InboxItem): void {
    this.inboxes.forEach((inbox, inboxId) => {
      if (!inbox.isActive) return

      // Check if item matches inbox criteria
      let matches = true

      // Check platform filter
      if (inbox.platforms.length > 0 && !inbox.platforms.includes(item.platform)) {
        matches = false
      }

      // Check custom filters
      if (matches && inbox.filters.length > 0) {
        const filteredItems = this.applyFilters([item], inbox.filters)
        matches = filteredItems.length > 0
      }

      if (matches) {
        // Update inbox counts
        this.updateInboxCounts()
      }
    })
  }

  /**
   * Update inbox counts
   */
  private updateInboxCounts(): void {
    this.inboxes.forEach((inbox, inboxId) => {
      const items = this.getInboxItems(inboxId, 1000, 0) // Get all items
      inbox.totalCount = items.length
      inbox.unreadCount = items.filter(item => !item.isRead).length
      inbox.lastUpdated = new Date()
    })
  }

  /**
   * Notify real-time subscribers
   */
  private notifyRealtimeSubscribers(update: RealtimeUpdate): void {
    this.realtimeSubscriptions.forEach(subscription => {
      if (!subscription.isActive) return

      // Check if update matches subscription criteria
      let matches = true

      if (subscription.platforms.length > 0 && !subscription.platforms.includes(update.platform)) {
        matches = false
      }

      if (subscription.types.length > 0 && !subscription.types.includes(update.type)) {
        matches = false
      }

      if (matches && subscription.filters && subscription.filters.length > 0) {
        // Apply filters to update data
        const item = this.items.get(update.data.id)
        if (item) {
          const filteredItems = this.applyFilters([item], subscription.filters)
          matches = filteredItems.length > 0
        }
      }

      if (matches) {
        try {
          subscription.callback(update)
        } catch (error) {
          console.error('Error in real-time subscription callback:', error)
        }
      }
    })
  }

  /**
   * Get update type from item type
   */
  private getUpdateTypeFromItemType(itemType: string): string {
    switch (itemType) {
      case 'post':
        return 'new_post'
      case 'comment':
        return 'new_comment'
      case 'message':
        return 'new_message'
      case 'notification':
        return 'new_notification'
      default:
        return 'status_change'
    }
  }

  /**
   * Get week key for date
   */
  private getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = this.getWeekNumber(date)
    return `${year}-W${String(week).padStart(2, '0')}`
  }

  /**
   * Get week number for date
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  /**
   * Generate unique IDs
   */
  private generateInboxId(): string {
    return `inbox_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private generateItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private generateViewId(): string {
    return `view_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }
}

// Export singleton instance
export const universalInboxManager = new UniversalInboxManager()
