'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'spinner'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
        {text && <span className={cn('text-muted-foreground', textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('bg-blue-600 rounded-full animate-pulse', sizeClasses[size])}></div>
        {text && <span className={cn('text-muted-foreground', textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
      {text && <span className={cn('text-muted-foreground', textSizeClasses[size])}>{text}</span>}
    </div>
  )
}

// ============================================================================
// PROGRESS LOADING COMPONENT
// ============================================================================

interface ProgressLoadingProps {
  progress: number
  text?: string
  subText?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressLoading({ 
  progress, 
  text, 
  subText, 
  showPercentage = true,
  className 
}: ProgressLoadingProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      {(text || showPercentage) && (
        <div className="flex justify-between items-center">
          {text && <span className="text-sm font-medium">{text}</span>}
          {showPercentage && <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>}
        </div>
      )}
      <Progress value={progress} className="h-2" />
      {subText && <p className="text-xs text-muted-foreground">{subText}</p>}
    </div>
  )
}

// ============================================================================
// SKELETON LOADING COMPONENTS
// ============================================================================

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ListSkeleton({ items = 3, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string 
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// FULL PAGE LOADING COMPONENT
// ============================================================================

interface FullPageLoadingProps {
  text?: string
  subText?: string
  showLogo?: boolean
  className?: string
}

export function FullPageLoading({ 
  text = 'Loading...', 
  subText,
  showLogo = true,
  className 
}: FullPageLoadingProps) {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
      className
    )}>
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8 text-center space-y-6">
          {showLogo && (
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">AD</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <LoadingSpinner size="lg" text={text} className="justify-center" />
            {subText && (
              <p className="text-sm text-muted-foreground">{subText}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// NETWORK STATUS INDICATOR
// ============================================================================

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSlowConnection, setIsSlowConnection] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Check connection speed
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      const checkConnectionSpeed = () => {
        setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
      }
      
      checkConnectionSpeed()
      connection.addEventListener('change', checkConnectionSpeed)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', () => {})
      }
    }
  }, [])

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">No internet connection</span>
      </div>
    )
  }

  if (isSlowConnection) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Slow connection detected</span>
      </div>
    )
  }

  return null
}

// ============================================================================
// LOADING STATE HOOK
// ============================================================================

export interface LoadingState {
  isLoading: boolean
  progress?: number
  text?: string
  subText?: string
  error?: string | null
}

export function useLoadingState(initialState: Partial<LoadingState> = {}) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    text: undefined,
    subText: undefined,
    error: null,
    ...initialState
  })

  const setLoading = (isLoading: boolean, options?: Partial<Omit<LoadingState, 'isLoading'>>) => {
    setState(prev => ({
      ...prev,
      isLoading,
      error: null, // Clear error when starting new loading
      ...options
    }))
  }

  const setProgress = (progress: number, text?: string, subText?: string) => {
    setState(prev => ({
      ...prev,
      progress,
      ...(text !== undefined && { text }),
      ...(subText !== undefined && { subText })
    }))
  }

  const setError = (error: string) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error
    }))
  }

  const reset = () => {
    setState({
      isLoading: false,
      progress: 0,
      text: undefined,
      subText: undefined,
      error: null
    })
  }

  return {
    ...state,
    setLoading,
    setProgress,
    setError,
    reset
  }
}

// ============================================================================
// ASYNC OPERATION WRAPPER
// ============================================================================

interface AsyncOperationProps<T> {
  operation: () => Promise<T>
  onSuccess?: (result: T) => void
  onError?: (error: Error) => void
  loadingText?: string
  children: (result: T | null, loading: LoadingState) => React.ReactNode
}

export function AsyncOperation<T>({ 
  operation, 
  onSuccess, 
  onError, 
  loadingText = 'Loading...',
  children 
}: AsyncOperationProps<T>) {
  const [result, setResult] = useState<T | null>(null)
  const loading = useLoadingState({ text: loadingText })

  useEffect(() => {
    let isCancelled = false

    const executeOperation = async () => {
      loading.setLoading(true, { text: loadingText })
      
      try {
        const operationResult = await operation()
        
        if (!isCancelled) {
          setResult(operationResult)
          loading.setLoading(false)
          onSuccess?.(operationResult)
        }
      } catch (error) {
        if (!isCancelled) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
          loading.setError(errorMessage)
          onError?.(error instanceof Error ? error : new Error(errorMessage))
        }
      }
    }

    executeOperation()

    return () => {
      isCancelled = true
    }
  }, [operation, onSuccess, onError, loadingText, loading])

  return <>{children(result, loading)}</>
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  LoadingSpinner,
  ProgressLoading,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  FullPageLoading,
  NetworkStatusIndicator,
  useLoadingState,
  AsyncOperation
}
