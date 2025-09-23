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
    const query = searchParams.get('q')
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query) {
      return NextResponse.json(
        { error: "Search query (q) parameter is required" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      )
    }

    const searchResults = await performAdvancedSearch(query, userId, type, limit, offset)

    return NextResponse.json({
      success: true,
      query,
      type,
      results: searchResults,
      total: searchResults.total,
      facets: searchResults.facets,
      metadata: {
        limit,
        offset,
        executionTime: Date.now(),
        searchId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Advanced search API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
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
    const { query, userId, filters, sort, facets } = body

    if (!query || !userId) {
      return NextResponse.json(
        { error: "query and userId are required" },
        { status: 400 }
      )
    }

    const searchResults = await performFilteredSearch(query, userId, filters, sort, facets)

    return NextResponse.json({
      success: true,
      query,
      results: searchResults,
      total: searchResults.total,
      facets: searchResults.facets,
      appliedFilters: filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Filtered search API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Filtered search failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Core search functions
async function performAdvancedSearch(query: string, userId: string, type: string, limit: number, offset: number) {
  const searchTerm = query.toLowerCase().trim()
  const results = {
    aspirations: [],
    connections: [],
    agents: [],
    workflows: [],
    tribes: [],
    total: 0,
    facets: {}
  }

  // Search aspirations
  if (type === 'all' || type === 'aspirations') {
    const aspirationResults = await searchAspirations(searchTerm, userId, limit, offset)
    results.aspirations = aspirationResults.data
    results.total += aspirationResults.count
  }

  // Search connections
  if (type === 'all' || type === 'connections') {
    const connectionResults = await searchConnections(searchTerm, userId, limit, offset)
    results.connections = connectionResults.data
    results.total += connectionResults.count
  }

  // Search agents
  if (type === 'all' || type === 'agents') {
    const agentResults = await searchAgents(searchTerm, userId, limit, offset)
    results.agents = agentResults.data
    results.total += agentResults.count
  }

  // Search workflows
  if (type === 'all' || type === 'workflows') {
    const workflowResults = await searchWorkflows(searchTerm, userId, limit, offset)
    results.workflows = workflowResults.data
    results.total += workflowResults.count
  }

  // Search tribes
  if (type === 'all' || type === 'tribes') {
    const tribeResults = await searchTribes(searchTerm, userId, limit, offset)
    results.tribes = tribeResults.data
    results.total += tribeResults.count
  }

  // Generate facets
  results.facets = await generateSearchFacets(searchTerm, userId)

  return results
}

async function performFilteredSearch(query: string, userId: string, filters: any, sort: any, facets: any) {
  const searchTerm = query.toLowerCase().trim()
  let allResults: any[] = []

  // Apply filters to determine which data types to search
  const searchTypes = filters?.types || ['aspirations', 'connections', 'agents', 'workflows', 'tribes']

  // Perform searches based on filters
  for (const type of searchTypes) {
    let typeResults = []

    switch (type) {
      case 'aspirations':
        typeResults = await searchAspirations(searchTerm, userId, 100, 0)
        break
      case 'connections':
        typeResults = await searchConnections(searchTerm, userId, 100, 0)
        break
      case 'agents':
        typeResults = await searchAgents(searchTerm, userId, 100, 0)
        break
      case 'workflows':
        typeResults = await searchWorkflows(searchTerm, userId, 100, 0)
        break
      case 'tribes':
        typeResults = await searchTribes(searchTerm, userId, 100, 0)
        break
    }

    // Apply additional filters
    if (filters && typeResults.data) {
      typeResults.data = applyAdditionalFilters(typeResults.data, filters, type)
    }

    if (typeResults.data) {
      allResults = allResults.concat(typeResults.data.map((item: any) => ({ ...item, _type: type })))
    }
  }

  // Apply sorting
  if (sort) {
    allResults = applySorting(allResults, sort)
  }

  // Apply facets if requested
  let facetsResult = {}
  if (facets) {
    facetsResult = await generateFilteredFacets(allResults, facets)
  }

  return {
    results: allResults,
    total: allResults.length,
    facets: facetsResult
  }
}

// Individual search functions
async function searchAspirations(searchTerm: string, userId: string, limit: number, offset: number) {
  return await dataQuerySystem.executeQuery({
    table: 'aspirations',
    select: `
      id,
      title,
      description,
      category,
      priority,
      status,
      progress_percentage,
      created_at
    `,
    filters: {
      user_id: userId,
      _or: [
        { title: { operator: 'ilike', value: `%${searchTerm}%` } },
        { description: { operator: 'ilike', value: `%${searchTerm}%` } }
      ]
    },
    orderBy: { column: 'created_at', ascending: false },
    limit,
    offset
  })
}

async function searchConnections(searchTerm: string, userId: string, limit: number, offset: number) {
  return await dataQuerySystem.executeQuery({
    table: 'connections',
    select: `
      id,
      connected_user:users(name, avatar_url),
      connection_type,
      aspiration_compatibility,
      relationship_strength,
      shared_aspirations,
      last_interaction
    `,
    filters: {
      user_id: userId,
      _or: [
        { 'users.name': { operator: 'ilike', value: `%${searchTerm}%` } },
        { shared_aspirations: { operator: 'contains', value: searchTerm } }
      ]
    },
    orderBy: { column: 'aspiration_compatibility', ascending: false },
    limit,
    offset
  })
}

async function searchAgents(searchTerm: string, userId: string, limit: number, offset: number) {
  return await dataQuerySystem.executeQuery({
    table: 'agents',
    select: `
      id,
      name,
      type,
      capabilities,
      usage_count,
      is_active
    `,
    filters: {
      user_id: userId,
      is_active: true,
      _or: [
        { name: { operator: 'ilike', value: `%${searchTerm}%` } },
        { capabilities: { operator: 'contains', value: searchTerm } }
      ]
    },
    orderBy: { column: 'usage_count', ascending: false },
    limit,
    offset
  })
}

async function searchWorkflows(searchTerm: string, userId: string, limit: number, offset: number) {
  return await dataQuerySystem.executeQuery({
    table: 'workflows',
    select: `
      id,
      name,
      description,
      aspiration_focus,
      usage_count,
      is_template
    `,
    filters: {
      user_id: userId,
      _or: [
        { name: { operator: 'ilike', value: `%${searchTerm}%` } },
        { description: { operator: 'ilike', value: `%${searchTerm}%` } }
      ]
    },
    orderBy: { column: 'usage_count', ascending: false },
    limit,
    offset
  })
}

async function searchTribes(searchTerm: string, userId: string, limit: number, offset: number) {
  return await dataQuerySystem.executeQuery({
    table: 'tribe_members',
    select: `
      tribes:(
        id,
        name,
        description,
        aspiration_focus,
        member_count
      )
    `,
    filters: {
      user_id: userId,
      _or: [
        { 'tribes.name': { operator: 'ilike', value: `%${searchTerm}%` } },
        { 'tribes.description': { operator: 'ilike', value: `%${searchTerm}%` } },
        { 'tribes.aspiration_focus': { operator: 'overlaps', value: [searchTerm] } }
      ]
    },
    limit,
    offset
  })
}

// Utility functions
function applyAdditionalFilters(results: any[], filters: any, type: string): any[] {
  let filtered = results

  // Apply category filters
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(item => {
      switch (type) {
        case 'aspirations':
          return filters.categories.includes(item.category)
        case 'connections':
          return filters.categories.includes(item.connection_type)
        case 'agents':
          return filters.categories.includes(item.type)
        default:
          return true
      }
    })
  }

  // Apply status filters
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(item => filters.status.includes(item.status))
  }

  // Apply priority filters
  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(item => filters.priority.includes(item.priority))
  }

  // Apply date range filters
  if (filters.dateRange) {
    const { start, end } = filters.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.created_at)
      const startDate = start ? new Date(start) : null
      const endDate = end ? new Date(end) : null

      if (startDate && itemDate < startDate) return false
      if (endDate && itemDate > endDate) return false
      return true
    })
  }

  return filtered
}

