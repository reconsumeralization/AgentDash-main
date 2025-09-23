"use client"

import { useState, useEffect, useRef, useCallback } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
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
  X, Play, Save, Settings, Activity,
  Circle, Square as SquareIcon, Diamond, Brain,
  RefreshCw, Layers, Clock, Database, Globe, Workflow
} from "lucide-react"

interface WorkflowBuilderProps {
  isOpen: boolean
  onClose: () => void
}

interface WorkflowNode {
  id: string
  type: "start" | "end" | "agent" | "condition" | "loop" | "parallel" | "delay" | "data" | "api" | "guidance-generator"
  position: { x: number; y: number }
  size: { width: number; height: number }
  data: {
    label: string
    description?: string
    config: Record<string, unknown>
    status: "idle" | "running" | "completed" | "error"
    progress?: number
    agentId?: string
    condition?: string
    iterations?: number
    delay?: number
    endpoint?: string
    method?: string
    headers?: Record<string, string>
    body?: Record<string, unknown>
    // Guidance-specific properties
    language?: "typescript" | "javascript" | "python" | "java" | "go"
    framework?: string
    purpose?: string
    requirements?: string[]
    securityLevel?: "low" | "medium" | "high"
    accessibility?: boolean
    testing?: boolean
    documentation?: boolean
  }
  inputs: string[]
  outputs: string[]
}

interface WorkflowConnection {
  id: string
  source: string
  target: string
  sourceHandle: string
  targetHandle: string
  type: "default" | "conditional" | "error"
  label?: string
  condition?: string
}

interface Workflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  variables: WorkflowVariable[]
  settings: WorkflowSettings
  status: "draft" | "active" | "paused" | "completed" | "error"
  executionHistory: WorkflowExecution[]
  createdAt: Date
  updatedAt: Date
}

interface WorkflowVariable {
  id: string
  name: string
  type: "string" | "number" | "boolean" | "object" | "array"
  defaultValue: unknown
  description: string
  isRequired: boolean
}

interface WorkflowSettings {
  timeout: number
  retries: number
  parallel: boolean
  notifications: boolean
  logging: boolean
  version: string
}

interface WorkflowExecution {
  id: string
  workflowId: string
  status: "running" | "completed" | "failed" | "cancelled"
  startTime: Date
  endTime?: Date
  duration?: number
  results: Record<string, unknown>
  errors: string[]
  nodeExecutions: NodeExecution[]
}

interface NodeExecution {
  nodeId: string
  status: "pending" | "running" | "completed" | "failed" | "skipped"
  startTime: Date
  endTime?: Date
  duration?: number
  result?: unknown
  error?: string
}

const nodeTypes = [
  {
    type: "start",
    label: "Start",
    iconName: "Circle",
    color: "bg-green-500",
    description: "Workflow entry point"
  },
  {
    type: "end",
    label: "End",
    iconName: "SquareIcon",
    color: "bg-red-500",
    description: "Workflow exit point"
  },
  {
    type: "agent",
    label: "AI Agent",
    iconName: "Brain",
    color: "bg-blue-500",
    description: "Execute AI agent task"
  },
  {
    type: "condition",
    label: "Condition",
    iconName: "Diamond",
    color: "bg-yellow-500",
    description: "Conditional branching"
  },
  {
    type: "loop",
    label: "Loop",
    iconName: "RefreshCw",
    color: "bg-purple-500",
    description: "Repeat operations"
  },
  {
    type: "parallel",
    label: "Parallel",
    iconName: "Layers",
    color: "bg-orange-500",
    description: "Execute in parallel"
  },
  {
    type: "delay",
    label: "Delay",
    iconName: "Clock",
    color: "bg-gray-500",
    description: "Wait for specified time"
  },
  {
    type: "data",
    label: "Data",
    iconName: "Database",
    color: "bg-cyan-500",
    description: "Data processing"
  },
  {
    type: "api",
    label: "API Call",
    iconName: "Globe",
    color: "bg-indigo-500",
    description: "External API integration"
  }
]

