#!/usr/bin/env node

/**
 * Quick Start Script for Enhanced TLS Server
 * Minimal setup to get the TLS server running quickly
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Start: Enhanced TLS Server with PKI Automation\n');

// Create environment file if it doesn't exist
const envFile = '.env.local';
if (!fs.existsSync(envFile)) {
  console.log('📝 Creating environment configuration...');
  
  const envContent = `# TLS Configuration
TLS_MIN_VERSION=TLSv1.3
TLS_CIPHERS=TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256
TLS_ENABLE_FORWARD_SECRECY=true
TLS_ENABLE_OCSP_STAPLING=true
TLS_HSTS_MAX_AGE=31536000
TLS_ENABLE_HSTS_PRELOAD=true
TLS_ENABLE_MTLS=false
TLS_ENABLE_CERTIFICATE_TRANSPARENCY=true
TLS_ENABLE_EXPECT_CT=true
TLS_EXPECT_CT_MAX_AGE=604800
TLS_EXPECT_CT_ENFORCE=true
TLS_ENABLE_MONITORING=true
TLS_VULNERABILITY_SCAN_INTERVAL=86400

# PKI Configuration
PKI_KEY_BITS=2048
PKI_CERT_VALIDITY_DAYS=90
PKI_AUTO_RENEW_THRESHOLD_DAYS=30
PKI_STORAGE_TYPE=file
PKI_STORAGE_PATH=./certs
ACME_EMAIL=admin@example.com
ACME_STAGING=true

# Server Configuration
HOSTNAME=localhost
PORT=3000
HTTPS_PORT=3443
NODE_ENV=development
`;

  fs.writeFileSync(envFile, envContent);
  console.log('✅ Environment configuration created\n');
} else {
  console.log('✅ Environment configuration already exists\n');
}

// Create certificates directory
const certsDir = './certs';
if (!fs.existsSync(certsDir)) {
  console.log('📁 Creating certificates directory...');
  fs.mkdirSync(certsDir, { recursive: true });
  console.log('✅ Certificates directory created\n');
} else {
  console.log('✅ Certificates directory already exists\n');
}

// Create a simplified server that works with existing dependencies
const simpleServer = `#!/usr/bin/env node

/**
 * Simplified TLS Server for Quick Start
 * Works with existing dependencies
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
  // In production, you'd use the PKI automation module
  console.log('⚠️  No certificates found. Using HTTP only for development.');
  return null;
}

async function startServer() {
  try {
    console.log('🚀 Starting Enhanced TLS Server...');
    
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
        const httpsUrl = \`https://\${req.headers.host?.replace(port.toString(), httpsPort.toString())}\${req.url}\`;
        res.writeHead(301, { Location: httpsUrl });
        res.end();
      });

      // Start servers
      await Promise.all([
        new Promise((resolve) => {
          httpsServer.listen(httpsPort, () => {
            console.log(\`🔒 HTTPS server running on https://\${hostname}:\${httpsPort}\`);
            resolve();
          });
        }),
        new Promise((resolve) => {
          httpServer.listen(port, () => {
            console.log(\`🔄 HTTP redirect server running on http://\${hostname}:\${port}\`);
            resolve();
          });
        })
      ]);

      console.log('\\n📊 TLS Security Features:');
      console.log('  - HTTPS with security headers');
      console.log('  - HTTP to HTTPS redirect');
      console.log('  - HSTS enabled');
      console.log('  - Security headers configured');
      
    } else {
      // Fallback to HTTP only for development
      const httpServer = createHttpServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      });

      httpServer.listen(port, () => {
        console.log(\`🌐 HTTP server running on http://\${hostname}:\${port}\`);
        console.log('\\n⚠️  Running in HTTP mode. For production, configure certificates.');
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
`;

fs.writeFileSync('simple-server.js', simpleServer);

console.log('✅ Simplified server created\n');

// Update package.json scripts
console.log('📝 Adding quick start scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'tls:quick': 'node simple-server.js',
    'tls:start': 'node server.js',
    'tls:setup': 'node scripts/quick-start.js'
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json scripts updated\n');
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}

console.log('🎉 Quick Start Setup Complete!\n');
console.log('📋 Available Commands:');
console.log('  npm run tls:quick    # Start simplified TLS server (works now)');
console.log('  npm run tls:start    # Start full TLS server (requires dependencies)');
console.log('  npm run tls:setup    # Run this setup script again');
console.log('\n🚀 To start immediately:');
console.log('  npm run tls:quick');
console.log('\n🔗 Access your application at:');
console.log('  - HTTP:  http://localhost:3000');
console.log('  - HTTPS: https://localhost:3443 (if certificates available)');
console.log('\n📚 For full TLS features, install additional dependencies:');
console.log('  npm install express@^4.18.0 @types/express@^4.17.0');
