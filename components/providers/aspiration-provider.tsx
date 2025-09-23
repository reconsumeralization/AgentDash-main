"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Aspiration } from '@/lib'
import type { AspirationMatch } from '@/lib'

interface AspirationMatchDisplay {
  user: {
    id: string
    name: string
    avatar?: string
    title?: string
    company?: string
  }
  compatibility_score: number
  shared_interests: Array<{
    category: string
    title: string
  }>
  reason: string
  priority: string
}

interface AspirationContextType {
  aspirations: Aspiration[]
  matches: AspirationMatchDisplay[]
  loading: boolean
  error: string | null
  refreshAspirations: () => Promise<void>
  createAspiration: (data: Omit<Aspiration, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateAspiration: (id: string, updates: Partial<Aspiration>) => Promise<void>
  deleteAspiration: (id: string) => Promise<void>
  findMatches: (aspirations: string[], limit?: number) => Promise<void>
}

const AspirationContext = createContext<AspirationContextType | undefined>(undefined)

interface AspirationProviderProps {
  children: ReactNode
}

export function AspirationProvider({ children }: AspirationProviderProps) {
  const [aspirations, setAspirations] = useState<Aspiration[]>([])
  const [matches, setMatches] = useState<AspirationMatchDisplay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshAspirations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/aspirations')
      if (!response.ok) {
        throw new Error('Failed to fetch aspirations')
      }

      const data = await response.json()
      setAspirations(data.aspirations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load aspirations')
      // Fallback to mock data
      setAspirations([
        {
          id: 'asp-1',
          user_id: 'demo-user-1',
          title: 'Build AI innovation tribe',
          description: 'Connect with like-minded AI entrepreneurs and researchers',
          category: 'networking',
          priority: 'high',
          status: 'active',
          target_date: undefined,
          progress_percentage: 75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'asp-2',
          user_id: 'demo-user-1',
          title: 'Secure VC funding',
          description: 'Raise Series A funding for DefConect platform',
          category: 'project',
          priority: 'critical',
          status: 'active',
          target_date: '2025-12-31',
          progress_percentage: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'asp-3',
          user_id: 'demo-user-1',
          title: 'Learn advanced AI ethics',
          description: 'Master ethical considerations in AI development',
          category: 'skill',
          priority: 'medium',
          status: 'active',
          target_date: undefined,
          progress_percentage: 60,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'asp-4',
          user_id: 'demo-user-1',
          title: 'Connect with 4-star generals',
          description: 'Build relationships with elite LinkedIn connectors',
          category: 'networking',
          priority: 'high',
          status: 'active',
          target_date: undefined,
          progress_percentage: 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const createAspiration = async (data: Omit<Aspiration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)

      const response = await fetch('/api/aspirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create aspiration')
      }

      const result = await response.json()
      setAspirations(prev => [...prev, result.aspiration])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create aspiration')
    }
  }

  const updateAspiration = async (id: string, updates: Partial<Aspiration>) => {
    try {
      setError(null)
      setAspirations(prev =>
        prev.map(asp => asp.id === id ? { ...asp, ...updates } : asp)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update aspiration')
    }
  }

  const deleteAspiration = async (id: string) => {
    try {
      setError(null)
      setAspirations(prev => prev.filter(asp => asp.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete aspiration')
    }
  }

  const findMatches = async (aspirations: string[], limit = 10) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aspirations, limit })
      })

      if (!response.ok) {
        throw new Error('Failed to find matches')
      }

      const data = await response.json()
      setMatches(data.matches || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find matches')
      // Fallback to mock matches
      setMatches([
        {
          user: { id: 'match-1', name: 'Sarah Chen', avatar: 'SC', title: 'VP AI at OpenAI', company: 'OpenAI' },
          compatibility_score: 0.85,
          shared_interests: [{ category: 'skill', title: 'AI Development' }],
          reason: 'Similar AI innovation goals',
          priority: 'high'
        },
        {
          user: { id: 'match-2', name: 'Marcus Rodriguez', avatar: 'MR', title: 'CTO at Anthropic', company: 'Anthropic' },
          compatibility_score: 0.72,
          shared_interests: [{ category: 'networking', title: 'AI Leadership' }],
          reason: 'Shared executive network goals',
          priority: 'high'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAspirations()
  }, [])

  const value: AspirationContextType = {
    aspirations,
    matches,
    loading,
    error,
    refreshAspirations,
    createAspiration,
    updateAspiration,
    deleteAspiration,
    findMatches
  }

  return <AspirationContext.Provider value={value}>{children}</AspirationContext.Provider>
}

export function useAspiration() {
  const context = useContext(AspirationContext)
  if (context === undefined) {
    throw new Error('useAspiration must be used within an AspirationProvider')
  }
  return context
}
