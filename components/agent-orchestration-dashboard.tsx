"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Label } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Separator } from "@/components/ui"
import {
  AgentOrchestrator,
  ExecutionQueueManager,
  type ExecutionPlan,
  type ExecutionMetrics,
} from "@/lib"
import { agentRegistry } from "@/lib"
import { Play, Square, Plus, Settings, Clock, Users, Zap, GitBranch, Layers, Activity } from "lucide-react"

export function AgentOrchestrationDashboard() {
  const [executionPlans, setExecutionPlans] = useState<ExecutionPlan[]>([])
  const [activeExecutions, setActiveExecutions] = useState<ExecutionMetrics[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [executionInput, setExecutionInput] = useState("")
  const [newPlanName, setNewPlanName] = useState("")
  const [newPlanDescription, setNewPlanDescription] = useState("")
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [executionMode, setExecutionMode] = useState<"parallel" | "sequential" | "hybrid">("parallel")
  const [queueStatus, setQueueStatus] = useState({ queueLength: 0, activeExecutions: 0, isProcessing: false })

  useEffect(() => {
    // Load execution plans and active executions
    setExecutionPlans(AgentOrchestrator.getAllExecutionPlans())
    setActiveExecutions(AgentOrchestrator.getActiveExecutions())
    setQueueStatus(ExecutionQueueManager.getQueueStatus())

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      setActiveExecutions(AgentOrchestrator.getActiveExecutions())
      setQueueStatus(ExecutionQueueManager.getQueueStatus())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const availableAgents = agentRegistry.getAllAgents()

  const handleCreatePlan = () => {
    if (!newPlanName.trim() || selectedAgents.length === 0) return

    let plan: ExecutionPlan

    switch (executionMode) {
      case "parallel":
        plan = AgentOrchestrator.createParallelAnalysisPattern(selectedAgents)
        break
      case "sequential":
        plan = AgentOrchestrator.createSequentialWorkflowPattern(selectedAgents)
        break
      case "hybrid":
        const half = Math.ceil(selectedAgents.length / 2)
        plan = AgentOrchestrator.createHybridPattern(selectedAgents.slice(0, half), selectedAgents.slice(half))
        break
      default:
        return
    }

    // Update plan with custom name and description
    plan.name = newPlanName
    plan.description = newPlanDescription || plan.description

    setExecutionPlans([...executionPlans, plan])
    setNewPlanName("")
    setNewPlanDescription("")
    setSelectedAgents([])
  }

  const handleExecutePlan = async () => {
    if (!selectedPlan || !executionInput.trim()) return

    try {
      ExecutionQueueManager.addToQueue(selectedPlan, executionInput, 2)
      setExecutionInput("")
    } catch (error) {
      console.error("Failed to queue execution:", error)
    }
  }

  const handleCancelExecution = (planId: string) => {
    AgentOrchestrator.cancelExecution(planId)
    setActiveExecutions(AgentOrchestrator.getActiveExecutions())
  }

  const getExecutionProgress = (metrics: ExecutionMetrics): number => {
    return (metrics.stagesCompleted / metrics.stagesTotal) * 100
  }

  const getAgentProgress = (metrics: ExecutionMetrics): number => {
    return (metrics.agentsExecuted / metrics.agentsTotal) * 100
  }

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Orchestration</h2>
          <p className="text-muted-foreground">
            Design and execute complex multi-agent workflows with parallel and sequential processing
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Queue: {queueStatus.queueLength}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Active: {queueStatus.activeExecutions}</span>
          </div>
          <Badge variant={queueStatus.isProcessing ? "default" : "secondary"}>
            {queueStatus.isProcessing ? "Processing" : "Idle"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Execution Plans</TabsTrigger>
          <TabsTrigger value="active">Active Executions</TabsTrigger>
          <TabsTrigger value="create">Create Plan</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {executionPlans.map((plan) => (
              <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant="outline">{plan.stages.length} stages</Badge>
                  </div>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Agents:</span>
                      <span>{plan.totalAgents}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Duration:</span>
                      <span>{formatDuration(plan.estimatedDuration)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge variant={plan.priority === "high" ? "default" : "secondary"} className="text-xs">
                        {plan.priority}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      {plan.stages.map((stage, index) => (
                        <div key={stage.id} className="flex items-center space-x-2 text-xs">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span className="flex-1">{stage.name}</span>
                          {stage.executionMode === "parallel" && <Layers className="w-3 h-3" />}
                          {stage.executionMode === "sequential" && <GitBranch className="w-3 h-3" />}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedPlan(plan.id)}
                        variant={selectedPlan === plan.id ? "default" : "outline"}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Select
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Execute Plan</CardTitle>
                <CardDescription>Selected: {executionPlans.find((p) => p.id === selectedPlan)?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="execution-input">Input</Label>
                  <Textarea
                    id="execution-input"
                    placeholder="Enter your task description or data to process..."
                    value={executionInput}
                    onChange={(e) => setExecutionInput(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleExecutePlan} className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Queue for Execution
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeExecutions.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>No active executions</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeExecutions.map((metrics) => {
                const plan = executionPlans.find((p) => p.id === metrics.planId)
                const progress = getExecutionProgress(metrics)
                const agentProgress = getAgentProgress(metrics)
                const duration = metrics.totalDuration || Date.now() - metrics.startTime.getTime()

                return (
                  <Card key={metrics.planId}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan?.name || "Unknown Plan"}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{metrics.endTime ? "Completed" : "Running"}</Badge>
                          {!metrics.endTime && (
                            <Button size="sm" variant="outline" onClick={() => handleCancelExecution(metrics.planId)}>
                              <Square className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardDescription>
                        Started: {metrics.startTime.toLocaleTimeString()} • Duration: {formatDuration(duration)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Stage Progress</span>
                            <span>
                              {metrics.stagesCompleted}/{metrics.stagesTotal}
                            </span>
                          </div>
                          <Progress value={progress} className="w-full" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Agent Progress</span>
                            <span>
                              {metrics.agentsExecuted}/{metrics.agentsTotal}
                            </span>
                          </div>
                          <Progress value={agentProgress} className="w-full" />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{Math.round(metrics.successRate)}%</div>
                            <div className="text-muted-foreground">Success Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{metrics.errors.length}</div>
                            <div className="text-muted-foreground">Errors</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{metrics.performance.length}</div>
                            <div className="text-muted-foreground">Stages Done</div>
                          </div>
                        </div>

                        {metrics.errors.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-destructive">Recent Errors</Label>
                            <ScrollArea className="h-20">
                              {metrics.errors.slice(-3).map((error, index) => (
                                <div key={index} className="text-xs text-destructive mb-1">
                                  {error.stageId}: {error.error}
                                </div>
                              ))}
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Execution Plan</CardTitle>
              <CardDescription>Design a custom workflow with multiple agents and execution patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    placeholder="My Analysis Workflow"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="execution-mode">Execution Mode</Label>
                  <Select value={executionMode} onValueChange={(value: any) => setExecutionMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parallel">
                        <div className="flex items-center">
                          <Layers className="w-4 h-4 mr-2" />
                          Parallel - All agents simultaneously
                        </div>
                      </SelectItem>
                      <SelectItem value="sequential">
                        <div className="flex items-center">
                          <GitBranch className="w-4 h-4 mr-2" />
                          Sequential - Agents in order
                        </div>
                      </SelectItem>
                      <SelectItem value="hybrid">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Hybrid - Parallel then sequential
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="plan-description">Description</Label>
                <Textarea
                  id="plan-description"
                  placeholder="Describe what this execution plan will accomplish..."
                  value={newPlanDescription}
                  onChange={(e) => setNewPlanDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label>Select Agents ({selectedAgents.length} selected)</Label>
                <ScrollArea className="h-32 border rounded-md p-2 mt-2">
                  <div className="space-y-2">
                    {availableAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={agent.id}
                          checked={selectedAgents.includes(agent.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAgents([...selectedAgents, agent.id])
                            } else {
                              setSelectedAgents(selectedAgents.filter((id) => id !== agent.id))
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={agent.id} className="text-sm cursor-pointer">
                          {agent.name}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {agent.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Button onClick={handleCreatePlan} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Execution Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{executionPlans.length}</div>
                <p className="text-sm text-muted-foreground">Execution plans created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Queue Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{queueStatus.queueLength}</div>
                <p className="text-sm text-muted-foreground">Plans in queue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Active Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeExecutions.length}</div>
                <p className="text-sm text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
          </div>

          {activeExecutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeExecutions.map((metrics) => {
                    const plan = executionPlans.find((p) => p.id === metrics.planId)
                    return (
                      <div key={metrics.planId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{plan?.name}</h4>
                          <Badge variant="secondary">{Math.round(metrics.successRate)}% success</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Duration</div>
                            <div className="font-medium">
                              {formatDuration(metrics.totalDuration || Date.now() - metrics.startTime.getTime())}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Stages</div>
                            <div className="font-medium">
                              {metrics.stagesCompleted}/{metrics.stagesTotal}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Agents</div>
                            <div className="font-medium">
                              {metrics.agentsExecuted}/{metrics.agentsTotal}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Errors</div>
                            <div className="font-medium text-destructive">{metrics.errors.length}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
