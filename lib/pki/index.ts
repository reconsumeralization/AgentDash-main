// PKI Automation Module - Main Export
// Secure PKI automation for Next.js applications

// Core utilities
export * from './types';
export * from './config';
export * from './keyGeneration';
export * from './certificateGeneration';
export * from './acmeIntegration';

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
} from './types';
