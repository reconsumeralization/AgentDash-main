#!/usr/bin/env node

/**
 * Enhanced TLS Server for Next.js with PKI Automation
 * Quick setup script to get the secure TLS server running
 */

const { createServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { setupTlsServer, pkiConfig } = require('./lib/pki');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const httpsPort = parseInt(process.env.HTTPS_PORT || '3443', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function startServer() {
  try {
    console.log('🚀 Starting Enhanced TLS Server with PKI Automation...');
    
    // Prepare Next.js app
    await app.prepare();
    console.log('✅ Next.js app prepared');

    // Validate TLS configuration
    const { validateTLSConfig } = require('./lib/pki');
    const validation = validateTLSConfig();
    
    if (!validation.isValid) {
      console.error('❌ TLS configuration validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
    
    console.log('✅ TLS configuration validated');

    // Setup TLS server
    const tlsServer = await setupTlsServer({
      port: httpsPort,
      httpPort: port,
      domain: hostname,
      dev,
      customHandler: (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      }
    });

    console.log(`🔒 HTTPS server running on https://${hostname}:${httpsPort}`);
    console.log(`🔄 HTTP redirect server running on http://${hostname}:${port}`);
    console.log('📊 TLS Security Features Enabled:');
    console.log(`  - Minimum TLS Version: ${pkiConfig.tls?.minVersion || 'TLSv1.3'}`);
    console.log(`  - Forward Secrecy: ${pkiConfig.tls?.enableForwardSecrecy ? '✅' : '❌'}`);
    console.log(`  - OCSP Stapling: ${pkiConfig.tls?.enableOcspStapling ? '✅' : '❌'}`);
    console.log(`  - HSTS: ${pkiConfig.tls?.hstsMaxAge ? '✅' : '❌'}`);
    console.log(`  - mTLS: ${pkiConfig.tls?.enableMtls ? '✅' : '❌'}`);
    console.log(`  - Certificate Transparency: ${pkiConfig.tls?.enableCertificateTransparency ? '✅' : '❌'}`);
    console.log(`  - TLS Monitoring: ${pkiConfig.tls?.enableTlsMonitoring ? '✅' : '❌'}`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 Shutting down TLS server...');
      await tlsServer.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('🛑 Shutting down TLS server...');
      await tlsServer.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
