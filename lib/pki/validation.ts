/**
 * Enhanced Error Handling and Validation
 * Zod-based validation and comprehensive error handling for PKI operations
 */

import { z } from 'zod';
import { PKIError, ValidationError, CertificateError, KeyGenerationError, ACMEError } from './types';
import { pkiConfig } from './config';
import winston from 'winston';

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Validation Schemas

/**
 * Domain name validation schema
 */
const domainSchema = z.string()
  .min(1, 'Domain name cannot be empty')
  .max(253, 'Domain name too long')
  .regex(/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/, 'Invalid domain name format')
  .refine((domain) => {
    // Additional validation for common domain patterns
    if (domain.includes('..')) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (domain.length > 0 && domain.split('.').every(part => part.length <= 63)) return true;
    return false;
  }, 'Invalid domain name structure');

/**
 * Email validation schema
 */
const emailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email address too long');

/**
 * Country code validation schema
 */
const countryCodeSchema = z.string()
  .length(2, 'Country code must be exactly 2 characters')
  .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters');

/**
 * Key size validation schema
 */
const keySizeSchema = z.number()
  .int('Key size must be an integer')
  .min(1024, 'Key size must be at least 1024 bits')
  .max(8192, 'Key size must not exceed 8192 bits')
  .refine((size) => {
    // RSA key sizes should be powers of 2 or common sizes
    if (size >= 1024 && size <= 4096) return true;
    if (size === 8192) return true;
    return false;
  }, 'Invalid key size for RSA');

/**
 * ECDSA curve validation schema
 */
const ecdsaCurveSchema = z.enum(['prime256v1', 'secp384r1', 'secp521r1'], {
  errorMap: () => ({ message: 'Invalid ECDSA curve. Must be one of: prime256v1, secp384r1, secp521r1' })
});

/**
 * Algorithm validation schema
 */
const algorithmSchema = z.enum(['rsa', 'ecdsa', 'ed25519'], {
  errorMap: () => ({ message: 'Invalid algorithm. Must be one of: rsa, ecdsa, ed25519' })
});

/**
 * Subject Alternative Name validation schema
 */
const sanSchema = z.string()
  .min(1, 'SAN cannot be empty')
  .refine((san) => {
    // Validate different SAN types
    if (san.includes('@')) {
      // Email address
      return emailSchema.safeParse(san).success;
    } else if (san.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      // IP address
      const parts = san.split('.').map(Number);
      return parts.every(part => part >= 0 && part <= 255);
    } else {
      // DNS name
      return domainSchema.safeParse(san).success;
    }
  }, 'Invalid Subject Alternative Name format');

/**
 * Certificate options validation schema
 */
export const certOptionsSchema = z.object({
  commonName: domainSchema,
  country: countryCodeSchema.optional(),
  organization: z.string().min(1, 'Organization name cannot be empty').max(64, 'Organization name too long').optional(),
  organizationalUnit: z.string().min(1, 'Organizational unit cannot be empty').max(64, 'Organizational unit too long').optional(),
  locality: z.string().min(1, 'Locality cannot be empty').max(64, 'Locality too long').optional(),
  state: z.string().min(1, 'State cannot be empty').max(64, 'State too long').optional(),
  emailAddress: emailSchema.optional(),
  subjectAlternativeNames: z.array(sanSchema).max(100, 'Too many Subject Alternative Names').optional(),
  validityDays: z.number()
    .int('Validity days must be an integer')
    .min(1, 'Validity must be at least 1 day')
    .max(825, 'Validity cannot exceed 825 days (RFC 5280)')
    .optional(),
  selfSigned: z.boolean().optional(),
  keyUsage: z.array(z.string()).optional(),
  extendedKeyUsage: z.array(z.string()).optional(),
});

/**
 * Key pair options validation schema
 */
export const keyPairOptionsSchema = z.object({
  bits: keySizeSchema.optional(),
  algorithm: algorithmSchema.optional(),
  curve: ecdsaCurveSchema.optional(),
});

/**
 * ACME options validation schema
 */
export const acmeOptionsSchema = z.object({
  directoryUrl: z.string().url('Invalid ACME directory URL').optional(),
  email: emailSchema,
  accountKey: z.string().min(1, 'Account key cannot be empty').optional(),
  termsOfServiceAgreed: z.boolean().optional(),
});

/**
 * HSM configuration validation schema
 */
