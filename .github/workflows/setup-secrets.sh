#!/bin/bash

# AgentDash Repository Secrets Setup Script
# This script sets up all required secrets for the CI/CD pipeline

set -e

echo "🔐 Setting up AgentDash repository secrets..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    echo "   Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"

# Function to set secret with confirmation
set_secret() {
    local secret_name=$1
    local secret_description=$2
    local secret_value=""
    
    echo ""
    echo "🔑 Setting up: $secret_name"
    echo "   Description: $secret_description"
    
    # Check if secret already exists
    if gh secret list | grep -q "$secret_name"; then
        echo "   ⚠️  Secret already exists. Do you want to update it? (y/N)"
        read -r update_secret
        if [[ ! $update_secret =~ ^[Yy]$ ]]; then
            echo "   ⏭️  Skipping $secret_name"
            return
        fi
    fi
    
    # Get secret value
    echo "   Enter value for $secret_name:"
    read -rs secret_value
    
    if [ -z "$secret_value" ]; then
        echo "   ⚠️  Empty value provided. Skipping $secret_name"
        return
    fi
    
    # Set the secret
    if gh secret set "$secret_name" --body "$secret_value"; then
        echo "   ✅ Successfully set $secret_name"
    else
        echo "   ❌ Failed to set $secret_name"
    fi
}

# Function to set secret from environment variable
set_secret_from_env() {
    local secret_name=$1
    local env_var_name=$2
    local secret_description=$3
    
    echo ""
    echo "🔑 Setting up: $secret_name"
    echo "   Description: $secret_description"
    
    if [ -n "${!env_var_name}" ]; then
        if gh secret set "$secret_name" --body "${!env_var_name}"; then
            echo "   ✅ Successfully set $secret_name from $env_var_name"
        else
            echo "   ❌ Failed to set $secret_name"
        fi
    else
        echo "   ⚠️  Environment variable $env_var_name is not set. Skipping $secret_name"
    fi
}

echo ""
echo "📋 This script will set up the following categories of secrets:"
echo "   1. Application Configuration"
echo "   2. LinkedIn API Integration"
echo "   3. Office 365 API Integration"
echo "   4. Database Configuration"
echo "   5. Deployment Configuration"
echo "   6. Docker Configuration"
echo "   7. Security Tools (Optional)"
echo "   8. Notifications (Optional)"
echo "   9. Package Registry (Optional)"

echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read -r

# 1. Application Configuration
echo ""
echo "🚀 Setting up Application Configuration secrets..."
set_secret "NEXT_PUBLIC_APP_URL" "Public URL of the application (e.g., https://agentdash.vercel.app)"
set_secret "NEXT_PUBLIC_LINKEDIN_CLIENT_ID" "LinkedIn OAuth Client ID for public use"
set_secret "NEXT_PUBLIC_OFFICE365_TENANT_ID" "Office 365 Tenant ID for public use"

# 2. LinkedIn API Integration
echo ""
echo "🔗 Setting up LinkedIn API Integration secrets..."
set_secret "LINKEDIN_CLIENT_ID" "LinkedIn OAuth Client ID"
set_secret "LINKEDIN_CLIENT_SECRET" "LinkedIn OAuth Client Secret"

# 3. Office 365 API Integration
echo ""
echo "🏢 Setting up Office 365 API Integration secrets..."
set_secret "OFFICE365_TENANT_ID" "Office 365 Tenant ID"
set_secret "OFFICE365_CLIENT_ID" "Office 365 Client ID"
set_secret "OFFICE365_CLIENT_SECRET" "Office 365 Client Secret"

