# AgentDash Database Integration Setup Guide

This guide will help you set up all database integrations and extensions for your AgentDash Supabase database.

## 🚀 Quick Start

### Prerequisites

1. **Supabase Project**: You should have a Supabase project set up
2. **Database Access**: Admin access to your Supabase database
3. **PostgreSQL Client**: psql or any PostgreSQL client to run the migrations

### Installation Steps

#### Step 1: Run Main Schema (if not already done)

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"

# Run the main schema first (if you haven't already)
\i schema.sql
```

#### Step 2: Run Complete Integration Setup

```bash
# Run the complete integration setup (recommended)
\i run-all-integrations.sql
```

**OR** run individual migration files:

```bash
# Run integrations in order
\i integrations-migration.sql
\i social-media-integrations.sql
\i security-compliance.sql
\i integrations-indexes-rls.sql
```

## 📋 What Gets Installed

### 🔧 Extensions
- `uuid-ossp` - UUID generation
- `pgcrypto` - Encryption functions
- `vector` - AI embeddings support
- `pg_trgm` - Fuzzy text search
- `btree_gin` - GIN indexes on scalars
- `btree_gist` - GiST indexes on scalars

### 🏢 Integration Categories

#### 1. Office 365 Management Activity API
- **Tables**: `office365_tenants`, `office365_subscriptions`, `office365_activity_records`, `office365_compliance_checks`
- **Features**: Audit log monitoring, compliance tracking, security event detection
- **Use Cases**: Enterprise compliance, security monitoring, audit trail management

#### 2. LinkedIn API Integration
- **Tables**: `linkedin_oauth_tokens`, `linkedin_profiles`, `linkedin_connections`, `linkedin_posts`, `linkedin_analytics`, `linkedin_compliance_monitoring`
- **Features**: Profile management, connection tracking, post analytics, compliance monitoring
- **Use Cases**: Professional networking, content strategy, engagement tracking

#### 3. Social Media Platform Integrations
- **Tables**: `social_media_accounts`, `social_media_posts`, `social_media_analytics`, `social_media_campaigns`, `campaign_posts`
- **Platforms**: LinkedIn, Twitter, Facebook, Instagram, YouTube, TikTok, Pinterest, Snapchat
- **Features**: Cross-platform posting, analytics, campaign management
- **Use Cases**: Multi-platform social media management, campaign orchestration

#### 4. CRM/ERP Integrations
- **Tables**: `crm_system_configs`, `crm_sync_logs`, `crm_mapped_entities`
- **Systems**: Salesforce, HubSpot, Pipedrive, Zoho, Monday, Asana, Trello, Custom
- **Features**: Data synchronization, lead management, contact mapping
- **Use Cases**: Sales automation, lead nurturing, data integration

#### 5. Analytics & Monitoring
- **Tables**: `analytics_platform_configs`, `analytics_data_points`, `performance_metrics`
- **Platforms**: Google Analytics, Mixpanel, Amplitude, Hotjar, FullStory, Datadog, New Relic, Splunk
- **Features**: Performance monitoring, user analytics, system metrics
- **Use Cases**: Performance optimization, user behavior analysis, system monitoring

#### 6. Webhook & Notifications
- **Tables**: `webhook_configs`, `webhook_deliveries`, `notification_preferences`
- **Features**: Real-time notifications, event-driven automation, delivery tracking
- **Use Cases**: Integration automation, real-time alerts, system orchestration

#### 7. Security & Compliance
- **Tables**: `security_events`, `compliance_policies`, `compliance_violations`, `dlp_incidents`
- **Features**: Threat detection, policy enforcement, data loss prevention
- **Use Cases**: Security monitoring, compliance management, risk mitigation

#### 8. Threat Intelligence
- **Tables**: `threat_intelligence_feeds`, `threat_indicators`, `threat_detection_events`
- **Features**: Threat feed integration, indicator matching, behavioral analysis
- **Use Cases**: Security threat detection, malicious activity prevention

#### 9. Data Management
- **Tables**: `data_retention_policies`, `data_archival_logs`, `encryption_keys`, `encryption_operations`
- **Features**: Data lifecycle management, encryption, archival
- **Use Cases**: Data governance, privacy compliance, storage optimization

#### 10. Access Control
- **Tables**: `api_access_tokens`, `access_control_lists`
- **Features**: Token management, permission control, resource access
- **Use Cases**: API security, user permissions, resource protection

## 🔒 Security Features

### Row Level Security (RLS)
All integration tables have RLS enabled with user-specific policies:
- Users can only access their own data
- Admin users have elevated permissions for system-wide data
- Cross-user data access is restricted and audited

### Data Encryption
- Sensitive data (tokens, secrets) is encrypted at rest
- Encryption keys are managed securely
- All encryption operations are logged

### Audit Logging
- All data modifications are tracked
- Security events are logged with context
- Compliance violations are recorded with remediation actions

## 📊 Performance Optimizations

### Indexes
- **B-tree indexes** for exact matches and range queries
- **GIN indexes** for array and JSONB fields
- **Partial indexes** for active/filtered data
- **Composite indexes** for multi-column queries

### Query Optimization
- Optimized for common integration patterns
- Efficient joins between related tables
- Partitioning support for large datasets

## 🔧 Configuration

### Environment Variables
Set these in your Supabase project settings:

```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Encryption (generate your own keys)
ENCRYPTION_KEY=your-32-character-encryption-key
HMAC_SECRET=your-hmac-secret-key

