"use client"

import React from 'react'
import { cn } from '@/lib'
import { useTheme } from '@/components/providers'

interface ThemedLayoutProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'dashboard' | 'minimal'
  sidebarCollapsed?: boolean
}

interface ThemedHeaderProps {
  children: React.ReactNode
  className?: string
  sticky?: boolean
}

interface ThemedSidebarProps {
  children: React.ReactNode
  className?: string
  collapsed?: boolean
  width?: string
}

interface ThemedMainProps {
  children: React.ReactNode
  className?: string
}

interface ThemedFooterProps {
  children: React.ReactNode
  className?: string
  sticky?: boolean
}

export function ThemedLayout({
  children,
  className,
  header,
  sidebar,
  footer,
  variant = 'default',
  sidebarCollapsed = false
}: ThemedLayoutProps) {
  const { theme } = useTheme()

  const layoutClasses = {
    default: 'min-h-screen bg-gray-50 dark:bg-gray-900',
    dashboard: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800',
    minimal: 'min-h-screen bg-white dark:bg-gray-900'
  }

  return (
    <div className={cn(layoutClasses[variant], className)}>
      {header && (
        <div className="sticky top-0 z-40">
          {header}
        </div>
      )}

      <div className="flex">
        {sidebar && (
          <aside
            className={cn(
              'transition-all duration-300 ease-in-out',
              sidebarCollapsed ? 'w-16' : 'w-64'
            )}
          >
            {sidebar}
          </aside>
        )}

        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>

      {footer && (
        <div className={cn(
          'mt-auto',
          'bg-white dark:bg-gray-900',
          'border-t border-gray-200 dark:border-gray-700'
        )}>
          {footer}
        </div>
      )}
    </div>
  )
}

export function ThemedHeader({ children, className, sticky = true }: ThemedHeaderProps) {
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
          {children}
        </div>
      </div>
    </header>
  )
}

export function ThemedSidebar({
  children,
  className,
  collapsed = false,
  width = '16rem'
}: ThemedSidebarProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-700',
        'shadow-sm',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : width,
        className
      )}
      style={{
        width: collapsed ? '4rem' : width
      }}
    >
      <div className="flex flex-col h-full">
        {children}
      </div>
    </div>
  )
}

export function ThemedMain({ children, className }: ThemedMainProps) {
  return (
    <main className={cn('flex-1 p-6', className)}>
      {children}
    </main>
  )
}

export function ThemedFooter({ children, className, sticky = false }: ThemedFooterProps) {
  return (
    <footer
      className={cn(
        'bg-white dark:bg-gray-900',
        'border-t border-gray-200 dark:border-gray-700',
        'px-4 sm:px-6 lg:px-8 py-4',
        sticky && 'sticky bottom-0 z-30',
        className
      )}
    >
      {children}
    </footer>
  )
}

// Compound components
ThemedLayout.Header = ThemedHeader
ThemedLayout.Sidebar = ThemedSidebar
ThemedLayout.Main = ThemedMain
ThemedLayout.Footer = ThemedFooter