export const hsmConfigSchema = z.object({
  enabled: z.boolean(),
  modulePath: z.string().min(1, 'HSM module path cannot be empty'),
  slot: z.number().int().min(0, 'HSM slot must be non-negative'),
  pin: z.string().min(1, 'HSM PIN cannot be empty'),
  provider: z.enum(['aws-cloudhsm', 'azure-keyvault', 'gcp-kms', 'vault', 'softhsm']),
  credentials: z.object({
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
    region: z.string().optional(),
    keyId: z.string().optional(),
  }).optional(),
});

/**
 * Storage configuration validation schema
 */
export const storageConfigSchema = z.object({
  type: z.enum(['memory', 'file', 'database', 'vault']),
  path: z.string().min(1, 'Storage path cannot be empty').optional(),
  connectionString: z.string().min(1, 'Connection string cannot be empty').optional(),
});

/**
 * PKI configuration validation schema
 */
export const pkiConfigSchema = z.object({
  caUrl: z.string().url('Invalid CA URL').optional(),
  keyBits: keySizeSchema.optional(),
  certValidityDays: z.number().int().min(1).max(825).optional(),
  autoRenewThresholdDays: z.number().int().min(1).max(365).optional(),
  email: emailSchema.optional(),
  staging: z.boolean().optional(),
  storage: storageConfigSchema.optional(),
  security: z.object({
    requireHSM: z.boolean().optional(),
    keyProtection: z.enum(['software', 'hardware']).optional(),
    encryptionKey: z.string().optional(),
  }).optional(),
});

/**
 * Certificate validation schema
 */
export const certificateSchema = z.object({
  cert: z.string().min(1, 'Certificate cannot be empty'),
  privateKey: z.string().min(1, 'Private key cannot be empty'),
  publicKey: z.string().min(1, 'Public key cannot be empty'),
  serialNumber: z.string().min(1, 'Serial number cannot be empty'),
  validFrom: z.date(),
  validTo: z.date(),
  issuer: z.string().min(1, 'Issuer cannot be empty'),
  subject: z.string().min(1, 'Subject cannot be empty'),
  fingerprint: z.string().min(1, 'Fingerprint cannot be empty'),
});

/**
 * CSR validation schema
 */
export const csrSchema = z.object({
  csr: z.string().min(1, 'CSR cannot be empty'),
  privateKey: z.string().min(1, 'Private key cannot be empty'),
  publicKey: z.string().min(1, 'Public key cannot be empty'),
  subject: z.string().min(1, 'Subject cannot be empty'),
});

/**
 * Validation result interface
 */
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

/**
 * Enhanced validation function with detailed error reporting
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: [],
        warnings: [],
      };
    } else {
      const errors = result.error.errors.map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
        return `${path}${err.message}`;
      });
      
      logger.warn('Validation failed', { 
        context, 
        errors,
        data: typeof data === 'object' ? Object.keys(data as object) : typeof data
      });
      
      return {
        success: false,
        errors,
        warnings: [],
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    logger.error('Validation error', { context, error: errorMessage });
    
    return {
      success: false,
      errors: [errorMessage],
      warnings: [],
    };
  }
}

/**
 * Validate certificate options
 */
export function validateCertOptions(options: unknown): ValidationResult {
  return validateWithSchema(certOptionsSchema, options, 'certificate options');
}

/**
 * Validate key pair options
 */
export function validateKeyPairOptions(options: unknown): ValidationResult {
  return validateWithSchema(keyPairOptionsSchema, options, 'key pair options');
}

/**
 * Validate ACME options
 */
export function validateACMEOptions(options: unknown): ValidationResult {
  return validateWithSchema(acmeOptionsSchema, options, 'ACME options');
}

/**
 * Validate HSM configuration
 */
export function validateHSMConfig(config: unknown): ValidationResult {
  return validateWithSchema(hsmConfigSchema, config, 'HSM configuration');
}

/**
 * Validate PKI configuration
 */
export function validatePKIConfig(config: unknown): ValidationResult {
  return validateWithSchema(pkiConfigSchema, config, 'PKI configuration');
}

/**
 * Validate certificate
 */
export function validateCertificate(cert: unknown): ValidationResult {
  return validateWithSchema(certificateSchema, cert, 'certificate');
}

/**
 * Validate CSR
 */
export function validateCSR(csr: unknown): ValidationResult {
  return validateWithSchema(csrSchema, csr, 'CSR');
}

/**
 * Enhanced error handler with context and logging
 */
export class EnhancedErrorHandler {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Handle validation errors
   */
  handleValidationError(error: z.ZodError, operation: string): ValidationError {
    const messages = error.errors.map(err => {
      const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
      return `${path}${err.message}`;
    });

    const validationError = new ValidationError(
      `Validation failed for ${operation}: ${messages.join(', ')}`,
      { errors: error.errors, operation, context: this.context }
    );

    logger.error('Validation error', {
      context: this.context,
      operation,
      errors: messages,
    });

    return validationError;
  }

