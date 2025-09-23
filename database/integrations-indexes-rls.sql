-- Indexes and Row Level Security Policies for Integration Tables
-- Run this after all the integration table creation scripts

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Office 365 Management Activity API Indexes
CREATE INDEX idx_office365_tenants_user_id ON office365_tenants(user_id);
CREATE INDEX idx_office365_tenants_tenant_id ON office365_tenants(tenant_id);
CREATE INDEX idx_office365_tenants_active ON office365_tenants(is_active) WHERE is_active = true;
CREATE INDEX idx_office365_tenants_sync_status ON office365_tenants(sync_status);

CREATE INDEX idx_office365_subscriptions_tenant_id ON office365_subscriptions(tenant_id);
CREATE INDEX idx_office365_subscriptions_content_type ON office365_subscriptions(content_type);
CREATE INDEX idx_office365_subscriptions_status ON office365_subscriptions(status);

CREATE INDEX idx_office365_activity_records_tenant_id ON office365_activity_records(tenant_id);
CREATE INDEX idx_office365_activity_records_creation_time ON office365_activity_records(creation_time DESC);
CREATE INDEX idx_office365_activity_records_operation ON office365_activity_records(operation);
CREATE INDEX idx_office365_activity_records_user_id ON office365_activity_records(user_id);
CREATE INDEX idx_office365_activity_records_workload ON office365_activity_records(workload);
CREATE INDEX idx_office365_activity_records_risk_level ON office365_activity_records(risk_level);
CREATE INDEX idx_office365_activity_records_processed ON office365_activity_records(processed) WHERE processed = false;

CREATE INDEX idx_office365_compliance_checks_tenant_id ON office365_compliance_checks(tenant_id);
CREATE INDEX idx_office365_compliance_checks_activity_record_id ON office365_compliance_checks(activity_record_id);
CREATE INDEX idx_office365_compliance_checks_severity ON office365_compliance_checks(severity);
CREATE INDEX idx_office365_compliance_checks_resolved ON office365_compliance_checks(is_resolved) WHERE is_resolved = false;

-- LinkedIn API Integration Indexes
CREATE INDEX idx_linkedin_oauth_tokens_user_id ON linkedin_oauth_tokens(user_id);
CREATE INDEX idx_linkedin_oauth_tokens_active ON linkedin_oauth_tokens(is_active) WHERE is_active = true;
CREATE INDEX idx_linkedin_oauth_tokens_expires_at ON linkedin_oauth_tokens(expires_at);

CREATE INDEX idx_linkedin_profiles_user_id ON linkedin_profiles(user_id);
CREATE INDEX idx_linkedin_profiles_linkedin_id ON linkedin_profiles(linkedin_id);
CREATE INDEX idx_linkedin_profiles_last_sync ON linkedin_profiles(last_sync DESC);

CREATE INDEX idx_linkedin_connections_user_id ON linkedin_connections(user_id);
CREATE INDEX idx_linkedin_connections_linkedin_id ON linkedin_connections(connection_linkedin_id);
CREATE INDEX idx_linkedin_connections_strength ON linkedin_connections(connection_strength DESC);
CREATE INDEX idx_linkedin_connections_last_interaction ON linkedin_connections(last_interaction DESC);

CREATE INDEX idx_linkedin_posts_user_id ON linkedin_posts(user_id);
CREATE INDEX idx_linkedin_posts_linkedin_post_id ON linkedin_posts(linkedin_post_id);
CREATE INDEX idx_linkedin_posts_published_at ON linkedin_posts(published_at DESC);
CREATE INDEX idx_linkedin_posts_status ON linkedin_posts(status);
CREATE INDEX idx_linkedin_posts_engagement_rate ON linkedin_posts(engagement_rate DESC);

CREATE INDEX idx_linkedin_analytics_user_id ON linkedin_analytics(user_id);
CREATE INDEX idx_linkedin_analytics_post_id ON linkedin_analytics(post_id);
CREATE INDEX idx_linkedin_analytics_metric_type ON linkedin_analytics(metric_type);
CREATE INDEX idx_linkedin_analytics_date_recorded ON linkedin_analytics(date_recorded DESC);

