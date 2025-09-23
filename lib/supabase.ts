import { createClient } from '@supabase/supabase-js'
import { errorHandler, ErrorCategory, ErrorSeverity, dbOperation } from './error-handling'
import { performanceMonitor, cache } from './performance-monitor'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have valid Supabase credentials
const isDemoMode = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock data for demo mode
const mockUser: User = {
  id: 'demo-user-1',
  clerk_id: 'demo-user-1',
  email: 'demo@defconect.com',
  name: 'Demo User',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  linkedin_profile: 'https://linkedin.com/in/demo-user'
}

const mockAspirations: Aspiration[] = [
  {
    id: 'asp-1',
    user_id: 'demo-user-1',
    title: 'Build AI-Powered Networking Platform',
    description: 'Create a platform that connects professionals based on future aspirations rather than past achievements',
    category: 'project',
    priority: 'high',
    status: 'active',
    target_date: '2025-12-31',
    progress_percentage: 75,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'asp-2',
    user_id: 'demo-user-1',
    title: 'Master Machine Learning Engineering',
    description: 'Deep dive into ML engineering, focusing on production systems and scalable architectures',
    category: 'skill',
    priority: 'critical',
    status: 'active',
    target_date: '2025-06-30',
    progress_percentage: 45,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'asp-3',
    user_id: 'demo-user-1',
    title: 'Launch Startup in EdTech',
    description: 'Build an educational platform that makes learning more engaging and accessible',
    category: 'career',
    priority: 'medium',
    status: 'active',
    target_date: '2026-01-15',
    progress_percentage: 20,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock connections data
const mockConnections: any[] = [
  {
    id: 'conn-1',
    user_id: 'demo-user-1',
    connected_user_id: 'user-2',
    aspiration_compatibility: 85,
    connection_strength: 75,
    mutual_connections: 3,
    shared_aspirations: ['project', 'skill'],
    last_interaction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    connected_user: {
      id: 'user-2',
      name: 'Sarah Chen',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
      linkedin_profile: 'https://linkedin.com/in/sarah-chen'
    }
  },
  {
    id: 'conn-2',
    user_id: 'demo-user-1',
    connected_user_id: 'user-3',
    aspiration_compatibility: 92,
    connection_strength: 80,
    mutual_connections: 5,
    shared_aspirations: ['career', 'skill'],
    last_interaction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    connected_user: {
      id: 'user-3',
      name: 'Marcus Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      linkedin_profile: 'https://linkedin.com/in/marcus-johnson'
    }
  }
]

// Mock tribes data
const mockTribes: any[] = [
  {
    id: 'tribe-1',
    name: 'AI/ML Pioneers',
    description: 'A community of forward-thinking professionals building the future of artificial intelligence and machine learning',
    aspiration_focus: ['skill', 'project', 'career'],
    founder_id: 'user-2',
    member_count: 1247,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    founder: {
      name: 'Sarah Chen',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: 'tribe-2',
    name: 'EdTech Innovators',
    description: 'Revolutionizing education through technology and innovative learning platforms',
    aspiration_focus: ['project', 'career', 'cause'],
    founder_id: 'user-3',
    member_count: 892,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    founder: {
      name: 'Marcus Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: 'tribe-3',
    name: 'Startup Founders Circle',
    description: 'Supporting aspiring and current startup founders in their entrepreneurial journey',
    aspiration_focus: ['career', 'project', 'networking'],
    founder_id: 'demo-user-1',
    member_count: 634,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    founder: {
      name: 'Demo User',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  }
]

// Database Types for DefConect Aspiration Platform
export interface User {
  id: string
  clerk_id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  updated_at: string
  linkedin_profile?: string
}

export interface Aspiration {
  id: string
  user_id: string
  title: string
  description: string
  category: 'career' | 'skill' | 'project' | 'cause' | 'networking'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  target_date?: string
  progress_percentage: number
  created_at: string
  updated_at: string
}

export interface AspirationMatch {
  id: string
  user_id: string
  aspiration_id: string
  matched_user_id: string
  match_score: number
  match_reasons: string[]
  compatibility_factors: Record<string, number>
  created_at: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  // Extended fields for provider usage
  user?: {
    id: string
    name: string
    avatar?: string
    title?: string
    company?: string
  }
  compatibility_score?: number
  shared_interests?: Array<{
    category: string
    title: string
  }>
  reason?: string
  priority?: string
}

export interface Tribe {
  id: string
  name: string
  description: string
  founder_id: string
  aspiration_focus: string[]
  member_count: number
  skill_complementarity: Record<string, number>
  growth_potential: number
  created_at: string
  updated_at: string
}

export interface TribeMember {
  id: string
  tribe_id: string
  user_id: string
  role: 'founder' | 'member' | 'moderator'
  joined_at: string
  contribution_score: number
  aspiration_alignment: number
}

export interface Connection {
  id: string
  user_id: string
  connected_user_id: string
  connection_type: 'linkedin' | 'defconect' | 'mutual'
  aspiration_compatibility: number
  relationship_strength: 'weak' | 'medium' | 'strong'
  shared_aspirations: string[]
  last_interaction?: string
  conversation_starters: string[]
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id: string
  name: string
  type: 'context' | 'research' | 'expert' | 'analysis'
  model: string
  system_prompt: string
  capabilities: string[]
  aspiration_alignment?: string[]
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Workflow {
  id: string
  user_id: string
  name: string
  description: string
  steps: any[] // JSON workflow definition
  aspiration_focus?: string[]
  tribe_id?: string
  is_template: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  founder_id: string
  tribe_id?: string
  aspiration_alignment: string[]
  team_members: string[]
  status: 'planning' | 'active' | 'completed' | 'paused' | 'archived'
  motivation_score: number
  synergy_potential: number
  milestones: any[]
  created_at: string
  updated_at: string
}

export interface RelationshipIntelligence {
  id: string
  user_id: string
  connection_id: string
  engagement_score: number
  optimal_timing: string[]
  conversation_topics: string[]
  collaboration_potential: number
  last_analysis: string
  created_at: string
  updated_at: string
}

export interface ConversationContext {
  id: string
  user_id: string
  session_id: string
  aspirations_discussed: string[]
  topics_covered: string[]
  goals_progress: Record<string, any>
  last_context: string | null
  conversation_summary: string | null
  created_at: string
  updated_at: string
}

export interface ConversationContextInput {
  aspirations_discussed?: string[]
  topics_covered?: string[]
  goals_progress?: Record<string, any>
  last_context?: string | null
  conversation_summary?: string | null
}

// Knowledge Base Interfaces
export interface KnowledgeBase {
  id: string
  user_id: string
  name: string
  description?: string
  category: 'general' | 'technical' | 'business' | 'personal' | 'project' | 'research'
  tags: string[]
  is_public: boolean
  access_level: 'private' | 'shared' | 'public'
  item_count: number
  total_size_bytes: number
  last_accessed?: string
  created_at: string
  updated_at: string
}

export interface KnowledgeBaseItem {
  id: string
  knowledge_base_id: string
  user_id: string
  title: string
  content?: string
  content_type: 'text' | 'markdown' | 'pdf' | 'doc' | 'docx' | 'image' | 'video' | 'audio' | 'url' | 'chat_history' | 'profile_data' | 'file_upload'
  source_type: 'upload' | 'file_manager' | 'chat_history' | 'user_profile' | 'url' | 'manual'
  source_url?: string
  file_path?: string
  file_size_bytes: number
  metadata: Record<string, any>
  tags: string[]
  is_processed: boolean
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  embedding_vector?: number[]
  searchable_content?: string
  created_at: string
  updated_at: string
}

export interface AgentKnowledgeAttachment {
  id: string
  agent_id: string
  knowledge_base_id: string
  attachment_type: 'full' | 'filtered' | 'selected_items'
  filter_criteria: Record<string, any>
  selected_item_ids: string[]
  attachment_priority: number
  is_auto_attached: boolean
  attachment_reason?: string
  usage_count: number
  last_used?: string
  created_at: string
  updated_at: string
}

export interface KnowledgeBaseSharing {
  id: string
  knowledge_base_id: string
  shared_with_user_id: string
  shared_by_user_id: string
  permission_level: 'read' | 'write' | 'admin'
  shared_at: string
  expires_at?: string
}

export interface KnowledgeRecommendation {
  id: string
  user_id: string
  agent_id: string
  knowledge_base_id: string
  recommendation_type: 'suggest_attach' | 'suggest_detach' | 'suggest_create'
  confidence_score: number
  reasoning?: string
  context_data: Record<string, any>
  is_applied: boolean
  applied_at?: string
  created_at: string
}

// Input interfaces for creating/updating knowledge bases
export interface KnowledgeBaseInput {
  name: string
  description?: string
  category: KnowledgeBase['category']
  tags?: string[]
  is_public?: boolean
  access_level?: KnowledgeBase['access_level']
}

export interface KnowledgeBaseItemInput {
  knowledge_base_id: string
  title: string
  content?: string
  content_type: KnowledgeBaseItem['content_type']
  source_type: KnowledgeBaseItem['source_type']
  source_url?: string
  file_path?: string
  file_size_bytes?: number
  metadata?: Record<string, any>
  tags?: string[]
}

export interface AgentKnowledgeAttachmentInput {
  agent_id: string
  knowledge_base_id: string
  attachment_type?: AgentKnowledgeAttachment['attachment_type']
  filter_criteria?: Record<string, any>
  selected_item_ids?: string[]
  attachment_priority?: number
  is_auto_attached?: boolean
  attachment_reason?: string
}

// Audience Intelligence & Persona Management Interfaces

export interface PsychographicPreset {
  id: string
  name: string
  description?: string
  category: 'professional' | 'demographic' | 'behavioral' | 'psychographic' | 'lifestyle'
  traits: Record<string, any>
  demographics: Record<string, any>
  behaviors: Record<string, any>
  communication_style: Record<string, any>
  content_preferences: Record<string, any>
  platform_usage: Record<string, any>
  is_public: boolean
  created_by?: string
  usage_count: number
  created_at: string
  updated_at: string
}

export interface UserPersona {
  id: string
  user_id: string
  name: string
  description?: string
  psychographic_preset_id?: string
  custom_traits: Record<string, any>
  demographics: Record<string, any>
  preferences: Record<string, any>
  communication_style: Record<string, any>
  content_engagement: Record<string, any>
  platform_behavior: Record<string, any>
  tribe_affinities: Record<string, any>
  project_interests: Record<string, any>
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AudienceSegment {
  id: string
  user_id: string
  name: string
  description?: string
  segment_criteria: Record<string, any>
  persona_ids: string[]
  size_estimate: number
  engagement_score: number
  conversion_potential: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ConnectionIntelligence {
  id: string
  user_id: string
  connected_user_id: string
  connection_strength: number
  interaction_frequency: 'low' | 'medium' | 'high' | 'very_high'
  last_interaction?: string
  interaction_types: string[]
  shared_interests: string[]
  mutual_connections: number
  collaboration_potential: number
  influence_score: number
  network_position: 'core' | 'bridge' | 'peripheral' | 'isolate'
  communication_preferences: Record<string, any>
  project_affinities: Record<string, any>
  tribe_overlap: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  founder_id: string
  tribe_id?: string
  aspiration_alignment: string[]
  team_members: string[]
  status: 'planning' | 'active' | 'completed' | 'paused' | 'archived'
  motivation_score: number
  synergy_potential: number
  milestones: any[]
  file_sharing_enabled: boolean
  version_control_enabled: boolean
  access_level: 'private' | 'tribe' | 'public'
  created_at: string
  updated_at: string
}

export interface ProjectFile {
  id: string
  project_id: string
  uploaded_by: string
  filename: string
  original_filename: string
  file_path: string
  file_size_bytes: number
  file_type: string
  mime_type?: string
  version_number: number
  parent_file_id?: string
  description?: string
  tags: string[]
  access_permissions: Record<string, any>
  download_count: number
  last_accessed?: string
  is_current_version: boolean
  created_at: string
  updated_at: string
}

export interface UserPreference {
  id: string
  user_id: string
  preference_category: string
  preference_key: string
  preference_value: Record<string, any>
  confidence_score: number
  source: 'explicit' | 'inferred' | 'behavioral' | 'ai_analyzed'
  last_updated: string
  created_at: string
}

export interface InteractionAnalytics {
  id: string
  user_id: string
  target_user_id: string
  interaction_type: string
  platform: 'linkedin' | 'defconect' | 'email' | 'phone' | 'meeting'
  content_type?: string
  content_id?: string
  interaction_data: Record<string, any>
  sentiment_score?: number
  engagement_level: 'low' | 'medium' | 'high'
  timestamp: string
}

export interface NetworkVisualizationData {
  id: string
  user_id: string
  network_type: 'connections' | 'tribes' | 'projects' | 'collaborations'
  node_data: Record<string, any>
  edge_data: Record<string, any>
  layout_data: Record<string, any>
  metadata: Record<string, any>
  last_calculated: string
  created_at: string
}

// Input interfaces for creating/updating audience intelligence entities
export interface PsychographicPresetInput {
  name: string
  description?: string
  category: PsychographicPreset['category']
  traits?: Record<string, any>
  demographics?: Record<string, any>
  behaviors?: Record<string, any>
  communication_style?: Record<string, any>
  content_preferences?: Record<string, any>
  platform_usage?: Record<string, any>
  is_public?: boolean
}

export interface UserPersonaInput {
  name: string
  description?: string
  psychographic_preset_id?: string
  custom_traits?: Record<string, any>
  demographics?: Record<string, any>
  preferences?: Record<string, any>
  communication_style?: Record<string, any>
  content_engagement?: Record<string, any>
  platform_behavior?: Record<string, any>
  tribe_affinities?: Record<string, any>
  project_interests?: Record<string, any>
  is_primary?: boolean
}

export interface AudienceSegmentInput {
  name: string
  description?: string
  segment_criteria: Record<string, any>
  persona_ids?: string[]
  size_estimate?: number
  engagement_score?: number
  conversion_potential?: number
}

export interface ProjectInput {
  name: string
  description?: string
  tribe_id?: string
  aspiration_alignment?: string[]
  team_members?: string[]
  status?: Project['status']
  file_sharing_enabled?: boolean
  version_control_enabled?: boolean
  access_level?: Project['access_level']
}

export interface ProjectFileInput {
  project_id: string
  filename: string
  original_filename: string
  file_path: string
  file_size_bytes?: number
  file_type: string
  mime_type?: string
  description?: string
  tags?: string[]
  access_permissions?: Record<string, any>
}

// Helper functions for data operations
export const db = {
  // User operations
  async getOrCreateUserByClerkId(
    clerkId: string,
    defaults: Partial<Pick<User, 'email' | 'name' | 'avatar_url' | 'linkedin_profile'>> = {}
  ): Promise<User> {
    // Return mock data in demo mode
    if (isDemoMode) {
      return {
        ...mockUser,
        clerk_id: clerkId,
        email: defaults.email || mockUser.email,
        name: defaults.name || mockUser.name,
        avatar_url: defaults.avatar_url || mockUser.avatar_url,
        linkedin_profile: defaults.linkedin_profile || mockUser.linkedin_profile
      }
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    if (data) {
      return data
    }

    const fallbackEmail = defaults.email ?? `${clerkId}@demo.defconect`
    const fallbackName = defaults.name ?? 'Demo User'

    const insertPayload: Record<string, any> = {
      clerk_id: clerkId,
      email: fallbackEmail,
      name: fallbackName
    }

    if (defaults.avatar_url) {
      insertPayload.avatar_url = defaults.avatar_url
    }

    if (defaults.linkedin_profile) {
      insertPayload.linkedin_profile = defaults.linkedin_profile
    }

    const { data: created, error: insertError } = await supabase
      .from('users')
      .insert(insertPayload)
      .select('*')
      .single()

    if (insertError) throw insertError
    return created
  },

  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // Aspiration operations
  async getUserAspirations(userId: string): Promise<Aspiration[]> {
    // Return mock data in demo mode
    if (isDemoMode) {
      return mockAspirations.filter(asp => asp.user_id === userId || userId === 'demo-user-1')
    }

    const { data, error } = await supabase
      .from('aspirations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createAspiration(aspiration: Omit<Aspiration, 'id' | 'created_at' | 'updated_at'>): Promise<Aspiration> {
    const { data, error } = await supabase
      .from('aspirations')
      .insert(aspiration)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // Tribe operations
  async findCompatibleTribes(userAspirations: string[], userSkills: string[]): Promise<Tribe[]> {
    // This would be a complex query matching aspirations and skills
    // For now, return all tribes (in production, this would use vector similarity)
    const { data, error } = await supabase
      .from('tribes')
      .select('*')
      .order('member_count', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createTribe(tribe: Omit<Tribe, 'id' | 'created_at' | 'updated_at'>): Promise<Tribe> {
    const { data, error } = await supabase
      .from('tribes')
      .insert(tribe)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async getTribes(limit: number = 20, offset: number = 0, aspirationFocus?: string[]): Promise<any[]> {
    // Return mock data in demo mode
    if (isDemoMode) {
      let filteredTribes = mockTribes
      if (aspirationFocus && aspirationFocus.length > 0) {
        filteredTribes = mockTribes.filter(tribe =>
          aspirationFocus.some(focus => tribe.aspiration_focus.includes(focus))
        )
      }
      return filteredTribes.slice(offset, offset + limit)
    }

    let query = supabase
      .from('tribes')
      .select(`
        *,
        founder:users(name, avatar_url),
        member_count
      `)
      .range(offset, offset + limit - 1)
      .order('member_count', { ascending: false })

    // Filter by aspiration focus if provided
    if (aspirationFocus && aspirationFocus.length > 0) {
      query = query.overlaps('aspiration_focus', aspirationFocus)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getUserConnections(userId: string): Promise<any[]> {
    // Return mock data in demo mode
    if (isDemoMode) {
      return mockConnections.filter(conn => conn.user_id === userId)
    }

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        connected_user:users!connections_connected_user_id_fkey(
          id,
          name,
          avatar_url,
          linkedin_profile
        )
      `)
      .eq('user_id', userId)
      .order('aspiration_compatibility', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Connection operations
  async findAspirationMatches(userId: string, aspirations: string[]): Promise<Connection[]> {
    // Complex matching logic would go here
    // For now, return sample connections
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', userId)
      .order('aspiration_compatibility', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createConnection(connection: Omit<Connection, 'id' | 'created_at' | 'updated_at'>): Promise<Connection> {
    const { data, error } = await supabase
      .from('connections')
      .insert(connection)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // Agent operations
  async getUserAgents(userId: string): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createAgent(agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // Workflow operations
  async getUserWorkflows(userId: string): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createWorkflow(workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .insert(workflow)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // Conversation context operations
  async getConversationContext(userId: string, sessionId: string): Promise<ConversationContext | null> {
    const { data, error } = await supabase
      .from('conversation_context')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  },

  async upsertConversationContext(
    userId: string,
    sessionId: string,
    payload: ConversationContextInput = {}
  ): Promise<ConversationContext> {
    const contextData = {
      user_id: userId,
      session_id: sessionId,
      aspirations_discussed: payload.aspirations_discussed ?? [],
      topics_covered: payload.topics_covered ?? [],
      goals_progress: payload.goals_progress ?? {},
      last_context: payload.last_context ?? null,
      conversation_summary: payload.conversation_summary ?? null
    }

    const { data: existing } = await supabase
      .from('conversation_context')
      .select('id')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('conversation_context')
        .update(contextData)
        .eq('id', existing.id)
        .select('*')
        .single()

      if (error) throw error
      return data
    }

    const { data, error } = await supabase
      .from('conversation_context')
      .insert(contextData)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async clearConversationContext(userId: string, sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('conversation_context')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId)

    if (error) throw error
  },

  // Security and audit methods
  async createAuditLog(auditEntry: any): Promise<void> {
    if (isDemoMode) return // Skip in demo mode
    
    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEntry)

    if (error) throw error
  },

  async createSecurityEvent(securityEvent: any): Promise<void> {
    if (isDemoMode) return // Skip in demo mode
    
    const { error } = await supabase
      .from('security_events')
      .insert(securityEvent)

    if (error) throw error
  },

  // Project access methods
  async getProject(projectId: string): Promise<any> {
    if (isDemoMode) {
      return {
        id: projectId,
        founder_id: 'demo-user-1',
        team_members: ['demo-user-1'],
        access_level: 'private'
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) throw error
    return data
  },

  // Knowledge base access methods
  async getKnowledgeBase(knowledgeBaseId: string): Promise<any> {
    if (isDemoMode) {
      return {
        id: knowledgeBaseId,
        user_id: 'demo-user-1',
        is_public: false
      }
    }

    const { data, error } = await supabase
      .from('knowledge_bases')
      .select('*')
      .eq('id', knowledgeBaseId)
      .single()

    if (error) throw error
    return data
  },

  async isKnowledgeBaseSharedWith(knowledgeBaseId: string, userId: string): Promise<boolean> {
    if (isDemoMode) return false

    const { data, error } = await supabase
      .from('knowledge_base_sharing')
      .select('id')
      .eq('knowledge_base_id', knowledgeBaseId)
      .eq('shared_with_user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  },

  // Audience Intelligence methods
  async getAudienceSegments(userId: string, options: { isActive?: boolean } = {}): Promise<any[]> {
    if (isDemoMode) {
      return [
        {
          id: 'segment-1',
          name: 'AI Professionals',
          description: 'Technology professionals interested in AI and ML',
          size_estimate: 1250,
          engagement_score: 8.7,
          conversion_potential: 0.75
        }
      ]
    }

    let query = supabase
      .from('audience_segments')
      .select('*')
      .eq('user_id', userId)

    if (options.isActive !== undefined) {
      query = query.eq('is_active', options.isActive)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getUserPersonas(userId: string): Promise<any[]> {
    if (isDemoMode) {
      return [
        {
          id: 'persona-1',
          name: 'Tech Innovator',
          description: 'Forward-thinking technology professional',
          is_primary: true,
          is_active: true
        }
      ]
    }

    const { data, error } = await supabase
      .from('user_personas')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  },

  async createUserPersona(userId: string, personaData: UserPersonaInput): Promise<any> {
    if (isDemoMode) {
      return {
        id: 'new-persona-' + Date.now(),
        ...personaData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('user_personas')
      .insert({
        ...personaData,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getPsychographicPresets(): Promise<any[]> {
    if (isDemoMode) {
      return [
        {
          id: 'preset-1',
          name: 'Professional Innovator',
          category: 'professional',
          is_public: true,
          usage_count: 150
        }
      ]
    }

    const { data, error } = await supabase
      .from('psychographic_presets')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getNetworkVisualizationData(userId: string, networkType: string): Promise<any> {
    if (isDemoMode) {
      return {
        id: 'network-1',
        network_type: networkType,
        node_data: {},
        edge_data: {},
        layout_data: {}
      }
    }

    const { data, error } = await supabase
      .from('network_visualization_data')
      .select('*')
      .eq('user_id', userId)
      .eq('network_type', networkType)
      .order('last_calculated', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createPsychographicPreset(userId: string, presetData: any): Promise<any> {
    if (isDemoMode) {
      return {
        id: 'preset-' + Date.now(),
        ...presetData,
        created_by: userId,
        created_at: new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('psychographic_presets')
      .insert({
        ...presetData,
        created_by: userId
      })
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async createAudienceSegment(userId: string, segmentData: any): Promise<any> {
    if (isDemoMode) {
      return {
        id: 'segment-' + Date.now(),
        ...segmentData,
        user_id: userId,
        created_at: new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('audience_segments')
      .insert({
        ...segmentData,
        user_id: userId
      })
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async createNetworkVisualizationData(userId: string, data: any): Promise<any> {
    if (isDemoMode) {
      return {
        id: `viz_${Date.now()}`,
        user_id: userId,
        network_type: data.networkType || 'professional',
        nodes: data.nodes || [],
        edges: data.edges || [],
        metadata: data.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    const { data: result, error } = await supabase
      .from('network_visualizations')
      .insert({
        user_id: userId,
        network_type: data.networkType || 'professional',
        nodes: data.nodes || [],
        edges: data.edges || [],
        metadata: data.metadata || {}
      })
      .select()
      .single()

    if (error) throw error
    return result
  },

  async getProjectFiles(projectId: string, userId: string): Promise<any[]> {
    if (isDemoMode) {
      return [
        {
          id: 'file-1',
          project_id: projectId,
          name: 'project-documentation.md',
          file_type: 'markdown',
          file_size: 2048,
          upload_date: new Date().toISOString(),
          uploaded_by: userId
        },
        {
          id: 'file-2',
          project_id: projectId,
          name: 'requirements.pdf',
          file_type: 'pdf',
          file_size: 1024000,
          upload_date: new Date().toISOString(),
          uploaded_by: userId
        }
      ]
    }

    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  },

  async createProjectFile(projectId: string, userId: string, fileData: any): Promise<any> {
    if (isDemoMode) {
      return {
        id: `file-${Date.now()}`,
        project_id: projectId,
        user_id: userId,
        name: fileData.name,
        file_type: fileData.file_type,
        file_size: fileData.file_size || 0,
        upload_date: new Date().toISOString(),
        uploaded_by: userId
      }
    }

    const { data, error } = await supabase
      .from('project_files')
      .insert({
        project_id: projectId,
        user_id: userId,
        name: fileData.name,
        file_type: fileData.file_type,
        file_size: fileData.file_size,
        upload_date: new Date().toISOString(),
        uploaded_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getProjects(userId: string, options: { status?: string, accessLevel?: string } = {}): Promise<any[]> {
    if (isDemoMode) {
      return [
        {
          id: 'project-1',
          user_id: userId,
          name: 'AI Platform Development',
          description: 'Building an AI-powered platform for professional networking',
          status: 'active',
          access_level: 'private',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'project-2',
          user_id: userId,
          name: 'LinkedOut Integration',
          description: 'Integrating LinkedIn API for enhanced networking features',
          status: 'active',
          access_level: 'private',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }

    let query = supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.accessLevel) {
      query = query.eq('access_level', options.accessLevel)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createProject(userId: string, projectData: any): Promise<any> {
    if (isDemoMode) {
      return {
        id: `project-${Date.now()}`,
        user_id: userId,
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || 'active',
        access_level: projectData.access_level || 'private',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || 'active',
        access_level: projectData.access_level || 'private'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
