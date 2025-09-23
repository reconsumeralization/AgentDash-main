/**
 * Performance Monitoring and Optimization System
 * Provides real-time performance monitoring, caching, and optimization for AgentDash
 */

import { errorHandler, ErrorCategory, ErrorSeverity } from './error-handling'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  lastAccess: number
}

interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: number
  memoryUsage: number
  success: boolean
  userId?: string
  metadata?: Record<string, any>
}

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalEntries: number
  memoryUsage: number
  oldestEntry: number
  newestEntry: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private cache = new Map<string, CacheEntry<any>>()
  private metrics: PerformanceMetric[] = []
  private readonly maxCacheSize = 1000
  private readonly maxMetricsSize = 10000
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes
  private cleanupInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.startCleanupProcess()
    this.setupMemoryMonitoring()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Cache management with TTL and LRU eviction
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    try {
      // Remove expired entries if cache is full
      if (this.cache.size >= this.maxCacheSize) {
        this.evictExpiredEntries()

        // If still full, evict LRU entries
        if (this.cache.size >= this.maxCacheSize) {
          this.evictLRUEntries(Math.floor(this.maxCacheSize * 0.1))
        }
      }

      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        lastAccess: Date.now()
      })
    } catch (error) {
      errorHandler.logError(error as Error, {
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.LOW,
        context: { operation: 'cache_set', key }
      })
    }
  }

  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key)

      if (!entry) {
        return null
      }

      const now = Date.now()

      // Check if entry has expired
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        return null
      }

      // Update access statistics
      entry.hits++
      entry.lastAccess = now

      return entry.data as T
    } catch (error) {
      errorHandler.logError(error as Error, {
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.LOW,
        context: { operation: 'cache_get', key }
      })
      return null
    }
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Memoization decorator for expensive functions
   */
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      ttl?: number
      keyGenerator?: (...args: Parameters<T>) => string
      skipCache?: (...args: Parameters<T>) => boolean
    } = {}
  ): T {
    const {
      ttl = this.defaultTTL,
      keyGenerator = (...args) => JSON.stringify(args),
      skipCache = () => false
    } = options

    return ((...args: Parameters<T>) => {
      if (skipCache(...args)) {
        return fn(...args)
      }

      const key = `memoize:${fn.name}:${keyGenerator(...args)}`
      const cached = this.get<ReturnType<T>>(key)

      if (cached !== null) {
        return cached
      }

      const result = fn(...args)

      // Cache promises differently
      if (result instanceof Promise) {
        return result.then((resolvedValue) => {
          this.set(key, resolvedValue, ttl)
          return resolvedValue
        }).catch((error) => {
          // Don't cache errors
          throw error
        })
      } else {
        this.set(key, result, ttl)
        return result
      }
    }) as T
  }

  /**
   * Performance timing decorator
   */
  timeFunction<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      name?: string
      logSlowOperations?: boolean
      slowThreshold?: number
      includeArgs?: boolean
    } = {}
  ): T {
    const {
      name = fn.name,
      logSlowOperations = true,
      slowThreshold = 1000, // 1 second
      includeArgs = false
    } = options

    return ((...args: Parameters<T>) => {
      const startTime = performance.now()
      const startMemory = process.memoryUsage().heapUsed

      const recordMetric = (success: boolean, error?: Error) => {
        const duration = performance.now() - startTime
        const memoryUsage = process.memoryUsage().heapUsed - startMemory

        const metric: PerformanceMetric = {
          operation: name,
          duration,
          timestamp: Date.now(),
          memoryUsage,
          success,
          metadata: includeArgs ? { args: args.slice(0, 3) } : undefined
        }

        this.addMetric(metric)

        if (logSlowOperations && duration > slowThreshold) {
          errorHandler.log('warn', `Slow operation detected: ${name}`, {
            category: 'performance',
            data: {
              duration: Math.round(duration),
              memoryUsage,
              threshold: slowThreshold,
              error: error?.message
            }
          })
        }
      }

      try {
        const result = fn(...args)

        if (result instanceof Promise) {
          return result
            .then((value) => {
              recordMetric(true)
              return value
            })
            .catch((error) => {
              recordMetric(false, error)
              throw error
            })
        } else {
          recordMetric(true)
          return result
        }
      } catch (error) {
        recordMetric(false, error as Error)
        throw error
      }
    }) as T
  }

  /**
   * Batch processing with performance monitoring
   */
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options: {
      batchSize?: number
      concurrency?: number
      onProgress?: (processed: number, total: number) => void
      onError?: (error: Error, item: T, index: number) => void
    } = {}
  ): Promise<R[]> {
    const {
      batchSize = 10,
      concurrency = 3,
      onProgress,
      onError
    } = options

    const perfLogger = errorHandler.createPerformanceLogger('batch_processing', {
      totalItems: items.length,
      batchSize,
      concurrency
    })

    const results: R[] = []
    const errors: Array<{ error: Error; item: T; index: number }> = []

    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)

        const batchPromises = batch.map(async (item, batchIndex) => {
          const globalIndex = i + batchIndex
          try {
            const result = await processor(item)
            results[globalIndex] = result
            onProgress?.(results.filter(r => r !== undefined).length, items.length)
            return result
          } catch (error) {
            const err = error as Error
            errors.push({ error: err, item, index: globalIndex })
            onError?.(err, item, globalIndex)
            return null
          }
        })

        // Process batch with concurrency limit
        const chunks = []
        for (let j = 0; j < batchPromises.length; j += concurrency) {
          chunks.push(batchPromises.slice(j, j + concurrency))
        }

        for (const chunk of chunks) {
          await Promise.all(chunk)
        }
      }

      await perfLogger.finish({
        processed: results.filter(r => r !== undefined).length,
        errors: errors.length,
        successRate: (results.filter(r => r !== undefined).length / items.length) * 100
      })

      return results.filter(r => r !== null) as R[]
    } catch (error) {
      await perfLogger.error(error as Error, {
        processed: results.filter(r => r !== undefined).length,
        totalErrors: errors.length
      })
      throw error
    }
  }

  /**
   * Database query optimization
   */
  optimizeQuery<T>(
    queryFn: () => Promise<T>,
    options: {
      cacheKey?: string
      cacheTTL?: number
      timeout?: number
      retries?: number
    } = {}
  ): Promise<T> {
    const {
      cacheKey,
      cacheTTL = this.defaultTTL,
      timeout = 30000, // 30 seconds
      retries = 2
    } = options

    return this.withRetry(
      () => this.withTimeout(
        async () => {
          if (cacheKey) {
            const cached = this.get<T>(cacheKey)
            if (cached !== null) {
              return cached
            }
          }

          const result = await queryFn()

          if (cacheKey) {
            this.set(cacheKey, result, cacheTTL)
          }

          return result
        },
        timeout
      ),
      retries
    )
  }

  /**
   * Add timeout to operations
   */
  private async withTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ])
  }

  /**
   * Retry mechanism for failed operations
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (attempt === maxRetries) {
          break
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    throw lastError!
  }

  /**
   * Memory usage monitoring
   */
  getMemoryUsage(): {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
    cacheSize: number
    metricsSize: number
  } {
    const memUsage = process.memoryUsage()
    return {
      ...memUsage,
      cacheSize: this.cache.size,
      metricsSize: this.metrics.length
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    let totalHits = 0
    let totalMisses = 0
    let oldestTimestamp = Date.now()
    let newestTimestamp = 0

    for (const entry of this.cache.values()) {
      totalHits += entry.hits
      if (entry.timestamp < oldestTimestamp) oldestTimestamp = entry.timestamp
      if (entry.timestamp > newestTimestamp) newestTimestamp = entry.timestamp
    }

    return {
      hits: totalHits,
      misses: totalMisses,
      hitRate: totalHits / (totalHits + totalMisses) || 0,
      totalEntries: this.cache.size,
      memoryUsage: this.estimateCacheSize(),
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(timeframe: number = 60 * 60 * 1000): {
    totalOperations: number
    averageDuration: number
    slowestOperations: PerformanceMetric[]
    operationStats: Record<string, {
      count: number
      averageDuration: number
      successRate: number
    }>
  } {
    const cutoff = Date.now() - timeframe
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)

    const operationStats: Record<string, {
      count: number
      totalDuration: number
      successCount: number
      averageDuration: number
      successRate: number
    }> = {}

    let totalDuration = 0

    for (const metric of recentMetrics) {
      totalDuration += metric.duration

      if (!operationStats[metric.operation]) {
        operationStats[metric.operation] = {
          count: 0,
          totalDuration: 0,
          successCount: 0,
          averageDuration: 0,
          successRate: 0
        }
      }

      const stats = operationStats[metric.operation]
      stats.count++
      stats.totalDuration += metric.duration
      if (metric.success) stats.successCount++
    }

    // Calculate averages and rates
    for (const stats of Object.values(operationStats)) {
      stats.averageDuration = stats.totalDuration / stats.count
      stats.successRate = stats.successCount / stats.count
    }

    return {
      totalOperations: recentMetrics.length,
      averageDuration: totalDuration / recentMetrics.length || 0,
      slowestOperations: recentMetrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
      operationStats: Object.fromEntries(
        Object.entries(operationStats).map(([key, stats]) => [
          key,
          {
            count: stats.count,
            averageDuration: stats.averageDuration,
            successRate: stats.successRate
          }
        ])
      )
    }
  }

  /**
   * Clean up expired cache entries and old metrics
   */
  private cleanup(): void {
    this.evictExpiredEntries()
    this.trimMetrics()
  }

  private evictExpiredEntries(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private evictLRUEntries(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccess - b.lastAccess)
      .slice(0, count)

    for (const [key] of entries) {
      this.cache.delete(key)
    }
  }

  private trimMetrics(): void {
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-Math.floor(this.maxMetricsSize * 0.8))
    }
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    if (this.metrics.length > this.maxMetricsSize) {
      this.trimMetrics()
    }
  }

  private estimateCacheSize(): number {
    // Rough estimation of cache memory usage
    let size = 0
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2 // UTF-16 encoding
      size += JSON.stringify(entry.data).length * 2
      size += 64 // Overhead for entry metadata
    }
    return size
  }

  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // Cleanup every minute

    // Cleanup on exit
    if (typeof process !== 'undefined') {
      process.on('exit', () => {
        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval)
        }
      })
    }
  }

  private setupMemoryMonitoring(): void {
    // Monitor memory usage and warn if high
    setInterval(() => {
      const memUsage = this.getMemoryUsage()
      const totalMB = Math.round(memUsage.heapUsed / 1024 / 1024)

      if (totalMB > 512) { // Warn at 512MB
        errorHandler.log('warn', 'High memory usage detected', {
          category: 'performance',
          data: {
            heapUsedMB: totalMB,
            cacheEntries: memUsage.cacheSize,
            metricsCount: memUsage.metricsSize
          }
        })

        // Aggressive cleanup if memory is very high
        if (totalMB > 1024) { // 1GB
          this.clear()
          this.metrics = []
        }
      }
    }, 30000) // Check every 30 seconds
  }

  /**
   * Create a performance logger for tracking operation performance
   */
  createPerformanceLogger(operation: string, context?: Record<string, any>) {
    return errorHandler.createPerformanceLogger(operation, context)
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Convenience functions
export const cache = {
  get: <T>(key: string) => performanceMonitor.get<T>(key),
  set: <T>(key: string, data: T, ttl?: number) => performanceMonitor.set(key, data, ttl),
  delete: (key: string) => performanceMonitor.delete(key),
  clear: () => performanceMonitor.clear(),
  has: (key: string) => performanceMonitor.has(key)
}

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  options?: Parameters<typeof performanceMonitor.memoize>[1]
) => performanceMonitor.memoize(fn, options)

export const timeFunction = <T extends (...args: any[]) => any>(
  fn: T,
  options?: Parameters<typeof performanceMonitor.timeFunction>[1]
) => performanceMonitor.timeFunction(fn, options)

export const processBatch = <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options?: Parameters<typeof performanceMonitor.processBatch>[2]
) => performanceMonitor.processBatch(items, processor, options)

export const optimizeQuery = <T>(
  queryFn: () => Promise<T>,
  options?: Parameters<typeof performanceMonitor.optimizeQuery>[1]
) => performanceMonitor.optimizeQuery(queryFn, options)