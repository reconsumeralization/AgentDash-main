'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ============================================================================
// RESPONSIVE TYPES
// ============================================================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type Orientation = 'portrait' | 'landscape'
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv'

export interface ViewportInfo {
  width: number
  height: number
  breakpoint: Breakpoint
  orientation: Orientation
  deviceType: DeviceType
  isTouch: boolean
  pixelRatio: number
  isRetina: boolean
}

export interface ResponsiveContextType {
  viewport: ViewportInfo
  isBreakpoint: (bp: Breakpoint | Breakpoint[]) => boolean
  isMinBreakpoint: (bp: Breakpoint) => boolean
  isMaxBreakpoint: (bp: Breakpoint) => boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
  isLandscape: boolean
  isPortrait: boolean
}

// ============================================================================
// BREAKPOINT CONFIGURATION
// ============================================================================

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

function getDeviceType(width: number, isTouch: boolean): DeviceType {
  if (width >= 1920) return 'tv'
  if (width >= 1024) return 'desktop'
  if (width >= 768 || !isTouch) return 'tablet'
  return 'mobile'
}

function detectTouch(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

function getPixelRatio(): number {
  return window.devicePixelRatio || 1
}

// ============================================================================
// RESPONSIVE CONTEXT
// ============================================================================

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined)

// ============================================================================
// RESPONSIVE PROVIDER
// ============================================================================

interface ResponsiveProviderProps {
  children: React.ReactNode
  debounceMs?: number
}

export function ResponsiveProvider({ children, debounceMs = 150 }: ResponsiveProviderProps) {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    breakpoint: 'xs',
    orientation: 'portrait',
    deviceType: 'mobile',
    isTouch: false,
    pixelRatio: 1,
    isRetina: false
  })

  // Update viewport information
  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    const breakpoint = getBreakpoint(width)
    const orientation: Orientation = width > height ? 'landscape' : 'portrait'
    const isTouch = detectTouch()
    const deviceType = getDeviceType(width, isTouch)
    const pixelRatio = getPixelRatio()
    const isRetina = pixelRatio > 1

    setViewport({
      width,
      height,
      breakpoint,
      orientation,
      deviceType,
      isTouch,
      pixelRatio,
      isRetina
    })
  }, [])

  // Debounced update function
  const debouncedUpdate = useCallback(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateViewport, debounceMs)
    }
  }, [updateViewport, debounceMs])

  // Initialize and listen for changes
  useEffect(() => {
    updateViewport()
    
    const debouncedHandler = debouncedUpdate()
    
    window.addEventListener('resize', debouncedHandler)
    window.addEventListener('orientationchange', debouncedHandler)
    
    return () => {
      window.removeEventListener('resize', debouncedHandler)
      window.removeEventListener('orientationchange', debouncedHandler)
    }
  }, [updateViewport, debouncedUpdate])

  // Helper functions
  const isBreakpoint = useCallback((bp: Breakpoint | Breakpoint[]) => {
    if (Array.isArray(bp)) {
      return bp.includes(viewport.breakpoint)
    }
    return viewport.breakpoint === bp
  }, [viewport.breakpoint])

  const isMinBreakpoint = useCallback((bp: Breakpoint) => {
    return viewport.width >= breakpoints[bp]
  }, [viewport.width])

  const isMaxBreakpoint = useCallback((bp: Breakpoint) => {
    return viewport.width < breakpoints[bp]
  }, [viewport.width])

  const value: ResponsiveContextType = {
    viewport,
    isBreakpoint,
    isMinBreakpoint,
    isMaxBreakpoint,
    isMobile: viewport.deviceType === 'mobile',
    isTablet: viewport.deviceType === 'tablet',
    isDesktop: viewport.deviceType === 'desktop',
    isTouch: viewport.isTouch,
    isLandscape: viewport.orientation === 'landscape',
    isPortrait: viewport.orientation === 'portrait'
  }

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  )
}

// ============================================================================
// RESPONSIVE HOOK
// ============================================================================

export function useResponsive() {
  const context = useContext(ResponsiveContext)
  if (context === undefined) {
    throw new Error('useResponsive must be used within a ResponsiveProvider')
  }
  return context
}

// ============================================================================
// RESPONSIVE COMPONENTS
// ============================================================================

