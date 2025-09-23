"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  useDebounce, 
  useLocalStorage, 
  useMediaQuery, 
  useAsync, 
  useIntersectionObserver,
  usePrevious,
  useToggle,
  useWindowSize,
  useOnline,
  useClipboard,
  useLinkedInApi,
  useLinkedInContent,
  useLinkedInLocalization
} from '@/hooks'
import { 
  useTheme, 
  useApi, 
  useNotifications,
  useToast 
} from '@/lib'
import { 
  MultiLocaleString, 
  LinkedInVideo, 
  LinkedInImage,
  LinkedInApiUtils,
  LINKEDIN_LOCALES 
} from '@/lib/linkedin-api-types'

export function HooksAndProvidersDemo() {
  // Basic hooks demo
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [storedValue, setStoredValue] = useLocalStorage('demo-value', '')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { width, height } = useWindowSize()
  const isOnline = useOnline()
  const { copied, copy, error: copyError } = useClipboard()
  const [isVisible, setIsVisible] = useState(false)
  const [node, entry] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  })
  const [isToggled, { toggle, setTrue, setFalse }] = useToggle(false)
  const prevToggle = usePrevious(isToggled)

  // Async hook demo
  const { data: asyncData, loading: asyncLoading, error: asyncError, execute: fetchData } = useAsync(
    async () => {
      const response = await fetch('/api/demo')
      return response.json()
    },
    { immediate: false }
  )

  // LinkedIn API hooks demo
  const linkedInApi = useLinkedInApi({ preferredLocale: 'en_US' })
  const { content, stats, addContent, removeContent } = useLinkedInContent()
  const { currentLocale, changeLocale, availableLocales, getLocaleDisplayName } = useLinkedInLocalization()

  // Provider hooks demo
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme()
  const { get, post, isLoading: apiLoading } = useApi()
  const { success, error, warning, info } = useToast()

  // Demo LinkedIn content
  const demoVideo: LinkedInVideo = {
    url: 'https://example.com/video.mp4',
    width: 1920,
    height: 1080,
    duration: 60000,
    title: {
      localized: {
        'en_US': 'Demo Video Title',
        'fr_FR': 'Titre de la vidéo de démonstration'
      },
      preferredLocale: LINKEDIN_LOCALES.EN_US
    },
    description: {
      localized: {
        'en_US': 'This is a demo video description',
        'fr_FR': 'Ceci est une description de vidéo de démonstration'
      },
      preferredLocale: LINKEDIN_LOCALES.EN_US
    }
  }

  const demoImage: LinkedInImage = {
    url: 'https://example.com/image.jpg',
    width: 1200,
    height: 630,
    title: {
      localized: {
        'en_US': 'Demo Image Title',
        'fr_FR': 'Titre de l\'image de démonstration'
      },
      preferredLocale: LINKEDIN_LOCALES.EN_US
    }
  }

  // Effects
  useEffect(() => {
    if (debouncedSearchTerm) {
      console.log('Searching for:', debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    if (entry?.isIntersecting) {
      setIsVisible(true)
    }
  }, [entry])

  // Event handlers
  const handleCopyDemo = () => {
    copy('This is a demo text to copy!')
  }

  const handleAddDemoContent = () => {
    addContent(demoVideo)
    success('Demo video added!')
  }

  const handleRemoveContent = (index: number) => {
    removeContent(index)
    warning('Content removed!')
  }

  const handleFetchData = () => {
    fetchData()
  }

  const handleApiCall = async () => {
    try {
      const data = await get('/api/demo')
      info('API call successful!')
    } catch (err) {
      error('API call failed!')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Hooks and Providers Demo</CardTitle>
          <CardDescription>
            Demonstration of all the custom hooks and providers in the codebase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Basic Hooks Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Hooks</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Debounced Search</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to see debouncing..."
                />
                <p className="text-sm text-gray-600 mt-1">
                  Debounced value: {debouncedSearchTerm}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Local Storage</label>
                <Input
                  value={storedValue}
                  onChange={(e) => setStoredValue(e.target.value)}
                  placeholder="This persists in localStorage..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Clipboard</label>
                <Button onClick={handleCopyDemo} variant="outline">
                  {copied ? 'Copied!' : 'Copy Demo Text'}
                </Button>
                {copyError && (
                  <p className="text-sm text-red-600 mt-1">Copy failed: {copyError.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Toggle</label>
                <div className="flex items-center gap-2">
                  <Button onClick={toggle} variant={isToggled ? 'default' : 'outline'}>
                    {isToggled ? 'ON' : 'OFF'}
                  </Button>
                  <Button onClick={setTrue} size="sm" variant="outline">Set True</Button>
                  <Button onClick={setFalse} size="sm" variant="outline">Set False</Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Previous value: {prevToggle ? 'true' : 'false'}
                </p>
              </div>
            </div>
          </div>

          {/* Device Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Device & Environment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Screen Size</p>
                <p className="font-semibold">{width} × {height}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Device Type</p>
                <p className="font-semibold">{isMobile ? 'Mobile' : 'Desktop'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Connection</p>
                <Badge variant={isOnline ? 'default' : 'destructive'}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Visibility</p>
                <Badge variant={isVisible ? 'default' : 'secondary'}>
                  {isVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Async Hook Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Async Operations</h3>
            <div className="flex gap-2">
              <Button onClick={handleFetchData} disabled={asyncLoading}>
                {asyncLoading ? 'Loading...' : 'Fetch Data'}
              </Button>
              <Button onClick={handleApiCall} disabled={apiLoading}>
                {apiLoading ? 'Loading...' : 'API Call'}
              </Button>
            </div>
            {asyncError && (
              <p className="text-sm text-red-600">Error: {asyncError.message}</p>
            )}
            {asyncData && (
              <pre className="text-sm bg-gray-100 p-2 rounded">
                {JSON.stringify(asyncData, null, 2)}
              </pre>
            )}
          </div>

          {/* LinkedIn API Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">LinkedIn API Integration</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Current Locale</label>
              <select 
                value={LinkedInApiUtils.getLocaleString(currentLocale)}
                onChange={(e) => changeLocale(LinkedInApiUtils.parseLocaleString(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {availableLocales.map((locale) => (
                  <option key={LinkedInApiUtils.getLocaleString(locale)} value={LinkedInApiUtils.getLocaleString(locale)}>
                    {getLocaleDisplayName(locale)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Content Management</label>
              <div className="flex gap-2">
                <Button onClick={handleAddDemoContent} size="sm">
                  Add Demo Video
                </Button>
                <Button onClick={() => addContent(demoImage)} size="sm">
                  Add Demo Image
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Content Stats</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Badge variant="outline">Total: {stats.total}</Badge>
                <Badge variant="outline">Videos: {stats.videos}</Badge>
                <Badge variant="outline">Images: {stats.images}</Badge>
                <Badge variant="outline">Documents: {stats.documents}</Badge>
              </div>
            </div>

            {content.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Content List</label>
                <div className="space-y-2">
                  {content.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">
                          {linkedInApi.getLocalizedString(item.title)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {linkedInApi.getContentType(item)}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleRemoveContent(index)} 
                        size="sm" 
                        variant="destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Theme Management</h3>
            <div className="flex items-center gap-4">
              <Button onClick={toggleDarkMode} variant="outline">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
              <p className="text-sm text-gray-600">
                Current theme: {theme?.name || 'Default'}
              </p>
            </div>
          </div>

          {/* Intersection Observer Demo */}
          <div ref={node} className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              This element is being observed for intersection. 
              {isVisible ? ' It is now visible!' : ' Scroll to see it.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
