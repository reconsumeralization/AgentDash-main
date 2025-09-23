/**
 * 🚀 NATIVE MCP EXTENSIONS API
 * API endpoints for managing and executing MCP extensions
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { nativeMCPRegistry } from '@/lib'
import { CodeAnalysisMCPExtension, DevelopmentToolsMCPExtension } from '@/lib'
import { SecurityHeaders } from '@/lib'

// Request schemas
const ExecuteToolSchema = z.object({
  extensionId: z.string().min(1),
  toolName: z.string().min(1),
  params: z.any(),
  context: z.object({
    userId: z.string().min(1),
    sessionId: z.string().min(1),
    requestId: z.string().min(1),
    permissions: z.array(z.string()).default([]),
    environment: z.enum(['development', 'staging', 'production']).default('development'),
    metadata: z.record(z.any()).default({})
  })
})

const RegisterExtensionSchema = z.object({
  extensionType: z.enum(['code-analysis', 'development-tools', 'custom']),
  config: z.record(z.any()).optional()
})

// Initialize registry on startup
let registryInitialized = false

async function initializeRegistry() {
  if (!registryInitialized) {
    try {
      await nativeMCPRegistry.initialize()
      registryInitialized = true
      console.log('✅ Native MCP Registry initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Native MCP Registry:', error)
      throw error
    }
  }
}

/**
 * GET /api/mcp-extensions
 * Get all available extensions and their tools
 */
export async function GET(request: NextRequest) {
  try {
    await initializeRegistry()

    const extensions = nativeMCPRegistry.getAvailableExtensions()
    const allTools = nativeMCPRegistry.getAllTools()
    const status = nativeMCPRegistry.getRegistryStatus()

    return NextResponse.json({
      success: true,
      data: {
        extensions,
        tools: allTools,
        status
      },
      timestamp: new Date().toISOString()
    }, {
      headers: SecurityHeaders.getHeaders()
    })

  } catch (error) {
    console.error('❌ Error getting MCP extensions:', error)
    
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

/**
 * POST /api/mcp-extensions/execute
 * Execute a tool from an MCP extension
 */
export async function POST(request: NextRequest) {
  try {
    await initializeRegistry()

    const body = await request.json()
    const validationResult = ExecuteToolSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request schema',
        details: validationResult.error.errors,
        timestamp: new Date().toISOString()
      }, {
        status: 400,
        headers: SecurityHeaders.getHeaders()
      })
    }

    const { extensionId, toolName, params, context } = validationResult.data

    // Execute the tool
    const result = await nativeMCPRegistry.executeTool(
      extensionId,
      toolName,
      params,
      context
    )

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    }, {
      headers: SecurityHeaders.getHeaders()
    })

  } catch (error) {
    console.error('❌ Error executing MCP tool:', error)
    
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

/**
 * PUT /api/mcp-extensions/register
 * Register a new MCP extension
 */
export async function PUT(request: NextRequest) {
  try {
    await initializeRegistry()

    const body = await request.json()
    const validationResult = RegisterExtensionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request schema',
        details: validationResult.error.errors,
        timestamp: new Date().toISOString()
      }, {
        status: 400,
        headers: SecurityHeaders.getHeaders()
      })
    }

    const { extensionType, config = {} } = validationResult.data

    let extension

    // Create extension based on type
    switch (extensionType) {
      case 'code-analysis':
        extension = new CodeAnalysisMCPExtension()
        break
      case 'development-tools':
        extension = new DevelopmentToolsMCPExtension()
        break
      case 'custom':
        // For custom extensions, config should contain the extension definition
        throw new Error('Custom extensions not yet implemented')
      default:
        throw new Error(`Unknown extension type: ${extensionType}`)
    }

    // Register the extension
    await nativeMCPRegistry.registerExtension(extension)

    return NextResponse.json({
      success: true,
      data: {
        extensionId: extension.getStatus().config.id,
        message: 'Extension registered successfully'
      },
      timestamp: new Date().toISOString()
    }, {
      headers: SecurityHeaders.getHeaders()
    })

  } catch (error) {
    console.error('❌ Error registering MCP extension:', error)
    
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

/**
 * DELETE /api/mcp-extensions/[extensionId]
 * Unregister an MCP extension
 */
export async function DELETE(request: NextRequest) {
  try {
    await initializeRegistry()

    const url = new URL(request.url)
    const extensionId = url.searchParams.get('extensionId')

    if (!extensionId) {
      return NextResponse.json({
        success: false,
        error: 'Extension ID is required',
        timestamp: new Date().toISOString()
      }, {
        status: 400,
        headers: SecurityHeaders.getHeaders()
      })
    }

    // Unregister the extension
    await nativeMCPRegistry.unregisterExtension(extensionId)

    return NextResponse.json({
      success: true,
      data: {
        message: 'Extension unregistered successfully'
      },
      timestamp: new Date().toISOString()
    }, {
      headers: SecurityHeaders.getHeaders()
    })

  } catch (error) {
    console.error('❌ Error unregistering MCP extension:', error)
    
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
