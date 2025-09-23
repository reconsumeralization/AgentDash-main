"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Home,
  RotateCcw, 
  Play, 
  Pause, 
  Settings,
  Maximize,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  Brain,
  Users,
  Shield,
  BarChart3,
  Globe,
  Target,
  Sparkles,
  Activity,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Star,
  Heart,
  Eye,
  TrendingUp,
  Timer,
  Clock,
  Wifi,
  Battery,
  Signal,
  Loader2,
  ExternalLink,
  BookOpen,
  Code,
  Palette,
  Layers,
  Grid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Share,
  Bookmark,
  Flag,
  Archive,
  Trash2,
  Edit,
  Copy,
  Scissors,
  Clipboard,
  Save,
  Upload,
  Camera,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MousePointer,
  Keyboard,
  WifiOff
} from "lucide-react"
import Link from "next/link"

interface ShowcaseOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  route: string
  category: 'rotation' | 'demo' | 'interactive' | 'analytics'
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'development' | 'planned'
  features: string[]
  metrics: {
    performance: number
    engagement: number
    complexity: number
  }
}

const SHOWCASE_OPTIONS: ShowcaseOption[] = [
  {
    id: 'feature-rotation',
    name: 'Feature Rotation Showcase',
    description: 'Classic feature rotation with detailed metrics and interactions',
    icon: <RotateCcw className="h-6 w-6" />,
    route: '/gui-rotation',
    category: 'rotation',
    priority: 'high',
    status: 'active',
    features: ['Auto-rotation', 'Interactive controls', 'Real-time metrics', 'Multi-device support'],
    metrics: { performance: 95, engagement: 88, complexity: 75 }
  },
  {
    id: 'advanced-carousel',
    name: 'Advanced Feature Carousel',
    description: 'Premium carousel with real-time animations and advanced controls',
    icon: <Sparkles className="h-6 w-6" />,
    route: '/gui-rotation',
    category: 'interactive',
    priority: 'high',
    status: 'active',
    features: ['Animated transitions', 'Real-time data', 'Advanced controls', 'Performance monitoring'],
    metrics: { performance: 98, engagement: 92, complexity: 85 }
  },
  {
    id: 'demo-system',
    name: 'Feature Demonstration System',
    description: 'Interactive demonstration system with step-by-step guidance',
    icon: <Play className="h-6 w-6" />,
    route: '/demo-rotation',
    category: 'demo',
    priority: 'high',
    status: 'active',
    features: ['Step-by-step demos', 'Interactive tutorials', 'Progress tracking', 'Analytics'],
    metrics: { performance: 93, engagement: 96, complexity: 80 }
  },
  {
    id: 'comprehensive-rotation',
    name: 'Comprehensive Demo Rotation',
    description: 'Complete rotation system cycling through all GUI modes',
    icon: <Layers className="h-6 w-6" />,
    route: '/demo-rotation',
    category: 'rotation',
    priority: 'medium',
    status: 'active',
    features: ['Multi-mode rotation', 'Session tracking', 'Performance metrics', 'Live analytics'],
    metrics: { performance: 90, engagement: 85, complexity: 90 }
  }
]

