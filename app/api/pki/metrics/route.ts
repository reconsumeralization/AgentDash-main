// PKI Metrics API Route
// Provide PKI system metrics and statistics

import { NextRequest, NextResponse } from 'next/server';
import { PKIMetrics } from '@/lib/pki/types';

// GET /api/pki/metrics - Get PKI system metrics
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would calculate these metrics from your database
    // For this example, we'll return mock metrics
    const metrics: PKIMetrics = {
      totalCerts: 15,
      expiringCerts: 3,
      expiredCerts: 1,
      lastRenewal: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      renewalFailures: 2,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch PKI metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PKI metrics' },
      { status: 500 }
    );
  }
}
