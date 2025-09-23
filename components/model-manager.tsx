"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Brain, Zap, Eye, DollarSign, Activity, Server, Globe, Shield, Gauge, Sparkles, X, TrendingUp, Cpu, MemoryStick, Network, Clock, Target, BarChart3, Settings, AlertTriangle, CheckCircle, RefreshCw, Filter, Search } from "lucide-react"

interface ModelManagerProps {
  isOpen: boolean
  onClose: () => void
}

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  capabilities: string[]
  pricing: {
    inputTokens: number
    outputTokens: number
  }
  performance: {
    tokensPerSec: number
    contextLength: number
    quantization: string
  }
  region: string
  status: "available" | "busy" | "offline"
  usage: number
}

interface ModelAgent {
  id: string
  name: string
  modelId: string
  specialization: string
  status: "idle" | "working" | "complete"
  progress: number
  tokensUsed: number
  cost: number
}

export function ModelManager({ isOpen, onClose }: ModelManagerProps) {
  const [models] = useState<AIModel[]>([
    {
      id: "gemma-3-27b",
      name: "Gemma-3-27b-it",
      provider: "Google",
      description: "Advanced reasoning and code generation model",
      capabilities: ["Text Generation", "Code Analysis", "Reasoning", "Multi-language"],
      pricing: { inputTokens: 0.1, outputTokens: 0.3 },
      performance: { tokensPerSec: 55, contextLength: 131000, quantization: "fp8" },
      region: "eu-north1",
      status: "available",
      usage: 75,
    },
    {
      id: "qwen2-5-vl-72b",
      name: "Qwen2.5-VL-72B-Instruct",
      provider: "Qwen",
      description: "Vision-language model for multimodal tasks",
      capabilities: ["Vision Analysis", "Image Understanding", "Text Generation", "Multimodal"],
      pricing: { inputTokens: 0.25, outputTokens: 0.75 },
      performance: { tokensPerSec: 20, contextLength: 32000, quantization: "fp8" },
      region: "eu-north1",
      status: "available",
      usage: 45,
    },
  ])

  const [agents, setAgents] = useState<ModelAgent[]>([
    {
      id: "agent-1",
      name: "Code Architect",
      modelId: "gemma-3-27b",
      specialization: "Software Architecture & Code Generation",
      status: "idle",
      progress: 0,
      tokensUsed: 15420,
      cost: 4.63,
    },
    {
      id: "agent-2",
      name: "Vision Analyst",
      modelId: "qwen2-5-vl-72b",
      specialization: "Image Analysis & Visual Understanding",
      status: "idle",
      progress: 0,
      tokensUsed: 8750,
      cost: 8.81,
    },
  ])

  const [totalCost, setTotalCost] = useState(26.0)
  const [selectedTab, setSelectedTab] = useState("models")

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.status === "working" && agent.progress < 100) {
            const newProgress = Math.min(agent.progress + Math.random() * 12, 100)
            const tokensGenerated = Math.floor(Math.random() * 50)
            const model = models.find((m) => m.id === agent.modelId)
            const additionalCost = model ? (tokensGenerated * model.pricing.outputTokens) / 1000000 : 0

            return {
              ...agent,
              progress: newProgress,
              tokensUsed: agent.tokensUsed + tokensGenerated,
              cost: agent.cost + additionalCost,
              status: newProgress >= 100 ? "complete" : "working",
            }
          }
          return agent
        }),
      )
    }, 1500)

    return () => clearInterval(interval)
  }, [models])

  const startAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === agentId ? { ...agent, status: "working", progress: 0 } : agent)),
    )
  }

  const createModelAgent = (modelId: string, specialization: string) => {
    const model = models.find((m) => m.id === modelId)
    if (!model) return

    const newAgent: ModelAgent = {
      id: `agent-${Date.now()}`,
      name: `${specialization} Agent`,
      modelId,
      specialization,
      status: "idle",
      progress: 0,
      tokensUsed: 0,
      cost: 0,
    }

    setAgents((prev) => [...prev, newAgent])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-500"
      case "busy":
        return "text-yellow-500"
      case "offline":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}

      {/* Model Manager Panel */}
      <div
        className={`
        fixed top-0 left-0 h-full w-[500px] bg-card border-r border-border
        transform transition-all duration-500 ease-out z-50
        ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
      `}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Model Hub</h2>
                <p className="text-sm text-muted-foreground">Enterprise AI Infrastructure</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />${totalCost.toFixed(2)}
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="space-y-4 mt-6">
              {models.map((model) => (
                <Card key={model.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {model.name}
                          <Badge variant="secondary" className="text-xs">
                            {model.provider}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${getStatusColor(model.status)}`}>
                        <Activity className="h-4 w-4" />
                        <span className="text-xs capitalize">{model.status}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Gauge className="h-3 w-3" />
                          Performance
                        </div>
                        <div>{model.performance.tokensPerSec} tokens/sec</div>
                        <div>{model.performance.contextLength.toLocaleString()} context</div>
                        <div>{model.performance.quantization} quantization</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          Pricing (per 1M tokens)
                        </div>
                        <div>Input: ${model.pricing.inputTokens}</div>
                        <div>Output: ${model.pricing.outputTokens}</div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {model.region}
                        </div>
                      </div>
                    </div>

                    {/* Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Current Usage</span>
                        <span>{model.usage}%</span>
                      </div>
                      <Progress value={model.usage} className="h-2" />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => createModelAgent(model.id, "Code Generation")}
                        className="flex-1"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Deploy Agent
                      </Button>
                      {model.capabilities.includes("Vision Analysis") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createModelAgent(model.id, "Vision Analysis")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-6">
              {agents.map((agent) => {
                const model = models.find((m) => m.id === agent.modelId)
                return (
                  <Card key={agent.id} className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{agent.specialization}</p>
                        </div>
                        <Badge variant={agent.status === "working" ? "default" : "secondary"} className="text-xs">
                          {agent.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span>Powered by {model?.name}</span>
                      </div>

                      {agent.status === "working" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Processing...</span>
                            <span>{Math.round(agent.progress)}%</span>
                          </div>
                          <Progress value={agent.progress} className="h-2" />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Tokens Used</span>
                          <div className="font-mono">{agent.tokensUsed.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost</span>
                          <div className="font-mono">${agent.cost.toFixed(4)}</div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => startAgent(agent.id)}
                        disabled={agent.status === "working"}
                        className="w-full"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {agent.status === "working" ? "Processing..." : "Start Agent"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Enterprise Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">99.9%</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">2.3M</div>
                      <div className="text-xs text-muted-foreground">Tokens Processed</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Data Retention</span>
                      <Badge variant="outline" className="text-xs">
                        Zero-Retention
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Security</span>
                      <Badge variant="outline" className="text-xs">
                        Enterprise-Grade
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Scaling</span>
                      <Badge variant="outline" className="text-xs">
                        Auto-Scale
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-200/20">
                    <div className="text-sm font-medium mb-2">Enterprise Features</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Guaranteed uptime SLA</li>
                      <li>• Zero-retention data flow</li>
                      <li>• Usage-based pricing</li>
                      <li>• No GPU management required</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
