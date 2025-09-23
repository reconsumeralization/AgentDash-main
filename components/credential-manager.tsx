"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Plus,
  Shield,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Settings,
  Lock,
  Unlock,
  FileText,
  Download,
  Upload,
  HelpCircle,
  Info,
  Zap,
  Clock,
  User,
  Building2,
  Globe,
  Mail,
  Phone,
  MoreHorizontal,
  Save,
  X,
  AlertTriangle
} from "lucide-react"

interface Credential {
  id: string
  platform: string
  name: string
  description?: string
  credentials: {
    clientId?: string
    clientSecret?: string
    apiKey?: string
    apiSecret?: string
    bearerToken?: string
    appId?: string
    appSecret?: string
    redirectUri?: string
    webhookSecret?: string
    accessToken?: string
    refreshToken?: string
  }
  environment: 'development' | 'staging' | 'production'
  isActive: boolean
  isEncrypted: boolean
  lastUsed?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  tags: string[]
  notes?: string
}

interface CredentialTemplate {
  platform: string
  name: string
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'password' | 'url' | 'email'
    required: boolean
    placeholder?: string
    helpText?: string
    validation?: {
      pattern?: string
      message?: string
    }
  }>
  documentation: {
    setupGuide: string
    apiDocs: string
    videoTutorial?: string
  }
}

