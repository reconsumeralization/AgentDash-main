import { type NextRequest, NextResponse } from "next/server"
import { dynamicAISelector, TaskRequirements } from "@/lib"
import { rateLimit } from "@/lib"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(50, ip) // 50 AI selection requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      task,
      requirements,
      specialization,
      name,
      execute = false
    } = body

    // Input validation
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: "Request body must be a valid JSON object" },
        { status: 400 }
      )
    }

    if (execute !== undefined && typeof execute !== 'boolean') {
      return NextResponse.json(
        { error: "execute parameter must be a boolean" },
        { status: 400 }
      )
    }

    if (task !== undefined && (typeof task !== 'string' || task.length === 0 || task.length > 10000)) {
      return NextResponse.json(
        { error: "task must be a non-empty string (max 10000 characters)" },
        { status: 400 }
      )
    }

    if (specialization !== undefined && (typeof specialization !== 'string' || specialization.length > 200)) {
      return NextResponse.json(
        { error: "specialization must be a string (max 200 characters)" },
        { status: 400 }
      )
    }

    if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
      return NextResponse.json(
        { error: "name must be a string (max 100 characters)" },
        { status: 400 }
      )
    }

    if (!requirements || typeof requirements !== 'object') {
      return NextResponse.json(
        { error: "Task requirements must be provided" },
        { status: 400 }
      )
    }

    const taskRequirements: TaskRequirements = {
      type: requirements.type || 'text-generation',
      complexity: requirements.complexity || 'medium',
      contextLength: requirements.contextLength || 4000,
      speed: requirements.speed || 'balanced',
      cost: requirements.cost || 'balanced',
      language: requirements.language,
      domain: requirements.domain,
      realTime: requirements.realTime || false,
      privacy: requirements.privacy || 'standard'
    }

    if (execute && !task) {
      return NextResponse.json(
        { error: "Task content is required when execute=true" },
        { status: 400 }
      )
    }

    // Set up timeout for long-running operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), execute ? 30000 : 10000) // 30s for execution, 10s for selection
    })

    let result: any

    if (execute) {
      // Execute task with best agent
      result = await Promise.race([
        dynamicAISelector.executeWithBestAgent(task, taskRequirements),
        timeoutPromise
      ])
    } else {
      // Just create agent and get recommendation
      const recommendationPromise = async () => {
        const recommendation = await dynamicAISelector.selectModel(taskRequirements)
        const agent = await dynamicAISelector.createDynamicAgent(
          taskRequirements,
          specialization || `Task Agent for ${taskRequirements.type}`,
          name
        )

        return {
          recommendation,
          agent,
          taskRequirements
        }
      }

      result = await Promise.race([
        recommendationPromise(),
        timeoutPromise
      ])
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
      requestId: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    console.error("AI selection error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "AI selection failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get analytics
    const analytics = dynamicAISelector.getAnalytics()

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Analytics retrieval error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve analytics",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
