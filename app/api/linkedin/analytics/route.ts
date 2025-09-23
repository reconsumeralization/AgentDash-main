import { NextRequest, NextResponse } from 'next/server'
import { linkedInAPI } from '@/lib/linkedin-api-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaignId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Default date range to last 30 days if not provided
    const defaultEndDate = new Date()
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)

    const dateRange = {
      start: startDate || defaultStartDate.toISOString().split('T')[0],
      end: endDate || defaultEndDate.toISOString().split('T')[0]
    }

    // Get campaign analytics
    const analytics = await linkedInAPI.getCampaignAnalytics(campaignId, dateRange)

    return NextResponse.json({
      success: true,
      analytics,
      dateRange
    })

  } catch (error) {
    console.error('LinkedIn analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
