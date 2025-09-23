"use client"

import React, { useState } from 'react'
import { useTheme } from '@/components/providers'
import { themes } from '@/lib'
import { ThemeSwitcher, AdvancedThemeSwitcher, ThemePreview } from '@/components/theme'
import { ThemedContainer } from '@/components/layouts'
import { ThemedCard } from '@/components/layouts'
import { ThemedButton } from '@/components/layouts'
import { ThemedLayout } from '@/components/layouts'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import {
  Palette,
  Code,
  Settings,
  Eye,
  Download,
  Upload,
  Copy,
  Check,
  Sparkles,
  Briefcase,
  Zap,
  Heart,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { cn } from '@/lib'

export default function ThemesPage() {
  const { theme, mode, setTheme, setMode, isDark, isLight, isSystem } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const themeUsageExamples = {
    container: `<ThemedContainer variant="default" className="p-6">
  <h3 className="text-lg font-semibold">Content</h3>
  <p>This container adapts to the current theme.</p>
</ThemedContainer>`,

    card: `<ThemedCard variant="elevated">
  <ThemedCard.Header>
    <h3>Card Title</h3>
  </ThemedCard.Header>
  <ThemedCard.Content>
    <p>Card content that adapts to themes.</p>
  </ThemedCard.Content>
  <ThemedCard.Footer>
    <ThemedButton>Action</ThemedButton>
  </ThemedCard.Footer>
</ThemedCard>`,

    button: `<ThemedButton themeVariant="primary">
  Primary Action
</ThemedButton>
<ThemedButton themeVariant="secondary">
  Secondary Action
</ThemedButton>`,

    layout: `<ThemedLayout variant="dashboard">
  <ThemedLayout.Header>
    <h1>Dashboard</h1>
  </ThemedLayout.Header>
  <ThemedLayout.Main>
    <p>Main content</p>
  </ThemedLayout.Main>
</ThemedLayout>`
  }

  return (
    <ThemedLayout variant="dashboard">
      <ThemedLayout.Header>
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🎨 Theme System
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive theming system with multiple variants and utilities
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {theme.name} ({mode})
            </Badge>
            <ThemeSwitcher />
          </div>
        </div>
      </ThemedLayout.Header>

      <ThemedLayout.Main>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="themes">Theme Gallery</TabsTrigger>
            <TabsTrigger value="code">Code Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Theme Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ThemedCard variant="default">
                <ThemedCard.Content className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Object.keys(themes).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Available Themes</div>
                </ThemedCard.Content>
              </ThemedCard>

              <ThemedCard variant="default">
                <ThemedCard.Content className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {theme.metadata.category === 'professional' ? '✓' : theme.metadata.category}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Category</div>
                </ThemedCard.Content>
              </ThemedCard>

              <ThemedCard variant="default">
                <ThemedCard.Content className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {mode}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Mode</div>
                </ThemedCard.Content>
              </ThemedCard>

              <ThemedCard variant="default">
                <ThemedCard.Content className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    v{theme.version}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Theme Version</div>
                </ThemedCard.Content>
              </ThemedCard>
            </div>

            {/* Current Theme Info */}
            <ThemedCard variant="elevated">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold">Current Theme: {theme.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{theme.description}</p>
              </ThemedCard.Header>
              <ThemedCard.Content>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Primary Colors</div>
                    <div className="flex gap-1">
                      {Object.values(theme.colors.primary).slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Typography</div>
                    <div className="text-xs">
                      Font: {theme.typography.fontFamily.sans[0]}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Accessibility</div>
                    <div className="text-xs">
                      Contrast: {theme.metadata.accessibility.contrast}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Mode</div>
                    <div className="text-xs">{theme.mode}</div>
                  </div>
                </div>
              </ThemedCard.Content>
            </ThemedCard>

            {/* Quick Theme Switcher */}
            <ThemedCard variant="default">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold">Quick Theme Switcher</h3>
              </ThemedCard.Header>
              <ThemedCard.Content>
                <AdvancedThemeSwitcher />
              </ThemedCard.Content>
            </ThemedCard>
          </TabsContent>

          <TabsContent value="components" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ThemedContainer Examples */}
              <ThemedCard variant="default">
                <ThemedCard.Header>
                  <h3 className="text-lg font-semibold">ThemedContainer</h3>
                </ThemedCard.Header>
                <ThemedCard.Content className="space-y-4">
                  <ThemedContainer variant="default" className="p-4">
                    <h4 className="font-medium">Default Container</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This container adapts to the current theme automatically.
                    </p>
                  </ThemedContainer>

                  <ThemedContainer variant="elevated" className="p-4">
                    <h4 className="font-medium">Elevated Container</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      With shadow and enhanced styling.
                    </p>
                  </ThemedContainer>

                  <ThemedContainer variant="glass" className="p-4">
                    <h4 className="font-medium">Glass Container</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Semi-transparent with backdrop blur.
                    </p>
                  </ThemedContainer>
                </ThemedCard.Content>
              </ThemedCard>

              {/* ThemedButton Examples */}
              <ThemedCard variant="default">
                <ThemedCard.Header>
                  <h3 className="text-lg font-semibold">ThemedButton</h3>
                </ThemedCard.Header>
                <ThemedCard.Content className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <ThemedButton themeVariant="primary" size="sm">
                      Primary
                    </ThemedButton>
                    <ThemedButton themeVariant="secondary" size="sm">
                      Secondary
                    </ThemedButton>
                    <ThemedButton themeVariant="outline" size="sm">
                      Outline
                    </ThemedButton>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <ThemedButton themeVariant="primary" size="md">
                      Primary
                    </ThemedButton>
                    <ThemedButton themeVariant="secondary" size="md">
                      Secondary
                    </ThemedButton>
                    <ThemedButton themeVariant="outline" size="md">
                      Outline
                    </ThemedButton>
                  </div>
                </ThemedCard.Content>
              </ThemedCard>

              {/* ThemedCard Examples */}
              <ThemedCard variant="default">
                <ThemedCard.Header>
                  <h3 className="text-lg font-semibold">ThemedCard</h3>
                </ThemedCard.Header>
                <ThemedCard.Content className="space-y-4">
                  <ThemedCard variant="default" className="p-4">
                    <ThemedCard.Header>
                      <h4 className="font-medium">Default Card</h4>
                    </ThemedCard.Header>
                    <ThemedCard.Content>
                      <p className="text-sm">Standard card styling</p>
                    </ThemedCard.Content>
                  </ThemedCard>

                  <ThemedCard variant="elevated" className="p-4">
                    <ThemedCard.Header>
                      <h4 className="font-medium">Elevated Card</h4>
                    </ThemedCard.Header>
                    <ThemedCard.Content>
                      <p className="text-sm">With enhanced shadow</p>
                    </ThemedCard.Content>
                  </ThemedCard>
                </ThemedCard.Content>
              </ThemedCard>

              {/* Color Palette Display */}
              <ThemedCard variant="default">
                <ThemedCard.Header>
                  <h3 className="text-lg font-semibold">Color Palette</h3>
                </ThemedCard.Header>
                <ThemedCard.Content>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(theme.colors.primary).slice(0, 10).map(([key, color]) => (
                      <div key={key} className="text-center">
                        <div
                          className="w-8 h-8 rounded border mx-auto mb-1"
                          style={{ backgroundColor: color }}
                        />
                        <div className="text-xs text-gray-500">{key}</div>
                      </div>
                    ))}
                  </div>
                </ThemedCard.Content>
              </ThemedCard>
            </div>
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(themes).map((themeOption) => (
                <ThemePreview
                  key={themeOption.id}
                  theme={themeOption}
                  isSelected={theme.id === themeOption.id}
                  onClick={() => setTheme(themeOption)}
                  className="cursor-pointer"
                />
              ))}
            </div>

            {/* Theme Details */}
            <ThemedCard variant="elevated">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold">Theme Details</h3>
              </ThemedCard.Header>
              <ThemedCard.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Metadata</h4>
                    <div className="space-y-1 text-sm">
                      <div>Name: {theme.name}</div>
                      <div>Version: {theme.version}</div>
                      <div>Category: {theme.metadata.category}</div>
                      <div>Author: AgentDash</div>
                      <div>Created: {new Date(theme.metadata.created).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Accessibility</h4>
                    <div className="space-y-1 text-sm">
                      <div>Contrast: {theme.metadata.accessibility.contrast}</div>
                      <div>Motion: {theme.metadata.accessibility.motion}</div>
                      <div>Mode: {theme.mode}</div>
                    </div>
                  </div>
                </div>
              </ThemedCard.Content>
            </ThemedCard>
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Usage Examples */}
              <ThemedCard variant="default">
                <ThemedCard.Header>
                  <h3 className="text-lg font-semibold">Usage Examples</h3>
                </ThemedCard.Header>
                <ThemedCard.Content className="space-y-4">
                  {Object.entries(themeUsageExamples).map(([component, code]) => (
                    <div key={component} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{component}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code, component)}
                        >
                          {copiedCode === component ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                        <code>{code}</code>
                      </pre>
                    </div>
                  ))}
                </ThemedCard.Content>
              </ThemedCard>

              {/* Theme Hook Usage */}
              <ThemedCard variant="default">
                <ThemedCard.Header>
                  <h3 className="text-lg font-semibold">Theme Hooks</h3>
                </ThemedCard.Header>
                <ThemedCard.Content>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Basic Theme Usage</h4>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                        <code>{`import { useTheme } from '@/components/providers'

function MyComponent() {
  const { theme, mode, setTheme } = useTheme()

  return (
    <div style={{
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary
    }}>
      Current theme: {theme.name}
    </div>
  )
}`}</code>
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Theme Selector Hook</h4>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                        <code>{`import { useThemeColors, useThemeTypography } from '@/components/providers'

function StyledComponent() {
  const colors = useThemeColors()
  const typography = useThemeTypography()

  return (
    <div style={{
      backgroundColor: colors.background.primary,
      fontFamily: typography.fontFamily.sans.join(', ')
    }}>
      Styled content
    </div>
  )
}`}</code>
                      </pre>
                    </div>
                  </div>
                </ThemedCard.Content>
              </ThemedCard>

              {/* Theme Creation Example */}
              <ThemedCard variant="default">
                <ThemedCard.Header>
                  <h3 className="text-lg font-semibold">Creating Custom Themes</h3>
                </ThemedCard.Header>
                <ThemedCard.Content>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                    <code>{`import { ThemeSchema } from '@/lib'

const customTheme: ThemeSchema = {
  id: 'custom-theme',
  name: 'My Custom Theme',
  version: '1.0.0',
  mode: 'light',
  colors: {
    primary: {
      500: '#your-primary-color',
      // ... other shades
    },
    // ... other color definitions
  },
  typography: {
    // ... typography settings
  },
  // ... other theme properties
}

// Use the theme
setTheme(customTheme)`}</code>
                  </pre>
                </ThemedCard.Content>
              </ThemedCard>
            </div>
          </TabsContent>
        </Tabs>
      </ThemedLayout.Main>
    </ThemedLayout>
  )
}
