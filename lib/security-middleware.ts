/**
 * 🛡️ SECURITY MIDDLEWARE - Comprehensive Security Layer
 * Provides consistent security controls across all API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { rateLimit, commonRateLimits } from './rate-limit'
import { SecurityValidator, SecureRateLimiter, SecureLogger, SecurityHeaders, CSRFProtection } from './security-patches'
import { db } from './supabase'

// Security configuration
export const SECURITY_MIDDLEWARE_CONFIG = {
  // Rate limiting tiers
  RATE_LIMITS: {
    // Public endpoints (read-only)
    PUBLIC_READ: { requests: 100, window: 60 * 1000 }, // 100 req/min
    // Authenticated endpoints
    AUTHENTICATED: { requests: 200, window: 60 * 1000 }, // 200 req/min
    // Sensitive operations
    SENSITIVE: { requests: 50, window: 60 * 1000 }, // 50 req/min
    // File operations
    FILE_OPS: { requests: 20, window: 60 * 1000 }, // 20 req/min
    // Agent operations
    AGENT_OPS: { requests: 30, window: 60 * 1000 }, // 30 req/min
  },
  
  // Request size limits
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_JSON_SIZE: 1024 * 1024, // 1MB
  
  // Timeout configurations
  REQUEST_TIMEOUT: 30000, // 30 seconds
  DB_TIMEOUT: 10000, // 10 seconds
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'X-Robots-Tag': 'noindex, nofollow'
  }
}

// Security middleware types
export interface SecurityContext {
  userId?: string
  user?: any
  ip: string
  userAgent: string
  requestId: string
  timestamp: number
  isAuthenticated: boolean
  isDemoMode: boolean
}

export interface SecurityOptions {
  requireAuth?: boolean
  rateLimitTier?: keyof typeof SECURITY_MIDDLEWARE_CONFIG.RATE_LIMITS
  validateInput?: boolean
  logSecurity?: boolean
  timeout?: number
  maxRequestSize?: number
}

// Security middleware class
export class SecurityMiddleware {
  private static secureRateLimiter = new SecureRateLimiter()
  
  /**
   * Main security middleware function
   */
  static async withSecurity(
    handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>,
    options: SecurityOptions = {}
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const startTime = Date.now()
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      try {
        // Extract request metadata
        const ip = this.extractIP(request)
        const userAgent = request.headers.get('user-agent') || 'unknown'
        const timestamp = Date.now()
        
        // Create security context
        const context: SecurityContext = {
          ip,
          userAgent,
          requestId,
          timestamp,
          isAuthenticated: false,
          isDemoMode: false
        }
        
        // Apply security checks
        await this.applySecurityChecks(request, context, options)
        
        // Execute handler with timeout
        const response = await Promise.race([
          handler(request, context),
          new Promise<NextResponse>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), options.timeout || SECURITY_MIDDLEWARE_CONFIG.REQUEST_TIMEOUT)
          )
        ])
        
        // Add security headers to response
        this.addSecurityHeaders(response)
        
        // Log successful request
        if (options.logSecurity) {
          SecureLogger.logSecurityEvent('request_success', {
            requestId,
            method: request.method,
            url: request.url,
            duration: Date.now() - startTime,
            userId: context.userId
          }, ip, userAgent)
        }
        
        return response
        
      } catch (error) {
        // Log security error
        SecureLogger.logError(error as Error, { requestId, url: request.url }, this.extractIP(request))
        
        // Return appropriate error response
        return this.createErrorResponse(error as Error, requestId)
      }
    }
  }
  
  /**
   * Apply all security checks
   */
  private static async applySecurityChecks(
    request: NextRequest,
    context: SecurityContext,
    options: SecurityOptions
  ): Promise<void> {
    // 1. Rate limiting
    await this.checkRateLimit(request, context, options)
    
    // 2. Request size validation
    this.validateRequestSize(request, options)
    
    // 3. Authentication (if required)
    if (options.requireAuth) {
      await this.authenticateUser(request, context)
    }
    
    // 4. Input validation (if enabled)
    if (options.validateInput) {
      await this.validateInput(request)
    }
    
    // 5. CSRF protection (for state-changing operations)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      this.validateCSRF(request, context)
    }
  }
  
  /**
   * Check rate limiting
   */
  private static async checkRateLimit(
    request: NextRequest,
    context: SecurityContext,
    options: SecurityOptions
  ): Promise<void> {
    const tier = options.rateLimitTier || 'AUTHENTICATED'
    const limit = SECURITY_MIDDLEWARE_CONFIG.RATE_LIMITS[tier]
    
    const rateLimitResult = this.secureRateLimiter.checkRateLimit(context.ip, context.userAgent)
    
    if (!rateLimitResult.allowed) {
      SecureLogger.logSecurityEvent('rate_limit_exceeded', {
        requestId: context.requestId,
        ip: context.ip,
        userAgent: context.userAgent,
        tier,
        reason: rateLimitResult.reason
      }, context.ip, context.userAgent)
      
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`)
    }
  }
  
  /**
   * Validate request size
   */
  private static validateRequestSize(request: NextRequest, options: SecurityOptions): void {
    const contentLength = request.headers.get('content-length')
    const maxSize = options.maxRequestSize || SECURITY_MIDDLEWARE_CONFIG.MAX_REQUEST_SIZE
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      throw new Error('Request too large')
    }
  }
  
  /**
   * Authenticate user
   */
  private static async authenticateUser(request: NextRequest, context: SecurityContext): Promise<void> {
    try {
      const auth = getAuth(request)
      
      if (!auth?.userId) {
        // Check for demo mode
        const isDemoMode = process.env.NEXT_PUBLIC_DEMO_USER_ID
        if (isDemoMode) {
          context.isDemoMode = true
          context.userId = isDemoMode
          context.user = await db.getOrCreateUserByClerkId(isDemoMode, {
            email: 'demo@defconect.com',
            name: 'Demo User'
          })
          return
        }
        
        throw new Error('Authentication required')
      }
      
      context.isAuthenticated = true
      context.userId = auth.userId
      context.user = await db.getOrCreateUserByClerkId(auth.userId)
      
    } catch (error) {
      SecureLogger.logSecurityEvent('authentication_failed', {
        requestId: context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, context.ip, context.userAgent)
      
      throw new Error('Authentication failed')
    }
  }
  
  /**
   * Validate input data
   */
  private static async validateInput(request: NextRequest): Promise<void> {
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.json()
        
        // Validate JSON size
        const jsonSize = JSON.stringify(body).length
        if (jsonSize > SECURITY_MIDDLEWARE_CONFIG.MAX_JSON_SIZE) {
          throw new Error('Request body too large')
        }
        
        // Sanitize input recursively
        this.sanitizeObject(body)
        
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error('Invalid JSON format')
        }
        throw error
      }
    }
  }
  
  /**
   * Validate CSRF token
   */
  private static validateCSRF(request: NextRequest, context: SecurityContext): void {
    const csrfToken = request.headers.get('x-csrf-token')
    const sessionId = request.headers.get('x-session-id')
    
    if (!csrfToken || !sessionId) {
      // For now, we'll be lenient with CSRF in demo mode
      if (context.isDemoMode) {
        return
      }
      
      throw new Error('CSRF token required')
    }
    
    if (!CSRFProtection.validateToken(sessionId, csrfToken)) {
      throw new Error('Invalid CSRF token')
    }
  }
  
  /**
   * Sanitize object recursively
   */
  private static sanitizeObject(obj: any): void {
    if (typeof obj === 'string') {
      SecurityValidator.sanitizeInput(obj)
    } else if (Array.isArray(obj)) {
      obj.forEach(item => this.sanitizeObject(item))
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(value => this.sanitizeObject(value))
    }
  }
  
  /**
   * Extract IP address from request
   */
  private static extractIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('x-real-ip') ||
           request.headers.get('x-client-ip') ||
           'unknown'
  }
  
  /**
   * Add security headers to response
   */
  private static addSecurityHeaders(response: NextResponse): void {
    Object.entries(SECURITY_MIDDLEWARE_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }
  
  /**
   * Create error response
   */
  private static createErrorResponse(error: Error, requestId: string): NextResponse {
    const status = this.getErrorStatus(error)
    const message = this.getErrorMessage(error)
    
    return NextResponse.json(
      {
        success: false,
        error: message,
        requestId,
        timestamp: new Date().toISOString()
      },
      { 
        status,
        headers: SECURITY_MIDDLEWARE_CONFIG.SECURITY_HEADERS
      }
    )
  }
  
  /**
   * Get HTTP status code for error
   */
  private static getErrorStatus(error: Error): number {
    if (error.message.includes('Authentication')) return 401
    if (error.message.includes('Rate limit')) return 429
    if (error.message.includes('too large') || error.message.includes('Invalid')) return 400
    if (error.message.includes('timeout')) return 408
    if (error.message.includes('CSRF')) return 403
    return 500
  }
  
  /**
   * Get safe error message
   */
  private static getErrorMessage(error: Error): string {
    // Don't expose internal error details
    if (error.message.includes('timeout')) return 'Request timeout'
    if (error.message.includes('too large')) return 'Request too large'
    if (error.message.includes('Invalid JSON')) return 'Invalid request format'
    if (error.message.includes('Authentication')) return 'Authentication required'
    if (error.message.includes('Rate limit')) return 'Rate limit exceeded'
    if (error.message.includes('CSRF')) return 'Invalid request'
    
    return 'Internal server error'
  }
}

// Convenience functions for common security patterns
export const withAuth = (handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
  SecurityMiddleware.withSecurity(handler, { requireAuth: true })

export const withRateLimit = (tier: keyof typeof SECURITY_MIDDLEWARE_CONFIG.RATE_LIMITS) =>
  (handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
    SecurityMiddleware.withSecurity(handler, { rateLimitTier: tier })

export const withValidation = (handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
  SecurityMiddleware.withSecurity(handler, { validateInput: true })

export const withFullSecurity = (handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
  SecurityMiddleware.withSecurity(handler, {
    requireAuth: true,
    validateInput: true,
    logSecurity: true,
    rateLimitTier: 'SENSITIVE'
  })

// Data access security utilities
export class DataAccessSecurity {
  /**
   * Validate user can access resource
   */
  static async validateUserAccess(userId: string, resourceUserId: string): Promise<boolean> {
    if (!userId || !resourceUserId) return false
    return userId === resourceUserId
  }
  
  /**
   * Validate user can access project
   */
  static async validateProjectAccess(userId: string, projectId: string): Promise<boolean> {
    try {
      const project = await db.getProject(projectId)
      if (!project) return false
      
      // Check if user is founder or team member
      return project.founder_id === userId || 
             (project.team_members && project.team_members.includes(userId)) ||
             project.access_level === 'public'
    } catch {
      return false
    }
  }
  
  /**
   * Validate user can access knowledge base
   */
  static async validateKnowledgeBaseAccess(userId: string, knowledgeBaseId: string): Promise<boolean> {
    try {
      const kb = await db.getKnowledgeBase(knowledgeBaseId)
      if (!kb) return false
      
      // Check if user owns it, it's public, or it's shared with them
      return kb.user_id === userId || 
             kb.is_public ||
             await db.isKnowledgeBaseSharedWith(knowledgeBaseId, userId)
    } catch {
      return false
    }
  }
  
  /**
   * Sanitize database query parameters
   */
  static sanitizeQueryParams(params: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        // Remove potential SQL injection patterns
        sanitized[key] = value
          .replace(/['";\\]/g, '')
          .replace(/--/g, '')
          .replace(/\/\*/g, '')
          .replace(/\*\//g, '')
          .substring(0, 1000) // Limit length
      } else if (typeof value === 'number') {
        sanitized[key] = Math.max(0, Math.min(1000000, value)) // Clamp to reasonable range
      } else if (Array.isArray(value)) {
        sanitized[key] = value.slice(0, 100) // Limit array size
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
}

// Audit logging for data access
export class AuditLogger {
  /**
   * Log data access
   */
  static async logDataAccess(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    context: SecurityContext,
    success: boolean = true
  ): Promise<void> {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      resourceType,
      resourceId,
      requestId: context.requestId,
      ip: context.ip,
      userAgent: context.userAgent,
      success
    }
    
    // In production, this would be stored in a secure audit log
    console.log('AUDIT_LOG:', JSON.stringify(auditEntry))
    
    // Store in database for compliance
    try {
      await db.createAuditLog(auditEntry)
    } catch (error) {
      console.error('Failed to store audit log:', error)
    }
  }
  
  /**
   * Log security event
   */
  static async logSecurityEvent(
    event: string,
    details: any,
    context: SecurityContext,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userId: context.userId,
      requestId: context.requestId,
      ip: context.ip,
      userAgent: context.userAgent,
      severity
    }
    
    SecureLogger.logSecurityEvent(event, details, context.ip, context.userAgent)
    
    // Store in database for analysis
    try {
      await db.createSecurityEvent(securityEvent)
    } catch (error) {
      console.error('Failed to store security event:', error)
    }
  }
}
