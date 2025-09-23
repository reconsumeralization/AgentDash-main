import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { ProjectInput } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const accessLevel = searchParams.get('accessLevel')

    const projects = await db.getProjects(userId, { 
      status: status || undefined, 
      accessLevel: accessLevel || undefined 
    })
    return NextResponse.json({ projects })
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: ProjectInput = await request.json()
    const newProject = await db.createProject(userId, payload)
    return NextResponse.json(newProject, { status: 201 })
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
