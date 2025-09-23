/**
 * TLS Server Setup for Next.js Applications
 * Comprehensive SSL/TLS server configuration with security best practices
 */

import https from 'https';
import http from 'http';
import tls from 'tls';
import { parse } from 'url';
import { pkiConfig } from './config';
import { TLSServerOptions, TLSError } from './types';
import { ACMEClient } from './acmeIntegration';
import { createLogger } from '../utils';

const logger = createLogger('TLS-Server');

export interface TLSServerConfig {
  port?: number;
  httpPort?: number;
  domain: string;
  dev?: boolean;
  customHandler?: (req: http.IncomingMessage, res: http.ServerResponse) => void;
}

export class SecureTLSServer {
  private httpsServer: https.Server | null = null;
  private httpServer: http.Server | null = null;
  private acmeClient: ACMEClient;
  private config: TLSServerConfig;

  constructor(config: TLSServerConfig) {
    this.config = config;
    this.acmeClient = new ACMEClient({
      email: pkiConfig.email || 'admin@example.com',
      directoryUrl: pkiConfig.caUrl,
      staging: pkiConfig.staging || false,
    });
  }

  /**
   * Setup and start the TLS server with all security features
   */
  async start(): Promise<{ httpsServer: https.Server; httpServer: http.Server }> {
    try {
      // Validate TLS configuration
      this.validateTLSConfig();

      // Get or renew certificate
      const certificate = await this.getCertificate();
      
      // Create TLS options
      const tlsOptions = this.createTLSOptions(certificate);

      // Create HTTPS server
      this.httpsServer = https.createServer(tlsOptions, (req, res) => {
        this.handleHTTPSRequest(req, res);
      });

      // Create HTTP redirect server
      this.httpServer = http.createServer((req, res) => {
        this.handleHTTPRedirect(req, res);
      });

      // Start servers
      const httpsPort = this.config.port || 443;
      const httpPort = this.config.httpPort || 80;

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          this.httpsServer!.listen(httpsPort, (err?: Error) => {
            if (err) reject(err);
            else {
              logger.info(`HTTPS server running on port ${httpsPort}`);
              resolve();
            }
          });
        }),
        new Promise<void>((resolve, reject) => {
          this.httpServer!.listen(httpPort, (err?: Error) => {
            if (err) reject(err);
            else {
              logger.info(`HTTP redirect server running on port ${httpPort}`);
              resolve();
            }
          });
        })
      ]);

      return {
        httpsServer: this.httpsServer,
        httpServer: this.httpServer
      };

    } catch (error) {
      logger.error('Failed to start TLS server:', error);
      throw new TLSError(`Failed to start TLS server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop the TLS servers
   */
  async stop(): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.httpsServer) {
      promises.push(new Promise<void>((resolve) => {
        this.httpsServer!.close(() => {
          logger.info('HTTPS server stopped');
          resolve();
        });
      }));
    }

    if (this.httpServer) {
      promises.push(new Promise<void>((resolve) => {
        this.httpServer!.close(() => {
          logger.info('HTTP server stopped');
          resolve();
        });
      }));
    }

    await Promise.all(promises);
  }

  /**
   * Get or renew certificate for the domain
   */
  private async getCertificate(): Promise<{ cert: string; chain: string; privateKey: string }> {
    try {
      // Try to get existing certificate first
      const existingCert = await this.acmeClient.getCertificate(this.config.domain);
      if (existingCert && this.isCertificateValid(existingCert)) {
        logger.info(`Using existing certificate for ${this.config.domain}`);
        return existingCert;
      }

      // Request new certificate
      logger.info(`Requesting new certificate for ${this.config.domain}`);
      const newCert = await this.acmeClient.requestCertificate({
        domain: this.config.domain,
        subjectAlternativeNames: [`www.${this.config.domain}`],
        keySize: pkiConfig.keyBits || 2048,
        validityDays: pkiConfig.certValidityDays || 90,
      });

      return newCert;
    } catch (error) {
      logger.error('Failed to get certificate:', error);
      throw new TLSError(`Certificate acquisition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if certificate is valid and not expiring soon
   */
  private isCertificateValid(cert: { validTo: Date }): boolean {
    const now = new Date();
    const expiryThreshold = new Date(now.getTime() + (pkiConfig.autoRenewThresholdDays || 30) * 24 * 60 * 60 * 1000);
    return cert.validTo > expiryThreshold;
  }

  /**
   * Create TLS server options with security best practices
   */
  private createTLSOptions(certificate: { cert: string; chain: string; privateKey: string }): TLSServerOptions {
    const tlsConfig = pkiConfig.tls!;
    
    const options: TLSServerOptions = {
      key: certificate.privateKey,
      cert: `${certificate.cert}\n${certificate.chain}`,
      minVersion: tlsConfig.minVersion,
      ciphers: tlsConfig.ciphers,
      honorCipherOrder: tlsConfig.honorCipherOrder,
      requestCert: tlsConfig.enableMtls ? tlsConfig.requestCert : false,
      rejectUnauthorized: tlsConfig.enableMtls ? tlsConfig.rejectUnauthorized : false,
    };

    // Add mTLS CA certificate if configured
    if (tlsConfig.enableMtls && tlsConfig.mtlsCaCert) {
      options.ca = [tlsConfig.mtlsCaCert];
    }

    // Add OCSP stapling if enabled
    if (tlsConfig.enableOcspStapling) {
      options.getOCSPResponse = this.createOCSPResponseHandler();
    }

    return options;
  }

  /**
   * Create OCSP response handler for stapling
   */
  private createOCSPResponseHandler() {
    return async (cert: Buffer, issuer: Buffer, callback: (err: Error | null, response?: Buffer) => void) => {
      try {
        // This would integrate with the OCSP module
        // For now, we'll implement a basic version
        logger.debug('OCSP stapling requested');
        callback(null, Buffer.alloc(0)); // Placeholder
      } catch (error) {
        logger.error('OCSP stapling failed:', error);
        callback(error instanceof Error ? error : new Error('OCSP stapling failed'));
      }
    };
  }

  /**
   * Handle HTTPS requests with security headers
   */
  private handleHTTPSRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const tlsConfig = pkiConfig.tls!;

    // Add security headers
    this.addSecurityHeaders(res);

    // Handle mTLS authentication if enabled
    if (tlsConfig.enableMtls && !this.isClientAuthenticated(req)) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Client certificate required');
      return;
    }

    // Use custom handler if provided, otherwise default Next.js handling
    if (this.config.customHandler) {
      this.config.customHandler(req, res);
    } else {
      // Default Next.js request handling would go here
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end('<h1>Secure TLS Server</h1><p>HTTPS connection established</p>');
    }
  }

  /**
   * Handle HTTP to HTTPS redirects
   */
  private handleHTTPRedirect(req: http.IncomingMessage, res: http.ServerResponse): void {
    const host = req.headers.host;
    const url = req.url;
    
    if (host && url) {
      const httpsUrl = `https://${host}${url}`;
      res.writeHead(301, { Location: httpsUrl });
      res.end();
    } else {
      res.statusCode = 400;
      res.end('Bad Request');
    }
  }

  /**
   * Add comprehensive security headers
   */
  private addSecurityHeaders(res: http.ServerResponse): void {
    const tlsConfig = pkiConfig.tls!;

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

    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  /**
   * Check if client is authenticated (for mTLS)
   */
  private isClientAuthenticated(req: http.IncomingMessage): boolean {
    const socket = req.socket as any;
    return socket.authorized === true;
  }

  /**
   * Validate TLS configuration
   */
  private validateTLSConfig(): void {
    const tlsConfig = pkiConfig.tls!;
    const errors: string[] = [];

    // Check minimum TLS version
    if (tlsConfig.minVersion && !['TLSv1.2', 'TLSv1.3'].includes(tlsConfig.minVersion)) {
      errors.push('Minimum TLS version must be TLSv1.2 or TLSv1.3');
    }

    // Check cipher suites
    if (tlsConfig.ciphers) {
      const secureCiphers = tls.getCiphers().filter(c => 
        !c.includes('RC4') && 
        !c.includes('DES') && 
        !c.includes('MD5') &&
        !c.includes('NULL')
      );
      
      const configuredCiphers = tlsConfig.ciphers.split(':');
      const weakCiphers = configuredCiphers.filter(c => !secureCiphers.includes(c));
      
      if (weakCiphers.length > 0) {
        errors.push(`Weak ciphers detected: ${weakCiphers.join(', ')}`);
      }
    }

    // Check forward secrecy
    if (tlsConfig.enableForwardSecrecy && tlsConfig.ciphers && !tlsConfig.ciphers.includes('ECDHE')) {
      errors.push('Forward secrecy enabled but no ECDHE ciphers configured');
    }

    // Check mTLS configuration
    if (tlsConfig.enableMtls && !tlsConfig.mtlsCaCert) {
      errors.push('mTLS enabled but no CA certificate provided');
    }

    if (errors.length > 0) {
      throw new TLSError(`TLS configuration validation failed: ${errors.join(', ')}`);
    }
  }
}

