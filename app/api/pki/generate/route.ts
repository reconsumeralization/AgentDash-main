// PKI Certificate Generation API Route
// Generate certificates and CSRs

import { NextRequest, NextResponse } from 'next/server';
import { 
  CertOptions, 
  CertificateError, 
  ValidationError 
} from '@/lib/pki/types';
import { generateCertificate } from '@/lib/pki/certificateGeneration';

// POST /api/pki/generate - Generate a new certificate or CSR
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      commonName,
      country = 'US',
      organization,
      organizationalUnit,
      locality,
      state,
      emailAddress,
      subjectAlternativeNames,
      validityDays = 90,
      selfSigned = true,
      keyUsage,
      extendedKeyUsage,
    } = body;

    // Validate required fields
    if (!commonName) {
      return NextResponse.json(
        { error: 'Common name is required' },
        { status: 400 }
      );
    }

    // Validate certificate options
    const certOptions: CertOptions = {
      commonName,
      country,
      organization,
      organizationalUnit,
      locality,
      state,
      emailAddress,
      subjectAlternativeNames: subjectAlternativeNames 
        ? (Array.isArray(subjectAlternativeNames) 
            ? subjectAlternativeNames 
            : subjectAlternativeNames.split(',').map((s: string) => s.trim()))
        : undefined,
      validityDays: parseInt(validityDays),
      selfSigned,
      keyUsage,
      extendedKeyUsage,
    };

    // Generate the certificate
    const result = await generateCertificate(certOptions);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to generate certificate:', error);

    if (error instanceof CertificateError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
