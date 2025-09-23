/**
 * 🎯 PLATFORM CAPABILITY MATRIX
 * Defines what each platform supports and their limitations
 */

import { PlatformCapabilities, PlatformId } from './types'

// LinkedIn capabilities
export const LINKEDIN_CAPABILITIES: PlatformCapabilities = {
  canPost: true,
  canPostMedia: true,
  canPostVideo: true,
  canPostStories: false, // Limited to mobile app
  canPostLive: false, // Not available via API
  canSchedule: true,
  canEdit: false, // Not supported
  canDelete: true,
  
  canLike: true,
  canComment: true,
  canShare: true,
  canReact: true,
  
  canSendDM: false, // Requires partner approval
  canReceiveDM: false, // Requires partner approval
  canGroupMessage: false,
  
  canGetAnalytics: false, // Requires partner approval
  canGetEngagement: false, // Requires partner approval
  canGetReach: false, // Requires partner approval
  canGetDemographics: false, // Requires partner approval
  
  canSearchPosts: false, // Not available via API
  canSearchUsers: false, // Requires partner approval
  canSearchHashtags: false,
  
  supportsWebhooks: false, // Not available
  webhookTypes: [],
  
  rateLimits: {
    posts: { requests: 100, window: 60 * 60 * 1000 }, // 100/hour
    messages: { requests: 0, window: 60 * 1000 }, // Not available
    analytics: { requests: 0, window: 60 * 1000 }, // Not available
    search: { requests: 0, window: 60 * 1000 } // Not available
  },
  
  constraints: {
    maxTextLength: 3000,
    maxMediaCount: 9,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
    maxVideoSize: 5 * 1024 * 1024 * 1024, // 5GB
    maxVideoDuration: 10 * 60 * 1000, // 10 minutes
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: true
  },
  
  requiresApproval: {
    posting: false, // Basic posting is available
    messaging: true, // Requires partner approval
    analytics: true, // Requires partner approval
    webhooks: true // Not available
  },
  
  partnerProgram: {
    required: false,
    tier: 'basic',
    features: ['basic_posting', 'profile_access']
  }
}

// Twitter/X capabilities
export const TWITTER_CAPABILITIES: PlatformCapabilities = {
  canPost: true,
  canPostMedia: true,
  canPostVideo: true,
  canPostStories: false, // Not available
  canPostLive: false, // Not available via API
  canSchedule: true,
  canEdit: true, // Limited to 30 minutes
  canDelete: true,
  
  canLike: true,
  canComment: true,
  canShare: true,
  canReact: true,
  
  canSendDM: true, // Requires paid tier
  canReceiveDM: true, // Requires paid tier
  canGroupMessage: true, // Requires paid tier
  
  canGetAnalytics: true, // Requires paid tier
  canGetEngagement: true, // Requires paid tier
  canGetReach: true, // Requires paid tier
  canGetDemographics: true, // Requires paid tier
  
  canSearchPosts: true,
  canSearchUsers: true,
  canSearchHashtags: true,
  
  supportsWebhooks: true, // Requires paid tier
  webhookTypes: ['post_created', 'post_updated', 'post_deleted', 'message_received'],
  
  rateLimits: {
    posts: { requests: 300, window: 15 * 60 * 1000 }, // 300/15min
    messages: { requests: 1000, window: 60 * 60 * 1000 }, // 1000/hour
    analytics: { requests: 300, window: 15 * 60 * 1000 }, // 300/15min
    search: { requests: 300, window: 15 * 60 * 1000 } // 300/15min
  },
  
  constraints: {
    maxTextLength: 280,
    maxMediaCount: 4,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    maxVideoSize: 512 * 1024 * 1024, // 512MB
    maxVideoDuration: 2 * 60 * 60 * 1000, // 2 hours
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: true
  },
  
  requiresApproval: {
    posting: false,
    messaging: true, // Requires paid tier
    analytics: true, // Requires paid tier
    webhooks: true // Requires paid tier
  },
  
  partnerProgram: {
    required: false,
    tier: 'basic',
    features: ['basic_posting', 'basic_analytics']
  }
}