/**
 * Setup TLS server for Next.js application
 */
export async function setupTlsServer(config: TLSServerConfig): Promise<SecureTLSServer> {
  const server = new SecureTLSServer(config);
  await server.start();
  return server;
}

/**
 * Create TLS server options for custom Next.js server
 */
export function createTLSOptions(certificate: { cert: string; chain: string; privateKey: string }): TLSServerOptions {
  const tlsConfig = pkiConfig.tls!;
  
  return {
    key: certificate.privateKey,
    cert: `${certificate.cert}\n${certificate.chain}`,
    minVersion: tlsConfig.minVersion,
    ciphers: tlsConfig.ciphers,
    honorCipherOrder: tlsConfig.honorCipherOrder,
    requestCert: tlsConfig.enableMtls ? tlsConfig.requestCert : false,
    rejectUnauthorized: tlsConfig.enableMtls ? tlsConfig.rejectUnauthorized : false,
    ca: tlsConfig.enableMtls && tlsConfig.mtlsCaCert ? [tlsConfig.mtlsCaCert] : undefined,
  };
}

/**
 * Validate TLS configuration
 */
export function validateTLSConfig(): { isValid: boolean; errors: string[] } {
  const tlsConfig = pkiConfig.tls!;
  const errors: string[] = [];

  try {
    const server = new SecureTLSServer({ domain: 'example.com' });
    server['validateTLSConfig']();
  } catch (error) {
    if (error instanceof TLSError) {
      errors.push(error.message);
    } else {
      errors.push('Unknown TLS configuration error');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
