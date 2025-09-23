/**
 * 🔒 SECURE API WRAPPER - Standardized Secure API Route Patterns
 * Provides consistent security patterns for all API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SecurityMiddleware, SecurityContext, withAuth, withFullSecurity, DataAccessSecurity, AuditLogger } from './security-middleware'
import { db } from './supabase'

// Common validation schemas
export const commonSchemas = {
  userId: z.string().uuid().optional(),
  id: z.string().uuid(),
  pagination: z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0)
  }),
  search: z.object({
    query: z.string().min(1).max(1000).optional(),
    filters: z.record(z.any()).optional()
  })
}

// Standard API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  requestId: string
  timestamp: string
  pagination?: {
    limit: number
    offset: number
    total: number
    hasMore: boolean
  }
}

// Secure API route builder
export class SecureApiRoute {
  /**
   * Create a secure GET route
   */
  static GET<T = any>(
    handler: (request: NextRequest, context: SecurityContext) => Promise<T>,
    options: {
      requireAuth?: boolean
      validateParams?: z.ZodSchema
      rateLimitTier?: 'PUBLIC_READ' | 'AUTHENTICATED' | 'SENSITIVE'
      auditAction?: string
      auditResourceType?: string
    } = {}
  ) {
    return SecurityMiddleware.withSecurity(async (request: NextRequest, context: SecurityContext) => {
      try {
        // Validate query parameters if schema provided
        if (options.validateParams) {
          const url = new URL(request.url)
          const params = Object.fromEntries(url.searchParams.entries())
          options.validateParams.parse(params)
        }
        
        // Execute handler
        const data = await handler(request, context)
        
        // Log audit if specified
        if (options.auditAction && options.auditResourceType) {
          await AuditLogger.logDataAccess(
            context.userId || 'anonymous',
            options.auditAction,
            options.auditResourceType,
            'list',
            context,
            true
          )
        }
        
        // Return success response
        return NextResponse.json({
          success: true,
          data,
          requestId: context.requestId,
          timestamp: new Date().toISOString()
        } as ApiResponse<T>)
        
      } catch (error) {
        // Log audit failure
        if (options.auditAction && options.auditResourceType) {
          await AuditLogger.logDataAccess(
            context.userId || 'anonymous',
            options.auditAction,
            options.auditResourceType,
            'list',
            context,
            false
          )
        }
        
        throw error
      }
    }, {
      requireAuth: options.requireAuth,
      rateLimitTier: options.rateLimitTier || 'AUTHENTICATED',
      logSecurity: true
    })
  }
  
  /**
   * Create a secure POST route
   */
  static POST<T = any>(
    handler: (request: NextRequest, context: SecurityContext, body: any) => Promise<T>,
    options: {
      requireAuth?: boolean
      validateBody?: z.ZodSchema
      rateLimitTier?: 'AUTHENTICATED' | 'SENSITIVE' | 'FILE_OPS'
      auditAction?: string
      auditResourceType?: string
    } = {}
  ) {
    return SecurityMiddleware.withSecurity(async (request: NextRequest, context: SecurityContext) => {
      try {
        // Parse and validate request body
        let body: any = {}
        if (request.headers.get('content-type')?.includes('application/json')) {
          body = await request.json()
        }
        
        if (options.validateBody) {
          body = options.validateBody.parse(body)
        }
        
        // Execute handler
        const data = await handler(request, context, body)
        
        // Log audit if specified
        if (options.auditAction && options.auditResourceType) {
          await AuditLogger.logDataAccess(
            context.userId || 'anonymous',
            options.auditAction,
            options.auditResourceType,
            body.id || 'create',
            context,
            true
          )
        }
        
        // Return success response
        return NextResponse.json({
          success: true,
          data,
          requestId: context.requestId,
          timestamp: new Date().toISOString()
        } as ApiResponse<T>)
        
      } catch (error) {
        // Log audit failure
        if (options.auditAction && options.auditResourceType) {
          await AuditLogger.logDataAccess(
            context.userId || 'anonymous',
            options.auditAction,
            options.auditResourceType,
            'create',
            context,
            false
          )
        }
        
        throw error
      }
    }, {
      requireAuth: options.requireAuth,
      validateInput: true,
      rateLimitTier: options.rateLimitTier || 'AUTHENTICATED',
      logSecurity: true
    })
  }
  
  /**
   * Create a secure PUT route
   */
  static PUT<T = any>(
    handler: (request: NextRequest, context: SecurityContext, body: any, id: string) => Promise<T>,
    options: {
      requireAuth?: boolean
      validateBody?: z.ZodSchema
      rateLimitTier?: 'AUTHENTICATED' | 'SENSITIVE'
      auditAction?: string
      auditResourceType?: string
    } = {}
  ) {
    return SecurityMiddleware.withSecurity(async (request: NextRequest, context: SecurityContext) => {
      try {
        // Extract ID from URL
        const url = new URL(request.url)
        const pathParts = url.pathname.split('/')
        const id = pathParts[pathParts.length - 1]
        
        if (!id || !z.string().uuid().safeParse(id).success) {
          throw new Error('Invalid resource ID')
        }
        
        // Parse and validate request body
        let body: any = {}
        if (request.headers.get('content-type')?.includes('application/json')) {
          body = await request.json()
        }
        
        if (options.validateBody) {
          body = options.validateBody.parse(body)
        }
        
        // Execute handler
        const data = await handler(request, context, body, id)
        
        // Log audit if specified
        if (options.auditAction && options.auditResourceType) {
          await AuditLogger.logDataAccess(
            context.userId || 'anonymous',
            options.auditAction,
            options.auditResourceType,
            id,
            context,
            true
          )
        }
        
        // Return success response
        return NextResponse.json({
          success: true,
          data,
          requestId: context.requestId,
          timestamp: new Date().toISOString()
        } as ApiResponse<T>)
        
      } catch (error) {
        // Log audit failure
        if (options.auditAction && options.auditResourceType) {
          await AuditLogger.logDataAccess(
            context.userId || 'anonymous',
            options.auditAction,
            options.auditResourceType,
            'update',
            context,
            false
          )
        }
        
        throw error
      }
    }, {
      requireAuth: options.requireAuth,
      validateInput: true,
      rateLimitTier: options.rateLimitTier || 'AUTHENTICATED',
      logSecurity: true
    })
  }
  
  /**
   * Create a secure DELETE route
   */
  static DELETE<T = any>(
    handler: (request: NextRequest, context: SecurityContext, id: string) => Promise<T>,
    options: {
      requireAuth?: boolean
      rateLimitTier?: 'AUTHENTICATED' | 'SENSITIVE'
      auditAction?: string
      auditResourceType?: string
    } = {}
  ) {
    return SecurityMiddleware.withSecurity(async (request: NextRequest, context: SecurityContext) => {
      try {
        // Extract ID from URL
        const url = new URL(request.url)
        const pathParts = url.pathname.split('/')
        const id = pathParts[pathParts.length - 1]
        
        if (!id || !z.string().uuid().safeParse(id).success) {
          throw new Error('Invalid resource ID')
        }
        
        // Execute handler
        const data = await handler(request, context, id)
        
        // Log audit if specified
        if (options.auditAction && options.auditResourceType) {
          await AuditLogger.logDataAccess(
            context.userId || 'anonymous',
            options.auditAction,
            options.auditResourceType,
            id,
            context,
            true
          )
        }
        
        // Return success response
        return NextResponse.json({
          success: true,
          data,
          requestId: context.requestId,
          timestamp: new Date().toISOString()
        } as ApiResponse<T>)
        
      } catch (error) {
        // Log audit failure
        if (options.auditAction && options.auditResourceType) {
          await AuditLogger.logDataAccess(
            context.userId || 'anonymous',
            options.auditAction,
            options.auditResourceType,
            'delete',
            context,
            false
          )
        }
        
        throw error
      }
    }, {
      requireAuth: options.requireAuth,
      rateLimitTier: options.rateLimitTier || 'SENSITIVE',
      logSecurity: true
    })
  }
}

