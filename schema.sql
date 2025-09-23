-- DefConect Aspiration-Based Professional Networking Platform
-- Database Schema for Supabase/PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Clerk auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  linkedin_profile TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aspirations table (core of DefConect)
CREATE TABLE aspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('career', 'skill', 'project', 'cause', 'networking')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  target_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tribes table (professional trajectory groups)
CREATE TABLE tribes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  aspiration_focus TEXT[] DEFAULT '{}', -- Array of aspiration categories
  member_count INTEGER DEFAULT 1,
  skill_complementarity JSONB DEFAULT '{}', -- Skill compatibility scores
  growth_potential DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tribe members table
CREATE TABLE tribe_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('founder', 'member', 'moderator')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contribution_score DECIMAL(5,2) DEFAULT 0.0,
  aspiration_alignment DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  UNIQUE(tribe_id, user_id)
);

-- Connections table (aspiration-based relationships)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL DEFAULT 'defconect' CHECK (connection_type IN ('linkedin', 'defconect', 'mutual')),
  aspiration_compatibility DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  relationship_strength TEXT NOT NULL DEFAULT 'weak' CHECK (relationship_strength IN ('weak', 'medium', 'strong')),
  shared_aspirations TEXT[] DEFAULT '{}',
  last_interaction TIMESTAMP WITH TIME ZONE,
  conversation_starters TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Agents table (AI assistants with aspiration alignment)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('context', 'research', 'expert', 'analysis')),
  model TEXT NOT NULL DEFAULT 'gpt-4',
  system_prompt TEXT NOT NULL,
  capabilities TEXT[] DEFAULT '{}',
  aspiration_alignment TEXT[] DEFAULT '{}', -- Linked aspirations
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflows table (automation with aspiration focus)
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]', -- Workflow definition
  aspiration_focus TEXT[] DEFAULT '{}', -- Related aspirations
  tribe_id UUID REFERENCES tribes(id) ON DELETE SET NULL,
  is_template BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (aspiration-aligned collaboration)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tribe_id UUID REFERENCES tribes(id) ON DELETE SET NULL,
  aspiration_alignment TEXT[] DEFAULT '{}',
  team_members UUID[] DEFAULT '{}', -- Array of user IDs
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'paused')),
  motivation_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  synergy_potential DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationship Intelligence table (AI-powered engagement insights)
CREATE TABLE relationship_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  engagement_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  optimal_timing TEXT[] DEFAULT '{}', -- Best times to engage
  conversation_topics TEXT[] DEFAULT '{}',
  collaboration_potential DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  last_analysis TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Context table (AI memory across sessions)
CREATE TABLE conversation_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  aspirations_discussed TEXT[] DEFAULT '{}',
  topics_covered TEXT[] DEFAULT '{}',
  goals_progress JSONB DEFAULT '{}',
  last_context TEXT,
  conversation_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

-- Knowledge Bases table (centralized knowledge management)
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('general', 'technical', 'business', 'personal', 'project', 'research')),
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  access_level TEXT NOT NULL DEFAULT 'private' CHECK (access_level IN ('private', 'shared', 'public')),
  item_count INTEGER DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Base Items table (individual files and content)
CREATE TABLE knowledge_base_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'markdown', 'pdf', 'doc', 'docx', 'image', 'video', 'audio', 'url', 'chat_history', 'profile_data', 'file_upload')),
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'file_manager', 'chat_history', 'user_profile', 'url', 'manual')),
  source_url TEXT,
  file_path TEXT,
  file_size_bytes BIGINT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_processed BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  embedding_vector VECTOR(1536), -- For semantic search (requires pgvector extension)
  searchable_content TEXT, -- Extracted text for full-text search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Knowledge Base Attachments table (many-to-many relationship)
CREATE TABLE agent_knowledge_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  attachment_type TEXT NOT NULL DEFAULT 'full' CHECK (attachment_type IN ('full', 'filtered', 'selected_items')),
  filter_criteria JSONB DEFAULT '{}', -- For filtered attachments
  selected_item_ids UUID[] DEFAULT '{}', -- For selected items only
  attachment_priority INTEGER DEFAULT 1, -- 1-10, higher = more important
  is_auto_attached BOOLEAN DEFAULT false, -- AI suggested vs manual
  attachment_reason TEXT, -- Why this was attached
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, knowledge_base_id)
);

