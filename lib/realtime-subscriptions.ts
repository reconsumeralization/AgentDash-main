docum/**
 * Real-time Subscriptions System
 * Comprehensive real-time data synchronization for AgentDash
 * Handles LinkedIn profiles, aspirations, social media, and agent updates
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import { LinkedInComprehensiveProfile } from './linkedin-comprehensive-profile-types'

export interface RealtimeSubscription {
  id: string
  channel: RealtimeChannel
  table: string
  filter?: string
  callback: (payload: any) => void
  isActive: boolean
  createdAt: Date
  lastActivity?: Date
}

export interface RealtimeEvent<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  new: T | null
  old: T | null
  commit_timestamp: string
}

export interface RealtimeConnectionStatus {
  status: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'
  error?: string
  lastConnected?: Date
  reconnectAttempts: number
}

export interface SubscriptionOptions {
  filter?: string
  schema?: string
  immediate?: boolean
  maxRetries?: number
  retryDelay?: number
}

export class RealtimeSubscriptionManager {
  private client: SupabaseClient | null = null
  private subscriptions: Map<string, RealtimeSubscription> = new Map()
  private connectionStatus: RealtimeConnectionStatus = {
    status: 'CLOSED',
    reconnectAttempts: 0
  }
  private isInitialized = false
  private reconnectTimer?: NodeJS.Timeout
  private heartbeatTimer?: NodeJS.Timeout

  constructor() {
    this.initialize()
  }

  private initialize() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not found - real-time subscriptions disabled')
      return
    }

    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })

    this.setupConnectionHandlers()
    this.isInitialized = true
  }

  private setupConnectionHandlers() {
    if (!this.client) return

    this.client.realtime.onOpen(() => {
      this.connectionStatus = {
        status: 'OPEN',
        lastConnected: new Date(),
        reconnectAttempts: 0
      }
      console.log('Real-time connection established')
      this.startHeartbeat()
    })

    this.client.realtime.onClose(() => {
      this.connectionStatus.status = 'CLOSED'
      console.log('Real-time connection closed')
      this.stopHeartbeat()
      this.scheduleReconnect()
    })

    this.client.realtime.onError((error) => {
      this.connectionStatus = {
        ...this.connectionStatus,
        status: 'CLOSED',
        error: error.message
      }
      console.error('Real-time connection error:', error)
    })
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      // Update last activity for active subscriptions
      const now = new Date()
      this.subscriptions.forEach(sub => {
        if (sub.isActive) {
          sub.lastActivity = now
        }
      })
    }, 30000) // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return

    const delay = Math.min(1000 * Math.pow(2, this.connectionStatus.reconnectAttempts), 30000)

    this.reconnectTimer = setTimeout(() => {
      this.connectionStatus.reconnectAttempts++
      this.reconnect()
      this.reconnectTimer = undefined
    }, delay)
  }

  private async reconnect() {
    if (!this.client || this.connectionStatus.status === 'OPEN') return

    try {
      this.connectionStatus.status = 'CONNECTING'

      // Reestablish all active subscriptions
      const activeSubscriptions = Array.from(this.subscriptions.values())
        .filter(sub => sub.isActive)

      for (const subscription of activeSubscriptions) {
        await this.reestablishSubscription(subscription)
      }

      console.log(`Reconnected with ${activeSubscriptions.length} subscriptions`)
    } catch (error) {
      console.error('Reconnection failed:', error)
      this.scheduleReconnect()
    }
  }

  private async reestablishSubscription(subscription: RealtimeSubscription) {
    try {
      // Remove old channel
      if (subscription.channel) {
        await this.client?.removeChannel(subscription.channel)
      }

      // Create new subscription
      const newChannel = this.createChannelSubscription(
        subscription.table,
        subscription.filter,
        subscription.callback
      )

      subscription.channel = newChannel
      await newChannel.subscribe()
    } catch (error) {
      console.error(`Failed to reestablish subscription for ${subscription.table}:`, error)
      subscription.isActive = false
    }
  }

  private createChannelSubscription(
    table: string,
    filter?: string,
    callback?: (payload: any) => void
  ): RealtimeChannel {
    if (!this.client) {
      throw new Error('Supabase client not initialized')
    }

    const channelName = `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const channel = this.client.channel(channelName)

    const eventConfig: any = {
      event: '*',
      schema: 'public',
      table
    }

    if (filter) {
      eventConfig.filter = filter
    }

    channel.on('postgres_changes', eventConfig, (payload) => {
      if (callback) {
        try {
          callback(payload)
        } catch (error) {
          console.error(`Error in subscription callback for ${table}:`, error)
        }
      }
    })

    return channel
  }

  /**
   * Subscribe to LinkedIn profile updates
   */
  async subscribeToLinkedInProfiles(
    userId: string,
    callback: (event: RealtimeEvent<LinkedInComprehensiveProfile>) => void,
    options: SubscriptionOptions = {}
  ): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Real-time subscriptions not available')
    }

    const subscriptionId = `linkedin_profiles_${userId}_${Date.now()}`
    const filter = `user_id=eq.${userId}`

    const channel = this.createChannelSubscription('linkedin_profiles', filter, callback)

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      table: 'linkedin_profiles',
      filter,
      callback,
      isActive: true,
      createdAt: new Date()
    }

    this.subscriptions.set(subscriptionId, subscription)

    try {
      await channel.subscribe()
      console.log(`Subscribed to LinkedIn profiles for user ${userId}`)
      return subscriptionId
    } catch (error) {
      this.subscriptions.delete(subscriptionId)
      throw error
    }
  }

  /**
   * Subscribe to aspiration updates
   */
  async subscribeToAspirations(
    userId: string,
    callback: (event: RealtimeEvent) => void,
    options: SubscriptionOptions = {}
  ): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Real-time subscriptions not available')
    }

    const subscriptionId = `aspirations_${userId}_${Date.now()}`
    const filter = `user_id=eq.${userId}`

    const channel = this.createChannelSubscription('aspirations', filter, callback)

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      table: 'aspirations',
      filter,
      callback,
      isActive: true,
      createdAt: new Date()
    }

    this.subscriptions.set(subscriptionId, subscription)

    try {
      await channel.subscribe()
      console.log(`Subscribed to aspirations for user ${userId}`)
      return subscriptionId
    } catch (error) {
      this.subscriptions.delete(subscriptionId)
      throw error
    }
  }

  /**
   * Subscribe to social media posts
   */
  async subscribeToSocialMediaPosts(
    userId: string,
    platform?: string,
    callback?: (event: RealtimeEvent) => void,
    options: SubscriptionOptions = {}
  ): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Real-time subscriptions not available')
    }

    const subscriptionId = `social_posts_${userId}_${platform || 'all'}_${Date.now()}`
    let filter = `user_id=eq.${userId}`

    if (platform) {
      filter += ` AND platform=eq.${platform}`
    }

    const channel = this.createChannelSubscription('social_posts', filter, callback)

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      table: 'social_posts',
      filter,
      callback: callback || (() => {}),
      isActive: true,
      createdAt: new Date()
    }

    this.subscriptions.set(subscriptionId, subscription)

    try {
      await channel.subscribe()
      console.log(`Subscribed to social media posts for user ${userId}${platform ? ` on ${platform}` : ''}`)
      return subscriptionId
    } catch (error) {
      this.subscriptions.delete(subscriptionId)
      throw error
    }
  }

  /**
   * Subscribe to tribe updates
   */
  async subscribeToTribes(
    userId: string,
    callback: (event: RealtimeEvent) => void,
    options: SubscriptionOptions = {}
  ): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Real-time subscriptions not available')
    }

    const subscriptionId = `tribes_${userId}_${Date.now()}`

    // Subscribe to tribes where user is founder or member
    const channel = this.client.channel(`tribes_${userId}`)

    // Subscribe to tribes where user is founder
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tribes',
        filter: `founder_id=eq.${userId}`
      },
      callback
    )

    // Subscribe to tribe membership changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tribe_members',
        filter: `user_id=eq.${userId}`
      },
      callback
    )

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      table: 'tribes',
      filter: `founder_id=eq.${userId}`,
      callback,
      isActive: true,
      createdAt: new Date()
    }

    this.subscriptions.set(subscriptionId, subscription)

    try {
      await channel.subscribe()
      console.log(`Subscribed to tribes for user ${userId}`)
      return subscriptionId
    } catch (error) {
      this.subscriptions.delete(subscriptionId)
      throw error
    }
  }

  /**
   * Subscribe to knowledge base updates
   */
  async subscribeToKnowledgeBases(
    userId: string,
    callback: (event: RealtimeEvent) => void,
    options: SubscriptionOptions = {}
  ): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Real-time subscriptions not available')
    }

    const subscriptionId = `knowledge_bases_${userId}_${Date.now()}`
    const filter = `user_id=eq.${userId}`

    const channel = this.createChannelSubscription('knowledge_bases', filter, callback)

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      table: 'knowledge_bases',
      filter,
      callback,
      isActive: true,
      createdAt: new Date()
    }

    this.subscriptions.set(subscriptionId, subscription)

    try {
      await channel.subscribe()
      console.log(`Subscribed to knowledge bases for user ${userId}`)
      return subscriptionId
    } catch (error) {
      this.subscriptions.delete(subscriptionId)
      throw error
    }
  }

  /**
   * Subscribe to analytics events
   */
  async subscribeToAnalyticsEvents(
    userId: string,
    callback: (event: RealtimeEvent) => void,
    options: SubscriptionOptions = {}
  ): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Real-time subscriptions not available')
    }

    const subscriptionId = `analytics_events_${userId}_${Date.now()}`
    const filter = `user_id=eq.${userId}`

    const channel = this.createChannelSubscription('analytics_events', filter, callback)

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      table: 'analytics_events',
      filter,
      callback,
      isActive: true,
      createdAt: new Date()
    }

    this.subscriptions.set(subscriptionId, subscription)

    try {
      await channel.subscribe()
      console.log(`Subscribed to analytics events for user ${userId}`)
      return subscriptionId
    } catch (error) {
      this.subscriptions.delete(subscriptionId)
      throw error
    }
  }

  /**
   * Subscribe to any table with custom configuration
   */
  async subscribeToTable(
    table: string,
    callback: (event: RealtimeEvent) => void,
    options: SubscriptionOptions = {}
  ): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Real-time subscriptions not available')
    }

    const subscriptionId = `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const channel = this.createChannelSubscription(table, options.filter, callback)

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      table,
      filter: options.filter,
      callback,
      isActive: true,
      createdAt: new Date()
    }

    this.subscriptions.set(subscriptionId, subscription)

    try {
      await channel.subscribe()
      console.log(`Subscribed to table ${table}`)
      return subscriptionId
    } catch (error) {
      this.subscriptions.delete(subscriptionId)
      throw error
    }
  }

  /**
   * Unsubscribe from a specific subscription
   */
  async unsubscribe(subscriptionId: string): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) {
      console.warn(`Subscription ${subscriptionId} not found`)
      return false
    }

    try {
      subscription.isActive = false

      if (this.client && subscription.channel) {
        await this.client.removeChannel(subscription.channel)
      }

      this.subscriptions.delete(subscriptionId)
      console.log(`Unsubscribed from ${subscription.table}`)
      return true
    } catch (error) {
      console.error(`Error unsubscribing from ${subscriptionId}:`, error)
      return false
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  async unsubscribeAll(): Promise<void> {
    const subscriptionIds = Array.from(this.subscriptions.keys())

    for (const id of subscriptionIds) {
      await this.unsubscribe(id)
    }

    console.log(`Unsubscribed from ${subscriptionIds.length} subscriptions`)
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): RealtimeSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.isActive)
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): RealtimeSubscription | undefined {
    return this.subscriptions.get(subscriptionId)
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): RealtimeConnectionStatus {
    return { ...this.connectionStatus }
  }

  /**
   * Manually reconnect
   */
  async forceReconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }

    this.connectionStatus.reconnectAttempts = 0
    await this.reconnect()
  }

  /**
   * Get subscription statistics
   */
  getStatistics(): {
    totalSubscriptions: number
    activeSubscriptions: number
    inactiveSubscriptions: number
    subscriptionsByTable: Record<string, number>
    connectionStatus: RealtimeConnectionStatus
    uptime?: number
  } {
    const subscriptions = Array.from(this.subscriptions.values())
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive)
    const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive)

    const subscriptionsByTable: Record<string, number> = {}
    subscriptions.forEach(sub => {
      subscriptionsByTable[sub.table] = (subscriptionsByTable[sub.table] || 0) + 1
    })

    const uptime = this.connectionStatus.lastConnected
      ? Date.now() - this.connectionStatus.lastConnected.getTime()
      : undefined

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      inactiveSubscriptions: inactiveSubscriptions.length,
      subscriptionsByTable,
      connectionStatus: this.getConnectionStatus(),
      uptime
    }
  }

  /**
   * Health check for subscriptions
   */
  async healthCheck(): Promise<{
    healthy: boolean
    issues: string[]
    statistics: ReturnType<typeof this.getStatistics>
  }> {
    const issues: string[] = []
    const stats = this.getStatistics()

    // Check connection status
    if (this.connectionStatus.status !== 'OPEN') {
      issues.push(`Connection status: ${this.connectionStatus.status}`)
    }

    // Check for failed reconnections
    if (this.connectionStatus.reconnectAttempts > 5) {
      issues.push(`High reconnection attempts: ${this.connectionStatus.reconnectAttempts}`)
    }

    // Check for inactive subscriptions
    if (stats.inactiveSubscriptions > 0) {
      issues.push(`${stats.inactiveSubscriptions} inactive subscriptions`)
    }

    // Check initialization
    if (!this.isInitialized) {
      issues.push('Real-time system not initialized')
    }

    return {
      healthy: issues.length === 0,
      issues,
      statistics: stats
    }
  }

  /**
   * Cleanup and destroy
   */
  async destroy(): Promise<void> {
    // Stop timers
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    // Unsubscribe from all
    await this.unsubscribeAll()

    // Disconnect client
    if (this.client) {
      this.client.realtime.disconnect()
    }

    this.isInitialized = false
    console.log('Real-time subscription manager destroyed')
  }
}

/**
 * Utility functions for real-time subscriptions
 */
export class RealtimeUtils {
  /**
   * Create a debounced callback to prevent rapid fire events
   */
  static debounce<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => callback(...args), delay)
    }
  }

  /**
   * Create a throttled callback to limit event frequency
   */
  static throttle<T extends (...args: any[]) => void>(
    callback: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        callback(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  /**
   * Create a batch processor for multiple events
   */
  static createBatchProcessor<T>(
    callback: (events: T[]) => void,
    batchSize: number = 10,
    maxWait: number = 1000
  ): (event: T) => void {
    let batch: T[] = []
    let timeout: NodeJS.Timeout

    const processBatch = () => {
      if (batch.length > 0) {
        callback([...batch])
        batch = []
      }
      if (timeout) {
        clearTimeout(timeout)
      }
    }

    return (event: T) => {
      batch.push(event)

      if (batch.length >= batchSize) {
        processBatch()
      } else if (!timeout) {
        timeout = setTimeout(processBatch, maxWait)
      }
    }
  }

  /**
   * Filter events by specific criteria
   */
  static createEventFilter<T>(
    predicate: (event: RealtimeEvent<T>) => boolean
  ): (event: RealtimeEvent<T>, callback: (event: RealtimeEvent<T>) => void) => void {
    return (event: RealtimeEvent<T>, callback: (event: RealtimeEvent<T>) => void) => {
      if (predicate(event)) {
        callback(event)
      }
    }
  }

  /**
   * Transform events before processing
   */
  static createEventTransformer<T, U>(
    transformer: (event: RealtimeEvent<T>) => RealtimeEvent<U>
  ): (event: RealtimeEvent<T>, callback: (event: RealtimeEvent<U>) => void) => void {
    return (event: RealtimeEvent<T>, callback: (event: RealtimeEvent<U>) => void) => {
      try {
        const transformedEvent = transformer(event)
        callback(transformedEvent)
      } catch (error) {
        console.error('Error transforming event:', error)
      }
    }
  }
}

// Singleton instance
export const realtimeManager = new RealtimeSubscriptionManager()

// Export types and utilities
export type { RealtimeEvent, RealtimeConnectionStatus, SubscriptionOptions }