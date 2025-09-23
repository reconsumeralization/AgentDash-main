"use client"

import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'
import { errorHandler, ErrorCategory } from '../error-handling'
import { performanceMonitor } from '../performance-monitor'

interface ApiConfig {
  baseUrl: string
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface ApiContextType {
  get: <T>(url: string, options?: RequestInit) => Promise<T>
  post: <T>(url: string, data?: any, options?: RequestInit) => Promise<T>
  put: <T>(url: string, data?: any, options?: RequestInit) => Promise<T>
  patch: <T>(url: string, data?: any, options?: RequestInit) => Promise<T>
  delete: <T>(url: string, options?: RequestInit) => Promise<T>
  upload: <T>(url: string, file: File, options?: RequestInit) => Promise<T>
  download: (url: string, filename?: string) => Promise<void>
  isOnline: boolean
  isLoading: boolean
}

const ApiContext = createContext<ApiContextType | null>(null)

interface ApiProviderProps {
  children: React.ReactNode
  config?: Partial<ApiConfig>
}

export function ApiProvider({ children, config = {} }: ApiProviderProps) {
  const memoizedConfig = useMemo(() => ({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    ...config
  }), [config])

  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const makeRequest = useCallback(async <T,>(
    url: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> => {
    const perfLogger = performanceMonitor.createPerformanceLogger(`API ${options.method || 'GET'} ${url}`)
    
    try {
      setIsLoading(true)
      
      const fullUrl = url.startsWith('http') ? url : `${memoizedConfig.baseUrl}${url}`
      
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      }

      // Add timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), memoizedConfig.timeout)
      requestOptions.signal = controller.signal

      const response = await fetch(fullUrl, requestOptions)
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      perfLogger.finish({ status: response.status })
      
      return data
    } catch (error) {
      perfLogger.error(error as Error)
      
      // Retry logic
      if (retryCount < memoizedConfig.retries && isOnline) {
        await new Promise(resolve => 
          setTimeout(resolve, memoizedConfig.retryDelay * Math.pow(2, retryCount))
        )
        return makeRequest<T>(url, options, retryCount + 1)
      }

      // Log error
      errorHandler.log('error', `API request failed: ${url}`, {
        category: ErrorCategory.API,
        data: { 
          url, 
          method: options.method || 'GET',
          error: error instanceof Error ? error.message : String(error)
        }
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [memoizedConfig, isOnline])

  const get = useCallback(<T,>(url: string, options?: RequestInit) => {
    return makeRequest<T>(url, { ...options, method: 'GET' })
  }, [makeRequest])

  const post = useCallback(<T,>(url: string, data?: any, options?: RequestInit) => {
    return makeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [makeRequest])

  const put = useCallback(<T,>(url: string, data?: any, options?: RequestInit) => {
    return makeRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [makeRequest])

  const patch = useCallback(<T,>(url: string, data?: any, options?: RequestInit) => {
    return makeRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [makeRequest])

  const deleteRequest = useCallback(<T,>(url: string, options?: RequestInit) => {
    return makeRequest<T>(url, { ...options, method: 'DELETE' })
  }, [makeRequest])

  const upload = useCallback(async <T,>(url: string, file: File, options?: RequestInit) => {
    const formData = new FormData()
    formData.append('file', file)

    return makeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...options?.headers
      }
    })
  }, [makeRequest])

  const download = useCallback(async (url: string, filename?: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      errorHandler.log('error', `Download failed: ${url}`, {
        category: ErrorCategory.API,
        data: { url, error: error instanceof Error ? error.message : String(error) }
      })
      throw error
    }
  }, [])

  const contextValue: ApiContextType = useMemo(() => ({
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
    upload,
    download,
    isOnline,
    isLoading
  }), [get, post, put, patch, deleteRequest, upload, download, isOnline, isLoading])

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApi() {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}

// Convenience hooks for specific API operations
export function useApiGet<T>(url: string, options?: RequestInit) {
  const { get } = useApi()
  return useCallback(() => get<T>(url, options), [get, url, options])
}

export function useApiPost<T>(url: string, options?: RequestInit) {
  const { post } = useApi()
  return useCallback((data?: any) => post<T>(url, data, options), [post, url, options])
}
