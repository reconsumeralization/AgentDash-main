"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
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
  Upload,
  FileText,
  Database,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Settings,
  MoreHorizontal,
  Brain,
  BookOpen,
  File,
  Folder,
  Link,
  MessageSquare,
  User,
  Globe,
  Star,
  BarChart3,
  Target,
  ArrowRight,
} from "lucide-react"
import {
  KnowledgeBase,
  KnowledgeBaseItem,
  Agent,
  KnowledgeBaseUploadSource,
} from '@/lib/knowledge-base-types'
import { KnowledgeBaseUploadManager } from './knowledge-base-upload-manager'
import { AgentKBAttachmentManager } from './agent-kb-attachment-manager'
import { KnowledgeBaseSearch } from './knowledge-base-search'
import { AgentManagement } from './agent-management'

interface KnowledgeBaseManagerProps {
  className?: string
}

export function KnowledgeBaseManager({ className }: KnowledgeBaseManagerProps) {
  const [activeTab, setActiveTab] = useState('knowledge-bases')
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isCreatingKB, setIsCreatingKB] = useState(false)
  const [isCreatingAgent, setIsCreatingAgent] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showKBDetails, setShowKBDetails] = useState(false)
  const [showAgentDetails, setShowAgentDetails] = useState(false)

  // Mock data
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: 'kb-1',
      name: 'Company Documentation',
      description: 'Internal company policies, procedures, and guidelines',
      type: 'domain-specific',
      category: 'Business',
      tags: ['policies', 'procedures', 'hr', 'internal'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      createdBy: 'user-1',
      isPublic: false,
      isActive: true,
      metadata: {
        totalFiles: 45,
        totalSize: 125000000,
        lastAccessed: new Date('2024-01-19'),
        accessCount: 156,
        version: '1.2.0'
      },
      settings: {
        autoIndex: true,
        allowPublicAccess: false,
        requireApproval: true,
        maxFileSize: 100000000,
        allowedFileTypes: ['application/pdf', 'text/plain', 'application/msword']
      },
      attachedAgents: ['agent-1', 'agent-2'],
      permissions: {
        read: ['user-1', 'user-2', 'user-3'],
        write: ['user-1', 'user-2'],
        admin: ['user-1'],
        public: false
      }
    },
    {
      id: 'kb-2',
      name: 'Technical Knowledge Base',
      description: 'Technical documentation, API references, and code examples',
      type: 'domain-specific',
      category: 'Technology',
      tags: ['api', 'documentation', 'code', 'technical'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      createdBy: 'user-2',
      isPublic: true,
      isActive: true,
      metadata: {
        totalFiles: 78,
        totalSize: 250000000,
        lastAccessed: new Date('2024-01-19'),
        accessCount: 342,
        version: '2.1.0'
      },
      settings: {
        autoIndex: true,
        allowPublicAccess: true,
        requireApproval: false,
        maxFileSize: 50000000,
        allowedFileTypes: ['text/plain', 'text/markdown', 'application/json']
      },
      attachedAgents: ['agent-1', 'agent-3'],
      permissions: {
        read: ['user-1', 'user-2', 'user-3', 'user-4'],
        write: ['user-2', 'user-3'],
        admin: ['user-2'],
        public: true
      }
    }
  ])

  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent-1',
      name: 'Research Assistant',
      description: 'Helps with research tasks and information gathering',
      type: 'assistant',
      capabilities: ['research', 'analysis', 'summarization'],
      personality: {
        tone: 'professional',
        expertise: ['research', 'data analysis'],
        communication_style: 'detailed'
      },
      knowledgeBases: [
        {
          knowledgeBaseId: 'kb-1',
          attachmentType: 'contextual',
          priority: 1,
          isActive: true,
          attachedAt: new Date('2024-01-15'),
          attachedBy: 'user-1'
        }
      ],
      settings: {
        autoAttachKB: true,
        maxKBItems: 10,
        kbSelectionStrategy: 'intelligent',
        contextWindow: 4000,
        responseLength: 'medium'
      },
      isActive: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      createdBy: 'user-1',
      usage: {
        totalInteractions: 245,
        lastUsed: new Date('2024-01-19'),
        averageRating: 4.5,
        totalRating: 1225
      }
    },
    {
      id: 'agent-2',
      name: 'Technical Writer',
      description: 'Specializes in creating technical documentation',
      type: 'writer',
      capabilities: ['writing', 'documentation', 'technical communication'],
      personality: {
        tone: 'technical',
        expertise: ['technical writing', 'documentation'],
        communication_style: 'concise'
      },
      knowledgeBases: [
        {
          knowledgeBaseId: 'kb-2',
          attachmentType: 'full-access',
          priority: 1,
          isActive: true,
          attachedAt: new Date('2024-01-12'),
          attachedBy: 'user-2'
        }
      ],
      settings: {
        autoAttachKB: false,
        maxKBItems: 5,
        kbSelectionStrategy: 'manual',
        contextWindow: 2000,
        responseLength: 'long'
      },
      isActive: true,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-17'),
      createdBy: 'user-2',
      usage: {
        totalInteractions: 189,
        lastUsed: new Date('2024-01-18'),
        averageRating: 4.2,
        totalRating: 794
      }
    }
  ])

  const [uploadSources] = useState<KnowledgeBaseUploadSource[]>([
    {
      type: 'file-upload',
      sourceName: 'Computer Upload',
      metadata: { description: 'Upload files directly from your computer' }
    },
    {
      type: 'file-manager',
      sourceName: 'File Manager',
      metadata: { description: 'Import from your existing file manager' }
    },
    {
      type: 'chat-history',
      sourceName: 'Chat History',
      metadata: { description: 'Import conversations and chat logs' }
    },
    {
      type: 'user-profile',
      sourceName: 'User Profile Data',
      metadata: { description: 'Import user profile information' }
    },
    {
      type: 'api',
      sourceName: 'API Data',
      metadata: { description: 'Import data from external APIs' }
    },
    {
      type: 'web-url',
      sourceName: 'Web URL',
      metadata: { description: 'Import content from web URLs' }
    }
  ])

  const filteredKnowledgeBases = knowledgeBases.filter(kb => {
    const matchesSearch = kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kb.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === 'all' || kb.type === filterType
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? kb.isActive : !kb.isActive)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === 'all' || agent.type === filterType
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? agent.isActive : !agent.isActive)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateKB = useCallback(() => {
    setIsCreatingKB(true)
  }, [])


  const handleKBUploadComplete = useCallback((items: KnowledgeBaseItem[]) => {
    console.log('Upload completed:', items)
    // Here you would typically update the knowledge base with new items
    setIsUploading(false)
    setUploadProgress(0)
  }, [])

  const handleUpdateAgent = useCallback((updatedAgent: Agent) => {
    setAgents(prev => prev.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ))
    setSelectedAgent(updatedAgent)
  }, [])

  const handleDeleteAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId))
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null)
    }
  }, [selectedAgent])

  const handleCreateAgent = useCallback((agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: `agent-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setAgents(prev => [...prev, newAgent])
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getKBTypeIcon = (type: string) => {
    switch (type) {
      case 'general': return <Database className="h-4 w-4" />
      case 'domain-specific': return <Target className="h-4 w-4" />
      case 'project-specific': return <Folder className="h-4 w-4" />
      case 'personal': return <User className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

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

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Knowledge Base & Agents</h1>
            <p className="text-lg text-gray-600">
              Upload, explore, and build knowledge. Your central hub for insights and resources.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleCreateKB}>
              <Plus className="h-4 w-4 mr-2" />
              New Knowledge Base
            </Button>
            <Button onClick={() => setIsCreatingAgent(true)} variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search knowledge bases and agents..."
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
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="knowledge-bases" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Knowledge Bases
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="agent-management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Agent Management
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="uploads" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload & Import
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Knowledge Bases Tab */}
        <TabsContent value="knowledge-bases" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKnowledgeBases.map((kb) => (
              <Card
                key={kb.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedKB?.id === kb.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedKB(kb)
                  setShowKBDetails(true)
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getKBTypeIcon(kb.type)}
                      <div>
                        <CardTitle className="text-lg">{kb.name}</CardTitle>
                        <CardDescription>{kb.description}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
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
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{kb.type}</Badge>
                    <Badge variant={kb.isPublic ? 'default' : 'secondary'}>
                      {kb.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Badge variant={kb.isActive ? 'default' : 'destructive'}>
                      {kb.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Files:</span>
                      <span>{kb.metadata.totalFiles}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span>{formatFileSize(kb.metadata.totalSize)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Agents:</span>
                      <span>{kb.attachedAgents.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Accesses:</span>
                      <span>{kb.metadata.accessCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {kb.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {kb.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{kb.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedAgent?.id === agent.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedAgent(agent)
                  setShowAgentDetails(true)
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAgentTypeIcon(agent.type)}
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
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
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
                      <span className="text-gray-600">Knowledge Bases:</span>
                      <span>{agent.knowledgeBases.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Interactions:</span>
                      <span>{agent.usage.totalInteractions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{agent.usage.averageRating.toFixed(1)}</span>
                      </div>
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
            ))}
          </div>
        </TabsContent>

        {/* Agent Management Tab */}
        <TabsContent value="agent-management" className="space-y-6">
          <AgentManagement
            agents={agents}
            knowledgeBases={knowledgeBases}
            onUpdateAgent={handleUpdateAgent}
            onDeleteAgent={handleDeleteAgent}
            onCreateAgent={handleCreateAgent}
          />
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <KnowledgeBaseSearch
            knowledgeBases={knowledgeBases}
            onSearchResult={(results) => {
              console.log('Search results:', results)
            }}
            onItemSelect={(item) => {
              console.log('Selected item:', item)
            }}
          />
        </TabsContent>

        {/* Upload & Import Tab */}
        <TabsContent value="uploads" className="space-y-6">
          {selectedKB ? (
            <KnowledgeBaseUploadManager
              knowledgeBase={selectedKB}
              onUploadComplete={handleKBUploadComplete}
              onUploadProgress={setUploadProgress}
            />
          ) : (
            <div className="text-center py-12">
              <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Knowledge Base</h3>
              <p className="text-gray-600 mb-4">
                Choose a knowledge base from the list above to start uploading content.
              </p>
              <Button onClick={() => setActiveTab('knowledge-bases')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Browse Knowledge Bases
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Knowledge Bases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{knowledgeBases.length}</div>
                <p className="text-xs text-gray-600">+2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agents.filter(a => a.isActive).length}</div>
                <p className="text-xs text-gray-600">+1 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {knowledgeBases.reduce((sum, kb) => sum + kb.metadata.totalFiles, 0)}
                </div>
                <p className="text-xs text-gray-600">+15 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agents.reduce((sum, agent) => sum + agent.usage.totalInteractions, 0)}
                </div>
                <p className="text-xs text-gray-600">+89 from last week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Knowledge Base Details View */}
      {showKBDetails && selectedKB && (
        <Dialog open={showKBDetails} onOpenChange={setShowKBDetails}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getKBTypeIcon(selectedKB.type)}
                {selectedKB.name}
              </DialogTitle>
              <DialogDescription>
                {selectedKB.description}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="upload">Upload Content</TabsTrigger>
                <TabsTrigger value="agents">Attached Agents</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedKB.metadata.totalFiles}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatFileSize(selectedKB.metadata.totalSize)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Attached Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedKB.attachedAgents.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Access Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedKB.metadata.accessCount}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedKB.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="upload">
                <KnowledgeBaseUploadManager
                  knowledgeBase={selectedKB}
                  onUploadComplete={handleKBUploadComplete}
                  onUploadProgress={setUploadProgress}
                />
              </TabsContent>
              
              <TabsContent value="agents" className="space-y-4">
                <div className="space-y-4">
                  {agents.filter(agent => selectedKB.attachedAgents.includes(agent.id)).map((agent) => (
                    <Card key={agent.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getAgentTypeIcon(agent.type)}
                            <div>
                              <CardTitle className="text-lg">{agent.name}</CardTitle>
                              <CardDescription>{agent.description}</CardDescription>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedAgent(agent)
                              setShowKBDetails(false)
                              setShowAgentDetails(true)
                            }}
                            variant="outline"
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{agent.type}</Badge>
                          <Badge variant={agent.isActive ? 'default' : 'destructive'}>
                            {agent.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Base Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedKB.settings.autoIndex} />
                      <Label>Enable automatic indexing</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedKB.settings.allowPublicAccess} />
                      <Label>Allow public access</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedKB.settings.requireApproval} />
                      <Label>Require approval for new content</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Agent Details View */}
      {showAgentDetails && selectedAgent && (
        <Dialog open={showAgentDetails} onOpenChange={setShowAgentDetails}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getAgentTypeIcon(selectedAgent.type)}
                {selectedAgent.name}
              </DialogTitle>
              <DialogDescription>
                {selectedAgent.description}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="knowledge-bases">Knowledge Bases</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedAgent.usage.totalInteractions}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedAgent.usage.averageRating.toFixed(1)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Knowledge Bases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedAgent.knowledgeBases.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Last Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedAgent.usage.lastUsed?.toLocaleDateString() || 'Never'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary">{capability}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="knowledge-bases">
                <AgentKBAttachmentManager
                  agent={selectedAgent}
                  knowledgeBases={knowledgeBases}
                  onUpdateAgent={handleUpdateAgent}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedAgent.settings.autoAttachKB} />
                      <Label>Enable automatic knowledge base attachment</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedAgent.isActive} />
                      <Label>Agent is active</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Knowledge Base Dialog */}
      {isCreatingKB && (
        <Dialog open={isCreatingKB} onOpenChange={setIsCreatingKB}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Knowledge Base</DialogTitle>
              <DialogDescription>
                Create a new knowledge base to organize and manage your information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="kb-name">Name</Label>
                <Input id="kb-name" placeholder="Enter knowledge base name" />
              </div>
              
              <div>
                <Label htmlFor="kb-description">Description</Label>
                <Textarea id="kb-description" placeholder="Describe the purpose of this knowledge base" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kb-type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="domain-specific">Domain Specific</SelectItem>
                      <SelectItem value="project-specific">Project Specific</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="kb-category">Category</Label>
                  <Input id="kb-category" placeholder="e.g., Business, Technology" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox id="kb-public" />
                <Label htmlFor="kb-public">Make this knowledge base public</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox id="kb-auto-index" defaultChecked />
                <Label htmlFor="kb-auto-index">Enable automatic indexing</Label>
              </div>
              
              <div className="flex items-center gap-2 pt-4">
                <Button onClick={() => setIsCreatingKB(false)}>
                  Create Knowledge Base
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingKB(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="specialist">Specialist</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="writer">Writer</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
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
    </div>
  )
}