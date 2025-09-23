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
  User,
  Users,
  Globe,
  Shield,
  Key,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
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
  Brain,
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
  KnowledgeBase,
  KnowledgeBaseItem,
  KnowledgeBaseSearchResult,
  ITEM_TYPES,
  SOURCE_TYPES
} from '@/lib/knowledge-base-types'

interface KnowledgeBaseSearchProps {
  knowledgeBases: KnowledgeBase[]
  onSearchResult?: (results: KnowledgeBaseSearchResult[]) => void
  onItemSelect?: (item: KnowledgeBaseItem) => void
  className?: string
}

interface SearchFilters {
  knowledgeBaseIds: string[]
  itemTypes: string[]
  sourceTypes: string[]
  dateRange: {
    start?: Date
    end?: Date
  }
  fileSizeRange: {
    min?: number
    max?: number
  }
  tags: string[]
  categories: string[]
  createdBy: string[]
  processingStatus: string[]
  isIndexed: boolean | null
  isProcessed: boolean | null
}

interface SearchSort {
  field: 'relevance' | 'date' | 'name' | 'size' | 'type'
  direction: 'asc' | 'desc'
}

const mockSearchResults: KnowledgeBaseSearchResult[] = [
  {
    item: {
      id: 'item-1',
      knowledgeBaseId: 'kb-1',
      name: 'Company Policy Handbook',
      type: 'file',
      source: 'upload',
      content: 'Company policies and procedures...',
      metadata: {
        size: 2048576,
        mimeType: 'application/pdf',
        version: '1.0.0',
        extractedText: 'This document contains company policies...',
        summary: 'Comprehensive company policy handbook covering HR, IT, and business procedures.',
        keywords: ['policy', 'procedures', 'hr', 'company'],
        entities: ['HR Department', 'IT Department', 'Management'],
        sentiment: 'neutral',
        confidence: 0.95,
        lastIndexed: new Date('2024-01-20')
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      createdBy: 'user-1',
      isProcessed: true,
      isIndexed: true,
      processingStatus: 'completed',
      attachments: []
    },
    relevanceScore: 0.95,
    matchedTerms: ['policy', 'handbook', 'company'],
    snippet: 'This document contains company policies and procedures for all employees...',
    highlights: [
      {
        field: 'name',
        text: 'Company Policy Handbook',
        position: 0
      },
      {
        field: 'content',
        text: 'company policies and procedures',
        position: 25
      }
    ]
  },
  {
    item: {
      id: 'item-2',
      knowledgeBaseId: 'kb-2',
      name: 'API Documentation',
      type: 'text',
      source: 'api',
      content: 'REST API documentation for the platform...',
      metadata: {
        size: 512000,
        mimeType: 'text/markdown',
        version: '2.1.0',
        extractedText: 'REST API documentation for the platform...',
        summary: 'Complete API documentation with endpoints, parameters, and examples.',
        keywords: ['api', 'documentation', 'rest', 'endpoints'],
        entities: ['API', 'Platform', 'Developers'],
        sentiment: 'positive',
        confidence: 0.88,
        lastIndexed: new Date('2024-01-19')
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      createdBy: 'user-2',
      isProcessed: true,
      isIndexed: true,
      processingStatus: 'completed',
      attachments: []
    },
    relevanceScore: 0.88,
    matchedTerms: ['api', 'documentation'],
    snippet: 'REST API documentation for the platform including all endpoints...',
    highlights: [
      {
        field: 'name',
        text: 'API Documentation',
        position: 0
      },
      {
        field: 'content',
        text: 'REST API documentation',
        position: 0
      }
    ]
  },
  {
    item: {
      id: 'item-3',
      knowledgeBaseId: 'kb-1',
      name: 'Project Meeting Notes',
      type: 'chat-history',
      source: 'chat-history',
      content: 'Meeting notes from project planning session...',
      metadata: {
        size: 256000,
        mimeType: 'text/plain',
        version: '1.0.0',
        extractedText: 'Meeting notes from project planning session...',
        summary: 'Key decisions and action items from project planning meeting.',
        keywords: ['meeting', 'project', 'planning', 'decisions'],
        entities: ['Project Team', 'Manager', 'Stakeholders'],
        sentiment: 'positive',
        confidence: 0.82,
        lastIndexed: new Date('2024-01-18')
      },
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-18'),
      createdBy: 'user-1',
      isProcessed: true,
      isIndexed: true,
      processingStatus: 'completed',
      attachments: []
    },
    relevanceScore: 0.82,
    matchedTerms: ['meeting', 'project', 'notes'],
    snippet: 'Meeting notes from project planning session covering key decisions...',
    highlights: [
      {
        field: 'name',
        text: 'Project Meeting Notes',
        position: 0
      },
      {
        field: 'content',
        text: 'project planning session',
        position: 15
      }
    ]
  }
]

export function KnowledgeBaseSearch({
  knowledgeBases,
  onSearchResult,
  onItemSelect,
  className
}: KnowledgeBaseSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<KnowledgeBaseSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [activeTab, setActiveTab] = useState('search')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SearchSort>({ field: 'relevance', direction: 'desc' })
  
  const [filters, setFilters] = useState<SearchFilters>({
    knowledgeBaseIds: [],
    itemTypes: [],
    sourceTypes: [],
    dateRange: {},
    fileSizeRange: {},
    tags: [],
    categories: [],
    createdBy: [],
    processingStatus: [],
    isIndexed: null,
    isProcessed: null
  })

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    knowledgeBases.forEach(kb => {
      kb.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [knowledgeBases])

  const allCategories = useMemo(() => {
    const categories = new Set<string>()
    knowledgeBases.forEach(kb => {
      categories.add(kb.category)
    })
    return Array.from(categories).sort()
  }, [knowledgeBases])

  const allUsers = useMemo(() => {
    const users = new Set<string>()
    knowledgeBases.forEach(kb => {
      users.add(kb.createdBy)
    })
    return Array.from(users).sort()
  }, [knowledgeBases])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    const startTime = Date.now()

    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Filter mock results based on search query
      const filteredResults = mockSearchResults.filter(result => {
        const query = searchQuery.toLowerCase()
        return (
          result.item.name.toLowerCase().includes(query) ||
          result.item.content.toString().toLowerCase().includes(query) ||
          result.matchedTerms.some(term => term.toLowerCase().includes(query)) ||
          result.snippet.toLowerCase().includes(query)
        )
      })

      // Apply additional filters
      const finalResults = filteredResults.filter(result => {
        if (filters.knowledgeBaseIds.length > 0 && !filters.knowledgeBaseIds.includes(result.item.knowledgeBaseId)) {
          return false
        }
        if (filters.itemTypes.length > 0 && !filters.itemTypes.includes(result.item.type)) {
          return false
        }
        if (filters.sourceTypes.length > 0 && !filters.sourceTypes.includes(result.item.source)) {
          return false
        }
        if (filters.tags.length > 0 && !result.item.metadata.keywords?.some(keyword => 
          filters.tags.some(tag => keyword.toLowerCase().includes(tag.toLowerCase()))
        )) {
          return false
        }
        if (filters.createdBy.length > 0 && !filters.createdBy.includes(result.item.createdBy)) {
          return false
        }
        if (filters.processingStatus.length > 0 && !filters.processingStatus.includes(result.item.processingStatus)) {
          return false
        }
        if (filters.isIndexed !== null && result.item.isIndexed !== filters.isIndexed) {
          return false
        }
        if (filters.isProcessed !== null && result.item.isProcessed !== filters.isProcessed) {
          return false
        }
        return true
      })

      // Sort results
      const sortedResults = finalResults.sort((a, b) => {
        let comparison = 0
        switch (sortBy.field) {
          case 'relevance':
            comparison = a.relevanceScore - b.relevanceScore
            break
          case 'date':
            comparison = a.item.createdAt.getTime() - b.item.createdAt.getTime()
            break
          case 'name':
            comparison = a.item.name.localeCompare(b.item.name)
            break
          case 'size':
            comparison = (a.item.metadata.size || 0) - (b.item.metadata.size || 0)
            break
          case 'type':
            comparison = a.item.type.localeCompare(b.item.type)
            break
        }
        return sortBy.direction === 'asc' ? comparison : -comparison
      })

      setSearchResults(sortedResults)
      onSearchResult?.(sortedResults)
      
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
      setSearchTime(Date.now() - startTime)
    }
  }, [searchQuery, filters, sortBy, onSearchResult])

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      knowledgeBaseIds: [],
      itemTypes: [],
      sourceTypes: [],
      dateRange: {},
      fileSizeRange: {},
      tags: [],
      categories: [],
      createdBy: [],
      processingStatus: [],
      isIndexed: null,
      isProcessed: null
    })
  }, [])

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'file': return <FileText className="h-4 w-4" />
      case 'text': return <FileText className="h-4 w-4" />
      case 'url': return <Link className="h-4 w-4" />
      case 'chat-history': return <MessageSquare className="h-4 w-4" />
      case 'profile-data': return <User className="h-4 w-4" />
      case 'api-data': return <DatabaseIcon className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'upload': return <Upload className="h-4 w-4" />
      case 'file-manager': return <Folder className="h-4 w-4" />
      case 'chat-history': return <MessageSquare className="h-4 w-4" />
      case 'user-profile': return <User className="h-4 w-4" />
      case 'api': return <Globe className="h-4 w-4" />
      case 'web-scrape': return <Link className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getKnowledgeBaseName = (kbId: string) => {
    const kb = knowledgeBases.find(k => k.id === kbId)
    return kb?.name || 'Unknown Knowledge Base'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base Search</h2>
          <p className="text-gray-600">
            Search across all knowledge bases and content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
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
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search knowledge bases, content, tags, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={sortBy.field} onValueChange={(value) => setSortBy(prev => ({ ...prev, field: value as any }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Search Filters</CardTitle>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Knowledge Bases</Label>
                <Select
                  value={filters.knowledgeBaseIds[0] || ''}
                  onValueChange={(value) => handleFilterChange('knowledgeBaseIds', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Knowledge Bases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Knowledge Bases</SelectItem>
                    {knowledgeBases.map(kb => (
                      <SelectItem key={kb.id} value={kb.id}>{kb.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Item Types</Label>
                <Select
                  value={filters.itemTypes[0] || ''}
                  onValueChange={(value) => handleFilterChange('itemTypes', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {Object.values(ITEM_TYPES).map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Source Types</Label>
                <Select
                  value={filters.sourceTypes[0] || ''}
                  onValueChange={(value) => handleFilterChange('sourceTypes', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sources</SelectItem>
                    {Object.values(SOURCE_TYPES).map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Processing Status</Label>
                <Select
                  value={filters.processingStatus[0] || ''}
                  onValueChange={(value) => handleFilterChange('processingStatus', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Indexed</Label>
                <Select
                  value={filters.isIndexed === null ? '' : filters.isIndexed.toString()}
                  onValueChange={(value) => handleFilterChange('isIndexed', value === '' ? null : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="true">Indexed</SelectItem>
                    <SelectItem value="false">Not Indexed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Processed</Label>
                <Select
                  value={filters.isProcessed === null ? '' : filters.isProcessed.toString()}
                  onValueChange={(value) => handleFilterChange('isProcessed', value === '' ? null : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="true">Processed</SelectItem>
                    <SelectItem value="false">Not Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Search Results ({searchResults.length})
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {searchTime}ms
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result) => (
                  <Card
                    key={result.item.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedItems.includes(result.item.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => onItemSelect?.(result.item)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getItemIcon(result.item.type)}
                          <div>
                            <CardTitle className="text-sm">{result.item.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {getKnowledgeBaseName(result.item.knowledgeBaseId)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {(result.relevanceScore * 100).toFixed(0)}%
                          </Badge>
                          <Checkbox
                            checked={selectedItems.includes(result.item.id)}
                            onChange={() => toggleItemSelection(result.item.id)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {result.snippet}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {result.item.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getSourceIcon(result.item.source)}
                          {result.item.source}
                        </Badge>
                        {result.item.metadata.size && (
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(result.item.metadata.size)}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.item.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedItems.includes(result.item.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => onItemSelect?.(result.item)}
                  >
                    <Checkbox
                      checked={selectedItems.includes(result.item.id)}
                      onChange={() => toggleItemSelection(result.item.id)}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      {getItemIcon(result.item.type)}
                      <div className="flex-1">
                        <h4 className="font-medium">{result.item.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {result.snippet}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {result.item.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getSourceIcon(result.item.source)}
                            {result.item.source}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getKnowledgeBaseName(result.item.knowledgeBaseId)}
                          </Badge>
                          {result.item.metadata.size && (
                            <Badge variant="outline" className="text-xs">
                              {formatFileSize(result.item.metadata.size)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {(result.relevanceScore * 100).toFixed(0)}%
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Results Found</h3>
            <p className="text-gray-600 text-center mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
