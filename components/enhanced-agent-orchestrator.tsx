"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Label } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Separator } from "@/components/ui"
import { 
  X, Sparkles, Brain, FileText, Zap, Users, Play, Pause, RotateCcw, 
  CheckCircle, AlertCircle, Clock, Eye, Settings, Plus, Trash2, 
  Activity, TrendingUp, BarChart3, Network, MessageSquare, 
  Database, Cpu, MemoryStick, HardDrive, Wifi, WifiOff,
  ArrowRight, ArrowLeft, Target, Lightbulb, Code, Palette,
  Calculator, Search, Globe, Shield, Lock, Unlock, Edit,
  Copy, Download, Upload, RefreshCw, Filter, SortAsc,
  Monitor, Smartphone, Tablet, Server, Cloud, Layers
} from "lucide-react"

interface AgentOrchestratorProps {
  isOpen: boolean
  onClose: () => void
}

interface Agent {
  id: string
  name: string
  type: "context" | "expert" | "research" | "prompt" | "vision" | "code" | "data" | "enterprise"
  status: "idle" | "working" | "complete" | "error" | "offline"
  progress: number
  description: string
  expertise: string[]
  model: string
  performance: {
    accuracy: number
    speed: number
    reliability: number
  }
  metrics: {
    tasksCompleted: number
    averageResponseTime: number
    successRate: number
    uptime: number
  }
  resources: {
    cpu: number
    memory: number
    storage: number
    network: boolean
  }
  configuration: {
    temperature: number
    maxTokens: number
    timeout: number
    retries: number
  }
  logs: LogEntry[]
  lastActivity: Date
}

interface LogEntry {
  id: string
  timestamp: Date
  level: "info" | "warning" | "error" | "success"
  message: string
  agentId: string
  taskId?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "complete" | "failed" | "cancelled"
  assignedAgents: string[]
  progress: number
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  estimatedDuration: number
  actualDuration?: number
  dependencies: string[]
  results: any
  createdAt: Date
  updatedAt: Date
}

interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: "draft" | "active" | "paused" | "completed"
  executionCount: number
  successRate: number
  lastRun?: Date
}

interface WorkflowStep {
  id: string
  name: string
  agentId: string
  type: "action" | "condition" | "loop" | "parallel"
  config: any
  dependencies: string[]
}

interface SystemMetrics {
  totalAgents: number
  activeAgents: number
  totalTasks: number
  completedTasks: number
  systemLoad: number
  memoryUsage: number
  networkLatency: number
}

