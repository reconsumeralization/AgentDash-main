"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { GitBranch, Brain, FileText, Bot, Zap, Workflow, Sparkles, TrendingUp, Clock, CheckCircle } from "lucide-react"

interface WorkflowSystemHubProps {
  onOpenWorkflowBuilder: () => void
  onOpenSemanticBuilder: () => void
  onOpenAPIGenerator: () => void
  onOpenAgentConverter: () => void
  onOpenAIGateway: () => void
}

export function WorkflowSystemHub({
  onOpenWorkflowBuilder,
  onOpenSemanticBuilder,
  onOpenAPIGenerator,
  onOpenAgentConverter,
  onOpenAIGateway,
}: WorkflowSystemHubProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const systemStats = {
    totalWorkflows: 24,
    activeAgents: 12,
    apiEndpoints: 48,
    monthlyExecutions: 15420,
  }

  const recentActivity = [
    {
      id: 1,
      type: "workflow",
      title: "Fantasy Sports Optimizer",
      action: "deployed",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      type: "agent",
      title: "Crypto Trading Bot",
      action: "converted",
      time: "15 minutes ago",
      status: "success",
    },
    {
      id: 3,
      type: "api",
      title: "Betting Odds API",
      action: "documented",
      time: "1 hour ago",
      status: "success",
    },
  ]

  const quickActions = [
    {
      title: "Visual Workflow Builder",
      description: "Create workflows with drag-and-drop interface",
      iconName: "GitBranch",
      color: "text-blue-400 bg-blue-500/20",
      action: onOpenWorkflowBuilder,
    },
    {
      title: "AI Semantic Builder",
      description: "Generate workflows from natural language",
      iconName: "Brain",
      color: "text-purple-400 bg-purple-500/20",
      action: onOpenSemanticBuilder,
    },
    {
      title: "API Documentation",
      description: "Auto-generate comprehensive API docs",
      iconName: "FileText",
      color: "text-green-400 bg-green-500/20",
      action: onOpenAPIGenerator,
    },
    {
      title: "Agent Converter",
      description: "Transform workflows into deployable agents",
      iconName: "Bot",
      color: "text-orange-400 bg-orange-500/20",
      action: onOpenAgentConverter,
    },
    {
      title: "AI Gateway",
      description: "Intelligent model routing and optimization",
      iconName: "Zap",
      color: "text-yellow-400 bg-yellow-500/20",
      action: onOpenAIGateway,
    },
  ]

  // Function to get action icon component by name
  const getActionIconComponent = (iconName: string) => {
    switch (iconName) {
      case "GitBranch": return GitBranch;
      case "Brain": return Brain;
      case "FileText": return FileText;
      case "Bot": return Bot;
      case "Zap": return Zap;
      default: return GitBranch;
    }
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Workflow className="w-8 h-8 text-blue-400" />
          Workflow System Hub
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Complete workflow management system with visual builders, AI-powered generation, and automated deployment
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Workflows</p>
                <p className="text-2xl font-bold text-white">{systemStats.totalWorkflows}</p>
              </div>
              <GitBranch className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold text-green-400">{systemStats.activeAgents}</p>
              </div>
              <Bot className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">API Endpoints</p>
                <p className="text-2xl font-bold text-purple-400">{systemStats.apiEndpoints}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Monthly Executions</p>
                <p className="text-2xl font-bold text-yellow-400">{systemStats.monthlyExecutions.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-black/20 backdrop-blur-sm">
          <TabsTrigger value="overview" className="text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-white">
            Tools
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-white">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, idx) => {
                  const Icon = getActionIconComponent(action.iconName)
                  return (
                    <div
                      key={idx}
                      onClick={action.action}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-white font-medium group-hover:text-blue-300 transition-colors">
                          {action.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quickActions.map((tool, idx) => {
              const Icon = getActionIconComponent(tool.iconName)
              return (
                <Card key={idx} className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${tool.color.split(" ")[0]}`} />
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">{tool.description}</p>
                    <Button onClick={tool.action} className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200">
                      Open {tool.title}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">{activity.title}</div>
                        <div className="text-sm text-gray-400">
                          {activity.action} • {activity.time}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-200">{activity.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
