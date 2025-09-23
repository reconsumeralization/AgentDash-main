import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'connections' | 'tribes' | 'projects' | 'collaborations' || 'connections'

    const visualization = await db.getNetworkVisualizationData(userId, type)
    return NextResponse.json({ visualization })
  } catch (error: any) {
    console.error('Error fetching network visualization data:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()
    const newVisualization = await db.createNetworkVisualizationData(userId, payload)
    return NextResponse.json(newVisualization, { status: 201 })
  } catch (error: any) {
    console.error('Error creating network visualization data:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
