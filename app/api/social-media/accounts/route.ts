import { NextRequest, NextResponse } from 'next/server'
import { SocialAccount } from '@/lib'

// Mock data - in production, fetch from database
const mockAccounts: SocialAccount[] = [
  {
    id: '1',
    platform: 'linkedin',
    username: 'john_doe',
    displayName: 'John Doe',
    profilePicture: '/avatars/john.jpg',
    followers: 12500,
    following: 850,
    isVerified: true,
    isActive: true,
    lastSync: new Date(),
    permissions: ['read', 'write', 'analytics'],
    metadata: {
      industry: 'Technology',
      location: 'San Francisco, CA',
      headline: 'Senior Software Engineer'
    }
  },
  {
    id: '2',
    platform: 'twitter',
    username: 'johndoe_dev',
    displayName: 'John Doe Dev',
    profilePicture: '/avatars/john-dev.jpg',
    followers: 8500,
    following: 1200,
    isVerified: false,
    isActive: true,
    lastSync: new Date(),
    permissions: ['read', 'write'],
    metadata: {
      bio: 'Software Developer | Tech Enthusiast',
      location: 'San Francisco, CA'
    }
  },
  {
    id: '3',
    platform: 'instagram',
    username: 'johndoe_visuals',
    displayName: 'John Doe Visuals',
    profilePicture: '/avatars/john-visuals.jpg',
    followers: 3200,
    following: 450,
    isVerified: false,
    isActive: true,
    lastSync: new Date(),
    permissions: ['read', 'write'],
    metadata: {
      bio: 'Photography & Visual Storytelling',
      category: 'Photography'
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const active = searchParams.get('active')

    let filteredAccounts = mockAccounts

    // Filter by platform
    if (platform) {
      filteredAccounts = filteredAccounts.filter(account => 
        account.platform === platform
      )
    }

    // Filter by active status
    if (active !== null) {
      const isActive = active === 'true'
      filteredAccounts = filteredAccounts.filter(account => 
        account.isActive === isActive
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredAccounts,
      total: filteredAccounts.length
    })
  } catch (error) {
    console.error('Error fetching social media accounts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch social media accounts' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, username, displayName, profilePicture, permissions } = body

    // Validate required fields
    if (!platform || !username || !displayName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: platform, username, displayName' 
        },
        { status: 400 }
      )
    }

    // Check if account already exists
    const existingAccount = mockAccounts.find(
      account => account.platform === platform && account.username === username
    )

    if (existingAccount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account already exists' 
        },
        { status: 409 }
      )
    }

    // Create new account
    const newAccount: SocialAccount = {
      id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform,
      username,
      displayName,
      profilePicture: profilePicture || '/avatars/default.jpg',
      followers: 0,
      following: 0,
      isVerified: false,
      isActive: true,
      lastSync: new Date(),
      permissions: permissions || ['read'],
      metadata: {}
    }

    mockAccounts.push(newAccount)

    return NextResponse.json({
      success: true,
      data: newAccount
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating social media account:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create social media account' 
      },
      { status: 500 }
    )
  }
}
