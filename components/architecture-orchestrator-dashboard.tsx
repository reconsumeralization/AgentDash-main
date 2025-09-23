"use client"

/**
 * Architecture Orchestrator Dashboard
 * UI component for monitoring and controlling parallel architecture execution
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Network,
  Shield,
  Brain,
  Database,
  Smartphone
} from 'lucide-react'
import { orchestrator, useOrchestrator, type ArchitecturePortion } from '@/lib'

interface PortionCardProps {
  portion: ArchitecturePortion
  onForceExecute: (id: string) => void
  onReset: (id: string) => void
}

function PortionCard({ portion, onForceExecute, onReset }: PortionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'failed': return 'bg-red-500'
      case 'retrying': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4 animate-spin" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'retrying': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (id: string) => {
    if (id.includes('security') || id.includes('compliance')) return <Shield className="h-4 w-4" />
    if (id.includes('ai') || id.includes('intelligence') || id.includes('analytics')) return <Brain className="h-4 w-4" />
    if (id.includes('network') || id.includes('connector')) return <Network className="h-4 w-4" />
    if (id.includes('mobile') || id.includes('experience')) return <Smartphone className="h-4 w-4" />
    if (id.includes('data') || id.includes('storage')) return <Database className="h-4 w-4" />
    return <Cpu className="h-4 w-4" />
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(portion.id)}
            <CardTitle className="text-sm">{portion.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(portion.status)}
            <Badge className={getStatusColor(portion.status)}>
              {portion.status}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          {portion.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span>Priority: {portion.priority}</span>
            <span>Duration: {portion.estimatedDuration}m</span>
          </div>

          {portion.dependencies && portion.dependencies.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Dependencies: {portion.dependencies.join(', ')}
            </div>
          )}

          {portion.error && (
            <Alert className="py-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {portion.error}
              </AlertDescription>
            </Alert>
          )}

          {portion.retryCount > 0 && (
            <div className="text-xs text-muted-foreground">
              Retry attempts: {portion.retryCount}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onForceExecute(portion.id)}
              disabled={portion.status === 'in_progress'}
              className="text-xs"
            >
              Force Execute
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReset(portion.id)}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ArchitectureOrchestratorDashboard() {
  const { orchestrator, stats, startOrchestration, stopOrchestration, resetPortion, forceExecutePortion } = useOrchestrator()
  const [portions, setPortions] = useState<ArchitecturePortion[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    setPortions(orchestrator.getAllPortions())
  }, [orchestrator])

  const handleStartOrchestration = async () => {
    setIsRunning(true)
    try {
      await startOrchestration()
    } catch (error) {
      console.error('Failed to start orchestration:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleStopOrchestration = () => {
    stopOrchestration()
    setIsRunning(false)
  }

  const handleForceExecute = async (portionId: string) => {
    try {
      await forceExecutePortion(portionId)
      setPortions(orchestrator.getAllPortions()) // Refresh
    } catch (error) {
      console.error('Failed to force execute:', error)
    }
  }

  const handleReset = (portionId: string) => {
    resetPortion(portionId)
    setPortions(orchestrator.getAllPortions()) // Refresh
  }

  const getPortionsByCategory = (category: string) => {
    const categoryMappings: Record<string, string[]> = {
      infrastructure: ['linkedin-vdr-core', 'smart-permissions', 'network-intelligence', 'content-intelligence', 'deal-flow'],
      security: ['compliance-engine', 'security-framework', 'linkedin-auth'],
      intelligence: ['ai-agent-core', 'predictive-analytics', 'sentiment-analysis', 'relationship-mining'],
      integration: ['universal-connector', 'data-orchestrator', 'workflow-automation', 'notification-system'],
      experience: ['analytics-dashboard', 'user-experience-core', 'mobile-optimization', 'performance-monitoring']
    }
    return portions.filter(p => categoryMappings[category]?.includes(p.id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Architecture Orchestrator</h1>
          <p className="text-gray-400">Parallel execution of 20 architectural portions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{stats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <span className="text-sm text-muted-foreground">
                {stats.completed + stats.inProgress + stats.failed} / 20 portions
              </span>
            </div>
            <Progress
              value={(stats.completed / 20) * 100}
              className="h-3"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Completed: {stats.completed}</span>
              <span>Pending: {stats.pending}</span>
            </div>
          </CardContent>
        </Card>

        {/* Control Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={handleStartOrchestration}
            disabled={isRunning || !stats.pending}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Starting...' : 'Start Orchestration'}
          </Button>

          <Button
            onClick={handleStopOrchestration}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Pause className="h-4 w-4" />
            Stop Orchestration
          </Button>

          <Button
            onClick={() => setPortions(orchestrator.getAllPortions())}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Detailed View */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portions.map(portion => (
                <PortionCard
                  key={portion.id}
                  portion={portion}
                  onForceExecute={handleForceExecute}
                  onReset={handleReset}
                />
              ))}
            </div>
          </TabsContent>

          {['infrastructure', 'security', 'intelligence', 'integration', 'experience'].map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPortionsByCategory(category).map(portion => (
                  <PortionCard
                    key={portion.id}
                    portion={portion}
                    onForceExecute={handleForceExecute}
                    onReset={handleReset}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