// Facebook capabilities
export const FACEBOOK_CAPABILITIES: PlatformCapabilities = {
  canPost: true,
  canPostMedia: true,
  canPostVideo: true,
  canPostStories: true,
  canPostLive: true,
  canSchedule: true,
  canEdit: true,
  canDelete: true,
  
  canLike: true,
  canComment: true,
  canShare: true,
  canReact: true,
  
  canSendDM: true, // Requires business account
  canReceiveDM: true, // Requires business account
  canGroupMessage: true, // Requires business account
  
  canGetAnalytics: true,
  canGetEngagement: true,
  canGetReach: true,
  canGetDemographics: true,
  
  canSearchPosts: true,
  canSearchUsers: true,
  canSearchHashtags: true,
  
  supportsWebhooks: true,
  webhookTypes: ['post_created', 'post_updated', 'post_deleted', 'comment_created', 'message_received'],
  
  rateLimits: {
    posts: { requests: 200, window: 60 * 60 * 1000 }, // 200/hour
    messages: { requests: 1000, window: 60 * 60 * 1000 }, // 1000/hour
    analytics: { requests: 200, window: 60 * 60 * 1000 }, // 200/hour
    search: { requests: 200, window: 60 * 60 * 1000 } // 200/hour
  },
  
  constraints: {
    maxTextLength: 63206,
    maxMediaCount: 10,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi'],
    maxVideoSize: 4 * 1024 * 1024 * 1024, // 4GB
    maxVideoDuration: 240 * 60 * 1000, // 4 hours
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: true
  },
  
  requiresApproval: {
    posting: false,
    messaging: true, // Requires business account
    analytics: false,
    webhooks: false
  },
  
  partnerProgram: {
    required: false,
    tier: 'basic',
    features: ['basic_posting', 'analytics', 'webhooks']
  }
}

// Instagram capabilities
export const INSTAGRAM_CAPABILITIES: PlatformCapabilities = {
  canPost: true,
  canPostMedia: true,
  canPostVideo: true,
  canPostStories: true,
  canPostLive: true,
  canSchedule: true,
  canEdit: false, // Not supported
  canDelete: true,
  
  canLike: true,
  canComment: true,
  canShare: true,
  canReact: true,
  
  canSendDM: false, // Very limited, requires special approval
  canReceiveDM: false, // Very limited, requires special approval
  canGroupMessage: false,
  
  canGetAnalytics: true,
  canGetEngagement: true,
  canGetReach: true,
  canGetDemographics: true,
  
  canSearchPosts: true,
  canSearchUsers: true,
  canSearchHashtags: true,
  
  supportsWebhooks: true,
  webhookTypes: ['post_created', 'post_deleted', 'comment_created'],
  
  rateLimits: {
    posts: { requests: 25, window: 60 * 60 * 1000 }, // 25/hour
    messages: { requests: 0, window: 60 * 1000 }, // Not available
    analytics: { requests: 200, window: 60 * 60 * 1000 }, // 200/hour
    search: { requests: 200, window: 60 * 60 * 1000 } // 200/hour
  },
  
  constraints: {
    maxTextLength: 2200,
    maxMediaCount: 10,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
    maxVideoSize: 100 * 1024 * 1024, // 100MB
    maxVideoDuration: 60 * 1000, // 1 minute
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: false // Not supported in posts
  },
  
  requiresApproval: {
    posting: false,
    messaging: true, // Requires special approval
    analytics: false,
    webhooks: false
  },
  
  partnerProgram: {
    required: false,
    tier: 'basic',
    features: ['basic_posting', 'analytics', 'webhooks']
  }
}

