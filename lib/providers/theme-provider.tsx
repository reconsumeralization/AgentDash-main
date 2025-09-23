"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ThemeServiceImpl, useThemeManager, type ThemeConfig } from '../theme-examples'

interface ThemeContextType {
  theme: ThemeConfig | null
  setTheme: (themeName: string) => Promise<void>
  isLoading: boolean
  error: string | null
  availableThemes: string[]
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  defaultDarkMode?: boolean
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'default',
  defaultDarkMode = false 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(defaultDarkMode)
  const [availableThemes, setAvailableThemes] = useState<string[]>([])

  const themeManager = useThemeManager()

  // Load available themes
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const themes = await themeManager.getAvailableThemes()
        setAvailableThemes(themes)
      } catch (err) {
        console.error('Failed to load themes:', err)
      }
    }

    loadThemes()
  }, [themeManager])

  // Load initial theme
  useEffect(() => {
    const loadInitialTheme = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const initialTheme = await themeManager.getTheme(defaultTheme)
        setThemeState(initialTheme)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load theme')
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialTheme()
  }, [themeManager, defaultTheme])

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const setTheme = useCallback(async (themeName: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const newTheme = await themeManager.getTheme(themeName)
      setThemeState(newTheme)
      
      // Apply theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', themeName)
        document.documentElement.setAttribute('data-dark-mode', isDarkMode.toString())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set theme')
    } finally {
      setIsLoading(false)
    }
  }, [themeManager, isDarkMode])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  // Apply theme and dark mode to document
  useEffect(() => {
    if (theme && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.name)
      document.documentElement.setAttribute('data-dark-mode', isDarkMode.toString())
      
      // Apply CSS custom properties
      if (theme.colors) {
        Object.entries(theme.colors).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--color-${key}`, value)
        })
      }
    }
  }, [theme, isDarkMode])

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    isLoading,
    error,
    availableThemes,
    isDarkMode,
    toggleDarkMode
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Convenience hook for theme colors
export function useThemeColors() {
  const { theme, isDarkMode } = useTheme()
  
  const getColor = useCallback((colorName: string) => {
    if (!theme?.colors) return undefined
    
    const color = theme.colors[colorName]
    if (typeof color === 'string') return color
    
    // Handle color objects with light/dark variants
    if (typeof color === 'object' && color !== null) {
      return isDarkMode ? color.dark : color.light
    }
    
    return undefined
  }, [theme, isDarkMode])

  return {
    getColor,
    colors: theme?.colors,
    isDarkMode
  }
}
