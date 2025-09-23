/**
 * TLS Security Middleware for Next.js
 * HTTP Strict Transport Security (HSTS), security headers, and TLS enforcement
 */

import { NextRequest, NextResponse } from 'next/server';
import { pkiConfig } from './config';
import { createLogger } from '../utils';

const logger = createLogger('TLS-Middleware');

export interface SecurityHeadersConfig {
  enableHSTS?: boolean;
  enableExpectCT?: boolean;
  enableCSP?: boolean;
  enableHPKP?: boolean;
  customHeaders?: Record<string, string>;
}

/**
 * TLS Security Middleware for Next.js
 * Handles HTTPS redirects, HSTS, and security headers
 */
export function tlsMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const tlsConfig = pkiConfig.tls!;

  // Check if request is over HTTPS
  const isHTTPS = request.headers.get('x-forwarded-proto') === 'https' || 
                  request.url.startsWith('https://');

  // Force HTTPS redirect for non-HTTPS requests
  if (!isHTTPS && !isLocalhost(request.url)) {
    const httpsUrl = request.url.replace('http://', 'https://');
    logger.debug(`Redirecting to HTTPS: ${httpsUrl}`);
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Add security headers
  addSecurityHeaders(response, tlsConfig);

  return response;
}

/**
 * Add comprehensive security headers
 */
export function addSecurityHeaders(response: NextResponse, tlsConfig: any): void {
  // HSTS (HTTP Strict Transport Security)
  if (tlsConfig.hstsMaxAge) {
    const hstsValue = `max-age=${tlsConfig.hstsMaxAge}; includeSubDomains${tlsConfig.enableHstsPreload ? '; preload' : ''}`;
    response.headers.set('Strict-Transport-Security', hstsValue);
    logger.debug('HSTS header added');
  }

  // Expect-CT (Certificate Transparency)
  if (tlsConfig.enableExpectCT) {
    const expectCTValue = `max-age=${tlsConfig.expectCTMaxAge}${tlsConfig.expectCTEnforce ? ', enforce' : ''}${tlsConfig.expectCTReportUri ? `, report-uri="${tlsConfig.expectCTReportUri}"` : ''}`;
    response.headers.set('Expect-CT', expectCTValue);
    logger.debug('Expect-CT header added');
  }

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  logger.debug('Security headers added');
}

/**
 * Express.js middleware for TLS security
 */
export function expressTlsMiddleware(req: any, res: any, next: any): void {
  const tlsConfig = pkiConfig.tls!;

  // Check if request is over HTTPS
  const isHTTPS = req.secure || 
                  req.headers['x-forwarded-proto'] === 'https' ||
                  req.connection?.encrypted;

  // Force HTTPS redirect for non-HTTPS requests
  if (!isHTTPS && !isLocalhost(req.url)) {
    const httpsUrl = `https://${req.get('host')}${req.url}`;
    logger.debug(`Redirecting to HTTPS: ${httpsUrl}`);
    return res.redirect(301, httpsUrl);
  }

  // Add security headers
  addExpressSecurityHeaders(res, tlsConfig);

  next();
}

/**
 * Add security headers for Express.js
 */
export function addExpressSecurityHeaders(res: any, tlsConfig: any): void {
  // HSTS
  if (tlsConfig.hstsMaxAge) {
    const hstsValue = `max-age=${tlsConfig.hstsMaxAge}; includeSubDomains${tlsConfig.enableHstsPreload ? '; preload' : ''}`;
    res.setHeader('Strict-Transport-Security', hstsValue);
  }

  // Expect-CT
  if (tlsConfig.enableExpectCT) {
    const expectCTValue = `max-age=${tlsConfig.expectCTMaxAge}${tlsConfig.expectCTEnforce ? ', enforce' : ''}${tlsConfig.expectCTReportUri ? `, report-uri="${tlsConfig.expectCTReportUri}"` : ''}`;
    res.setHeader('Expect-CT', expectCTValue);
  }

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
}

/**
 * Check if URL is localhost (for development)
 */