export function EnhancedAgentOrchestrator({ isOpen, onClose }: AgentOrchestratorProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalAgents: 0,
    activeAgents: 0,
    totalTasks: 0,
    completedTasks: 0,
    systemLoad: 0,
    memoryUsage: 0,
    networkLatency: 0
  })
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreatingAgent, setIsCreatingAgent] = useState(false)
  const [agentCreationProgress, setAgentCreationProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("agents")
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isSystemRunning, setIsSystemRunning] = useState(true)

  // Available AI models with capabilities
  const availableModels = [
    { 
      id: "gemma-3-27b", 
      name: "Gemma-3-27b-it", 
      capabilities: ["reasoning", "code", "analysis", "mathematics"],
      type: "text",
      maxTokens: 8192,
      cost: 0.002
    },
    { 
      id: "qwen2-5-vl-72b", 
      name: "Qwen2.5-VL-72B", 
      capabilities: ["vision", "multimodal", "analysis", "image-generation"],
      type: "multimodal",
      maxTokens: 4096,
      cost: 0.004
    },
    { 
      id: "claude-3-5-sonnet", 
      name: "Claude 3.5 Sonnet", 
      capabilities: ["reasoning", "code", "analysis", "creative"],
      type: "text",
      maxTokens: 200000,
      cost: 0.003
    },
    { 
      id: "gpt-4o", 
      name: "GPT-4o", 
      capabilities: ["reasoning", "code", "analysis", "multimodal"],
      type: "multimodal",
      maxTokens: 128000,
      cost: 0.005
    }
  ]

  const agentTemplates = [
    {
      type: "vision" as const,
      name: "Vision Analysis Agent",
      description: "Advanced image and video analysis with multimodal understanding",
      expertise: ["Computer Vision", "Image Processing", "Object Detection", "Scene Understanding"],
      model: "qwen2-5-vl-72b"
    },
    {
      type: "code" as const,
      name: "Code Generation Agent",
      description: "Expert in software development and code generation",
      expertise: ["Software Development", "Code Review", "Architecture Design", "Debugging"],
      model: "gemma-3-27b"
    },
    {
      type: "data" as const,
      name: "Data Science Agent",
      description: "Advanced data analysis and machine learning capabilities",
      expertise: ["Data Analysis", "Machine Learning", "Statistics", "Visualization"],
      model: "claude-3-5-sonnet"
    },
    {
      type: "enterprise" as const,
      name: "Enterprise Analysis Agent",
      description: "Business intelligence and enterprise solutions",
      expertise: ["Business Analysis", "Process Optimization", "Strategy", "Compliance"],
      model: "gpt-4o"
    }
  ]

  // Initialize with sample data
  useEffect(() => {
    const sampleAgents: Agent[] = [
      {
        id: "agent-1",
        name: "Context Analyzer",
        type: "context",
        status: "idle",
        progress: 0,
        description: "Analyzes task context and requirements with advanced NLP",
        expertise: ["Context Analysis", "Requirement Extraction", "Task Alignment", "NLP"],
        model: "claude-3-5-sonnet",
        performance: { accuracy: 94, speed: 85, reliability: 98 },
        metrics: { tasksCompleted: 1247, averageResponseTime: 2.3, successRate: 96, uptime: 99.8 },
        resources: { cpu: 45, memory: 62, storage: 78, network: true },
        configuration: { temperature: 0.7, maxTokens: 4000, timeout: 30, retries: 3 },
        logs: [],
        lastActivity: new Date()
      },
      {
        id: "agent-2",
        name: "Research Specialist",
        type: "research",
        status: "working",
        progress: 67,
        description: "Gathers and synthesizes information from multiple sources",
        expertise: ["Information Gathering", "Domain Research", "Knowledge Synthesis", "Fact Checking"],
        model: "gpt-4o",
        performance: { accuracy: 91, speed: 78, reliability: 95 },
        metrics: { tasksCompleted: 892, averageResponseTime: 4.1, successRate: 93, uptime: 98.5 },
        resources: { cpu: 78, memory: 85, storage: 45, network: true },
        configuration: { temperature: 0.5, maxTokens: 8000, timeout: 60, retries: 2 },
        logs: [],
        lastActivity: new Date()
      }
    ]

    const sampleTasks: Task[] = [
      {
        id: "task-1",
        title: "Market Research Analysis",
        description: "Analyze current market trends for AI-powered productivity tools",
        status: "in-progress",
        assignedAgents: ["agent-2"],
        progress: 67,
        priority: "high",
        category: "Research",
        estimatedDuration: 120,
        dependencies: [],
        results: null,
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date()
      },
      {
        id: "task-2",
        title: "Code Review and Optimization",
        description: "Review and optimize the main application performance",
        status: "pending",
        assignedAgents: [],
        progress: 0,
        priority: "medium",
        category: "Development",
        estimatedDuration: 180,
        dependencies: ["task-1"],
        results: null,
        createdAt: new Date(Date.now() - 1800000),
        updatedAt: new Date()
      }
    ]

    const sampleWorkflows: Workflow[] = [
      {
        id: "workflow-1",
        name: "Content Generation Pipeline",
        description: "Automated content creation and review workflow",
        steps: [
          {
            id: "step-1",
            name: "Research Phase",
            agentId: "agent-2",
            type: "action",
            config: { query: "trending topics", sources: 5 },
            dependencies: []
          },
          {
            id: "step-2",
            name: "Content Creation",
            agentId: "agent-1",
            type: "action",
            config: { style: "professional", length: "medium" },
            dependencies: ["step-1"]
          }
        ],
        status: "active",
        executionCount: 45,
        successRate: 89,
        lastRun: new Date()
      }
    ]

    setAgents(sampleAgents)
    setTasks(sampleTasks)
    setWorkflows(sampleWorkflows)
    updateSystemMetrics(sampleAgents, sampleTasks)
  }, [])

  // Real-time system monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.status === "working" && agent.progress < 100) {
          const newProgress = Math.min(agent.progress + Math.random() * 10, 100)
          return {
            ...agent,
            progress: newProgress,
            status: newProgress >= 100 ? "complete" : "working",
            lastActivity: new Date()
          }
        }
        return agent
      }))

      updateSystemMetrics(agents, tasks)
    }, 2000)

    return () => clearInterval(interval)
  }, [agents, tasks])

  const updateSystemMetrics = (agentList: Agent[], taskList: Task[]) => {
    setSystemMetrics({
      totalAgents: agentList.length,
      activeAgents: agentList.filter(a => a.status === "working").length,
      totalTasks: taskList.length,
      completedTasks: taskList.filter(t => t.status === "complete").length,
      systemLoad: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      networkLatency: Math.random() * 50
    })
  }

  const createAgent = async (template: typeof agentTemplates[0]) => {
    setIsCreatingAgent(true)
    setAgentCreationProgress(0)

    const progressSteps = [
      { step: 20, message: "Initializing agent core..." },
      { step: 40, message: "Loading AI model..." },
      { step: 60, message: "Configuring capabilities..." },
      { step: 80, message: "Running diagnostics..." },
      { step: 100, message: "Agent ready!" }
    ]

    for (const { step } of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAgentCreationProgress(step)
    }

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: template.name,
      type: template.type,
      status: "idle",
      progress: 0,
      description: template.description,
      expertise: template.expertise,
      model: template.model,
      performance: {
        accuracy: Math.floor(Math.random() * 20) + 80,
        speed: Math.floor(Math.random() * 30) + 70,
        reliability: Math.floor(Math.random() * 10) + 90
      },
      metrics: {
        tasksCompleted: 0,
        averageResponseTime: Math.random() * 5 + 1,
        successRate: Math.floor(Math.random() * 10) + 90,
        uptime: 100
      },
      resources: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        storage: Math.random() * 100,
        network: true
      },
      configuration: {
        temperature: 0.7,
        maxTokens: 4000,
        timeout: 30,
        retries: 3
      },
      logs: [],
      lastActivity: new Date()
    }

    setAgents(prev => [...prev, newAgent])
    setIsCreatingAgent(false)
    setAgentCreationProgress(0)
  }

  const startAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: "working", progress: 0, lastActivity: new Date() }
        : agent
    ))
  }

  const stopAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: "idle", progress: 0, lastActivity: new Date() }
        : agent
    ))
  }

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "working":
        return <Activity className="h-4 w-4 text-green-500 animate-pulse" />
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "offline":
        return <WifiOff className="h-4 w-4 text-gray-500" />
      default:
        return <Pause className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200"
      case "high": return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Main Panel */}
      <div className="relative w-full max-w-7xl mx-auto my-4 bg-card border border-border rounded-lg shadow-2xl">
        <div className="h-[calc(100vh-2rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Enhanced Agent Orchestrator</h2>
                <p className="text-muted-foreground">AI-powered multi-agent system management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                isSystemRunning 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isSystemRunning ? 'bg-green-500' : 'bg-red-500'}`} />
                {isSystemRunning ? 'System Online' : 'System Offline'}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* System Metrics */}
          <div className="p-6 border-b border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{systemMetrics.totalAgents}</div>
                <div className="text-xs text-muted-foreground">Total Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemMetrics.activeAgents}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemMetrics.totalTasks}</div>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemMetrics.completedTasks}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(systemMetrics.systemLoad)}%</div>
                <div className="text-xs text-muted-foreground">System Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">{Math.round(systemMetrics.memoryUsage)}%</div>
                <div className="text-xs text-muted-foreground">Memory</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{Math.round(systemMetrics.networkLatency)}ms</div>
                <div className="text-xs text-muted-foreground">Latency</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-6 py-3 border-b border-border">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="agents" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Agents
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger value="workflows" className="flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Workflows
                  </TabsTrigger>
                  <TabsTrigger value="monitoring" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Monitoring
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="agents" className="flex-1 overflow-hidden">
                <div className="h-full flex">
                  {/* Agent List */}
                  <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
                    <div className="space-y-4">
                      {/* Agent Creation */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            Create New Agent
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            {agentTemplates.map((template) => (
                              <Button
                                key={template.type}
                                variant="outline"
                                size="sm"
                                onClick={() => createAgent(template)}
                                disabled={isCreatingAgent}
                                className="h-auto p-3 flex flex-col items-start gap-1"
                              >
                                <div className="flex items-center gap-2">
                                  {template.type === "vision" && <Eye className="h-3 w-3" />}
                                  {template.type === "code" && <Code className="h-3 w-3" />}
                                  {template.type === "data" && <BarChart3 className="h-3 w-3" />}
                                  {template.type === "enterprise" && <Shield className="h-3 w-3" />}
                                  <span className="font-medium">{template.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground text-left">
                                  {template.expertise.slice(0, 2).join(", ")}
                                </span>
                              </Button>
                            ))}
                          </div>
                          
                          {isCreatingAgent && (
                            <div className="mt-4 space-y-2">
                              <Progress value={agentCreationProgress} className="h-2" />
                              <p className="text-xs text-muted-foreground text-center">
                                Creating specialized agent... {agentCreationProgress}%
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Agent List */}
                      <div className="space-y-3">
                        {agents.map((agent) => (
                          <Card 
                            key={agent.id} 
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedAgent(agent)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(agent.status)}
                                  <span className="font-medium">{agent.name}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {agent.type}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                              
                              <div className="flex flex-wrap gap-1 mb-3">
                                {agent.expertise.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {agent.expertise.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{agent.expertise.length - 3}
                                  </Badge>
                                )}
                              </div>

                              {agent.status === "working" && (
                                <Progress value={agent.progress} className="h-1 mb-2" />
                              )}

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Model: {agent.model}</span>
                                <span>{agent.metrics.successRate}% success</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Agent Details */}
                  <div className="w-1/2 p-6 overflow-y-auto">
                    {selectedAgent ? (
                      <div className="space-y-6">
                        {/* Agent Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{selectedAgent.name}</h3>
                            <p className="text-muted-foreground">{selectedAgent.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => startAgent(selectedAgent.id)}
                              disabled={selectedAgent.status === "working"}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => stopAgent(selectedAgent.id)}
                              disabled={selectedAgent.status !== "working"}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Stop
                            </Button>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Performance Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {selectedAgent.performance.accuracy}%
                                </div>
                                <div className="text-xs text-muted-foreground">Accuracy</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {selectedAgent.performance.speed}%
                                </div>
                                <div className="text-xs text-muted-foreground">Speed</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {selectedAgent.performance.reliability}%
                                </div>
                                <div className="text-xs text-muted-foreground">Reliability</div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Tasks Completed:</span>
                                <span className="ml-2 font-medium">{selectedAgent.metrics.tasksCompleted}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Avg Response Time:</span>
                                <span className="ml-2 font-medium">{selectedAgent.metrics.averageResponseTime}s</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Success Rate:</span>
                                <span className="ml-2 font-medium">{selectedAgent.metrics.successRate}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Uptime:</span>
                                <span className="ml-2 font-medium">{selectedAgent.metrics.uptime}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Resource Usage */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Resource Usage</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Cpu className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">CPU</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={selectedAgent.resources.cpu} className="w-24 h-2" />
                                <span className="text-sm font-medium">{Math.round(selectedAgent.resources.cpu)}%</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MemoryStick className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Memory</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={selectedAgent.resources.memory} className="w-24 h-2" />
                                <span className="text-sm font-medium">{Math.round(selectedAgent.resources.memory)}%</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4 text-orange-500" />
                                <span className="text-sm">Storage</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={selectedAgent.resources.storage} className="w-24 h-2" />
                                <span className="text-sm font-medium">{Math.round(selectedAgent.resources.storage)}%</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {selectedAgent.resources.network ? (
                                  <Wifi className="h-4 w-4 text-green-500" />
                                ) : (
                                  <WifiOff className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm">Network</span>
                              </div>
                              <Badge variant={selectedAgent.resources.network ? "default" : "destructive"} className="text-xs">
                                {selectedAgent.resources.network ? "Connected" : "Disconnected"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Configuration */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Configuration</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Temperature:</span>
                              <span className="font-medium">{selectedAgent.configuration.temperature}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Tokens:</span>
                              <span className="font-medium">{selectedAgent.configuration.maxTokens}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Timeout:</span>
                              <span className="font-medium">{selectedAgent.configuration.timeout}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Retries:</span>
                              <span className="font-medium">{selectedAgent.configuration.retries}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Select an agent to view details</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="flex-1 overflow-hidden p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Task Management</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      New Task
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{task.title}</CardTitle>
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={task.status === "complete" ? "default" : "secondary"} className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                          
                          <Progress value={task.progress} className="h-2" />
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{task.category}</span>
                            <span>{task.estimatedDuration}min</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" className="flex-1">
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="workflows" className="flex-1 overflow-hidden p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Workflow Automation</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      New Workflow
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workflows.map((workflow) => (
                      <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-sm">{workflow.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{workflow.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={workflow.status === "active" ? "default" : "secondary"} className="text-xs">
                              {workflow.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">Executions:</span>
                              <span className="ml-1 font-medium">{workflow.executionCount}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Success Rate:</span>
                              <span className="ml-1 font-medium">{workflow.successRate}%</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" className="flex-1">
                              <Play className="h-3 w-3 mr-1" />
                              Run
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="flex-1 overflow-hidden p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">System Monitoring</h3>
                  
                  {/* Real-time Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">System Load</p>
                            <p className="text-2xl font-bold">{Math.round(systemMetrics.systemLoad)}%</p>
                          </div>
                          <Activity className="h-8 w-8 text-blue-500" />
                        </div>
                        <Progress value={systemMetrics.systemLoad} className="mt-2" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Memory Usage</p>
                            <p className="text-2xl font-bold">{Math.round(systemMetrics.memoryUsage)}%</p>
                          </div>
                          <MemoryStick className="h-8 w-8 text-green-500" />
                        </div>
                        <Progress value={systemMetrics.memoryUsage} className="mt-2" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Network Latency</p>
                            <p className="text-2xl font-bold">{Math.round(systemMetrics.networkLatency)}ms</p>
                          </div>
                          <Wifi className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Agent Performance Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Agent Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {agents.map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between p-3 border border-border rounded">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(agent.status)}
                              <span className="font-medium">{agent.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Tasks: </span>
                                <span className="font-medium">{agent.metrics.tasksCompleted}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Success: </span>
                                <span className="font-medium">{agent.metrics.successRate}%</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Uptime: </span>
                                <span className="font-medium">{agent.metrics.uptime}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="flex-1 overflow-hidden p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">System Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">General Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Default Model</Label>
                          <Select defaultValue="claude-3-5-sonnet">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableModels.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Auto-scaling</Label>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Enable automatic agent scaling</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Monitoring</Label>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Enable real-time monitoring</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Performance Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Max Concurrent Tasks</Label>
                          <Input type="number" defaultValue="10" className="w-20" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Task Timeout (seconds)</Label>
                          <Input type="number" defaultValue="300" className="w-20" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Retry Attempts</Label>
                          <Input type="number" defaultValue="3" className="w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
