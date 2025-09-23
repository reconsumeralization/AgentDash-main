'use client'

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  MessageSquare,
  TrendingUp,
  Settings,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'loading'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type NotificationCategory = 'system' | 'social' | 'analytics' | 'security' | 'update' | 'message'

export interface EnhancedNotification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  category: NotificationCategory
  title: string
  message: string
  timestamp: Date
  read: boolean
  persistent?: boolean
  actionLabel?: string
  actionUrl?: string
  onAction?: () => void
  onDismiss?: () => void
  metadata?: Record<string, any>
  expiresAt?: Date
  avatar?: string
  source?: string
}

// ============================================================================
// NOTIFICATION CONTEXT
// ============================================================================

interface NotificationContextType {
  notifications: EnhancedNotification[]
  unreadCount: number
  addNotification: (notification: Omit<EnhancedNotification, 'id' | 'timestamp' | 'read'>) => string
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  showToast: (notification: Partial<EnhancedNotification>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// ============================================================================
// NOTIFICATION PROVIDER
// ============================================================================

interface NotificationProviderProps {
  children: React.ReactNode
  maxNotifications?: number
  defaultExpiry?: number // in milliseconds
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 100,
  defaultExpiry = 24 * 60 * 60 * 1000 // 24 hours
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([])

  // Generate unique ID
  const generateId = useCallback(() => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Add notification
  const addNotification = useCallback((
    notification: Omit<EnhancedNotification, 'id' | 'timestamp' | 'read'>
  ): string => {
    const id = generateId()
    const newNotification: EnhancedNotification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
      expiresAt: notification.expiresAt || new Date(Date.now() + defaultExpiry)
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      // Keep only the most recent notifications
      return updated.slice(0, maxNotifications)
    })

    return id
  }, [generateId, maxNotifications, defaultExpiry])

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Show toast notification
  const showToast = useCallback((notification: Partial<EnhancedNotification>) => {
    const config = {
      description: notification.message,
      duration: notification.persistent ? Infinity : 5000,
      action: notification.actionLabel && notification.onAction ? {
        label: notification.actionLabel,
        onClick: notification.onAction
      } : undefined,
      onDismiss: notification.onDismiss
    }

    switch (notification.type) {
      case 'success':
        toast.success(notification.title || 'Success', config)
        break
      case 'error':
        toast.error(notification.title || 'Error', config)
        break
      case 'warning':
        toast.warning(notification.title || 'Warning', config)
        break
      case 'loading':
        toast.loading(notification.title || 'Loading...', config)
        break
      default:
        toast.info(notification.title || 'Info', config)
        break
    }
  }, [])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Clean up expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setNotifications(prev => 
        prev.filter(n => !n.expiresAt || n.expiresAt > now)
      )
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    showToast
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster 
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
      />
    </NotificationContext.Provider>
  )
}

// ============================================================================
// NOTIFICATION HOOK
// ============================================================================

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// ============================================================================
// NOTIFICATION COMPONENTS
// ============================================================================

// Get icon for notification type
function getNotificationIcon(type: NotificationType, category: NotificationCategory) {
  if (type === 'success') return CheckCircle
  if (type === 'error') return XCircle
  if (type === 'warning') return AlertTriangle
  if (type === 'loading') return Clock
  
  // Category-based icons for info type
  switch (category) {
    case 'social': return User
    case 'analytics': return TrendingUp
    case 'security': return AlertTriangle
    case 'message': return MessageSquare
    case 'update': return Settings
    case 'system': return Info
    default: return Info
  }
}

// Get color classes for notification type
function getNotificationColors(type: NotificationType, priority: NotificationPriority) {
  const baseColors = {
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20',
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
    loading: 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20'
  }

  const priorityBorder = priority === 'urgent' ? 'border-l-4 border-l-red-500' : 
                        priority === 'high' ? 'border-l-4 border-l-orange-500' : ''

  return `${baseColors[type]} ${priorityBorder}`
}

// Single notification item
interface NotificationItemProps {
  notification: EnhancedNotification
  onRead?: (id: string) => void
  onDismiss?: (id: string) => void
  compact?: boolean
}

export function NotificationItem({ 
  notification, 
  onRead, 
  onDismiss, 
  compact = false 
}: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type, notification.category)
  const colors = getNotificationColors(notification.type, notification.priority)

  const handleRead = () => {
    if (!notification.read && onRead) {
      onRead(notification.id)
    }
  }

  const handleDismiss = () => {
    onDismiss?.(notification.id)
    notification.onDismiss?.()
  }

  const handleAction = () => {
    notification.onAction?.()
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        colors,
        !notification.read && 'ring-2 ring-blue-500/20',
        compact && 'p-2'
      )}
      onClick={handleRead}
    >
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 p-2 rounded-full',
            notification.type === 'info' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            notification.type === 'success' && 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            notification.type === 'warning' && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
            notification.type === 'error' && 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
            notification.type === 'loading' && 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
          )}>
            <Icon className={cn('h-4 w-4', compact && 'h-3 w-3')} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className={cn(
                'font-semibold text-gray-900 dark:text-gray-100 truncate',
                compact && 'text-sm'
              )}>
                {notification.title}
              </h4>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Priority badge */}
                {notification.priority === 'urgent' && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
                {notification.priority === 'high' && (
                  <Badge variant="secondary" className="text-xs">
                    High
                  </Badge>
                )}

                {/* Timestamp */}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {notification.timestamp.toLocaleDateString()}
                </span>

                {/* Dismiss button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDismiss()
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <p className={cn(
              'text-gray-600 dark:text-gray-300 mt-1',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {notification.message}
            </p>

            {/* Source and category */}
            {(notification.source || !compact) && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {notification.source && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      from {notification.source}
                    </span>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {notification.category}
                  </Badge>
                </div>

                {/* Action button */}
                {notification.actionLabel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction()
                    }}
                    className="text-xs h-6"
                  >
                    {notification.actionLabel}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Notification center/panel
interface NotificationCenterProps {
  className?: string
  maxHeight?: string
  showFilters?: boolean
}

export function NotificationCenter({ 
  className, 
  maxHeight = '400px',
  showFilters = true 
}: NotificationCenterProps) {
  const { notifications, markAsRead, removeNotification, markAllAsRead, clearAll } = useNotifications()
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filteredNotifications = notifications.filter(notification => {
    if (filter !== 'all' && notification.category !== filter) return false
    if (showUnreadOnly && notification.read) return false
    return true
  })

  const categories: (NotificationCategory | 'all')[] = [
    'all', 'system', 'social', 'analytics', 'security', 'update', 'message'
  ]

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(category => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(category)}
                className="text-xs"
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="text-xs"
            >
              Unread Only
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }} className="px-6 pb-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications to show</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  onDismiss={removeNotification}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Notification bell icon with badge
interface NotificationBellProps {
  className?: string
  showCount?: boolean
  onClick?: () => void
}

export function NotificationBell({ className, showCount = true, onClick }: NotificationBellProps) {
  const { unreadCount } = useNotifications()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn('relative', className)}
    >
      <Bell className="h-5 w-5" />
      {showCount && unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  options: Partial<EnhancedNotification> = {}
): Omit<EnhancedNotification, 'id' | 'timestamp' | 'read'> {
  return {
    type,
    title,
    message,
    priority: 'normal',
    category: 'system',
    ...options
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  NotificationProvider,
  useNotifications,
  NotificationItem,
  NotificationCenter,
  NotificationBell,
  createNotification
}

export type {
  EnhancedNotification,
  NotificationType,
  NotificationPriority,
  NotificationCategory
}
