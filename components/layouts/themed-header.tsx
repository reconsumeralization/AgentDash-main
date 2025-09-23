"use client"

import React from 'react'
import { cn } from '@/lib'
import { useTheme } from '@/components/providers'
import { Navigation } from '@/components/navigation'
import { ThemeSwitcher } from '@/components/theme'
import { Button } from '@/components/ui'
import { Menu, X } from 'lucide-react'

interface ThemedHeaderProps {
  children?: React.ReactNode
  className?: string
  sticky?: boolean
  showThemeSwitcher?: boolean
  showNavigation?: boolean
  onMenuClick?: () => void
  isMenuOpen?: boolean
}

export function ThemedHeader({
  children,
  className,
  sticky = true,
  showThemeSwitcher = true,
  showNavigation = true,
  onMenuClick,
  isMenuOpen = false
}: ThemedHeaderProps) {
  const { theme } = useTheme()

  return (
    <header
      className={cn(
        'bg-white dark:bg-gray-900',
        'border-b border-gray-200 dark:border-gray-700',
        'shadow-sm',
        sticky && 'sticky top-0 z-40',
        className
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and children */}
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="lg:hidden"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            {children}
          </div>

          {/* Center - Navigation (hidden on mobile) */}
          {showNavigation && (
            <div className="hidden lg:flex flex-1 justify-center">
              <Navigation />
            </div>
          )}

          {/* Right side - Theme switcher */}
          {showThemeSwitcher && (
            <div className="flex items-center gap-4">
              <ThemeSwitcher compact />
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      {showNavigation && (
        <div className={cn(
          'lg:hidden border-t border-gray-200 dark:border-gray-700',
          isMenuOpen ? 'block' : 'hidden'
        )}>
          <div className="px-4 py-4">
            <Navigation />
          </div>
        </div>
      )}
    </header>
  )
}

// Specialized header for dashboard pages
interface DashboardHeaderProps extends Omit<ThemedHeaderProps, 'children'> {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
  ...props
}: DashboardHeaderProps) {
  return (
    <ThemedHeader {...props} className={cn('bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800', className)}>
      <div className="flex-1">
        {breadcrumbs && (
          <div className="mb-2">
            {breadcrumbs}
          </div>
        )}

        {title && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    </ThemedHeader>
  )
}

// App header with logo and branding
interface AppHeaderProps extends ThemedHeaderProps {
  logo?: React.ReactNode
  brandName?: string
  brandLink?: string
}

export function AppHeader({
  logo,
  brandName = 'AgentDash',
  brandLink = '/',
  className,
  ...props
}: AppHeaderProps) {
  const { theme } = useTheme()

  return (
    <ThemedHeader {...props} className={cn('bg-gradient-to-r from-blue-600 to-purple-600 text-white', className)}>
      <div className="flex items-center gap-4">
        {logo || (
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AD</span>
          </div>
        )}
        <a href={brandLink} className="text-xl font-bold text-white hover:text-white/80 transition-colors">
          {brandName}
        </a>
      </div>
    </ThemedHeader>
  )
}
