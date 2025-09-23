/**
 * Enhanced Database Migration System
 * Comprehensive migration utilities for database schema management and versioning
 */

import { getDatabaseClient } from './database-optimization'
import { z } from 'zod'

// ============================================================================
// MIGRATION TYPES
// ============================================================================

export interface Migration {
  version: string
  name: string
  description: string
  up: (client: any) => Promise<void>
  down: (client: any) => Promise<void>
  dependencies?: string[]
  checksum?: string
}

export interface MigrationResult {
  success: boolean
  version: string
  name: string
  duration: number
  error?: string
}

export interface MigrationStatus {
  version: string
  name: string
  applied: boolean
  appliedAt?: Date
  checksum?: string
}

// ============================================================================
// MIGRATION SCHEMA
// ============================================================================

export const MigrationSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  applied_at: z.string().datetime(),
  checksum: z.string().optional()
})

// ============================================================================
// MIGRATION MANAGER
// ============================================================================

export class MigrationManager {
  private db = getDatabaseClient()
  private migrations: Map<string, Migration> = new Map()

  constructor() {
    this.initializeMigrationTable()
  }

  // Initialize migrations table if it doesn't exist
  private async initializeMigrationTable(): Promise<void> {
    try {
      await this.db.query(async (client) => {
        await client.rpc('create_migrations_table_if_not_exists')
      })
    } catch (error) {
      // If RPC doesn't exist, create table manually
      await this.db.query(async (client) => {
        const { error } = await client.from('_migrations').select('*').limit(1)
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist, create it
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS _migrations (
              version VARCHAR(20) PRIMARY KEY,
              name VARCHAR(100) NOT NULL,
              description TEXT,
              applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              checksum VARCHAR(64)
            );
          `
          await client.rpc('exec_sql', { sql: createTableSQL })
        }
      })
    }
  }

  // Register a migration
  registerMigration(migration: Migration): void {
    this.migrations.set(migration.version, migration)
  }

  // Get all registered migrations
  getMigrations(): Migration[] {
    return Array.from(this.migrations.values()).sort((a, b) => 
      this.compareVersions(a.version, b.version)
    )
  }

  // Get applied migrations
  async getAppliedMigrations(): Promise<MigrationStatus[]> {
    try {
      const migrations = await this.db.select('_migrations', {
        order: { column: 'version', ascending: true }
      })

      return migrations.map((m: any) => ({
        version: m.version,
        name: m.name,
        applied: true,
        appliedAt: new Date(m.applied_at),
        checksum: m.checksum
      }))
    } catch (error) {
      console.error('Error fetching applied migrations:', error)
      return []
    }
  }

  // Get pending migrations
  async getPendingMigrations(): Promise<Migration[]> {
    const allMigrations = this.getMigrations()
    const appliedMigrations = await this.getAppliedMigrations()
    const appliedVersions = new Set(appliedMigrations.map(m => m.version))

    return allMigrations.filter(migration => !appliedVersions.has(migration.version))
  }

  // Run all pending migrations
  async runMigrations(): Promise<MigrationResult[]> {
    const pendingMigrations = await this.getPendingMigrations()
    const results: MigrationResult[] = []

    for (const migration of pendingMigrations) {
      try {
        const result = await this.runMigration(migration, 'up')
        results.push(result)
        
        if (!result.success) {
          console.error(`Migration ${migration.version} failed:`, result.error)
          break // Stop on first failure
        }
      } catch (error) {
        results.push({
          success: false,
          version: migration.version,
          name: migration.name,
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        break
      }
    }

    return results
  }

  // Run a specific migration
  async runMigration(migration: Migration, direction: 'up' | 'down'): Promise<MigrationResult> {
    const startTime = Date.now()

    try {
      await this.db.query(async (client) => {
        // Begin transaction
        await client.rpc('begin_transaction')

        try {
          if (direction === 'up') {
            await migration.up(client)
            
            // Record migration
            const checksum = await this.calculateChecksum(migration)
            await client.from('_migrations').insert({
              version: migration.version,
              name: migration.name,
              description: migration.description,
              checksum
            })
          } else {
            await migration.down(client)
            
            // Remove migration record
            await client.from('_migrations').delete().eq('version', migration.version)
          }

          // Commit transaction
          await client.rpc('commit_transaction')
        } catch (error) {
          // Rollback transaction
          await client.rpc('rollback_transaction')
          throw error
        }
      })

      const duration = Date.now() - startTime
      return {
        success: true,
        version: migration.version,
        name: migration.name,
        duration
      }

    } catch (error) {
      const duration = Date.now() - startTime
      return {
        success: false,
        version: migration.version,
        name: migration.name,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Rollback last migration
  async rollbackLast(): Promise<MigrationResult | null> {
    const appliedMigrations = await this.getAppliedMigrations()
    if (appliedMigrations.length === 0) {
      return null
    }

    const lastMigration = appliedMigrations[appliedMigrations.length - 1]
    const migration = this.migrations.get(lastMigration.version)
    
    if (!migration) {
      throw new Error(`Migration ${lastMigration.version} not found`)
    }

    return await this.runMigration(migration, 'down')
  }

  // Rollback to specific version
  async rollbackTo(version: string): Promise<MigrationResult[]> {
    const appliedMigrations = await this.getAppliedMigrations()
    const results: MigrationResult[] = []

    // Find migrations to rollback (in reverse order)
    const migrationsToRollback = appliedMigrations
      .filter(m => this.compareVersions(m.version, version) > 0)
      .reverse()

    for (const appliedMigration of migrationsToRollback) {
      const migration = this.migrations.get(appliedMigration.version)
      if (!migration) {
        throw new Error(`Migration ${appliedMigration.version} not found`)
      }

      const result = await this.runMigration(migration, 'down')
      results.push(result)

      if (!result.success) {
        break
      }
    }

    return results
  }

  // Validate migration checksums
  async validateMigrations(): Promise<{ valid: boolean; invalidMigrations: string[] }> {
    const appliedMigrations = await this.getAppliedMigrations()
    const invalidMigrations: string[] = []

    for (const appliedMigration of appliedMigrations) {
      const migration = this.migrations.get(appliedMigration.version)
      if (!migration) {
        invalidMigrations.push(appliedMigration.version)
        continue
      }

      const currentChecksum = await this.calculateChecksum(migration)
      if (appliedMigration.checksum && appliedMigration.checksum !== currentChecksum) {
        invalidMigrations.push(appliedMigration.version)
      }
    }

    return {
      valid: invalidMigrations.length === 0,
      invalidMigrations
    }
  }

  // Calculate migration checksum
  private async calculateChecksum(migration: Migration): Promise<string> {
    const crypto = await import('crypto')
    const content = `${migration.version}:${migration.name}:${migration.description}`
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  // Compare version strings
  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0
      const bPart = bParts[i] || 0

      if (aPart < bPart) return -1
      if (aPart > bPart) return 1
    }

    return 0
  }

  // Get migration status summary
  async getStatus(): Promise<{
    total: number
    applied: number
    pending: number
    lastApplied?: MigrationStatus
  }> {
    const allMigrations = this.getMigrations()
    const appliedMigrations = await this.getAppliedMigrations()

    return {
      total: allMigrations.length,
      applied: appliedMigrations.length,
      pending: allMigrations.length - appliedMigrations.length,
      lastApplied: appliedMigrations.length > 0 ? appliedMigrations[appliedMigrations.length - 1] : undefined
    }
  }
}

// ============================================================================
// PREDEFINED MIGRATIONS
// ============================================================================

export const coreMigrations: Migration[] = [
  {
    version: '1.0.0',
    name: 'initial_schema',
    description: 'Create initial database schema with core tables',
    up: async (client) => {
      // Enable extensions
      await client.rpc('exec_sql', { 
        sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' 
      })
      await client.rpc('exec_sql', { 
        sql: 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";' 
      })

      // Create users table
      await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            clerk_id TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            linkedin_profile TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      // Create aspirations table
      await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS aspirations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL CHECK (category IN ('career', 'skill', 'project', 'cause', 'networking')),
            priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
            target_date DATE,
            progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      // Create tribes table
      await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS tribes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL CHECK (type IN ('professional', 'interest', 'project', 'geographic', 'skill-based', 'aspirational')),
            visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invite-only')),
            founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
            aspiration_focus TEXT[] DEFAULT '{}',
            member_count INTEGER DEFAULT 1,
            skill_complementarity JSONB DEFAULT '{}',
            growth_potential DECIMAL(3,2) DEFAULT 0.0 CHECK (growth_potential >= 0 AND growth_potential <= 1),
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      // Create indexes
      await client.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
          CREATE INDEX IF NOT EXISTS idx_aspirations_user_id ON aspirations(user_id);
          CREATE INDEX IF NOT EXISTS idx_aspirations_category ON aspirations(category);
          CREATE INDEX IF NOT EXISTS idx_tribes_type ON tribes(type);
          CREATE INDEX IF NOT EXISTS idx_tribes_visibility ON tribes(visibility);
          CREATE INDEX IF NOT EXISTS idx_tribes_founder_id ON tribes(founder_id);
        `
      })
    },
    down: async (client) => {
      await client.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS tribes CASCADE;' })
      await client.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS aspirations CASCADE;' })
      await client.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS users CASCADE;' })
    }
  },

