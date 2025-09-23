/**
 * Multi-CA Support Module
 * Support for multiple Certificate Authorities (ACME, Custom, AWS ACM, etc.)
 */

import { ACMEClient } from 'acme-client';
import { ACMClient, RequestCertificateCommand, DescribeCertificateCommand, GetCertificateCommand } from '@aws-sdk/client-acm';
import { renewCertificate as renewACME } from './acmeIntegration';
import { pkiConfig } from './config';
import { ACMECertificate, CertOptions, CertificateError } from './types';
import winston from 'winston';

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// CA Types
export type CAType = 'acme' | 'custom' | 'aws-acm' | 'sectigo' | 'digicert' | 'globalsign';

// CA Configuration
export interface CAConfig {
  type: CAType;
  endpoint?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    apiKey?: string;
    username?: string;
    password?: string;
  };
  options?: {
    staging?: boolean;
    termsOfServiceAgreed?: boolean;
    keySize?: number;
    validityDays?: number;
  };
}

// Certificate request options
export interface CertRequestOptions {
  domain: string;
  subjectAlternativeNames?: string[];
  keySize?: number;
  validityDays?: number;
  force?: boolean;
  ca?: CAType;
}

// Certificate response
export interface CertResponse {
  cert: string;
  chain: string;
  privateKey?: string;
  validFrom: Date;
  validTo: Date;
  issuer: string;
  serialNumber: string;
  ca: CAType;
}

/**
 * Multi-CA Manager
 */
export class MultiCAManager {
  private configs: Map<CAType, CAConfig> = new Map();
  private clients: Map<CAType, any> = new Map();

  constructor(configs: CAConfig[]) {
    configs.forEach(config => {
      this.configs.set(config.type, config);
      this.initializeClient(config);
    });
  }

