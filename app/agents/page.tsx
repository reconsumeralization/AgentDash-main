"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Navigation, BreadcrumbNavigation } from "@/components/navigation"
import {
  Bot,
  Brain,
  Settings,
  Play,
  Square,
  Plus,
  Store,
  Shield,
  Code,
  Database,
  MessageSquare,
  Zap,
  BarChart3,
  Users,
  Activity
} from "lucide-react"

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const myAgents = [
    {
      id: "1",
      name: "Code Review Assistant",
      description: "Automated code review and quality analysis",
      status: "running",
      model: "GPT-4",
      lastUsed: "2 hours ago",
      usageCount: 145
    },
    {
      id: "2",
      name: "Data Analyzer",
      description: "Intelligent data processing and insights",
      status: "idle",
      model: "Claude-3",
      lastUsed: "1 day ago",
      usageCount: 89
    },
    {
      id: "3",
      name: "Content Writer",
      description: "Creative content generation",
      status: "running",
      model: "GPT-4",
      lastUsed: "30 min ago",
      usageCount: 203
    }
  ]

  const agentTemplates = [
    {
      id: "api-tester",
      name: "API Tester",
      description: "Automated API testing and validation",
      category: "Testing",
      capabilities: ["API Testing", "Response Validation", "Error Detection"],
      icon: Shield
    },
    {
      id: "code-generator",
      name: "Code Generator",
      description: "AI-powered code generation and refactoring",
      category: "Development",
      capabilities: ["Code Generation", "Refactoring", "Documentation"],
      icon: Code
    },
    {
      id: "data-analyzer",
      name: "Data Analyzer",
      description: "Intelligent data analysis and insights",
      category: "Analytics",
      capabilities: ["Data Analysis", "Pattern Recognition", "Reporting"],
      icon: Database
    }
  ]

  const marketplaceAgents = [
    {
      id: "market-1",
      name: "Advanced Code Reviewer Pro",
      description: "Enterprise-grade code review with security analysis",
      price: "0.5 SOL/hr",
      rating: 4.8,
      downloads: 1250,
      author: "CodeSecure Labs"
    },
    {
      id: "market-2",
      name: "Multi-Language Translator",
      description: "Real-time translation for 50+ languages",
      price: "0.3 SOL/hr",
      rating: 4.9,
      downloads: 2100,
      author: "LinguaTech"
    }
  ]

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
          <div>
            <h1 className="text-3xl font-bold text-white">AI Agents</h1>
            <p className="text-gray-400 mt-1">Manage, create, and deploy your AI agents</p>
          </div>
          <div className="flex gap-3">
            <Link href="/agents/marketplace">
              <Button variant="outline" size="sm">
                <Store className="h-4 w-4 mr-2" />
                Marketplace
              </Button>
            </Link>
            <Link href="/agents/builder">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-agents">My Agents</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-400" />
                    Active Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">8</div>
                  <p className="text-gray-400 text-sm">2 running, 6 idle</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    Total Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">12.5K</div>
                  <p className="text-gray-400 text-sm">Requests this month</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">98.2%</div>
                  <p className="text-gray-400 text-sm">+0.5% from last week</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/agents/builder">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Plus className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-white">Create Agent</div>
                          <div className="text-sm text-gray-400">Build from scratch</div>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/agents/templates">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Code className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-white">Use Template</div>
                          <div className="text-sm text-gray-400">Start with preset</div>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/agents/marketplace">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Store className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-white">Browse Market</div>
                          <div className="text-sm text-gray-400">Find new agents</div>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/agents/orchestrator">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <Settings className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-white">Orchestrator</div>
                          <div className="text-sm text-gray-400">Manage running agents</div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">My Agents</h2>
              <Link href="/agents/builder">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Agent
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAgents.map((agent) => (
                <Card key={agent.id} className="bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                      <Badge variant={agent.status === 'running' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Model:</span>
                        <span className="text-white">{agent.model}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Last used:</span>
                        <span className="text-white">{agent.lastUsed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Usage:</span>
                        <span className="text-white">{agent.usageCount} requests</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant={agent.status === 'running' ? 'destructive' : 'default'} className="flex-1">
                          {agent.status === 'running' ? (
                            <>
                              <Square className="h-4 w-4 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Agent Templates</h2>
              <Link href="/agents/builder">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Custom Build
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentTemplates.map((template) => (
                <Card key={template.id} className="bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                        <template.icon className="h-6 w-6 text-blue-400" />
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <CardTitle className="text-white text-lg group-hover:text-blue-400 transition-colors">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Capabilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.capabilities.map((capability, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Agent Marketplace</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Popular
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  New
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketplaceAgents.map((agent) => (
                <Card key={agent.id} className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                      <Badge variant="secondary">{agent.price}</Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      by {agent.author}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{agent.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>⭐ {agent.rating}</span>
                        <span>{agent.downloads} downloads</span>
                      </div>
                      <Button size="sm">
                        <Zap className="h-4 w-4 mr-2" />
                        Get Agent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
