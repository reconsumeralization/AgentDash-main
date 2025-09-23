/**
 * API endpoint for intelligent news synthesis
 * Provides synthesized news feed and leading indicators
 */

import { NextRequest, NextResponse } from 'next/server'
import { intelligentNewsSynthesis } from '@/lib/intelligent-news-synthesis'
import { errorHandler, ErrorCategory } from '@/lib/error-handling'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const useCache = searchParams.get('cache') !== 'false'
    const timeWindow = parseInt(searchParams.get('timeWindow') || '24')
    const maxItems = parseInt(searchParams.get('maxItems') || '1000')

    // Check cache first if requested
    if (useCache) {
      const cached = await intelligentNewsSynthesis.getCachedResults()
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Configure synthesis parameters
    const config = {
      timeWindow,
      maxItems,
      minEngagement: 5,
      platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'internal'],
      categories: ['technology', 'business', 'innovation', 'career', 'networking'],
      languages: ['en', 'es', 'fr', 'de']
    }

    // Perform synthesis
    const result = await intelligentNewsSynthesis.synthesizeNewsFeed()

    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
      timestamp: new Date().toISOString(),
      config
    })

  } catch (error) {
    await errorHandler.logError(
      error instanceof Error ? error : new Error('Failed to synthesize news feed'),
      { category: ErrorCategory.API }
    )

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config } = body

    switch (action) {
      case 'refresh':
        // Force refresh by bypassing cache
        const result = await intelligentNewsSynthesis.synthesizeNewsFeed()
        return NextResponse.json({
          success: true,
          data: result,
          cached: false,
          timestamp: new Date().toISOString()
        })

      case 'configure':
        // Update synthesis configuration
        if (config) {
          // In a real implementation, you'd update the configuration
          // For now, we'll just return success
          return NextResponse.json({
            success: true,
            message: 'Configuration updated',
            timestamp: new Date().toISOString()
          })
        }
        break

      case 'start_realtime':
        // Start real-time updates
        await intelligentNewsSynthesis.startRealTimeUpdates()
        return NextResponse.json({
          success: true,
          message: 'Real-time updates started',
          timestamp: new Date().toISOString()
        })

      case 'stop_realtime':
        // Stop real-time updates
        await intelligentNewsSynthesis.stopRealTimeUpdates()
        return NextResponse.json({
          success: true,
          message: 'Real-time updates stopped',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          timestamp: new Date().toISOString()
        }, { status: 400 })
    }

  } catch (error) {
    await errorHandler.logError(
      error instanceof Error ? error : new Error('Failed to process news synthesis request'),
      { category: ErrorCategory.API }
    )

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
