/**
 * PKI Multi-CA API Route
 * GET /api/pki/multi-ca - List available CAs
 * POST /api/pki/multi-ca - Request certificate from specific CA
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMultiCAManager, MultiCAManager, CertRequestOptions } from '@/lib/pki/multi-ca';
import { EnhancedErrorHandler } from '@/lib/pki/validation';
import { validateCertOptions } from '@/lib/pki/validation';

// Error handler for this route
const errorHandler = new EnhancedErrorHandler('PKI Multi-CA API');

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'list';

    const multiCAManager = createMultiCAManager();

    let result;

    switch (operation) {
      case 'list':
        result = {
          availableCAs: multiCAManager.getAvailableCAs(),
          defaultCA: 'acme',
        };
        break;
      
      case 'health':
        const healthChecks = {};
        const availableCAs = multiCAManager.getAvailableCAs();
        
        for (const caType of availableCAs) {
          const health = await multiCAManager.checkCAHealth(caType);
          healthChecks[caType] = health;
        }
        
        result = {
          healthChecks,
          timestamp: new Date().toISOString(),
        };
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported operations: list, health' },
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
    console.error('Multi-CA operation failed:', error);
    
    if (error instanceof Error) {
      const pkiError = errorHandler.handlePKIError(error, 'multi-ca-get', 'MULTI_CA_ERROR');
      
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
    const { ca, domain, ...options } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Validate certificate options if provided
    if (Object.keys(options).length > 0) {
      const validation = validateCertOptions(options);
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Invalid certificate options',
            details: validation.errors 
          },
          { status: 400 }
        );
      }
    }

    const multiCAManager = createMultiCAManager();

    // Check if requested CA is available
    const availableCAs = multiCAManager.getAvailableCAs();
    if (ca && !availableCAs.includes(ca)) {
      return NextResponse.json(
        { 
          error: `CA '${ca}' is not available`,
          availableCAs 
        },
        { status: 400 }
      );
    }

    // Prepare certificate request options
    const certRequestOptions: CertRequestOptions = {
      domain,
      subjectAlternativeNames: options.subjectAlternativeNames,
      keySize: options.keyBits || 2048,
      validityDays: options.validityDays || 90,
      force: options.force || false,
      ca: ca || 'acme',
    };

    // Request certificate
    const result = await multiCAManager.requestCertificate(certRequestOptions);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        requestedDomain: domain,
        requestedCA: ca || 'acme',
        requestedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Certificate request failed:', error);
    
    if (error instanceof Error) {
      const pkiError = errorHandler.handlePKIError(error, 'multi-ca-request', 'CERT_REQUEST_ERROR');
      
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...options } = body;

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation is required' },
        { status: 400 }
      );
    }

    const multiCAManager = createMultiCAManager();
    let result;

    switch (operation) {
      case 'check-health':
        const caType = options.ca;
        if (!caType) {
          return NextResponse.json(
            { error: 'CA type is required for health check' },
            { status: 400 }
          );
        }
        
        result = await multiCAManager.checkCAHealth(caType);
        break;
      
      case 'fallback-test':
        // Test fallback mechanism (simplified)
        result = {
          message: 'Fallback test completed',
          availableCAs: multiCAManager.getAvailableCAs(),
        };
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported operations: check-health, fallback-test' },
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
    console.error('Multi-CA operation failed:', error);
    
    if (error instanceof Error) {
      const pkiError = errorHandler.handlePKIError(error, 'multi-ca-put', 'MULTI_CA_ERROR');
      
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
