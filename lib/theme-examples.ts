/**
 * 🎨 Theme System Examples Following TypeScript Best Practices
 * Demonstrates the conceptual and practical approach from the LinkedIn article
 * https://www.linkedin.com/pulse/types-interfaces-typescript-conceptual-practical-approach-nunes-tew6f/
 */

import {
  ThemeSchema,
  ThemeOverride,
  ThemeMode,
  ThemeCategory,
  ThemeColor,
  ColorScale,
  ThemeWithMode,
  assertThemeMode,
  assertThemeCategory,
  isThemeMode,
  isThemeCategory
} from './theme-schema'
import { themes } from './themes'

// Example 1: Using Interfaces for Object Structures (Article Recommendation)
// Interfaces are perfect for defining the shape of objects and enforcing contracts
interface ThemeService {
  getTheme(id: string): ThemeSchema | undefined
  createTheme(theme: Omit<ThemeSchema, 'id'>): ThemeSchema
  updateTheme(id: string, updates: ThemeOverride): ThemeSchema
  deleteTheme(id: string): boolean
}

interface ThemeRepository {
  findById(id: string): Promise<ThemeSchema | null>
  findByCategory(category: ThemeCategory): Promise<ThemeSchema[]>
  save(theme: ThemeSchema): Promise<ThemeSchema>
  delete(id: string): Promise<boolean>
}

// Example 2: Using Types for Flexibility and Composition (Article Recommendation)
// Types allow union and intersection operations for complex logic
type ThemeFilter = {
  category?: ThemeCategory
  mode?: ThemeMode
  tags?: string[]
  accessibility?: {
    contrast?: 'standard' | 'high' | 'low'
    motion?: 'enabled' | 'reduced' | 'disabled'
  }
}

