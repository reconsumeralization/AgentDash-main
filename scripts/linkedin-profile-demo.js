/**
 * LinkedIn Comprehensive Profile Analytics Demo
 * Showcases all LinkedIn profile fields and analytics capabilities
 * Demonstrates the complete profile data structure with all available fields
 */

const { execSync } = require('child_process')

class LinkedInProfileDemo {
  constructor() {
    this.apiUrl = 'http://localhost:3000'
    this.profiles = ['defconect', 'linkedout', 'default']
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      highlight: '\x1b[1m',
      profile: '\x1b[45m\x1b[30m',
      data: '\x1b[42m\x1b[30m',
      reset: '\x1b[0m'
    }

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  async run() {
    this.log('🎬 Starting LinkedIn Comprehensive Profile Analytics Demo', 'highlight')
    this.log('=' .repeat(80), 'highlight')

    // Check if dev server is running
    try {
      const response = await fetch(`${this.apiUrl}/api/health`)
      if (!response.ok) {
        throw new Error('Dev server not responding')
      }
    } catch (error) {
      this.log('❌ Dev server not running. Please start with: npm run dev', 'error')
      return
    }

    for (const profileId of this.profiles) {
      await this.demonstrateProfile(profileId)
      await this.sleep(2000)
    }

    await this.showComprehensiveFeatures()
  }

