/**
 * PKI Certificate Generation API Route
 * POST /api/pki/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCertificate } from '@/lib/pki/certificateGeneration';
import { generateKeyPair } from '@/lib/pki/keyGeneration';
import { validateCertOptions } from '@/lib/pki/validation';
import { EnhancedErrorHandler } from '@/lib/pki/validation';
import { createStorageManager } from '@/lib/pki/storage';
import { pkiConfig } from '@/lib/pki/config';
import { CertOptions, KeyPairOptions } from '@/lib/pki/types';

// Error handler for this route
const errorHandler = new EnhancedErrorHandler('PKI Generate API');

// Rate limiting (simplified - in production, use proper rate limiting)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(ip);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userRequests.count >= RATE_LIMIT) {
    return false;
  }

  userRequests.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate certificate options
    const validation = validateCertOptions(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid certificate options',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const certOptions: CertOptions = validation.data!;

    // Generate key pair if not provided
    let keyPair;
    if (body.keyPair) {
      keyPair = body.keyPair;
    } else {
      const keyOptions: KeyPairOptions = {
        algorithm: body.algorithm || 'rsa',
        bits: body.keyBits || pkiConfig.keyBits || 2048,
        curve: body.curve,
      };
      keyPair = generateKeyPair(keyOptions);
    }

    // Generate certificate
    const result = await generateCertificate({
      ...certOptions,
      keyPair,
      generateKeyPair: false,
    });

    // Store certificate if storage is configured
    const storageManager = createStorageManager();
    let storedCertId: string | undefined;

    if (result.cert) {
      try {
        storedCertId = await storageManager.storeCertificate(
          result as any, // Type assertion for stored certificate
          certOptions.commonName
        );
      } catch (storageError) {
        console.warn('Failed to store certificate:', storageError);
        // Continue without storage - certificate generation succeeded
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        id: storedCertId,
        domain: certOptions.commonName,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Certificate generation failed:', error);
    
    if (error instanceof Error) {
      const pkiError = errorHandler.handleCertificateError(error, 'generate', { clientIP });
      
      return NextResponse.json(
        { 
          error: pkiError.message,
          code: pkiError.code,
          details: pkiError.details 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return API documentation/status
    return NextResponse.json({
      endpoint: '/api/pki/generate',
      method: 'POST',
      description: 'Generate a new certificate or CSR',
      parameters: {
        commonName: {
          type: 'string',
          required: true,
          description: 'Common name (domain) for the certificate',
        },
        country: {
          type: 'string',
          required: false,
          description: 'Country code (e.g., US, CA)',
        },
        organization: {
          type: 'string',
          required: false,
          description: 'Organization name',
        },
        organizationalUnit: {
          type: 'string',
          required: false,
          description: 'Organizational unit',
        },
        locality: {
          type: 'string',
          required: false,
          description: 'City/locality',
        },
        state: {
          type: 'string',
          required: false,
          description: 'State or province',
        },
        emailAddress: {
          type: 'string',
          required: false,
          description: 'Email address',
        },
        subjectAlternativeNames: {
          type: 'array',
          required: false,
          description: 'Array of Subject Alternative Names',
        },
        validityDays: {
          type: 'number',
          required: false,
          description: 'Certificate validity in days (default: 90)',
        },
        selfSigned: {
          type: 'boolean',
          required: false,
          description: 'Generate self-signed certificate (default: false)',
        },
        algorithm: {
          type: 'string',
          required: false,
          description: 'Key algorithm (rsa, ecdsa, ed25519)',
          enum: ['rsa', 'ecdsa', 'ed25519'],
        },
        keyBits: {
          type: 'number',
          required: false,
          description: 'Key size in bits (default: 2048)',
        },
        curve: {
          type: 'string',
          required: false,
          description: 'ECDSA curve (prime256v1, secp384r1, secp521r1)',
          enum: ['prime256v1', 'secp384r1', 'secp521r1'],
        },
      },
      examples: {
        selfSigned: {
          commonName: 'example.com',
          country: 'US',
          organization: 'My Company',
          selfSigned: true,
          validityDays: 365,
        },
        csr: {
          commonName: 'example.com',
          country: 'US',
          organization: 'My Company',
          subjectAlternativeNames: ['www.example.com', 'api.example.com'],
        },
      },
    });

  } catch (error) {
    console.error('API documentation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}