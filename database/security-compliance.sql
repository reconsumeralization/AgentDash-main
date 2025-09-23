-- Security and Compliance Tables
-- Advanced security monitoring and compliance tracking

-- ==============================================
-- SECURITY & COMPLIANCE MONITORING
-- ==============================================

-- Security Events and Incidents
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('authentication', 'authorization', 'data_access', 'data_modification', 'api_call', 'suspicious_activity', 'policy_violation', 'threat_detected')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL, -- Which system/service generated this event
  source_ip INET,
  user_agent TEXT,
  event_description TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  risk_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  threat_indicators TEXT[] DEFAULT '{}',
  mitigation_actions TEXT[] DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Policies
CREATE TABLE compliance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('data_retention', 'data_privacy', 'access_control', 'audit_logging', 'encryption', 'social_media', 'api_usage', 'content_moderation')),
  description TEXT,
  policy_rules JSONB NOT NULL DEFAULT '{}',
  applicable_platforms TEXT[] DEFAULT '{}',
  severity_level TEXT DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  enforcement_action TEXT DEFAULT 'alert' CHECK (enforcement_action IN ('alert', 'block', 'quarantine', 'auto_remediate')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Violations
CREATE TABLE compliance_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID REFERENCES compliance_policies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  description TEXT NOT NULL,
  violation_data JSONB DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  platform TEXT,
  resource_type TEXT,
  resource_id TEXT,
  remediation_status TEXT DEFAULT 'pending' CHECK (remediation_status IN ('pending', 'in_progress', 'resolved', 'failed')),
  remediation_actions TEXT[] DEFAULT '{}',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Loss Prevention (DLP) Incidents
CREATE TABLE dlp_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('data_exfiltration', 'unauthorized_access', 'policy_violation', 'sensitive_data_exposure', 'data_breach_attempt')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  data_type TEXT, -- Type of sensitive data involved
  data_classification TEXT CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
  source_platform TEXT,
  destination_platform TEXT,
  data_amount TEXT, -- Size/quantity of data involved
  incident_description TEXT NOT NULL,
  technical_details JSONB DEFAULT '{}',
  affected_users TEXT[] DEFAULT '{}',
  mitigation_actions TEXT[] DEFAULT '{}',
  is_contained BOOLEAN DEFAULT false,
  containment_time TIMESTAMP WITH TIME ZONE,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_summary TEXT,
  lessons_learned TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Rate Limiting and Throttling
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  api_endpoint TEXT NOT NULL,
  platform TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  limit_per_hour INTEGER DEFAULT 1000,
  limit_per_day INTEGER DEFAULT 10000,
  reset_time TIMESTAMP WITH TIME ZONE,
  is_throttled BOOLEAN DEFAULT false,
  throttle_reason TEXT,
  last_request TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, api_endpoint, platform)
);

-- API Usage Analytics
CREATE TABLE api_usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  api_endpoint TEXT NOT NULL,
  platform TEXT NOT NULL,
  http_method TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- DATA RETENTION AND ARCHIVAL
-- ==============================================

-- Data Retention Policies
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('social_media_posts', 'analytics_data', 'audit_logs', 'user_interactions', 'api_logs', 'compliance_data', 'chat_history')),
  retention_period_days INTEGER NOT NULL,
  archival_period_days INTEGER, -- When to move to cold storage
  deletion_period_days INTEGER, -- When to permanently delete
  is_active BOOLEAN DEFAULT true,
  auto_cleanup_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Archival Logs
CREATE TABLE data_archival_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  retention_policy_id UUID REFERENCES data_retention_policies(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_count INTEGER NOT NULL,
  archival_type TEXT NOT NULL CHECK (archival_type IN ('archive', 'delete', 'anonymize')),
  archival_location TEXT, -- Where archived data is stored
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ENCRYPTION AND KEY MANAGEMENT
-- ==============================================

-- Encryption Keys
CREATE TABLE encryption_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_type TEXT NOT NULL CHECK (key_type IN ('api_key', 'oauth_token', 'client_secret', 'database_field', 'file_encryption')),
  encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
  key_version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key_name, key_version)
);

-- Encryption Operations Log
CREATE TABLE encryption_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encryption_key_id UUID REFERENCES encryption_keys(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('encrypt', 'decrypt', 're_encrypt', 'key_rotation')),
  data_type TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  operation_duration_ms INTEGER,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- THREAT INTELLIGENCE AND MONITORING
-- ==============================================

-- Threat Intelligence Feeds
CREATE TABLE threat_intelligence_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_name TEXT NOT NULL,
  feed_type TEXT NOT NULL CHECK (feed_type IN ('malicious_ips', 'phishing_domains', 'malware_hashes', 'suspicious_urls', 'threat_actors')),
  feed_url TEXT NOT NULL,
  update_frequency TEXT DEFAULT 'hourly' CHECK (update_frequency IN ('hourly', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_update TIMESTAMP WITH TIME ZONE,
  next_update TIMESTAMP WITH TIME ZONE,
  record_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threat Indicators
CREATE TABLE threat_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES threat_intelligence_feeds(id) ON DELETE CASCADE,
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('ip_address', 'domain', 'url', 'email', 'file_hash', 'user_agent')),
  indicator_value TEXT NOT NULL,
  threat_type TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  first_seen TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE,
  source_references TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feed_id, indicator_type, indicator_value)
);

-- Threat Detection Events
CREATE TABLE threat_detection_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  threat_indicator_id UUID REFERENCES threat_indicators(id) ON DELETE SET NULL,
  detection_type TEXT NOT NULL CHECK (detection_type IN ('ip_match', 'domain_match', 'url_match', 'behavioral_anomaly', 'pattern_match')),
  matched_value TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  risk_score DECIMAL(3,2) DEFAULT 0.0,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action_taken TEXT DEFAULT 'alert' CHECK (action_taken IN ('alert', 'block', 'quarantine', 'monitor')),
  is_false_positive BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ACCESS CONTROL AND PERMISSIONS
-- ==============================================

-- API Access Tokens
CREATE TABLE api_access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  token_type TEXT NOT NULL CHECK (token_type IN ('oauth_access', 'oauth_refresh', 'api_key', 'bearer', 'jwt')),
  token_hash TEXT NOT NULL, -- Hashed version for security
  encrypted_token TEXT NOT NULL, -- Encrypted actual token
  scopes TEXT[] DEFAULT '{}',
  permissions TEXT[] DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, token_name)
);

-- Access Control Lists
CREATE TABLE access_control_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('api_endpoint', 'data_table', 'feature', 'integration', 'campaign')),
  resource_id TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('read', 'write', 'admin', 'execute')),
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '{}', -- Additional access conditions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id, access_type)
);
