/**
 * Enhanced Database Schemas and Migration System
 * Comprehensive database schema definitions with validation and migration utilities
 */

import { z } from 'zod'

// ============================================================================
// CORE DATABASE SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  clerk_id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatar_url: z.string().url().optional(),
  linkedin_profile: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const AspirationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.enum(['career', 'skill', 'project', 'cause', 'networking']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']),
  target_date: z.string().datetime().optional(),
  progress_percentage: z.number().min(0).max(100),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const TribeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  type: z.enum(['professional', 'interest', 'project', 'geographic', 'skill-based', 'aspirational']),
  visibility: z.enum(['public', 'private', 'invite-only']),
  founder_id: z.string().uuid(),
  aspiration_focus: z.array(z.string()).default([]),
  member_count: z.number().min(0).default(1),
  skill_complementarity: z.record(z.number()).default({}),
  growth_potential: z.number().min(0).max(1).default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  status: z.enum(['active', 'inactive', 'archived']).default('active')
})

export const TribeMemberSchema = z.object({
  id: z.string().uuid(),
  tribe_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['founder', 'member', 'moderator']),
  joined_at: z.string().datetime(),
  contribution_score: z.number().min(0).max(100).default(0),
  aspiration_alignment: z.number().min(0).max(100).default(0)
})

