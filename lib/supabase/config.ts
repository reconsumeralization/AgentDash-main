/**
 * Supabase Configuration
 * Database connection and client setup for AgentDash
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Database connection URLs
export const DATABASE_URLS = {
  // Direct connection (for persistent connections)
  direct: process.env.DATABASE_URL!,
  
  // Transaction pooler (for serverless functions)
  pooler: process.env.DATABASE_POOLER_URL!,
  
  // Session pooler (for IPv4 networks)
  sessionPooler: process.env.DATABASE_SESSION_POOLER_URL!
} as const

// Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'agentdash@1.0.0'
    }
  }
})

// Supabase admin client for server-side operations
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    })
  : null

// Database connection configuration
export const DB_CONFIG = {
  // Use transaction pooler for serverless environments (Vercel)
  connectionString: process.env.NODE_ENV === 'production' 
    ? DATABASE_URLS.pooler 
    : DATABASE_URLS.direct,
  
  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  },
  
  // SSL configuration
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
} as const

// Environment-specific database URL
export function getDatabaseUrl(): string {
  const env = process.env.NODE_ENV
  
  switch (env) {
    case 'production':
      // Use transaction pooler for production (serverless)
      return DATABASE_URLS.pooler
    case 'staging':
      // Use session pooler for staging
      return DATABASE_URLS.sessionPooler
    default:
      // Use direct connection for development
      return DATABASE_URLS.direct
  }
}

// Validate Supabase configuration
export function validateSupabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  
  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  
  if (!DATABASE_URLS.direct) {
    errors.push('DATABASE_URL is required')
  }
  
  if (!DATABASE_URLS.pooler) {
    errors.push('DATABASE_POOLER_URL is required')
  }
  
  if (!DATABASE_URLS.sessionPooler) {
    errors.push('DATABASE_SESSION_POOLER_URL is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Test database connection
export async function testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('version')
      .limit(1)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy'
  details: {
    connection: boolean
    migrations: boolean
    tables: boolean
  }
  error?: string
}> {
  try {
    // Test basic connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return {
        status: 'unhealthy',
        details: { connection: false, migrations: false, tables: false },
        error: connectionTest.error
      }
    }
    
    // Test table access
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5)
    
    if (tablesError) {
      return {
        status: 'unhealthy',
        details: { connection: true, migrations: false, tables: false },
        error: tablesError.message
      }
    }
    
    return {
      status: 'healthy',
      details: {
        connection: true,
        migrations: true,
        tables: true
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: { connection: false, migrations: false, tables: false },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export default supabase
