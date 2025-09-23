/**
 * Database Query Optimization System
 * Advanced query optimization, caching, and performance monitoring for AgentDash
 * Includes intelligent query building, result caching, and performance analytics
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { LinkedInComprehensiveProfile } from './linkedin-comprehensive-profile-types'

export interface QueryOptions {
  select?: string[]
  filter?: Record<string, any>
  order?: { column: string; ascending?: boolean }[]
  limit?: number
  offset?: number
  cache?: boolean
  cacheTTL?: number
  joins?: JoinConfig[]
  aggregations?: AggregationConfig[]
}

export interface JoinConfig {
  table: string
  on: string
  type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
  select?: string[]
}

export interface AggregationConfig {
  function: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX'
  column: string
  alias?: string
  groupBy?: string[]
}

export interface QueryPerformance {
  queryId: string
  table: string
  duration: number
  resultCount: number
  cacheHit: boolean
  timestamp: Date
  query: string
  error?: string
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: Date
  ttl: number
  queryHash: string
}

export interface OptimizationSuggestion {
  type: 'index' | 'query_rewrite' | 'cache' | 'pagination'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  estimated_improvement: string
  implementation: string
}

export class DatabaseQueryOptimizer {
  private client: SupabaseClient | null = null
  private queryCache: Map<string, CacheEntry> = new Map()
  private performanceLog: QueryPerformance[] = []
  private isInitialized = false
  private maxCacheSize = 1000
  private defaultCacheTTL = 300000 // 5 minutes

  constructor() {
    this.initialize()
    this.startCacheCleanup()
  }

  private initialize() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not found - query optimization disabled')
      return
    }

    this.client = createClient(supabaseUrl, supabaseAnonKey)
    this.isInitialized = true
  }

  private startCacheCleanup() {
    // Clean expired cache entries every minute
    setInterval(() => {
      this.cleanExpiredCache()
    }, 60000)
  }

  private cleanExpiredCache() {
    const now = Date.now()
    let removedCount = 0

    for (const [key, entry] of this.queryCache.entries()) {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        this.queryCache.delete(key)
        removedCount++
      }
    }

    // Also trim cache if it's too large
    if (this.queryCache.size > this.maxCacheSize) {
      const entries = Array.from(this.queryCache.entries())
      entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime())

      const toRemove = entries.slice(0, entries.length - this.maxCacheSize)
      toRemove.forEach(([key]) => this.queryCache.delete(key))
      removedCount += toRemove.length
    }

    if (removedCount > 0) {
      console.log(`Cleaned ${removedCount} expired cache entries`)
    }
  }

  private generateQueryHash(table: string, options: QueryOptions): string {
    const queryString = JSON.stringify({ table, ...options })
    // Simple hash function
    let hash = 0
    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  private logPerformance(performance: QueryPerformance) {
    this.performanceLog.push(performance)

    // Keep only last 1000 entries
    if (this.performanceLog.length > 1000) {
      this.performanceLog.shift()
    }
  }

  /**
   * Optimized query execution with caching and performance monitoring
   */
  async executeOptimizedQuery<T = any>(
    table: string,
    options: QueryOptions = {}
  ): Promise<{ data: T[]; performance: QueryPerformance }> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Database optimizer not initialized')
    }

    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const queryHash = this.generateQueryHash(table, options)
    const startTime = Date.now()

    // Check cache first
    if (options.cache !== false) {
      const cached = this.queryCache.get(queryHash)
      if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
        const performance: QueryPerformance = {
          queryId,
          table,
          duration: Date.now() - startTime,
          resultCount: Array.isArray(cached.data) ? cached.data.length : 1,
          cacheHit: true,
          timestamp: new Date(),
          query: `CACHED: ${table}`
        }

        this.logPerformance(performance)
        return { data: cached.data, performance }
      }
    }

    try {
      // Build optimized query
      let query = this.client.from(table)

      // Apply select
      if (options.select && options.select.length > 0) {
        query = query.select(options.select.join(', '))
      } else {
        query = query.select('*')
      }

      // Apply filters
      if (options.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          if (Array.isArray(value)) {
            query = query.in(key, value)
          } else if (typeof value === 'object' && value !== null) {
            // Handle complex filters
            if (value.gte !== undefined) query = query.gte(key, value.gte)
            if (value.lte !== undefined) query = query.lte(key, value.lte)
            if (value.gt !== undefined) query = query.gt(key, value.gt)
            if (value.lt !== undefined) query = query.lt(key, value.lt)
            if (value.like !== undefined) query = query.like(key, value.like)
            if (value.ilike !== undefined) query = query.ilike(key, value.ilike)
            if (value.neq !== undefined) query = query.neq(key, value.neq)
          } else {
            query = query.eq(key, value)
          }
        }
      }

      // Apply ordering
      if (options.order && options.order.length > 0) {
        options.order.forEach(orderBy => {
          query = query.order(orderBy.column, { ascending: orderBy.ascending !== false })
        })
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 100)) - 1)
      }

      // Execute query
      const { data, error } = await query

      if (error) throw error

      const duration = Date.now() - startTime
      const performance: QueryPerformance = {
        queryId,
        table,
        duration,
        resultCount: data?.length || 0,
        cacheHit: false,
        timestamp: new Date(),
        query: `SELECT ${options.select?.join(', ') || '*'} FROM ${table}`
      }

      // Cache results if enabled
      if (options.cache !== false && data) {
        const ttl = options.cacheTTL || this.defaultCacheTTL
        this.queryCache.set(queryHash, {
          data,
          timestamp: new Date(),
          ttl,
          queryHash
        })
      }

      this.logPerformance(performance)
      return { data: data || [], performance }

    } catch (error) {
      const duration = Date.now() - startTime
      const performance: QueryPerformance = {
        queryId,
        table,
        duration,
        resultCount: 0,
        cacheHit: false,
        timestamp: new Date(),
        query: `SELECT FROM ${table}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      this.logPerformance(performance)
      throw error
    }
  }

  /**
   * Optimized LinkedIn profile queries
   */
  async getLinkedInProfiles(
    filters: {
      userId?: string
      industry?: string
      location?: string
      completenessMin?: number
      influenceMin?: number
    } = {},
    options: Omit<QueryOptions, 'filter'> = {}
  ): Promise<{ data: LinkedInComprehensiveProfile[]; performance: QueryPerformance }> {
    const queryOptions: QueryOptions = {
      ...options,
      filter: {},
      cache: true,
      cacheTTL: 600000 // 10 minutes for profile data
    }

    // Build filter conditions
    if (filters.userId) {
      queryOptions.filter!.user_id = filters.userId
    }
    if (filters.industry) {
      queryOptions.filter!.industry = { ilike: `%${filters.industry}%` }
    }
    if (filters.location) {
      queryOptions.filter!.location_city = { ilike: `%${filters.location}%` }
    }
    if (filters.completenessMin !== undefined) {
      queryOptions.filter!.profile_completeness = { gte: filters.completenessMin }
    }
    if (filters.influenceMin !== undefined) {
      queryOptions.filter!.influence_score = { gte: filters.influenceMin }
    }

    return this.executeOptimizedQuery<any>('linkedin_profiles', queryOptions)
  }

  /**
   * Optimized aspiration queries with analytics
   */
  async getAspirations(
    userId: string,
    filters: {
      category?: string
      status?: string
      priority?: string
      dateRange?: { start: Date; end: Date }
    } = {},
    options: Omit<QueryOptions, 'filter'> = {}
  ): Promise<{ data: any[]; performance: QueryPerformance }> {
    const queryOptions: QueryOptions = {
      ...options,
      filter: { user_id: userId },
      order: [{ column: 'updated_at', ascending: false }],
      cache: true,
      cacheTTL: 180000 // 3 minutes for aspiration data
    }

    // Apply additional filters
    if (filters.category) {
      queryOptions.filter!.category = filters.category
    }
    if (filters.status) {
      queryOptions.filter!.status = filters.status
    }
    if (filters.priority) {
      queryOptions.filter!.priority = filters.priority
    }
    if (filters.dateRange) {
      queryOptions.filter!.created_at = {
        gte: filters.dateRange.start.toISOString(),
        lte: filters.dateRange.end.toISOString()
      }
    }

    return this.executeOptimizedQuery('aspirations', queryOptions)
  }

  /**
   * Optimized social media analytics
   */
  async getSocialMediaAnalytics(
    userId: string,
    platform?: string,
    timeframe: 'day' | 'week' | 'month' = 'week',
    options: QueryOptions = {}
  ): Promise<{ data: any[]; performance: QueryPerformance }> {
    const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const queryOptions: QueryOptions = {
      ...options,
      filter: {
        user_id: userId,
        timestamp: { gte: since.toISOString() }
      },
      order: [{ column: 'timestamp', ascending: false }],
      cache: true,
      cacheTTL: 300000 // 5 minutes for analytics data
    }

    if (platform) {
      queryOptions.filter!.platform = platform
    }

    return this.executeOptimizedQuery('analytics_events', queryOptions)
  }

  /**
   * Batch query execution for multiple related queries
   */
  async executeBatch<T = any>(
    queries: Array<{ table: string; options: QueryOptions }>
  ): Promise<Array<{ data: T[]; performance: QueryPerformance }>> {
    const results = await Promise.all(
      queries.map(({ table, options }) => this.executeOptimizedQuery<T>(table, options))
    )

    return results
  }

  /**
   * Get query performance analytics
   */
  getPerformanceAnalytics(timeframe: number = 3600000): {
    totalQueries: number
    averageDuration: number
    cacheHitRate: number
    slowestQueries: QueryPerformance[]
    errorRate: number
    performanceByTable: Record<string, {
      queries: number
      averageDuration: number
      errorCount: number
    }>
  } {
    const cutoff = Date.now() - timeframe
    const recentQueries = this.performanceLog.filter(
      q => q.timestamp.getTime() > cutoff
    )

    const totalQueries = recentQueries.length
    const cacheHits = recentQueries.filter(q => q.cacheHit).length
    const errors = recentQueries.filter(q => q.error).length

    const averageDuration = totalQueries > 0
      ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / totalQueries
      : 0

    const slowestQueries = recentQueries
      .filter(q => !q.error)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    const performanceByTable: Record<string, any> = {}
    recentQueries.forEach(q => {
      if (!performanceByTable[q.table]) {
        performanceByTable[q.table] = {
          queries: 0,
          totalDuration: 0,
          errorCount: 0
        }
      }

      performanceByTable[q.table].queries++
      performanceByTable[q.table].totalDuration += q.duration
      if (q.error) performanceByTable[q.table].errorCount++
    })

    // Calculate averages
    Object.keys(performanceByTable).forEach(table => {
      const stats = performanceByTable[table]
      stats.averageDuration = stats.totalDuration / stats.queries
      delete stats.totalDuration
    })

    return {
      totalQueries,
      averageDuration,
      cacheHitRate: totalQueries > 0 ? cacheHits / totalQueries : 0,
      slowestQueries,
      errorRate: totalQueries > 0 ? errors / totalQueries : 0,
      performanceByTable
    }
  }

  /**
   * Get optimization suggestions based on query patterns
   */
  getOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    const analytics = this.getPerformanceAnalytics()

    // Suggest caching for frequently queried tables
    Object.entries(analytics.performanceByTable).forEach(([table, stats]) => {
      if (stats.queries > 10 && stats.averageDuration > 100) {
        suggestions.push({
          type: 'cache',
          priority: 'medium',
          description: `Enable caching for ${table} queries`,
          estimated_improvement: '30-50% faster response time',
          implementation: `Add cache: true to query options for ${table}`
        })
      }

      if (stats.averageDuration > 1000) {
        suggestions.push({
          type: 'index',
          priority: 'high',
          description: `Consider adding indexes to ${table}`,
          estimated_improvement: '60-80% faster query execution',
          implementation: `Analyze query patterns and add indexes on frequently filtered columns`
        })
      }
    })

    // Suggest pagination for large result sets
    const largeResultQueries = this.performanceLog.filter(
      q => q.resultCount > 100 && !q.error
    )
    if (largeResultQueries.length > 5) {
      suggestions.push({
        type: 'pagination',
        priority: 'medium',
        description: 'Implement pagination for large result sets',
        estimated_improvement: '40-60% faster initial load time',
        implementation: 'Add limit and offset parameters to queries returning many rows'
      })
    }

    // Suggest query rewrites for slow queries
    if (analytics.slowestQueries.length > 0) {
      suggestions.push({
        type: 'query_rewrite',
        priority: 'high',
        description: 'Optimize slow queries',
        estimated_improvement: '50-70% performance improvement',
        implementation: 'Review and optimize the slowest performing queries'
      })
    }

    return suggestions
  }

  /**
   * Clear query cache
   */
  clearCache(pattern?: string): number {
    if (!pattern) {
      const size = this.queryCache.size
      this.queryCache.clear()
      return size
    }

    let removed = 0
    for (const [key] of this.queryCache.entries()) {
      if (key.includes(pattern)) {
        this.queryCache.delete(key)
        removed++
      }
    }

    return removed
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    maxSize: number
    hitRate: number
    entries: Array<{ key: string; size: number; age: number }>
  } {
    const entries = Array.from(this.queryCache.entries()).map(([key, entry]) => ({
      key,
      size: JSON.stringify(entry.data).length,
      age: Date.now() - entry.timestamp.getTime()
    }))

    const recentQueries = this.performanceLog.filter(
      q => q.timestamp.getTime() > Date.now() - 3600000 // last hour
    )
    const cacheHits = recentQueries.filter(q => q.cacheHit).length
    const hitRate = recentQueries.length > 0 ? cacheHits / recentQueries.length : 0

    return {
      size: this.queryCache.size,
      maxSize: this.maxCacheSize,
      hitRate,
      entries
    }
  }

  /**
   * Preload frequently accessed data
   */
  async preloadCache(userId: string): Promise<void> {
    const preloadQueries = [
      // User's aspirations
      {
        table: 'aspirations',
        options: {
          filter: { user_id: userId },
          cache: true,
          cacheTTL: 600000
        }
      },
      // User's LinkedIn profile
      {
        table: 'linkedin_profiles',
        options: {
          filter: { user_id: userId },
          cache: true,
          cacheTTL: 1800000 // 30 minutes
        }
      },
      // User's knowledge bases
      {
        table: 'knowledge_bases',
        options: {
          filter: { user_id: userId },
          cache: true,
          cacheTTL: 900000 // 15 minutes
        }
      }
    ]

    try {
      await this.executeBatch(preloadQueries)
      console.log(`Preloaded cache for user ${userId}`)
    } catch (error) {
      console.error('Error preloading cache:', error)
    }
  }

  /**
   * Health check for the optimization system
   */
  healthCheck(): {
    healthy: boolean
    issues: string[]
    stats: {
      cacheStats: ReturnType<typeof this.getCacheStats>
      performanceStats: ReturnType<typeof this.getPerformanceAnalytics>
    }
  } {
    const issues: string[] = []

    if (!this.isInitialized) {
      issues.push('Query optimizer not initialized')
    }

    const performanceStats = this.getPerformanceAnalytics()
    if (performanceStats.errorRate > 0.1) {
      issues.push(`High error rate: ${(performanceStats.errorRate * 100).toFixed(1)}%`)
    }

    if (performanceStats.averageDuration > 2000) {
      issues.push(`Slow average query time: ${performanceStats.averageDuration.toFixed(0)}ms`)
    }

    const cacheStats = this.getCacheStats()
    if (cacheStats.hitRate < 0.3) {
      issues.push(`Low cache hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`)
    }

    return {
      healthy: issues.length === 0,
      issues,
      stats: {
        cacheStats,
        performanceStats
      }
    }
  }
}

// Singleton instance
export const queryOptimizer = new DatabaseQueryOptimizer()

// Export types
export type {
  QueryOptions,
  JoinConfig,
  AggregationConfig,
  QueryPerformance,
  CacheEntry,
  OptimizationSuggestion
}