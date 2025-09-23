import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db, supabase } from '@/lib'
import type { Connection } from '@/lib'

// GET /api/connections - Get user's connections with aspiration matching
export async function GET(request: NextRequest) {
  try {
    // For demo mode, we can return connections without authentication
    // In production, this would require proper authentication
    const user = await db.getOrCreateUserByClerkId('demo-user-1')

    const connections = await db.getUserConnections(user.id)

    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
  }
}

// POST /api/connections - Create new connection with aspiration analysis
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { connected_user_id, connection_type } = body

    if (!connected_user_id) {
      return NextResponse.json({ error: 'Connected user ID is required' }, { status: 400 })
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

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user_id.eq.${user.id},connected_user_id.eq.${connected_user_id}),and(user_id.eq.${connected_user_id},connected_user_id.eq.${user.id})`)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 409 })
    }

    // Get aspirations for both users to calculate compatibility
    const [userAspirations, connectedAspirations] = await Promise.all([
      supabase
        .from('aspirations')
        .select('category, title')
        .eq('user_id', user.id)
        .eq('status', 'active'),
      supabase
        .from('aspirations')
        .select('category, title')
        .eq('user_id', connected_user_id)
        .eq('status', 'active')
    ])

    const userAspirationCategories = userAspirations.data?.map(a => a.category) || []
    const connectedAspirationCategories = connectedAspirations.data?.map(a => a.category) || []

    // Calculate compatibility
    const intersection = userAspirationCategories.filter(cat =>
      connectedAspirationCategories.includes(cat)
    ).length
    const union = new Set([...userAspirationCategories, ...connectedAspirationCategories]).size
    const compatibility = union > 0 ? intersection / union : 0

    // Generate conversation starters based on shared aspirations
    const sharedCategories = userAspirationCategories.filter(cat =>
      connectedAspirationCategories.includes(cat)
    )
    const conversationStarters = sharedCategories.map(category =>
      `I'd love to hear about your experience with ${category} initiatives!`
    )

    const newConnection = {
      user_id: user.id,
      connected_user_id: connected_user_id,
      connection_type: connection_type || 'defconect',
      aspiration_compatibility: compatibility,
      shared_aspirations: sharedCategories,
      conversation_starters: conversationStarters.slice(0, 3) // Limit to 3 starters
    }

    const { data, error } = await supabase
      .from('connections')
      .insert(newConnection)
      .select(`
        *,
        connected_user:users!connections_connected_user_id_fkey(
          id,
          name,
          avatar_url,
          linkedin_profile
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ connection: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating connection:', error)
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
  }
}