  /**
   * Handle certificate errors
   */
  handleCertificateError(error: Error, operation: string, details?: any): CertificateError {
    const certError = new CertificateError(
      `Certificate operation failed: ${error.message}`,
      { operation, context: this.context, details }
    );

    logger.error('Certificate error', {
      context: this.context,
      operation,
      error: error.message,
      details,
    });

    return certError;
  }

  /**
   * Handle key generation errors
   */
  handleKeyGenerationError(error: Error, operation: string, details?: any): KeyGenerationError {
    const keyError = new KeyGenerationError(
      `Key generation failed: ${error.message}`,
      { operation, context: this.context, details }
    );

    logger.error('Key generation error', {
      context: this.context,
      operation,
      error: error.message,
      details,
    });

    return keyError;
  }

  /**
   * Handle ACME errors
   */
  handleACMEError(error: Error, operation: string, details?: any): ACMEError {
    const acmeError = new ACMEError(
      `ACME operation failed: ${error.message}`,
      { operation, context: this.context, details }
    );

    logger.error('ACME error', {
      context: this.context,
      operation,
      error: error.message,
      details,
    });

    return acmeError;
  }

  /**
   * Handle generic PKI errors
   */
  handlePKIError(error: Error, operation: string, code: string, details?: any): PKIError {
    const pkiError = new PKIError(
      `PKI operation failed: ${error.message}`,
      code,
      { operation, context: this.context, details }
    );

    logger.error('PKI error', {
      context: this.context,
      operation,
      code,
      error: error.message,
      details,
    });

    return pkiError;
  }
}

/**
 * Security validation functions
 */
export class SecurityValidator {
  /**
   * Validate key strength against security policy
   */
  static validateKeyStrength(algorithm: string, keySize: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (algorithm) {
      case 'rsa':
        if (keySize < 2048) {
          errors.push('RSA key size must be at least 2048 bits for security compliance');
        } else if (keySize < 3072) {
          warnings.push('Consider using RSA key size of 3072 bits or higher for better security');
        }
        break;
      case 'ecdsa':
        if (keySize < 256) {
          errors.push('ECDSA key size must be at least 256 bits');
        }
        break;
      case 'ed25519':
        if (keySize !== 256) {
          warnings.push('Ed25519 key size should be 256 bits');
        }
        break;
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate certificate validity period
   */
  static validateValidityPeriod(validityDays: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (validityDays > 825) {
      errors.push('Certificate validity cannot exceed 825 days (RFC 5280)');
    } else if (validityDays > 90) {
      warnings.push('Consider shorter certificate validity periods for better security');
    }

    if (validityDays < 1) {
      errors.push('Certificate validity must be at least 1 day');
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate domain name security
   */
  static validateDomainSecurity(domain: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for wildcard domains
    if (domain.includes('*')) {
      warnings.push('Wildcard certificates have security implications');
    }

    // Check for localhost/private IPs
    if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
      warnings.push('Localhost certificates should only be used for development');
    }

    // Check for suspicious patterns
    if (domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
      errors.push('Invalid domain name format');
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Input sanitization functions
 */
export class InputSanitizer {
  /**
   * Sanitize domain name
   */
  static sanitizeDomain(domain: string): string {
    return domain
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9.-]/g, '') // Remove invalid characters
      .replace(/\.+/g, '.') // Replace multiple dots with single dot
      .replace(/^\.|\.$/g, ''); // Remove leading/trailing dots
  }

  /**
   * Sanitize email address
   */
  static sanitizeEmail(email: string): string {
    return email
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9@.-]/g, ''); // Remove invalid characters
  }

  /**
   * Sanitize organization name
   */
  static sanitizeOrganization(org: string): string {
    return org
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
      .substring(0, 64); // Limit length
  }

  /**
   * Sanitize file path
   */
  static sanitizeFilePath(path: string): string {
    return path
      .replace(/\.\./g, '') // Remove directory traversal attempts
      .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
      .trim();
  }
}

// Export validation functions and schemas
export {
  domainSchema,
  emailSchema,
  countryCodeSchema,
  keySizeSchema,
  ecdsaCurveSchema,
  algorithmSchema,
  sanSchema,
  certOptionsSchema,
  keyPairOptionsSchema,
  acmeOptionsSchema,
  hsmConfigSchema,
  storageConfigSchema,
  pkiConfigSchema,
  certificateSchema,
  csrSchema,
};
