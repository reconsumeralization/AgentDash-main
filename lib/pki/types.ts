// PKI Automation Module - TypeScript Types
// Secure Development PKI Types for Next.js Applications

export interface KeyPairOptions {
  bits?: number; // Default 2048
  algorithm?: 'rsa' | 'ecdsa' | 'ed25519'; // Default 'rsa'
  curve?: 'prime256v1' | 'secp384r1' | 'secp521r1'; // For ECDSA
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: string;
  keySize: number;
}

export interface CertOptions {
  commonName: string;
  country?: string;
  organization?: string;
  organizationalUnit?: string;
  locality?: string;
  state?: string;
  emailAddress?: string;
  subjectAlternativeNames?: string[];
  validityDays?: number;
  selfSigned?: boolean;
  keyUsage?: string[];
  extendedKeyUsage?: string[];
}

export interface Certificate {
  cert: string;
  privateKey: string;
  publicKey: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  issuer: string;
  subject: string;
  fingerprint: string;
}

export interface CSR {
  csr: string;
  privateKey: string;
  publicKey: string;
  subject: string;
}

export interface ACMEOptions {
  directoryUrl?: string;
  email: string;
  accountKey?: string;
  termsOfServiceAgreed?: boolean;
}

export interface ACMECertificate {
  cert: string;
  chain: string;
  privateKey: string;
  validFrom: Date;
  validTo: Date;
}

export interface PKIConfig {
  caUrl?: string;
  keyBits?: number;
  certValidityDays?: number;
  autoRenewThresholdDays?: number;
  email?: string;
  staging?: boolean; // For Let's Encrypt staging
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
  tls?: TLSConfig;
}

export interface TLSConfig {
  minVersion?: 'TLSv1.2' | 'TLSv1.3';
  ciphers?: string;
  enableForwardSecrecy?: boolean;
  enableOcspStapling?: boolean;
  hstsMaxAge?: number;
  enableHstsPreload?: boolean;
  enableMtls?: boolean;
  mtlsCaCert?: string;
  enableCertificateTransparency?: boolean;
  enableExpectCT?: boolean;
  expectCTMaxAge?: number;
  expectCTEnforce?: boolean;
  expectCTReportUri?: string;
  enableTlsMonitoring?: boolean;
  vulnerabilityScanInterval?: number;
  allowedProtocols?: string[];
  honorCipherOrder?: boolean;
  secureProtocol?: string;
  rejectUnauthorized?: boolean;
  requestCert?: boolean;
  checkServerIdentity?: boolean;
}

export interface CertStatus {
  status: 'valid' | 'expired' | 'expiring' | 'invalid' | 'error';
  daysToExpiry?: number;
  issuer?: string;
  subject?: string;
  fingerprint?: string;
  error?: string;
}

export interface PKIMetrics {
  totalCerts: number;
  expiringCerts: number;
  expiredCerts: number;
  lastRenewal?: Date;
  renewalFailures: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RenewalJob {
  id: string;
  domain: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledFor: Date;
  lastRun?: Date;
  nextRun?: Date;
  attempts: number;
  maxAttempts: number;
  error?: string;
}

export interface HSMConfig {
  provider: 'aws-cloudhsm' | 'azure-keyvault' | 'gcp-kms' | 'vault';
  endpoint?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };
  keyId?: string;
  keyVersion?: string;
}

export interface SecurityPolicy {
  minKeySize: number;
  maxValidityDays: number;
  allowedAlgorithms: string[];
  requireSANs: boolean;
  requireCRL: boolean;
  requireOCSP: boolean;
}

// Error types for better error handling
export class PKIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PKIError';
  }
}

export class KeyGenerationError extends PKIError {
  constructor(message: string, details?: any) {
    super(message, 'KEY_GENERATION_ERROR', details);
    this.name = 'KeyGenerationError';
  }
}

export class CertificateError extends PKIError {
  constructor(message: string, details?: any) {
    super(message, 'CERTIFICATE_ERROR', details);
    this.name = 'CertificateError';
  }
}

export class ACMEError extends PKIError {
  constructor(message: string, details?: any) {
    super(message, 'ACME_ERROR', details);
    this.name = 'ACMEError';
  }
}

export class ValidationError extends PKIError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TLSError extends PKIError {
  constructor(message: string, details?: any) {
    super(message, 'TLS_ERROR', details);
    this.name = 'TLSError';
  }
}

export class OCSPError extends PKIError {
  constructor(message: string, details?: any) {
    super(message, 'OCSP_ERROR', details);
    this.name = 'OCSPError';
  }
}

// TLS-specific types
export interface TLSServerOptions {
  key: string;
  cert: string;
  ca?: string[];
  minVersion?: string;
  ciphers?: string;
  honorCipherOrder?: boolean;
  requestCert?: boolean;
  rejectUnauthorized?: boolean;
  getOCSPResponse?: (cert: Buffer, issuer: Buffer, callback: (err: Error | null, response?: Buffer) => void) => void;
}

export interface TLSMonitoringMetrics {
  tlsVersion: string;
  cipherSuite: string;
  ocspStapling: boolean;
  hstsEnabled: boolean;
  certificateTransparency: boolean;
  lastScan: Date;
  vulnerabilities: string[];
  complianceScore: number;
}

export interface OCSPResponse {
  status: 'good' | 'revoked' | 'unknown';
  thisUpdate: Date;
  nextUpdate?: Date;
  revocationTime?: Date;
  revocationReason?: string;
}
