/**
 * 🚀 GUIDANCE API - Enterprise Code Generation Endpoint
 * Provides secure, high-quality code generation with comprehensive analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GuidanceConnector, GuidanceConnectorConfig } from '@/connectors/guidance-connector'
import { ConnectorConfig } from '@/connectors/base-connector'
import { 
  SecurityValidator, 
  SecureRateLimiter, 
  SecureLogger, 
  CSRFProtection, 
  EnhancedValidator,
  SecurityHeaders,
  ContentSecurityPolicy,
  SECURITY_CONFIG
} from '@/lib'

// Request validation schema
const CodeGenerationRequestSchema = z.object({
  language: z.enum(['typescript', 'javascript', 'python', 'java', 'go']).default('typescript'),
  framework: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  securityLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  performanceRequirements: z.object({
    maxLatency: z.number().positive().optional(),
    memoryLimit: z.number().positive().optional(),
    cpuLimit: z.number().min(1).max(100).optional()
  }).optional(),
  accessibility: z.boolean().default(true),
  testing: z.boolean().default(true),
  documentation: z.boolean().default(true),
  context: z.object({
    userId: z.string().optional(),
    projectId: z.string().optional(),
    environment: z.enum(['development', 'staging', 'production']).default('development')
  }).optional()
})

// Enhanced rate limiter with security features
const rateLimiter = new SecureRateLimiter()

// Guidance connector instance
let guidanceConnector: GuidanceConnector | null = null

/**
 * Initialize Guidance Connector
 */
async function initializeGuidanceConnector(): Promise<GuidanceConnector> {
  if (!guidanceConnector) {
    const config: GuidanceConnectorConfig = {
      id: 'guidance-connector',
      name: 'Guidance Code Generation Connector',
      type: 'api',
      direction: 'bidirectional',
      protocol: 'http',
      auth: { type: 'none' },
      rateLimit: { requests: 100, period: 900, strategy: 'sliding' },
      retry: { maxAttempts: 3, backoff: 'exponential', baseDelay: 1000 },
      timeout: 300000,
      healthCheck: { enabled: true, interval: 60 },
      guidanceConfig: {
        defaultLanguage: 'typescript',
        securityLevel: 'high',
        enableSecurityAnalysis: true,
        enableQualityMetrics: true,
        enablePerformanceOptimization: true,
        enableAccessibility: true,
        enableTesting: true,
        enableDocumentation: true
      }
    }

    guidanceConnector = new GuidanceConnector(config)
    await guidanceConnector.connect()
  }

  return guidanceConnector
}

/**
 * Enhanced security validation
 */
function validateSecurity(request: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    // Use enhanced validator
    EnhancedValidator.validateRequest(request)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Validation error')
  }
  
  // Additional security checks
  const requestString = JSON.stringify(request)
  
  // Check for suspicious patterns
  if (requestString.length > SECURITY_CONFIG.MAX_INPUT_LENGTH * 2) {
    errors.push('Request payload too large')
  }
  
  // Check for potential DoS patterns
  if (request.requirements && request.requirements.length > SECURITY_CONFIG.MAX_REQUIREMENTS) {
    errors.push('Too many requirements specified')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}


