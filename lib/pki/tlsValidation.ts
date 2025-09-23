/**
 * TLS Configuration Validation and Security Checks
 * Comprehensive validation for TLS settings and security compliance
 */

import tls from 'tls';
import { createHash, createHmac } from 'crypto';
import { TLSError, TLSConfig } from './types';
import { createLogger } from '../utils';

const logger = createLogger('TLS-Validation');

export interface TLSValidationResult {
  isValid: boolean;
  score: number; // 0-100 security score
  errors: string[];
  warnings: string[];
  recommendations: string[];
  compliance: {
    nist: boolean;
    owasp: boolean;
    pci: boolean;
    hipaa: boolean;
  };
}

export class TLSValidator {
  private static readonly WEAK_CIPHERS = [
    'RC4', 'DES', 'MD5', 'NULL', 'EXPORT', 'ANON', 'KRB5',
    'PSK', 'SRP', 'CAMELLIA', 'SEED', 'IDEA'
  ];

  private static readonly STRONG_CIPHERS = [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-CHACHA20-POLY1305',
    'ECDHE-RSA-AES128-GCM-SHA256'
  ];

  private static readonly SECURE_PROTOCOLS = ['TLSv1.2', 'TLSv1.3'];

  /**
   * Validate TLS configuration comprehensively
   */
  static validateTLSConfig(config: TLSConfig): TLSValidationResult {
    const result: TLSValidationResult = {
      isValid: true,
      score: 100,
      errors: [],
      warnings: [],
      recommendations: [],
      compliance: {
        nist: true,
        owasp: true,
        pci: true,
        hipaa: true
      }
    };

    // Validate minimum TLS version
    this.validateTLSVersion(config, result);

    // Validate cipher suites
    this.validateCipherSuites(config, result);

    // Validate forward secrecy
    this.validateForwardSecrecy(config, result);

    // Validate security headers
    this.validateSecurityHeaders(config, result);

    // Validate mTLS configuration
    this.validateMTLS(config, result);

    // Calculate final score
    result.score = this.calculateSecurityScore(result);
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Validate TLS version
   */
  private static validateTLSVersion(config: TLSConfig, result: TLSValidationResult): void {
    if (!config.minVersion) {
      result.errors.push('Minimum TLS version not specified');
      result.score -= 20;
      return;
    }

    if (!this.SECURE_PROTOCOLS.includes(config.minVersion)) {
      result.errors.push(`Unsupported TLS version: ${config.minVersion}`);
      result.score -= 30;
      result.compliance.nist = false;
      result.compliance.owasp = false;
      result.compliance.pci = false;
      result.compliance.hipaa = false;
    }

    if (config.minVersion === 'TLSv1.2') {
      result.warnings.push('Consider upgrading to TLS 1.3 for better security');
      result.score -= 5;
    }

    if (config.allowedProtocols) {
      const insecureProtocols = config.allowedProtocols.filter(
        p => !this.SECURE_PROTOCOLS.includes(p)
      );
      
      if (insecureProtocols.length > 0) {
        result.errors.push(`Insecure protocols allowed: ${insecureProtocols.join(', ')}`);
        result.score -= 25;
        result.compliance.nist = false;
        result.compliance.owasp = false;
        result.compliance.pci = false;
        result.compliance.hipaa = false;
      }
    }
  }

  /**
   * Validate cipher suites
   */
  private static validateCipherSuites(config: TLSConfig, result: TLSValidationResult): void {
    if (!config.ciphers) {
      result.warnings.push('No cipher suites specified, using default');
      result.score -= 10;
      return;
    }

    const configuredCiphers = config.ciphers.split(':');
    const availableCiphers = tls.getCiphers();

    // Check for weak ciphers
    const weakCiphers = configuredCiphers.filter(cipher =>
      this.WEAK_CIPHERS.some(weak => cipher.includes(weak))
    );

    if (weakCiphers.length > 0) {
      result.errors.push(`Weak ciphers detected: ${weakCiphers.join(', ')}`);
      result.score -= 30;
      result.compliance.nist = false;
      result.compliance.owasp = false;
      result.compliance.pci = false;
      result.compliance.hipaa = false;
    }

    // Check for strong ciphers
    const strongCiphers = configuredCiphers.filter(cipher =>
      this.STRONG_CIPHERS.some(strong => cipher.includes(strong))
    );

    if (strongCiphers.length === 0) {
      result.warnings.push('No strong cipher suites configured');
      result.score -= 15;
    }

    // Check for unsupported ciphers
    const unsupportedCiphers = configuredCiphers.filter(
      cipher => !availableCiphers.includes(cipher)
    );

    if (unsupportedCiphers.length > 0) {
      result.warnings.push(`Unsupported ciphers: ${unsupportedCiphers.join(', ')}`);
      result.score -= 5;
    }

    // Recommend cipher order
    if (!config.honorCipherOrder) {
      result.recommendations.push('Enable honorCipherOrder for better security');
      result.score -= 5;
    }
  }

  /**
   * Validate forward secrecy
   */
  private static validateForwardSecrecy(config: TLSConfig, result: TLSValidationResult): void {
    if (!config.enableForwardSecrecy) {
      result.warnings.push('Forward secrecy not enabled');
      result.score -= 10;
      return;
    }

    if (config.ciphers && !config.ciphers.includes('ECDHE')) {
      result.errors.push('Forward secrecy enabled but no ECDHE ciphers configured');
      result.score -= 20;
      result.compliance.nist = false;
      result.compliance.owasp = false;
    }

    // Check for DHE ciphers (less preferred than ECDHE)
    if (config.ciphers && config.ciphers.includes('DHE') && !config.ciphers.includes('ECDHE')) {
      result.warnings.push('Consider using ECDHE instead of DHE for better performance');
      result.score -= 5;
    }
  }

  /**
   * Validate security headers configuration
   */
  private static validateSecurityHeaders(config: TLSConfig, result: TLSValidationResult): void {
    // HSTS validation
    if (!config.hstsMaxAge || config.hstsMaxAge < 31536000) { // 1 year
      result.warnings.push('HSTS max-age should be at least 1 year (31536000 seconds)');
      result.score -= 5;
    }

    if (config.hstsMaxAge && config.hstsMaxAge > 63072000) { // 2 years
      result.warnings.push('HSTS max-age should not exceed 2 years');
      result.score -= 2;
    }

    // Expect-CT validation
    if (config.enableExpectCT) {
      if (!config.expectCTMaxAge || config.expectCTMaxAge < 86400) { // 1 day
        result.warnings.push('Expect-CT max-age should be at least 1 day');
        result.score -= 3;
      }

      if (config.expectCTEnforce && !config.expectCTReportUri) {
        result.warnings.push('Expect-CT enforce mode should include report-uri');
        result.score -= 2;
      }
    }
  }

  /**
   * Validate mTLS configuration
   */
  private static validateMTLS(config: TLSConfig, result: TLSValidationResult): void {
    if (!config.enableMtls) {
      return; // mTLS not enabled, no validation needed
    }

    if (!config.mtlsCaCert) {
      result.errors.push('mTLS enabled but no CA certificate provided');
      result.score -= 15;
      result.compliance.nist = false;
      result.compliance.owasp = false;
    }

    if (!config.requestCert) {
      result.warnings.push('mTLS enabled but requestCert is false');
      result.score -= 5;
    }

    if (!config.rejectUnauthorized) {
      result.warnings.push('mTLS enabled but rejectUnauthorized is false');
      result.score -= 10;
    }
  }

  /**
   * Calculate security score
   */
  private static calculateSecurityScore(result: TLSValidationResult): number {
    let score = 100;

    // Deduct points for errors
    score -= result.errors.length * 10;

    // Deduct points for warnings
    score -= result.warnings.length * 3;

    // Bonus points for strong configuration
    if (result.compliance.nist && result.compliance.owasp && result.compliance.pci) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Test TLS connection to a host
   */
  static async testTLSConnection(host: string, port: number = 443): Promise<{
    success: boolean;
    protocol: string;
    cipher: string;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const socket = tls.connect(port, host, {
        rejectUnauthorized: false, // For testing purposes
        timeout: 10000
      }, () => {
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();
        
        socket.end();
        
        resolve({
          success: true,
          protocol: protocol || 'unknown',
          cipher: cipher?.name || 'unknown'
        });
      });

      socket.on('error', (error) => {
        resolve({
          success: false,
          protocol: 'unknown',
          cipher: 'unknown',
          error: error.message
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          success: false,
          protocol: 'unknown',
          cipher: 'unknown',
          error: 'Connection timeout'
        });
      });
    });
  }

