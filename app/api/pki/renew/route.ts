// PKI Certificate Renewal API Route
// Handle certificate renewal via ACME

import { NextRequest, NextResponse } from 'next/server';
import { ACMEError } from '@/lib/pki/types';
import { createACMEClient } from '@/lib/pki/acmeIntegration';

// POST /api/pki/renew - Renew a certificate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, challengeType = 'http-01' } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required for certificate renewal' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainPattern.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Validate challenge type
    const allowedChallengeTypes = ['http-01', 'dns-01'];
    if (!allowedChallengeTypes.includes(challengeType)) {
      return NextResponse.json(
        { error: `Unsupported challenge type: ${challengeType}` },
        { status: 400 }
      );
    }

    // Get ACME configuration from environment
    const acmeOptions = {
      email: process.env.ADMIN_EMAIL || process.env.ACME_EMAIL,
      directoryUrl: process.env.ACME_CA_URL || 'https://acme-v02.api.letsencrypt.org/directory',
      staging: process.env.NODE_ENV !== 'production' || process.env.ACME_STAGING === 'true',
    };

    if (!acmeOptions.email) {
      return NextResponse.json(
        { error: 'ACME email not configured' },
        { status: 500 }
      );
    }

    // Create ACME client
    const acmeClient = createACMEClient(acmeOptions);

    // Initialize ACME client
    await acmeClient.initialize();

    // Request certificate renewal
    const renewedCert = await acmeClient.renewCertificate(domain);

    return NextResponse.json(renewedCert, { status: 200 });
  } catch (error) {
    console.error('Failed to renew certificate:', error);

    if (error instanceof ACMEError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to renew certificate' },
      { status: 500 }
    );
  }
}
