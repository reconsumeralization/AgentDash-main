// Social Media Management Types and Interfaces

export interface SocialPlatform {
  id: string
  name: string
  type: 'professional' | 'social' | 'business' | 'community'
  icon: string
  color: string
  apiVersion: string
  features: SocialFeature[]
  limits: PlatformLimits
}

export interface SocialFeature {
  id: string
  name: string
  description: string
  category: 'posting' | 'analytics' | 'engagement' | 'management' | 'automation'
  requiresApproval: boolean
  scopes: string[]
}

export interface PlatformLimits {
  postsPerDay: number
  charactersPerPost: number
  imagesPerPost: number
  videosPerPost: number
  apiCallsPerHour: number
  rateLimitWindow: number
}

export interface SocialAccount {
  id: string
  platform: string
  username: string
  displayName: string
  profilePicture: string
  followers: number
  following: number
  isVerified: boolean
  isActive: boolean
  lastSync: Date
  permissions: string[]
  metadata: Record<string, any>
}

export interface SocialPost {
  id: string
  platform: string
  accountId: string
  content: PostContent
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'deleted'
  scheduledAt?: Date
  publishedAt?: Date
  engagement: PostEngagement
  metadata: PostMetadata
  createdAt: Date
  updatedAt: Date
}

export interface PostContent {
  text: string
  images: PostImage[]
  videos: PostVideo[]
  links: PostLink[]
  hashtags: string[]
  mentions: string[]
  location?: PostLocation
  poll?: PostPoll
}

export interface PostImage {
  id: string
  url: string
  alt: string
  caption?: string
  order: number
  dimensions: { width: number; height: number }
}

export interface PostVideo {
  id: string
  url: string
  thumbnail: string
  duration: number
  caption?: string
  order: number
}

export interface PostLink {
  id: string
  url: string
  title: string
  description?: string
  image?: string
  domain: string
}

export interface PostLocation {
  name: string
  coordinates?: { lat: number; lng: number }
  address?: string
}

export interface PostPoll {
  question: string
  options: string[]
  duration: number // in hours
  allowMultiple: boolean
}

export interface PostEngagement {
  likes: number
  comments: number
  shares: number
  saves: number
  clicks: number
  impressions: number
  reach: number
  engagementRate: number
  lastUpdated: Date
}

export interface PostMetadata {
  tags: string[]
  campaign?: string
  category: string
  language: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  topics: string[]
}

