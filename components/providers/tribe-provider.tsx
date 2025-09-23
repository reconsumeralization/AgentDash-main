"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Tribe, TribeMember } from '@/lib'

interface TribeContextType {
  tribes: Tribe[]
  currentTribe: Tribe | null
  members: TribeMember[]
  loading: boolean
  error: string | null
  refreshTribes: () => Promise<void>
  createTribe: (data: Omit<Tribe, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  joinTribe: (tribeId: string) => Promise<void>
  leaveTribe: (tribeId: string) => Promise<void>
  setCurrentTribe: (tribe: Tribe | null) => void
}

const TribeContext = createContext<TribeContextType | undefined>(undefined)

interface TribeProviderProps {
  children: ReactNode
}

export function TribeProvider({ children }: TribeProviderProps) {
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [currentTribe, setCurrentTribe] = useState<Tribe | null>(null)
  const [members, setMembers] = useState<TribeMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshTribes = async () => {
    try {
      setLoading(true)
      setError(null)

      // For demo purposes, return mock tribes
      const mockTribes: Tribe[] = [
        {
          id: 'tribe-1',
          name: 'AI Innovation Leaders',
          description: 'Connect with AI entrepreneurs and technical leaders',
          founder_id: 'demo-user-1',
          aspiration_focus: ['ai-innovation', 'startup-funding', 'technical-leadership'],
          member_count: 12,
          skill_complementarity: {
            'ai-ml': 0.9,
            'startup': 0.8,
            'leadership': 0.7
          },
          growth_potential: 0.85,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'tribe-2',
          name: 'VC Network',
          description: 'Connect with venture capitalists and investors',
          founder_id: 'demo-user-2',
          aspiration_focus: ['funding', 'investment', 'startup-growth'],
          member_count: 8,
          skill_complementarity: {
            'finance': 0.95,
            'networking': 0.9,
            'strategy': 0.8
          },
          growth_potential: 0.75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'tribe-3',
          name: 'Executive Connectors',
          description: 'Elite network of executive recruiters and connectors',
          founder_id: 'demo-user-3',
          aspiration_focus: ['recruiting', 'executive-search', 'networking'],
          member_count: 15,
          skill_complementarity: {
            'recruiting': 0.95,
            'networking': 0.9,
            'leadership': 0.85
          },
          growth_potential: 0.9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      setTribes(mockTribes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tribes')
    } finally {
      setLoading(false)
    }
  }

  const createTribe = async (data: Omit<Tribe, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)

      const newTribe: Tribe = {
        ...data,
        id: `tribe-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setTribes(prev => [...prev, newTribe])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tribe')
    }
  }

  const joinTribe = async (tribeId: string) => {
    try {
      setError(null)

      // Mock joining tribe
      const newMember: TribeMember = {
        id: `member-${Date.now()}`,
        tribe_id: tribeId,
        user_id: 'demo-user-1',
        role: 'member',
        joined_at: new Date().toISOString(),
        contribution_score: 0,
        aspiration_alignment: 0.7
      }

      setMembers(prev => [...prev, newMember])
      setTribes(prev =>
        prev.map(tribe =>
          tribe.id === tribeId
            ? { ...tribe, member_count: tribe.member_count + 1 }
            : tribe
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join tribe')
    }
  }

  const leaveTribe = async (tribeId: string) => {
    try {
      setError(null)

      setMembers(prev => prev.filter(member =>
        !(member.tribe_id === tribeId && member.user_id === 'demo-user-1')
      ))
      setTribes(prev =>
        prev.map(tribe =>
          tribe.id === tribeId
            ? { ...tribe, member_count: Math.max(0, tribe.member_count - 1) }
            : tribe
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave tribe')
    }
  }

  useEffect(() => {
    refreshTribes()
  }, [])

  const value: TribeContextType = {
    tribes,
    currentTribe,
    members,
    loading,
    error,
    refreshTribes,
    createTribe,
    joinTribe,
    leaveTribe,
    setCurrentTribe
  }

  return <TribeContext.Provider value={value}>{children}</TribeContext.Provider>
}

export function useTribe() {
  const context = useContext(TribeContext)
  if (context === undefined) {
    throw new Error('useTribe must be used within a TribeProvider')
  }
  return context
}
