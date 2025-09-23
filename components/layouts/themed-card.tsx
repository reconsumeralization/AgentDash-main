"use client"

import React from 'react'
import { cn } from '@/lib'
import { useTheme } from '@/components/providers'

interface ThemedCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onClick?: () => void
}

interface ThemedCardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface ThemedCardContentProps {
  children: React.ReactNode
  className?: string
}

interface ThemedCardFooterProps {
  children: React.ReactNode
  className?: string
}

export function ThemedCard({
  children,
  className,
  variant = 'default',
  size = 'md',
  interactive = false,
  onClick
}: ThemedCardProps) {
  const { theme } = useTheme()

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const getVariantClasses = () => {
    const baseClasses = 'rounded-lg border transition-all duration-200'

    switch (variant) {
      case 'default':
        return cn(
          baseClasses,
          interactive && 'hover:shadow-md cursor-pointer',
          'bg-white dark:bg-gray-900',
          'border-gray-200 dark:border-gray-700'
        )
      case 'elevated':
        return cn(
          baseClasses,
          interactive && 'hover:shadow-xl cursor-pointer',
          'bg-white dark:bg-gray-900',
          'border-gray-200 dark:border-gray-700',
          'shadow-lg'
        )
      case 'outlined':
        return cn(
          baseClasses,
          interactive && 'hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer',
          'bg-transparent',
          'border-2 border-gray-300 dark:border-gray-600'
        )
      case 'gradient':
        return cn(
          baseClasses,
          interactive && 'hover:shadow-xl cursor-pointer',
          'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
          'border-blue-200 dark:border-blue-700'
        )
      default:
        return baseClasses
    }
  }

  return (
    <div
      className={cn(
        getVariantClasses(),
        sizeClasses[size],
        className
      )}
      onClick={interactive ? onClick : undefined}
      style={{
        background: variant === 'gradient'
          ? `var(--component-card-elevated-background)`
          : undefined,
        borderColor: `var(--component-card-${variant}-border)`,
        boxShadow: `var(--component-card-${variant}-shadow)`
      }}
    >
      {children}
    </div>
  )
}

export function ThemedCardHeader({ children, className }: ThemedCardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function ThemedCardContent({ children, className }: ThemedCardContentProps) {
  return (
    <div className={cn('text-gray-700 dark:text-gray-300', className)}>
      {children}
    </div>
  )
}

export function ThemedCardFooter({ children, className }: ThemedCardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  )
}

// Compound component
ThemedCard.Header = ThemedCardHeader
ThemedCard.Content = ThemedCardContent
ThemedCard.Footer = ThemedCardFooter
