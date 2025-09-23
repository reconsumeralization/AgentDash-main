"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Brain,
  Database,
  Link,
  Unlink,
  Settings,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Users,
  User,
  Globe,
  Shield,
  Key,
  Clock,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  Folder,
  Archive,
  BookOpen,
  Lightbulb,
  Sparkles,
  Crown,
  Award,
  Trophy,
  Gem,
  Diamond,
  Medal,
  School,
  University,
  Library,
  Book,
  Notebook,
  Clipboard,
  ClipboardList,
  ClipboardCheck,
  ClipboardCopy,
  ClipboardPaste,
  ClipboardX,
  Scissors,
  Split,
  Merge,
  Combine,
  Anchor,
  Magnet,
  Paperclip,
  Pin,
  MapPin,
  Navigation,
  Compass,
  Moon,
  Sun,
  Stars,
  Rocket,
  Satellite,
  Bot,
  Cloud,
  Upload,
  Download,
  Move,
  Delete,
  Undo,
  Redo,
  Save,
  Table,
  Server,
  Database as DatabaseIcon
} from "lucide-react"
import {
  KnowledgeBase,
  Agent,
  AgentKnowledgeBase,
  AttachmentCondition,
  ATTACHMENT_TYPES
} from '@/lib/knowledge-base-types'
import {
  IntelligentKBSelector,
  KBSelectionContext,
  KBRelevanceScore,
  KBSelectionUtils
} from '@/lib/intelligent-kb-selector'

interface AgentKBAttachmentManagerProps {
  agent: Agent
  knowledgeBases: KnowledgeBase[]
  onUpdateAgent: (agent: Agent) => void
  className?: string
}

