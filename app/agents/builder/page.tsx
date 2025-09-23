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
  Bot,
  Brain,
  Settings,
  Play,
  Save,
  ArrowLeft,
  Code,
  Zap,
  Database,
  MessageSquare,
  Search,
  FileText,
  Globe,
  Shield,
  Sparkles
} from "lucide-react"

export default function AgentBuilderPage() {
  const [activeTab, setActiveTab] = useState("basic")
  const [agentConfig, setAgentConfig] = useState({
    name: "",
    description: "",
    type: "context",
    model: "gpt-4",
    temperature: 0.7,
    systemPrompt: "",
    capabilities: [] as string[],
    tools: [] as string[],
    knowledgeBase: "",
    apiEndpoints: [] as string[]
  })

  const agentTypes = [
    { value: "context", label: "Context Analyzer", icon: Brain, description: "Analyzes and understands context from user input" },
    { value: "research", label: "Research Agent", icon: Search, description: "Gathers and synthesizes information from various sources" },
    { value: "expert", label: "Expert Agent", icon: Sparkles, description: "Provides specialized knowledge and expertise" },
    { value: "coding", label: "Coding Agent", icon: Code, description: "Writes and maintains code across multiple languages" },
    { value: "api", label: "API Agent", icon: Globe, description: "Interacts with external APIs and services" },
    { value: "security", label: "Security Agent", icon: Shield, description: "Handles security, authentication, and compliance" }
  ]

  const capabilities = [
    "Natural Language Processing",
    "Code Generation",
    "Data Analysis",
    "API Integration",
    "File Processing",
    "Research & Synthesis",
    "Security Analysis",
    "Workflow Orchestration",
    "Knowledge Base Query",
    "Multi-modal Processing"
  ]

  const tools = [
    "Web Search",
    "File Reader",
    "Database Query",
    "API Client",
    "Code Executor",
    "Image Processor",
    "Email Client",
    "Calendar Integration",
    "Document Parser",
    "Translation Service"
  ]

  const handleCapabilityToggle = (capability: string) => {
    setAgentConfig(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }))
  }

  const handleToolToggle = (tool: string) => {
    setAgentConfig(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }))
  }

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
            <Link href="/agents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Agents
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Agent Builder</h1>
              <p className="text-gray-400 mt-1">Create and configure custom AI agents for your specific needs</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Load Template
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Agent Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                    <TabsTrigger value="tools">Tools</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white">Agent Name</Label>
                        <Input
                          placeholder="Enter agent name..."
                          value={agentConfig.name}
                          onChange={(e) => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white/5 border-white/10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Agent Type</Label>
                        <Select value={agentConfig.type} onValueChange={(value) => setAgentConfig(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {agentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <Textarea
                        placeholder="Describe what this agent does..."
                        value={agentConfig.description}
                        onChange={(e) => setAgentConfig(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white/5 border-white/10"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white">AI Model</Label>
                        <Select value={agentConfig.model} onValueChange={(value) => setAgentConfig(prev => ({ ...prev, model: value }))}>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</SelectItem>
                            <SelectItem value="claude-3">Claude 3 (Balanced)</SelectItem>
                            <SelectItem value="gemini-pro">Gemini Pro (Efficient)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Temperature</Label>
                        <Input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={agentConfig.temperature}
                          onChange={(e) => setAgentConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">System Prompt</Label>
                      <Textarea
                        placeholder="Enter the system prompt that defines this agent's behavior..."
                        value={agentConfig.systemPrompt}
                        onChange={(e) => setAgentConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                        className="bg-white/5 border-white/10"
                        rows={6}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="capabilities" className="space-y-6">
                    <div>
                      <h3 className="text-white text-lg font-medium mb-4">Select Agent Capabilities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {capabilities.map((capability) => (
                          <div
                            key={capability}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              agentConfig.capabilities.includes(capability)
                                ? 'bg-blue-500/20 border-blue-500/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                            onClick={() => handleCapabilityToggle(capability)}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded border-2 ${
                                agentConfig.capabilities.includes(capability)
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-400'
                              }`} />
                              <span className="text-white text-sm">{capability}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tools" className="space-y-6">
                    <div>
                      <h3 className="text-white text-lg font-medium mb-4">Select Available Tools</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tools.map((tool) => (
                          <div
                            key={tool}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              agentConfig.tools.includes(tool)
                                ? 'bg-green-500/20 border-green-500/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                            onClick={() => handleToolToggle(tool)}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded border-2 ${
                                agentConfig.tools.includes(tool)
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-400'
                              }`} />
                              <span className="text-white text-sm">{tool}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Knowledge Base</Label>
                      <Textarea
                        placeholder="Configure knowledge base access, vector stores, or custom data sources..."
                        value={agentConfig.knowledgeBase}
                        onChange={(e) => setAgentConfig(prev => ({ ...prev, knowledgeBase: e.target.value }))}
                        className="bg-white/5 border-white/10"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">API Endpoints</Label>
                      <Textarea
                        placeholder="Configure API endpoints this agent can access (one per line)..."
                        value={agentConfig.apiEndpoints.join('\n')}
                        onChange={(e) => setAgentConfig(prev => ({
                          ...prev,
                          apiEndpoints: e.target.value.split('\n').filter(url => url.trim())
                        }))}
                        className="bg-white/5 border-white/10"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Memory Configuration</Label>
                      <Select defaultValue="short-term">
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short-term">Short-term Memory</SelectItem>
                          <SelectItem value="long-term">Long-term Memory</SelectItem>
                          <SelectItem value="persistent">Persistent Memory</SelectItem>
                          <SelectItem value="shared">Shared Memory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Agent Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {agentConfig.name || "Unnamed Agent"}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {agentTypes.find(t => t.value === agentConfig.type)?.label || "Unknown Type"}
                    </Badge>
                  </div>
                </div>

                {agentConfig.description && (
                  <p className="text-gray-400 text-sm">{agentConfig.description}</p>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Capabilities</div>
                  <div className="flex flex-wrap gap-1">
                    {agentConfig.capabilities.length > 0 ? (
                      agentConfig.capabilities.map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">No capabilities selected</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Tools</div>
                  <div className="flex flex-wrap gap-1">
                    {agentConfig.tools.length > 0 ? (
                      agentConfig.tools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                          {tool}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">No tools selected</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Configuration</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model:</span>
                      <span className="text-white">{agentConfig.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temperature:</span>
                      <span className="text-white">{agentConfig.temperature}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Test Agent
                </Button>
                <Button className="w-full" variant="outline">
                  <Code className="h-4 w-4 mr-2" />
                  Generate Code
                </Button>
                <Button className="w-full" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Connect Data Source
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with Agent
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