CREATE INDEX idx_linkedin_compliance_monitoring_user_id ON linkedin_compliance_monitoring(user_id);
CREATE INDEX idx_linkedin_compliance_monitoring_post_id ON linkedin_compliance_monitoring(linkedin_post_id);
CREATE INDEX idx_linkedin_compliance_monitoring_severity ON linkedin_compliance_monitoring(severity);
CREATE INDEX idx_linkedin_compliance_monitoring_resolved ON linkedin_compliance_monitoring(is_resolved) WHERE is_resolved = false;

-- Social Media Platform Integration Indexes
CREATE INDEX idx_social_media_accounts_user_id ON social_media_accounts(user_id);
CREATE INDEX idx_social_media_accounts_platform ON social_media_accounts(platform);
CREATE INDEX idx_social_media_accounts_account_id ON social_media_accounts(account_id);
CREATE INDEX idx_social_media_accounts_active ON social_media_accounts(is_active) WHERE is_active = true;

CREATE INDEX idx_social_media_posts_user_id ON social_media_posts(user_id);
CREATE INDEX idx_social_media_posts_account_id ON social_media_posts(account_id);
CREATE INDEX idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX idx_social_media_posts_published_at ON social_media_posts(published_at DESC);
CREATE INDEX idx_social_media_posts_status ON social_media_posts(status);
CREATE INDEX idx_social_media_posts_engagement_rate ON social_media_posts(engagement_rate DESC);

CREATE INDEX idx_social_media_analytics_user_id ON social_media_analytics(user_id);
CREATE INDEX idx_social_media_analytics_post_id ON social_media_analytics(post_id);
CREATE INDEX idx_social_media_analytics_account_id ON social_media_analytics(account_id);
CREATE INDEX idx_social_media_analytics_metric_type ON social_media_analytics(metric_type);
CREATE INDEX idx_social_media_analytics_date_recorded ON social_media_analytics(date_recorded DESC);

CREATE INDEX idx_social_media_campaigns_user_id ON social_media_campaigns(user_id);
CREATE INDEX idx_social_media_campaigns_status ON social_media_campaigns(status);
CREATE INDEX idx_social_media_campaigns_start_date ON social_media_campaigns(start_date);
CREATE INDEX idx_social_media_campaigns_platforms ON social_media_campaigns USING GIN(platforms);

CREATE INDEX idx_campaign_posts_campaign_id ON campaign_posts(campaign_id);
CREATE INDEX idx_campaign_posts_post_id ON campaign_posts(post_id);
CREATE INDEX idx_campaign_posts_status ON campaign_posts(status);

-- CRM/ERP Integration Indexes
CREATE INDEX idx_crm_system_configs_user_id ON crm_system_configs(user_id);
CREATE INDEX idx_crm_system_configs_system_type ON crm_system_configs(system_type);
CREATE INDEX idx_crm_system_configs_active ON crm_system_configs(is_active) WHERE is_active = true;

CREATE INDEX idx_crm_sync_logs_crm_config_id ON crm_sync_logs(crm_config_id);
CREATE INDEX idx_crm_sync_logs_sync_type ON crm_sync_logs(sync_type);
CREATE INDEX idx_crm_sync_logs_status ON crm_sync_logs(status);
CREATE INDEX idx_crm_sync_logs_started_at ON crm_sync_logs(started_at DESC);

CREATE INDEX idx_crm_mapped_entities_crm_config_id ON crm_mapped_entities(crm_config_id);
CREATE INDEX idx_crm_mapped_entities_entity_type ON crm_mapped_entities(entity_type);
CREATE INDEX idx_crm_mapped_entities_sync_status ON crm_mapped_entities(sync_status);