# Integration APIs (add as needed)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
OFFICE365_TENANT_ID=your-office365-tenant-id
OFFICE365_CLIENT_ID=your-office365-client-id
OFFICE365_CLIENT_SECRET=your-office365-client-secret
```

### Supabase Configuration

1. **Enable Extensions**: Go to Database → Extensions and enable:
   - `uuid-ossp`
   - `pgcrypto`
   - `vector`
   - `pg_trgm`
   - `btree_gin`
   - `btree_gist`

2. **Set up RLS**: All tables automatically have RLS enabled

3. **Configure Storage**: Set up Supabase Storage for file uploads if needed

## 🧪 Testing Your Setup

### Verification Queries

```sql
-- Check that all integration tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
    table_name LIKE '%office365%' OR
    table_name LIKE '%linkedin%' OR
    table_name LIKE '%social_media%' OR
    table_name LIKE '%crm%' OR
    table_name LIKE '%analytics%' OR
    table_name LIKE '%webhook%' OR
    table_name LIKE '%security%' OR
    table_name LIKE '%compliance%' OR
    table_name LIKE '%threat%' OR
    table_name LIKE '%encryption%' OR
    table_name LIKE '%access_control%' OR
    table_name LIKE '%data_retention%'
)
ORDER BY table_name;

-- Check extensions
SELECT extname FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector', 'pg_trgm', 'btree_gin', 'btree_gist');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE '%office365%' 
LIMIT 5;
```

### Sample Data Insertion

```sql
-- Insert a test user (replace with your actual user ID)
INSERT INTO users (clerk_id, email, name) 
VALUES ('test-user-123', 'test@example.com', 'Test User');

-- Insert a test Office 365 tenant configuration
INSERT INTO office365_tenants (user_id, tenant_id, tenant_name, subscription_type, client_id, client_secret_encrypted)
VALUES (
    (SELECT id FROM users WHERE clerk_id = 'test-user-123'),
    'test-tenant-123',
    'Test Organization',
    'Enterprise',
    'test-client-id',
    'encrypted-client-secret'
);

-- Insert a test LinkedIn profile
INSERT INTO linkedin_profiles (user_id, linkedin_id, first_name, last_name, headline)
VALUES (
    (SELECT id FROM users WHERE clerk_id = 'test-user-123'),
    'test-linkedin-123',
    'Test',
    'User',
    'Software Developer'
);
```

## 🚨 Troubleshooting

### Common Issues

1. **Extension Not Found**
   ```sql
   -- Enable extensions manually in Supabase dashboard
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   CREATE EXTENSION IF NOT EXISTS "vector";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   CREATE EXTENSION IF NOT EXISTS "btree_gin";
   CREATE EXTENSION IF NOT EXISTS "btree_gist";
   ```

2. **Permission Denied**
   - Ensure you're connected as the `postgres` user
   - Check that RLS policies are correctly configured
   - Verify user authentication in your application

3. **Foreign Key Violations**
   - Ensure the main schema is run first
   - Check that referenced tables exist
   - Verify user IDs match between tables

4. **Performance Issues**
   - Check that indexes are created properly
   - Monitor query performance with `EXPLAIN ANALYZE`
   - Consider partitioning for large tables

### Getting Help

1. **Check Supabase Logs**: Go to Logs in your Supabase dashboard
2. **Verify Database Connection**: Test your connection string
3. **Review RLS Policies**: Ensure policies match your authentication setup
4. **Check Extension Status**: Verify all required extensions are enabled

## 📈 Next Steps

After successful setup:

1. **Configure Integrations**: Set up your API credentials and webhooks
2. **Set Compliance Policies**: Define your security and compliance rules
3. **Enable Monitoring**: Set up alerts and notifications
4. **Test Functionality**: Verify all integrations work as expected
5. **Scale Gradually**: Start with core features and expand over time

## 🔄 Maintenance

### Regular Tasks

- **Monitor Performance**: Check slow queries and optimize indexes
- **Update Security**: Regularly rotate encryption keys and tokens
- **Clean Data**: Run data retention policies to clean old data
- **Backup Verification**: Ensure backups include all integration data

### Updates

When updating the schema:
1. Always backup your database first
2. Test migrations on a staging environment
3. Review and update RLS policies as needed
4. Update your application code to match schema changes

---

**Need Help?** Check the [AgentDash Documentation](../README.md) or create an issue in the repository.
