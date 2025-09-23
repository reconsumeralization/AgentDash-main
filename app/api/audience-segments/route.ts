import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { AudienceSegmentInput } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active') === 'true'

    const segments = await db.getAudienceSegments(userId, { isActive })
    return NextResponse.json({ segments })
  } catch (error: any) {
    console.error('Error fetching audience segments:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: AudienceSegmentInput = await request.json()
    const newSegment = await db.createAudienceSegment(userId, payload)
    return NextResponse.json(newSegment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating audience segment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
