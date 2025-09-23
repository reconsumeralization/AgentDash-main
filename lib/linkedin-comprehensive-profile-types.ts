/**
 * Comprehensive LinkedIn Profile Data Types
 * Based on LinkedIn Profile API and professional networking requirements
 * Supports all LinkedIn profile fields for enhanced analytics and networking
 */

export interface LinkedInLocation {
  country?: string
  region?: string
  city?: string
  postalCode?: string
  countryCode?: string
  geographicArea?: string
}

export interface LinkedInPosition {
  id?: string
  title?: string
  summary?: string
  startDate?: {
    year?: number
    month?: number
    day?: number
  }
  endDate?: {
    year?: number
    month?: number
    day?: number
  }
  isCurrent?: boolean
  company?: {
    id?: string
    name?: string
    industry?: string
    size?: string
    type?: string
    website?: string
    logo?: string
  }
  location?: LinkedInLocation
  description?: string
}

export interface LinkedInEducation {
  id?: string
  schoolName?: string
  fieldOfStudy?: string
  degree?: string
  grade?: string
  activities?: string
  notes?: string
  startDate?: {
    year?: number
    month?: number
  }
  endDate?: {
    year?: number
    month?: number
  }
  school?: {
    id?: string
    name?: string
    logo?: string
    website?: string
  }
}

export interface LinkedInCertification {
  id?: string
  name?: string
  authority?: string
  number?: string
  startDate?: {
    year?: number
    month?: number
  }
  endDate?: {
    year?: number
    month?: number
  }
  url?: string
  isActive?: boolean
}

export interface LinkedInCourse {
  id?: string
  name?: string
  number?: string
  description?: string
  provider?: string
  completionDate?: {
    year?: number
    month?: number
  }
  certificateUrl?: string
}

export interface LinkedInHonor {
  id?: string
  name?: string
  issuer?: string
  issueDate?: {
    year?: number
    month?: number
  }
  description?: string
  occupation?: string
}

export interface LinkedInLanguage {
  id?: string
  name?: string
  proficiency?: 'ELEMENTARY' | 'LIMITED_WORKING' | 'PROFESSIONAL_WORKING' | 'FULL_PROFESSIONAL' | 'NATIVE_OR_BILINGUAL'
}

export interface LinkedInOrganization {
  id?: string
  name?: string
  position?: string
  startDate?: {
    year?: number
    month?: number
  }
  endDate?: {
    year?: number
    month?: number
  }
  isCurrent?: boolean
  description?: string
  summary?: string
}

export interface LinkedInPatent {
  id?: string
  title?: string
  summary?: string
  number?: string
  status?: 'APPLICATION_FILED' | 'PATENT_GRANTED' | 'PATENT_ISSUED'
  office?: string
  inventors?: string[]
  date?: {
    year?: number
    month?: number
    day?: number
  }
  url?: string
}

export interface LinkedInPhoneNumber {
  type?: 'HOME' | 'WORK' | 'MOBILE' | 'FAX' | 'OTHER'
  number?: string
  primary?: boolean
}

export interface LinkedInProject {
  id?: string
  name?: string
  description?: string
  startDate?: {
    year?: number
    month?: number
  }
  endDate?: {
    year?: number
    month?: number
  }
  isCurrent?: boolean
  url?: string
  members?: string[]
  skills?: string[]
}

export interface LinkedInPublication {
  id?: string
  title?: string
  publisher?: string
  description?: string
  date?: {
    year?: number
    month?: number
    day?: number
  }
  url?: string
  authors?: string[]
}

export interface LinkedInSkill {
  id?: string
  name?: string
  endorsements?: number
  endorsers?: Array<{
    id?: string
    name?: string
    profilePicture?: string
  }>
  category?: string
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
}

export interface LinkedInTestScore {
  id?: string
  name?: string
  score?: string
  date?: {
    year?: number
    month?: number
  }
  description?: string
}

export interface LinkedInVolunteeringExperience {
  id?: string
  role?: string
  organization?: {
    id?: string
    name?: string
    description?: string
    website?: string
  }
  cause?: string
  description?: string
  startDate?: {
    year?: number
    month?: number
  }
  endDate?: {
    year?: number
    month?: number
  }
  isCurrent?: boolean
}

export interface LinkedInVolunteeringInterest {
  id?: string
  name?: string
  causes?: string[]
}

