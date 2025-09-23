import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib'
import { z } from 'zod'

const DEMO_CLERK_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user-1'
const DEMO_DEFAULTS = { email: 'demo@defconect.com', name: 'Demo User' }

const aspirationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['career', 'skill', 'project', 'cause', 'networking']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  target_date: z.string().optional()
})

type AspirationInput = z.infer<typeof aspirationSchema>

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

// GET /api/aspirations - Get user's aspirations
export async function GET(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    const aspirations = await db.getUserAspirations(user.id)

    return NextResponse.json({ aspirations })
  } catch (error) {
    console.error('Error fetching aspirations:', error)
    return NextResponse.json({ error: 'Failed to fetch aspirations' }, { status: 500 })
  }
}

// POST /api/aspirations - Create new aspiration
export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = aspirationSchema.safeParse(json)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const data: AspirationInput = parsed.data
    const user = await resolveUser(request)

    const aspiration = await db.createAspiration({
      user_id: user.id,
      title: data.title,
      description: data.description ?? '',
      category: data.category,
      priority: data.priority,
      status: 'active',
      progress_percentage: 0,
      ...(data.target_date ? { target_date: data.target_date } : {})
    })

    return NextResponse.json({ aspiration }, { status: 201 })
  } catch (error) {
    console.error('Error creating aspiration:', error)
    return NextResponse.json({ error: 'Failed to create aspiration' }, { status: 500 })
  }
}
