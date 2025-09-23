/**
 * Advanced API Optimization and Route Enhancement System
 * Comprehensive toolkit for optimizing API performance, implementing advanced patterns,
 * and providing intelligent request/response handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { errorHandler, ErrorCategory, ErrorSeverity, apiResponse } from './error-handling'
import { performanceMonitor, cache, memoize, optimizeQuery } from './performance-monitor'
import { securityMiddleware } from './security-middleware'
import { createOptimizedSupabaseClient } from './supabase-optimization'

// ========== API Configuration ==========

export interface APIConfig {
  rateLimit: {
    enabled: boolean
    windowMs: number
    maxRequests: number
    skipSuccessfulRequests: boolean
  }
  caching: {
    enabled: boolean
    defaultTTL: number
    strategies: CacheStrategy[]
  }
  compression: {
    enabled: boolean
    threshold: number
    algorithms: string[]
  }
  validation: {
    strict: boolean
    stripUnknown: boolean
    allowExtraKeys: boolean
  }
  monitoring: {
    enabled: boolean
    logRequests: boolean
    logResponses: boolean
    trackPerformance: boolean
  }
  optimization: {
    enableBatching: boolean
    enablePagination: boolean
    enableFieldSelection: boolean
    enableETagging: boolean
  }
}

export const defaultAPIConfig: APIConfig = {
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    skipSuccessfulRequests: false
  },
  caching: {
    enabled: true,
    defaultTTL: 5 * 60 * 1000,
    strategies: ['memory', 'etag', 'conditional']
  },
  compression: {
    enabled: true,
    threshold: 1024,
    algorithms: ['gzip', 'deflate', 'br']
  },
  validation: {
    strict: true,
    stripUnknown: true,
    allowExtraKeys: false
  },
  monitoring: {
    enabled: true,
    logRequests: true,
    logResponses: false,
    trackPerformance: true
  },
  optimization: {
    enableBatching: true,
    enablePagination: true,
    enableFieldSelection: true,
    enableETagging: true
  }
}

// ========== Cache Strategies ==========

export type CacheStrategy = 'memory' | 'etag' | 'conditional' | 'distributed'

export interface CacheOptions {
  strategy: CacheStrategy
  ttl?: number
  tags?: string[]
  invalidateOn?: string[]
  varyBy?: string[]
}

export class APICache {
  private memoryCache = new Map<string, CacheEntry>()
  private etagCache = new Map<string, string>()

  /**
   * Get cached response
   */
  async get<T>(key: string, strategy: CacheStrategy): Promise<T | null> {
    switch (strategy) {
      case 'memory':
        return this.getFromMemory<T>(key)
      case 'etag':
        return this.getWithETag<T>(key)
      case 'conditional':
        return this.getConditional<T>(key)
      case 'distributed':
        return this.getDistributed<T>(key)
      default:
        return null
    }
  }

  /**
   * Set cached response
   */
  async set<T>(
    key: string,
    value: T,
    strategy: CacheStrategy,
    options: Partial<CacheOptions> = {}
  ): Promise<void> {
    const { ttl = 5 * 60 * 1000, tags = [] } = options

    switch (strategy) {
      case 'memory':
        this.setInMemory(key, value, ttl, tags)
        break
      case 'etag':
        this.setWithETag(key, value, ttl)
        break
      case 'conditional':
        this.setConditional(key, value, ttl)
        break
      case 'distributed':
        await this.setDistributed(key, value, ttl)
        break
    }
  }

  /**
   * Invalidate cache by key or tags
   */
  async invalidate(keyOrTags: string | string[], byTags = false): Promise<void> {
    if (byTags) {
      const tags = Array.isArray(keyOrTags) ? keyOrTags : [keyOrTags]
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags.some(tag => tags.includes(tag))) {
          this.memoryCache.delete(key)
        }
      }
    } else {
      const key = Array.isArray(keyOrTags) ? keyOrTags[0] : keyOrTags
      this.memoryCache.delete(key)
      this.etagCache.delete(key)
    }
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.data as T
  }

  private setInMemory<T>(key: string, value: T, ttl: number, tags: string[]): void {
    this.memoryCache.set(key, {
      data: value,
      expiresAt: Date.now() + ttl,
      tags,
      createdAt: Date.now()
    })
  }

  private getWithETag<T>(key: string): T | null {
    // ETag implementation would check If-None-Match header
    return this.getFromMemory<T>(key)
  }

  private setWithETag<T>(key: string, value: T, ttl: number): void {
    const etag = this.generateETag(value)
    this.etagCache.set(key, etag)
    this.setInMemory(key, value, ttl, [])
  }

  private getConditional<T>(key: string): T | null {
    // Conditional requests based on Last-Modified, etc.
    return this.getFromMemory<T>(key)
  }

  private setConditional<T>(key: string, value: T, ttl: number): void {
    this.setInMemory(key, value, ttl, [])
  }

  private async getDistributed<T>(key: string): Promise<T | null> {
    // Would integrate with Redis or similar distributed cache
    return cache.get<T>(key)
  }

  private async setDistributed<T>(key: string, value: T, ttl: number): Promise<void> {
    cache.set(key, value, ttl)
  }

  private generateETag<T>(value: T): string {
    const content = JSON.stringify(value)
    return `"${Buffer.from(content).toString('base64').substring(0, 16)}"`
  }
}

