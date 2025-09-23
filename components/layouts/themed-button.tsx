"use client"

import React from 'react'
import { cn } from '@/lib'
import { useTheme } from '@/components/providers'
import { Button, ButtonProps } from '@/components/ui'

interface ThemedButtonProps extends Omit<ButtonProps, 'variant'> {
  themeVariant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export function ThemedButton({
  children,
  className,
  themeVariant = 'primary',
  size = 'md',
  rounded = 'md',
  ...props
}: ThemedButtonProps) {
  const { theme } = useTheme()

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  return (
    <Button
      className={cn(
        sizeClasses[size],
        roundedClasses[rounded],
        'transition-all duration-200 font-medium',
        'focus:ring-2 focus:ring-offset-2',
        className
      )}
      style={{
        backgroundColor: `var(--component-button-${themeVariant}-background)`,
        color: `var(--component-button-${themeVariant}-color)`,
        borderColor: `var(--component-button-${themeVariant}-border)`,
        '--tw-ring-color': `var(--component-button-${themeVariant}-focus-ring)`
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </Button>
  )
}
