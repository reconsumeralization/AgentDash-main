-- Social Media Platform Integrations
-- Additional tables for multi-platform social media management

-- ==============================================
-- SOCIAL MEDIA PLATFORM INTEGRATIONS
-- ==============================================

-- Social Media Accounts (Generic for all platforms)
CREATE TABLE social_media_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'pinterest', 'snapchat')),
  account_id TEXT NOT NULL, -- Platform-specific account ID
  username TEXT,
  display_name TEXT,
  profile_picture_url TEXT,
  profile_url TEXT,
  bio TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'blue_verified')),
  account_type TEXT DEFAULT 'personal' CHECK (account_type IN ('personal', 'business', 'creator', 'brand')),
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  permissions TEXT[] DEFAULT '{}', -- Platform-specific permissions
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, account_id)
);

-- Social Media Posts (Cross-platform)
CREATE TABLE social_media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES social_media_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('text', 'image', 'video', 'carousel', 'story', 'reel', 'live')),
  text_content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  location_data JSONB DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'deleted')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'friends', 'private')),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0.0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5,4) DEFAULT 0.0,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, platform_post_id)
);

-- Social Media Analytics (Cross-platform)
CREATE TABLE social_media_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES social_media_posts(id) ON DELETE CASCADE,
  account_id UUID REFERENCES social_media_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('impression', 'reach', 'click', 'like', 'comment', 'share', 'follow', 'unfollow', 'save', 'view', 'story_view', 'profile_visit')),
  metric_value INTEGER DEFAULT 0,
  date_recorded DATE NOT NULL,
  time_period TEXT DEFAULT 'daily' CHECK (time_period IN ('hourly', 'daily', 'weekly', 'monthly')),
  demographics JSONB DEFAULT '{}',
  devices JSONB DEFAULT '{}',
  locations JSONB DEFAULT '{}',
  age_groups JSONB DEFAULT '{}',
  genders JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, metric_type, date_recorded, time_period)
);

-- Social Media Campaigns
CREATE TABLE social_media_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('awareness', 'engagement', 'traffic', 'conversions', 'app_installs', 'lead_generation')),
  platforms TEXT[] NOT NULL DEFAULT '{}',
  target_audience JSONB DEFAULT '{}',
  budget DECIMAL(10,2),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  cost_per_click DECIMAL(8,4),
  cost_per_impression DECIMAL(8,4),
  return_on_investment DECIMAL(8,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Posts (Many-to-many relationship)
CREATE TABLE campaign_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES social_media_campaigns(id) ON DELETE CASCADE,
  post_id UUID REFERENCES social_media_posts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed')),
  performance_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- CRM/ERP INTEGRATIONS
-- ==============================================

-- CRM/ERP System Configurations
CREATE TABLE crm_system_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  system_type TEXT NOT NULL CHECK (system_type IN ('salesforce', 'hubspot', 'pipedrive', 'zoho', 'monday', 'asana', 'trello', 'custom')),
  system_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
  error_message TEXT,
  raw_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, system_type, system_name)
);

-- CRM/ERP Data Sync Logs
CREATE TABLE crm_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crm_config_id UUID REFERENCES crm_system_configs(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('contacts', 'leads', 'opportunities', 'accounts', 'deals', 'tasks', 'notes')),
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('import', 'export', 'bidirectional')),
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  sync_duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  error_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM/ERP Mapped Entities
CREATE TABLE crm_mapped_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crm_config_id UUID REFERENCES crm_system_configs(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'lead', 'opportunity', 'account', 'deal', 'task', 'note')),
  agentdash_id UUID NOT NULL, -- Reference to our internal entity
  crm_id TEXT NOT NULL, -- External CRM system ID
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending_sync', 'sync_conflict', 'sync_failed')),
  conflict_data JSONB DEFAULT '{}',
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crm_config_id, entity_type, agentdash_id, crm_id)
);

-- ==============================================
-- ANALYTICS & MONITORING INTEGRATIONS
-- ==============================================

-- Analytics Platform Configurations
CREATE TABLE analytics_platform_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform_type TEXT NOT NULL CHECK (platform_type IN ('google_analytics', 'mixpanel', 'amplitude', 'hotjar', 'fullstory', 'datadog', 'new_relic', 'splunk', 'custom')),
  platform_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform_type, platform_name)
);

-- Analytics Data Points
CREATE TABLE analytics_data_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_config_id UUID REFERENCES analytics_platform_configs(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  metric_unit TEXT,
  dimensions JSONB DEFAULT '{}',
  date_recorded TIMESTAMP WITH TIME ZONE NOT NULL,
  time_period TEXT DEFAULT 'daily' CHECK (time_period IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform_config_id, metric_name, date_recorded, time_period)
);

-- Performance Monitoring
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('api_response_time', 'database_query_time', 'page_load_time', 'error_rate', 'throughput', 'memory_usage', 'cpu_usage')),
  metric_value DECIMAL(10,4) NOT NULL,
  metric_unit TEXT NOT NULL,
  source TEXT, -- Which service/endpoint this metric came from
  tags JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- WEBHOOK & NOTIFICATION INTEGRATIONS
-- ==============================================

-- Webhook Configurations
CREATE TABLE webhook_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  http_method TEXT DEFAULT 'POST' CHECK (http_method IN ('POST', 'PUT', 'PATCH')),
  headers JSONB DEFAULT '{}',
  authentication_type TEXT DEFAULT 'none' CHECK (authentication_type IN ('none', 'bearer', 'basic', 'api_key', 'hmac')),
  auth_config JSONB DEFAULT '{}', -- Encrypted auth details
  events TEXT[] DEFAULT '{}', -- Which events to listen for
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_triggered TIMESTAMP WITH TIME ZONE,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Delivery Logs
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_config_id UUID REFERENCES webhook_configs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  response_headers JSONB DEFAULT '{}',
  delivery_time_ms INTEGER,
  retry_attempt INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  error_message TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'push', 'sms', 'webhook', 'in_app')),
  event_category TEXT NOT NULL CHECK (event_category IN ('social_media', 'compliance', 'security', 'performance', 'system', 'marketing')),
  event_type TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  delivery_frequency TEXT DEFAULT 'immediate' CHECK (delivery_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
  delivery_time TIME, -- For scheduled deliveries
  filters JSONB DEFAULT '{}', -- Conditions for when to send
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type, event_category, event_type)
);
