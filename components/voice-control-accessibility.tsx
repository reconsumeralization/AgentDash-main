"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  MousePointer,
  Keyboard,
  Monitor,
  Smartphone,
  Tablet,
  Settings,
  Accessibility,
  Headphones,
  Speaker,
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
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Plus,
  Minus,
  Search,
  Filter,
  Sort,
  Grid,
  List,
  Star,
  Heart,
  Sparkles,
  Zap,
  Brain,
  Users,
  Shield,
  BarChart3,
  Globe,
  Target,
  Activity,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  RotateCcw,
  Play,
  Pause
} from "lucide-react"

interface VoiceCommand {
  id: string
  command: string
  action: () => void
  description: string
  category: 'navigation' | 'control' | 'accessibility' | 'feature'
  confidence?: number
}

interface AccessibilitySettings {
  voiceControl: boolean
  screenReader: boolean
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
  colorBlindSupport: boolean
}

interface VoiceControlState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  commands: VoiceCommand[]
  lastCommand?: VoiceCommand
  error?: string
}

export function VoiceControlAccessibility() {
  const [voiceState, setVoiceState] = useState<VoiceControlState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    confidence: 0,
    commands: [],
    lastCommand: undefined,
    error: undefined
  })

  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    voiceControl: false,
    screenReader: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindSupport: false
  })

  const [currentFeature, setCurrentFeature] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(5000)

  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<any>(null)

  // Initialize voice recognition and synthesis
  useEffect(() => {
    // Check for browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, error: undefined }))
      }

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('')

        const confidence = event.results[0][0].confidence

        setVoiceState(prev => ({
          ...prev,
          transcript,
          confidence
        }))

        // Process voice commands
        processVoiceCommand(transcript, confidence)
      }

      recognitionRef.current.onerror = (event: any) => {
        setVoiceState(prev => ({
          ...prev,
          isListening: false,
          error: event.error
        }))
      }

      recognitionRef.current.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }))
      }

      setVoiceState(prev => ({ ...prev, isSupported: true }))
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis
    }
  }, [processVoiceCommand])

  // Voice commands
  const voiceCommands: VoiceCommand[] = useMemo(() => [
    // Navigation commands
    {
      id: 'next-feature',
      command: 'next feature',
      action: () => setCurrentFeature(prev => (prev + 1) % 5),
      description: 'Navigate to the next feature',
      category: 'navigation'
    },
    {
      id: 'previous-feature',
      command: 'previous feature',
      action: () => setCurrentFeature(prev => (prev - 1 + 5) % 5),
      description: 'Navigate to the previous feature',
      category: 'navigation'
    },
    {
      id: 'go-to-feature',
      command: 'go to feature',
      action: () => speakText('Please specify which feature number'),
      description: 'Navigate to a specific feature',
      category: 'navigation'
    },

    // Control commands
    {
      id: 'play-pause',
      command: 'play pause',
      action: () => setIsAutoRotating(prev => !prev),
      description: 'Toggle auto-rotation',
      category: 'control'
    },
    {
      id: 'faster',
      command: 'faster',
      action: () => setRotationSpeed(prev => Math.max(1000, prev - 1000)),
      description: 'Increase rotation speed',
      category: 'control'
    },
    {
      id: 'slower',
      command: 'slower',
      action: () => setRotationSpeed(prev => Math.min(10000, prev + 1000)),
      description: 'Decrease rotation speed',
      category: 'control'
    },

    // Accessibility commands
    {
      id: 'toggle-voice',
      command: 'toggle voice control',
      action: () => toggleVoiceControl(),
      description: 'Enable or disable voice control',
      category: 'accessibility'
    },
    {
      id: 'toggle-screen-reader',
      command: 'toggle screen reader',
      action: () => toggleScreenReader(),
      description: 'Enable or disable screen reader support',
      category: 'accessibility'
    },
    {
      id: 'toggle-high-contrast',
      command: 'toggle high contrast',
      action: () => toggleHighContrast(),
      description: 'Enable or disable high contrast mode',
      category: 'accessibility'
    },
    {
      id: 'toggle-large-text',
      command: 'toggle large text',
      action: () => toggleLargeText(),
      description: 'Enable or disable large text mode',
      category: 'accessibility'
    },

    // Feature commands
    {
      id: 'show-analytics',
      command: 'show analytics',
      action: () => speakText('Displaying analytics dashboard'),
      description: 'Show analytics and metrics',
      category: 'feature'
    },
    {
      id: 'show-settings',
      command: 'show settings',
      action: () => speakText('Opening settings panel'),
      description: 'Open settings and configuration',
      category: 'feature'
    },
    {
      id: 'help',
      command: 'help',
      action: () => speakHelp(),
      description: 'Get help and available commands',
      category: 'feature'
    }
  ], [speakHelp, toggleHighContrast, toggleLargeText, toggleScreenReader, toggleVoiceControl, speakText])

  const processVoiceCommand = useCallback((transcript: string, confidence: number) => {
    const normalizedTranscript = transcript.toLowerCase().trim()
    
    // Find matching command
    const matchingCommand = voiceCommands.find(cmd => 
      normalizedTranscript.includes(cmd.command.toLowerCase())
    )

    if (matchingCommand && confidence > 0.7) {
      matchingCommand.action()
      setVoiceState(prev => ({
        ...prev,
        lastCommand: { ...matchingCommand, confidence }
      }))
      speakText(`Executed: ${matchingCommand.description}`)
    }
  }, [voiceCommands, speakText])

  const speakText = useCallback((text: string) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      synthesisRef.current.speak(utterance)
    }
  }, [])

  const speakHelp = useCallback(() => {
    const helpText = `Available voice commands: ${voiceCommands.map(cmd => cmd.command).join(', ')}`
    speakText(helpText)
  }, [voiceCommands, speakText])

  const startListening = useCallback(() => {
    if (recognitionRef.current && accessibilitySettings.voiceControl) {
      recognitionRef.current.start()
    }
  }, [accessibilitySettings.voiceControl])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const toggleVoiceControl = useCallback(() => {
    setAccessibilitySettings(prev => ({
      ...prev,
      voiceControl: !prev.voiceControl
    }))
    
    if (accessibilitySettings.voiceControl) {
      stopListening()
      speakText('Voice control disabled')
    } else {
      speakText('Voice control enabled. Say "help" for available commands.')
    }
  }, [accessibilitySettings.voiceControl, stopListening, speakText])

  const toggleScreenReader = useCallback(() => {
    setAccessibilitySettings(prev => ({
      ...prev,
      screenReader: !prev.screenReader
    }))
    speakText(`Screen reader ${accessibilitySettings.screenReader ? 'disabled' : 'enabled'}`)
  }, [accessibilitySettings.screenReader, speakText])

  const toggleHighContrast = useCallback(() => {
    setAccessibilitySettings(prev => ({
      ...prev,
      highContrast: !prev.highContrast
    }))
    speakText(`High contrast mode ${accessibilitySettings.highContrast ? 'disabled' : 'enabled'}`)
  }, [accessibilitySettings.highContrast, speakText])

  const toggleLargeText = useCallback(() => {
    setAccessibilitySettings(prev => ({
      ...prev,
      largeText: !prev.largeText
    }))
    speakText(`Large text mode ${accessibilitySettings.largeText ? 'disabled' : 'enabled'}`)
  }, [accessibilitySettings.largeText, speakText])

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating) return

    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 5)
    }, rotationSpeed)

    return () => clearInterval(interval)
  }, [isAutoRotating, rotationSpeed])

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement
    
    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (accessibilitySettings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
  }, [accessibilitySettings])

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      accessibilitySettings.highContrast 
        ? 'bg-black text-white' 
        : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    }`}>
      {/* Voice Control Panel */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <Card className={`backdrop-blur-xl border-white/20 shadow-2xl ${
          accessibilitySettings.highContrast 
            ? 'bg-black border-white' 
            : 'bg-white/10'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Accessibility className="h-5 w-5 text-white" />
                  <h1 className={`text-lg font-bold ${
                    accessibilitySettings.largeText ? 'text-xl' : 'text-lg'
                  }`}>
                    Voice Control & Accessibility
                  </h1>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleVoiceControl}
                    className={`${
                      accessibilitySettings.voiceControl 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    {accessibilitySettings.voiceControl ? 
                      <Mic className="h-4 w-4" /> : 
                      <MicOff className="h-4 w-4" />
                    }
                  </Button>
                  
                  {voiceState.isListening && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm text-white/80">Listening...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-white border-white/30">
                  Feature {currentFeature + 1} of 5
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {isAutoRotating ? 'Auto-Rotating' : 'Manual'}
                </Badge>
                {voiceState.lastCommand && (
                  <Badge variant="outline" className="text-white border-white/30">
                    Last: {voiceState.lastCommand.command}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accessibility Controls */}
      <div className="fixed top-20 left-4 z-40">
        <Card className={`backdrop-blur-xl border-white/20 shadow-2xl ${
          accessibilitySettings.highContrast 
            ? 'bg-black border-white' 
            : 'bg-white/10'
        }`}>
          <CardHeader>
            <CardTitle className="text-white">Accessibility Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(accessibilitySettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-white/80 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Button
                  variant={value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setAccessibilitySettings(prev => ({
                      ...prev,
                      [key]: !prev[key as keyof AccessibilitySettings]
                    }))
                  }}
                  className={value ? "bg-green-500" : "border-white/30 text-white"}
                >
                  {value ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Voice Commands List */}
      <div className="fixed top-20 right-4 w-80 z-30">
        <Card className={`backdrop-blur-xl border-white/20 shadow-2xl ${
          accessibilitySettings.highContrast 
            ? 'bg-black border-white' 
            : 'bg-white/10'
        }`}>
          <CardHeader>
            <CardTitle className="text-white">Voice Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {voiceCommands.map((command) => (
                <div 
                  key={command.id} 
                  className={`p-2 rounded ${
                    command === voiceState.lastCommand 
                      ? 'bg-blue-500/20 border border-blue-500/50' 
                      : 'bg-white/5'
                  }`}
                >
                  <div className="text-white font-medium">{command.command}</div>
                  <div className="text-white/60 text-xs">{command.description}</div>
                </div>
              ))}
            </div>
            
            {voiceState.transcript && (
              <div className="mt-4 p-3 bg-white/10 rounded">
                <div className="text-white/80 text-sm">Transcript:</div>
                <div className="text-white text-sm">{voiceState.transcript}</div>
                <div className="text-white/60 text-xs">
                  Confidence: {Math.round(voiceState.confidence * 100)}%
                </div>
              </div>
            )}

            {voiceState.error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-white">
                  Voice recognition error: {voiceState.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Display */}
      <div className="pt-24 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className={`backdrop-blur-xl border-white/20 shadow-2xl ${
            accessibilitySettings.highContrast 
              ? 'bg-black border-white' 
              : 'bg-white/10'
          }`}>
            <CardHeader>
              <CardTitle className={`text-white flex items-center space-x-3 ${
                accessibilitySettings.largeText ? 'text-3xl' : 'text-2xl'
              }`}>
                <Globe className="h-8 w-8 text-blue-400" />
                <span>LinkedIn API Integration</span>
                <Badge variant="outline" className="text-white border-white/30">
                  Feature {currentFeature + 1}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Feature Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Performance', value: 98, color: 'blue' },
                    { label: 'Engagement', value: 95, color: 'green' },
                    { label: 'Adoption', value: 87, color: 'purple' },
                    { label: 'Innovation', value: 92, color: 'orange' }
                  ].map((metric) => (
                    <Card key={metric.label} className={`${
                      accessibilitySettings.highContrast 
                        ? 'bg-white text-black' 
                        : 'bg-white/10 border-white/20'
                    }`}>
                      <CardContent className="p-4 text-center">
                        <div className={`text-2xl font-bold text-${metric.color}-400`}>
                          {metric.value}%
                        </div>
                        <div className={`text-sm ${
                          accessibilitySettings.highContrast 
                            ? 'text-black/80' 
                            : 'text-white/80'
                        }`}>
                          {metric.label}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Interactive Demo */}
                <div className="space-y-4">
                  <h3 className={`text-white font-semibold ${
                    accessibilitySettings.largeText ? 'text-xl' : 'text-lg'
                  }`}>
                    Interactive Demo
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Create Campaign', 'Search Leads', 'Manage Connections', 'View Analytics'].map((action, index) => (
                      <Button
                        key={index}
                        onClick={() => speakText(`Executing ${action}`)}
                        className={`${
                          accessibilitySettings.highContrast 
                            ? 'bg-white text-black hover:bg-gray-200' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                        } ${
                          accessibilitySettings.largeText ? 'text-base py-3' : ''
                        }`}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-white/80">
                    <span>Feature Progress</span>
                    <span>{currentFeature + 1} of 5</span>
                  </div>
                  <Progress 
                    value={((currentFeature + 1) / 5) * 100} 
                    className="h-2 bg-white/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <Card className={`backdrop-blur-xl border-white/20 shadow-2xl ${
          accessibilitySettings.highContrast 
            ? 'bg-black border-white' 
            : 'bg-white/10'
        }`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">
                  Voice Control & Accessibility Demo
                </span>
                <Badge variant="outline" className="text-white border-white/30">
                  {voiceState.isSupported ? 'Voice Supported' : 'Voice Not Supported'}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {accessibilitySettings.voiceControl ? 'Voice Active' : 'Voice Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white/80">
                  <Accessibility className="h-4 w-4" />
                  <span className="text-xs">Accessibility Enabled</span>
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
