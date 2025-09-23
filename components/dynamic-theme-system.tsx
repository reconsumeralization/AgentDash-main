"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Palette,
  Sun,
  Moon,
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
  Star,
  Heart,
  Eye,
  TrendingUp,
  RotateCcw,
  Play,
  Pause,
  Settings,
  Maximize,
  Minimize,
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
  Monitor,
  Smartphone,
  Tablet,
  Rainbow,
  Droplets,
  Flame,
  Snowflake,
  Leaf,
  Mountain,
  Waves,
  Sunset,
  Sunrise,
  Cloud,
  CloudRain,
  Wind
} from "lucide-react"

interface ThemeColor {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  icon: React.ReactNode
  description: string
  mood: 'energetic' | 'calm' | 'professional' | 'creative' | 'nature' | 'tech' | 'warm' | 'cool'
}

interface DynamicThemeProps {
  children: React.ReactNode
  onThemeChange?: (theme: ThemeColor) => void
}

const THEME_COLORS: ThemeColor[] = [
  {
    name: 'Ocean Blue',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
    surface: 'rgba(59, 130, 246, 0.1)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    icon: <Waves className="h-5 w-5" />,
    description: 'Calm and professional ocean-inspired theme',
    mood: 'calm'
  },
  {
    name: 'Sunset Orange',
    primary: '#F97316',
    secondary: '#EA580C',
    accent: '#FB923C',
    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
    surface: 'rgba(249, 115, 22, 0.1)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    icon: <Sunset className="h-5 w-5" />,
    description: 'Warm and energetic sunset colors',
    mood: 'energetic'
  },
  {
    name: 'Forest Green',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    surface: 'rgba(16, 185, 129, 0.1)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    icon: <Leaf className="h-5 w-5" />,
    description: 'Natural and refreshing forest theme',
    mood: 'nature'
  },
  {
    name: 'Purple Magic',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#A78BFA',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
    surface: 'rgba(139, 92, 246, 0.1)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Mystical and creative purple magic',
    mood: 'creative'
  },
  {
    name: 'Fire Red',
    primary: '#EF4444',
    secondary: '#DC2626',
    accent: '#F87171',
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
    surface: 'rgba(239, 68, 68, 0.1)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    icon: <Flame className="h-5 w-5" />,
    description: 'Bold and passionate fire theme',
    mood: 'energetic'
  },
  {
    name: 'Ice Blue',
    primary: '#06B6D4',
    secondary: '#0891B2',
    accent: '#22D3EE',
    background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
    surface: 'rgba(6, 182, 212, 0.1)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    icon: <Snowflake className="h-5 w-5" />,
    description: 'Cool and refreshing ice theme',
    mood: 'cool'
  },
  {
    name: 'Gold Luxury',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FBBF24',
    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
    surface: 'rgba(245, 158, 11, 0.1)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    icon: <Star className="h-5 w-5" />,
    description: 'Luxurious and premium gold theme',
    mood: 'professional'
  },
  {
    name: 'Cyber Pink',
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#F472B6',
    background: 'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f472b6 100%)',
    surface: 'rgba(236, 72, 153, 0.1)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    icon: <Zap className="h-5 w-5" />,
    description: 'Futuristic and tech-inspired cyber theme',
    mood: 'tech'
  }
]