function isLocalhost(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'localhost' || 
           urlObj.hostname === '127.0.0.1' || 
           urlObj.hostname === '::1';
  } catch {
    return false;
  }
}

/**
 * HSTS Preload submission utility
 */
export class HSTSPreloadService {
  private static readonly PRELOAD_URL = 'https://hstspreload.org/api/v2/submit';
  private static readonly STATUS_URL = 'https://hstspreload.org/api/v2/status';

  /**
   * Submit domain to HSTS preload list
   */
  static async submitDomain(domain: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(this.PRELOAD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain,
          includeSubDomains: true,
          preload: true
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        logger.info(`Domain ${domain} submitted to HSTS preload list`);
        return { success: true, message: result.message || 'Domain submitted successfully' };
      } else {
        logger.error(`HSTS preload submission failed for ${domain}:`, result);
        return { success: false, message: result.message || 'Submission failed' };
      }
    } catch (error) {
      logger.error(`HSTS preload submission error for ${domain}:`, error);
      return { 
        success: false, 
        message: `Submission error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Check domain status in HSTS preload list
   */
  static async checkDomainStatus(domain: string): Promise<{ 
    isPreloaded: boolean; 
    status: string; 
    message?: string 
  }> {
    try {
      const response = await fetch(`${this.STATUS_URL}?domain=${encodeURIComponent(domain)}`);
      const result = await response.json();
      
      if (response.ok) {
        return {
          isPreloaded: result.status === 'preloaded',
          status: result.status,
          message: result.message
        };
      } else {
        return {
          isPreloaded: false,
          status: 'error',
          message: result.message || 'Status check failed'
        };
      }
    } catch (error) {
      logger.error(`HSTS preload status check error for ${domain}:`, error);
      return {
        isPreloaded: false,
        status: 'error',
        message: `Status check error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate domain for HSTS preload eligibility
   */
  static validateDomainForPreload(domain: string): { 
    isValid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];

    // Check domain format
    if (!domain || typeof domain !== 'string') {
      errors.push('Domain is required');
      return { isValid: false, errors };
    }

    // Check for valid domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
      errors.push('Invalid domain format');
    }

    // Check domain length
    if (domain.length > 253) {
      errors.push('Domain too long (max 253 characters)');
    }

    // Check for localhost/development domains
    if (domain.includes('localhost') || domain.includes('127.0.0.1') || domain.includes('::1')) {
      errors.push('Localhost domains cannot be preloaded');
    }

    // Check for IP addresses
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipRegex.test(domain)) {
      errors.push('IP addresses cannot be preloaded');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Certificate Transparency monitoring
 */
export class CertificateTransparencyService {
  private static readonly CT_LOG_URLS = [
    'https://ct.googleapis.com/logs/argon2024/ct/v1/get-sth',
    'https://ct.googleapis.com/logs/xenon2024/ct/v1/get-sth',
    'https://crt.sh/ct/v1/get-sth'
  ];

  /**
   * Monitor certificate transparency logs for domain
   */
  static async monitorDomain(domain: string): Promise<{
    certificates: Array<{
      id: string;
      issuer: string;
      notBefore: Date;
      notAfter: Date;
      serialNumber: string;
    }>;
    lastChecked: Date;
  }> {
    try {
      // This would integrate with CT log APIs
      // For now, return a placeholder structure
      logger.info(`Monitoring CT logs for domain: ${domain}`);
      
      return {
        certificates: [],
        lastChecked: new Date()
      };
    } catch (error) {
      logger.error(`CT monitoring error for ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Check if certificate is in CT logs
   */
  static async isCertificateInCTLogs(certificate: string): Promise<boolean> {
    try {
      // This would check CT logs for the certificate
      // For now, return false as placeholder
      logger.debug('Checking certificate in CT logs');
      return false;
    } catch (error) {
      logger.error('CT log check error:', error);
      return false;
    }
  }
}

/**
 * Create Next.js middleware configuration
 */
export const middlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

/**
 * Export middleware for Next.js
 */
export { tlsMiddleware as middleware } from './tlsMiddleware';