function applySorting(results: any[], sort: any): any[] {
  const { field, direction = 'asc' } = sort

  return results.sort((a, b) => {
    let aVal = a[field]
    let bVal = b[field]

    // Handle nested fields
    if (field.includes('.')) {
      const fields = field.split('.')
      aVal = fields.reduce((obj: any, key: string) => obj?.[key], a)
      bVal = fields.reduce((obj: any, key: string) => obj?.[key], b)
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

async function generateSearchFacets(searchTerm: string, userId: string) {
  const facets = {
    categories: {},
    types: {},
    priorities: {},
    statuses: {}
  }

  // Get category distribution for aspirations
  const aspirationCategories = await dataQuerySystem.executeQuery({
    table: 'aspirations',
    select: 'category, COUNT(*) as count',
    filters: { user_id: userId }
  })

  facets.categories = aspirationCategories.data?.reduce((acc: any, item: any) => {
    acc[item.category] = item.count
    return acc
  }, {}) || {}

  // Get type distribution for agents
  const agentTypes = await dataQuerySystem.executeQuery({
    table: 'agents',
    select: 'type, COUNT(*) as count',
    filters: { user_id: userId, is_active: true }
  })

  facets.types = agentTypes.data?.reduce((acc: any, item: any) => {
    acc[item.type] = item.count
    return acc
  }, {}) || {}

  return facets
}

async function generateFilteredFacets(results: any[], facetConfig: any) {
  const facets: any = {}

  if (facetConfig.includes('categories')) {
    facets.categories = results.reduce((acc: any, item: any) => {
      const category = item.category || item._type
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
  }

  if (facetConfig.includes('priorities')) {
    facets.priorities = results.reduce((acc: any, item: any) => {
      if (item.priority) {
        acc[item.priority] = (acc[item.priority] || 0) + 1
      }
      return acc
    }, {})
  }

  if (facetConfig.includes('statuses')) {
    facets.statuses = results.reduce((acc: any, item: any) => {
      if (item.status) {
        acc[item.status] = (acc[item.status] || 0) + 1
      }
      return acc
    }, {})
  }

  return facets
}