// Data access helpers
export class SecureDataAccess {
  /**
   * Get user's own data with access validation
   */
  static async getUserData<T>(
    userId: string,
    resourceUserId: string,
    getter: () => Promise<T>
  ): Promise<T> {
    if (!DataAccessSecurity.validateUserAccess(userId, resourceUserId)) {
      throw new Error('Access denied')
    }
    return getter()
  }
  
  /**
   * Get project data with access validation
   */
  static async getProjectData<T>(
    userId: string,
    projectId: string,
    getter: () => Promise<T>
  ): Promise<T> {
    if (!(await DataAccessSecurity.validateProjectAccess(userId, projectId))) {
      throw new Error('Access denied')
    }
    return getter()
  }
  
  /**
   * Get knowledge base data with access validation
   */
  static async getKnowledgeBaseData<T>(
    userId: string,
    knowledgeBaseId: string,
    getter: () => Promise<T>
  ): Promise<T> {
    if (!(await DataAccessSecurity.validateKnowledgeBaseAccess(userId, knowledgeBaseId))) {
      throw new Error('Access denied')
    }
    return getter()
  }
  
  /**
   * Create resource with user validation
   */
  static async createResource<T>(
    userId: string,
    creator: (userId: string) => Promise<T>
  ): Promise<T> {
    if (!userId) {
      throw new Error('User ID required')
    }
    return creator(userId)
  }
  
