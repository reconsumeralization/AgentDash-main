"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Badge } from "@/components/ui"
import { 
  Brain, 
  Eye, 
  Settings, 
  Activity, 
  Target,
  Sparkles,
  Zap,
  User,
  Bot,
  Code,
  AlertTriangle
} from "lucide-react"
import { ContextSurfacerProvider } from '@/lib'
import { ContextAwareUI } from '@/components/context-aware-ui'
import { ContextDetector, ContextHistory } from '@/components/context-detector'
import { AdaptiveLayout, ContextAwareSidebar, ContextAwareToolbar } from '@/components/context-aware-ui'
import { ContextualChat } from '@/components/contextual-chat'
import { ContextualThemeProvider, ContextualComponent } from '@/components/contextual-theme-provider'

// Mock initial contexts for demonstration
const initialUserContext = {
  id: 'demo-user',
  role: 'developer' as const,
  expertise: 'intermediate' as const,
  currentTask: 'Implementing context-aware UI system',
  sessionHistory: ['opened-context-surfacer', 'analyzed-ui-components', 'configured-adaptations'],
  preferences: {
    theme: 'auto' as const,
    complexity: 'detailed' as const,
    guidance: 'moderate' as const,
    notifications: true,
    autoSuggestions: true,
    contextualHelp: true
  },
  environment: 'development' as const,
  urgency: 'medium' as const
}

const initialAgenticContext = {
  activeAgents: ['ui-analyzer', 'context-detector', 'guidance-generator'],
  agentCapabilities: {
    'ui-analyzer': ['layout-optimization', 'accessibility-check', 'performance-analysis'],
    'context-detector': ['user-behavior-analysis', 'workflow-prediction', 'context-switching'],
    'guidance-generator': ['suggestion-generation', 'tip-creation', 'shortcut-recommendation']
  },
  currentWorkflow: 'context-surfacer-development',
  workflowStage: 'execution' as const,
  collaborationMode: 'individual' as const,
  aiAssistance: 'automation' as const
}

const initialUseCaseContext = {
  domain: 'development' as const,
  scenario: 'intelligent-ui-development',
  complexity: 'complex' as const,
  timeConstraint: 'unlimited' as const,
  dataSensitivity: 'internal' as const,
  collaboration: 'solo' as const
}

export default function ContextSurfacerPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showDetails, setShowDetails] = useState(false)

  return (
    <ContextSurfacerProvider
      initialUserContext={initialUserContext}
      initialAgenticContext={initialAgenticContext}
      initialUseCaseContext={initialUseCaseContext}
    >
      <ContextualThemeProvider>
        <AdaptiveLayout className="min-h-screen bg-background">
        <div className="flex flex-col h-screen">
          {/* Context-Aware Toolbar */}
          <ContextAwareToolbar className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-semibold">Context Surfacer</h1>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </ContextAwareToolbar>

          <div className="flex flex-1 overflow-hidden">
            {/* Context-Aware Sidebar */}
            <ContextAwareSidebar className="border-r bg-muted/50">
              <div className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="guidance" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Guidance
                    </TabsTrigger>
                    <TabsTrigger value="analysis" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Analysis
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </ContextAwareSidebar>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="mb-6">
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive-foreground"
                  >
                    <p className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Security patch applied: run/stop controls keep tooltips in sync
                    </p>
                    <p className="text-destructive-foreground/80">
                      Buttons in this workspace now mirror their visible labels into aria-label and title attributes automatically, closing the hesitation window that attackers exploited through stale "Run" tooltips.
                    </p>
                  </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Context Overview */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            Context Overview
                          </CardTitle>
                          <CardDescription>
                            Current system state and adaptive configurations
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">User</span>
                              </div>
                              <div className="space-y-1">
                                <Badge variant="outline">Developer</Badge>
                                <Badge variant="secondary">Intermediate</Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Agents</span>
                              </div>
                              <div className="space-y-1">
                                <Badge variant="outline">3 Active</Badge>
                                <Badge variant="secondary">Automation</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium">Use Case</span>
                            </div>
                            <div className="space-y-1">
                              <Badge variant="outline">Development</Badge>
                              <Badge variant="secondary">Complex</Badge>
                              <Badge variant="outline">Internal</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Actions */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Quick Actions
                          </CardTitle>
                          <CardDescription>
                            Context-aware actions and shortcuts
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button className="w-full justify-start" variant="outline">
                            <Code className="h-4 w-4 mr-2" />
                            Analyze Code Quality
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Get Smart Suggestions
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <Target className="h-4 w-4 mr-2" />
                            Optimize Workflow
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure Context
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Context-Aware UI Component */}
                    <ContextAwareUI />
                  </TabsContent>

                  <TabsContent value="guidance" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Intelligent Guidance System
                        </CardTitle>
                        <CardDescription>
                          AI-powered contextual suggestions, tips, and recommendations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ContextAwareUI />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-6">
                    <ContextDetector showDetails={showDetails} />
                  </TabsContent>

                  <TabsContent value="history" className="space-y-6">
                    <ContextHistory />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contextual Chat Integration */}
        <ContextualChat 
          position="bottom-right"
          persistent={true}
        />
      </AdaptiveLayout>
      </ContextualThemeProvider>
    </ContextSurfacerProvider>
  )
}
