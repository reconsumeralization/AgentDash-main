/**
 * Enhanced Database Optimization and Connection Management
 * Advanced database utilities for performance, caching, and connection pooling
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { performanceMonitor, cache } from './performance-monitor'
import { ErrorHandler, ErrorCategory, ErrorSeverity } from './error-handling'

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

export interface DatabaseConfig {
  url: string
  anonKey: string
  serviceKey?: string
  options: {
    auth: {
      autoRefreshToken: boolean
      persistSession: boolean
      detectSessionInUrl: boolean
    }
    realtime: {
      params: {
        eventsPerSecond?: number
      }
    }
    global: {
      headers: Record<string, string>
    }
  }
  connectionPool: {
    maxConnections: number
    minConnections: number
    idleTimeout: number
    acquireTimeout: number
  }
  caching: {
    enabled: boolean
    defaultTTL: number
    strategies: CacheStrategy[]
  }
  queryOptimization: {
    enableQueryAnalysis: boolean
    enableSlowQueryLogging: boolean
    slowQueryThreshold: number
  }
}

export interface CacheStrategy {
  name: string
  ttl: number
  conditions: (query: string, params: any) => boolean
}

export const defaultDatabaseConfig: DatabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'defconect-optimized'
      }
    }
  },
  connectionPool: {
    maxConnections: 20,
    minConnections: 5,
    idleTimeout: 30000,
    acquireTimeout: 10000
  },
  caching: {
    enabled: true,
    defaultTTL: 300, // 5 minutes
    strategies: [
      {
        name: 'user_data',
        ttl: 600, // 10 minutes
        conditions: (query: string) => query.includes('users') && query.includes('SELECT')
      },
      {
        name: 'tribes_data',
        ttl: 300, // 5 minutes
        conditions: (query: string) => query.includes('tribes') && query.includes('SELECT')
      },
      {
        name: 'analytics_data',
        ttl: 1800, // 30 minutes
        conditions: (query: string) => query.includes('analytics') || query.includes('metrics')
      }
    ]
  },
  queryOptimization: {
    enableQueryAnalysis: true,
    enableSlowQueryLogging: true,
    slowQueryThreshold: 1000 // 1 second
  }
}

// ============================================================================
// CONNECTION POOL MANAGEMENT
// ============================================================================

class ConnectionPool {
  private connections: SupabaseClient[] = []
  private available: SupabaseClient[] = []
  private inUse: Set<SupabaseClient> = new Set()
  private config: DatabaseConfig
  private metrics = {
    totalConnections: 0,
    activeConnections: 0,
    maxConcurrentConnections: 0,
    connectionFailures: 0,
    slowQueries: 0,
    cacheHits: 0,
    cacheMisses: 0
  }

  constructor(config: DatabaseConfig) {
    this.config = config
    this.initializePool()
  }

  private initializePool() {
    // Initialize minimum connections
    for (let i = 0; i < this.config.connectionPool.minConnections; i++) {
      this.createConnection()
    }
  }

  private createConnection(): SupabaseClient {
    const client = createClient(this.config.url, this.config.anonKey, this.config.options)
    this.connections.push(client)
    this.available.push(client)
    this.metrics.totalConnections++
    return client
  }

  async getConnection(): Promise<SupabaseClient> {
    // Try to get an available connection
    let client = this.available.pop()
    
    if (!client) {
      // Create new connection if under limit
      if (this.connections.length < this.config.connectionPool.maxConnections) {
        client = this.createConnection()
      } else {
        // Wait for connection to become available
        client = await this.waitForConnection()
      }
    }

    this.inUse.add(client)
    this.metrics.activeConnections++
    this.metrics.maxConcurrentConnections = Math.max(
      this.metrics.maxConcurrentConnections,
      this.metrics.activeConnections
    )

    return client
  }

  releaseConnection(client: SupabaseClient): void {
    if (this.inUse.has(client)) {
      this.inUse.delete(client)
      this.available.push(client)
      this.metrics.activeConnections--
    }
  }

  private async waitForConnection(): Promise<SupabaseClient> {
    const startTime = Date.now()
    
    while (this.available.length === 0) {
      if (Date.now() - startTime > this.config.connectionPool.acquireTimeout) {
        throw new Error('Connection pool timeout: Unable to acquire connection')
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return this.available.pop()!
  }

  getMetrics() {
    return { ...this.metrics }
  }

  async closeAll(): Promise<void> {
    this.connections = []
    this.available = []
    this.inUse.clear()
  }
}

// ============================================================================
// OPTIMIZED DATABASE CLIENT
// ============================================================================

export class OptimizedDatabaseClient {
  private pool: ConnectionPool
  private config: DatabaseConfig
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  constructor(config: DatabaseConfig = defaultDatabaseConfig) {
    this.config = config
    this.pool = new ConnectionPool(config)
  }

  async query<T>(
    operation: (client: SupabaseClient) => Promise<T>,
    options: {
      cacheKey?: string
      ttl?: number
      skipCache?: boolean
      enableMetrics?: boolean
    } = {}
  ): Promise<T> {
    const startTime = Date.now()
    const { cacheKey, ttl = this.config.caching.defaultTTL, skipCache = false, enableMetrics = true } = options

    // Check cache first
    if (!skipCache && cacheKey && this.config.caching.enabled) {
      const cached = this.queryCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
        this.pool.getMetrics().cacheHits++
        if (enableMetrics) {
          // performanceMonitor.recordCacheHit(cacheKey)
        }
        return cached.data
      }
    }

    const client = await this.pool.getConnection()
    
    try {
      const result = await operation(client)
      
      // Cache the result
      if (!skipCache && cacheKey && this.config.caching.enabled) {
        this.queryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl
        })
      }

      // Record metrics
      if (enableMetrics) {
        const duration = Date.now() - startTime
        // performanceMonitor.recordDatabaseQuery(duration, cacheKey)
        
        if (duration > this.config.queryOptimization.slowQueryThreshold) {
          this.pool.getMetrics().slowQueries++
          if (this.config.queryOptimization.enableSlowQueryLogging) {
            console.warn(`Slow query detected: ${duration}ms`, { cacheKey })
          }
        }
      }

      return result
    } catch (error) {
      this.pool.getMetrics().connectionFailures++
      
      if (enableMetrics) {
        const errorHandler = ErrorHandler.getInstance()
        await errorHandler.logError(error as Error, {
          category: ErrorCategory.DATABASE,
          severity: ErrorSeverity.HIGH,
          context: { cacheKey, operation: 'database_query' }
        })
      }
      
      throw error
    } finally {
      this.pool.releaseConnection(client)
    }
  }

  // Optimized query methods
  async select<T>(
    table: string,
    options: {
      columns?: string
      filters?: Record<string, any>
      order?: { column: string; ascending?: boolean }
      limit?: number
      offset?: number
      cacheKey?: string
      ttl?: number
    } = {}
  ): Promise<T[]> {
    const { 
      columns = '*', 
      filters = {}, 
      order, 
      limit, 
      offset, 
      cacheKey, 
      ttl 
    } = options

    return this.query(async (client) => {
      let query = client.from(table).select(columns)

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else {
          query = query.eq(key, value)
        }
      })

      // Apply ordering
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true })
      }

      // Apply pagination
      if (limit) {
        const start = offset || 0
        query = query.range(start, start + limit - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as T[]
    }, { cacheKey, ttl })
  }

  async insert<T>(
    table: string,
    data: T | T[],
    options: {
      cacheKey?: string
      invalidateCache?: string[]
    } = {}
  ): Promise<T[]> {
    const { cacheKey, invalidateCache = [] } = options

    return this.query(async (client) => {
      const { data: result, error } = await client
        .from(table)
        .insert(data)
        .select()

      if (error) throw error

      // Invalidate related cache entries
      if (invalidateCache.length > 0) {
        invalidateCache.forEach(key => this.queryCache.delete(key))
      }

      return result || []
    }, { cacheKey, skipCache: true })
  }

  async update<T>(
    table: string,
    data: Partial<T>,
    filters: Record<string, any>,
    options: {
      cacheKey?: string
      invalidateCache?: string[]
    } = {}
  ): Promise<T[]> {
    const { cacheKey, invalidateCache = [] } = options

    return this.query(async (client) => {
      let query = client.from(table).update(data)

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      const { data: result, error } = await query.select()

      if (error) throw error

      // Invalidate related cache entries
      if (invalidateCache.length > 0) {
        invalidateCache.forEach(key => this.queryCache.delete(key))
      }

      return result || []
    }, { cacheKey, skipCache: true })
  }

  async delete(
    table: string,
    filters: Record<string, any>,
    options: {
      cacheKey?: string
      invalidateCache?: string[]
    } = {}
  ): Promise<void> {
    const { cacheKey, invalidateCache = [] } = options

    return this.query(async (client) => {
      let query = client.from(table).delete()

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      const { error } = await query

      if (error) throw error

      // Invalidate related cache entries
      if (invalidateCache.length > 0) {
        invalidateCache.forEach(key => this.queryCache.delete(key))
      }
    }, { cacheKey, skipCache: true })
  }

  // Batch operations
  async batchInsert<T>(
    table: string,
    data: T[],
    batchSize: number = 100,
    options: {
      cacheKey?: string
      invalidateCache?: string[]
    } = {}
  ): Promise<T[]> {
    const { cacheKey, invalidateCache = [] } = options
    const results: T[] = []
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      const batchResults = await this.insert(table, batch, { cacheKey, invalidateCache })
      results.push(...batchResults)
    }
    
    return results
  }

  // Cache management
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key)
        }
      }
    } else {
      this.queryCache.clear()
    }
  }

  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys()),
      poolMetrics: this.pool.getMetrics()
    }
  }

  // Connection management
  async close(): Promise<void> {
    await this.pool.closeAll()
    this.queryCache.clear()
  }
}

// ============================================================================
// DATABASE UTILITIES AND HELPERS
// ============================================================================

export class DatabaseUtilities {
  constructor(private client: OptimizedDatabaseClient) {}

  // Batch operations
  async batchInsert<T>(
    table: string,
    data: T[],
    batchSize: number = 100
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      const batchResults = await this.client.insert(table, batch)
      results.push(...batchResults)
    }
    
    return results
  }

  // Transaction-like operations
  async executeTransaction<T>(
    operations: Array<() => Promise<any>>
  ): Promise<T[]> {
    const results: T[] = []
    
    try {
      for (const operation of operations) {
        const result = await operation()
        results.push(result)
      }
      return results
    } catch (error) {
      // In a real transaction, you'd rollback here
      throw error
    }
  }

  // Data validation and sanitization
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '')
    }
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item))
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value)
      }
      return sanitized
    }
    return input
  }

  // Query optimization helpers
  buildCacheKey(table: string, operation: string, params: any): string {
    const paramString = JSON.stringify(params)
    return `${table}:${operation}:${Buffer.from(paramString).toString('base64')}`
  }

  // Performance monitoring
  async analyzeQueryPerformance(query: string, params: any): Promise<{
    estimatedCost: number
    complexity: 'low' | 'medium' | 'high'
    recommendations: string[]
  }> {
    // Simple query analysis (in production, use actual query planner)
    const complexity = this.estimateQueryComplexity(query, params)
    
    return {
      estimatedCost: complexity.score,
      complexity: complexity.level,
      recommendations: complexity.recommendations
    }
  }

  private estimateQueryComplexity(query: string, params: any): {
    score: number
    level: 'low' | 'medium' | 'high'
    recommendations: string[]
  } {
    let score = 0
    const recommendations: string[] = []

    // Check for expensive operations
    if (query.includes('JOIN')) score += 3
    if (query.includes('ORDER BY')) score += 1
    if (query.includes('GROUP BY')) score += 2
    if (query.includes('DISTINCT')) score += 2
    
    // Check for potential full table scans
    if (!query.includes('WHERE') && !query.includes('LIMIT')) {
      score += 5
      recommendations.push('Consider adding WHERE clause or LIMIT to avoid full table scan')
    }

    // Check for missing indexes (simplified)
    if (query.includes('WHERE') && !query.includes('id') && !query.includes('uuid')) {
      score += 2
      recommendations.push('Consider adding indexes for WHERE clause columns')
    }

    const level = score < 3 ? 'low' : score < 6 ? 'medium' : 'high'
    
    return { score, level, recommendations }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let databaseClient: OptimizedDatabaseClient | null = null

export function getDatabaseClient(config?: DatabaseConfig): OptimizedDatabaseClient {
  if (!databaseClient) {
    databaseClient = new OptimizedDatabaseClient(config)
  }
  return databaseClient
}

export function getDatabaseUtilities(config?: DatabaseConfig): DatabaseUtilities {
  const client = getDatabaseClient(config)
  return new DatabaseUtilities(client)
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ConnectionPool }
