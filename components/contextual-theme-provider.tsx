"use client"

import React, { useEffect } from 'react'
import { useContextSurfacer } from '@/lib'

interface ContextualThemeProviderProps {
  children: React.ReactNode
}

export function ContextualThemeProvider({ children }: ContextualThemeProviderProps) {
  const { adaptiveState } = useContextSurfacer()

  useEffect(() => {
    if (!adaptiveState?.contextualTheme) return

    const theme = adaptiveState.contextualTheme
    
    // Apply CSS custom properties
    const root = document.documentElement
    root.style.setProperty('--context-primary', theme.primaryColor)
    root.style.setProperty('--context-secondary', theme.secondaryColor)
    root.style.setProperty('--context-accent', theme.accentColor)
    root.style.setProperty('--context-background', theme.backgroundColor)
    root.style.setProperty('--context-text', theme.textColor)
    root.style.setProperty('--context-border', theme.borderColor)

    // Apply custom CSS if provided
    if (theme.customCSS) {
      let styleElement = document.getElementById('contextual-theme-styles')
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = 'contextual-theme-styles'
        document.head.appendChild(styleElement)
      }
      styleElement.textContent = theme.customCSS
    }

    // Update favicon if provided
    if (theme.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
      }
      favicon.href = theme.faviconUrl
    }

    // Update page title with context
    const originalTitle = document.title
    document.title = `${theme.name} - ${originalTitle}`

    // Apply layout-specific classes
    document.body.className = document.body.className.replace(/context-layout-\w+/g, '')
    document.body.classList.add(`context-layout-${theme.layoutStyle}`)
    document.body.classList.add(`context-component-${theme.componentStyle}`)
    document.body.classList.add(`context-icons-${theme.iconSet}`)

    // Cleanup function
    return () => {
      // Reset to default theme
      root.style.removeProperty('--context-primary')
      root.style.removeProperty('--context-secondary')
      root.style.removeProperty('--context-accent')
      root.style.removeProperty('--context-background')
      root.style.removeProperty('--context-text')
      root.style.removeProperty('--context-border')
      
      // Remove custom styles
      const styleElement = document.getElementById('contextual-theme-styles')
      if (styleElement) {
        styleElement.remove()
      }
      
      // Reset title
      document.title = originalTitle
      
      // Remove layout classes
      document.body.className = document.body.className.replace(/context-layout-\w+/g, '')
      document.body.className = document.body.className.replace(/context-component-\w+/g, '')
      document.body.className = document.body.className.replace(/context-icons-\w+/g, '')
    }
  }, [adaptiveState?.contextualTheme])

  return <>{children}</>
}

// Context-aware component wrapper
export function ContextualComponent({ 
  children, 
  className = '',
  ...props 
}: { 
  children: React.ReactNode
  className?: string
  [key: string]: any 
}) {
  const { adaptiveState } = useContextSurfacer()
  
  if (!adaptiveState?.contextualTheme) {
    return <div className={className} {...props}>{children}</div>
  }

  const theme = adaptiveState.contextualTheme
  const themeClasses = {
    'linkedin': 'linkedin-theme',
    'devops': 'devops-theme', 
    'security': 'security-theme',
    'development': 'development-theme',
    'hybrid': 'hybrid-theme'
  }

  return (
    <div 
      className={`${themeClasses[theme.layoutStyle] || ''} ${className}`}
      style={{
        '--context-primary': theme.primaryColor,
        '--context-secondary': theme.secondaryColor,
        '--context-accent': theme.accentColor,
        '--context-background': theme.backgroundColor,
        '--context-text': theme.textColor,
        '--context-border': theme.borderColor,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
}
