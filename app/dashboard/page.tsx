"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Navigation, BreadcrumbNavigation } from "@/components/navigation"
import {
  Brain,
  GitBranch,
  Bot,
  Network,
  Users,
  Zap,
  FileText,
  Code,
  Settings,
  BarChart3,
  Shield,
  Globe,
  Link as LinkIcon,
  Store,
  Workflow,
  Sparkles
} from "lucide-react"

export default function DashboardPage() {
  const [stats] = useState({
    activeAgents: 12,
    runningWorkflows: 5,
    totalIntegrations: 8,
    monthlyUsage: "2.4K"
  })

  const quickActions = [
    {
      title: "Create Agent",
      description: "Build a new AI agent",
      icon: Bot,
      href: "/agents/builder",
      color: "bg-blue-500/20 text-blue-400"
    },
    {
      title: "New Workflow",
      description: "Design a workflow",
      icon: GitBranch,
      href: "/workflows/builder",
      color: "bg-green-500/20 text-green-400"
    },
    {
      title: "Agent Marketplace",
      description: "Browse available agents",
      icon: Store,
      href: "/agents/marketplace",
      color: "bg-purple-500/20 text-purple-400"
    },
    {
      title: "API Integration",
      description: "Connect external services",
      icon: Globe,
      href: "/integrations",
      color: "bg-orange-500/20 text-orange-400"
    }
  ]

  const recentActivity = [
    { type: "agent", name: "Code Review Agent", action: "completed task", time: "2 min ago" },
    { type: "workflow", name: "Data Processing Pipeline", action: "started", time: "5 min ago" },
    { type: "integration", name: "GitHub Webhook", action: "connected", time: "1 hour ago" },
    { type: "agent", name: "Content Writer", action: "updated", time: "2 hours ago" }
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
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back! Here's your AI orchestration overview.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Quick Start
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeAgents}</div>
              <p className="text-xs text-gray-400">+2 from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Running Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.runningWorkflows}</div>
              <p className="text-xs text-gray-400">3 completing soon</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Integrations</CardTitle>
              <Network className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalIntegrations}</div>
              <p className="text-xs text-gray-400">All healthy</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Monthly Usage</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.monthlyUsage}</div>
              <p className="text-xs text-gray-400">+15% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-white text-base">{action.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400">
                      {action.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'agent' ? 'bg-blue-500/20' :
                        activity.type === 'workflow' ? 'bg-green-500/20' :
                        activity.type === 'integration' ? 'bg-purple-500/20' : 'bg-gray-500/20'
                      }`}>
                        {activity.type === 'agent' && <Bot className="h-4 w-4 text-blue-400" />}
                        {activity.type === 'workflow' && <GitBranch className="h-4 w-4 text-green-400" />}
                        {activity.type === 'integration' && <Network className="h-4 w-4 text-purple-400" />}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{activity.name}</p>
                        <p className="text-gray-400 text-xs">{activity.action}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Getting Started</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Build Your First Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">
                  Learn how to create custom AI agents with our intuitive builder.
                </p>
                <Link href="/agents/builder">
                  <Button size="sm" className="w-full">
                    Start Building
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Create a Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">
                  Design automated workflows that connect your agents.
                </p>
                <Link href="/workflows/builder">
                  <Button size="sm" className="w-full">
                    Create Workflow
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Explore Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">
                  Connect with external services and APIs.
                </p>
                <Link href="/integrations">
                  <Button size="sm" className="w-full">
                    View Integrations
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
