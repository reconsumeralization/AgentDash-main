#!/usr/bin/env node

/**
 * PKI Automation CLI Tool
 * Command-line interface for PKI certificate management
 * 
 * Usage:
 *   pki-automate generate --commonName example.com --country US --organization MyOrg
 *   pki-automate renew --domain example.com
 *   pki-automate status --domain example.com
 *   pki-automate monitor --watch
 */

const { program } = require('commander');
const { generateCertificate, renewCertificate, getCertificateStatus, monitorCertificates } = require('../lib/pki/cli-commands');

// Configure CLI program
program
  .name('pki-automate')
  .description('PKI Automation CLI for certificate management')
  .version('1.0.0');

// Generate certificate command
program
  .command('generate')
  .description('Generate a new certificate or CSR')
  .option('--commonName <name>', 'Common name (domain) for the certificate')
  .option('--country <code>', 'Country code (e.g., US, CA)')
  .option('--organization <org>', 'Organization name')
  .option('--organizationalUnit <unit>', 'Organizational unit')
  .option('--locality <city>', 'City/locality')
  .option('--state <state>', 'State or province')
  .option('--emailAddress <email>', 'Email address')
  .option('--subjectAlternativeNames <sans>', 'Comma-separated list of SANs')
  .option('--validityDays <days>', 'Certificate validity in days', '90')
  .option('--selfSigned', 'Generate self-signed certificate')
  .option('--algorithm <algo>', 'Key algorithm (rsa, ecdsa, ed25519)', 'rsa')
  .option('--keyBits <bits>', 'Key size in bits', '2048')
  .option('--output <format>', 'Output format (pem, der, jwk)', 'pem')
  .option('--outputFile <file>', 'Output file path')
  .option('--encrypt', 'Encrypt private key')
  .option('--passphrase <pass>', 'Passphrase for encryption')
  .action(async (options) => {
    try {
      const result = await generateCertificate(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error generating certificate:', error.message);
      process.exit(1);
    }
  });

// Renew certificate command
program
  .command('renew')
  .description('Renew an existing certificate')
  .option('--domain <domain>', 'Domain to renew certificate for')
  .option('--force', 'Force renewal even if not expiring')
  .option('--ca <ca>', 'Certificate Authority (acme, custom, aws-acm)', 'acme')
  .option('--output <format>', 'Output format (pem, der)', 'pem')
  .option('--outputFile <file>', 'Output file path')
  .action(async (options) => {
    try {
      if (!options.domain) {
        throw new Error('Domain is required for renewal');
      }
      
      const result = await renewCertificate(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error renewing certificate:', error.message);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check certificate status')
  .option('--domain <domain>', 'Domain to check')
  .option('--certFile <file>', 'Certificate file path')
  .option('--format <format>', 'Output format (json, table)', 'json')
  .action(async (options) => {
    try {
      if (!options.domain && !options.certFile) {
        throw new Error('Either domain or certFile is required');
      }
      
      const result = await getCertificateStatus(options);
      
      if (options.format === 'table') {
        console.table(result);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error checking certificate status:', error.message);
      process.exit(1);
    }
  });

// Monitor command
program
  .command('monitor')
  .description('Monitor certificates for expiry')
  .option('--watch', 'Watch mode - continuously monitor')
  .option('--interval <seconds>', 'Check interval in seconds', '3600')
  .option('--threshold <days>', 'Expiry threshold in days', '30')
  .option('--alert', 'Send alerts for expiring certificates')
  .option('--email <email>', 'Email address for alerts')
  .option('--webhook <url>', 'Webhook URL for alerts')
  .option('--config <file>', 'Configuration file path')
  .action(async (options) => {
    try {
      await monitorCertificates(options);
    } catch (error) {
      console.error('Error monitoring certificates:', error.message);
      process.exit(1);
    }
  });

// List certificates command
program
  .command('list')
  .description('List all certificates')
  .option('--status <status>', 'Filter by status (valid, expired, expiring)')
  .option('--format <format>', 'Output format (json, table)', 'table')
  .option('--config <file>', 'Configuration file path')
  .action(async (options) => {
    try {
      const result = await listCertificates(options);
      
      if (options.format === 'table') {
        console.table(result);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error listing certificates:', error.message);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate certificate chain')
  .option('--cert <cert>', 'Certificate to validate')
  .option('--certFile <file>', 'Certificate file path')
  .option('--caCerts <certs>', 'Comma-separated CA certificates')
  .option('--caCertFiles <files>', 'Comma-separated CA certificate files')
  .action(async (options) => {
    try {
      if (!options.cert && !options.certFile) {
        throw new Error('Either cert or certFile is required');
      }
      
      const result = await validateCertificate(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error validating certificate:', error.message);
      process.exit(1);
    }
  });

// HSM commands
program
  .command('hsm')
  .description('HSM operations')
  .option('--list-slots', 'List available HSM slots')
  .option('--list-keys', 'List keys in HSM')
  .option('--generate-key <label>', 'Generate key in HSM')
  .option('--delete-key <label>', 'Delete key from HSM')
  .option('--config <file>', 'HSM configuration file')
  .action(async (options) => {
    try {
      const result = await hsmOperations(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error with HSM operations:', error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Handle unknown commands
program.on('command:*', () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
