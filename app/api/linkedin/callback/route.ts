import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const LINKEDIN_REDIRECT_URI = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
  throw new Error('Missing LinkedIn API environment variables')
}

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
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // Optional: for CSRF protection

  if (!code) {
    return NextResponse.redirect(new URL('/error?message=Missing authorization code', request.url))
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('LinkedIn token exchange failed:', errorData)
      return NextResponse.redirect(new URL(`/error?message=LinkedIn token exchange failed: ${errorData.error_description || errorData.error}`, request.url))
    }

    const { access_token } = await tokenResponse.json()

    // 2. Use access token to fetch user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json()
      console.error('LinkedIn profile fetch failed:', errorData)
      return NextResponse.redirect(new URL(`/error?message=LinkedIn profile fetch failed: ${errorData.message || errorData.serviceErrorCode}`, request.url))
    }

    const linkedinProfile = await profileResponse.json()
    console.log('Fetched LinkedIn Profile:', linkedinProfile)

    // 3. Store/Update user profile in Supabase
    // Assuming 'sub' in userinfo is the LinkedIn user ID
    const linkedinUserId = linkedinProfile.sub

    // Find the user in your 'users' table based on their Clerk ID or create if not exists
    // For simplicity, let's assume we're linking to an existing user by Clerk ID
    // In a real app, you'd have a way to associate this LinkedIn profile with your app's user
    // For now, we'll just update the 'linkedin_profile' column for a dummy user or the current authenticated user.
    // This part needs to be adapted based on your actual user management logic.
    
    // For demonstration, let's assume a user with clerk_id 'test-user-1' exists or we create one.
    // In a real application, you would get the current user's ID from Clerk's session.
    const dummyClerkId = 'test-user-1' // Replace with actual Clerk ID from session

    const { data: existingUser, error: fetchUserError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', dummyClerkId)
      .single()

    let userId: string
    if (existingUser) {
      userId = existingUser.id
      const { error: updateError } = await supabase
        .from('users')
        .update({ linkedin_profile: linkedinProfile })
        .eq('id', userId)
      if (updateError) console.error('Error updating user LinkedIn profile:', updateError)
    } else {
      // If user doesn't exist, create a new one (this might not be your app's flow)
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_id: dummyClerkId,
          email: linkedinProfile.email || `${linkedinUserId}@linkedin.com`, // Fallback email
          name: linkedinProfile.name || `${linkedinProfile.given_name || ''} ${linkedinProfile.family_name || ''}`.trim() || 'LinkedIn User',
          avatar_url: linkedinProfile.picture,
          linkedin_profile: linkedinProfile,
        })
        .select('id')
        .single()
      
      if (createError) {
        console.error('Error creating new user with LinkedIn profile:', createError)
        return NextResponse.redirect(new URL('/error?message=Failed to create user with LinkedIn profile', request.url))
      }
      userId = newUser.id
    }

    // 4. Fetch and store connections (simplified for basic profile scope)
    // The /v2/userinfo endpoint does not return connections. 
    // To get connections, you would need 'r_connections' scope and use /v2/connections endpoint.
    // This example focuses on basic profile data.
    // For 'r_connections' scope, you'd make another API call here:
    // const connectionsResponse = await fetch('https://api.linkedin.com/v2/connections?q=viewer', { headers: { 'Authorization': `Bearer ${access_token}` } });
    // const connectionsData = await connectionsResponse.json();
    // Then process and store connections in your 'connections' table.

    // Redirect to a success page or dashboard
    return NextResponse.redirect(new URL('/dashboard?linkedin_connected=true', request.url))

  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error)
    return NextResponse.redirect(new URL('/error?message=LinkedIn OAuth process failed', request.url))
  }
}