  async demonstrateProfile(profileId) {
    this.log(`\n📋 Demonstrating Profile: ${profileId.toUpperCase()}`, 'profile')
    this.log('-'.repeat(60), 'info')

    try {
      // Fetch comprehensive profile analytics
      const response = await fetch(
        `${this.apiUrl}/api/linkedin/profile-analytics?userId=${profileId}&includeCompetitiveAnalysis=true&includeRecommendations=true`
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      const { profile, analytics } = data.data

      // Display basic profile information
      this.log(`👤 Profile Information:`, 'info')
      this.log(`   Name: ${profile.firstName} ${profile.lastName}`, 'info')
      this.log(`   Headline: ${profile.headline}`, 'info')
      this.log(`   Industry: ${profile.industry}`, 'info')
      this.log(`   Location: ${profile.location?.city}, ${profile.location?.region}`, 'info')
      this.log(`   Connections: ${profile.connectionCount?.toLocaleString()}`, 'success')
      this.log(`   Followers: ${profile.followerCount?.toLocaleString()}`, 'success')

      // Display profile completeness and scores
      if (profile.analytics) {
        this.log(`\n📊 Profile Analytics:`, 'data')
        this.log(`   Trust Score: ${profile.analytics.trustScore}/10`, 'success')
        this.log(`   Influence Score: ${profile.analytics.influenceScore}/10`, 'success')
        this.log(`   Network Quality: ${profile.analytics.networkQuality}/10`, 'success')
        this.log(`   Engagement Rate: ${profile.analytics.engagementRate}%`, 'success')
        this.log(`   Profile Completeness: ${profile.analytics.profileCompleteness}%`, 'success')
      }

      // Display comprehensive field coverage
      this.log(`\n🔍 Profile Data Coverage:`, 'info')
      const fieldCoverage = {
        'Basic Info': !!(profile.firstName && profile.lastName && profile.headline),
        'Contact Details': !!(profile.phoneNumbers?.length || profile.websites?.length),
        'Professional Experience': !!(profile.positions?.length),
        'Education': !!(profile.educations?.length),
        'Skills & Endorsements': !!(profile.skills?.length),
        'Certifications': !!(profile.certifications?.length),
        'Projects': !!(profile.projects?.length),
        'Publications': !!(profile.publications?.length),
        'Languages': !!(profile.languages?.length),
        'Volunteer Experience': !!(profile.volunteeringExperiences?.length),
        'Honors & Awards': !!(profile.honors?.length),
        'Media (Profile/Background)': !!(profile.profilePicture || profile.backgroundImage)
      }

      Object.entries(fieldCoverage).forEach(([field, hasData]) => {
        const status = hasData ? '✅' : '❌'
        this.log(`   ${status} ${field}`, hasData ? 'success' : 'warning')
      })

      // Display skills and endorsements
      if (profile.skills?.length) {
        this.log(`\n🎯 Top Skills:`, 'info')
        profile.skills.slice(0, 5).forEach(skill => {
          this.log(`   • ${skill.name}: ${skill.endorsements} endorsements (${skill.level})`, 'success')
        })
      }

      // Display network analytics
      if (analytics.network) {
        this.log(`\n🌐 Network Analysis:`, 'info')
        this.log(`   Total Connections: ${analytics.network.connections.total?.toLocaleString()}`, 'info')
        this.log(`   New This Month: ${analytics.network.connections.new_this_month}`, 'success')
        this.log(`   Influence Score: ${analytics.network.influence.influence_score}/10`, 'success')

        if (analytics.network.connections.by_industry?.length) {
          this.log(`   Top Industries:`, 'info')
          analytics.network.connections.by_industry.slice(0, 3).forEach(industry => {
            this.log(`     - ${industry.industry}: ${industry.count} connections`, 'info')
          })
        }
      }

      // Display performance metrics
      if (analytics.performance) {
        this.log(`\n📈 Performance Metrics:`, 'data')
        this.log(`   Profile Views: ${analytics.performance.profileViews.current} (${analytics.performance.profileViews.changePercentage > 0 ? '+' : ''}${analytics.performance.profileViews.changePercentage.toFixed(1)}%)`, 'success')
        this.log(`   Search Appearances: ${analytics.performance.searchAppearances.current} (${analytics.performance.searchAppearances.changePercentage > 0 ? '+' : ''}${analytics.performance.searchAppearances.changePercentage.toFixed(1)}%)`, 'success')
        this.log(`   Connection Acceptance Rate: ${analytics.performance.connectionRequests.acceptance_rate.toFixed(1)}%`, 'success')
        this.log(`   Content Engagement Rate: ${analytics.performance.contentPerformance.engagement_rate}%`, 'success')
      }

      // Display AI-enhanced insights
      if (profile.enrichedData) {
        this.log(`\n🤖 AI-Enhanced Insights:`, 'data')
        if (profile.enrichedData.personalityInsights) {
          this.log(`   Personality Traits: ${profile.enrichedData.personalityInsights.traits?.join(', ')}`, 'info')
          this.log(`   Communication Style: ${profile.enrichedData.personalityInsights.communication_style}`, 'info')
          this.log(`   Work Style: ${profile.enrichedData.personalityInsights.work_style}`, 'info')
        }

        if (profile.enrichedData.networkAnalysis) {
          this.log(`   Industry Diversity: ${profile.enrichedData.networkAnalysis.industry_diversity}%`, 'success')
          this.log(`   Geographic Spread: ${profile.enrichedData.networkAnalysis.geographic_spread?.join(', ')}`, 'info')
        }
      }

      // Display recommendations
      if (analytics.recommendations) {
        this.log(`\n💡 Profile Optimization Recommendations:`, 'warning')
        analytics.recommendations.profile_optimization?.slice(0, 3).forEach(rec => {
          this.log(`   • ${rec}`, 'warning')
        })

        if (analytics.recommendations.networking_opportunities?.length) {
          this.log(`\n🤝 Networking Opportunities:`, 'warning')
          analytics.recommendations.networking_opportunities.slice(0, 2).forEach(opp => {
            this.log(`   • ${opp.type}: ${opp.description} (Priority: ${opp.priority})`, 'warning')
          })
        }
      }

      this.log(`\n✅ Profile demonstration completed for ${profileId}`, 'success')

    } catch (error) {
      this.log(`❌ Failed to demonstrate profile ${profileId}: ${error.message}`, 'error')
    }
  }

  async showComprehensiveFeatures() {
    this.log(`\n🎯 LinkedIn Profile Analytics - Comprehensive Features`, 'highlight')
    this.log('=' .repeat(80), 'highlight')

    const features = [
      {
        category: 'Profile Data Fields',
        items: [
          'Profile Picture & Background Image',
          'Location & Contact Information',
          'Current & Past Positions',
          'Education & Certifications',
          'Skills & Endorsements',
          'Languages & Proficiency',
          'Projects & Publications',
          'Volunteering Experience',
          'Honors & Awards',
          'Patents & Test Scores',
          'Instant Messages & Websites'
        ]
      },
      {
        category: 'Analytics & Insights',
        items: [
          'Trust & Influence Scoring',
          'Network Quality Analysis',
          'Profile Completeness Tracking',
          'Engagement Rate Monitoring',
          'Professional Ranking',
          'Industry Benchmarking',
          'Connection Growth Tracking',
          'Performance Trend Analysis'
        ]
      },
      {
        category: 'AI-Enhanced Features',
        items: [
          'Personality Insights Analysis',
          'Career Trajectory Mapping',
          'Network Diversity Scoring',
          'Content Theme Analysis',
          'Communication Style Profiling',
          'Thought Leadership Scoring',
          'Competitive Positioning',
          'Market Opportunity Detection'
        ]
      },
      {
        category: 'Business Intelligence',
        items: [
          'Strategic Networking Opportunities',
          'Career Advancement Recommendations',
          'Skill Development Guidance',
          'Content Strategy Suggestions',
          'Profile Optimization Actions',
          'Competitive Analysis Reports',
          'ROI Measurement & Tracking',
          'Industry Trend Integration'
        ]
      }
    ]

    features.forEach(featureGroup => {
      this.log(`\n📦 ${featureGroup.category}:`, 'data')
      featureGroup.items.forEach(item => {
        this.log(`   ✅ ${item}`, 'success')
      })
    })

    this.log(`\n🎊 All LinkedIn Profile Fields Supported!`, 'highlight')
    this.log('Complete professional networking analytics with comprehensive data coverage', 'highlight')

    this.log(`\n🚀 API Endpoints Available:`, 'info')
    const endpoints = [
      'GET /api/linkedin/profile-analytics?userId=defconect',
      'GET /api/linkedin/profile-analytics?userId=linkedout&includeCompetitiveAnalysis=true',
      'GET /api/linkedin/profile-analytics?includeRecommendations=true',
      'GET /api/social-media/analytics?brand=defconect&includeLinkedInProfile=true'
    ]

    endpoints.forEach(endpoint => {
      this.log(`   • ${endpoint}`, 'info')
    })
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI interface
if (require.main === module) {
  const demo = new LinkedInProfileDemo()
  demo.run().catch(error => {
    console.error('LinkedIn profile demo failed:', error)
    process.exit(1)
  })
}

module.exports = { LinkedInProfileDemo }