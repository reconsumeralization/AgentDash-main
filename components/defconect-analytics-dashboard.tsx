"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Heart,
  Zap,
  Brain,
  Network,
  Calendar,
  Award,
  Star,
  Activity,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Globe,
  Clock,
  MessageSquare,
  CheckCircle
} from "lucide-react"

interface AnalyticsMetric {
  id: string
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'stable'
  period: string
  description: string
}

interface TribeAnalytics {
  tribeId: string
  tribeName: string
  memberCount: number
  collaborationScore: number
  aspirationAlignment: number
  projectSuccess: number
  growthRate: number
  topAspirations: string[]
  engagementMetrics: {
    messagesSent: number
    projectsCompleted: number
    skillsShared: number
    mentorshipHours: number
  }
}

interface PersonalGrowth {
  userId: string
  name: string
  aspirationProgress: number
  skillsDeveloped: number
  connectionsMade: number
  projectsContributed: number
  growthAreas: string[]
  achievements: string[]
}

export function DefConectAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  const [metrics, _setMetrics] = useState<AnalyticsMetric[]>([
    {
      id: '1',
      name: 'Tribe Members',
      value: 147,
      change: 12,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Total active members across all tribes'
    },
    {
      id: '2',
      name: 'Aspiration Matches',
      value: 89,
      change: 23,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Successful aspiration-based connections'
    },
    {
      id: '3',
      name: 'Project Collaborations',
      value: 34,
      change: -5,
      changeType: 'decrease',
      period: 'vs last month',
      description: 'Active collaborative projects'
    },
    {
      id: '4',
      name: 'Average Engagement',
      value: 92,
      change: 8,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Member engagement score'
    },
    {
      id: '5',
      name: 'Tribe Growth Rate',
      value: 18,
      change: 3,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Monthly tribe membership growth'
    },
    {
      id: '6',
      name: 'Aspiration Alignment',
      value: 87,
      change: 12,
      changeType: 'increase',
      period: 'vs last month',
      description: 'How well aspirations match opportunities'
    }
  ])

  const [tribeAnalytics, _setTribeAnalytics] = useState<TribeAnalytics[]>([
    {
      tribeId: '1',
      tribeName: 'Accessibility Innovators',
      memberCount: 89,
      collaborationScore: 94,
      aspirationAlignment: 96,
      projectSuccess: 87,
      growthRate: 24,
      topAspirations: ['Accessibility Innovation', 'Inclusive Design', 'AR/VR Technology'],
      engagementMetrics: {
        messagesSent: 1247,
        projectsCompleted: 12,
        skillsShared: 45,
        mentorshipHours: 156
      }
    },
    {
      tribeId: '2',
      tribeName: 'Climate Tech Leaders',
      memberCount: 67,
      collaborationScore: 89,
      aspirationAlignment: 92,
      projectSuccess: 91,
      growthRate: 31,
      topAspirations: ['Climate Tech', 'Sustainable Development', 'Green Innovation'],
      engagementMetrics: {
        messagesSent: 892,
        projectsCompleted: 8,
        skillsShared: 32,
        mentorshipHours: 98
      }
    },
    {
      tribeId: '3',
      tribeName: 'AI Ethics Collective',
      memberCount: 52,
      collaborationScore: 91,
      aspirationAlignment: 89,
      projectSuccess: 84,
      growthRate: 15,
      topAspirations: ['AI Ethics', 'Responsible AI', 'Tech for Good'],
      engagementMetrics: {
        messagesSent: 634,
        projectsCompleted: 6,
        skillsShared: 28,
        mentorshipHours: 87
      }
    }
  ])

  const [personalGrowth, _setPersonalGrowth] = useState<PersonalGrowth[]>([
    {
      userId: '1',
      name: 'Sarah Chen',
      aspirationProgress: 78,
      skillsDeveloped: 12,
      connectionsMade: 45,
      projectsContributed: 8,
      growthAreas: ['AR/VR Development', 'Accessibility Research', 'Design Leadership'],
      achievements: ['Led accessibility project', 'Published AR research', 'Mentored 3 designers']
    },
    {
      userId: '2',
      name: 'Marcus Rodriguez',
      aspirationProgress: 82,
      skillsDeveloped: 15,
      connectionsMade: 38,
      projectsContributed: 6,
      growthAreas: ['Climate Tech Strategy', 'Sustainable Engineering', 'Product Leadership'],
      achievements: ['Launched climate product', 'Carbon reduction certification', 'Industry speaker']
    }
  ])

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'decrease': return <ArrowDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600'
      case 'decrease': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const topPerformingTribes = tribeAnalytics.sort((a, b) => b.collaborationScore - a.collaborationScore)
  const totalMembers = tribeAnalytics.reduce((acc, tribe) => acc + tribe.memberCount, 0)
  const avgAspirationAlignment = Math.round(
    tribeAnalytics.reduce((acc, tribe) => acc + tribe.aspirationAlignment, 0) / tribeAnalytics.length
  )

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            DefConect Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Track your professional growth and tribe performance through aspiration-based networking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
                <div className={`flex items-center gap-1 ${getChangeColor(metric.changeType)}`}>
                  {getChangeIcon(metric.changeType)}
                  <span className="text-sm font-medium">
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{metric.period}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tribes">Tribes</TabsTrigger>
          <TabsTrigger value="growth">Personal Growth</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Aspiration-Based Connections</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tribe Member Retention</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Collaborative Project Success</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Professional Growth Rate</span>
                    <span className="font-medium">76%</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Tribes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Tribes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformingTribes.slice(0, 3).map((tribe, index) => (
                    <div key={tribe.tribeId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{tribe.tribeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {tribe.memberCount} members
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{tribe.collaborationScore}%</p>
                        <p className="text-xs text-muted-foreground">collaboration</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    +{Math.round((totalMembers * 0.18) / 12)}
                  </div>
                  <p className="text-sm text-muted-foreground">New members per month</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <ArrowUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">18% growth</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {avgAspirationAlignment}%
                  </div>
                  <p className="text-sm text-muted-foreground">Avg aspiration alignment</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">+5% this quarter</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round(tribeAnalytics.reduce((acc, t) => acc + t.engagementMetrics.projectsCompleted, 0) / 30 * 7)}
                  </div>
                  <p className="text-sm text-muted-foreground">Projects completed weekly</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-purple-600">On track</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tribes Tab */}
        <TabsContent value="tribes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tribeAnalytics.map((tribe) => (
              <Card key={tribe.tribeId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {tribe.tribeName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Members</p>
                      <p className="text-2xl font-bold">{tribe.memberCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                      <p className="text-2xl font-bold text-green-600">+{tribe.growthRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Collaboration</p>
                      <p className="text-2xl font-bold">{tribe.collaborationScore}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{tribe.projectSuccess}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Top Aspirations:</p>
                    <div className="flex flex-wrap gap-1">
                      {tribe.topAspirations.map((aspiration) => (
                        <Badge key={aspiration} variant="secondary" className="text-xs">
                          {aspiration}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Messages Sent</p>
                      <p className="font-medium">{tribe.engagementMetrics.messagesSent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Projects Completed</p>
                      <p className="font-medium">{tribe.engagementMetrics.projectsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Skills Shared</p>
                      <p className="font-medium">{tribe.engagementMetrics.skillsShared}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mentorship Hours</p>
                      <p className="font-medium">{tribe.engagementMetrics.mentorshipHours}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Personal Growth Tab */}
        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {personalGrowth.map((person) => (
              <Card key={person.userId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    {person.name}'s Growth Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Aspiration Progress</span>
                      <span className="font-medium">{person.aspirationProgress}%</span>
                    </div>
                    <Progress value={person.aspirationProgress} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Skills Developed</span>
                      <span className="font-medium">{person.skillsDeveloped}</span>
                    </div>
                    <Progress value={(person.skillsDeveloped / 20) * 100} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Connections Made</span>
                      <span className="font-medium">{person.connectionsMade}</span>
                    </div>
                    <Progress value={(person.connectionsMade / 50) * 100} />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Growth Areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {person.growthAreas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recent Achievements:</p>
                    <ul className="text-sm space-y-1">
                      {person.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Award className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Projects Contributed</p>
                        <p className="text-2xl font-bold">{person.projectsContributed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Growth Score</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round((person.aspirationProgress + (person.skillsDeveloped / 20 * 100) + (person.connectionsMade / 50 * 100)) / 3)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Aspiration Alignment Opportunity</p>
                      <p className="text-sm text-blue-600 mt-1">
                        23 members in your network have complementary skills to your current aspirations.
                        Consider reaching out to the AI Ethics Collective for collaboration opportunities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Growth Acceleration</p>
                      <p className="text-sm text-green-600 mt-1">
                        Your tribe's collaboration score increased by 15% this month.
                        This correlates with a 22% increase in project completion rates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Engagement Opportunity</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        3 tribe members haven't been active in discussions for 2 weeks.
                        Consider personalized outreach to maintain engagement.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Aspiration-to-Action Conversion</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Tribe Member Satisfaction</span>
                      <span className="text-sm font-medium">91%</span>
                    </div>
                    <Progress value={91} />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Cross-Tribe Collaboration</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Professional Growth Impact</span>
                      <span className="text-sm font-medium">84%</span>
                    </div>
                    <Progress value={84} />
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
