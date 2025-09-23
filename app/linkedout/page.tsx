"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkedOutOnboarding } from "@/components/linkedout-onboarding"
import { FortKnoxSecurityDashboard } from "@/components/fortknox-security-dashboard"
import { EnhancedAIOrchestration } from "@/components/enhanced-ai-orchestration"
import { AnalystAgentDashboard } from "@/components/analyst-agent-dashboard"
import { EnhancedLinkedInAnalytics } from "@/components/enhanced-linkedin-analytics"
import { DefConectNetworking } from "@/components/defconect-networking"
import { UniversalInbox } from "@/components/universal-inbox"
import { 
  Network, 
  Shield, 
  Bot, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  Home,
  Briefcase,
  Target,
  BarChart3,
  FileText,
  Globe,
  Zap,
  Heart,
  Star,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Linkedin
} from "lucide-react"

interface UserProfile {
  name: string
  email: string
  avatar?: string
  isOnboarded: boolean
  tribeCount: number
  connectionCount: number
  projectCount: number
  aspirationCount: number
}

interface LinkedOutDashboardProps {}

export default function LinkedOutDashboard({}: LinkedOutDashboardProps) {
  const [user, setUser] = useState<UserProfile>({
    name: '',
    email: '',
    isOnboarded: false,
    tribeCount: 0,
    connectionCount: 0,
    projectCount: 0,
    aspirationCount: 0
  })
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check if user is onboarded on component mount
  useEffect(() => {
    // Simulate checking user onboarding status
    const isOnboarded = localStorage.getItem('linkedout-onboarded') === 'true'
    const userName = localStorage.getItem('linkedout-user-name') || ''
    const userEmail = localStorage.getItem('linkedout-user-email') || ''
    
    if (isOnboarded && userName && userEmail) {
      setUser(prev => ({
        ...prev,
        name: userName,
        email: userEmail,
        isOnboarded: true,
        tribeCount: 3,
        connectionCount: 47,
        projectCount: 2,
        aspirationCount: 5
      }))
    } else {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = (profile: any) => {
    // Save user profile
    localStorage.setItem('linkedout-onboarded', 'true')
    localStorage.setItem('linkedout-user-name', profile.name)
    localStorage.setItem('linkedout-user-email', profile.email)
    
    setUser({
      name: profile.name,
      email: profile.email,
      isOnboarded: true,
      tribeCount: 0,
      connectionCount: 0,
      projectCount: 0,
      aspirationCount: profile.careerGoals.length
    })
    setShowOnboarding(false)
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    setUser(prev => ({
      ...prev,
      isOnboarded: true
    }))
  }

  // Show onboarding if user hasn't completed it
  if (showOnboarding) {
    return (
      <LinkedOutOnboarding
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    )
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'networking', label: 'Networking', icon: Network },
    { id: 'tribes', label: 'Tribes', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'aspirations', label: 'Aspirations', icon: Target },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'analyst-agent', label: 'Analyst Agent', icon: BarChart3 },
    { id: 'linkedin-analytics', label: 'LinkedIn Analytics', icon: Linkedin },
    { id: 'ai-orchestration', label: 'AI Orchestration', icon: Bot },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">LinkedOut</h1>
                  <p className="text-xs text-gray-500">AI-Powered Professional Networking</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {user.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out md:transition-none`}>
          <div className="h-full overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
                <p className="text-gray-600">Here's what's happening in your professional network</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Connections</p>
                        <p className="text-3xl font-bold text-blue-600">{user.connectionCount}</p>
                      </div>
                      <Network className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">+12 this week</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tribes</p>
                        <p className="text-3xl font-bold text-green-600">{user.tribeCount}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">3 active communities</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Projects</p>
                        <p className="text-3xl font-bold text-purple-600">{user.projectCount}</p>
                      </div>
                      <Briefcase className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">2 in progress</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Aspirations</p>
                        <p className="text-3xl font-bold text-orange-600">{user.aspirationCount}</p>
                      </div>
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">5 goals tracked</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest network interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Joined "AI Innovators" tribe</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">New message from Sarah Chen</p>
                          <p className="text-xs text-gray-500">4 hours ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Target className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Updated career goal: "Become a team lead"</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                    <CardDescription>Personalized suggestions for you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Connection Suggestion</span>
                        </div>
                        <p className="text-sm text-blue-800">
                          Connect with Alex Rodriguez - shares your interest in AI and has similar career goals
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Tribe Recommendation</span>
                        </div>
                        <p className="text-sm text-green-800">
                          Join "Tech Leaders" tribe - 89% match with your aspirations
                        </p>
                      </div>
                      
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Briefcase className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Project Opportunity</span>
                        </div>
                        <p className="text-sm text-purple-800">
                          "AI Startup" project needs a technical lead - matches your skills
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Networking Tab */}
          {activeTab === 'networking' && (
            <DefConectNetworking />
          )}

          {/* AI Orchestration Tab */}
          {activeTab === 'ai-orchestration' && (
            <EnhancedAIOrchestration />
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <FortKnoxSecurityDashboard />
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <UniversalInbox />
          )}

          {/* Analyst Agent Tab */}
          {activeTab === 'analyst-agent' && (
            <AnalystAgentDashboard />
          )}

          {/* LinkedIn Analytics Tab */}
          {activeTab === 'linkedin-analytics' && (
            <EnhancedLinkedInAnalytics />
          )}

          {/* Other tabs - placeholder content */}
          {['tribes', 'projects', 'aspirations', 'settings'].includes(activeTab) && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
                <p className="text-gray-600">Manage your {activeTab} and track your progress</p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                  <CardDescription>
                    This feature is under development and will be available soon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Zap className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We're working hard to bring you the best {activeTab} experience.
                    </p>
                    <Button>
                      Get Notified
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
