"use client"

import type React from "react"
import { useCallback, useState, useRef } from "react"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  Panel,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Button } from "@/components/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Bot, Workflow, Zap, Database, Play, Save, Trash2, GitBranch } from "lucide-react"

// Custom Node Types
const AgentNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 backdrop-blur-sm ${
      selected ? "border-blue-400" : "border-blue-500/30"
    } min-w-[200px]`}
  >
    <div className="flex items-center gap-2 mb-2">
      <Bot className="w-4 h-4 text-blue-400" />
      <div className="font-semibold text-sm text-white">{data.label}</div>
    </div>
    <div className="text-xs text-blue-200 mb-2">{data.type}</div>
    <div className="flex flex-wrap gap-1">
      {data.capabilities?.map((cap: string, idx: number) => (
        <Badge key={idx} variant="secondary" className="text-xs bg-blue-500/20 text-blue-200">
          {cap}
        </Badge>
      ))}
    </div>
    <div className="mt-2 text-xs text-gray-300">Cost: {data.cost} SOL/hr</div>
  </div>
)

const WorkflowNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20 border-2 backdrop-blur-sm ${
      selected ? "border-green-400" : "border-green-500/30"
    } min-w-[180px]`}
  >
    <div className="flex items-center gap-2 mb-2">
      <Workflow className="w-4 h-4 text-green-400" />
      <div className="font-semibold text-sm text-white">{data.label}</div>
    </div>
    <div className="text-xs text-green-200 mb-2">{data.description}</div>
    <div className="flex items-center gap-2 text-xs text-gray-300">
      <Zap className="w-3 h-3" />
      {data.steps} steps
    </div>
  </div>
)

const DataNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 backdrop-blur-sm ${
      selected ? "border-orange-400" : "border-orange-500/30"
    } min-w-[160px]`}
  >
    <div className="flex items-center gap-2 mb-2">
      <Database className="w-4 h-4 text-orange-400" />
      <div className="font-semibold text-sm text-white">{data.label}</div>
    </div>
    <div className="text-xs text-orange-200 mb-2">{data.source}</div>
    <div className="text-xs text-gray-300">Format: {data.format}</div>
  </div>
)

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  workflow: WorkflowNode,
  data: DataNode,
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "agent",
    position: { x: 100, y: 100 },
    data: {
      label: "Fantasy Sports Analyst",
      type: "Sports Agent",
      capabilities: ["Player Analysis", "Lineup Optimization", "Injury Reports"],
      cost: 0.05,
    },
  },
  {
    id: "2",
    type: "workflow",
    position: { x: 400, y: 100 },
    data: {
      label: "Team Optimization",
      description: "Optimize fantasy lineup based on matchups",
      steps: 5,
    },
  },
  {
    id: "3",
    type: "data",
    position: { x: 700, y: 100 },
    data: {
      label: "Player Stats",
      source: "ESPN API",
      format: "JSON",
    },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#3b82f6" } },
  { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: "#10b981" } },
]

interface WorkflowBuilderProps {
  onSave?: (workflow: any) => void
  onExecute?: (workflow: any) => void
}

export function WorkflowBuilder({ onSave, onExecute }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionLogs, setExecutionLogs] = useState<string[]>([])
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const addNode = useCallback(
    (type: string) => {
      const newNode: Node = {
        id: `${nodes.length + 1}`,
        type,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          ...(type === "agent" && {
            type: "Custom Agent",
            capabilities: ["Custom Task"],
            cost: 0.01,
          }),
          ...(type === "workflow" && {
            description: "Custom workflow step",
            steps: 1,
          }),
          ...(type === "data" && {
            source: "Custom Source",
            format: "JSON",
          }),
        },
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [nodes.length, setNodes],
  )

  const deleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
    }
  }, [selectedNode, setNodes, setEdges])

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)
    setExecutionLogs([])

    // Simulate workflow execution
    const logs = [
      "Initializing workflow execution...",
      "Validating node connections...",
      "Starting agent processes...",
      "Processing data inputs...",
      "Executing workflow steps...",
      "Generating results...",
      "Workflow completed successfully!",
    ]

    for (let i = 0; i < logs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setExecutionLogs((prev) => [...prev, logs[i]])
    }

    setIsExecuting(false)
    onExecute?.({ nodes, edges, name: workflowName, description: workflowDescription })
  }, [nodes, edges, workflowName, workflowDescription, onExecute])

  const saveWorkflow = useCallback(() => {
    const workflow = {
      id: Date.now().toString(),
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    }
    onSave?.(workflow)
  }, [nodes, edges, workflowName, workflowDescription, onSave])

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <ReactFlowProvider>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-400" />
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Workflow name"
                />
              </div>
              <Input
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="bg-white/5 border-white/10 text-white w-64"
                placeholder="Workflow description"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => addNode("agent")}
                size="sm"
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200"
              >
                <Bot className="w-4 h-4 mr-1" />
                Agent
              </Button>
              <Button
                onClick={() => addNode("workflow")}
                size="sm"
                className="bg-green-500/20 hover:bg-green-500/30 text-green-200"
              >
                <Workflow className="w-4 h-4 mr-1" />
                Step
              </Button>
              <Button
                onClick={() => addNode("data")}
                size="sm"
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200"
              >
                <Database className="w-4 h-4 mr-1" />
                Data
              </Button>
              <Button
                onClick={saveWorkflow}
                size="sm"
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                onClick={executeWorkflow}
                disabled={isExecuting}
                size="sm"
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200"
              >
                <Play className="w-4 h-4 mr-1" />
                {isExecuting ? "Executing..." : "Execute"}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Flow Canvas */}
            <div className="flex-1" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                className="bg-transparent"
              >
                <Controls className="bg-black/20 backdrop-blur-sm border border-white/10" />
                <MiniMap className="bg-black/20 backdrop-blur-sm border border-white/10" nodeColor="#3b82f6" />
                <Background color="#ffffff20" />

                {/* Execution Panel */}
                {isExecuting && (
                  <Panel position="bottom-center">
                    <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-white min-w-[400px]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                          Executing Workflow
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {executionLogs.map((log, idx) => (
                            <div key={idx} className="text-xs text-gray-300 animate-fade-in">
                              {log}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Panel>
                )}
              </ReactFlow>
            </div>

            {/* Side Panel */}
            {selectedNode && (
              <div className="w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Node Properties</h3>
                  <Button
                    onClick={deleteNode}
                    size="sm"
                    variant="destructive"
                    className="bg-red-500/20 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Tabs defaultValue="properties" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/5">
                    <TabsTrigger value="properties" className="text-white">
                      Properties
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-white">
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="properties" className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">Label</label>
                      <Input
                        value={selectedNode.data.label as string}
                        onChange={(e) => {
                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === selectedNode.id
                                ? { ...node, data: { ...node.data, label: e.target.value } }
                                : node,
                            ),
                          )
                        }}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    {selectedNode.type === "agent" && (
                      <>
                        <div>
                          <label className="text-sm text-gray-300 mb-1 block">Type</label>
                          <Input
                            value={selectedNode.data.type as string}
                            onChange={(e) => {
                              setNodes((nds) =>
                                nds.map((node) =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, type: e.target.value } }
                                    : node,
                                ),
                              )
                            }}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300 mb-1 block">Cost (SOL/hr)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={selectedNode.data.cost as number}
                            onChange={(e) => {
                              setNodes((nds) =>
                                nds.map((node) =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, cost: Number.parseFloat(e.target.value) } }
                                    : node,
                                ),
                              )
                            }}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      </>
                    )}

                    {selectedNode.type === "workflow" && (
                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">Description</label>
                        <Textarea
                          value={selectedNode.data.description as string}
                          onChange={(e) => {
                            setNodes((nds) =>
                              nds.map((node) =>
                                node.id === selectedNode.id
                                  ? { ...node, data: { ...node.data, description: e.target.value } }
                                  : node,
                              ),
                            )
                          }}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <div className="text-sm text-gray-400">Node ID: {selectedNode.id}</div>
                    <div className="text-sm text-gray-400">
                      Position: ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </ReactFlowProvider>
    </div>
  )
}