// Show/Hide based on breakpoints
interface ShowProps {
  above?: Breakpoint
  below?: Breakpoint
  only?: Breakpoint | Breakpoint[]
  children: React.ReactNode
  className?: string
}

export function Show({ above, below, only, children, className }: ShowProps) {
  const { isMinBreakpoint, isMaxBreakpoint, isBreakpoint } = useResponsive()

  let shouldShow = true

  if (above && !isMinBreakpoint(above)) {
    shouldShow = false
  }

  if (below && !isMaxBreakpoint(below)) {
    shouldShow = false
  }

  if (only && !isBreakpoint(only)) {
    shouldShow = false
  }

  if (!shouldShow) {
    return null
  }

  return <div className={className}>{children}</div>
}

export function Hide({ above, below, only, children, className }: ShowProps) {
  const { isMinBreakpoint, isMaxBreakpoint, isBreakpoint } = useResponsive()

  let shouldHide = false

  if (above && isMinBreakpoint(above)) {
    shouldHide = true
  }

  if (below && isMaxBreakpoint(below)) {
    shouldHide = true
  }

  if (only && isBreakpoint(only)) {
    shouldHide = true
  }

  if (shouldHide) {
    return null
  }

  return <div className={className}>{children}</div>
}

// Responsive container
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: Breakpoint
  padding?: boolean | Breakpoint
  center?: boolean
}

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = '2xl',
  padding = true,
  center = true
}: ResponsiveContainerProps) {
  const { isMinBreakpoint } = useResponsive()

  const maxWidthClass = {
    xs: 'max-w-none',
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl'
  }[maxWidth]

  const paddingClass = padding === true 
    ? 'px-4 sm:px-6 lg:px-8' 
    : typeof padding === 'string' && isMinBreakpoint(padding)
    ? 'px-4 sm:px-6 lg:px-8'
    : ''

  return (
    <div 
      className={cn(
        'w-full',
        maxWidthClass,
        paddingClass,
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive grid
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number | string
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 },
  gap = 4
}: ResponsiveGridProps) {
  const gridClasses = []

  if (cols.xs) gridClasses.push(`grid-cols-${cols.xs}`)
  if (cols.sm) gridClasses.push(`sm:grid-cols-${cols.sm}`)
  if (cols.md) gridClasses.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) gridClasses.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) gridClasses.push(`xl:grid-cols-${cols.xl}`)
  if (cols['2xl']) gridClasses.push(`2xl:grid-cols-${cols['2xl']}`)

  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap

  return (
    <div className={cn('grid', ...gridClasses, gapClass, className)}>
      {children}
    </div>
  )
}

// Responsive text
interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
}

export function ResponsiveText({ 
  children, 
  className, 
  size = { xs: 'text-sm', sm: 'text-base', md: 'text-lg', lg: 'text-xl' }
}: ResponsiveTextProps) {
  const sizeClasses = []

  if (size.xs) sizeClasses.push(size.xs)
  if (size.sm) sizeClasses.push(`sm:${size.sm}`)
  if (size.md) sizeClasses.push(`md:${size.md}`)
  if (size.lg) sizeClasses.push(`lg:${size.lg}`)
  if (size.xl) sizeClasses.push(`xl:${size.xl}`)
  if (size['2xl']) sizeClasses.push(`2xl:${size['2xl']}`)

  return (
    <div className={cn(...sizeClasses, className)}>
      {children}
    </div>
  )
}

// Responsive spacing
interface ResponsiveSpacingProps {
  children: React.ReactNode
  className?: string
  p?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  m?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
}

export function ResponsiveSpacing({ 
  children, 
  className, 
  p,
  m
}: ResponsiveSpacingProps) {
  const classes = []

  // Padding classes
  if (p) {
    if (p.xs) classes.push(`p-${p.xs}`)
    if (p.sm) classes.push(`sm:p-${p.sm}`)
    if (p.md) classes.push(`md:p-${p.md}`)
    if (p.lg) classes.push(`lg:p-${p.lg}`)
    if (p.xl) classes.push(`xl:p-${p.xl}`)
    if (p['2xl']) classes.push(`2xl:p-${p['2xl']}`)
  }

  // Margin classes
  if (m) {
    if (m.xs) classes.push(`m-${m.xs}`)
    if (m.sm) classes.push(`sm:m-${m.sm}`)
    if (m.md) classes.push(`md:m-${m.md}`)
    if (m.lg) classes.push(`lg:m-${m.lg}`)
    if (m.xl) classes.push(`xl:m-${m.xl}`)
    if (m['2xl']) classes.push(`2xl:m-${m['2xl']}`)
  }

  return (
    <div className={cn(...classes, className)}>
      {children}
    </div>
  )
}

