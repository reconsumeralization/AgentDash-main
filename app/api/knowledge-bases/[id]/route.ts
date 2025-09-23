import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { KnowledgeBaseInput } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('knowledge_bases')
      .select(`
        *,
        knowledge_base_items (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching knowledge base:', error)
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 })
    }

    return NextResponse.json({ knowledgeBase: data })
  } catch (error) {
    console.error('Error in GET /api/knowledge-bases/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const knowledgeBaseData: KnowledgeBaseInput = body

    const { data, error } = await supabase
      .from('knowledge_bases')
      .update({
        name: knowledgeBaseData.name,
        description: knowledgeBaseData.description,
        category: knowledgeBaseData.category,
        tags: knowledgeBaseData.tags,
        is_public: knowledgeBaseData.is_public,
        access_level: knowledgeBaseData.access_level
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating knowledge base:', error)
      return NextResponse.json({ error: 'Failed to update knowledge base' }, { status: 500 })
    }

    return NextResponse.json({ knowledgeBase: data })
  } catch (error) {
    console.error('Error in PUT /api/knowledge-bases/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase
      .from('knowledge_bases')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting knowledge base:', error)
      return NextResponse.json({ error: 'Failed to delete knowledge base' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/knowledge-bases/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}