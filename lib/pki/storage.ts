/**
 * PKI Storage Module
 * Certificate and key storage with support for multiple backends
 */

import { Certificate, CSR, KeyPair } from './types';
import { pkiConfig } from './config';
import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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

// Storage interfaces
export interface StorageBackend {
  store(key: string, value: any): Promise<void>;
  retrieve(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
  exists(key: string): Promise<boolean>;
}

export interface StoredCertificate {
  id: string;
  domain: string;
  cert: string;
  privateKey?: string;
  publicKey?: string;
  chain?: string;
  validFrom: Date;
  validTo: Date;
  issuer: string;
  subject: string;
  fingerprint: string;
  serialNumber: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface StoredKeyPair {
  id: string;
  label: string;
  publicKey: string;
  privateKey?: string;
  algorithm: string;
  keySize: number;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface StoredCSR {
  id: string;
  domain: string;
  csr: string;
  privateKey: string;
  publicKey: string;
  subject: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * File-based storage backend
 */
export class FileStorageBackend implements StorageBackend {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
  }

  async store(key: string, value: any): Promise<void> {
    const filePath = path.join(this.basePath, this.sanitizeKey(key));
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(value, null, 2));
  }

  async retrieve(key: string): Promise<any> {
    const filePath = path.join(this.basePath, this.sanitizeKey(key));
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, this.sanitizeKey(key));
    await fs.unlink(filePath);
  }

  async list(prefix?: string): Promise<string[]> {
    const searchPath = prefix ? path.join(this.basePath, this.sanitizeKey(prefix)) : this.basePath;
    
    try {
      const files = await this.getAllFiles(searchPath);
      return files.map(file => path.relative(this.basePath, file));
    } catch (error) {
      return [];
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.basePath, this.sanitizeKey(key));
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }
}

/**
 * Memory-based storage backend (for development/testing)
 */
export class MemoryStorageBackend implements StorageBackend {
  private storage: Map<string, any> = new Map();

  async store(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
  }

  async retrieve(key: string): Promise<any> {
    const value = this.storage.get(key);
    if (value === undefined) {
      throw new Error(`Key not found: ${key}`);
    }
    return value;
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async list(prefix?: string): Promise<string[]> {
    const keys = Array.from(this.storage.keys());
    if (prefix) {
      return keys.filter(key => key.startsWith(prefix));
    }
    return keys;
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }
}

/**
 * Database storage backend (mock implementation)
 */
export class DatabaseStorageBackend implements StorageBackend {
  private connectionString: string;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  async store(key: string, value: any): Promise<void> {
    // Mock database storage
    logger.info('Storing in database', { key, connectionString: this.connectionString });
  }

  async retrieve(key: string): Promise<any> {
    // Mock database retrieval
    logger.info('Retrieving from database', { key, connectionString: this.connectionString });
    return null;
  }

  async delete(key: string): Promise<void> {
    // Mock database deletion
    logger.info('Deleting from database', { key, connectionString: this.connectionString });
  }

  async list(prefix?: string): Promise<string[]> {
    // Mock database listing
    logger.info('Listing from database', { prefix, connectionString: this.connectionString });
    return [];
  }

  async exists(key: string): Promise<boolean> {
    // Mock database existence check
    logger.info('Checking existence in database', { key, connectionString: this.connectionString });
    return false;
  }
}

/**
 * Vault storage backend (mock implementation)
 */
export class VaultStorageBackend implements StorageBackend {
  private vaultUrl: string;
  private token: string;

  constructor(vaultUrl: string, token: string) {
    this.vaultUrl = vaultUrl;
    this.token = token;
  }

  async store(key: string, value: any): Promise<void> {
    // Mock vault storage
    logger.info('Storing in vault', { key, vaultUrl: this.vaultUrl });
  }

  async retrieve(key: string): Promise<any> {
    // Mock vault retrieval
    logger.info('Retrieving from vault', { key, vaultUrl: this.vaultUrl });
    return null;
  }

  async delete(key: string): Promise<void> {
    // Mock vault deletion
    logger.info('Deleting from vault', { key, vaultUrl: this.vaultUrl });
  }

  async list(prefix?: string): Promise<string[]> {
    // Mock vault listing
    logger.info('Listing from vault', { prefix, vaultUrl: this.vaultUrl });
    return [];
  }

  async exists(key: string): Promise<boolean> {
    // Mock vault existence check
    logger.info('Checking existence in vault', { key, vaultUrl: this.vaultUrl });
    return false;
  }
}

/**
 * PKI Storage Manager
 */
export class PKIStorageManager {
  private backend: StorageBackend;
  private encryptionKey?: string;

  constructor(backend: StorageBackend, encryptionKey?: string) {
    this.backend = backend;
    this.encryptionKey = encryptionKey;
  }