# 4. Database Configuration
echo ""
echo "🗄️  Setting up Database Configuration secrets..."
set_secret "DATABASE_URL" "PostgreSQL direct connection string (postgresql://postgres:[PASSWORD]@db.slkndlakxpkyizwupfgz.supabase.co:5432/postgres)"
set_secret "DATABASE_POOLER_URL" "PostgreSQL transaction pooler URL (postgresql://postgres.slkndlakxpkyizwupfgz:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres)"
set_secret "DATABASE_SESSION_POOLER_URL" "PostgreSQL session pooler URL (postgresql://postgres.slkndlakxpkyizwupfgz:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres)"
set_secret "SUPABASE_URL" "Supabase project URL (https://slkndlakxpkyizwupfgz.supabase.co)"
set_secret "SUPABASE_ANON_KEY" "Supabase anonymous key (sb_publishable_lKr_8qxWAApaRoBjz1Dtnw__xk1oofO)"

# 5. Deployment Configuration
echo ""
echo "🚀 Setting up Deployment Configuration secrets..."
set_secret "VERCEL_TOKEN" "Vercel deployment token"
set_secret "VERCEL_ORG_ID" "Vercel organization ID"
set_secret "VERCEL_PROJECT_ID" "Vercel project ID"
set_secret "PRODUCTION_URL" "Production environment URL"
set_secret "STAGING_URL" "Staging environment URL"

# 6. Docker Configuration
echo ""
echo "🐳 Setting up Docker Configuration secrets..."
set_secret "DOCKER_USERNAME" "Docker Hub username"
set_secret "DOCKER_PASSWORD" "Docker Hub password/token"

# 7. Security Tools (Optional)
echo ""
echo "🛡️  Setting up Security Tools secrets (Optional)..."
echo "   These are optional but recommended for enhanced security scanning."
echo "   Press Enter to skip or provide values to set them up."

echo ""
echo "   Set up Snyk security scanning? (y/N)"
read -r setup_snyk
if [[ $setup_snyk =~ ^[Yy]$ ]]; then
    set_secret "SNYK_TOKEN" "Snyk security scanning token"
fi

echo ""
echo "   Set up Semgrep security scanning? (y/N)"
read -r setup_semgrep
if [[ $setup_semgrep =~ ^[Yy]$ ]]; then
    set_secret "SEMGREP_APP_TOKEN" "Semgrep security scanning token"
fi

echo ""
echo "   Set up Lighthouse CI? (y/N)"
read -r setup_lighthouse
if [[ $setup_lighthouse =~ ^[Yy]$ ]]; then
    set_secret "LHCI_GITHUB_APP_TOKEN" "Lighthouse CI GitHub App token"
fi

# 8. Notifications (Optional)
echo ""
echo "📢 Setting up Notifications secrets (Optional)..."
echo "   Set up Slack notifications? (y/N)"
read -r setup_slack
if [[ $setup_slack =~ ^[Yy]$ ]]; then
    set_secret "SLACK_WEBHOOK_URL" "Slack webhook URL for notifications"
fi

# 9. Package Registry (Optional)
echo ""
echo "📦 Setting up Package Registry secrets (Optional)..."
echo "   Set up NPM publishing? (y/N)"
read -r setup_npm
if [[ $setup_npm =~ ^[Yy]$ ]]; then
    set_secret "NPM_TOKEN" "NPM publishing token"
fi

# Summary
echo ""
echo "🎉 Secrets setup completed!"
echo ""
echo "📋 Summary of configured secrets:"
gh secret list

echo ""
echo "✅ Next steps:"
echo "   1. Verify all secrets are set correctly"
echo "   2. Test the CI/CD pipeline by pushing to the repository"
echo "   3. Check the GitHub Actions tab for workflow runs"
echo "   4. Monitor deployment logs for any issues"
echo ""
echo "🔗 Useful links:"
echo "   - Repository: https://github.com/reconsumeralization/AgentDash"
echo "   - Actions: https://github.com/reconsumeralization/AgentDash/actions"
echo "   - Secrets: https://github.com/reconsumeralization/AgentDash/settings/secrets/actions"
echo ""
echo "📚 Documentation:"
echo "   - CI/CD Pipeline: .github/workflows/"
echo "   - Secrets Setup: .github/SECRETS_SETUP.md"
echo "   - Deployment Guide: docs/DEPLOYMENT.md"
echo ""
echo "Happy coding! 🚀"
