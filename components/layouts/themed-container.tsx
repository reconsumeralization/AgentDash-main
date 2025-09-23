"use client"

import React from 'react'
import { cn } from '@/lib'
import { useTheme } from '@/components/providers'

interface ThemedContainerProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  as?: keyof JSX.IntrinsicElements
}

export function ThemedContainer({
  children,
  className,
  variant = 'default',
  size = 'md',
  rounded = 'md',
  padding = 'md',
  as: Component = 'div'
}: ThemedContainerProps) {
  const { theme } = useTheme()

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
  }

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  const getVariantClasses = () => {
    const baseClasses = 'transition-all duration-200'

    switch (variant) {
      case 'default':
        return cn(
          baseClasses,
          'bg-white dark:bg-gray-900',
          'border border-gray-200 dark:border-gray-700',
          'shadow-sm hover:shadow-md'
        )
      case 'elevated':
        return cn(
          baseClasses,
          'bg-white dark:bg-gray-900',
          'border border-gray-200 dark:border-gray-700',
          'shadow-lg hover:shadow-xl'
        )
      case 'outlined':
        return cn(
          baseClasses,
          'bg-transparent',
          'border-2 border-gray-300 dark:border-gray-600',
          'hover:border-gray-400 dark:hover:border-gray-500'
        )
      case 'glass':
        return cn(
          baseClasses,
          'bg-white/80 dark:bg-gray-900/80',
          'backdrop-blur-sm',
          'border border-white/20 dark:border-gray-700/50',
          'shadow-lg'
        )
      default:
        return baseClasses
    }
  }

  return (
    <Component
      className={cn(
        getVariantClasses(),
        sizeClasses[size],
        roundedClasses[rounded],
        paddingClasses[padding],
        className
      )}
      style={{
        backgroundColor: variant === 'glass' ? `var(--color-background-primary)` : undefined,
        borderColor: variant === 'glass' ? `var(--color-border-light)` : undefined
      }}
    >
      {children}
    </Component>
  )
}
