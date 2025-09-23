"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  Cloud,
  Database,
  FileText,
  MessageSquare,
  Network,
  Shield,
  Zap,
  Users,
  Layers,
  Briefcase,
  Target,
  Rocket,
  ArrowRight,
  Globe,
  GitBranch,
  LineChart,
  RefreshCw,
  Play,
  Calendar,
  BarChart3,
  Eye,
  Heart,
  Share,
  Clock,
  TrendingUp,
  Edit3,
  Send
} from "lucide-react"
import { cn } from "@/lib"
import { useContextSurfacer } from '@/lib'
import { getSocialSkin, type SocialPlatform } from '@/lib/social-skins'

interface SocialMediaDashboardProps {
  className?: string
  platform?: SocialPlatform
  onSelectTab?: (tab: string) => void
}

interface SocialMetrics {
  posts: number
  engagement: number
  reach: number
  impressions: number
  followers: number
}

interface ScheduledPost {
  id: string
  content: string
  platform: string
  scheduledAt: Date
  status: 'scheduled' | 'published' | 'failed'
}

type StatusTone = 'success' | 'info' | 'warning'

const statusToneClass: Record<StatusTone, string> = {
  success: 'text-emerald-600 bg-emerald-50 border border-emerald-100',
  info: 'text-blue-600 bg-blue-50 border border-blue-100',
  warning: 'text-amber-600 bg-amber-50 border border-amber-100'
}

