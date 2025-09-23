"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Agent } from '@/lib'

interface AgentExecution {
  id: string
  agentId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  completedAt?: string
  input: string
  output?: string
  error?: string
  tokensUsed?: number
  cost?: number
}

interface AgentContextType {
  agents: Agent[]
  runningAgents: AgentExecution[]
  loading: boolean
  error: string | null
  refreshAgents: () => Promise<void>
  createAgent: (data: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>
  deleteAgent: (id: string) => Promise<void>
  executeAgent: (agentId: string, input: string) => Promise<void>
  stopAgent: (executionId: string) => Promise<void>
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

interface AgentProviderProps {
  children: ReactNode
}

export function AgentProvider({ children }: AgentProviderProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [runningAgents, setRunningAgents] = useState<AgentExecution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshAgents = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock agents data
      const mockAgents: Agent[] = [
        {
          id: 'agent-1',
          user_id: 'demo-user-1',
          name: 'Context Intelligence Agent',
          type: 'context',
          model: 'gpt-4',
          system_prompt: 'You are an AI assistant specialized in understanding user context, goals, and providing personalized recommendations for professional networking and career development.',
          capabilities: ['context-analysis', 'goal-tracking', 'recommendation-engine'],
          aspiration_alignment: ['career-growth', 'networking', 'professional-development'],
          usage_count: 245,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'agent-2',
          user_id: 'demo-user-1',
          name: 'Research & Analysis Agent',
          type: 'research',
          model: 'claude-3',
          system_prompt: 'You are a research specialist focused on gathering and analyzing information about industries, companies, and professional opportunities.',
          capabilities: ['web-research', 'data-analysis', 'market-intelligence'],
          aspiration_alignment: ['market-research', 'competitive-analysis', 'opportunity-identification'],
          usage_count: 189,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'agent-3',
          user_id: 'demo-user-1',
          name: 'Expert Advisor Agent',
          type: 'expert',
          model: 'gpt-4',
          system_prompt: 'You are an expert advisor providing strategic guidance on business development, partnership opportunities, and professional growth strategies.',
          capabilities: ['strategic-advice', 'partnership-analysis', 'growth-planning'],
          aspiration_alignment: ['business-development', 'strategic-planning', 'partnership-building'],
          usage_count: 156,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'agent-4',
          user_id: 'demo-user-1',
          name: 'LinkedIn Strategy Agent',
          type: 'expert',
          model: 'claude-3',
          system_prompt: 'You are a LinkedIn networking specialist providing tactical advice on connection strategies, content optimization, and professional relationship building.',
          capabilities: ['networking-strategy', 'content-optimization', 'engagement-analysis'],
          aspiration_alignment: ['professional-networking', 'personal-branding', 'relationship-building'],
          usage_count: 312,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      setAgents(mockAgents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  const createAgent = async (data: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)

      const newAgent: Agent = {
        ...data,
        id: `agent-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setAgents(prev => [...prev, newAgent])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent')
    }
  }

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    try {
      setError(null)
      setAgents(prev =>
        prev.map(agent =>
          agent.id === id
            ? { ...agent, ...updates, updated_at: new Date().toISOString() }
            : agent
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agent')
    }
  }

  const deleteAgent = async (id: string) => {
    try {
      setError(null)
      setAgents(prev => prev.filter(agent => agent.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent')
    }
  }

  const executeAgent = async (agentId: string, input: string) => {
    try {
      setError(null)

      const execution: AgentExecution = {
        id: `exec-${Date.now()}`,
        agentId,
        status: 'running',
        startedAt: new Date().toISOString(),
        input
      }

      setRunningAgents(prev => [...prev, execution])

      // Simulate agent execution
      setTimeout(() => {
        const mockOutput = `Agent execution completed. Input: "${input}". Generated comprehensive analysis and recommendations.`
        setRunningAgents(prev =>
          prev.map(exec =>
            exec.id === execution.id
              ? {
                  ...exec,
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                  output: mockOutput,
                  tokensUsed: Math.floor(Math.random() * 1000) + 500,
                  cost: Math.random() * 0.1
                }
              : exec
          )
        )
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute agent')
    }
  }

  const stopAgent = async (executionId: string) => {
    try {
      setError(null)
      setRunningAgents(prev =>
        prev.map(exec =>
          exec.id === executionId
            ? { ...exec, status: 'cancelled', completedAt: new Date().toISOString() }
            : exec
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop agent')
    }
  }

  useEffect(() => {
    refreshAgents()
  }, [])

  const value: AgentContextType = {
    agents,
    runningAgents,
    loading,
    error,
    refreshAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    executeAgent,
    stopAgent
  }

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}
