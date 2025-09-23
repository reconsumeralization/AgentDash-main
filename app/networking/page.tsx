"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Navigation, BreadcrumbNavigation } from "@/components/navigation"
import {
  Users,
  Network,
  MessageSquare,
  Star,
  UserPlus,
  Search,
  Filter,
  Heart,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useUser } from "@clerk/nextjs" // Import useUser
import { useApi } from "@/lib/providers/api-provider" // Import useApi

// Define a type for the connection data from the API
interface Connection {
  id: string;
  connection_type: string;
  aspiration_compatibility: number;
  relationship_strength: string;
  shared_aspirations: string[];
  last_interaction: string; // Assuming ISO string from DB
  conversation_starters: string[];
  connected_user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
    linkedin_profile: any; // Adjust as per actual LinkedIn profile structure
  };
}

interface AspirationMatch {
  user: {
    id: string
    name: string
    avatar: string
    title: string
    company: string
  }
  compatibility_score: number
  shared_interests: Array<{
    category: string
    title: string
  }>
  reason: string
  priority: 'high' | 'medium' | 'low'
}

export default function NetworkingPage() {
  const { user } = useUser() // Get the current user from Clerk
  const { get } = useApi() // Get the API client

  const [activeTab, setActiveTab] = useState("overview")
  const [aspirationMatches, setAspirationMatches] = useState<AspirationMatch[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [discoverFilter, setDiscoverFilter] = useState<'all' | 'career' | 'skill' | 'project' | 'cause'>('all')
  const [connections, setConnections] = useState<Connection[]>([]) // State for connections
  const [loadingConnections, setLoadingConnections] = useState(true) // Loading state for connections

  // Fetch connections from Supabase
  useEffect(() => {
    if (!user?.id) return // Ensure user ID is available

    const fetchConnections = async () => {
      setLoadingConnections(true)
      try {
        const response = await get(`/api/connections?userId=${user.id}`)
        setConnections(response.connections || [])
      } catch (error) {
        console.error('Error fetching connections:', error)
        setConnections([]) // Set to empty on error
      } finally {
        setLoadingConnections(false)
      }
    }

    fetchConnections()
  }, [user?.id, get]) // Re-fetch when user ID or API client changes

  const profile = {
    name: "Alex Chen",
    title: "AI Product Manager",
    company: "TechFlow Inc.",
    location: "San Francisco, CA",
    aspirations: [
      { id: "asp1", title: "Lead AI Product Teams", category: "career", priority: "high" },
      { id: "asp2", title: "Build Consumer AI Products", category: "project", priority: "high" },
      { id: "asp3", title: "Scale AI Companies", category: "career", priority: "medium" },
      { id: "asp4", title: "Learn AI Ethics", category: "skill", priority: "medium" }
    ],
    skills: ["Product Strategy", "AI/ML", "Team Leadership", "Go-to-Market"],
    tribes: ["AI Product Leaders", "Tech Startup Founders", "Bay Area Innovators"]
  }

  // Generate mock matches for demonstration
  const generateMockMatches = useCallback((userAspirations: Array<{ id: string; title: string; category: string; priority: string }>): AspirationMatch[] => {
    const mockMatches = [
      {
        user: { id: "1", name: "Sarah Johnson", avatar: "SJ", title: "VP of AI at ScaleAI", company: "ScaleAI" },
        compatibility_score: 0.85,
        shared_interests: userAspirations.filter(a => a.category === 'career').slice(0, 2),
        reason: "Similar career aspirations in AI leadership",
        priority: 'high' as const
      },
      {
        user: { id: "2", name: "Marcus Rodriguez", avatar: "MR", title: "AI Product Lead", company: "OpenAI" },
        compatibility_score: 0.72,
        shared_interests: userAspirations.filter(a => a.category === 'project').slice(0, 1),
        reason: "Shared interest in consumer AI products",
        priority: 'high' as const
      },
      {
        user: { id: "3", name: "Lisa Chen", avatar: "LC", title: "AI Ethics Researcher", company: "Anthropic" },
        compatibility_score: 0.65,
        shared_interests: userAspirations.filter(a => a.category === 'skill').slice(0, 1),
        reason: "Mutual interest in AI ethics and responsible AI",
        priority: 'medium' as const
      },
      {
        user: { id: "4", name: "David Kumar", avatar: "DK", title: "Founder & CEO", company: "FlowAI" },
        compatibility_score: 0.58,
        shared_interests: userAspirations.filter(a => a.category === 'project').slice(0, 1),
        reason: "Entrepreneurial journey and AI product development",
        priority: 'medium' as const
      }
    ]

    return mockMatches.filter(match => {
      if (discoverFilter === 'all') return true
      return match.shared_interests.some(interest => interest.category === discoverFilter)
    })
  }, [discoverFilter])

  // Aspiration Matching Algorithm
  const findAspirationMatches = useCallback(async () => {
    setLoadingMatches(true)
    try {
      // Get user's aspirations from API
      const aspirationsResponse = await fetch('/api/aspirations')
      const aspirationsData = await aspirationsResponse.json()
      const userAspirations = aspirationsData.aspirations || profile.aspirations

      if (userAspirations.length === 0) {
        // Fallback to mock data if no real aspirations
        setAspirationMatches([])
        return
      }

      // Call matching API with user's aspirations
      const matchResponse = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspirations: userAspirations,
          limit: 10,
          min_compatibility: 0.3
        })
      })

      if (matchResponse.ok) {
        const matchData = await matchResponse.json()
        const transformedMatches = matchData.matches.map((match: {
          user: { id: string; name: string; clerk_id?: string; email?: string; avatar_url?: string; linkedin_profile_url?: string; title?: string; company?: string };
          compatibility_score: number;
          shared_interests?: Array<{ category: string; title: string }>;
          reason?: string;
        }) => ({
          user: {
            id: match.user.id || `match-${Math.random()}`,
            name: match.user.name || "Unknown User",
            avatar: match.user.name ? match.user.name.split(' ').map((n: string) => n[0]).join('') : "UU",
            title: match.user.title || "Professional",
            company: match.user.company || "Company"
          },
          compatibility_score: match.compatibility_score || 0,
          shared_interests: match.shared_interests || [],
          reason: match.reason || "Similar professional trajectory",
          priority: match.compatibility_score > 0.7 ? 'high' : match.compatibility_score > 0.4 ? 'medium' : 'low'
        }))
        setAspirationMatches(transformedMatches)
      } else {
        // Fallback to mock data on API failure
        setAspirationMatches(generateMockMatches(userAspirations))
      }
    } catch (error) {
      console.error('Error finding aspiration matches:', error)
      // Fallback to mock data
      setAspirationMatches(generateMockMatches(profile.aspirations))
    } finally {
      setLoadingMatches(false)
    }
  }, [profile.aspirations, generateMockMatches])

  // Load aspiration matches when discover tab is activated
  useEffect(() => {
    if (activeTab === 'discover' && aspirationMatches.length === 0) {
      findAspirationMatches()
    }
  }, [activeTab, aspirationMatches.length, findAspirationMatches])

  // Use fetched connections instead of mock data
  // Map the fetched connections to the structure expected by the UI
  const myNetworkDisplay = connections.map(conn => ({
    id: conn.connected_user.id,
    name: conn.connected_user.name,
    title: conn.connected_user.linkedin_profile?.headline || "Professional", // Use LinkedIn headline if available
    company: conn.connected_user.linkedin_profile?.company?.name || "Company", // Use LinkedIn company if available
    connectionStrength: conn.relationship_strength,
    lastInteraction: conn.last_interaction ? new Date(conn.last_interaction).toLocaleDateString() : "N/A",
    sharedInterests: conn.shared_aspirations,
    avatar: conn.connected_user.name ? conn.connected_user.name.split(' ').map((n: string) => n[0]).join('') : "UU"
  }))

  const _recommendedConnections = [
    {
      id: "rec1",
      name: "James Wilson",
      title: "Head of AI at Stripe",
      company: "Stripe",
      reason: "Shares 3 mutual connections",
      commonInterests: ["FinTech AI", "Product Strategy", "Scaling"],
      avatar: "JW"
    },
    {
      id: "rec2",
      name: "Lisa Chen",
      title: "AI Product Lead at Meta",
      company: "Meta",
      reason: "Similar career aspirations",
      commonInterests: ["AI Products", "Consumer Apps", "Growth"],
      avatar: "LC"
    },
    {
      id: "rec3",
      name: "David Kumar",
      title: "Founder of AI SaaS Company",
      company: "FlowAI",
      reason: "Same industry and goals",
      commonInterests: ["SaaS", "AI Tools", "Entrepreneurship"],
      avatar: "DK"
    }
  ]

  const tribes = [
    {
      id: "1",
      name: "AI Product Leaders",
      description: "Product managers and leaders building AI-powered products",
      members: 1247,
      activity: "High",
      myRole: "Member",
      lastActivity: "2 hours ago"
    },
    {
      id: "2",
      name: "Tech Startup Founders",
      description: "Entrepreneurs building the next generation of technology companies",
      members: 2156,
      activity: "Very High",
      myRole: "Moderator",
      lastActivity: "30 min ago"
    },
    {
      id: "3",
      name: "Bay Area Innovators",
      description: "Tech innovators and leaders in the San Francisco Bay Area",
      members: 3421,
      activity: "High",
      myRole: "Member",
      lastActivity: "1 hour ago"
    }
  ]

  const matchingOpportunities = [
    {
      id: "match1",
      type: "Collaboration",
      title: "AI Ethics Framework Development",
      description: "Join a cross-company initiative to develop ethical AI guidelines",
      participants: 8,
      skillsNeeded: ["AI Ethics", "Policy Development", "Legal"],
      timeline: "3 months",
      commitment: "4-6 hours/week"
    },
    {
      id: "match2",
      type: "Mentorship",
      title: "AI Product Mentorship Program",
      description: "Mentor junior PMs entering the AI product space",
      participants: 3,
      skillsNeeded: ["Product Management", "AI", "Mentoring"],
      timeline: "6 months",
      commitment: "2 hours/month"
    },
    {
      id: "match3",
      type: "Project",
      title: "Open Source AI Tool",
      description: "Build an open-source tool for AI model evaluation",
      participants: 12,
      skillsNeeded: ["Python", "ML Engineering", "Open Source"],
      timeline: "4 months",
      commitment: "8-10 hours/week"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <div className="container mx-auto p-6 space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <BreadcrumbNavigation />
          <Navigation />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Networking</h1>
            <p className="text-gray-400 mt-1">Connect with like-minded professionals and build meaningful relationships</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Discover
            </Button>
            <Link href="/networking/profile">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                My Profile
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="network">My Network</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="tribes">Tribes</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn Strategy</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Summary */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-white text-lg font-semibold">{profile.name}</h3>
                      <p className="text-gray-400">{profile.title} at {profile.company}</p>
                      <p className="text-gray-500 text-sm">{profile.location}</p>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Key Aspirations</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.aspirations.map((aspiration, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300">
                            {aspiration.title}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Active Tribes</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.tribes.map((tribe, index) => (
                          <Badge key={index} variant="outline" className="border-purple-500/50 text-purple-300">
                            {tribe}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    Network Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">247</div>
                  <p className="text-gray-400 text-sm">+12 this month</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Network className="h-5 w-5 text-green-400" />
                    Tribes Joined
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">8</div>
                  <p className="text-gray-400 text-sm">3 active communities</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">1.2K</div>
                  <p className="text-gray-400 text-sm">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-400" />
                    Profile Strength
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">87%</div>
                  <p className="text-gray-400 text-sm">Complete your profile</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-medium">Sarah Johnson</span> accepted your connection request
                      </p>
                      <p className="text-gray-400 text-xs">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Network className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        You joined the <span className="font-medium">AI Product Leaders</span> tribe
                      </p>
                      <p className="text-gray-400 text-xs">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-medium">Marcus Rodriguez</span> responded to your message
                      </p>
                      <p className="text-gray-400 text-xs">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">My Network</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myNetwork.map((person) => (
                <Card key={person.id} className="bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {person.avatar}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{person.name}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {person.title} at {person.company}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Connection:</span>
                        <Badge variant={
                          person.connectionStrength === 'Strong' ? 'default' :
                          person.connectionStrength === 'Medium' ? 'secondary' : 'outline'
                        }>
                          {person.connectionStrength}
                        </Badge>
                      </div>

                      <div>
                        <span className="text-gray-400 text-sm">Shared Interests:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {person.sharedInterests.slice(0, 2).map((interest, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {person.sharedInterests.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{person.sharedInterests.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-400">
                        Last interaction: {person.lastInteraction}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Discover Connections</h2>
                <p className="text-gray-400 text-sm mt-1">Find professionals with complementary aspirations and skills</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={discoverFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscoverFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={discoverFilter === 'career' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscoverFilter('career')}
                >
                  Career
                </Button>
                <Button
                  variant={discoverFilter === 'skill' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscoverFilter('skill')}
                >
                  Skills
                </Button>
                <Button
                  variant={discoverFilter === 'project' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscoverFilter('project')}
                >
                  Projects
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={findAspirationMatches}
                  disabled={loadingMatches}
                >
                  {loadingMatches ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Aspiration-Based Matches</h3>
                <Badge variant="secondary" className="text-xs">
                  {aspirationMatches.length} matches found
                </Badge>
              </div>

              {loadingMatches ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                    <p className="text-gray-400">Analyzing aspirations and finding matches...</p>
                  </div>
                </div>
              ) : aspirationMatches.length === 0 ? (
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-white font-medium mb-2">No matches found</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Add some aspirations to your profile to discover compatible professionals.
                    </p>
                    <Button size="sm">
                      <Link href="/aspirations">Add Aspirations</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {aspirationMatches
                    .filter(match => discoverFilter === 'all' || match.shared_interests.some(i => i.category === discoverFilter))
                    .sort((a, b) => b.compatibility_score - a.compatibility_score)
                    .map((match) => (
                    <Card key={match.user.id} className="bg-black/20 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                              match.priority === 'high' ? 'bg-gradient-to-br from-green-500 to-blue-600' :
                              match.priority === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                              'bg-gradient-to-br from-gray-500 to-gray-600'
                            }`}>
                              {match.user.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-white font-medium text-lg">{match.user.name}</h3>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    match.priority === 'high' ? 'bg-green-500/20 text-green-400' :
                                    match.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}
                                >
                                  {match.priority} match
                                </Badge>
                              </div>
                              <p className="text-gray-400">{match.user.title} at {match.user.company}</p>
                              <p className="text-blue-400 text-sm">{match.reason}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm text-gray-400 mb-1">Compatibility</div>
                              <div className={`font-medium ${
                                match.compatibility_score > 0.7 ? 'text-green-400' :
                                match.compatibility_score > 0.4 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {Math.round(match.compatibility_score * 100)}%
                              </div>
                            </div>
                            <Button size="sm" className="hover:scale-105 transition-transform">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Connect
                            </Button>
                          </div>
                        </div>

                        {match.shared_interests.length > 0 && (
                          <div className="mt-4">
                            <span className="text-gray-400 text-sm">Shared Aspirations:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {match.shared_interests.slice(0, 4).map((interest, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                                  {interest.title}
                                </Badge>
                              ))}
                              {match.shared_interests.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{match.shared_interests.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Aspiration Insights */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Aspiration Matching Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {aspirationMatches.filter(m => m.compatibility_score > 0.7).length}
                    </div>
                    <div className="text-sm text-gray-400">High Matches (70%+)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {aspirationMatches.filter(m => m.compatibility_score > 0.4 && m.compatibility_score <= 0.7).length}
                    </div>
                    <div className="text-sm text-gray-400">Medium Matches (40-70%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {profile.aspirations.length}
                    </div>
                    <div className="text-sm text-gray-400">Your Aspirations</div>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  <p>
                    Aspiration matching uses advanced algorithms to find professionals with complementary career trajectories,
                    shared learning goals, and collaborative project opportunities. Higher compatibility scores indicate
                    stronger alignment in professional DNA.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tribes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">My Tribes</h2>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Join New Tribe
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tribes.map((tribe) => (
                <Card key={tribe.id} className="bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Network className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary" className={
                        tribe.activity === 'Very High' ? 'bg-green-500/20 text-green-400' :
                        tribe.activity === 'High' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                      }>
                        {tribe.activity}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">{tribe.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {tribe.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Members:</span>
                        <span className="text-white">{tribe.members.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Your Role:</span>
                        <Badge variant="outline">{tribe.myRole}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Last Activity:</span>
                        <span className="text-white">{tribe.lastActivity}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Tribe
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Discuss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="linkedin" className="space-y-6">
            <div className="text-white">LinkedIn Strategy Dashboard - Coming Soon</div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Collaboration Opportunities</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">By Type</Button>
                <Button variant="outline" size="sm">By Skills</Button>
                <Button variant="outline" size="sm">By Timeline</Button>
              </div>
            </div>

            <div className="space-y-4">
              {matchingOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                            {opportunity.type}
                          </Badge>
                          <h3 className="text-white font-medium text-lg">{opportunity.title}</h3>
                        </div>
                        <p className="text-gray-400 mb-3">{opportunity.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Participants:</span>
                            <p className="text-white">{opportunity.participants}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Timeline:</span>
                            <p className="text-white">{opportunity.timeline}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Commitment:</span>
                            <p className="text-white">{opportunity.commitment}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Match Score:</span>
                            <p className="text-green-400 font-medium">92%</p>
                          </div>
                        </div>
                      </div>

                      <Button size="sm" className="ml-4">
                        <Heart className="h-4 w-4 mr-2" />
                        Express Interest
                      </Button>
                    </div>

                    <div>
                      <span className="text-gray-400 text-sm">Skills Needed:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {opportunity.skillsNeeded.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Networking Analytics</h2>
              <Button variant="outline" size="sm">Export Report</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Network Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">New Connections (30 days)</span>
                      <span className="text-white font-medium">+24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Messages Sent</span>
                      <span className="text-white font-medium">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Profile Views</span>
                      <span className="text-white font-medium">89</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tribe Activity</span>
                      <span className="text-white font-medium">High</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Connection Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Strong Connections</span>
                      <span className="text-green-400 font-medium">67%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Response Rate</span>
                      <span className="text-blue-400 font-medium">84%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Mutual Value Score</span>
                      <span className="text-purple-400 font-medium">8.7/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Network Diversity</span>
                      <span className="text-orange-400 font-medium">High</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        SJ
                      </div>
                      <div>
                        <p className="text-white font-medium">Sarah Johnson</p>
                        <p className="text-gray-400 text-sm">12 interactions • 95% response rate</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Top Performer
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        MR
                      </div>
                      <div>
                        <p className="text-white font-medium">Marcus Rodriguez</p>
                        <p className="text-gray-400 text-sm">8 interactions • 88% response rate</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      High Performer
                    </Badge>
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
