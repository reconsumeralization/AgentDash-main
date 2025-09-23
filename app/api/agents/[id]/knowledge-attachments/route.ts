import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AgentKnowledgeAttachmentInput } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('agent_knowledge_attachments')
      .select(`
        *,
        knowledge_bases (*)
      `)
      .eq('agent_id', id)
      .order('attachment_priority', { ascending: false })

    if (error) {
      console.error('Error fetching agent knowledge attachments:', error)
      return NextResponse.json({ error: 'Failed to fetch agent knowledge attachments' }, { status: 500 })
    }

    return NextResponse.json({ attachments: data })
  } catch (error) {
    console.error('Error in GET /api/agents/[id]/knowledge-attachments:', error)
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
    const attachmentData: AgentKnowledgeAttachmentInput = body

    if (!attachmentData.knowledge_base_id) {
      return NextResponse.json({ error: 'Knowledge base ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('agent_knowledge_attachments')
      .insert({
        agent_id: id,
        knowledge_base_id: attachmentData.knowledge_base_id,
        attachment_type: attachmentData.attachment_type || 'full',
        filter_criteria: attachmentData.filter_criteria || {},
        selected_item_ids: attachmentData.selected_item_ids || [],
        attachment_priority: attachmentData.attachment_priority || 1,
        is_auto_attached: attachmentData.is_auto_attached || false,
        attachment_reason: attachmentData.attachment_reason,
        usage_count: 0
      })
      .select(`
        *,
        knowledge_bases (*)
      `)
      .single()

    if (error) {
      console.error('Error creating agent knowledge attachment:', error)
      return NextResponse.json({ error: 'Failed to create agent knowledge attachment' }, { status: 500 })
    }

    return NextResponse.json({ attachment: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/agents/[id]/knowledge-attachments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
