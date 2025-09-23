import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib'
import { z } from 'zod'

const DEMO_CLERK_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user-1'
const DEMO_DEFAULTS = { email: 'demo@defconect.com', name: 'Demo User' }

const contextSchema = z.object({
  session_id: z.string().optional(),
  aspirations_discussed: z.array(z.string()).optional(),
  topics_covered: z.array(z.string()).optional(),
  goals_progress: z.record(z.any()).optional(),
  last_context: z.string().nullable().optional(),
  conversation_summary: z.string().nullable().optional()
})

type ContextInput = z.infer<typeof contextSchema>

async function resolveUser(request: NextRequest) {
  let clerkId: string | null = null

  try {
    const auth = getAuth(request)
    if (auth?.userId) {
      clerkId = auth.userId
    }
  } catch {
    clerkId = null
  }

  if (!clerkId) {
    clerkId = DEMO_CLERK_ID
    return db.getOrCreateUserByClerkId(clerkId, DEMO_DEFAULTS)
  }

  return db.getOrCreateUserByClerkId(clerkId)
}

function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.flatten()
    },
    { status: 400 }
  )
}

// GET /api/context - Get user's conversation context
export async function GET(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id') || 'default'

    const context = await db.getConversationContext(user.id, sessionId)

    return NextResponse.json({ context })
  } catch (error) {
    console.error('Error fetching conversation context:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation context' }, { status: 500 })
  }
}

// POST /api/context - Save or update conversation context
export async function POST(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    const json = await request.json()
    const parsed = contextSchema.safeParse(json)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const data: ContextInput = parsed.data
    const sessionId = data.session_id || 'default'

    const existing = await db.getConversationContext(user.id, sessionId)
    const context = await db.upsertConversationContext(user.id, sessionId, {
      aspirations_discussed: data.aspirations_discussed,
      topics_covered: data.topics_covered,
      goals_progress: data.goals_progress,
      last_context: data.last_context ?? null,
      conversation_summary: data.conversation_summary ?? null
    })

    return NextResponse.json({ context }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Error saving conversation context:', error)
    return NextResponse.json({ error: 'Failed to save conversation context' }, { status: 500 })
  }
}

// DELETE /api/context - Clear conversation context
export async function DELETE(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id') || 'default'

    await db.clearConversationContext(user.id, sessionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation context:', error)
    return NextResponse.json({ error: 'Failed to delete conversation context' }, { status: 500 })
  }
}
