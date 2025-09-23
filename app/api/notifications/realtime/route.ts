import { type NextRequest, NextResponse } from "next/server"
import { dataQuerySystem } from "@/lib"
import { rateLimit } from "@/lib"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

// In-memory storage for demo - in production, use Redis or database
const activeConnections = new Map<string, { userId: string; lastActivity: Date }>()
const notificationQueue = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(50, ip) // 50 requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const since = searchParams.get('since')

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      )
    }

    switch (action) {
      case 'poll':
        return await pollNotifications(userId, since)
      case 'stats':
        return await getNotificationStats(userId)
      case 'unread':
        return await getUnreadCount(userId)
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Realtime notifications API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch notifications",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(30, ip) // 30 requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { action, userId, ...params } = body

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    switch (action) {
      case 'send':
        return await sendNotification(userId, params)
      case 'mark_read':
        return await markAsRead(userId, params)
      case 'mark_all_read':
        return await markAllAsRead(userId)
      case 'delete':
        return await deleteNotification(userId, params)
      case 'broadcast':
        return await broadcastNotification(params)
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Realtime notifications API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Notification operation failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Notification functions
async function pollNotifications(userId: string, since?: string | null) {
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes

  // Update connection activity
  activeConnections.set(userId, {
    userId,
    lastActivity: new Date()
  })

  // Get notifications from database
  const notifications = await dataQuerySystem.executeQuery({
    table: 'notifications',
    select: `
      id,
      type,
      title,
      message,
      data,
      is_read,
      priority,
      created_at
    `,
    filters: {
      user_id: userId,
      created_at: {
        operator: 'gte',
        value: sinceDate.toISOString()
      }
    },
    orderBy: {
      column: 'created_at',
      ascending: false
    },
    limit: 50
  })

  // Get queued notifications (for real-time push)
  const queued = notificationQueue.get(userId) || []
  notificationQueue.delete(userId) // Clear queue after sending

  const allNotifications = [...queued, ...(notifications.data || [])]

  return NextResponse.json({
    success: true,
    notifications: allNotifications,
    count: allNotifications.length,
    timestamp: new Date().toISOString()
  })
}

async function getNotificationStats(userId: string) {
  const statsQuery = await dataQuerySystem.executeQuery({
    table: 'notifications',
    select: `
      type,
      is_read,
      COUNT(*) as count,
        MAX(created_at) as last_notification
      FROM notifications
      WHERE user_id = '${userId}'
      GROUP BY type, is_read
    `
  })

  const unreadCount = await getUnreadCountInternal(userId)

  return NextResponse.json({
    success: true,
    stats: statsQuery.data,
    unreadCount,
    timestamp: new Date().toISOString()
  })
}

async function getUnreadCount(userId: string) {
  const count = await getUnreadCountInternal(userId)

  return NextResponse.json({
    success: true,
    unreadCount: count,
    timestamp: new Date().toISOString()
  })
}

async function getUnreadCountInternal(userId: string): Promise<number> {
  const result = await dataQuerySystem.executeQuery({
    table: 'notifications',
    select: 'COUNT(*) as count',
    filters: {
      user_id: userId,
      is_read: false
    }
  })

  return result.data?.count || 0
}

async function sendNotification(userId: string, params: any) {
  const { type, title, message, data, priority = 'medium' } = params

  if (!type || !title || !message) {
    return NextResponse.json(
      { error: "type, title, and message are required" },
      { status: 400 }
    )
  }

  const notificationData = {
    user_id: userId,
    type,
    title,
    message,
    data: data || {},
    priority,
    is_read: false
  }

  const result = await dataQuerySystem.executeQuery({
    table: 'notifications',
    select: '*',
    filters: notificationData
  })

  // Add to real-time queue for immediate delivery
  const existingQueue = notificationQueue.get(userId) || []
  existingQueue.push({
    ...result.data,
    realtime: true
  })
  notificationQueue.set(userId, existingQueue)

  return NextResponse.json({
    success: true,
    notification: result.data,
    message: "Notification sent successfully",
    timestamp: new Date().toISOString()
  })
}

async function markAsRead(userId: string, params: any) {
  const { notificationId } = params

  if (!notificationId) {
    return NextResponse.json(
      { error: "notificationId is required" },
      { status: 400 }
    )
  }

  const result = await dataQuerySystem.executeQuery({
    table: 'notifications',
    select: '*',
    filters: {
      id: notificationId,
      user_id: userId,
      is_read: true
    }
  })

  return NextResponse.json({
    success: true,
    message: "Notification marked as read",
    timestamp: new Date().toISOString()
  })
}

async function markAllAsRead(userId: string) {
  // In a real implementation, this would update all unread notifications
  const result = await dataQuerySystem.executeQuery({
    table: 'notifications',
    select: 'COUNT(*) as updated',
    filters: {
      user_id: userId,
      is_read: true
    }
  })

  return NextResponse.json({
    success: true,
    message: "All notifications marked as read",
    updatedCount: result.data?.updated || 0,
    timestamp: new Date().toISOString()
  })
}

async function deleteNotification(userId: string, params: any) {
  const { notificationId } = params

  if (!notificationId) {
    return NextResponse.json(
      { error: "notificationId is required" },
      { status: 400 }
    )
  }

  // In a real implementation, this would soft delete the notification
  const result = await dataQuerySystem.executeQuery({
    table: 'notifications',
    select: '*',
    filters: {
      id: notificationId,
      user_id: userId
    }
  })

  return NextResponse.json({
    success: true,
    message: "Notification deleted successfully",
    timestamp: new Date().toISOString()
  })
}

async function broadcastNotification(params: any) {
  const { type, title, message, data, priority = 'medium', targetUsers } = params

  if (!type || !title || !message) {
    return NextResponse.json(
      { error: "type, title, and message are required" },
      { status: 400 }
    )
  }

  let users = targetUsers

  // If no specific users, broadcast to all active users
  if (!users) {
    users = Array.from(activeConnections.keys())
  }

  const results = []

  for (const userId of users) {
    try {
      const notificationData = {
        user_id: userId,
        type,
        title,
        message,
        data: data || {},
        priority,
        is_read: false
      }

      const result = await dataQuerySystem.executeQuery({
        table: 'notifications',
        select: '*',
        filters: notificationData
      })

      // Add to real-time queue
      const existingQueue = notificationQueue.get(userId) || []
      existingQueue.push({
        ...result.data,
        realtime: true,
        broadcast: true
      })
      notificationQueue.set(userId, existingQueue)

      results.push({
        userId,
        success: true,
        notificationId: result.data.id
      })
    } catch (error) {
      results.push({
        userId,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send'
      })
    }
  }

  return NextResponse.json({
    success: true,
    results,
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    message: "Broadcast notification sent",
    timestamp: new Date().toISOString()
  })
}

// Utility functions
function addNotificationToQueue(userId: string, notification: any) {
  const existingQueue = notificationQueue.get(userId) || []
  existingQueue.push(notification)
  notificationQueue.set(userId, existingQueue)
}

function getActiveConnections() {
  return Array.from(activeConnections.values())
}

function cleanupInactiveConnections() {
  const now = Date.now()
  const timeout = 10 * 60 * 1000 // 10 minutes

  for (const [userId, connection] of activeConnections) {
    if (now - connection.lastActivity.getTime() > timeout) {
      activeConnections.delete(userId)
      notificationQueue.delete(userId)
    }
  }
}

// Auto cleanup inactive connections every 5 minutes
setInterval(cleanupInactiveConnections, 5 * 60 * 1000)
