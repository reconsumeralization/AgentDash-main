import { useState, useEffect, useCallback, useRef } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export interface AsyncOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: AsyncOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const execute = useCallback(async (...args: any[]) => {
    if (!isMountedRef.current) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await asyncFunction(...args)
      
      if (isMountedRef.current) {
        setState({ data: result, loading: false, error: null })
        options.onSuccess?.(result)
      }
    } catch (error) {
      if (isMountedRef.current) {
        const errorObj = error instanceof Error ? error : new Error(String(error))
        setState({ data: null, loading: false, error: errorObj })
        options.onError?.(errorObj)
      }
    }
  }, [asyncFunction, options.onSuccess, options.onError])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  return {
    ...state,
    execute,
    reset
  }
}

// Hook for async operations with retry logic
export function useAsyncWithRetry<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: AsyncOptions & { retries?: number; retryDelay?: number } = {}
) {
  const { retries = 3, retryDelay = 1000, ...asyncOptions } = options
  const [retryCount, setRetryCount] = useState(0)

  const asyncState = useAsync(async (...args: any[]) => {
    let lastError: Error

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await asyncFunction(...args)
        setRetryCount(0) // Reset on success
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
        }
      }
    }

    throw lastError!
  }, asyncOptions)

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    asyncState.execute()
  }, [asyncState.execute])

  return {
    ...asyncState,
    retry,
    retryCount
  }
}
