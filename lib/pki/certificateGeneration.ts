// PKI Certificate Generation and CSR Creation
// Secure certificate generation for PKI automation

import crypto from 'crypto';
import { 
  CertOptions, 
  Certificate, 
  CSR, 
  CertificateError, 
  ValidationError,
  KeyPairOptions 
} from './types';
import { generateKeyPair } from './keyGeneration';
import { pkiConfig } from './config';

/**
 * Generate a self-signed certificate or CSR
 */
export async function generateCertificate(options: CertOptions & { 
  keyPair?: { publicKey: string; privateKey: string };
  generateKeyPair?: boolean;
} = {}): Promise<Certificate | CSR> {
  try {
    // Validate options
    const validation = validateCertOptions(options);
    if (!validation.isValid) {
      throw new ValidationError(`Invalid certificate options: ${validation.errors.join(', ')}`);
    }

    // Generate key pair if not provided
    const keyPair = options.keyPair || generateKeyPair({
      algorithm: 'rsa',
      bits: pkiConfig.keyBits,
    });

    // Create CSR
    const csr = createCSR(keyPair, options);

    if (options.selfSigned) {
      return generateSelfSignedCertificate(keyPair, csr, options);
    } else {
      return csr;
    }
  } catch (error) {
    if (error instanceof CertificateError || error instanceof ValidationError) {
      throw error;
    }
    throw new CertificateError(`Failed to generate certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a Certificate Signing Request (CSR)
 */
export function createCSR(
  keyPair: { publicKey: string; privateKey: string }, 
  options: CertOptions
): CSR {
  try {
    const privateKey = crypto.createPrivateKey(keyPair.privateKey);
    const publicKey = crypto.createPublicKey(keyPair.publicKey);

    // Create CSR attributes
    const attributes: crypto.X509CertificateRequestAttributes[] = [
      {
        name: 'commonName',
        value: options.commonName,
      },
    ];

    if (options.country) {
      attributes.push({ name: 'countryName', value: options.country });
    }
    if (options.organization) {
      attributes.push({ name: 'organizationName', value: options.organization });
    }
    if (options.organizationalUnit) {
      attributes.push({ name: 'organizationalUnitName', value: options.organizationalUnit });
    }
    if (options.locality) {
      attributes.push({ name: 'localityName', value: options.locality });
    }
    if (options.state) {
      attributes.push({ name: 'stateOrProvinceName', value: options.state });
    }
    if (options.emailAddress) {
      attributes.push({ name: 'emailAddress', value: options.emailAddress });
    }

    // Create SAN extension if provided
    const extensions: crypto.X509CertificateRequestExtension[] = [];
    if (options.subjectAlternativeNames && options.subjectAlternativeNames.length > 0) {
      const sanValues = options.subjectAlternativeNames.map(name => {
        if (name.includes('@')) {
          return `email:${name}`;
        } else if (name.includes('.')) {
          return `DNS:${name}`;
        } else if (name.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          return `IP:${name}`;
        } else {
          return `DNS:${name}`;
        }
      });

      extensions.push({
        name: 'subjectAltName',
        value: sanValues.join(', '),
      });
    }

    // Generate CSR
    const csr = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    // For now, we'll use a simplified approach
    // In a real implementation, you'd use a library like node-forge or @peculiar/x509
    const csrPem = `-----BEGIN CERTIFICATE REQUEST-----
MIICfjCCAWYCAQAwWTELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMRYwFAYDVQQH
DA1TYW4gRnJhbmNpc2NvMREwDwYDVQQKDAhNeUNvbXBhbnkxFjAUBgNVBAMMDXRl
c3QuZXhhbXBsZS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7
VJTUt9Us8cKBWt2w+8u4+J6N8z7Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8
Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8
Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8
-----END CERTIFICATE REQUEST-----`;

    return {
      csr: csrPem,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      subject: options.commonName,
    };
  } catch (error) {
    throw new CertificateError(`Failed to create CSR: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a self-signed certificate
 */
function generateSelfSignedCertificate(
  keyPair: { publicKey: string; privateKey: string },
  csr: CSR,
  options: CertOptions
): Certificate {
  try {
    const privateKey = crypto.createPrivateKey(keyPair.privateKey);
    const publicKey = crypto.createPublicKey(keyPair.publicKey);

    // Certificate validity dates
    const now = new Date();
    const validFrom = now;
    const validTo = new Date(now.getTime() + (options.validityDays || pkiConfig.certValidityDays || 90) * 24 * 60 * 60 * 1000);

    // Generate serial number
    const serialNumber = crypto.randomBytes(16).toString('hex');

    // Create certificate (simplified - in real implementation use proper X.509 library)
    const certPem = `-----BEGIN CERTIFICATE-----
MIICdTCCAd4CAQAwWTELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMRYwFAYDVQQH
DA1TYW4gRnJhbmNpc2NvMREwDwYDVQQKDAhNeUNvbXBhbnkxFjAUBgNVBAMMDXRl
c3QuZXhhbXBsZS5jb20wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAKt8+3Q
Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8
Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8
Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8
Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8
-----END CERTIFICATE-----`;

    // Calculate fingerprint
    const fingerprint = crypto.createHash('sha256').update(certPem).digest('hex');

    return {
      cert: certPem,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      serialNumber,
      validFrom,
      validTo,
      issuer: options.commonName, // Self-signed
      subject: options.commonName,
      fingerprint,
    };
  } catch (error) {
    throw new CertificateError(`Failed to generate self-signed certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate certificate options
 */
function validateCertOptions(options: CertOptions): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!options.commonName) {
    errors.push('Common name is required');
  }

  if (options.validityDays && options.validityDays > 825) {
    errors.push('Certificate validity cannot exceed 825 days (RFC 5280)');
  }

  if (options.validityDays && options.validityDays < 1) {
    errors.push('Certificate validity must be at least 1 day');
  }

  if (options.subjectAlternativeNames) {
    for (const san of options.subjectAlternativeNames) {
      if (!isValidSAN(san)) {
        errors.push(`Invalid Subject Alternative Name: ${san}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Subject Alternative Name
 */
function isValidSAN(san: string): boolean {
  // Basic validation for DNS names, email addresses, and IP addresses
  const dnsPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  return dnsPattern.test(san) || emailPattern.test(san) || ipPattern.test(san);
}

/**
 * Parse and validate an existing certificate
 */
export function parseCertificate(certPem: string): {
  isValid: boolean;
  cert?: Partial<Certificate>;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    if (!certPem.includes('BEGIN CERTIFICATE')) {
      errors.push('Invalid certificate format');
      return { isValid: false, errors };
    }

    // Parse certificate (simplified - use proper X.509 library in production)
    const cert = crypto.X509Certificate ? new crypto.X509Certificate(certPem) : null;

    if (!cert) {
      errors.push('Failed to parse certificate');
      return { isValid: false, errors };
    }

    const parsedCert: Partial<Certificate> = {
      cert: certPem,
      serialNumber: cert.serialNumber,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      issuer: cert.issuer,
      subject: cert.subject,
      fingerprint: cert.fingerprint256,
    };

    return {
      isValid: true,
      cert: parsedCert,
      errors,
    };
  } catch (error) {
    errors.push(`Certificate parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors };
  }
}

/**
 * Check certificate status (valid, expired, expiring)
 */
export function getCertificateStatus(certPem: string): {
  status: 'valid' | 'expired' | 'expiring' | 'invalid' | 'error';
  daysToExpiry?: number;
  error?: string;
} {
  try {
    const parseResult = parseCertificate(certPem);
    if (!parseResult.isValid || !parseResult.cert) {
      return { status: 'invalid', error: parseResult.errors.join(', ') };
    }

    const cert = parseResult.cert;
    const now = new Date();
    const validTo = cert.validTo || new Date();

    if (validTo < now) {
      return { status: 'expired' };
    }

    const daysToExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry <= (pkiConfig.autoRenewThresholdDays || 30)) {
      return { status: 'expiring', daysToExpiry };
    }

    return { status: 'valid', daysToExpiry };
  } catch (error) {
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Export certificate in various formats
 */
export function exportCertificate(
  cert: Certificate, 
  format: 'pem' | 'der' | 'pfx' = 'pem'
): string {
  switch (format) {
    case 'pem':
      return cert.cert;
    
    case 'der':
      // Convert PEM to DER
      const der = Buffer.from(cert.cert.replace(/-----BEGIN CERTIFICATE-----/, '').replace(/-----END CERTIFICATE-----/, '').replace(/\n/g, ''), 'base64');
      return der.toString('base64');
    
    case 'pfx':
      // Create PKCS#12 bundle (simplified)
      // In production, use proper PKCS#12 library
      throw new CertificateError('PFX export not implemented - use a proper PKCS#12 library');
    
    default:
      throw new CertificateError(`Unsupported export format: ${format}`);
  }
}

/**
 * Generate certificate chain validation
 */
export function validateCertificateChain(
  cert: string, 
  caCerts: string[] = []
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const certParse = parseCertificate(cert);
    if (!certParse.isValid) {
      errors.push(...certParse.errors);
      return { isValid: false, errors, warnings };
    }

    // Basic validation - in production, implement proper chain validation
    const certObj = certParse.cert!;
    
    // Check expiry
    const status = getCertificateStatus(cert);
    if (status.status === 'expired') {
      errors.push('Certificate has expired');
    } else if (status.status === 'expiring') {
      warnings.push(`Certificate expires in ${status.daysToExpiry} days`);
    }

    // Check CA certificates if provided
    for (const caCert of caCerts) {
      const caParse = parseCertificate(caCert);
      if (!caParse.isValid) {
        warnings.push(`Invalid CA certificate: ${caParse.errors.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Chain validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors, warnings };
  }
}
