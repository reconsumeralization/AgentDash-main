"use client"

import React, { useState } from 'react'
import { useTheme } from '@/components/providers'
import { ThemedCard } from '@/components/layouts'
import { ThemedButton } from '@/components/layouts'
import { ThemedContainer } from '@/components/layouts'
import { ThemeSwitcher, AdvancedThemeSwitcher } from '@/components/theme'
import { themes } from '@/lib'
import {
  ThemeMode,
  ThemeCategory,
  ThemeOverride,
  ThemeSearchCriteria,
  isThemeMode,
  assertThemeCategory,
  ThemeApiResult,
  ThemeError
} from '@/lib'
import { cn } from '@/lib'
import { Badge } from '@/components/ui'
import {
  Palette,
  Code,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Search,
  Filter,
  Settings,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

export function ThemeDemo() {
  const { theme, mode, updateTheme, resetTheme, getThemeProperty } = useTheme()
  const [activeDemo, setActiveDemo] = useState<'basics' | 'advanced' | 'api' | 'errors'>('basics')
  const [searchCriteria, setSearchCriteria] = useState<ThemeSearchCriteria>({
    category: 'professional',
    mode: 'light',
    limit: 5
  })

  // Example of type-safe theme property access
  const primaryColor = getThemeProperty<string>('colors.primary.500')
  const buttonStyles = getThemeProperty('components.button.primary')

  // Simulated API response (following Next.js pattern from article)
  const mockApiResponse = (success: boolean): ThemeApiResult => ({
    success,
    data: success ? theme : undefined,
    error: success ? undefined : 'Theme not found',
    timestamp: new Date().toISOString(),
    themes: success ? [theme] : undefined
  })

  // Type guard example (following article's practical approach)
  const handleApiCall = (shouldSucceed: boolean) => {
    const response = mockApiResponse(shouldSucceed)

    if (response.success && response.data) {
      console.log('✅ Success:', response.data.name)
    } else if (!response.success && response.error) {
      console.error('❌ Error:', response.error)
    }
  }

  // Theme search with type safety
  const searchThemes = (criteria: ThemeSearchCriteria) => {
    return Object.values(themes).filter(theme => {
      if (criteria.category && theme.metadata.category !== criteria.category) return false
      if (criteria.mode && theme.mode !== criteria.mode) return false
      if (criteria.query && !theme.name.toLowerCase().includes(criteria.query.toLowerCase())) return false
      return true
    })
  }

  // Error handling with union types
  const handleThemeOperation = (operation: string): ThemeError | null => {
    try {
      switch (operation) {
        case 'update':
          updateTheme({ name: 'Updated Theme' })
          break
        case 'reset':
          resetTheme()
          break
        default:
          return { type: 'VALIDATION_ERROR', message: 'Unknown operation', errors: ['Unknown operation'] }
      }
      return null
    } catch (error) {
      return {
        type: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const tabs = [
    { id: 'basics', label: 'Basics', icon: Palette },
    { id: 'advanced', label: 'Advanced', icon: Zap },
    { id: 'api', label: 'API Patterns', icon: Code },
    { id: 'errors', label: 'Error Handling', icon: AlertTriangle }
  ]

  return (
    <ThemedContainer className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎯 TypeScript Best Practices Demo</h1>
          <p className="text-muted-foreground mt-2">
            Demonstrating interfaces, types, and advanced patterns from the LinkedIn article
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {theme.name} ({mode})
          </Badge>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveDemo(id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeDemo === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Demo Content */}
      <div className="space-y-6">
        {activeDemo === 'basics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interfaces for Structure */}
            <ThemedCard variant="default">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Interfaces for Structure
                </h3>
              </ThemedCard.Header>
              <ThemedCard.Content className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Using interfaces to enforce consistent object structures (Article Pattern)
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Theme ID:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {theme.id}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Theme Name:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {theme.name}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Primary Color:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {primaryColor}
                      </code>
                    </div>
                  </div>
                </div>

                <ThemedButton
                  onClick={() => updateTheme({ name: `${theme.name} (Updated)` })}
                  className="w-full"
                >
                  Update Theme (Interface Method)
                </ThemedButton>
              </ThemedCard.Content>
            </ThemedCard>

            {/* Types for Flexibility */}
            <ThemedCard variant="default">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Types for Flexibility
                </h3>
              </ThemedCard.Header>
              <ThemedCard.Content className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Using union and intersection types for complex logic (Article Pattern)
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Theme Mode:</label>
                    <select
                      value={mode}
                      onChange={(e) => {
                        const newMode = e.target.value
                        if (isThemeMode(newMode)) {
                          // Type-safe mode change
                          console.log('Mode changed to:', newMode)
                        }
                      }}
                      className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Search Themes:</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="Search themes..."
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                        onChange={(e) => setSearchCriteria((prev: ThemeSearchCriteria) => ({
                          ...prev,
                          query: e.target.value
                        }))}
                      />
                      <button
                        onClick={() => console.log('Search results:', searchThemes(searchCriteria))}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </ThemedCard.Content>
            </ThemedCard>
          </div>
        )}

        {activeDemo === 'advanced' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Pattern */}
            <ThemedCard variant="elevated">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold">Service Pattern (Angular Style)</h3>
              </ThemedCard.Header>
              <ThemedCard.Content className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Interface for consistent API, types for flexible business logic
                </p>

                <div className="space-y-2">
                  <ThemedButton
                    onClick={() => handleThemeOperation('update')}
                    className="w-full"
                  >
                    Update Theme (Service Method)
                  </ThemedButton>

                  <ThemedButton
                    onClick={() => handleThemeOperation('reset')}
                    variant="outline"
                    className="w-full"
                  >
                    Reset Theme (Service Method)
                  </ThemedButton>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs">
                    <strong>Current Theme:</strong> {theme.name}<br/>
                    <strong>Category:</strong> {theme.metadata.category}<br/>
                    <strong>Version:</strong> {theme.version}
                  </p>
                </div>
              </ThemedCard.Content>
            </ThemedCard>

            {/* Component Props Pattern */}
            <ThemedCard variant="elevated">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold">Component Props (React Style)</h3>
              </ThemedCard.Header>
              <ThemedCard.Content className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Interface for props structure, intersection types for enhancement
                </p>

                <AdvancedThemeSwitcher />

                <div className="text-xs text-muted-foreground">
                  This component uses intersection types (ThemeSwitcherProps & AdvancedThemeSwitcherProps)
                  for enhanced functionality while maintaining type safety.
                </div>
              </ThemedCard.Content>
            </ThemedCard>
          </div>
        )}

        {activeDemo === 'api' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* API Response Pattern */}
            <ThemedCard variant="default">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold">API Response Pattern (Next.js Style)</h3>
              </ThemedCard.Header>
              <ThemedCard.Content className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Consistent response structures with union types for different states
                </p>

                <div className="space-y-2">
                  <ThemedButton
                    onClick={() => handleApiCall(true)}
                    className="w-full"
                  >
                    Simulate Success Response
                  </ThemedButton>

                  <ThemedButton
                    onClick={() => handleApiCall(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Simulate Error Response
                  </ThemedButton>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs">
                    Check browser console for type-safe API response handling
                  </p>
                </div>
              </ThemedCard.Content>
            </ThemedCard>

            {/* Type Guards and Assertions */}
            <ThemedCard variant="default">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold">Type Guards & Assertions</h3>
              </ThemedCard.Header>
              <ThemedCard.Content className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Runtime validation with compile-time type safety
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      isThemeMode(mode) ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    <span className="text-sm">
                      Mode validation: {isThemeMode(mode) ? 'Valid' : 'Invalid'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      theme.metadata.category ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    <span className="text-sm">
                      Category validation: {theme.metadata.category ? 'Valid' : 'Invalid'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      try {
                        const category = assertThemeCategory(theme.metadata.category)
                        console.log('✅ Category asserted:', category)
                      } catch (error) {
                        console.error('❌ Category assertion failed:', error)
                      }
                    }}
                    className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                  >
                    Test Type Assertion
                  </button>
                </div>
              </ThemedCard.Content>
            </ThemedCard>
          </div>
        )}

        {activeDemo === 'errors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Error Handling with Union Types */}
            <ThemedCard variant="default">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold">Error Handling with Union Types</h3>
              </ThemedCard.Header>
              <ThemedCard.Content className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Type-safe error handling with discriminated unions
                </p>

                <div className="space-y-2">
                  <ThemedButton
                    onClick={() => {
                      const error = handleThemeOperation('invalid')
                      if (error && typeof error === 'object' && error !== null && 'type' in error) {
                        console.error('Theme error:', error)
                      }
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Trigger Validation Error
                  </ThemedButton>

                  <ThemedButton
                    onClick={() => {
                      const error = handleThemeOperation('network')
                      if (error && typeof error === 'object' && error !== null && 'type' in error) {
                        console.error('Network error:', error)
                      }
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Trigger Network Error
                  </ThemedButton>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs">
                    Errors are handled with discriminated union types for type-safe
                    error processing and user feedback.
                  </p>
                </div>
              </ThemedCard.Content>
            </ThemedCard>

            {/* Factory Pattern */}
            <ThemedCard variant="default">
              <ThemedCard.Header>
                <h3 className="text-lg font-semibold">Factory Pattern with Types</h3>
              </ThemedCard.Header>
              <ThemedCard.Content className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Type-safe object creation with factory pattern (Article Example)
                </p>

                <div className="space-y-2">
                  <ThemedButton
                    onClick={() => {
                      // Example of factory pattern usage
                      console.log('Factory pattern would create new theme instances')
                    }}
                    className="w-full"
                  >
                    Create Theme (Factory Pattern)
                  </ThemedButton>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs">
                    Factory pattern ensures consistent object creation with type safety
                    and validation at creation time.
                  </p>
                </div>
              </ThemedCard.Content>
            </ThemedCard>
          </div>
        )}
      </div>

      {/* Footer with Best Practices Summary */}
      <ThemedCard variant="elevated" className="mt-8">
        <ThemedCard.Header>
          <h3 className="text-lg font-semibold">🎯 TypeScript Best Practices Summary</h3>
        </ThemedCard.Header>
        <ThemedCard.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Interfaces for Structure</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Consistent object shapes and contracts
              </p>
            </div>

            <div className="text-center">
              <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Types for Flexibility</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Union/intersection types for complex logic
              </p>
            </div>

            <div className="text-center">
              <Code className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Framework Patterns</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Angular, React, Next.js best practices
              </p>
            </div>

            <div className="text-center">
              <Shield className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Type Safety</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Runtime validation with compile-time safety
              </p>
            </div>
          </div>
        </ThemedCard.Content>
      </ThemedCard>
    </ThemedContainer>
  )
}

// Helper component for consistent icon usage
function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
