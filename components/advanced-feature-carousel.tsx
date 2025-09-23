"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Maximize,
  Minimize,
  Zap,
  Brain,
  Users,
  Shield,
  BarChart3,
  MessageSquare,
  Search,
  Globe,
  Lock,
  Star,
  TrendingUp,
  Activity,
  Target,
  Rocket,
  Sparkles,
  Eye,
  Heart,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Volume2,
  VolumeX,
  MousePointer,
  Keyboard,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from "lucide-react"

interface CarouselFeature {
  id: string
  title: string
  description: string
  category: 'integration' | 'ai' | 'security' | 'analytics' | 'collaboration'
  priority: 'critical' | 'high' | 'medium'
  status: 'active' | 'demo' | 'development' | 'planned'
  metrics: {
    performance: number
    engagement: number
    adoption: number
    innovation: number
  }
  visual: {
    color: string
    gradient: string
    icon: React.ReactNode
    animation: string
  }
  interactions: string[]
  realTimeData: any
}

const CAROUSEL_FEATURES: CarouselFeature[] = [
  {
    id: 'linkedin-integration',
    title: 'LinkedIn API Integration',
    description: 'Enterprise-grade multi-business line integration with progressive permissions and advanced rate limiting',
    category: 'integration',
    priority: 'critical',
    status: 'active',
    metrics: { performance: 98, engagement: 95, adoption: 87, innovation: 92 },
    visual: {
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      icon: <Globe className="h-8 w-8" />,
      animation: 'pulse'
    },
    interactions: ['Create Campaign', 'Search Leads', 'Manage Connections', 'Analytics Dashboard'],
    realTimeData: { campaigns: 45, leads: 234, connections: 1200, apiCalls: 15678 }
  },
  {
    id: 'ai-orchestration',
    title: 'AI Agent Orchestration',
    description: 'LinkedIn-aware intelligent agents with collaborative task execution and real-time performance monitoring',
    category: 'ai',
    priority: 'critical',
    status: 'active',
    metrics: { performance: 96, engagement: 92, adoption: 78, innovation: 95 },
    visual: {
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      icon: <Brain className="h-8 w-8" />,
      animation: 'bounce'
    },
    interactions: ['Select Agent', 'Execute Task', 'Monitor Performance', 'Optimize Workflow'],
    realTimeData: { agents: 8, tasks: 156, successRate: 94, tokensUsed: 45678 }
  },
  {
    id: 'aspiration-networking',
    title: 'Aspiration-Based Networking',
    description: 'Revolutionary focus on future goals rather than past achievements with AI-powered compatibility matching',
    category: 'collaboration',
    priority: 'high',
    status: 'active',
    metrics: { performance: 94, engagement: 89, adoption: 82, innovation: 98 },
    visual: {
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      icon: <Target className="h-8 w-8" />,
      animation: 'spin'
    },
    interactions: ['Create Tribe', 'Find Aspirations', 'Match Members', 'Network Analysis'],
    realTimeData: { tribes: 23, members: 456, aspirations: 89, matches: 234 }
  },
  {
    id: 'business-intelligence',
    title: 'Predictive Analytics',
    description: 'ML-powered business intelligence with real-time insights and growth predictions',
    category: 'analytics',
    priority: 'high',
    status: 'active',
    metrics: { performance: 97, engagement: 91, adoption: 85, innovation: 93 },
    visual: {
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      icon: <BarChart3 className="h-8 w-8" />,
      animation: 'wiggle'
    },
    interactions: ['Generate Report', 'View Predictions', 'Export Data', 'Custom Dashboard'],
    realTimeData: { reports: 12, predictions: 34, accuracy: 92, insights: 567 }
  },
  {
    id: 'zero-trust-security',
    title: 'Zero-Trust Security',
    description: 'Enterprise-grade security with LinkedIn compliance automation and advanced threat detection',
    category: 'security',
    priority: 'critical',
    status: 'active',
    metrics: { performance: 99, engagement: 88, adoption: 93, innovation: 89 },
    visual: {
      color: 'red',
      gradient: 'from-red-500 to-rose-500',
      icon: <Shield className="h-8 w-8" />,
      animation: 'ping'
    },
    interactions: ['Multi-Factor Auth', 'Threat Detection', 'Compliance Check', 'Security Audit'],
    realTimeData: { threats: 0, compliance: 100, authentications: 2340, scans: 4567 }
  },
  {
    id: 'cross-platform-collaboration',
    title: 'Cross-Platform Collaboration',
    description: 'Unified workspace experience across all platforms with real-time synchronization',
    category: 'collaboration',
    priority: 'high',
    status: 'active',
    metrics: { performance: 95, engagement: 87, adoption: 79, innovation: 91 },
    visual: {
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-500',
      icon: <Users className="h-8 w-8" />,
      animation: 'float'
    },
    interactions: ['Join Workspace', 'Share Files', 'Video Call', 'Screen Share'],
    realTimeData: { workspaces: 15, participants: 234, files: 1234, calls: 89 }
  }
]

