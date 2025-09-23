"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Navigation, BreadcrumbNavigation } from "@/components/navigation"
import {
  GitBranch,
  Brain,
  FileText,
  Bot,
  Zap,
  Play,
  Square,
  Settings,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from "lucide-react"

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const myWorkflows = [
    {
      id: "1",
      name: "Content Creation Pipeline",
      description: "Automated blog post generation and publishing",
      status: "running",
      lastRun: "2 hours ago",
      successRate: "95%",
      executions: 142
    },
    {
      id: "2",
      name: "Data Processing Workflow",
      description: "ETL pipeline for customer analytics",
      status: "idle",
      lastRun: "1 day ago",
      successRate: "98%",
      executions: 89
    },
    {
      id: "3",
      name: "Customer Support Automation",
      description: "Intelligent ticket routing and response",
      status: "error",
      lastRun: "30 min ago",
      successRate: "87%",
      executions: 203
    }
  ]

  const workflowTemplates = [
    {
      id: "content-creation",
      name: "Content Creation",
      description: "Generate and publish content automatically",
      category: "Marketing",
      steps: ["Research", "Write", "Edit", "Publish"],
      icon: FileText
    },
    {
      id: "data-processing",
      name: "Data Processing",
      description: "ETL and data transformation workflows",
      category: "Analytics",
      steps: ["Extract", "Transform", "Load", "Validate"],
      icon: BarChart3
    },
    {
      id: "customer-support",
      name: "Customer Support",
      description: "Intelligent customer service automation",
      category: "Support",
      steps: ["Classify", "Route", "Respond", "Follow-up"],
      icon: Bot
    }
  ]

  const runningWorkflows = [
    {
      id: "run-1",
      workflowName: "Content Creation Pipeline",
      startedAt: "2024-01-17T14:30:00Z",
      currentStep: "Writing Article",
      progress: 65,
      estimatedTime: "5 min remaining"
    },
    {
      id: "run-2",
      workflowName: "Data Sync Process",
      startedAt: "2024-01-17T14:25:00Z",
      currentStep: "Transforming Data",
      progress: 30,
      estimatedTime: "12 min remaining"
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
            <h1 className="text-3xl font-bold text-white">Workflows</h1>
            <p className="text-gray-400 mt-1">Design, manage, and monitor your automated workflows</p>
          </div>
          <div className="flex gap-3">
            <Link href="/workflows/semantic">
              <Button variant="outline" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                AI Builder
              </Button>
            </Link>
            <Link href="/workflows/builder">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="running">Running</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-blue-400" />
                    Total Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">24</div>
                  <p className="text-gray-400 text-sm">8 active, 16 templates</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-400" />
                    Running Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">3</div>
                  <p className="text-gray-400 text-sm">2 completing soon</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">94.2%</div>
                  <p className="text-gray-400 text-sm">+2.1% from last week</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-400" />
                    Avg. Runtime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">8.5m</div>
                  <p className="text-gray-400 text-sm">12% faster than last week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/workflows/builder">
                      <Button variant="outline" className="w-full justify-start">
                        <GitBranch className="h-4 w-4 mr-3" />
                        Visual Workflow Builder
                      </Button>
                    </Link>
                    <Link href="/workflows/semantic">
                      <Button variant="outline" className="w-full justify-start">
                        <Brain className="h-4 w-4 mr-3" />
                        AI Semantic Builder
                      </Button>
                    </Link>
                    <Link href="/workflows/templates">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-3" />
                        Browse Templates
                      </Button>
                    </Link>
                    <Link href="/workflows/analytics">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-3" />
                        View Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 text-sm font-medium">1</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Choose a Template</h4>
                        <p className="text-gray-400 text-sm">Start with a pre-built workflow template</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-400 text-sm font-medium">2</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Customize & Connect</h4>
                        <p className="text-gray-400 text-sm">Add your agents and configure connections</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-400 text-sm font-medium">3</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Test & Deploy</h4>
                        <p className="text-gray-400 text-sm">Run tests and deploy to production</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="my-workflows" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">My Workflows</h2>
              <Link href="/workflows/builder">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Workflow
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myWorkflows.map((workflow) => (
                <Card key={workflow.id} className="bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{workflow.name}</CardTitle>
                      <Badge variant={
                        workflow.status === 'running' ? 'default' :
                        workflow.status === 'idle' ? 'secondary' : 'destructive'
                      }>
                        {workflow.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      {workflow.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Last run:</span>
                          <p className="text-white">{workflow.lastRun}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Success rate:</span>
                          <p className="text-white">{workflow.successRate}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total executions:</span>
                        <span className="text-white">{workflow.executions}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant={
                          workflow.status === 'running' ? 'destructive' : 'default'
                        } className="flex-1">
                          {workflow.status === 'running' ? (
                            <>
                              <Square className="h-4 w-4 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Run
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
              <h2 className="text-xl font-semibold text-white">Workflow Templates</h2>
              <Link href="/workflows/builder">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Custom Build
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflowTemplates.map((template) => (
                <Card key={template.id} className="bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                        <template.icon className="h-6 w-6 text-green-400" />
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <CardTitle className="text-white text-lg group-hover:text-green-400 transition-colors">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Workflow Steps:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.steps.map((step, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {step}
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

          <TabsContent value="running" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Running Workflows</h2>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {runningWorkflows.map((run) => (
                <Card key={run.id} className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-medium">{run.workflowName}</h3>
                        <p className="text-gray-400 text-sm">Started {new Date(run.startedAt).toLocaleString()}</p>
                      </div>
                      <Badge variant="default">Running</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Step:</span>
                        <span className="text-white">{run.currentStep}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress:</span>
                          <span className="text-white">{run.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${run.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Estimated time:</span>
                        <span className="text-white">{run.estimatedTime}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Monitor
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Config
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Square className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Workflow Analytics</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Last 7 days</Button>
                <Button variant="outline" size="sm">Last 30 days</Button>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Runtime</span>
                      <span className="text-white font-medium">8.5 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="text-green-400 font-medium">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Executions</span>
                      <span className="text-white font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Cost Efficiency</span>
                      <span className="text-blue-400 font-medium">$0.12 per execution</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Workflow Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-400">Healthy Workflows</span>
                      </div>
                      <span className="text-white font-medium">18/24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-400">Needs Attention</span>
                      </div>
                      <span className="text-white font-medium">4/24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span className="text-gray-400">Critical Issues</span>
                      </div>
                      <span className="text-white font-medium">2/24</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
