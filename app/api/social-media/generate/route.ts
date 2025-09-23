import { NextRequest, NextResponse } from 'next/server'
import {
  validateRequest,
  GeneratePostSchema,
  createApiResponse,
  createErrorResponse,
  ApiCache,
  getCacheKey,
  logApiRequest
} from '@/lib/api-validation'

// Advanced post generation templates for Defconect/LinkedOut
const brandTemplates = {
  defconect: {
    cybersecurity: [
      "🔐 BREAKING: Zero-day exploits increased 127% this quarter.\n\nDefconect members are already protected:\n✅ Advanced threat hunting\n✅ Real-time intelligence sharing\n✅ Elite security networking\n\nYour security is only as strong as your network. #Defconect #CyberSecurity #ThreatIntelligence",
      "🚨 Social engineering attacks target LinkedIn profiles 3x more than email.\n\nDefconect trains you to:\n→ Identify fake connection requests\n→ Secure professional communications\n→ Build trusted security networks\n\nNetwork smart. Network secure. #Defconect #LinkedInSecurity #CyberAwareness",
      "🛡️ Enterprise security leaders share one secret: Strategic peer networking.\n\nDefconect community benefits:\n• Threat intelligence collaboration\n• Career advancement opportunities\n• Access to exclusive security insights\n\nJoin 5,200+ elite cybersecurity professionals. #Defconect #CyberLeadership"
    ],
    networking: [
      "🤝 The most successful cybersecurity careers are built on strategic relationships.\n\nDefconect members leverage:\n→ Elite peer connections\n→ Mentorship opportunities\n→ Industry insider knowledge\n\nYour network is your security net. #Defconect #CyberNetworking #CareerGrowth",
      "🎯 Quality > Quantity in cybersecurity networking.\n\nDefconect focuses on:\n• Verified security professionals\n• Industry thought leaders\n• Decision makers & influencers\n\nConnect with purpose. Network with impact. #Defconect #StrategicNetworking"
    ],
    innovation: [
      "🚀 AI-powered cybersecurity is reshaping the industry.\n\nDefconect explores:\n→ Machine learning threat detection\n→ Automated incident response\n→ Predictive security analytics\n\nStay ahead of tomorrow's threats today. #Defconect #CyberInnovation #AI"
    ]
  },
  linkedout: {
    optimization: [
      "📈 LinkedOut breakthrough: 847% increase in profile views using our optimization framework.\n\nThe strategy:\n• Algorithmic content timing\n• Persona-based targeting\n• Engagement rate optimization\n• Data-driven connection strategies\n\nStop posting randomly. Start networking strategically. #LinkedOut #LinkedInOptimization #PersonalBranding",
      "💡 Why 94% of LinkedIn posts get ignored:\n\n❌ Generic corporate content\n❌ Poor timing strategy\n❌ No engagement framework\n\n✅ LinkedOut solution: AI-powered optimization\n\nYour network is your net worth. Optimize it. #LinkedOut #SocialSelling #LinkedInStrategy",
      "⚡ LinkedOut automation stack delivers results:\n\n📊 67% more quality connections\n📈 156% increase in post engagement\n🎯 89% better targeting accuracy\n\nAutomate smart. Network smarter. #LinkedOut #LinkedInAutomation #NetworkingROI"
    ],
    automation: [
      "⚡ LinkedOut Automation Suite features:\n\n🎯 Smart connection targeting\n📊 Advanced engagement analytics\n🤖 Intelligent content scheduling\n📈 Performance optimization\n\nStop manual networking. Start systematic growth. #LinkedOut #Automation #LinkedInGrowth",
      "🔄 LinkedIn automation done right:\n\n→ Ethical engagement practices\n→ Platform-compliant strategies\n→ Human-like interaction patterns\n→ Quality-focused targeting\n\nLinkedOut: Where automation meets authenticity. #LinkedOut #EthicalAutomation #LinkedInCompliance"
    ],
    analytics: [
      "📊 LinkedOut Analytics reveal the LinkedIn algorithm secrets:\n\n• Peak engagement: Tuesday 9-11 AM\n• Optimal post length: 150-300 characters\n• Best performing content: Industry insights + personal stories\n• Connection acceptance rate: 68% with personalized messages\n\nData-driven networking wins. #LinkedOut #LinkedInAnalytics #SocialMediaData"
    ],
    strategy: [
      "🧠 LinkedIn strategy that converts:\n\n1️⃣ Profile optimization (foundation)\n2️⃣ Content strategy (visibility)\n3️⃣ Engagement tactics (relationships)\n4️⃣ Analytics tracking (optimization)\n\nLinkedOut makes it systematic. #LinkedOut #LinkedInStrategy #PersonalBranding"
    ]
  }
}

