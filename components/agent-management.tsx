"use client"

import React, { useState, useCallback, useMemo } from 'react'
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
  User,
  Users,
  Settings,
  Search,
  Filter,
  Sort,
  Grid,
  List,
  Calendar,
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
  Database as DatabaseIcon,
  Globe,
  Shield,
  Key,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Share2,
  Plus,
  Minus,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Home,
  Menu,
  Map,
  Layers,
  Target,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Activity,
  Network,
  Building2,
  Hash,
  AtSign,
  Image,
  Video,
  Link,
  Share,
  Bookmark,
  Flag,
  Archive as ArchiveIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Grid3X3,
  List as ListIcon,
  Map as MapIcon,
  Layers as LayersIcon
} from "lucide-react"
import {
  Agent,
  KnowledgeBase,
  AGENT_TYPES
} from '@/lib/knowledge-base-types'
import { AgentKBAttachmentManager } from './agent-kb-attachment-manager'

interface AgentManagementProps {
  agents: Agent[]
  knowledgeBases: KnowledgeBase[]
  onUpdateAgent: (agent: Agent) => void
  onDeleteAgent: (agentId: string) => void
  onCreateAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => void
  className?: string
}

interface AgentPerformance {
  agentId: string
  period: 'day' | 'week' | 'month' | 'year'
  metrics: {
    totalInteractions: number
    averageRating: number
    responseTime: number
    knowledgeBaseUsage: Array<{
      knowledgeBaseId: string
      usageCount: number
      averageRating: number
    }>
    userSatisfaction: number
    errorRate: number
  }
  trends: {
    interactions: number[]
    ratings: number[]
    responseTime: number[]
  }
}

