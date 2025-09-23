"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  Filter, 
  Target, 
  Users, 
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share,
  Star,
  MoreHorizontal,
  Folder,
  File,
  Image,
  Video,
  Music,
  Archive,
  Code,
  Database,
  Globe,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  User,
  UserCheck,
  UserX,
  MessageSquare,
  Heart,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  Zap,
  Brain,
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Smartphone,
  Laptop,
  Camera,
  Palette,
  BookOpen,
  Gamepad2,
  Shield,
  Info,
  X,
  Check,
  PlusCircle,
  MinusCircle,
  FolderOpen,
  FolderPlus,
  FilePlus,
  FileMinus,
  FileCheck,
  FileX,
  FileEdit,
  FileSearch,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileDatabase,
  FileGlobe,
  FileLock,
  FileUnlock,
  FileClock,
  FileCalendar,
  FileUser,
  FileMessage,
  FileHeart,
  FileTrending,
  FileBarChart,
  FileSettings,
  FileRefresh,
  FileArrow,
  FileMaximize,
  FileMinimize,
  FileZoom,
  FileRotate,
  FileActivity,
  FileZap,
  FileBrain,
  FileAward,
  FileBriefcase,
  FileGraduation,
  FileMap,
  FilePhone,
  FileMail,
  FileSmartphone,
  FileLaptop,
  FileCamera,
  FilePalette,
  FileBook,
  FileGame,
  FileShield,
  FileInfo
} from "lucide-react"
import { Project, ProjectFile } from '@/lib/supabase'

interface ProjectManagementProps {
  userId: string
}

