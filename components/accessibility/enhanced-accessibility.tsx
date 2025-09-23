'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Accessibility,
  Eye,
  EyeOff,
  Type,
  Contrast,
  MousePointer,
  Keyboard,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Monitor,
  Sun,
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface AccessibilitySettings {
  // Visual
  highContrast: boolean
  largeText: boolean
  fontSize: number // 0.8 to 2.0
  reducedMotion: boolean
  darkMode: 'system' | 'light' | 'dark'
  
  // Motor
  stickyKeys: boolean
  slowKeys: boolean
  clickAssist: boolean
  largerClickTargets: boolean
  
  // Cognitive
  simplifiedUI: boolean
  readingGuide: boolean
  focusHighlight: boolean
  autoScroll: boolean
  
  // Audio
  soundEnabled: boolean
  soundVolume: number // 0 to 1
  screenReaderMode: boolean
  
  // Navigation
  keyboardNavigation: boolean
  skipLinks: boolean
  breadcrumbs: boolean
}

export interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void
  resetSettings: () => void
  announceToScreenReader: (message: string) => void
  isReducedMotion: boolean
  isHighContrast: boolean
  currentFontSize: number
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  fontSize: 1.0,
  reducedMotion: false,
  darkMode: 'system',
  stickyKeys: false,
  slowKeys: false,
  clickAssist: false,
  largerClickTargets: false,
  simplifiedUI: false,
  readingGuide: false,
  focusHighlight: true,
  autoScroll: false,
  soundEnabled: true,
  soundVolume: 0.5,
  screenReaderMode: false,
  keyboardNavigation: true,
  skipLinks: true,
  breadcrumbs: true
}

// ============================================================================
// ACCESSIBILITY CONTEXT
// ============================================================================

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

// ============================================================================
// ACCESSIBILITY PROVIDER
// ============================================================================

interface AccessibilityProviderProps {
  children: React.ReactNode
  storageKey?: string
}

export function AccessibilityProvider({ 
  children, 
  storageKey = 'accessibility-settings' 
}: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedSettings = JSON.parse(stored)
        setSettings({ ...defaultSettings, ...parsedSettings })
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [storageKey])

  // Save settings to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(settings))
      } catch (error) {
        console.warn('Failed to save accessibility settings:', error)
      }
    }
  }, [settings, storageKey, isLoaded])

  // Apply CSS custom properties for accessibility
  useEffect(() => {
    const root = document.documentElement
    
    // Font size
    root.style.setProperty('--accessibility-font-scale', settings.fontSize.toString())
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
    
    // Large click targets
    if (settings.largerClickTargets) {
      root.classList.add('large-targets')
    } else {
      root.classList.remove('large-targets')
    }
    
    // Focus highlight
    if (settings.focusHighlight) {
      root.classList.add('enhanced-focus')
    } else {
      root.classList.remove('enhanced-focus')
    }
    
    // Simplified UI
    if (settings.simplifiedUI) {
      root.classList.add('simplified-ui')
    } else {
      root.classList.remove('simplified-ui')
    }

  }, [settings])

  // Update setting function
  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  // Reset settings
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  // Detect system preferences
  useEffect(() => {
    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches && !isLoaded) {
      setSettings(prev => ({ ...prev, reducedMotion: true }))
    }

    // Detect prefers-color-scheme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    if (settings.darkMode === 'system') {
      if (darkModeQuery.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isLoaded, settings.darkMode])

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    resetSettings,
    announceToScreenReader,
    isReducedMotion: settings.reducedMotion,
    isHighContrast: settings.highContrast,
    currentFontSize: settings.fontSize
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Screen reader live region */}
      <div 
        id="accessibility-announcements" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      />
      
      {/* Skip links */}
      {settings.skipLinks && <SkipLinks />}
      
      {/* Reading guide */}
      {settings.readingGuide && <ReadingGuide />}
      
      {/* CSS for accessibility features */}
      <style jsx global>{`
        :root {
          --accessibility-font-scale: ${settings.fontSize};
        }
        
        .high-contrast {
          filter: contrast(150%);
        }
        
        .high-contrast * {
          border-color: currentColor !important;
        }
        
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
        
        .large-targets button,
        .large-targets a,
        .large-targets input,
        .large-targets select,
        .large-targets textarea {
          min-height: 44px !important;
          min-width: 44px !important;
        }
        
        .enhanced-focus *:focus {
          outline: 3px solid #0066cc !important;
          outline-offset: 2px !important;
        }
        
        .simplified-ui .decorative {
          display: none !important;
        }
        
        .accessibility-font-scale {
          font-size: calc(1rem * var(--accessibility-font-scale));
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </AccessibilityContext.Provider>
  )
}

// ============================================================================
// ACCESSIBILITY HOOK
// ============================================================================

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// ============================================================================
// SKIP LINKS COMPONENT
// ============================================================================

function SkipLinks() {
  return (
    <div className="skip-links">
      <a 
        href="#main-content" 
        className="skip-link"
        onFocus={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onBlur={(e) => e.currentTarget.style.transform = 'translateY(-100%)'}
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="skip-link"
        onFocus={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onBlur={(e) => e.currentTarget.style.transform = 'translateY(-100%)'}
      >
        Skip to navigation
      </a>
      
      <style jsx>{`
        .skip-links {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
        }
        
        .skip-link {
          position: absolute;
          top: 0;
          left: 0;
          background: #000;
          color: #fff;
          padding: 8px 16px;
          text-decoration: none;
          transform: translateY(-100%);
          transition: transform 0.3s;
          font-weight: bold;
        }
        
        .skip-link:focus {
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// READING GUIDE COMPONENT
// ============================================================================

function ReadingGuide() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="reading-guide"
      style={{
        position: 'fixed',
        left: 0,
        top: position.y - 1,
        width: '100vw',
        height: '2px',
        backgroundColor: 'rgba(0, 102, 204, 0.7)',
        pointerEvents: 'none',
        zIndex: 9998,
        boxShadow: '0 0 4px rgba(0, 102, 204, 0.5)'
      }}
    />
  )
}

