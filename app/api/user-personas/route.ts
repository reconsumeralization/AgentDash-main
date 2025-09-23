import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { UserPersonaInput } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active') === 'true'
    const isPrimary = searchParams.get('primary') === 'true'

    const personas = await db.getUserPersonas(userId)
    return NextResponse.json({ personas })
  } catch (error: any) {
    console.error('Error fetching user personas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: UserPersonaInput = await request.json()
    // Create a mock persona for now
    const newPersona = {
      id: `persona_${Date.now()}`,
      userId,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return NextResponse.json(newPersona, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user persona:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