  /**
   * Generate security recommendations
   */
  static generateRecommendations(config: TLSConfig): string[] {
    const recommendations: string[] = [];

    // TLS version recommendations
    if (config.minVersion !== 'TLSv1.3') {
      recommendations.push('Upgrade to TLS 1.3 for optimal security and performance');
    }

    // Cipher recommendations
    if (!config.ciphers || !config.ciphers.includes('TLS_AES_256_GCM_SHA384')) {
      recommendations.push('Use TLS_AES_256_GCM_SHA384 as the preferred cipher suite');
    }

    // Forward secrecy recommendations
    if (!config.enableForwardSecrecy) {
      recommendations.push('Enable forward secrecy to protect past communications');
    }

    // OCSP recommendations
    if (!config.enableOcspStapling) {
      recommendations.push('Enable OCSP stapling for better performance and privacy');
    }

    // HSTS recommendations
    if (!config.hstsMaxAge || config.hstsMaxAge < 31536000) {
      recommendations.push('Set HSTS max-age to at least 1 year (31536000 seconds)');
    }

    if (!config.enableHstsPreload) {
      recommendations.push('Consider enabling HSTS preload for maximum security');
    }

    // Certificate Transparency recommendations
    if (!config.enableCertificateTransparency) {
      recommendations.push('Enable Certificate Transparency monitoring');
    }

    // Monitoring recommendations
    if (!config.enableTlsMonitoring) {
      recommendations.push('Enable TLS monitoring for security compliance');
    }

    return recommendations;
  }

