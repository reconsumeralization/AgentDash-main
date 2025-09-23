"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bot, 
  Brain, 
  Zap, 
  Target, 
  Users, 
  MessageSquare, 
  Shield, 
  Search, 
  FileText, 
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Play,
  Pause,
  Square,
  Stop,
  RefreshCw,
  Eye,
  EyeOff,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Filter,
  Sort,
  BarChart3,
  PieChart,
  LineChart,
  Network,
  Database,
  Globe,
  Smartphone,
  Laptop,
  Monitor,
  Wifi,
  Lock,
  Unlock,
  Key,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Archive,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"

interface AIAgent {
  id: string
  name: string
  type: 'knowledge' | 'research' | 'analysis' | 'security' | 'persona' | 'content' | 'workflow' | 'network'
  status: 'active' | 'inactive' | 'busy' | 'error'
  performance: number
  tasksCompleted: number
  successRate: number
  lastActive: Date
  capabilities: string[]
  currentTask?: string
  memoryUsage: number
  cpuUsage: number
}

interface Task {
  id: string
  name: string
  description: string
  assignedAgent: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  estimatedDuration: number
  actualDuration?: number
  result?: any
  error?: string
}

interface CollaborationSession {
  id: string
  name: string
  agents: string[]
  status: 'active' | 'completed' | 'paused'
  startTime: Date
  endTime?: Date
  tasks: string[]
  sharedContext: any
  performance: number
}

interface EnhancedAIOrchestrationProps {
  className?: string
}

