-- AgentDash Database Schema
-- Supabase PostgreSQL schema for the AgentDash application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE agent_type AS ENUM ('linkedin', 'office365', 'general');
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE knowledge_base_type AS ENUM ('linkedin', 'office365', 'custom');
CREATE TYPE service_type AS ENUM ('linkedin', 'office365', 'openai', 'anthropic');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    clerk_id VARCHAR(255) UNIQUE,
    linkedin_profile JSONB,
    office365_profile JSONB,
    preferences JSONB DEFAULT '{}',
    subscription_tier subscription_tier DEFAULT 'free',
    last_active TIMESTAMP WITH TIME ZONE
);

-- Agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type agent_type NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    error_count INTEGER DEFAULT 0
);

-- Workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL DEFAULT '[]',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00
);

-- Executions table
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status execution_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    logs JSONB DEFAULT '[]'
);

-- Knowledge bases table
CREATE TABLE knowledge_bases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type knowledge_base_type NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    document_count INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    size_bytes INTEGER NOT NULL,
    hash VARCHAR(64) NOT NULL UNIQUE
);

-- API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service service_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}'
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_last_active ON users(last_active);

CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_is_active ON agents(is_active);
CREATE INDEX idx_agents_last_run ON agents(last_run);

CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_agent_id ON workflows(agent_id);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);
CREATE INDEX idx_workflows_last_run ON workflows(last_run);

CREATE INDEX idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX idx_executions_agent_id ON executions(agent_id);
CREATE INDEX idx_executions_user_id ON executions(user_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_started_at ON executions(started_at);

CREATE INDEX idx_knowledge_bases_user_id ON knowledge_bases(user_id);
CREATE INDEX idx_knowledge_bases_type ON knowledge_bases(type);
CREATE INDEX idx_knowledge_bases_is_active ON knowledge_bases(is_active);

CREATE INDEX idx_documents_knowledge_base_id ON documents(knowledge_base_id);
CREATE INDEX idx_documents_hash ON documents(hash);
CREATE INDEX idx_documents_created_at ON documents(created_at);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_service ON api_keys(service);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_bases_updated_at BEFORE UPDATE ON knowledge_bases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update execution completion
CREATE OR REPLACE FUNCTION update_execution_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'failed', 'cancelled') AND OLD.status = 'running' THEN
        NEW.completed_at = NOW();
        NEW.duration_ms = EXTRACT(EPOCH FROM (NOW() - NEW.started_at)) * 1000;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for execution completion
CREATE TRIGGER update_execution_completion_trigger BEFORE UPDATE ON executions
    FOR EACH ROW EXECUTE FUNCTION update_execution_completion();

-- Create function to update agent statistics
CREATE OR REPLACE FUNCTION update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'failed', 'cancelled') AND OLD.status = 'running' THEN
        UPDATE agents SET
            last_run = NEW.completed_at,
            run_count = run_count + 1,
            success_rate = CASE 
                WHEN NEW.status = 'completed' THEN 
                    (success_rate * run_count + 100.0) / (run_count + 1)
                ELSE 
                    (success_rate * run_count) / (run_count + 1)
            END,
            error_count = CASE 
                WHEN NEW.status = 'failed' THEN error_count + 1
                ELSE error_count
            END
        WHERE id = NEW.agent_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for agent statistics
CREATE TRIGGER update_agent_stats_trigger AFTER UPDATE ON executions
    FOR EACH ROW EXECUTE FUNCTION update_agent_stats();

-- Create function to update workflow statistics
CREATE OR REPLACE FUNCTION update_workflow_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'failed', 'cancelled') AND OLD.status = 'running' THEN
        UPDATE workflows SET
            last_run = NEW.completed_at,
            run_count = run_count + 1,
            success_rate = CASE 
                WHEN NEW.status = 'completed' THEN 
                    (success_rate * run_count + 100.0) / (run_count + 1)
                ELSE 
                    (success_rate * run_count) / (run_count + 1)
            END
        WHERE id = NEW.workflow_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for workflow statistics
CREATE TRIGGER update_workflow_stats_trigger AFTER UPDATE ON executions
    FOR EACH ROW EXECUTE FUNCTION update_workflow_stats();

-- Create function to update knowledge base document count
CREATE OR REPLACE FUNCTION update_knowledge_base_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE knowledge_bases SET
            document_count = document_count + 1,
            total_size_bytes = total_size_bytes + NEW.size_bytes
        WHERE id = NEW.knowledge_base_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE knowledge_bases SET
            document_count = document_count - 1,
            total_size_bytes = total_size_bytes - OLD.size_bytes
        WHERE id = OLD.knowledge_base_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE knowledge_bases SET
            total_size_bytes = total_size_bytes - OLD.size_bytes + NEW.size_bytes
        WHERE id = NEW.knowledge_base_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for knowledge base statistics
CREATE TRIGGER update_knowledge_base_stats_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_base_stats();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Agents policies
CREATE POLICY "Users can view own agents" ON agents
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own agents" ON agents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own agents" ON agents
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own agents" ON agents
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Workflows policies
CREATE POLICY "Users can view own workflows" ON workflows
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own workflows" ON workflows
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own workflows" ON workflows
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own workflows" ON workflows
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Executions policies
CREATE POLICY "Users can view own executions" ON executions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own executions" ON executions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own executions" ON executions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Knowledge bases policies
CREATE POLICY "Users can view own knowledge bases" ON knowledge_bases
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own knowledge bases" ON knowledge_bases
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own knowledge bases" ON knowledge_bases
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own knowledge bases" ON knowledge_bases
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Documents policies
CREATE POLICY "Users can view documents from own knowledge bases" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM knowledge_bases 
            WHERE id = documents.knowledge_base_id 
            AND user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert documents to own knowledge bases" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM knowledge_bases 
            WHERE id = documents.knowledge_base_id 
            AND user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update documents in own knowledge bases" ON documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM knowledge_bases 
            WHERE id = documents.knowledge_base_id 
            AND user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete documents from own knowledge bases" ON documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM knowledge_bases 
            WHERE id = documents.knowledge_base_id 
            AND user_id::text = auth.uid()::text
        )
    );

-- API keys policies
CREATE POLICY "Users can view own API keys" ON api_keys
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own API keys" ON api_keys
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own API keys" ON api_keys
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Audit logs policies (read-only for users)
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Create views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.subscription_tier,
    u.created_at,
    u.last_active,
    COUNT(DISTINCT a.id) as agent_count,
    COUNT(DISTINCT w.id) as workflow_count,
    COUNT(DISTINCT kb.id) as knowledge_base_count,
    COALESCE(SUM(e.run_count), 0) as total_executions,
    COALESCE(AVG(e.success_rate), 0) as avg_success_rate
FROM users u
LEFT JOIN agents a ON u.id = a.user_id
LEFT JOIN workflows w ON u.id = w.user_id
LEFT JOIN knowledge_bases kb ON u.id = kb.user_id
LEFT JOIN executions e ON u.id = e.user_id
GROUP BY u.id, u.email, u.name, u.subscription_tier, u.created_at, u.last_active;

-- Create view for execution analytics
CREATE VIEW execution_analytics AS
SELECT 
    DATE_TRUNC('day', started_at) as date,
    status,
    COUNT(*) as count,
    AVG(duration_ms) as avg_duration_ms,
    COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*) as success_rate
FROM executions
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', started_at), status
ORDER BY date DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create initial admin user (optional)
-- INSERT INTO users (id, email, name, subscription_tier) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@agentdash.com', 'Admin User', 'enterprise');
