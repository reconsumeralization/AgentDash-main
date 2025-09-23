"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { 
  ContextSurfacer, 
  UserContext, 
  AgenticContext, 
  UseCaseContext, 
  ContextualGuidance, 
  AdaptiveUIState 
} from './context-surfacer'

interface ContextSurfacerContextType {
  contextSurfacer: ContextSurfacer
  guidance: ContextualGuidance
  adaptiveState: AdaptiveUIState
  updateUserContext: (updates: Partial<UserContext>) => void
  updateAgenticContext: (updates: Partial<AgenticContext>) => void
  updateUseCaseContext: (updates: Partial<UseCaseContext>) => void
  getContextSummary: () => any
  getContextualRecommendations: () => any
  predictNextAction: () => string[]
  isLoading: boolean
  error: string | null
}

const ContextSurfacerContext = createContext<ContextSurfacerContextType | null>(null)

interface ContextSurfacerProviderProps {
  children: React.ReactNode
  initialUserContext?: Partial<UserContext>
  initialAgenticContext?: Partial<AgenticContext>
  initialUseCaseContext?: Partial<UseCaseContext>
}

export function ContextSurfacerProvider({ 
  children, 
  initialUserContext = {},
  initialAgenticContext = {},
  initialUseCaseContext = {}
}: ContextSurfacerProviderProps) {
  const [contextSurfacer, setContextSurfacer] = useState<ContextSurfacer | null>(null)
  const [guidance, setGuidance] = useState<ContextualGuidance | null>(null)
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveUIState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initializedRef = useRef(false)

  // Initialize context surfacer only once
  useEffect(() => {
    if (initializedRef.current) return

    try {
      const surfacer = new ContextSurfacer(
        initialUserContext,
        initialAgenticContext,
        initialUseCaseContext
      )

      setContextSurfacer(surfacer)
      setGuidance(surfacer.getContextualGuidance())
      setAdaptiveState(surfacer.getAdaptiveUIState())
      setIsLoading(false)
      initializedRef.current = true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize context surfacer')
      setIsLoading(false)
    }
  }, [initialAgenticContext, initialUseCaseContext, initialUserContext])

  // Update user context
  const updateUserContext = useCallback((updates: Partial<UserContext>) => {
    if (contextSurfacer) {
      contextSurfacer.updateUserContext(updates)
      setGuidance(contextSurfacer.getContextualGuidance())
      setAdaptiveState(contextSurfacer.getAdaptiveUIState())
    }
  }, [contextSurfacer])

  // Update agentic context
  const updateAgenticContext = useCallback((updates: Partial<AgenticContext>) => {
    if (contextSurfacer) {
      contextSurfacer.updateAgenticContext(updates)
      setGuidance(contextSurfacer.getContextualGuidance())
      setAdaptiveState(contextSurfacer.getAdaptiveUIState())
    }
  }, [contextSurfacer])

  // Update use case context
  const updateUseCaseContext = useCallback((updates: Partial<UseCaseContext>) => {
    if (contextSurfacer) {
      contextSurfacer.updateUseCaseContext(updates)
      setGuidance(contextSurfacer.getContextualGuidance())
      setAdaptiveState(contextSurfacer.getAdaptiveUIState())
    }
  }, [contextSurfacer])

  // Get context summary
  const getContextSummary = useCallback(() => {
    return contextSurfacer?.getContextSummary() || null
  }, [contextSurfacer])

  // Get contextual recommendations
  const getContextualRecommendations = useCallback(() => {
    return contextSurfacer?.getContextualRecommendations() || null
  }, [contextSurfacer])

  // Predict next action
  const predictNextAction = useCallback(() => {
    return contextSurfacer?.predictNextAction() || []
  }, [contextSurfacer])

  // Auto-detect context changes from URL and user behavior
  useEffect(() => {
    if (!contextSurfacer) return

    const handleRouteChange = () => {
      const path = window.location.pathname
      
      // Detect domain based on current page
      let domain: UseCaseContext['domain'] = 'development'
      if (path.includes('/security')) domain = 'security'
      else if (path.includes('/analytics')) domain = 'analytics'
      else if (path.includes('/research')) domain = 'research'
      else if (path.includes('/automation')) domain = 'automation'

      // Detect scenario based on path
      let scenario = ''
      if (path.includes('/code-insights')) scenario = 'code-analysis'
      else if (path.includes('/performance-analytics')) scenario = 'performance-monitoring'
      else if (path.includes('/smart-suggestions')) scenario = 'intelligent-suggestions'
      else if (path.includes('/algorithmic-tools')) scenario = 'algorithmic-problem-solving'

      updateUseCaseContext({ domain, scenario })
    }

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    handleRouteChange() // Initial call

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [contextSurfacer, updateUseCaseContext])

  // Auto-detect user activity patterns
  useEffect(() => {
    if (!contextSurfacer) return

    let activityTimer: NodeJS.Timeout
    let lastActivity = Date.now()

    const handleActivity = () => {
      lastActivity = Date.now()
      
      // Clear existing timer
      clearTimeout(activityTimer)
      
      // Set new timer to detect inactivity
      activityTimer = setTimeout(() => {
        const inactiveTime = Date.now() - lastActivity
        
        // If inactive for more than 5 minutes, reduce urgency
        if (inactiveTime > 5 * 60 * 1000) {
          updateUserContext({ urgency: 'low' })
        }
      }, 5 * 60 * 1000)
    }

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      clearTimeout(activityTimer)
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [contextSurfacer, updateUserContext])

  const contextValue: ContextSurfacerContextType = {
    contextSurfacer: contextSurfacer!,
    guidance: guidance!,
    adaptiveState: adaptiveState!,
    updateUserContext,
    updateAgenticContext,
    updateUseCaseContext,
    getContextSummary,
    getContextualRecommendations,
    predictNextAction,
    isLoading,
    error
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Context Surfacer Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <ContextSurfacerContext.Provider value={contextValue}>
      {children}
    </ContextSurfacerContext.Provider>
  )
}

export function useContextSurfacer() {
  const context = useContext(ContextSurfacerContext)
  if (!context) {
    throw new Error('useContextSurfacer must be used within a ContextSurfacerProvider')
  }
  return context
}

// Convenience hooks for specific context types
export function useUserContext() {
  const { contextSurfacer, updateUserContext } = useContextSurfacer()
  return {
    userContext: contextSurfacer.getContextSummary().user,
    updateUserContext
  }
}

export function useAgenticContext() {
  const { contextSurfacer, updateAgenticContext } = useContextSurfacer()
  return {
    agenticContext: contextSurfacer.getContextSummary().agentic,
    updateAgenticContext
  }
}

export function useUseCaseContext() {
  const { contextSurfacer, updateUseCaseContext } = useContextSurfacer()
  return {
    useCaseContext: contextSurfacer.getContextSummary().useCase,
    updateUseCaseContext
  }
}

export function useAdaptiveUI() {
  const { adaptiveState } = useContextSurfacer()
  return adaptiveState
}

export function useContextualGuidance() {
  const { guidance } = useContextSurfacer()
  return guidance
}
