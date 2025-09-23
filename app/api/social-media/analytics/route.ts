import { NextRequest, NextResponse } from 'next/server'
import { SocialAnalytics, SocialMetrics, TimeSeriesData, MetricData } from '@/lib/social-media-types'
import {
  LinkedInComprehensiveProfile,
  LinkedInProfileAnalytics,
  LinkedInProfileEnhancementResponse
} from '@/lib/linkedin-comprehensive-profile-types'
import {
  validateRequest,
  createApiResponse,
  createErrorResponse,
  ApiCache,
  getCacheKey,
  logApiRequest,
  AnalyticsQuerySchema
} from '@/lib/api-validation'

// Enhanced analytics data for Defconect/LinkedOut
function generateBrandMetrics(brand?: 'defconect' | 'linkedout'): SocialMetrics {
  const baseMultiplier = brand === 'defconect' ? 1.5 : brand === 'linkedout' ? 1.2 : 1.0

  const generateMetricData = (baseValue: number): MetricData => {
    const multipliedBase = Math.floor(baseValue * baseMultiplier)
    const current = multipliedBase + Math.floor(Math.random() * multipliedBase * 0.2)
    const previous = multipliedBase - Math.floor(Math.random() * multipliedBase * 0.1)
    const change = current - previous
    const changePercent = (change / previous) * 100
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable'

    // Generate time series data for the last 30 days with brand-specific growth patterns
    const data: TimeSeriesData[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Defconect shows more consistent growth, LinkedOut shows more dramatic spikes
      const variability = brand === 'defconect' ? 0.05 : brand === 'linkedout' ? 0.15 : 0.1
      const trendFactor = brand === 'defconect' ? 1.02 : brand === 'linkedout' ? 1.03 : 1.01

      data.push({
        date,
        value: Math.floor(multipliedBase * Math.pow(trendFactor, 29 - i) * (1 + (Math.random() - 0.5) * variability))
      })
    }

    return {
      current,
      previous,
      change,
      changePercent,
      trend,
      data
    }
  }

  return {
    followers: generateMetricData(brand === 'defconect' ? 5200 : brand === 'linkedout' ? 1800 : 3000),
    following: generateMetricData(500),
    posts: generateMetricData(brand === 'defconect' ? 847 : brand === 'linkedout' ? 234 : 50),
    engagement: generateMetricData(brand === 'defconect' ? 8500 : brand === 'linkedout' ? 6200 : 5000),
    reach: generateMetricData(brand === 'defconect' ? 45000 : brand === 'linkedout' ? 32000 : 25000),
    impressions: generateMetricData(brand === 'defconect' ? 180000 : brand === 'linkedout' ? 140000 : 100000),
    clicks: generateMetricData(brand === 'defconect' ? 3200 : brand === 'linkedout' ? 2800 : 2000),
    saves: generateMetricData(brand === 'defconect' ? 1200 : brand === 'linkedout' ? 950 : 500),
    shares: generateMetricData(brand === 'defconect' ? 680 : brand === 'linkedout' ? 520 : 300),
    comments: generateMetricData(brand === 'defconect' ? 1500 : brand === 'linkedout' ? 1100 : 800),
    likes: generateMetricData(brand === 'defconect' ? 5800 : brand === 'linkedout' ? 4200 : 3000)
  }
}