export function AdvancedFeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(4000)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [showAnimations, setShowAnimations] = useState(true)
  const [interactionCount, setInteractionCount] = useState(0)
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  
  const carouselRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentFeature = CAROUSEL_FEATURES[currentIndex]

  // Auto-rotation with smooth transitions
  useEffect(() => {
    if (!isPlaying) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_FEATURES.length)
      setInteractionCount(prev => prev + 1)
    }, rotationSpeed)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, rotationSpeed])

  // Real-time data updates
  useEffect(() => {
    if (!realTimeUpdates) return

    const updateInterval = setInterval(() => {
      // Simulate real-time data updates
      setInteractionCount(prev => prev + 1)
    }, 2000)

    return () => clearInterval(updateInterval)
  }, [realTimeUpdates])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_FEATURES.length)
    setInteractionCount(prev => prev + 1)
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_FEATURES.length) % CAROUSEL_FEATURES.length)
    setInteractionCount(prev => prev + 1)
  }, [])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
    setInteractionCount(prev => prev + 1)
  }, [isPlaying])

  const handleSpeedChange = useCallback((speed: number) => {
    setRotationSpeed(speed)
    setInteractionCount(prev => prev + 1)
  }, [])

  const handleFeatureSelect = useCallback((index: number) => {
    setCurrentIndex(index)
    setInteractionCount(prev => prev + 1)
  }, [])

  const handleInteraction = useCallback((interaction: string) => {
    console.log(`User interacted with: ${interaction}`)
    setInteractionCount(prev => prev + 1)
  }, [])

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full animate-bounce" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full animate-ping" />
      </div>

      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-50">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="hover:bg-white/20 text-white"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    className="hover:bg-white/20 text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    className="hover:bg-white/20 text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/80">Speed:</span>
                  <Button
                    variant={rotationSpeed === 2000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(2000)}
                    className="text-white"
                  >
                    Fast
                  </Button>
                  <Button
                    variant={rotationSpeed === 4000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(4000)}
                    className="text-white"
                  >
                    Normal
                  </Button>
                  <Button
                    variant={rotationSpeed === 6000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(6000)}
                    className="text-white"
                  >
                    Slow
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'desktop' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('desktop')}
                    className="text-white"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'tablet' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('tablet')}
                    className="text-white"
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'mobile' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('mobile')}
                    className="text-white"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="text-white"
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAnimations(!showAnimations)}
                    className="text-white"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>

                <Badge variant="outline" className="text-white border-white/30">
                  Interactions: {interactionCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Navigation */}
      <div className="absolute top-20 left-4 z-40">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-3">
            <div className="space-y-2">
              {CAROUSEL_FEATURES.map((feature, index) => (
                <Button
                  key={feature.id}
                  variant={index === currentIndex ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleFeatureSelect(index)}
                  className="w-full justify-start text-xs text-white hover:bg-white/20"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`text-${feature.visual.color}-400`}>
                      {feature.visual.icon}
                    </div>
                    <span className="truncate">{feature.title}</span>
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                      {feature.metrics.performance}%
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Carousel Display */}
      <div className="absolute top-20 left-64 right-4 bottom-4">
        <div className={`h-full transition-all duration-1000 ${
          viewMode === 'mobile' ? 'max-w-sm mx-auto' : 
          viewMode === 'tablet' ? 'max-w-2xl mx-auto' : 
          'w-full'
        }`}>
          <FeatureCarouselDisplay
            feature={currentFeature}
            viewMode={viewMode}
            showAnimations={showAnimations}
            onInteraction={handleInteraction}
            realTimeUpdates={realTimeUpdates}
          />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-64 right-4 z-30">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-white">{currentFeature.title}</span>
                <Badge variant={getPriorityVariant(currentFeature.priority)} className="text-white">
                  {currentFeature.priority}
                </Badge>
                <Badge variant={getStatusVariant(currentFeature.status)} className="text-white">
                  {currentFeature.status}
                </Badge>
                <div className="flex items-center space-x-2 text-white/80">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">Real-time</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/80">
                  {currentIndex + 1} of {CAROUSEL_FEATURES.length}
                </span>
                <Progress 
                  value={((currentIndex + 1) / CAROUSEL_FEATURES.length) * 100} 
                  className="w-20 bg-white/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-20 right-4 z-40">
        <div className="flex flex-col space-y-2">
          <Button
            variant="default"
            size="lg"
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-2xl"
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
          >
            {realTimeUpdates ? <Activity className="h-6 w-6" /> : <RefreshCw className="h-6 w-6" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full w-10 h-10 border-white/30 text-white hover:bg-white/20"
            onClick={() => setInteractionCount(0)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeatureCarouselDisplay({ 
  feature, 
  viewMode, 
  showAnimations, 
  onInteraction,
  realTimeUpdates 
}: { 
  feature: CarouselFeature
  viewMode: 'desktop' | 'tablet' | 'mobile'
  showAnimations: boolean
  onInteraction: (interaction: string) => void
  realTimeUpdates: boolean
}) {
  const [currentData, setCurrentData] = useState(feature.realTimeData)

  // Simulate real-time data updates
  useEffect(() => {
    if (!realTimeUpdates) return

    const interval = setInterval(() => {
      setCurrentData((prev: any) => ({
        ...prev,
        // Simulate some data changes
        ...Object.fromEntries(
          Object.entries(prev).map(([key, value]) => [
            key,
            typeof value === 'number' ? value + Math.floor(Math.random() * 5) : value
          ])
        )
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [realTimeUpdates])

  return (
    <div className="h-full">
      <Card className={`h-full backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl transition-all duration-1000 ${
        showAnimations ? `animate-${feature.visual.animation}` : ''
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center space-x-3 text-white">
                <div className={`text-${feature.visual.color}-400 ${showAnimations ? 'animate-pulse' : ''}`}>
                  {feature.visual.icon}
                </div>
                <span>{feature.title}</span>
                <Sparkles className="h-5 w-5 text-yellow-400 animate-spin" />
              </CardTitle>
              <p className="text-white/80 mt-2">{feature.description}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onInteraction('refresh')}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="h-full overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(feature.metrics).map(([key, value]) => (
              <Card key={key} className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold text-${feature.visual.color}-400`}>
                    {value}%
                  </div>
                  <div className="text-sm text-white/80 capitalize">{key}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Real-time Data Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(currentData).map(([key, value]) => (
              <Card key={key} className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-white">
                    {typeof value === 'number' ? value.toLocaleString() : String(value)}
                  </div>
                  <div className="text-sm text-white/80 capitalize">{key}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interactive Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {feature.interactions.map((interaction, index) => (
              <Button
                key={index}
                onClick={() => onInteraction(interaction)}
                className={`bg-gradient-to-r ${feature.visual.gradient} hover:opacity-90 text-white shadow-lg transition-all duration-300 ${
                  showAnimations ? 'hover:scale-105' : ''
                }`}
              >
                {interaction}
              </Button>
            ))}
          </div>

          {/* Performance Indicators */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Real-time Performance</h3>
            <div className="space-y-3">
              {Object.entries(feature.metrics).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1 text-white/80">
                    <span className="capitalize">{key}</span>
                    <span>{value}%</span>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-2 bg-white/20" 
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Functions
function getPriorityVariant(priority: string) {
  const variants = {
    critical: "destructive" as const,
    high: "default" as const,
    medium: "secondary" as const
  }
  return variants[priority as keyof typeof variants] || "secondary"
}

function getStatusVariant(status: string) {
  const variants = {
    active: "default" as const,
    demo: "secondary" as const,
    development: "outline" as const,
    planned: "secondary" as const
  }
  return variants[status as keyof typeof variants] || "secondary"
}
