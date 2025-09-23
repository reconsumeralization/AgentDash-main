"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { 
  Linkedin,
  Users,
  MessageSquare,
  Share2,
  Heart,
  Eye,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Send,
  UserPlus,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Bookmark,
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Target,
  BarChart3,
  Network,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  ThumbsUp,
  MessageCircle,
  Share,
  AtSign,
  Hash,
  Image as ImageIcon,
  Video,
  Link,
  Globe,
  Lock,
  Unlock,
  Settings,
  Bell,
  Zap
} from "lucide-react"
import { cn } from "@/lib"
import { getSocialSkin } from '@/lib/social-skins'
import { useContextSurfacer } from '@/lib'
import { 
  LinkedInProfile, 
  LinkedInPost, 
  LinkedInConnection,
  SocialAccount 
} from '@/lib'

interface LinkedInManagerProps {
  className?: string
}

export function LinkedInManager({ className }: LinkedInManagerProps) {
  const { adaptiveState } = useContextSurfacer()
  const skin = getSocialSkin('linkedin')
  const [activeTab, setActiveTab] = useState('feed')
  const [profile, setProfile] = useState<LinkedInProfile | null>(null)
  const [connections, setConnections] = useState<LinkedInConnection[]>([])
  const [posts, setPosts] = useState<LinkedInPost[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Mock data - in production, fetch from LinkedIn API
  useEffect(() => {
    setProfile({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      headline: 'Senior Software Engineer | Full-Stack Developer | Tech Innovator',
      summary: 'Passionate about building scalable web applications and leading development teams. 8+ years of experience in modern web technologies.',
      location: 'San Francisco, CA',
      industry: 'Information Technology and Services',
      profilePicture: '/avatars/john-linkedin.jpg',
      connections: 1250,
      followers: 850,
      experience: [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          startDate: new Date('2022-01-01'),
          isCurrent: true,
          description: 'Leading development of microservices architecture and mentoring junior developers.'
        }
      ],
      education: [
        {
          id: '1',
          school: 'Stanford University',
          degree: 'Master of Science',
          field: 'Computer Science',
          startDate: new Date('2018-09-01'),
          endDate: new Date('2020-06-01'),
          description: 'Specialized in Machine Learning and Distributed Systems'
        }
      ],
      skills: [
        { id: '1', name: 'JavaScript', endorsements: 45 },
        { id: '2', name: 'React', endorsements: 38 },
        { id: '3', name: 'Node.js', endorsements: 32 },
        { id: '4', name: 'Python', endorsements: 28 },
        { id: '5', name: 'AWS', endorsements: 25 }
      ],
      recommendations: [],
      isVerified: true,
      lastUpdated: new Date()
    })

    setConnections([
      {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        headline: 'Product Manager at InnovateTech',
        profilePicture: '/avatars/sarah.jpg',
        company: 'InnovateTech',
        location: 'New York, NY',
        connectedAt: new Date('2023-01-15'),
        mutualConnections: 12,
        relationship: '1st'
      },
      {
        id: '2',
        firstName: 'Michael',
        lastName: 'Chen',
        headline: 'Senior Developer at CloudScale',
        profilePicture: '/avatars/michael.jpg',
        company: 'CloudScale',
        location: 'Seattle, WA',
        connectedAt: new Date('2023-02-20'),
        mutualConnections: 8,
        relationship: '1st'
      }
    ])

    setPosts([
      {
        id: '1',
        author: 'John Doe',
        content: 'Excited to share that our team just launched a new feature that will revolutionize how developers collaborate on projects! 🚀 The response has been incredible so far.',
        engagement: {
          reactions: 45,
          comments: 12,
          shares: 8,
          impressions: 1250
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'post' as const,
        topics: ['technology', 'collaboration', 'innovation'],
        sentiment: 'positive' as const,
        urgency: 'low' as const
      }
    ])

    setIsConnected(true)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getEngagementColor = (rate: number) => {
    if (rate >= 5) return 'text-green-600'
    if (rate >= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case '1st': return 'text-[#0A66C2]'
      case '2nd': return 'text-green-600'
      case '3rd': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const cardClassName = (...classes: string[]) => cn(skin.card, ...classes)

  const tabTriggerClass = skin.tabTrigger
  if (!isConnected) {
    return (
      <Card className={cardClassName(className || '')}>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A66C2]/15 text-[#0A66C2]">
            <Linkedin className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-semibold">Connect to LinkedIn</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Connect your LinkedIn account to start managing your professional network,
            sharing content, and tracking your professional growth.
          </p>
          <Button size="lg" className="rounded-full bg-[#0A66C2] px-6 hover:bg-[#074a8c]">
            <Linkedin className="mr-2 h-5 w-5" />
            Connect LinkedIn Account
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("overflow-hidden rounded-3xl border border-[#d0d7de] bg-[#f3f2ef] shadow-sm", className)}>
      <div className="bg-[#0A66C2] px-6 py-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#0A66C2]">
              in
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">LinkedIn Extended</p>
              <h1 className="text-2xl font-semibold leading-tight">LinkedIn Manager</h1>
              <p className="text-sm text-white/80">Professional networking and content management</p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3 min-w-[240px]">
            <div className="relative hidden w-full max-w-xs md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <Input
                placeholder="Search LinkedIn network"
                className="h-10 rounded-full border-none bg-white/20 pl-10 text-sm text-white placeholder:text-white/70 focus-visible:ring-white focus-visible:ring-offset-0"
              />
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/15">
              <Bell className="mr-2 h-4 w-4" />
              Alerts
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/15">
              <MessageSquare className="mr-2 h-4 w-4" />
              Inbox
            </Button>
            <Button size="sm" className="rounded-full bg-white text-[#0A66C2] hover:bg-white/90">
              <Plus className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
          <Badge variant="outline" className="border-white/40 bg-white/15 px-3 py-1 text-white">
            Connected
          </Badge>
          {adaptiveState?.contextualTheme?.name && (
            <span>Theme · {adaptiveState.contextualTheme.name}</span>
          )}
          <span className="hidden items-center gap-1 md:inline-flex">
            <TrendingUp className="h-4 w-4" />
            Professional growth insights enabled
          </span>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#d0d7de]/70 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Linkedin className="h-8 w-8 text-[#0A66C2]" />
            <div>
              <h2 className="text-xl font-semibold">LinkedIn Manager</h2>
              <p className="text-sm text-muted-foreground">
                Professional networking and content management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full border-[#0A66C2]/40 text-[#0A66C2] hover:border-[#0A66C2] hover:text-[#0A66C2]">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button size="sm" className="rounded-full bg-[#0A66C2] px-4 text-white hover:bg-[#074a8c]">
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Profile Overview */}
        {profile && (
          <Card className={cardClassName()}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-shrink-0">
                  <Image
                    src={profile.profilePicture}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    {profile.isVerified && (
                      <CheckCircle className="h-5 w-5 text-[#0A66C2]" />
                    )}
                  </div>
                  <p className="mb-2 text-muted-foreground">{profile.headline}</p>
                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {profile.industry}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-[#0A66C2]" />
                      {formatNumber(profile.connections)} connections
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-[#0A66C2]" />
                      {formatNumber(profile.followers)} followers
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <Button variant="outline" size="sm" className="rounded-full border-[#0A66C2]/40 text-[#0A66C2] hover:border-[#0A66C2] hover:text-[#0A66C2]">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-[#0A66C2]/40 text-[#0A66C2] hover:border-[#0A66C2] hover:text-[#0A66C2]">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 gap-0 rounded-none border-b border-[#d0d7de]/70 bg-transparent p-0">
            <TabsTrigger value="feed" className={tabTriggerClass}>
              Feed
            </TabsTrigger>
            <TabsTrigger value="network" className={tabTriggerClass}>
              Network
            </TabsTrigger>
            <TabsTrigger value="content" className={tabTriggerClass}>
              Content
            </TabsTrigger>
            <TabsTrigger value="analytics" className={tabTriggerClass}>
              Analytics
            </TabsTrigger>
            <TabsTrigger value="messaging" className={tabTriggerClass}>
              Messaging
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            {/* Create Post */}
            <Card className={cardClassName()}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Image
                    src={profile?.profilePicture || '/default-avatar.png'}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share an article, photo, video or idea..."
                      className="min-h-[100px] resize-none border-0 p-0 text-base focus-visible:ring-0"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="ghost" size="sm" className="text-[#0A66C2] hover:bg-[#0A66C2]/10">
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Photo
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#0A66C2] hover:bg-[#0A66C2]/10">
                          <Video className="mr-2 h-4 w-4" />
                          Video
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#0A66C2] hover:bg-[#0A66C2]/10">
                          <Link className="mr-2 h-4 w-4" />
                          Article
                        </Button>
                      </div>
                      <Button className="rounded-full bg-[#0A66C2] px-4 hover:bg-[#074a8c]">
                        <Send className="mr-2 h-4 w-4" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map(post => (
                <Card key={post.id} className={cardClassName()}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start gap-4">
                      <Image
                        src={profile?.profilePicture || '/default-avatar.png'}
                        alt="Author"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold">{post.author}</h4>
                          <Badge variant="outline" className="border-[#0A66C2]/40 text-xs text-[#0A66C2]">
                            Public
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.timestamp.toLocaleDateString()} • {post.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="mb-4">{post.content}</p>

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-[#0A66C2]" />
                          {post.engagement.reactions}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4 text-[#0A66C2]" />
                          {post.engagement.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Share className="h-4 w-4 text-[#0A66C2]" />
                          {post.engagement.shares}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1 font-medium",
                          getEngagementColor(
                            ((post.engagement.reactions + post.engagement.comments + post.engagement.shares) /
                              post.engagement.impressions) *
                              100
                          )
                        )}
                      >
                        <TrendingUp className="h-4 w-4" />
                        {(
                          ((post.engagement.reactions + post.engagement.comments + post.engagement.shares) /
                            post.engagement.impressions) *
                          100
                        ).toFixed(1)}
                        % engagement
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-[#0A66C2] hover:bg-[#0A66C2]/10">
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Like
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#0A66C2] hover:bg-[#0A66C2]/10">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Comment
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#0A66C2] hover:bg-[#0A66C2]/10">
                          <Share className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#0A66C2] hover:bg-[#0A66C2]/10">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-[#d0d7de]/70 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Your Network</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your professional connections
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search connections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-[#d0d7de]/70 pl-10"
                  />
                </div>
                <Button variant="outline" size="sm" className="rounded-full border-[#0A66C2]/40 text-[#0A66C2] hover:border-[#0A66C2] hover:text-[#0A66C2]">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connections
                .filter(connection =>
                  connection.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  connection.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  connection.company?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(connection => (
                  <Card key={connection.id} className={cardClassName()}>
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <Image
                          src={connection.profilePicture || '/default-avatar.png'}
                          alt={`${connection.firstName} ${connection.lastName}`}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              {connection.firstName} {connection.lastName}
                            </h4>
                            <span className={cn("text-xs font-medium uppercase", getRelationshipColor(connection.relationship))}>
                              {connection.relationship}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{connection.headline}</p>
                        </div>
                      </div>

                      <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#0A66C2]" />
                          {connection.company}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#0A66C2]" />
                          {connection.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#0A66C2]" />
                          {connection.mutualConnections} mutual connections
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" className="rounded-full bg-[#0A66C2] px-4 text-white hover:bg-[#074a8c]">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full border-[#0A66C2]/40 text-[#0A66C2] hover:border-[#0A66C2] hover:text-[#0A66C2]">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Follow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className={cardClassName()}>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>
                  Track the performance of your LinkedIn posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-[#d0d7de]/70 bg-[#f8fafc]">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-4 h-12 w-12 text-[#0A66C2]" />
                    <p className="text-muted-foreground">Content analytics will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className={cardClassName()}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <Eye className="h-4 w-4 text-[#0A66C2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,250</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className={cardClassName()}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Post Impressions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-[#0A66C2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5K</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className={cardClassName()}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                  <Heart className="h-4 w-4 text-[#0A66C2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.2%</div>
                  <p className="text-xs text-muted-foreground">
                    +0.3% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className={cardClassName()}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Connections</CardTitle>
                  <UserPlus className="h-4 w-4 text-[#0A66C2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className={cardClassName()}>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Detailed analytics for your LinkedIn activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-[#d0d7de]/70 bg-[#f8fafc]">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-4 h-12 w-12 text-[#0A66C2]" />
                    <p className="text-muted-foreground">Detailed analytics charts will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-6">
            <Card className={cardClassName()}>
              <CardHeader>
                <CardTitle>LinkedIn Messaging</CardTitle>
                <CardDescription>
                  Manage your professional conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-[#d0d7de]/70 bg-[#f8fafc]">
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-[#0A66C2]" />
                    <p className="text-muted-foreground">LinkedIn messaging interface will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}




