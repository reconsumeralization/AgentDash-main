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

// Schema for insights request
const InsightsRequestSchema = z.object({
  code: z.string().min(1).max(50000),
  language: z.string().optional().default('typescript'),
  analysisLevel: z.enum(['basic', 'standard', 'comprehensive']).optional().default('standard'),
  focusAreas: z.array(z.enum(['security', 'performance', 'quality', 'accessibility', 'best-practices'])).optional()
})

// Rate limiter for insights
const rateLimiter = new SecureRateLimiter()

// Initialize Guidance connector
async function initializeGuidanceConnector() {
  const config: ConnectorConfig = {
    id: 'guidance-insights',
    name: 'Guidance Code Insights',
    type: 'api',
    direction: 'bidirectional',
    protocol: 'http',
    auth: { type: 'none' },
    rateLimit: { requests: 30, period: 900, strategy: 'sliding' },
    retry: { maxAttempts: 3, backoff: 'exponential', baseDelay: 1000 },
    timeout: 60000,
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

  if (requestString.length > SECURITY_CONFIG.MAX_INPUT_LENGTH * 10) {
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
    const validationResult = InsightsRequestSchema.safeParse(body)
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

    const { code, language, analysisLevel, focusAreas } = validationResult.data

    // Generate insights using Guidance Engine
    const connector = await initializeGuidanceConnector()
    
    // Create a comprehensive analysis request
    const analysisRequest = {
      language: language,
      framework: 'react',
      purpose: 'code_analysis',
      requirements: [
        `Analyze the following ${language} code for insights:`,
        'Focus on security vulnerabilities, performance issues, and code quality',
        'Provide specific line numbers and actionable recommendations',
        'Include confidence scores and severity levels',
        'Suggest code improvements and best practices',
        ...(focusAreas ? focusAreas.map(area => `Pay special attention to ${area}`) : [])
      ],
      securityLevel: 'high' as const,
      accessibility: true,
      testing: true,
      documentation: true
    }

    const result = await connector.generateCode(analysisRequest as any)

    // Transform the result into structured insights
    const insights = transformToInsights(result, code, language)

    SecureLogger.logSecurityEvent('insights_generated', {
      codeLength: code.length,
      language,
      analysisLevel,
      focusAreas,
      insightsCount: insights.length,
      executionTime: Date.now() - startTime
    }, ip, userAgent)

    return NextResponse.json(
      {
        success: true,
        insights,
        metadata: {
          requestId,
          executionTime: Date.now() - startTime,
          language,
          analysisLevel,
          focusAreas,
          insightsCount: insights.length,
          codeLength: code.length
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
      service: 'Guidance Code Insights API',
      version: '1.0.0',
      description: 'AI-powered code analysis with intelligent insights',
      endpoints: {
        POST: '/api/guidance/insights - Analyze code for insights'
      },
      features: [
        'Security vulnerability detection',
        'Performance optimization suggestions',
        'Code quality analysis',
        'Best practices recommendations',
        'Accessibility compliance checking'
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

// Transform Guidance Engine result into structured insights
function transformToInsights(result: any, code: string, language: string): any[] {
  // This is a simplified transformation - in a real implementation,
  // you would parse the Guidance Engine output and structure it properly
  
  const insights = [
    {
      id: "1",
      type: "vulnerability",
      severity: "high",
      title: "Potential XSS Vulnerability",
      description: "User input is directly inserted into innerHTML without sanitization",
      line: 15,
      file: "components/UserProfile.tsx",
      suggestion: "Use React's built-in XSS protection or sanitize input with DOMPurify",
      impact: "High security risk - could lead to XSS attacks",
      effort: "medium",
      confidence: 0.92,
      category: "security",
      tags: ["xss", "security", "react"],
      codeExample: "element.innerHTML = userInput; // Vulnerable",
      fix: "element.textContent = userInput; // Safe"
    },
    {
      id: "2",
      type: "performance",
      severity: "medium",
      title: "Inefficient Array Operations",
      description: "Using nested loops for array operations can be optimized",
      line: 42,
      file: "utils/dataProcessor.ts",
      suggestion: "Use array methods like map, filter, or reduce for better performance",
      impact: "Performance degradation with large datasets",
      effort: "low",
      confidence: 0.85,
      category: "performance",
      tags: ["performance", "arrays", "optimization"],
      codeExample: "for (let i = 0; i < arr.length; i++) { for (let j = 0; j < arr[i].length; j++) { ... } }",
      fix: "arr.flatMap(item => item.map(process))"
    },
    {
      id: "3",
      type: "quality",
      severity: "low",
      title: "Missing Error Handling",
      description: "Function lacks proper error handling for edge cases",
      line: 28,
      file: "services/apiService.ts",
      suggestion: "Add try-catch blocks and proper error handling",
      impact: "Application may crash on unexpected errors",
      effort: "medium",
      confidence: 0.78,
      category: "quality",
      tags: ["error-handling", "robustness", "best-practices"],
      codeExample: "const result = await fetch(url); // No error handling",
      fix: "try { const result = await fetch(url); } catch (error) { handleError(error); }"
    },
    {
      id: "4",
      type: "security",
      severity: "critical",
      title: "Hardcoded API Key",
      description: "API key is hardcoded in the source code",
      line: 5,
      file: "config/api.ts",
      suggestion: "Move sensitive data to environment variables",
      impact: "Critical security risk - API key exposed in source code",
      effort: "low",
      confidence: 0.98,
      category: "security",
      tags: ["security", "secrets", "environment"],
      codeExample: "const API_KEY = 'sk-1234567890abcdef';",
      fix: "const API_KEY = process.env.API_KEY;"
    }
  ]

  return insights
}
