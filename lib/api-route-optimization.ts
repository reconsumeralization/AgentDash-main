/**
 * Enhanced API Route Optimization and Middleware System
 * Advanced utilities for optimizing API routes with validation, caching, and performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ErrorHandler, ErrorCategory, ErrorSeverity } from './error-handling'
import { performanceMonitor, cache } from './performance-monitor'
import { getDatabaseClient, getDatabaseUtilities } from './database-optimization'

// ============================================================================
// API ROUTE CONFIGURATION
// ============================================================================

export interface APIRouteConfig {
  validation: {
    strict: boolean
    stripUnknown: boolean
    allowExtraKeys: boolean
  }
  caching: {
    enabled: boolean
    defaultTTL: number
    strategies: CacheStrategy[]
  }
  rateLimit: {
    enabled: boolean
    windowMs: number
    maxRequests: number
    skipSuccessfulRequests: boolean
  }
  compression: {
    enabled: boolean
    threshold: number
  }
  monitoring: {
    enabled: boolean
    logRequests: boolean
    logResponses: boolean
    trackPerformance: boolean
  }
  security: {
    enabled: boolean
    requireAuth: boolean
    validateCSRF: boolean
    sanitizeInput: boolean
  }
}

export interface CacheStrategy {
  name: string
  ttl: number
  conditions: (request: NextRequest, context?: any) => boolean
}

export const defaultAPIRouteConfig: APIRouteConfig = {
  validation: {
    strict: true,
    stripUnknown: false,
    allowExtraKeys: false
  },
  caching: {
    enabled: true,
    defaultTTL: 300, // 5 minutes
    strategies: [
      {
        name: 'public_data',
        ttl: 600, // 10 minutes
        conditions: (request) => request.method === 'GET' && !request.headers.get('authorization')
      },
      {
        name: 'user_data',
        ttl: 300, // 5 minutes
        conditions: (request) => request.method === 'GET' && !!request.headers.get('authorization')
      },
      {
        name: 'analytics_data',
        ttl: 1800, // 30 minutes
        conditions: (request) => request.url.includes('/analytics')
      }
    ]
  },
  rateLimit: {
    enabled: true,
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    skipSuccessfulRequests: false
  },
  compression: {
    enabled: true,
    threshold: 1024 // 1KB
  },
  monitoring: {
    enabled: true,
    logRequests: true,
    logResponses: true,
    trackPerformance: true
  },
  security: {
    enabled: true,
    requireAuth: false,
    validateCSRF: false,
    sanitizeInput: true
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const CommonSchemas = {
  // Pagination
  PaginationSchema: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
    offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional()
  }),

  // User identification
  UserSchema: z.object({
    userId: z.string().uuid(),
    email: z.string().email().optional(),
    name: z.string().min(1).max(100).optional()
  }),

  // Tribe operations
  TribeCreateSchema: z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(10).max(500),
    type: z.enum(['professional', 'interest', 'project', 'geographic', 'skill-based', 'aspirational']),
    visibility: z.enum(['public', 'private', 'invite-only']).default('public'),
    rules: z.array(z.object({
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(500),
      category: z.enum(['content', 'governance', 'collaboration', 'behavior', 'participation']),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      enforcement: z.enum(['warning', 'mute', 'ban', 'kick']),
      createdBy: z.string().uuid()
    })).optional(),
    goals: z.array(z.object({
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(500),
      targetDate: z.string().datetime().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
    })).optional()
  }),

  TribeUpdateSchema: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().min(10).max(500).optional(),
    type: z.enum(['professional', 'interest', 'project', 'geographic', 'skill-based', 'aspirational']).optional(),
    visibility: z.enum(['public', 'private', 'invite-only']).optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional()
  }),

  // Social media operations
  SocialPostSchema: z.object({
    platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube']),
    content: z.object({
      text: z.string().min(1).max(3000),
      hashtags: z.array(z.string()).optional(),
      links: z.array(z.object({
        url: z.string().url(),
        title: z.string(),
        description: z.string().optional()
      })).optional(),
      images: z.array(z.string().url()).optional(),
      videos: z.array(z.string().url()).optional()
    }),
    scheduledAt: z.string().datetime().optional(),
    brand: z.enum(['defconect', 'linkedout']).optional()
  }),

  // Analytics queries
  AnalyticsQuerySchema: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    metrics: z.array(z.string()).optional(),
    groupBy: z.array(z.string()).optional(),
    filters: z.record(z.any()).optional()
  })
}

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()

  checkLimit(
    identifier: string,
    windowMs: number,
    maxRequests: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const key = identifier
    const current = this.requests.get(key)

    if (!current || now > current.resetTime) {
      // Reset or create new window
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    current.count++
    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime
    }
  }

  getStats(): Record<string, any> {
    const now = Date.now()
    const active = Array.from(this.requests.entries())
      .filter(([_, data]) => now < data.resetTime)
      .length

    return {
      activeWindows: active,
      totalTracked: this.requests.size
    }
  }
}

const rateLimiter = new RateLimiter()

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number; hits: number; lastAccess: number }>()
  private readonly maxSize = 1000
  private readonly cleanupInterval = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Start cleanup process
    setInterval(() => this.cleanup(), this.cleanupInterval)
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    cached.hits++
    cached.lastAccess = Date.now()

    return cached.data
  }

  set(key: string, data: any, ttl: number): void {
    // Evict old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccess: Date.now()
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key)
      }
    }
  }

  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  getStats(): { size: number; keys: string[]; hitRate: number } {
    const totalHits = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0)
    const totalRequests = this.cache.size + totalHits
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: Math.round(hitRate * 100) / 100
    }
  }
}

const apiCache = new APICache()

// ============================================================================
// REQUEST/RESPONSE HELPERS
// ============================================================================

export function createSuccessResponse<T>(
  data: T,
  options: {
    message?: string
    pagination?: any
    meta?: Record<string, any>
    status?: number
    cacheTTL?: number
    cacheKey?: string
  } = {}
): NextResponse {
  const { message, pagination, meta, status = 200, cacheTTL, cacheKey } = options

  const response: any = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }

  if (message) response.message = message
  if (pagination) response.pagination = pagination
  if (meta) response.meta = meta

  const nextResponse = NextResponse.json(response, { status })

  // Add caching headers
  if (cacheTTL && cacheKey) {
    nextResponse.headers.set('Cache-Control', `public, max-age=${cacheTTL}`)
    nextResponse.headers.set('X-Cache-Key', cacheKey)
  }

  // Add security headers
  nextResponse.headers.set('X-Content-Type-Options', 'nosniff')
  nextResponse.headers.set('X-Frame-Options', 'DENY')
  nextResponse.headers.set('X-XSS-Protection', '1; mode=block')

  return nextResponse
}

export function createErrorResponse(
  error: string | Error,
  status: number = 500,
  options: {
    code?: string
    details?: any
    retryAfter?: number
  } = {}
): NextResponse {
  const { code, details, retryAfter } = options

  const errorMessage = error instanceof Error ? error.message : error

  const response: any = {
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString()
  }

  if (code) response.code = code
  if (details) response.details = details

  const nextResponse = NextResponse.json(response, { status })

  if (retryAfter) {
    nextResponse.headers.set('Retry-After', retryAfter.toString())
  }

  // Add security headers
  nextResponse.headers.set('X-Content-Type-Options', 'nosniff')
  nextResponse.headers.set('X-Frame-Options', 'DENY')
  nextResponse.headers.set('X-XSS-Protection', '1; mode=block')

  return nextResponse
}

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

export function withValidation<T>(
  schema: z.ZodSchema<T>,
  config: Partial<APIRouteConfig> = {}
) {
  return async (request: NextRequest): Promise<{
    isValid: boolean
    data?: T
    errors?: string[]
    response?: NextResponse
  }> => {
    try {
      const body = await request.json()
      const data = schema.parse(body)
      
      return { isValid: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        
        return {
          isValid: false,
          errors,
          response: createErrorResponse('Validation failed', 400, { details: errors })
        }
      }
      
      return {
        isValid: false,
        errors: ['Invalid request format'],
        response: createErrorResponse('Invalid request format', 400)
      }
    }
  }
}

export function withRateLimit(
  config: Partial<APIRouteConfig> = {}
) {
  return (request: NextRequest): {
    allowed: boolean
    response?: NextResponse
  } => {
    const routeConfig = { ...defaultAPIRouteConfig, ...config }
    
    if (!routeConfig.rateLimit.enabled) {
      return { allowed: true }
    }

    const identifier = getClientIdentifier(request)
    const limit = rateLimiter.checkLimit(
      identifier,
      routeConfig.rateLimit.windowMs,
      routeConfig.rateLimit.maxRequests
    )

    if (!limit.allowed) {
      const retryAfter = Math.ceil((limit.resetTime - Date.now()) / 1000)
      
      return {
        allowed: false,
        response: createErrorResponse(
          'Rate limit exceeded',
          429,
          { retryAfter }
        )
      }
    }

    return { allowed: true }
  }
}

export function withCaching(
  config: Partial<APIRouteConfig> = {}
) {
  return {
    get: (request: NextRequest, cacheKey?: string): any | null => {
      const routeConfig = { ...defaultAPIRouteConfig, ...config }
      
      if (!routeConfig.caching.enabled || !cacheKey) {
        return null
      }

      return apiCache.get(cacheKey)
    },

    set: (data: any, cacheKey: string, ttl?: number): void => {
      const routeConfig = { ...defaultAPIRouteConfig, ...config }
      
      if (!routeConfig.caching.enabled) {
        return
      }

      const finalTTL = ttl || routeConfig.caching.defaultTTL
      apiCache.set(cacheKey, data, finalTTL)
    }
  }
}

export function withPerformanceMonitoring(
  config: Partial<APIRouteConfig> = {}
) {
  return (request: NextRequest, handler: () => Promise<NextResponse>): Promise<NextResponse> => {
    const routeConfig = { ...defaultAPIRouteConfig, ...config }
    
    if (!routeConfig.monitoring.enabled) {
      return handler()
    }

    const startTime = Date.now()
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (routeConfig.monitoring.logRequests) {
      console.log(`[${requestId}] ${request.method} ${request.url}`, {
        headers: Object.fromEntries(request.headers.entries()),
        timestamp: new Date().toISOString()
      })
    }

    return handler().then(response => {
      const duration = Date.now() - startTime
      
      if (routeConfig.monitoring.logResponses) {
        console.log(`[${requestId}] Response ${response.status} in ${duration}ms`)
      }

      if (routeConfig.monitoring.trackPerformance) {
        // performanceMonitor.recordApiRequest(duration, request.url, response.status) // Method not available
      }

      return response
    }).catch(async error => {
      const duration = Date.now() - startTime
      
      const errorHandler = ErrorHandler.getInstance()
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
        context: { requestId, duration, url: request.url }
      })

      throw error
    })
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    // Extract user ID from JWT or other auth token
    return `user_${authHeader.split('.')[1] || 'unknown'}`
  }

  // Fallback to IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  return `ip_${ip}`
}

export function generateCacheKey(
  request: NextRequest,
  prefix: string,
  params?: Record<string, any>
): string {
  const url = new URL(request.url)
  const path = url.pathname
  const query = url.searchParams.toString()
  const paramsString = params ? JSON.stringify(params) : ''
  
  return `${prefix}:${path}:${query}:${paramsString}`
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '')
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item))
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}

export function extractPaginationParams(request: NextRequest): {
  page: number
  limit: number
  offset: number
  sort?: string
  order?: 'asc' | 'desc'
} {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100)
  const offset = (page - 1) * limit
  const sort = url.searchParams.get('sort') || undefined
  const order = (url.searchParams.get('order') as 'asc' | 'desc') || undefined

  return { page, limit, offset, sort, order }
}

// ============================================================================
// COMPOSITE MIDDLEWARE
// ============================================================================

export function createOptimizedRoute<T>(
  handler: (request: NextRequest, validatedData?: T) => Promise<NextResponse>,
  options: {
    validationSchema?: z.ZodSchema<T>
    config?: Partial<APIRouteConfig>
    cacheKey?: (request: NextRequest, data?: T) => string
    cacheTTL?: number
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { validationSchema, config = {}, cacheKey, cacheTTL } = options
    const routeConfig = { ...defaultAPIRouteConfig, ...config }

    // Apply rate limiting
    if (routeConfig.rateLimit.enabled) {
      const rateLimitResult = withRateLimit(config)(request)
      if (!rateLimitResult.allowed) {
        return rateLimitResult.response!
      }
    }

    // Check cache for GET requests
    if (request.method === 'GET' && cacheKey) {
      const key = cacheKey(request)
      const cached = withCaching(config).get(request, key)
      if (cached) {
        return createSuccessResponse(cached, {
          meta: { cached: true },
          cacheKey: key
        })
      }
    }

    // Apply performance monitoring
    return withPerformanceMonitoring(config)(request, async () => {
      let validatedData: T | undefined

      // Apply validation if schema provided
      if (validationSchema) {
        const validationResult = await withValidation(validationSchema, config)(request)
        if (!validationResult.isValid) {
          return validationResult.response!
        }
        validatedData = validationResult.data
      }

      // Execute handler
      const response = await handler(request, validatedData)

      // Cache response if applicable
      if (request.method === 'GET' && cacheKey && response.status === 200) {
        const key = cacheKey(request, validatedData)
        const responseData = await response.clone().json()
        withCaching(config).set(responseData.data, key, cacheTTL)
      }

      return response
    })
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { rateLimiter, apiCache }
// APIRouteConfig and CacheStrategy are already exported above
