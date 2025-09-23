"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  autoHide?: boolean
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCount = notifications.filter(n => !n.read).length

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Auto-hide if specified
    if (newNotification.autoHide && newNotification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, newNotification.duration)
    }
  }, [removeNotification])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Add some demo notifications
  useEffect(() => {
    // Simulate some initial notifications
    const demoNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
      {
        type: 'achievement',
        title: 'Connection Milestone Reached!',
        message: 'Congratulations! You\'ve reached 29.8K LinkedIn connections.',
        actionUrl: '/networking',
        actionLabel: 'View Network'
      },
      {
        type: 'info',
        title: 'New Tribe Opportunity',
        message: 'AI Innovation Leaders tribe has 3 new high-value members you might connect with.',
        actionUrl: '/networking',
        actionLabel: 'Explore Tribe'
      },
      {
        type: 'warning',
        title: 'Workflow Paused',
        message: 'Content Creation Pipeline workflow encountered an error and has been paused.',
        actionUrl: '/workflows',
        actionLabel: 'Fix Workflow'
      },
      {
        type: 'success',
        title: 'Agent Training Complete',
        message: 'Your LinkedIn Strategy Agent has completed training and is now optimized for your networking goals.',
        actionUrl: '/agents',
        actionLabel: 'View Agent'
      }
    ]

    // Add notifications with slight delays to simulate real-time updates
    demoNotifications.forEach((notification, index) => {
      setTimeout(() => {
        addNotification(notification)
      }, (index + 1) * 1000)
    })
  }, [addNotification])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

// Hook for showing toast notifications
export function useToast() {
  const { addNotification } = useNotification()

  const toast = {
    success: (title: string, message: string, options?: Partial<Notification>) => {
      addNotification({
        type: 'success',
        title,
        message,
        autoHide: true,
        duration: 5000,
        ...options
      })
    },
    error: (title: string, message: string, options?: Partial<Notification>) => {
      addNotification({
        type: 'error',
        title,
        message,
        autoHide: false,
        ...options
      })
    },
    warning: (title: string, message: string, options?: Partial<Notification>) => {
      addNotification({
        type: 'warning',
        title,
        message,
        autoHide: true,
        duration: 7000,
        ...options
      })
    },
    info: (title: string, message: string, options?: Partial<Notification>) => {
      addNotification({
        type: 'info',
        title,
        message,
        autoHide: true,
        duration: 5000,
        ...options
      })
    }
  }

  return toast
}