// TikTok capabilities
export const TIKTOK_CAPABILITIES: PlatformCapabilities = {
  canPost: false, // Requires partner approval
  canPostMedia: false, // Requires partner approval
  canPostVideo: false, // Requires partner approval
  canPostStories: false, // Not available
  canPostLive: false, // Not available via API
  canSchedule: false, // Requires partner approval
  canEdit: false, // Not supported
  canDelete: false, // Requires partner approval
  
  canLike: false, // Requires partner approval
  canComment: false, // Requires partner approval
  canShare: false, // Requires partner approval
  canReact: false, // Not available
  
  canSendDM: false, // Not available via API
  canReceiveDM: false, // Not available via API
  canGroupMessage: false,
  
  canGetAnalytics: false, // Requires partner approval
  canGetEngagement: false, // Requires partner approval
  canGetReach: false, // Requires partner approval
  canGetDemographics: false, // Requires partner approval
  
  canSearchPosts: false, // Requires partner approval
  canSearchUsers: false, // Requires partner approval
  canSearchHashtags: false, // Requires partner approval
  
  supportsWebhooks: false, // Not available
  webhookTypes: [],
  
  rateLimits: {
    posts: { requests: 0, window: 60 * 1000 }, // Not available
    messages: { requests: 0, window: 60 * 1000 }, // Not available
    analytics: { requests: 0, window: 60 * 1000 }, // Not available
    search: { requests: 0, window: 60 * 1000 } // Not available
  },
  
  constraints: {
    maxTextLength: 2200,
    maxMediaCount: 1,
    supportedMediaTypes: ['video/mp4'],
    maxVideoSize: 500 * 1024 * 1024, // 500MB
    maxVideoDuration: 3 * 60 * 1000, // 3 minutes
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: false // Not supported
  },
  
  requiresApproval: {
    posting: true, // Requires partner approval
    messaging: true, // Not available
    analytics: true, // Requires partner approval
    webhooks: true // Not available
  },
  
  partnerProgram: {
    required: true,
    tier: 'enterprise',
    features: ['posting', 'analytics', 'search']
  }
}

// YouTube capabilities
export const YOUTUBE_CAPABILITIES: PlatformCapabilities = {
  canPost: true,
  canPostMedia: false, // Only videos
  canPostVideo: true,
  canPostStories: false, // Not available via API
  canPostLive: true,
  canSchedule: true,
  canEdit: true,
  canDelete: true,
  
  canLike: true,
  canComment: true,
  canShare: true,
  canReact: true,
  
  canSendDM: false, // Not available
  canReceiveDM: false, // Not available
  canGroupMessage: false,
  
  canGetAnalytics: true,
  canGetEngagement: true,
  canGetReach: true,
  canGetDemographics: true,
  
  canSearchPosts: true,
  canSearchUsers: true,
  canSearchHashtags: true,
  
  supportsWebhooks: true,
  webhookTypes: ['post_created', 'post_updated', 'post_deleted', 'comment_created'],
  
  rateLimits: {
    posts: { requests: 10000, window: 24 * 60 * 60 * 1000 }, // 10000/day
    messages: { requests: 0, window: 60 * 1000 }, // Not available
    analytics: { requests: 10000, window: 24 * 60 * 60 * 1000 }, // 10000/day
    search: { requests: 10000, window: 24 * 60 * 60 * 1000 } // 10000/day
  },
  
  constraints: {
    maxTextLength: 5000,
    maxMediaCount: 1,
    supportedMediaTypes: ['video/mp4', 'video/avi', 'video/mov'],
    maxVideoSize: 256 * 1024 * 1024 * 1024, // 256GB
    maxVideoDuration: 12 * 60 * 60 * 1000, // 12 hours
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: true
  },
  
  requiresApproval: {
    posting: false,
    messaging: true, // Not available
    analytics: false,
    webhooks: false
  },
  
  partnerProgram: {
    required: false,
    tier: 'basic',
    features: ['posting', 'analytics', 'webhooks']
  }
}

