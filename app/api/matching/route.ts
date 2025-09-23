import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db, supabase } from '@/lib'
import { z } from 'zod'

const DEMO_CLERK_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user-1'
const DEMO_DEFAULTS = { email: 'demo@defconect.com', name: 'Demo User' }

const aspirationFilterSchema = z.union([
  z.object({
    category: z.string().min(1, 'Category is required'),
    title: z.string().optional(),
    description: z.string().optional()
  }),
  z.string().min(1, 'Category string cannot be empty')
])

const matchingRequestSchema = z.object({
  aspirations: z.array(aspirationFilterSchema).min(1, 'Provide at least one aspiration'),
  limit: z.number().int().min(1).max(50).default(10),
  min_compatibility: z.number().min(0).max(1).default(0.1)
})

type MatchingRequestInput = z.infer<typeof matchingRequestSchema>

async function resolveUser(request: NextRequest) {
  let clerkId: string | null = null

  try {
    const auth = getAuth(request)
    if (auth?.userId) {
      clerkId = auth.userId
    }
  } catch {
    clerkId = null
  }

  if (!clerkId) {
    clerkId = DEMO_CLERK_ID
    return db.getOrCreateUserByClerkId(clerkId, DEMO_DEFAULTS)
  }

  return db.getOrCreateUserByClerkId(clerkId)
}

function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.flatten()
    },
    { status: 400 }
  )
}

function normaliseAspirationCategories(input: MatchingRequestInput['aspirations']) {
  return input.map((item) => (typeof item === 'string' ? item : item.category))
}

// POST /api/matching - Find aspiration-compatible connections
export async function POST(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    const json = await request.json()
    const parsed = matchingRequestSchema.safeParse(json)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const data = parsed.data

    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name, avatar_url, linkedin_profile')
      .neq('id', user.id)

    if (usersError) throw usersError

    const userCategories = normaliseAspirationCategories(data.aspirations)

    const compatibilityResults = await Promise.all(
      (allUsers || []).map(async (otherUser) => {
        const { data: otherAspirations, error: otherAspError } = await supabase
          .from('aspirations')
          .select('category, title, description')
          .eq('user_id', otherUser.id)
          .eq('status', 'active')

        if (otherAspError && otherAspError.code !== 'PGRST116') throw otherAspError

        const otherAspirationCategories = otherAspirations?.map((a) => a.category) || []
        const intersection = userCategories.filter((cat) => otherAspirationCategories.includes(cat)).length
        const union = new Set([...userCategories, ...otherAspirationCategories]).size
        const compatibility = union > 0 ? intersection / union : 0

        const sharedAspirations = otherAspirations?.filter((asp) => userCategories.includes(asp.category)) || []

        const { data: existingConnection, error: connectionError } = await supabase
          .from('connections')
          .select('id, relationship_strength')
          .or(`and(user_id.eq.${user.id},connected_user_id.eq.${otherUser.id}),and(user_id.eq.${otherUser.id},connected_user_id.eq.${user.id})`)
          .single()

        if (connectionError && connectionError.code !== 'PGRST116') throw connectionError

        return {
          user: otherUser,
          compatibility,
          shared_aspirations: sharedAspirations,
          already_connected: Boolean(existingConnection),
          connection_strength: existingConnection?.relationship_strength || null,
          conversation_starters: sharedAspirations.slice(0, 2).map((asp) =>
            `I'd love to connect about your work in ${asp.category}!`
          )
        }
      })
    )

    const matches = compatibilityResults
      .filter((result) => result.compatibility >= data.min_compatibility)
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, data.limit)

    return NextResponse.json({
      matches,
      total_found: matches.length,
      search_criteria: {
        aspirations: data.aspirations,
        min_compatibility: data.min_compatibility,
        limit: data.limit
      }
    })
  } catch (error) {
    console.error('Error finding aspiration matches:', error)
    return NextResponse.json({ error: 'Failed to find aspiration matches' }, { status: 500 })
  }
}

// GET /api/matching/recommendations - Get personalized recommendations
export async function GET(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    const userAspirations = await db.getUserAspirations(user.id)

    if (!userAspirations || userAspirations.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: 'Add some aspirations to get personalized recommendations'
      })
    }

    const { data: existingConnections, error: connectionsError } = await supabase
      .from('connections')
      .select('connected_user_id')
      .eq('user_id', user.id)

    if (connectionsError) throw connectionsError

    const excludedUserIds = existingConnections?.map((c) => c.connected_user_id) || []

    let potentialQuery = supabase
      .from('users')
      .select('id, name, avatar_url, linkedin_profile')
      .neq('id', user.id)
      .limit(50)

    if (excludedUserIds.length > 0) {
      const inList = excludedUserIds.map((id) => `'${id}'`).join(',')
      potentialQuery = potentialQuery.not('id', 'in', `(${inList})`)
    }

    const { data: potentialMatches, error } = await potentialQuery

    if (error) throw error

    const userCategories = userAspirations.map((a) => a.category)

    const recommendations = await Promise.all(
      (potentialMatches || []).map(async (match) => {
        const { data: matchAspirations, error: matchAspError } = await supabase
          .from('aspirations')
          .select('category, title')
          .eq('user_id', match.id)
          .eq('status', 'active')

        if (matchAspError && matchAspError.code !== 'PGRST116') throw matchAspError

        const matchCategories = matchAspirations?.map((a) => a.category) || []

        const intersection = userCategories.filter((cat) => matchCategories.includes(cat)).length
        const union = new Set([...userCategories, ...matchCategories]).size
        const compatibility = union > 0 ? intersection / union : 0

        const sharedInterests = matchAspirations?.filter((asp) => userCategories.includes(asp.category)) || []

        return {
          user: match,
          compatibility_score: compatibility,
          shared_interests: sharedInterests,
          reason: sharedInterests.length > 0
            ? `Shares interest in ${sharedInterests[0].category}`
            : 'Compatible professional trajectory',
          priority: compatibility > 0.7 ? 'high' : compatibility > 0.4 ? 'medium' : 'low'
        }
      })
    )

    const topRecommendations = recommendations
      .filter((rec) => rec.compatibility_score > 0.2)
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, 5)

    return NextResponse.json({
      recommendations: topRecommendations,
      total_analyzed: potentialMatches?.length || 0,
      user_aspirations: userAspirations.length
    })
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}
