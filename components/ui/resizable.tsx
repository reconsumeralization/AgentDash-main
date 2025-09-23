"use client"

import React, { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib'

interface ResizablePanelGroupProps {
  direction: 'horizontal' | 'vertical'
  children: React.ReactNode
  className?: string
}

interface ResizablePanelProps {
  children: React.ReactNode
  defaultSize?: number
  minSize?: number
  className?: string
}

interface ResizableHandleProps {
  className?: string
}

export function ResizablePanelGroup({
  direction,
  children,
  className
}: ResizablePanelGroupProps) {
  return (
    <div
      className={cn(
        "flex w-full h-full",
        direction === 'horizontal' ? "flex-row" : "flex-col",
        className
      )}
    >
      {children}
    </div>
  )
}

export function ResizablePanel({
  children,
  defaultSize = 50,
  minSize = 10,
  className
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize)

  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{
        [size === defaultSize ? 'flex' : 'width']: size === defaultSize ? '1' : `${size}%`,
        minWidth: minSize === defaultSize ? 'auto' : `${minSize}%`,
      }}
    >
      {children}
    </div>
  )
}

export function ResizableHandle({ className }: ResizableHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const handleRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseUp])

  return (
    <div
      ref={handleRef}
      className={cn(
        "relative flex items-center justify-center bg-border hover:bg-accent transition-colors",
        "before:absolute before:inset-y-0 before:left-1/2 before:w-1 before:-translate-x-1/2 before:bg-border before:rounded-full",
        "cursor-col-resize select-none touch-none",
        isDragging && "bg-accent",
        className
      )}
      onMouseDown={handleMouseDown}
      style={{ width: '8px' }}
    >
      <div className="w-1 h-8 bg-muted-foreground/20 rounded-full" />
    </div>
  )
}
