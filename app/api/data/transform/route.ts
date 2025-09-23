import { type NextRequest, NextResponse } from "next/server"
import { dataQuerySystem, QueryOptions, TransformationRule, DataPipeline } from "@/lib"
import { rateLimit } from "@/lib"
import { convertToCSV, convertToXML } from "@/lib/data-export-utils"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(25, ip) // 25 requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const pipelineId = searchParams.get('pipelineId')

    switch (action) {
      case 'pipelines':
        return await getDataPipelines()
      case 'pipeline':
        return await getDataPipeline(pipelineId!)
      case 'execute':
        return await executeDataPipeline(pipelineId!)
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Data transformation API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process data transformation",
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
      await limiter.check(15, ip) // 15 requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'query':
        return await executeQuery(params)
      case 'transform':
        return await executeTransformation(params)
      case 'create_pipeline':
        return await createDataPipeline(params)
      case 'update_pipeline':
        return await updateDataPipeline(params)
      case 'delete_pipeline':
        return await deleteDataPipeline(params)
      case 'bulk_transform':
        return await executeBulkTransformation(params)
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Data transformation API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Data transformation failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Helper functions for data transformation operations
async function executeQuery(params: any) {
  const { queryOptions, format } = params

  if (!queryOptions || !queryOptions.table) {
    return NextResponse.json(
      { error: "queryOptions with table is required" },
      { status: 400 }
    )
  }

  // Validate query options
  const validatedOptions: QueryOptions = {
    table: queryOptions.table,
    select: queryOptions.select,
    filters: queryOptions.filters,
    joins: queryOptions.joins,
    orderBy: queryOptions.orderBy,
    limit: Math.min(queryOptions.limit || 100, 1000), // Max 1000 records
    offset: queryOptions.offset || 0,
    single: queryOptions.single || false,
    count: queryOptions.count
  }

  const result = await dataQuerySystem.executeQuery(validatedOptions)

  // Format output if requested
  let outputData = result.data
  if (format === 'csv' && Array.isArray(result.data)) {
    outputData = convertToCSV(result.data)
  } else if (format === 'xml' && result.data) {
    outputData = convertToXML(result.data)
  }

  return NextResponse.json({
    success: true,
    data: outputData,
    count: result.count,
    metadata: result.metadata,
    query: validatedOptions,
    timestamp: new Date().toISOString()
  })
}

async function executeTransformation(params: any) {
  const { transformationRule, input } = params

  if (!transformationRule) {
    return NextResponse.json(
      { error: "transformationRule is required" },
      { status: 400 }
    )
  }

  const rule: TransformationRule = {
    id: transformationRule.id || `transform-${Date.now()}`,
    name: transformationRule.name || 'Custom Transformation',
    description: transformationRule.description,
    source: transformationRule.source,
    transformations: transformationRule.transformations || [],
    output: transformationRule.output
  }

  const result = await dataQuerySystem.executeTransformation(rule, input)

  return NextResponse.json({
    success: true,
    data: result,
    transformation: rule,
    timestamp: new Date().toISOString()
  })
}

async function createDataPipeline(params: any) {
  const { pipeline } = params

  if (!pipeline || !pipeline.name) {
    return NextResponse.json(
      { error: "pipeline with name is required" },
      { status: 400 }
    )
  }

  const newPipeline: DataPipeline = {
    id: pipeline.id || `pipeline-${Date.now()}`,
    name: pipeline.name,
    description: pipeline.description,
    steps: pipeline.steps || [],
    triggers: pipeline.triggers,
    cache: pipeline.cache
  }

  dataQuerySystem.registerPipeline(newPipeline)

  return NextResponse.json({
    success: true,
    pipeline: newPipeline,
    message: "Data pipeline created successfully",
    timestamp: new Date().toISOString()
  })
}

async function updateDataPipeline(params: any) {
  const { pipelineId, updates } = params

  if (!pipelineId || !updates) {
    return NextResponse.json(
      { error: "pipelineId and updates are required" },
      { status: 400 }
    )
  }

  const existingPipeline = dataQuerySystem.getPipeline(pipelineId)
  if (!existingPipeline) {
    return NextResponse.json(
      { error: "Pipeline not found" },
      { status: 404 }
    )
  }

  const updatedPipeline: DataPipeline = {
    ...existingPipeline,
    ...updates
  }

  dataQuerySystem.registerPipeline(updatedPipeline)

  return NextResponse.json({
    success: true,
    pipeline: updatedPipeline,
    message: "Data pipeline updated successfully",
    timestamp: new Date().toISOString()
  })
}

async function deleteDataPipeline(params: any) {
  const { pipelineId } = params

  if (!pipelineId) {
    return NextResponse.json(
      { error: "pipelineId is required" },
      { status: 400 }
    )
  }

  const deleted = dataQuerySystem.removePipeline(pipelineId)

  return NextResponse.json({
    success: deleted,
    message: deleted ? "Data pipeline deleted successfully" : "Pipeline not found",
    timestamp: new Date().toISOString()
  })
}

async function getDataPipelines() {
  const pipelines = dataQuerySystem.getPipelines()

  return NextResponse.json({
    success: true,
    pipelines,
    total: pipelines.length,
    timestamp: new Date().toISOString()
  })
}

async function getDataPipeline(pipelineId: string) {
  if (!pipelineId) {
    return NextResponse.json(
      { error: "pipelineId parameter is required" },
      { status: 400 }
    )
  }

  const pipeline = dataQuerySystem.getPipeline(pipelineId)

  if (!pipeline) {
    return NextResponse.json(
      { error: "Pipeline not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    pipeline,
    timestamp: new Date().toISOString()
  })
}

async function executeDataPipeline(pipelineId: string) {
  if (!pipelineId) {
    return NextResponse.json(
      { error: "pipelineId parameter is required" },
      { status: 400 }
    )
  }

  const pipeline = dataQuerySystem.getPipeline(pipelineId)
  if (!pipeline) {
    return NextResponse.json(
      { error: "Pipeline not found" },
      { status: 404 }
    )
  }

  const result = await dataQuerySystem.executePipeline(pipelineId)

  return NextResponse.json({
    success: true,
    data: result,
    pipeline: pipeline.name,
    timestamp: new Date().toISOString()
  })
}

async function executeBulkTransformation(params: any) {
  const { transformations, input } = params

  if (!transformations || !Array.isArray(transformations)) {
    return NextResponse.json(
      { error: "transformations array is required" },
      { status: 400 }
    )
  }

  const results = []

  for (const transformationRule of transformations) {
    try {
      const rule: TransformationRule = {
        id: transformationRule.id || `bulk-transform-${Date.now()}`,
        name: transformationRule.name || 'Bulk Transformation',
        transformations: transformationRule.transformations || [],
        output: transformationRule.output,
        source: ""
      }

      const result = await dataQuerySystem.executeTransformation(rule, input)
      results.push({
        id: rule.id,
        success: true,
        data: result
      })
    } catch (error) {
      results.push({
        id: transformationRule.id,
        success: false,
        error: error instanceof Error ? error.message : 'Transformation failed'
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

// Utility functions are imported from lib/data-export-utils