export interface LinkedInWebsite {
  type?: 'PERSONAL' | 'COMPANY' | 'BLOG' | 'RSS' | 'PORTFOLIO' | 'OTHER'
  url?: string
  label?: string
  category?: string
}

export interface LinkedInInstantMessage {
  type?: 'SKYPE' | 'AIM' | 'ICQ' | 'YAHOO' | 'MSN' | 'GTALK' | 'JABBER' | 'OTHER'
  handle?: string
  provider?: string
}

export interface LinkedInPictureInfo {
  original?: string
  cropped?: string
  croppedHeight?: number
  croppedWidth?: number
  croppedX?: number
  croppedY?: number
}

export interface LinkedInBackgroundImage {
  url?: string
  width?: number
  height?: number
  alt?: string
}

/**
 * Comprehensive LinkedIn Profile Interface
 * Includes all available LinkedIn profile fields for complete professional data
 */
export interface LinkedInComprehensiveProfile {
  // Basic Information
  id: string
  firstName?: string
  lastName?: string
  localizedFirstName?: string
  localizedLastName?: string
  maidenName?: string
  formattedName?: string
  phoneticFirstName?: string
  phoneticLastName?: string
  formattedPhoneticName?: string

  // Profile Pictures and Background
  profilePicture?: LinkedInPictureInfo
  backgroundPicture?: LinkedInBackgroundImage
  pictureInfo?: LinkedInPictureInfo
  backgroundImage?: LinkedInBackgroundImage

  // Location and Contact
  location?: LinkedInLocation
  phoneNumbers?: LinkedInPhoneNumber[]
  instantMessages?: LinkedInInstantMessage[]
  websites?: LinkedInWebsite[]

  // Professional Information
  headline?: string
  summary?: string
  industry?: string
  positions?: LinkedInPosition[]
  currentPositions?: LinkedInPosition[]
  pastPositions?: LinkedInPosition[]

  // Education and Learning
  educations?: LinkedInEducation[]
  certifications?: LinkedInCertification[]
  courses?: LinkedInCourse[]
  honors?: LinkedInHonor[]
  testScores?: LinkedInTestScore[]

  // Skills and Expertise
  skills?: LinkedInSkill[]
  languages?: LinkedInLanguage[]

  // Activities and Involvement
  organizations?: LinkedInOrganization[]
  volunteeringExperiences?: LinkedInVolunteeringExperience[]
  volunteeringInterests?: LinkedInVolunteeringInterest[]

  // Intellectual Property
  patents?: LinkedInPatent[]
  publications?: LinkedInPublication[]
  projects?: LinkedInProject[]

  // Metadata and Analytics
  createdAt?: Date
  lastModified?: Date
  profileViews?: number
  connectionCount?: number
  followerCount?: number
  isVerified?: boolean
  isPremium?: boolean
  isOpenToWork?: boolean
  isHiring?: boolean

  // Privacy and Permissions
  publicProfileUrl?: string
  vanityName?: string
  isPublic?: boolean

  // Custom Analytics Fields
  analytics?: {
    trustScore?: number
    influenceScore?: number
    networkQuality?: number
    engagementRate?: number
    professionalRank?: number
    industryRank?: number
    connectionGrowth?: number
    profileCompleteness?: number
    responseRate?: number
  }

  // Social Media Integration
  socialMediaPresence?: {
    twitter?: string
    facebook?: string
    instagram?: string
    youtube?: string
    github?: string
    personalWebsite?: string
  }

  // AI-Enhanced Data
  enrichedData?: {
    personalityInsights?: {
      traits?: string[]
      communication_style?: string
      decision_making?: string
      work_style?: string
    }
    careerTrajectory?: {
      progression?: string
      industry_switches?: number
      title_progression?: string[]
      skill_evolution?: string[]
    }
    networkAnalysis?: {
      industry_diversity?: number
      seniority_mix?: {
        junior?: number
        mid?: number
        senior?: number
        executive?: number
      }
      geographic_spread?: string[]
      company_types?: string[]
    }
    contentAnalysis?: {
      posting_frequency?: string
      content_themes?: string[]
      engagement_patterns?: string[]
      thought_leadership_score?: number
    }
  }
}

/**
 * LinkedIn Profile Analytics Extension
 * Additional analytics and insights for comprehensive profiles
 */
