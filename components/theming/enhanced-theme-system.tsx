'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Palette,
  Sun,
  Moon,
  Monitor,
  Contrast,
  Zap,
  Paintbrush,
  Eye,
  Settings,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// THEME TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system' | 'auto'
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'gray' | 'custom'
export type ThemeStyle = 'default' | 'minimal' | 'vibrant' | 'professional' | 'playful' | 'elegant'

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  input: string
  ring: string
  destructive: string
  destructiveBackground: string
  warning: string
  warningBackground: string
  success: string
  successBackground: string
}

export interface ThemeConfig {
  mode: ThemeMode
  colorScheme: ColorScheme
  style: ThemeStyle
  customColors?: Partial<ColorPalette>
  
  // Advanced options
  borderRadius: number // 0-20px
  fontScale: number // 0.8-1.5
  spacing: number // 0.8-1.5
  shadows: boolean
  animations: boolean
  blur: boolean
  
  // Accessibility
  highContrast: boolean
  reducedMotion: boolean
  focusVisible: boolean
  
  // Layout
  compactMode: boolean
  sidebarWidth: number
  headerHeight: number
}

export interface ThemeContextType {
  config: ThemeConfig
  updateConfig: <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => void
  resetConfig: () => void
  exportConfig: () => string
  importConfig: (config: string) => boolean
  applyTheme: (config: Partial<ThemeConfig>) => void
  previewTheme: (config: Partial<ThemeConfig>) => void
  resetPreview: () => void
  isDarkMode: boolean
  currentPalette: ColorPalette
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const defaultConfig: ThemeConfig = {
  mode: 'system',
  colorScheme: 'blue',
  style: 'default',
  borderRadius: 8,
  fontScale: 1.0,
  spacing: 1.0,
  shadows: true,
  animations: true,
  blur: true,
  highContrast: false,
  reducedMotion: false,
  focusVisible: true,
  compactMode: false,
  sidebarWidth: 280,
  headerHeight: 64
}

const colorPalettes: Record<ColorScheme, ColorPalette> = {
  blue: {
    primary: '220 100% 50%',
    secondary: '220 30% 90%',
    accent: '220 100% 60%',
    background: '0 0% 100%',
    foreground: '220 10% 10%',
    muted: '220 10% 95%',
    mutedForeground: '220 10% 40%',
    border: '220 20% 90%',
    input: '220 20% 95%',
    ring: '220 100% 50%',
    destructive: '0 84% 60%',
    destructiveBackground: '0 84% 95%',
    warning: '38 92% 50%',
    warningBackground: '38 92% 95%',
    success: '142 76% 36%',
    successBackground: '142 76% 95%'
  },
  green: {
    primary: '142 76% 36%',
    secondary: '142 30% 90%',
    accent: '142 76% 46%',
    background: '0 0% 100%',
    foreground: '142 10% 10%',
    muted: '142 10% 95%',
    mutedForeground: '142 10% 40%',
    border: '142 20% 90%',
    input: '142 20% 95%',
    ring: '142 76% 36%',
    destructive: '0 84% 60%',
    destructiveBackground: '0 84% 95%',
    warning: '38 92% 50%',
    warningBackground: '38 92% 95%',
    success: '142 76% 36%',
    successBackground: '142 76% 95%'
  },
  purple: {
    primary: '262 83% 58%',
    secondary: '262 30% 90%',
    accent: '262 83% 68%',
    background: '0 0% 100%',
    foreground: '262 10% 10%',
    muted: '262 10% 95%',
    mutedForeground: '262 10% 40%',
    border: '262 20% 90%',
    input: '262 20% 95%',
    ring: '262 83% 58%',
    destructive: '0 84% 60%',
    destructiveBackground: '0 84% 95%',
    warning: '38 92% 50%',
    warningBackground: '38 92% 95%',
    success: '142 76% 36%',
    successBackground: '142 76% 95%'
  },
  orange: {
    primary: '24 95% 53%',
    secondary: '24 30% 90%',
    accent: '24 95% 63%',
    background: '0 0% 100%',
    foreground: '24 10% 10%',
    muted: '24 10% 95%',
    mutedForeground: '24 10% 40%',
    border: '24 20% 90%',
    input: '24 20% 95%',
    ring: '24 95% 53%',
    destructive: '0 84% 60%',
    destructiveBackground: '0 84% 95%',
    warning: '38 92% 50%',
    warningBackground: '38 92% 95%',
    success: '142 76% 36%',
    successBackground: '142 76% 95%'
  },
  pink: {
    primary: '336 75% 40%',
    secondary: '336 30% 90%',
    accent: '336 75% 50%',
    background: '0 0% 100%',
    foreground: '336 10% 10%',
    muted: '336 10% 95%',
    mutedForeground: '336 10% 40%',
    border: '336 20% 90%',
    input: '336 20% 95%',
    ring: '336 75% 40%',
    destructive: '0 84% 60%',
    destructiveBackground: '0 84% 95%',
    warning: '38 92% 50%',
    warningBackground: '38 92% 95%',
    success: '142 76% 36%',
    successBackground: '142 76% 95%'
  },
  gray: {
    primary: '220 9% 46%',
    secondary: '220 9% 90%',
    accent: '220 9% 56%',
    background: '0 0% 100%',
    foreground: '220 9% 10%',
    muted: '220 9% 95%',
    mutedForeground: '220 9% 40%',
    border: '220 9% 90%',
    input: '220 9% 95%',
    ring: '220 9% 46%',
    destructive: '0 84% 60%',
    destructiveBackground: '0 84% 95%',
    warning: '38 92% 50%',
    warningBackground: '38 92% 95%',
    success: '142 76% 36%',
    successBackground: '142 76% 95%'
  },
  custom: {
    primary: '220 100% 50%',
    secondary: '220 30% 90%',
    accent: '220 100% 60%',
    background: '0 0% 100%',
    foreground: '220 10% 10%',
    muted: '220 10% 95%',
    mutedForeground: '220 10% 40%',
    border: '220 20% 90%',
    input: '220 20% 95%',
    ring: '220 100% 50%',
    destructive: '0 84% 60%',
    destructiveBackground: '0 84% 95%',
    warning: '38 92% 50%',
    warningBackground: '38 92% 95%',
    success: '142 76% 36%',
    successBackground: '142 76% 95%'
  }
}

// ============================================================================
// THEME CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// ============================================================================
// THEME PROVIDER
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode
  storageKey?: string
  defaultConfig?: Partial<ThemeConfig>
}

