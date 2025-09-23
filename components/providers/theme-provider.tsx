"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ThemeSchema, ThemeMode, ThemeContextValue, ThemeProviderProps, ThemeOverride } from '@/lib'
import { themes, defaultTheme, defaultDarkTheme } from '@/lib'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderState {
  theme: ThemeSchema
  mode: ThemeMode
  resolvedTheme: ThemeSchema
}

export function ThemeProvider({
  children,
  defaultTheme: initialTheme = defaultTheme,
  defaultMode = 'system',
  storageKey = 'agentdash-theme',
  enableSystem = true
}: ThemeProviderProps) {
  const [state, setState] = useState<ThemeProviderState>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          const themeId = parsed?.themeId
          const mode = parsed?.mode
          const storedTheme = (themes && themes[themeId as keyof typeof themes]) || initialTheme
          const storedMode = (mode as ThemeMode) || defaultMode

          return {
            theme: storedTheme,
            mode: storedMode,
            resolvedTheme: resolveTheme(storedTheme, storedMode, enableSystem)
          }
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error)
      }
    }

    return {
      theme: initialTheme,
      mode: defaultMode,
      resolvedTheme: resolveTheme(initialTheme, defaultMode, enableSystem)
    }
  })

  // Resolve theme based on mode and system preference
  function resolveTheme(theme: ThemeSchema, mode: ThemeMode, enableSystem: boolean): ThemeSchema {
    if (mode === 'system' && enableSystem && typeof window !== 'undefined') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemPrefersDark ? defaultDarkTheme : theme
    }

    if (mode === 'dark') {
      return theme.mode === 'dark' ? theme : defaultDarkTheme
    }

    return theme
  }

  // Update resolved theme when theme or mode changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      resolvedTheme: resolveTheme(prev.theme, prev.mode, enableSystem)
    }))
  }, [state.theme, state.mode, enableSystem])

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || state.mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      setState(prev => ({
        ...prev,
        resolvedTheme: resolveTheme(prev.theme, prev.mode, enableSystem)
      }))
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [state.mode, enableSystem])

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        themeId: state.theme.id,
        mode: state.mode
      }))
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [state.theme.id, state.mode, storageKey])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement

    // Apply CSS custom properties
    const applyTheme = (theme: ThemeSchema) => {
      // Colors
      Object.entries(theme.colors).forEach(([category, values]) => {
        if (typeof values === 'object' && values !== null) {
          Object.entries(values).forEach(([key, value]) => {
            if (typeof value === 'string') {
              root.style.setProperty(`--color-${category}-${key}`, value)
            } else if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([subKey, subValue]) => {
                if (typeof subValue === 'string') {
                  root.style.setProperty(`--color-${category}-${key}-${subKey}`, subValue)
                } else if (typeof subValue === 'object' && subValue !== null && '500' in subValue) {
                  // Handle color scales
                  Object.entries(subValue).forEach(([scaleKey, scaleValue]) => {
                    root.style.setProperty(`--color-${category}-${key}-${scaleKey}`, scaleValue as string)
                  })
                }
              })
            }
          })
        }
      })

      // Typography
      Object.entries(theme.typography).forEach(([category, values]) => {
        if (typeof values === 'object' && values !== null) {
          Object.entries(values).forEach(([key, value]) => {
            if (typeof value === 'string') {
              root.style.setProperty(`--typography-${category}-${key}`, value)
            } else if (Array.isArray(value)) {
              root.style.setProperty(`--typography-${category}-${key}`, value.join(', '))
            } else if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([subKey, subValue]) => {
                root.style.setProperty(`--typography-${category}-${key}-${subKey}`, String(subValue))
              })
            }
          })
        }
      })

      // Spacing
      Object.entries(theme.spacing).forEach(([category, values]) => {
        if (typeof values === 'object' && values !== null) {
          Object.entries(values).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([subKey, subValue]) => {
                root.style.setProperty(`--spacing-${category}-${subKey}`, subValue as string)
              })
            }
          })
        }
      })

      // Border radius
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--border-radius-${key}`, value)
      })

      // Shadows
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value)
      })

      // Animation
      Object.entries(theme.animation).forEach(([category, values]) => {
        if (typeof values === 'object' && values !== null) {
          Object.entries(values).forEach(([key, value]) => {
            if (typeof value === 'string') {
              root.style.setProperty(`--animation-${category}-${key}`, value)
            } else if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([subKey, subValue]) => {
                root.style.setProperty(`--animation-${category}-${key}-${subKey}`, String(subValue))
              })
            }
          })
        }
      })

      // Z-index
      Object.entries(theme.zIndex).forEach(([key, value]) => {
        root.style.setProperty(`--z-index-${key}`, String(value))
      })

      // Component variants
      Object.entries(theme.components).forEach(([component, variants]) => {
        if (typeof variants === 'object' && variants !== null) {
          Object.entries(variants).forEach(([variant, styles]) => {
            if (typeof styles === 'object' && styles !== null) {
              Object.entries(styles).forEach(([property, value]) => {
                if (typeof value === 'string') {
                  root.style.setProperty(`--component-${component}-${variant}-${property}`, value)
                } else if (typeof value === 'object' && value !== null) {
                  Object.entries(value).forEach(([subProperty, subValue]) => {
                    root.style.setProperty(`--component-${component}-${variant}-${property}-${subProperty}`, String(subValue))
                  })
                }
              })
            }
          })
        }
      })

      // Set theme attributes
      root.setAttribute('data-theme', theme.id)
      root.setAttribute('data-theme-mode', theme.mode)
      root.setAttribute('data-theme-category', theme.metadata.category)
    }

    applyTheme(state.resolvedTheme)
  }, [state.resolvedTheme])

  const setTheme = useCallback((newTheme: ThemeSchema) => {
    setState(prev => ({
      ...prev,
      theme: newTheme,
      resolvedTheme: resolveTheme(newTheme, prev.mode, enableSystem)
    }))
  }, [enableSystem])

  const setMode = useCallback((newMode: ThemeMode) => {
    setState(prev => ({
      ...prev,
      mode: newMode,
      resolvedTheme: resolveTheme(prev.theme, newMode, enableSystem)
    }))
  }, [enableSystem])

  const toggleMode = useCallback(() => {
    setMode(state.mode === 'dark' ? 'light' : 'dark')
  }, [state.mode, setMode])

  // Enhanced utility methods following TypeScript best practices
  const updateTheme = useCallback((updates: ThemeOverride) => {
    setState(prev => ({
      ...prev,
      theme: { ...prev.theme, ...updates },
      resolvedTheme: { ...resolveTheme({ ...prev.theme, ...updates }, prev.mode, enableSystem) }
    }))
  }, [enableSystem])

  const resetTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: initialTheme,
      resolvedTheme: resolveTheme(initialTheme, prev.mode, enableSystem)
    }))
  }, [initialTheme, enableSystem])

  const getThemeProperty = useCallback(<T,>(path: string): T | undefined => {
    const keys = path.split('.')
    let value: any = state.resolvedTheme

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }

    return value as T
  }, [state.resolvedTheme])

  const contextValue: ThemeContextValue = {
    theme: state?.resolvedTheme || defaultTheme,
    mode: state?.mode || defaultMode,
    setTheme,
    setMode,
    toggleMode,
    isDark: state?.resolvedTheme?.mode === 'dark',
    isLight: state?.resolvedTheme?.mode === 'light',
    isSystem: state?.mode === 'system',
    updateTheme,
    resetTheme,
    getThemeProperty
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Theme consumer component
export function ThemeConsumer({ renderAction }: { renderAction: (theme: ThemeContextValue) => React.ReactNode }) {
  const theme = useTheme()
  return <>{renderAction(theme)}</>
}

// Theme hook with selector
export function useThemeSelector<T>(selector: (theme: ThemeSchema) => T): T {
  const { theme } = useTheme()
  return selector(theme)
}

// Theme utility hooks
export function useThemeColors() {
  return useThemeSelector(theme => theme.colors)
}

export function useThemeTypography() {
  return useThemeSelector(theme => theme.typography)
}

export function useThemeSpacing() {
  return useThemeSelector(theme => theme.spacing)
}

export function useThemeComponents() {
  return useThemeSelector(theme => theme.components)
}

export function useThemeBreakpoints() {
  return useThemeSelector(theme => theme.breakpoints)
}

export function useThemeMode() {
  const { mode, isDark, isLight, isSystem } = useTheme()
  return { mode, isDark, isLight, isSystem }
}

// Theme validation hook
export function useThemeValidation() {
  const { theme } = useTheme()

  const validateTheme = useCallback((testTheme?: ThemeSchema): boolean => {
    const themeToValidate = testTheme || theme

    try {
      // Basic validation
      if (!themeToValidate.id || !themeToValidate.name || !themeToValidate.version) {
        return false
      }

      if (!themeToValidate.colors || !themeToValidate.typography || !themeToValidate.spacing) {
        return false
      }

      if (!themeToValidate.colors.primary?.['500'] || !themeToValidate.colors.background?.primary) {
        return false
      }

      return true
    } catch (error) {
      console.error('Theme validation failed:', error)
      return false
    }
  }, [theme])

  return { validateTheme, isValid: validateTheme() }
}
