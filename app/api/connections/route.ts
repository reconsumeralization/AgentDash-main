import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const connectionType = searchParams.get('connectionType') || 'all' // 'linkedin', 'defconect', 'mutual', or 'all'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let query = supabase
      .from('connections')
      .select(`
        id,
        connection_type,
        aspiration_compatibility,
        relationship_strength,
        shared_aspirations,
        last_interaction,
        conversation_starters,
        connected_user:users(id, name, email, avatar_url, linkedin_profile)
      `)
      .eq('user_id', userId)

    if (connectionType !== 'all') {
      query = query.eq('connection_type', connectionType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching connections:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ connections: data })
  } catch (error) {
    console.error('Unexpected error fetching connections:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}