export function AgentKBAttachmentManager({
  agent,
  knowledgeBases,
  onUpdateAgent,
  className
}: AgentKBAttachmentManagerProps) {
  const [activeTab, setActiveTab] = useState('attached')
  const [isSelectingKB, setIsSelectingKB] = useState(false)
  const [isConfiguringAttachment, setIsConfiguringAttachment] = useState(false)
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [selectedAttachment, setSelectedAttachment] = useState<AgentKnowledgeBase | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isIntelligentSelection, setIsIntelligentSelection] = useState(false)
  const [intelligentResults, setIntelligentResults] = useState<KBRelevanceScore[]>([])
  const [selectionContext, setSelectionContext] = useState<KBSelectionContext>({
    userQuery: '',
    userRole: 'user',
    projectContext: '',
    currentTask: ''
  })

  const kbSelector = useMemo(() => new IntelligentKBSelector(knowledgeBases, [agent]), [knowledgeBases, agent])

  const attachedKBs = agent.knowledgeBases.map(akb => {
    const kb = knowledgeBases.find(k => k.id === akb.knowledgeBaseId)
    return { ...akb, knowledgeBase: kb }
  }).filter(item => item.knowledgeBase)

  const availableKBs = knowledgeBases.filter(kb => 
    !agent.knowledgeBases.some(akb => akb.knowledgeBaseId === kb.id)
  )

  const filteredAvailableKBs = availableKBs.filter(kb => {
    const matchesSearch = kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kb.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === 'all' || kb.type === filterType
    
    return matchesSearch && matchesType
  })

  const handleAttachKB = useCallback(async (kbId: string, attachmentType: string = ATTACHMENT_TYPES.CONTEXTUAL) => {
    const newAttachment: AgentKnowledgeBase = {
      knowledgeBaseId: kbId,
      attachmentType: attachmentType as any,
      priority: agent.knowledgeBases.length + 1,
      isActive: true,
      attachedAt: new Date(),
      attachedBy: 'current-user'
    }

    const updatedAgent = {
      ...agent,
      knowledgeBases: [...agent.knowledgeBases, newAttachment]
    }

    onUpdateAgent(updatedAgent)
  }, [agent, onUpdateAgent])

  const handleDetachKB = useCallback((kbId: string) => {
    const updatedAgent = {
      ...agent,
      knowledgeBases: agent.knowledgeBases.filter(akb => akb.knowledgeBaseId !== kbId)
    }

    onUpdateAgent(updatedAgent)
  }, [agent, onUpdateAgent])

  const handleUpdateAttachment = useCallback((kbId: string, updates: Partial<AgentKnowledgeBase>) => {
    const updatedAgent = {
      ...agent,
      knowledgeBases: agent.knowledgeBases.map(akb => 
        akb.knowledgeBaseId === kbId ? { ...akb, ...updates } : akb
      )
    }

    onUpdateAgent(updatedAgent)
  }, [agent, onUpdateAgent])

  const handleIntelligentSelection = useCallback(async () => {
    if (!selectionContext.userQuery.trim()) {
      alert('Please enter a query to perform intelligent selection')
      return
    }

    setIsIntelligentSelection(true)
    try {
      const results = await kbSelector.selectKnowledgeBases(agent.id, selectionContext)
      setIntelligentResults(results.selectedKnowledgeBases.map((kb: { knowledgeBaseId: string; relevanceScore: number; reasoning: string; suggestedAttachmentType: string }) => ({
        knowledgeBaseId: kb.knowledgeBaseId,
        score: kb.relevanceScore,
        reasoning: kb.reasoning,
        matchedKeywords: [],
        confidence: results.confidence,
        suggestedAttachmentType: kb.suggestedAttachmentType
      })))
    } catch (error) {
      console.error('Intelligent selection failed:', error)
      alert('Intelligent selection failed. Please try again.')
    } finally {
      setIsIntelligentSelection(false)
    }
  }, [agent.id, selectionContext, kbSelector])

  const handleApplyIntelligentSelection = useCallback((kbId: string, attachmentType: string) => {
    handleAttachKB(kbId, attachmentType)
    setIntelligentResults(prev => prev.filter(result => result.knowledgeBaseId !== kbId))
  }, [handleAttachKB])

  const getAttachmentTypeIcon = (type: string) => {
    switch (type) {
      case ATTACHMENT_TYPES.FULL_ACCESS: return <Unlock className="h-4 w-4" />
      case ATTACHMENT_TYPES.READ_ONLY: return <Eye className="h-4 w-4" />
      case ATTACHMENT_TYPES.CONTEXTUAL: return <Target className="h-4 w-4" />
      case ATTACHMENT_TYPES.CONDITIONAL: return <Settings className="h-4 w-4" />
      default: return <Link className="h-4 w-4" />
    }
  }

  const getAttachmentTypeColor = (type: string) => {
    switch (type) {
      case ATTACHMENT_TYPES.FULL_ACCESS: return 'bg-green-500'
      case ATTACHMENT_TYPES.READ_ONLY: return 'bg-blue-500'
      case ATTACHMENT_TYPES.CONTEXTUAL: return 'bg-yellow-500'
      case ATTACHMENT_TYPES.CONDITIONAL: return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getAttachmentTypeDescription = (type: string) => {
    switch (type) {
      case ATTACHMENT_TYPES.FULL_ACCESS: return 'Full access to all content and capabilities'
      case ATTACHMENT_TYPES.READ_ONLY: return 'Read-only access to content'
      case ATTACHMENT_TYPES.CONTEXTUAL: return 'Access based on context and relevance'
      case ATTACHMENT_TYPES.CONDITIONAL: return 'Access based on specific conditions'
      default: return 'Unknown attachment type'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base Attachments</h2>
          <p className="text-gray-600">
            Manage which knowledge bases this agent can access and how
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsSelectingKB(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Attach Knowledge Base
          </Button>
          <Button
            onClick={() => setActiveTab('intelligent')}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Intelligent Selection
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attached" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Attached ({attachedKBs.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Available ({filteredAvailableKBs.length})
          </TabsTrigger>
          <TabsTrigger value="intelligent" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Intelligent Selection
          </TabsTrigger>
        </TabsList>

        {/* Attached Knowledge Bases */}
        <TabsContent value="attached" className="space-y-4">
          {attachedKBs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Knowledge Bases Attached</h3>
                <p className="text-gray-600 text-center mb-4">
                  This agent doesn't have access to any knowledge bases yet.
                </p>
                <Button onClick={() => setIsSelectingKB(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Attach First Knowledge Base
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {attachedKBs.map((attachment) => (
                <Card key={attachment.knowledgeBaseId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">
                            {attachment.knowledgeBase?.name}
                          </CardTitle>
                          <CardDescription>
                            {attachment.knowledgeBase?.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getAttachmentTypeColor(attachment.attachmentType)}>
                          <div className="flex items-center gap-1">
                            {getAttachmentTypeIcon(attachment.attachmentType)}
                            {attachment.attachmentType.replace('-', ' ')}
                          </div>
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAttachment(attachment)
                                setIsConfiguringAttachment(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDetachKB(attachment.knowledgeBaseId)}
                            >
                              <Unlink className="h-4 w-4 mr-2" />
                              Detach
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Attachment Type</Label>
                        <p className="text-sm text-gray-600">
                          {getAttachmentTypeDescription(attachment.attachmentType)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <p className="text-sm text-gray-600">{attachment.priority}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`active-${attachment.knowledgeBaseId}`}
                        checked={attachment.isActive}
                        onCheckedChange={(checked) => 
                          handleUpdateAttachment(attachment.knowledgeBaseId, { isActive: !!checked })
                        }
                      />
                      <Label htmlFor={`active-${attachment.knowledgeBaseId}`}>
                        Active
                      </Label>
                    </div>

                    {attachment.conditions && attachment.conditions.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Conditions</Label>
                        <div className="space-y-1 mt-1">
                          {attachment.conditions.map((condition, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {condition.description}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Attached on {attachment.attachedAt.toLocaleDateString()} by {attachment.attachedBy}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Knowledge Bases */}
        <TabsContent value="available" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search available knowledge bases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="domain-specific">Domain Specific</SelectItem>
                    <SelectItem value="project-specific">Project Specific</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Available Knowledge Bases List */}
          <div className="space-y-4">
            {filteredAvailableKBs.map((kb) => (
              <Card key={kb.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">{kb.name}</CardTitle>
                        <CardDescription>{kb.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{kb.type}</Badge>
                      <Badge variant={kb.isPublic ? 'default' : 'secondary'}>
                        {kb.isPublic ? 'Public' : 'Private'}
                      </Badge>
                      <Button
                        onClick={() => handleAttachKB(kb.id)}
                        size="sm"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Attach
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Files:</span>
                      <span className="ml-2 font-medium">{kb.metadata.totalFiles}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-2 font-medium">
                        {(kb.metadata.totalSize / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Accesses:</span>
                      <span className="ml-2 font-medium">{kb.metadata.accessCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {kb.tags.slice(0, 5).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {kb.tags.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{kb.tags.length - 5}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Intelligent Selection */}
        <TabsContent value="intelligent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Intelligent Knowledge Base Selection
              </CardTitle>
              <CardDescription>
                Let AI help you find the most relevant knowledge bases for your agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-query">Query or Task Description</Label>
                  <Textarea
                    id="user-query"
                    placeholder="Describe what the agent needs to do or what information it needs..."
                    value={selectionContext.userQuery}
                    onChange={(e) => setSelectionContext(prev => ({ ...prev, userQuery: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="user-role">User Role</Label>
                    <Input
                      id="user-role"
                      placeholder="e.g., developer, manager, analyst"
                      value={selectionContext.userRole}
                      onChange={(e) => setSelectionContext(prev => ({ ...prev, userRole: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-context">Project Context</Label>
                    <Input
                      id="project-context"
                      placeholder="e.g., mobile app development, marketing campaign"
                      value={selectionContext.projectContext || ''}
                      onChange={(e) => setSelectionContext(prev => ({ ...prev, projectContext: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleIntelligentSelection}
                disabled={isIntelligentSelection || !selectionContext.userQuery.trim()}
                className="w-full"
              >
                {isIntelligentSelection ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Find Relevant Knowledge Bases
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Intelligent Selection Results */}
          {intelligentResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Knowledge Bases</CardTitle>
                <CardDescription>
                  Based on your query and context, here are the most relevant knowledge bases:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {intelligentResults.map((result) => {
                  const kb = knowledgeBases.find(k => k.id === result.knowledgeBaseId)
                  if (!kb) return null

                  return (
                    <Card key={result.knowledgeBaseId} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Database className="h-5 w-5" />
                            <div>
                              <CardTitle className="text-lg">{kb.name}</CardTitle>
                              <CardDescription>{kb.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {(result.score * 100).toFixed(1)}% relevance
                            </Badge>
                            <Button
                              onClick={() => handleApplyIntelligentSelection(kb.id, result.suggestedAttachmentType)}
                              size="sm"
                            >
                              <Link className="h-4 w-4 mr-2" />
                              Attach
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm font-medium">Why this knowledge base?</Label>
                            <p className="text-sm text-gray-600">{result.reasoning}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Suggested Access Type</Label>
                            <Badge className={getAttachmentTypeColor(result.suggestedAttachmentType)}>
                              <div className="flex items-center gap-1">
                                {getAttachmentTypeIcon(result.suggestedAttachmentType)}
                                {result.suggestedAttachmentType.replace('-', ' ')}
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Attach Knowledge Base Dialog */}
      {isSelectingKB && (
        <Dialog open={isSelectingKB} onOpenChange={setIsSelectingKB}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Attach Knowledge Base</DialogTitle>
              <DialogDescription>
                Select a knowledge base to attach to this agent
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Available Knowledge Bases</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableKBs.map((kb) => (
                    <div
                      key={kb.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h4 className="font-medium">{kb.name}</h4>
                        <p className="text-sm text-gray-600">{kb.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{kb.type}</Badge>
                          <span className="text-xs text-gray-500">{kb.metadata.totalFiles} files</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedKB(kb)
                          setIsSelectingKB(false)
                          handleAttachKB(kb.id)
                        }}
                        size="sm"
                      >
                        Attach
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Configure Attachment Dialog */}
      {isConfiguringAttachment && selectedAttachment && (
        <Dialog open={isConfiguringAttachment} onOpenChange={setIsConfiguringAttachment}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Attachment</DialogTitle>
              <DialogDescription>
                Configure how this agent accesses the knowledge base
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="attachment-type">Attachment Type</Label>
                <Select
                  value={selectedAttachment.attachmentType}
                  onValueChange={(value) => setSelectedAttachment(prev => prev ? { ...prev, attachmentType: value as any } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ATTACHMENT_TYPES.FULL_ACCESS}>
                      <div className="flex items-center gap-2">
                        <Unlock className="h-4 w-4" />
                        Full Access
                      </div>
                    </SelectItem>
                    <SelectItem value={ATTACHMENT_TYPES.READ_ONLY}>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Read Only
                      </div>
                    </SelectItem>
                    <SelectItem value={ATTACHMENT_TYPES.CONTEXTUAL}>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Contextual
                      </div>
                    </SelectItem>
                    <SelectItem value={ATTACHMENT_TYPES.CONDITIONAL}>
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Conditional
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  {getAttachmentTypeDescription(selectedAttachment.attachmentType)}
                </p>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={selectedAttachment.priority}
                  onChange={(e) => setSelectedAttachment(prev => prev ? { ...prev, priority: parseInt(e.target.value) } : null)}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Higher priority knowledge bases are accessed first
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-active"
                  checked={selectedAttachment.isActive}
                  onCheckedChange={(checked) => setSelectedAttachment(prev => prev ? { ...prev, isActive: !!checked } : null)}
                />
                <Label htmlFor="is-active">Active</Label>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  onClick={() => {
                    if (selectedAttachment) {
                      handleUpdateAttachment(selectedAttachment.knowledgeBaseId, selectedAttachment)
                      setIsConfiguringAttachment(false)
                      setSelectedAttachment(null)
                    }
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsConfiguringAttachment(false)
                    setSelectedAttachment(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