export function AgentManagement({
  agents,
  knowledgeBases,
  onUpdateAgent,
  onDeleteAgent,
  onCreateAgent,
  className
}: AgentManagementProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isCreatingAgent, setIsCreatingAgent] = useState(false)
  const [isEditingAgent, setIsEditingAgent] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'interactions' | 'rating'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Mock performance data
  const mockPerformanceData: AgentPerformance[] = agents.map(agent => ({
    agentId: agent.id,
    period: 'month',
    metrics: {
      totalInteractions: agent.usage.totalInteractions,
      averageRating: agent.usage.averageRating,
      responseTime: Math.random() * 2000 + 500, // 500-2500ms
      knowledgeBaseUsage: agent.knowledgeBases.map(kb => ({
        knowledgeBaseId: kb.knowledgeBaseId,
        usageCount: Math.floor(Math.random() * 100) + 10,
        averageRating: Math.random() * 2 + 3 // 3-5 rating
      })),
      userSatisfaction: Math.random() * 0.3 + 0.7, // 70-100%
      errorRate: Math.random() * 0.05 // 0-5%
    },
    trends: {
      interactions: Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 5),
      ratings: Array.from({ length: 30 }, () => Math.random() * 2 + 3),
      responseTime: Array.from({ length: 30 }, () => Math.random() * 1000 + 500)
    }
  }))

  const filteredAgents = useMemo(() => {
    let filtered = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = filterType === 'all' || agent.type === filterType
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? agent.isActive : !agent.isActive)
      
      return matchesSearch && matchesType && matchesStatus
    })

    // Sort agents
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'interactions':
          comparison = a.usage.totalInteractions - b.usage.totalInteractions
          break
        case 'rating':
          comparison = a.usage.averageRating - b.usage.averageRating
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [agents, searchQuery, filterType, filterStatus, sortBy, sortDirection])

  const handleCreateAgent = useCallback((agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    onCreateAgent(agentData)
    setIsCreatingAgent(false)
  }, [onCreateAgent])

  const handleUpdateAgent = useCallback((updatedAgent: Agent) => {
    onUpdateAgent(updatedAgent)
    setIsEditingAgent(false)
  }, [onUpdateAgent])

  const handleDeleteAgent = useCallback((agentId: string) => {
    if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      onDeleteAgent(agentId)
    }
  }, [onDeleteAgent])

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'assistant': return <User className="h-4 w-4" />
      case 'specialist': return <Target className="h-4 w-4" />
      case 'analyst': return <BarChart3 className="h-4 w-4" />
      case 'researcher': return <Search className="h-4 w-4" />
      case 'writer': return <FileText className="h-4 w-4" />
      case 'developer': return <Settings className="h-4 w-4" />
      case 'custom': return <Settings className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'assistant': return 'bg-blue-500'
      case 'specialist': return 'bg-green-500'
      case 'analyst': return 'bg-purple-500'
      case 'researcher': return 'bg-orange-500'
      case 'writer': return 'bg-pink-500'
      case 'developer': return 'bg-indigo-500'
      case 'custom': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPerformanceColor = (value: number, type: 'rating' | 'satisfaction' | 'error') => {
    if (type === 'error') {
      return value < 0.02 ? 'text-green-600' : value < 0.05 ? 'text-yellow-600' : 'text-red-600'
    }
    return value >= 4.5 ? 'text-green-600' : value >= 3.5 ? 'text-yellow-600' : 'text-red-600'
  }

  const totalAgents = agents.length
  const activeAgents = agents.filter(a => a.isActive).length
  const totalInteractions = agents.reduce((sum, agent) => sum + agent.usage.totalInteractions, 0)
  const averageRating = agents.reduce((sum, agent) => sum + agent.usage.averageRating, 0) / agents.length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Management</h2>
          <p className="text-gray-600">
            Manage, monitor, and empower your AI agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreatingAgent(true)}
            className="min-w-32"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgents}</div>
            <p className="text-xs text-gray-600">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgents}</div>
            <p className="text-xs text-gray-600">{((activeAgents / totalAgents) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
            <p className="text-xs text-gray-600">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-gray-600">+0.2 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents by name, description, or capabilities..."
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
                {Object.values(AGENT_TYPES).map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="interactions">Interactions</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="knowledge-bases" className="flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4" />
            Knowledge Bases
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => {
                const performance = mockPerformanceData.find(p => p.agentId === agent.id)
                return (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedAgent?.id === agent.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getAgentTypeColor(agent.type)}`}>
                            {getAgentTypeIcon(agent.type)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <CardDescription>{agent.description}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditingAgent(true)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteAgent(agent.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{agent.type}</Badge>
                        <Badge variant={agent.isActive ? 'default' : 'destructive'}>
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Interactions:</span>
                          <span>{agent.usage.totalInteractions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className={getPerformanceColor(agent.usage.averageRating, 'rating')}>
                              {agent.usage.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Knowledge Bases:</span>
                          <span>{agent.knowledgeBases.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last Used:</span>
                          <span>{agent.usage.lastUsed?.toLocaleDateString() || 'Never'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {agent.capabilities.slice(0, 3).map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{agent.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAgents.map((agent) => {
                const performance = mockPerformanceData.find(p => p.agentId === agent.id)
                return (
                  <div
                    key={agent.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedAgent?.id === agent.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className={`p-2 rounded-lg ${getAgentTypeColor(agent.type)}`}>
                      {getAgentTypeIcon(agent.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{agent.name}</h4>
                          <p className="text-sm text-gray-600">{agent.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{agent.type}</Badge>
                          <Badge variant={agent.isActive ? 'default' : 'destructive'}>
                            {agent.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{agent.usage.totalInteractions} interactions</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{agent.usage.averageRating.toFixed(1)}</span>
                        </div>
                        <span>{agent.knowledgeBases.length} knowledge bases</span>
                        <span>Last used: {agent.usage.lastUsed?.toLocaleDateString() || 'Never'}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditingAgent(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteAgent(agent.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const performance = mockPerformanceData.find(p => p.agentId === agent.id)
              if (!performance) return null

              return (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getAgentTypeColor(agent.type)}`}>
                        {getAgentTypeIcon(agent.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription>{agent.type}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Interactions</div>
                        <div className="text-2xl font-bold">{performance.metrics.totalInteractions}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Rating</div>
                        <div className={`text-2xl font-bold ${getPerformanceColor(performance.metrics.averageRating, 'rating')}`}>
                          {performance.metrics.averageRating.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Response Time</div>
                        <div className="text-2xl font-bold">{performance.metrics.responseTime.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Satisfaction</div>
                        <div className={`text-2xl font-bold ${getPerformanceColor(performance.metrics.userSatisfaction, 'satisfaction')}`}>
                          {(performance.metrics.userSatisfaction * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Error Rate</div>
                      <div className="flex items-center gap-2">
                        <Progress value={performance.metrics.errorRate * 100} className="flex-1" />
                        <span className={`text-sm ${getPerformanceColor(performance.metrics.errorRate, 'error')}`}>
                          {(performance.metrics.errorRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">Knowledge Base Usage</div>
                      <div className="space-y-1">
                        {performance.metrics.knowledgeBaseUsage.map((kbUsage) => {
                          const kb = knowledgeBases.find(k => k.id === kbUsage.knowledgeBaseId)
                          return (
                            <div key={kbUsage.knowledgeBaseId} className="flex items-center justify-between text-sm">
                              <span>{kb?.name || 'Unknown KB'}</span>
                              <div className="flex items-center gap-2">
                                <span>{kbUsage.usageCount}</span>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{kbUsage.averageRating.toFixed(1)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Knowledge Bases Tab */}
        <TabsContent value="knowledge-bases" className="space-y-6">
          {selectedAgent ? (
            <AgentKBAttachmentManager
              agent={selectedAgent}
              knowledgeBases={knowledgeBases}
              onUpdateAgent={handleUpdateAgent}
            />
          ) : (
            <div className="text-center py-12">
              <DatabaseIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select an Agent</h3>
              <p className="text-gray-600 mb-4">
                Choose an agent from the overview to manage its knowledge base attachments.
              </p>
              <Button onClick={() => setActiveTab('overview')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Browse Agents
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Agent Settings</CardTitle>
              <CardDescription>
                Configure default settings for all agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked />
                <Label>Enable automatic knowledge base attachment</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked />
                <Label>Enable performance monitoring</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox />
                <Label>Enable automatic agent optimization</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked />
                <Label>Enable user feedback collection</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Agent Dialog */}
      {isCreatingAgent && (
        <Dialog open={isCreatingAgent} onOpenChange={setIsCreatingAgent}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Create a new AI agent with specific capabilities and knowledge base access.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name">Name</Label>
                <Input id="agent-name" placeholder="Enter agent name" />
              </div>
              
              <div>
                <Label htmlFor="agent-description">Description</Label>
                <Textarea id="agent-description" placeholder="Describe the agent's purpose and capabilities" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent-type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AGENT_TYPES).map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="agent-tone">Communication Tone</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="agent-capabilities">Capabilities</Label>
                <Input id="agent-capabilities" placeholder="e.g., research, analysis, writing (comma-separated)" />
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox id="agent-auto-kb" defaultChecked />
                <Label htmlFor="agent-auto-kb">Enable intelligent knowledge base selection</Label>
              </div>
              
              <div className="flex items-center gap-2 pt-4">
                <Button onClick={() => setIsCreatingAgent(false)}>
                  Create Agent
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingAgent(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Agent Dialog */}
      {isEditingAgent && selectedAgent && (
        <Dialog open={isEditingAgent} onOpenChange={setIsEditingAgent}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
              <DialogDescription>
                Update the agent's configuration and settings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-agent-name">Name</Label>
                <Input id="edit-agent-name" defaultValue={selectedAgent.name} />
              </div>
              
              <div>
                <Label htmlFor="edit-agent-description">Description</Label>
                <Textarea id="edit-agent-description" defaultValue={selectedAgent.description} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-agent-type">Type</Label>
                  <Select defaultValue={selectedAgent.type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AGENT_TYPES).map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-agent-tone">Communication Tone</Label>
                  <Select defaultValue={selectedAgent.personality.tone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-agent-capabilities">Capabilities</Label>
                <Input id="edit-agent-capabilities" defaultValue={selectedAgent.capabilities.join(', ')} />
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox id="edit-agent-active" defaultChecked={selectedAgent.isActive} />
                <Label htmlFor="edit-agent-active">Agent is active</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox id="edit-agent-auto-kb" defaultChecked={selectedAgent.settings.autoAttachKB} />
                <Label htmlFor="edit-agent-auto-kb">Enable intelligent knowledge base selection</Label>
              </div>
              
              <div className="flex items-center gap-2 pt-4">
                <Button onClick={() => setIsEditingAgent(false)}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditingAgent(false)}>
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
