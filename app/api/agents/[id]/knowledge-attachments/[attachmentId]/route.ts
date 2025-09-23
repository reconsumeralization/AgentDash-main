import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AgentKnowledgeAttachmentInput } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const { id, attachmentId } = await params
    const body = await request.json()
    const attachmentData: Partial<AgentKnowledgeAttachmentInput> = body

    const { data, error } = await supabase
      .from('agent_knowledge_attachments')
      .update({
        attachment_type: attachmentData.attachment_type,
        filter_criteria: attachmentData.filter_criteria,
        selected_item_ids: attachmentData.selected_item_ids,
        attachment_priority: attachmentData.attachment_priority,
        attachment_reason: attachmentData.attachment_reason
      })
      .eq('id', attachmentId)
      .eq('agent_id', id)
      .select(`
        *,
        knowledge_bases (*)
      `)
      .single()

    if (error) {
      console.error('Error updating agent knowledge attachment:', error)
      return NextResponse.json({ error: 'Failed to update agent knowledge attachment' }, { status: 500 })
    }

    return NextResponse.json({ attachment: data })
  } catch (error) {
    console.error('Error in PUT /api/agents/[id]/knowledge-attachments/[attachmentId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const { id, attachmentId } = await params
    const { error } = await supabase
      .from('agent_knowledge_attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('agent_id', id)

    if (error) {
      console.error('Error deleting agent knowledge attachment:', error)
      return NextResponse.json({ error: 'Failed to delete agent knowledge attachment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/agents/[id]/knowledge-attachments/[attachmentId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
