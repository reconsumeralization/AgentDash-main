"use client"

import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'

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
  isOnline: boolean
  isLoading: boolean
}

const ApiContext = createContext<ApiContextType | null>(null)

interface ApiProviderProps {
  children: React.ReactNode
  config?: Partial<ApiConfig>
}

export function ApiProvider({ children, config = {} }: ApiProviderProps) {
  const [currentConfig] = useState<ApiConfig>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    ...config
  })

  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

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
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      setIsLoading(true)
      
      const fullUrl = url.startsWith('http') ? url : `${currentConfig.baseUrl}${url}`
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentConfig])

  const get = useCallback(<T,>(url: string, options?: RequestInit): Promise<T> => {
    return makeRequest<T>(url, { ...options, method: 'GET' })
  }, [makeRequest])

  const post = useCallback(<T,>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    return makeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [makeRequest])

  const put = useCallback(<T,>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    return makeRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [makeRequest])

  const patch = useCallback(<T,>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    return makeRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [makeRequest])

  const deleteRequest = useCallback(<T,>(url: string, options?: RequestInit): Promise<T> => {
    return makeRequest<T>(url, { ...options, method: 'DELETE' })
  }, [makeRequest])

  const contextValue: ApiContextType = useMemo(() => ({
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
    isOnline,
    isLoading
  }), [get, post, put, patch, deleteRequest, isOnline, isLoading])

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