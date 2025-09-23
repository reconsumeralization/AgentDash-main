#!/usr/bin/env node

/**
 * Minimal TLS Server for Quick Start
 * Works without complex PKI dependencies
 */

const { createServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const httpsPort = parseInt(process.env.HTTPS_PORT || '3443', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Simple self-signed certificate for development
function createSelfSignedCert() {
  const certPath = path.join(__dirname, 'certs', 'server.crt');
  const keyPath = path.join(__dirname, 'certs', 'server.key');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    };
  }
  
  // For development, we'll use a simple approach
  console.log('⚠️  No certificates found. Using HTTP only for development.');
  return null;
}

async function startServer() {
  try {
    console.log('🚀 Starting Minimal TLS Server...');
    
    // Prepare Next.js app
    await app.prepare();
    console.log('✅ Next.js app prepared');

    const certs = createSelfSignedCert();
    
    if (certs) {
      // Create HTTPS server
      const httpsServer = createServer(certs, (req, res) => {
        const parsedUrl = parse(req.url, true);
        
        // Add security headers
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        handle(req, res, parsedUrl);
      });

      // Create HTTP redirect server
      const httpServer = createHttpServer((req, res) => {
        const httpsUrl = `https://${req.headers.host?.replace(port.toString(), httpsPort.toString())}${req.url}`;
        res.writeHead(301, { Location: httpsUrl });
        res.end();
      });

      // Start servers
      await Promise.all([
        new Promise((resolve) => {
          httpsServer.listen(httpsPort, () => {
            console.log(`🔒 HTTPS server running on https://${hostname}:${httpsPort}`);
            resolve();
          });
        }),
        new Promise((resolve) => {
          httpServer.listen(port, () => {
            console.log(`🔄 HTTP redirect server running on http://${hostname}:${port}`);
            resolve();
          });
        })
      ]);

      console.log('\n📊 TLS Security Features:');
      console.log('  - HTTPS with security headers');
      console.log('  - HTTP to HTTPS redirect');
      console.log('  - HSTS enabled');
      console.log('  - Security headers configured');
      
    } else {
      // Fallback to HTTP only for development
      const httpServer = createHttpServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        
        // Add security headers even for HTTP
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        handle(req, res, parsedUrl);
      });

      httpServer.listen(port, () => {
        console.log(`🌐 HTTP server running on http://${hostname}:${port}`);
        console.log('\n⚠️  Running in HTTP mode. For production, configure certificates.');
        console.log('\n📊 Security Features:');
        console.log('  - Security headers configured');
        console.log('  - XSS protection enabled');
        console.log('  - Content type sniffing disabled');
        console.log('  - Frame options set to DENY');
      });
    }

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Shutting down server...');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('🛑 Shutting down server...');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