// Generate personalized post based on user context
function generatePersonalizedPost(
  brand: 'defconect' | 'linkedout',
  topic: string,
  userContext?: {
    industry?: string
    role?: string
    experience?: string
    goals?: string[]
    tone?: 'professional' | 'casual' | 'authoritative' | 'friendly'
  }
) {
  const templates = brandTemplates[brand]
  const topicTemplates = templates[topic as keyof typeof templates]

  if (!topicTemplates) {
    return `🚀 ${brand === 'defconect' ? 'Defconect' : 'LinkedOut'} is revolutionizing how professionals network and grow their careers. Join our community of industry leaders and innovators. #${brand === 'defconect' ? 'Defconect' : 'LinkedOut'}`
  }

  let selectedTemplate = (topicTemplates as string[])[Math.floor(Math.random() * (topicTemplates as string[]).length)]

  // Personalize based on user context
  if (userContext) {
    if (userContext.industry) {
      selectedTemplate = selectedTemplate.replace(/professionals/g, `${userContext.industry} professionals`)
    }
    if (userContext.role && userContext.role.includes('leader')) {
      selectedTemplate = selectedTemplate.replace(/members/g, 'leaders')
    }
  }

  return selectedTemplate
}

// Generate complementary hashtags
function generateHashtags(brand: 'defconect' | 'linkedout', topic: string, userContext?: any) {
  const baseHashtags = {
    defconect: ['#Defconect', '#CyberSecurity', '#ProfessionalNetworking'],
    linkedout: ['#LinkedOut', '#LinkedInOptimization', '#PersonalBranding']
  }

  const topicHashtags = {
    cybersecurity: ['#ThreatIntelligence', '#InfoSec', '#CyberAwareness'],
    networking: ['#StrategicNetworking', '#CareerGrowth', '#ProfessionalDevelopment'],
    optimization: ['#SocialSelling', '#LinkedInStrategy', '#NetworkingROI'],
    automation: ['#LinkedInAutomation', '#NetworkingTools', '#ProductivityHacks'],
    analytics: ['#SocialMediaAnalytics', '#DataDriven', '#LinkedInInsights'],
    strategy: ['#ContentStrategy', '#ThoughtLeadership', '#ProfessionalBranding']
  }

  return [
    ...baseHashtags[brand],
    ...(topicHashtags[topic as keyof typeof topicHashtags] || [])
  ]
}

