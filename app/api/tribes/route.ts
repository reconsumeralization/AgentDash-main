import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib'
import type { Tribe } from '@/lib'

// GET /api/tribes - Get tribes (public read)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const aspirationFocus = searchParams.get('aspiration_focus')?.split(',') || []

    const tribes = await db.getTribes(limit, offset, aspirationFocus.length > 0 ? aspirationFocus : undefined)

    return NextResponse.json({ tribes })
  } catch (error) {
    console.error('Error fetching tribes:', error)
    return NextResponse.json({ error: 'Failed to fetch tribes' }, { status: 500 })
  }
}

// POST /api/tribes - Create new tribe
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, aspiration_focus } = body

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
    }

    // Get user record
    const user = await db.getOrCreateUserByClerkId(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const newTribe = {
      name,
      description,
      type: 'professional' as const,
      visibility: 'public' as const,
      members: [],
      moderators: [],
      rules: [],
      goals: [],
      metrics: {
        totalMembers: 1,
        activeMembers: 1,
        engagementRate: 0,
        growthRate: 0,
        retentionRate: 0,
        likeMindednessIndex: 0,
        aspirationAlignment: 0,
        collaborationScore: 0,
        knowledgeSharing: 0,
        crossPlatformActivity: 0,
        projectSuccess: 0,
        socialImpact: 0
      },
      socialMediaConnections: [],
      projectConnections: [],
      status: 'active' as const,
      founder_id: user.id,
      aspiration_focus: aspiration_focus || [],
      member_count: 1,
      skill_complementarity: { 'general': 0.8 },
      growth_potential: 0.7
    }

    const tribe = await db.createTribe(newTribe)

    return NextResponse.json({ tribe }, { status: 201 })
  } catch (error) {
    console.error('Error creating tribe:', error)
    return NextResponse.json({ error: 'Failed to create tribe' }, { status: 500 })
  }
}