  /**
   * Store certificate
   */
  async storeCertificate(cert: Certificate, domain: string, metadata?: Record<string, any>): Promise<string> {
    const id = this.generateId();
    const storedCert: StoredCertificate = {
      id,
      domain,
      cert: cert.cert,
      privateKey: cert.privateKey,
      publicKey: cert.publicKey,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      issuer: cert.issuer,
      subject: cert.subject,
      fingerprint: cert.fingerprint,
      serialNumber: cert.serialNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata,
    };

    // Encrypt sensitive data if encryption key is provided
    if (this.encryptionKey && storedCert.privateKey) {
      storedCert.privateKey = this.encrypt(storedCert.privateKey);
    }

    await this.backend.store(`certificates/${id}`, storedCert);
    await this.backend.store(`certificates/by-domain/${domain}`, id);

    logger.info('Certificate stored', { id, domain, issuer: cert.issuer });
    return id;
  }

  /**
   * Retrieve certificate by ID
   */
  async getCertificate(id: string): Promise<StoredCertificate | null> {
    try {
      const storedCert = await this.backend.retrieve(`certificates/${id}`);
      
      // Decrypt private key if encrypted
      if (this.encryptionKey && storedCert.privateKey) {
        storedCert.privateKey = this.decrypt(storedCert.privateKey);
      }

      return storedCert;
    } catch (error) {
      logger.warn('Certificate not found', { id, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * Retrieve certificate by domain
   */
  async getCertificateByDomain(domain: string): Promise<StoredCertificate | null> {
    try {
      const id = await this.backend.retrieve(`certificates/by-domain/${domain}`);
      return await this.getCertificate(id);
    } catch (error) {
      logger.warn('Certificate not found for domain', { domain, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * List all certificates
   */
  async listCertificates(options?: { status?: string }): Promise<StoredCertificate[]> {
    try {
      const certIds = await this.backend.list('certificates/');
      const certificates: StoredCertificate[] = [];

      for (const id of certIds) {
        if (id.endsWith('.json') && !id.includes('/by-domain/')) {
          const certId = path.basename(id, '.json');
          const cert = await this.getCertificate(certId);
          if (cert) {
            // Filter by status if specified
            if (options?.status) {
              const now = new Date();
              const isExpired = cert.validTo < now;
              const isExpiring = cert.validTo.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
              
              if (options.status === 'expired' && !isExpired) continue;
              if (options.status === 'expiring' && (!isExpiring || isExpired)) continue;
              if (options.status === 'valid' && (isExpired || isExpiring)) continue;
            }
            
            certificates.push(cert);
          }
        }
      }

      return certificates;
    } catch (error) {
      logger.error('Failed to list certificates', { error: error instanceof Error ? error.message : 'Unknown error' });
      return [];
    }
  }

  /**
   * Delete certificate
   */
  async deleteCertificate(id: string): Promise<void> {
    try {
      const cert = await this.getCertificate(id);
      if (cert) {
        await this.backend.delete(`certificates/${id}`);
        await this.backend.delete(`certificates/by-domain/${cert.domain}`);
        logger.info('Certificate deleted', { id, domain: cert.domain });
      }
    } catch (error) {
      logger.error('Failed to delete certificate', { id, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Store key pair
   */
  async storeKeyPair(keyPair: KeyPair, label: string, metadata?: Record<string, any>): Promise<string> {
    const id = this.generateId();
    const storedKeyPair: StoredKeyPair = {
      id,
      label,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      algorithm: keyPair.algorithm,
      keySize: keyPair.keySize,
      createdAt: new Date(),
      metadata,
    };

    // Encrypt private key if encryption key is provided
    if (this.encryptionKey && storedKeyPair.privateKey) {
      storedKeyPair.privateKey = this.encrypt(storedKeyPair.privateKey);
    }

    await this.backend.store(`keypairs/${id}`, storedKeyPair);
    await this.backend.store(`keypairs/by-label/${label}`, id);

    logger.info('Key pair stored', { id, label, algorithm: keyPair.algorithm });
    return id;
  }

  /**
   * Retrieve key pair by ID
   */
  async getKeyPair(id: string): Promise<StoredKeyPair | null> {
    try {
      const storedKeyPair = await this.backend.retrieve(`keypairs/${id}`);
      
      // Decrypt private key if encrypted
      if (this.encryptionKey && storedKeyPair.privateKey) {
        storedKeyPair.privateKey = this.decrypt(storedKeyPair.privateKey);
      }

      return storedKeyPair;
    } catch (error) {
      logger.warn('Key pair not found', { id, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * Retrieve key pair by label
   */
  async getKeyPairByLabel(label: string): Promise<StoredKeyPair | null> {
    try {
      const id = await this.backend.retrieve(`keypairs/by-label/${label}`);
      return await this.getKeyPair(id);
    } catch (error) {
      logger.warn('Key pair not found for label', { label, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * List all key pairs
   */
  async listKeyPairs(): Promise<StoredKeyPair[]> {
    try {
      const keyPairIds = await this.backend.list('keypairs/');
      const keyPairs: StoredKeyPair[] = [];

      for (const id of keyPairIds) {
        if (id.endsWith('.json') && !id.includes('/by-label/')) {
          const keyPairId = path.basename(id, '.json');
          const keyPair = await this.getKeyPair(keyPairId);
          if (keyPair) {
            keyPairs.push(keyPair);
          }
        }
      }

      return keyPairs;
    } catch (error) {
      logger.error('Failed to list key pairs', { error: error instanceof Error ? error.message : 'Unknown error' });
      return [];
    }
  }

  /**
   * Delete key pair
   */
  async deleteKeyPair(id: string): Promise<void> {
    try {
      const keyPair = await this.getKeyPair(id);
      if (keyPair) {
        await this.backend.delete(`keypairs/${id}`);
        await this.backend.delete(`keypairs/by-label/${keyPair.label}`);
        logger.info('Key pair deleted', { id, label: keyPair.label });
      }
    } catch (error) {
      logger.error('Failed to delete key pair', { id, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Store CSR
   */
  async storeCSR(csr: CSR, domain: string, metadata?: Record<string, any>): Promise<string> {
    const id = this.generateId();
    const storedCSR: StoredCSR = {
      id,
      domain,
      csr: csr.csr,
      privateKey: csr.privateKey,
      publicKey: csr.publicKey,
      subject: csr.subject,
      createdAt: new Date(),
      metadata,
    };

    // Encrypt private key if encryption key is provided
    if (this.encryptionKey && storedCSR.privateKey) {
      storedCSR.privateKey = this.encrypt(storedCSR.privateKey);
    }

    await this.backend.store(`csrs/${id}`, storedCSR);
    await this.backend.store(`csrs/by-domain/${domain}`, id);

    logger.info('CSR stored', { id, domain, subject: csr.subject });
    return id;
  }

  /**
   * Retrieve CSR by ID
   */
  async getCSR(id: string): Promise<StoredCSR | null> {
    try {
      const storedCSR = await this.backend.retrieve(`csrs/${id}`);
      
      // Decrypt private key if encrypted
      if (this.encryptionKey && storedCSR.privateKey) {
        storedCSR.privateKey = this.decrypt(storedCSR.privateKey);
      }

      return storedCSR;
    } catch (error) {
      logger.warn('CSR not found', { id, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * List all CSRs
   */
  async listCSRs(): Promise<StoredCSR[]> {
    try {
      const csrIds = await this.backend.list('csrs/');
      const csrs: StoredCSR[] = [];

      for (const id of csrIds) {
        if (id.endsWith('.json') && !id.includes('/by-domain/')) {
          const csrId = path.basename(id, '.json');
          const csr = await this.getCSR(csrId);
          if (csr) {
            csrs.push(csr);
          }
        }
      }

      return csrs;
    } catch (error) {
      logger.error('Failed to list CSRs', { error: error instanceof Error ? error.message : 'Unknown error' });
      return [];
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Encrypt data
   */
  private encrypt(data: string): string {
    if (!this.encryptionKey) {
      return data;
    }

    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm,
    });
  }

  /**
   * Decrypt data
   */
  private decrypt(encryptedData: string): string {
    if (!this.encryptionKey) {
      return encryptedData;
    }

    try {
      const { encrypted, iv, authTag, algorithm } = JSON.parse(encryptedData);
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const decipher = crypto.createDecipher(algorithm, key);
      
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Failed to decrypt data', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error('Failed to decrypt data');
    }
  }
}

/**
 * Create storage manager based on configuration
 */
export function createStorageManager(): PKIStorageManager {
  const config = pkiConfig.storage;
  let backend: StorageBackend;

  switch (config?.type) {
    case 'file':
      backend = new FileStorageBackend(config.path || './certs');
      break;
    case 'database':
      if (!config.connectionString) {
        throw new Error('Database connection string is required for database storage');
      }
      backend = new DatabaseStorageBackend(config.connectionString);
      break;
    case 'vault':
      backend = new VaultStorageBackend(
        process.env.VAULT_URL || 'http://localhost:8200',
        process.env.VAULT_TOKEN || ''
      );
      break;
    case 'memory':
    default:
      backend = new MemoryStorageBackend();
      break;
  }

  return new PKIStorageManager(backend, pkiConfig.security?.encryptionKey);
}

// Export for use in other modules
export { PKIStorageManager, StorageBackend };
