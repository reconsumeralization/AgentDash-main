/**
 * 🎨 Theme Utility Functions and Helpers
 * Comprehensive utilities for working with themes
 */

import { ThemeSchema, ThemeMode, ThemeColor, ThemeOverride, ThemeCategory } from './theme-schema'
import { themes, defaultTheme } from './themes'

// Color manipulation utilities
export class ThemeColorUtils {
  /**
   * Convert hex to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  /**
   * Calculate luminance of a color
   */
  static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color)
    if (!rgb) return 0

    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1)
    const lum2 = this.getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
  }

  /**
   * Check if contrast ratio meets WCAG standards
   */
  static meetsContrastRatio(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(color1, color2)
    return level === 'AAA' ? ratio >= 7 : ratio >= 4.5
  }

  /**
   * Generate a color palette from a base color
   */
  static generatePalette(baseColor: string): Partial<ThemeColor> {
    const rgb = this.hexToRgb(baseColor)
    if (!rgb) return {}

    const { r, g, b } = rgb

    // Simple palette generation (you could use a more sophisticated algorithm)
    return {
      50: this.lightenColor(baseColor, 0.9),
      100: this.lightenColor(baseColor, 0.8),
      200: this.lightenColor(baseColor, 0.6),
      300: this.lightenColor(baseColor, 0.4),
      400: this.lightenColor(baseColor, 0.2),
      500: baseColor,
      600: this.darkenColor(baseColor, 0.2),
      700: this.darkenColor(baseColor, 0.4),
      800: this.darkenColor(baseColor, 0.6),
      900: this.darkenColor(baseColor, 0.8),
      950: this.darkenColor(baseColor, 0.9)
    }
  }

  /**
   * Lighten a color
   */
  static lightenColor(color: string, amount: number): string {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color

    const { r, g, b } = rgb
    const lighten = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount))

    return this.rgbToHex(lighten(r), lighten(g), lighten(b))
  }

  /**
   * Darken a color
   */
  static darkenColor(color: string, amount: number): string {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color

    const { r, g, b } = rgb
    const darken = (c: number) => Math.max(0, Math.round(c * (1 - amount)))

    return this.rgbToHex(darken(r), darken(g), darken(b))
  }
}

// Theme validation utilities
export class ThemeValidationUtils {
  /**
   * Validate a theme schema
   */
  static validateTheme(theme: ThemeSchema): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required fields
    if (!theme.id) errors.push('Theme ID is required')
    if (!theme.name) errors.push('Theme name is required')
    if (!theme.version) errors.push('Theme version is required')
    if (!theme.colors?.primary?.['500']) errors.push('Primary color (500) is required')
    if (!theme.colors?.background?.primary) errors.push('Background primary color is required')
    if (!theme.colors?.text?.primary) errors.push('Text primary color is required')

