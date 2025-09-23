import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { KnowledgeBaseItemInput } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType')
    const sourceType = searchParams.get('sourceType')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')

    const { id } = await params
    
    let query = supabase
      .from('knowledge_base_items')
      .select('*')
      .eq('knowledge_base_id', id)
      .order('created_at', { ascending: false })

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    if (sourceType) {
      query = query.eq('source_type', sourceType)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,searchable_content.ilike.%${search}%`)
    }

    if (tags) {
      const tagArray = tags.split(',')
      query = query.overlaps('tags', tagArray)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching knowledge base items:', error)
      return NextResponse.json({ error: 'Failed to fetch knowledge base items' }, { status: 500 })
    }

    return NextResponse.json({ items: data })
  } catch (error) {
    console.error('Error in GET /api/knowledge-bases/[id]/items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, ...itemData }: { userId: string } & KnowledgeBaseItemInput = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!itemData.title) {
      return NextResponse.json({ error: 'Item title is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('knowledge_base_items')
      .insert({
        knowledge_base_id: id,
        user_id: userId,
        title: itemData.title,
        content: itemData.content,
        content_type: itemData.content_type,
        source_type: itemData.source_type,
        source_url: itemData.source_url,
        file_path: itemData.file_path,
        file_size_bytes: itemData.file_size_bytes || 0,
        metadata: itemData.metadata || {},
        tags: itemData.tags || [],
        is_processed: false,
        processing_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating knowledge base item:', error)
      return NextResponse.json({ error: 'Failed to create knowledge base item' }, { status: 500 })
    }

    // Update knowledge base item count and total size
    await supabase.rpc('increment_knowledge_base_stats', {
      kb_id: id,
      size_delta: itemData.file_size_bytes || 0
    })

    return NextResponse.json({ item: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/knowledge-bases/[id]/items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
