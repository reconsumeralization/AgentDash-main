import { type NextRequest, NextResponse } from "next/server"
import { dataQuerySystem } from "@/lib"
import { convertToCSV, convertToXML } from "@/lib/data-export-utils"
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
      await limiter.check(10, ip) // 10 requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const exportType = searchParams.get('type') || 'json'
    const format = searchParams.get('format') || 'json'

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      )
    }

    switch (exportType) {
      case 'user_data':
        return await exportUserData(userId, format)
      case 'aspirations':
        return await exportAspirations(userId, format)
      case 'connections':
        return await exportConnections(userId, format)
      case 'agents':
        return await exportAgents(userId, format)
      case 'workflows':
        return await exportWorkflows(userId, format)
      case 'analytics':
        return await exportAnalytics(userId, format)
      default:
        return NextResponse.json(
          { error: "Invalid export type" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Data export API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to export data",
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
      await limiter.check(5, ip) // 5 requests per minute for imports
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
      case 'import_aspirations':
        return await importAspirations(userId, params)
      case 'import_connections':
        return await importConnections(userId, params)
      case 'bulk_import':
        return await bulkImport(userId, params)
      case 'validate_import':
        return await validateImportData(params)
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Data import API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to import data",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Export functions
async function exportUserData(userId: string, format: string) {
  const exportData = {
    user: null,
    aspirations: [],
    connections: [],
    agents: [],
    workflows: [],
    tribes: [],
    exportDate: new Date().toISOString(),
    version: "1.0"
  }

  // Get all user data
  const [userData, aspirations, connections, agents, workflows, tribes] = await Promise.all([
    dataQuerySystem.executeQuery({
      table: 'users',
      select: '*',
      filters: { id: userId },
      single: true
    }),
    dataQuerySystem.executeQuery({
      table: 'aspirations',
      select: '*',
      filters: { user_id: userId }
    }),
    dataQuerySystem.executeQuery({
      table: 'connections',
      select: '*',
      filters: { user_id: userId }
    }),
    dataQuerySystem.executeQuery({
      table: 'agents',
      select: '*',
      filters: { user_id: userId }
    }),
    dataQuerySystem.executeQuery({
      table: 'workflows',
      select: '*',
      filters: { user_id: userId }
    }),
    dataQuerySystem.executeQuery({
      table: 'tribe_members',
      select: 'tribes(*)',
      filters: { user_id: userId }
    })
  ])

  exportData.user = userData.data
  exportData.aspirations = aspirations.data
  exportData.connections = connections.data
  exportData.agents = agents.data
  exportData.workflows = workflows.data
  exportData.tribes = tribes.data

  return formatResponse(exportData, format, 'user-data-export')
}

async function exportAspirations(userId: string, format: string) {
  const result = await dataQuerySystem.executeQuery({
    table: 'aspirations',
    select: `
      id,
      title,
      description,
      category,
      priority,
      status,
      target_date,
      progress_percentage,
      created_at,
      updated_at
    `,
    filters: { user_id: userId },
    orderBy: { column: 'created_at', ascending: false }
  })

  return formatResponse(result.data, format, 'aspirations-export')
}

async function exportConnections(userId: string, format: string) {
  const result = await dataQuerySystem.executeQuery({
    table: 'connections',
    select: `
      id,
      connected_user_id,
      connection_type,
      aspiration_compatibility,
      relationship_strength,
      shared_aspirations,
      last_interaction,
      conversation_starters,
      created_at,
      updated_at,
      connected_user:users(id, name, avatar_url, linkedin_profile)
    `,
    filters: { user_id: userId },
    orderBy: { column: 'aspiration_compatibility', ascending: false }
  })

  return formatResponse(result.data, format, 'connections-export')
}

async function exportAgents(userId: string, format: string) {
  const result = await dataQuerySystem.executeQuery({
    table: 'agents',
    select: `
      id,
      name,
      type,
      model,
      system_prompt,
      capabilities,
      aspiration_alignment,
      usage_count,
      is_active,
      created_at,
      updated_at
    `,
    filters: { user_id: userId },
    orderBy: { column: 'usage_count', ascending: false }
  })

  return formatResponse(result.data, format, 'agents-export')
}

async function exportWorkflows(userId: string, format: string) {
  const result = await dataQuerySystem.executeQuery({
    table: 'workflows',
    select: `
      id,
      name,
      description,
      steps,
      aspiration_focus,
      tribe_id,
      is_template,
      usage_count,
      created_at,
      updated_at
    `,
    filters: { user_id: userId },
    orderBy: { column: 'created_at', ascending: false }
  })

  return formatResponse(result.data, format, 'workflows-export')
}

async function exportAnalytics(userId: string, format: string) {
  const analyticsData = {
    userId,
    exportDate: new Date().toISOString(),
    metrics: {},
    activity: []
  }

  // Get various analytics data
  const [aspirationStats, connectionStats, agentStats, workflowStats] = await Promise.all([
    dataQuerySystem.executeQuery({
      table: 'aspirations',
      select: 'status, COUNT(*) as count',
      filters: { user_id: userId }
    }),
    dataQuerySystem.executeQuery({
      table: 'connections',
      select: 'connection_type, COUNT(*) as count, AVG(aspiration_compatibility) as avg_compatibility',
      filters: { user_id: userId },
    }),
    dataQuerySystem.executeQuery({
      table: 'agents',
      select: 'type, COUNT(*) as count, SUM(usage_count) as total_usage',
      filters: { user_id: userId },
    }),
    dataQuerySystem.executeQuery({
      table: 'workflows',
      select: 'is_template, COUNT(*) as count, SUM(usage_count) as total_usage',
      filters: { user_id: userId },
    })
  ])

  analyticsData.metrics = {
    aspirations: aspirationStats.data,
    connections: connectionStats.data,
    agents: agentStats.data,
    workflows: workflowStats.data
  }

  return formatResponse(analyticsData, format, 'analytics-export')
}

// Import functions
async function importAspirations(userId: string, params: any) {
  const { aspirations } = params

  if (!aspirations || !Array.isArray(aspirations)) {
    return NextResponse.json(
      { error: "aspirations array is required" },
      { status: 400 }
    )
  }

  const results = []

  for (const aspiration of aspirations) {
    try {
      const importData = {
        ...aspiration,
        user_id: userId,
        created_at: aspiration.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      delete importData.id // Let database generate new ID

      const result = await dataQuerySystem.executeQuery({
        table: 'aspirations',
        select: '*',
        filters: importData
      })

      results.push({
        success: true,
        data: result.data,
        original: aspiration
      })
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
        original: aspiration
      })
    }
  }

  return NextResponse.json({
    success: true,
    results,
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    timestamp: new Date().toISOString()
  })
}

async function importConnections(userId: string, params: any) {
  const { connections } = params

  if (!connections || !Array.isArray(connections)) {
    return NextResponse.json(
      { error: "connections array is required" },
      { status: 400 }
    )
  }

  const results = []

  for (const connection of connections) {
    try {
      const importData = {
        ...connection,
        user_id: userId,
        created_at: connection.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      delete importData.id

      const result = await dataQuerySystem.executeQuery({
        table: 'connections',
        select: '*',
        filters: importData
      })

      results.push({
        success: true,
        data: result.data,
        original: connection
      })
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
        original: connection
      })
    }
  }

  return NextResponse.json({
    success: true,
    results,
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    timestamp: new Date().toISOString()
  })
}

async function bulkImport(userId: string, params: any) {
  const { data, type } = params

  if (!data || !type) {
    return NextResponse.json(
      { error: "data and type are required" },
      { status: 400 }
    )
  }

  switch (type) {
    case 'aspirations':
      return await importAspirations(userId, { aspirations: data })
    case 'connections':
      return await importConnections(userId, { connections: data })
    default:
      return NextResponse.json(
        { error: "Unsupported import type" },
        { status: 400 }
      )
  }
}

async function validateImportData(params: any) {
  const { data, type } = params

  if (!data || !type) {
    return NextResponse.json(
      { error: "data and type are required" },
      { status: 400 }
    )
  }

  const validation: {
    isValid: boolean
    errors: any[]
    warnings: any[]
    summary: {
      total: number
      valid: number
      invalid: number
    }
    results?: any[]
  } = {
    isValid: true,
    errors: [],
    warnings: [],
    summary: {
      total: Array.isArray(data) ? data.length : 1,
      valid: 0,
      invalid: 0
    }
  }

  if (!Array.isArray(data)) {
    return NextResponse.json(
      { error: "data must be an array" },
      { status: 400 }
    )
  }

  // Type-specific validation
  switch (type) {
    case 'aspirations':
      validation.results = data.map(item => validateAspiration(item))
      break
    case 'connections':
      validation.results = data.map(item => validateConnection(item))
      break
    default:
      return NextResponse.json(
        { error: "Unsupported validation type" },
        { status: 400 }
      )
  }

  validation.summary.valid = validation.results?.filter((r: any) => r.isValid).length || 0
  validation.summary.invalid = validation.results?.filter((r: any) => !r.isValid).length || 0

  return NextResponse.json({
    success: true,
    validation,
    timestamp: new Date().toISOString()
  })
}

// Validation helper functions
function validateAspiration(aspiration: any) {
  const errors = []

  if (!aspiration.title || typeof aspiration.title !== 'string') {
    errors.push('title is required and must be a string')
  }

  if (!aspiration.category || !['career', 'skill', 'project', 'cause', 'networking'].includes(aspiration.category)) {
    errors.push('category is required and must be one of: career, skill, project, cause, networking')
  }

  if (!aspiration.priority || !['low', 'medium', 'high', 'critical'].includes(aspiration.priority)) {
    errors.push('priority is required and must be one of: low, medium, high, critical')
  }

  if (!aspiration.status || !['active', 'completed', 'paused', 'cancelled'].includes(aspiration.status)) {
    errors.push('status is required and must be one of: active, completed, paused, cancelled')
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: aspiration
  }
}

function validateConnection(connection: any) {
  const errors = []

  if (!connection.connected_user_id || typeof connection.connected_user_id !== 'string') {
    errors.push('connected_user_id is required and must be a string')
  }

  if (!connection.connection_type || !['linkedin', 'defconect', 'mutual'].includes(connection.connection_type)) {
    errors.push('connection_type is required and must be one of: linkedin, defconect, mutual')
  }

  if (!connection.relationship_strength || !['weak', 'medium', 'strong'].includes(connection.relationship_strength)) {
    errors.push('relationship_strength is required and must be one of: weak, medium, strong')
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: connection
  }
}

// Utility function to format response
function formatResponse(data: any, format: string, filename: string) {
  let contentType = 'application/json'
  let responseData = data

  switch (format) {
    case 'csv':
      if (Array.isArray(data)) {
        responseData = convertToCSV(data)
        contentType = 'text/csv'
      } else {
        responseData = JSON.stringify(data, null, 2)
      }
      break
    case 'xml':
      responseData = convertToXML(data)
      contentType = 'application/xml'
      break
    default:
      responseData = JSON.stringify(data, null, 2)
  }

  return new NextResponse(responseData, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}.${format}"`
    }
  })
}