// ========== Request/Response Optimization ==========

export class APIOptimizer {
  private config: APIConfig
  private cache: APICache
  private requestQueue = new Map<string, Promise<any>>()

  constructor(config: Partial<APIConfig> = {}) {
    this.config = { ...defaultAPIConfig, ...config }
    this.cache = new APICache()
  }

  /**
   * Optimize API route handler
   */
  optimizeRoute<T>(
    handler: APIRouteHandler<T>,
    options: RouteOptions = {}
  ): OptimizedAPIHandler<T> {
    return async (request: NextRequest, context?: any) => {
      const perfLogger = performanceMonitor.createPerformanceLogger('api_request')
      const requestId = this.generateRequestId()

      try {
        // 1. Security validation
        if (options.requireAuth) {
          const securityResult = await securityMiddleware.middleware(request)
          if (securityResult) {
            return securityResult
          }
        }

        // 2. Request validation
        const validatedInput = await this.validateRequest(request, options.validation)

        // 3. Check cache
        const cacheKey = this.generateCacheKey(request, validatedInput)
        if (options.cache?.enabled !== false) {
          const cached = await this.getCachedResponse<T>(cacheKey, options.cache)
          if (cached) {
            await perfLogger.finish({ cached: true, requestId })
            return this.createResponse(cached, { fromCache: true })
          }
        }

        // 4. Request deduplication
        if (options.deduplicate) {
          const existingRequest = this.requestQueue.get(cacheKey)
          if (existingRequest) {
            const result = await existingRequest
            await perfLogger.finish({ deduplicated: true, requestId })
            return this.createResponse(result)
          }
        }

        // 5. Execute handler with optimization
        const handlerPromise = this.executeHandler(handler, request, validatedInput, context)

        if (options.deduplicate) {
          this.requestQueue.set(cacheKey, handlerPromise)
        }

        const result = await handlerPromise

        // 6. Cache response
        if (options.cache?.enabled !== false && result.success) {
          await this.cacheResponse(cacheKey, result, options.cache)
        }

        // 7. Clean up
        if (options.deduplicate) {
          this.requestQueue.delete(cacheKey)
        }

        await perfLogger.finish({
          success: result.success,
          responseSize: JSON.stringify(result).length,
          requestId
        })

        return this.createResponse(result)

      } catch (error) {
        await perfLogger.error(error as Error, { requestId })

        const errorResult = await apiResponse(
          async () => { throw error },
          {
            endpoint: request.nextUrl.pathname,
            method: request.method,
            userId: context?.userId
          }
        )

        return this.createResponse(errorResult)
      }
    }
  }

  /**
   * Batch multiple API requests
   */
  async batchRequests<T>(
    requests: BatchRequest[],
    options: BatchOptions = {}
  ): Promise<BatchResponse<T>> {
    const { concurrency = 5, failFast = false } = options
    const perfLogger = performanceMonitor.createPerformanceLogger('batch_requests')

    try {
      const results = await performanceMonitor.processBatch(
        requests,
        async (request) => {
          try {
            const response = await this.processSingleBatchRequest(request)
            return { success: true, data: response, requestId: request.id }
          } catch (error) {
            if (failFast) throw error
            return {
              success: false,
              error: (error as Error).message,
              requestId: request.id
            }
          }
        },
        {
          batchSize: 10,
          concurrency,
          onError: (error, request) => {
            errorHandler.logError(error, {
              category: ErrorCategory.API,
              severity: ErrorSeverity.MEDIUM,
              context: { batchRequestId: request.id, operation: 'batchRequests' }
            })
          }
        }
      )

      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      await perfLogger.finish({
        totalRequests: requests.length,
        successful: successful.length,
        failed: failed.length,
        successRate: successful.length / requests.length
      })

      return {
        results,
        summary: {
          total: requests.length,
          successful: successful.length,
          failed: failed.length,
          executionTime: perfLogger.finish().then(r => r.duration)
        }
      }
    } catch (error) {
      await perfLogger.error(error as Error)
      throw error
    }
  }

