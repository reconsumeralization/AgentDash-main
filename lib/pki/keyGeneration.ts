// PKI Key Generation Utilities
// Secure key pair generation for PKI automation

import crypto from 'crypto';
import { KeyPairOptions, KeyPair, KeyGenerationError } from './types';
import { pkiConfig } from './config';

/**
 * Generate a secure key pair using Node.js crypto module
 * Supports RSA, ECDSA, and Ed25519 algorithms
 */
export function generateKeyPair(options: KeyPairOptions = {}): KeyPair {
  try {
    const { bits = pkiConfig.keyBits || 2048, algorithm = 'rsa', curve = 'prime256v1' } = options;

    // Validate key size based on security policy
    if (bits < 2048) {
      throw new KeyGenerationError('Key size must be at least 2048 bits for security compliance');
    }

    switch (algorithm) {
      case 'rsa':
        return generateRSAKeyPair(bits);
      
      case 'ecdsa':
        return generateECDSAKeyPair(curve);
      
      case 'ed25519':
        return generateEd25519KeyPair();
      
      default:
        throw new KeyGenerationError(`Unsupported algorithm: ${algorithm}`);
    }
  } catch (error) {
    if (error instanceof KeyGenerationError) {
      throw error;
    }
    throw new KeyGenerationError(`Failed to generate key pair: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate RSA key pair
 */
function generateRSAKeyPair(bits: number): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: bits,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return {
    publicKey,
    privateKey,
    algorithm: 'rsa',
    keySize: bits,
  };
}

/**
 * Generate ECDSA key pair
 */
function generateECDSAKeyPair(curve: string): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: curve,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return {
    publicKey,
    privateKey,
    algorithm: 'ecdsa',
    keySize: getCurveKeySize(curve),
  };
}

/**
 * Generate Ed25519 key pair
 */
function generateEd25519KeyPair(): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return {
    publicKey,
    privateKey,
    algorithm: 'ed25519',
    keySize: 256, // Ed25519 is always 256 bits
  };
}

/**
 * Get key size for ECDSA curves
 */
function getCurveKeySize(curve: string): number {
  const curveSizes: Record<string, number> = {
    'prime256v1': 256,
    'secp384r1': 384,
    'secp521r1': 521,
  };
  
  return curveSizes[curve] || 256;
}

/**
 * Generate a secure random passphrase for key encryption
 */
export function generatePassphrase(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Encrypt a private key with a passphrase
 */
export function encryptPrivateKey(privateKey: string, passphrase: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(passphrase, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
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
 * Decrypt a private key with a passphrase
 */
export function decryptPrivateKey(encryptedKey: string, passphrase: string): string {
  try {
    const { encrypted, iv, authTag, algorithm } = JSON.parse(encryptedKey);
    const key = crypto.scryptSync(passphrase, 'salt', 32);
    const decipher = crypto.createDecipher(algorithm, key);
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new KeyGenerationError('Failed to decrypt private key: Invalid passphrase or corrupted data');
  }
}

/**
 * Validate key pair integrity
 */
export function validateKeyPair(keyPair: KeyPair): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Validate public key format
    if (!keyPair.publicKey.includes('BEGIN PUBLIC KEY')) {
      errors.push('Invalid public key format');
    }

    // Validate private key format
    if (!keyPair.privateKey.includes('BEGIN PRIVATE KEY')) {
      errors.push('Invalid private key format');
    }

    // Test key pair compatibility
    const publicKeyObj = crypto.createPublicKey(keyPair.publicKey);
    const privateKeyObj = crypto.createPrivateKey(keyPair.privateKey);

    // Verify they are a matching pair by testing signature
    const testData = 'test-data';
    const signature = crypto.sign(null, Buffer.from(testData), privateKeyObj);
    const verified = crypto.verify(null, Buffer.from(testData), publicKeyObj, signature);

    if (!verified) {
      errors.push('Public and private keys do not match');
    }

    // Validate key size
    if (keyPair.keySize < 2048) {
      errors.push('Key size is below minimum security requirements');
    }

  } catch (error) {
    errors.push(`Key validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate key pair with secure storage options
 */
export async function generateSecureKeyPair(
  options: KeyPairOptions & { encrypt?: boolean; passphrase?: string } = {}
): Promise<KeyPair & { encryptedPrivateKey?: string }> {
  const keyPair = generateKeyPair(options);
  
  // Validate the generated key pair
  const validation = validateKeyPair(keyPair);
  if (!validation.isValid) {
    throw new KeyGenerationError(`Generated key pair validation failed: ${validation.errors.join(', ')}`);
  }

  const result: KeyPair & { encryptedPrivateKey?: string } = keyPair;

  // Encrypt private key if requested
  if (options.encrypt) {
    const passphrase = options.passphrase || generatePassphrase();
    result.encryptedPrivateKey = encryptPrivateKey(keyPair.privateKey, passphrase);
  }

  return result;
}

/**
 * Export key pair in various formats
 */
export function exportKeyPair(keyPair: KeyPair, format: 'pem' | 'der' | 'jwk' = 'pem'): {
  publicKey: string;
  privateKey: string;
} {
  switch (format) {
    case 'pem':
      return keyPair;
    
    case 'der':
      return {
        publicKey: crypto.createPublicKey(keyPair.publicKey).export({ type: 'spki', format: 'der' }).toString('base64'),
        privateKey: crypto.createPrivateKey(keyPair.privateKey).export({ type: 'pkcs8', format: 'der' }).toString('base64'),
      };
    
    case 'jwk':
      const publicKeyObj = crypto.createPublicKey(keyPair.publicKey);
      const privateKeyObj = crypto.createPrivateKey(keyPair.privateKey);
      
      return {
        publicKey: JSON.stringify(publicKeyObj.asymmetricKeyType === 'rsa' ? 
          publicKeyObj.asymmetricKeyDetails : publicKeyObj.asymmetricKeyDetails),
        privateKey: JSON.stringify(privateKeyObj.asymmetricKeyType === 'rsa' ? 
          privateKeyObj.asymmetricKeyDetails : privateKeyObj.asymmetricKeyDetails),
      };
    
    default:
      throw new KeyGenerationError(`Unsupported export format: ${format}`);
  }
}
