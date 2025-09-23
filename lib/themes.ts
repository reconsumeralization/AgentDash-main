/**
 * 🎨 Theme Definitions
 * Comprehensive theme collection with multiple variants
 */

import { ThemeSchema } from './theme-schema'

// Professional Theme - Clean, modern, business-oriented
export const professionalTheme: ThemeSchema = {
  id: 'professional-light',
  name: 'Professional',
  description: 'Clean and professional theme for business applications',
  version: '1.0.0',
  author: 'AgentDash',
  mode: 'light',

  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      overlay: 'rgba(15, 23, 42, 0.8)'
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
      muted: '#94a3b8'
    },
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      heavy: '#94a3b8',
      focus: '#0ea5e9'
    },
    special: {
      gradient: {
        primary: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        secondary: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        accent: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)'
      },
      glow: '0 0 20px rgba(14, 165, 233, 0.3)',
      shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'monospace'],
      display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },

  spacing: {
    space: {
      0: '0px',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem',
      40: '10rem',
      48: '12rem',
      56: '14rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem'
    }
  },

  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
    colored: '0 10px 25px -5px rgba(14, 165, 233, 0.1), 0 10px 10px -5px rgba(14, 165, 233, 0.04)'
  },

  animation: {
    duration: {
      fastest: '150ms',
      fast: '250ms',
      normal: '300ms',
      slow: '500ms',
      slowest: '700ms'
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    keyframes: {
      spin: 'spin 1s linear infinite',
      ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
      fadeIn: 'fadeIn 0.5s ease-in-out',
      fadeOut: 'fadeOut 0.5s ease-in-out',
      slideIn: 'slideIn 0.3s ease-out',
      slideOut: 'slideOut 0.3s ease-in',
      scaleIn: 'scaleIn 0.2s ease-out',
      scaleOut: 'scaleOut 0.2s ease-in'
    }
  },

  components: {
    button: {
      primary: {
        background: '#0ea5e9',
        color: '#ffffff',
        border: 'transparent',
        hover: {
          background: '#0284c7',
          color: '#ffffff',
          border: 'transparent'
        },
        focus: {
          background: '#0284c7',
          color: '#ffffff',
          border: 'transparent',
          ring: '#0ea5e9'
        }
      },
      secondary: {
        background: '#f8fafc',
        color: '#0f172a',
        border: '#e2e8f0',
        hover: {
          background: '#f1f5f9',
          color: '#0f172a',
          border: '#cbd5e1'
        },
        focus: {
          background: '#f1f5f9',
          color: '#0f172a',
          border: '#cbd5e1',
          ring: '#0ea5e9'
        }
      },
      outline: {
        background: 'transparent',
        color: '#0ea5e9',
        border: '#0ea5e9',
        hover: {
          background: '#0ea5e9',
          color: '#ffffff',
          border: '#0ea5e9'
        },
        focus: {
          background: '#0ea5e9',
          color: '#ffffff',
          border: '#0ea5e9',
          ring: '#0ea5e9'
        }
      }
    },
    input: {
      default: {
        background: '#ffffff',
        color: '#0f172a',
        border: '#e2e8f0',
        placeholder: '#94a3b8',
        focus: {
          background: '#ffffff',
          color: '#0f172a',
          border: '#0ea5e9',
          ring: '#0ea5e9'
        },
        error: {
          background: '#ffffff',
          color: '#dc2626',
          border: '#ef4444',
          ring: '#ef4444'
        }
      }
    },
    card: {
      default: {
        background: '#ffffff',
        color: '#0f172a',
        border: '#e2e8f0',
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        hover: {
          background: '#ffffff',
          border: '#cbd5e1',
          shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      },
      elevated: {
        background: '#ffffff',
        color: '#0f172a',
        border: '#e2e8f0',
        shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        hover: {
          background: '#ffffff',
          border: '#cbd5e1',
          shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }
      }
    },
    modal: {
      backdrop: 'rgba(15, 23, 42, 0.5)',
      background: '#ffffff',
      border: '#e2e8f0',
      shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    tooltip: {
      background: '#0f172a',
      color: '#ffffff',
      border: '#334155',
      shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    dropdown: {
      background: '#ffffff',
      color: '#0f172a',
      border: '#e2e8f0',
      shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      item: {
        hover: '#f1f5f9',
        focus: '#e0f2fe'
      }
    }
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080
  },

  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['professional', 'clean', 'business'],
    category: 'professional',
    accessibility: {
      contrast: 'standard',
      motion: 'enabled'
    }
  }
}

// Dark Professional Theme
export const professionalDarkTheme: ThemeSchema = {
  ...professionalTheme,
  id: 'professional-dark',
  name: 'Professional Dark',
  mode: 'dark',
  colors: {
    ...professionalTheme.colors,
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      overlay: 'rgba(15, 23, 42, 0.9)'
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#0f172a',
      muted: '#64748b'
    },
    border: {
      light: '#334155',
      medium: '#475569',
      heavy: '#64748b',
      focus: '#0ea5e9'
    },
    special: {
      gradient: {
        primary: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        secondary: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        accent: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
      },
      glow: '0 0 20px rgba(59, 130, 246, 0.4)',
      shadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
    },
    dropdown: {
      background: '#1e293b',
      color: '#f1f5f9',
      border: '#334155',
      shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
      item: {
        hover: '#334155',
        focus: '#1e293b'
      }
    }
  }
}

// Creative Theme - Vibrant and artistic
export const creativeTheme: ThemeSchema = {
  ...professionalTheme,
  id: 'creative-light',
  name: 'Creative',
  description: 'Vibrant and artistic theme for creative applications',
  colors: {
    ...professionalTheme.colors,
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
      950: '#500724'
    },
    accent: {
      50: '#fef3c7',
      100: '#fde68a',
      200: '#fcd34d',
      300: '#fbbf24',
      400: '#f59e0b',
      500: '#d97706',
      600: '#b45309',
      700: '#92400e',
      800: '#78350f',
      900: '#451a03',
      950: '#451a03'
    },
    special: {
      gradient: {
        primary: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)',
        secondary: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        accent: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)'
      },
      glow: '0 0 20px rgba(236, 72, 153, 0.3)',
      shadow: '0 10px 25px -5px rgba(236, 72, 153, 0.1), 0 10px 10px -5px rgba(236, 72, 153, 0.04)'
    }
  },
  metadata: {
    ...professionalTheme.metadata,
    tags: ['creative', 'vibrant', 'artistic'],
    category: 'creative'
  }
}

