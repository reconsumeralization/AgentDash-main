import { NextRequest, NextResponse } from 'next/server'
import { supabase, db } from '@/lib/supabase'
import { KnowledgeBaseInput } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let query = supabase
      .from('knowledge_bases')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching knowledge bases:', error)
      return NextResponse.json({ error: 'Failed to fetch knowledge bases' }, { status: 500 })
    }

    return NextResponse.json({ knowledgeBases: data })
  } catch (error) {
    console.error('Error in GET /api/knowledge-bases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...knowledgeBaseData }: { userId: string } & KnowledgeBaseInput = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!knowledgeBaseData.name) {
      return NextResponse.json({ error: 'Knowledge base name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('knowledge_bases')
      .insert({
        user_id: userId,
        name: knowledgeBaseData.name,
        description: knowledgeBaseData.description,
        category: knowledgeBaseData.category,
        tags: knowledgeBaseData.tags || [],
        is_public: knowledgeBaseData.is_public || false,
        access_level: knowledgeBaseData.access_level || 'private',
        item_count: 0,
        total_size_bytes: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating knowledge base:', error)
      return NextResponse.json({ error: 'Failed to create knowledge base' }, { status: 500 })
    }

    return NextResponse.json({ knowledgeBase: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/knowledge-bases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
