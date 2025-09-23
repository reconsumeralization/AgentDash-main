import { NextRequest, NextResponse } from 'next/server'
import { linkedInAPI } from '@/lib/linkedin-api-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/linkedout?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.redirect(
        new URL('/linkedout?error=missing_code', request.url)
      )
    }

    // Exchange code for tokens
    const tokens = await linkedInAPI.exchangeCodeForTokens(code)

    // Get user profile to verify connection
    const profile = await linkedInAPI.getUserProfile()

    // In a real app, you would:
    // 1. Store tokens securely in database
    // 2. Associate with user account
    // 3. Set up webhooks for real-time updates

    // For now, we'll redirect back with success
    const successParams = new URLSearchParams({
      success: 'true',
      profileId: profile.id,
      name: `${profile.firstName} ${profile.lastName}`
    })

    return NextResponse.redirect(
      new URL(`/linkedout?${successParams.toString()}`, request.url)
    )

  } catch (error) {
    console.error('LinkedIn callback error:', error)
    return NextResponse.redirect(
      new URL(`/linkedout?error=${encodeURIComponent('authentication_failed')}`, request.url)
    )
  }
}