    // Color contrast validation
    if (theme.colors?.text?.primary && theme.colors?.background?.primary) {
      const contrast = ThemeColorUtils.getContrastRatio(
        theme.colors.text.primary,
        theme.colors.background.primary
      )
      if (contrast < 4.5) {
        errors.push('Text contrast ratio should be at least 4.5:1 (WCAG AA)')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate accessibility compliance
   */
  static validateAccessibility(theme: ThemeSchema): {
    isAccessible: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Text contrast checks
    const textContrast = ThemeColorUtils.getContrastRatio(
      theme.colors.text.primary,
      theme.colors.background.primary
    )
    if (textContrast < 4.5) {
      issues.push('Primary text contrast ratio is too low')
      recommendations.push('Increase text color darkness or background color lightness')
    }

    const secondaryTextContrast = ThemeColorUtils.getContrastRatio(
      theme.colors.text.secondary,
      theme.colors.background.primary
    )
    if (secondaryTextContrast < 4.5) {
      issues.push('Secondary text contrast ratio is too low')
      recommendations.push('Adjust secondary text color for better contrast')
    }

    // Focus indicator checks
    if (!theme.colors.border?.focus) {
      issues.push('Focus border color is not defined')
      recommendations.push('Add a focus border color for keyboard navigation')
    }

    // Color blindness considerations
    // Add more accessibility checks as needed

    return {
      isAccessible: issues.length === 0,
      issues,
      recommendations
    }
  }
}

// Theme merging and manipulation utilities
export class ThemeManipulationUtils {
  /**
   * Deep merge two theme objects
   */
  static mergeThemes(baseTheme: ThemeSchema, overrides: ThemeOverride): ThemeSchema {
    return {
      ...baseTheme,
      ...overrides,
      colors: {
        ...baseTheme.colors,
        ...overrides.colors,
        primary: { ...baseTheme.colors.primary, ...overrides.colors?.primary },
        secondary: { ...baseTheme.colors.secondary, ...overrides.colors?.secondary },
        accent: { ...baseTheme.colors.accent, ...overrides.colors?.accent },
        background: { ...baseTheme.colors.background, ...overrides.colors?.background },
        text: { ...baseTheme.colors.text, ...overrides.colors?.text },
        border: { ...baseTheme.colors.border, ...overrides.colors?.border },
        special: {
          ...baseTheme.colors.special,
          ...overrides.colors?.special,
          gradient: { ...baseTheme.colors.special?.gradient, ...overrides.colors?.special?.gradient }
        }
      },
      typography: {
        ...baseTheme.typography,
        ...overrides.typography,
        fontFamily: { ...baseTheme.typography.fontFamily, ...overrides.typography?.fontFamily },
        fontSize: { ...baseTheme.typography.fontSize, ...overrides.typography?.fontSize },
        fontWeight: { ...baseTheme.typography.fontWeight, ...overrides.typography?.fontWeight },
        lineHeight: { ...baseTheme.typography.lineHeight, ...overrides.typography?.lineHeight },
        letterSpacing: { ...baseTheme.typography.letterSpacing, ...overrides.typography?.letterSpacing }
      },
      spacing: {
        ...baseTheme.spacing,
        ...overrides.spacing,
        space: { ...baseTheme.spacing.space, ...overrides.spacing?.space }
      },
      components: {
        ...baseTheme.components,
        ...overrides.components
      }
    }
  }

  /**
   * Create a theme variant
   */
  static createThemeVariant(
    baseTheme: ThemeSchema,
    name: string,
    overrides: ThemeOverride
  ): ThemeSchema {
    const merged = this.mergeThemes(baseTheme, overrides)

    return {
      ...merged,
      id: `${baseTheme.id}-variant-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${baseTheme.name} (${name})`,
      version: baseTheme.version,
      metadata: {
        ...baseTheme.metadata,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: [...(baseTheme.metadata.tags || []), 'variant']
      }
    }
  }

  /**
   * Generate theme from color palette
   */
  static generateThemeFromColors(
    name: string,
    primaryColor: string,
    options: {
      mode?: 'light' | 'dark'
      category?: ThemeCategory
      description?: string
    } = {}
  ): ThemeSchema {
    const palette = ThemeColorUtils.generatePalette(primaryColor)
    const baseTheme = options.mode === 'dark' ? themes['professional-dark'] : themes.professional

    return this.mergeThemes(baseTheme, {
      id: `generated-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      description: options.description || `Generated theme based on ${primaryColor}`,
      mode: options.mode || 'light',
      colors: {
        primary: palette as ThemeColor,
        secondary: palette as ThemeColor,
        accent: palette as ThemeColor,
        success: palette as ThemeColor,
        warning: palette as ThemeColor,
        error: palette as ThemeColor,
        info: palette as ThemeColor,
        gray: palette as ThemeColor,
        slate: palette as ThemeColor,
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          overlay: 'rgba(0, 0, 0, 0.5)'
        },
        text: {
          primary: '#1e293b',
          secondary: '#475569',
          tertiary: '#64748b',
          inverse: '#ffffff',
          muted: '#94a3b8'
        },
        border: {
          light: '#e2e8f0',
          medium: '#cbd5e1',
          heavy: '#94a3b8',
          focus: palette[500] || primaryColor
        },
        special: {
          gradient: {
            primary: `linear-gradient(135deg, ${palette[500] || primaryColor}, ${palette[600] || primaryColor})`,
            secondary: `linear-gradient(135deg, ${palette[400] || primaryColor}, ${palette[500] || primaryColor})`,
            accent: `linear-gradient(135deg, ${palette[300] || primaryColor}, ${palette[400] || primaryColor})`
          },
          glow: `0 0 20px ${palette[500] || primaryColor}40`,
          shadow: `0 4px 6px ${palette[500] || primaryColor}20`
        }
      },
      metadata: {
        ...baseTheme.metadata,
        category: options.category || 'custom',
        tags: ['generated', 'custom']
      }
    })
  }
}

// Theme export/import utilities
export class ThemeExportUtils {
  /**
   * Export theme to JSON
   */
  static exportTheme(theme: ThemeSchema): string {
    return JSON.stringify(theme, null, 2)
  }

  /**
   * Import theme from JSON
   */
  static importTheme(jsonString: string): ThemeSchema | null {
    try {
      const theme = JSON.parse(jsonString) as ThemeSchema
      const validation = ThemeValidationUtils.validateTheme(theme)

      if (validation.isValid) {
        return theme
      } else {
        console.error('Theme validation failed:', validation.errors)
        return null
      }
    } catch (error) {
      console.error('Failed to parse theme JSON:', error)
      return null
    }
  }

  /**
   * Export theme as CSS custom properties
   */
  static exportThemeAsCSS(theme: ThemeSchema): string {
    const cssVars: string[] = []

    // Colors
    Object.entries(theme.colors).forEach(([category, values]) => {
      if (typeof values === 'object' && values !== null) {
        Object.entries(values).forEach(([key, value]) => {
          if (typeof value === 'string') {
            cssVars.push(`  --color-${category}-${key}: ${value};`)
          } else if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              cssVars.push(`  --color-${category}-${key}-${subKey}: ${subValue};`)
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
            cssVars.push(`  --typography-${category}-${key}: ${value};`)
          } else if (Array.isArray(value)) {
            cssVars.push(`  --typography-${category}-${key}: ${value.map(v => `"${v}"`).join(', ')};`)
          } else if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              cssVars.push(`  --typography-${category}-${key}-${subKey}: ${subValue};`)
            })
          }
        })
      }
    })

    return `:root {\n${cssVars.join('\n')}\n}`
  }

  /**
   * Export theme for different platforms
   */
  static exportForPlatform(theme: ThemeSchema, platform: 'web' | 'react-native' | 'flutter'): any {
    switch (platform) {
      case 'web':
        return this.exportThemeAsCSS(theme)
      case 'react-native':
        return this.exportForReactNative(theme)
      case 'flutter':
        return this.exportForFlutter(theme)
      default:
        return this.exportTheme(theme)
    }
  }

  private static exportForReactNative(theme: ThemeSchema): any {
    // Convert to React Native style format
    return {
      colors: {
        primary: theme.colors.primary[500],
        secondary: theme.colors.secondary[500],
        background: theme.colors.background.primary,
        text: theme.colors.text.primary,
        // Add more mappings as needed
      },
      typography: {
        fontSize: theme.typography.fontSize,
        fontWeight: theme.typography.fontWeight,
        // Add more mappings
      }
    }
  }

  private static exportForFlutter(theme: ThemeSchema): any {
    // Convert to Flutter theme format
    return {
      brightness: theme.mode === 'dark' ? 'dark' : 'light',
      primaryColor: theme.colors.primary[500],
      backgroundColor: theme.colors.background.primary,
      // Add more Flutter theme properties
    }
  }
}

// Theme performance utilities
export class ThemePerformanceUtils {
  /**
   * Optimize theme for performance by removing unused properties
   */
  static optimizeTheme(theme: ThemeSchema, usedProperties: string[]): ThemeSchema {
    // This would analyze which theme properties are actually used
    // and remove unused ones to reduce bundle size
    // Implementation would depend on your build system
    return theme
  }

  /**
   * Generate theme with only essential properties
   */
  static createMinimalTheme(baseTheme: ThemeSchema): ThemeSchema {
    return {
      id: baseTheme.id,
      name: baseTheme.name,
      version: baseTheme.version,
      mode: baseTheme.mode,
      colors: {
        primary: baseTheme.colors.primary,
        secondary: baseTheme.colors.secondary,
        accent: baseTheme.colors.accent,
        success: baseTheme.colors.success,
        warning: baseTheme.colors.warning,
        error: baseTheme.colors.error,
        info: baseTheme.colors.info,
        gray: baseTheme.colors.gray,
        slate: baseTheme.colors.slate,
        background: baseTheme.colors.background,
        text: baseTheme.colors.text,
        border: baseTheme.colors.border,
        special: baseTheme.colors.special
      },
      typography: {
        fontFamily: baseTheme.typography.fontFamily,
        fontSize: baseTheme.typography.fontSize,
        fontWeight: baseTheme.typography.fontWeight,
        lineHeight: baseTheme.typography.lineHeight,
        letterSpacing: baseTheme.typography.letterSpacing
      },
      spacing: baseTheme.spacing,
      borderRadius: baseTheme.borderRadius,
      shadows: baseTheme.shadows,
      components: baseTheme.components,
      breakpoints: baseTheme.breakpoints,
      zIndex: baseTheme.zIndex,
      animation: baseTheme.animation,
      metadata: baseTheme.metadata
    }
  }

  /**
   * Cache theme for better performance
   */
  static createThemeCache(): Map<string, ThemeSchema> {
    return new Map()
  }
}

// Utility functions for common theme operations
export const themeUtils = {
  // Get theme by name
  getTheme: (name: string): ThemeSchema | undefined => {
    return themes[name as keyof typeof themes]
  },

  // Get all available themes
  getAllThemes: (): ThemeSchema[] => {
    return Object.values(themes)
  },

  // Get themes by category
  getThemesByCategory: (category: ThemeCategory): ThemeSchema[] => {
    return Object.values(themes).filter(theme => theme.metadata.category === category)
  },

  // Get themes by mode
  getThemesByMode: (mode: 'light' | 'dark'): ThemeSchema[] => {
    return Object.values(themes).filter(theme => theme.mode === mode)
  },

  // Get random theme
  getRandomTheme: (): ThemeSchema => {
    const themeList = Object.values(themes)
    return themeList[Math.floor(Math.random() * themeList.length)]
  },

  // Get complementary theme (light/dark opposite)
  getComplementaryTheme: (theme: ThemeSchema): ThemeSchema => {
    if (theme.mode === 'dark') {
      return themes.professional
    }
    return themes['professional-dark']
  }
}

// Export all utilities
export {
  ThemeColorUtils as ColorUtils,
  ThemeValidationUtils as ValidationUtils,
  ThemeManipulationUtils as ManipulationUtils,
  ThemeExportUtils as ExportUtils,
  ThemePerformanceUtils as PerformanceUtils
}
