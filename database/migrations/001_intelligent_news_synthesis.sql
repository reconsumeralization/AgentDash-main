-- Intelligent News Synthesis Database Schema
-- Creates tables for news synthesis, indicators, and alerts

-- Table for storing synthesized news cache
CREATE TABLE IF NOT EXISTS synthesized_news_cache (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing indicator alerts
CREATE TABLE IF NOT EXISTS indicator_alerts (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('trend', 'threshold', 'anomaly', 'prediction')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    indicator_data JSONB NOT NULL,
    insight_data JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Table for storing LinkedIn verification data
CREATE TABLE IF NOT EXISTS linkedin_verified_profiles (
    user_id VARCHAR(255) PRIMARY KEY,
    linkedin_id VARCHAR(255) UNIQUE,
    access_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    profile_data JSONB NOT NULL,
    verification_status JSONB NOT NULL,
    influence_score DECIMAL(3,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing news items with enhanced verification data
CREATE TABLE IF NOT EXISTS enhanced_news_items (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    engagement_metrics JSONB NOT NULL,
    metadata JSONB NOT NULL,
    verification_data JSONB,
    influence_score DECIMAL(3,2),
    trustworthiness_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing leading indicators
CREATE TABLE IF NOT EXISTS leading_indicators (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    trend VARCHAR(20) NOT NULL CHECK (trend IN ('rising', 'falling', 'stable', 'volatile')),
    confidence DECIMAL(3,2) NOT NULL,
    metadata JSONB,
    insights JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing synthesized insights
CREATE TABLE IF NOT EXISTS synthesized_insights (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    impact VARCHAR(20) NOT NULL CHECK (impact IN ('low', 'medium', 'high', 'critical')),
    data JSONB NOT NULL,
    related_items JSONB,
    tags JSONB,
    predictions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing user influence scores
CREATE TABLE IF NOT EXISTS user_influence_scores (
    user_id VARCHAR(255) PRIMARY KEY,
    overall_score DECIMAL(3,2) NOT NULL,
    factors JSONB NOT NULL,
    breakdown JSONB NOT NULL,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing platform-specific metrics
CREATE TABLE IF NOT EXISTS platform_metrics (
    id VARCHAR(255) PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    metadata JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_indicator_alerts_severity ON indicator_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_indicator_alerts_type ON indicator_alerts(type);
CREATE INDEX IF NOT EXISTS idx_indicator_alerts_acknowledged ON indicator_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_indicator_alerts_dismissed ON indicator_alerts(dismissed);
CREATE INDEX IF NOT EXISTS idx_indicator_alerts_created_at ON indicator_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_enhanced_news_items_user_id ON enhanced_news_items(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_news_items_platform ON enhanced_news_items(platform);
CREATE INDEX IF NOT EXISTS idx_enhanced_news_items_type ON enhanced_news_items(type);
CREATE INDEX IF NOT EXISTS idx_enhanced_news_items_created_at ON enhanced_news_items(created_at);
CREATE INDEX IF NOT EXISTS idx_enhanced_news_items_influence_score ON enhanced_news_items(influence_score);

CREATE INDEX IF NOT EXISTS idx_leading_indicators_category ON leading_indicators(category);
CREATE INDEX IF NOT EXISTS idx_leading_indicators_trend ON leading_indicators(trend);
CREATE INDEX IF NOT EXISTS idx_leading_indicators_updated_at ON leading_indicators(updated_at);

CREATE INDEX IF NOT EXISTS idx_synthesized_insights_type ON synthesized_insights(type);
CREATE INDEX IF NOT EXISTS idx_synthesized_insights_impact ON synthesized_insights(impact);
CREATE INDEX IF NOT EXISTS idx_synthesized_insights_created_at ON synthesized_insights(created_at);

CREATE INDEX IF NOT EXISTS idx_linkedin_verified_profiles_linkedin_id ON linkedin_verified_profiles(linkedin_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_verified_profiles_last_updated ON linkedin_verified_profiles(last_updated);

CREATE INDEX IF NOT EXISTS idx_platform_metrics_platform ON platform_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_type ON platform_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_recorded_at ON platform_metrics(recorded_at);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_synthesized_news_cache_updated_at 
    BEFORE UPDATE ON synthesized_news_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_news_items_updated_at 
    BEFORE UPDATE ON enhanced_news_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leading_indicators_updated_at 
    BEFORE UPDATE ON leading_indicators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_influence_scores_updated_at 
    BEFORE UPDATE ON user_influence_scores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_verified_profiles_updated_at 
    BEFORE UPDATE ON linkedin_verified_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW active_alerts AS
SELECT 
    id,
    type,
    severity,
    title,
    description,
    indicator_data,
    created_at
FROM indicator_alerts 
WHERE acknowledged = FALSE AND dismissed = FALSE
ORDER BY 
    CASE severity 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
    END,
    created_at DESC;

CREATE OR REPLACE VIEW top_influencers AS
SELECT 
    user_id,
    overall_score,
    factors,
    breakdown,
    last_calculated
FROM user_influence_scores 
ORDER BY overall_score DESC
LIMIT 100;

CREATE OR REPLACE VIEW platform_engagement_summary AS
SELECT 
    platform,
    COUNT(*) as total_posts,
    AVG((engagement_metrics->>'likes')::int) as avg_likes,
    AVG((engagement_metrics->>'comments')::int) as avg_comments,
    AVG((engagement_metrics->>'shares')::int) as avg_shares,
    AVG(influence_score) as avg_influence_score
FROM enhanced_news_items 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY platform
ORDER BY total_posts DESC;

-- Sample data for testing (optional)
INSERT INTO leading_indicators (id, name, description, category, value, trend, confidence, metadata) VALUES
('community-health', 'Community Health Index', 'Overall health and engagement of the community', 'engagement', 0.75, 'rising', 0.85, '{"sourceCount": 150, "userCount": 45, "platformCount": 6}'),
('innovation-index', 'Innovation Index', 'Level of innovation and technology discussion', 'innovation', 0.68, 'stable', 0.78, '{"sourceCount": 89, "userCount": 32, "platformCount": 5}'),
('growth-momentum', 'Growth Momentum', 'Momentum in trending topics and discussions', 'growth', 0.82, 'rising', 0.72, '{"sourceCount": 203, "userCount": 67, "platformCount": 6}')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
