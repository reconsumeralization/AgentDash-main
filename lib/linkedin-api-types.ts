/**
 * LinkedIn API Object Types
 * Based on LinkedIn API documentation for object types
 */

// Base Locale interface
export interface Locale {
  country?: string // An uppercase two-letter country code as defined by ISO-3166
  language: string // A lowercase two-letter language code as defined by ISO-639
}

// MultiLocaleString - textual fields with values for multiple locales
export interface MultiLocaleString {
  localized: Record<string, string> // Maps locale to localized version
  preferredLocale?: Locale
}

// MultiLocaleRichText - rich text fields with values for multiple locales
export interface MultiLocaleRichText {
  localized: Record<string, { rawText?: string }>
  preferredLocale?: Locale
}

// MultiLocaleUrl - URL fields with values for multiple locales
export interface MultiLocaleUrl {
  localized: Record<string, string>
  preferredLocale?: Locale
}

// Date object representing day, month, and year
export interface LinkedInDate {
  day?: number // Valid range from 1 to 31 depending on month
  month?: number // Valid range from 1 to 12
  year?: number
}

// LocaleString - textual field with specified locale
export interface LocaleString {
  locale: Locale
  value: string
}

// Video object representing metadata for video content
export interface LinkedInVideo {
  description?: MultiLocaleString
  duration?: number // Duration in milliseconds
  height: number // Height in pixels
  htmlEmbedCode?: string
  title?: MultiLocaleString
  url: string // External URL of the video
  width: number // Width in pixels
}

// Image object representing metadata for image content
export interface LinkedInImage {
  description?: MultiLocaleString
  height: number // Height in pixels
  htmlEmbedCode?: string
  slideShareImage?: string // SlideShareImage URN
  title?: MultiLocaleString
  url: string // External URL of the image
  width: number // Width in pixels
}

// Document object representing metadata for document content
export interface LinkedInDocument {
  description?: MultiLocaleString
  height: number // Height in pixels
  htmlEmbedCode?: string
  slideshow?: string // SlideShareSlideShowUrn
  title?: MultiLocaleString
  url: string // External URL of the document
  width: number // Width in pixels
}

// Link object representing metadata for link content
export interface LinkedInLink {
  description?: MultiLocaleString
  title?: MultiLocaleString
  url: string // External URL of the link
}

// AuditStamp representing metadata of when an object is acted upon
export interface AuditStamp {
  actor: string // URN of the entity that authorized the change
  impersonator?: string // URN of the entity performing the change on behalf of the actor
  time: number // When the event happened in epoch time
}

// Rectangle - abstract rectangle defined by coordinates and dimensions
export interface Rectangle {
  height: number
  width: number
  x: number // X coordinate of the corner
  y: number // Y coordinate of the corner
}

// CroppedImage - image with cropping information
export interface CroppedImage {
  cropped: string // URN location of the cropped image
  original: string // URN location of the original image
  cropInfo: Rectangle // Cropping information
}

// Utility types for working with LinkedIn API objects
export type LinkedInContentType = 'video' | 'image' | 'document' | 'link'
export type LinkedInContent = LinkedInVideo | LinkedInImage | LinkedInDocument | LinkedInLink

// Helper functions for working with LinkedIn API objects
export class LinkedInApiUtils {
  /**
   * Get localized string value with fallback
   */
  static getLocalizedString(
    multiLocaleString: MultiLocaleString | undefined,
    preferredLocale?: string
  ): string {
    if (!multiLocaleString) return ''
    
    const { localized, preferredLocale: defaultLocale } = multiLocaleString
    
    // Try preferred locale first
    if (preferredLocale && localized[preferredLocale]) {
      return localized[preferredLocale]
    }
    
    // Try default preferred locale
    if (defaultLocale) {
      const defaultKey = `${defaultLocale.language}${defaultLocale.country ? `_${defaultLocale.country}` : ''}`
      if (localized[defaultKey]) {
        return localized[defaultKey]
      }
    }
    
    // Fallback to first available value
    const firstKey = Object.keys(localized)[0]
    return firstKey ? localized[firstKey] : ''
  }