// Responsive aspect ratio
interface ResponsiveAspectRatioProps {
  children: React.ReactNode
  className?: string
  ratio?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
}

export function ResponsiveAspectRatio({ 
  children, 
  className, 
  ratio = { xs: 'aspect-square', md: 'aspect-video' }
}: ResponsiveAspectRatioProps) {
  const ratioClasses = []

  if (ratio.xs) ratioClasses.push(ratio.xs)
  if (ratio.sm) ratioClasses.push(`sm:${ratio.sm}`)
  if (ratio.md) ratioClasses.push(`md:${ratio.md}`)
  if (ratio.lg) ratioClasses.push(`lg:${ratio.lg}`)
  if (ratio.xl) ratioClasses.push(`xl:${ratio.xl}`)
  if (ratio['2xl']) ratioClasses.push(`2xl:${ratio['2xl']}`)

  return (
    <div className={cn(...ratioClasses, className)}>
      {children}
    </div>
  )
}

// ============================================================================
// RESPONSIVE HOOKS
// ============================================================================

// Hook for conditional rendering based on device type
export function useDeviceType() {
  const { isMobile, isTablet, isDesktop, isTouch } = useResponsive()
  return { isMobile, isTablet, isDesktop, isTouch }
}

// Hook for orientation
export function useOrientation() {
  const { isLandscape, isPortrait } = useResponsive()
  return { isLandscape, isPortrait }
}

// Hook for breakpoint matching
export function useBreakpoint() {
  const { isBreakpoint, isMinBreakpoint, isMaxBreakpoint } = useResponsive()
  return { isBreakpoint, isMinBreakpoint, isMaxBreakpoint }
}

// Hook for viewport dimensions
export function useViewport() {
  const { viewport } = useResponsive()
  return viewport
}

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

// Generate responsive class names
export function responsiveClass(
  base: string,
  responsive: Partial<Record<Breakpoint, string>>
): string {
  const classes = [base]
  
  Object.entries(responsive).forEach(([breakpoint, value]) => {
    if (breakpoint === 'xs') {
      classes.push(value)
    } else {
      classes.push(`${breakpoint}:${value}`)
    }
  })
  
  return classes.join(' ')
}

// Create responsive styles object
export function useResponsiveStyles(
  styles: Partial<Record<Breakpoint, React.CSSProperties>>
): React.CSSProperties {
  const { viewport } = useResponsive()
  return styles[viewport.breakpoint] || {}
}

// ============================================================================
// RESPONSIVE DEBUG COMPONENT
// ============================================================================

interface ResponsiveDebugProps {
  className?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export function ResponsiveDebug({ 
  className, 
  position = 'bottom-right' 
}: ResponsiveDebugProps) {
  const { viewport } = useResponsive()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  return (
    <div 
      className={cn(
        'fixed z-50 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono',
        positionClasses[position],
        className
      )}
    >
      <div>BP: {viewport.breakpoint}</div>
      <div>Size: {viewport.width}×{viewport.height}</div>
      <div>Device: {viewport.deviceType}</div>
      <div>Orient: {viewport.orientation}</div>
      <div>Touch: {viewport.isTouch ? 'Yes' : 'No'}</div>
      <div>Retina: {viewport.isRetina ? 'Yes' : 'No'}</div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ResponsiveProvider,
  useResponsive,
  Show,
  Hide,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveText,
  ResponsiveSpacing,
  ResponsiveAspectRatio,
  useDeviceType,
  useOrientation,
  useBreakpoint,
  useViewport,
  responsiveClass,
  responsiveStyles,
  ResponsiveDebug
}

export type {
  Breakpoint,
  Orientation,
  DeviceType,
  ViewportInfo,
  ResponsiveContextType
}
