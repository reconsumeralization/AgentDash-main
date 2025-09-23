# Database Setup Guide

This guide covers the complete database setup for AgentDash using Supabase PostgreSQL.

## 🗄️ Database Configuration

### Supabase Project Details

- **Project URL**: `https://slkndlakxpkyizwupfgz.supabase.co`
- **Project ID**: `slkndlakxpkyizwupfgz`
- **Region**: `us-east-2` (AWS)

### Connection Strings

#### 1. Direct Connection (Persistent Connections)
```
postgresql://postgres:[YOUR-PASSWORD]@db.slkndlakxpkyizwupfgz.supabase.co:5432/postgres
```
- **Use Case**: Long-lived applications, containers, VMs
- **Features**: Full PostgreSQL features, prepared statements
- **Limitation**: Not IPv4 compatible

#### 2. Transaction Pooler (Serverless Functions)
```
postgresql://postgres.slkndlakxpkyizwupfgz:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```
- **Use Case**: Serverless functions, brief connections
- **Features**: IPv4 compatible, connection pooling
- **Limitation**: No prepared statements

#### 3. Session Pooler (IPv4 Networks)
```
postgresql://postgres.slkndlakxpkyizwupfgz:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```
- **Use Case**: IPv4-only networks
- **Features**: IPv4 compatible, session persistence
- **Limitation**: IPv4 networks only

## 🚀 Quick Setup

### 1. Environment Configuration

Copy the environment template:
```bash
cp env.example .env.local
```

Update `.env.local` with your database password:
```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.slkndlakxpkyizwupfgz.supabase.co:5432/postgres
DATABASE_POOLER_URL=postgresql://postgres.slkndlakxpkyizwupfgz:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
DATABASE_SESSION_POOLER_URL=postgresql://postgres.slkndlakxpkyizwupfgz:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://slkndlakxpkyizwupfgz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_lKr_8qxWAApaRoBjz1Dtnw__xk1oofO
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Database Schema Setup

Run the automated setup script:
```bash
npm run db:setup
```

This will:
- ✅ Create all database tables
- ✅ Set up indexes and constraints
- ✅ Configure Row Level Security (RLS)
- ✅ Create triggers and functions
- ✅ Insert sample data
- ✅ Create admin user

### 3. Verify Setup

Test the database connection:
```bash
npm run db:test
```

## 📊 Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    clerk_id VARCHAR(255) UNIQUE,
    linkedin_profile JSONB,
    office365_profile JSONB,
    preferences JSONB DEFAULT '{}',
    subscription_tier subscription_tier DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE
);
```

#### Agents
```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type agent_type NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    user_id UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Workflows
```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL DEFAULT '[]',
    user_id UUID NOT NULL REFERENCES users(id),
    agent_id UUID REFERENCES agents(id),
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Executions
```sql
CREATE TABLE executions (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    agent_id UUID REFERENCES agents(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status execution_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    logs JSONB DEFAULT '[]'
);
```

### Supporting Tables

- **knowledge_bases**: Store user knowledge bases
- **documents**: Store documents within knowledge bases
- **api_keys**: Manage API keys for integrations
- **audit_logs**: Track user actions and system events

## 🔒 Security Configuration

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Admin users have appropriate permissions
- API keys are properly secured

### Example RLS Policy
```sql
CREATE POLICY "Users can view own agents" ON agents
    FOR SELECT USING (auth.uid()::text = user_id::text);
```

### Authentication Integration

The database integrates with:
- **Clerk**: User authentication and management
- **Supabase Auth**: Database-level authentication
- **JWT**: Token-based API authentication

## 🔧 Database Functions

### Automatic Statistics Updates

The database includes triggers that automatically update:
- Agent run counts and success rates
- Workflow execution statistics
- Knowledge base document counts

### Example Trigger
```sql
CREATE TRIGGER update_agent_stats_trigger 
    AFTER UPDATE ON executions
    FOR EACH ROW EXECUTE FUNCTION update_agent_stats();
```

## 📈 Performance Optimization

### Indexes

Strategic indexes are created for:
- User lookups by email and Clerk ID
- Agent filtering by type and status
- Execution queries by status and date
- Knowledge base document searches

### Connection Pooling

The application uses different connection strategies:
- **Development**: Direct connection
- **Staging**: Session pooler
- **Production**: Transaction pooler (serverless)

## 🛠️ Management Commands

### Available Scripts

```bash
# Setup database schema and sample data
npm run db:setup

# Test database connection
npm run db:test

# Run migrations (future)
npm run db:migrate

# Seed with sample data
npm run db:seed

# Reset database (development only)
npm run db:reset
```

### Manual Database Operations

#### Connect via psql
```bash
# Direct connection
psql "postgresql://postgres:[PASSWORD]@db.slkndlakxpkyizwupfgz.supabase.co:5432/postgres"

# Pooler connection
psql "postgresql://postgres.slkndlakxpkyizwupfgz:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
```

#### View Database Statistics
```sql
-- User statistics
SELECT * FROM user_stats;

-- Execution analytics
SELECT * FROM execution_analytics;

-- Agent performance
SELECT name, run_count, success_rate, error_count 
FROM agents 
WHERE is_active = true 
ORDER BY success_rate DESC;
```

## 🔍 Monitoring and Maintenance

### Health Checks

The application includes database health checks:
- Connection validation
- Migration status
- Table accessibility
- Performance metrics

### Backup Strategy

Supabase provides:
- **Automatic backups**: Daily backups with 7-day retention
- **Point-in-time recovery**: Available for Pro plans
- **Manual backups**: Export via Supabase dashboard

### Performance Monitoring

Monitor database performance through:
- Supabase dashboard metrics
- Application logs
- Custom analytics views
- Execution statistics

## 🚨 Troubleshooting

### Common Issues

#### Connection Timeouts
```bash
# Check connection string format
# Verify password is correct
# Ensure network connectivity
```

#### RLS Policy Errors
```sql
-- Check user authentication
SELECT auth.uid();

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'agents';
```

#### Migration Failures
```bash
# Check Supabase service role key
# Verify database permissions
# Review migration logs
```

### Debug Commands

```bash
# Test connection
npm run db:test

# Check environment variables
node -e "console.log(process.env.DATABASE_URL)"

# Validate Supabase config
node -e "require('./lib/supabase/config.js').validateSupabaseConfig()"
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)

## 🆘 Support

For database issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Supabase dashboard logs
3. Test connection with provided scripts
4. Contact the development team

---

**Happy Database Management! 🗄️✨**
