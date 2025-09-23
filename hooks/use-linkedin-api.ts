import { useState, useCallback, useMemo } from 'react'
import { 
  LinkedInApiUtils, 
  MultiLocaleString, 
  MultiLocaleRichText, 
  LinkedInDate,
  LinkedInContent,
  LinkedInContentType,
  Locale,
  LINKEDIN_LOCALES
} from '../lib/linkedin-api-types'

interface UseLinkedInApiOptions {
  preferredLocale?: string
  fallbackLocale?: string
}

export function useLinkedInApi(options: UseLinkedInApiOptions = {}) {
  const { preferredLocale, fallbackLocale = 'en_US' } = options

  // Get current user's locale
  const getUserLocale = useCallback((): string => {
    if (preferredLocale) return preferredLocale
    
    if (typeof window !== 'undefined' && window.navigator) {
      const locale = window.navigator.language
      return locale.replace('-', '_')
    }
    
    return fallbackLocale
  }, [preferredLocale, fallbackLocale])

  // Get localized string with fallback
  const getLocalizedString = useCallback((multiLocaleString: MultiLocaleString | undefined): string => {
    const userLocale = getUserLocale()
    return LinkedInApiUtils.getLocalizedString(multiLocaleString, userLocale)
  }, [getUserLocale])

  // Get localized rich text with fallback
  const getLocalizedRichText = useCallback((multiLocaleRichText: MultiLocaleRichText | undefined): string => {
    const userLocale = getUserLocale()
    return LinkedInApiUtils.getLocalizedRichText(multiLocaleRichText, userLocale)
  }, [getUserLocale])

  // Format LinkedIn date
  const formatDate = useCallback((date: LinkedInDate): string => {
    return LinkedInApiUtils.formatDate(date)
  }, [])

  // Get content type
  const getContentType = useCallback((content: LinkedInContent): LinkedInContentType => {
    return LinkedInApiUtils.getContentType(content)
  }, [])

  // Extract URN ID
  const extractUrnId = useCallback((urn: string): string => {
    return LinkedInApiUtils.extractUrnId(urn)
  }, [])

  // Create URN
  const createUrn = useCallback((type: string, id: string): string => {
    return LinkedInApiUtils.createUrn(type, id)
  }, [])

  // Validate date
  const isValidDate = useCallback((date: LinkedInDate): boolean => {
    return LinkedInApiUtils.isValidDate(date)
  }, [])

  return {
    getLocalizedString,
    getLocalizedRichText,
    formatDate,
    getContentType,
    extractUrnId,
    createUrn,
    isValidDate,
    getUserLocale
  }
}

// Hook for managing LinkedIn content
export function useLinkedInContent(initialContent?: LinkedInContent[]) {
  const [content, setContent] = useState<LinkedInContent[]>(initialContent || [])
  const { getContentType, getLocalizedString, getLocalizedRichText } = useLinkedInApi()

  // Filter content by type
  const filterByType = useCallback((type: LinkedInContentType) => {
    return content.filter(item => getContentType(item) === type)
  }, [content, getContentType])

  // Get content statistics
  const stats = useMemo(() => {
    const typeCounts = content.reduce((acc, item) => {
      const type = getContentType(item)
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<LinkedInContentType, number>)

    return {
      total: content.length,
      byType: typeCounts,
      videos: typeCounts.video || 0,
      images: typeCounts.image || 0,
      documents: typeCounts.document || 0,
      links: typeCounts.link || 0
    }
  }, [content, getContentType])

  // Add content
  const addContent = useCallback((newContent: LinkedInContent) => {
    setContent(prev => [...prev, newContent])
  }, [])

  // Remove content
  const removeContent = useCallback((index: number) => {
    setContent(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Update content
  const updateContent = useCallback((index: number, updatedContent: LinkedInContent) => {
    setContent(prev => prev.map((item, i) => i === index ? updatedContent : item))
  }, [])

  // Clear all content
  const clearContent = useCallback(() => {
    setContent([])
  }, [])

  return {
    content,
    setContent,
    filterByType,
    stats,
    addContent,
    removeContent,
    updateContent,
    clearContent,
    getLocalizedString,
    getLocalizedRichText
  }
}

// Hook for LinkedIn localization
export function useLinkedInLocalization() {
  const [currentLocale, setCurrentLocale] = useState<Locale>(LINKEDIN_LOCALES.EN_US)
  const { getLocalizedString, getLocalizedRichText } = useLinkedInApi({
    preferredLocale: LinkedInApiUtils.getLocaleString(currentLocale)
  })

  // Change locale
  const changeLocale = useCallback((locale: Locale) => {
    setCurrentLocale(locale)
  }, [])

  // Get available locales
  const availableLocales = useMemo(() => Object.values(LINKEDIN_LOCALES), [])

  // Get locale display name
  const getLocaleDisplayName = useCallback((locale: Locale): string => {
    const localeString = LinkedInApiUtils.getLocaleString(locale)
    const displayNames = {
      'en_US': 'English (US)',
      'en_GB': 'English (UK)',
      'en_CA': 'English (Canada)',
      'en_AU': 'English (Australia)',
      'fr_FR': 'Français (France)',
      'de_DE': 'Deutsch (Deutschland)',
      'es_ES': 'Español (España)',
      'it_IT': 'Italiano (Italia)',
      'pt_BR': 'Português (Brasil)',
      'ja_JP': '日本語 (日本)',
      'ko_KR': '한국어 (대한민국)',
      'zh_CN': '中文 (中国)'
    }
    return displayNames[localeString as keyof typeof displayNames] || localeString
  }, [])

  return {
    currentLocale,
    changeLocale,
    availableLocales,
    getLocaleDisplayName,
    getLocalizedString,
    getLocalizedRichText
  }
}
