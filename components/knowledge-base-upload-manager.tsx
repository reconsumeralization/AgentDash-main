"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
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
  Upload,
  Download,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Folder,
  FolderOpen,
  Database,
  MessageSquare,
  User,
  Globe,
  Link,
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
  Settings,
  Search,
  Filter,
  Sort,
  Grid,
  List,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
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
  KnowledgeBaseItem,
  KnowledgeBaseUploadSource,
  KnowledgeBaseProcessingJob,
  ITEM_TYPES,
  SOURCE_TYPES,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
} from '@/lib/knowledge-base-types'

interface KnowledgeBaseUploadManagerProps {
  knowledgeBase: KnowledgeBase
  onUploadComplete: (items: KnowledgeBaseItem[]) => void
  onUploadProgress?: (progress: number) => void
  className?: string
}

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed'
  error?: string
  preview?: string
}

interface ChatHistoryItem {
  id: string
  title: string
  content: string
  timestamp: Date
  participants: string[]
  messageCount: number
}

interface UserProfileData {
  id: string
  field: string
  value: string
  type: 'text' | 'json' | 'url' | 'file'
  lastUpdated: Date
}

interface FileManagerItem {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  size: number
  lastModified: Date
  mimeType?: string
}

const mockChatHistory: ChatHistoryItem[] = [
  {
    id: 'chat-1',
    title: 'Project Discussion - Q4 Planning',
    content: 'Discussion about Q4 planning, budget allocation, and team structure...',
    timestamp: new Date('2023-10-25'),
    participants: ['user1', 'user2', 'user3'],
    messageCount: 45
  },
  {
    id: 'chat-2',
    title: 'Technical Architecture Review',
    content: 'Review of system architecture, database design, and API specifications...',
    timestamp: new Date('2023-10-24'),
    participants: ['user1', 'user4'],
    messageCount: 23
  },
  {
    id: 'chat-3',
    title: 'Client Feedback Session',
    content: 'Client feedback on the new features and suggestions for improvements...',
    timestamp: new Date('2023-10-23'),
    participants: ['user1', 'user5', 'user6'],
    messageCount: 67
  }
]

const mockUserProfileData: UserProfileData[] = [
  {
    id: 'profile-1',
    field: 'Skills',
    value: 'JavaScript, TypeScript, React, Node.js, Python, Machine Learning',
    type: 'text',
    lastUpdated: new Date('2023-10-26')
  },
  {
    id: 'profile-2',
    field: 'Experience',
    value: JSON.stringify({
      positions: [
        { title: 'Senior Developer', company: 'Tech Corp', duration: '2020-2023' },
        { title: 'Developer', company: 'Startup Inc', duration: '2018-2020' }
      ]
    }),
    type: 'json',
    lastUpdated: new Date('2023-10-25')
  },
  {
    id: 'profile-3',
    field: 'Portfolio',
    value: 'https://portfolio.example.com',
    type: 'url',
    lastUpdated: new Date('2023-10-24')
  }
]

const mockFileManagerItems: FileManagerItem[] = [
  {
    id: 'file-1',
    name: 'project-requirements.pdf',
    path: '/documents/project-requirements.pdf',
    type: 'file',
    size: 2048576,
    lastModified: new Date('2023-10-26'),
    mimeType: 'application/pdf'
  },
  {
    id: 'file-2',
    name: 'api-documentation.md',
    path: '/docs/api-documentation.md',
    type: 'file',
    size: 512000,
    lastModified: new Date('2023-10-25'),
    mimeType: 'text/markdown'
  },
  {
    id: 'folder-1',
    name: 'project-assets',
    path: '/assets/project-assets',
    type: 'folder',
    size: 0,
    lastModified: new Date('2023-10-24')
  }
]

