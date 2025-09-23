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
    const agentId = searchParams.get('agentId')

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      )
    }

    switch (action) {
      case 'list':
        return await getAgentsList(userId)
      case 'stats':
        return await getAgentsStats(userId)
      case 'performance':
        return await getAgentsPerformance(userId)
      case 'details':
        return await getAgentDetails(agentId!)
      case 'marketplace':
        return await getMarketplaceAgents()
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Agents GUI API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch agent data",
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
        return await createAgent(userId, params)
      case 'update':
        return await updateAgent(params)
      case 'delete':
        return await deleteAgent(params)
      case 'execute':
        return await executeAgent(params)
      case 'clone':
        return await cloneAgent(params)
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Agents GUI API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Agent operation failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Helper functions for agent operations
async function getAgentsList(userId: string) {
  const queryOptions = {
    table: 'agents',
    select: `
      id,
      name,
      type,
      model,
      capabilities,
      aspiration_alignment,
      usage_count,
      is_active,
      created_at,
      updated_at
    `,
    filters: {
      user_id: userId,
      is_active: true
    },
    orderBy: {
      column: 'created_at',
      ascending: false
    }
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    agents: result.data,
    total: result.count,
    timestamp: new Date().toISOString()
  })
}

async function getAgentsStats(userId: string) {
  const statsQuery = {
    table: 'agents',
    select: `
      type,
      COUNT(*) as count,
      AVG(usage_count) as avg_usage,
      MAX(updated_at) as last_active
    `,
    filters: {
      user_id: userId,
      is_active: true
    },
  }

  const result = await dataQuerySystem.executeQuery(statsQuery)

  return NextResponse.json({
    success: true,
    stats: result.data,
    timestamp: new Date().toISOString()
  })
}

async function getAgentsPerformance(userId: string) {
  const performanceQuery = {
    table: 'agent_executions',
    select: `
      agent_id,
      execution_time,
      tokens_used,
      success,
      created_at
    `,
    filters: {
      user_id: userId,
      created_at: {
        operator: 'range',
        value: [
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString()
        ]
      }
    },
  }

  const result = await dataQuerySystem.executeQuery(performanceQuery)

  return NextResponse.json({
    success: true,
    performance: result.data,
    timestamp: new Date().toISOString()
  })
}

async function getAgentDetails(agentId: string) {
  const queryOptions = {
    table: 'agents',
    select: `
      *,
      executions:agent_executions(
        id,
        execution_time,
        tokens_used,
        success,
        created_at
      )
    `,
    filters: {
      id: agentId
    },
    single: true
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    agent: result.data,
    timestamp: new Date().toISOString()
  })
}

async function getMarketplaceAgents() {
  // Query for public agents/templates
  const queryOptions = {
    table: 'agent_templates',
    select: `
      id,
      name,
      description,
      type,
      model,
      capabilities,
      system_prompt,
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
    agents: result.data,
    timestamp: new Date().toISOString()
  })
}

async function createAgent(userId: string, params: any) {
  const { name, type, model, systemPrompt, capabilities, aspirationAlignment } = params

  if (!name || !type) {
    return NextResponse.json(
      { error: "name and type are required" },
      { status: 400 }
    )
  }

  // Use dynamic AI selector to recommend optimal model if not specified
  let selectedModel = model
  if (!model) {
    const recommendation = await dynamicAISelector.selectModel({
      type: type,
      complexity: 'medium',
      contextLength: 4000,
      speed: 'balanced',
      cost: 'balanced'
    })
    selectedModel = recommendation.model.id
  }

  const agentData = {
    user_id: userId,
    name,
    type,
    model: selectedModel,
    system_prompt: systemPrompt || '',
    capabilities: capabilities || [],
    aspiration_alignment: aspirationAlignment || [],
    usage_count: 0,
    is_active: true
  }

  const queryOptions = {
    table: 'agents',
    select: '*',
    filters: agentData
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    agent: result.data,
    message: "Agent created successfully",
    timestamp: new Date().toISOString()
  })
}

async function updateAgent(params: any) {
  const { agentId, updates } = params

  if (!agentId || !updates) {
    return NextResponse.json(
      { error: "agentId and updates are required" },
      { status: 400 }
    )
  }

  const queryOptions = {
    table: 'agents',
    select: '*',
    filters: {
      id: agentId
    }
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    agent: result.data,
    message: "Agent updated successfully",
    timestamp: new Date().toISOString()
  })
}

async function deleteAgent(params: any) {
  const { agentId } = params

  if (!agentId) {
    return NextResponse.json(
      { error: "agentId is required" },
      { status: 400 }
    )
  }

  // Soft delete by updating is_active
  const queryOptions = {
    table: 'agents',
    select: '*',
    filters: {
      id: agentId,
      is_active: false
    }
  }

  const result = await dataQuerySystem.executeQuery(queryOptions)

  return NextResponse.json({
    success: true,
    message: "Agent deleted successfully",
    timestamp: new Date().toISOString()
  })
}

async function executeAgent(params: any) {
  const { agentId, input, userId } = params

  if (!agentId || !input) {
    return NextResponse.json(
      { error: "agentId and input are required" },
      { status: 400 }
    )
  }

  // Get agent details
  const agentQuery = await dataQuerySystem.executeQuery({
    table: 'agents',
    select: '*',
    filters: { id: agentId },
    single: true
  })

  if (!agentQuery.data) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    )
  }

  // Execute using dynamic AI selector
  const result = await dynamicAISelector.executeWithBestAgent(
    input,
    {
      type: agentQuery.data.type,
      complexity: 'medium',
      contextLength: 4000,
      speed: 'balanced',
      cost: 'balanced'
    }
  )

  // Update agent usage count
  await dataQuerySystem.executeQuery({
    table: 'agents',
    select: '*',
    filters: {
      id: agentId,
      usage_count: agentQuery.data.usage_count + 1
    }
  })

  return NextResponse.json({
    success: true,
    result: result.result,
    agent: agentQuery.data,
    execution: {
      cost: result.cost,
      latency: result.latency,
      confidence: result.confidence
    },
    timestamp: new Date().toISOString()
  })
}

async function cloneAgent(params: any) {
  const { agentId, userId, newName } = params

  if (!agentId || !userId || !newName) {
    return NextResponse.json(
      { error: "agentId, userId, and newName are required" },
      { status: 400 }
    )
  }

  // Get original agent
  const originalQuery = await dataQuerySystem.executeQuery({
    table: 'agents',
    select: '*',
    filters: { id: agentId },
    single: true
  })

  if (!originalQuery.data) {
    return NextResponse.json(
      { error: "Original agent not found" },
      { status: 404 }
    )
  }

  // Create clone
  const cloneData = {
    ...originalQuery.data,
    user_id: userId,
    name: newName,
    usage_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  delete cloneData.id

  const result = await dataQuerySystem.executeQuery({
    table: 'agents',
    select: '*',
    filters: cloneData
  })

  return NextResponse.json({
    success: true,
    agent: result.data,
    message: "Agent cloned successfully",
    timestamp: new Date().toISOString()
  })
}
