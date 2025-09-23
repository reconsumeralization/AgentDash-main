import { useEffect, useRef } from 'react'

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  })

  return ref.current
}

// Hook to track previous values with comparison
export function usePreviousWithComparison<T>(
  value: T,
  compareFn?: (prev: T | undefined, current: T) => boolean
): T | undefined {
  const ref = useRef<T>()
  const prevRef = useRef<T | undefined>()

  useEffect(() => {
    const shouldUpdate = compareFn ? compareFn(prevRef.current, value) : true
    
    if (shouldUpdate) {
      prevRef.current = ref.current
      ref.current = value
    }
  }, [value, compareFn])

  return prevRef.current
}

// Hook to track if value has changed
export function useHasChanged<T>(value: T): boolean {
  const prevValue = usePrevious(value)
  return prevValue !== undefined && prevValue !== value
}
