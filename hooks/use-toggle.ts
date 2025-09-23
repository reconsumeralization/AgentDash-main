
import { useState, useCallback } from 'react'

export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  const set = useCallback((newValue: boolean) => {
    setValue(newValue)
  }, [])

  return [value, { toggle, setTrue, setFalse, set }] as const
}

// Hook for managing multiple toggles
export function useMultiToggle<T extends string>(
  initialValues: Record<T, boolean> = {} as Record<T, boolean>
) {
  const [values, setValues] = useState<Record<T, boolean>>(initialValues)

  const toggle = useCallback((key: T) => {
    setValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [])

  const setTrue = useCallback((key: T) => {
    setValues(prev => ({
      ...prev,
      [key]: true
    }))
  }, [])

  const setFalse = useCallback((key: T) => {
    setValues(prev => ({
      ...prev,
      [key]: false
    }))
  }, [])

  const set = useCallback((key: T, value: boolean) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const setAll = useCallback((newValues: Record<T, boolean>) => {
    setValues(newValues)
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
  }, [initialValues])

  return {
    values,
    toggle,
    setTrue,
    setFalse,
    set,
    setAll,
    reset
  }
}
