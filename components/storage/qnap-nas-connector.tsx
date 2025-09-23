"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import {
  HardDrive,
  Server,
  Shield,
  Upload,
  Download,
  Users,
  Database,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw,
  Folder,
  FileText,
  Image,
  Video
} from 'lucide-react'
import { useToast } from '@/components/providers'

interface QNAPConfig {
  host: string
  port: number
  username: string
  password: string
  useSSL: boolean
  sharedFolders: string[]
}

interface QNAPStatus {
  connected: boolean
  storageUsed: number
  storageTotal: number
  sharedFolders: Array<{
    name: string
    path: string
    permissions: string[]
    size: number
  }>
  lastSync: Date | null
  healthStatus: 'healthy' | 'warning' | 'error'
}

interface FileFlexIntegration {
  enabled: boolean
  apiKey: string
  sharedUsers: string[]
  uploadQueue: Array<{
    id: string
    filename: string
    size: number
    progress: number
    status: 'pending' | 'uploading' | 'completed' | 'failed'
  }>
}

export function QNAPNASConnector() {
  const [config, setConfig] = useState<QNAPConfig>({
    host: '',
    port: 8080,
    username: '',
    password: '',
    useSSL: true,
    sharedFolders: []
  })

  const [status, setStatus] = useState<QNAPStatus>({
    connected: false,
    storageUsed: 0,
    storageTotal: 0,
    sharedFolders: [],
    lastSync: null,
    healthStatus: 'error'
  })

  const [fileFlex, setFileFlex] = useState<FileFlexIntegration>({
    enabled: false,
    apiKey: '',
    sharedUsers: [],
    uploadQueue: []
  })

  const [isConnecting, setIsConnecting] = useState(false)
  const [activeTab, setActiveTab] = useState('connection')
  const toast = useToast()

  // Connect to QNAP NAS
  const connectToQNAP = useCallback(async () => {
    if (!config.host || !config.username || !config.password) {
      toast.error('Configuration Required', 'Please fill in all required fields')
      return
    }

    setIsConnecting(true)
    try {
      // Simulate QNAP connection
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock successful connection
      setStatus({
        connected: true,
        storageUsed: 2.3 * 1024 * 1024 * 1024 * 1024, // 2.3 TB
        storageTotal: 8 * 1024 * 1024 * 1024 * 1024, // 8 TB
        sharedFolders: [
          { name: 'DefConect-Data', path: '/share/DefConect-Data', permissions: ['read', 'write'], size: 500 * 1024 * 1024 * 1024 },
          { name: 'Contacts-Backup', path: '/share/Contacts-Backup', permissions: ['read', 'write'], size: 100 * 1024 * 1024 * 1024 },
          { name: 'Analytics-Reports', path: '/share/Analytics-Reports', permissions: ['read', 'write'], size: 200 * 1024 * 1024 * 1024 }
        ],
        lastSync: new Date(),
        healthStatus: 'healthy'
      })

      toast.success('QNAP Connected', 'Successfully connected to QNAP NAS!')
    } catch (error) {
      setStatus(prev => ({ ...prev, connected: false, healthStatus: 'error' }))
      toast.error('Connection Failed', 'Failed to connect to QNAP NAS')
    } finally {
      setIsConnecting(false)
    }
  }, [config, toast])

  // Setup FileFlex integration
  const setupFileFlex = useCallback(async () => {
    try {
      // Generate API key for FileFlex
      const apiKey = `ff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setFileFlex(prev => ({ ...prev, enabled: true, apiKey }))

      toast.success('FileFlex Enabled', 'FileFlex integration configured successfully')
    } catch (error) {
      toast.error('Setup Failed', 'Failed to setup FileFlex integration')
    }
  }, [toast])

  // Upload file to QNAP via FileFlex
  const uploadFile = useCallback(async (file: File, folder: string) => {
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    setFileFlex(prev => ({
      ...prev,
      uploadQueue: [...prev.uploadQueue, {
        id: uploadId,
        filename: file.name,
        size: file.size,
        progress: 0,
        status: 'pending'
      }]
    }))

    try {
      // Simulate file upload
      for (let progress = 0; progress <= 100; progress += 10) {
        setFileFlex(prev => ({
          ...prev,
          uploadQueue: prev.uploadQueue.map(upload =>
            upload.id === uploadId
              ? { ...upload, progress, status: progress === 100 ? 'completed' : 'uploading' }
              : upload
          )
        }))
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      toast.success('Upload Complete', `${file.name} uploaded successfully`)
    } catch (error) {
      setFileFlex(prev => ({
        ...prev,
        uploadQueue: prev.uploadQueue.map(upload =>
          upload.id === uploadId ? { ...upload, status: 'failed' } : upload
        )
      }))
      toast.error('Upload Failed', `Failed to upload ${file.name}`)
    }
  }, [toast])

  // Create shared folder
  const createSharedFolder = useCallback(async (folderName: string) => {
    try {
      const newFolder = {
        name: folderName,
        path: `/share/${folderName}`,
        permissions: ['read', 'write'],
        size: 0
      }

      setStatus(prev => ({
        ...prev,
        sharedFolders: [...prev.sharedFolders, newFolder]
      }))

      toast.success('Folder Created', `Shared folder "${folderName}" created successfully`)
    } catch (error) {
      toast.error('Creation Failed', 'Failed to create shared folder')
    }
  }, [toast])

  // Get storage usage percentage
  const getStorageUsage = () => {
    if (status.storageTotal === 0) return 0
    return (status.storageUsed / status.storageTotal) * 100
  }

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-blue-600" />
            QNAP NAS Connector
          </h1>
          <p className="text-gray-600 mt-1">
            Enterprise-grade storage solution for DefConect platform data
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className={status.connected ? "text-green-600 border-green-600" : "text-red-600 border-red-600"}>
            {status.connected ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
            {status.connected ? 'Connected' : 'Disconnected'}
          </Badge>
          {status.connected && (
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Storage Settings
            </Button>
          )}
        </div>
      </div>

      {/* Storage Overview */}
      {status.connected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold">{formatBytes(status.storageUsed)}</p>
                  <p className="text-sm text-gray-500">of {formatBytes(status.storageTotal)}</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <Progress value={getStorageUsage()} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{getStorageUsage().toFixed(1)}% used</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shared Folders</p>
                  <p className="text-2xl font-bold">{status.sharedFolders.length}</p>
                  <p className="text-sm text-gray-500">Active shares</p>
                </div>
                <Folder className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">FileFlex Status</p>
                  <p className="text-2xl font-bold">{fileFlex.enabled ? 'Active' : 'Inactive'}</p>
                  <p className="text-sm text-gray-500">Remote access</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">QNAP Connection</TabsTrigger>
          <TabsTrigger value="storage">Storage Management</TabsTrigger>
          <TabsTrigger value="fileflex">FileFlex Integration</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QNAP NAS Configuration</CardTitle>
              <CardDescription>
                Configure your QNAP NAS connection for DefConect data storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> For security reasons, you must create a user account on your QNAP NAS
                  and use those credentials, not the administrator credentials. Follow the QNAP documentation
                  to create a user account first.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host">QNAP Host/IP</Label>
                  <Input
                    id="host"
                    placeholder="192.168.1.100 or nas.mydomain.com"
                    value={config.host}
                    onChange={(e) => setConfig(prev => ({ ...prev, host: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="8080"
                    value={config.port}
                    onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="QNAP user account (not admin)"
                    value={config.username}
                    onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="User account password"
                    value={config.password}
                    onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={config.useSSL}
                  onChange={(e) => setConfig(prev => ({ ...prev, useSSL: e.target.checked }))}
                />
                <Label htmlFor="ssl">Use SSL/TLS encryption</Label>
              </div>

              <Button
                onClick={connectToQNAP}
                disabled={isConnecting || !config.host || !config.username || !config.password}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting to QNAP...
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4 mr-2" />
                    Connect to QNAP NAS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {status.connected && (
            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Connection Status</span>
                    <Badge className="bg-green-600">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Health Status</span>
                    <Badge className={status.healthStatus === 'healthy' ? 'bg-green-600' : 'bg-red-600'}>
                      {status.healthStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Sync</span>
                    <span className="text-sm text-gray-600">
                      {status.lastSync?.toLocaleString() || 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Management</CardTitle>
              <CardDescription>
                Manage shared folders and storage allocation for DefConect data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Shared Folders</h4>
                <Button onClick={() => createSharedFolder(`DefConect-${Date.now()}`)}>
                  <Folder className="w-4 h-4 mr-2" />
                  Create Folder
                </Button>
              </div>

              <div className="space-y-2">
                {status.sharedFolders.map((folder) => (
                  <div key={folder.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Folder className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{folder.name}</p>
                        <p className="text-sm text-gray-500">{formatBytes(folder.size)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {folder.permissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fileflex" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FileFlex Integration</CardTitle>
              <CardDescription>
                Enable remote file access and sharing for your DefConect team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!fileFlex.enabled ? (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">FileFlex Not Configured</h3>
                  <p className="text-gray-500 mb-4">
                    Enable FileFlex to allow secure remote access to your QNAP files
                  </p>
                  <Button onClick={setupFileFlex}>
                    <Shield className="w-4 h-4 mr-2" />
                    Setup FileFlex Integration
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>FileFlex Status</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div>
                    <Label>API Key</Label>
                    <Input value={fileFlex.apiKey} readOnly className="font-mono text-sm" />
                  </div>

                  <div>
                    <Label>Shared Users</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {fileFlex.sharedUsers.map((user) => (
                        <Badge key={user} variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          {user}
                        </Badge>
                      ))}
                      {fileFlex.sharedUsers.length === 0 && (
                        <p className="text-sm text-gray-500">No users shared yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {fileFlex.uploadQueue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fileFlex.uploadQueue.map((upload) => (
                    <div key={upload.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{upload.filename}</p>
                        <p className="text-xs text-gray-500">{formatBytes(upload.size)}</p>
                        <Progress value={upload.progress} className="mt-1 h-1" />
                      </div>
                      <Badge variant={
                        upload.status === 'completed' ? 'default' :
                        upload.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {upload.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery</CardTitle>
              <CardDescription>
                Automated backup solutions for your DefConect data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-medium">Contact Database</h4>
                  <p className="text-sm text-gray-500">30K+ LinkedIn connections</p>
                  <Button size="sm" className="mt-2">
                    <Upload className="w-3 h-3 mr-1" />
                    Backup
                  </Button>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium">Analytics Data</h4>
                  <p className="text-sm text-gray-500">Performance metrics</p>
                  <Button size="sm" className="mt-2">
                    <Upload className="w-3 h-3 mr-1" />
                    Backup
                  </Button>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Image alt="Media Files icon" className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-medium">Media Files</h4>
                  <p className="text-sm text-gray-500">Profile images & documents</p>
                  <Button size="sm" className="mt-2">
                    <Upload className="w-3 h-3 mr-1" />
                    Backup
                  </Button>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Enterprise Backup:</strong> Your QNAP NAS provides RAID protection and snapshot capabilities.
                  All DefConect data is automatically backed up with point-in-time recovery options.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Setup Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            QNAP Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Create User Account</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Log in to QNAP Finder</li>
                <li>• Connect to your NAS with admin credentials</li>
                <li>• Go to Control Panel → User</li>
                <li>• Create a new user account</li>
                <li>• Set appropriate permissions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Configure Shared Folders</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Go to Control Panel → Shared Folders</li>
                <li>• Create folders for DefConect data</li>
                <li>• Set user permissions (read/write)</li>
                <li>• Enable NFS/SMB access</li>
                <li>• Configure snapshot protection</li>
              </ul>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Never use administrator credentials for FileFlex or remote access.
              Always create dedicated user accounts with appropriate permissions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