export function EnhancedThemeProvider({ 
  children, 
  storageKey = 'enhanced-theme-config',
  defaultConfig: customDefault = {}
}: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>({ ...defaultConfig, ...customDefault })
  const [previewConfig, setPreviewConfig] = useState<Partial<ThemeConfig> | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load config from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedConfig = JSON.parse(stored)
        setConfig({ ...defaultConfig, ...customDefault, ...parsedConfig })
      }
    } catch (error) {
      console.warn('Failed to load theme config:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [storageKey, customDefault])

  // Save config to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(config))
      } catch (error) {
        console.warn('Failed to save theme config:', error)
      }
    }
  }, [config, storageKey, isLoaded])

  // Apply theme to document
  useEffect(() => {
    if (!isLoaded) return

    const activeConfig = previewConfig ? { ...config, ...previewConfig } : config
    const root = document.documentElement

    // Apply CSS custom properties
    const palette = getCurrentPalette(activeConfig)
    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
    })

    // Apply theme mode
    const isDark = getIsDarkMode(activeConfig.mode)
    root.classList.toggle('dark', isDark)

    // Apply other properties
    root.style.setProperty('--border-radius', `${activeConfig.borderRadius}px`)
    root.style.setProperty('--font-scale', activeConfig.fontScale.toString())
    root.style.setProperty('--spacing-scale', activeConfig.spacing.toString())
    root.style.setProperty('--sidebar-width', `${activeConfig.sidebarWidth}px`)
    root.style.setProperty('--header-height', `${activeConfig.headerHeight}px`)

    // Apply classes
    root.classList.toggle('no-shadows', !activeConfig.shadows)
    root.classList.toggle('no-animations', !activeConfig.animations)
    root.classList.toggle('no-blur', !activeConfig.blur)
    root.classList.toggle('high-contrast', activeConfig.highContrast)
    root.classList.toggle('reduce-motion', activeConfig.reducedMotion)
    root.classList.toggle('focus-visible', activeConfig.focusVisible)
    root.classList.toggle('compact-mode', activeConfig.compactMode)

  }, [config, previewConfig, isLoaded])

  const getCurrentPalette = (cfg: ThemeConfig): ColorPalette => {
    const basePalette = colorPalettes[cfg.colorScheme] || colorPalettes.blue
    return cfg.customColors ? { ...basePalette, ...cfg.customColors } : basePalette
  }

  const getIsDarkMode = (mode: ThemeMode): boolean => {
    if (mode === 'dark') return true
    if (mode === 'light') return false
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    if (mode === 'auto') {
      const hour = new Date().getHours()
      return hour < 7 || hour > 19 // Dark between 7 PM and 7 AM
    }
    return false
  }

  const updateConfig = useCallback(<K extends keyof ThemeConfig>(
    key: K,
    value: ThemeConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetConfig = useCallback(() => {
    setConfig({ ...defaultConfig, ...customDefault })
  }, [customDefault])

  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2)
  }, [config])

  const importConfig = useCallback((configString: string): boolean => {
    try {
      const parsedConfig = JSON.parse(configString)
      setConfig({ ...defaultConfig, ...parsedConfig })
      return true
    } catch (error) {
      console.error('Failed to import theme config:', error)
      return false
    }
  }, [])

  const applyTheme = useCallback((newConfig: Partial<ThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  const previewTheme = useCallback((newConfig: Partial<ThemeConfig>) => {
    setPreviewConfig(newConfig)
  }, [])

  const resetPreview = useCallback(() => {
    setPreviewConfig(null)
  }, [])

  const value: ThemeContextType = {
    config: previewConfig ? { ...config, ...previewConfig } : config,
    updateConfig,
    resetConfig,
    exportConfig,
    importConfig,
    applyTheme,
    previewTheme,
    resetPreview,
    isDarkMode: getIsDarkMode(config.mode),
    currentPalette: getCurrentPalette(config)
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================================================
// THEME HOOK
// ============================================================================

export function useEnhancedTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider')
  }
  return context
}

// ============================================================================
// THEME COMPONENTS
// ============================================================================

// Theme mode toggle
interface ThemeModeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeModeToggle({ className, showLabel = false }: ThemeModeToggleProps) {
  const { config, updateConfig } = useEnhancedTheme()

  const modes: { mode: ThemeMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { mode: 'light', icon: Sun, label: 'Light' },
    { mode: 'dark', icon: Moon, label: 'Dark' },
    { mode: 'system', icon: Monitor, label: 'System' },
    { mode: 'auto', icon: Zap, label: 'Auto' }
  ]

  return (
    <div className={cn('flex gap-1', className)}>
      {modes.map(({ mode, icon: Icon, label }) => (
        <Button
          key={mode}
          variant={config.mode === mode ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateConfig('mode', mode)}
          className={cn('flex items-center gap-1', !showLabel && 'p-2')}
        >
          <Icon className="h-4 w-4" />
          {showLabel && <span>{label}</span>}
        </Button>
      ))}
    </div>
  )
}

// Color scheme picker
interface ColorSchemePickerProps {
  className?: string
}

export function ColorSchemePicker({ className }: ColorSchemePickerProps) {
  const { config, updateConfig } = useEnhancedTheme()

  const schemes: { scheme: ColorScheme; color: string; label: string }[] = [
    { scheme: 'blue', color: 'bg-blue-500', label: 'Blue' },
    { scheme: 'green', color: 'bg-green-500', label: 'Green' },
    { scheme: 'purple', color: 'bg-purple-500', label: 'Purple' },
    { scheme: 'orange', color: 'bg-orange-500', label: 'Orange' },
    { scheme: 'pink', color: 'bg-pink-500', label: 'Pink' },
    { scheme: 'gray', color: 'bg-gray-500', label: 'Gray' },
    { scheme: 'custom', color: 'bg-gradient-to-r from-blue-500 to-purple-500', label: 'Custom' }
  ]

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {schemes.map(({ scheme, color, label }) => (
        <Button
          key={scheme}
          variant={config.colorScheme === scheme ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateConfig('colorScheme', scheme)}
          className="flex items-center gap-2"
        >
          <div className={cn('w-3 h-3 rounded-full', color)} />
          {label}
        </Button>
      ))}
    </div>
  )
}