-- Analytics & Monitoring Indexes
CREATE INDEX idx_analytics_platform_configs_user_id ON analytics_platform_configs(user_id);
CREATE INDEX idx_analytics_platform_configs_platform_type ON analytics_platform_configs(platform_type);
CREATE INDEX idx_analytics_platform_configs_active ON analytics_platform_configs(is_active) WHERE is_active = true;

CREATE INDEX idx_analytics_data_points_platform_config_id ON analytics_data_points(platform_config_id);
CREATE INDEX idx_analytics_data_points_metric_name ON analytics_data_points(metric_name);
CREATE INDEX idx_analytics_data_points_date_recorded ON analytics_data_points(date_recorded DESC);

CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX idx_performance_metrics_source ON performance_metrics(source);

-- Webhook & Notification Indexes
CREATE INDEX idx_webhook_configs_user_id ON webhook_configs(user_id);
CREATE INDEX idx_webhook_configs_active ON webhook_configs(is_active) WHERE is_active = true;
CREATE INDEX idx_webhook_configs_events ON webhook_configs USING GIN(events);

CREATE INDEX idx_webhook_deliveries_webhook_config_id ON webhook_deliveries(webhook_config_id);
CREATE INDEX idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_triggered_at ON webhook_deliveries(triggered_at DESC);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_notification_type ON notification_preferences(notification_type);
CREATE INDEX idx_notification_preferences_event_category ON notification_preferences(event_category);
CREATE INDEX idx_notification_preferences_enabled ON notification_preferences(is_enabled) WHERE is_enabled = true;

-- Security & Compliance Indexes
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_resolved ON security_events(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);

CREATE INDEX idx_compliance_policies_user_id ON compliance_policies(user_id);
CREATE INDEX idx_compliance_policies_policy_type ON compliance_policies(policy_type);
CREATE INDEX idx_compliance_policies_active ON compliance_policies(is_active) WHERE is_active = true;

CREATE INDEX idx_compliance_violations_policy_id ON compliance_violations(policy_id);
CREATE INDEX idx_compliance_violations_user_id ON compliance_violations(user_id);
CREATE INDEX idx_compliance_violations_severity ON compliance_violations(severity);
CREATE INDEX idx_compliance_violations_remediation_status ON compliance_violations(remediation_status);