// Function to get node icon component by name
const getNodeIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Circle": return Circle;
    case "SquareIcon": return SquareIcon;
    case "Brain": return Brain;
    case "Diamond": return Diamond;
    case "RefreshCw": return RefreshCw;
    case "Layers": return Layers;
    case "Clock": return Clock;
    case "Database": return Database;
    case "Globe": return Globe;
    default: return Circle;
  }
}

const availableAgents = [
  { id: "agent-1", name: "Context Analyzer", type: "context", capabilities: ["Analysis", "NLP", "Extraction"] },
  { id: "agent-2", name: "Research Agent", type: "research", capabilities: ["Research", "Synthesis", "Fact-checking"] },
  { id: "agent-3", name: "Code Generator", type: "code", capabilities: ["Code", "Review", "Optimization"] },
  { id: "agent-4", name: "Data Analyst", type: "data", capabilities: ["Analysis", "Visualization", "ML"] }
]

export function EnhancedWorkflowBuilder({ isOpen, onClose }: WorkflowBuilderProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null)
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("design")
  const [dragData, setDragData] = useState<{ type: string; label: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [canvasOffset, _setCanvasOffset] = useState({ x: 0, y: 0 })
  const [zoom, _setZoom] = useState(1)
  const [gridSize, _setGridSize] = useState(20)
  const [showGrid, _setShowGrid] = useState(true)
  const [snapToGrid, _setSnapToGrid] = useState(true)

  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, _setCanvasSize] = useState({ width: 1200, height: 800 })

  // Unused variables (keeping for future functionality)
  const _unused = { workflows, canvasSize }

  // Initialize with sample workflow
  useEffect(() => {
    const sampleWorkflow: Workflow = {
      id: "workflow-1",
      name: "Content Generation Pipeline",
      description: "Automated content creation and review workflow",
      nodes: [
        {
          id: "start-1",
          type: "start",
          position: { x: 100, y: 200 },
          size: { width: 120, height: 60 },
          data: {
            label: "Start",
            config: {},
            status: "idle"
          },
          inputs: [],
          outputs: ["output-1"]
        },
        {
          id: "research-1",
          type: "agent",
          position: { x: 300, y: 150 },
          size: { width: 150, height: 80 },
          data: {
            label: "Research Phase",
            description: "Gather information about the topic",
            config: { agentId: "agent-2", query: "trending topics", sources: 5 },
            status: "idle",
            agentId: "agent-2"
          },
          inputs: ["input-1"],
          outputs: ["output-1"]
        },
        {
          id: "condition-1",
          type: "condition",
          position: { x: 550, y: 150 },
          size: { width: 140, height: 80 },
          data: {
            label: "Quality Check",
            description: "Check if research quality is sufficient",
            config: { condition: "quality_score > 0.8" },
            status: "idle",
            condition: "quality_score > 0.8"
          },
          inputs: ["input-1"],
          outputs: ["output-1", "output-2"]
        },
        {
          id: "generate-1",
          type: "agent",
          position: { x: 750, y: 100 },
          size: { width: 150, height: 80 },
          data: {
            label: "Content Generation",
            description: "Generate content based on research",
            config: { agentId: "agent-1", style: "professional", length: "medium" },
            status: "idle",
            agentId: "agent-1"
          },
          inputs: ["input-1"],
          outputs: ["output-1"]
        },
        {
          id: "review-1",
          type: "agent",
          position: { x: 750, y: 250 },
          size: { width: 150, height: 80 },
          data: {
            label: "Content Review",
            description: "Review and improve content quality",
            config: { agentId: "agent-3", focus: "clarity", "grammar": true },
            status: "idle",
            agentId: "agent-3"
          },
          inputs: ["input-1"],
          outputs: ["output-1"]
        },
        {
          id: "end-1",
          type: "end",
          position: { x: 950, y: 200 },
          size: { width: 120, height: 60 },
          data: {
            label: "End",
            config: {},
            status: "idle"
          },
          inputs: ["input-1"],
          outputs: []
        }
      ],
      connections: [
        {
          id: "conn-1",
          source: "start-1",
          target: "research-1",
          sourceHandle: "output-1",
          targetHandle: "input-1",
          type: "default"
        },
        {
          id: "conn-2",
          source: "research-1",
          target: "condition-1",
          sourceHandle: "output-1",
          targetHandle: "input-1",
          type: "default"
        },
        {
          id: "conn-3",
          source: "condition-1",
          target: "generate-1",
          sourceHandle: "output-1",
          targetHandle: "input-1",
          type: "conditional",
          label: "Pass"
        },
        {
          id: "conn-4",
          source: "condition-1",
          target: "review-1",
          sourceHandle: "output-2",
          targetHandle: "input-1",
          type: "conditional",
          label: "Fail"
        },
        {
          id: "conn-5",
          source: "generate-1",
          target: "end-1",
          sourceHandle: "output-1",
          targetHandle: "input-1",
          type: "default"
        },
        {
          id: "conn-6",
          source: "review-1",
          target: "end-1",
          sourceHandle: "output-1",
          targetHandle: "input-1",
          type: "default"
        }
      ],
      variables: [
        {
          id: "var-1",
          name: "topic",
          type: "string",
          defaultValue: "",
          description: "The topic for content generation",
          isRequired: true
        },
        {
          id: "var-2",
          name: "quality_threshold",
          type: "number",
          defaultValue: 0.8,
          description: "Minimum quality score threshold",
          isRequired: false
        }
      ],
      settings: {
        timeout: 300,
        retries: 3,
        parallel: false,
        notifications: true,
        logging: true,
        version: "1.0.0"
      },
      status: "draft",
      executionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setWorkflows([sampleWorkflow])
    setCurrentWorkflow(sampleWorkflow)
  }, [])

  // Handle canvas interactions
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null)
    }
  }, [])

  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    _setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)))
  }, [])

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, nodeType: { type: string; label: string }) => {
    setDragData({ type: nodeType.type, label: nodeType.label })
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (!dragData || !currentWorkflow) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - canvasOffset.x) / zoom
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom

    const newNodeId = `${dragData.type}-${Date.now()}`
    const newNode: WorkflowNode = {
      id: newNodeId,
      type: dragData.type as WorkflowNode['type'],
      position: { 
        x: snapToGrid ? Math.round(x / gridSize) * gridSize : x, 
        y: snapToGrid ? Math.round(y / gridSize) * gridSize : y 
      },
      size: { width: 120, height: 60 },
      data: {
        label: dragData.label,
        config: {},
        status: "idle"
      },
      inputs: [],
      outputs: []
    }

    setCurrentWorkflow(prev => prev ? {
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date()
    } : null)

    setDragData(null)
  }

  // Node interaction handlers
  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node)
  }

  const handleNodeDoubleClick = (node: WorkflowNode) => {
    // Open node configuration dialog
    setSelectedNode(node)
    setActiveTab("config")
  }

  // Workflow execution
  const executeWorkflow = async () => {
    if (!currentWorkflow) return

    setIsExecuting(true)
    setExecutionProgress(0)

    // Simulate workflow execution
    const executionSteps = [
      { progress: 20, message: "Initializing workflow..." },
      { progress: 40, message: "Executing research phase..." },
      { progress: 60, message: "Running quality check..." },
      { progress: 80, message: "Generating content..." },
      { progress: 100, message: "Workflow completed!" }
    ]

    for (const step of executionSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setExecutionProgress(step.progress)
    }

    setIsExecuting(false)
    setExecutionProgress(0)
  }

  // Save workflow
  const saveWorkflow = () => {
    if (!currentWorkflow) return

    setWorkflows(prev => 
      prev.map(w => w.id === currentWorkflow.id ? currentWorkflow : w)
    )
  }

  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type)
    return nodeType ? getNodeIconComponent(nodeType.iconName) : Circle
  }

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type)
    return nodeType ? nodeType.color : "bg-gray-500"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "border-blue-500 bg-blue-50"
      case "completed": return "border-green-500 bg-green-50"
      case "error": return "border-red-500 bg-red-50"
      default: return "border-gray-300 bg-white"
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Workflow className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Enhanced Workflow Builder</h2>
                <p className="text-muted-foreground">Visual workflow design and automation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={saveWorkflow}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button 
                size="sm" 
                onClick={executeWorkflow}
                disabled={isExecuting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isExecuting ? (
                  <>
                    <Clock className="h-4 w-4 mr-1 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Execute
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Execution Progress */}
          {isExecuting && (
            <div className="p-4 border-b border-border bg-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <Progress value={executionProgress} className="h-2" />
                  <p className="text-sm text-blue-600 mt-1">
                    Executing workflow... {executionProgress}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-80 border-r border-border flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="p-4 border-b border-border">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="config">Config</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="design" className="flex-1 overflow-hidden">
                  <div className="p-4 space-y-4">
                    {/* Node Palette */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Node Palette</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {nodeTypes.map((nodeType) => {
                          const IconComponent = getNodeIconComponent(nodeType.iconName)
                          return (
                            <div
                              key={nodeType.type}
                              draggable
                              onDragStart={(e) => handleDragStart(e, nodeType)}
                              className="flex items-center gap-2 p-2 border border-border rounded cursor-grab hover:bg-accent/50 transition-colors"
                            >
                              <div className={`w-6 h-6 rounded ${nodeType.color} flex items-center justify-center`}>
                                <IconComponent className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <div className="text-xs font-medium">{nodeType.label}</div>
                                <div className="text-xs text-muted-foreground">{nodeType.description}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Available Agents */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Available Agents</h3>
                      <div className="space-y-2">
                        {availableAgents.map((agent) => (
                          <div key={agent.id} className="p-2 border border-border rounded">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{agent.name}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {agent.capabilities.map((capability) => (
                                <Badge key={capability} variant="outline" className="text-xs">
                                  {capability}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Canvas Controls */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Canvas Controls</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Show Grid</span>
                          <input 
                            type="checkbox" 
                            checked={showGrid}
                            onChange={(e) => _setShowGrid(e.target.checked)}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Snap to Grid</span>
                          <input 
                            type="checkbox" 
                            checked={snapToGrid}
                            onChange={(e) => _setSnapToGrid(e.target.checked)}
                            className="rounded"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Zoom: {Math.round(zoom * 100)}%</Label>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => _setZoom(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="config" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {selectedNode ? (
                        <div>
                          <h3 className="text-sm font-medium mb-3">Node Configuration</h3>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm">Label</Label>
                              <Input 
                                value={selectedNode.data.label}
                                onChange={(e) => {
                                  const newLabel = e.target.value
                                  setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, label: newLabel } } : null)
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Description</Label>
                              <Textarea 
                                value={selectedNode.data.description || ""}
                                onChange={(e) => {
                                  const newDescription = e.target.value
                                  setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, description: newDescription } } : null)
                                }}
                                rows={3}
                              />
                            </div>
                            
                            {selectedNode.type === "agent" && (
                              <div>
                                <Label className="text-sm">Agent</Label>
                                <Select 
                                  value={selectedNode.data.agentId || ""}
                                  onValueChange={(value) => {
                                    setSelectedNode(prev => prev ? { 
                                      ...prev, 
                                      data: { ...prev.data, agentId: value } 
                                    } : null)
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select agent" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableAgents.map((agent) => (
                                      <SelectItem key={agent.id} value={agent.id}>
                                        {agent.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {selectedNode.type === "condition" && (
                              <div>
                                <Label className="text-sm">Condition</Label>
                                <Input 
                                  value={selectedNode.data.condition || ""}
                                  onChange={(e) => {
                                    const newCondition = e.target.value
                                    setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, condition: newCondition } } : null)
                                  }}
                                  placeholder="e.g., quality_score > 0.8"
                                />
                              </div>
                            )}

                            {selectedNode.type === "delay" && (
                              <div>
                                <Label className="text-sm">Delay (seconds)</Label>
                                <Input 
                                  type="number"
                                  value={selectedNode.data.delay || 0}
                                  onChange={(e) => {
                                    const newDelay = parseInt(e.target.value) || 0
                                    setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, delay: newDelay } } : null)
                                  }}
                                />
                              </div>
                            )}

                            {selectedNode.type === "api" && (
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm">Endpoint</Label>
                                  <Input 
                                    value={selectedNode.data.endpoint || ""}
                                    onChange={(e) => {
                                      const newEndpoint = e.target.value
                                      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, endpoint: newEndpoint } } : null)
                                    }}
                                    placeholder="https://api.example.com/endpoint"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Method</Label>
                                  <Select 
                                    value={selectedNode.data.method || "GET"}
                                    onValueChange={(value) => {
                                      setSelectedNode(prev => prev ? { 
                                        ...prev, 
                                        data: { ...prev.data, method: value } 
                                      } : null)
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="GET">GET</SelectItem>
                                      <SelectItem value="POST">POST</SelectItem>
                                      <SelectItem value="PUT">PUT</SelectItem>
                                      <SelectItem value="DELETE">DELETE</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <Settings className="h-8 w-8 mx-auto mb-2" />
                          <p>Select a node to configure</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden">
              <div
                ref={canvasRef}
                className="w-full h-full relative bg-gray-50"
                onMouseDown={handleCanvasMouseDown}
                onWheel={handleCanvasWheel}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  backgroundImage: showGrid 
                    ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)` 
                    : 'none',
                  backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
                  transform: `scale(${zoom}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                  transformOrigin: '0 0'
                }}
              >
                {/* Connections */}
                {currentWorkflow?.connections.map((connection) => {
                  const sourceNode = currentWorkflow.nodes.find(n => n.id === connection.source)
                  const targetNode = currentWorkflow.nodes.find(n => n.id === connection.target)
                  
                  if (!sourceNode || !targetNode) return null

                  const sourceX = sourceNode.position.x + sourceNode.size.width / 2
                  const sourceY = sourceNode.position.y + sourceNode.size.height / 2
                  const targetX = targetNode.position.x + targetNode.size.width / 2
                  const targetY = targetNode.position.y + targetNode.size.height / 2

                  return (
                    <svg
                      key={connection.id}
                      className="absolute inset-0 pointer-events-none"
                      style={{ zIndex: 1 }}
                    >
                      <defs>
                        <marker
                          id={`arrowhead-${connection.id}`}
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill={connection.type === "conditional" ? "#f59e0b" : "#6b7280"}
                          />
                        </marker>
                      </defs>
                      <path
                        d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY - 50} ${targetX} ${targetY}`}
                        stroke={connection.type === "conditional" ? "#f59e0b" : "#6b7280"}
                        strokeWidth="2"
                        fill="none"
                        markerEnd={`url(#arrowhead-${connection.id})`}
                      />
                      {connection.label && (
                        <text
                          x={(sourceX + targetX) / 2}
                          y={sourceY - 60}
                          textAnchor="middle"
                          className="text-xs fill-gray-600"
                        >
                          {connection.label}
                        </text>
                      )}
                    </svg>
                  )
                })}

                {/* Nodes */}
                {currentWorkflow?.nodes.map((node) => {
                  const IconComponent = getNodeIcon(node.type)
                  const nodeColor = getNodeColor(node.type)
                  const statusColor = getStatusColor(node.data.status)
                  
                  return (
                    <div
                      key={node.id}
                      className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${statusColor} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        width: node.size.width,
                        height: node.size.height,
                        zIndex: 2
                      }}
                      onClick={() => handleNodeClick(node)}
                      onDoubleClick={() => handleNodeDoubleClick(node)}
                    >
                      <div className="h-full flex flex-col p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded ${nodeColor} flex items-center justify-center`}>
                            <IconComponent className="h-2 w-2 text-white" />
                          </div>
                          <span className="text-xs font-medium truncate">{node.data.label}</span>
                        </div>
                        
                        {node.data.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {node.data.description}
                          </p>
                        )}
                        
                        {node.data.status === "running" && node.data.progress !== undefined && (
                          <div className="mt-1">
                            <Progress value={node.data.progress} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Drop Zone Indicator */}
                {isDragging && (
                  <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50/20 pointer-events-none" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
