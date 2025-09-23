/**
 * PKI Monitoring and Metrics
 * Prometheus metrics and monitoring for certificate expiry and PKI operations
 */

import client from 'prom-client';
import { getCertificateStatus, parseCertificate } from './certificateGeneration';
import { pkiConfig } from './config';
import { CertStatus, PKIMetrics } from './types';
import winston from 'winston';
import nodemailer from 'nodemailer';
import { WebhookClient } from 'discord.js';

// Prometheus metrics registry
const register = new client.Registry();

// Certificate expiry metrics
export const certExpiryGauge = new client.Gauge({
  name: 'pki_cert_expiry_days',
  help: 'Days until certificate expiry',
  labelNames: ['domain', 'issuer', 'status'],
  registers: [register],
});

export const certStatusGauge = new client.Gauge({
  name: 'pki_cert_status',
  help: 'Certificate status (1=valid, 2=expiring, 3=expired, 4=invalid)',
  labelNames: ['domain', 'issuer'],
  registers: [register],
});

// PKI operation metrics
export const certGenerationCounter = new client.Counter({
  name: 'pki_cert_generated_total',
  help: 'Total number of certificates generated',
  labelNames: ['type', 'algorithm', 'key_size'],
  registers: [register],
});

export const certRenewalCounter = new client.Counter({
  name: 'pki_cert_renewed_total',
  help: 'Total number of certificates renewed',
  labelNames: ['domain', 'ca'],
  registers: [register],
});

export const certRenewalFailureCounter = new client.Counter({
  name: 'pki_cert_renewal_failures_total',
  help: 'Total number of certificate renewal failures',
  labelNames: ['domain', 'ca', 'error_type'],
  registers: [register],
});

export const hsmOperationCounter = new client.Counter({
  name: 'pki_hsm_operations_total',
  help: 'Total number of HSM operations',
  labelNames: ['operation', 'status'],
  registers: [register],
});

// Performance metrics
export const certGenerationDuration = new client.Histogram({
  name: 'pki_cert_generation_duration_seconds',
  help: 'Duration of certificate generation',
  labelNames: ['type', 'algorithm'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const certRenewalDuration = new client.Histogram({
  name: 'pki_cert_renewal_duration_seconds',
  help: 'Duration of certificate renewal',
  labelNames: ['ca'],
  buckets: [1, 5, 10, 30, 60, 120, 300, 600],
  registers: [register],
});

// System metrics
export const activeCertificatesGauge = new client.Gauge({
  name: 'pki_active_certificates',
  help: 'Number of active certificates',
  labelNames: ['status'],
  registers: [register],
});

export const storageUsageGauge = new client.Gauge({
  name: 'pki_storage_usage_bytes',
  help: 'Storage usage in bytes',
  labelNames: ['type'],
  registers: [register],
});

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/pki-monitoring.log' }),
  ],
});

// Monitoring configuration
export interface MonitoringConfig {
  watch: boolean;
  interval: number;
  threshold: number;
  alert: boolean;
  email?: string;
  webhook?: string;
  slackWebhook?: string;
  discordWebhook?: string;
  metricsPort?: number;
  metricsPath?: string;
}

// Certificate monitoring result
export interface MonitoringResult {
  timestamp: Date;
  totalCerts: number;
  validCerts: number;
  expiringCerts: number;
  expiredCerts: number;
  invalidCerts: number;
  alerts: Alert[];
  metrics: string;
}

// Alert information
export interface Alert {
  type: 'expiring' | 'expired' | 'invalid' | 'renewal_failed';
  domain: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  daysToExpiry?: number;
}

/**
 * Monitor certificates for expiry and other issues
 */
