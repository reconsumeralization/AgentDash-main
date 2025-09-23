"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { 
  Users,
  MessageSquare,
  Settings,
  Plus,
  Search,
  Filter,
  Crown,
  Shield,
  User,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Heart,
  Share,
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  Mute,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Globe,
  Hash,
  AtSign,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Bell,
  BellOff,
  Star,
  Award,
  Trophy,
  Activity,
  Network,
  Building2,
  MapPin,
  Tag,
  Link,
  Image,
  Video,
  FileText,
  Send,
  Reply,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  ExternalLink,
  Download,
  Upload,
  Copy,
  Archive,
  Trash,
  RefreshCw,
  Play,
  Pause,
  Stop
} from "lucide-react"
import { cn } from "@/lib"
import { useContextSurfacer } from '@/lib'
import { 
  Tribe, 
  TribeMember, 
  TribeActivity, 
  TribeRule,
  SocialAccount 
} from '@/lib'

interface TribeManagerProps {
  className?: string
}

export function TribeManager({ className }: TribeManagerProps) {
  const { adaptiveState } = useContextSurfacer()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null)
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [members, setMembers] = useState<TribeMember[]>([])
  const [activities, setActivities] = useState<TribeActivity[]>([])
  const [rules, setRules] = useState<TribeRule[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateTribe, setShowCreateTribe] = useState(false)

  // Mock data - in production, fetch from API
  useEffect(() => {
    setTribes([
      {
        id: '1',
        name: 'Tech Innovators',
        description: 'A community for technology innovators and entrepreneurs to share ideas, collaborate, and grow together.',
        type: 'professional',
        platform: 'linkedin',
        memberCount: 2500,
        isPrivate: false,
        rules: [
          {
            id: '1',
            title: 'No Spam',
            description: 'No promotional content or spam allowed',
            category: 'spam',
            severity: 'warning',
            isActive: true
          },
          {
            id: '2',
            title: 'Be Respectful',
            description: 'Treat all members with respect and professionalism',
            category: 'behavior',
            severity: 'mute',
            isActive: true
          }
        ],
        moderators: [
          {
            id: '1',
            userId: 'mod1',
            permissions: ['moderate', 'ban', 'mute'],
            assignedAt: new Date('2023-01-01'),
            lastActive: new Date()
          }
        ],
        tags: ['technology', 'innovation', 'entrepreneurship', 'startups'],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'AI & Machine Learning',
        description: 'Discuss the latest trends, research, and applications in artificial intelligence and machine learning.',
        type: 'interest',
        platform: 'linkedin',
        memberCount: 1800,
        isPrivate: true,
        rules: [],
        moderators: [],
        tags: ['ai', 'machine-learning', 'data-science', 'research'],
        createdAt: new Date('2023-02-15'),
        updatedAt: new Date()
      }
    ])

    setMembers([
      {
        id: '1',
        tribeId: '1',
        userId: 'user1',
        role: 'owner',
        joinedAt: new Date('2023-01-01'),
        lastActive: new Date(),
        contributionScore: 95,
        permissions: ['all'],
        status: 'active'
      },
      {
        id: '2',
        tribeId: '1',
        userId: 'user2',
        role: 'moderator',
        joinedAt: new Date('2023-01-15'),
        lastActive: new Date(),
        contributionScore: 87,
        permissions: ['moderate', 'ban', 'mute'],
        status: 'active'
      },
      {
        id: '3',
        tribeId: '1',
        userId: 'user3',
        role: 'member',
        joinedAt: new Date('2023-02-01'),
        lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        contributionScore: 45,
        permissions: ['post', 'comment'],
        status: 'active'
      }
    ])

    setActivities([
      {
        id: '1',
        tribeId: '1',
        userId: 'user1',
        type: 'post',
        content: 'Just launched our new AI-powered analytics platform! Excited to share the results with the community.',
        metadata: { likes: 45, comments: 12 },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: '2',
        tribeId: '1',
        userId: 'user2',
        type: 'comment',
        content: 'Congratulations! This looks amazing. Would love to learn more about the technical implementation.',
        metadata: { postId: 'post1' },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      }
    ])

    setRules([
      {
        id: '1',
        title: 'No Spam',
        description: 'No promotional content or spam allowed',
        category: 'spam',
        severity: 'warning',
        isActive: true
      },
      {
        id: '2',
        title: 'Be Respectful',
        description: 'Treat all members with respect and professionalism',
        category: 'behavior',
        severity: 'mute',
        isActive: true
      },
      {
        id: '3',
        title: 'Stay On Topic',
        description: 'Keep discussions relevant to the community theme',
        category: 'content',
        severity: 'warning',
        isActive: true
      }
    ])

  }, [])

  // Set initial selected tribe after tribes are loaded
  useEffect(() => {
    if (tribes.length > 0 && !selectedTribe) {
      setSelectedTribe(tribes[0])
    }
  }, [tribes, selectedTribe])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown
      case 'moderator': return Shield
      case 'admin': return UserCheck
      default: return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-600'
      case 'moderator': return 'text-blue-600'
      case 'admin': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'muted': return 'text-yellow-600'
      case 'banned': return 'text-red-600'
      case 'pending': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return MessageSquare
      case 'comment': return Reply
      case 'like': return Heart
      case 'share': return Share
      case 'join': return UserPlus
      case 'leave': return UserX
      default: return Activity
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'text-yellow-600'
      case 'mute': return 'text-orange-600'
      case 'ban': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Tribe Manager</h1>
            <p className="text-muted-foreground">
              Build and manage your professional communities
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" onClick={() => setShowCreateTribe(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tribe
          </Button>
        </div>
      </div>

      {/* Tribe Selection */}
      <div className="flex items-center gap-2">
        {tribes.map(tribe => (
          <Button
            key={tribe.id}
            variant={selectedTribe?.id === tribe.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTribe(tribe)}
          >
            <Users className="h-4 w-4 mr-2" />
            {tribe.name}
            <Badge variant="secondary" className="ml-2">
              {formatNumber(tribe.memberCount)}
            </Badge>
          </Button>
        ))}
      </div>

      {selectedTribe && (
        <>
          {/* Tribe Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">{selectedTribe.name}</h2>
                    <Badge variant={selectedTribe.isPrivate ? 'secondary' : 'default'}>
                      {selectedTribe.isPrivate ? (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {selectedTribe.type}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{selectedTribe.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {formatNumber(selectedTribe.memberCount)} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      {selectedTribe.moderators.length} moderators
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {selectedTribe.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {selectedTribe.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(selectedTribe.memberCount)}</div>
                    <p className="text-xs text-muted-foreground">
                      +5% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,850</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Posts This Week</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">127</div>
                    <p className="text-xs text-muted-foreground">
                      +8% from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6.8%</div>
                    <p className="text-xs text-muted-foreground">
                      +1.2% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest posts and interactions in your tribe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.slice(0, 5).map(activity => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">{activity.content}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{activity.type}</span>
                              <span>•</span>
                              <span>{activity.timestamp.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => {
                  const RoleIcon = getRoleIcon(member.role)
                  return (
                    <Card key={member.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.userId.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm truncate">
                                {member.userId}
                              </h4>
                              <RoleIcon className={cn("h-4 w-4", getRoleColor(member.role))} />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {member.role}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", getStatusColor(member.status))}
                              >
                                {member.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined {member.joinedAt.toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last active {member.lastActive.toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                Score: {member.contributionScore}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <div className="space-y-4">
                {activities.map(activity => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {activity.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {activity.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{activity.content}</p>
                            {activity.metadata && (
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {activity.metadata.likes && (
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {activity.metadata.likes}
                                  </div>
                                )}
                                {activity.metadata.comments && (
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    {activity.metadata.comments}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Community Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage the rules and guidelines for your tribe
                  </p>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-4">
                {rules.map(rule => (
                  <Card key={rule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{rule.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getSeverityColor(rule.severity))}
                            >
                              {rule.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {rule.category}
                            </Badge>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'} className="text-xs">
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tribe Analytics</CardTitle>
                  <CardDescription>
                    Track the growth and engagement of your community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Tribe analytics charts will be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