// Minimal Theme - Clean and simple
export const minimalTheme: ThemeSchema = {
  ...professionalTheme,
  id: 'minimal-light',
  name: 'Minimal',
  description: 'Clean and simple theme for minimal applications',
  colors: {
    ...professionalTheme.colors,
    primary: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a'
    },
    special: {
      gradient: {
        primary: 'linear-gradient(135deg, #737373 0%, #404040 100%)',
        secondary: 'linear-gradient(135deg, #a3a3a3 0%, #737373 100%)',
        accent: 'linear-gradient(135deg, #404040 0%, #171717 100%)'
      },
      glow: '0 0 20px rgba(115, 115, 115, 0.2)',
      shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }
  },
  shadows: {
    ...professionalTheme.shadows,
    md: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    lg: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    xl: '0 4px 8px 0 rgba(0, 0, 0, 0.05)'
  },
  metadata: {
    ...professionalTheme.metadata,
    tags: ['minimal', 'clean', 'simple'],
    category: 'minimal'
  }
}

// Colorful Theme - Bright and playful
export const colorfulTheme: ThemeSchema = {
  ...professionalTheme,
  id: 'colorful-light',
  name: 'Colorful',
  description: 'Bright and playful theme for colorful applications',
  colors: {
    ...professionalTheme.colors,
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    accent: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    special: {
      gradient: {
        primary: 'linear-gradient(135deg, #ef4444 0%, #22c55e 50%, #3b82f6 100%)',
        secondary: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
        accent: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
      },
      glow: '0 0 20px rgba(239, 68, 68, 0.3)',
      shadow: '0 10px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)'
    }
  },
  metadata: {
    ...professionalTheme.metadata,
    tags: ['colorful', 'bright', 'playful'],
    category: 'colorful'
  }
}

// Export all themes
export const themes = {
  professional: professionalTheme,
  'professional-dark': professionalDarkTheme,
  creative: creativeTheme,
  minimal: minimalTheme,
  colorful: colorfulTheme
} as const

export type ThemeName = keyof typeof themes
export const themeNames = Object.keys(themes) as ThemeName[]

// Default theme
export const defaultTheme = professionalTheme
export const defaultDarkTheme = professionalDarkTheme
