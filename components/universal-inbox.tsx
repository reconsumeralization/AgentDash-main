"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Checkbox,
  CheckboxGroup,
  CheckboxItem,
} from "@/components/ui/checkbox"
import {
  Inbox,
  MessageSquare,
  Bell,
  Filter,
  Search,
  MoreHorizontal,
  Star,
  Archive,
  Tag,
  Reply,
  Forward,
  Check,
  Eye,
  SortAsc,
  SortDesc,
  RefreshCw,
  Settings,
  EyeOff,
  Users,
  Calendar,
  TrendingUp,
  BarChart3,
  Mail,
  MessageCircle,
  ThumbsUp,
  Share2,
  Heart,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download
} from "lucide-react"

// Mock types for demonstration
interface InboxItem {
  id: string
  type: 'post' | 'comment' | 'message' | 'notification'
  platform: string
  data: any
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  isImportant: boolean
  isArchived: boolean
  tags: string[]
  categories: string[]
  createdAt: Date
  updatedAt: Date
}

interface InboxStats {
  totalItems: number
  unreadItems: number
  importantItems: number
  archivedItems: number
  itemsByPlatform: Record<string, number>
  itemsByType: Record<string, number>
  itemsByPriority: Record<string, number>
  averageResponseTime: number
  lastActivity: Date
}

interface InboxFilter {
  field: string
  operator: string
  value: any
  isActive: boolean
}