// Reddit capabilities
export const REDDIT_CAPABILITIES: PlatformCapabilities = {
  canPost: true,
  canPostMedia: true,
  canPostVideo: true,
  canPostStories: false, // Not available
  canPostLive: false, // Not available
  canSchedule: false, // Not supported
  canEdit: true,
  canDelete: true,
  
  canLike: true,
  canComment: true,
  canShare: true,
  canReact: true,
  
  canSendDM: true,
  canReceiveDM: true,
  canGroupMessage: true,
  
  canGetAnalytics: false, // Not available via API
  canGetEngagement: false, // Not available via API
  canGetReach: false, // Not available via API
  canGetDemographics: false, // Not available via API
  
  canSearchPosts: true,
  canSearchUsers: true,
  canSearchHashtags: false, // Not supported
  
  supportsWebhooks: false, // Not available
  webhookTypes: [],
  
  rateLimits: {
    posts: { requests: 60, window: 60 * 1000 }, // 60/minute
    messages: { requests: 60, window: 60 * 1000 }, // 60/minute
    analytics: { requests: 0, window: 60 * 1000 }, // Not available
    search: { requests: 60, window: 60 * 1000 } // 60/minute
  },
  
  constraints: {
    maxTextLength: 40000,
    maxMediaCount: 1,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    maxVideoSize: 1 * 1024 * 1024 * 1024, // 1GB
    maxVideoDuration: 15 * 60 * 1000, // 15 minutes
    hashtagSupport: false, // Not supported
    mentionSupport: true,
    linkSupport: true
  },
  
  requiresApproval: {
    posting: false,
    messaging: false,
    analytics: true, // Not available
    webhooks: true // Not available
  },
  
  partnerProgram: {
    required: false,
    tier: 'basic',
    features: ['basic_posting', 'messaging']
  }
}

