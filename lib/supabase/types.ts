/**
 * Supabase Database Types
 * Generated types for the AgentDash database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          clerk_id: string | null
          linkedin_profile: Json | null
          office365_profile: Json | null
          preferences: Json | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          last_active: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          clerk_id?: string | null
          linkedin_profile?: Json | null
          office365_profile?: Json | null
          preferences?: Json | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          last_active?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          clerk_id?: string | null
          linkedin_profile?: Json | null
          office365_profile?: Json | null
          preferences?: Json | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          last_active?: string | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'linkedin' | 'office365' | 'general'
          config: Json
          user_id: string
          created_at: string
          updated_at: string
          is_active: boolean
          last_run: string | null
          run_count: number
          success_rate: number
          error_count: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: 'linkedin' | 'office365' | 'general'
          config: Json
          user_id: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          last_run?: string | null
          run_count?: number
          success_rate?: number
          error_count?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'linkedin' | 'office365' | 'general'
          config?: Json
          user_id?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          last_run?: string | null
          run_count?: number
          success_rate?: number
          error_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      workflows: {
        Row: {
          id: string
          name: string
          description: string | null
          steps: Json
          user_id: string
          agent_id: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          last_run: string | null
          run_count: number
          success_rate: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          steps: Json
          user_id: string
          agent_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          last_run?: string | null
          run_count?: number
          success_rate?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          steps?: Json
          user_id?: string
          agent_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          last_run?: string | null
          run_count?: number
          success_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      executions: {
        Row: {
          id: string
          workflow_id: string
          agent_id: string | null
          user_id: string
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          started_at: string
          completed_at: string | null
          duration_ms: number | null
          input_data: Json | null
          output_data: Json | null
          error_message: string | null
          logs: Json | null
        }
        Insert: {
          id?: string
          workflow_id: string
          agent_id?: string | null
          user_id: string
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          input_data?: Json | null
          output_data?: Json | null
          error_message?: string | null
          logs?: Json | null
        }
        Update: {
          id?: string
          workflow_id?: string
          agent_id?: string | null
          user_id?: string
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          input_data?: Json | null
          output_data?: Json | null
          error_message?: string | null
          logs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "executions_workflow_id_fkey"
            columns: ["workflow_id"]
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executions_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      knowledge_bases: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'linkedin' | 'office365' | 'custom'
          user_id: string
          created_at: string
          updated_at: string
          is_active: boolean
          document_count: number
          total_size_bytes: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: 'linkedin' | 'office365' | 'custom'
          user_id: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          document_count?: number
          total_size_bytes?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'linkedin' | 'office365' | 'custom'
          user_id?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          document_count?: number
          total_size_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_bases_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          knowledge_base_id: string
          title: string
          content: string
          metadata: Json | null
          created_at: string
          updated_at: string
          size_bytes: number
          hash: string
        }
        Insert: {
          id?: string
          knowledge_base_id: string
          title: string
          content: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          size_bytes: number
          hash: string
        }
        Update: {
          id?: string
          knowledge_base_id?: string
          title?: string
          content?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          size_bytes?: number
          hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            referencedRelation: "knowledge_bases"
            referencedColumns: ["id"]
          }
        ]
      }
      api_keys: {
        Row: {
          id: string
          name: string
          key_hash: string
          user_id: string
          service: 'linkedin' | 'office365' | 'openai' | 'anthropic'
          created_at: string
          last_used: string | null
          is_active: boolean
          permissions: Json | null
        }
        Insert: {
          id?: string
          name: string
          key_hash: string
          user_id: string
          service: 'linkedin' | 'office365' | 'openai' | 'anthropic'
          created_at?: string
          last_used?: string | null
          is_active?: boolean
          permissions?: Json | null
        }
        Update: {
          id?: string
          name?: string
          key_hash?: string
          user_id?: string
          service?: 'linkedin' | 'office365' | 'openai' | 'anthropic'
          created_at?: string
          last_used?: string | null
          is_active?: boolean
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agent_type: "linkedin" | "office365" | "general"
      execution_status: "pending" | "running" | "completed" | "failed" | "cancelled"
      knowledge_base_type: "linkedin" | "office365" | "custom"
      service_type: "linkedin" | "office365" | "openai" | "anthropic"
      subscription_tier: "free" | "pro" | "enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type exports for convenience
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types
export type User = Tables<'users'>
export type Agent = Tables<'agents'>
export type Workflow = Tables<'workflows'>
export type Execution = Tables<'executions'>
export type KnowledgeBase = Tables<'knowledge_bases'>
export type Document = Tables<'documents'>
export type ApiKey = Tables<'api_keys'>
export type AuditLog = Tables<'audit_logs'>

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type AgentInsert = Database['public']['Tables']['agents']['Insert']
export type WorkflowInsert = Database['public']['Tables']['workflows']['Insert']
export type ExecutionInsert = Database['public']['Tables']['executions']['Insert']
export type KnowledgeBaseInsert = Database['public']['Tables']['knowledge_bases']['Insert']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type AgentUpdate = Database['public']['Tables']['agents']['Update']
export type WorkflowUpdate = Database['public']['Tables']['workflows']['Update']
export type ExecutionUpdate = Database['public']['Tables']['executions']['Update']
export type KnowledgeBaseUpdate = Database['public']['Tables']['knowledge_bases']['Update']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']
export type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update']
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update']

// Enum types
export type AgentType = Enums<'agent_type'>
export type ExecutionStatus = Enums<'execution_status'>
export type KnowledgeBaseType = Enums<'knowledge_base_type'>
export type ServiceType = Enums<'service_type'>
export type SubscriptionTier = Enums<'subscription_tier'>
