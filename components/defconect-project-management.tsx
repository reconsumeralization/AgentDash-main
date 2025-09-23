"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Avatar, AvatarFallback } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import {
  Users,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  MessageSquare,
  FileText,
  BarChart3,
  TrendingUp,
  Heart,
  Zap,
  Brain,
  Star,
  ArrowRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from "lucide-react"

interface TribeProject {
  id: string
  name: string
  description: string
  tribeId: string
  tribeName: string
  status: 'planning' | 'active' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  startDate: Date
  targetDate: Date
  sharedAspirations: string[]
  teamMembers: ProjectMember[]
  milestones: Milestone[]
  tasks: ProjectTask[]
  collaborationScore: number
  aspirationAlignment: number
  createdAt: Date
}

interface ProjectMember {
  id: string
  name: string
  role: string
  avatar: string
  aspirationContribution: string
  tasksCompleted: number
  totalTasks: number
  engagementLevel: number
}

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: Date
  completed: boolean
  aspirationAligned: boolean
}

interface ProjectTask {
  id: string
  title: string
  description: string
  assignee: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: Date
  aspirationTag: string
  estimatedHours: number
  actualHours?: number
}

export function DefConectProjectManagement() {
  const [projects, _setProjects] = useState<TribeProject[]>([
    {
      id: '1',
      name: 'Inclusive AR Navigation App',
      description: 'Building an augmented reality navigation app with accessibility features for visually impaired users',
      tribeId: '1',
      tribeName: 'Accessibility Innovators',
      status: 'active',
      priority: 'high',
      progress: 65,
      startDate: new Date('2024-08-01'),
      targetDate: new Date('2024-12-31'),
      sharedAspirations: ['Accessibility Innovation', 'AR/VR Design', 'Inclusive Technology'],
      teamMembers: [
        {
          id: '1',
          name: 'Sarah Chen',
          role: 'UX Designer',
          avatar: '/placeholder-user.jpg',
          aspirationContribution: 'Accessibility Innovation',
          tasksCompleted: 8,
          totalTasks: 10,
          engagementLevel: 95
        },
        {
          id: '2',
          name: 'Marcus Rodriguez',
          role: 'Product Manager',
          avatar: '/placeholder-user.jpg',
          aspirationContribution: 'Sustainable Product Development',
          tasksCompleted: 6,
          totalTasks: 8,
          engagementLevel: 88
        }
      ],
      milestones: [
        {
          id: '1',
          title: 'User Research Complete',
          description: 'Complete accessibility user interviews and research',
          dueDate: new Date('2024-09-15'),
          completed: true,
          aspirationAligned: true
        },
        {
          id: '2',
          title: 'Prototype Development',
          description: 'Build initial AR navigation prototype',
          dueDate: new Date('2024-11-01'),
          completed: false,
          aspirationAligned: true
        }
      ],
      tasks: [
        {
          id: '1',
          title: 'Conduct user interviews with accessibility experts',
          description: 'Interview 10 accessibility experts about AR navigation needs',
          assignee: 'Sarah Chen',
          status: 'completed',
          priority: 'high',
          dueDate: new Date('2024-09-10'),
          aspirationTag: 'Accessibility Innovation',
          estimatedHours: 16,
          actualHours: 18
        },
        {
          id: '2',
          title: 'Design AR interface wireframes',
          description: 'Create wireframes for AR navigation interface with accessibility features',
          assignee: 'Sarah Chen',
          status: 'in_progress',
          priority: 'high',
          dueDate: new Date('2024-09-25'),
          aspirationTag: 'AR/VR Design',
          estimatedHours: 24
        }
      ],
      collaborationScore: 92,
      aspirationAlignment: 95,
      createdAt: new Date('2024-08-01')
    },
    {
      id: '2',
      name: 'Climate Impact Analytics Platform',
      description: 'Building a platform to measure and visualize corporate climate impact',
      tribeId: '2',
      tribeName: 'Climate Tech Leaders',
      status: 'planning',
      priority: 'critical',
      progress: 25,
      startDate: new Date('2024-10-01'),
      targetDate: new Date('2025-03-31'),
      sharedAspirations: ['Climate Tech Leadership', 'Sustainable Development', 'Data Analytics'],
      teamMembers: [
        {
          id: '2',
          name: 'Marcus Rodriguez',
          role: 'Product Manager',
          avatar: '/placeholder-user.jpg',
          aspirationContribution: 'Climate Tech Leadership',
          tasksCompleted: 2,
          totalTasks: 5,
          engagementLevel: 90
        },
        {
          id: '3',
          name: 'Dr. Aisha Patel',
          role: 'AI Research Scientist',
          avatar: '/placeholder-user.jpg',
          aspirationContribution: 'AI Ethics',
          tasksCompleted: 1,
          totalTasks: 3,
          engagementLevel: 85
        }
      ],
      milestones: [
        {
          id: '3',
          title: 'Requirements Gathering',
          description: 'Define platform requirements with climate experts',
          dueDate: new Date('2024-10-15'),
          completed: false,
          aspirationAligned: true
        }
      ],
      tasks: [
        {
          id: '3',
          title: 'Research climate impact metrics',
          description: 'Identify key metrics for measuring corporate climate impact',
          assignee: 'Marcus Rodriguez',
          status: 'in_progress',
          priority: 'high',
          dueDate: new Date('2024-10-10'),
          aspirationTag: 'Climate Tech Leadership',
          estimatedHours: 20
        }
      ],
      collaborationScore: 87,
      aspirationAlignment: 90,
      createdAt: new Date('2024-09-15')
    }
  ])

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-purple-100 text-purple-800'
      case 'todo': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning')
  const completedProjects = projects.filter(p => p.status === 'completed')

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            DefConect Project Management
          </h2>
          <p className="text-muted-foreground">
            Build dream teams and manage projects where every member is genuinely invested
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Tribe Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Projects</p>
                <p className="text-2xl font-bold">{completedProjects.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Aspiration Alignment</p>
                <p className="text-2xl font-bold">
                  {Math.round(projects.reduce((acc, p) => acc + p.aspirationAlignment, 0) / projects.length)}%
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Collaboration</p>
                <p className="text-2xl font-bold">
                  {Math.round(projects.reduce((acc, p) => acc + p.collaborationScore, 0) / projects.length)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{project.name}</h4>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.teamMembers.length} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {project.progress}% complete
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {project.aspirationAlignment}% aligned
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aspiration-Aligned Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.flatMap(p => p.milestones.filter(m => !m.completed))
                  .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                  .slice(0, 5)
                  .map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <div>
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {milestone.dueDate.toLocaleDateString()}
                      </p>
                      {milestone.aspirationAligned && (
                        <Badge variant="outline" className="text-xs">
                          Aspiration Aligned
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Team Members</p>
                        <p className="font-medium">{project.teamMembers.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Aspiration Alignment</p>
                        <p className="font-medium">{project.aspirationAlignment}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Collaboration Score</p>
                        <p className="font-medium">{project.collaborationScore}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target Date</p>
                        <p className="font-medium">
                          {project.targetDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Shared Aspirations:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.sharedAspirations.map((aspiration) => (
                          <Badge key={aspiration} variant="secondary" className="text-xs">
                            {aspiration}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View Project
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Discuss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {projects.flatMap(project =>
                project.tasks.map(task => ({ ...task, projectName: project.name, projectId: project.id }))
              ).map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Project: {task.projectName}</span>
                          <span>Assignee: {task.assignee}</span>
                          <span>Due: {task.dueDate.toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {task.aspirationTag}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Aspiration Alignment</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Team Engagement</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">On-Time Delivery</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tribe Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{project.tribeName}</p>
                        <p className="text-xs text-muted-foreground">{project.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{project.collaborationScore}%</p>
                        <p className="text-xs text-muted-foreground">collaboration</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