export function KnowledgeBaseUploadManager({
  knowledgeBase,
  onUploadComplete,
  onUploadProgress,
  className
}: KnowledgeBaseUploadManagerProps) {
  const [activeTab, setActiveTab] = useState('file-upload')
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [selectedChatHistory, setSelectedChatHistory] = useState<ChatHistoryItem[]>([])
  const [selectedProfileData, setSelectedProfileData] = useState<UserProfileData[]>([])
  const [selectedFileManagerItems, setSelectedFileManagerItems] = useState<FileManagerItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingJobs, setProcessingJobs] = useState<KnowledgeBaseProcessingJob[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isDragOver, setIsDragOver] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    setUploadFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const toggleChatHistorySelection = useCallback((chatId: string) => {
    setSelectedChatHistory(prev => {
      const isSelected = prev.some(chat => chat.id === chatId)
      if (isSelected) {
        return prev.filter(chat => chat.id !== chatId)
      } else {
        const chat = mockChatHistory.find(c => c.id === chatId)
        return chat ? [...prev, chat] : prev
      }
    })
  }, [])

  const toggleProfileDataSelection = useCallback((profileId: string) => {
    setSelectedProfileData(prev => {
      const isSelected = prev.some(profile => profile.id === profileId)
      if (isSelected) {
        return prev.filter(profile => profile.id !== profileId)
      } else {
        const profile = mockUserProfileData.find(p => p.id === profileId)
        return profile ? [...prev, profile] : prev
      }
    })
  }, [])

  const toggleFileManagerSelection = useCallback((itemId: string) => {
    setSelectedFileManagerItems(prev => {
      const isSelected = prev.some(item => item.id === itemId)
      if (isSelected) {
        return prev.filter(item => item.id !== itemId)
      } else {
        const item = mockFileManagerItems.find(i => i.id === itemId)
        return item ? [...prev, item] : prev
      }
    })
  }, [])

  const processUpload = useCallback(async () => {
    setIsUploading(true)
    setUploadProgress(0)

    const allItems: KnowledgeBaseItem[] = []
    const totalItems = uploadFiles.length + selectedChatHistory.length + selectedProfileData.length + selectedFileManagerItems.length
    let processedItems = 0

    try {
      // Process file uploads
      for (const uploadFile of uploadFiles) {
        const item: KnowledgeBaseItem = {
          id: `item-${Date.now()}-${Math.random()}`,
          knowledgeBaseId: knowledgeBase.id,
          name: uploadFile.file.name,
          type: uploadFile.file.type.startsWith('image/') ? 'file' : 
                uploadFile.file.type.startsWith('video/') ? 'file' :
                uploadFile.file.type.startsWith('audio/') ? 'file' : 'file',
          source: 'upload',
          content: uploadFile.file,
          metadata: {
            size: uploadFile.file.size,
            mimeType: uploadFile.file.type,
            version: '1.0.0'
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          isProcessed: false,
          isIndexed: false,
          processingStatus: 'pending',
          attachments: []
        }

        allItems.push(item)
        processedItems++
        setUploadProgress((processedItems / totalItems) * 100)
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Process chat history
      for (const chat of selectedChatHistory) {
        const item: KnowledgeBaseItem = {
          id: `item-${Date.now()}-${Math.random()}`,
          knowledgeBaseId: knowledgeBase.id,
          name: chat.title,
          type: 'chat-history',
          source: 'chat-history',
          content: chat.content,
          metadata: {
            size: chat.content.length,
            mimeType: 'text/plain',
            version: '1.0.0',
            extractedText: chat.content,
            summary: chat.content.substring(0, 200) + '...',
            keywords: chat.content.split(' ').slice(0, 10),
            entities: chat.participants
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          isProcessed: true,
          isIndexed: true,
          processingStatus: 'completed',
          attachments: []
        }

        allItems.push(item)
        processedItems++
        setUploadProgress((processedItems / totalItems) * 100)
        
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Process profile data
      for (const profile of selectedProfileData) {
        const item: KnowledgeBaseItem = {
          id: `item-${Date.now()}-${Math.random()}`,
          knowledgeBaseId: knowledgeBase.id,
          name: `${profile.field} - Profile Data`,
          type: 'profile-data',
          source: 'user-profile',
          content: profile.value,
          metadata: {
            size: profile.value.length,
            mimeType: 'application/json',
            version: '1.0.0',
            extractedText: profile.value,
            summary: `${profile.field}: ${profile.value.substring(0, 100)}...`,
            keywords: [profile.field],
            entities: [profile.field]
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          isProcessed: true,
          isIndexed: true,
          processingStatus: 'completed',
          attachments: []
        }

        allItems.push(item)
        processedItems++
        setUploadProgress((processedItems / totalItems) * 100)
        
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Process file manager items
      for (const fileItem of selectedFileManagerItems) {
        if (fileItem.type === 'file') {
          const item: KnowledgeBaseItem = {
            id: `item-${Date.now()}-${Math.random()}`,
            knowledgeBaseId: knowledgeBase.id,
            name: fileItem.name,
            type: 'file',
            source: 'file-manager',
            content: fileItem.path,
            metadata: {
              size: fileItem.size,
              mimeType: fileItem.mimeType || 'application/octet-stream',
              version: '1.0.0'
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'current-user',
            isProcessed: false,
            isIndexed: false,
            processingStatus: 'pending',
            attachments: []
          }

          allItems.push(item)
          processedItems++
          setUploadProgress((processedItems / totalItems) * 100)
          
          await new Promise(resolve => setTimeout(resolve, 400))
        }
      }

      onUploadComplete(allItems)
      onUploadProgress?.(100)

      // Clear selections
      setUploadFiles([])
      setSelectedChatHistory([])
      setSelectedProfileData([])
      setSelectedFileManagerItems([])

    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [uploadFiles, selectedChatHistory, selectedProfileData, selectedFileManagerItems, knowledgeBase.id, onUploadComplete, onUploadProgress])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" alt="" />
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />
    if (file.type.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalSelectedItems = uploadFiles.length + selectedChatHistory.length + selectedProfileData.length + selectedFileManagerItems.length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Upload to Knowledge Base</h2>
          <p className="text-gray-600">
            Add content from multiple sources to "{knowledgeBase.name}"
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {totalSelectedItems} items selected
          </Badge>
          <Button
            onClick={processUpload}
            disabled={totalSelectedItems === 0 || isUploading}
            className="min-w-32"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Upload Progress</span>
                <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="file-upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="chat-history" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat History
          </TabsTrigger>
          <TabsTrigger value="profile-data" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Data
          </TabsTrigger>
          <TabsTrigger value="file-manager" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            File Manager
          </TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="file-upload" className="space-y-4">
          {/* Drop Zone */}
          <Card>
            <CardContent className="p-6">
              <div
                ref={dropZoneRef}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
                <p className="text-gray-600 mb-4">
                  Support for PDF, DOC, TXT, MD, JSON, and more
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Files */}
          {uploadFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Selected Files ({uploadFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uploadFiles.map((uploadFile) => (
                    <div
                      key={uploadFile.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(uploadFile.file)}
                        <div>
                          <p className="font-medium">{uploadFile.file.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{uploadFile.status}</Badge>
                        <Button
                          onClick={() => removeFile(uploadFile.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chat History Tab */}
        <TabsContent value="chat-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat History ({selectedChatHistory.length} selected)
              </CardTitle>
              <CardDescription>
                Select chat conversations to add to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockChatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedChatHistory.some(c => c.id === chat.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleChatHistorySelection(chat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{chat.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {chat.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{chat.messageCount} messages</span>
                          <span>{chat.participants.length} participants</span>
                          <span>{chat.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Checkbox
                        checked={selectedChatHistory.some(c => c.id === chat.id)}
                        onChange={() => toggleChatHistorySelection(chat.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Data Tab */}
        <TabsContent value="profile-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Data ({selectedProfileData.length} selected)
              </CardTitle>
              <CardDescription>
                Select profile information to add to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockUserProfileData.map((profile) => (
                  <div
                    key={profile.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProfileData.some(p => p.id === profile.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleProfileDataSelection(profile.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{profile.field}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {profile.value}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <Badge variant="outline">{profile.type}</Badge>
                          <span>Updated {profile.lastUpdated.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Checkbox
                        checked={selectedProfileData.some(p => p.id === profile.id)}
                        onChange={() => toggleProfileDataSelection(profile.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Manager Tab */}
        <TabsContent value="file-manager" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                File Manager ({selectedFileManagerItems.length} selected)
              </CardTitle>
              <CardDescription>
                Select files from your file manager to add to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockFileManagerItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFileManagerItems.some(i => i.id === item.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleFileManagerSelection(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {item.type === 'folder' ? (
                          <FolderOpen className="h-5 w-5 text-blue-500" />
                        ) : (
                          <File className="h-5 w-5 text-gray-500" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.path}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            {item.type === 'file' && (
                              <>
                                <span>{formatFileSize(item.size)}</span>
                                {item.mimeType && <span>{item.mimeType}</span>}
                              </>
                            )}
                            <span>Modified {item.lastModified.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Checkbox
                        checked={selectedFileManagerItems.some(i => i.id === item.id)}
                        onChange={() => toggleFileManagerSelection(item.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Summary */}
      {totalSelectedItems > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{uploadFiles.length}</div>
                <div className="text-sm text-gray-600">Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedChatHistory.length}</div>
                <div className="text-sm text-gray-600">Chats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{selectedProfileData.length}</div>
                <div className="text-sm text-gray-600">Profile Data</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{selectedFileManagerItems.length}</div>
                <div className="text-sm text-gray-600">File Manager</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