export async function monitorCertificates(config: MonitoringConfig): Promise<MonitoringResult> {
  const startTime = Date.now();
  
  try {
    // Get all certificates from storage
    const certificates = await getAllCertificates();
    
    const result: MonitoringResult = {
      timestamp: new Date(),
      totalCerts: certificates.length,
      validCerts: 0,
      expiringCerts: 0,
      expiredCerts: 0,
      invalidCerts: 0,
      alerts: [],
      metrics: '',
    };

    // Check each certificate
    for (const cert of certificates) {
      const status = getCertificateStatus(cert.cert);
      const parsed = parseCertificate(cert.cert);
      
      // Update metrics
      updateCertificateMetrics(cert.domain, status, parsed.cert?.issuer || 'unknown');
      
      // Categorize certificates
      switch (status.status) {
        case 'valid':
          result.validCerts++;
          break;
        case 'expiring':
          result.expiringCerts++;
          if (status.daysToExpiry && status.daysToExpiry <= config.threshold) {
            result.alerts.push({
              type: 'expiring',
              domain: cert.domain,
              message: `Certificate expires in ${status.daysToExpiry} days`,
              severity: status.daysToExpiry <= 7 ? 'critical' : status.daysToExpiry <= 14 ? 'high' : 'medium',
              timestamp: new Date(),
              daysToExpiry: status.daysToExpiry,
            });
          }
          break;
        case 'expired':
          result.expiredCerts++;
          result.alerts.push({
            type: 'expired',
            domain: cert.domain,
            message: 'Certificate has expired',
            severity: 'critical',
            timestamp: new Date(),
          });
          break;
        case 'invalid':
          result.invalidCerts++;
          result.alerts.push({
            type: 'invalid',
            domain: cert.domain,
            message: status.error || 'Certificate is invalid',
            severity: 'high',
            timestamp: new Date(),
          });
          break;
      }
    }

    // Update system metrics
    updateSystemMetrics(result);
    
    // Generate Prometheus metrics
    result.metrics = await register.metrics();
    
    // Send alerts if configured
    if (config.alert && result.alerts.length > 0) {
      await sendAlerts(result.alerts, config);
    }
    
    // Log monitoring results
    logger.info('Certificate monitoring completed', {
      duration: Date.now() - startTime,
      ...result,
    });

    return result;
  } catch (error) {
    logger.error('Certificate monitoring failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Update certificate-specific metrics
 */
function updateCertificateMetrics(domain: string, status: CertStatus, issuer: string): void {
  // Update expiry gauge
  if (status.daysToExpiry !== undefined) {
    certExpiryGauge.set({ domain, issuer, status: status.status }, status.daysToExpiry);
  }
  
  // Update status gauge
  const statusValue = status.status === 'valid' ? 1 : 
                     status.status === 'expiring' ? 2 : 
                     status.status === 'expired' ? 3 : 4;
  certStatusGauge.set({ domain, issuer }, statusValue);
}

/**
 * Update system-wide metrics
 */
function updateSystemMetrics(result: MonitoringResult): void {
  activeCertificatesGauge.set({ status: 'valid' }, result.validCerts);
  activeCertificatesGauge.set({ status: 'expiring' }, result.expiringCerts);
  activeCertificatesGauge.set({ status: 'expired' }, result.expiredCerts);
  activeCertificatesGauge.set({ status: 'invalid' }, result.invalidCerts);
}

/**
 * Get all certificates from storage
 */
async function getAllCertificates(): Promise<Array<{ domain: string; cert: string }>> {
  // Mock implementation - in production, fetch from actual storage
  return [
    {
      domain: 'example.com',
      cert: `-----BEGIN CERTIFICATE-----
MIICdTCCAd4CAQAwWTELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMRYwFAYDVQQH
DA1TYW4gRnJhbmNpc2NvMREwDwYDVQQKDAhNeUNvbXBhbnkxFjAUBgNVBAMMDXRl
c3QuZXhhbXBsZS5jb20wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAKt8+3Q
-----END CERTIFICATE-----`,
    },
  ];
}

/**
 * Send alerts via configured channels
 */
async function sendAlerts(alerts: Alert[], config: MonitoringConfig): Promise<void> {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const highAlerts = alerts.filter(a => a.severity === 'high');
  
  // Send email alerts
  if (config.email) {
    await sendEmailAlert(alerts, config.email);
  }
  
  // Send webhook alerts
  if (config.webhook) {
    await sendWebhookAlert(alerts, config.webhook);
  }
  
  // Send Slack alerts
  if (config.slackWebhook) {
    await sendSlackAlert(alerts, config.slackWebhook);
  }
  
  // Send Discord alerts
  if (config.discordWebhook) {
    await sendDiscordAlert(alerts, config.discordWebhook);
  }
}

/**
 * Send email alert
 */
async function sendEmailAlert(alerts: Alert[], email: string): Promise<void> {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const subject = `PKI Alert: ${criticalCount} critical certificate issues`;

    const html = `
      <h2>PKI Certificate Alerts</h2>
      <p>Found ${alerts.length} certificate issues:</p>
      <ul>
        ${alerts.map(alert => `
          <li>
            <strong>${alert.severity.toUpperCase()}</strong>: ${alert.domain} - ${alert.message}
            ${alert.daysToExpiry ? ` (${alert.daysToExpiry} days remaining)` : ''}
          </li>
        `).join('')}
      </ul>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'pki-alerts@example.com',
      to: email,
      subject,
      html,
    });

    logger.info('Email alert sent', { email, alertCount: alerts.length });
  } catch (error) {
    logger.error('Failed to send email alert', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * Send webhook alert
 */
async function sendWebhookAlert(alerts: Alert[], webhookUrl: string): Promise<void> {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      alerts: alerts.map(alert => ({
        type: alert.type,
        domain: alert.domain,
        message: alert.message,
        severity: alert.severity,
        daysToExpiry: alert.daysToExpiry,
      })),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
    }

    logger.info('Webhook alert sent', { webhookUrl, alertCount: alerts.length });
  } catch (error) {
    logger.error('Failed to send webhook alert', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(alerts: Alert[], slackWebhook: string): Promise<void> {
  try {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const color = criticalAlerts.length > 0 ? 'danger' : 'warning';
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 PKI Certificate Alerts (${alerts.length} issues)`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: alerts.map(alert => 
            `*${alert.severity.toUpperCase()}*: \`${alert.domain}\` - ${alert.message}`
          ).join('\n'),
        },
      },
    ];

    const payload = {
      attachments: [
        {
          color,
          blocks,
        },
      ],
    };

    const response = await fetch(slackWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook request failed: ${response.status} ${response.statusText}`);
    }

    logger.info('Slack alert sent', { alertCount: alerts.length });
  } catch (error) {
    logger.error('Failed to send Slack alert', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * Send Discord alert
 */
async function sendDiscordAlert(alerts: Alert[], discordWebhook: string): Promise<void> {
  try {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const color = criticalAlerts.length > 0 ? 0xff0000 : 0xffaa00; // Red for critical, orange for others
    
    const embed = {
      title: '🚨 PKI Certificate Alerts',
      description: `Found ${alerts.length} certificate issues`,
      color,
      fields: alerts.map(alert => ({
        name: `${alert.severity.toUpperCase()}: ${alert.domain}`,
        value: alert.message + (alert.daysToExpiry ? ` (${alert.daysToExpiry} days remaining)` : ''),
        inline: false,
      })),
      timestamp: new Date().toISOString(),
    };

    const payload = {
      embeds: [embed],
    };

    const response = await fetch(discordWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook request failed: ${response.status} ${response.statusText}`);
    }

    logger.info('Discord alert sent', { alertCount: alerts.length });
  } catch (error) {
    logger.error('Failed to send Discord alert', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * Start continuous monitoring
 */
export async function startMonitoring(config: MonitoringConfig): Promise<void> {
  if (!config.watch) {
    return;
  }

  logger.info('Starting continuous certificate monitoring', { config });
  
  const monitor = async () => {
    try {
      await monitorCertificates(config);
    } catch (error) {
      logger.error('Monitoring cycle failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  // Initial check
  await monitor();
  
  // Set up interval
  setInterval(monitor, config.interval);
}

/**
 * Get Prometheus metrics
 */
export async function getMetrics(): Promise<string> {
  return await register.metrics();
}

/**
 * Reset metrics (useful for testing)
 */
export function resetMetrics(): void {
  register.clear();
}

// Export metrics registry for use in API routes
export { register };
