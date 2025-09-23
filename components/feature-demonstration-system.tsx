"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
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
  Signal,
  Timer,
  Clock,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Camera,
  Video,
  Mic,
  MicOff,
  Download,
  Upload,
  Share,
  Bookmark,
  Flag,
  Archive,
  Trash2,
  Edit,
  Copy,
  Cut,
  Paste,
  Save,
  Loader2
} from "lucide-react"

interface DemoSession {
  id: string
  startTime: Date
  endTime?: Date
  interactions: number
  featuresViewed: string[]
  userActions: UserAction[]
  performance: {
    loadTime: number
    renderTime: number
    interactionTime: number
  }
}

interface UserAction {
  id: string
  timestamp: Date
  action: string
  feature: string
  duration: number
  success: boolean
}

interface FeatureDemo {
  id: string
  name: string
  category: string
  description: string
  status: 'active' | 'demo' | 'development'
  metrics: {
    views: number
    interactions: number
    completionRate: number
    userSatisfaction: number
  }
  demo: {
    steps: DemoStep[]
    duration: number
    complexity: 'simple' | 'medium' | 'complex'
  }
}

interface DemoStep {
  id: string
  title: string
  description: string
  action: string
  expectedOutcome: string
  duration: number
  interactive: boolean
}

const FEATURE_DEMOS: FeatureDemo[] = [
  {
    id: 'linkedin-integration',
    name: 'LinkedIn API Integration',
    category: 'Integration',
    description: 'Enterprise-grade multi-business line integration',
    status: 'active',
    metrics: { views: 1234, interactions: 567, completionRate: 89, userSatisfaction: 94 },
    demo: {
      steps: [
        {
          id: 'auth',
          title: 'Authentication Setup',
          description: 'Connect to LinkedIn with OAuth 2.0',
          action: 'Click "Connect LinkedIn"',
          expectedOutcome: 'Successful authentication',
          duration: 3000,
          interactive: true
        },
        {
          id: 'campaign',
          title: 'Create Campaign',
          description: 'Set up a LinkedIn marketing campaign',
          action: 'Fill campaign details and submit',
          expectedOutcome: 'Campaign created successfully',
          duration: 5000,
          interactive: true
        },
        {
          id: 'analytics',
          title: 'View Analytics',
          description: 'Monitor campaign performance',
          action: 'Navigate to analytics dashboard',
          expectedOutcome: 'Real-time metrics displayed',
          duration: 4000,
          interactive: true
        }
      ],
      duration: 12000,
      complexity: 'medium'
    }
  },
  {
    id: 'ai-orchestration',
    name: 'AI Agent Orchestration',
    category: 'AI',
    description: 'Intelligent agent coordination and task management',
    status: 'active',
    metrics: { views: 987, interactions: 432, completionRate: 76, userSatisfaction: 91 },
    demo: {
      steps: [
        {
          id: 'select-agent',
          title: 'Select AI Agent',
          description: 'Choose the appropriate agent for your task',
          action: 'Click on agent from available list',
          expectedOutcome: 'Agent selected and activated',
          duration: 2000,
          interactive: true
        },
        {
          id: 'assign-task',
          title: 'Assign Task',
          description: 'Provide task details to the agent',
          action: 'Enter task description and submit',
          expectedOutcome: 'Task queued for processing',
          duration: 3000,
          interactive: true
        },
        {
          id: 'monitor-progress',
          title: 'Monitor Progress',
          description: 'Track task execution and results',
          action: 'View progress dashboard',
          expectedOutcome: 'Real-time progress updates',
          duration: 6000,
          interactive: true
        }
      ],
      duration: 11000,
      complexity: 'complex'
    }
  },
  {
    id: 'aspiration-networking',
    name: 'Aspiration-Based Networking',
    category: 'Networking',
    description: 'Revolutionary networking focused on future goals',
    status: 'active',
    metrics: { views: 1567, interactions: 789, completionRate: 82, userSatisfaction: 96 },
    demo: {
      steps: [
        {
          id: 'create-tribe',
          title: 'Create Tribe',
          description: 'Set up a new professional tribe',
          action: 'Click "Create New Tribe"',
          expectedOutcome: 'Tribe creation form displayed',
          duration: 2000,
          interactive: true
        },
        {
          id: 'define-aspirations',
          title: 'Define Aspirations',
          description: 'Specify your professional aspirations',
          action: 'Select aspirations from list',
          expectedOutcome: 'Aspirations saved and analyzed',
          duration: 4000,
          interactive: true
        },
        {
          id: 'find-matches',
          title: 'Find Matches',
          description: 'Discover like-minded professionals',
          action: 'Click "Find Matches"',
          expectedOutcome: 'Compatible professionals displayed',
          duration: 5000,
          interactive: true
        }
      ],
      duration: 11000,
      complexity: 'medium'
    }
  }
]