export function EnhancedAIOrchestration({ className }: EnhancedAIOrchestrationProps) {
  const [agents, setAgents] = useState<AIAgent[]>([
    {
      id: 'analyst-agent',
      name: 'Analyst Agent',
      type: 'analysis',
      status: 'active',
      performance: 97,
      tasksCompleted: 2103,
      successRate: 98,
      lastActive: new Date(),
      capabilities: ['Data Analysis', 'Insight Generation', 'Marketing Analytics', 'Performance Optimization'],
      currentTask: 'Analyzing LinkedIn campaign performance and generating insights',
      memoryUsage: 85,
      cpuUsage: 72
    },
    {
      id: 'knowledge-agent',
      name: 'Knowledge Agent',
      type: 'knowledge',
      status: 'active',
      performance: 94,
      tasksCompleted: 1247,
      successRate: 96,
      lastActive: new Date(),
      capabilities: ['Information Retrieval', 'Knowledge Base Management', 'Query Processing'],
      currentTask: 'Processing user query about LinkedIn integration',
      memoryUsage: 68,
      cpuUsage: 45
    },
    {
      id: 'research-agent',
      name: 'Research Agent',
      type: 'research',
      status: 'active',
      performance: 89,
      tasksCompleted: 892,
      successRate: 93,
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      capabilities: ['Market Research', 'Trend Analysis', 'Competitive Intelligence'],
      currentTask: 'Analyzing competitor features',
      memoryUsage: 72,
      cpuUsage: 52
    },
    {
      id: 'analysis-agent',
      name: 'Analysis Agent',
      type: 'analysis',
      status: 'busy',
      performance: 91,
      tasksCompleted: 1563,
      successRate: 94,
      lastActive: new Date(Date.now() - 2 * 60 * 1000),
      capabilities: ['Data Analysis', 'Pattern Recognition', 'Insight Generation'],
      currentTask: 'Analyzing user engagement patterns',
      memoryUsage: 85,
      cpuUsage: 78
    },
    {
      id: 'security-agent',
      name: 'Security Agent',
      type: 'security',
      status: 'active',
      performance: 97,
      tasksCompleted: 2103,
      successRate: 98,
      lastActive: new Date(),
      capabilities: ['Threat Detection', 'Security Monitoring', 'Compliance Checking'],
      currentTask: 'Monitoring platform security',
      memoryUsage: 45,
      cpuUsage: 23
    },
    {
      id: 'persona-agent',
      name: 'Persona Agent',
      type: 'persona',
      status: 'active',
      performance: 87,
      tasksCompleted: 743,
      successRate: 91,
      lastActive: new Date(Date.now() - 1 * 60 * 1000),
      capabilities: ['User Profiling', 'Behavior Analysis', 'Personalization'],
      currentTask: 'Updating user persona models',
      memoryUsage: 58,
      cpuUsage: 34
    },
    {
      id: 'content-agent',
      name: 'Content Agent',
      type: 'content',
      status: 'inactive',
      performance: 92,
      tasksCompleted: 1089,
      successRate: 95,
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
      capabilities: ['Content Generation', 'Content Curation', 'Content Optimization'],
      memoryUsage: 42,
      cpuUsage: 18
    },
    {
      id: 'workflow-agent',
      name: 'Workflow Agent',
      type: 'workflow',
      status: 'active',
      performance: 88,
      tasksCompleted: 1674,
      successRate: 93,
      lastActive: new Date(Date.now() - 3 * 60 * 1000),
      capabilities: ['Process Automation', 'Workflow Management', 'Task Coordination'],
      currentTask: 'Optimizing user onboarding flow',
      memoryUsage: 63,
      cpuUsage: 41
    },
    {
      id: 'network-agent',
      name: 'Network Agent',
      type: 'network',
      status: 'active',
      performance: 95,
      tasksCompleted: 1456,
      successRate: 97,
      lastActive: new Date(),
      capabilities: ['Network Analysis', 'Connection Optimization', 'Relationship Mapping'],
      currentTask: 'Analyzing professional connections',
      memoryUsage: 71,
      cpuUsage: 49
    }
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      name: 'Process User Query',
      description: 'Analyze and respond to user question about LinkedIn integration',
      assignedAgent: 'knowledge-agent',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      startedAt: new Date(Date.now() - 8 * 60 * 1000),
      estimatedDuration: 300,
      actualDuration: 480
    },
    {
      id: 'task-2',
      name: 'Security Scan',
      description: 'Perform comprehensive security analysis of platform',
      assignedAgent: 'security-agent',
      status: 'completed',
      priority: 'critical',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      startedAt: new Date(Date.now() - 28 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 60 * 1000),
      estimatedDuration: 1200,
      actualDuration: 1380
    },
    {
      id: 'task-3',
      name: 'Content Generation',
      description: 'Generate personalized content recommendations for user',
      assignedAgent: 'content-agent',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      estimatedDuration: 180
    }
  ])

  const [collaborations, setCollaborations] = useState<CollaborationSession[]>([
    {
      id: 'collab-1',
      name: 'User Onboarding Optimization',
      agents: ['workflow-agent', 'persona-agent', 'analysis-agent'],
      status: 'active',
      startTime: new Date(Date.now() - 45 * 60 * 1000),
      tasks: ['task-1', 'task-3'],
      sharedContext: { userId: 'user-123', onboardingStep: 3 },
      performance: 89
    },
    {
      id: 'collab-2',
      name: 'Security Analysis',
      agents: ['security-agent', 'analysis-agent'],
      status: 'completed',
      startTime: new Date(Date.now() - 60 * 60 * 1000),
      endTime: new Date(Date.now() - 10 * 60 * 1000),
      tasks: ['task-2'],
      sharedContext: { scanType: 'comprehensive', scope: 'full-platform' },
      performance: 97
    }
  ])

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(true)

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'knowledge': return Brain
      case 'research': return Search
      case 'analysis': return BarChart3
      case 'security': return Shield
      case 'persona': return Users
      case 'content': return FileText
      case 'workflow': return Zap
      case 'network': return Network
      default: return Bot
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
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
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAgentAction = (agentId: string, action: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        switch (action) {
          case 'start':
            return { ...agent, status: 'active' as const }
          case 'pause':
            return { ...agent, status: 'inactive' as const }
          case 'stop':
            return { ...agent, status: 'inactive' as const, currentTask: undefined }
          default:
            return agent
        }
      }
      return agent
    }))
  }

  const overallPerformance = agents.reduce((acc, agent) => acc + agent.performance, 0) / agents.length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const activeCollaborations = collaborations.filter(collab => collab.status === 'active').length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced AI Orchestration</h1>
          <p className="text-gray-600">Intelligent agent coordination and task management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "default" : "outline"}
            className="flex items-center space-x-2"
          >
            {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isMonitoring ? 'Pause Monitoring' : 'Start Monitoring'}</span>
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Performance</p>
                <p className="text-3xl font-bold text-blue-600">{overallPerformance.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Progress value={overallPerformance} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-3xl font-bold text-green-600">
                  {agents.filter(agent => agent.status === 'active').length}
                </p>
              </div>
              <Bot className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                of {agents.length} total agents
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-3xl font-bold text-purple-600">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {((completedTasks / totalTasks) * 100).toFixed(1)}% completion rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Collaborations</p>
                <p className="text-3xl font-bold text-orange-600">{activeCollaborations}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Multi-agent sessions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => {
              const AgentIcon = getAgentIcon(agent.type)
              return (
                <Card key={agent.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <AgentIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription>{agent.type}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Performance</p>
                        <p className="text-2xl font-bold text-blue-600">{agent.performance}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">{agent.successRate}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tasks Completed</span>
                        <span>{agent.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                        <span>{agent.memoryUsage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>{agent.cpuUsage}%</span>
                      </div>
                    </div>

                    {agent.currentTask && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Current Task</p>
                        <p className="text-sm text-gray-900">{agent.currentTask}</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleAgentAction(agent.id, 'start')}
                        disabled={agent.status === 'active'}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAgentAction(agent.id, 'pause')}
                        disabled={agent.status === 'inactive'}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAgentAction(agent.id, 'stop')}
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Task Queue</span>
              </CardTitle>
              <CardDescription>
                Current and pending tasks across all agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{task.name}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {task.createdAt.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700">{task.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Assigned Agent</p>
                        <p className="text-sm text-gray-900">{task.assignedAgent}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Estimated Duration</p>
                        <p className="text-sm text-gray-900">{task.estimatedDuration}s</p>
                      </div>
                      {task.actualDuration && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Actual Duration</p>
                          <p className="text-sm text-gray-900">{task.actualDuration}s</p>
                        </div>
                      )}
                    </div>

                    {task.status === 'in_progress' && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <span className="text-sm text-blue-700">Task in progress...</span>
                        </div>
                      </div>
                    )}

                    {task.error && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700">Error: {task.error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborations Tab */}
        <TabsContent value="collaborations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Collaboration Sessions</span>
              </CardTitle>
              <CardDescription>
                Multi-agent collaboration and coordination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collaborations.map((collab) => (
                  <div key={collab.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{collab.name}</h4>
                        <Badge className={collab.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {collab.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">Performance</p>
                        <p className="text-lg font-bold text-green-600">{collab.performance}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Participating Agents</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {collab.agents.map((agentId) => (
                            <Badge key={agentId} variant="outline" className="text-xs">
                              {agents.find(a => a.id === agentId)?.name || agentId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Tasks</p>
                        <p className="text-sm text-gray-900">{collab.tasks.length} tasks</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Shared Context</p>
                      <pre className="text-xs text-gray-600 mt-1">
                        {JSON.stringify(collab.sharedContext, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Agent Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{agent.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${agent.performance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{agent.performance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Task Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {tasks.filter(t => t.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">In Progress</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {tasks.filter(t => t.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {tasks.filter(t => t.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Failed</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {tasks.filter(t => t.status === 'failed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
