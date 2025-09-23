import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, agentId, context } = body

    if (!userId || !agentId) {
      return NextResponse.json({ 
        error: 'User ID and Agent ID are required' 
      }, { status: 400 })
    }

    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Get user's knowledge bases
    const { data: knowledgeBases, error: kbError } = await supabase
      .from('knowledge_bases')
      .select('*')
      .eq('user_id', userId)

    if (kbError) {
      console.error('Error fetching knowledge bases:', kbError)
      return NextResponse.json({ error: 'Failed to fetch knowledge bases' }, { status: 500 })
    }

    // Get existing attachments for this agent
    const { data: existingAttachments, error: attachmentError } = await supabase
      .from('agent_knowledge_attachments')
      .select('knowledge_base_id')
      .eq('agent_id', agentId)

    if (attachmentError) {
      console.error('Error fetching existing attachments:', attachmentError)
      return NextResponse.json({ error: 'Failed to fetch existing attachments' }, { status: 500 })
    }

    const attachedKbIds = existingAttachments?.map(a => a.knowledge_base_id) || []

    // AI-powered recommendation logic
    const recommendations = await generateRecommendations(
      agent,
      knowledgeBases || [],
      attachedKbIds,
      context
    )

    // Save recommendations to database
    const recommendationInserts = recommendations.map(rec => ({
      user_id: userId,
      agent_id: agentId,
      knowledge_base_id: rec.knowledgeBaseId,
      recommendation_type: rec.type,
      confidence_score: rec.confidence,
      reasoning: rec.reasoning,
      context_data: context || {},
      is_applied: false
    }))

    if (recommendationInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('knowledge_recommendations')
        .insert(recommendationInserts)

      if (insertError) {
        console.error('Error saving recommendations:', insertError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error in POST /api/knowledge-recommendations/generate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateRecommendations(
  agent: any,
  knowledgeBases: any[],
  attachedKbIds: string[],
  context?: any
) {
  const recommendations: any[] = []

  // Simple recommendation logic based on agent type and knowledge base category
  for (const kb of knowledgeBases) {
    let confidence = 0
    let reasoning = ''
    let type: 'suggest_attach' | 'suggest_detach' | 'suggest_create' = 'suggest_attach'

    // Skip if already attached
    if (attachedKbIds.includes(kb.id)) {
      continue
    }

    // Agent type-based recommendations
    switch (agent.type) {
      case 'research':
        if (kb.category === 'research' || kb.category === 'technical') {
          confidence = 0.9
          reasoning = 'Research agent benefits from technical and research knowledge bases'
        } else if (kb.category === 'business') {
          confidence = 0.7
          reasoning = 'Research agent can benefit from business context knowledge'
        }
        break

      case 'expert':
        if (kb.category === 'technical' || kb.category === 'business') {
          confidence = 0.8
          reasoning = 'Expert agent requires deep technical and business knowledge'
        }
        break

      case 'analysis':
        if (kb.category === 'business' || kb.category === 'research') {
          confidence = 0.8
          reasoning = 'Analysis agent needs business and research data for insights'
        }
        break

      case 'context':
        if (kb.category === 'personal' || kb.category === 'general') {
          confidence = 0.7
          reasoning = 'Context agent benefits from personal and general knowledge'
        }
        break
    }

    // Tag-based matching
    if (agent.capabilities && kb.tags) {
      const matchingTags = agent.capabilities.filter((cap: string) => 
        kb.tags.some((tag: string) => tag.toLowerCase().includes(cap.toLowerCase()))
      )
      if (matchingTags.length > 0) {
        confidence = Math.max(confidence, 0.6 + (matchingTags.length * 0.1))
        reasoning += ` Found ${matchingTags.length} matching capabilities: ${matchingTags.join(', ')}`
      }
    }

    // Aspiration alignment
    if (agent.aspiration_alignment && kb.tags) {
      const matchingAspirations = agent.aspiration_alignment.filter((asp: string) =>
        kb.tags.some((tag: string) => tag.toLowerCase().includes(asp.toLowerCase()))
      )
      if (matchingAspirations.length > 0) {
        confidence = Math.max(confidence, 0.5 + (matchingAspirations.length * 0.15))
        reasoning += ` Aligns with aspirations: ${matchingAspirations.join(', ')}`
      }
    }

    // Only recommend if confidence is above threshold
    if (confidence >= 0.5) {
      recommendations.push({
        knowledgeBaseId: kb.id,
        type,
        confidence: Math.min(confidence, 1.0),
        reasoning: reasoning.trim()
      })
    }
  }

  // Sort by confidence and return top recommendations
  return recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5) // Top 5 recommendations
}