export function ProjectManagement({ userId }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false)
  const [isUploadFileDialogOpen, setIsUploadFileDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Form states for creating projects
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectStatus, setNewProjectStatus] = useState<'planning' | 'active' | 'completed' | 'paused' | 'archived'>('planning')
  const [newProjectAccessLevel, setNewProjectAccessLevel] = useState<'private' | 'tribe' | 'public'>('tribe')
  const [newProjectFileSharing, setNewProjectFileSharing] = useState(true)
  const [newProjectVersionControl, setNewProjectVersionControl] = useState(true)

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects?userId=${userId}`)
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Load project files
  const loadProjectFiles = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/files`)
      const data = await response.json()
      setProjectFiles(data.files || [])
    } catch (error) {
      console.error('Error loading project files:', error)
    }
  }, [])

  // Create project
  const createProject = async () => {
    if (!newProjectName.trim()) return

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: newProjectName,
          description: newProjectDescription,
          status: newProjectStatus,
          access_level: newProjectAccessLevel,
          file_sharing_enabled: newProjectFileSharing,
          version_control_enabled: newProjectVersionControl
        })
      })

      if (response.ok) {
        await loadProjects()
        setIsCreateProjectDialogOpen(false)
        resetProjectForm()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  // Upload files
  const uploadFiles = async () => {
    if (selectedFiles.length === 0 || !selectedProject) return

    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })
      formData.append('projectId', selectedProject.id)

      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await loadProjectFiles(selectedProject.id)
        setIsUploadFileDialogOpen(false)
        setSelectedFiles([])
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    }
  }

  // Reset form
  const resetProjectForm = () => {
    setNewProjectName('')
    setNewProjectDescription('')
    setNewProjectStatus('planning')
    setNewProjectAccessLevel('tribe')
    setNewProjectFileSharing(true)
    setNewProjectVersionControl(true)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get access level color
  const getAccessLevelColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'private':
        return 'bg-red-100 text-red-800'
      case 'tribe':
        return 'bg-blue-100 text-blue-800'
      case 'public':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'image':
        return <Image className="h-4 w-4" alt="" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'archive':
        return <Archive className="h-4 w-4" />
      case 'code':
        return <Code className="h-4 w-4" />
      case 'database':
        return <Database className="h-4 w-4" />
      case 'web':
        return <Globe className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  useEffect(() => {
    if (selectedProject) {
      loadProjectFiles(selectedProject.id)
    }
  }, [selectedProject, loadProjectFiles])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Management</h2>
          <p className="text-muted-foreground">Manage, Monitor, and Empower Your Projects with advanced file sharing and versioning</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new project to start your journey with advanced project management.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label htmlFor="projectDescription">Description</Label>
                  <Textarea
                    id="projectDescription"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Enter project description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="projectStatus">Status</Label>
                    <Select value={newProjectStatus} onValueChange={(value: any) => setNewProjectStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="projectAccessLevel">Access Level</Label>
                    <Select value={newProjectAccessLevel} onValueChange={(value: any) => setNewProjectAccessLevel(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="tribe">Tribe</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="fileSharing"
                      checked={newProjectFileSharing}
                      onChange={(e) => setNewProjectFileSharing(e.target.checked)}
                    />
                    <Label htmlFor="fileSharing">Enable File Sharing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="versionControl"
                      checked={newProjectVersionControl}
                      onChange={(e) => setNewProjectVersionControl(e.target.checked)}
                    />
                    <Label htmlFor="versionControl">Enable Version Control</Label>
                  </div>
                </div>
                <Button onClick={createProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projects</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProject?.id === project.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <Badge className={getAccessLevelColor(project.access_level)}>
                            {project.access_level}
                          </Badge>
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
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Details & Files */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <Tabs defaultValue="files" className="space-y-4">
              <TabsList>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Project Files</CardTitle>
                        <CardDescription>{selectedProject.name} - File Management</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog open={isUploadFileDialogOpen} onOpenChange={setIsUploadFileDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Files
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Upload Files</DialogTitle>
                              <DialogDescription>
                                Upload files to {selectedProject.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="fileInput">Select Files</Label>
                                <Input
                                  id="fileInput"
                                  type="file"
                                  multiple
                                  onChange={handleFileSelect}
                                  className="mt-1"
                                />
                              </div>
                              {selectedFiles.length > 0 && (
                                <div>
                                  <Label>Selected Files:</Label>
                                  <div className="mt-2 space-y-1">
                                    {selectedFiles.map((file, index) => (
                                      <div key={index} className="flex items-center gap-2 text-sm">
                                        {getFileTypeIcon(file.type.split('/')[0])}
                                        <span>{file.name}</span>
                                        <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <Button onClick={uploadFiles} className="w-full" disabled={selectedFiles.length === 0}>
                                Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {projectFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getFileTypeIcon(file.file_type)}
                            <div>
                              <h4 className="font-medium">{file.original_filename}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.file_size_bytes)} • Version {file.version_number}
                                {file.is_current_version && <Badge variant="outline" className="ml-2">Current</Badge>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                      
                      {projectFiles.length === 0 && (
                        <div className="text-center py-8">
                          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Files Yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Upload files to start collaborating on this project
                          </p>
                          <Button onClick={() => setIsUploadFileDialogOpen(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Files
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Status</Label>
                        <Badge className={getStatusColor(selectedProject.status)}>
                          {selectedProject.status}
                        </Badge>
                      </div>
                      <div>
                        <Label>Access Level</Label>
                        <Badge className={getAccessLevelColor(selectedProject.access_level)}>
                          {selectedProject.access_level}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedProject.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>File Sharing</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedProject.file_sharing_enabled ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">
                            {selectedProject.file_sharing_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label>Version Control</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedProject.version_control_enabled ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">
                            {selectedProject.version_control_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Team Management</h3>
                      <p className="text-muted-foreground mb-4">
                        Manage team members and their access to this project
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Team Member
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                      <p className="text-muted-foreground mb-4">
                        View detailed analytics and insights about this project
                      </p>
                      <Button>
                        <Eye className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Project</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a project from the list to view its details and manage files
                </p>
                <Button onClick={() => setIsCreateProjectDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
