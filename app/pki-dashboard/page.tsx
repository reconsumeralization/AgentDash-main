"use client";

// PKI Dashboard Page
// Main page for PKI certificate management

import React from 'react';
import { usePKI } from '@/hooks/usePKI';
import PkiDashboard from '@/components/pki/PkiDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function PKIDashboardPage() {
  const {
    certificates,
    renewalJobs,
    metrics,
    loading,
    error,
    generateCertificate,
    renewCertificate,
    revokeCertificate,
    downloadCertificate,
    uploadCertificate,
    addRenewalJob,
    removeRenewalJob,
    processPendingRenewals,
  } = usePKI();

  if (loading && !certificates.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading PKI Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load PKI Dashboard: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">PKI Management</h1>
        <p className="text-xl text-muted-foreground">
          Secure certificate and key management for your applications
        </p>
      </div>

      {/* Security Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> This is a demonstration PKI automation module. 
          In production environments, ensure proper security measures including secure key storage, 
          HSM integration, and compliance with security policies.
        </AlertDescription>
      </Alert>

      {/* PKI Dashboard Component */}
      <PkiDashboard
        certificates={certificates}
        renewalJobs={renewalJobs}
        metrics={metrics}
        onGenerateCert={generateCertificate}
        onRenewCert={renewCertificate}
        onRevokeCert={revokeCertificate}
        onDownloadCert={downloadCertificate}
        onUploadCert={uploadCertificate}
      />

      {/* Features Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Key Generation</CardTitle>
            <CardDescription>
              Generate secure RSA, ECDSA, and Ed25519 key pairs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• RSA (2048-bit minimum)</li>
              <li>• ECDSA (P-256, P-384, P-521)</li>
              <li>• Ed25519 elliptic curves</li>
              <li>• Hardware Security Module support</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Management</CardTitle>
            <CardDescription>
              Create, validate, and manage X.509 certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Self-signed certificates</li>
              <li>• Certificate Signing Requests</li>
              <li>• Subject Alternative Names</li>
              <li>• Certificate chain validation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ACME Integration</CardTitle>
            <CardDescription>
              Automated certificate issuance and renewal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Let's Encrypt integration</li>
              <li>• HTTP-01 and DNS-01 challenges</li>
              <li>• Automatic renewal scheduling</li>
              <li>• Certificate revocation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Compliance</CardTitle>
            <CardDescription>
              Built-in security policies and validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• NIST guidelines compliance</li>
              <li>• RFC 5280 X.509 standards</li>
              <li>• Secure random generation</li>
              <li>• Key validation and testing</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation</CardTitle>
            <CardDescription>
              Scheduled tasks and automated workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Cron-based renewal jobs</li>
              <li>• Expiry monitoring</li>
              <li>• Failure retry logic</li>
              <li>• Metrics and alerting</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration</CardTitle>
            <CardDescription>
              Easy integration with Next.js applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• React hooks and components</li>
              <li>• API routes for automation</li>
              <li>• TypeScript support</li>
              <li>• Environment configuration</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            How to use the PKI automation module
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">1. Generate Certificate</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Create self-signed certificates for development or CSR for production.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Specify domain name and organization</li>
                <li>• Add Subject Alternative Names</li>
                <li>• Choose validity period</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. ACME Integration</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Set up automatic certificate renewal with Let's Encrypt.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Configure ACME email</li>
                <li>• Set up challenge handling</li>
                <li>• Schedule renewal jobs</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Monitor & Manage</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Track certificate status and manage renewals.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• View expiry dates and status</li>
                <li>• Download certificates</li>
                <li>• Revoke when needed</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">4. Security Best Practices</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Follow security guidelines for production use.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Use HSM for key storage</li>
                <li>• Implement proper access controls</li>
                <li>• Monitor for anomalies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
