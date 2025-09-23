import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { PsychographicPresetInput } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isPublic = searchParams.get('public') === 'true'

    const presets = await db.getPsychographicPresets()
    return NextResponse.json({ presets })
  } catch (error: any) {
    console.error('Error fetching psychographic presets:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: PsychographicPresetInput & { userId: string } = await request.json()
    const newPreset = await db.createPsychographicPreset(userId, payload)
    return NextResponse.json(newPreset, { status: 201 })
  } catch (error: any) {
    console.error('Error creating psychographic preset:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
