import { NextRequest, NextResponse } from 'next/server'
import { SocialPost } from '@/lib'

// Brand-optimized post templates for DefconConnect/LinkedOut
const defconConnectPosts = {
  cybersecurity: [
    "🔐 THREAT ALERT: 73% of enterprises experienced advanced persistent threats in Q4. Here's how DefconConnect members stay ahead:\n\n✅ Zero-trust architecture implementation\n✅ AI-powered threat detection\n✅ Elite cybersecurity networking\n\nJoin 5,200+ professionals securing the digital frontier. #DefconConnect #CyberSecurity #ThreatIntelligence",
    "🚨 LinkedIn Security Breach? Your professional network is your attack surface. DefconConnect teaches you to:\n\n→ Audit connection requests\n→ Detect social engineering\n→ Secure professional communications\n\nNetwork smart. Network secure. #DefconConnect #LinkedInSecurity #ProfessionalNetworking"
  ],
  linkedout: [
    "📈 LINKEDOUT BREAKTHROUGH: Our automation increased profile views by 847% in 30 days.\n\nThe secret? Strategic persona targeting:\n• Industry-specific content cadence\n• Algorithmic engagement timing\n• Data-driven connection strategies\n\nStop posting randomly. Start networking strategically. #LinkedOut #LinkedInOptimization #PersonalBranding",
    "💡 Why 94% of LinkedIn posts fail:\n\n❌ Generic corporate speak\n❌ Random posting times\n❌ No engagement strategy\n\n✅ LinkedOut solution: AI-powered content optimization\n\nYour network is your net worth. Optimize it. #LinkedOut #SocialSelling #ProfessionalGrowth"
  ]
}

