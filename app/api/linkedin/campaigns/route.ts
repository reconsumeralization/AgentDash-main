import { NextRequest, NextResponse } from 'next/server'
import { linkedInAPI } from '@/lib/linkedin-api-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    // Get campaigns for the specified account
    const campaigns = await linkedInAPI.getCampaigns(accountId)

    return NextResponse.json({
      success: true,
      campaigns,
      count: campaigns.length
    })

  } catch (error) {
    console.error('LinkedIn campaigns API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, objectiveType, accountId, campaignGroupId, budget } = body

    // Validate required fields
    if (!name || !objectiveType || !accountId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new campaign
    const campaign = await linkedInAPI.createCampaign({
      name,
      status: 'DRAFT',
      objectiveType,
      account: `urn:li:sponsoredAccount:${accountId}`,
      campaignGroup: `urn:li:sponsoredCampaignGroup:${campaignGroupId}`,
      budget: budget ? {
        amount: budget.amount,
        currencyCode: budget.currencyCode || 'USD',
        type: budget.type || 'DAILY'
      } : undefined
    })

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('LinkedIn campaign creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
