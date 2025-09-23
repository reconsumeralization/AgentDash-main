"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Search, 
  Brain, 
  Database, 
  Zap, 
  Star, 
  MoreHorizontal,
  Edit,
  Trash2,
  Link,
  Unlink,
  Settings,
  TrendingUp,
  Clock,
  Target,
  Filter,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { Agent, KnowledgeBase, AgentKnowledgeAttachment, KnowledgeRecommendation } from '@/lib/supabase'
import { getSocialSkin } from '@/lib/social-skins'
import { cn } from '@/lib/utils'

interface AgentKnowledgeAttachmentManagerProps {
  userId: string
}

export function AgentKnowledgeAttachmentManager({ userId, platform = 'linkedin' }: AgentKnowledgeAttachmentManagerProps & { platform?: string }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [attachments, setAttachments] = useState<AgentKnowledgeAttachment[]>([])
  const [recommendations, setRecommendations] = useState<KnowledgeRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false)
  const [selectedKbForAttachment, setSelectedKbForAttachment] = useState<string>('')
  const [attachmentType, setAttachmentType] = useState<'full' | 'filtered' | 'selected_items'>('full')
  const [attachmentPriority, setAttachmentPriority] = useState(1)
  const skin = getSocialSkin(platform)
  const cardClassName = (...classes: string[]) => cn(skin.card, ...classes)

  // Load agents
  const loadAgents = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents?userId=${userId}`)
      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Error loading agents:', error)
    }
  }, [userId])

  // Load knowledge bases
  const loadKnowledgeBases = useCallback(async () => {
    try {
      const response = await fetch(`/api/knowledge-bases?userId=${userId}`)
      const data = await response.json()
      setKnowledgeBases(data.knowledgeBases || [])
    } catch (error) {
      console.error('Error loading knowledge bases:', error)
    }
  }, [userId])

  // Load agent attachments
  const loadAgentAttachments = useCallback(async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/knowledge-attachments`)
      const data = await response.json()
      setAttachments(data.attachments || [])
    } catch (error) {
      console.error('Error loading agent attachments:', error)
    }
  }, [])

  // Load recommendations
  const loadRecommendations = useCallback(async (agentId?: string) => {
    try {
      const url = agentId 
        ? `/api/knowledge-recommendations?userId=${userId}&agentId=${agentId}`
        : `/api/knowledge-recommendations?userId=${userId}`
      const response = await fetch(url)
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }, [userId])

  // Generate AI recommendations
  const generateRecommendations = async (agentId: string) => {
    try {
      const response = await fetch('/api/knowledge-recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          agentId,
          context: {
            timestamp: new Date().toISOString(),
            action: 'manual_generation'
          }
        })
      })

      if (response.ok) {
        await loadRecommendations(agentId)
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
    }
  }

  // Attach knowledge base to agent
  const attachKnowledgeBase = async () => {
    if (!selectedAgent || !selectedKbForAttachment) return

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}/knowledge-attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knowledge_base_id: selectedKbForAttachment,
          attachment_type: attachmentType,
          attachment_priority: attachmentPriority,
          is_auto_attached: false,
          attachment_reason: 'Manually attached by user'
        })
      })

      if (response.ok) {
        await loadAgentAttachments(selectedAgent.id)
        setIsAttachDialogOpen(false)
        setSelectedKbForAttachment('')
        setAttachmentType('full')
        setAttachmentPriority(1)
      }
    } catch (error) {
      console.error('Error attaching knowledge base:', error)
    }
  }

  // Detach knowledge base from agent
  const detachKnowledgeBase = async (attachmentId: string) => {
    if (!selectedAgent) return

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}/knowledge-attachments/${attachmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadAgentAttachments(selectedAgent.id)
      }
    } catch (error) {
      console.error('Error detaching knowledge base:', error)
    }
  }

  // Apply recommendation
  const applyRecommendation = async (recommendation: KnowledgeRecommendation) => {
    if (!selectedAgent) return

    try {
      if (recommendation.recommendation_type === 'suggest_attach') {
        const response = await fetch(`/api/agents/${selectedAgent.id}/knowledge-attachments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            knowledge_base_id: recommendation.knowledge_base_id,
            attachment_type: 'full',
            attachment_priority: Math.round(recommendation.confidence_score * 10),
            is_auto_attached: true,
            attachment_reason: recommendation.reasoning
          })
        })

        if (response.ok) {
          await loadAgentAttachments(selectedAgent.id)
          await loadRecommendations(selectedAgent.id)
        }
      }
    } catch (error) {
      console.error('Error applying recommendation:', error)
    }
  }

  useEffect(() => {
    loadAgents()
    loadKnowledgeBases()
  }, [loadAgents, loadKnowledgeBases])

  useEffect(() => {
    if (selectedAgent) {
      loadAgentAttachments(selectedAgent.id)
      loadRecommendations(selectedAgent.id)
    }
  }, [selectedAgent, loadAgentAttachments, loadRecommendations])

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'research':
        return <Search className="h-4 w-4" />
      case 'expert':
        return <Star className="h-4 w-4" />
      case 'analysis':
        return <TrendingUp className="h-4 w-4" />
      case 'context':
        return <Target className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getAttachmentTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-green-100 text-green-800'
      case 'filtered':
        return 'bg-yellow-100 text-yellow-800'
      case 'selected_items':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={cn('space-y-6', skin.surfaceMuted)}> 
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Knowledge Attachments</h2>
          <p className="text-muted-foreground">Manage which knowledge bases are attached to your agents</p>
        </div>
        {selectedAgent && (
          <Button onClick={() => generateRecommendations(selectedAgent.id)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate AI Recommendations
          </Button>
        )}
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="attachments">Current Attachments</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card 
                key={agent.id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={cn(skin.tabTrigger, 'flex items-center gap-2')}>
                      {getAgentTypeIcon(agent.type)}
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{agent.type}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {agent.system_prompt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      {agent.usage_count} uses
                    </div>
                    {agent.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 3).map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          {selectedAgent ? (
            <div className="space-y-4">
              {/* Attach New Knowledge Base */}
               <Card className={cardClassName()}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={cn(skin.tabTrigger, 'flex items-center gap-2')}>
                        <Link className="h-5 w-5" />
                        Attach Knowledge Base to {selectedAgent.name}
                      </CardTitle>
                      <CardDescription>
                        Connect knowledge bases to enhance your agent's capabilities
                      </CardDescription>
                    </div>
                    <Dialog open={isAttachDialogOpen} onOpenChange={setIsAttachDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Attach Knowledge Base
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Attach Knowledge Base</DialogTitle>
                          <DialogDescription>
                            Select a knowledge base to attach to {selectedAgent.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="knowledgeBase">Knowledge Base</Label>
                            <Select value={selectedKbForAttachment} onValueChange={setSelectedKbForAttachment}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a knowledge base" />
                              </SelectTrigger>
                              <SelectContent>
                                {knowledgeBases
                                  .filter(kb => !attachments.some(att => att.knowledge_base_id === kb.id))
                                  .map((kb) => (
                                    <SelectItem key={kb.id} value={kb.id}>
                                      {kb.name} ({kb.category})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="attachmentType">Attachment Type</Label>
                            <Select value={attachmentType} onValueChange={(value: any) => setAttachmentType(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">Full Access</SelectItem>
                                <SelectItem value="filtered">Filtered Access</SelectItem>
                                <SelectItem value="selected_items">Selected Items Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="priority">Priority (1-10)</Label>
                            <Select value={attachmentPriority.toString()} onValueChange={(value) => setAttachmentPriority(parseInt(value))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={attachKnowledgeBase} className="w-full">
                            Attach Knowledge Base
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
              </Card>

              {/* Current Attachments */}
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <Card key={attachment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Database className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">
                              {(attachment as any).knowledge_bases?.name || 'Unknown Knowledge Base'}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge className={getAttachmentTypeColor(attachment.attachment_type)}>
                                {attachment.attachment_type}
                              </Badge>
                              <span>Priority: {attachment.attachment_priority}</span>
                              <span>•</span>
                              <span>{attachment.usage_count} uses</span>
                              {attachment.is_auto_attached && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI Suggested
                                  </Badge>
                                </>
                              )}
                            </div>
                            {attachment.attachment_reason && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {attachment.attachment_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Unlink className="h-4 w-4 mr-2" />
                              Detach
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select an Agent</h3>
              <p className="text-muted-foreground">
                Choose an agent from the Agents tab to manage its knowledge base attachments
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {selectedAgent ? (
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                <div className="space-y-2">
                  {recommendations.map((recommendation) => (
                    <Card key={recommendation.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(skin.tabTrigger, 'flex items-center gap-2')}>
                              {recommendation.recommendation_type === 'suggest_attach' ? (
                                <Link className="h-5 w-5 text-green-600" />
                              ) : (
                                <Unlink className="h-5 w-5 text-red-600" />
                              )}
                              <div>
                                <h4 className="font-medium">
                                  {(recommendation as any).knowledge_bases?.name || 'Unknown Knowledge Base'}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Badge variant="outline">
                                    {(recommendation as any).knowledge_bases?.category}
                                  </Badge>
                                  <span className={getConfidenceColor(recommendation.confidence_score)}>
                                    {Math.round(recommendation.confidence_score * 100)}% confidence
                                  </span>
                                  {recommendation.is_applied && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline" className="text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Applied
                                      </Badge>
                                    </>
                                  )}
                                </div>
                                {recommendation.reasoning && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {recommendation.reasoning}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={cn(skin.tabTrigger, 'flex items-center gap-2')}>
                            {!recommendation.is_applied && recommendation.recommendation_type === 'suggest_attach' && (
                              <Button 
                                size="sm" 
                                onClick={() => applyRecommendation(recommendation)}
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Apply
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Info className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Lightbulb className="h-4 w-4 mr-2" />
                                  Regenerate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI recommendations to discover which knowledge bases would be most helpful for this agent
                  </p>
                  <Button onClick={() => generateRecommendations(selectedAgent.id)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Recommendations
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select an Agent</h3>
              <p className="text-muted-foreground">
                Choose an agent from the Agents tab to view AI recommendations
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
