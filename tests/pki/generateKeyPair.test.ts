/**
 * PKI Key Generation Tests
 * Comprehensive test suite for key generation functionality
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { generateKeyPair, generateSecureKeyPair, validateKeyPair, encryptPrivateKey, decryptPrivateKey } from '../../lib/pki/keyGeneration';
import { KeyPairOptions } from '../../lib/pki/types';

describe('Key Generation', () => {
  beforeEach(() => {
    // Reset any mocks or state before each test
  });

  afterEach(() => {
    // Clean up after each test
  });

  describe('generateKeyPair', () => {
    test('should generate RSA key pair with default options', () => {
      const keyPair = generateKeyPair();
      
      expect(keyPair).toBeDefined();
      expect(keyPair.publicKey).toContain('BEGIN PUBLIC KEY');
      expect(keyPair.privateKey).toContain('BEGIN PRIVATE KEY');
      expect(keyPair.algorithm).toBe('rsa');
      expect(keyPair.keySize).toBe(2048);
    });

    test('should generate RSA key pair with custom key size', () => {
      const options: KeyPairOptions = {
        algorithm: 'rsa',
        bits: 4096,
      };
      
      const keyPair = generateKeyPair(options);
      
      expect(keyPair.keySize).toBe(4096);
      expect(keyPair.algorithm).toBe('rsa');
    });

    test('should generate ECDSA key pair', () => {
      const options: KeyPairOptions = {
        algorithm: 'ecdsa',
        curve: 'prime256v1',
      };
      
      const keyPair = generateKeyPair(options);
      
      expect(keyPair.algorithm).toBe('ecdsa');
      expect(keyPair.keySize).toBe(256);
    });

    test('should generate Ed25519 key pair', () => {
      const options: KeyPairOptions = {
        algorithm: 'ed25519',
      };
      
      const keyPair = generateKeyPair(options);
      
      expect(keyPair.algorithm).toBe('ed25519');
      expect(keyPair.keySize).toBe(256);
    });

    test('should throw error for invalid key size', () => {
      const options: KeyPairOptions = {
        algorithm: 'rsa',
        bits: 1024, // Below minimum
      };
      
      expect(() => generateKeyPair(options)).toThrow('Key size must be at least 2048 bits');
    });

    test('should throw error for unsupported algorithm', () => {
      const options: KeyPairOptions = {
        algorithm: 'unsupported' as any,
      };
      
      expect(() => generateKeyPair(options)).toThrow('Unsupported algorithm');
    });
  });

  describe('generateSecureKeyPair', () => {
    test('should generate and validate key pair', async () => {
      const keyPair = await generateSecureKeyPair();
      
      expect(keyPair).toBeDefined();
      expect(keyPair.publicKey).toContain('BEGIN PUBLIC KEY');
      expect(keyPair.privateKey).toContain('BEGIN PRIVATE KEY');
    });

    test('should generate encrypted key pair', async () => {
      const keyPair = await generateSecureKeyPair({
        encrypt: true,
        passphrase: 'test-passphrase',
      });
      
      expect(keyPair.encryptedPrivateKey).toBeDefined();
      expect(keyPair.encryptedPrivateKey).not.toBe(keyPair.privateKey);
    });

    test('should generate key pair with custom passphrase', async () => {
      const passphrase = 'custom-passphrase';
      const keyPair = await generateSecureKeyPair({
        encrypt: true,
        passphrase,
      });
      
      expect(keyPair.encryptedPrivateKey).toBeDefined();
      
      // Test decryption
      const decrypted = decryptPrivateKey(keyPair.encryptedPrivateKey!, passphrase);
      expect(decrypted).toBe(keyPair.privateKey);
    });
  });

  describe('validateKeyPair', () => {
    test('should validate correct key pair', () => {
      const keyPair = generateKeyPair();
      const validation = validateKeyPair(keyPair);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect invalid public key format', () => {
      const keyPair = generateKeyPair();
      keyPair.publicKey = 'invalid-public-key';
      
      const validation = validateKeyPair(keyPair);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid public key format');
    });

    test('should detect invalid private key format', () => {
      const keyPair = generateKeyPair();
      keyPair.privateKey = 'invalid-private-key';
      
      const validation = validateKeyPair(keyPair);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid private key format');
    });

    test('should detect mismatched key pair', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();
      
      // Mix keys from different pairs
      const mixedKeyPair = {
        ...keyPair1,
        privateKey: keyPair2.privateKey,
      };
      
      const validation = validateKeyPair(mixedKeyPair);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Public and private keys do not match');
    });
  });

  describe('encryptPrivateKey', () => {
    test('should encrypt private key', () => {
      const keyPair = generateKeyPair();
      const passphrase = 'test-passphrase';
      
      const encrypted = encryptPrivateKey(keyPair.privateKey, passphrase);
      
      expect(encrypted).not.toBe(keyPair.privateKey);
      expect(encrypted).toContain('encrypted');
      expect(encrypted).toContain('iv');
      expect(encrypted).toContain('authTag');
    });

    test('should generate different encrypted data for same input', () => {
      const keyPair = generateKeyPair();
      const passphrase = 'test-passphrase';
      
      const encrypted1 = encryptPrivateKey(keyPair.privateKey, passphrase);
      const encrypted2 = encryptPrivateKey(keyPair.privateKey, passphrase);
      
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decryptPrivateKey', () => {
    test('should decrypt private key with correct passphrase', () => {
      const keyPair = generateKeyPair();
      const passphrase = 'test-passphrase';
      
      const encrypted = encryptPrivateKey(keyPair.privateKey, passphrase);
      const decrypted = decryptPrivateKey(encrypted, passphrase);
      
      expect(decrypted).toBe(keyPair.privateKey);
    });

    test('should throw error for incorrect passphrase', () => {
      const keyPair = generateKeyPair();
      const passphrase = 'test-passphrase';
      const wrongPassphrase = 'wrong-passphrase';
      
      const encrypted = encryptPrivateKey(keyPair.privateKey, passphrase);
      
      expect(() => decryptPrivateKey(encrypted, wrongPassphrase)).toThrow('Failed to decrypt private key');
    });

    test('should throw error for corrupted data', () => {
      const corruptedData = 'corrupted-encrypted-data';
      const passphrase = 'test-passphrase';
      
      expect(() => decryptPrivateKey(corruptedData, passphrase)).toThrow('Failed to decrypt private key');
    });
  });

  describe('Performance Tests', () => {
    test('should generate key pair within reasonable time', () => {
      const startTime = Date.now();
      generateKeyPair();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should generate multiple key pairs efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        generateKeyPair();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10000); // 5 key pairs should complete within 10 seconds
    });
  });

  describe('Security Tests', () => {
    test('should generate unique key pairs', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();
      
      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    });

    test('should use secure random generation', () => {
      const keyPairs = new Set();
      
      // Generate multiple key pairs and ensure they're all unique
      for (let i = 0; i < 10; i++) {
        const keyPair = generateKeyPair();
        keyPairs.add(keyPair.publicKey);
      }
      
      expect(keyPairs.size).toBe(10); // All should be unique
    });

    test('should not expose private key in public key', () => {
      const keyPair = generateKeyPair();
      
      expect(keyPair.publicKey).not.toContain(keyPair.privateKey);
      expect(keyPair.privateKey).not.toContain(keyPair.publicKey);
    });
  });
});