export function SocialMediaDashboard({ className, platform = 'linkedin', onSelectTab }: SocialMediaDashboardProps) {
  const { adaptiveState } = useContextSurfacer()
  const skin = getSocialSkin(platform)
  const cardClassName = (...classes: string[]) => cn(skin.card, ...classes)

  const [socialMetrics, setSocialMetrics] = useState<SocialMetrics>({
    posts: 0,
    engagement: 0,
    reach: 0,
    impressions: 0,
    followers: 0
  })

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        setIsLoading(true)

        // Fetch analytics
        const analyticsRes = await fetch('/api/social-media/analytics?platform=all&period=7d')
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json()
          if (analyticsData.success) {
            const metrics = analyticsData.data.metrics
            setSocialMetrics({
              posts: metrics.posts.current,
              engagement: metrics.engagement.current,
              reach: metrics.reach.current,
              impressions: metrics.impressions.current,
              followers: metrics.followers.current
            })
          }
        }

        // Fetch scheduled posts
        const postsRes = await fetch('/api/social-media/posts?status=scheduled&limit=5')
        if (postsRes.ok) {
          const postsData = await postsRes.json()
          if (postsData.success) {
            setScheduledPosts(postsData.data.map((post: any) => ({
              id: post.id,
              content: post.content.text.substring(0, 100) + '...',
              platform: post.platform,
              scheduledAt: new Date(post.scheduledAt),
              status: post.status
            })))
          }
        }
      } catch (error) {
        console.error('Error fetching social data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSocialData()
  }, [])

  const systemStatus = [
    { name: 'LinkedIn API', status: 'Connected', tone: 'success' as StatusTone, icon: CheckCircle },
    { name: 'QNAP Storage', status: 'Configured', tone: 'info' as StatusTone, icon: Cloud },
    { name: 'Contact Database', status: 'Active', tone: 'success' as StatusTone, icon: Database },
    { name: 'FileFlex', status: 'Ready', tone: 'info' as StatusTone, icon: Shield }
  ]

  const platformModules = [
    { name: 'LinkedIn Command Center', description: 'AI-powered networking and strategy', tab: 'linkedin', icon: Network },
    { name: 'QNAP NAS Storage', description: 'Enterprise file storage and backup', tab: 'connectors', icon: Cloud },
    { name: 'Contact Importer', description: 'Import contacts from multiple sources', tab: 'knowledge', icon: Users }
  ]

  const quickStats = [
    { label: 'Total Posts', value: socialMetrics.posts.toLocaleString(), icon: FileText },
    { label: 'Engagement Rate', value: `${((socialMetrics.engagement / socialMetrics.impressions) * 100 || 0).toFixed(1)}%`, icon: Heart },
    { label: 'Reach', value: socialMetrics.reach.toLocaleString(), icon: Eye },
    { label: 'Followers', value: socialMetrics.followers.toLocaleString(), icon: Users }
  ]

  const addonHubMetrics = [
    { label: 'Defconect Posts', value: '847', delta: '+127% this quarter', brand: 'defconect' },
    { label: 'LinkedOut Optimization', value: '156%', subtext: 'Profile view increase', brand: 'linkedout' },
    { label: 'Scheduled Content', value: scheduledPosts.length.toString(), subtext: `Next: ${scheduledPosts[0]?.scheduledAt.toLocaleDateString() || 'None'}` },
    { label: 'Cross-Platform Reach', value: `${(socialMetrics.reach / 1000).toFixed(1)}K`, subtext: 'LinkedIn + Twitter + Instagram' }
  ]

  const quickActions = [
    { label: 'Generate Post', description: 'AI-powered Defconect/LinkedOut content', icon: Edit3, action: 'generate' },
    { label: 'Schedule Campaign', description: 'Plan multi-platform content calendar', icon: Calendar, action: 'schedule' },
    { label: 'Analytics Report', description: 'Cross-platform performance insights', icon: BarChart3, tab: 'analytics' },
    { label: 'Sync Platforms', description: 'Update data across all connected accounts', icon: RefreshCw, tab: 'connectors' }
  ]

  const platformEcosystem = [
    { label: 'Social Platforms', count: '4 platforms', items: ['Twitter/X', 'GitHub', 'Discord', '+1 more'], icon: Globe, tab: 'connectors' },
    { label: 'Communication', count: '3 platforms', items: ['Slack', 'Outlook', 'Discord'], icon: MessageSquare, tab: 'inbox' },
    { label: 'Productivity', count: '5 platforms', items: ['Notion', 'Google Calendar', 'Trello', '+2 more'], icon: Layers, tab: 'projects' },
    { label: 'Analytics', count: '3 platforms', items: ['Google Analytics', 'Mixpanel', 'Hotjar'], icon: LineChart, tab: 'dashboard' },
    { label: 'Business', count: '4 platforms', items: ['HubSpot', 'Salesforce', 'Stripe', '+1 more'], icon: Briefcase, tab: 'setup' },
    { label: 'Development', count: '6 platforms', items: ['GitHub', 'GitLab', 'Jira', '+3 more'], icon: GitBranch, tab: 'network' }
  ]

  const handleNavigate = (tab: string) => {
    onSelectTab?.(tab)
  }

  const handleAction = async (action: string) => {
    if (action === 'generate') {
      // Generate Defconect/LinkedOut post
      try {
        const response = await fetch('/api/social-media/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand: 'defconect',
            topic: 'cybersecurity',
            count: 1,
            platform: 'linkedin'
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log('Generated post:', data.data[0])
            // You could show a modal or navigate to a post editor here
          }
        }
      } catch (error) {
        console.error('Error generating post:', error)
      }
    } else if (action === 'schedule') {
      // Navigate to scheduling interface
      onSelectTab?.('schedule')
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card className={cardClassName('overflow-hidden border-none bg-gradient-to-r from-[#0A66C2] via-[#094c92] to-[#073d74] text-white') }>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-white/15 text-white">Defconect</Badge>
            <Badge className="bg-white/10 text-white">LinkedOut Integration</Badge>
            <Badge className="bg-white/5 text-white">Social Media Command Center</Badge>
            {adaptiveState?.contextualTheme?.name && (
              <Badge className="bg-white/10 text-white">Theme · {adaptiveState.contextualTheme.name}</Badge>
            )}
          </div>
          <CardTitle className="text-3xl">Social Media Command Center</CardTitle>
          <CardDescription className="text-white/80">
            Defconect + LinkedOut: Elite cybersecurity networking meets advanced LinkedIn optimization. 5,200+ professionals, 847% engagement increase.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-white/90">
              Connect with 4-star generals, optimize your network, and scale your professional relationships like never before.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button className={cn(skin.primaryButton, 'px-4')} onClick={() => handleAction('generate')}>
                <Rocket className="mr-2 h-4 w-4" /> Generate Campaign
              </Button>
              <Button variant="ghost" className={cn(skin.heroGhostButton, 'text-white')} asChild>
                <Link href="/docs/linkedin-addon-hub">View Documentation</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {quickStats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className={cardClassName('bg-white/10 text-white border-white/20 shadow-none') }>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-white/70">
                      <Icon className="h-4 w-4" />
                      {stat.label}
                    </div>
                    <div className="text-2xl font-semibold mt-1">{isLoading ? '...' : stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cardClassName('md:col-span-2')}>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Live health overview of all core integrations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {systemStatus.map(({ name, status, tone, icon: Icon }) => (
              <div key={name} className={cn('flex items-center justify-between rounded-xl px-4 py-3', statusToneClass[tone])}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs opacity-80">{status}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cardClassName()}>
          <CardHeader>
            <CardTitle>Platform Modules</CardTitle>
            <CardDescription>Core capabilities powering the DefConect experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {platformModules.map(({ name, description, tab, icon: Icon }) => (
              <Button
                key={name}
                variant="ghost"
                className="w-full justify-start gap-3 text-left"
                onClick={() => handleNavigate(tab)}
              >
                <Icon className={cn('h-4 w-4', skin.iconAccent)} />
                <div>
                  <div className="text-sm font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={cardClassName('lg:col-span-1')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>LinkedIn Addon Hub</CardTitle>
              <Badge variant="outline">Enterprise Grade</Badge>
            </div>
            <CardDescription>
              Comprehensive LinkedIn integration with 20+ platforms for ultimate professional networking
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {addonHubMetrics.map(({ label, value, delta, subtext }) => (
              <div key={label} className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-xl font-semibold">{value}</p>
                {delta && <p className="text-xs text-emerald-600">{delta}</p>}
                {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cardClassName('lg:col-span-1')}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Powerful automation tools to supercharge your LinkedIn presence</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map(({ label, description, icon: Icon, tab, action }) => (
              <Button
                key={label}
                variant="outline"
                className="justify-start gap-3 text-left"
                onClick={() => action ? handleAction(action) : handleNavigate(tab)}
              >
                <Icon className={cn('h-4 w-4', skin.iconAccent)} />
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={cardClassName()}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scheduled Posts</CardTitle>
              <Badge variant="outline">{scheduledPosts.length} upcoming</Badge>
            </div>
            <CardDescription>
              Upcoming Defconect and LinkedOut content ready for publishing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : scheduledPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No scheduled posts</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleAction('generate')}
                >
                  Create First Post
                </Button>
              </div>
            ) : (
              scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {post.platform}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.scheduledAt.toLocaleDateString()} at {post.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className={cardClassName()}>
          <CardHeader>
            <CardTitle>Brand Performance</CardTitle>
            <CardDescription>Defconect vs LinkedOut engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Defconect (Cybersecurity)
                </span>
                <span className="font-medium">847 posts</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">+127% engagement this quarter</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  LinkedOut (Optimization)
                </span>
                <span className="font-medium">156% growth</span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground">Profile views increased 847%</p>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-blue-600">5,200+</p>
                  <p className="text-xs text-muted-foreground">Security Professionals</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-600">68%</p>
                  <p className="text-xs text-muted-foreground">Connection Rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cardClassName()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Platform Ecosystem</CardTitle>
            <Badge variant="outline">20+ platforms</Badge>
          </div>
          <CardDescription>
            Integrated across communication, analytics, business, and development tools for a unified professional ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platformEcosystem.map(({ label, count, items, icon: Icon, tab }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{count}</p>
                </div>
                <Icon className={cn('h-5 w-5', skin.iconAccent)} />
              </div>
              <div className="mt-3 space-y-1">
                {items.map((item) => (
                  <p key={item} className="text-xs text-muted-foreground">{item}</p>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={() => handleNavigate(tab)}>
                Explore Integrations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Video Library</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">
          <Card className={cardClassName()}>
            <CardHeader>
              <CardTitle>Featured Playbooks</CardTitle>
              <CardDescription>Best-practice guides to scale your professional network</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'AI-Driven Outreach Blueprint',
                  summary: 'Automate personalised outreach while maintaining human tone.',
                  readTime: '8 min read',
                  tab: 'agents'
                },
                {
                  title: 'Executive Briefing Dashboards',
                  summary: 'Build real-time dashboards for C-level reporting across platforms.',
                  readTime: '12 min read',
                  tab: 'analytics'
                },
                {
                  title: 'Enterprise Integrations Checklist',
                  summary: 'Ensure compliance, security, and reliability across all connectors.',
                  readTime: '15 min read',
                  tab: 'connectors'
                }
              ].map(({ title, summary, readTime, tab }) => (
                <div key={title} className="space-y-3">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="text-xs text-muted-foreground">{summary}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{readTime}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleNavigate(tab)}>
                      Open Guide <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="videos">
          <Card className={cardClassName()}>
            <CardHeader>
              <CardTitle>Masterclass Library</CardTitle>
              <CardDescription>Expert walkthroughs to deploy DefConect effectively</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: 'Scaling LinkedIn With AI',
                  duration: '18:42',
                  focus: 'Command Center Overview',
                  tab: 'linkedin'
                },
                {
                  title: 'Enterprise Storage Strategies',
                  duration: '12:08',
                  focus: 'QNAP NAS Integration',
                  tab: 'connectors'
                },
                {
                  title: 'Cross-Platform Automation',
                  duration: '21:16',
                  focus: 'Workflow orchestration',
                  tab: 'setup'
                }
              ].map(({ title, duration, focus, tab }) => (
                <div key={title} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{focus} · {duration}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleNavigate(tab)}>
                    Watch Now <Play className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}






