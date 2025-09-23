// PKI Configuration Management
// Secure configuration for PKI automation module

import { PKIConfig, SecurityPolicy } from './types';

// Default PKI configuration
export const defaultPKIConfig: PKIConfig = {
  caUrl: process.env.ACME_CA_URL || 'https://acme-v02.api.letsencrypt.org/directory',
  keyBits: parseInt(process.env.PKI_KEY_BITS || '2048'),
  certValidityDays: parseInt(process.env.PKI_CERT_VALIDITY_DAYS || '90'),
  autoRenewThresholdDays: parseInt(process.env.PKI_AUTO_RENEW_THRESHOLD_DAYS || '30'),
  email: process.env.ADMIN_EMAIL || process.env.ACME_EMAIL,
  staging: process.env.NODE_ENV !== 'production' && process.env.ACME_STAGING === 'true',
  storage: {
    type: (process.env.PKI_STORAGE_TYPE as 'memory' | 'file' | 'database' | 'vault') || 'file',
    path: process.env.PKI_STORAGE_PATH || './certs',
    connectionString: process.env.PKI_DATABASE_URL,
  },
  security: {
    requireHSM: process.env.PKI_REQUIRE_HSM === 'true',
    keyProtection: (process.env.PKI_KEY_PROTECTION as 'software' | 'hardware') || 'software',
    encryptionKey: process.env.PKI_ENCRYPTION_KEY,
  },
};

// Security policy configuration
export const defaultSecurityPolicy: SecurityPolicy = {
  minKeySize: 2048,
  maxValidityDays: 825, // RFC 5280 recommendation
  allowedAlgorithms: ['rsa', 'ecdsa', 'ed25519'],
  requireSANs: true,
  requireCRL: false,
  requireOCSP: true,
};

// Environment-specific configurations
export const getEnvironmentConfig = (): PKIConfig => {
  const baseConfig = { ...defaultPKIConfig };
  
  switch (process.env.NODE_ENV) {
    case 'development':
      return {
        ...baseConfig,
        staging: true,
        caUrl: 'https://acme-staging-v02.api.letsencrypt.org/directory',
        storage: {
          ...baseConfig.storage,
          type: 'memory', // Use in-memory storage for dev
        },
      };
    
    case 'test':
      return {
        ...baseConfig,
        staging: true,
        storage: {
          ...baseConfig.storage,
          type: 'memory',
        },
      };
    
    case 'production':
      return {
        ...baseConfig,
        staging: false,
        storage: {
          ...baseConfig.storage,
          type: 'vault', // Use secure vault in production
        },
        security: {
          ...baseConfig.security,
          requireHSM: true,
          keyProtection: 'hardware',
        },
      };
    
    default:
      return baseConfig;
  }
};

// Configuration validation
export const validatePKIConfig = (config: PKIConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.email) {
    errors.push('Email is required for ACME registration');
  }

  if (config.keyBits && config.keyBits < defaultSecurityPolicy.minKeySize) {
    errors.push(`Key size must be at least ${defaultSecurityPolicy.minKeySize} bits`);
  }

  if (config.certValidityDays && config.certValidityDays > defaultSecurityPolicy.maxValidityDays) {
    errors.push(`Certificate validity cannot exceed ${defaultSecurityPolicy.maxValidityDays} days`);
  }

  if (config.storage?.type === 'database' && !config.storage.connectionString) {
    errors.push('Database connection string is required for database storage');
  }

  if (config.storage?.type === 'file' && !config.storage.path) {
    errors.push('Storage path is required for file storage');
  }

  if (config.security?.requireHSM && !config.security.keyProtection) {
    errors.push('Key protection method must be specified when HSM is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get current configuration
export const getPKIConfig = (): PKIConfig => {
  const config = getEnvironmentConfig();
  const validation = validatePKIConfig(config);
  
  if (!validation.isValid) {
    console.warn('PKI Configuration validation failed:', validation.errors);
  }
  
  return config;
};

// Configuration presets for common scenarios
export const configPresets = {
  development: {
    ...defaultPKIConfig,
    staging: true,
    storage: { type: 'memory' as const },
    certValidityDays: 30,
  },
  
  staging: {
    ...defaultPKIConfig,
    staging: true,
    storage: { type: 'file' as const, path: './certs/staging' },
    certValidityDays: 90,
  },
  
  production: {
    ...defaultPKIConfig,
    staging: false,
    storage: { type: 'vault' as const },
    security: {
      requireHSM: true,
      keyProtection: 'hardware' as const,
    },
    certValidityDays: 90,
  },
  
  enterprise: {
    ...defaultPKIConfig,
    staging: false,
    storage: { type: 'vault' as const },
    security: {
      requireHSM: true,
      keyProtection: 'hardware' as const,
    },
    certValidityDays: 365,
    keyBits: 4096,
  },
};

// Export current configuration
export const pkiConfig = getPKIConfig();
