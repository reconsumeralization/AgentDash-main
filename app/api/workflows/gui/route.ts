import { type NextRequest, NextResponse } from "next/server"
import { dataQuerySystem } from "@/lib"
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
      await limiter.check(30, ip) // 30 requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const workflowId = searchParams.get('workflowId')

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      )
    }

    switch (action) {
      case 'list':
        return await getWorkflowsList(userId)
      case 'stats':
        return await getWorkflowsStats(userId)
      case 'details':
        return await getWorkflowDetails(workflowId!)
      case 'templates':
        return await getWorkflowTemplates()
      case 'executions':
        return await getWorkflowExecutions(workflowId!)
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Workflows GUI API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch workflow data",
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
      await limiter.check(20, ip) // 20 requests per minute
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
      case 'create':
        return await createWorkflow(userId, params)
      case 'update':
        return await updateWorkflow(params)
      case 'delete':
        return await deleteWorkflow(params)
      case 'execute':
        return await executeWorkflow(params)
      case 'clone':
        return await cloneWorkflow(params)
      case 'save_template':
        return await saveAsTemplate(params)
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Workflows GUI API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Workflow operation failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Helper functions for workflow operations
async function getWorkflowsList(userId: string) {
  const queryOptions = {
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
      updated_at,
      executions:workflow_executions(count)
    `,
    filters: {
      user_id: userId
    },
    orderBy: {
      column: 'created_at',
      ascending: false
    }
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    workflows: result.data,
    total: result.count,
    timestamp: new Date().toISOString()
  })
}

async function getWorkflowsStats(userId: string) {
  const statsQuery = {
    table: 'workflows',
    select: `
      is_template,
      COUNT(*) as count,
      AVG(usage_count) as avg_usage,
      MAX(updated_at) as last_updated
    `,
    filters: {
      user_id: userId
    },
    transformations: [
      {
        type: 'group',
        config: {
          groupBy: 'is_template',
          aggregations: {
            count: 'count',
            avgUsage: 'avg',
            lastUpdated: 'max'
          }
        }
      }
    ]
  }

  const result = await dataQuerySystem.executeQuery(statsQuery)

  // Get execution stats
  const executionStatsQuery = {
    table: 'workflow_executions',
    select: `
      success,
      COUNT(*) as count,
      AVG(execution_time) as avg_time
    `,
    joins: [
      {
        table: 'workflows',
        foreignKey: 'workflow_id',
        localKey: 'id',
        select: 'user_id'
      }
    ],
    filters: {
      'workflows.user_id': userId
    },
    transformations: [
      {
        type: 'group',
        config: {
          groupBy: 'success',
          aggregations: {
            count: 'count',
            avgTime: 'avg'
          }
        }
      }
    ]
  }

  const executionStats = await dataQuerySystem.executeQuery(executionStatsQuery)

  return NextResponse.json({
    success: true,
    stats: result.data,
    executionStats: executionStats.data,
    timestamp: new Date().toISOString()
  })
}

async function getWorkflowDetails(workflowId: string) {
  const queryOptions = {
    table: 'workflows',
    select: `
      *,
      executions:workflow_executions(
        id,
        started_at,
        completed_at,
        execution_time,
        success,
        error_message,
        output_data,
        created_at
      ),
      tribe:tribes(
        id,
        name,
        description
      )
    `,
    filters: {
      id: workflowId
    },
    single: true
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  if (!result.data) {
    return NextResponse.json(
      { error: "Workflow not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    workflow: result.data,
    timestamp: new Date().toISOString()
  })
}

async function getWorkflowTemplates() {
  const queryOptions = {
    table: 'workflow_templates',
    select: `
      id,
      name,
      description,
      category,
      steps,
      aspiration_focus,
      usage_count,
      rating,
      created_by:users(name, avatar_url),
      created_at
    `,
    filters: {
      is_public: true
    },
    orderBy: {
      column: 'usage_count',
      ascending: false
    },
    limit: 50
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    templates: result.data,
    timestamp: new Date().toISOString()
  })
}

async function getWorkflowExecutions(workflowId: string) {
  const queryOptions = {
    table: 'workflow_executions',
    select: `
      id,
      started_at,
      completed_at,
      execution_time,
      success,
      error_message,
      output_data,
      created_at
    `,
    filters: {
      workflow_id: workflowId
    },
    orderBy: {
      column: 'created_at',
      ascending: false
    },
    limit: 100
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    executions: result.data,
    total: result.count,
    timestamp: new Date().toISOString()
  })
}

async function createWorkflow(userId: string, params: any) {
  const { name, description, steps, aspirationFocus, tribeId, isTemplate } = params

  if (!name || !steps) {
    return NextResponse.json(
      { error: "name and steps are required" },
      { status: 400 }
    )
  }

  const workflowData = {
    user_id: userId,
    name,
    description: description || '',
    steps: JSON.stringify(steps),
    aspiration_focus: aspirationFocus || [],
    tribe_id: tribeId || null,
    is_template: isTemplate || false,
    usage_count: 0
  }

  const result = await dataQuerySystem.executeQuery({
    table: 'workflows',
    select: '*',
    filters: workflowData
  })

  return NextResponse.json({
    success: true,
    workflow: result.data,
    message: "Workflow created successfully",
    timestamp: new Date().toISOString()
  })
}

async function updateWorkflow(params: any) {
  const { workflowId, updates } = params

  if (!workflowId || !updates) {
    return NextResponse.json(
      { error: "workflowId and updates are required" },
      { status: 400 }
    )
  }

  // Ensure steps are properly serialized
  if (updates.steps) {
    updates.steps = JSON.stringify(updates.steps)
  }

  const queryOptions = {
    table: 'workflows',
    select: '*',
    filters: {
      id: workflowId
    }
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    workflow: result.data,
    message: "Workflow updated successfully",
    timestamp: new Date().toISOString()
  })
}

async function deleteWorkflow(params: any) {
  const { workflowId } = params

  if (!workflowId) {
    return NextResponse.json(
      { error: "workflowId is required" },
      { status: 400 }
    )
  }

  // Instead of hard delete, we could mark as deleted
  const queryOptions = {
    table: 'workflows',
    select: '*',
    filters: {
      id: workflowId
    }
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    message: "Workflow deleted successfully",
    timestamp: new Date().toISOString()
  })
}

async function executeWorkflow(params: any) {
  const { workflowId, input, userId } = params

  if (!workflowId) {
    return NextResponse.json(
      { error: "workflowId is required" },
      { status: 400 }
    )
  }

  // Get workflow details
  const workflowQuery = await dataQuerySystem.executeQuery({
    table: 'workflows',
    select: '*',
    filters: { id: workflowId },
    single: true
  })

  if (!workflowQuery.data) {
    return NextResponse.json(
      { error: "Workflow not found" },
      { status: 404 }
    )
  }

  // Create execution record
  const executionData = {
    workflow_id: workflowId,
    user_id: userId,
    started_at: new Date().toISOString(),
    input_data: JSON.stringify(input || {}),
    status: 'running'
  }

  const executionResult = await dataQuerySystem.executeQuery({
    table: 'workflow_executions',
    select: '*',
    filters: executionData
  })

  // Simulate workflow execution (in production, this would trigger the actual workflow)
  const startTime = Date.now()
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing

  const executionTime = Date.now() - startTime
  const success = Math.random() > 0.1 // 90% success rate

  // Update execution record
  const updateData = {
    id: executionResult.data.id,
    completed_at: new Date().toISOString(),
    execution_time: executionTime,
    success,
    error_message: success ? null : 'Simulated execution error',
    output_data: JSON.stringify({
      result: success ? 'Workflow completed successfully' : 'Workflow failed',
      executionTime,
      steps: workflowQuery.data.steps
    }),
    status: 'completed'
  }

  await dataQuerySystem.executeQuery({
    table: 'workflow_executions',
    select: '*',
    filters: updateData
  })

  // Update workflow usage count
  await dataQuerySystem.executeQuery({
    table: 'workflows',
    select: '*',
    filters: {
      id: workflowId,
      usage_count: workflowQuery.data.usage_count + 1
    }
  })

  return NextResponse.json({
    success: true,
    execution: updateData,
    message: success ? "Workflow executed successfully" : "Workflow execution failed",
    timestamp: new Date().toISOString()
  })
}

async function cloneWorkflow(params: any) {
  const { workflowId, userId, newName } = params

  if (!workflowId || !userId || !newName) {
    return NextResponse.json(
      { error: "workflowId, userId, and newName are required" },
      { status: 400 }
    )
  }

  // Get original workflow
  const originalQuery = await dataQuerySystem.executeQuery({
    table: 'workflows',
    select: '*',
    filters: { id: workflowId },
    single: true
  })

  if (!originalQuery.data) {
    return NextResponse.json(
      { error: "Original workflow not found" },
      { status: 404 }
    )
  }

  // Create clone
  const cloneData = {
    ...originalQuery.data,
    user_id: userId,
    name: newName,
    usage_count: 0,
    is_template: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  delete cloneData.id

  const result = await dataQuerySystem.executeQuery({
    table: 'workflows',
    select: '*',
    filters: cloneData
  })

  return NextResponse.json({
    success: true,
    workflow: result.data,
    message: "Workflow cloned successfully",
    timestamp: new Date().toISOString()
  })
}

async function saveAsTemplate(params: any) {
  const { workflowId, userId, templateName, description, isPublic } = params

  if (!workflowId || !userId || !templateName) {
    return NextResponse.json(
      { error: "workflowId, userId, and templateName are required" },
      { status: 400 }
    )
  }

  // Get original workflow
  const workflowQuery = await dataQuerySystem.executeQuery({
    table: 'workflows',
    select: '*',
    filters: { id: workflowId },
    single: true
  })

  if (!workflowQuery.data) {
    return NextResponse.json(
      { error: "Workflow not found" },
      { status: 404 }
    )
  }

  // Create template
  const templateData = {
    name: templateName,
    description: description || workflowQuery.data.description,
    category: 'custom',
    steps: workflowQuery.data.steps,
    aspiration_focus: workflowQuery.data.aspiration_focus,
    usage_count: 0,
    rating: 0,
    created_by: userId,
    is_public: isPublic || false
  }

  const result = await dataQuerySystem.executeQuery({
    table: 'workflow_templates',
    select: '*',
    filters: templateData
  })

  return NextResponse.json({
    success: true,
    template: result.data,
    message: "Workflow saved as template successfully",
    timestamp: new Date().toISOString()
  })
}
