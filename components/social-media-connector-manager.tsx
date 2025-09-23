"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
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
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Users,
  Calendar,
  Zap
} from "lucide-react"

// Import the social media API (this would be the actual import in a real implementation)
// import { socialMediaAPI, SupportedPlatform } from '@/connectors/social-media/social-media-api'

// Mock types for demonstration
type SupportedPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | 'reddit'

interface PlatformInfo {
  name: string
  description: string
  color: string
  icon: string
  category: string
}

interface ConnectionStatus {
  platform: SupportedPlatform
  isConnected: boolean
  lastConnected?: Date
  lastError?: string
  retryCount: number
}

interface CrossPlatformPost {
  content: string
  platforms: SupportedPlatform[]
  scheduleTime?: Date
  status: 'draft' | 'scheduled' | 'published' | 'failed'
}

export function SocialMediaConnectorManager() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<SupportedPlatform[]>([])
  const [connectionStatuses, setConnectionStatuses] = useState<ConnectionStatus[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<SupportedPlatform | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [isConnecting, setIsConnecting] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)
  const [scheduledPosts, setScheduledPosts] = useState<CrossPlatformPost[]>([])

  // Mock platform information
  const platformInfo: Record<SupportedPlatform, PlatformInfo> = {
    linkedin: {
      name: 'LinkedIn',
      description: 'Professional networking and B2B content',
      color: '#0077B5',
      icon: 'linkedin',
      category: 'professional'
    },
    twitter: {
      name: 'Twitter/X',
      description: 'Real-time social media and news',
      color: '#1DA1F2',
      icon: 'twitter',
      category: 'social'
    },
    facebook: {
      name: 'Facebook',
      description: 'Social networking and community building',
      color: '#1877F2',
      icon: 'facebook',
      category: 'social'
    },
    instagram: {
      name: 'Instagram',
      description: 'Visual content and storytelling',
      color: '#E4405F',
      icon: 'instagram',
      category: 'visual'
    },
    tiktok: {
      name: 'TikTok',
      description: 'Short-form video content',
      color: '#000000',
      icon: 'tiktok',
      category: 'video'
    },
    youtube: {
      name: 'YouTube',
      description: 'Video content and live streaming',
      color: '#FF0000',
      icon: 'youtube',
      category: 'video'
    },
    pinterest: {
      name: 'Pinterest',
      description: 'Visual discovery and inspiration',
      color: '#BD081C',
      icon: 'pinterest',
      category: 'visual'
    },
    reddit: {
      name: 'Reddit',
      description: 'Community discussions and content',
      color: '#FF4500',
      icon: 'reddit',
      category: 'community'
    }
  }

  const getPlatformIcon = (platform: SupportedPlatform) => {
    const icons = {
      linkedin: Linkedin,
      twitter: Twitter,
      facebook: Facebook,
      instagram: Instagram,
      youtube: Youtube,
      tiktok: MessageSquare,
      pinterest: MessageSquare,
      reddit: MessageSquare
    }
    const IconComponent = icons[platform]
    return <IconComponent className="h-5 w-5" />
  }

  const handleConnect = async (platform: SupportedPlatform) => {
    setIsConnecting(true)
    try {
      // Mock connection logic
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setConnectedPlatforms(prev => [...prev, platform])
      setConnectionStatuses(prev => prev.map(status => 
        status.platform === platform 
          ? { ...status, isConnected: true, lastConnected: new Date() }
          : status
      ))
    } catch (error) {
      console.error(`Failed to connect to ${platform}:`, error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = (platform: SupportedPlatform) => {
    setConnectedPlatforms(prev => prev.filter(p => p !== platform))
    setConnectionStatuses(prev => prev.map(status => 
      status.platform === platform 
        ? { ...status, isConnected: false }
        : status
    ))
  }

  const handlePostToPlatforms = async (content: string, platforms: SupportedPlatform[]) => {
    // Mock posting logic
    const post: CrossPlatformPost = {
      content,
      platforms,
      status: 'published'
    }
    
    console.log('Posting to platforms:', platforms, 'Content:', content)
    // In real implementation, this would call the social media API
  }

  const getConnectionStatus = (platform: SupportedPlatform) => {
    return connectionStatuses.find(status => status.platform === platform)
  }

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? 'bg-green-500' : 'bg-gray-400'
  }

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Media Connectors</h2>
          <p className="text-gray-600">Manage your social media platform connections</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {connectedPlatforms.length} Connected
        </Badge>
      </div>

      {/* Connection Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(platformInfo).map(([platform, info]) => {
              const status = getConnectionStatus(platform as SupportedPlatform)
              const isConnected = status?.isConnected || false
              
              return (
                <div
                  key={platform}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(platform as SupportedPlatform)}
                    <span className="font-medium">{info.name}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(isConnected)}`} />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Platform Management */}
      <Tabs defaultValue="connect" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connect">Connect Platforms</TabsTrigger>
          <TabsTrigger value="post">Cross-Platform Posting</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Scheduling</TabsTrigger>
        </TabsList>

        {/* Connect Platforms Tab */}
        <TabsContent value="connect" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(platformInfo).map(([platform, info]) => {
              const status = getConnectionStatus(platform as SupportedPlatform)
              const isConnected = status?.isConnected || false
              
              return (
                <Card key={platform}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(platform as SupportedPlatform)}
                        <div>
                          <CardTitle className="text-lg">{info.name}</CardTitle>
                          <CardDescription>{info.description}</CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={isConnected ? "default" : "secondary"}
                        className={isConnected ? "bg-green-500" : ""}
                      >
                        {isConnected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isConnected ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Last connected: {status?.lastConnected?.toLocaleDateString()}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(platform as SupportedPlatform)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full"
                            onClick={() => setSelectedPlatform(platform as SupportedPlatform)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Connect to {info.name}</DialogTitle>
                            <DialogDescription>
                              Enter your {info.name} API credentials to connect your account.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="clientId">Client ID</Label>
                              <Input
                                id="clientId"
                                placeholder="Enter your client ID"
                                value={credentials.clientId || ''}
                                onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="clientSecret">Client Secret</Label>
                              <Input
                                id="clientSecret"
                                type="password"
                                placeholder="Enter your client secret"
                                value={credentials.clientSecret || ''}
                                onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="redirectUri">Redirect URI</Label>
                              <Input
                                id="redirectUri"
                                placeholder="https://yourapp.com/callback"
                                value={credentials.redirectUri || ''}
                                onChange={(e) => setCredentials(prev => ({ ...prev, redirectUri: e.target.value }))}
                              />
                            </div>
                            <Button 
                              className="w-full"
                              onClick={() => handleConnect(platform as SupportedPlatform)}
                              disabled={isConnecting}
                            >
                              {isConnecting ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                'Connect'
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Cross-Platform Posting Tab */}
        <TabsContent value="post" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Cross-Platform Post</CardTitle>
              <CardDescription>
                Post content to multiple social media platforms simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="postContent">Post Content</Label>
                <Textarea
                  id="postContent"
                  placeholder="What's on your mind?"
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <Label>Select Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {connectedPlatforms.map(platform => (
                    <div key={platform} className="flex items-center gap-2 p-2 border rounded">
                      {getPlatformIcon(platform)}
                      <span className="text-sm">{platformInfo[platform].name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Post to All Platforms
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unified Analytics</CardTitle>
              <CardDescription>
                View analytics across all connected platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">2.4K</div>
                  <div className="text-sm text-gray-600">Total Impressions</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">1.8K</div>
                  <div className="text-sm text-gray-600">Total Reach</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">342</div>
                  <div className="text-sm text-gray-600">Total Engagement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post Scheduling</CardTitle>
              <CardDescription>
                Schedule posts to be published at optimal times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="scheduleContent">Post Content</Label>
                  <Textarea
                    id="scheduleContent"
                    placeholder="Content to schedule..."
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="scheduleTime">Schedule Time</Label>
                  <Input
                    id="scheduleTime"
                    type="datetime-local"
                    className="w-48"
                  />
                </div>
              </div>
              
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
