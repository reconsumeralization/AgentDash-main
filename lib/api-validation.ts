// Enhanced API validation and middleware
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Request validation schemas
export const SocialPostSchema = z.object({
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
})

export const GeneratePostSchema = z.object({
  brand: z.enum(['defconect', 'linkedout']),
  topic: z.string().min(1),
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube']),
  count: z.number().min(1).max(5).default(1),
  userContext: z.object({
    industry: z.string().optional(),
    role: z.string().optional(),
    experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    goals: z.array(z.string()).optional(),
    tone: z.enum(['professional', 'casual', 'authoritative', 'friendly']).optional()
  }).optional()
})

export const AnalyticsQuerySchema = z.object({
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'all']).optional(),
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  brand: z.enum(['defconect', 'linkedout']).optional(),
  accountId: z.string().optional()
})

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  meta?: Record<string, any>
}

// Enhanced error handling
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Rate limiting configuration
export const RATE_LIMITS = {
  default: { requests: 100, window: '15m' },
  premium: { requests: 1000, window: '15m' },
  generation: { requests: 20, window: '1h' },
  analytics: { requests: 50, window: '15m' }
}

// Validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ isValid: boolean; data?: T; errors?: string[] }> => {
    try {
      const body = await request.json()
      const data = schema.parse(body)
      return { isValid: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        return { isValid: false, errors }
      }
      return { isValid: false, errors: ['Invalid request format'] }
    }
  }
}

// Enhanced response helpers
export function createApiResponse<T>(
  data?: T,
  options?: {
    message?: string
    pagination?: ApiResponse['pagination']
    meta?: Record<string, any>
    status?: number
  }
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(options?.message && { message: options.message }),
    ...(options?.pagination && { pagination: options.pagination }),
    ...(options?.meta && { meta: options.meta })
  }

  return NextResponse.json(response, { status: options?.status || 200 })
}

export function createErrorResponse(
  error: string | ApiError,
  status: number = 500
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: typeof error === 'string' ? error : error.message,
    ...(typeof error === 'object' && error.code && { code: error.code }),
    ...(typeof error === 'object' && error.details && { details: error.details })
  }

  const statusCode = typeof error === 'object' ? error.statusCode : status
  return NextResponse.json(response, { status: statusCode })
}

// Caching utilities
export class ApiCache {
  private static cache = new Map<string, { data: any; expires: number }>()

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached || Date.now() > cached.expires) {
      this.cache.delete(key)
      return null
    }
    return cached.data
  }

  static set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000)
    })
  }

  static invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern))
    keys.forEach(key => this.cache.delete(key))
  }

  static clear(): void {
    this.cache.clear()
  }
}

// Request logging
export function logApiRequest(request: NextRequest, startTime: number, success: boolean, error?: string) {
  const duration = Date.now() - startTime
  const log = {
    method: request.method,
    url: request.url,
    duration: `${duration}ms`,
    success,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent')?.substring(0, 100),
    ...(error && { error })
  }

  console.log(`[API] ${request.method} ${request.url} - ${duration}ms ${success ? '✓' : '✗'}`, error ? { error } : '')
}

// Security helpers
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const validApiKeys = process.env.API_KEYS?.split(',') || []
  return validApiKeys.includes(apiKey || '')
}

export function getCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|')
  return `${prefix}:${sortedParams}`
}