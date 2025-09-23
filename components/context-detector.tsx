"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { 
  Brain, 
  Eye, 
  Activity, 
  Target, 
  Zap, 
  Clock,
  User,
  Bot,
  Code,
  Shield,
  TrendingUp,
  Settings,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib"
import { useContextSurfacer } from '@/lib'

interface ContextDetectorProps {
  className?: string
  showDetails?: boolean
}

export function ContextDetector({ className, showDetails = false }: ContextDetectorProps) {
  const { 
    contextSurfacer, 
    getContextSummary, 
    getContextualRecommendations,
    predictNextAction 
  } = useContextSurfacer()
  
  const [contextSummary, setContextSummary] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [predictedActions, setPredictedActions] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const analyzeContext = useCallback(async () => {
    if (!contextSurfacer) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          return 100
        }
        return prev + 10
      })
    }, 100)

    // Get context data
    const summary = getContextSummary()
    const recs = getContextualRecommendations()
    const actions = predictNextAction()

    setContextSummary(summary)
    setRecommendations(recs)
    setPredictedActions(actions)
  }, [contextSurfacer, getContextSummary, getContextualRecommendations, predictNextAction])

  useEffect(() => {
    analyzeContext()
  }, [analyzeContext])

  if (!contextSummary) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { user, agentic, useCase, adaptive } = contextSummary

  return (
    <div className={cn("space-y-4", className)}>
      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <div className="flex-1">
                <div className="text-sm font-medium">Analyzing Context</div>
                <Progress value={analysisProgress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Context Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Context Analysis
          </CardTitle>
          <CardDescription>
            Current user context and adaptive UI state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">User Profile</span>
              </div>
              <div className="space-y-1">
                <Badge variant="outline">{user.role}</Badge>
                <Badge variant="secondary">{user.expertise}</Badge>
                <Badge variant={user.urgency === 'critical' ? 'destructive' : 'outline'}>
                  {user.urgency} urgency
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Agentic State</span>
              </div>
              <div className="space-y-1">
                <Badge variant="outline">{agentic.collaborationMode}</Badge>
                <Badge variant="secondary">{agentic.workflowStage}</Badge>
                <Badge variant="outline">{agentic.aiAssistance}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Use Case</span>
              </div>
              <div className="space-y-1">
                <Badge variant="outline">{useCase.domain}</Badge>
                <Badge variant="secondary">{useCase.complexity}</Badge>
                <Badge variant="outline">{useCase.dataSensitivity}</Badge>
              </div>
            </div>
          </div>

          {/* Adaptive UI State */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Adaptive UI State</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="text-xs">
                <div className="text-muted-foreground">Layout</div>
                <Badge variant="outline" className="text-xs">{adaptive.layout}</Badge>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Sidebar</div>
                <Badge variant="outline" className="text-xs">{adaptive.sidebar}</Badge>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Toolbar</div>
                <Badge variant="outline" className="text-xs">{adaptive.toolbar}</Badge>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Guidance</div>
                <Badge variant="outline" className="text-xs">{adaptive.guidance}</Badge>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Complexity</div>
                <Badge variant="outline" className="text-xs">{adaptive.complexity}</Badge>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Notifications</div>
                <Badge variant="outline" className="text-xs">{adaptive.notifications}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      {showDetails && (
        <>
          {/* Recommendations */}
          {recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.immediate && recommendations.immediate.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      Immediate Actions
                    </div>
                    <div className="space-y-1">
                      {recommendations.immediate.map((rec: string, index: number) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.shortTerm && recommendations.shortTerm.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-yellow-500" />
                      Short Term
                    </div>
                    <div className="space-y-1">
                      {recommendations.shortTerm.map((rec: string, index: number) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.longTerm && recommendations.longTerm.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Long Term
                    </div>
                    <div className="space-y-1">
                      {recommendations.longTerm.map((rec: string, index: number) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Predicted Actions */}
          {predictedActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Predicted Next Actions
                </CardTitle>
                <CardDescription>
                  AI-predicted actions based on current context
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predictedActions.map((action, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <div className="text-sm font-medium">{action}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Context Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Context Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.sessionHistory.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Session Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {agentic.activeAgents.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {useCase.complexity === 'simple' ? 1 : useCase.complexity === 'moderate' ? 2 : 3}
                  </div>
                  <div className="text-xs text-muted-foreground">Complexity Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {user.urgency === 'low' ? 1 : user.urgency === 'medium' ? 2 : user.urgency === 'high' ? 3 : 4}
                  </div>
                  <div className="text-xs text-muted-foreground">Urgency Level</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={analyzeContext}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
          Refresh Analysis
        </Button>
      </div>
    </div>
  )
}

// Context History Component
export function ContextHistory({ className }: { className?: string }) {
  const { contextSurfacer } = useContextSurfacer()
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (contextSurfacer) {
      setHistory(contextSurfacer.getContextHistory())
    }
  }, [contextSurfacer])

  if (history.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Context History
        </CardTitle>
        <CardDescription>
          Recent context changes and adaptations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {history.slice(-10).reverse().map((entry, index) => (
            <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
              <div className="flex-shrink-0">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {entry.action} - {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Object.keys(entry.context).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
