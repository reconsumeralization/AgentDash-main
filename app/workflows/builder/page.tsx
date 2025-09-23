"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Label } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Navigation, BreadcrumbNavigation } from "@/components/navigation"
import {
  GitBranch,
  Play,
  Save,
  ArrowLeft,
  Plus,
  Settings,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Copy,
  Eye,
  Code
} from "lucide-react"

interface WorkflowStep {
  id: string
  name: string
  type: "start" | "action" | "condition" | "end"
  description: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export default function WorkflowBuilderPage() {
  const [activeTab, setActiveTab] = useState("designer")
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "start",
      name: "Workflow Start",
      type: "start",
      description: "Entry point for the workflow",
      config: {},
      position: { x: 100, y: 100 }
    },
    {
      id: "end",
      name: "Workflow End",
      type: "end",
      description: "Exit point for the workflow",
      config: {},
      position: { x: 600, y: 100 }
    }
  ])

  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [connections, setConnections] = useState<Array<{ from: string; to: string }>>([])

  const stepTypes = [
    { value: "start", label: "Start", color: "bg-green-500", icon: Play },
    { value: "action", label: "Action", color: "bg-blue-500", icon: Zap },
    { value: "condition", label: "Condition", color: "bg-yellow-500", icon: GitBranch },
    { value: "end", label: "End", color: "bg-red-500", icon: CheckCircle }
  ]

  const addStep = (type: WorkflowStep["type"]) => {
    const newStep: WorkflowStep = {
      id: `${type}-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Step`,
      type,
      description: `Configure this ${type} step`,
      config: {},
      position: { x: 300, y: 100 + steps.length * 80 }
    }
    setSteps(prev => [...prev, newStep])
  }

  const deleteStep = (stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId))
    setConnections(prev => prev.filter(conn => conn.from !== stepId && conn.to !== stepId))
    if (selectedStep === stepId) {
      setSelectedStep(null)
    }
  }

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  const selectedStepData = steps.find(step => step.id === selectedStep)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <div className="container mx-auto p-6 space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <BreadcrumbNavigation />
          <Navigation />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/workflows">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workflows
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Workflow Builder</h1>
              <p className="text-gray-400 mt-1">Design and configure automated workflows with visual tools</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run Workflow
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Workflow Designer */}
          <div className="lg:col-span-3">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Workflow Designer</CardTitle>
                  <div className="flex gap-2">
                    {stepTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        size="sm"
                        onClick={() => addStep(type.value as WorkflowStep["type"])}
                        className="flex items-center gap-2"
                      >
                        <type.icon className="h-4 w-4" />
                        Add {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="designer">Visual Designer</TabsTrigger>
                    <TabsTrigger value="code">Code View</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="designer" className="space-y-6">
                    {/* Workflow Canvas */}
                    <div className="relative bg-white/5 rounded-lg border border-white/10 min-h-[600px] p-6">
                      <div className="absolute inset-0 grid grid-cols-12 gap-4 pointer-events-none">
                        {Array.from({ length: 12 }, (_, i) => (
                          <div key={i} className="border-l border-white/5" />
                        ))}
                      </div>

                      {steps.map((step) => {
                        const StepIcon = stepTypes.find(t => t.value === step.type)?.icon || GitBranch
                        const stepColor = stepTypes.find(t => t.value === step.type)?.color || "bg-gray-500"

                        return (
                          <div
                            key={step.id}
                            className={`absolute cursor-pointer transition-all duration-200 ${
                              selectedStep === step.id ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                            }`}
                            style={{
                              left: step.position.x,
                              top: step.position.y
                            }}
                            onClick={() => setSelectedStep(step.id)}
                          >
                            <div className={`w-32 h-20 ${stepColor} rounded-lg flex flex-col items-center justify-center text-white shadow-lg`}>
                              <StepIcon className="h-6 w-6 mb-1" />
                              <div className="text-xs font-medium text-center px-2 truncate w-full">
                                {step.name}
                              </div>
                            </div>

                            {selectedStep === step.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteStep(step.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )
                      })}

                      {/* Connection Lines */}
                      <svg className="absolute inset-0 pointer-events-none">
                        {connections.map((conn, index) => {
                          const fromStep = steps.find(s => s.id === conn.from)
                          const toStep = steps.find(s => s.id === conn.to)

                          if (!fromStep || !toStep) return null

                          const x1 = fromStep.position.x + 64 // center of step
                          const y1 = fromStep.position.y + 40
                          const x2 = toStep.position.x + 64
                          const y2 = toStep.position.y + 40

                          return (
                            <line
                              key={index}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#60a5fa"
                              strokeWidth="2"
                              markerEnd="url(#arrowhead)"
                            />
                          )
                        })}
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                  refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                          </marker>
                        </defs>
                      </svg>
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-medium">Workflow Code</h3>
                        <Button variant="outline" size="sm">
                          <Code className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>

                      <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                        <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "name": "${workflowName || 'My Workflow'}",
  "description": "${workflowDescription || 'Workflow description'}",
  "steps": [
${steps.map(step => `    {
      "id": "${step.id}",
      "name": "${step.name}",
      "type": "${step.type}",
      "description": "${step.description}",
      "config": ${JSON.stringify(step.config, null, 6)}
    }`).join(',\n')}
  ],
  "connections": [
${connections.map(conn => `    {
      "from": "${conn.from}",
      "to": "${conn.to}"
    }`).join(',\n')}
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white">Workflow Name</Label>
                        <Input
                          placeholder="Enter workflow name..."
                          value={workflowName}
                          onChange={(e) => setWorkflowName(e.target.value)}
                          className="bg-white/5 border-white/10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Trigger Type</Label>
                        <Select defaultValue="manual">
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual Trigger</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="webhook">Webhook</SelectItem>
                            <SelectItem value="api">API Call</SelectItem>
                            <SelectItem value="event">Event-based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <Textarea
                        placeholder="Describe what this workflow does..."
                        value={workflowDescription}
                        onChange={(e) => setWorkflowDescription(e.target.value)}
                        className="bg-white/5 border-white/10"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white">Execution Mode</Label>
                        <Select defaultValue="sequential">
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sequential">Sequential</SelectItem>
                            <SelectItem value="parallel">Parallel</SelectItem>
                            <SelectItem value="conditional">Conditional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Timeout (minutes)</Label>
                        <Input
                          type="number"
                          defaultValue="30"
                          className="bg-white/5 border-white/10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Max Retries</Label>
                        <Input
                          type="number"
                          defaultValue="3"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Workflow Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{steps.length}</div>
                  <div className="text-gray-400 text-sm">Total Steps</div>
                </div>

                <div className="space-y-2">
                  {stepTypes.map((type) => {
                    const count = steps.filter(step => step.type === type.value).length
                    return count > 0 ? (
                      <div key={type.value} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${type.color}`} />
                          <span className="text-gray-400">{type.label}</span>
                        </div>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ) : null
                  })}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Status</div>
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {selectedStepData && (
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Step Configuration</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure the selected step
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Step Name</Label>
                    <Input
                      value={selectedStepData.name}
                      onChange={(e) => updateStep(selectedStepData.id, { name: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Description</Label>
                    <Textarea
                      value={selectedStepData.description}
                      onChange={(e) => updateStep(selectedStepData.id, { description: e.target.value })}
                      className="bg-white/5 border-white/10"
                      rows={3}
                    />
                  </div>

                  {selectedStepData.type === 'action' && (
                    <div className="space-y-2">
                      <Label className="text-white">Action Type</Label>
                      <Select
                        value={selectedStepData.config.actionType || 'api'}
                        onValueChange={(value) => updateStep(selectedStepData.id, {
                          config: { ...selectedStepData.config, actionType: value }
                        })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api">API Call</SelectItem>
                          <SelectItem value="database">Database Query</SelectItem>
                          <SelectItem value="email">Send Email</SelectItem>
                          <SelectItem value="file">File Operation</SelectItem>
                          <SelectItem value="agent">Agent Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedStepData.type === 'condition' && (
                    <div className="space-y-2">
                      <Label className="text-white">Condition</Label>
                      <Textarea
                        placeholder="Enter condition logic..."
                        value={selectedStepData.config.condition || ''}
                        onChange={(e) => updateStep(selectedStepData.id, {
                          config: { ...selectedStepData.config, condition: e.target.value }
                        })}
                        className="bg-white/5 border-white/10"
                        rows={3}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Workflow Settings
                </Button>
                <Button className="w-full" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate Workflow
                </Button>
                <Button className="w-full" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Test Run
                </Button>
                <Button className="w-full" variant="outline">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Import Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