  /**
   * Implement GraphQL-style field selection
   */
  selectFields<T extends Record<string, any>>(
    data: T | T[],
    fields?: string[]
  ): Partial<T> | Partial<T>[] {
    if (!fields || fields.length === 0) {
      return data
    }

    const selectFromObject = (obj: T): Partial<T> => {
      const result: Partial<T> = {}

      for (const field of fields) {
        if (field.includes('.')) {
          // Handle nested fields like 'user.profile.name'
          const [root, ...nested] = field.split('.')
          if (obj[root] && typeof obj[root] === 'object') {
            if (!result[root]) result[root] = {} as any
            this.setNestedField(result[root] as any, nested.join('.'), obj[root])
          }
        } else if (obj.hasOwnProperty(field)) {
          result[field] = obj[field]
        }
      }

      return result
    }

    return Array.isArray(data)
      ? data.map(selectFromObject)
      : selectFromObject(data)
  }

  /**
   * Implement cursor-based pagination
   */
  async paginateResults<T>(
    query: () => Promise<T[]>,
    options: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    const {
      limit = 20,
      cursor,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options

    try {
      // Add cursor condition and sorting to query
      const results = await optimizeQuery(
        () => query(),
        {
          cacheKey: `paginated:${JSON.stringify(options)}`,
          cacheTTL: 2 * 60 * 1000 // 2 minutes
        }
      )

      const hasMore = results.length > limit
      const items = hasMore ? results.slice(0, limit) : results

      let nextCursor: string | undefined
      if (hasMore && items.length > 0) {
        const lastItem = items[items.length - 1] as any
        nextCursor = this.encodeCursor({
          [sortBy]: lastItem[sortBy],
          id: lastItem.id
        })
      }

      return {
        items,
        pageInfo: {
          hasNextPage: hasMore,
          nextCursor,
          totalCount: results.length
        }
      }
    } catch (error) {
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'paginateResults', options }
      })
      throw error
    }
  }

  /**
   * Add comprehensive request compression
   */
  async compressResponse(data: any, acceptEncoding: string = ''): Promise<{
    compressed: Buffer | string
    encoding: string
    compressionRatio: number
  }> {
    const originalSize = JSON.stringify(data).length

    if (originalSize < this.config.compression.threshold) {
      return {
        compressed: JSON.stringify(data),
        encoding: 'identity',
        compressionRatio: 1
      }
    }

    // Choose best compression algorithm based on Accept-Encoding header
    const supportedAlgorithms = this.config.compression.algorithms
    const clientAlgorithms = acceptEncoding.split(',').map(s => s.trim())

    const algorithm = supportedAlgorithms.find(algo =>
      clientAlgorithms.includes(algo)
    ) || 'identity'

    if (algorithm === 'identity') {
      return {
        compressed: JSON.stringify(data),
        encoding: 'identity',
        compressionRatio: 1
      }
    }

    try {
      // In a real implementation, use compression libraries like pako, node-gzip, etc.
      const compressed = JSON.stringify(data) // Placeholder
      const compressedSize = compressed.length

      return {
        compressed,
        encoding: algorithm,
        compressionRatio: originalSize / compressedSize
      }
    } catch (error) {
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.LOW,
        context: { operation: 'compressResponse', algorithm }
      })

      return {
        compressed: JSON.stringify(data),
        encoding: 'identity',
        compressionRatio: 1
      }
    }
  }

  // ========== Private Methods ==========

  private async validateRequest(
    request: NextRequest,
    validation?: ValidationSchema
  ): Promise<any> {
    if (!validation) return {}

    try {
      const contentType = request.headers.get('content-type') || ''
      let body: any = {}

      if (contentType.includes('application/json')) {
        const text = await request.text()
        body = text ? JSON.parse(text) : {}
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData()
        body = Object.fromEntries(formData.entries())
      }

      // Validate query parameters
      const url = new URL(request.url)
      const query = Object.fromEntries(url.searchParams.entries())

      const input = { body, query, params: {} }

      if (validation.body) {
        input.body = validation.body.parse(input.body)
      }
      if (validation.query) {
        input.query = validation.query.parse(input.query)
      }

      return input
    } catch (error) {
      throw new Error(`Validation failed: ${(error as Error).message}`)
    }
  }

  private generateCacheKey(request: NextRequest, input: any): string {
    const url = request.nextUrl.pathname + request.nextUrl.search
    const method = request.method
    const inputHash = this.hashObject(input)

    return `api:${method}:${url}:${inputHash}`
  }

  private async getCachedResponse<T>(
    key: string,
    options?: CacheOptions
  ): Promise<T | null> {
    if (!this.config.caching.enabled) return null

    const strategy = options?.strategy || 'memory'
    return this.cache.get<T>(key, strategy)
  }

  private async cacheResponse<T>(
    key: string,
    response: T,
    options?: CacheOptions
  ): Promise<void> {
    if (!this.config.caching.enabled) return

    const strategy = options?.strategy || 'memory'
    const ttl = options?.ttl || this.config.caching.defaultTTL

    await this.cache.set(key, response, strategy, { ttl, ...options })
  }

  private async executeHandler<T>(
    handler: APIRouteHandler<T>,
    request: NextRequest,
    input: any,
    context: any
  ): Promise<APIResponseData<T>> {
    return handler(request, input, context)
  }

  private createResponse<T>(data: APIResponseData<T>, meta?: any): NextResponse {
    const response = NextResponse.json({
      ...data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        ...meta,
        ...data.meta
      }
    })

    // Add performance headers
    if (meta?.fromCache) {
      response.headers.set('X-Cache-Status', 'HIT')
    } else {
      response.headers.set('X-Cache-Status', 'MISS')
    }

    return response
  }

  private async processSingleBatchRequest(request: BatchRequest): Promise<any> {
    // Process individual batch request
    // This would integrate with the actual API handlers
    return { id: request.id, status: 'completed' }
  }

  private setNestedField(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  private encodeCursor(data: Record<string, any>): string {
    return Buffer.from(JSON.stringify(data)).toString('base64')
  }

  private decodeCursor(cursor: string): Record<string, any> {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString())
    } catch {
      return {}
    }
  }

  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort())
    return Buffer.from(str).toString('base64').substring(0, 16)
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// ========== Type Definitions ==========

