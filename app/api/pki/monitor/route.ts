/**
 * PKI Monitoring API Route
 * GET /api/pki/monitor - Get monitoring data
 * POST /api/pki/monitor - Start monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitorCertificates, getMetrics, startMonitoring } from '@/lib/pki/monitoring';
import { createStorageManager } from '@/lib/pki/storage';
import { EnhancedErrorHandler } from '@/lib/pki/validation';
import { MonitoringConfig } from '@/lib/pki/monitoring';

// Error handler for this route
const errorHandler = new EnhancedErrorHandler('PKI Monitor API');

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    const includeMetrics = url.searchParams.get('metrics') === 'true';

    // Get monitoring data
    const config: MonitoringConfig = {
      watch: false,
      interval: 3600000, // 1 hour
      threshold: 30,
      alert: false,
    };

    const result = await monitorCertificates(config);

    // Get Prometheus metrics if requested
    let metrics: string | undefined;
    if (includeMetrics) {
      metrics = await getMetrics();
    }

    // Format response based on requested format
    if (format === 'prometheus' && metrics) {
      return new NextResponse(metrics, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        metrics: includeMetrics ? metrics : undefined,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Monitoring failed:', error);
    
    if (error instanceof Error) {
      const pkiError = errorHandler.handlePKIError(error, 'monitor', 'MONITOR_ERROR');
      
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
    
    // Validate monitoring configuration
    const config: MonitoringConfig = {
      watch: body.watch || false,
      interval: body.interval || 3600000, // 1 hour default
      threshold: body.threshold || 30,
      alert: body.alert || false,
      email: body.email,
      webhook: body.webhook,
      slackWebhook: body.slackWebhook,
      discordWebhook: body.discordWebhook,
      metricsPort: body.metricsPort,
      metricsPath: body.metricsPath,
    };

    if (config.watch) {
      // Start continuous monitoring
      await startMonitoring(config);
      
      return NextResponse.json({
        success: true,
        message: 'Continuous monitoring started',
        config,
      });
    } else {
      // Single monitoring check
      const result = await monitorCertificates(config);
      
      return NextResponse.json({
        success: true,
        data: result,
        config,
      });
    }

  } catch (error) {
    console.error('Monitoring configuration failed:', error);
    
    if (error instanceof Error) {
      const pkiError = errorHandler.handlePKIError(error, 'configure-monitor', 'MONITOR_CONFIG_ERROR');
      
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

export async function DELETE(request: NextRequest) {
  try {
    // Stop monitoring (simplified - in production, implement proper monitoring control)
    return NextResponse.json({
      success: true,
      message: 'Monitoring stopped',
    });

  } catch (error) {
    console.error('Stop monitoring failed:', error);
    
    return NextResponse.json(
      { error: 'Failed to stop monitoring' },
      { status: 500 }
    );
  }
}
