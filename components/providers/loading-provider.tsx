"use client"

import { createContext, useContext, useState, type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Loader2 } from 'lucide-react'

interface LoadingState {
  id: string
  message?: string
  progress?: number
}

interface LoadingContextType {
  loadings: LoadingState[]
  isLoading: boolean
  globalLoading: boolean
  startLoading: (id: string, message?: string) => void
  updateLoading: (id: string, progress: number, message?: string) => void
  stopLoading: (id: string) => void
  startGlobalLoading: (message?: string) => void
  stopGlobalLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadings, setLoadings] = useState<LoadingState[]>([])
  const [globalLoading, setGlobalLoading] = useState(false)
  const [globalMessage, setGlobalMessage] = useState<string>()

  const isLoading = loadings.length > 0 || globalLoading

  const startLoading = (id: string, message?: string) => {
    setLoadings(prev => {
      const existing = prev.find(l => l.id === id)
      if (existing) {
        return prev.map(l =>
          l.id === id ? { ...l, message } : l
        )
      }
      return [...prev, { id, message }]
    })
  }

  const updateLoading = (id: string, progress: number, message?: string) => {
    setLoadings(prev =>
      prev.map(loading =>
        loading.id === id
          ? { ...loading, progress, message: message ?? loading.message }
          : loading
      )
    )
  }

  const stopLoading = (id: string) => {
    setLoadings(prev => prev.filter(loading => loading.id !== id))
  }

  const startGlobalLoading = (message?: string) => {
    setGlobalLoading(true)
    setGlobalMessage(message)
  }

  const stopGlobalLoading = () => {
    setGlobalLoading(false)
    setGlobalMessage(undefined)
  }

  return (
    <LoadingContext.Provider
      value={{
        loadings,
        isLoading,
        globalLoading,
        startLoading,
        updateLoading,
        stopLoading,
        startGlobalLoading,
        stopGlobalLoading
      }}
    >
      {children}

      {/* Global loading overlay */}
      {globalLoading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-700 font-medium">
                {globalMessage || 'Loading...'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual loading indicators */}
      {loadings.length > 0 && !globalLoading && (
        <div className="fixed bottom-4 right-4 z-40 space-y-2">
          {loadings.map((loading) => (
            <Card key={loading.id} className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-4 min-w-[200px]">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">
                      {loading.message || 'Loading...'}
                    </p>
                    {loading.progress !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${loading.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {loading.progress}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Convenience hook for async operations
export function useAsyncLoading() {
  const { startLoading, updateLoading, stopLoading } = useLoading()

  const withLoading = async <T,>(
    id: string,
    operation: () => Promise<T>,
    options?: {
      message?: string
      progressCallback?: (progress: number) => void
    }
  ): Promise<T> => {
    try {
      startLoading(id, options?.message || 'Loading...')

      const result = await operation()

      stopLoading(id)
      return result
    } catch (error) {
      stopLoading(id)
      throw error
    }
  }

  return { withLoading, startLoading, updateLoading, stopLoading }
}