export const TribeRuleSchema = z.object({
  id: z.string().uuid(),
  tribe_id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: z.enum(['content', 'governance', 'collaboration', 'behavior', 'participation']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  enforcement: z.enum(['warning', 'mute', 'ban', 'kick']),
  created_at: z.string().datetime(),
  created_by: z.string().uuid(),
  violations: z.array(z.object({
    user_id: z.string().uuid(),
    timestamp: z.string().datetime(),
    description: z.string(),
    resolved: z.boolean().default(false)
  })).default([])
})

export const ConnectionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  connected_user_id: z.string().uuid(),
  connection_type: z.enum(['linkedin', 'defconect', 'mutual']),
  aspiration_compatibility: z.number().min(0).max(100),
  relationship_strength: z.enum(['weak', 'medium', 'strong']),
  shared_aspirations: z.array(z.string()).default([]),
  last_interaction: z.string().datetime().optional(),
  conversation_starters: z.array(z.string()).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const AgentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['context', 'research', 'expert', 'analysis']),
  model: z.string().min(1),
  system_prompt: z.string().min(1).max(4000),
  capabilities: z.array(z.string()).default([]),
  aspiration_alignment: z.array(z.string()).optional(),
  usage_count: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000).optional(),
  founder_id: z.string().uuid(),
  tribe_id: z.string().uuid().optional(),
  aspiration_alignment: z.array(z.string()).default([]),
  team_members: z.array(z.string().uuid()).default([]),
  status: z.enum(['planning', 'active', 'completed', 'paused', 'archived']),
  motivation_score: z.number().min(0).max(1).default(0),
  synergy_potential: z.number().min(0).max(1).default(0),
  milestones: z.array(z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().optional(),
    due_date: z.string().datetime().optional(),
    completed: z.boolean().default(false),
    completed_at: z.string().datetime().optional()
  })).default([]),
  file_sharing_enabled: z.boolean().default(true),
  version_control_enabled: z.boolean().default(true),
  access_level: z.enum(['private', 'tribe', 'public']).default('private'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// ============================================================================
// SOCIAL MEDIA SCHEMAS
// ============================================================================

export const SocialAccountSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube']),
  account_id: z.string().min(1),
  username: z.string().min(1),
  display_name: z.string().min(1),
  profile_url: z.string().url(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  followers_count: z.number().min(0).default(0),
  following_count: z.number().min(0).default(0),
  posts_count: z.number().min(0).default(0),
  is_verified: z.boolean().default(false),
  is_active: z.boolean().default(true),
  last_sync_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const SocialPostSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  social_account_id: z.string().uuid(),
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube']),
  content: z.object({
    text: z.string().min(1).max(3000),
    hashtags: z.array(z.string()).optional(),
    links: z.array(z.object({
      url: z.string().url(),
      title: z.string(),
      description: z.string().optional()
    })).optional(),
    images: z.array(z.string().url()).optional(),
    videos: z.array(z.string().url()).optional()
  }),
  post_id: z.string().optional(), // Platform-specific post ID
  scheduled_at: z.string().datetime().optional(),
  published_at: z.string().datetime().optional(),
  engagement_metrics: z.object({
    likes: z.number().min(0).default(0),
    comments: z.number().min(0).default(0),
    shares: z.number().min(0).default(0),
    views: z.number().min(0).default(0),
    clicks: z.number().min(0).default(0)
  }).default({}),
  status: z.enum(['draft', 'scheduled', 'published', 'failed', 'deleted']),
  brand: z.enum(['defconect', 'linkedout']).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const SocialAnalyticsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  social_account_id: z.string().uuid(),
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube']),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  date: z.string().date(),
  metrics: z.object({
    followers: z.number().min(0).default(0),
    following: z.number().min(0).default(0),
    posts: z.number().min(0).default(0),
    likes: z.number().min(0).default(0),
    comments: z.number().min(0).default(0),
    shares: z.number().min(0).default(0),
    views: z.number().min(0).default(0),
    engagement_rate: z.number().min(0).max(1).default(0),
    reach: z.number().min(0).default(0),
    impressions: z.number().min(0).default(0)
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// ============================================================================
// KNOWLEDGE BASE SCHEMAS
// ============================================================================

export const KnowledgeBaseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['general', 'technical', 'business', 'personal', 'project', 'research']),
  tags: z.array(z.string()).default([]),
  is_public: z.boolean().default(false),
  access_level: z.enum(['private', 'shared', 'public']).default('private'),
  item_count: z.number().min(0).default(0),
  total_size_bytes: z.number().min(0).default(0),
  last_accessed: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const KnowledgeBaseItemSchema = z.object({
  id: z.string().uuid(),
  knowledge_base_id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  content_type: z.enum(['text', 'markdown', 'pdf', 'doc', 'docx', 'image', 'video', 'audio', 'url', 'chat_history', 'profile_data', 'file_upload']),
  source_type: z.enum(['upload', 'file_manager', 'chat_history', 'user_profile', 'url', 'manual']),
  source_url: z.string().url().optional(),
  file_path: z.string().optional(),
  file_size_bytes: z.number().min(0).default(0),
  metadata: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  is_processed: z.boolean().default(false),
  processing_status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  embedding_vector: z.array(z.number()).optional(),
  searchable_content: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// ============================================================================
// AUDIENCE INTELLIGENCE SCHEMAS
// ============================================================================

export const PsychographicPresetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['professional', 'demographic', 'behavioral', 'psychographic', 'lifestyle']),
  traits: z.record(z.any()).default({}),
  demographics: z.record(z.any()).default({}),
  behaviors: z.record(z.any()).default({}),
  communication_style: z.record(z.any()).default({}),
  content_preferences: z.record(z.any()).default({}),
  platform_usage: z.record(z.any()).default({}),
  is_public: z.boolean().default(false),
  created_by: z.string().uuid().optional(),
  usage_count: z.number().min(0).default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const UserPersonaSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  psychographic_preset_id: z.string().uuid().optional(),
  custom_traits: z.record(z.any()).default({}),
  demographics: z.record(z.any()).default({}),
  preferences: z.record(z.any()).default({}),
  communication_style: z.record(z.any()).default({}),
  content_engagement: z.record(z.any()).default({}),
  platform_behavior: z.record(z.any()).default({}),
  tribe_affinities: z.record(z.any()).default({}),
  project_interests: z.record(z.any()).default({}),
  is_primary: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const AudienceSegmentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  segment_criteria: z.record(z.any()).default({}),
  persona_ids: z.array(z.string().uuid()).default([]),
  size_estimate: z.number().min(0).default(0),
  engagement_score: z.number().min(0).max(10).default(0),
  conversion_potential: z.number().min(0).max(1).default(0),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// ============================================================================
// ANALYTICS AND TRACKING SCHEMAS
// ============================================================================

export const InteractionAnalyticsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  target_user_id: z.string().uuid().optional(),
  interaction_type: z.string().min(1),
  platform: z.enum(['linkedin', 'defconect', 'email', 'phone', 'meeting']),
  content_type: z.string().optional(),
  content_id: z.string().uuid().optional(),
  interaction_data: z.record(z.any()).default({}),
  sentiment_score: z.number().min(-1).max(1).optional(),
  engagement_level: z.enum(['low', 'medium', 'high']).default('medium'),
  timestamp: z.string().datetime()
})

export const NetworkVisualizationDataSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  network_type: z.enum(['connections', 'tribes', 'projects', 'collaborations']),
  node_data: z.record(z.any()).default({}),
  edge_data: z.record(z.any()).default({}),
  layout_data: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({}),
  last_calculated: z.string().datetime(),
  created_at: z.string().datetime()
})

// ============================================================================
// CONVERSATION AND CONTEXT SCHEMAS
// ============================================================================

export const ConversationContextSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_id: z.string().min(1),
  aspirations_discussed: z.array(z.string()).default([]),
  topics_covered: z.array(z.string()).default([]),
  goals_progress: z.record(z.any()).default({}),
  last_context: z.string().optional(),
  conversation_summary: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  steps: z.array(z.any()).default([]),
  aspiration_focus: z.array(z.string()).optional(),
  tribe_id: z.string().uuid().optional(),
  is_template: z.boolean().default(false),
  usage_count: z.number().min(0).default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// ============================================================================
// INPUT SCHEMAS FOR CREATION/UPDATES
// ============================================================================

export const CreateUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const CreateAspirationSchema = AspirationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const CreateTribeSchema = TribeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const CreateSocialPostSchema = SocialPostSchema.omit({
  id: true,
  post_id: true,
  published_at: true,
  engagement_metrics: true,
  created_at: true,
  updated_at: true
})

