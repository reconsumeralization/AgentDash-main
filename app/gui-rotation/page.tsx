"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  TrendingUp
} from "lucide-react"
import { FeatureRotationShowcase } from "@/components/feature-rotation-showcase"
import { AdvancedFeatureCarousel } from "@/components/advanced-feature-carousel"

export default function GUIRotationPage() {
  const [activeMode, setActiveMode] = useState<'showcase' | 'carousel' | 'hybrid'>('showcase')
  const [isRotating, setIsRotating] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(5000)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [totalInteractions, setTotalInteractions] = useState(0)
  const [sessionStartTime] = useState(new Date())

  // Auto-rotation between different GUI modes
  useEffect(() => {
    if (!isRotating) return

    const interval = setInterval(() => {
      setActiveMode(prev => {
        const modes: ('showcase' | 'carousel' | 'hybrid')[] = ['showcase', 'carousel', 'hybrid']
        const currentIndex = modes.indexOf(prev)
        return modes[(currentIndex + 1) % modes.length]
      })
      setTotalInteractions(prev => prev + 1)
    }, rotationSpeed * 3) // Rotate modes every 3 feature rotations

    return () => clearInterval(interval)
  }, [isRotating, rotationSpeed])

  const handleModeChange = (mode: 'showcase' | 'carousel' | 'hybrid') => {
    setActiveMode(mode)
    setTotalInteractions(prev => prev + 1)
  }

  const handlePlayPause = () => {
    setIsRotating(!isRotating)
    setTotalInteractions(prev => prev + 1)
  }

  const handleSpeedChange = (speed: number) => {
    setRotationSpeed(speed)
    setTotalInteractions(prev => prev + 1)
  }

  const handleInteraction = () => {
    setTotalInteractions(prev => prev + 1)
  }

  const getSessionDuration = () => {
    const now = new Date()
    const duration = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Master Controls */}
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
                    {isRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="text-white/80 text-sm">Auto-Rotate</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/80">Speed:</span>
                  <Button
                    variant={rotationSpeed === 3000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(3000)}
                    className="text-white"
                  >
                    Fast
                  </Button>
                  <Button
                    variant={rotationSpeed === 5000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(5000)}
                    className="text-white"
                  >
                    Normal
                  </Button>
                  <Button
                    variant={rotationSpeed === 8000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(8000)}
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

                <Badge variant="outline" className="text-white border-white/30">
                  Session: {getSessionDuration()}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  Interactions: {totalInteractions}
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
              <Button
                variant={activeMode === 'showcase' ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange('showcase')}
                className="w-full justify-start text-xs text-white hover:bg-white/20"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Feature Showcase</span>
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                    Classic
                  </Badge>
                </div>
              </Button>
              <Button
                variant={activeMode === 'carousel' ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange('carousel')}
                className="w-full justify-start text-xs text-white hover:bg-white/20"
              >
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4" />
                  <span>Advanced Carousel</span>
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                    Premium
                  </Badge>
                </div>
              </Button>
              <Button
                variant={activeMode === 'hybrid' ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange('hybrid')}
                className="w-full justify-start text-xs text-white hover:bg-white/20"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Hybrid Mode</span>
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                    Ultimate
                  </Badge>
                </div>
              </Button>
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
          {activeMode === 'showcase' && (
            <div className="animate-fadeIn">
              <FeatureRotationShowcase />
            </div>
          )}
          
          {activeMode === 'carousel' && (
            <div className="animate-fadeIn">
              <AdvancedFeatureCarousel />
            </div>
          )}
          
          {activeMode === 'hybrid' && (
            <div className="animate-fadeIn">
              <HybridGUIMode 
                onInteraction={handleInteraction}
                viewMode={viewMode}
              />
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-white">
                  Current Mode: {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)}
                </span>
                <Badge variant="outline" className="text-white border-white/30">
                  {isRotating ? 'Auto-Rotating' : 'Manual'}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {viewMode.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white/80">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs">Live Demo</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-xs">Real-time Updates</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          variant="default"
          size="lg"
          className="rounded-full w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-2xl"
          onClick={() => {
            setTotalInteractions(prev => prev + 1)
            setIsRotating(!isRotating)
          }}
        >
          {isRotating ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  )
}

function HybridGUIMode({ onInteraction, viewMode }: { onInteraction: () => void, viewMode: string }) {
  const [currentView, setCurrentView] = useState<'split' | 'alternating' | 'overlay'>('split')
  const [showMetrics, setShowMetrics] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView(prev => {
        const views: ('split' | 'alternating' | 'overlay')[] = ['split', 'alternating', 'overlay']
        const currentIndex = views.indexOf(prev)
        return views[(currentIndex + 1) % views.length]
      })
      onInteraction()
    }, 8000)

    return () => clearInterval(interval)
  }, [onInteraction])

  return (
    <div className="h-screen">
      {currentView === 'split' && (
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-full">
            <FeatureRotationShowcase />
          </div>
          <div className="h-full">
            <AdvancedFeatureCarousel />
          </div>
        </div>
      )}
      
      {currentView === 'alternating' && (
        <div className="h-full">
          <div className="h-1/2">
            <FeatureRotationShowcase />
          </div>
          <div className="h-1/2">
            <AdvancedFeatureCarousel />
          </div>
        </div>
      )}
      
      {currentView === 'overlay' && (
        <div className="h-full relative">
          <div className="absolute inset-0 z-10">
            <FeatureRotationShowcase />
          </div>
          <div className="absolute inset-0 z-20 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <AdvancedFeatureCarousel />
          </div>
        </div>
      )}
    </div>
  )
}
