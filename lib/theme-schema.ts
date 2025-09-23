/**
 * 🎨 Comprehensive Theme Schema and Type Definitions
 * Defines the complete theme system with colors, typography, spacing, and component variants
 */

// Type alias for color scales - more flexible than interface for this use case
export type ColorScale = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'

// Union type for better type safety and flexibility
export type ThemeColor = Record<ColorScale, string>

export interface ThemeColors {
  // Primary colors
  primary: ThemeColor
  secondary: ThemeColor
  accent: ThemeColor

  // Semantic colors
  success: ThemeColor
  warning: ThemeColor
  error: ThemeColor
  info: ThemeColor

  // Neutral colors
  gray: ThemeColor
  slate: ThemeColor

  // Surface colors
  background: {
    primary: string
    secondary: string
    tertiary: string
    overlay: string
  }

  // Text colors
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
    muted: string
  }

  // Border colors
  border: {
    light: string
    medium: string
    heavy: string
    focus: string
  }

  // Special colors
  special: {
    gradient: {
      primary: string
      secondary: string
      accent: string
    }
    glow: string
    shadow: string
  }

  // Dropdown colors
  dropdown?: {
    background: string
    color: string
    border: string
    shadow: string
    item: {
      hover: string
      focus: string
    }
  }
}

export interface ThemeTypography {
  fontFamily: {
    sans: string[]
    serif: string[]
    mono: string[]
    display: string[]
  }

  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
  }

  fontWeight: {
    thin: number
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
    extrabold: number
    black: number
  }

  lineHeight: {
    none: number
    tight: number
    snug: number
    normal: number
    relaxed: number
    loose: number
  }

  letterSpacing: {
    tighter: string
    tight: string
    normal: string
    wide: string
    wider: string
    widest: string
  }
}

export interface ThemeSpacing {
  space: {
    0: string
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
    8: string
    10: string
    12: string
    16: string
    20: string
    24: string
    32: string
    40: string
    48: string
    56: string
    64: string
    72: string
    80: string
    96: string
  }
}

export interface ThemeBorderRadius {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

export interface ThemeShadows {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
  glow: string
  colored: string
}

export interface ThemeAnimation {
  duration: {
    fastest: string
    fast: string
    normal: string
    slow: string
    slowest: string
  }

  easing: {
    linear: string
    in: string
    out: string
    inOut: string
    bounce: string
  }

  keyframes: {
    spin: string
    ping: string
    pulse: string
    bounce: string
    fadeIn: string
    fadeOut: string
    slideIn: string
    slideOut: string
    scaleIn: string
    scaleOut: string
  }
}

export interface ThemeComponentVariants {
  button: {
    primary: {
      background: string
      color: string
      border: string
      hover: {
        background: string
        color: string
        border: string
      }
      focus: {
        background: string
        color: string
        border: string
        ring: string
      }
    }
    secondary: {
      background: string
      color: string
      border: string
      hover: {
        background: string
        color: string
        border: string
      }
      focus: {
        background: string
        color: string
        border: string
        ring: string
      }
    }
    outline: {
      background: string
      color: string
      border: string
      hover: {
        background: string
        color: string
        border: string
      }
      focus: {
        background: string
        color: string
        border: string
        ring: string
      }
    }
  }

  input: {
    default: {
      background: string
      color: string
      border: string
      placeholder: string
      focus: {
        background: string
        color: string
        border: string
        ring: string
      }
      error: {
        background: string
        color: string
        border: string
        ring: string
      }
    }
  }

  card: {
    default: {
      background: string
      color: string
      border: string
      shadow: string
      hover: {
        background: string
        border: string
        shadow: string
      }
    }
    elevated: {
      background: string
      color: string
      border: string
      shadow: string
      hover: {
        background: string
        border: string
        shadow: string
      }
    }
  }

  modal: {
    backdrop: string
    background: string
    border: string
    shadow: string
  }

  tooltip: {
    background: string
    color: string
    border: string
    shadow: string
  }

  dropdown: {
    background: string
    color: string
    border: string
    shadow: string
    item: {
      hover: string
      focus: string
    }
  }
}

export interface ThemeBreakpoints {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface ThemeZIndex {
  base: number
  dropdown: number
  sticky: number
  fixed: number
  modalBackdrop: number
  modal: number
  popover: number
  tooltip: number
  toast: number
}

export interface ThemeSchema {
  id: string
  name: string
  description?: string
  version: string
  author?: string