export interface LinkedInProfileAnalytics {
  profile: LinkedInComprehensiveProfile

  // Performance Metrics
  performance: {
    profileViews: {
      current: number
      previous: number
      change: number
      changePercentage: number
      trend: 'up' | 'down' | 'stable'
      data: Array<{ date: Date; value: number }>
    }
    searchAppearances: {
      current: number
      previous: number
      change: number
      changePercentage: number
      trend: 'up' | 'down' | 'stable'
      data: Array<{ date: Date; value: number }>
    }
    connectionRequests: {
      sent: number
      received: number
      accepted: number
      acceptance_rate: number
      response_rate: number
    }
    contentPerformance: {
      posts: number
      likes: number
      comments: number
      shares: number
      engagement_rate: number
      reach: number
      impressions: number
    }
  }

  // Network Analysis
  network: {
    connections: {
      total: number
      new_this_month: number
      by_industry: Array<{ industry: string; count: number }>
      by_seniority: Array<{ level: string; count: number }>
      by_company: Array<{ company: string; count: number }>
      by_location: Array<{ location: string; count: number }>
    }
    influence: {
      network_size: number
      follower_count: number
      influence_score: number
      thought_leadership_rank: number
      industry_rank: number
      connection_quality_score: number
    }
  }

  // Professional Insights
  insights: {
    career_progression: {
      years_experience: number
      companies_worked: number
      industries_worked: string[]
      title_progression: string[]
      salary_trajectory?: string
    }
    skill_development: {
      skill_count: number
      endorsement_count: number
      top_skills: string[]
      emerging_skills: string[]
      skill_gaps?: string[]
    }
    market_position: {
      industry_expertise: string
      competitive_positioning: string
      market_demand: string
      salary_benchmark?: string
      job_opportunities: number
    }
  }

  // Recommendations and Opportunities
  recommendations: {
    profile_optimization: string[]
    networking_opportunities: Array<{
      type: string
      description: string
      priority: 'high' | 'medium' | 'low'
      action: string
    }>
    content_suggestions: string[]
    skill_development: string[]
    career_opportunities: Array<{
      title: string
      company: string
      match_score: number
      requirements: string[]
    }>
  }

  // Competitive Analysis
  competitive_analysis?: {
    peer_comparison: Array<{
      peer_id: string
      peer_name: string
      comparison_metrics: {
        profile_strength: number
        network_size: number
        content_engagement: number
        industry_influence: number
      }
      competitive_advantages: string[]
      improvement_areas: string[]
    }>
    industry_benchmarks: {
      average_connections: number
      average_endorsements: number
      average_profile_views: number
      top_performers: Array<{
        id: string
        name: string
        score: number
        strengths: string[]
      }>
    }
  }
}

/**
 * LinkedIn Profile Enhancement Service Response
 */
export interface LinkedInProfileEnhancementResponse {
  success: boolean
  profile: LinkedInComprehensiveProfile
  analytics: LinkedInProfileAnalytics
  enhancement_score: number
  recommendations: string[]
  next_steps: string[]
  cache_expiry: Date
}

/**
 * LinkedIn Profile Data Source
 */
export interface LinkedInProfileDataSource {
  source: 'api' | 'scraping' | 'manual' | 'cached'
  last_updated: Date
  data_completeness: number
  verification_status: 'verified' | 'unverified' | 'pending'
  api_version?: string
  rate_limit_status?: {
    remaining: number
    reset_time: Date
  }
}

/**
 * Export comprehensive profile types for integration
 */
export type {
  LinkedInLocation,
  LinkedInPosition,
  LinkedInEducation,
  LinkedInCertification,
  LinkedInCourse,
  LinkedInHonor,
  LinkedInLanguage,
  LinkedInOrganization,
  LinkedInPatent,
  LinkedInPhoneNumber,
  LinkedInProject,
  LinkedInPublication,
  LinkedInSkill,
  LinkedInTestScore,
  LinkedInVolunteeringExperience,
  LinkedInVolunteeringInterest,
  LinkedInWebsite,
  LinkedInInstantMessage,
  LinkedInPictureInfo,
  LinkedInBackgroundImage,
  LinkedInComprehensiveProfile,
  LinkedInProfileAnalytics,
  LinkedInProfileEnhancementResponse,
  LinkedInProfileDataSource
}