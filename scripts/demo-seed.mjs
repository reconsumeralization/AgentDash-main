import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const demoClerkId = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user-1'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getOrCreateDemoUser() {
  const { data: existing, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', demoClerkId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  if (existing) {
    return existing
  }

  const { data, error: insertError } = await supabase
    .from('users')
    .insert({
      clerk_id: demoClerkId,
      email: 'demo@defconect.com',
      name: 'Demo User',
      linkedin_profile: 'https://www.linkedin.com/in/demo-user'
    })
    .select('*')
    .single()

  if (insertError) {
    throw insertError
  }

  return data
}

async function seedAspirations(userId) {
  const aspirations = [
    {
      title: 'Secure Series A funding',
      description: 'Prepare pitch materials and investor outreach for Series A raise.',
      category: 'career',
      priority: 'high',
      status: 'active',
      progress_percentage: 35
    },
    {
      title: 'Launch AI partner marketplace',
      description: 'Curate top partner integrations and go live with partner portal.',
      category: 'project',
      priority: 'critical',
      status: 'active',
      progress_percentage: 20
    },
    {
      title: 'Grow executive tribe to 50 members',
      description: 'Onboard mission-aligned execs focused on defense innovation.',
      category: 'networking',
      priority: 'medium',
      status: 'active',
      progress_percentage: 45
    }
  ]

  const titles = aspirations.map((asp) => asp.title)

  await supabase
    .from('aspirations')
    .delete()
    .eq('user_id', userId)
    .in('title', titles)

  const payload = aspirations.map((asp) => ({ ...asp, user_id: userId }))
  const { error } = await supabase
    .from('aspirations')
    .insert(payload)

  if (error) {
    throw error
  }
}

async function seedConversationContext(userId) {
  const sessionId = 'demo-session'

  const summary = 'Reviewed Series A goals, discussed partner marketplace rollout, and identified top LinkedIn targets.'

  await supabase
    .from('conversation_context')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId)

  const { error } = await supabase
    .from('conversation_context')
    .insert({
      user_id: userId,
      session_id: sessionId,
      aspirations_discussed: [
        'Secure Series A funding',
        'Launch AI partner marketplace'
      ],
      topics_covered: ['fundraising', 'product launch', 'strategic partnerships'],
      goals_progress: {
        fundraising: 'Investor shortlist in progress',
        partnerships: '3 new partners confirmed'
      },
      last_context: 'Need follow-up deck revisions and outreach emails.',
      conversation_summary: summary
    })

  if (error) {
    throw error
  }
}

async function main() {
  try {
    console.log('▶️  Seeding demo data…')
    const user = await getOrCreateDemoUser()
    console.log(`ℹ️  Using demo user ${user.id}`)

    await seedAspirations(user.id)
    console.log('✅ Aspirations seeded')

    await seedConversationContext(user.id)
    console.log('✅ Conversation context synced')

    console.log('🎉 Demo data ready.')
  } catch (error) {
    console.error('❌ Demo seeding failed:', error)
    process.exit(1)
  }
}

main()