// Generate brand-appropriate links
function generateLinks(brand: 'defconect' | 'linkedout', topic: string) {
  const links = {
    defconect: {
      url: 'https://defconect.com',
      title: 'Defconect - Elite Cybersecurity Community',
      description: 'Join 5,200+ cybersecurity professionals in the premier networking platform',
      domain: 'defconect.com'
    },
    linkedout: {
      url: 'https://linkedout.pro',
      title: 'LinkedOut - LinkedIn Optimization Platform',
      description: 'Advanced automation and analytics for LinkedIn success',
      domain: 'linkedout.pro'
    }
  }

  return [{ id: '1', ...links[brand] }]
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Validate request with enhanced schema
    const validator = validateRequest(GeneratePostSchema)
    const validation = await validator(request)

    if (!validation.isValid) {
      logApiRequest(request, startTime, false, validation.errors?.join(', '))
      return createErrorResponse(validation.errors?.join(', ') || 'Invalid request', 400)
    }

    const { brand, topic, userContext, count = 1, platform = 'linkedin' } = validation.data!

    // Check cache first
    const cacheKey = getCacheKey('post-generation', { brand, topic, platform, count })
    const cached = ApiCache.get(cacheKey)
    if (cached) {
      logApiRequest(request, startTime, true)
      return createApiResponse(cached, { message: 'Generated from cache' })
    }

    // Validate brand (now with correct spelling)
    if (!['defconect', 'linkedout'].includes(brand)) {
      logApiRequest(request, startTime, false, 'Invalid brand')
      return createErrorResponse('Invalid brand. Must be "defconect" or "linkedout"', 400)
    }

    // Generate multiple posts if requested
    const generatedPosts = []
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = generatePersonalizedPost(brand, topic, userContext)
      const hashtags = generateHashtags(brand, topic, userContext)
      const links = generateLinks(brand, topic)

      generatedPosts.push({
        id: `generated_${Date.now()}_${i}`,
        content: {
          text,
          hashtags,
          links,
          images: [],
          videos: [],
          mentions: []
        },
        metadata: {
          brand,
          topic,
          generated: true,
          userContext,
          createdAt: new Date()
        },
        platform,
        estimatedEngagement: {
          predictedLikes: Math.floor(Math.random() * 500) + 100,
          predictedComments: Math.floor(Math.random() * 100) + 20,
          predictedShares: Math.floor(Math.random() * 200) + 50,
          engagementScore: Math.floor(Math.random() * 30) + 70
        }
      })
    }

    // Cache the results
    ApiCache.set(cacheKey, generatedPosts, 300) // 5 minutes cache

    logApiRequest(request, startTime, true)
    return createApiResponse(generatedPosts, {
      meta: {
        brand,
        topic,
        count: generatedPosts.length,
        availableTopics: Object.keys(brandTemplates[brand as keyof typeof brandTemplates]),
        cached: false,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    logApiRequest(request, startTime, false, error instanceof Error ? error.message : 'Unknown error')
    console.error('Error generating social media posts:', error)
    return createErrorResponse('Failed to generate social media posts', 500)
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')

    // Check cache for brand info
    const cacheKey = getCacheKey('brand-info', { brand: brand || 'all' })
    const cached = ApiCache.get(cacheKey)
    if (cached) {
      logApiRequest(request, startTime, true)
      return createApiResponse(cached, { message: 'Retrieved from cache' })
    }

    let responseData

    if (brand && ['defconect', 'linkedout'].includes(brand)) {
      responseData = {
        brand,
        availableTopics: Object.keys(brandTemplates[brand as keyof typeof brandTemplates]),
        templateCount: Object.values(brandTemplates[brand as keyof typeof brandTemplates])
          .reduce((total, templates) => total + templates.length, 0),
        description: brand === 'defconect'
          ? 'Elite cybersecurity community and threat intelligence platform'
          : 'Advanced LinkedIn optimization and networking automation',
        features: brand === 'defconect'
          ? ['Threat Intelligence', 'Security Networking', 'Elite Community']
          : ['Profile Optimization', 'Content Automation', 'Analytics']
      }
    } else {
      responseData = {
        availableBrands: ['defconect', 'linkedout'],
        totalTemplates: Object.values(brandTemplates)
          .flatMap(brand => Object.values(brand))
          .reduce((total, templates) => total + templates.length, 0),
        supportedPlatforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube'],
        description: 'AI-powered social media content generation for cybersecurity and professional networking'
      }
    }

    // Cache the results
    ApiCache.set(cacheKey, responseData, 600) // 10 minutes cache

    logApiRequest(request, startTime, true)
    return createApiResponse(responseData)
  } catch (error) {
    logApiRequest(request, startTime, false, error instanceof Error ? error.message : 'Unknown error')
    console.error('Error fetching generation options:', error)
    return createErrorResponse('Failed to fetch generation options', 500)
  }
}