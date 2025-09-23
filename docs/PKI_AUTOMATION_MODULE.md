# PKI Automation Module

A comprehensive Public Key Infrastructure (PKI) automation module designed for Next.js applications with a focus on secure development practices.

## 🚀 Features

### Core Functionality
- **Key Generation**: RSA, ECDSA, and Ed25519 key pairs with configurable parameters
- **Certificate Management**: Self-signed certificates, CSRs, and certificate validation
- **ACME Integration**: Automated certificate issuance and renewal via Let's Encrypt
- **Auto-Renewal**: Scheduled certificate renewal with retry logic and failure handling
- **Security Compliance**: NIST guidelines, RFC 5280 standards, and security best practices

### Security Features
- **Hardware Security Module (HSM) Support**: Integration with cloud HSMs and hardware security
- **Key Protection**: Encryption and secure storage options for private keys
- **Validation**: Comprehensive certificate and key validation
- **Audit Logging**: Security event logging and monitoring

### Integration
- **React Components**: Pre-built UI components for certificate management
- **Custom Hooks**: React hooks for PKI operations
- **API Routes**: RESTful API endpoints for automation
- **TypeScript Support**: Full type safety and IntelliSense support

## 📁 Module Structure

```
lib/pki/
├── types.ts                 # TypeScript type definitions
├── config.ts               # Configuration management
├── keyGeneration.ts        # Key pair generation utilities
├── certificateGeneration.ts # Certificate and CSR creation
├── acmeIntegration.ts      # ACME protocol implementation
└── index.ts               # Main module exports

components/pki/
└── PkiDashboard.tsx       # Main PKI management component

hooks/
└── usePKI.ts              # React hooks for PKI operations

app/api/pki/
├── certificates/          # Certificate CRUD operations
├── generate/             # Certificate generation
├── generate-keypair/     # Key pair generation
├── renew/                # Certificate renewal
├── revoke/               # Certificate revocation
├── renewal-jobs/         # Auto-renewal job management
└── metrics/              # PKI system metrics
```

## 🛠 Installation & Setup

### Prerequisites
- Next.js 14+
- React 18+
- Node.js 18+

### Dependencies
```bash
npm install node-forge acme-client
npm install -D @types/node @types/react
```

### Environment Configuration
Create a `.env.local` file with the following variables:

```env
# ACME Configuration
ACME_CA_URL=https://acme-v02.api.letsencrypt.org/directory
ACME_EMAIL=admin@yourdomain.com
ACME_STAGING=true  # Set to false for production

# PKI Configuration
PKI_KEY_BITS=2048
PKI_CERT_VALIDITY_DAYS=90
PKI_AUTO_RENEW_THRESHOLD_DAYS=30
PKI_STORAGE_TYPE=file
PKI_STORAGE_PATH=./certs

# Security Configuration
PKI_REQUIRE_HSM=false
PKI_KEY_PROTECTION=software
PKI_ENCRYPTION_KEY=your-encryption-key
```

## 📖 Usage Examples

### Basic Certificate Generation

```typescript
import { generateCertificate } from '@/lib/pki';

// Generate a self-signed certificate
const certificate = await generateCertificate({
  commonName: 'example.com',
  organization: 'My Company Inc.',
  country: 'US',
  validityDays: 90,
  selfSigned: true,
  subjectAlternativeNames: ['www.example.com', 'api.example.com'],
});
```

### Key Pair Generation

```typescript
import { generateSecureKeyPair } from '@/lib/pki';

// Generate RSA key pair
const keyPair = await generateSecureKeyPair({
  bits: 2048,
  algorithm: 'rsa',
  encrypt: true,
});
```

### ACME Integration

```typescript
import { createACMEClient } from '@/lib/pki';

const acmeClient = createACMEClient({
  email: 'admin@example.com',
  staging: true,
});

await acmeClient.initialize();
const certificate = await acmeClient.requestCertificate('example.com');
```

### React Component Usage

```tsx
import PkiDashboard from '@/components/pki/PkiDashboard';
import { usePKI } from '@/hooks/usePKI';

function MyPKIPage() {
  const {
    certificates,
    renewalJobs,
    metrics,
    generateCertificate,
    renewCertificate,
  } = usePKI();

  return (
    <PkiDashboard
      certificates={certificates}
      renewalJobs={renewalJobs}
      metrics={metrics}
      onGenerateCert={generateCertificate}
      onRenewCert={renewCertificate}
    />
  );
}
```

### API Route Integration

```typescript
// app/api/my-endpoint/route.ts
import { generateCertificate } from '@/lib/pki';

export async function POST(request: Request) {
  const { domain } = await request.json();
  
  const cert = await generateCertificate({
    commonName: domain,
    selfSigned: true,
  });
  
  return Response.json({ certificate: cert });
}
```

## 🔧 Configuration Options

### PKI Configuration
```typescript
interface PKIConfig {
  caUrl?: string;                    // ACME CA directory URL
  keyBits?: number;                  // Default key size (2048 minimum)
  certValidityDays?: number;         // Certificate validity period
  autoRenewThresholdDays?: number;   // Days before expiry to renew
  email?: string;                    // ACME registration email
  staging?: boolean;                 // Use staging environment
  storage?: {
    type: 'memory' | 'file' | 'database' | 'vault';
    path?: string;
    connectionString?: string;
  };
  security?: {
    requireHSM?: boolean;
    keyProtection?: 'software' | 'hardware';
    encryptionKey?: string;
  };
}
```

