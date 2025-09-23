// PKI Automation Module - Main Export
// Secure PKI automation for Next.js applications

// Core utilities
export * from './types';
export * from './config';
export * from './keyGeneration';
export * from './certificateGeneration';
export * from './acmeIntegration';

// TLS/SSL functionality
export * from './tlsServer';
export * from './ocspStapling';
export * from './tlsMiddleware';
export * from './tlsValidation';
export * from './tlsMonitoring';

// Configuration
export { defaultPKIConfig, pkiConfig, getPKIConfig, validatePKIConfig } from './config';

// Key generation utilities
export { 
  generateKeyPair, 
  generatePassphrase, 
  encryptPrivateKey, 
  decryptPrivateKey, 
  validateKeyPair, 
  generateSecureKeyPair,
  exportKeyPair 
} from './keyGeneration';

// Certificate generation utilities
export { 
  generateCertificate, 
  createCSR, 
  parseCertificate, 
  getCertificateStatus, 
  exportCertificate, 
  validateCertificateChain 
} from './certificateGeneration';

// ACME integration
export { 
  ACMEClient, 
  CertificateRenewalService, 
  createACMEClient 
} from './acmeIntegration';

// TLS/SSL utilities
export { 
  SecureTLSServer, 
  setupTlsServer, 
  createTLSOptions, 
  validateTLSConfig 
} from './tlsServer';

export { 
  OCSPStaplingService, 
  createOCSPStaplingService, 
  validateOCSPResponse, 
  checkCertificateRevocation 
} from './ocspStapling';

export { 
  tlsMiddleware, 
  addSecurityHeaders, 
  expressTlsMiddleware, 
  HSTSPreloadService, 
  CertificateTransparencyService 
} from './tlsMiddleware';

export { 
  TLSValidator, 
  quickValidateTLS, 
  getTLSSecurityScore 
} from './tlsValidation';

export { 
  TLSMonitor, 
  createTLSMonitor, 
  quickTLSHealthCheck 
} from './tlsMonitoring';

// Type exports
export type {
  KeyPairOptions,
  KeyPair,
  CertOptions,
  Certificate,
  CSR,
  ACMEOptions,
  ACMECertificate,
  PKIConfig,
  TLSConfig,
  CertStatus,
  PKIMetrics,
  ValidationResult,
  RenewalJob,
  HSMConfig,
  SecurityPolicy,
  PKIError,
  KeyGenerationError,
  CertificateError,
  ACMEError,
  ValidationError,
  TLSError,
  OCSPError,
  TLSServerOptions,
  TLSMonitoringMetrics,
  OCSPResponse,
} from './types';