-- Knowledge Base Sharing table (for shared knowledge bases)
CREATE TABLE knowledge_base_sharing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'read' CHECK (permission_level IN ('read', 'write', 'admin')),
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(knowledge_base_id, shared_with_user_id)
);

-- AI Knowledge Recommendations table (for intelligent suggestions)
CREATE TABLE knowledge_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('suggest_attach', 'suggest_detach', 'suggest_create')),
  confidence_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  reasoning TEXT,
  context_data JSONB DEFAULT '{}',
  is_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audience Intelligence & Persona Management Tables

-- Psychographic Presets table (predefined personality and behavior patterns)
CREATE TABLE psychographic_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('professional', 'demographic', 'behavioral', 'psychographic', 'lifestyle')),
  traits JSONB NOT NULL DEFAULT '{}', -- Personality traits, values, interests
  demographics JSONB DEFAULT '{}', -- Age ranges, income, education, etc.
  behaviors JSONB DEFAULT '{}', -- Online behavior patterns, preferences
  communication_style JSONB DEFAULT '{}', -- Preferred communication methods and tone
  content_preferences JSONB DEFAULT '{}', -- Types of content they engage with
  platform_usage JSONB DEFAULT '{}', -- How they use different platforms
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Personas table (individual user personality profiles)
CREATE TABLE user_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  psychographic_preset_id UUID REFERENCES psychographic_presets(id) ON DELETE SET NULL,
  custom_traits JSONB DEFAULT '{}', -- User-specific traits beyond preset
  demographics JSONB DEFAULT '{}', -- Actual user demographics
  preferences JSONB DEFAULT '{}', -- User preferences and settings
  communication_style JSONB DEFAULT '{}', -- How this user prefers to communicate
  content_engagement JSONB DEFAULT '{}', -- What content they engage with
  platform_behavior JSONB DEFAULT '{}', -- How they behave on different platforms
  tribe_affinities JSONB DEFAULT '{}', -- Which tribes they're drawn to
  project_interests JSONB DEFAULT '{}', -- Types of projects they're interested in
  is_primary BOOLEAN DEFAULT false, -- Primary persona for this user
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audience Segments table (grouped personas for targeting)
CREATE TABLE audience_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  segment_criteria JSONB NOT NULL DEFAULT '{}', -- Criteria for segment membership
  persona_ids UUID[] DEFAULT '{}', -- Personas included in this segment
  size_estimate INTEGER DEFAULT 0,
  engagement_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  conversion_potential DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connection Intelligence table (enhanced relationship data)
CREATE TABLE connection_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  connection_strength DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  interaction_frequency TEXT DEFAULT 'low' CHECK (interaction_frequency IN ('low', 'medium', 'high', 'very_high')),
  last_interaction TIMESTAMP WITH TIME ZONE,
  interaction_types TEXT[] DEFAULT '{}', -- Types of interactions (message, like, share, etc.)
  shared_interests TEXT[] DEFAULT '{}',
  mutual_connections INTEGER DEFAULT 0,
  collaboration_potential DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  influence_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  network_position TEXT DEFAULT 'peripheral' CHECK (network_position IN ('core', 'bridge', 'peripheral', 'isolate')),
  communication_preferences JSONB DEFAULT '{}',
  project_affinities JSONB DEFAULT '{}',
  tribe_overlap JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Project Management & File Sharing Tables

