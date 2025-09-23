import { type NextRequest, NextResponse } from "next/server"
import { dataQuerySystem } from "@/lib"
import { dynamicAISelector } from "@/lib"
import { rateLimit } from "@/lib"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(20, ip) // 20 requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeframe = searchParams.get('timeframe') || '7d'
    const metric = searchParams.get('metric')

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      )
    }

    const dateFilter = getDateFilter(timeframe)

    switch (metric) {
      case 'overview':
        return await getOverviewMetrics(userId, dateFilter)
      case 'agents':
        return await getAgentMetrics(userId, dateFilter)
      case 'workflows':
        return await getWorkflowMetrics(userId, dateFilter)
      case 'aspirations':
        return await getAspirationMetrics(userId, dateFilter)
      case 'connections':
        return await getConnectionMetrics(userId, dateFilter)
      case 'ai_usage':
        return await getAIUsageMetrics(userId, dateFilter)
      default:
        return await getDashboardOverview(userId, dateFilter)
    }

  } catch (error) {
    console.error("Dashboard analytics API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch dashboard data",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function getDateFilter(timeframe: string) {
  const now = new Date()
  const startDate = new Date()

  switch (timeframe) {
    case '1d':
      startDate.setDate(now.getDate() - 1)
      break
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    default:
      startDate.setDate(now.getDate() - 7)
  }

  return {
    start: startDate.toISOString(),
    end: now.toISOString()
  }
}

async function getDashboardOverview(userId: string, dateFilter: any) {
  // Get comprehensive overview metrics
  const [userStats, aspirationStats, connectionStats, agentStats, workflowStats] = await Promise.all([
    getUserOverviewStats(userId, dateFilter),
    getAspirationStats(userId, dateFilter),
    getConnectionStats(userId, dateFilter),
    getAgentStats(userId, dateFilter),
    getWorkflowStats(userId, dateFilter)
  ])

  // Get recent activity
  const recentActivity = await getRecentActivity(userId, dateFilter)

  // Get AI analytics
  const aiAnalytics = dynamicAISelector.getAnalytics()

  return NextResponse.json({
    success: true,
    overview: {
      user: userStats,
      aspirations: aspirationStats,
      connections: connectionStats,
      agents: agentStats,
      workflows: workflowStats,
      ai: aiAnalytics
    },
    recentActivity,
    timeframe: dateFilter,
    timestamp: new Date().toISOString()
  })
}

async function getOverviewMetrics(userId: string, dateFilter: any) {
  const metricsQuery = {
    table: 'user_metrics',
    select: `
      metric_type,
      value,
      created_at
    `,
    filters: {
      user_id: userId,
      created_at: {
        operator: 'range',
        value: [dateFilter.start, dateFilter.end]
      }
    },
  }

  const result = await dataQuerySystem.executeQuery(metricsQuery)

  return NextResponse.json({
    success: true,
    metrics: result.data,
    timeframe: dateFilter,
    timestamp: new Date().toISOString()
  })
}

async function getAgentMetrics(userId: string, dateFilter: any) {
  const agentMetricsQuery = {
    table: 'agents',
    select: `
      id,
      name,
      type,
      usage_count,
      created_at,
      executions:agent_executions(
        success,
        execution_time,
        tokens_used,
        created_at
      )
    `,
    filters: {
      user_id: userId,
      is_active: true
    },
  }

  const result = await dataQuerySystem.executeQuery(agentMetricsQuery)

  return NextResponse.json({
    success: true,
    agents: result.data,
    summary: {
      totalAgents: result.data?.length || 0,
      activeAgents: result.data?.filter((a: any) => a.usage_count > 0).length || 0,
      totalExecutions: result.data?.reduce((sum: number, a: any) => sum + (a.executions?.total || 0), 0) || 0,
      avgSuccessRate: result.data?.reduce((sum: number, a: any) => sum + (a.executions?.successful / Math.max(a.executions?.total, 1)), 0) / result.data?.length || 0
    },
    timeframe: dateFilter,
    timestamp: new Date().toISOString()
  })
}

async function getWorkflowMetrics(userId: string, dateFilter: any) {
  const workflowMetricsQuery = {
    table: 'workflows',
    select: `
      id,
      name,
      usage_count,
      created_at,
      executions:workflow_executions(
        success,
        execution_time,
        created_at
      )
    `,
    filters: {
      user_id: userId
    },
  }

  const result = await dataQuerySystem.executeQuery(workflowMetricsQuery)

  return NextResponse.json({
    success: true,
    workflows: result.data,
    summary: {
      totalWorkflows: result.data?.length || 0,
      activeWorkflows: result.data?.filter((w: any) => w.usage_count > 0).length || 0,
      totalExecutions: result.data?.reduce((sum: number, w: any) => sum + (w.executions?.total || 0), 0) || 0,
      avgSuccessRate: result.data?.reduce((sum: number, w: any) => sum + (w.executions?.successful / Math.max(w.executions?.total, 1)), 0) / result.data?.length || 0
    },
    timeframe: dateFilter,
    timestamp: new Date().toISOString()
  })
}

async function getAspirationMetrics(userId: string, dateFilter: any) {
  const aspirationMetricsQuery = {
    table: 'aspirations',
    select: `
      id,
      title,
      category,
      priority,
      status,
      progress_percentage,
      created_at,
      updated_at
    `,
    filters: {
      user_id: userId
    },
  }

  const result = await dataQuerySystem.executeQuery(aspirationMetricsQuery)

  const categoryQuery = {
    table: 'aspirations',
    select: 'category, COUNT(*) as count',
    filters: { user_id: userId },
  }

  const categoryResult = await dataQuerySystem.executeQuery(categoryQuery)

  return NextResponse.json({
    success: true,
    statusBreakdown: result.data,
    categoryBreakdown: categoryResult.data,
    summary: {
      totalAspirations: result.data?.reduce((sum: number, s: any) => sum + s.count, 0) || 0,
      completedAspirations: result.data?.find((s: any) => s.status === 'completed')?.count || 0,
      avgProgress: result.data?.find((s: any) => s.status === 'active')?.avgProgress || 0
    },
    timeframe: dateFilter,
    timestamp: new Date().toISOString()
  })
}

async function getConnectionMetrics(userId: string, dateFilter: any) {
  const connectionMetricsQuery = {
    table: 'connections',
    select: `
      id,
      connection_type,
      aspiration_compatibility,
      relationship_strength,
      last_interaction,
      created_at
    `,
    filters: {
      user_id: userId
    },
  }

  const result = await dataQuerySystem.executeQuery(connectionMetricsQuery)

  const strengthQuery = {
    table: 'connections',
    select: 'relationship_strength, COUNT(*) as count',
    filters: { user_id: userId },
  }

  const strengthResult = await dataQuerySystem.executeQuery(strengthQuery)

  return NextResponse.json({
    success: true,
    typeBreakdown: result.data,
    strengthBreakdown: strengthResult.data,
    summary: {
      totalConnections: result.data?.reduce((sum: number, c: any) => sum + c.count, 0) || 0,
      avgCompatibility: result.data?.reduce((sum: number, c: any) => sum + c.avgCompatibility, 0) / result.data?.length || 0
    },
    timeframe: dateFilter,
    timestamp: new Date().toISOString()
  })
}

async function getAIUsageMetrics(userId: string, dateFilter: any) {
  // Get AI usage from dynamic AI selector
  const aiAnalytics = dynamicAISelector.getAnalytics()

  // Get user-specific AI usage
  const userAIQuery = {
    table: 'ai_usage',
    select: `
      model,
      tokens_used,
      cost,
      success,
      created_at
    `,
    filters: {
      user_id: userId,
      created_at: {
        operator: 'range',
        value: [dateFilter.start, dateFilter.end]
      }
    },
  }

  const result = await dataQuerySystem.executeQuery(userAIQuery)

  return NextResponse.json({
    success: true,
    usage: result.data,
    systemAnalytics: aiAnalytics,
    summary: {
      totalTokens: result.data?.totalTokens || 0,
      totalCost: result.data?.totalCost || 0,
      totalRequests: result.data?.totalRequests || 0,
      successRate: result.data?.successRate || 0
    },
    timeframe: dateFilter,
    timestamp: new Date().toISOString()
  })
}

async function getUserOverviewStats(userId: string, dateFilter: any) {
  const userQuery = {
    table: 'users',
    select: 'name, avatar_url, created_at',
    filters: { id: userId },
    single: true
  }

  const userResult = await dataQuerySystem.executeQuery(userQuery)

  return {
    profile: userResult.data,
    memberSince: userResult.data?.created_at,
    accountAge: userResult.data ? Math.floor((Date.now() - new Date(userResult.data.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
  }
}

async function getAspirationStats(userId: string, dateFilter: any) {
  const query = {
    table: 'aspirations',
    select: 'COUNT(*) as total, AVG(progress_percentage) as avg_progress',
    filters: { user_id: userId }
  }

  const result = await dataQuerySystem.executeQuery(query)

  return {
    total: result.data?.total || 0,
    avgProgress: result.data?.avg_progress || 0
  }
}

async function getConnectionStats(userId: string, dateFilter: any) {
  const query = {
    table: 'connections',
    select: 'COUNT(*) as total, AVG(aspiration_compatibility) as avg_compatibility',
    filters: { user_id: userId }
  }

  const result = await dataQuerySystem.executeQuery(query)

  return {
    total: result.data?.total || 0,
    avgCompatibility: result.data?.avg_compatibility || 0
  }
}

async function getAgentStats(userId: string, dateFilter: any) {
  const query = {
    table: 'agents',
    select: 'COUNT(*) as total, SUM(usage_count) as total_usage',
    filters: { user_id: userId, is_active: true }
  }

  const result = await dataQuerySystem.executeQuery(query)

  return {
    total: result.data?.total || 0,
    totalUsage: result.data?.total_usage || 0
  }
}

async function getWorkflowStats(userId: string, dateFilter: any) {
  const query = {
    table: 'workflows',
    select: 'COUNT(*) as total, SUM(usage_count) as total_usage',
    filters: { user_id: userId }
  }

  const result = await dataQuerySystem.executeQuery(query)

  return {
    total: result.data?.total || 0,
    totalUsage: result.data?.total_usage || 0
  }
}

async function getRecentActivity(userId: string, dateFilter: any) {
  const activityQuery = {
    table: 'user_activity',
    select: `
      id,
      activity_type,
      description,
      metadata,
      created_at
    `,
    filters: {
      user_id: userId,
      created_at: {
        operator: 'range',
        value: [dateFilter.start, dateFilter.end]
      }
    },
    orderBy: {
      column: 'created_at',
      ascending: false
    },
    limit: 20
  }

  const result = await dataQuerySystem.executeQuery(activityQuery)

  return result.data || []
}