type ThemeSearchCriteria = ThemeFilter & {
  query?: string
  sortBy?: 'name' | 'created' | 'updated'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Example 3: Combining Types and Interfaces for Services (Article Pattern)
// Following the Angular service pattern from the article
interface ThemeManager {
  // Interface for consistent structure
  getCurrentTheme(): ThemeWithMode
  setTheme(theme: ThemeSchema): void
  updateTheme(updates: ThemeOverride): void

  // Type-based flexibility for complex operations
  searchThemes(criteria: ThemeSearchCriteria): Promise<ThemeSchema[]>
  createCustomTheme(baseColor: string, options: CustomThemeOptions): ThemeSchema
}

type CustomThemeOptions = {
  name: string
  category?: ThemeCategory
  mode?: ThemeMode
  description?: string
}

// Example 4: React Component Props with Type Composition (Article Pattern)
// Following the React props pattern from the article
interface ThemeSwitcherProps {
  currentTheme: ThemeSchema
  availableThemes: ThemeSchema[]
  onThemeChange: (theme: ThemeSchema) => void
  onModeChange: (mode: ThemeMode) => void
}

// Using intersection types for enhanced props
type AdvancedThemeSwitcherProps = ThemeSwitcherProps & {
  showPreview?: boolean
  allowCustomCreation?: boolean
  onCustomThemeCreate?: (options: CustomThemeOptions) => void
}

// Example 5: Service Implementation Following Article Patterns
class ThemeServiceImpl implements ThemeManager {
  private currentTheme: ThemeWithMode
  private repository: ThemeRepository

  constructor(repository: ThemeRepository, initialTheme: ThemeSchema) {
    this.repository = repository
    this.currentTheme = { ...initialTheme, mode: initialTheme.mode as ThemeMode }
  }

  // Interface implementation for consistent structure
  getCurrentTheme(): ThemeWithMode {
    return this.currentTheme
  }

  setTheme(theme: ThemeSchema): void {
    this.currentTheme = { ...theme, mode: theme.mode as ThemeMode }
  }

  updateTheme(updates: ThemeOverride): void {
    this.currentTheme = { ...this.currentTheme, ...updates }
  }

  // Type-based implementation for flexible logic
  async searchThemes(criteria: ThemeSearchCriteria): Promise<ThemeSchema[]> {
    // Complex filtering logic using type composition
    const results = await this.repository.findByCategory(criteria.category || 'professional')

    return results.filter(theme => {
      // Type-safe filtering using union types
      if (criteria.mode && theme.mode !== criteria.mode) return false
      if (criteria.tags && !criteria.tags.some(tag => theme.metadata.tags.includes(tag))) return false
      if (criteria.query && !theme.name.toLowerCase().includes(criteria.query.toLowerCase())) return false

      return true
    })
  }

  createCustomTheme(baseColor: string, options: CustomThemeOptions): ThemeSchema {
    // Using type assertions for runtime validation (Article pattern)
    const category = assertThemeCategory(options.category || 'custom')

    // Generate theme based on type composition
    const customTheme: ThemeSchema = {
      id: `custom-${Date.now()}`,
      name: options.name,
      version: '1.0.0',
      mode: options.mode || 'light',
      colors: this.generateColorScheme(baseColor),
      typography: themes.professional.typography, // Reuse existing interface
      spacing: themes.professional.spacing,
      borderRadius: themes.professional.borderRadius,
      shadows: themes.professional.shadows,
      animation: themes.professional.animation,
      components: themes.professional.components,
      breakpoints: themes.professional.breakpoints,
      zIndex: themes.professional.zIndex,
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: ['custom', category],
        category,
        accessibility: {
          contrast: 'standard',
          motion: 'enabled'
        }
      }
    }

    return customTheme
  }

  private generateColorScheme(baseColor: string): ThemeSchema['colors'] {
    // Implementation using type-safe color generation
    const baseTheme = themes.professional
    return {
      ...baseTheme.colors,
      primary: this.createColorScale(baseColor)
    }
  }

  private createColorScale(baseColor: string): ThemeColor {
    // Type-safe color scale creation using ColorScale union type
    const scale: Partial<ThemeColor> = {}

    // Generate color variations (simplified example)
    const scales: ColorScale[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

    scales.forEach(scaleKey => {
      scale[scaleKey] = this.adjustColorBrightness(baseColor, parseInt(scaleKey) / 500 - 1)
    })

    return scale as ThemeColor
  }

  private adjustColorBrightness(color: string, factor: number): string {
    // Simplified color adjustment (would use a proper color library in production)
    return color // Placeholder implementation
  }
}

// Example 6: React Hook with Type Composition (Article Pattern)
function useThemeManager() {
  // Using intersection types for complex hook return
  return {
    currentTheme: themes.professional,
    availableThemes: Object.values(themes),
    searchThemes: (criteria: ThemeSearchCriteria) => {
      // Implementation using type composition
      return Object.values(themes).filter(theme => {
        if (criteria.category && theme.metadata.category !== criteria.category) return false
        if (criteria.mode && theme.mode !== criteria.mode) return false
        if (criteria.query && !theme.name.toLowerCase().includes(criteria.query.toLowerCase())) return false
        return true
      })
    },
    createCustomTheme: (baseColor: string, options: CustomThemeOptions) => {
      // Type-safe theme creation
      return new ThemeServiceImpl({} as ThemeRepository, themes.professional)
        .createCustomTheme(baseColor, options)
    }
  }
}

// Example 7: API Response Types (Following Article's Next.js Pattern)
interface ThemeApiResponse {
  success: boolean
  data?: ThemeSchema
  themes?: ThemeSchema[]
  error?: string
  timestamp: string
}

// Using union types for different response states
type ThemeApiResult = ThemeApiResponse & (
  | { success: true; data: ThemeSchema }
  | { success: false; error: string }
)

// Example 8: Component State with Type Composition (Article Pattern)
interface ThemeEditorState {
  selectedTheme: ThemeSchema | null
  isEditing: boolean
  hasChanges: boolean
  lastSaved?: Date
}

// Using intersection for enhanced state
type AdvancedThemeEditorState = ThemeEditorState & {
  previewMode: boolean
  autoSave: boolean
  collaborators: string[]
}

// Example 9: Configuration Types with Union Types
type ThemeConfig = {
  defaultTheme: ThemeSchema['id']
  enableSystemTheme: boolean
  persistTheme: boolean
  allowedCategories?: ThemeCategory[]
} & ({
  persistTheme: true
  storageKey: string
} | {
  persistTheme: false
})

// Example 10: Error Handling with Union Types
type ThemeError =
  | { type: 'NOT_FOUND'; themeId: string }
  | { type: 'VALIDATION_ERROR'; errors: string[] }
  | { type: 'PERMISSION_DENIED'; operation: string }
  | { type: 'NETWORK_ERROR'; message: string }

// Type guard for error handling
function isThemeError(error: unknown): error is ThemeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as any).type === 'string'
  )
}

// Example 11: Factory Pattern with Types (Article's Design Pattern Example)
type ThemeFactoryConfig = {
  baseTheme: ThemeSchema
  overrides?: ThemeOverride
  mode?: ThemeMode
}

class ThemeFactory {
  static create(config: ThemeFactoryConfig): ThemeSchema {
    const { baseTheme, overrides = {}, mode } = config

    return {
      ...baseTheme,
      ...overrides,
      mode: mode || baseTheme.mode,
      id: overrides.id || `${baseTheme.id}-variant-${Date.now()}`,
      metadata: {
        ...baseTheme.metadata,
        ...overrides.metadata,
        updated: new Date().toISOString()
      }
    }
  }

  static createFromColor(baseColor: string, config: Omit<ThemeFactoryConfig, 'baseTheme'>): ThemeSchema {
    const baseTheme = themes.professional
    return this.create({ ...config, baseTheme })
  }
}

// Export all examples for use in components
export {
  type ThemeService,
  type ThemeRepository,
  type ThemeFilter,
  type ThemeSearchCriteria,
  type ThemeManager,
  type CustomThemeOptions,
  type ThemeSwitcherProps,
  type AdvancedThemeSwitcherProps,
  ThemeServiceImpl,
  useThemeManager,
  type ThemeApiResponse,
  type ThemeApiResult,
  type ThemeEditorState,
  type AdvancedThemeEditorState,
  type ThemeConfig,
  type ThemeError,
  isThemeError,
  ThemeFactory,
  type ThemeFactoryConfig
}
