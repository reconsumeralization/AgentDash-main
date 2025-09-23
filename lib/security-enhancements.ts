/**
 * Enhanced Security System for AgentDash
 * Comprehensive security utilities including input validation, sanitization, and threat detection
 */

import { NextRequest, NextResponse } from 'next/server'
import { ErrorHandler, ErrorCategory, ErrorSeverity } from './error-handling'

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

export interface SecurityConfig {
  enableRateLimit: boolean
  enableCSRFProtection: boolean
  enableXSSProtection: boolean
  enableSQLInjectionProtection: boolean
  enableInputSanitization: boolean
  enableThreatDetection: boolean
  maxRequestSize: number
  allowedOrigins: string[]
  blockedIPs: string[]
  suspiciousPatterns: RegExp[]
}

export const defaultSecurityConfig: SecurityConfig = {
  enableRateLimit: true,
  enableCSRFProtection: true,
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enableInputSanitization: true,
  enableThreatDetection: true,
  maxRequestSize: 1024 * 1024, // 1MB
  allowedOrigins: ['http://localhost:3000', 'https://yourdomain.com'],
  blockedIPs: [],
  suspiciousPatterns: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+set/gi
  ]
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

export class InputSanitizer {
  private config: SecurityConfig

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config
  }

  sanitizeString(input: string): string {
    if (!this.config.enableInputSanitization) return input

    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
  }

  sanitizeObject(obj: any): any {
    if (!this.config.enableInputSanitization) return obj

    if (typeof obj === 'string') {
      return this.sanitizeString(obj)
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item))
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value)
      }
      return sanitized
    }

    return obj
  }

  validateInput(input: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (this.config.enableXSSProtection) {
      const inputStr = JSON.stringify(input)
      for (const pattern of this.config.suspiciousPatterns) {
        if (pattern.test(inputStr)) {
          errors.push(`Suspicious pattern detected: ${pattern.source}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// ============================================================================
// THREAT DETECTION
// ============================================================================

export class ThreatDetector {
  private config: SecurityConfig
  private errorHandler: ErrorHandler

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config
    this.errorHandler = ErrorHandler.getInstance()
  }

  async detectThreats(request: NextRequest): Promise<{
    isThreat: boolean
    threatLevel: 'low' | 'medium' | 'high' | 'critical'
    threats: string[]
  }> {
    const threats: string[] = []
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Check request size
    const contentLength = parseInt(request.headers.get('content-length') || '0')
    if (contentLength > this.config.maxRequestSize) {
      threats.push('Request size exceeds limit')
      threatLevel = 'high'
    }

    // Check for suspicious patterns in URL
    const url = request.url
    for (const pattern of this.config.suspiciousPatterns) {
      if (pattern.test(url)) {
        threats.push(`Suspicious URL pattern: ${pattern.source}`)
        threatLevel = 'high'
      }
    }

    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip']
    for (const header of suspiciousHeaders) {
      const value = request.headers.get(header)
      if (value && this.isSuspiciousIP(value)) {
        threats.push(`Suspicious IP in header ${header}: ${value}`)
        threatLevel = 'medium'
      }
    }

    // Check for blocked IPs
    const clientIP = this.getClientIP(request)
    if (this.config.blockedIPs.includes(clientIP)) {
      threats.push(`Blocked IP address: ${clientIP}`)
      threatLevel = 'critical'
    }

    // Log threats
    if (threats.length > 0) {
      await this.errorHandler.logError(new Error(`Threat detected: ${threats.join(', ')}`), {
        category: ErrorCategory.SECURITY,
        severity: this.getSeverityFromThreatLevel(threatLevel),
        context: {
          url: request.url,
          method: request.method,
          clientIP,
          threats
        }
      })
    }

    return {
      isThreat: threats.length > 0,
      threatLevel,
      threats
    }
  }

  private isSuspiciousIP(ip: string): boolean {
    // Check for private IPs, localhost, etc.
    const suspiciousPatterns = [
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^::1$/,
      /^fe80:/
    ]

    return suspiciousPatterns.some(pattern => pattern.test(ip))
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const originatingIP = request.headers.get('x-originating-ip')

    return forwarded || realIP || originatingIP || 'unknown'
  }

  private getSeverityFromThreatLevel(level: string): ErrorSeverity {
    switch (level) {
      case 'low': return ErrorSeverity.LOW
      case 'medium': return ErrorSeverity.MEDIUM
      case 'high': return ErrorSeverity.HIGH
      case 'critical': return ErrorSeverity.CRITICAL
      default: return ErrorSeverity.MEDIUM
    }
  }
}

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

export class SecurityMiddleware {
  private config: SecurityConfig
  private sanitizer: InputSanitizer
  private threatDetector: ThreatDetector

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config
    this.sanitizer = new InputSanitizer(config)
    this.threatDetector = new ThreatDetector(config)
  }

  async middleware(request: NextRequest): Promise<NextResponse | null> {
    // Threat detection
    if (this.config.enableThreatDetection) {
      const threatResult = await this.threatDetector.detectThreats(request)
      if (threatResult.isThreat) {
        return this.createSecurityResponse(threatResult.threatLevel, threatResult.threats)
      }
    }

    // CORS validation
    if (this.config.allowedOrigins.length > 0) {
      const origin = request.headers.get('origin')
      if (origin && !this.config.allowedOrigins.includes(origin)) {
        return this.createSecurityResponse('high', ['Unauthorized origin'])
      }
    }

    return null // No security issues detected
  }

  private createSecurityResponse(threatLevel: string, threats: string[]): NextResponse {
    const status = this.getStatusFromThreatLevel(threatLevel)
    const message = `Security violation detected: ${threats.join(', ')}`

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: message,
        threatLevel,
        timestamp: new Date().toISOString()
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Violation': 'true'
        }
      }
    )
  }

  private getStatusFromThreatLevel(level: string): number {
    switch (level) {
      case 'low': return 400
      case 'medium': return 403
      case 'high': return 429
      case 'critical': return 451
      default: return 400
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const securityMiddleware = new SecurityMiddleware()
export const inputSanitizer = new InputSanitizer()
export const threatDetector = new ThreatDetector()