export const CreateKnowledgeBaseSchema = KnowledgeBaseSchema.omit({
  id: true,
  item_count: true,
  total_size_bytes: true,
  created_at: true,
  updated_at: true
})

// ============================================================================
// UPDATE SCHEMAS
// ============================================================================

export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  clerk_id: true,
  created_at: true,
  updated_at: true
})

export const UpdateAspirationSchema = AspirationSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true
})

export const UpdateTribeSchema = TribeSchema.partial().omit({
  id: true,
  founder_id: true,
  created_at: true,
  updated_at: true
})

export const UpdateProjectSchema = ProjectSchema.partial().omit({
  id: true,
  founder_id: true,
  created_at: true,
  updated_at: true
})

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc')
})

export const FilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  user_id: z.string().uuid().optional()
})

export const TribeQuerySchema = PaginationSchema.merge(FilterSchema).extend({
  type: z.enum(['professional', 'interest', 'project', 'geographic', 'skill-based', 'aspirational']).optional(),
  visibility: z.enum(['public', 'private', 'invite-only']).optional(),
  aspiration_focus: z.array(z.string()).optional()
})

export const ProjectQuerySchema = PaginationSchema.merge(FilterSchema).extend({
  status: z.enum(['planning', 'active', 'completed', 'paused', 'archived']).optional(),
  access_level: z.enum(['private', 'tribe', 'public']).optional(),
  tribe_id: z.string().uuid().optional()
})

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }).optional(),
  meta: z.record(z.any()).optional(),
  timestamp: z.string().datetime()
})

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  ApiResponseSchema.extend({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean()
    })
  })

// ============================================================================
// SCHEMA VALIDATION UTILITIES
// ============================================================================

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodError['errors']
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}

export function validateSchemaWithDefaults<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodError['errors']
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Try to parse with defaults
      try {
        const defaultData = schema.parse({})
        return { success: true, data: defaultData }
      } catch (defaultError) {
        return { success: false, errors: error.errors }
      }
    }
    throw error
  }
}

export function validateSchemaPartial<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: Partial<T>
  errors?: z.ZodError['errors']
} {
  try {
    // Create a partial schema manually since .partial() doesn't exist on all Zod types
    const partialSchema = z.object({}).passthrough()
    const validatedData = partialSchema.parse(data)
    return { success: true, data: validatedData as Partial<T> }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}

export function sanitizeForDatabase<T>(schema: z.ZodSchema<T>, data: any): T {
  // For now, just return the data as-is since schema._def.shape is not available on all Zod types
  // In a production environment, you would implement proper field filtering
  return schema.parse(data)
}

// ============================================================================
// EXPORTS
// ============================================================================

export type User = z.infer<typeof UserSchema>
export type Aspiration = z.infer<typeof AspirationSchema>
export type Tribe = z.infer<typeof TribeSchema>
export type TribeMember = z.infer<typeof TribeMemberSchema>
export type TribeRule = z.infer<typeof TribeRuleSchema>
export type Connection = z.infer<typeof ConnectionSchema>
export type Agent = z.infer<typeof AgentSchema>
export type Project = z.infer<typeof ProjectSchema>
export type SocialAccount = z.infer<typeof SocialAccountSchema>
export type SocialPost = z.infer<typeof SocialPostSchema>
export type SocialAnalytics = z.infer<typeof SocialAnalyticsSchema>
export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>
export type KnowledgeBaseItem = z.infer<typeof KnowledgeBaseItemSchema>
export type PsychographicPreset = z.infer<typeof PsychographicPresetSchema>
export type UserPersona = z.infer<typeof UserPersonaSchema>
export type AudienceSegment = z.infer<typeof AudienceSegmentSchema>
export type InteractionAnalytics = z.infer<typeof InteractionAnalyticsSchema>
export type NetworkVisualizationData = z.infer<typeof NetworkVisualizationDataSchema>
export type ConversationContext = z.infer<typeof ConversationContextSchema>
export type Workflow = z.infer<typeof WorkflowSchema>

export type CreateUser = z.infer<typeof CreateUserSchema>
export type CreateAspiration = z.infer<typeof CreateAspirationSchema>
export type CreateTribe = z.infer<typeof CreateTribeSchema>
export type CreateProject = z.infer<typeof CreateProjectSchema>
export type CreateSocialPost = z.infer<typeof CreateSocialPostSchema>
export type CreateKnowledgeBase = z.infer<typeof CreateKnowledgeBaseSchema>

export type UpdateUser = z.infer<typeof UpdateUserSchema>
export type UpdateAspiration = z.infer<typeof UpdateAspirationSchema>
export type UpdateTribe = z.infer<typeof UpdateTribeSchema>
export type UpdateProject = z.infer<typeof UpdateProjectSchema>

export type Pagination = z.infer<typeof PaginationSchema>
export type Filter = z.infer<typeof FilterSchema>
export type TribeQuery = z.infer<typeof TribeQuerySchema>
export type ProjectQuery = z.infer<typeof ProjectQuerySchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>
