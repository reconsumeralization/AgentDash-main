"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Label } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import {
  X,
  Sparkles,
  Brain,
  FileText,
  Zap,
  Users,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
} from "lucide-react"

interface AgentOrchestratorProps {
  isOpen: boolean
  onClose: () => void
}

interface Agent {
  id: string
  name: string
  type: "context" | "expert" | "research" | "prompt"
  status: "idle" | "working" | "complete" | "error"
  progress: number
  description: string
  expertise?: string[]
}

interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "complete"
  assignedAgents: string[]
  progress: number
}

export function AgentOrchestrator({ isOpen, onClose }: AgentOrchestratorProps) {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "context-1",
      name: "Context Analyzer",
      type: "context",
      status: "idle",
      progress: 0,
      description: "Analyzes task context and requirements",
      expertise: ["Context Analysis", "Requirement Extraction", "Task Alignment"],
    },
    {
      id: "research-1",
      name: "Research Agent",
      type: "research",
      status: "idle",
      progress: 0,
      description: "Gathers relevant information and expertise",
      expertise: ["Information Gathering", "Domain Research", "Knowledge Synthesis"],
    },
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "task-1",
      title: "Initialize Agent System",
      description: "Set up the base agent orchestration system",
      status: "complete",
      assignedAgents: ["context-1"],
      progress: 100,
    },
  ])

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [isCreatingAgent, setIsCreatingAgent] = useState(false)
  const [agentCreationProgress, setAgentCreationProgress] = useState(0)
  const [availableModels] = useState([
    { id: "gemma-3-27b", name: "Gemma-3-27b-it", capabilities: ["reasoning", "code", "analysis"] },
    { id: "qwen2-5-vl-72b", name: "Qwen2.5-VL-72B", capabilities: ["vision", "multimodal", "analysis"] },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.status === "working" && agent.progress < 100) {
            const newProgress = Math.min(agent.progress + Math.random() * 15, 100)
            return {
              ...agent,
              progress: newProgress,
              status: newProgress >= 100 ? "complete" : "working",
            }
          }
          return agent
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const createExpertAgent = async (expertise: string, modelId?: string) => {
    setIsCreatingAgent(true)
    setAgentCreationProgress(0)

    const progressSteps = [
      { step: 20, message: "Analyzing expertise requirements..." },
      { step: 40, message: "Selecting optimal model..." },
      { step: 60, message: "Configuring agent parameters..." },
      { step: 80, message: "Testing agent capabilities..." },
      { step: 100, message: "Agent ready!" },
    ]

    for (const { step } of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setAgentCreationProgress(step)
    }

    const selectedModel = modelId ? availableModels.find((m) => m.id === modelId) : availableModels[0]

    const newAgent: Agent = {
      id: `expert-${Date.now()}`,
      name: `${expertise} Expert`,
      type: "expert",
      status: "idle",
      progress: 0,
      description: `Specialized agent for ${expertise.toLowerCase()} powered by ${selectedModel?.name}`,
      expertise: [expertise, "Problem Solving", "Best Practices", ...(selectedModel?.capabilities || [])],
    }

    setAgents((prev) => [...prev, newAgent])
    setIsCreatingAgent(false)
    setAgentCreationProgress(0)
  }

  const startAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === agentId ? { ...agent, status: "working", progress: 0 } : agent)),
    )
  }

  const createTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      status: "pending",
      assignedAgents: [],
      progress: 0,
    }

    setTasks((prev) => [...prev, newTask])
    setNewTaskTitle("")
    setNewTaskDescription("")
  }

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "working":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Pause className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}

      {/* Agent Orchestrator Panel */}
      <div
        className={`
        fixed top-0 right-0 h-full w-96 bg-card border-l border-border
        transform transition-all duration-500 ease-out z-50
        ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Agent Lab</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Agent Creation */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Create Expert Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createExpertAgent("Vision Analysis", "qwen2-5-vl-72b")}
                  disabled={isCreatingAgent}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Vision AI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createExpertAgent("Code Generation", "gemma-3-27b")}
                  disabled={isCreatingAgent}
                  className="text-xs"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Code AI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createExpertAgent("Data Science", "gemma-3-27b")}
                  disabled={isCreatingAgent}
                  className="text-xs"
                >
                  Data Science
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createExpertAgent("Enterprise Analysis", "qwen2-5-vl-72b")}
                  disabled={isCreatingAgent}
                  className="text-xs"
                >
                  Enterprise
                </Button>
              </div>

              {isCreatingAgent && (
                <div className="space-y-2">
                  <Progress value={agentCreationProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">Creating specialized agent...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Agents */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Active Agents ({agents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-3 border border-border rounded-lg space-y-2 hover:bg-accent/50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(agent.status)}
                      <span className="text-sm font-medium">{agent.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {agent.type}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">{agent.description}</p>

                  {agent.expertise && (
                    <div className="flex flex-wrap gap-1">
                      {agent.expertise.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs px-1 py-0">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {agent.status === "working" && <Progress value={agent.progress} className="h-1" />}

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startAgent(agent.id)}
                      disabled={agent.status === "working"}
                      className="h-6 px-2 text-xs"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Task Management */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Task Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">New Task</Label>
                <Input
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="text-sm"
                />
                <Textarea
                  placeholder="Task description..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="text-sm min-h-[60px]"
                />
                <Button onClick={createTask} size="sm" className="w-full" disabled={!newTaskTitle.trim()}>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="p-2 border border-border rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{task.title}</span>
                      <Badge variant={task.status === "complete" ? "default" : "secondary"} className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                    {task.progress > 0 && <Progress value={task.progress} className="h-1" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