  /**
   * Get localized rich text value with fallback
   */
  static getLocalizedRichText(
    multiLocaleRichText: MultiLocaleRichText | undefined,
    preferredLocale?: string
  ): string {
    if (!multiLocaleRichText) return ''
    
    const { localized, preferredLocale: defaultLocale } = multiLocaleRichText
    
    // Try preferred locale first
    if (preferredLocale && localized[preferredLocale]?.rawText) {
      return localized[preferredLocale].rawText
    }
    
    // Try default preferred locale
    if (defaultLocale) {
      const defaultKey = `${defaultLocale.language}${defaultLocale.country ? `_${defaultLocale.country}` : ''}`
      if (localized[defaultKey]?.rawText) {
        return localized[defaultKey].rawText
      }
    }
    
    // Fallback to first available value
    const firstKey = Object.keys(localized)[0]
    return firstKey && localized[firstKey]?.rawText ? localized[firstKey].rawText : ''
  }

  /**
   * Format date object to readable string
   */
  static formatDate(date: LinkedInDate): string {
    if (!date.year) return ''
    
    const parts = []
    if (date.month) parts.push(date.month.toString().padStart(2, '0'))
    if (date.day) parts.push(date.day.toString().padStart(2, '0'))
    parts.push(date.year.toString())
    
    return parts.join('/')
  }

  /**
   * Get content type from LinkedIn content object
   */
  static getContentType(content: LinkedInContent): LinkedInContentType {
    if ('duration' in content) return 'video'
    if ('slideShareImage' in content || 'slideshow' in content) return 'image'
    if ('slideshow' in content) return 'document'
    return 'link'
  }

  /**
   * Extract URN ID from LinkedIn URN
   */
  static extractUrnId(urn: string): string {
    const parts = urn.split(':')
    return parts[parts.length - 1]
  }

  /**
   * Create URN from type and ID
   */
  static createUrn(type: string, id: string): string {
    return `urn:li:${type}:${id}`
  }

  /**
   * Validate LinkedIn date
   */
  static isValidDate(date: LinkedInDate): boolean {
    if (!date.year || date.year < 1900 || date.year > new Date().getFullYear()) {
      return false
    }
    
    if (date.month && (date.month < 1 || date.month > 12)) {
      return false
    }
    
    if (date.day && date.month) {
      const daysInMonth = new Date(date.year, date.month, 0).getDate()
      if (date.day < 1 || date.day > daysInMonth) {
        return false
      }
    }
    
    return true
  }

  /**
   * Get locale string from Locale object
   */
  static getLocaleString(locale: Locale): string {
    return `${locale.language}${locale.country ? `_${locale.country}` : ''}`
  }

  /**
   * Parse locale string to Locale object
   */
  static parseLocaleString(localeString: string): Locale {
    const parts = localeString.split('_')
    return {
      language: parts[0],
      country: parts[1]?.toUpperCase()
    }
  }
}

// Type guards for LinkedIn API objects
export function isLinkedInVideo(content: LinkedInContent): content is LinkedInVideo {
  return 'duration' in content
}

export function isLinkedInImage(content: LinkedInContent): content is LinkedInImage {
  return 'slideShareImage' in content
}

export function isLinkedInDocument(content: LinkedInContent): content is LinkedInDocument {
  return 'slideshow' in content && !('slideShareImage' in content)
}

export function isLinkedInLink(content: LinkedInContent): content is LinkedInLink {
  return !('duration' in content) && !('slideShareImage' in content) && !('slideshow' in content)
}

// Constants for common LinkedIn locales
export const LINKEDIN_LOCALES = {
  EN_US: { language: 'en', country: 'US' },
  EN_GB: { language: 'en', country: 'GB' },
  EN_CA: { language: 'en', country: 'CA' },
  EN_AU: { language: 'en', country: 'AU' },
  FR_FR: { language: 'fr', country: 'FR' },
  DE_DE: { language: 'de', country: 'DE' },
  ES_ES: { language: 'es', country: 'ES' },
  IT_IT: { language: 'it', country: 'IT' },
  PT_BR: { language: 'pt', country: 'BR' },
  JA_JP: { language: 'ja', country: 'JP' },
  KO_KR: { language: 'ko', country: 'KR' },
  ZH_CN: { language: 'zh', country: 'CN' }
} as const

// Common LinkedIn URN types
export const LINKEDIN_URN_TYPES = {
  PERSON: 'person',
  ORGANIZATION: 'organization',
  COMPANY: 'company',
  SCHOOL: 'school',
  GROUP: 'group',
  POST: 'post',
  COMMENT: 'comment',
  SHARE: 'share',
  VIDEO: 'video',
  IMAGE: 'image',
  DOCUMENT: 'document',
  LINK: 'link'
} as const