// Platform capability registry
export const PLATFORM_CAPABILITIES: Record<PlatformId, PlatformCapabilities> = {
  linkedin: LINKEDIN_CAPABILITIES,
  twitter: TWITTER_CAPABILITIES,
  facebook: FACEBOOK_CAPABILITIES,
  instagram: INSTAGRAM_CAPABILITIES,
  tiktok: TIKTOK_CAPABILITIES,
  youtube: YOUTUBE_CAPABILITIES,
  reddit: REDDIT_CAPABILITIES,
  discord: {
    canPost: false,
    canPostMedia: false,
    canPostVideo: false,
    canPostStories: false,
    canPostLive: false,
    canSchedule: false,
    canEdit: false,
    canDelete: false,
    canLike: false,
    canComment: false,
    canShare: false,
    canReact: false,
    canSendDM: true,
    canReceiveDM: true,
    canGroupMessage: true,
    canGetAnalytics: false,
    canGetEngagement: false,
    canGetReach: false,
    canGetDemographics: false,
    canSearchPosts: false,
    canSearchUsers: false,
    canSearchHashtags: false,
    supportsWebhooks: true,
    webhookTypes: ['message_received'],
    rateLimits: {
      posts: { requests: 0, window: 60 * 1000 },
      messages: { requests: 50, window: 60 * 1000 },
      analytics: { requests: 0, window: 60 * 1000 },
      search: { requests: 0, window: 60 * 1000 }
    },
    constraints: {
      maxTextLength: 2000,
      maxMediaCount: 10,
      supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
      maxVideoSize: 25 * 1024 * 1024, // 25MB
      maxVideoDuration: 8 * 60 * 1000, // 8 minutes
      hashtagSupport: false,
      mentionSupport: true,
      linkSupport: true
    },
    requiresApproval: {
      posting: true,
      messaging: false,
      analytics: true,
      webhooks: false
    },
    partnerProgram: {
      required: false,
      tier: 'basic',
      features: ['messaging']
    }
  },
  telegram: {
    canPost: false,
    canPostMedia: false,
    canPostVideo: false,
    canPostStories: false,
    canPostLive: false,
    canSchedule: false,
    canEdit: false,
    canDelete: false,
    canLike: false,
    canComment: false,
    canShare: false,
    canReact: false,
    canSendDM: true,
    canReceiveDM: true,
    canGroupMessage: true,
    canGetAnalytics: false,
    canGetEngagement: false,
    canGetReach: false,
    canGetDemographics: false,
    canSearchPosts: false,
    canSearchUsers: false,
    canSearchHashtags: false,
    supportsWebhooks: true,
    webhookTypes: ['message_received'],
    rateLimits: {
      posts: { requests: 0, window: 60 * 1000 },
      messages: { requests: 30, window: 60 * 1000 },
      analytics: { requests: 0, window: 60 * 1000 },
      search: { requests: 0, window: 60 * 1000 }
    },
    constraints: {
      maxTextLength: 4096,
      maxMediaCount: 10,
      supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mp3', 'document/pdf'],
      maxVideoSize: 50 * 1024 * 1024, // 50MB
      maxVideoDuration: 60 * 60 * 1000, // 1 hour
      hashtagSupport: false,
      mentionSupport: true,
      linkSupport: true
    },
    requiresApproval: {
      posting: true,
      messaging: false,
      analytics: true,
      webhooks: false
    },
    partnerProgram: {
      required: false,
      tier: 'basic',
      features: ['messaging']
    }
  },
  mastodon: {
    canPost: true,
    canPostMedia: true,
    canPostVideo: true,
    canPostStories: false,
    canPostLive: false,
    canSchedule: true,
    canEdit: true,
    canDelete: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canReact: true,
    canSendDM: true,
    canReceiveDM: true,
    canGroupMessage: false,
    canGetAnalytics: false,
    canGetEngagement: false,
    canGetReach: false,
    canGetDemographics: false,
    canSearchPosts: true,
    canSearchUsers: true,
    canSearchHashtags: true,
    supportsWebhooks: true,
    webhookTypes: ['post_created', 'post_updated', 'post_deleted', 'message_received'],
    rateLimits: {
      posts: { requests: 300, window: 5 * 60 * 1000 }, // 300/5min
      messages: { requests: 300, window: 5 * 60 * 1000 }, // 300/5min
      analytics: { requests: 0, window: 60 * 1000 },
      search: { requests: 300, window: 5 * 60 * 1000 } // 300/5min
    },
    constraints: {
      maxTextLength: 500,
      maxMediaCount: 4,
      supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
      maxVideoSize: 40 * 1024 * 1024, // 40MB
      maxVideoDuration: 30 * 60 * 1000, // 30 minutes
      hashtagSupport: true,
      mentionSupport: true,
      linkSupport: true
    },
    requiresApproval: {
      posting: false,
      messaging: false,
      analytics: true,
      webhooks: false
    },
    partnerProgram: {
      required: false,
      tier: 'basic',
      features: ['posting', 'messaging', 'webhooks']
    }
  }
}

// Utility functions
export function getPlatformCapabilities(platformId: PlatformId): PlatformCapabilities {
  return PLATFORM_CAPABILITIES[platformId] || PLATFORM_CAPABILITIES.linkedin
}

export function isFeatureSupported(platformId: PlatformId, feature: keyof PlatformCapabilities): boolean {
  const capabilities = getPlatformCapabilities(platformId)
  return Boolean(capabilities[feature])
}

export function getSupportedPlatforms(feature: keyof PlatformCapabilities): PlatformId[] {
  return Object.entries(PLATFORM_CAPABILITIES)
    .filter(([_, capabilities]) => Boolean(capabilities[feature]))
    .map(([platformId, _]) => platformId as PlatformId)
}

export function getPlatformConstraints(platformId: PlatformId) {
  return getPlatformCapabilities(platformId).constraints
}

export function getPlatformRateLimits(platformId: PlatformId) {
  return getPlatformCapabilities(platformId).rateLimits
}

export function requiresApproval(platformId: PlatformId, feature: 'posting' | 'messaging' | 'analytics' | 'webhooks'): boolean {
  const capabilities = getPlatformCapabilities(platformId)
  return capabilities.requiresApproval[feature]
}

export function getPartnerProgramTier(platformId: PlatformId): 'basic' | 'premium' | 'enterprise' {
  const capabilities = getPlatformCapabilities(platformId)
  return capabilities.partnerProgram.tier
}
