-- AgentDash Complete Database Integration Setup
-- This script runs all integration migrations in the correct order
-- Run this after your main schema.sql file

-- ==============================================
-- EXECUTION ORDER:
-- 1. Main schema.sql (already run)
-- 2. integrations-migration.sql (Office 365 + LinkedIn)
-- 3. social-media-integrations.sql (All platforms + CRM + Analytics + Webhooks)
-- 4. security-compliance.sql (Security + Compliance + Threat Intelligence)
-- 5. integrations-indexes-rls.sql (Indexes + RLS Policies)
-- ==============================================

-- Log the start of integration setup
DO $$
BEGIN
    RAISE NOTICE 'Starting AgentDash Database Integration Setup...';
    RAISE NOTICE 'Timestamp: %', NOW();
END $$;

-- ==============================================
-- PART 1: CORE INTEGRATIONS (Office 365 + LinkedIn)
-- ==============================================

\echo 'Setting up Office 365 Management Activity API and LinkedIn integrations...'

-- Include the core integrations file
\i integrations-migration.sql

DO $$
BEGIN
    RAISE NOTICE 'Completed: Office 365 Management Activity API and LinkedIn integrations';
END $$;

-- ==============================================
-- PART 2: SOCIAL MEDIA & PLATFORM INTEGRATIONS
-- ==============================================

\echo 'Setting up social media platform integrations...'

-- Include the social media integrations file
\i social-media-integrations.sql

DO $$
BEGIN
    RAISE NOTICE 'Completed: Social media platform integrations';
END $$;

-- ==============================================
-- PART 3: SECURITY & COMPLIANCE
-- ==============================================

\echo 'Setting up security and compliance monitoring...'

-- Include the security and compliance file
\i security-compliance.sql

DO $$
BEGIN
    RAISE NOTICE 'Completed: Security and compliance monitoring';
END $$;

-- ==============================================
-- PART 4: INDEXES & ROW LEVEL SECURITY
-- ==============================================

\echo 'Creating indexes and row level security policies...'

-- Include the indexes and RLS file
\i integrations-indexes-rls.sql

DO $$
BEGIN
    RAISE NOTICE 'Completed: Indexes and row level security policies';
END $$;

-- ==============================================
-- VERIFICATION AND SUMMARY
-- ==============================================

\echo 'Verifying integration setup...'

-- Check that all major integration tables exist
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'office365_tenants',
        'office365_activity_records',
        'linkedin_profiles',
        'linkedin_posts',
        'social_media_accounts',
        'social_media_posts',
        'crm_system_configs',
        'analytics_platform_configs',
        'webhook_configs',
        'security_events',
        'compliance_policies',
        'threat_indicators'
    ];
    table_name TEXT;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = ANY(expected_tables);
    
    IF table_count = array_length(expected_tables, 1) THEN
        RAISE NOTICE 'SUCCESS: All % integration tables created successfully', table_count;
    ELSE
        RAISE WARNING 'WARNING: Only % out of % expected integration tables found', table_count, array_length(expected_tables, 1);
    END IF;
    
    -- List all integration tables
    RAISE NOTICE 'Integration tables created:';
    FOR table_name IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%office365%' 
        OR table_name LIKE '%linkedin%'
        OR table_name LIKE '%social_media%'
        OR table_name LIKE '%crm%'
        OR table_name LIKE '%analytics%'
        OR table_name LIKE '%webhook%'
        OR table_name LIKE '%security%'
        OR table_name LIKE '%compliance%'
        OR table_name LIKE '%threat%'
        OR table_name LIKE '%encryption%'
        OR table_name LIKE '%access_control%'
        OR table_name LIKE '%data_retention%'
        ORDER BY table_name
    LOOP
        RAISE NOTICE '  - %', table_name;
    END LOOP;
END $$;

-- Check extensions
DO $$
DECLARE
    ext_count INTEGER;
    ext_name TEXT;
BEGIN
    SELECT COUNT(*) INTO ext_count
    FROM pg_extension
    WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector', 'pg_trgm', 'btree_gin', 'btree_gist');
    
    RAISE NOTICE 'Extensions enabled: %', ext_count;
    
    RAISE NOTICE 'Enabled extensions:';
    FOR ext_name IN 
        SELECT extname 
        FROM pg_extension 
        WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector', 'pg_trgm', 'btree_gin', 'btree_gist')
        ORDER BY extname
    LOOP
        RAISE NOTICE '  - %', ext_name;
    END LOOP;
END $$;

-- Final summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'AgentDash Database Integration Setup Complete!';
    RAISE NOTICE '===============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Integration Categories Added:';
    RAISE NOTICE '  ✓ Office 365 Management Activity API';
    RAISE NOTICE '  ✓ LinkedIn API Integration';
    RAISE NOTICE '  ✓ Social Media Platform Integrations';
    RAISE NOTICE '  ✓ CRM/ERP System Integrations';
    RAISE NOTICE '  ✓ Analytics & Monitoring Platforms';
    RAISE NOTICE '  ✓ Webhook & Notification Systems';
    RAISE NOTICE '  ✓ Security & Compliance Monitoring';
    RAISE NOTICE '  ✓ Threat Intelligence & Detection';
    RAISE NOTICE '  ✓ Data Retention & Archival';
    RAISE NOTICE '  ✓ Encryption & Key Management';
    RAISE NOTICE '  ✓ Access Control & Permissions';
    RAISE NOTICE '';
    RAISE NOTICE 'Features Enabled:';
    RAISE NOTICE '  ✓ Row Level Security (RLS) policies';
    RAISE NOTICE '  ✓ Performance indexes';
    RAISE NOTICE '  ✓ Audit logging capabilities';
    RAISE NOTICE '  ✓ Data encryption support';
    RAISE NOTICE '  ✓ Multi-tenant architecture';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Configure your integration credentials';
    RAISE NOTICE '  2. Set up webhook endpoints';
    RAISE NOTICE '  3. Configure compliance policies';
    RAISE NOTICE '  4. Enable threat intelligence feeds';
    RAISE NOTICE '  5. Test your integrations';
    RAISE NOTICE '';
    RAISE NOTICE 'Setup completed at: %', NOW();
    RAISE NOTICE '===============================================';
END $$;