  /**
   * Update resource with ownership validation
   */
  static async updateResource<T>(
    userId: string,
    resourceId: string,
    validator: (userId: string, resourceId: string) => Promise<boolean>,
    updater: (resourceId: string) => Promise<T>
  ): Promise<T> {
    if (!(await validator(userId, resourceId))) {
      throw new Error('Access denied')
    }
    return updater(resourceId)
  }
  
  /**
   * Delete resource with ownership validation
   */
  static async deleteResource<T>(
    userId: string,
    resourceId: string,
    validator: (userId: string, resourceId: string) => Promise<boolean>,
    deleter: (resourceId: string) => Promise<T>
  ): Promise<T> {
    if (!(await validator(userId, resourceId))) {
      throw new Error('Access denied')
    }
    return deleter(resourceId)
  }
}

// Pagination helper
export class PaginationHelper {
  /**
   * Apply pagination to query results
   */
  static paginate<T>(
    data: T[],
    limit: number,
    offset: number
  ): {
    data: T[]
    pagination: {
      limit: number
      offset: number
      total: number
      hasMore: boolean
    }
  } {
    const total = data.length
    const paginatedData = data.slice(offset, offset + limit)
    const hasMore = offset + limit < total
    
    return {
      data: paginatedData,
      pagination: {
        limit,
        offset,
        total,
        hasMore
      }
    }
  }
  
  /**
   * Validate pagination parameters
   */
  static validatePagination(limit?: number, offset?: number): { limit: number; offset: number } {
    return {
      limit: Math.min(Math.max(limit || 20, 1), 100),
      offset: Math.max(offset || 0, 0)
    }
  }
}

// Error handling utilities
export class SecureErrorHandler {
  /**
   * Handle database errors securely
   */
  static handleDatabaseError(error: any): Error {
    // Don't expose internal database errors
    if (error.code === 'PGRST116') {
      return new Error('Resource not found')
    }
    if (error.code === '23505') {
      return new Error('Resource already exists')
    }
    if (error.code === '23503') {
      return new Error('Referenced resource not found')
    }
    if (error.code === '23514') {
      return new Error('Invalid data provided')
    }
    
    // Log the actual error for debugging
    console.error('Database error:', error)
    
    // Return generic error
    return new Error('Database operation failed')
  }
  
  /**
   * Handle validation errors
   */
  static handleValidationError(error: z.ZodError): Error {
    const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
    return new Error(`Validation failed: ${messages.join(', ')}`)
  }
  
  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any): Error {
    if (error.message.includes('Authentication required')) {
      return new Error('Authentication required')
    }
    if (error.message.includes('Access denied')) {
      return new Error('Access denied')
    }
    return new Error('Authentication failed')
  }
}
