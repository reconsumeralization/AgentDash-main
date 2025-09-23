import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { ProjectFileInput } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params
    const files = await db.getProjectFiles(projectId, userId)
    return NextResponse.json({ files })
  } catch (error: any) {
    console.error(`Error fetching project files:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params
    const payload: Omit<ProjectFileInput, 'project_id'> = await request.json()
    const newFile = await db.createProjectFile(projectId, userId, payload)
    return NextResponse.json(newFile, { status: 201 })
  } catch (error: any) {
    console.error(`Error creating project file:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}