// Mock analytics data
function generateMockMetrics(): SocialMetrics {
  const generateMetricData = (baseValue: number): MetricData => {
    const current = baseValue + Math.floor(Math.random() * baseValue * 0.2)
    const previous = baseValue
    const change = current - previous
    const changePercent = (change / previous) * 100
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    
    // Generate time series data for the last 30 days
    const data: TimeSeriesData[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date,
        value: baseValue + Math.floor(Math.random() * baseValue * 0.1)
      })
    }

    return {
      current,
      previous,
      change,
      changePercent,
      trend,
      data
    }
  }

  return {
    followers: generateMetricData(10000),
    following: generateMetricData(500),
    posts: generateMetricData(50),
    engagement: generateMetricData(5000),
    reach: generateMetricData(25000),
    impressions: generateMetricData(100000),
    clicks: generateMetricData(2000),
    saves: generateMetricData(500),
    shares: generateMetricData(300),
    comments: generateMetricData(800),
    likes: generateMetricData(3000)
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const period = searchParams.get('period') || '30d'
    const accountId = searchParams.get('accountId')
    const brand = searchParams.get('brand') as 'defconect' | 'linkedout' | null

    // Check cache first
    const cacheKey = getCacheKey('analytics', { platform, period, accountId, brand })
    const cached = ApiCache.get(cacheKey)
    if (cached) {
      logApiRequest(request, startTime, true)
      return createApiResponse(cached, { message: 'Retrieved from cache' })
    }

    // Parse period
    let days = 30
    if (period === '7d') days = 7
    else if (period === '90d') days = 90
    else if (period === '1y') days = 365

    // Determine brand from accountId if not specified
    let detectedBrand = brand
    if (!detectedBrand && accountId) {
      if (accountId.includes('defconect')) detectedBrand = 'defconect'
      else if (accountId.includes('linkedout')) detectedBrand = 'linkedout'
    }

    // Generate brand-specific or general analytics
    const metrics = detectedBrand ? generateBrandMetrics(detectedBrand) : generateMockMetrics()

    // Generate mock analytics
    const analytics: SocialAnalytics = {
      platform: platform || 'all',
      accountId: accountId || 'all',
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        end: new Date(),
        granularity: days <= 7 ? 'hour' : days <= 30 ? 'day' : 'week'
      },
      metrics,
      posts: detectedBrand === 'defconect' ? [
        {
          postId: 'dc_1',
          content: '🔐 BREAKING: Zero-day exploits increased 127% this quarter. Defconect members are already protected with advanced threat hunting and real-time intelligence sharing. #Defconect #CyberSecurity',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
          performance: {
            score: 95,
            rank: 1,
            bestPerforming: true,
            worstPerforming: false,
            insights: ['Exceptional cybersecurity engagement', 'Strong professional network reach', 'High-value content for security professionals']
          }
        },
        {
          postId: 'dc_2',
          content: '🚨 LinkedIn Security Alert: Your professional network is your attack surface. Defconect teaches secure networking strategies. #LinkedInSecurity #ProfessionalNetworking',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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
          performance: {
            score: 88,
            rank: 2,
            bestPerforming: false,
            worstPerforming: false,
            insights: ['Strong security awareness engagement', 'Good cross-platform sharing']
          }
        }
      ] : detectedBrand === 'linkedout' ? [
        {
          postId: 'lo_1',
          content: '📈 LinkedOut breakthrough: 847% increase in profile views using our optimization framework. Stop posting randomly. Start networking strategically. #LinkedOut #LinkedInOptimization',
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          engagement: {
            likes: 445,
            comments: 92,
            shares: 234,
            saves: 312,
            clicks: 678,
            impressions: 15600,
            reach: 11200,
            engagementRate: 15.2,
            lastUpdated: new Date()
          },
          performance: {
            score: 92,
            rank: 1,
            bestPerforming: true,
            worstPerforming: false,
            insights: ['Outstanding optimization results showcase', 'Viral-level engagement', 'Strong conversion to profile visits']
          }
        },
        {
          postId: 'lo_2',
          content: '💡 Why 94% of LinkedIn posts fail: Generic content, poor timing, no strategy. LinkedOut solution: AI-powered optimization. #SocialSelling #ProfessionalGrowth',
          publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          engagement: {
            likes: 356,
            comments: 78,
            shares: 167,
            saves: 289,
            clicks: 534,
            impressions: 11400,
            reach: 8760,
            engagementRate: 13.1,
            lastUpdated: new Date()
          },
          performance: {
            score: 89,
            rank: 2,
            bestPerforming: false,
            worstPerforming: false,
            insights: ['Educational content performs well', 'High save rate indicates value']
          }
        }
      ] : [
        {
          postId: '1',
          content: 'Excited to share our latest product update! 🚀',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          engagement: {
            likes: 45,
            comments: 12,
            shares: 8,
            saves: 15,
            clicks: 23,
            impressions: 1250,
            reach: 980,
            engagementRate: 5.2,
            lastUpdated: new Date()
          },
          performance: {
            score: 85,
            rank: 1,
            bestPerforming: true,
            worstPerforming: false,
            insights: ['High engagement rate', 'Good reach']
          }
        }
      ],
      audience: {
        demographics: {
          age: [
            { range: '18-24', percentage: 15 },
            { range: '25-34', percentage: 35 },
            { range: '35-44', percentage: 30 },
            { range: '45-54', percentage: 15 },
            { range: '55+', percentage: 5 }
          ],
          gender: [
            { gender: 'Male', percentage: 60 },
            { gender: 'Female', percentage: 40 }
          ],
          location: [
            { location: 'United States', percentage: 40 },
            { location: 'United Kingdom', percentage: 15 },
            { location: 'Canada', percentage: 10 },
            { location: 'Germany', percentage: 8 },
            { location: 'Other', percentage: 27 }
          ],
          language: [
            { language: 'English', percentage: 85 },
            { language: 'Spanish', percentage: 8 },
            { language: 'French', percentage: 4 },
            { language: 'Other', percentage: 3 }
          ]
        },
        interests: [
          { category: 'Technology', percentage: 45, trending: true },
          { category: 'Business', percentage: 30, trending: false },
          { category: 'Education', percentage: 15, trending: true },
          { category: 'Entertainment', percentage: 10, trending: false }
        ],
        behavior: {
          activeHours: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            activity: Math.floor(Math.random() * 100)
          })),
          activeDays: [
            { day: 'Monday', activity: 85 },
            { day: 'Tuesday', activity: 90 },
            { day: 'Wednesday', activity: 88 },
            { day: 'Thursday', activity: 92 },
            { day: 'Friday', activity: 80 },
            { day: 'Saturday', activity: 60 },
            { day: 'Sunday', activity: 55 }
          ],
          deviceTypes: [
            { device: 'Mobile', percentage: 70 },
            { device: 'Desktop', percentage: 25 },
            { device: 'Tablet', percentage: 5 }
          ],
          contentTypes: [
            { type: 'Text', percentage: 40 },
            { type: 'Image', percentage: 35 },
            { type: 'Video', percentage: 20 },
            { type: 'Link', percentage: 5 }
          ]
        },
        growth: {
          followerGrowth: Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000),
            value: 10000 + i * 10 + Math.floor(Math.random() * 50)
          })),
          engagementGrowth: Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000),
            value: 5000 + i * 5 + Math.floor(Math.random() * 20)
          })),
          reachGrowth: Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000),
            value: 25000 + i * 25 + Math.floor(Math.random() * 100)
          }))
        }
      },
      competitors: [
        {
          account: {
            id: 'comp1',
            platform: 'linkedin',
            username: 'competitor1',
            displayName: 'Competitor 1',
            profilePicture: '/avatars/comp1.jpg',
            followers: 15000,
            following: 1000,
            isVerified: true,
            isActive: true,
            lastSync: new Date(),
            permissions: ['read'],
            metadata: {}
          },
          metrics: generateMockMetrics(),
          comparison: {
            followersDifference: 2500,
            engagementDifference: 500,
            reachDifference: 5000,
            performanceScore: 75
          }
        }
      ],
      trends: [
        {
          topic: 'Artificial Intelligence',
          volume: 15000,
          sentiment: 'positive',
          trend: 'rising',
          relatedHashtags: ['#AI', '#MachineLearning', '#TechTrends']
        },
        {
          topic: 'Remote Work',
          volume: 12000,
          sentiment: 'neutral',
          trend: 'stable',
          relatedHashtags: ['#RemoteWork', '#WFH', '#Productivity']
        }
      ]
    }

    // Cache the results
    ApiCache.set(cacheKey, analytics, 300) // 5 minutes cache

    logApiRequest(request, startTime, true)
    return createApiResponse(analytics, {
      meta: {
        cached: false,
        generatedAt: new Date().toISOString(),
        period,
        platform,
        brand: detectedBrand
      }
    })
  } catch (error) {
    logApiRequest(request, startTime, false, error instanceof Error ? error.message : 'Unknown error')
    console.error('Error fetching social media analytics:', error)
    return createErrorResponse('Failed to fetch social media analytics', 500)
  }
}