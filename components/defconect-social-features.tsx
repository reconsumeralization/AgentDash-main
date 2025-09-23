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
  Globe,
  Target,
  TrendingUp,
  AlertTriangle,
  Zap,
  Brain,
  Network,
  Lock,
  Eye,
  MessageSquare,
  Share,
  Calendar,
  BarChart3,
  Star,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  Cpu
} from "lucide-react"
import { cn } from "@/lib"

interface ThreatIntelligence {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: string
  description: string
  timestamp: Date
  source: string
}

interface NetworkingOpportunity {
  id: string
  type: 'connection' | 'event' | 'collaboration'
  title: string
  description: string
  participants: number
  relevanceScore: number
  scheduledFor?: Date
}

interface ContentSuggestion {
  id: string
  type: 'threat-analysis' | 'industry-insight' | 'networking-tip' | 'security-update'
  title: string
  content: string
  hashtags: string[]
  estimatedEngagement: number
  platform: string[]
}

export function DefconectSocialFeatures() {
  const [threatIntel, setThreatIntel] = useState<ThreatIntelligence[]>([])
  const [networkingOps, setNetworkingOps] = useState<NetworkingOpportunity[]>([])
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('cybersecurity')

  // Mock real-time threat intelligence data
  useEffect(() => {
    setThreatIntel([
      {
        id: '1',
        severity: 'critical',
        type: 'Zero-day Exploit',
        description: 'New APT group targeting financial institutions via LinkedIn phishing',
        timestamp: new Date(),
        source: 'MITRE ATT&CK'
      },
      {
        id: '2',
        severity: 'high',
        type: 'Social Engineering',
        description: 'Increase in fake LinkedIn profiles targeting cybersecurity professionals',
        timestamp: new Date(Date.now() - 3600000),
        source: 'Defconect Community'
      },
      {
        id: '3',
        severity: 'medium',
        type: 'Vulnerability Disclosure',
        description: 'CVE-2024-8901 affecting enterprise social media management tools',
        timestamp: new Date(Date.now() - 7200000),
        source: 'CVE Database'
      }
    ])

    setNetworkingOps([
      {
        id: '1',
        type: 'event',
        title: 'Virtual CISO Roundtable',
        description: 'Discuss emerging threats and defense strategies',
        participants: 24,
        relevanceScore: 95,
        scheduledFor: new Date(Date.now() + 86400000)
      },
      {
        id: '2',
        type: 'collaboration',
        title: 'Threat Intelligence Sharing Initiative',
        description: 'Cross-industry collaboration on APT tracking',
        participants: 147,
        relevanceScore: 88
      },
      {
        id: '3',
        type: 'connection',
        title: 'Connect with Security Leaders',
        description: '15 CISOs from Fortune 500 companies available for networking',
        participants: 15,
        relevanceScore: 92
      }
    ])
  }, [])

  const generateContent = async (topic: string, count: number = 1) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/social-media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: 'defconect',
          topic,
          count,
          platform: 'linkedin',
          userContext: {
            industry: 'cybersecurity',
            role: 'security professional',
            experience: 'advanced',
            goals: ['networking', 'thought leadership', 'threat intelligence'],
            tone: 'authoritative'
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const suggestions = data.data.map((post: any) => ({
            id: post.id,
            type: topic as ContentSuggestion['type'],
            title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Post`,
            content: post.content.text,
            hashtags: post.content.hashtags,
            estimatedEngagement: post.estimatedEngagement.engagementScore,
            platform: [post.platform]
          }))
          setContentSuggestions(prev => [...suggestions, ...prev])
        }
      }
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getSeverityColor = (severity: ThreatIntelligence['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-none bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl">Defconect Social Intelligence</CardTitle>
              <CardDescription className="text-white/80">
                Elite cybersecurity community with real-time threat intelligence and strategic networking
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-4">
            <Badge className="bg-white/15 text-white">5,200+ Security Professionals</Badge>
            <Badge className="bg-white/10 text-white">Real-time Threat Intel</Badge>
            <Badge className="bg-white/10 text-white">AI-Powered Content</Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="intelligence" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="intelligence">Threat Intel</TabsTrigger>
          <TabsTrigger value="networking">Networking</TabsTrigger>
          <TabsTrigger value="content">AI Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Threat Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Live Threat Feed
                </CardTitle>
                <CardDescription>Real-time cybersecurity intelligence from trusted sources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {threatIntel.map((threat) => (
                  <div key={threat.id} className={cn('p-3 rounded-lg border', getSeverityColor(threat.severity))}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{threat.type}</p>
                        <p className="text-xs">{threat.description}</p>
                        <div className="flex items-center gap-2 text-xs opacity-70">
                          <span>{threat.source}</span>
                          <span>•</span>
                          <span>{threat.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {threat.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  AI Threat Analysis
                </CardTitle>
                <CardDescription>AI-powered insights from threat intelligence data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>LinkedIn Phishing Attempts</span>
                    <span className="font-medium text-red-600">+340%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground">Last 30 days vs previous period</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Social Engineering Vectors</span>
                    <span className="font-medium text-orange-600">Medium Risk</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground">Targeting cybersecurity professionals</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Network Vulnerabilities</span>
                    <span className="font-medium text-green-600">Low Impact</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  <p className="text-xs text-muted-foreground">Well-defended community infrastructure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Networking Tab */}
        <TabsContent value="networking" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-green-500" />
                  Elite Networking Opportunities
                </CardTitle>
                <CardDescription>Connect with top cybersecurity professionals and thought leaders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {networkingOps.map((opportunity) => {
                  const Icon = opportunity.type === 'event' ? Calendar :
                              opportunity.type === 'collaboration' ? Users : Target
                  return (
                    <div key={opportunity.id} className="p-3 rounded-lg border bg-muted/40">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-medium">{opportunity.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{opportunity.description}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {opportunity.participants} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {opportunity.relevanceScore}% match
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Join
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Community Insights
                </CardTitle>
                <CardDescription>Real-time analytics on community engagement and growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">5,247</p>
                    <p className="text-xs text-muted-foreground">Active Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">847%</p>
                    <p className="text-xs text-muted-foreground">Engagement Growth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">127</p>
                    <p className="text-xs text-muted-foreground">Daily Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">94%</p>
                    <p className="text-xs text-muted-foreground">Expert Network</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Top Discussion Topics</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Zero-day Exploits</span>
                      <span>24 discussions</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>AI Security</span>
                      <span>18 discussions</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Career Development</span>
                      <span>15 discussions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Content Generation Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                AI-Powered Content Generator
              </CardTitle>
              <CardDescription>Generate high-quality cybersecurity content for maximum engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="networking">Professional Networking</SelectItem>
                    <SelectItem value="innovation">Security Innovation</SelectItem>
                    <SelectItem value="threat-intelligence">Threat Intelligence</SelectItem>
                    <SelectItem value="career-development">Career Development</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateContent(selectedTopic, 3)}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Cpu className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Posts
                </Button>
              </div>
            </CardContent>
          </Card>

          {contentSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>AI-generated posts optimized for the Defconect community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contentSuggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.id} className="p-4 rounded-lg border bg-muted/40">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline">{suggestion.type}</Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BarChart3 className="h-3 w-3" />
                          {suggestion.estimatedEngagement}% engagement
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{suggestion.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.hashtags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="mr-2 h-3 w-3" />
                            Schedule
                          </Button>
                        </div>
                        <Button size="sm">
                          <Send className="mr-2 h-3 w-3" />
                          Publish
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Engagement Metrics
                </CardTitle>
                <CardDescription>Performance analytics for Defconect content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Post Reach</span>
                    <span className="font-medium">127K impressions</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground">+34% vs last month</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Community Growth</span>
                    <span className="font-medium">+247 members</span>
                  </div>
                  <Progress value={73} className="h-2" />
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Thought Leadership Score</span>
                    <span className="font-medium">94/100</span>
                  </div>
                  <Progress value={94} className="h-2" />
                  <p className="text-xs text-muted-foreground">Industry recognition index</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Platform Performance
                </CardTitle>
                <CardDescription>Cross-platform analytics and optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">LinkedIn</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">89%</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Twitter/X</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">76%</span>
                      <CheckCircle className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Discord</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">92%</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Optimal Posting Times</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• Tuesday 9-11 AM (Peak engagement)</p>
                    <p>• Wednesday 2-4 PM (Professional audience)</p>
                    <p>• Thursday 8-10 AM (Industry discussions)</p>
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