export default function GUIShowcasePage() {
  const [selectedOption, setSelectedOption] = useState<ShowcaseOption | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'performance' | 'engagement'>('priority')
  const [sessionStats, setSessionStats] = useState({
    startTime: new Date(),
    views: 0,
    interactions: 0,
    optionsExplored: 0
  })

  const filteredOptions = SHOWCASE_OPTIONS
    .filter(option => filterCategory === 'all' || option.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.metrics.performance - a.metrics.performance
        case 'engagement':
          return b.metrics.engagement - a.metrics.engagement
        case 'priority':
        default:
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
    })

  const handleOptionSelect = useCallback((option: ShowcaseOption) => {
    setSelectedOption(option)
    setSessionStats(prev => ({
      ...prev,
      views: prev.views + 1,
      optionsExplored: prev.optionsExplored + 1
    }))
  }, [])

  const handleInteraction = useCallback(() => {
    setSessionStats(prev => ({
      ...prev,
      interactions: prev.interactions + 1
    }))
  }, [])

  const getSessionDuration = () => {
    const now = new Date()
    const duration = Math.floor((now.getTime() - sessionStats.startTime.getTime()) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <h1 className="text-xl font-bold text-white">GUI Showcase System</h1>
                <Badge variant="outline" className="text-white border-white/30">
                  Interactive Demos
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="text-white"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="text-white"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Badge variant="outline" className="text-white border-white/30">
                  Session: {getSessionDuration()}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  Views: {sessionStats.views}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  Interactions: {sessionStats.interactions}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="fixed top-20 left-4 right-4 z-40">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-white/80" />
                  <span className="text-sm text-white/80">Filter:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="rotation">Rotation</option>
                    <option value="demo">Demo</option>
                    <option value="interactive">Interactive</option>
                    <option value="analytics">Analytics</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4 text-white/80" />
                  <span className="text-sm text-white/80">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="priority">Priority</option>
                    <option value="performance">Performance</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/80">Options Explored:</span>
                <Badge variant="outline" className="text-white border-white/30">
                  {sessionStats.optionsExplored} / {SHOWCASE_OPTIONS.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-4 px-4">
        {selectedOption ? (
          <div className="max-w-6xl mx-auto">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white flex items-center space-x-3">
                      {selectedOption.icon}
                      <span>{selectedOption.name}</span>
                      <Badge variant={getStatusVariant(selectedOption.status)}>
                        {selectedOption.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-white/80 mt-2">{selectedOption.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOption(null)}
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="launch">Launch</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-blue-400 mb-2">
                            {selectedOption.metrics.performance}%
                          </div>
                          <div className="text-white/80">Performance</div>
                        </CardContent>
                      </Card>
                      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-green-400 mb-2">
                            {selectedOption.metrics.engagement}%
                          </div>
                          <div className="text-white/80">Engagement</div>
                        </CardContent>
                      </Card>
                      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-purple-400 mb-2">
                            {selectedOption.metrics.complexity}%
                          </div>
                          <div className="text-white/80">Complexity</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                        <CardHeader>
                          <CardTitle className="text-white">Category & Priority</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-white/80">Category</span>
                            <Badge variant="outline" className="text-white border-white/30">
                              {selectedOption.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/80">Priority</span>
                            <Badge variant={getPriorityVariant(selectedOption.priority)}>
                              {selectedOption.priority}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/80">Status</span>
                            <Badge variant={getStatusVariant(selectedOption.status)}>
                              {selectedOption.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                        <CardHeader>
                          <CardTitle className="text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Link href={selectedOption.route}>
                            <Button 
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                              onClick={handleInteraction}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Launch Demo
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            className="w-full border-white/30 text-white hover:bg-white/20"
                            onClick={handleInteraction}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in New Tab
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full border-white/30 text-white hover:bg-white/20"
                            onClick={handleInteraction}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Documentation
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-6">
                    <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white">Available Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedOption.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                              <Star className="h-5 w-5 text-yellow-400" />
                              <span className="text-white">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="metrics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                        <CardHeader>
                          <CardTitle className="text-white">Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-white/80 mb-2">
                              <span>Performance</span>
                              <span>{selectedOption.metrics.performance}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${selectedOption.metrics.performance}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-white/80 mb-2">
                              <span>Engagement</span>
                              <span>{selectedOption.metrics.engagement}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${selectedOption.metrics.engagement}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-white/80 mb-2">
                              <span>Complexity</span>
                              <span>{selectedOption.metrics.complexity}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${selectedOption.metrics.complexity}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                        <CardHeader>
                          <CardTitle className="text-white">Session Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-white/80">
                            <span>Session Duration</span>
                            <span>{getSessionDuration()}</span>
                          </div>
                          <div className="flex justify-between text-white/80">
                            <span>Total Views</span>
                            <span>{sessionStats.views}</span>
                          </div>
                          <div className="flex justify-between text-white/80">
                            <span>Interactions</span>
                            <span>{sessionStats.interactions}</span>
                          </div>
                          <div className="flex justify-between text-white/80">
                            <span>Options Explored</span>
                            <span>{sessionStats.optionsExplored}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                        <CardHeader>
                          <CardTitle className="text-white">Live Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-green-400" />
                            <span className="text-white/80">Real-time tracking active</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Wifi className="h-4 w-4 text-blue-400" />
                            <span className="text-white/80">Live data streaming</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Battery className="h-4 w-4 text-yellow-400" />
                            <span className="text-white/80">Performance optimized</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="launch" className="space-y-6">
                    <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white">Launch Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Alert>
                          <Sparkles className="h-4 w-4" />
                          <AlertDescription className="text-white">
                            Ready to launch! This demo system will showcase our optimized features with real-time interactions and analytics.
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Link href={selectedOption.route}>
                            <Button 
                              size="lg"
                              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                              onClick={handleInteraction}
                            >
                              <Play className="h-5 w-5 mr-2" />
                              Launch Now
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="w-full border-white/30 text-white hover:bg-white/20"
                            onClick={handleInteraction}
                          >
                            <Settings className="h-5 w-5 mr-2" />
                            Configure Settings
                          </Button>
                        </div>

                        <div className="p-4 bg-white/10 rounded-lg">
                          <h4 className="text-white font-semibold mb-2">Launch Preview</h4>
                          <p className="text-white/80 text-sm">
                            This will open the {selectedOption.name} in a new experience with full interactive capabilities, 
                            real-time analytics, and comprehensive feature demonstrations.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOptions.map((option) => (
                <Card 
                  key={option.id}
                  className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => handleOptionSelect(option)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`text-${getCategoryColor(option.category)}-400`}>
                          {option.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{option.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getPriorityVariant(option.priority)} className="text-xs">
                              {option.priority}
                            </Badge>
                            <Badge variant={getStatusVariant(option.status)} className="text-xs">
                              {option.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-white/80 text-sm mb-4">{option.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-white/80 text-sm">
                        <span>Performance</span>
                        <span>{option.metrics.performance}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${option.metrics.performance}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-white/80 text-sm">
                        <span>Engagement</span>
                        <span>{option.metrics.engagement}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${option.metrics.engagement}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-white/80 text-sm">
                        <span>Complexity</span>
                        <span>{option.metrics.complexity}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${option.metrics.complexity}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-xs">
                          {option.features.length} features
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOptionSelect(option)
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-white">
                  GUI Showcase System
                </span>
                <Badge variant="outline" className="text-white border-white/30">
                  {filteredOptions.length} options available
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {viewMode === 'grid' ? 'Grid View' : 'List View'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white/80">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs">Live Demo System</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">Real-time Updates</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper Functions
function getCategoryColor(category: string) {
  const colors = {
    rotation: 'blue',
    demo: 'green',
    interactive: 'purple',
    analytics: 'orange'
  }
  return colors[category as keyof typeof colors] || 'gray'
}

function getPriorityVariant(priority: string) {
  const variants = {
    high: "default" as const,
    medium: "secondary" as const,
    low: "outline" as const
  }
  return variants[priority as keyof typeof variants] || "secondary"
}

function getStatusVariant(status: string) {
  const variants = {
    active: "default" as const,
    development: "secondary" as const,
    planned: "outline" as const
  }
  return variants[status as keyof typeof variants] || "secondary"
}
