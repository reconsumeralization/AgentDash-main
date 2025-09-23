#!/usr/bin/env node

/**
 * Quick TLS Setup Script
 * Installs dependencies and configures the enhanced TLS server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Enhanced TLS Server with PKI Automation...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing TLS dependencies...');
try {
  execSync('npm install express@^4.18.0 @types/express@^4.17.0 ocsp@^1.2.0 @types/ocsp@^1.2.0', { 
    stdio: 'inherit' 
  });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

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

// Create a simple test script
const testScript = `#!/usr/bin/env node

/**
 * TLS Test Script
 * Quick test to verify TLS configuration
 */

const { quickTLSHealthCheck, getTLSSecurityScore, pkiConfig } = require('../lib/pki');

async function testTLS() {
  console.log('🧪 Testing TLS Configuration...\\n');
  
  try {
    // Test TLS configuration
    const score = getTLSSecurityScore(pkiConfig.tls);
    console.log(\`📊 TLS Security Score: \${score}/100\`);
    
    if (score >= 80) {
      console.log('✅ TLS configuration is secure');
    } else if (score >= 60) {
      console.log('⚠️  TLS configuration needs improvement');
    } else {
      console.log('❌ TLS configuration is insecure');
    }
    
    console.log('\\n🔧 Configuration Summary:');
    console.log(\`  - Min TLS Version: \${pkiConfig.tls?.minVersion || 'TLSv1.3'}\`);
    console.log(\`  - Forward Secrecy: \${pkiConfig.tls?.enableForwardSecrecy ? 'Enabled' : 'Disabled'}\`);
    console.log(\`  - OCSP Stapling: \${pkiConfig.tls?.enableOcspStapling ? 'Enabled' : 'Disabled'}\`);
    console.log(\`  - HSTS: \${pkiConfig.tls?.hstsMaxAge ? 'Enabled' : 'Disabled'}\`);
    console.log(\`  - mTLS: \${pkiConfig.tls?.enableMtls ? 'Enabled' : 'Disabled'}\`);
    
  } catch (error) {
    console.error('❌ TLS test failed:', error.message);
    process.exit(1);
  }
}

testTLS();
`;

fs.writeFileSync('scripts/test-tls.js', testScript);
fs.chmodSync('scripts/test-tls.js', '755');

console.log('✅ TLS test script created\n');

// Update package.json scripts
console.log('📝 Updating package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'tls:start': 'node server.js',
    'tls:test': 'node scripts/test-tls.js',
    'tls:setup': 'node scripts/setup-tls.js',
    'tls:monitor': 'node -e "require(\'./lib/pki\').createTLSMonitor().startMonitoring([\'localhost\'])"'
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json scripts updated\n');
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}

console.log('🎉 TLS Setup Complete!\n');
console.log('📋 Next Steps:');
console.log('  1. Run: npm run tls:test     # Test TLS configuration');
console.log('  2. Run: npm run tls:start    # Start the secure server');
console.log('  3. Run: npm run tls:monitor  # Start TLS monitoring');
console.log('\n🔗 Access your secure application at:');
console.log('  - HTTPS: https://localhost:3443');
console.log('  - HTTP:  http://localhost:3000 (redirects to HTTPS)');
console.log('\n📚 For more information, see the PKI automation documentation.');
