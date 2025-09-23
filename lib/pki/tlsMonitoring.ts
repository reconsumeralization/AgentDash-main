/**
 * TLS Monitoring and Vulnerability Scanning
 * Comprehensive monitoring for TLS security and compliance
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { TLSError, TLSMonitoringMetrics } from './types';
import { createLogger } from '../utils';

const execAsync = promisify(exec);
const logger = create Logger('TLS-Monitoring');

export interface VulnerabilityScanResult {
  host: string;
  port: number;
  timestamp: Date;
  vulnerabilities: Vulnerability[];
  score: number; // 0-100 security score
  recommendations: string[];
}

export interface Vulnerability {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  cve?: string;
  remediation: string;
  references: string[];
}

export interface TLSHealthCheck {
  host: string;
  port: number;
  timestamp: Date;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  issues: string[];
  metrics: TLSMonitoringMetrics;
}

export class TLSMonitor {
  private scanResults: Map<string, VulnerabilityScanResult> = new Map();
  private healthChecks: Map<string, TLSHealthCheck> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(private config: {
    scanInterval?: number;
    healthCheckInterval?: number;
    enableExternalScans?: boolean;
    alertThreshold?: number;
  } = {}) {
    this.config = {
      scanInterval: config.scanInterval || 3600000, // 1 hour
      healthCheckInterval: config.healthCheckInterval || 300000, // 5 minutes
      enableExternalScans: config.enableExternalScans || false,
      alertThreshold: config.alertThreshold || 70, // Alert if score below 70
    };
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(hosts: string[]): void {
    logger.info('Starting TLS monitoring for hosts:', hosts);

    // Start health checks
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks(hosts);
    }, this.config.healthCheckInterval);

    // Start vulnerability scans (less frequent)
    setInterval(async () => {
      await this.performVulnerabilityScans(hosts);
    }, this.config.scanInterval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    logger.info('TLS monitoring stopped');
  }

  /**
   * Perform health checks on hosts
   */
  async performHealthChecks(hosts: string[]): Promise<void> {
    const healthChecks = await Promise.all(
      hosts.map(host => this.checkTLSHealth(host))
    );

    for (const healthCheck of healthChecks) {
      this.healthChecks.set(healthCheck.host, healthCheck);
      
      if (healthCheck.status === 'CRITICAL') {
        await this.sendAlert('TLS Health Critical', healthCheck);
      } else if (healthCheck.status === 'WARNING') {
        await this.sendAlert('TLS Health Warning', healthCheck);
      }
    }
  }

  /**
   * Check TLS health for a single host
   */
  async checkTLSHealth(host: string, port: number = 443): Promise<TLSHealthCheck> {
    const timestamp = new Date();
    const issues: string[] = [];
    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';

    try {
      // Test basic TLS connection
      const connectionTest = await this.testTLSConnection(host, port);
      
      if (!connectionTest.success) {
        issues.push(`TLS connection failed: ${connectionTest.error}`);
        status = 'CRITICAL';
      }

      // Check TLS version
      if (connectionTest.protocol && !['TLSv1.2', 'TLSv1.3'].includes(connectionTest.protocol)) {
        issues.push(`Insecure TLS version: ${connectionTest.protocol}`);
        status = status === 'HEALTHY' ? 'WARNING' : status;
      }

      // Check cipher suite
      if (connectionTest.cipher && this.isWeakCipher(connectionTest.cipher)) {
        issues.push(`Weak cipher suite: ${connectionTest.cipher}`);
        status = status === 'HEALTHY' ? 'WARNING' : status;
      }

      // Check certificate validity
      const certCheck = await this.checkCertificateValidity(host, port);
      if (!certCheck.valid) {
        issues.push(`Certificate issues: ${certCheck.issues.join(', ')}`);
        status = 'CRITICAL';
      }

      // Check HSTS
      const hstsCheck = await this.checkHSTS(host, port);
      if (!hstsCheck.enabled) {
        issues.push('HSTS not enabled');
        status = status === 'HEALTHY' ? 'WARNING' : status;
      }

      // Check OCSP stapling
      const ocspCheck = await this.checkOCSPStapling(host, port);
      if (!ocspCheck.enabled) {
        issues.push('OCSP stapling not enabled');
        status = status === 'HEALTHY' ? 'WARNING' : status;
      }

      const metrics: TLSMonitoringMetrics = {
        tlsVersion: connectionTest.protocol || 'unknown',
        cipherSuite: connectionTest.cipher || 'unknown',
        ocspStapling: ocspCheck.enabled,
        hstsEnabled: hstsCheck.enabled,
        certificateTransparency: false, // Would need external service
        lastScan: timestamp,
        vulnerabilities: [],
        complianceScore: this.calculateComplianceScore(issues)
      };

      return {
        host,
        port,
        timestamp,
        status,
        issues,
        metrics
      };

    } catch (error) {
      logger.error(`Health check failed for ${host}:`, error);
      return {
        host,
        port,
        timestamp,
        status: 'CRITICAL',
        issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        metrics: {
          tlsVersion: 'unknown',
          cipherSuite: 'unknown',
          ocspStapling: false,
          hstsEnabled: false,
          certificateTransparency: false,
          lastScan: timestamp,
          vulnerabilities: [],
          complianceScore: 0
        }
      };
    }
  }

  /**
   * Perform vulnerability scans
   */
  async performVulnerabilityScans(hosts: string[]): Promise<void> {
    logger.info('Starting vulnerability scans for hosts:', hosts);

    const scanResults = await Promise.all(
      hosts.map(host => this.scanVulnerabilities(host))
    );

    for (const result of scanResults) {
      this.scanResults.set(result.host, result);
      
      if (result.score < this.config.alertThreshold!) {
        await this.sendAlert('TLS Vulnerability Alert', result);
      }
    }
  }

  /**
   * Scan for TLS vulnerabilities
   */
  async scanVulnerabilities(host: string, port: number = 443): Promise<VulnerabilityScanResult> {
    const timestamp = new Date();
    const vulnerabilities: Vulnerability[] = [];

    try {
      // Use external tools if available
      if (this.config.enableExternalScans) {
        const externalScan = await this.performExternalScan(host, port);
        vulnerabilities.push(...externalScan);
      }

      // Perform internal checks
      const internalVulnerabilities = await this.performInternalChecks(host, port);
      vulnerabilities.push(...internalVulnerabilities);

      // Calculate security score
      const score = this.calculateSecurityScore(vulnerabilities);

      // Generate recommendations
      const recommendations = this.generateRecommendations(vulnerabilities);

      return {
        host,
        port,
        timestamp,
        vulnerabilities,
        score,
        recommendations
      };

    } catch (error) {
      logger.error(`Vulnerability scan failed for ${host}:`, error);
      return {
        host,
        port,
        timestamp,
        vulnerabilities: [{
          id: 'SCAN_ERROR',
          name: 'Scan Error',
          severity: 'HIGH',
          description: `Vulnerability scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          remediation: 'Check network connectivity and scan configuration',
          references: []
        }],
        score: 0,
        recommendations: ['Fix scan configuration and retry']
      };
    }
  }

  /**
   * Test TLS connection
   */
  private async testTLSConnection(host: string, port: number): Promise<{
    success: boolean;
    protocol?: string;
    cipher?: string;
    error?: string;
  }> {
    try {
      // Use openssl for testing if available
      const command = `echo | openssl s_client -connect ${host}:${port} -servername ${host} 2>/dev/null | grep -E "(Protocol|Cipher)"`;
      const { stdout } = await execAsync(command);
      
      const protocolMatch = stdout.match(/Protocol\s*:\s*(\S+)/);
      const cipherMatch = stdout.match(/Cipher\s*:\s*(\S+)/);

      return {
        success: true,
        protocol: protocolMatch?.[1],
        cipher: cipherMatch?.[1]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check certificate validity
   */
  private async checkCertificateValidity(host: string, port: number): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const command = `echo | openssl s_client -connect ${host}:${port} -servername ${host} 2>/dev/null | openssl x509 -noout -dates`;
      const { stdout } = await execAsync(command);
      
      const notAfterMatch = stdout.match(/notAfter=(.+)/);
      if (notAfterMatch) {
        const expiryDate = new Date(notAfterMatch[1]);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          issues.push('Certificate expired');
        } else if (daysUntilExpiry < 30) {
          issues.push(`Certificate expires in ${daysUntilExpiry} days`);
        }
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        valid: false,
        issues: ['Certificate check failed']
      };
    }
  }

  /**
   * Check HSTS configuration
   */
  private async checkHSTS(host: string, port: number): Promise<{ enabled: boolean }> {
    try {
      const command = `curl -I -s https://${host} | grep -i "strict-transport-security"`;
      const { stdout } = await execAsync(command);
      
      return {
        enabled: stdout.trim().length > 0
      };
    } catch (error) {
      return { enabled: false };
    }
  }

  /**
   * Check OCSP stapling
   */
  private async checkOCSPStapling(host: string, port: number): Promise<{ enabled: boolean }> {
    try {
      const command = `echo | openssl s_client -connect ${host}:${port} -servername ${host} -status 2>/dev/null | grep -i "ocsp response"`;
      const { stdout } = await execAsync(command);
      
      return {
        enabled: stdout.trim().length > 0
      };
    } catch (error) {
      return { enabled: false };
    }
  }

  /**
   * Check if cipher is weak
   */
  private isWeakCipher(cipher: string): boolean {
    const weakCiphers = ['RC4', 'DES', 'MD5', 'NULL', 'EXPORT', 'ANON'];
    return weakCiphers.some(weak => cipher.includes(weak));
  }

  /**
   * Perform external vulnerability scan
   */
  private async performExternalScan(host: string, port: number): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    try {
      // Use testssl.sh if available
      const command = `testssl.sh --quiet --json ${host}:${port} 2>/dev/null`;
      const { stdout } = await execAsync(command);
      
      // Parse testssl.sh output (simplified)
      const results = JSON.parse(stdout);
      
      // Convert testssl.sh results to our vulnerability format
      // This would need to be implemented based on testssl.sh output format
      
    } catch (error) {
      logger.debug(`External scan not available for ${host}:`, error);
    }

    return vulnerabilities;
  }

  /**
   * Perform internal vulnerability checks
   */
  private async performInternalChecks(host: string, port: number): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    try {
      // Check for common vulnerabilities
      const connectionTest = await this.testTLSConnection(host, port);
      
      if (connectionTest.protocol === 'SSLv3') {
        vulnerabilities.push({
          id: 'SSLv3_POODLE',
          name: 'POODLE Attack Vulnerability',
          severity: 'HIGH',
          description: 'SSLv3 is vulnerable to POODLE attack',
          cve: 'CVE-2014-3566',
          remediation: 'Disable SSLv3 and use TLS 1.2 or higher',
          references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-3566']
        });
      }

      if (connectionTest.protocol === 'TLSv1.0' || connectionTest.protocol === 'TLSv1.1') {
        vulnerabilities.push({
          id: 'TLS_BEAST',
          name: 'BEAST Attack Vulnerability',
          severity: 'MEDIUM',
          description: 'TLS 1.0/1.1 are vulnerable to BEAST attack',
          remediation: 'Upgrade to TLS 1.2 or higher',
          references: ['https://en.wikipedia.org/wiki/Transport_Layer_Security#BEAST_attack']
        });
      }

      if (connectionTest.cipher && this.isWeakCipher(connectionTest.cipher)) {
        vulnerabilities.push({
          id: 'WEAK_CIPHER',
          name: 'Weak Cipher Suite',
          severity: 'MEDIUM',
          description: `Weak cipher suite detected: ${connectionTest.cipher}`,
          remediation: 'Use strong cipher suites like AES-GCM or ChaCha20-Poly1305',
          references: []
        });
      }

    } catch (error) {
      logger.error(`Internal checks failed for ${host}:`, error);
    }

    return vulnerabilities;
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(vulnerabilities: Vulnerability[]): number {
    let score = 100;

    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'CRITICAL':
          score -= 30;
          break;
        case 'HIGH':
          score -= 20;
          break;
        case 'MEDIUM':
          score -= 10;
          break;
        case 'LOW':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(issues: string[]): number {
    const totalChecks = 6; // Number of checks performed
    const failedChecks = issues.length;
    return Math.round(((totalChecks - failedChecks) / totalChecks) * 100);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(vulnerabilities: Vulnerability[]): string[] {
    const recommendations: string[] = [];

    for (const vuln of vulnerabilities) {
      if (!recommendations.includes(vuln.remediation)) {
        recommendations.push(vuln.remediation);
      }
    }

    return recommendations;
  }

  /**
   * Send alert
   */
  private async sendAlert(type: string, data: any): Promise<void> {
    logger.warn(`ALERT [${type}]:`, data);
    
    // Here you would integrate with your alerting system
    // e.g., send to Slack, email, PagerDuty, etc.
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): {
    isRunning: boolean;
    hosts: string[];
    lastHealthCheck?: Date;
    lastVulnerabilityScan?: Date;
  } {
    const hosts = Array.from(this.healthChecks.keys());
    const lastHealthCheck = hosts.length > 0 
      ? new Date(Math.max(...hosts.map(host => this.healthChecks.get(host)?.timestamp.getTime() || 0)))
      : undefined;
    
    const lastVulnerabilityScan = hosts.length > 0
      ? new Date(Math.max(...hosts.map(host => this.scanResults.get(host)?.timestamp.getTime() || 0)))
      : undefined;

    return {
      isRunning: this.monitoringInterval !== null,
      hosts,
      lastHealthCheck,
      lastVulnerabilityScan
    };
  }

  /**
   * Get health check results
   */
  getHealthCheckResults(): TLSHealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Get vulnerability scan results
   */
  getVulnerabilityScanResults(): VulnerabilityScanResult[] {
    return Array.from(this.scanResults.values());
  }
}

/**
 * Create TLS monitor instance
 */
export function createTLSMonitor(config?: {
  scanInterval?: number;
  healthCheckInterval?: number;
  enableExternalScans?: boolean;
  alertThreshold?: number;
}): TLSMonitor {
  return new TLSMonitor(config);
}

/**
 * Quick TLS health check
 */
export async function quickTLSHealthCheck(host: string, port: number = 443): Promise<{
  healthy: boolean;
  score: number;
  issues: string[];
}> {
  const monitor = new TLSMonitor();
  const healthCheck = await monitor.checkTLSHealth(host, port);
  
  return {
    healthy: healthCheck.status === 'HEALTHY',
    score: healthCheck.metrics.complianceScore,
    issues: healthCheck.issues
  };
}
