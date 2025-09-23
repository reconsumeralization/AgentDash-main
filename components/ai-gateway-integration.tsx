"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import {
  Zap,
  Brain,
  Activity,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Settings,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react"

interface AIGatewayStats {
  totalRequests: number
  successRate: number
  avgLatency: number
  costSaved: number
  modelsUsed: string[]
  currentLoad: number
}

interface ModelConfig {
  id: string
  name: string
  provider: string
  cost: number
  latency: number
  enabled: boolean
  fallback?: string
}

export function AIGatewayIntegration() {
  const [stats, setStats] = useState<AIGatewayStats>({
    totalRequests: 15420,
    successRate: 99.2,
    avgLatency: 245,
    costSaved: 1250.5,
    modelsUsed: ["GPT-4", "Claude-3", "Gemini-Pro", "Llama-2"],
    currentLoad: 67,
  })

  const [models, setModels] = useState<ModelConfig[]>([
    {
      id: "gpt-4",
      name: "GPT-4 Turbo",
      provider: "OpenAI",
      cost: 0.03,
      latency: 1200,
      enabled: true,
      fallback: "gpt-3.5-turbo",
    },
    {
      id: "claude-3",
      name: "Claude-3 Opus",
      provider: "Anthropic",
      cost: 0.015,
      latency: 800,
      enabled: true,
      fallback: "claude-3-sonnet",
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      provider: "Google",
      cost: 0.001,
      latency: 600,
      enabled: true,
    },
    {
      id: "llama-2",
      name: "Llama-2 70B",
      provider: "Meta",
      cost: 0.0007,
      latency: 400,
      enabled: false,
    },
  ])

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)

  const optimizeRouting = useCallback(async () => {
    setIsOptimizing(true)
    setOptimizationProgress(0)

    // Simulate optimization process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setOptimizationProgress(i)
    }

    // Update stats after optimization
    setStats((prev) => ({
      ...prev,
      successRate: Math.min(99.9, prev.successRate + 0.3),
      avgLatency: Math.max(200, prev.avgLatency - 15),
      costSaved: prev.costSaved + 125.25,
    }))

    setIsOptimizing(false)
  }, [])

  const toggleModel = useCallback((modelId: string) => {
    setModels((prev) => prev.map((model) => (model.id === modelId ? { ...model, enabled: !model.enabled } : model)))
  }, [])

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Gateway Control Center</h2>
          <p className="text-gray-400">Intelligent routing and optimization for AI model requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={optimizeRouting}
            disabled={isOptimizing}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isOptimizing ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Optimize Routing
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-white">{stats.totalRequests.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">{stats.successRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Latency</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.avgLatency}ms</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Cost Saved</p>
                <p className="text-2xl font-bold text-purple-400">${stats.costSaved}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Progress */}
      {isOptimizing && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Brain className="w-6 h-6 text-blue-400 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Optimizing AI Gateway Routes</span>
                  <span className="text-blue-400">{optimizationProgress}%</span>
                </div>
                <Progress value={optimizationProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-black/20 backdrop-blur-sm">
          <TabsTrigger value="models" className="text-white">
            Models
          </TabsTrigger>
          <TabsTrigger value="routing" className="text-white">
            Routing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-white">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Model Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${model.enabled ? "bg-green-400" : "bg-gray-400"}`} />
                      <div>
                        <h4 className="text-white font-medium">{model.name}</h4>
                        <p className="text-sm text-gray-400">{model.provider}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                        ${model.cost}/1K tokens
                      </Badge>
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-200">
                        {model.latency}ms
                      </Badge>
                      {model.fallback && (
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                          Fallback: {model.fallback}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleModel(model.id)}
                    size="sm"
                    variant={model.enabled ? "destructive" : "default"}
                    className={
                      model.enabled
                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-200"
                        : "bg-green-500/20 hover:bg-green-500/30 text-green-200"
                    }
                  >
                    {model.enabled ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Intelligent Routing Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Load Balancing</h4>
                  <p className="text-sm text-gray-400 mb-3">Distribute requests across models based on current load</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Current Load:</span>
                    <Progress value={stats.currentLoad} className="flex-1 h-2" />
                    <span className="text-sm text-blue-400">{stats.currentLoad}%</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Cost Optimization</h4>
                  <p className="text-sm text-gray-400 mb-3">Route to most cost-effective models when possible</p>
                  <div className="text-sm text-green-400">Saved ${stats.costSaved} this month</div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Latency Priority</h4>
                  <p className="text-sm text-gray-400 mb-3">Prioritize fastest models for real-time requests</p>
                  <div className="text-sm text-yellow-400">Avg: {stats.avgLatency}ms response time</div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Fallback Strategy</h4>
                  <p className="text-sm text-gray-400 mb-3">Automatic failover to backup models</p>
                  <div className="text-sm text-purple-400">{stats.successRate}% uptime maintained</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Gateway Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Request Timeout (ms)</label>
                  <Input type="number" defaultValue="30000" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Max Retries</label>
                  <Input type="number" defaultValue="3" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Rate Limit (req/min)</label>
                  <Input type="number" defaultValue="1000" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Cache TTL (seconds)</label>
                  <Input type="number" defaultValue="300" className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
