"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Workflow } from '@/lib'

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  completedAt?: string
  progress: number
  currentStep?: string
  results?: Record<string, any>
  error?: string
}

interface WorkflowContextType {
  workflows: Workflow[]
  runningWorkflows: WorkflowExecution[]
  loading: boolean
  error: string | null
  refreshWorkflows: () => Promise<void>
  createWorkflow: (data: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>
  executeWorkflow: (workflowId: string) => Promise<void>
  stopWorkflow: (executionId: string) => Promise<void>
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

interface WorkflowProviderProps {
  children: ReactNode
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [runningWorkflows, setRunningWorkflows] = useState<WorkflowExecution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshWorkflows = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock workflows data
      const mockWorkflows: Workflow[] = [
        {
          id: 'workflow-1',
          user_id: 'demo-user-1',
          name: 'Content Creation Pipeline',
          description: 'Automated blog post generation and publishing workflow',
          steps: [
            { id: 'research', type: 'research', name: 'Research Topic', config: { sources: ['web', 'api'] } },
            { id: 'generate', type: 'ai', name: 'Generate Content', config: { model: 'gpt-4', length: 1500 } },
            { id: 'edit', type: 'ai', name: 'Edit & Polish', config: { style: 'professional' } },
            { id: 'publish', type: 'api', name: 'Publish to CMS', config: { platform: 'wordpress' } }
          ],
          aspiration_focus: ['content-creation', 'ai-writing'],
          tribe_id: undefined,
          is_template: false,
          usage_count: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'workflow-2',
          user_id: 'demo-user-1',
          name: 'Lead Generation Automation',
          description: 'Automated prospect research and outreach sequencing',
          steps: [
            { id: 'research', type: 'research', name: 'Find Prospects', config: { criteria: 'tech-leaders' } },
            { id: 'enrich', type: 'api', name: 'Enrich Data', config: { sources: ['linkedin', 'company'] } },
            { id: 'score', type: 'ai', name: 'Score & Prioritize', config: { algorithm: 'compatibility' } },
            { id: 'sequence', type: 'email', name: 'Outreach Sequence', config: { template: 'personalized' } }
          ],
          aspiration_focus: ['lead-generation', 'sales-automation'],
          tribe_id: undefined,
          is_template: false,
          usage_count: 78,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'workflow-3',
          user_id: 'demo-user-1',
          name: 'Data Analysis Suite',
          description: 'Comprehensive data processing and visualization pipeline',
          steps: [
            { id: 'extract', type: 'api', name: 'Extract Data', config: { source: 'database' } },
            { id: 'transform', type: 'ai', name: 'Transform & Clean', config: { rules: 'standard' } },
            { id: 'analyze', type: 'ai', name: 'Statistical Analysis', config: { methods: ['correlation', 'trends'] } },
            { id: 'visualize', type: 'api', name: 'Generate Charts', config: { format: 'interactive' } }
          ],
          aspiration_focus: ['data-analysis', 'business-intelligence'],
          tribe_id: undefined,
          is_template: true,
          usage_count: 123,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      setWorkflows(mockWorkflows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  const createWorkflow = async (data: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)

      const newWorkflow: Workflow = {
        ...data,
        id: `workflow-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setWorkflows(prev => [...prev, newWorkflow])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow')
    }
  }

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    try {
      setError(null)
      setWorkflows(prev =>
        prev.map(workflow =>
          workflow.id === id
            ? { ...workflow, ...updates, updated_at: new Date().toISOString() }
            : workflow
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow')
    }
  }

  const deleteWorkflow = async (id: string) => {
    try {
      setError(null)
      setWorkflows(prev => prev.filter(workflow => workflow.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow')
    }
  }

  const executeWorkflow = async (workflowId: string) => {
    try {
      setError(null)

      const execution: WorkflowExecution = {
        id: `exec-${Date.now()}`,
        workflowId,
        status: 'running',
        startedAt: new Date().toISOString(),
        progress: 0,
        currentStep: 'Initializing'
      }

      setRunningWorkflows(prev => [...prev, execution])

      // Simulate workflow execution
      setTimeout(() => {
        setRunningWorkflows(prev =>
          prev.map(exec =>
            exec.id === execution.id
              ? { ...exec, progress: 25, currentStep: 'Processing Step 1' }
              : exec
          )
        )
      }, 2000)

      setTimeout(() => {
        setRunningWorkflows(prev =>
          prev.map(exec =>
            exec.id === execution.id
              ? { ...exec, progress: 50, currentStep: 'Processing Step 2' }
              : exec
          )
        )
      }, 4000)

      setTimeout(() => {
        setRunningWorkflows(prev =>
          prev.map(exec =>
            exec.id === execution.id
              ? {
                  ...exec,
                  status: 'completed',
                  progress: 100,
                  completedAt: new Date().toISOString(),
                  currentStep: 'Completed'
                }
              : exec
          )
        )
      }, 6000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute workflow')
    }
  }

  const stopWorkflow = async (executionId: string) => {
    try {
      setError(null)
      setRunningWorkflows(prev =>
        prev.map(exec =>
          exec.id === executionId
            ? { ...exec, status: 'cancelled', completedAt: new Date().toISOString() }
            : exec
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop workflow')
    }
  }

  useEffect(() => {
    refreshWorkflows()
  }, [])

  const value: WorkflowContextType = {
    workflows,
    runningWorkflows,
    loading,
    error,
    refreshWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    stopWorkflow
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }
  return context
}
