/**
 * Supabase Client Configuration
 * Optimized client setup for different environments
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client configuration based on environment
const getClientConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isServer = typeof window === 'undefined'
  
  return {
    auth: {
      autoRefreshToken: true,
      persistSession: !isServer,
      detectSessionInUrl: !isServer,
      flowType: 'pkce' as const
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': `agentdash@${process.env.npm_package_version || '1.0.0'}`,
        'X-Environment': process.env.NODE_ENV || 'development'
      }
    },
    realtime: {
      params: {
        eventsPerSecond: isDevelopment ? 10 : 2
      }
    }
  }
}

// Create Supabase client
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  getClientConfig()
)

// Server-side client for API routes
export const createServerClient = (): SupabaseClient<Database> => {
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      ...getClientConfig(),
      auth: {
        ...getClientConfig().auth,
        persistSession: false
      }
    }
  )
}

// Admin client for server-side operations
export const createAdminClient = (): SupabaseClient<Database> | null => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will not be available.')
    return null
  }
  
  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    }
  )
}

// Client-side utilities
export const clientUtils = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },
  
  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },
  
  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  
  // Subscribe to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database utilities
export const dbUtils = {
  // Execute a query with error handling
  async executeQuery<T>(
    query: () => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const result = await query()
      return {
        data: result.data,
        error: result.error?.message || null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },
  
  // Batch operations
  async batchOperations<T>(
    operations: Array<() => Promise<{ data: T | null; error: any }>>
  ): Promise<{ data: T[]; errors: string[] }> {
    const results = await Promise.allSettled(
      operations.map(op => op())
    )
    
    const data: T[] = []
    const errors: string[] = []
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.error) {
          errors.push(`Operation ${index + 1}: ${result.value.error.message}`)
        } else if (result.value.data) {
          data.push(result.value.data)
        }
      } else {
        errors.push(`Operation ${index + 1}: ${result.reason}`)
      }
    })
    
    return { data, errors }
  }
}

// Real-time utilities
export const realtimeUtils = {
  // Subscribe to table changes
  subscribeToTable<T>(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    let channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter
        },
        callback
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  },
  
  // Subscribe to user-specific changes
  subscribeToUserChanges<T>(
    table: string,
    userId: string,
    callback: (payload: any) => void
  ) {
    return realtimeUtils.subscribeToTable(
      table,
      callback,
      `user_id=eq.${userId}`
    )
  }
}

export default supabase
