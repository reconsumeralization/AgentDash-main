/**
 * PKI HSM API Route
 * GET /api/pki/hsm - List HSM operations
 * POST /api/pki/hsm - Perform HSM operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { hsmOperations, HSMManager } from '@/lib/pki/hsm';
import { EnhancedErrorHandler } from '@/lib/pki/validation';
import { pkiConfig } from '@/lib/pki/config';

// Error handler for this route
const errorHandler = new EnhancedErrorHandler('PKI HSM API');

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation');
    const slotId = url.searchParams.get('slotId');

    let result;

    switch (operation) {
      case 'list-slots':
        result = await hsmOperations({ listSlots: true });
        break;
      
      case 'list-keys':
        result = await hsmOperations({ listKeys: true });
        break;
      
      case 'health':
        // Check HSM health
        const hsm = new HSMManager({
          enabled: pkiConfig.security?.requireHSM || false,
          modulePath: process.env.HSM_MODULE_PATH || '/usr/lib/softhsm/libsofthsm2.so',
          slot: parseInt(process.env.HSM_SLOT || '0'),
          pin: process.env.HSM_PIN || '1234',
          provider: (process.env.HSM_PROVIDER as any) || 'softhsm',
        });
        
        try {
          await hsm.initialize();
          result = { healthy: true, message: 'HSM is operational' };
        } catch (error) {
          result = { 
            healthy: false, 
            message: error instanceof Error ? error.message : 'HSM initialization failed' 
          };
        } finally {
          await hsm.finalize();
        }
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported operations: list-slots, list-keys, health' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      operation,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('HSM operation failed:', error);
    
    if (error instanceof Error) {
      const pkiError = errorHandler.handlePKIError(error, 'hsm-get', 'HSM_ERROR');
      
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...options } = body;

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation is required' },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case 'generate-key':
        if (!options.label) {
          return NextResponse.json(
            { error: 'Key label is required for key generation' },
            { status: 400 }
          );
        }
        result = await hsmOperations({ generateKey: options.label });
        break;
      
      case 'delete-key':
        if (!options.label) {
          return NextResponse.json(
            { error: 'Key label is required for key deletion' },
            { status: 400 }
          );
        }
        result = await hsmOperations({ deleteKey: options.label });
        break;
      
      case 'sign':
        if (!options.keyLabel || !options.data) {
          return NextResponse.json(
            { error: 'Key label and data are required for signing' },
            { status: 400 }
          );
        }
        
        const hsm = new HSMManager({
          enabled: pkiConfig.security?.requireHSM || false,
          modulePath: process.env.HSM_MODULE_PATH || '/usr/lib/softhsm/libsofthsm2.so',
          slot: parseInt(process.env.HSM_SLOT || '0'),
          pin: process.env.HSM_PIN || '1234',
          provider: (process.env.HSM_PROVIDER as any) || 'softhsm',
        });
        
        try {
          await hsm.initialize();
          const data = Buffer.from(options.data, 'base64');
          const signature = await hsm.signData(options.keyLabel, data);
          result = { signature: signature.toString('base64') };
        } finally {
          await hsm.finalize();
        }
        break;
      
      case 'verify':
        if (!options.keyLabel || !options.data || !options.signature) {
          return NextResponse.json(
            { error: 'Key label, data, and signature are required for verification' },
            { status: 400 }
          );
        }
        
        const hsmVerify = new HSMManager({
          enabled: pkiConfig.security?.requireHSM || false,
          modulePath: process.env.HSM_MODULE_PATH || '/usr/lib/softhsm/libsofthsm2.so',
          slot: parseInt(process.env.HSM_SLOT || '0'),
          pin: process.env.HSM_PIN || '1234',
          provider: (process.env.HSM_PROVIDER as any) || 'softhsm',
        });
        
        try {
          await hsmVerify.initialize();
          const data = Buffer.from(options.data, 'base64');
          const signature = Buffer.from(options.signature, 'base64');
          const verified = await hsmVerify.verifySignature(options.keyLabel, data, signature);
          result = { verified };
        } finally {
          await hsmVerify.finalize();
        }
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported operations: generate-key, delete-key, sign, verify' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      operation,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('HSM operation failed:', error);
    
    if (error instanceof Error) {
      const pkiError = errorHandler.handlePKIError(error, 'hsm-post', 'HSM_ERROR');
      
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
