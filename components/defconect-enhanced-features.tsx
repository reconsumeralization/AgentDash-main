"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  Users,
  TrendingUp,
  Zap,
  Brain,
  Network,
  Target,
  BarChart3,
  MessageSquare,
  Clock,
  Globe,
  Eye,
  Heart,
  Share,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Star,
  Linkedin,
  Twitter,
  Instagram,
  Facebook
} from "lucide-react"
import { cn } from "@/lib"

interface DefconectMetrics {
  totalMembers: number
  activeProfessionals: number
  threatIntelShared: number
  networkConnections: number
  monthlyGrowth: number
  engagementRate: number
}

interface ThreatIntelligence {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'vulnerability' | 'malware' | 'phishing' | 'apt' | 'zero-day'
  publishedAt: Date
  source: string
  affectedSystems: string[]
  summary: string
}

interface NetworkingOpportunity {
  id: string
  title: string
  type: 'conference' | 'webinar' | 'meetup' | 'workshop'
  date: Date
  participants: number
  expertLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  topics: string[]
  location: string
}

interface DefconectEnhancedFeaturesProps {
  className?: string
}

export function DefconectEnhancedFeatures({ className }: DefconectEnhancedFeaturesProps) {
  const [metrics, setMetrics] = useState<DefconectMetrics>({
    totalMembers: 5200,
    activeProfessionals: 4847,
    threatIntelShared: 1247,
    networkConnections: 28934,
    monthlyGrowth: 12.7,
    engagementRate: 89.3
  })

  const [threatIntel, setThreatIntel] = useState<ThreatIntelligence[]>([])
  const [networkingOps, setNetworkingOps] = useState<NetworkingOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<string>('cybersecurity')
  const [generatedPost, setGeneratedPost] = useState<string>('')

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true)

      // Mock threat intelligence data
      const mockThreatIntel: ThreatIntelligence[] = [
        {
          id: 'ti_1',
          title: 'Advanced Persistent Threat Campaign Targeting Healthcare',
          severity: 'critical',
          type: 'apt',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          source: 'Defconect Threat Research Team',
          affectedSystems: ['Windows', 'Linux', 'Healthcare Systems'],
          summary: 'Sophisticated APT campaign specifically targeting healthcare infrastructure with novel persistence mechanisms.'
        },
        {
          id: 'ti_2',
          title: 'Zero-Day Exploit in Popular VPN Software',
          severity: 'high',
          type: 'zero-day',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          source: 'Community Researcher',
          affectedSystems: ['VPN Clients', 'Network Infrastructure'],
          summary: 'Newly discovered zero-day allowing remote code execution in widely-used VPN solutions.'
        },
        {
          id: 'ti_3',
          title: 'LinkedIn-Based Social Engineering Campaign',
          severity: 'medium',
          type: 'phishing',
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          source: 'Defconect Social Engineering Unit',
          affectedSystems: ['LinkedIn', 'Email Systems'],
          summary: 'Coordinated social engineering attacks using fake LinkedIn profiles to target cybersecurity professionals.'
        }
      ]

      // Mock networking opportunities
      const mockNetworkingOps: NetworkingOpportunity[] = [
        {
          id: 'no_1',
          title: 'Advanced Threat Hunting Workshop',
          type: 'workshop',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          participants: 45,
          expertLevel: 'advanced',
          topics: ['Threat Hunting', 'SIEM', 'Incident Response'],
          location: 'Virtual'
        },
        {
          id: 'no_2',
          title: 'Cybersecurity Leadership Summit',
          type: 'conference',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          participants: 250,
          expertLevel: 'expert',
          topics: ['Leadership', 'Strategy', 'Risk Management'],
          location: 'San Francisco, CA'
        },
        {
          id: 'no_3',
          title: 'Zero Trust Architecture Deep Dive',
          type: 'webinar',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          participants: 120,
          expertLevel: 'intermediate',
          topics: ['Zero Trust', 'Network Security', 'Architecture'],
          location: 'Virtual'
        }
      ]

      await new Promise(resolve => setTimeout(resolve, 1000))
      setThreatIntel(mockThreatIntel)
      setNetworkingOps(mockNetworkingOps)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const getSeverityColor = (severity: ThreatIntelligence['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const generateDefconectPost = async () => {
    try {
      const response = await fetch('/api/social-media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: 'defconect',
          topic: selectedTopic,
          platform: 'linkedin',
          userContext: {
            industry: 'cybersecurity',
            role: 'professional',
            experience: 'advanced',
            tone: 'authoritative'
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.length > 0) {
          setGeneratedPost(data.data[0].content.text)
        }
      }
    } catch (error) {
      console.error('Error generating post:', error)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Defconect Command Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Elite cybersecurity community and threat intelligence platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-600 text-white">Live Platform</Badge>
          <Badge variant="outline">{metrics.totalMembers.toLocaleString()} Members</Badge>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Professionals</p>
                <p className="text-2xl font-bold">{metrics.activeProfessionals.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{metrics.monthlyGrowth}% this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Threat Intel Shared</p>
                <p className="text-2xl font-bold">{metrics.threatIntelShared.toLocaleString()}</p>
                <p className="text-xs text-blue-600">24/7 Intelligence Feed</p>
              </div>
              <Brain className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Connections</p>
                <p className="text-2xl font-bold">{metrics.networkConnections.toLocaleString()}</p>
                <p className="text-xs text-purple-600">{metrics.engagementRate}% engagement rate</p>
              </div>
              <Network className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Features Tabs */}
      <Tabs defaultValue="intelligence" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="intelligence">Threat Intelligence</TabsTrigger>
          <TabsTrigger value="networking">Elite Networking</TabsTrigger>
          <TabsTrigger value="content">Content Generator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Threat Intelligence Tab */}
        <TabsContent value="intelligence">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Real-Time Threat Intelligence
              </CardTitle>
              <CardDescription>
                Latest threats and vulnerabilities from the Defconect research community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {threatIntel.map((intel) => (
                    <div key={intel.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={cn('text-xs', getSeverityColor(intel.severity))}>
                              {intel.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {intel.type.toUpperCase()}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{intel.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{intel.summary}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {intel.publishedAt.toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {intel.source}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Affected:</span>
                        {intel.affectedSystems.map((system, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Elite Networking Tab */}
        <TabsContent value="networking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Elite Networking Opportunities
              </CardTitle>
              <CardDescription>
                Exclusive events and connections with industry leaders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkingOps.map((opportunity) => (
                  <div key={opportunity.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{opportunity.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.date.toLocaleDateString()} • {opportunity.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {opportunity.participants} participants
                        </Badge>
                        <Badge>
                          {opportunity.expertLevel}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {opportunity.topics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" className="mt-2">
                      Join Event
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Generator Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI-Powered Content Generator
              </CardTitle>
              <CardDescription>
                Generate professional cybersecurity content for social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="networking">Professional Networking</SelectItem>
                      <SelectItem value="innovation">Innovation & AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={generateDefconectPost} className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Post
                  </Button>
                </div>
              </div>

              {generatedPost && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Generated Content</label>
                  <Textarea
                    value={generatedPost}
                    onChange={(e) => setGeneratedPost(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Linkedin className="h-4 w-4 mr-2" />
                      Post to LinkedIn
                    </Button>
                    <Button variant="outline" size="sm">
                      <Twitter className="h-4 w-4 mr-2" />
                      Post to Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Community Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Growth</span>
                      <span>{metrics.monthlyGrowth}%</span>
                    </div>
                    <Progress value={metrics.monthlyGrowth} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Engagement Rate</span>
                      <span>{metrics.engagementRate}%</span>
                    </div>
                    <Progress value={metrics.engagementRate} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Threat Intelligence Reports</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Professional Connections</span>
                    <span className="font-medium">28,934</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Knowledge Shared (GB)</span>
                    <span className="font-medium">487.3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Daily Users</span>
                    <span className="font-medium">3,421</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}