export function FeatureDemonstrationSystem() {
  const [currentDemo, setCurrentDemo] = useState<FeatureDemo | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [session, setSession] = useState<DemoSession | null>(null)
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionStartRef = useRef<Date | null>(null)

  // Initialize demo session
  useEffect(() => {
    const newSession: DemoSession = {
      id: `demo_${Date.now()}`,
      startTime: new Date(),
      interactions: 0,
      featuresViewed: [],
      userActions: [],
      performance: {
        loadTime: 0,
        renderTime: 0,
        interactionTime: 0
      }
    }
    setSession(newSession)
    sessionStartRef.current = new Date()
  }, [])

  // Auto-rotate through demos
  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      const currentIndex = FEATURE_DEMOS.findIndex(demo => demo.id === currentDemo?.id)
      const nextIndex = (currentIndex + 1) % FEATURE_DEMOS.length
      startDemo(FEATURE_DEMOS[nextIndex])
    }, 30000) // Rotate every 30 seconds

    return () => clearInterval(interval)
  }, [autoPlay, currentDemo, startDemo])

  const startDemo = useCallback((demo: FeatureDemo) => {
    setCurrentDemo(demo)
    setCurrentStep(0)
    setIsPlaying(true)
    
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        featuresViewed: [...prev.featuresViewed, demo.id],
        interactions: prev.interactions + 1
      } : null)
    }
  }, [session])

  const nextStep = useCallback(() => {
    if (!currentDemo) return

    const nextStepIndex = currentStep + 1
    if (nextStepIndex >= currentDemo.demo.steps.length) {
      // Demo completed
      setIsPlaying(false)
      if (session) {
        setSession(prev => prev ? {
          ...prev,
          endTime: new Date(),
          interactions: prev.interactions + 1
        } : null)
      }
    } else {
      setCurrentStep(nextStepIndex)
    }
  }, [currentDemo, currentStep, session])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const recordUserAction = useCallback((action: string, success: boolean = true) => {
    const userAction: UserAction = {
      id: `action_${Date.now()}`,
      timestamp: new Date(),
      action,
      feature: currentDemo?.id || 'unknown',
      duration: sessionStartRef.current ? Date.now() - sessionStartRef.current.getTime() : 0,
      success
    }

    setUserActions(prev => [...prev, userAction])
    
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        userActions: [...prev.userActions, userAction],
        interactions: prev.interactions + 1
      } : null)
    }
  }, [currentDemo, session])

  // Auto-advance steps
  useEffect(() => {
    if (!isPlaying || !currentDemo) return

    const step = currentDemo.demo.steps[currentStep]
    if (!step) return

    stepTimerRef.current = setTimeout(() => {
      nextStep()
    }, step.duration)

    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current)
      }
    }
  }, [isPlaying, currentDemo, currentStep, nextStep])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    recordUserAction('play_pause')
  }

  const handleStepInteraction = (stepId: string, action: string) => {
    recordUserAction(`step_${stepId}_${action}`)
    // Simulate step completion
    setTimeout(() => {
      nextStep()
    }, 1000)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-50">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-white">Feature Demonstration System</h1>
                <Badge variant="outline" className="text-white border-white/30">
                  Live Demo
                </Badge>
                {session && (
                  <Badge variant="outline" className="text-white border-white/30">
                    Session: {session.interactions} interactions
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoPlay(!autoPlay)}
                  className="text-white hover:bg-white/20"
                >
                  {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="text-white hover:bg-white/20"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUserActions([])
                    recordUserAction('reset')
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Selection */}
      <div className="absolute top-20 left-4 z-40">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-3">
            <div className="space-y-2">
              {FEATURE_DEMOS.map((demo) => (
                <Button
                  key={demo.id}
                  variant={currentDemo?.id === demo.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => startDemo(demo)}
                  className="w-full justify-start text-xs text-white hover:bg-white/20"
                >
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(demo.category)}
                    <span className="truncate">{demo.name}</span>
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                      {demo.metrics.completionRate}%
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Demo Area */}
      <div className="absolute top-20 left-64 right-4 bottom-4">
        {currentDemo ? (
          <div className="h-full">
            <DemoDisplay
              demo={currentDemo}
              currentStep={currentStep}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNextStep={nextStep}
              onPreviousStep={previousStep}
              onStepInteraction={handleStepInteraction}
              userActions={userActions}
              session={session}
            />
          </div>
        ) : (
          <Card className="h-full backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-white">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                <h2 className="text-2xl font-bold mb-2">Select a Feature Demo</h2>
                <p className="text-white/80">Choose from the available demonstrations to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="absolute top-20 right-4 w-80 z-30">
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Live Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session && (
                <div className="space-y-3">
                  <div className="flex justify-between text-white/80">
                    <span>Session Duration</span>
                    <span>{Math.floor((Date.now() - session.startTime.getTime()) / 1000)}s</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Total Interactions</span>
                    <span>{session.interactions}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Features Viewed</span>
                    <span>{session.featuresViewed.length}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>User Actions</span>
                    <span>{userActions.length}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Recent Actions</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {userActions.slice(-5).map((action) => (
                    <div key={action.id} className="text-xs text-white/70 flex justify-between">
                      <span>{action.action}</span>
                      <span>{new Date(action.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function DemoDisplay({ 
  demo, 
  currentStep, 
  isPlaying, 
  onPlayPause, 
  onNextStep, 
  onPreviousStep, 
  onStepInteraction,
  userActions,
  session 
}: {
  demo: FeatureDemo
  currentStep: number
  isPlaying: boolean
  onPlayPause: () => void
  onNextStep: () => void
  onPreviousStep: () => void
  onStepInteraction: (stepId: string, action: string) => void
  userActions: UserAction[]
  session: DemoSession | null
}) {
  const currentStepData = demo.demo.steps[currentStep]
  const progress = ((currentStep + 1) / demo.demo.steps.length) * 100

  return (
    <Card className="h-full backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-white flex items-center space-x-3">
              {getCategoryIcon(demo.category, "h-6 w-6")}
              <span>{demo.name}</span>
              <Badge variant={getStatusVariant(demo.status)}>
                {demo.status}
              </Badge>
            </CardTitle>
            <p className="text-white/80 mt-2">{demo.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreviousStep}
              disabled={currentStep === 0}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNextStep}
              className="text-white hover:bg-white/20"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-full overflow-y-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-white/80 mb-2">
            <span>Step {currentStep + 1} of {demo.demo.steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>

        {/* Current Step */}
        {currentStepData && (
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-xl text-white">{currentStepData.title}</CardTitle>
                <p className="text-white/80">{currentStepData.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white/10 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Action Required:</h4>
                    <p className="text-white/80">{currentStepData.action}</p>
                  </div>
                  
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="text-green-400 font-semibold mb-2">Expected Outcome:</h4>
                    <p className="text-green-300">{currentStepData.expectedOutcome}</p>
                  </div>

                  {currentStepData.interactive && (
                    <Button
                      onClick={() => onStepInteraction(currentStepData.id, 'interact')}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <MousePointer className="h-4 w-4 mr-2" />
                      {currentStepData.action}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Demo Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{demo.metrics.views}</div>
                  <div className="text-sm text-white/80">Views</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{demo.metrics.interactions}</div>
                  <div className="text-sm text-white/80">Interactions</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{demo.metrics.completionRate}%</div>
                  <div className="text-sm text-white/80">Completion</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{demo.metrics.userSatisfaction}%</div>
                  <div className="text-sm text-white/80">Satisfaction</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper Functions
function getCategoryIcon(category: string, size = "h-4 w-4") {
  const icons = {
    'Integration': <Globe className={size} />,
    'AI': <Brain className={size} />,
    'Networking': <Users className={size} />,
    'Security': <Shield className={size} />,
    'Analytics': <BarChart3 className={size} />
  }
  return icons[category as keyof typeof icons] || <Star className={size} />
}

function getStatusVariant(status: string) {
  const variants = {
    active: "default" as const,
    demo: "secondary" as const,
    development: "outline" as const
  }
  return variants[status as keyof typeof variants] || "secondary"
}
