/**
 * 🔒 SECURE API ROUTE EXAMPLE
 * Demonstrates secure API patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Example validation schemas
const createAspirationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.string().min(1).max(100),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  target_date: z.string().datetime().optional()
})

const aspirationParamsSchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
})

// GET /api/secure-example - List aspirations with security
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const params = aspirationParamsSchema.parse({
      limit: url.searchParams.get('limit'),
      offset: url.searchParams.get('offset'),
      category: url.searchParams.get('category'),
      priority: url.searchParams.get('priority')
    })

    // Mock secure data access
    const aspirations = [
      {
        id: 'aspiration-1',
        title: 'Become a Senior Software Engineer',
        description: 'Advance my career in software development',
        category: 'career',
        priority: 'high',
        user_id: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      aspirations,
      pagination: {
        limit: parseInt(params.limit || '10'),
        offset: parseInt(params.offset || '0'),
        total: aspirations.length
      }
    })

  } catch (error) {
    console.error('Error in GET /api/secure-example:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/secure-example - Create aspiration with security
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createAspirationSchema.parse(body)

    // Mock secure data creation
    const newAspiration = {
      id: 'new-aspiration-id',
      ...validatedData,
      user_id: 'user-123', // Would come from auth
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(newAspiration, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/secure-example:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}