  mode: 'light' | 'dark' | 'system'

  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  shadows: ThemeShadows
  animation: ThemeAnimation
  components: ThemeComponentVariants
  breakpoints: ThemeBreakpoints
  zIndex: ThemeZIndex

  // Metadata
  metadata: {
    created: string
    updated: string
    tags: string[]
    category: 'professional' | 'creative' | 'minimal' | 'colorful' | 'custom'
    accessibility: {
      contrast: 'standard' | 'high' | 'low'
      motion: 'enabled' | 'reduced' | 'disabled'
    }
  }
}

// Utility types for theme manipulation

// Theme context types with enhanced utility methods
export interface ThemeContextValue {
  theme: ThemeSchema
  mode: ThemeMode
  setTheme: (theme: ThemeSchema) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  isDark: boolean
  isLight: boolean
  isSystem: boolean
  // Additional utility methods following TypeScript best practices
  updateTheme: (updates: ThemeOverride) => void
  resetTheme: () => void
  getThemeProperty: <T>(path: string) => T | undefined
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeSchema
  defaultMode?: ThemeMode
  storageKey?: string
  enableSystem?: boolean
}

// Theme validation schema for runtime validation
export const themeValidationSchema = {
  type: 'object',
  required: ['id', 'name', 'version', 'mode', 'colors', 'typography', 'spacing'],
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    mode: { type: 'string', enum: ['light', 'dark', 'system'] },
    colors: {
      type: 'object',
      required: ['primary', 'background', 'text', 'border'],
      properties: {
        primary: { type: 'object', required: ['500'] },
        background: { type: 'object', required: ['primary'] },
        text: { type: 'object', required: ['primary'] },
        border: { type: 'object', required: ['light'] }
      }
    },
    typography: {
      type: 'object',
      required: ['fontFamily', 'fontSize', 'fontWeight'],
      properties: {
        fontFamily: { type: 'object', required: ['sans'] },
        fontSize: { type: 'object', required: ['base'] },
        fontWeight: { type: 'object', required: ['normal'] }
      }
    },
    spacing: {
      type: 'object',
      required: ['space'],
      properties: {
        space: { type: 'object', required: ['4'] }
      }
    }
  }
}

// Enhanced type definitions following TypeScript best practices
export type PartialThemeSchema = Partial<ThemeSchema>
export type ThemeOverride = Partial<ThemeSchema>

// Union types for better type safety and composability
export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeCategory = 'professional' | 'creative' | 'minimal' | 'colorful' | 'custom'
export type ContrastLevel = 'standard' | 'high' | 'low'
export type MotionPreference = 'enabled' | 'reduced' | 'disabled'

// Intersection types for theme composition
export type ThemeWithMode = ThemeSchema & { mode: ThemeMode }
export type ThemeWithOverrides = ThemeSchema & ThemeOverride

// Utility types for component props
export type ThemedComponentProps<T = {}> = T & {
  themeVariant?: string
  className?: string
}

// Generic type for theme-aware components
export type ThemeComponent<TProps = {}> = React.ComponentType<ThemedComponentProps<TProps>>

// Type guards following the article's practical approach
export const isThemeMode = (value: string): value is ThemeMode =>
  ['light', 'dark', 'system'].includes(value)

export const isThemeCategory = (value: string): value is ThemeCategory =>
  ['professional', 'creative', 'minimal', 'colorful', 'custom'].includes(value)

// Type assertions for runtime validation
export const assertThemeMode = (value: string): ThemeMode => {
  if (!isThemeMode(value)) {
    throw new Error(`Invalid theme mode: ${value}`)
  }
  return value
}

export const assertThemeCategory = (value: string): ThemeCategory => {
  if (!isThemeCategory(value)) {
    throw new Error(`Invalid theme category: ${value}`)
  }
  return value
}

// Additional types for theme demo and API functionality
export interface ThemeSearchCriteria {
  category?: ThemeCategory
  mode?: ThemeMode
  tags?: string[]
  contrast?: ContrastLevel
  motion?: MotionPreference
  query?: string
  limit?: number
}

export interface ThemeApiResult<T = any> {
  success: boolean
  data?: T
  error?: string | ThemeError
  message?: string
  timestamp?: string
  themes?: T[]
}

export interface ThemeError {
  type: 'validation' | 'runtime' | 'api' | 'unknown' | 'VALIDATION_ERROR' | 'NETWORK_ERROR'
  message: string
  code?: string
  details?: any
  errors?: string[]
}
