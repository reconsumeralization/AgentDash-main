/**
 * LinkedIn Lite Profile API Endpoint
 * Handles LinkedIn Lite Profile data integration for news synthesis
 * Based on: https://learn.microsoft.com/en-us/linkedin/shared/references/v2/profile/lite-profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { linkedinLiteProfileService } from '@/lib/linkedin-lite-profile-service'
import { errorHandler, ErrorCategory } from '@/lib/error-handling'
import { performanceMonitor } from '@/lib/performance-monitor'

export async function GET(request: NextRequest) {
  const perfLogger = performanceMonitor.createPerformanceLogger('linkedin_lite_profile_api')
  
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const userIds = searchParams.get('userIds')
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'profile':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId parameter required for profile action' },
            { status: 400 }
          )
        }
        
        const profile = await linkedinLiteProfileService.getLiteProfile(accessToken)
        perfLogger.finish()
        return NextResponse.json({ profile })

      case 'profiles':
        if (!userIds) {
          return NextResponse.json(
            { error: 'userIds parameter required for profiles action' },
            { status: 400 }
          )
        }
        
        const userIdArray = userIds.split(',').map(id => id.trim())
        const profiles = await linkedinLiteProfileService.getMultipleLiteProfiles(userIdArray, accessToken)
        perfLogger.finish()
        return NextResponse.json({ profiles })

      case 'auth-url':
        const state = searchParams.get('state') || 'default'
        const authUrl = linkedinLiteProfileService.generateAuthUrl(state)
        perfLogger.finish()
        return NextResponse.json({ authUrl })

      case 'token-status':
        const isValid = linkedinLiteProfileService.isTokenValid()
        const currentToken = linkedinLiteProfileService.getAccessToken()
        perfLogger.finish()
        return NextResponse.json({ 
          isValid, 
          hasToken: !!currentToken,
          tokenPreview: currentToken ? `${currentToken.substring(0, 10)}...` : null
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: profile, profiles, auth-url, token-status' },
          { status: 400 }
        )
    }
  } catch (error) {
    errorHandler.log('error', 'LinkedIn Lite Profile API error', {
      category: ErrorCategory.API,
      data: { 
        error: error instanceof Error ? error.message : String(error),
        url: request.url
      }
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const perfLogger = performanceMonitor.createPerformanceLogger('linkedin_lite_profile_post')
  
  try {
    const body = await request.json()
    const { action, code, state, accessToken, expiresIn } = body

    switch (action) {
      case 'exchange-token':
        if (!code || !state) {
          return NextResponse.json(
            { error: 'code and state parameters required for token exchange' },
            { status: 400 }
          )
        }
        
        const tokenData = await linkedinLiteProfileService.exchangeCodeForToken(code, state)
        perfLogger.finish()
        return NextResponse.json({ tokenData })

      case 'set-token':
        if (!accessToken || !expiresIn) {
          return NextResponse.json(
            { error: 'accessToken and expiresIn parameters required for setting token' },
            { status: 400 }
          )
        }
        
        linkedinLiteProfileService.setAccessToken(accessToken, expiresIn)
        perfLogger.finish()
        return NextResponse.json({ success: true })

      case 'clear-token':
        linkedinLiteProfileService.clearToken()
        perfLogger.finish()
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: exchange-token, set-token, clear-token' },
          { status: 400 }
        )
    }
  } catch (error) {
    errorHandler.log('error', 'LinkedIn Lite Profile POST API error', {
      category: ErrorCategory.API,
      data: { 
        error: error instanceof Error ? error.message : String(error),
        body: await request.text()
      }
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
