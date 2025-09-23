import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const agentId = searchParams.get('agentId')
    const recommendationType = searchParams.get('type')
    const isApplied = searchParams.get('isApplied')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let query = supabase
      .from('knowledge_recommendations')
      .select(`
        *,
        agents (name, type),
        knowledge_bases (name, description, category)
      `)
      .eq('user_id', userId)
      .order('confidence_score', { ascending: false })

    if (agentId) {
      query = query.eq('agent_id', agentId)
    }

    if (recommendationType) {
      query = query.eq('recommendation_type', recommendationType)
    }

    if (isApplied !== null) {
      query = query.eq('is_applied', isApplied === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching knowledge recommendations:', error)
      return NextResponse.json({ error: 'Failed to fetch knowledge recommendations' }, { status: 500 })
    }

    return NextResponse.json({ recommendations: data })
  } catch (error) {
    console.error('Error in GET /api/knowledge-recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      agentId,
      knowledgeBaseId,
      recommendationType,
      confidenceScore,
      reasoning,
      contextData
    } = body

    if (!userId || !agentId || !knowledgeBaseId || !recommendationType) {
      return NextResponse.json({ 
        error: 'User ID, Agent ID, Knowledge Base ID, and recommendation type are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('knowledge_recommendations')
      .insert({
        user_id: userId,
        agent_id: agentId,
        knowledge_base_id: knowledgeBaseId,
        recommendation_type: recommendationType,
        confidence_score: confidenceScore || 0.0,
        reasoning: reasoning,
        context_data: contextData || {},
        is_applied: false
      })
      .select(`
        *,
        agents (name, type),
        knowledge_bases (name, description, category)
      `)
      .single()

    if (error) {
      console.error('Error creating knowledge recommendation:', error)
      return NextResponse.json({ error: 'Failed to create knowledge recommendation' }, { status: 500 })
    }

    return NextResponse.json({ recommendation: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/knowledge-recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