### Security Policy
```typescript
interface SecurityPolicy {
  minKeySize: number;                // Minimum key size (2048)
  maxValidityDays: number;           // Maximum validity (825)
  allowedAlgorithms: string[];       // ['rsa', 'ecdsa', 'ed25519']
  requireSANs: boolean;              // Require Subject Alternative Names
  requireCRL: boolean;               // Require Certificate Revocation List
  requireOCSP: boolean;              // Require OCSP validation
}
```

## 🔒 Security Best Practices

### Production Deployment
1. **Use HSM**: Enable Hardware Security Module for key storage
2. **Environment Separation**: Use staging environment for testing
3. **Access Controls**: Implement proper authentication and authorization
4. **Audit Logging**: Enable comprehensive security event logging
5. **Key Rotation**: Implement regular key rotation policies

### Development Guidelines
1. **Never Commit Keys**: Use environment variables for sensitive data
2. **Validate Inputs**: Always validate certificate options and domains
3. **Error Handling**: Implement proper error handling and logging
4. **Testing**: Use staging ACME servers for development

### Compliance
- **NIST Guidelines**: Follow NIST SP 800-57 for key management
- **RFC 5280**: Implement X.509 certificate standards
- **PCI DSS**: Comply with payment card industry requirements
- **GDPR**: Ensure data protection compliance

## 🚨 Error Handling

The module provides comprehensive error handling with specific error types:

```typescript
import { 
  PKIError, 
  KeyGenerationError, 
  CertificateError, 
  ACMEError, 
  ValidationError 
} from '@/lib/pki/types';

try {
  const cert = await generateCertificate(options);
} catch (error) {
  if (error instanceof KeyGenerationError) {
    console.error('Key generation failed:', error.message);
  } else if (error instanceof CertificateError) {
    console.error('Certificate creation failed:', error.message);
  } else if (error instanceof ACMEError) {
    console.error('ACME operation failed:', error.message);
  }
}
```

## 📊 Monitoring & Metrics

### Available Metrics
- Total certificates managed
- Certificates expiring soon
- Expired certificates
- Renewal failure count
- Last renewal timestamp

### Monitoring Integration
```typescript
import { usePKIMetrics } from '@/hooks/usePKI';

function MetricsComponent() {
  const { metrics, loading, error } = usePKIMetrics();
  
  if (loading) return <div>Loading metrics...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Total Certificates: {metrics?.totalCerts}</p>
      <p>Expiring Soon: {metrics?.expiringCerts}</p>
      <p>Expired: {metrics?.expiredCerts}</p>
    </div>
  );
}
```

## 🔄 Automation & Scheduling

### Renewal Jobs
```typescript
import { CertificateRenewalService } from '@/lib/pki';

const renewalService = new CertificateRenewalService(acmeClient);

// Add domain for automatic renewal
const job = renewalService.addDomainForRenewal('example.com', {
  scheduleDays: 30,
  maxAttempts: 3,
});

// Process pending renewals
const results = await renewalService.processPendingRenewals();
```

### Cron Integration
For production deployments, integrate with cron or scheduled jobs:

```bash
# Check for expiring certificates every day
0 2 * * * curl -X POST https://your-app.com/api/pki/process-renewals
```

## 🧪 Testing

### Unit Tests
```typescript
import { generateKeyPair, validateKeyPair } from '@/lib/pki';

describe('Key Generation', () => {
  it('should generate valid RSA key pair', async () => {
    const keyPair = generateKeyPair({ algorithm: 'rsa', bits: 2048 });
    const validation = validateKeyPair(keyPair);
    expect(validation.isValid).toBe(true);
  });
});
```

### Integration Tests
```typescript
import { createACMEClient } from '@/lib/pki';

describe('ACME Integration', () => {
  it('should initialize ACME client', async () => {
    const client = createACMEClient({
      email: 'test@example.com',
      staging: true,
    });
    
    await expect(client.initialize()).resolves.not.toThrow();
  });
});
```

## 📚 API Reference

### Core Functions
- `generateKeyPair(options)` - Generate cryptographic key pairs
- `generateCertificate(options)` - Create certificates and CSRs
- `createACMEClient(options)` - Initialize ACME client
- `validateKeyPair(keyPair)` - Validate key pair integrity
- `getCertificateStatus(certPem)` - Check certificate status

### React Hooks
- `usePKI()` - Main PKI management hook
- `useCertificateStatus(certPem)` - Certificate status monitoring
- `useKeyPair()` - Key pair management
- `useACME()` - ACME operations
- `usePKIMetrics()` - Metrics and monitoring

### API Endpoints
- `GET /api/pki/certificates` - List certificates
- `POST /api/pki/generate` - Generate certificate
- `POST /api/pki/renew` - Renew certificate
- `POST /api/pki/revoke/[certId]` - Revoke certificate
- `GET /api/pki/metrics` - Get system metrics

## 🤝 Contributing

1. Follow security best practices
2. Add comprehensive tests
3. Update documentation
4. Ensure TypeScript compliance
5. Follow semantic versioning

## 📄 License

This module is part of the AgentDash project and follows the same licensing terms.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review security guidelines
3. Test with staging environment
4. Report security issues responsibly

---

**⚠️ Security Notice**: This module handles cryptographic operations and sensitive data. Always review security implications and follow best practices when deploying to production environments.
