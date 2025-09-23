import { useState, useEffect } from 'react'

export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Hook for connection quality
export function useConnectionQuality() {
  const [connection, setConnection] = useState<{
    effectiveType?: string
    downlink?: number
    rtt?: number
  }>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateConnection = () => {
      const nav = navigator as any
      if (nav.connection) {
        setConnection({
          effectiveType: nav.connection.effectiveType,
          downlink: nav.connection.downlink,
          rtt: nav.connection.rtt
        })
      }
    }

    updateConnection()

    const nav = navigator as any
    if (nav.connection) {
      nav.connection.addEventListener('change', updateConnection)
      return () => nav.connection.removeEventListener('change', updateConnection)
    }
  }, [])

  const getQuality = () => {
    if (!connection.effectiveType) return 'unknown'
    
    switch (connection.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'poor'
      case '3g':
        return 'fair'
      case '4g':
        return 'good'
      default:
        return 'excellent'
    }
  }

  return {
    ...connection,
    quality: getQuality()
  }
}
