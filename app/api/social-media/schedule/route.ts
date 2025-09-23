import { NextRequest, NextResponse } from 'next/server'

interface ScheduledPost {
  id: string
  platform: string
  accountId: string
  content: {
    text: string
    hashtags: string[]
    links: any[]
    images: any[]
    videos: any[]
    mentions: any[]
  }
  scheduledAt: Date
  status: 'scheduled' | 'published' | 'failed' | 'cancelled'
  brand?: 'defconconnect' | 'linkedout'
  topic?: string
  createdAt: Date
  updatedAt: Date
}

// Mock scheduled posts storage
const scheduledPosts: ScheduledPost[] = [
  {
    id: 'sched_1',
    platform: 'linkedin',
    accountId: 'defconconnect_main',
    content: {
      text: '🔐 BREAKING: Zero-day exploits increased 127% this quarter.\n\nDefconConnect members are already protected:\n✅ Advanced threat hunting\n✅ Real-time intelligence sharing\n✅ Elite security networking\n\nYour security is only as strong as your network. #DefconConnect #CyberSecurity #ThreatIntelligence',
      hashtags: ['#DefconConnect', '#CyberSecurity', '#ThreatIntelligence'],
      links: [{
        id: '1',
        url: 'https://defconconnect.com/threat-intelligence',
        title: 'DefconConnect Threat Intelligence',
        description: 'Elite cybersecurity community insights',
        domain: 'defconconnect.com'
      }],
      images: [],
      videos: [],
      mentions: []
    },
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: 'scheduled',
    brand: 'defconconnect',
    topic: 'cybersecurity',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sched_2',
    platform: 'linkedin',
    accountId: 'linkedout_strategy',
    content: {
      text: '📈 LinkedOut breakthrough: 847% increase in profile views using our optimization framework.\n\nThe strategy:\n• Algorithmic content timing\n• Persona-based targeting\n• Engagement rate optimization\n• Data-driven connection strategies\n\nStop posting randomly. Start networking strategically. #LinkedOut #LinkedInOptimization #PersonalBranding',
      hashtags: ['#LinkedOut', '#LinkedInOptimization', '#PersonalBranding'],
      links: [{
        id: '2',
        url: 'https://linkedout.pro/optimization-suite',
        title: 'LinkedOut Optimization Suite',
        description: 'Advanced LinkedIn automation and analytics',
        domain: 'linkedout.pro'
      }],
      images: [],
      videos: [],
      mentions: []
    },
    scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    status: 'scheduled',
    brand: 'linkedout',
    topic: 'optimization',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status') || 'scheduled'
    const brand = searchParams.get('brand')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredPosts = scheduledPosts

    // Filter by platform
    if (platform) {
      filteredPosts = filteredPosts.filter(post => post.platform === platform)
    }

    // Filter by status
    filteredPosts = filteredPosts.filter(post => post.status === status)

    // Filter by brand
    if (brand) {
      filteredPosts = filteredPosts.filter(post => post.brand === brand)
    }

    // Sort by scheduled time
    filteredPosts.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())

    // Pagination
    const total = filteredPosts.length
    const paginatedPosts = filteredPosts.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedPosts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching scheduled posts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scheduled posts'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      platform,
      accountId,
      content,
      scheduledAt,
      brand,
      topic,
      generateContent
    } = body

    // Validate required fields
    if (!platform || !accountId || !scheduledAt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: platform, accountId, scheduledAt'
        },
        { status: 400 }
      )
    }

    // Validate scheduledAt is in the future
    const scheduleDate = new Date(scheduledAt)
    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheduled time must be in the future'
        },
        { status: 400 }
      )
    }

    let finalContent = content

    // Generate content if requested
    if (generateContent && brand && topic) {
      try {
        const generateResponse = await fetch('http://localhost:3000/api/social-media/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand,
            topic,
            count: 1,
            platform
          })
        })

        if (generateResponse.ok) {
          const generateData = await generateResponse.json()
          if (generateData.success && generateData.data.length > 0) {
            finalContent = generateData.data[0].content
          }
        }
      } catch (error) {
        console.error('Error generating content:', error)
        // Continue with provided content if generation fails
      }
    }

    // Validate content
    if (!finalContent?.text && !finalContent?.images?.length && !finalContent?.videos?.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content must include text, images, or videos'
        },
        { status: 400 }
      )
    }

    // Create new scheduled post
    const newPost: ScheduledPost = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform,
      accountId,
      content: {
        text: finalContent.text || '',
        hashtags: finalContent.hashtags || [],
        links: finalContent.links || [],
        images: finalContent.images || [],
        videos: finalContent.videos || [],
        mentions: finalContent.mentions || []
      },
      scheduledAt: scheduleDate,
      status: 'scheduled',
      brand,
      topic,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    scheduledPosts.push(newPost)

    return NextResponse.json({
      success: true,
      data: newPost
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating scheduled post:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create scheduled post'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, scheduledAt, content, status } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: id'
        },
        { status: 400 }
      )
    }

    const postIndex = scheduledPosts.findIndex(post => post.id === id)
    if (postIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheduled post not found'
        },
        { status: 404 }
      )
    }

    const existingPost = scheduledPosts[postIndex]

    // Update fields
    if (scheduledAt) {
      const scheduleDate = new Date(scheduledAt)
      if (scheduleDate <= new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Scheduled time must be in the future'
          },
          { status: 400 }
        )
      }
      existingPost.scheduledAt = scheduleDate
    }

    if (content) {
      existingPost.content = { ...existingPost.content, ...content }
    }

    if (status && ['scheduled', 'cancelled'].includes(status)) {
      existingPost.status = status as 'scheduled' | 'cancelled'
    }

    existingPost.updatedAt = new Date()

    return NextResponse.json({
      success: true,
      data: existingPost
    })
  } catch (error) {
    console.error('Error updating scheduled post:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update scheduled post'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: id'
        },
        { status: 400 }
      )
    }

    const postIndex = scheduledPosts.findIndex(post => post.id === id)
    if (postIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheduled post not found'
        },
        { status: 404 }
      )
    }

    scheduledPosts.splice(postIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Scheduled post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting scheduled post:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete scheduled post'
      },
      { status: 500 }
    )
  }
}