"use client"

import React from 'react'
import { ContextSurfacerProvider } from '../context-provider'
import { ThemeProvider } from './theme-provider'
import { ApiProvider } from './api-provider'
import { NotificationProvider } from './notification-provider'

interface AppProviderProps {
  children: React.ReactNode
  initialUserContext?: any
  initialAgenticContext?: any
  initialUseCaseContext?: any
  themeConfig?: {
    defaultTheme?: string
    defaultDarkMode?: boolean
  }
  apiConfig?: {
    baseUrl?: string
    timeout?: number
    retries?: number
    retryDelay?: number
  }
}

export function AppProvider({ 
  children, 
  initialUserContext,
  initialAgenticContext,
  initialUseCaseContext,
  themeConfig,
  apiConfig
}: AppProviderProps) {
  return (
    <ContextSurfacerProvider
      initialUserContext={initialUserContext}
      initialAgenticContext={initialAgenticContext}
      initialUseCaseContext={initialUseCaseContext}
    >
      <ThemeProvider
        defaultTheme={themeConfig?.defaultTheme}
        defaultDarkMode={themeConfig?.defaultDarkMode}
      >
        <ApiProvider config={apiConfig}>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ApiProvider>
      </ThemeProvider>
    </ContextSurfacerProvider>
  )
}

// Convenience hook to access all providers
export function useApp() {
  return {
    // Context surfacer hooks
    useUserContext: () => {
      const { useContextSurfacer } = require('../context-provider')
      return useContextSurfacer()
    },
    
    // Theme hooks
    useTheme: () => {
      const { useTheme } = require('./theme-provider')
      return useTheme()
    },
    
    // API hooks
    useApi: () => {
      const { useApi } = require('./api-provider')
      return useApi()
    },
    
    // Notification hooks
    useNotifications: () => {
      const { useNotifications } = require('./notification-provider')
      return useNotifications()
    }
  }
}
