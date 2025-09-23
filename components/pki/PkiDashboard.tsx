"use client";

// PKI Management Dashboard Component
// Secure PKI certificate management interface

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Key, 
  Certificate, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  Certificate as CertificateType, 
  CertStatus, 
  KeyPair, 
  RenewalJob,
  PKIMetrics 
} from '@/lib/pki/types';

interface PkiDashboardProps {
  certificates?: CertificateType[];
  renewalJobs?: RenewalJob[];
  metrics?: PKIMetrics;
  onGenerateCert?: (options: any) => Promise<void>;
  onRenewCert?: (domain: string) => Promise<void>;
  onRevokeCert?: (certId: string) => Promise<void>;
  onDownloadCert?: (certId: string, format: string) => void;
  onUploadCert?: (file: File) => Promise<void>;
}

export default function PkiDashboard({
  certificates = [],
  renewalJobs = [],
  metrics,
  onGenerateCert,
  onRenewCert,
  onRevokeCert,
  onDownloadCert,
  onUploadCert,
}: PkiDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRenewing, setIsRenewing] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Certificate generation form state
  const [certForm, setCertForm] = useState({
    commonName: '',
    organization: '',
    country: 'US',
    validityDays: 90,
    selfSigned: true,
    subjectAlternativeNames: '',
  });

  const getCertStatusBadge = (status: CertStatus['status']) => {
    const statusConfig = {
      valid: { color: 'bg-green-500', icon: CheckCircle, text: 'Valid' },
      expiring: { color: 'bg-yellow-500', icon: AlertTriangle, text: 'Expiring' },
      expired: { color: 'bg-red-500', icon: XCircle, text: 'Expired' },
      invalid: { color: 'bg-red-500', icon: XCircle, text: 'Invalid' },
      error: { color: 'bg-gray-500', icon: XCircle, text: 'Error' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const handleGenerateCert = async () => {
    if (!onGenerateCert) return;

    setIsGenerating(true);
    try {
      const options = {
        ...certForm,
        subjectAlternativeNames: certForm.subjectAlternativeNames
          ? certForm.subjectAlternativeNames.split(',').map(s => s.trim())
          : undefined,
      };
      
      await onGenerateCert(options);
      
      // Reset form
      setCertForm({
        commonName: '',
        organization: '',
        country: 'US',
        validityDays: 90,
        selfSigned: true,
        subjectAlternativeNames: '',
      });
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRenewCert = async (domain: string) => {
    if (!onRenewCert) return;

    setIsRenewing(domain);
    try {
      await onRenewCert(domain);
    } catch (error) {
      console.error('Failed to renew certificate:', error);
    } finally {
      setIsRenewing(null);
    }
  };

  const handleUploadCert = async () => {
    if (!uploadFile || !onUploadCert) return;

    try {
      await onUploadCert(uploadFile);
      setUploadFile(null);
    } catch (error) {
      console.error('Failed to upload certificate:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysToExpiry = (validTo: Date | string) => {
    const now = new Date();
    const expiry = new Date(validTo);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PKI Management</h1>
          <p className="text-muted-foreground">
            Manage certificates, keys, and automated renewal
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrivateKeys(!showPrivateKeys)}
          >
            {showPrivateKeys ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPrivateKeys ? 'Hide' : 'Show'} Private Keys
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
              <Certificate className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCerts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.expiringCerts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.expiredCerts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renewal Failures</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.renewalFailures}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="renewal">Auto-Renewal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Certificates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Certificates</CardTitle>
                <CardDescription>
                  Latest certificates and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {certificates.slice(0, 5).map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{cert.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {formatDate(cert.validTo)}
                      </p>
                    </div>
                    {getCertStatusBadge(
                      getDaysToExpiry(cert.validTo) > 30 ? 'valid' : 
                      getDaysToExpiry(cert.validTo) > 0 ? 'expiring' : 'expired'
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Renewal Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Auto-Renewal Jobs</CardTitle>
                <CardDescription>
                  Scheduled certificate renewals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renewalJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{job.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        Next run: {job.nextRun ? formatDate(job.nextRun) : 'Not scheduled'}
                      </p>
                    </div>
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'failed' ? 'destructive' :
                      job.status === 'running' ? 'secondary' : 'outline'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Management</CardTitle>
              <CardDescription>
                View, download, and manage your certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.map((cert, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{cert.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          Serial: {cert.serialNumber} | Issuer: {cert.issuer}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getCertStatusBadge(
                          getDaysToExpiry(cert.validTo) > 30 ? 'valid' : 
                          getDaysToExpiry(cert.validTo) > 0 ? 'expiring' : 'expired'
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Valid From:</span> {formatDate(cert.validFrom)}
                      </div>
                      <div>
                        <span className="font-medium">Valid To:</span> {formatDate(cert.validTo)}
                      </div>
                      <div>
                        <span className="font-medium">Days to Expiry:</span> {getDaysToExpiry(cert.validTo)}
                      </div>
                      <div>
                        <span className="font-medium">Fingerprint:</span> {cert.fingerprint.substring(0, 16)}...
                      </div>
                    </div>

                    {showPrivateKeys && (
                      <div className="space-y-2">
                        <Label>Private Key</Label>
                        <Textarea
                          value={cert.privateKey}
                          readOnly
                          className="font-mono text-xs"
                          rows={4}
                        />
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadCert?.(cert.serialNumber, 'pem')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PEM
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadCert?.(cert.serialNumber, 'der')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download DER
                      </Button>
                      {getDaysToExpiry(cert.validTo) <= 30 && (
                        <Button
                          size="sm"
                          onClick={() => handleRenewCert(cert.subject)}
                          disabled={isRenewing === cert.subject}
                        >
                          {isRenewing === cert.subject ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Renew
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRevokeCert?.(cert.serialNumber)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Certificate</CardTitle>
              <CardDescription>
                Create a new certificate or certificate signing request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="commonName">Common Name *</Label>
                  <Input
                    id="commonName"
                    value={certForm.commonName}
                    onChange={(e) => setCertForm({ ...certForm, commonName: e.target.value })}
                    placeholder="example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={certForm.organization}
                    onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                    placeholder="My Company Inc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={certForm.country}
                    onChange={(e) => setCertForm({ ...certForm, country: e.target.value })}
                    placeholder="US"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="validityDays">Validity (Days)</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    value={certForm.validityDays}
                    onChange={(e) => setCertForm({ ...certForm, validityDays: parseInt(e.target.value) })}
                    min="1"
                    max="825"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectAlternativeNames">Subject Alternative Names</Label>
                <Input
                  id="subjectAlternativeNames"
                  value={certForm.subjectAlternativeNames}
                  onChange={(e) => setCertForm({ ...certForm, subjectAlternativeNames: e.target.value })}
                  placeholder="www.example.com, api.example.com, *.example.com"
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of additional domains/IPs
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="selfSigned"
                  checked={certForm.selfSigned}
                  onChange={(e) => setCertForm({ ...certForm, selfSigned: e.target.checked })}
                />
                <Label htmlFor="selfSigned">Generate self-signed certificate</Label>
              </div>

              <Button 
                onClick={handleGenerateCert}
                disabled={isGenerating || !certForm.commonName}
                className="w-full"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Certificate className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Certificate'}
              </Button>
            </CardContent>
          </Card>

          {/* Upload Certificate */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Certificate</CardTitle>
              <CardDescription>
                Import an existing certificate file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".pem,.crt,.cer,.p12,.pfx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                <Button 
                  onClick={handleUploadCert}
                  disabled={!uploadFile}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Renewal</CardTitle>
              <CardDescription>
                Manage automatic certificate renewal jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renewalJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{job.domain}</h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {job.id}
                        </p>
                      </div>
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'failed' ? 'destructive' :
                        job.status === 'running' ? 'secondary' : 'outline'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Scheduled:</span> {formatDate(job.scheduledFor)}
                      </div>
                      <div>
                        <span className="font-medium">Last Run:</span> {job.lastRun ? formatDate(job.lastRun) : 'Never'}
                      </div>
                      <div>
                        <span className="font-medium">Attempts:</span> {job.attempts}/{job.maxAttempts}
                      </div>
                      <div>
                        <span className="font-medium">Next Run:</span> {job.nextRun ? formatDate(job.nextRun) : 'Not scheduled'}
                      </div>
                    </div>

                    {job.error && (
                      <Alert className="mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{job.error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex space-x-2">
                      {job.status === 'failed' && job.attempts < job.maxAttempts && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      )}
                      <Button size="sm" variant="destructive">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
