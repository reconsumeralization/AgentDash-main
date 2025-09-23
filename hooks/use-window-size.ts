import { useState, useEffect } from 'react'

export interface WindowSize {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call handler right away so state gets updated with initial window size

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const { width } = useWindowSize()

  const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }

  const getBreakpoint = () => {
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  }

  const isBreakpoint = (breakpoint: keyof typeof breakpoints) => {
    return width >= breakpoints[breakpoint]
  }

  const isMobile = width < breakpoints.md
  const isTablet = width >= breakpoints.md && width < breakpoints.lg
  const isDesktop = width >= breakpoints.lg

  return {
    breakpoint: getBreakpoint(),
    isBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    width
  }
}