export interface CacheEntry {
  data: any
  expiresAt: number
  tags: string[]
  createdAt: number
}

export interface RouteOptions {
  cache?: CacheOptions
  validation?: ValidationSchema
  requireAuth?: boolean
  rateLimit?: boolean
  deduplicate?: boolean
  compression?: boolean
  pagination?: boolean
}

export interface ValidationSchema {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
}

export interface APIRouteHandler<T> {
  (request: NextRequest, input: any, context?: any): Promise<APIResponseData<T>>
}

export interface OptimizedAPIHandler<T> {
  (request: NextRequest, context?: any): Promise<NextResponse>
}

export interface APIResponseData<T> {
  success: boolean
  data?: T
  error?: string
  meta?: Record<string, any>
}

export interface BatchRequest {
  id: string
  method: string
  url: string
  body?: any
  headers?: Record<string, string>
}

export interface BatchOptions {
  concurrency?: number
  failFast?: boolean
  timeout?: number
}

export interface BatchResponse<T> {
  results: Array<{
    requestId: string
    success: boolean
    data?: T
    error?: string
  }>
  summary: {
    total: number
    successful: number
    failed: number
    executionTime: Promise<number>
  }
}

export interface PaginationOptions {
  limit?: number
  cursor?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  items: T[]
  pageInfo: {
    hasNextPage: boolean
    nextCursor?: string
    totalCount: number
  }
}

// ========== Factory Functions ==========

export function createOptimizedAPI(config?: Partial<APIConfig>): APIOptimizer {
  return new APIOptimizer(config)
}

export function withOptimization<T>(
  handler: APIRouteHandler<T>,
  options?: RouteOptions
): OptimizedAPIHandler<T> {
  const optimizer = new APIOptimizer()
  return optimizer.optimizeRoute(handler, options)
}

// ========== Utility Functions ==========

export const withCache = (options: CacheOptions) =>
  <T>(handler: APIRouteHandler<T>): APIRouteHandler<T> => {
    const optimizer = new APIOptimizer()
    return optimizer.optimizeRoute(handler, { cache: options })
  }

export const withValidation = (schema: ValidationSchema) =>
  <T>(handler: APIRouteHandler<T>): APIRouteHandler<T> => {
    const optimizer = new APIOptimizer()
    return optimizer.optimizeRoute(handler, { validation: schema })
  }

export const withAuth = () =>
  <T>(handler: APIRouteHandler<T>): APIRouteHandler<T> => {
    const optimizer = new APIOptimizer()
    return optimizer.optimizeRoute(handler, { requireAuth: true })
  }

export const withPagination = () =>
  <T>(handler: APIRouteHandler<T>): APIRouteHandler<T> => {
    const optimizer = new APIOptimizer()
    return optimizer.optimizeRoute(handler, { pagination: true })
  }