export function DynamicThemeSystem({ children, onThemeChange }: DynamicThemeProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(THEME_COLORS[0])
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(8000)
  const [animationIntensity, setAnimationIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [moodFilter, setMoodFilter] = useState<string>('all')
  const [customColors, setCustomColors] = useState<Partial<ThemeColor>>({})

  // Auto-rotate themes
  useEffect(() => {
    if (!isAutoRotating) return

    const interval = setInterval(() => {
      const filteredThemes = moodFilter === 'all' 
        ? THEME_COLORS 
        : THEME_COLORS.filter(theme => theme.mood === moodFilter)
      
      const currentIndex = filteredThemes.findIndex(theme => theme.name === currentTheme.name)
      const nextIndex = (currentIndex + 1) % filteredThemes.length
      const nextTheme = filteredThemes[nextIndex]
      
      setCurrentTheme(nextTheme)
      onThemeChange?.(nextTheme)
    }, rotationSpeed)

    return () => clearInterval(interval)
  }, [isAutoRotating, rotationSpeed, moodFilter, currentTheme.name, onThemeChange])

  const applyTheme = useCallback((theme: ThemeColor) => {
    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--theme-primary', theme.primary)
    root.style.setProperty('--theme-secondary', theme.secondary)
    root.style.setProperty('--theme-accent', theme.accent)
    root.style.setProperty('--theme-background', theme.background)
    root.style.setProperty('--theme-surface', theme.surface)
    root.style.setProperty('--theme-text', theme.text)
    root.style.setProperty('--theme-text-secondary', theme.textSecondary)
    
    // Apply background
    document.body.style.background = theme.background
    
    setCurrentTheme(theme)
    onThemeChange?.(theme)
  }, [onThemeChange])

  const handleThemeSelect = useCallback((theme: ThemeColor) => {
    applyTheme(theme)
  }, [applyTheme])

  const handleCustomColorChange = useCallback((colorType: keyof ThemeColor, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorType]: value
    }))
    
    // Apply custom color immediately
    const root = document.documentElement
    root.style.setProperty(`--theme-${colorType}`, value)
  }, [])

  const getAnimationIntensity = () => {
    switch (animationIntensity) {
      case 'high': return 'animate-pulse'
      case 'medium': return 'animate-bounce'
      case 'low': return 'animate-ping'
      default: return 'animate-pulse'
    }
  }

  const filteredThemes = moodFilter === 'all' 
    ? THEME_COLORS 
    : THEME_COLORS.filter(theme => theme.mood === moodFilter)

  return (
    <div className="min-h-screen transition-all duration-1000" style={{ background: currentTheme.background }}>
      {/* Theme Control Panel */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-white" />
                  <h1 className="text-lg font-bold text-white">Dynamic Theme System</h1>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAutoRotating(!isAutoRotating)}
                    className={`${
                      isAutoRotating 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    {isAutoRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <span className="text-sm text-white/80">Auto-Rotate</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-white border-white/30">
                  {currentTheme.name}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {currentTheme.mood}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {animationIntensity}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Selection */}
      <div className="fixed top-20 left-4 z-40">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Theme Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Mood Filter */}
            <div className="space-y-2">
              <span className="text-white/80 text-sm">Filter by Mood:</span>
              <select
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
              >
                <option value="all">All Moods</option>
                <option value="energetic">Energetic</option>
                <option value="calm">Calm</option>
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
                <option value="nature">Nature</option>
                <option value="tech">Tech</option>
                <option value="warm">Warm</option>
                <option value="cool">Cool</option>
              </select>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <span className="text-white/80 text-sm">Rotation Speed:</span>
              <div className="flex space-x-1">
                <Button
                  variant={rotationSpeed === 4000 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setRotationSpeed(4000)}
                  className="text-white"
                >
                  Fast
                </Button>
                <Button
                  variant={rotationSpeed === 8000 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setRotationSpeed(8000)}
                  className="text-white"
                >
                  Normal
                </Button>
                <Button
                  variant={rotationSpeed === 12000 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setRotationSpeed(12000)}
                  className="text-white"
                >
                  Slow
                </Button>
              </div>
            </div>

            {/* Animation Intensity */}
            <div className="space-y-2">
              <span className="text-white/80 text-sm">Animation Intensity:</span>
              <div className="flex space-x-1">
                <Button
                  variant={animationIntensity === 'low' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setAnimationIntensity('low')}
                  className="text-white"
                >
                  Low
                </Button>
                <Button
                  variant={animationIntensity === 'medium' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setAnimationIntensity('medium')}
                  className="text-white"
                >
                  Medium
                </Button>
                <Button
                  variant={animationIntensity === 'high' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setAnimationIntensity('high')}
                  className="text-white"
                >
                  High
                </Button>
              </div>
            </div>

            {/* Theme List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredThemes.map((theme) => (
                <Button
                  key={theme.name}
                  variant={currentTheme.name === theme.name ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleThemeSelect(theme)}
                  className="w-full justify-start text-xs text-white hover:bg-white/20"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`text-${theme.primary.replace('#', '')}-400`}>
                      {theme.icon}
                    </div>
                    <span className="truncate">{theme.name}</span>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Color Editor */}
      <div className="fixed top-20 right-4 w-80 z-30">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Custom Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'primary', label: 'Primary' },
              { key: 'secondary', label: 'Secondary' },
              { key: 'accent', label: 'Accent' }
            ].map((color) => (
              <div key={color.key} className="space-y-2">
                <label className="text-white/80 text-sm">{color.label}:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={customColors[color.key as keyof ThemeColor] as string || currentTheme[color.key as keyof ThemeColor] as string}
                    onChange={(e) => handleCustomColorChange(color.key as keyof ThemeColor, e.target.value)}
                    className="w-8 h-8 rounded border border-white/20"
                  />
                  <input
                    type="text"
                    value={customColors[color.key as keyof ThemeColor] as string || currentTheme[color.key as keyof ThemeColor] as string}
                    onChange={(e) => handleCustomColorChange(color.key as keyof ThemeColor, e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCustomColors({})}
              className="w-full border-white/30 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Custom Colors
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="pt-24 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-3">
                <div className={`text-${currentTheme.primary.replace('#', '')}-400 ${getAnimationIntensity()}`}>
                  {currentTheme.icon}
                </div>
                <span>{currentTheme.name} Theme</span>
                <Badge variant="outline" className="text-white border-white/30">
                  {currentTheme.mood}
                </Badge>
              </CardTitle>
              <p className="text-white/80">{currentTheme.description}</p>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Color Palette Display */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Color Palette</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Primary', color: currentTheme.primary },
                      { name: 'Secondary', color: currentTheme.secondary },
                      { name: 'Accent', color: currentTheme.accent }
                    ].map((colorInfo) => (
                      <div key={colorInfo.name} className="space-y-2">
                        <div className="text-white/80 text-sm">{colorInfo.name}</div>
                        <div 
                          className="w-full h-16 rounded-lg shadow-lg"
                          style={{ backgroundColor: colorInfo.color }}
                        />
                        <div className="text-white/60 text-xs">{colorInfo.color}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Demo */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Feature Demo</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Performance', value: 98, icon: <BarChart3 className="h-5 w-5" /> },
                      { label: 'Engagement', value: 95, icon: <Heart className="h-5 w-5" /> },
                      { label: 'Adoption', value: 87, icon: <Users className="h-5 w-5" /> },
                      { label: 'Innovation', value: 92, icon: <Brain className="h-5 w-5" /> }
                    ].map((metric) => (
                      <Card key={metric.label} className="backdrop-blur-xl bg-white/10 border-white/20">
                        <CardContent className="p-4 text-center">
                          <div className={`text-${currentTheme.primary.replace('#', '')}-400 mb-2`}>
                            {metric.icon}
                          </div>
                          <div className="text-2xl font-bold text-white">{metric.value}%</div>
                          <div className="text-sm text-white/80">{metric.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Interactive Buttons */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Interactive Elements</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Primary Action', 'Secondary Action', 'Accent Action', 'Custom Action'].map((action, index) => (
                      <Button
                        key={index}
                        className={`${
                          index === 0 ? `bg-[${currentTheme.primary}] hover:bg-[${currentTheme.primary}]/80` :
                          index === 1 ? `bg-[${currentTheme.secondary}] hover:bg-[${currentTheme.secondary}]/80` :
                          index === 2 ? `bg-[${currentTheme.accent}] hover:bg-[${currentTheme.accent}]/80` :
                          'bg-white/20 hover:bg-white/30'
                        } text-white`}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">
                  Dynamic Theme System
                </span>
                <Badge variant="outline" className="text-white border-white/30">
                  {currentTheme.name}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {currentTheme.mood}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {isAutoRotating ? 'Auto-Rotating' : 'Manual'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white/80">
                  <Palette className="h-4 w-4" />
                  <span className="text-xs">Theme Engine Active</span>
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

      {/* Render children with theme context */}
      {children}
    </div>
  )
}

// Theme Context Provider
interface ThemeContextType {
  currentTheme: ThemeColor
  setTheme: (theme: ThemeColor) => void
  themes: ThemeColor[]
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(THEME_COLORS[0])

  const setTheme = useCallback((theme: ThemeColor) => {
    setCurrentTheme(theme)
  }, [])

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: THEME_COLORS }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
