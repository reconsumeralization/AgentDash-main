import type { ThemeConfig } from './types'

// Light theme configuration
export const lightTheme: ThemeConfig = {
  name: 'light',
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    background: '#ffffff',
    foreground: '#111827',
    muted: '#f9fafb',
    border: '#e5e7eb',
    destructive: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b'
  },
  fonts: {
    sans: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'GeistMono, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
}

// Dark theme configuration
export const darkTheme: ThemeConfig = {
  name: 'dark',
  colors: {
    primary: '#60a5fa',
    secondary: '#9ca3af',
    accent: '#fbbf24',
    background: '#111827',
    foreground: '#f9fafb',
    muted: '#1f2937',
    border: '#374151',
    destructive: '#f87171',
    success: '#34d399',
    warning: '#fbbf24'
  },
  fonts: {
    sans: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'GeistMono, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)'
  }
}

// Professional theme for business contexts
export const professionalTheme: ThemeConfig = {
  name: 'professional',
  colors: {
    primary: '#1e40af',
    secondary: '#64748b',
    accent: '#059669',
    background: '#fafafa',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    border: '#cbd5e1',
    destructive: '#dc2626',
    success: '#16a34a',
    warning: '#d97706'
  },
  fonts: {
    sans: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'GeistMono, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
}

// Available themes
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  professional: professionalTheme
} as const

export type ThemeName = keyof typeof themes

// Get theme by name
export function getTheme(name: ThemeName): ThemeConfig {
  return themes[name]
}

// Generate CSS custom properties from theme
export function generateThemeCSS(theme: ThemeConfig): string {
  const cssVars: string[] = []

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars.push(`--color-${key}: ${value}`)
  })

  // Fonts
  Object.entries(theme.fonts).forEach(([key, value]) => {
    cssVars.push(`--font-${key}: ${value}`)
  })

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars.push(`--space-${key}: ${value}`)
  })

  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    cssVars.push(`--radius-${key}: ${value}`)
  })

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    cssVars.push(`--shadow-${key}: ${value}`)
  })

  return `:root {\n${cssVars.map(v => `  ${v};`).join('\n')}\n}`
}
