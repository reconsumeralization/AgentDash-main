# GitHub Secrets Setup Guide

This guide explains how to set up the required secrets for the AgentDash application.

## Required Secrets

### Application Secrets

| Secret Name | Description | Required For | Example |
|-------------|-------------|--------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public application URL | Deployment | `https://agentdash.vercel.app` |
| `DATABASE_URL` | Database connection string | Database | `postgresql://user:pass@host:port/db` |
| `SUPABASE_URL` | Supabase project URL | Database | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Database | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### LinkedIn API Secrets

| Secret Name | Description | Required For | Example |
|-------------|-------------|--------------|---------|
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth Client ID | OAuth, API | `your-linkedin-client-id` |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth Client Secret | OAuth, API | `your-linkedin-client-secret` |

### Office 365 API Secrets

| Secret Name | Description | Required For | Example |
|-------------|-------------|--------------|---------|
| `OFFICE365_TENANT_ID` | Azure AD Tenant ID | Office 365 API | `your-tenant-id` |
| `OFFICE365_CLIENT_ID` | Azure AD Application ID | Office 365 API | `your-client-id` |
| `OFFICE365_CLIENT_SECRET` | Azure AD Client Secret | Office 365 API | `your-client-secret` |

## Setting Up Secrets

### Using GitHub CLI

```bash
# Set individual secrets
gh secret set NEXT_PUBLIC_APP_URL --body "https://agentdash.vercel.app"
gh secret set LINKEDIN_CLIENT_ID --body "your-linkedin-client-id"
gh secret set LINKEDIN_CLIENT_SECRET --body "your-linkedin-client-secret"

# Set multiple secrets from environment variables
gh secret set DATABASE_URL --body "$DATABASE_URL"
gh secret set SUPABASE_URL --body "$SUPABASE_URL"
gh secret set SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY"
```

### Using GitHub Web Interface

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Enter the secret name and value
6. Click "Add secret"

### Using Script

Create a script to set all secrets at once:

```bash
#!/bin/bash
# setup-secrets.sh

# Application secrets
gh secret set NEXT_PUBLIC_APP_URL --body "https://agentdash.vercel.app"
gh secret set NEXT_PUBLIC_LINKEDIN_CLIENT_ID --body "your-linkedin-client-id"
gh secret set NEXT_PUBLIC_OFFICE365_TENANT_ID --body "your-tenant-id"

# LinkedIn API secrets
gh secret set LINKEDIN_CLIENT_ID --body "your-linkedin-client-id"
gh secret set LINKEDIN_CLIENT_SECRET --body "your-linkedin-client-secret"

# Office 365 API secrets
gh secret set OFFICE365_TENANT_ID --body "your-tenant-id"
gh secret set OFFICE365_CLIENT_ID --body "your-client-id"
gh secret set OFFICE365_CLIENT_SECRET --body "your-client-secret"

# Database secrets
gh secret set DATABASE_URL --body "your-database-url"
gh secret set SUPABASE_URL --body "your-supabase-url"
gh secret set SUPABASE_ANON_KEY --body "your-supabase-anon-key"

echo "All secrets have been set successfully!"
```

## Environment Variables

For local development, create a `.env.local` file:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# LinkedIn API
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Office 365 API
OFFICE365_TENANT_ID=your-tenant-id
OFFICE365_CLIENT_ID=your-client-id
OFFICE365_CLIENT_SECRET=your-client-secret

# Database
DATABASE_URL=your-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use environment variables for sensitive data**
3. **Rotate secrets regularly**
4. **Use least privilege principle**
5. **Monitor secret usage**
6. **Use secret scanning tools**

## Troubleshooting

### Common Issues

1. **Secret not found**: Ensure the secret name matches exactly
2. **Permission denied**: Check repository permissions
3. **Invalid format**: Verify the secret value format
4. **Missing secrets**: Ensure all required secrets are set

### Verification

To verify secrets are set correctly:

```bash
# List all secrets (names only)
gh secret list

# Check if a specific secret exists
gh secret get SECRET_NAME
```

## Support

For issues with secret setup:

1. Check the GitHub documentation
2. Verify repository permissions
3. Ensure secret names match exactly
4. Contact the development team