  {
    version: '1.1.0',
    name: 'add_tribe_rules_and_members',
    description: 'Add tribe rules and members tables',
    up: async (client) => {
      // Create tribe_members table
      await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS tribe_members (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('founder', 'member', 'moderator')),
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            contribution_score INTEGER DEFAULT 0 CHECK (contribution_score >= 0 AND contribution_score <= 100),
            aspiration_alignment INTEGER DEFAULT 0 CHECK (aspiration_alignment >= 0 AND aspiration_alignment <= 100),
            UNIQUE(tribe_id, user_id)
          );
        `
      })

      // Create tribe_rules table
      await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS tribe_rules (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL CHECK (category IN ('content', 'governance', 'collaboration', 'behavior', 'participation')),
            severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
            enforcement TEXT NOT NULL DEFAULT 'warning' CHECK (enforcement IN ('warning', 'mute', 'ban', 'kick')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES users(id) ON DELETE SET NULL,
            violations JSONB DEFAULT '[]'
          );
        `
      })

      // Create tribe_goals table
      await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS tribe_goals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            target_date DATE,
            priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      // Create indexes
      await client.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_tribe_members_tribe_id ON tribe_members(tribe_id);
          CREATE INDEX IF NOT EXISTS idx_tribe_members_user_id ON tribe_members(user_id);
          CREATE INDEX IF NOT EXISTS idx_tribe_rules_tribe_id ON tribe_rules(tribe_id);
          CREATE INDEX IF NOT EXISTS idx_tribe_goals_tribe_id ON tribe_goals(tribe_id);
        `
      })
    },
    down: async (client) => {
      await client.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS tribe_goals CASCADE;' })
      await client.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS tribe_rules CASCADE;' })
      await client.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS tribe_members CASCADE;' })
    },
    dependencies: ['1.0.0']
  },

  {
    version: '1.2.0',
    name: 'add_social_media_tables',
    description: 'Add social media integration tables',
    up: async (client) => {
      // Create social_accounts table
      await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS social_accounts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube')),
            account_id TEXT NOT NULL,
            username TEXT NOT NULL,
            display_name TEXT NOT NULL,
            profile_url TEXT,
            avatar_url TEXT,
            bio TEXT,
            followers_count INTEGER DEFAULT 0,
            following_count INTEGER DEFAULT 0,
            posts_count INTEGER DEFAULT 0,
            is_verified BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            last_sync_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, platform, account_id)
          );
        `
      })

      // Create social_posts table
      await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS social_posts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
            platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube')),
            content JSONB NOT NULL,
            post_id TEXT,
            scheduled_at TIMESTAMP WITH TIME ZONE,
            published_at TIMESTAMP WITH TIME ZONE,
            engagement_metrics JSONB DEFAULT '{}',
            status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'deleted')),
            brand TEXT CHECK (brand IN ('defconect', 'linkedout')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      // Create indexes
      await client.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
          CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
          CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
          CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
          CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
        `
      })
    },
    down: async (client) => {
      await client.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS social_posts CASCADE;' })
      await client.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS social_accounts CASCADE;' })
    },
    dependencies: ['1.0.0']
  }
]

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

export async function runCoreMigrations(): Promise<MigrationResult[]> {
  const migrationManager = new MigrationManager()
  
  // Register core migrations
  coreMigrations.forEach(migration => {
    migrationManager.registerMigration(migration)
  })

  // Run pending migrations
  return await migrationManager.runMigrations()
}

export async function getMigrationStatus(): Promise<{
  total: number
  applied: number
  pending: number
  lastApplied?: MigrationStatus
}> {
  const migrationManager = new MigrationManager()
  
  // Register core migrations
  coreMigrations.forEach(migration => {
    migrationManager.registerMigration(migration)
  })

  return await migrationManager.getStatus()
}

// ============================================================================
// EXPORTS
// ============================================================================

// MigrationManager and types are already exported above
