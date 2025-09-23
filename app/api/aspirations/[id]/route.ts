import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabase } from '@/lib'

// GET /api/aspirations/[id] - Get specific aspiration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user record
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('aspirations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Aspiration not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ aspiration: data })
  } catch (error) {
    console.error('Error fetching aspiration:', error)
    return NextResponse.json({ error: 'Failed to fetch aspiration' }, { status: 500 })
  }
}

// PUT /api/aspirations/[id] - Update aspiration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, priority, status, progress_percentage, target_date } = body

    // Get user record
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update object with only provided fields
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) updateData.status = status
    if (progress_percentage !== undefined) updateData.progress_percentage = progress_percentage
    if (target_date !== undefined) updateData.target_date = target_date ? new Date(target_date) : null

    const { data, error } = await supabase
      .from('aspirations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Aspiration not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ aspiration: data })
  } catch (error) {
    console.error('Error updating aspiration:', error)
    return NextResponse.json({ error: 'Failed to update aspiration' }, { status: 500 })
  }
}

// DELETE /api/aspirations/[id] - Delete aspiration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user record
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('aspirations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting aspiration:', error)
    return NextResponse.json({ error: 'Failed to delete aspiration' }, { status: 500 })
  }
}