export function CredentialManager() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newCredential, setNewCredential] = useState<Partial<Credential>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterEnvironment, setFilterEnvironment] = useState('all')

  const credentialTemplates: CredentialTemplate[] = [
    {
      platform: 'linkedin',
      name: 'LinkedIn API',
      fields: [
        {
          name: 'clientId',
          label: 'Client ID',
          type: 'text',
          required: true,
          placeholder: 'Enter your LinkedIn Client ID',
          helpText: 'Found in your LinkedIn app settings'
        },
        {
          name: 'clientSecret',
          label: 'Client Secret',
          type: 'password',
          required: true,
          placeholder: 'Enter your LinkedIn Client Secret',
          helpText: 'Keep this secure and never share it publicly'
        },
        {
          name: 'redirectUri',
          label: 'Redirect URI',
          type: 'url',
          required: true,
          placeholder: 'https://yourapp.com/auth/linkedin/callback',
          helpText: 'Must match the redirect URI in your LinkedIn app settings'
        }
      ],
      documentation: {
        setupGuide: 'https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication',
        apiDocs: 'https://docs.microsoft.com/en-us/linkedin/',
        videoTutorial: 'https://youtube.com/watch?v=linkedin-setup'
      }
    },
    {
      platform: 'twitter',
      name: 'Twitter API',
      fields: [
        {
          name: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: true,
          placeholder: 'Enter your Twitter API Key'
        },
        {
          name: 'apiSecret',
          label: 'API Secret',
          type: 'password',
          required: true,
          placeholder: 'Enter your Twitter API Secret'
        },
        {
          name: 'bearerToken',
          label: 'Bearer Token',
          type: 'password',
          required: true,
          placeholder: 'Enter your Twitter Bearer Token'
        }
      ],
      documentation: {
        setupGuide: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0',
        apiDocs: 'https://developer.twitter.com/en/docs'
      }
    },
    {
      platform: 'facebook',
      name: 'Facebook Graph API',
      fields: [
        {
          name: 'appId',
          label: 'App ID',
          type: 'text',
          required: true,
          placeholder: 'Enter your Facebook App ID'
        },
        {
          name: 'appSecret',
          label: 'App Secret',
          type: 'password',
          required: true,
          placeholder: 'Enter your Facebook App Secret'
        }
      ],
      documentation: {
        setupGuide: 'https://developers.facebook.com/docs/facebook-login',
        apiDocs: 'https://developers.facebook.com/docs/graph-api'
      }
    }
  ]

  const platforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'pinterest', 'reddit']
  const environments = ['development', 'staging', 'production']

  const getPlatformIcon = (platform: string) => {
    const icons = {
      linkedin: '💼',
      twitter: '🐦',
      facebook: '📘',
      instagram: '📷',
      youtube: '📺',
      tiktok: '🎵',
      pinterest: '📌',
      reddit: '🤖'
    }
    return icons[platform as keyof typeof icons] || '📱'
  }

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'development': return 'bg-blue-500'
      case 'staging': return 'bg-yellow-500'
      case 'production': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const togglePasswordVisibility = (credentialId: string, fieldName: string) => {
    const key = `${credentialId}-${fieldName}`
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleAddCredential = () => {
    setIsAddingNew(true)
    setNewCredential({
      platform: '',
      name: '',
      environment: 'development',
      isActive: true,
      isEncrypted: true,
      credentials: {},
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  const handleSaveCredential = () => {
    if (isAddingNew) {
      const credential: Credential = {
        id: `cred_${Date.now()}`,
        platform: newCredential.platform || '',
        name: newCredential.name || '',
        description: newCredential.description,
        credentials: newCredential.credentials || {},
        environment: newCredential.environment || 'development',
        isActive: newCredential.isActive || true,
        isEncrypted: true,
        tags: newCredential.tags || [],
        notes: newCredential.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setCredentials(prev => [...prev, credential])
      setIsAddingNew(false)
      setNewCredential({})
    } else if (selectedCredential) {
      setCredentials(prev => prev.map(cred => 
        cred.id === selectedCredential.id 
          ? { ...cred, ...selectedCredential, updatedAt: new Date() }
          : cred
      ))
      setIsEditing(false)
    }
  }

  const handleDeleteCredential = (credentialId: string) => {
    setCredentials(prev => prev.filter(cred => cred.id !== credentialId))
    if (selectedCredential?.id === credentialId) {
      setSelectedCredential(null)
    }
  }

  const handleTestCredential = async (credential: Credential) => {
    // Mock test connection
    console.log('Testing credential:', credential.id)
  }

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cred.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cred.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = filterPlatform === 'all' || cred.platform === filterPlatform
    const matchesEnvironment = filterEnvironment === 'all' || cred.environment === filterEnvironment
    
    return matchesSearch && matchesPlatform && matchesEnvironment
  })

  const getCredentialTemplate = (platform: string) => {
    return credentialTemplates.find(template => template.platform === platform)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Credential Manager</h1>
          <p className="text-gray-600">Securely manage your API credentials for all platforms</p>
        </div>
        <Button onClick={handleAddCredential}>
          <Plus className="h-4 w-4 mr-2" />
          Add Credentials
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credentials List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Credentials</CardTitle>
              <CardDescription>
                {filteredCredentials.length} of {credentials.length} credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                <Input
                  placeholder="Search credentials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {platforms.map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {getPlatformIcon(platform)} {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Environments</SelectItem>
                      {environments.map(env => (
                        <SelectItem key={env} value={env}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getEnvironmentColor(env)}`} />
                            {env}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Credentials List */}
              <div className="space-y-2">
                {filteredCredentials.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No credentials found</p>
                    <p className="text-sm">Add your first credential to get started</p>
                  </div>
                ) : (
                  filteredCredentials.map((credential) => (
                    <div
                      key={credential.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCredential?.id === credential.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCredential(credential)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getPlatformIcon(credential.platform)}</span>
                          <div>
                            <p className="font-medium">{credential.name}</p>
                            <p className="text-sm text-gray-600 capitalize">{credential.platform}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getEnvironmentColor(credential.environment)}`} />
                          {credential.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credential Details */}
        <div className="lg:col-span-2">
          {selectedCredential ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlatformIcon(selectedCredential.platform)}</span>
                    <div>
                      <CardTitle>{selectedCredential.name}</CardTitle>
                      <CardDescription>
                        {selectedCredential.platform} • {selectedCredential.environment}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestCredential(selectedCredential)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteCredential(selectedCredential.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="credentials" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="credentials">Credentials</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>

                  <TabsContent value="credentials" className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        {getCredentialTemplate(selectedCredential.platform)?.fields.map((field) => (
                          <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <div className="relative">
                              <Input
                                id={field.name}
                                type={field.type}
                                placeholder={field.placeholder}
                                value={selectedCredential.credentials[field.name as keyof typeof selectedCredential.credentials] || ''}
                                onChange={(e) => {
                                  setSelectedCredential(prev => prev ? {
                                    ...prev,
                                    credentials: {
                                      ...prev.credentials,
                                      [field.name]: e.target.value
                                    }
                                  } : null)
                                }}
                                className={field.type === 'password' ? 'pr-10' : ''}
                              />
                              {field.type === 'password' && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => togglePasswordVisibility(selectedCredential.id, field.name)}
                                >
                                  {showPasswords[`${selectedCredential.id}-${field.name}`] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                            {field.helpText && (
                              <p className="text-sm text-gray-600">{field.helpText}</p>
                            )}
                          </div>
                        ))}
                        
                        <div className="flex items-center gap-2 pt-4">
                          <Button onClick={handleSaveCredential}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(selectedCredential.credentials).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label className="text-sm font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={value || ''}
                                type={key.toLowerCase().includes('secret') || key.toLowerCase().includes('token') || key.toLowerCase().includes('key') 
                                  ? (showPasswords[`${selectedCredential.id}-${key}`] ? 'text' : 'password')
                                  : 'text'
                                }
                                readOnly
                                className="font-mono text-sm"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(value || '')}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              {(key.toLowerCase().includes('secret') || key.toLowerCase().includes('token') || key.toLowerCase().includes('key')) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => togglePasswordVisibility(selectedCredential.id, key)}
                                >
                                  {showPasswords[`${selectedCredential.id}-${key}`] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Environment</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${getEnvironmentColor(selectedCredential.environment)}`} />
                          <span className="capitalize">{selectedCredential.environment}</span>
                        </div>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedCredential.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                          <span>{selectedCredential.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>

                    {selectedCredential.description && (
                      <div>
                        <Label>Description</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedCredential.description}</p>
                      </div>
                    )}

                    {selectedCredential.tags.length > 0 && (
                      <div>
                        <Label>Tags</Label>
                        <div className="flex items-center gap-1 mt-1">
                          {selectedCredential.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Created</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedCredential.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label>Last Updated</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedCredential.updatedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {selectedCredential.lastUsed && (
                      <div>
                        <Label>Last Used</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedCredential.lastUsed.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your credentials are encrypted at rest and transmitted securely.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Encryption Status</Label>
                          <p className="text-sm text-gray-600">Data is encrypted using AES-256</p>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          <Lock className="h-3 w-3 mr-1" />
                          Encrypted
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Access Logging</Label>
                          <p className="text-sm text-gray-600">All access attempts are logged</p>
                        </div>
                        <Badge variant="outline" className="text-blue-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-rotation</Label>
                          <p className="text-sm text-gray-600">Credentials rotate automatically</p>
                        </div>
                        <Badge variant="outline" className="text-yellow-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Scheduled
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Security Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Rotate Credentials
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          Export Security Report
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Revoke Access
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Key className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Credential Selected</h3>
                <p className="text-gray-600 text-center mb-4">
                  Select a credential from the list to view its details and manage settings.
                </p>
                <Button onClick={handleAddCredential}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Credential
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add New Credential Dialog */}
      {isAddingNew && (
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Credentials</DialogTitle>
              <DialogDescription>
                Add API credentials for a new platform integration.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={newCredential.platform}
                    onValueChange={(value) => setNewCredential(prev => ({ ...prev, platform: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {getPlatformIcon(platform)} {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={newCredential.environment}
                    onValueChange={(value) => setNewCredential(prev => ({ ...prev, environment: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {environments.map(env => (
                        <SelectItem key={env} value={env}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getEnvironmentColor(env)}`} />
                            {env}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Production LinkedIn API"
                  value={newCredential.name}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of these credentials..."
                  value={newCredential.description}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {newCredential.platform && getCredentialTemplate(newCredential.platform) && (
                <div className="space-y-4">
                  <h4 className="font-medium">API Credentials</h4>
                  {getCredentialTemplate(newCredential.platform)!.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={newCredential.credentials?.[field.name as keyof typeof newCredential.credentials] || ''}
                        onChange={(e) => setNewCredential(prev => ({
                          ...prev,
                          credentials: {
                            ...prev.credentials,
                            [field.name]: e.target.value
                          }
                        }))}
                      />
                      {field.helpText && (
                        <p className="text-sm text-gray-600">{field.helpText}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-4">
                <Button onClick={handleSaveCredential}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Credentials
                </Button>
                <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
