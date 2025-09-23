/**
 * LinkedIn Feed Processing API
 * Processes LinkedIn feed data and returns insights and recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { linkedInDataProcessor } from '@/lib/linkedin-data-processor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feedData } = body

    if (!feedData || typeof feedData !== 'string') {
      return NextResponse.json(
        { error: 'feedData is required and must be a string' },
        { status: 400 }
      )
    }

    // Process the LinkedIn feed data
    const result = await linkedInDataProcessor.processFeedData(feedData)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error processing LinkedIn feed:', error)

    return NextResponse.json(
      {
        error: 'Failed to process LinkedIn feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'LinkedIn Feed Processing API',
    usage: {
      method: 'POST',
      body: {
        feedData: 'string - Raw LinkedIn feed data to analyze'
      },
      response: {
        success: 'boolean',
        data: {
          analysis: 'ContentAnalysis object',
          insights: 'string[] - Key insights from the feed',
          recommendations: 'string[] - Actionable recommendations'
        }
      }
    },
    example: {
      endpoint: '/api/linkedin/process-feed',
      method: 'POST',
      body: {
        feedData: "Andy Jenkinson posted: OMG: Oracle, Microsoft, Google's Weakness... [your feed data here]"
      }
    }
  })
}