-- Projects table (enhanced with file sharing and versioning)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tribe_id UUID REFERENCES tribes(id) ON DELETE SET NULL,
  aspiration_alignment TEXT[] DEFAULT '{}',
  team_members UUID[] DEFAULT '{}', -- Array of user IDs
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'paused', 'archived')),
  motivation_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  synergy_potential DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  milestones JSONB DEFAULT '[]',
  file_sharing_enabled BOOLEAN DEFAULT true,
  version_control_enabled BOOLEAN DEFAULT true,
  access_level TEXT DEFAULT 'tribe' CHECK (access_level IN ('private', 'tribe', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Files table (file sharing and versioning)
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  version_number INTEGER DEFAULT 1,
  parent_file_id UUID REFERENCES project_files(id) ON DELETE SET NULL, -- For versioning
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  access_permissions JSONB DEFAULT '{}', -- Who can access this file
  download_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE,
  is_current_version BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences & Analytics Tables

-- User Preferences table (detailed preference tracking)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preference_category TEXT NOT NULL, -- e.g., 'communication', 'content', 'platform', 'project'
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 1.0, -- How confident we are in this preference
  source TEXT DEFAULT 'explicit' CHECK (source IN ('explicit', 'inferred', 'behavioral', 'ai_analyzed')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_category, preference_key)
);

-- Interaction Analytics table (detailed interaction tracking)
CREATE TABLE interaction_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'message', 'like', 'share', 'comment', 'view', 'connect'
  platform TEXT DEFAULT 'linkedin' CHECK (platform IN ('linkedin', 'defconect', 'email', 'phone', 'meeting')),
  content_type TEXT, -- Type of content interacted with
  content_id UUID, -- ID of the content if applicable
  interaction_data JSONB DEFAULT '{}', -- Additional interaction metadata
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  engagement_level TEXT DEFAULT 'low' CHECK (engagement_level IN ('low', 'medium', 'high')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Network Visualization Data table (for connection mapping)
CREATE TABLE network_visualization_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  network_type TEXT NOT NULL CHECK (network_type IN ('connections', 'tribes', 'projects', 'collaborations')),
  node_data JSONB NOT NULL DEFAULT '{}', -- User nodes and their properties
  edge_data JSONB NOT NULL DEFAULT '{}', -- Connections between users
  layout_data JSONB DEFAULT '{}', -- Positioning and layout information
  metadata JSONB DEFAULT '{}', -- Additional visualization metadata
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_aspirations_user_id ON aspirations(user_id);
CREATE INDEX idx_aspirations_category ON aspirations(category);
CREATE INDEX idx_aspirations_status ON aspirations(status);

CREATE INDEX idx_tribes_founder_id ON tribes(founder_id);
CREATE INDEX idx_tribes_aspiration_focus ON tribes USING GIN(aspiration_focus);

CREATE INDEX idx_tribe_members_tribe_id ON tribe_members(tribe_id);
CREATE INDEX idx_tribe_members_user_id ON tribe_members(user_id);

CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_connected_user_id ON connections(connected_user_id);
CREATE INDEX idx_connections_compatibility ON connections(aspiration_compatibility DESC);
CREATE INDEX idx_connections_shared_aspirations ON connections USING GIN(shared_aspirations);

CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_active ON agents(is_active) WHERE is_active = true;

CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_tribe_id ON workflows(tribe_id);
CREATE INDEX idx_workflows_template ON workflows(is_template);

CREATE INDEX idx_projects_founder_id ON projects(founder_id);
CREATE INDEX idx_projects_tribe_id ON projects(tribe_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_aspiration_alignment ON projects USING GIN(aspiration_alignment);

CREATE INDEX idx_relationship_intelligence_user_id ON relationship_intelligence(user_id);
CREATE INDEX idx_relationship_intelligence_connection_id ON relationship_intelligence(connection_id);
CREATE INDEX idx_relationship_intelligence_engagement ON relationship_intelligence(engagement_score DESC);

CREATE INDEX idx_conversation_context_user_id ON conversation_context(user_id);
CREATE INDEX idx_conversation_context_session_id ON conversation_context(session_id);
CREATE INDEX idx_conversation_context_updated_at ON conversation_context(updated_at DESC);

-- Knowledge Base indexes
CREATE INDEX idx_knowledge_bases_user_id ON knowledge_bases(user_id);
CREATE INDEX idx_knowledge_bases_category ON knowledge_bases(category);
CREATE INDEX idx_knowledge_bases_access_level ON knowledge_bases(access_level);
CREATE INDEX idx_knowledge_bases_tags ON knowledge_bases USING GIN(tags);
CREATE INDEX idx_knowledge_bases_last_accessed ON knowledge_bases(last_accessed DESC);

CREATE INDEX idx_knowledge_base_items_kb_id ON knowledge_base_items(knowledge_base_id);
CREATE INDEX idx_knowledge_base_items_user_id ON knowledge_base_items(user_id);
CREATE INDEX idx_knowledge_base_items_content_type ON knowledge_base_items(content_type);
CREATE INDEX idx_knowledge_base_items_source_type ON knowledge_base_items(source_type);
CREATE INDEX idx_knowledge_base_items_processing_status ON knowledge_base_items(processing_status);
CREATE INDEX idx_knowledge_base_items_tags ON knowledge_base_items USING GIN(tags);
CREATE INDEX idx_knowledge_base_items_searchable_content ON knowledge_base_items USING GIN(to_tsvector('english', searchable_content));

CREATE INDEX idx_agent_knowledge_attachments_agent_id ON agent_knowledge_attachments(agent_id);
CREATE INDEX idx_agent_knowledge_attachments_kb_id ON agent_knowledge_attachments(knowledge_base_id);
CREATE INDEX idx_agent_knowledge_attachments_priority ON agent_knowledge_attachments(attachment_priority DESC);
CREATE INDEX idx_agent_knowledge_attachments_auto ON agent_knowledge_attachments(is_auto_attached);

CREATE INDEX idx_knowledge_base_sharing_kb_id ON knowledge_base_sharing(knowledge_base_id);
CREATE INDEX idx_knowledge_base_sharing_shared_with ON knowledge_base_sharing(shared_with_user_id);
CREATE INDEX idx_knowledge_base_sharing_shared_by ON knowledge_base_sharing(shared_by_user_id);

CREATE INDEX idx_knowledge_recommendations_user_id ON knowledge_recommendations(user_id);
CREATE INDEX idx_knowledge_recommendations_agent_id ON knowledge_recommendations(agent_id);
CREATE INDEX idx_knowledge_recommendations_kb_id ON knowledge_recommendations(knowledge_base_id);
CREATE INDEX idx_knowledge_recommendations_type ON knowledge_recommendations(recommendation_type);
CREATE INDEX idx_knowledge_recommendations_confidence ON knowledge_recommendations(confidence_score DESC);
CREATE INDEX idx_knowledge_recommendations_applied ON knowledge_recommendations(is_applied);

-- Audience Intelligence indexes
CREATE INDEX idx_psychographic_presets_category ON psychographic_presets(category);
CREATE INDEX idx_psychographic_presets_public ON psychographic_presets(is_public);
CREATE INDEX idx_psychographic_presets_usage ON psychographic_presets(usage_count DESC);

CREATE INDEX idx_user_personas_user_id ON user_personas(user_id);
CREATE INDEX idx_user_personas_preset_id ON user_personas(psychographic_preset_id);
CREATE INDEX idx_user_personas_primary ON user_personas(is_primary) WHERE is_primary = true;
CREATE INDEX idx_user_personas_active ON user_personas(is_active) WHERE is_active = true;

CREATE INDEX idx_audience_segments_user_id ON audience_segments(user_id);
CREATE INDEX idx_audience_segments_active ON audience_segments(is_active) WHERE is_active = true;
CREATE INDEX idx_audience_segments_engagement ON audience_segments(engagement_score DESC);

CREATE INDEX idx_connection_intelligence_user_id ON connection_intelligence(user_id);
CREATE INDEX idx_connection_intelligence_connected_user_id ON connection_intelligence(connected_user_id);
CREATE INDEX idx_connection_intelligence_strength ON connection_intelligence(connection_strength DESC);
CREATE INDEX idx_connection_intelligence_frequency ON connection_intelligence(interaction_frequency);
CREATE INDEX idx_connection_intelligence_network_position ON connection_intelligence(network_position);

-- Project Management indexes
CREATE INDEX idx_projects_founder_id ON projects(founder_id);
CREATE INDEX idx_projects_tribe_id ON projects(tribe_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_access_level ON projects(access_level);
CREATE INDEX idx_projects_aspiration_alignment ON projects USING GIN(aspiration_alignment);

CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_uploaded_by ON project_files(uploaded_by);
CREATE INDEX idx_project_files_file_type ON project_files(file_type);
CREATE INDEX idx_project_files_version ON project_files(version_number);
CREATE INDEX idx_project_files_current_version ON project_files(is_current_version) WHERE is_current_version = true;
CREATE INDEX idx_project_files_tags ON project_files USING GIN(tags);

-- User Preferences & Analytics indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_category ON user_preferences(preference_category);
CREATE INDEX idx_user_preferences_source ON user_preferences(source);
CREATE INDEX idx_user_preferences_confidence ON user_preferences(confidence_score DESC);

CREATE INDEX idx_interaction_analytics_user_id ON interaction_analytics(user_id);
CREATE INDEX idx_interaction_analytics_target_user_id ON interaction_analytics(target_user_id);
CREATE INDEX idx_interaction_analytics_type ON interaction_analytics(interaction_type);
CREATE INDEX idx_interaction_analytics_platform ON interaction_analytics(platform);
CREATE INDEX idx_interaction_analytics_timestamp ON interaction_analytics(timestamp DESC);
CREATE INDEX idx_interaction_analytics_engagement ON interaction_analytics(engagement_level);

CREATE INDEX idx_network_visualization_user_id ON network_visualization_data(user_id);
CREATE INDEX idx_network_visualization_type ON network_visualization_data(network_type);
CREATE INDEX idx_network_visualization_calculated ON network_visualization_data(last_calculated DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE aspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychographic_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_visualization_data ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = clerk_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Aspirations policies
CREATE POLICY "Users can view own aspirations" ON aspirations FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own aspirations" ON aspirations FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Tribe policies (public read, member write)
CREATE POLICY "Anyone can view tribes" ON tribes FOR SELECT USING (true);
CREATE POLICY "Tribe founders can update their tribes" ON tribes FOR UPDATE USING (founder_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Tribe member policies
CREATE POLICY "Users can view tribe memberships" ON tribe_members FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can join/leave tribes" ON tribe_members FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Connection policies (private by default, can be made public later)
CREATE POLICY "Users can view their connections" ON connections FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR connected_user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their connections" ON connections FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Agent policies
CREATE POLICY "Users can view own agents" ON agents FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own agents" ON agents FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Workflow policies
CREATE POLICY "Users can view own workflows" ON workflows FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR is_template = true);
CREATE POLICY "Users can manage own workflows" ON workflows FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Project policies
CREATE POLICY "Users can view projects they're involved in" ON projects FOR SELECT USING (founder_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR team_members @> ARRAY[(SELECT id FROM users WHERE clerk_id = auth.uid()::text)]::uuid[]);
CREATE POLICY "Users can manage their projects" ON projects FOR ALL USING (founder_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Relationship intelligence policies
CREATE POLICY "Users can view their relationship intelligence" ON relationship_intelligence FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their relationship intelligence" ON relationship_intelligence FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Conversation context policies
CREATE POLICY "Users can view their conversation context" ON conversation_context FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their conversation context" ON conversation_context FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Knowledge base policies
CREATE POLICY "Users can view their knowledge bases" ON knowledge_bases FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR is_public = true OR id IN (SELECT knowledge_base_id FROM knowledge_base_sharing WHERE shared_with_user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their knowledge bases" ON knowledge_bases FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Knowledge base items policies
CREATE POLICY "Users can view knowledge base items" ON knowledge_base_items FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR knowledge_base_id IN (SELECT id FROM knowledge_bases WHERE is_public = true OR user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR id IN (SELECT knowledge_base_id FROM knowledge_base_sharing WHERE shared_with_user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text))));
CREATE POLICY "Users can manage their knowledge base items" ON knowledge_base_items FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Agent knowledge attachments policies
CREATE POLICY "Users can view agent knowledge attachments" ON agent_knowledge_attachments FOR SELECT USING (agent_id IN (SELECT id FROM agents WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage agent knowledge attachments" ON agent_knowledge_attachments FOR ALL USING (agent_id IN (SELECT id FROM agents WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

-- Knowledge base sharing policies
CREATE POLICY "Users can view knowledge base sharing" ON knowledge_base_sharing FOR SELECT USING (shared_with_user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR shared_by_user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage knowledge base sharing" ON knowledge_base_sharing FOR ALL USING (shared_by_user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Knowledge recommendations policies
CREATE POLICY "Users can view their knowledge recommendations" ON knowledge_recommendations FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their knowledge recommendations" ON knowledge_recommendations FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Psychographic presets policies
CREATE POLICY "Users can view public psychographic presets" ON psychographic_presets FOR SELECT USING (is_public = true OR created_by IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their psychographic presets" ON psychographic_presets FOR ALL USING (created_by IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- User personas policies
CREATE POLICY "Users can view their personas" ON user_personas FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their personas" ON user_personas FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Audience segments policies
CREATE POLICY "Users can view their audience segments" ON audience_segments FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their audience segments" ON audience_segments FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Connection intelligence policies
CREATE POLICY "Users can view their connection intelligence" ON connection_intelligence FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their connection intelligence" ON connection_intelligence FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Projects policies
CREATE POLICY "Users can view projects they're involved in" ON projects FOR SELECT USING (founder_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR team_members @> ARRAY[(SELECT id FROM users WHERE clerk_id = auth.uid()::text)]::uuid[] OR access_level = 'public');
CREATE POLICY "Users can manage their projects" ON projects FOR ALL USING (founder_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Project files policies
CREATE POLICY "Users can view project files they have access to" ON project_files FOR SELECT USING (project_id IN (SELECT id FROM projects WHERE founder_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR team_members @> ARRAY[(SELECT id FROM users WHERE clerk_id = auth.uid()::text)]::uuid[] OR access_level = 'public'));
CREATE POLICY "Users can manage project files in their projects" ON project_files FOR ALL USING (project_id IN (SELECT id FROM projects WHERE founder_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

-- User preferences policies
CREATE POLICY "Users can view their preferences" ON user_preferences FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their preferences" ON user_preferences FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Interaction analytics policies
CREATE POLICY "Users can view their interaction analytics" ON interaction_analytics FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their interaction analytics" ON interaction_analytics FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Network visualization policies
CREATE POLICY "Users can view their network visualizations" ON network_visualization_data FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their network visualizations" ON network_visualization_data FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Audit and Security Tables
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  request_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event VARCHAR(100) NOT NULL,
  details JSONB,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  request_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit and security tables
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_success ON audit_logs(success);

CREATE INDEX idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX idx_security_events_event ON security_events(event);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);

-- RLS for audit and security tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Audit logs policies (admin only access)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = audit_logs.user_id AND clerk_id = auth.uid()::text AND role = 'admin')
);

-- Security events policies (admin only access)
CREATE POLICY "Admins can view security events" ON security_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = security_events.user_id AND clerk_id = auth.uid()::text AND role = 'admin')
);

-- Functions for aspiration matching and tribe discovery
CREATE OR REPLACE FUNCTION calculate_aspiration_compatibility(user_aspirations TEXT[], other_aspirations TEXT[])
RETURNS DECIMAL(3,2) AS $$
DECLARE
    common_count INTEGER;
    total_unique INTEGER;
BEGIN
    -- Count common aspirations
    SELECT COUNT(*) INTO common_count
    FROM unnest(user_aspirations) AS u(asp)
    WHERE asp = ANY(other_aspirations);

    -- Count total unique aspirations
    SELECT COUNT(DISTINCT asp) INTO total_unique
    FROM (
        SELECT unnest(user_aspirations) AS asp
        UNION
        SELECT unnest(other_aspirations) AS asp
    ) AS combined;

    -- Return compatibility score (0.0 to 1.0)
    IF total_unique = 0 THEN
        RETURN 0.0;
    ELSE
        RETURN (common_count::DECIMAL / total_unique::DECIMAL);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aspirations_updated_at BEFORE UPDATE ON aspirations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tribes_updated_at BEFORE UPDATE ON tribes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversation_context_updated_at BEFORE UPDATE ON conversation_context FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_bases_updated_at BEFORE UPDATE ON knowledge_bases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_items_updated_at BEFORE UPDATE ON knowledge_base_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_knowledge_attachments_updated_at BEFORE UPDATE ON agent_knowledge_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_sharing_updated_at BEFORE UPDATE ON knowledge_base_sharing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_recommendations_updated_at BEFORE UPDATE ON knowledge_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_psychographic_presets_updated_at BEFORE UPDATE ON psychographic_presets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_personas_updated_at BEFORE UPDATE ON user_personas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audience_segments_updated_at BEFORE UPDATE ON audience_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connection_intelligence_updated_at BEFORE UPDATE ON connection_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_files_updated_at BEFORE UPDATE ON project_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interaction_analytics_updated_at BEFORE UPDATE ON interaction_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_network_visualization_data_updated_at BEFORE UPDATE ON network_visualization_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional - remove in production)
-- INSERT INTO users (clerk_id, email, name) VALUES ('test-user-1', 'user1@defconect.com', 'Alex Johnson');
-- INSERT INTO aspirations (user_id, title, description, category, priority) VALUES ((SELECT id FROM users WHERE email = 'user1@defconect.com'), 'Learn AI Development', 'Master Python and machine learning for AI applications', 'skill', 'high');
