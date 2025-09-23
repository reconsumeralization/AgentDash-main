import { type NextRequest, NextResponse } from "next/server"
import { integrationFramework, IntegrationDefinition } from "@/lib"
import { rateLimit } from "@/lib"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    try {
      await limiter.check(20, ip); // 20 integration management requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    // Input validation
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: "Request body must be a valid JSON object" },
        { status: 400 }
      );
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: "action parameter is required and must be a string" },
        { status: 400 }
      );
    }

    // Set up timeout for long-running operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 seconds
    });

    const startTime = Date.now();
    
    let result: any;

    switch (action) {
      case 'create_instance':
        result = await Promise.race([handleCreateInstance(params), timeoutPromise]);
        break;
      case 'execute_action':
        result = await Promise.race([handleExecuteAction(params), timeoutPromise]);
        break;
      case 'create_workflow':
        result = await Promise.race([handleCreateWorkflow(params), timeoutPromise]);
        break;
      case 'execute_workflow':
        result = await Promise.race([handleExecuteWorkflow(params), timeoutPromise]);
        break;
      case 'register_integration':
        result = await Promise.race([handleRegisterIntegration(params), timeoutPromise]);
        break;
      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }

    // Log performance metrics
    const processingTime = Date.now() - startTime;
    console.log(`Integration API Success - Action: ${action}, Duration: ${processingTime}ms`);

    return result;

  } catch (error) {
    console.error("Integration management error:", error);

    // The 'action' variable might not be available here if request.json() fails
    // We can add a check or log a generic error
    const action = (await request.clone().json().catch(() => ({}))).action || 'unknown';

    // Log performance metrics for error analysis
    const errorTimestamp = Date.now();
    console.log(`Integration API Error - Action: ${action}, Duration: ${errorTimestamp - Date.now()}ms`);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Integration management failed",
        timestamp: new Date().toISOString(),
        requestId: `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      { status: 500 }
    );
  }

}

async function handleCreateInstance(params: any) {
  const { definitionId, name, credentials, config } = params

  if (!definitionId || !name || !credentials) {
    return NextResponse.json(
      { error: "definitionId, name, and credentials are required" },
      { status: 400 }
    )
  }

  const instance = await Promise.race([
    integrationFramework.createInstance(definitionId, name, credentials, config),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Instance creation timeout')), 15000))
  ])

  return NextResponse.json({
    success: true,
    instance,
    timestamp: new Date().toISOString()
  })
}

async function handleExecuteAction(params: any) {
  const { instanceId, action, parameters = {} } = params

  if (!instanceId || !action) {
    return NextResponse.json(
      { error: "instanceId and action are required" },
      { status: 400 }
    )
  }

  const result = await Promise.race([
    integrationFramework.executeAction(instanceId, action, parameters),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Action execution timeout')), 20000))
  ])

  return NextResponse.json({
    success: true,
    result,
    timestamp: new Date().toISOString()
  })
}

async function handleCreateWorkflow(params: any) {
  const { name, description, trigger, actions, enabled = true } = params

  if (!name || !trigger || !actions || !Array.isArray(actions)) {
    return NextResponse.json(
      { error: "name, trigger, and actions array are required" },
      { status: 400 }
    )
  }

  const workflow = integrationFramework.createWorkflow({
    name,
    description,
    trigger,
    actions,
    enabled
  })

  return NextResponse.json({
    success: true,
    workflow,
    timestamp: new Date().toISOString()
  })
}

async function handleExecuteWorkflow(params: any) {
  const { workflowId, triggerData } = params

  if (!workflowId) {
    return NextResponse.json(
      { error: "workflowId is required" },
      { status: 400 }
    )
  }

  await integrationFramework.executeWorkflow(workflowId, triggerData)

  return NextResponse.json({
    success: true,
    message: "Workflow executed successfully",
    timestamp: new Date().toISOString()
  })
}

async function handleRegisterIntegration(params: any) {
  const definition: IntegrationDefinition = params.definition

  if (!definition || !definition.id || !definition.name) {
    return NextResponse.json(
      { error: "Valid integration definition is required" },
      { status: 400 }
    )
  }

  integrationFramework.registerIntegration(definition)

  return NextResponse.json({
    success: true,
    message: `Integration ${definition.name} registered successfully`,
    timestamp: new Date().toISOString()
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'analytics':
        const analytics = integrationFramework.getAnalytics()
        return NextResponse.json({
          success: true,
          analytics,
          timestamp: new Date().toISOString()
        })

      case 'health':
        const health = await integrationFramework.healthCheck()
        return NextResponse.json({
          success: true,
          health,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          message: "Integration framework is operational",
          timestamp: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error("Integration status error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get integration status",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