/**
 * POST /api/guidance/generate
 * Generate enterprise-grade code with comprehensive analysis
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Get client information for security
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // Enhanced rate limiting with security features
    const rateLimit = rateLimiter.checkRateLimit(ip, userAgent)
    if (!rateLimit.allowed) {
      SecureLogger.logSecurityEvent('rate_limit_exceeded', {
        ip,
        userAgent,
        reason: rateLimit.reason
      }, ip, userAgent)
      
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          requestId,
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            ...SecurityHeaders.getHeaders()
          }
        }
      )
    }
    
    // Parse and validate request body with enhanced security
    let body
    try {
      body = await request.json()
    } catch (error) {
      SecureLogger.logSecurityEvent('invalid_json', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip,
        userAgent
      }, ip, userAgent)
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          requestId
        },
        { 
          status: 400,
          headers: SecurityHeaders.getHeaders()
        }
      )
    }
    
    // Enhanced security validation
    const securityValidation = validateSecurity(body)
    if (!securityValidation.valid) {
      SecureLogger.logSecurityEvent('security_validation_failed', {
        errors: securityValidation.errors,
        ip,
        userAgent,
        body: JSON.stringify(body).substring(0, 500)
      }, ip, userAgent)
      
      return NextResponse.json(
        {
          success: false,
          error: 'Security validation failed',
          details: securityValidation.errors,
          requestId
        },
        { 
          status: 400,
          headers: SecurityHeaders.getHeaders()
        }
      )
    }
    
    // Validate request schema
    const validationResult = CodeGenerationRequestSchema.safeParse(body)
    if (!validationResult.success) {
      SecureLogger.logSecurityEvent('schema_validation_failed', {
        errors: validationResult.error.errors,
        ip,
        userAgent
      }, ip, userAgent)
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: validationResult.error.errors,
          requestId
        },
        { 
          status: 400,
          headers: SecurityHeaders.getHeaders()
        }
      )
    }
    
    const validatedRequest = validationResult.data
    
    // Initialize Guidance Connector
    const connector = await initializeGuidanceConnector()
    
    // Generate code with proper type casting
    const result = await connector.generateCode(validatedRequest as any)
    
    // Calculate processing time
    const processingTime = Date.now() - startTime
    
    // Create response
    const response = {
      success: true,
      data: result.data,
      requestId,
      timestamp: new Date().toISOString(),
      processingTime,
      metrics: {
        ...result.metrics,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      }
    }
    
    // Log successful generation
    console.log(`✅ Code generation successful: ${requestId}`, {
      language: validatedRequest.language,
      purpose: validatedRequest.purpose,
      requirements: validatedRequest.requirements.length,
      processingTime,
      securityScore: result.data?.security.score,
      qualityScore: result.data?.quality.maintainabilityIndex,
      performanceScore: result.data?.performance.score
    })
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        'X-Request-ID': requestId,
        'X-Processing-Time': processingTime.toString(),
        ...SecurityHeaders.getHeaders()
      }
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Log error securely
    SecureLogger.logError(error as Error, {
      requestId,
      processingTime,
      ip,
      userAgent
    }, ip)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        requestId,
        timestamp: new Date().toISOString(),
        processingTime
      },
      { 
        status: 500,
        headers: SecurityHeaders.getHeaders()
      }
    )
  }
}

/**
 * GET /api/guidance/generate
 * Get guidance system information and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    const connector = await initializeGuidanceConnector()
    const stats = await connector.getGenerationStats()
    
    return NextResponse.json({
      success: true,
      data: {
        system: 'Guidance Engine',
        version: '1.0.0',
        status: 'operational',
        features: [
          'Security Analysis',
          'Quality Metrics',
          'Performance Optimization',
          'Accessibility Compliance',
          'Comprehensive Testing',
          'Documentation Generation',
          'Alternative Implementations',
          'Dependency Analysis'
        ],
        statistics: stats,
        rateLimit: {
          windowMs: SECURITY_CONFIG.RATE_LIMIT_WINDOW,
          maxRequests: SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW
        }
      },
      timestamp: new Date().toISOString()
    }, {
      headers: SecurityHeaders.getHeaders()
    })
    
  } catch (error) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    SecureLogger.logError(error as Error, {
      endpoint: 'GET /api/guidance/generate',
      ip,
      userAgent
    }, ip)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve system information',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: SecurityHeaders.getHeaders()
      }
    )
  }
}

/**
 * OPTIONS /api/guidance/generate
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  // Validate origin for CORS
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    // Add your production domains here
  ]
  
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID, X-CSRF-Token',
    'Access-Control-Max-Age': '86400',
    ...SecurityHeaders.getHeaders()
  }
  
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
  } else {
    corsHeaders['Access-Control-Allow-Origin'] = '*'
  }
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  })
}