// ============================================================================
// ACCESSIBILITY SETTINGS PANEL
// ============================================================================

interface AccessibilitySettingsPanelProps {
  className?: string
  onClose?: () => void
}

export function AccessibilitySettingsPanel({ className, onClose }: AccessibilitySettingsPanelProps) {
  const { settings, updateSetting, resetSettings, announceToScreenReader } = useAccessibility()

  const handleSettingChange = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
    announcement?: string
  ) => {
    updateSetting(key, value)
    if (announcement) {
      announceToScreenReader(announcement)
    }
  }

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            <CardTitle>Accessibility Settings</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Customize your experience to make the interface more accessible and comfortable to use.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visual Settings */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">High Contrast</label>
                <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => 
                  handleSettingChange('highContrast', checked, checked ? 'High contrast enabled' : 'High contrast disabled')
                }
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Font Size: {Math.round(settings.fontSize * 100)}%</label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => handleSettingChange('fontSize', value)}
                min={0.8}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Reduce Motion</label>
                <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => 
                  handleSettingChange('reducedMotion', checked, checked ? 'Reduced motion enabled' : 'Reduced motion disabled')
                }
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Dark Mode</label>
              <div className="flex gap-2">
                {(['system', 'light', 'dark'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={settings.darkMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('darkMode', mode)}
                    className="flex items-center gap-1"
                  >
                    {mode === 'system' && <Monitor className="h-3 w-3" />}
                    {mode === 'light' && <Sun className="h-3 w-3" />}
                    {mode === 'dark' && <Moon className="h-3 w-3" />}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Motor Settings */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Motor
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Larger Click Targets</label>
                <p className="text-sm text-muted-foreground">Make buttons and links easier to click</p>
              </div>
              <Switch
                checked={settings.largerClickTargets}
                onCheckedChange={(checked) => 
                  handleSettingChange('largerClickTargets', checked, checked ? 'Larger click targets enabled' : 'Larger click targets disabled')
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Click Assist</label>
                <p className="text-sm text-muted-foreground">Provide visual feedback for clicks</p>
              </div>
              <Switch
                checked={settings.clickAssist}
                onCheckedChange={(checked) => handleSettingChange('clickAssist', checked)}
              />
            </div>
          </div>
        </div>

        {/* Cognitive Settings */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cognitive
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Simplified UI</label>
                <p className="text-sm text-muted-foreground">Hide decorative elements</p>
              </div>
              <Switch
                checked={settings.simplifiedUI}
                onCheckedChange={(checked) => handleSettingChange('simplifiedUI', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Reading Guide</label>
                <p className="text-sm text-muted-foreground">Show horizontal line to aid reading</p>
              </div>
              <Switch
                checked={settings.readingGuide}
                onCheckedChange={(checked) => handleSettingChange('readingGuide', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Enhanced Focus</label>
                <p className="text-sm text-muted-foreground">Highlight focused elements clearly</p>
              </div>
              <Switch
                checked={settings.focusHighlight}
                onCheckedChange={(checked) => handleSettingChange('focusHighlight', checked)}
              />
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Audio
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Sound Effects</label>
                <p className="text-sm text-muted-foreground">Enable interface sounds</p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            </div>

            {settings.soundEnabled && (
              <div className="space-y-2">
                <label className="font-medium">Volume: {Math.round(settings.soundVolume * 100)}%</label>
                <Slider
                  value={[settings.soundVolume]}
                  onValueChange={([value]) => handleSettingChange('soundVolume', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Settings */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Navigation
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Skip Links</label>
                <p className="text-sm text-muted-foreground">Show skip navigation links</p>
              </div>
              <Switch
                checked={settings.skipLinks}
                onCheckedChange={(checked) => handleSettingChange('skipLinks', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Keyboard Navigation</label>
                <p className="text-sm text-muted-foreground">Enhanced keyboard support</p>
              </div>
              <Switch
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// ACCESSIBILITY BUTTON
// ============================================================================

interface AccessibilityButtonProps {
  onClick?: () => void
  className?: string
  showLabel?: boolean
}

export function AccessibilityButton({ onClick, className, showLabel = true }: AccessibilityButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn('flex items-center gap-2', className)}
      aria-label="Open accessibility settings"
    >
      <Accessibility className="h-4 w-4" />
      {showLabel && <span>Accessibility</span>}
    </Button>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already declared above with their respective components