  /**
   * Initialize CA client
   */
  private async initializeClient(config: CAConfig): Promise<void> {
    try {
      switch (config.type) {
        case 'acme':
          await this.initializeACMEClient(config);
          break;
        case 'aws-acm':
          await this.initializeAWSACMClient(config);
          break;
        case 'custom':
          // Custom CA doesn't need client initialization
          break;
        default:
          logger.warn(`Unsupported CA type: ${config.type}`);
      }
    } catch (error) {
      logger.error(`Failed to initialize ${config.type} client`, { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Initialize ACME client
   */
  private async initializeACMEClient(config: CAConfig): Promise<void> {
    const acmeConfig = {
      directoryUrl: config.endpoint || (config.options?.staging ? 
        'https://acme-staging-v02.api.letsencrypt.org/directory' : 
        'https://acme-v02.api.letsencrypt.org/directory'),
      accountKey: config.credentials?.apiKey,
    };

    const client = new ACMEClient(acmeConfig);
    this.clients.set('acme', client);
  }

  /**
   * Initialize AWS ACM client
   */
  private async initializeAWSACMClient(config: CAConfig): Promise<void> {
    const acmClient = new ACMClient({
      region: config.credentials?.region || 'us-east-1',
      credentials: {
        accessKeyId: config.credentials?.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.credentials?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.clients.set('aws-acm', acmClient);
  }

  /**
   * Request certificate from specified CA
   */
  async requestCertificate(options: CertRequestOptions): Promise<CertResponse> {
    const caType = options.ca || this.getDefaultCA();
    const config = this.configs.get(caType);
    
    if (!config) {
      throw new CertificateError(`CA configuration not found for type: ${caType}`);
    }

    logger.info(`Requesting certificate from ${caType}`, { domain: options.domain });

    try {
      switch (caType) {
        case 'acme':
          return await this.requestACMECertificate(options, config);
        case 'aws-acm':
          return await this.requestAWSACMCertificate(options, config);
        case 'custom':
          return await this.requestCustomCACertificate(options, config);
        default:
          throw new CertificateError(`Unsupported CA type: ${caType}`);
      }
    } catch (error) {
      logger.error(`Certificate request failed for ${caType}`, { 
        domain: options.domain, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Request certificate from ACME CA
   */
  private async requestACMECertificate(options: CertRequestOptions, config: CAConfig): Promise<CertResponse> {
    const client = this.clients.get('acme');
    if (!client) {
      throw new CertificateError('ACME client not initialized');
    }

    // Use existing ACME integration
    const result = await renewACME(options.domain, {
      force: options.force,
      ca: 'acme',
      outputFormat: 'pem',
    });

    return {
      cert: result.cert,
      chain: result.chain || '',
      privateKey: result.privateKey,
      validFrom: result.validFrom,
      validTo: result.validTo,
      issuer: 'Let\'s Encrypt',
      serialNumber: result.serialNumber || '',
      ca: 'acme',
    };
  }

  /**
   * Request certificate from AWS ACM
   */
  private async requestAWSACMCertificate(options: CertRequestOptions, config: CAConfig): Promise<CertResponse> {
    const client = this.clients.get('aws-acm');
    if (!client) {
      throw new CertificateError('AWS ACM client not initialized');
    }

    try {
      // Request certificate
      const requestCommand = new RequestCertificateCommand({
        DomainName: options.domain,
        SubjectAlternativeNames: options.subjectAlternativeNames,
        ValidationMethod: 'DNS',
        KeyAlgorithm: 'RSA_2048',
        CertificateTransparencyLoggingPreference: 'ENABLED',
      });

      const requestResult = await client.send(requestCommand);
      const certificateArn = requestResult.CertificateArn;

      if (!certificateArn) {
        throw new CertificateError('Failed to get certificate ARN from AWS ACM');
      }

      // Wait for certificate to be issued (simplified - in production, implement proper polling)
      await this.waitForCertificateIssuance(client, certificateArn);

      // Get certificate
      const getCommand = new GetCertificateCommand({
        CertificateArn: certificateArn,
      });

      const certResult = await client.send(getCommand);

      if (!certResult.Certificate) {
        throw new CertificateError('Failed to retrieve certificate from AWS ACM');
      }

      // Parse certificate to get validity dates
      const cert = this.parseCertificate(certResult.Certificate);

      return {
        cert: certResult.Certificate,
        chain: certResult.CertificateChain || '',
        validFrom: cert.validFrom,
        validTo: cert.validTo,
        issuer: cert.issuer,
        serialNumber: cert.serialNumber,
        ca: 'aws-acm',
      };
    } catch (error) {
      throw new CertificateError(`AWS ACM certificate request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Request certificate from custom CA
   */
  private async requestCustomCACertificate(options: CertRequestOptions, config: CAConfig): Promise<CertResponse> {
    if (!config.endpoint) {
      throw new CertificateError('Custom CA endpoint not configured');
    }

    try {
      // Generate CSR (simplified)
      const csr = await this.generateCSR(options);

      // Submit CSR to custom CA
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-pem-file',
          'Authorization': `Bearer ${config.credentials?.apiKey}`,
        },
        body: csr,
      });

      if (!response.ok) {
        throw new CertificateError(`Custom CA request failed: ${response.status} ${response.statusText}`);
      }

      const certPem = await response.text();
      const cert = this.parseCertificate(certPem);

      return {
        cert: certPem,
        chain: '',
        validFrom: cert.validFrom,
        validTo: cert.validTo,
        issuer: cert.issuer,
        serialNumber: cert.serialNumber,
        ca: 'custom',
      };
    } catch (error) {
      throw new CertificateError(`Custom CA certificate request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Wait for certificate issuance (AWS ACM)
   */
  private async waitForCertificateIssuance(client: ACMClient, certificateArn: string, maxWaitTime: number = 300000): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 10000; // 10 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const describeCommand = new DescribeCertificateCommand({
          CertificateArn: certificateArn,
        });

        const result = await client.send(describeCommand);
        const status = result.Certificate?.Status;

        if (status === 'ISSUED') {
          return;
        } else if (status === 'FAILED' || status === 'VALIDATION_TIMED_OUT') {
          throw new CertificateError(`Certificate issuance failed with status: ${status}`);
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (error instanceof CertificateError) {
          throw error;
        }
        logger.warn('Error checking certificate status', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    throw new CertificateError('Certificate issuance timed out');
  }

  /**
   * Generate CSR for certificate request
   */
  private async generateCSR(options: CertRequestOptions): Promise<string> {
    // Simplified CSR generation - in production, use proper CSR generation
    const csr = `-----BEGIN CERTIFICATE REQUEST-----
MIICfjCCAWYCAQAwWTELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMRYwFAYDVQQH
DA1TYW4gRnJhbmNpc2NvMREwDwYDVQQKDAhNeUNvbXBhbnkxFjAUBgNVBAMMDXRl
c3QuZXhhbXBsZS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7
-----END CERTIFICATE REQUEST-----`;
    
    return csr;
  }

  /**
   * Parse certificate to extract metadata
   */
  private parseCertificate(certPem: string): {
    validFrom: Date;
    validTo: Date;
    issuer: string;
    serialNumber: string;
  } {
    // Simplified parsing - in production, use proper X.509 parsing
    return {
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      issuer: 'Unknown CA',
      serialNumber: 'mock-serial',
    };
  }

  /**
   * Get default CA type
   */
  private getDefaultCA(): CAType {
    return 'acme'; // Default to ACME (Let's Encrypt)
  }

  /**
   * Get available CA types
   */
  getAvailableCAs(): CAType[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Check CA health
   */
  async checkCAHealth(caType: CAType): Promise<{ healthy: boolean; error?: string }> {
    try {
      const config = this.configs.get(caType);
      if (!config) {
        return { healthy: false, error: 'CA configuration not found' };
      }

      switch (caType) {
        case 'acme':
          return await this.checkACMEHealth(config);
        case 'aws-acm':
          return await this.checkAWSACMHealth(config);
        case 'custom':
          return await this.checkCustomCAHealth(config);
        default:
          return { healthy: false, error: 'Unsupported CA type' };
      }
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check ACME CA health
   */
  private async checkACMEHealth(config: CAConfig): Promise<{ healthy: boolean; error?: string }> {
    try {
      const client = this.clients.get('acme');
      if (!client) {
        return { healthy: false, error: 'ACME client not initialized' };
      }

      // Try to get directory
      await client.getDirectory();
      return { healthy: true };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check AWS ACM health
   */
  private async checkAWSACMHealth(config: CAConfig): Promise<{ healthy: boolean; error?: string }> {
    try {
      const client = this.clients.get('aws-acm');
      if (!client) {
        return { healthy: false, error: 'AWS ACM client not initialized' };
      }

      // Try to list certificates (limited to 1)
      const command = new DescribeCertificateCommand({
        CertificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/test', // Mock ARN for health check
      });

      try {
        await client.send(command);
      } catch (error: any) {
        // If it's a "not found" error, the service is healthy
        if (error.name === 'ResourceNotFoundException') {
          return { healthy: true };
        }
        throw error;
      }

      return { healthy: true };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check custom CA health
   */
  private async checkCustomCAHealth(config: CAConfig): Promise<{ healthy: boolean; error?: string }> {
    try {
      if (!config.endpoint) {
        return { healthy: false, error: 'Custom CA endpoint not configured' };
      }

      // Try to make a health check request
      const response = await fetch(`${config.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.credentials?.apiKey}`,
        },
      });

      return { healthy: response.ok };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

/**
 * Create multi-CA manager with default configurations
 */
export function createMultiCAManager(): MultiCAManager {
  const configs: CAConfig[] = [
    {
      type: 'acme',
      endpoint: pkiConfig.caUrl,
      options: {
        staging: pkiConfig.staging,
        termsOfServiceAgreed: true,
      },
    },
    {
      type: 'aws-acm',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      },
    },
    {
      type: 'custom',
      endpoint: process.env.CUSTOM_CA_ENDPOINT,
      credentials: {
        apiKey: process.env.CUSTOM_CA_API_KEY,
      },
    },
  ].filter(config => {
    // Filter out configs with missing required fields
    if (config.type === 'custom' && !config.endpoint) return false;
    if (config.type === 'aws-acm' && !config.credentials?.accessKeyId) return false;
    return true;
  });

  return new MultiCAManager(configs);
}

// Export for use in other modules
export { MultiCAManager, CAConfig, CertRequestOptions, CertResponse };
