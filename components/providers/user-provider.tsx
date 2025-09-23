"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@/lib'

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = async () => {
    try {
      setLoading(true)
      setError(null)

      // For demo purposes, return mock user
      const mockUser: User = {
        id: 'demo-user-1',
        clerk_id: 'demo-user-1',
        email: 'demo@defconect.com',
        name: 'Demo User',
        avatar_url: undefined,
        linkedin_profile: 'https://linkedin.com/in/demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setUser(mockUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return

    try {
      setError(null)
      // For demo purposes, just update local state
      setUser({ ...user, ...updates, updated_at: new Date().toISOString() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser,
    updateUser
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