// Theme settings panel
interface ThemeSettingsPanelProps {
  className?: string
  onClose?: () => void
}

export function ThemeSettingsPanel({ className, onClose }: ThemeSettingsPanelProps) {
  const { 
    config, 
    updateConfig, 
    resetConfig, 
    exportConfig, 
    importConfig,
    previewTheme,
    resetPreview
  } = useEnhancedTheme()

  const handleExport = () => {
    const configString = exportConfig()
    navigator.clipboard.writeText(configString).then(() => {
      // Show toast notification
    })
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          if (importConfig(content)) {
            // Show success toast
          } else {
            // Show error toast
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <Card className={cn('w-full max-w-4xl', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Theme Settings</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={resetConfig}>
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
          Customize the appearance and behavior of your interface.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Theme Mode */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Theme Mode
          </h3>
          <ThemeModeToggle showLabel />
        </div>

        {/* Color Scheme */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Paintbrush className="h-4 w-4" />
            Color Scheme
          </h3>
          <ColorSchemePicker />
        </div>

        {/* Style */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Style
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['default', 'minimal', 'vibrant', 'professional', 'playful', 'elegant'] as ThemeStyle[]).map(style => (
              <Button
                key={style}
                variant={config.style === style ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateConfig('style', style)}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Visual Settings */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Visual Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium">Border Radius: {config.borderRadius}px</label>
                <Slider
                  value={[config.borderRadius]}
                  onValueChange={([value]) => updateConfig('borderRadius', value)}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Font Scale: {Math.round(config.fontScale * 100)}%</label>
                <Slider
                  value={[config.fontScale]}
                  onValueChange={([value]) => updateConfig('fontScale', value)}
                  min={0.8}
                  max={1.5}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Spacing: {Math.round(config.spacing * 100)}%</label>
                <Slider
                  value={[config.spacing]}
                  onValueChange={([value]) => updateConfig('spacing', value)}
                  min={0.8}
                  max={1.5}
                  step={0.1}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium">Shadows</label>
                <Switch
                  checked={config.shadows}
                  onCheckedChange={(checked) => updateConfig('shadows', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="font-medium">Animations</label>
                <Switch
                  checked={config.animations}
                  onCheckedChange={(checked) => updateConfig('animations', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="font-medium">Blur Effects</label>
                <Switch
                  checked={config.blur}
                  onCheckedChange={(checked) => updateConfig('blur', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="font-medium">High Contrast</label>
                <Switch
                  checked={config.highContrast}
                  onCheckedChange={(checked) => updateConfig('highContrast', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="font-medium">Reduced Motion</label>
                <Switch
                  checked={config.reducedMotion}
                  onCheckedChange={(checked) => updateConfig('reducedMotion', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layout Settings */}
        <div>
          <h3 className="font-semibold mb-4">Layout Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium">Sidebar Width: {config.sidebarWidth}px</label>
                <Slider
                  value={[config.sidebarWidth]}
                  onValueChange={([value]) => updateConfig('sidebarWidth', value)}
                  min={200}
                  max={400}
                  step={20}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Header Height: {config.headerHeight}px</label>
                <Slider
                  value={[config.headerHeight]}
                  onValueChange={([value]) => updateConfig('headerHeight', value)}
                  min={48}
                  max={100}
                  step={4}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium">Compact Mode</label>
                <Switch
                  checked={config.compactMode}
                  onCheckedChange={(checked) => updateConfig('compactMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="font-medium">Focus Visible</label>
                <Switch
                  checked={config.focusVisible}
                  onCheckedChange={(checked) => updateConfig('focusVisible', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => previewTheme({ mode: 'dark', colorScheme: 'purple' })}
          >
            Preview Dark Purple
          </Button>
          <Button
            variant="outline"
            onClick={() => previewTheme({ mode: 'light', colorScheme: 'green' })}
          >
            Preview Light Green
          </Button>
          <Button
            variant="outline"
            onClick={resetPreview}
          >
            Reset Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Theme preview card
interface ThemePreviewCardProps {
  config: Partial<ThemeConfig>
  title: string
  className?: string
  onApply?: () => void
  onPreview?: () => void
}

export function ThemePreviewCard({ 
  config, 
  title, 
  className, 
  onApply, 
  onPreview 
}: ThemePreviewCardProps) {
  return (
    <Card className={cn('cursor-pointer hover:shadow-lg transition-shadow', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-primary rounded-full" />
            <div className="w-4 h-4 bg-secondary rounded-full" />
            <div className="w-4 h-4 bg-accent rounded-full" />
          </div>
          
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted rounded w-1/2" />
          </div>
          
          <div className="flex gap-2 pt-2">
            {onPreview && (
              <Button variant="outline" size="sm" onClick={onPreview}>
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            )}
            {onApply && (
              <Button size="sm" onClick={onApply}>
                Apply
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  EnhancedThemeProvider,
  useEnhancedTheme,
  ThemeModeToggle,
  ColorSchemePicker,
  ThemeSettingsPanel,
  ThemePreviewCard
}

export type {
  ThemeMode,
  ColorScheme,
  ThemeStyle,
  ColorPalette,
  ThemeConfig,
  ThemeContextType
}
