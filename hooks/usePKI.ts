// PKI React Hooks
// Custom hooks for PKI certificate management in React components

import { useState, useEffect, useCallback } from 'react';
import { 
  Certificate, 
  CertStatus, 
  KeyPair, 
  RenewalJob, 
  PKIMetrics,
  CertOptions,
  ACMECertificate 
} from '@/lib/pki/types';

// Hook for managing PKI status and operations
export function usePKI() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [renewalJobs, setRenewalJobs] = useState<RenewalJob[]>([]);
  const [metrics, setMetrics] = useState<PKIMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load PKI data
  const loadPKIData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch certificates
      const certsResponse = await fetch('/api/pki/certificates');
      if (!certsResponse.ok) throw new Error('Failed to fetch certificates');
      const certs = await certsResponse.json();
      setCertificates(certs);

      // Fetch renewal jobs
      const jobsResponse = await fetch('/api/pki/renewal-jobs');
      if (!jobsResponse.ok) throw new Error('Failed to fetch renewal jobs');
      const jobs = await jobsResponse.json();
      setRenewalJobs(jobs);

      // Fetch metrics
      const metricsResponse = await fetch('/api/pki/metrics');
      if (!metricsResponse.ok) throw new Error('Failed to fetch metrics');
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate certificate
  const generateCertificate = useCallback(async (options: CertOptions): Promise<Certificate> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pki/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate certificate');
      }

      const newCert = await response.json();
      setCertificates(prev => [newCert, ...prev]);
      return newCert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Renew certificate
  const renewCertificate = useCallback(async (domain: string): Promise<ACMECertificate> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pki/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to renew certificate');
      }

      const renewedCert = await response.json();
      
      // Update certificates list
      setCertificates(prev => prev.map(cert => 
        cert.subject === domain ? { ...cert, ...renewedCert } : cert
      ));

      return renewedCert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Revoke certificate
  const revokeCertificate = useCallback(async (certId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/pki/revoke/${certId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke certificate');
      }

      // Remove from certificates list
      setCertificates(prev => prev.filter(cert => cert.serialNumber !== certId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Download certificate
  const downloadCertificate = useCallback(async (certId: string, format: string): Promise<void> => {
    try {
      const response = await fetch(`/api/pki/download/${certId}?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  // Upload certificate
  const uploadCertificate = useCallback(async (file: File): Promise<Certificate> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('certificate', file);

      const response = await fetch('/api/pki/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload certificate');
      }

      const uploadedCert = await response.json();
      setCertificates(prev => [uploadedCert, ...prev]);
      return uploadedCert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add renewal job
  const addRenewalJob = useCallback(async (domain: string, options: {
    scheduleDays?: number;
    maxAttempts?: number;
  } = {}): Promise<RenewalJob> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pki/renewal-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, ...options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add renewal job');
      }

      const newJob = await response.json();
      setRenewalJobs(prev => [...prev, newJob]);
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove renewal job
  const removeRenewalJob = useCallback(async (jobId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/pki/renewal-jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove renewal job');
      }

      setRenewalJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Process pending renewals
  const processPendingRenewals = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pki/process-renewals', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process renewals');
      }

      // Reload data to get updated status
      await loadPKIData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPKIData]);

  // Load data on mount
  useEffect(() => {
    loadPKIData();
  }, [loadPKIData]);

  return {
    certificates,
    renewalJobs,
    metrics,
    loading,
    error,
    loadPKIData,
    generateCertificate,
    renewCertificate,
    revokeCertificate,
    downloadCertificate,
    uploadCertificate,
    addRenewalJob,
    removeRenewalJob,
    processPendingRenewals,
  };
}

// Hook for certificate status monitoring
export function useCertificateStatus(certPem: string | null) {
  const [status, setStatus] = useState<CertStatus>({
    status: 'error',
    error: 'No certificate provided',
  });

  useEffect(() => {
    if (!certPem) {
      setStatus({ status: 'error', error: 'No certificate provided' });
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch('/api/pki/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certPem }),
        });

        if (!response.ok) {
          throw new Error('Failed to check certificate status');
        }

        const certStatus = await response.json();
        setStatus(certStatus);
      } catch (err) {
        setStatus({
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    };

    checkStatus();
  }, [certPem]);

  return status;
}

// Hook for key pair management
export function useKeyPair() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateKeyPair = useCallback(async (options: {
    bits?: number;
    algorithm?: 'rsa' | 'ecdsa' | 'ed25519';
    curve?: string;
    encrypt?: boolean;
  } = {}): Promise<KeyPair> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pki/generate-keypair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate key pair');
      }

      const newKeyPair = await response.json();
      setKeyPair(newKeyPair);
      return newKeyPair;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateKeyPair = useCallback(async (kp: KeyPair): Promise<boolean> => {
    try {
      const response = await fetch('/api/pki/validate-keypair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kp),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.isValid;
    } catch {
      return false;
    }
  }, []);

  return {
    keyPair,
    loading,
    error,
    generateKeyPair,
    validateKeyPair,
  };
}

// Hook for ACME operations
export function useACME() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeACME = useCallback(async (options: {
    email: string;
    directoryUrl?: string;
    staging?: boolean;
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pki/acme/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize ACME');
      }

      setInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestCertificate = useCallback(async (domain: string, options: {
    subjectAlternativeNames?: string[];
    keySize?: number;
    challengeType?: 'http-01' | 'dns-01';
  } = {}): Promise<ACMECertificate> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pki/acme/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, ...options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request certificate');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChallenge = useCallback(async (domain: string, token: string, keyAuthorization: string, type: 'http-01' | 'dns-01'): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pki/acme/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, token, keyAuthorization, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to handle challenge');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    initialized,
    loading,
    error,
    initializeACME,
    requestCertificate,
    handleChallenge,
  };
}

// Hook for PKI metrics and monitoring
export function usePKIMetrics() {
  const [metrics, setMetrics] = useState<PKIMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pki/metrics');
      
      if (!response.ok) {
        throw new Error('Failed to load PKI metrics');
      }

      const metricsData = await response.json();
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    loadMetrics,
  };
}
