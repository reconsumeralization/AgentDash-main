"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Alert, AlertDescription } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { 
  Bell, 
  Lightbulb, 
  AlertTriangle, 
  Zap, 
  Target, 
  TrendingUp,
  Code,
  Shield,
  Bot,
  Sparkles,
  Clock,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib"
import { useContextSurfacer, useContextualGuidance, useAdaptiveUI } from '@/lib'

interface ContextAwareUIProps {
  className?: string
}

export function ContextAwareUI({ className }: ContextAwareUIProps) {
  const { guidance, adaptiveState } = useContextSurfacer()
  const [isExpanded, setIsExpanded] = useState(false)
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set())

  const handleDismiss = (id: string) => {
    setDismissedItems(prev => new Set([...prev, id]))
  }

  const handleSuggestionClick = (action: string) => {
    if (action.startsWith('navigate:')) {
      const path = action.replace('navigate:', '')
      window.location.href = path
    }
  }

  if (!guidance || !adaptiveState) {
    return null
  }

  // Filter out dismissed items
  const activeSuggestions = guidance.suggestions.filter(s => !dismissedItems.has(s.id))
  const activeWarnings = guidance.warnings.filter(w => !dismissedItems.has(w.id))
  const activeTips = guidance.tips.filter(t => !dismissedItems.has(t.id))

  // Don't show if no active items and guidance is set to hidden
  if (adaptiveState.guidance === 'hidden' || 
      (activeSuggestions.length === 0 && activeWarnings.length === 0 && activeTips.length === 0)) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Contextual Warnings */}
      {activeWarnings.length > 0 && adaptiveState.notifications !== 'none' && (
        <div className="space-y-2">
          {activeWarnings.map((warning) => (
            <Alert 
              key={warning.id} 
              variant={warning.severity === 'critical' ? 'destructive' : 'default'}
              className={cn(
                "border-l-4",
                warning.severity === 'critical' && "border-red-500",
                warning.severity === 'error' && "border-orange-500",
                warning.severity === 'warning' && "border-yellow-500",
                warning.severity === 'info' && "border-blue-500"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{warning.message}</div>
                  {warning.recommendation && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {warning.recommendation}
                    </div>
                  )}
                </div>
                {warning.dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(warning.id)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Context Panel */}
      <Card className={cn(
        "transition-all duration-300",
        adaptiveState.guidance === 'immersive' && "border-primary shadow-lg",
        adaptiveState.guidance === 'prominent' && "border-primary/50 shadow-md",
        adaptiveState.guidance === 'subtle' && "border-border shadow-sm"
      )}>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Contextual Guidance</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {activeSuggestions.length + activeTips.length} items
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <CardDescription>
            AI-powered suggestions based on your current context and workflow
          </CardDescription>
        </CardHeader>

        {isExpanded && (
          <CardContent>
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestions" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Suggestions ({activeSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Tips ({activeTips.length})
                </TabsTrigger>
                <TabsTrigger value="shortcuts" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Shortcuts ({guidance.shortcuts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="suggestions" className="space-y-3 mt-4">
                {activeSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No suggestions available at the moment</p>
                  </div>
                ) : (
                  activeSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              suggestion.type === 'feature' && "bg-blue-100 dark:bg-blue-900",
                              suggestion.type === 'workflow' && "bg-green-100 dark:bg-green-900",
                              suggestion.type === 'optimization' && "bg-yellow-100 dark:bg-yellow-900",
                              suggestion.type === 'security' && "bg-red-100 dark:bg-red-900",
                              suggestion.type === 'collaboration' && "bg-purple-100 dark:bg-purple-900"
                            )}>
                              {suggestion.type === 'feature' && <Code className="h-4 w-4 text-blue-600" />}
                              {suggestion.type === 'workflow' && <Bot className="h-4 w-4 text-green-600" />}
                              {suggestion.type === 'optimization' && <TrendingUp className="h-4 w-4 text-yellow-600" />}
                              {suggestion.type === 'security' && <Shield className="h-4 w-4 text-red-600" />}
                              {suggestion.type === 'collaboration' && <Target className="h-4 w-4 text-purple-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{suggestion.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {suggestion.description}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant={suggestion.priority === 'critical' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {suggestion.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(suggestion.confidence * 100)}% confidence
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion.action)}
                              className="flex items-center gap-1"
                            >
                              <Zap className="h-3 w-3" />
                              Try
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismiss(suggestion.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="tips" className="space-y-3 mt-4">
                {activeTips.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tips available at the moment</p>
                  </div>
                ) : (
                  activeTips.map((tip) => (
                    <Card key={tip.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <HelpCircle className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{tip.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {tip.content}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {tip.category}
                              </Badge>
                              {tip.learned && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Learned
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(tip.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="shortcuts" className="space-y-3 mt-4">
                {guidance.shortcuts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No shortcuts available at the moment</p>
                  </div>
                ) : (
                  guidance.shortcuts.map((shortcut) => (
                    <Card key={shortcut.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{shortcut.action}</div>
                              <div className="text-sm text-muted-foreground">
                                {shortcut.description}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {shortcut.context.map((ctx) => (
                                  <Badge key={ctx} variant="outline" className="text-xs">
                                    {ctx}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="font-mono text-sm">
                              {shortcut.shortcut}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round(shortcut.frequency * 100)}% usage
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>

      {/* Next Steps */}
      {guidance.nextSteps.length > 0 && adaptiveState.guidance !== 'hidden' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {guidance.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                  </div>
                  <div className="text-sm">{step}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Adaptive Layout Component
export function AdaptiveLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  const adaptiveState = useAdaptiveUI()

  if (!adaptiveState) {
    return <div className={className}>{children}</div>
  }

  const layoutClasses = {
    compact: "max-w-4xl mx-auto",
    standard: "max-w-6xl mx-auto",
    expanded: "max-w-7xl mx-auto",
    expert: "max-w-full mx-auto"
  }

  return (
    <div className={cn(layoutClasses[adaptiveState.layout], className)}>
      {children}
    </div>
  )
}

// Context-Aware Sidebar
export function ContextAwareSidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const adaptiveState = useAdaptiveUI()

  if (!adaptiveState) {
    return <aside className={className}>{children}</aside>
  }

  const sidebarClasses = {
    collapsed: "w-16",
    minimal: "w-48",
    standard: "w-64",
    detailed: "w-80"
  }

  return (
    <aside className={cn(
      "transition-all duration-300",
      sidebarClasses[adaptiveState.sidebar],
      className
    )}>
      {children}
    </aside>
  )
}

// Context-Aware Toolbar
export function ContextAwareToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  const adaptiveState = useAdaptiveUI()

  if (!adaptiveState) {
    return <div className={className}>{children}</div>
  }

  const toolbarClasses = {
    minimal: "h-12",
    standard: "h-16",
    advanced: "h-20",
    expert: "h-24"
  }

  return (
    <div className={cn(
      "transition-all duration-300",
      toolbarClasses[adaptiveState.toolbar],
      className
    )}>
      {children}
    </div>
  )
}
