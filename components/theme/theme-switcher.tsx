"use client"

import React, { useState } from 'react'
import { useTheme } from '@/components/providers'
import { themes, ThemeName } from '@/lib'
import { ThemeSchema } from '@/lib'
import { cn } from '@/lib'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  Sparkles,
  Briefcase,
  Zap,
  Heart
} from 'lucide-react'

interface ThemeSwitcherProps {
  className?: string
  showLabels?: boolean
  compact?: boolean
}

const themeIcons = {
  professional: Briefcase,
  'professional-dark': Briefcase,
  creative: Sparkles,
  minimal: Zap,
  colorful: Heart
}

const themeLabels = {
  professional: 'Professional',
  'professional-dark': 'Professional Dark',
  creative: 'Creative',
  minimal: 'Minimal',
  colorful: 'Colorful'
}

export function ThemeSwitcher({
  className,
  showLabels = true,
  compact = false
}: ThemeSwitcherProps) {
  const { theme, mode, setTheme, setMode, toggleMode, isDark, isLight, isSystem } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<string>(theme.id)

  const handleThemeChange = (themeName: ThemeName) => {
    setTheme(themes[themeName])
    setSelectedTheme(themes[themeName].id)
  }

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode)
  }

  const currentThemeName = Object.keys(themes).find(
    key => themes[key as ThemeName].id === theme.id
  ) as ThemeName

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMode}
          className="w-9 h-9 p-0"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Mode Switcher */}
      <div className="flex items-center gap-1">
        <Button
          variant={isLight ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange('light')}
          className="w-8 h-8 p-0"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={isDark ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange('dark')}
          className="w-8 h-8 p-0"
        >
          <Moon className="h-4 w-4" />
        </Button>
        <Button
          variant={isSystem ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange('system')}
          className="w-8 h-8 p-0"
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>

      {/* Theme Selector */}
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        <select
          value={currentThemeName || ''}
          onChange={(e) => handleThemeChange(e.target.value as ThemeName)}
          className="px-3 py-1 border rounded-md text-sm bg-background"
        >
          {Object.keys(themes).map((themeName) => (
            <option key={themeName} value={themeName}>
              {themeLabels[themeName as ThemeName]}
            </option>
          ))}
        </select>
      </div>

      <Badge variant="outline" className="text-xs">
        {mode}
      </Badge>
    </div>
  )
}

// Theme preview component
interface ThemePreviewProps {
  theme: ThemeSchema
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function ThemePreview({
  theme,
  isSelected = false,
  onClick,
  className
}: ThemePreviewProps) {
  const Icon = themeIcons[theme.id as ThemeName] || Palette

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-6 w-6" />
        <div>
          <h3 className="font-medium text-sm">{theme.name}</h3>
          <p className="text-xs text-muted-foreground">{theme.metadata.category}</p>
        </div>
      </div>

      {/* Color palette preview */}
      <div className="flex gap-1 mb-2">
        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.colors.primary[500] }}
        />
        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.colors.secondary[500] }}
        />
        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.colors.accent[500] }}
        />
        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.colors.background.primary }}
        />
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  )
}

// Advanced theme switcher with previews
export function AdvancedThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, mode, setMode } = useTheme()

  return (
    <Card className={cn('p-4', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Advanced Theme Switcher</CardTitle>
        <CardDescription>
          Switch between themes and modes with live preview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Theme Mode</span>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={mode === 'light' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('light')}
              className="h-8 px-3"
            >
              <Sun className="h-4 w-4 mr-1" />
              Light
            </Button>
            <Button
              variant={mode === 'dark' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('dark')}
              className="h-8 px-3"
            >
              <Moon className="h-4 w-4 mr-1" />
              Dark
            </Button>
            <Button
              variant={mode === 'system' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('system')}
              className="h-8 px-3"
            >
              <Monitor className="h-4 w-4 mr-1" />
              System
            </Button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme Style</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(themes).map((themeOption) => {
              const Icon = themeIcons[themeOption.id as ThemeName] || Palette
              const isSelected = theme.id === themeOption.id

              return (
                <Button
                  key={themeOption.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className="flex items-center gap-2 h-auto p-3"
                  onClick={() => setTheme(themeOption)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{themeOption.name}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span>Current Theme:</span>
            <Badge variant="secondary">
              {theme.name} ({theme.mode})
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {theme.description}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
