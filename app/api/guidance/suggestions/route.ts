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

// Schema for suggestions request
const SuggestionsRequestSchema = z.object({
  input: z.string().min(1).max(1000),
  category: z.enum(['code', 'optimization', 'security', 'performance', 'architecture']).optional(),
  context: z.object({
    language: z.string().optional(),
    framework: z.string().optional(),
    projectType: z.string().optional()
  }).optional()
})

// Rate limiter for suggestions
const rateLimiter = new SecureRateLimiter()

// Initialize Guidance connector
async function initializeGuidanceConnector() {
  const config: ConnectorConfig = {
    id: 'guidance-suggestions',
    name: 'Guidance Smart Suggestions',
    type: 'api',
    direction: 'bidirectional',
    protocol: 'http',
    auth: { type: 'none' },
    rateLimit: { requests: 50, period: 900, strategy: 'sliding' },
    retry: { maxAttempts: 3, backoff: 'exponential', baseDelay: 1000 },
    timeout: 30000,
    healthCheck: { enabled: true, interval: 60 }
  }

  const guidanceConfig: GuidanceConnectorConfig = {
    ...config,
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

  return new GuidanceConnector(guidanceConfig)
}

function validateSecurity(request: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  try {
    EnhancedValidator.validateRequest(request)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Validation error')
  }

  const requestString = JSON.stringify(request)

  if (requestString.length > SECURITY_CONFIG.MAX_INPUT_LENGTH * 2) {
    errors.push('Request payload too large')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting
    const rateLimit = rateLimiter.checkRateLimit(ip, userAgent)
    if (!rateLimit.allowed) {
      SecureLogger.logSecurityEvent('rate_limit_exceeded', {
        ip,
        userAgent,
        reason: rateLimit.reason
      }, ip, userAgent)

      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            ...SecurityHeaders.getHeaders(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Parse request body
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
        { error: 'Invalid JSON in request body' },
        { 
          status: 400,
          headers: SecurityHeaders.getHeaders()
        }
      )
    }

    // Security validation
    const securityValidation = validateSecurity(body)
    if (!securityValidation.valid) {
      SecureLogger.logSecurityEvent('security_validation_failed', {
        errors: securityValidation.errors,
        ip,
        userAgent
      }, ip, userAgent)

      return NextResponse.json(
        { error: 'Security validation failed', details: securityValidation.errors },
        { 
          status: 400,
          headers: SecurityHeaders.getHeaders()
        }
      )
    }

    // Schema validation
    const validationResult = SuggestionsRequestSchema.safeParse(body)
    if (!validationResult.success) {
      SecureLogger.logSecurityEvent('schema_validation_failed', {
        errors: validationResult.error.errors,
        ip,
        userAgent
      }, ip, userAgent)

      return NextResponse.json(
        { error: 'Invalid request schema', details: validationResult.error.errors },
        { 
          status: 400,
          headers: SecurityHeaders.getHeaders()
        }
      )
    }

    const { input, category, context } = validationResult.data

    // Generate suggestions using Guidance Engine
    const connector = await initializeGuidanceConnector()
    
    // Create a comprehensive analysis request
    const analysisRequest = {
      language: context?.language || 'typescript',
      framework: context?.framework || 'react',
      purpose: 'code_improvement',
      requirements: [
        `Analyze the following input and provide smart suggestions: ${input}`,
        'Focus on code quality, performance, security, and best practices',
        'Provide actionable recommendations with implementation details',
        'Include confidence scores and impact assessments'
      ],
      securityLevel: 'high' as const,
      accessibility: true,
      testing: true,
      documentation: true
    }

    const result = await connector.generateCode(analysisRequest as any)

    // Transform the result into structured suggestions
    const suggestions = transformToSuggestions(result, category)

    SecureLogger.logSecurityEvent('suggestions_generated', {
      inputLength: input.length,
      category,
      suggestionsCount: suggestions.length,
      executionTime: Date.now() - startTime
    }, ip, userAgent)

    return NextResponse.json(
      {
        success: true,
        suggestions,
        metadata: {
          requestId,
          executionTime: Date.now() - startTime,
          category,
          inputLength: input.length,
          suggestionsCount: suggestions.length
        }
      },
      {
        status: 200,
        headers: SecurityHeaders.getHeaders()
      }
    )

  } catch (error) {
    SecureLogger.logError(error as Error, {
      requestId,
      executionTime: Date.now() - startTime
    }, request.headers.get('x-forwarded-for') || 'unknown')

    return NextResponse.json(
      { 
        error: 'Internal server error',
        requestId
      },
      { 
        status: 500,
        headers: SecurityHeaders.getHeaders()
      }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      service: 'Guidance Smart Suggestions API',
      version: '1.0.0',
      description: 'AI-powered smart suggestions for code improvement',
      endpoints: {
        POST: '/api/guidance/suggestions - Generate smart suggestions'
      },
      features: [
        'Code quality suggestions',
        'Performance optimization recommendations',
        'Security best practices',
        'Architecture improvements',
        'Accessibility enhancements'
      ]
    },
    {
      status: 200,
      headers: SecurityHeaders.getHeaders()
    }
  )
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = ['http://localhost:3000', 'https://defconect.com']

  return new NextResponse(null, {
    status: 200,
    headers: {
      ...SecurityHeaders.getHeaders(),
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin || '*' : 'null',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Max-Age': '86400'
    }
  })
}

// Transform Guidance Engine result into structured suggestions
function transformToSuggestions(result: any, category?: string): any[] {
  // This is a simplified transformation - in a real implementation,
  // you would parse the Guidance Engine output and structure it properly
  
  const suggestions = [
    {
      id: "1",
      type: "code",
      title: "Implement TypeScript Strict Mode",
      description: "Enable strict mode for better type safety and catch potential runtime errors",
      confidence: 0.95,
      impact: "high",
      effort: "medium",
      category: "code",
      tags: ["typescript", "type-safety", "best-practices"],
      benefits: [
        "Prevents null/undefined errors",
        "Improves code maintainability",
        "Better IDE support and autocomplete"
      ],
      implementation: "Add 'strict': true to tsconfig.json"
    },
    {
      id: "2",
      type: "performance",
      title: "Optimize Bundle Size with Tree Shaking",
      description: "Remove unused code from your bundle to improve loading performance",
      confidence: 0.88,
      impact: "high",
      effort: "low",
      category: "performance",
      tags: ["bundle", "optimization", "webpack"],
      benefits: [
        "Reduces bundle size by 20-40%",
        "Faster page load times",
        "Better Core Web Vitals scores"
      ]
    },
    {
      id: "3",
      type: "security",
      title: "Implement Content Security Policy",
      description: "Add CSP headers to prevent XSS attacks and improve security posture",
      confidence: 0.92,
      impact: "critical",
      effort: "medium",
      category: "security",
      tags: ["security", "csp", "xss-prevention"],
      benefits: [
        "Prevents XSS attacks",
        "Complies with security standards",
        "Protects user data"
      ]
    }
  ]

  // Filter by category if specified
  if (category && category !== 'all') {
    return suggestions.filter(s => s.category === category)
  }

  return suggestions
}