const mockItems: InboxItem[] = [
  {
    id: '1',
    type: 'message',
    platform: 'linkedin',
    data: {
      sender: { displayName: 'John Doe', profilePicture: '/api/placeholder/40/40' },
      content: 'Hi! I saw your post about AI and would love to connect.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    priority: 'high',
    isRead: false,
    isImportant: true,
    isArchived: false,
    tags: ['networking', 'ai'],
    categories: ['professional'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    type: 'comment',
    platform: 'twitter',
    data: {
      author: { displayName: 'Jane Smith', username: '@janesmith' },
      content: 'Great insights! Thanks for sharing.',
      post: { text: 'The future of AI in business...' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    priority: 'medium',
    isRead: true,
    isImportant: false,
    isArchived: false,
    tags: ['engagement'],
    categories: ['social'],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: '3',
    type: 'notification',
    platform: 'facebook',
    data: {
      type: 'like',
      actor: { displayName: 'Mike Johnson' },
      target: { text: 'Check out our new product launch!' },
      message: 'Mike Johnson liked your post',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    priority: 'low',
    isRead: false,
    isImportant: false,
    isArchived: false,
    tags: ['engagement'],
    categories: ['social'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
]

const mockStats: InboxStats = {
  totalItems: 156,
  unreadItems: 23,
  importantItems: 8,
  archivedItems: 12,
  itemsByPlatform: {
    linkedin: 45,
    twitter: 38,
    facebook: 32,
    instagram: 25,
    youtube: 16
  },
  itemsByType: {
    message: 67,
    comment: 45,
    notification: 32,
    post: 12
  },
  itemsByPriority: {
    urgent: 3,
    high: 12,
    medium: 89,
    low: 52
  },
  averageResponseTime: 2.5,
  lastActivity: new Date()
}

export function UniversalInbox() {
  const [selectedInbox, setSelectedInbox] = useState('universal')
  const [items, setItems] = useState<InboxItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InboxItem[]>([])
  const [stats, setStats] = useState<InboxStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<InboxFilter[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null)

  const inboxes = [
    { id: 'universal', name: 'Universal Inbox', count: 156, unread: 23 },
    { id: 'high-priority', name: 'High Priority', count: 15, unread: 8 },
    { id: 'mentions', name: 'Mentions & Tags', count: 34, unread: 12 },
    { id: 'linkedin', name: 'LinkedIn', count: 45, unread: 7 },
    { id: 'twitter', name: 'Twitter', count: 38, unread: 5 },
    { id: 'facebook', name: 'Facebook', count: 32, unread: 4 },
    { id: 'instagram', name: 'Instagram', count: 25, unread: 3 },
    { id: 'youtube', name: 'YouTube', count: 16, unread: 2 }
  ]

  useEffect(() => {
    setItems(mockItems)
    setStats(mockStats)
    applyFiltersAndSearch()
  }, [applyFiltersAndSearch])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, sortBy, sortOrder, selectedInbox, applyFiltersAndSearch])

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...items]

    // Apply inbox filter
    if (selectedInbox !== 'universal') {
      filtered = filtered.filter(item => {
        if (selectedInbox === 'high-priority') {
          return item.priority === 'high' || item.priority === 'urgent'
        }
        if (selectedInbox === 'mentions') {
          return item.tags.includes('mention') || item.data.content?.includes('@')
        }
        return item.platform === selectedInbox
      })
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => {
        const data = item.data
        return (
          data.content?.toLowerCase().includes(query) ||
          data.sender?.displayName?.toLowerCase().includes(query) ||
          data.author?.displayName?.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
        )
      })
    }

    // Apply custom filters
    filters.forEach(filter => {
      if (!filter.isActive) return
      
      filtered = filtered.filter(item => {
        switch (filter.field) {
          case 'platform':
            return item.platform === filter.value
          case 'type':
            return item.type === filter.value
          case 'priority':
            return item.priority === filter.value
          case 'read':
            return filter.value === 'read' ? item.isRead : !item.isRead
          case 'important':
            return item.isImportant === filter.value
          default:
            return true
        }
      })
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'date':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        case 'platform':
          aValue = a.platform
          bValue = b.platform
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'sender':
          aValue = a.data.sender?.displayName || a.data.author?.displayName || ''
          bValue = b.data.sender?.displayName || b.data.author?.displayName || ''
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredItems(filtered)
  }, [items, searchQuery, filters, sortBy, sortOrder, selectedInbox])

  const handleMarkAsRead = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isRead: true } : item
    ))
  }

  const handleMarkAsImportant = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isImportant: !item.isImportant } : item
    ))
  }

  const handleArchive = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isArchived: true } : item
    ))
  }

  const handleBulkAction = (action: string) => {
    selectedItems.forEach(itemId => {
      switch (action) {
        case 'mark-read':
          handleMarkAsRead(itemId)
          break
        case 'mark-unread':
          setItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, isRead: false } : item
          ))
          break
        case 'mark-important':
          handleMarkAsImportant(itemId)
          break
        case 'archive':
          handleArchive(itemId)
          break
        case 'delete':
          setItems(prev => prev.filter(item => item.id !== itemId))
          break
      }
    })
    setSelectedItems([])
  }

  const getPlatformIcon = (platform: string) => {
    const icons = {
      linkedin: '💼',
      twitter: '🐦',
      facebook: '📘',
      instagram: '📷',
      youtube: '📺',
      tiktok: '🎵',
      pinterest: '📌',
      reddit: '🤖'
    }
    return icons[platform as keyof typeof icons] || '📱'
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      message: MessageSquare,
      comment: MessageCircle,
      notification: Bell,
      post: Share2
    }
    const IconComponent = icons[type as keyof typeof icons] || MessageSquare
    return <IconComponent className="h-4 w-4" />
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-400'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-400'
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Universal Inbox
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {stats?.totalItems} total items • {stats?.unreadItems} unread
          </p>
        </div>

        {/* Inbox List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {inboxes.map((inbox) => (
              <button
                key={inbox.id}
                onClick={() => setSelectedInbox(inbox.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedInbox === inbox.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getPlatformIcon(inbox.id)}</span>
                  <div>
                    <div className="font-medium">{inbox.name}</div>
                    <div className="text-sm text-gray-500">{inbox.count} items</div>
                  </div>
                </div>
                {inbox.unread > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {inbox.unread}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-medium mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unread</span>
                <span className="font-medium">{stats.unreadItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Important</span>
                <span className="font-medium">{stats.importantItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Response</span>
                <span className="font-medium">{stats.averageResponseTime}h</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inbox..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="sender">Sender</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Platform</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All platforms</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="message">Messages</SelectItem>
                      <SelectItem value="comment">Comments</SelectItem>
                      <SelectItem value="notification">Notifications</SelectItem>
                      <SelectItem value="post">Posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  {selectedItems.length} items selected
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('mark-read')}>
                    <Check className="h-4 w-4 mr-1" />
                    Mark Read
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('mark-important')}>
                    <Star className="h-4 w-4 mr-1" />
                    Mark Important
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedItems([])}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Inbox className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !item.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  } ${item.isImportant ? 'ring-2 ring-yellow-200' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(prev => [...prev, item.id])
                          } else {
                            setSelectedItems(prev => prev.filter(id => id !== item.id))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getPlatformIcon(item.platform)}</span>
                          {getTypeIcon(item.type)}
                          <span className="text-sm font-medium capitalize">{item.type}</span>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                          {item.isImportant && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          {!item.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {item.data.sender?.displayName || item.data.author?.displayName || 'Unknown'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {item.data.content || item.data.message || 'No content'}
                        </p>

                        {item.tags.length > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="capitalize">{item.platform}</span>
                          <span className="capitalize">{item.priority} priority</span>
                          {item.data.engagement && (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {item.data.engagement.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {item.data.engagement.comments || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="h-3 w-3" />
                                {item.data.engagement.shares || 0}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleMarkAsRead(item.id)}>
                            {item.isRead ? <Eye className="h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            {item.isRead ? 'Mark Unread' : 'Mark Read'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkAsImportant(item.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            {item.isImportant ? 'Remove Important' : 'Mark Important'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchive(item.id)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Forward className="h-4 w-4 mr-2" />
                            Forward
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Panel */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getPlatformIcon(selectedItem.platform)}
                {getTypeIcon(selectedItem.type)}
                <span className="capitalize">{selectedItem.type}</span>
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(selectedItem.priority)}`} />
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {selectedItem.data.sender?.displayName || selectedItem.data.author?.displayName || 'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatTimeAgo(selectedItem.createdAt)} • {selectedItem.platform}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    <Forward className="h-4 w-4 mr-1" />
                    Forward
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">
                  {selectedItem.data.content || selectedItem.data.message || 'No content available'}
                </p>
              </div>

              {selectedItem.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex items-center gap-1">
                    {selectedItem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(selectedItem.id)}>
                  {selectedItem.isRead ? <Eye className="h-4 w-4 mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                  {selectedItem.isRead ? 'Mark Unread' : 'Mark Read'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleMarkAsImportant(selectedItem.id)}>
                  <Star className="h-4 w-4 mr-1" />
                  {selectedItem.isImportant ? 'Remove Important' : 'Mark Important'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleArchive(selectedItem.id)}>
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