CREATE INDEX idx_dlp_incidents_user_id ON dlp_incidents(user_id);
CREATE INDEX idx_dlp_incidents_incident_type ON dlp_incidents(incident_type);
CREATE INDEX idx_dlp_incidents_severity ON dlp_incidents(severity);
CREATE INDEX idx_dlp_incidents_resolved ON dlp_incidents(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_dlp_incidents_created_at ON dlp_incidents(created_at DESC);

CREATE INDEX idx_api_rate_limits_user_id ON api_rate_limits(user_id);
CREATE INDEX idx_api_rate_limits_api_endpoint ON api_rate_limits(api_endpoint);
CREATE INDEX idx_api_rate_limits_platform ON api_rate_limits(platform);
CREATE INDEX idx_api_rate_limits_throttled ON api_rate_limits(is_throttled) WHERE is_throttled = true;

CREATE INDEX idx_api_usage_analytics_user_id ON api_usage_analytics(user_id);
CREATE INDEX idx_api_usage_analytics_api_endpoint ON api_usage_analytics(api_endpoint);
CREATE INDEX idx_api_usage_analytics_platform ON api_usage_analytics(platform);
CREATE INDEX idx_api_usage_analytics_timestamp ON api_usage_analytics(timestamp DESC);

-- Data Retention & Archival Indexes
CREATE INDEX idx_data_retention_policies_user_id ON data_retention_policies(user_id);
CREATE INDEX idx_data_retention_policies_data_type ON data_retention_policies(data_type);
CREATE INDEX idx_data_retention_policies_active ON data_retention_policies(is_active) WHERE is_active = true;

CREATE INDEX idx_data_archival_logs_user_id ON data_archival_logs(user_id);
CREATE INDEX idx_data_archival_logs_retention_policy_id ON data_archival_logs(retention_policy_id);
CREATE INDEX idx_data_archival_logs_status ON data_archival_logs(status);
CREATE INDEX idx_data_archival_logs_started_at ON data_archival_logs(started_at DESC);

-- Encryption & Key Management Indexes
CREATE INDEX idx_encryption_keys_user_id ON encryption_keys(user_id);
CREATE INDEX idx_encryption_keys_key_type ON encryption_keys(key_type);
CREATE INDEX idx_encryption_keys_active ON encryption_keys(is_active) WHERE is_active = true;

CREATE INDEX idx_encryption_operations_encryption_key_id ON encryption_operations(encryption_key_id);
CREATE INDEX idx_encryption_operations_operation_type ON encryption_operations(operation_type);
CREATE INDEX idx_encryption_operations_success ON encryption_operations(success);
CREATE INDEX idx_encryption_operations_timestamp ON encryption_operations(timestamp DESC);

-- Threat Intelligence Indexes
CREATE INDEX idx_threat_intelligence_feeds_active ON threat_intelligence_feeds(is_active) WHERE is_active = true;
CREATE INDEX idx_threat_intelligence_feeds_feed_type ON threat_intelligence_feeds(feed_type);
CREATE INDEX idx_threat_intelligence_feeds_next_update ON threat_intelligence_feeds(next_update);

CREATE INDEX idx_threat_indicators_feed_id ON threat_indicators(feed_id);
CREATE INDEX idx_threat_indicators_indicator_type ON threat_indicators(indicator_type);
CREATE INDEX idx_threat_indicators_indicator_value ON threat_indicators(indicator_value);
CREATE INDEX idx_threat_indicators_active ON threat_indicators(is_active) WHERE is_active = true;

CREATE INDEX idx_threat_detection_events_user_id ON threat_detection_events(user_id);
CREATE INDEX idx_threat_detection_events_threat_indicator_id ON threat_detection_events(threat_indicator_id);
CREATE INDEX idx_threat_detection_events_detection_type ON threat_detection_events(detection_type);
CREATE INDEX idx_threat_detection_events_severity ON threat_detection_events(severity);
CREATE INDEX idx_threat_detection_events_created_at ON threat_detection_events(created_at DESC);

-- Access Control Indexes
CREATE INDEX idx_api_access_tokens_user_id ON api_access_tokens(user_id);
CREATE INDEX idx_api_access_tokens_platform ON api_access_tokens(platform);
CREATE INDEX idx_api_access_tokens_token_type ON api_access_tokens(token_type);
CREATE INDEX idx_api_access_tokens_active ON api_access_tokens(is_active) WHERE is_active = true;

CREATE INDEX idx_access_control_lists_user_id ON access_control_lists(user_id);
CREATE INDEX idx_access_control_lists_resource_type ON access_control_lists(resource_type);
CREATE INDEX idx_access_control_lists_access_type ON access_control_lists(access_type);
CREATE INDEX idx_access_control_lists_active ON access_control_lists(is_active) WHERE is_active = true;

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Enable RLS on all integration tables
ALTER TABLE office365_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE office365_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE office365_activity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE office365_compliance_checks ENABLE ROW LEVEL SECURITY;

ALTER TABLE linkedin_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_compliance_monitoring ENABLE ROW LEVEL SECURITY;

ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_posts ENABLE ROW LEVEL SECURITY;

ALTER TABLE crm_system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_mapped_entities ENABLE ROW LEVEL SECURITY;

ALTER TABLE analytics_platform_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dlp_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_analytics ENABLE ROW LEVEL SECURITY;

ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_archival_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_operations ENABLE ROW LEVEL SECURITY;

ALTER TABLE threat_intelligence_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_detection_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE api_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_control_lists ENABLE ROW LEVEL SECURITY;

-- Office 365 Management Activity API RLS Policies
CREATE POLICY "Users can view own Office 365 tenants" ON office365_tenants FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own Office 365 tenants" ON office365_tenants FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own Office 365 subscriptions" ON office365_subscriptions FOR SELECT USING (tenant_id IN (SELECT id FROM office365_tenants WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage own Office 365 subscriptions" ON office365_subscriptions FOR ALL USING (tenant_id IN (SELECT id FROM office365_tenants WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view own Office 365 activity records" ON office365_activity_records FOR SELECT USING (tenant_id IN (SELECT id FROM office365_tenants WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage own Office 365 activity records" ON office365_activity_records FOR ALL USING (tenant_id IN (SELECT id FROM office365_tenants WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view own Office 365 compliance checks" ON office365_compliance_checks FOR SELECT USING (tenant_id IN (SELECT id FROM office365_tenants WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage own Office 365 compliance checks" ON office365_compliance_checks FOR ALL USING (tenant_id IN (SELECT id FROM office365_tenants WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

-- LinkedIn API Integration RLS Policies
CREATE POLICY "Users can view own LinkedIn OAuth tokens" ON linkedin_oauth_tokens FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own LinkedIn OAuth tokens" ON linkedin_oauth_tokens FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own LinkedIn profiles" ON linkedin_profiles FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own LinkedIn profiles" ON linkedin_profiles FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own LinkedIn connections" ON linkedin_connections FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own LinkedIn connections" ON linkedin_connections FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own LinkedIn posts" ON linkedin_posts FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own LinkedIn posts" ON linkedin_posts FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own LinkedIn analytics" ON linkedin_analytics FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own LinkedIn analytics" ON linkedin_analytics FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own LinkedIn compliance monitoring" ON linkedin_compliance_monitoring FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own LinkedIn compliance monitoring" ON linkedin_compliance_monitoring FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Social Media Platform Integration RLS Policies
CREATE POLICY "Users can view own social media accounts" ON social_media_accounts FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own social media accounts" ON social_media_accounts FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own social media posts" ON social_media_posts FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own social media posts" ON social_media_posts FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own social media analytics" ON social_media_analytics FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own social media analytics" ON social_media_analytics FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own social media campaigns" ON social_media_campaigns FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own social media campaigns" ON social_media_campaigns FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own campaign posts" ON campaign_posts FOR SELECT USING (campaign_id IN (SELECT id FROM social_media_campaigns WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage own campaign posts" ON campaign_posts FOR ALL USING (campaign_id IN (SELECT id FROM social_media_campaigns WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

-- CRM/ERP Integration RLS Policies
CREATE POLICY "Users can view own CRM system configs" ON crm_system_configs FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own CRM system configs" ON crm_system_configs FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own CRM sync logs" ON crm_sync_logs FOR SELECT USING (crm_config_id IN (SELECT id FROM crm_system_configs WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage own CRM sync logs" ON crm_sync_logs FOR ALL USING (crm_config_id IN (SELECT id FROM crm_system_configs WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view own CRM mapped entities" ON crm_mapped_entities FOR SELECT USING (crm_config_id IN (SELECT id FROM crm_system_configs WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage own CRM mapped entities" ON crm_mapped_entities FOR ALL USING (crm_config_id IN (SELECT id FROM crm_system_configs WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

-- Analytics & Monitoring RLS Policies
CREATE POLICY "Users can view own analytics platform configs" ON analytics_platform_configs FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own analytics platform configs" ON analytics_platform_configs FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own analytics data points" ON analytics_data_points FOR SELECT USING (platform_config_id IN (SELECT id FROM analytics_platform_configs WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage own analytics data points" ON analytics_data_points FOR ALL USING (platform_config_id IN (SELECT id FROM analytics_platform_configs WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view own performance metrics" ON performance_metrics FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own performance metrics" ON performance_metrics FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Webhook & Notification RLS Policies
CREATE POLICY "Users can view own webhook configs" ON webhook_configs FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own webhook configs" ON webhook_configs FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own webhook deliveries" ON webhook_deliveries FOR SELECT USING (webhook_config_id IN (SELECT id FROM webhook_configs WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage own webhook deliveries" ON webhook_deliveries FOR ALL USING (webhook_config_id IN (SELECT id FROM webhook_configs WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view own notification preferences" ON notification_preferences FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Security & Compliance RLS Policies
CREATE POLICY "Users can view own security events" ON security_events FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own security events" ON security_events FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own compliance policies" ON compliance_policies FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own compliance policies" ON compliance_policies FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own compliance violations" ON compliance_violations FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own compliance violations" ON compliance_violations FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own DLP incidents" ON dlp_incidents FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own DLP incidents" ON dlp_incidents FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own API rate limits" ON api_rate_limits FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own API rate limits" ON api_rate_limits FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own API usage analytics" ON api_usage_analytics FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own API usage analytics" ON api_usage_analytics FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Data Retention & Archival RLS Policies
CREATE POLICY "Users can view own data retention policies" ON data_retention_policies FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own data retention policies" ON data_retention_policies FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own data archival logs" ON data_archival_logs FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own data archival logs" ON data_archival_logs FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Encryption & Key Management RLS Policies
CREATE POLICY "Users can view own encryption keys" ON encryption_keys FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own encryption keys" ON encryption_keys FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own encryption operations" ON encryption_operations FOR SELECT USING (encryption_key_id IN (SELECT id FROM encryption_keys WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage own encryption operations" ON encryption_operations FOR ALL USING (encryption_key_id IN (SELECT id FROM encryption_keys WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

-- Threat Intelligence RLS Policies (Admin access for global feeds)
CREATE POLICY "Users can view threat intelligence feeds" ON threat_intelligence_feeds FOR SELECT USING (true);
CREATE POLICY "Admins can manage threat intelligence feeds" ON threat_intelligence_feeds FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin')
);

CREATE POLICY "Users can view threat indicators" ON threat_indicators FOR SELECT USING (true);
CREATE POLICY "Admins can manage threat indicators" ON threat_indicators FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin')
);

CREATE POLICY "Users can view own threat detection events" ON threat_detection_events FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own threat detection events" ON threat_detection_events FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Access Control RLS Policies
CREATE POLICY "Users can view own API access tokens" ON api_access_tokens FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own API access tokens" ON api_access_tokens FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can view own access control lists" ON access_control_lists FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own access control lists" ON access_control_lists FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ==============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ==============================================

-- Apply updated_at triggers to all integration tables
CREATE TRIGGER update_office365_tenants_updated_at BEFORE UPDATE ON office365_tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_office365_subscriptions_updated_at BEFORE UPDATE ON office365_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_oauth_tokens_updated_at BEFORE UPDATE ON linkedin_oauth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_profiles_updated_at BEFORE UPDATE ON linkedin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_connections_updated_at BEFORE UPDATE ON linkedin_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_posts_updated_at BEFORE UPDATE ON linkedin_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_accounts_updated_at BEFORE UPDATE ON social_media_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_posts_updated_at BEFORE UPDATE ON social_media_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_campaigns_updated_at BEFORE UPDATE ON social_media_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_system_configs_updated_at BEFORE UPDATE ON crm_system_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_mapped_entities_updated_at BEFORE UPDATE ON crm_mapped_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_platform_configs_updated_at BEFORE UPDATE ON analytics_platform_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_configs_updated_at BEFORE UPDATE ON webhook_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_policies_updated_at BEFORE UPDATE ON compliance_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_rate_limits_updated_at BEFORE UPDATE ON api_rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_retention_policies_updated_at BEFORE UPDATE ON data_retention_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_encryption_keys_updated_at BEFORE UPDATE ON encryption_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threat_intelligence_feeds_updated_at BEFORE UPDATE ON threat_intelligence_feeds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threat_indicators_updated_at BEFORE UPDATE ON threat_indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_access_tokens_updated_at BEFORE UPDATE ON api_access_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_access_control_lists_updated_at BEFORE UPDATE ON access_control_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
