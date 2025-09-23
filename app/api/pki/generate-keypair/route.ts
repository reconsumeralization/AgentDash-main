// PKI Key Pair Generation API Route
// Generate cryptographic key pairs

import { NextRequest, NextResponse } from 'next/server';
import { 
  KeyPairOptions, 
  KeyGenerationError 
} from '@/lib/pki/types';
import { generateSecureKeyPair } from '@/lib/pki/keyGeneration';

// POST /api/pki/generate-keypair - Generate a new key pair
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bits = 2048,
      algorithm = 'rsa',
      curve = 'prime256v1',
      encrypt = false,
      passphrase,
    } = body;

    // Validate key options
    const keyOptions: KeyPairOptions = {
      bits: parseInt(bits),
      algorithm,
      curve,
    };

    // Validate key size for security compliance
    if (keyOptions.bits < 2048) {
      return NextResponse.json(
        { error: 'Key size must be at least 2048 bits for security compliance' },
        { status: 400 }
      );
    }

    // Validate algorithm
    const allowedAlgorithms = ['rsa', 'ecdsa', 'ed25519'];
    if (!allowedAlgorithms.includes(keyOptions.algorithm)) {
      return NextResponse.json(
        { error: `Unsupported algorithm: ${keyOptions.algorithm}` },
        { status: 400 }
      );
    }

    // Generate the key pair
    const result = await generateSecureKeyPair({
      ...keyOptions,
      encrypt,
      passphrase,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to generate key pair:', error);

    if (error instanceof KeyGenerationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate key pair' },
      { status: 500 }
    );
  }
}
