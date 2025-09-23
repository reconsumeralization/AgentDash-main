# DefConect Database Setup Guide

This guide explains how to set up the database for the DefConect Aspiration-Based Professional Networking Platform.

## Overview

DefConect uses Supabase (PostgreSQL) as its primary database to store:
- User profiles and aspiration data
- Tribe formations and member relationships
- Connection networks with aspiration compatibility
- AI agents and workflow automation
- Project management with motivation tracking

## Prerequisites

1. [Supabase Account](https://supabase.com) - Free tier available
2. Node.js and npm installed
3. Supabase CLI (optional, for advanced setup)

## Quick Setup with Supabase

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `defconect-aspiration-platform`
   - Database Password: Choose a strong password
   - Region: Select closest to your users
4. Wait for project creation (usually 2-3 minutes)

### Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - Project URL (anon public)
   - Project API keys (anon public)

### Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Copy from env.example and fill in your values
cp env.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run Database Schema

You have two options to set up the database schema:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the entire contents of `schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

#### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize local development (optional)
supabase init

# Link to your remote project
supabase link --project-ref your-project-id

# Apply schema
supabase db push
```

### Step 5: Verify Setup

1. Check that all tables were created in Supabase Dashboard → Table Editor
2. Test a simple query in the SQL Editor:
   ```sql
   SELECT * FROM users LIMIT 1;
   ```

## Database Schema Overview

### Core Tables

- **`users`** - User profiles linked to Clerk authentication
- **`aspirations`** - User's future goals and professional objectives
- **`tribes`** - Groups of users with shared professional trajectories
- **`connections`** - Aspiration-based relationships between users
- **`agents`** - AI assistants aligned with user aspirations
- **`workflows`** - Automation workflows with aspiration focus
- **`projects`** - Collaborative projects with motivation tracking

### Key Features

- **Aspiration Compatibility Scoring** - Matches users based on future goals
- **Tribe Formation** - Groups innovators, learners, and builders
- **Relationship Intelligence** - AI-powered engagement insights
- **Project Synchronicity** - Aligns goals with genuine motivation

## API Integration

The database is accessed through the Supabase client in `lib/supabase.ts`. Key functions include:

- `getUserAspirations()` - Fetch user's future goals
- `findCompatibleTribes()` - Discover matching professional groups
- `findAspirationMatches()` - Find compatible connections
- `createDreamTeam()` - Suggest optimal project collaborators

## Row Level Security (RLS)

All tables have RLS policies to ensure:
- Users can only access their own data
- Public tribe information is visible
- Private connection data is protected
- Aspiration data remains confidential

## Migration and Updates

When updating the schema:
1. Create a new migration file
2. Test on a development database first
3. Apply to production during maintenance window
4. Update TypeScript types accordingly

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check Supabase URL and API key
   - Verify `.env.local` is in project root
   - Restart development server

2. **RLS Policy Errors**
   - Ensure Clerk authentication is working
   - Check user ID mapping between Clerk and Supabase

3. **Schema Not Applied**
   - Verify SQL syntax in Supabase dashboard
   - Check for foreign key constraint errors

### Getting Help

- Check Supabase [documentation](https://supabase.com/docs)
- Review [GitHub issues](https://github.com/supabase/supabase/issues)
- Join the [Supabase Discord](https://supabase.com/docs/guides/getting-started)

## Production Deployment

For production:
1. Set up separate production Supabase project
2. Use environment-specific API keys
3. Enable database backups
4. Set up monitoring and alerts
5. Configure connection pooling

## Development Workflow

1. Make schema changes in `schema.sql`
2. Test locally with Supabase CLI
3. Apply to remote development project
4. Test thoroughly before production deployment

---

**Next Steps**: Once database is set up, proceed with implementing the aspiration API routes and AI consciousness system.