  /**
   * Check for known vulnerabilities
   */
  static checkVulnerabilities(config: TLSConfig): string[] {
    const vulnerabilities: string[] = [];

    // Check for SSL/TLS vulnerabilities
    if (config.minVersion === 'TLSv1.2' && config.ciphers?.includes('CBC')) {
      vulnerabilities.push('Potential BEAST attack vulnerability with CBC ciphers in TLS 1.2');
    }

    if (config.ciphers?.includes('RC4')) {
      vulnerabilities.push('RC4 cipher is vulnerable to statistical attacks');
    }

    if (config.ciphers?.includes('DES')) {
      vulnerabilities.push('DES cipher is cryptographically weak');
    }

    if (config.ciphers?.includes('MD5')) {
      vulnerabilities.push('MD5 hash function is vulnerable to collision attacks');
    }

    // Check for protocol vulnerabilities
    if (config.allowedProtocols?.includes('SSLv3')) {
      vulnerabilities.push('SSLv3 is vulnerable to POODLE attack');
    }

    if (config.allowedProtocols?.includes('TLSv1.0')) {
      vulnerabilities.push('TLS 1.0 is vulnerable to BEAST attack');
    }

    if (config.allowedProtocols?.includes('TLSv1.1')) {
      vulnerabilities.push('TLS 1.1 is vulnerable to BEAST attack');
    }

    return vulnerabilities;
  }

  /**
   * Generate compliance report
   */
  static generateComplianceReport(config: TLSConfig): {
    nist: { compliant: boolean; issues: string[] };
    owasp: { compliant: boolean; issues: string[] };
    pci: { compliant: boolean; issues: string[] };
    hipaa: { compliant: boolean; issues: string[] };
  } {
    const validation = this.validateTLSConfig(config);
    
    return {
      nist: {
        compliant: validation.compliance.nist,
        issues: validation.compliance.nist ? [] : ['TLS configuration does not meet NIST guidelines']
      },
      owasp: {
        compliant: validation.compliance.owasp,
        issues: validation.compliance.owasp ? [] : ['TLS configuration does not meet OWASP guidelines']
      },
      pci: {
        compliant: validation.compliance.pci,
        issues: validation.compliance.pci ? [] : ['TLS configuration does not meet PCI DSS requirements']
      },
      hipaa: {
        compliant: validation.compliance.hipaa,
        issues: validation.compliance.hipaa ? [] : ['TLS configuration does not meet HIPAA requirements']
      }
    };
  }
}

/**
 * Quick TLS configuration validation
 */
export function quickValidateTLS(config: TLSConfig): boolean {
  const result = TLSValidator.validateTLSConfig(config);
  return result.isValid && result.score >= 80;
}

/**
 * Get TLS security score
 */
export function getTLSSecurityScore(config: TLSConfig): number {
  const result = TLSValidator.validateTLSConfig(config);
  return result.score;
}
