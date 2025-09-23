import { useState, useCallback } from 'react'

export interface UseClipboardOptions {
  timeout?: number
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { timeout = 2000 } = options
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const copy = useCallback(async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      
      setCopied(true)
      setError(null)
      
      if (timeout > 0) {
        setTimeout(() => setCopied(false), timeout)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to copy'))
      setCopied(false)
    }
  }, [timeout])

  const reset = useCallback(() => {
    setCopied(false)
    setError(null)
  }, [])

  return {
    copied,
    error,
    copy,
    reset
  }
}

// Hook for reading from clipboard
export function useClipboardRead() {
  const [text, setText] = useState<string>('')
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const read = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (navigator?.clipboard?.readText) {
        const clipboardText = await navigator.clipboard.readText()
        setText(clipboardText)
      } else {
        throw new Error('Clipboard API not supported')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to read clipboard'))
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    text,
    error,
    loading,
    read
  }
}
