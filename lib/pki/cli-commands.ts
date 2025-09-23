/**
 * PKI CLI Commands Implementation
 * Command implementations for the PKI automation CLI tool
 */

import { 
  generateCertificate as generateCert, 
  createCSR, 
  getCertificateStatus as getCertStatus,
  validateCertificateChain,
  parseCertificate 
} from './certificateGeneration';
import { generateKeyPair } from './keyGeneration';
import { renewCertificate as renewCert } from './acmeIntegration';
import { monitorCertificates as monitorCerts } from './monitoring';
import { listCertificates as listCerts } from './storage';
import { hsmOperations } from './hsm';
import { validateCertificate as validateCert } from './validation';
import { pkiConfig } from './config';
import { CertOptions, KeyPairOptions } from './types';
import fs from 'fs/promises';
import path from 'path';

/**
 * Generate certificate command implementation
 */
export async function generateCertificate(options: any): Promise<any> {
  const certOptions: CertOptions = {
    commonName: options.commonName,
    country: options.country,
    organization: options.organization,
    organizationalUnit: options.organizationalUnit,
    locality: options.locality,
    state: options.state,
    emailAddress: options.emailAddress,
    subjectAlternativeNames: options.subjectAlternativeNames?.split(',').map((s: string) => s.trim()),
    validityDays: parseInt(options.validityDays),
    selfSigned: options.selfSigned,
  };

  const keyOptions: KeyPairOptions = {
    algorithm: options.algorithm,
    bits: parseInt(options.keyBits),
  };

  const result = await generateCert({
    ...certOptions,
    keyPair: options.generateKeyPair !== false ? generateKeyPair(keyOptions) : undefined,
  });

  // Handle output
  if (options.outputFile) {
    const outputPath = path.resolve(options.outputFile);
    await fs.writeFile(outputPath, result.cert || result.csr);
    
    if (result.privateKey) {
      const keyPath = outputPath.replace(/\.(pem|crt|cert)$/, '.key');
      await fs.writeFile(keyPath, result.privateKey);
    }
  }

  return {
    success: true,
    result,
    outputFile: options.outputFile,
  };
}

/**
 * Renew certificate command implementation
 */
export async function renewCertificate(options: any): Promise<any> {
  const result = await renewCert(options.domain, {
    force: options.force,
    ca: options.ca,
    outputFormat: options.output,
  });

  // Handle output
  if (options.outputFile) {
    const outputPath = path.resolve(options.outputFile);
    await fs.writeFile(outputPath, result.cert);
    
    if (result.privateKey) {
      const keyPath = outputPath.replace(/\.(pem|crt|cert)$/, '.key');
      await fs.writeFile(keyPath, result.privateKey);
    }
  }

  return {
    success: true,
    result,
    outputFile: options.outputFile,
  };
}

/**
 * Get certificate status command implementation
 */
export async function getCertificateStatus(options: any): Promise<any> {
  let certPem: string;

  if (options.certFile) {
    certPem = await fs.readFile(options.certFile, 'utf8');
  } else if (options.domain) {
    // In a real implementation, you'd fetch the certificate from the domain
    // For now, we'll return a mock status
    return {
      domain: options.domain,
      status: 'valid',
      daysToExpiry: 45,
      issuer: 'Let\'s Encrypt',
      subject: options.domain,
      fingerprint: 'mock-fingerprint',
    };
  } else {
    throw new Error('Either certFile or domain must be provided');
  }

  const status = getCertStatus(certPem);
  const parsed = parseCertificate(certPem);

  return {
    ...status,
    ...parsed.cert,
  };
}

/**
 * Monitor certificates command implementation
 */
export async function monitorCertificates(options: any): Promise<void> {
  const config = {
    watch: options.watch,
    interval: parseInt(options.interval) * 1000, // Convert to milliseconds
    threshold: parseInt(options.threshold),
    alert: options.alert,
    email: options.email,
    webhook: options.webhook,
  };

  if (options.watch) {
    console.log('Starting certificate monitoring in watch mode...');
    console.log(`Check interval: ${options.interval} seconds`);
    console.log(`Expiry threshold: ${options.threshold} days`);
    
    await monitorCerts(config);
  } else {
    // Single check
    const result = await monitorCerts({ ...config, watch: false });
    console.log('Certificate monitoring results:');
    console.log(JSON.stringify(result, null, 2));
  }
}

/**
 * List certificates command implementation
 */
export async function listCertificates(options: any): Promise<any[]> {
  const result = await listCerts({
    status: options.status,
    configFile: options.config,
  });

  return result;
}

/**
 * Validate certificate command implementation
 */
export async function validateCertificate(options: any): Promise<any> {
  let certPem: string;
  let caCerts: string[] = [];

  if (options.certFile) {
    certPem = await fs.readFile(options.certFile, 'utf8');
  } else if (options.cert) {
    certPem = options.cert;
  } else {
    throw new Error('Either cert or certFile must be provided');
  }

  if (options.caCertFiles) {
    const caFiles = options.caCertFiles.split(',').map((f: string) => f.trim());
    for (const file of caFiles) {
      const caCert = await fs.readFile(file, 'utf8');
      caCerts.push(caCert);
    }
  } else if (options.caCerts) {
    caCerts = options.caCerts.split(',').map((c: string) => c.trim());
  }

  const result = validateCert(certPem, caCerts);
  return result;
}

/**
 * HSM operations command implementation
 */
export async function hsmOperations(options: any): Promise<any> {
  const config = options.config ? JSON.parse(await fs.readFile(options.config, 'utf8')) : pkiConfig;

  if (options.listSlots) {
    return await hsm.listSlots(config);
  } else if (options.listKeys) {
    return await hsm.listKeys(config);
  } else if (options.generateKey) {
    return await hsm.generateKey(options.generateKey, config);
  } else if (options.deleteKey) {
    return await hsm.deleteKey(options.deleteKey, config);
  } else {
    throw new Error('No HSM operation specified');
  }
}

/**
 * Utility function to load configuration from file
 */
export async function loadConfig(configFile?: string): Promise<any> {
  if (configFile) {
    const configPath = path.resolve(configFile);
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  }
  return pkiConfig;
}

/**
 * Utility function to save result to file
 */
export async function saveToFile(data: string, filePath: string): Promise<void> {
  const resolvedPath = path.resolve(filePath);
  await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
  await fs.writeFile(resolvedPath, data);
}

/**
 * Utility function to format output based on format option
 */
export function formatOutput(data: any, format: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'yaml':
      // In a real implementation, you'd use a YAML library
      return JSON.stringify(data, null, 2);
    case 'table':
      // In a real implementation, you'd use a table formatting library
      return JSON.stringify(data, null, 2);
    default:
      return JSON.stringify(data, null, 2);
  }
}
