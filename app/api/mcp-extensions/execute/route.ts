/**
 * 🚀 MCP EXTENSION EXECUTION API
 * Dedicated endpoint for executing MCP extension tools
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { nativeMCPRegistry } from '@/lib'
import { SecurityHeaders } from '@/lib'

// Request schema for tool execution
const ToolExecutionSchema = z.object({
  extensionId: z.string().min(1, 'Extension ID is required'),
  toolName: z.string().min(1, 'Tool name is required'),
  params: z.any(),
  context: z.object({
    userId: z.string().min(1, 'User ID is required'),
    sessionId: z.string().min(1, 'Session ID is required'),
    requestId: z.string().min(1, 'Request ID is required'),
    permissions: z.array(z.string()).default([]),
    environment: z.enum(['development', 'staging', 'production']).default('development'),
    metadata: z.record(z.any()).default({})
  })
})

// Initialize registry
let registryInitialized = false

async function initializeRegistry() {
  if (!registryInitialized) {
    try {
      await nativeMCPRegistry.initialize()
      registryInitialized = true
    } catch (error) {
      console.error('❌ Failed to initialize registry:', error)
      throw error
    }
  }
}

/**
 * POST /api/mcp-extensions/execute
 * Execute a tool from an MCP extension
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    await initializeRegistry()

    // Parse and validate request body
    const body = await request.json()
    const validationResult = ToolExecutionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request schema',
        details: validationResult.error.errors,
        requestId,
        timestamp: new Date().toISOString()
      }, {
        status: 400,
        headers: SecurityHeaders.getHeaders()
      })
    }

    const { extensionId, toolName, params, context } = validationResult.data

    // Enhanced context with request metadata
    const enhancedContext = {
      ...context,
      requestId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    }

    console.log(`🎯 Executing tool: ${extensionId}.${toolName}`)

    // Execute the tool
    const result = await nativeMCPRegistry.executeTool(
      extensionId,
      toolName,
      params,
      enhancedContext
    )

    const executionTime = Date.now() - startTime

    console.log(`✅ Tool execution completed: ${extensionId}.${toolName} (${executionTime}ms)`)

    return NextResponse.json({
      success: true,
      data: result,
      requestId,
      executionTime,
      timestamp: new Date().toISOString()
    }, {
      headers: SecurityHeaders.getHeaders()
    })

  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error(`❌ Tool execution failed: ${requestId}`, error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId,
      executionTime,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: SecurityHeaders.getHeaders()
    })
  }
}

/**
 * GET /api/mcp-extensions/execute
 * Get available tools for execution
 */
export async function GET(request: NextRequest) {
  try {
    await initializeRegistry()

    const url = new URL(request.url)
    const extensionId = url.searchParams.get('extensionId')

    let tools

    if (extensionId) {
      // Get tools for specific extension
      tools = nativeMCPRegistry.getExtensionTools(extensionId)
    } else {
      // Get all tools
      tools = nativeMCPRegistry.getAllTools()
    }

    return NextResponse.json({
      success: true,
      data: {
        tools,
        extensionId: extensionId || 'all'
      },
      timestamp: new Date().toISOString()
    }, {
      headers: SecurityHeaders.getHeaders()
    })

  } catch (error) {
    console.error('❌ Error getting tools:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: SecurityHeaders.getHeaders()
    })
  }
}