// Tribe/Community Management Types
export interface Tribe {
  id: string
  name: string
  description: string
  type: 'professional' | 'interest' | 'geographic' | 'industry' | 'custom'
  platform: string
  memberCount: number
  isPrivate: boolean
  rules: TribeRule[]
  moderators: TribeModerator[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TribeMember {
  id: string
  tribeId: string
  userId: string
  role: 'member' | 'moderator' | 'admin' | 'owner'
  joinedAt: Date
  lastActive: Date
  contributionScore: number
  permissions: string[]
  status: 'active' | 'muted' | 'banned' | 'pending'
}

export interface TribeRule {
  id: string
  title: string
  description: string
  category: 'content' | 'behavior' | 'spam' | 'privacy' | 'engagement'
  severity: 'warning' | 'mute' | 'ban'
  isActive: boolean
}

export interface TribeModerator {
  id: string
  userId: string
  permissions: string[]
  assignedAt: Date
  lastActive: Date
}

export interface TribeActivity {
  id: string
  tribeId: string
  userId: string
  type: 'post' | 'comment' | 'like' | 'share' | 'join' | 'leave'
  content?: string
  metadata: Record<string, any>
  timestamp: Date
}

// Content Management Types
export interface ContentCalendar {
  id: string
  name: string
  description: string
  platforms: string[]
  timezone: string
  posts: ScheduledPost[]
  campaigns: ContentCampaign[]
  createdAt: Date
  updatedAt: Date
}

export interface ScheduledPost {
  id: string
  calendarId: string
  content: PostContent
  platforms: string[]
  scheduledAt: Date
  status: 'scheduled' | 'published' | 'failed' | 'cancelled'
  campaignId?: string
  metadata: Record<string, any>
}

export interface ContentCampaign {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  platforms: string[]
  posts: string[]
  goals: CampaignGoal[]
  metrics: CampaignMetrics
  status: 'draft' | 'active' | 'paused' | 'completed'
}

export interface CampaignGoal {
  id: string
  type: 'engagement' | 'reach' | 'clicks' | 'conversions' | 'followers'
  target: number
  current: number
  deadline: Date
}

export interface CampaignMetrics {
  totalPosts: number
  totalReach: number
  totalEngagement: number
  totalClicks: number
  totalConversions: number
  averageEngagementRate: number
  costPerClick?: number
  costPerConversion?: number
}

// Analytics Types
export interface SocialAnalytics {
  platform: string
  accountId: string
  period: AnalyticsPeriod
  metrics: SocialMetrics
  posts: PostAnalytics[]
  audience: AudienceAnalytics
  competitors: CompetitorAnalytics[]
  trends: TrendData[]
}

export interface AnalyticsPeriod {
  start: Date
  end: Date
  granularity: 'hour' | 'day' | 'week' | 'month'
}

export interface SocialMetrics {
  followers: MetricData
  following: MetricData
  posts: MetricData
  engagement: MetricData
  reach: MetricData
  impressions: MetricData
  clicks: MetricData
  saves: MetricData
  shares: MetricData
  comments: MetricData
  likes: MetricData
}

export interface MetricData {
  current: number
  previous: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  data: TimeSeriesData[]
}

export interface TimeSeriesData {
  date: Date
  value: number
}

export interface PostAnalytics {
  postId: string
  content: string
  publishedAt: Date
  engagement: PostEngagement
  performance: PostPerformance
}

export interface PostPerformance {
  score: number
  rank: number
  bestPerforming: boolean
  worstPerforming: boolean
  insights: string[]
}

export interface AudienceAnalytics {
  demographics: DemographicsData
  interests: InterestData[]
  behavior: BehaviorData
  growth: GrowthData
}

export interface DemographicsData {
  age: AgeDistribution[]
  gender: GenderDistribution[]
  location: LocationDistribution[]
  language: LanguageDistribution[]
}

export interface AgeDistribution {
  range: string
  percentage: number
}

export interface GenderDistribution {
  gender: string
  percentage: number
}

export interface LocationDistribution {
  location: string
  percentage: number
}

export interface LanguageDistribution {
  language: string
  percentage: number
}

export interface InterestData {
  category: string
  percentage: number
  trending: boolean
}

export interface BehaviorData {
  activeHours: HourDistribution[]
  activeDays: DayDistribution[]
  deviceTypes: DeviceDistribution[]
  contentTypes: ContentTypeDistribution[]
}

export interface HourDistribution {
  hour: number
  activity: number
}

export interface DayDistribution {
  day: string
  activity: number
}

export interface DeviceDistribution {
  device: string
  percentage: number
}

export interface ContentTypeDistribution {
  type: string
  percentage: number
}

export interface GrowthData {
  followerGrowth: TimeSeriesData[]
  engagementGrowth: TimeSeriesData[]
  reachGrowth: TimeSeriesData[]
}

export interface CompetitorAnalytics {
  account: SocialAccount
  metrics: SocialMetrics
  comparison: ComparisonData
}

export interface ComparisonData {
  followersDifference: number
  engagementDifference: number
  reachDifference: number
  performanceScore: number
}

export interface TrendData {
  topic: string
  volume: number
  sentiment: 'positive' | 'neutral' | 'negative'
  trend: 'rising' | 'falling' | 'stable'
  relatedHashtags: string[]
}

// Engagement Types
export interface EngagementAction {
  id: string
  type: 'like' | 'comment' | 'share' | 'save' | 'follow' | 'unfollow'
  targetId: string
  targetType: 'post' | 'user' | 'tribe'
  content?: string
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
}

export interface EngagementCampaign {
  id: string
  name: string
  description: string
  type: 'growth' | 'engagement' | 'awareness' | 'conversion'
  targets: EngagementTarget[]
  actions: EngagementAction[]
  schedule: EngagementSchedule
  metrics: EngagementMetrics
  status: 'draft' | 'active' | 'paused' | 'completed'
}

export interface EngagementTarget {
  id: string
  type: 'hashtag' | 'user' | 'location' | 'keyword'
  value: string
  platform: string
  priority: 'low' | 'medium' | 'high'
}

export interface EngagementSchedule {
  startDate: Date
  endDate: Date
  frequency: 'hourly' | 'daily' | 'weekly'
  maxActionsPerDay: number
  activeHours: number[]
  activeDays: number[]
}

export interface EngagementMetrics {
  totalActions: number
  successfulActions: number
  failedActions: number
  newFollowers: number
  newEngagements: number
  reachIncrease: number
  engagementRate: number
}

// Automation Types
export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  actions: AutomationAction[]
  conditions: AutomationCondition[]
  isActive: boolean
  lastRun?: Date
  nextRun?: Date
}

export interface AutomationTrigger {
  type: 'schedule' | 'event' | 'condition'
  config: Record<string, any>
}

export interface AutomationAction {
  type: 'post' | 'engage' | 'follow' | 'unfollow' | 'message' | 'report'
  config: Record<string, any>
}

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
}

// LinkedIn Specific Types
export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  headline: string
  summary: string
  location: string
  industry: string
  profilePicture: string
  backgroundImage?: string
  connections: number
  followers: number
  experience: LinkedInExperience[]
  education: LinkedInEducation[]
  skills: LinkedInSkill[]
  recommendations: LinkedInRecommendation[]
  isVerified: boolean
  lastUpdated: Date
}

export interface LinkedInExperience {
  id: string
  title: string
  company: string
  location: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  description: string
}

export interface LinkedInEducation {
  id: string
  school: string
  degree: string
  field: string
  startDate: Date
  endDate?: Date
  description: string
}

export interface LinkedInSkill {
  id: string
  name: string
  endorsements: number
}

export interface LinkedInRecommendation {
  id: string
  recommender: string
  relationship: string
  text: string
  date: Date
}

export interface LinkedInPost {
  id: string
  author: string
  content: string
  images: string[]
  video?: string
  engagement: PostEngagement
  visibility: 'public' | 'connections' | 'private'
  publishedAt: Date
}

export interface LinkedInConnection {
  id: string
  firstName: string
  lastName: string
  headline: string
  profilePicture: string
  company: string
  location: string
  connectedAt: Date
  mutualConnections: number
  relationship: '1st' | '2nd' | '3rd'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  pagination?: PaginationInfo
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Context Integration Types
export interface SocialMediaContext {
  platform: string
  account: SocialAccount
  currentCampaign?: ContentCampaign
  activeTribe?: Tribe
  userRole: 'admin' | 'manager' | 'creator' | 'viewer'
  permissions: string[]
  preferences: SocialPreferences
}

export interface SocialPreferences {
  defaultPlatforms: string[]
  autoPosting: boolean
  engagementNotifications: boolean
  analyticsFrequency: 'daily' | 'weekly' | 'monthly'
  contentApproval: boolean
  tribeModeration: boolean
}