// Mock data - in production, fetch from database
const mockPosts: SocialPost[] = [
  {
    id: '1',
    platform: 'linkedin',
    accountId: 'defconconnect_main',
    content: {
      text: defconConnectPosts.cybersecurity[0],
      images: [],
      videos: [],
      links: [{
        id: '1',
        url: 'https://defconconnect.com/threat-intelligence',
        title: 'DefconConnect Threat Intelligence',
        description: 'Elite cybersecurity community insights',
        domain: 'defconconnect.com'
      }],
      hashtags: ['#DefconConnect', '#CyberSecurity', '#ThreatIntelligence', '#ZeroTrust'],
      mentions: []
    },
    status: 'published',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    engagement: {
      likes: 342,
      comments: 87,
      shares: 156,
      saves: 234,
      clicks: 567,
      impressions: 12450,
      reach: 8930,
      engagementRate: 12.8,
      lastUpdated: new Date()
    },
    metadata: {
      tags: ['cybersecurity', 'threat-intelligence', 'defconconnect'],
      category: 'professional',
      language: 'en',
      sentiment: 'positive',
      topics: ['cybersecurity', 'networking', 'threat-detection']
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    platform: 'linkedin',
    accountId: 'linkedout_strategy',
    content: {
      text: defconConnectPosts.linkedout[0],
      images: [],
      videos: [],
      links: [{
        id: '2',
        url: 'https://linkedout.pro/optimization-suite',
        title: 'LinkedOut Optimization Suite',
        description: 'Advanced LinkedIn automation and analytics',
        domain: 'linkedout.pro'
      }],
      hashtags: ['#LinkedOut', '#LinkedInOptimization', '#PersonalBranding', '#SocialSelling'],
      mentions: []
    },
    status: 'published',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    engagement: {
      likes: 289,
      comments: 64,
      shares: 134,
      saves: 198,
      clicks: 445,
      impressions: 9850,
      reach: 7120,
      engagementRate: 11.4,
      lastUpdated: new Date()
    },
    metadata: {
      tags: ['linkedin-optimization', 'personal-branding', 'linkedout'],
      category: 'professional',
      language: 'en',
      sentiment: 'positive',
      topics: ['linkedin', 'automation', 'networking']
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const accountId = searchParams.get('accountId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredPosts = mockPosts

    // Filter by platform
    if (platform) {
      filteredPosts = filteredPosts.filter(post => post.platform === platform)
    }

    // Filter by account
    if (accountId) {
      filteredPosts = filteredPosts.filter(post => post.accountId === accountId)
    }

    // Filter by status
    if (status) {
      filteredPosts = filteredPosts.filter(post => post.status === status)
    }

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
    console.error('Error fetching social media posts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch social media posts' 
      },
      { status: 500 }
    )
  }
}

// AI-powered post generation function
function generatePersonalizedPost(brand: 'defconconnect' | 'linkedout', topic: string, userContext?: any) {
  const templates = {
    defconconnect: {
      cybersecurity: defconConnectPosts.cybersecurity,
      networking: [
        "🤝 The most successful cybersecurity professionals share one trait: Strategic networking.\n\nDefconConnect members leverage:\n→ Elite peer connections\n→ Threat intelligence sharing\n→ Career advancement opportunities\n\nYour network determines your security posture. #DefconConnect #CyberNetworking"
      ]
    },
    linkedout: {
      optimization: defconConnectPosts.linkedout,
      automation: [
        "⚡ LinkedOut Automation Stack:\n\n🎯 Smart connection targeting\n📊 Engagement analytics\n🤖 Content scheduling\n📈 Performance tracking\n\nStop manual networking. Start systematic growth. #LinkedOut #Automation"
      ]
    }
  }

  const brandTemplates = templates[brand]
  const topicTemplates = brandTemplates[topic as keyof typeof brandTemplates]
  return (topicTemplates as string[])?.[Math.floor(Math.random() * (topicTemplates as string[]).length)] || ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      platform,
      accountId,
      content,
      scheduledAt,
      campaignId,
      generateContent,
      brand,
      topic,
      userContext
    } = body

    // Validate required fields
    if (!platform || !accountId || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: platform, accountId, content' 
        },
        { status: 400 }
      )
    }

    // Validate content
    if (!content.text && !content.images?.length && !content.videos?.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Content must include text, images, or videos' 
        },
        { status: 400 }
      )
    }

    // Generate content if requested
    let finalContent = content
    if (generateContent && brand && topic) {
      const generatedText = generatePersonalizedPost(brand, topic, userContext)
      finalContent = {
        ...content,
        text: generatedText,
        hashtags: brand === 'defconconnect'
          ? ['#DefconConnect', '#CyberSecurity', '#ProfessionalNetworking']
          : ['#LinkedOut', '#LinkedInOptimization', '#PersonalBranding'],
        links: brand === 'defconconnect'
          ? [{ id: '1', url: 'https://defconconnect.com', title: 'DefconConnect', description: 'Elite cybersecurity community', domain: 'defconconnect.com' }]
          : [{ id: '1', url: 'https://linkedout.pro', title: 'LinkedOut', description: 'LinkedIn optimization platform', domain: 'linkedout.pro' }]
      }
    }

    // Create new post
    const newPost: SocialPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform,
      accountId,
      content: {
        text: finalContent.text || '',
        images: finalContent.images || [],
        videos: finalContent.videos || [],
        links: finalContent.links || [],
        hashtags: finalContent.hashtags || [],
        mentions: finalContent.mentions || []
      },
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      publishedAt: scheduledAt ? undefined : new Date(),
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        clicks: 0,
        impressions: 0,
        reach: 0,
        engagementRate: 0,
        lastUpdated: new Date()
      },
      metadata: {
        tags: content.tags || [],
        category: content.category || 'general',
        language: content.language || 'en',
        sentiment: content.sentiment || 'neutral',
        topics: content.topics || []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockPosts.push(newPost)

    return NextResponse.json({
      success: true,
      data: newPost
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating social media post:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create social media post' 
      },
      { status: 500 }
    )
  }
}
