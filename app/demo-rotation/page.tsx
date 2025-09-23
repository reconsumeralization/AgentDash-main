"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
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
  Loader2
} from "lucide-react"
import { FeatureDemonstrationSystem } from "@/components/feature-demonstration-system"
import { FeatureRotationShowcase } from "@/components/feature-rotation-showcase"
import { AdvancedFeatureCarousel } from "@/components/advanced-feature-carousel"

interface RotationMode {
  id: string
  name: string
  description: string
  component: React.ComponentType<any>
  duration: number
  category: 'showcase' | 'demo' | 'carousel' | 'analytics'
  priority: number
}

const ROTATION_MODES: RotationMode[] = [
  {
    id: 'feature-showcase',
    name: 'Feature Showcase',
    description: 'Classic feature rotation with detailed metrics and interactions',
    component: FeatureRotationShowcase,
    duration: 30000,
    category: 'showcase',
    priority: 1
  },
  {
    id: 'advanced-carousel',
    name: 'Advanced Carousel',
    description: 'Premium carousel with real-time animations and advanced controls',
    component: AdvancedFeatureCarousel,
    duration: 25000,
    category: 'carousel',
    priority: 2
  },
  {
    id: 'demo-system',
    name: 'Demo System',
    description: 'Interactive demonstration system with step-by-step guidance',
    component: FeatureDemonstrationSystem,
    duration: 45000,
    category: 'demo',
    priority: 3
  }
]

export default function DemoRotationPage() {
  const [currentModeIndex, setCurrentModeIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(30000)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [sessionStats, setSessionStats] = useState({
    startTime: new Date(),
    totalRotations: 0,
    totalInteractions: 0,
    modesCompleted: 0,
    featuresViewed: 0
  })
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0
  })

  const currentMode = ROTATION_MODES[currentModeIndex]

  // Auto-rotation between modes
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentModeIndex(prev => (prev + 1) % ROTATION_MODES.length)
      setSessionStats(prev => ({
        ...prev,
        totalRotations: prev.totalRotations + 1,
        modesCompleted: prev.modesCompleted + 1
      }))
    }, rotationSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, rotationSpeed])

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now()
    
    const updateMetrics = () => {
      const currentTime = performance.now()
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: currentTime - startTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }))
    }

    const interval = setInterval(updateMetrics, 1000)
    return () => clearInterval(interval)
  }, [currentModeIndex])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
    setSessionStats(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1
    }))
  }, [isPlaying])

  const handleSpeedChange = useCallback((speed: number) => {
    setRotationSpeed(speed)
    setSessionStats(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1
    }))
  }, [])

  const handleModeSelect = useCallback((index: number) => {
    setCurrentModeIndex(index)
    setSessionStats(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1
    }))
  }, [])

  const handleInteraction = useCallback(() => {
    setSessionStats(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1,
      featuresViewed: prev.featuresViewed + 1
    }))
  }, [])

  const getSessionDuration = () => {
    const now = new Date()
    const duration = Math.floor((now.getTime() - sessionStats.startTime.getTime()) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const CurrentComponent = currentMode.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Master Control Panel */}
      <div className="fixed top-4 left-4 right-4 z-50">
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
                  <span className="text-white/80 text-sm">Auto-Rotate</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/80">Speed:</span>
                  <Button
                    variant={rotationSpeed === 15000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(15000)}
                    className="text-white"
                  >
                    Fast
                  </Button>
                  <Button
                    variant={rotationSpeed === 30000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(30000)}
                    className="text-white"
                  >
                    Normal
                  </Button>
                  <Button
                    variant={rotationSpeed === 60000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(60000)}
                    className="text-white"
                  >
                    Slow
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/80">Current:</span>
                  <Badge variant="outline" className="text-white border-white/30">
                    {currentMode.name}
                  </Badge>
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

                <Badge variant="outline" className="text-white border-white/30">
                  Session: {getSessionDuration()}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  Rotations: {sessionStats.totalRotations}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  Interactions: {sessionStats.totalInteractions}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mode Selection */}
      <div className="fixed top-20 left-4 z-40">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-3">
            <div className="space-y-2">
              {ROTATION_MODES.map((mode, index) => (
                <Button
                  key={mode.id}
                  variant={index === currentModeIndex ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleModeSelect(index)}
                  className="w-full justify-start text-xs text-white hover:bg-white/20"
                >
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(mode.category)}
                    <span className="truncate">{mode.name}</span>
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                      {mode.priority}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="fixed top-20 right-4 w-80 z-30">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Live Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-white/80">
                <span>Render Time</span>
                <span>{performanceMetrics.renderTime.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Memory Usage</span>
                <span>{(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Total Rotations</span>
                <span>{sessionStats.totalRotations}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Features Viewed</span>
                <span>{sessionStats.featuresViewed}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Modes Completed</span>
                <span>{sessionStats.modesCompleted}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-semibold">Current Mode Info</h4>
              <div className="text-xs text-white/70 space-y-1">
                <div>Duration: {currentMode.duration / 1000}s</div>
                <div>Category: {currentMode.category}</div>
                <div>Priority: {currentMode.priority}</div>
                <div>Description: {currentMode.description}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="pt-24 pb-4 px-4">
        <div className={`transition-all duration-1000 ${
          viewMode === 'mobile' ? 'max-w-sm mx-auto' : 
          viewMode === 'tablet' ? 'max-w-4xl mx-auto' : 
          'w-full'
        }`}>
          <div className="animate-fadeIn">
            <CurrentComponent onInteraction={handleInteraction} />
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-white">
                  Mode: {currentMode.name}
                </span>
                <Badge variant="outline" className="text-white border-white/30">
                  {currentMode.category}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  Priority: {currentMode.priority}
                </Badge>
                <div className="flex items-center space-x-2 text-white/80">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs">Live Demo</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/80">
                  {currentModeIndex + 1} of {ROTATION_MODES.length}
                </span>
                <div className="w-20 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentModeIndex + 1) / ROTATION_MODES.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="flex flex-col space-y-2">
          <Button
            variant="default"
            size="lg"
            className="rounded-full w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-2xl"
            onClick={() => {
              setSessionStats(prev => ({
                ...prev,
                totalInteractions: prev.totalInteractions + 1
              }))
            }}
          >
            <Sparkles className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full w-10 h-10 border-white/30 text-white hover:bg-white/20"
            onClick={() => {
              setSessionStats({
                startTime: new Date(),
                totalRotations: 0,
                totalInteractions: 0,
                modesCompleted: 0,
                featuresViewed: 0
              })
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading Overlay */}
      {!currentMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center text-white">
            <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Loading Demo System</h2>
            <p className="text-white/80">Preparing interactive demonstrations...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Functions
function getCategoryIcon(category: string) {
  const icons = {
    showcase: <Eye className="h-4 w-4" />,
    demo: <Play className="h-4 w-4" />,
    carousel: <RotateCcw className="h-4 w-4" />,
    analytics: <BarChart3 className="h-4 w-4" />
  }
  return icons[category as keyof typeof icons] || <Star className="h-4 w-4" />
}
