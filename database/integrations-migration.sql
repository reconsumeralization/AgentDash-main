-- AgentDash Database Integrations Migration
-- Comprehensive integration tables for all platform connections
-- Run this after the main schema.sql

-- Enable additional PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For GIN indexes on scalars
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For GiST indexes on scalars

-- ==============================================
-- OFFICE 365 MANAGEMENT ACTIVITY API INTEGRATION
-- ==============================================

-- Office 365 Tenant Configuration
CREATE TABLE office365_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT UNIQUE NOT NULL,
  tenant_name TEXT,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('Enterprise', 'GCC', 'GCC_High', 'DoD')),
  client_id TEXT NOT NULL,
  client_secret_encrypted TEXT NOT NULL, -- Encrypted client secret
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- Office 365 Activity Subscriptions
CREATE TABLE office365_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES office365_tenants(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('Audit.AzureActiveDirectory', 'Audit.Exchange', 'Audit.SharePoint', 'Audit.General', 'DLP.All')),
  status TEXT NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled')),
  webhook_url TEXT,
  webhook_auth_id TEXT,
  webhook_expiration TIMESTAMP WITH TIME ZONE,
  last_notification TIMESTAMP WITH TIME ZONE,
  notification_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, content_type)
);

-- Office 365 Activity Records
CREATE TABLE office365_activity_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES office365_tenants(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  creation_time TIMESTAMP WITH TIME ZONE NOT NULL,
  operation TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  record_type INTEGER NOT NULL,
  result_status TEXT,
  user_key TEXT,
  user_type INTEGER,
  user_id TEXT,
  workload TEXT,
  client_ip TEXT,
  object_id TEXT,
  extended_properties JSONB DEFAULT '{}',
  modified_properties JSONB DEFAULT '{}',
  actor_data JSONB DEFAULT '{}',
  target_data JSONB DEFAULT '{}',
  raw_data JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  compliance_flags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, content_id)
);

-- Office 365 Compliance Monitoring
CREATE TABLE office365_compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES office365_tenants(id) ON DELETE CASCADE,
  activity_record_id UUID REFERENCES office365_activity_records(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN ('data_loss_prevention', 'suspicious_activity', 'policy_violation', 'security_threat', 'automated_behavior')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  remediation_actions TEXT[] DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- LINKEDIN API INTEGRATION
-- ==============================================

-- LinkedIn OAuth Tokens
CREATE TABLE linkedin_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- LinkedIn Profile Data
CREATE TABLE linkedin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  linkedin_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  headline TEXT,
  summary TEXT,
  industry TEXT,
  location TEXT,
  profile_picture_url TEXT,
  background_picture_url TEXT,
  profile_url TEXT,
  public_profile_url TEXT,
  vanity_name TEXT,
  email_address TEXT,
  phone_number TEXT,
  follower_count INTEGER DEFAULT 0,
  connection_count INTEGER DEFAULT 0,
  raw_data JSONB DEFAULT '{}',
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, linkedin_id)
);

-- LinkedIn Connections
CREATE TABLE linkedin_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  connection_linkedin_id TEXT NOT NULL,
  connection_name TEXT,
  connection_headline TEXT,
  connection_industry TEXT,
  connection_location TEXT,
  connection_profile_url TEXT,
  connection_type TEXT CHECK (connection_type IN ('1st', '2nd', '3rd+', 'group')),
  connection_strength DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  last_interaction TIMESTAMP WITH TIME ZONE,
  interaction_count INTEGER DEFAULT 0,
  mutual_connections INTEGER DEFAULT 0,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connection_linkedin_id)
);

-- LinkedIn Posts and Content
CREATE TABLE linkedin_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  linkedin_post_id TEXT UNIQUE NOT NULL,
  author_linkedin_id TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('text', 'image', 'video', 'document', 'article', 'poll')),
  text_content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'CONNECTIONS', 'LOGGED_IN_MEMBERS')),
  published_at TIMESTAMP WITH TIME ZONE,
  last_modified TIMESTAMP WITH TIME ZONE,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0.0, -- 0.0 to 1.0
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Analytics
CREATE TABLE linkedin_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES linkedin_posts(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('impression', 'click', 'like', 'comment', 'share', 'follow', 'unfollow')),
  metric_value INTEGER DEFAULT 0,
  date_recorded DATE NOT NULL,
  demographics JSONB DEFAULT '{}',
  devices JSONB DEFAULT '{}',
  locations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, metric_type, date_recorded)
);

-- LinkedIn Compliance Monitoring
CREATE TABLE linkedin_compliance_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  linkedin_post_id UUID REFERENCES linkedin_posts(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN ('content_policy', 'spam_detection', 'automation_detection', 'rate_limit', 'api_violation')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  action_taken TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
