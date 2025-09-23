"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Navigation, BreadcrumbNavigation } from "@/components/navigation"
import {
  Globe,
  FileText,
  Link as LinkIcon,
  Zap,
  Network,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
  ExternalLink,
  Code,
  Webhook,
  Eye
} from "lucide-react"

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const integrations = [
    {
      id: "github",
      name: "GitHub",
      description: "Repository management and webhook integration",
      category: "Development",
      status: "connected",
      lastSync: "5 min ago",
      icon: Globe,
      color: "text-gray-300"
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team communication and notifications",
      category: "Communication",
      status: "connected",
      lastSync: "2 hours ago",
      icon: Network,
      color: "text-purple-400"
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "GPT models and AI capabilities",
      category: "AI Services",
      status: "connected",
      lastSync: "1 min ago",
      icon: Zap,
      color: "text-green-400"
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Payment processing and subscriptions",
      category: "Finance",
      status: "disconnected",
      lastSync: "Never",
      icon: Settings,
      color: "text-blue-400"
    },
    {
      id: "webhook",
      name: "Custom Webhooks",
      description: "Generic webhook endpoints",
      category: "API",
      status: "connected",
      lastSync: "30 sec ago",
      icon: Webhook,
      color: "text-orange-400"
    }
  ]

  const availableIntegrations = [
    {
      id: "discord",
      name: "Discord",
      description: "Community management and bot integration",
      category: "Communication",
      icon: Network,
      color: "text-indigo-400"
    },
    {
      id: "notion",
      name: "Notion",
      description: "Document and knowledge base integration",
      category: "Productivity",
      icon: FileText,
      color: "text-gray-400"
    },
    {
      id: "airtable",
      name: "Airtable",
      description: "Database and spreadsheet integration",
      category: "Data",
      icon: Settings,
      color: "text-red-400"
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Workflow automation platform",
      category: "Automation",
      icon: Zap,
      color: "text-orange-500"
    },
    {
      id: "twilio",
      name: "Twilio",
      description: "SMS and communication services",
      category: "Communication",
      icon: LinkIcon,
      color: "text-red-500"
    },
    {
      id: "aws",
      name: "AWS",
      description: "Cloud computing and storage",
      category: "Infrastructure",
      icon: Globe,
      color: "text-yellow-500"
    }
  ]

  const apiEndpoints = [
    {
      id: "1",
      name: "Agent Execution API",
      method: "POST",
      path: "/api/agents/execute",
      status: "active",
      calls: 1247,
      lastCall: "2 min ago"
    },
    {
      id: "2",
      name: "Workflow Management",
      method: "GET",
      path: "/api/workflows",
      status: "active",
      calls: 892,
      lastCall: "5 min ago"
    },
    {
      id: "3",
      name: "Analytics Dashboard",
      method: "GET",
      path: "/api/analytics",
      status: "maintenance",
      calls: 456,
      lastCall: "1 hour ago"
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
            <h1 className="text-3xl font-bold text-white">Integrations</h1>
            <p className="text-gray-400 mt-1">Connect external services and manage API integrations</p>
          </div>
          <div className="flex gap-3">
            <Link href="/integrations/webhooks">
              <Button variant="outline" size="sm">
                <Webhook className="h-4 w-4 mr-2" />
                Webhooks
              </Button>
            </Link>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="api">API Endpoints</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Network className="h-5 w-5 text-blue-400" />
                    Connected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">8</div>
                  <p className="text-gray-400 text-sm">5 active, 3 inactive</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-400" />
                    API Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">12.5K</div>
                  <p className="text-gray-400 text-sm">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                    Uptime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">99.8%</div>
                  <p className="text-gray-400 text-sm">Last 30 days</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Webhook className="h-5 w-5 text-orange-400" />
                    Webhooks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">24</div>
                  <p className="text-gray-400 text-sm">Active endpoints</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Popular Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
                          <Globe className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">GitHub</p>
                          <p className="text-gray-400 text-sm">Repository management</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Connected
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Network className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Slack</p>
                          <p className="text-gray-400 text-sm">Team communication</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Connected
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Zap className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">OpenAI</p>
                          <p className="text-gray-400 text-sm">AI capabilities</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Connected
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Integration Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">All Systems</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-medium">Operational</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Response Time</span>
                        <span className="text-white">245ms avg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Error Rate</span>
                        <span className="text-white">0.02%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Throughput</span>
                        <span className="text-white">1.2K req/min</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Monitoring
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="connected" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Connected Integrations</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <Card key={integration.id} className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center`}>
                          <integration.icon className={`h-5 w-5 ${integration.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{integration.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant={
                        integration.status === 'connected' ? 'default' : 'secondary'
                      }>
                        {integration.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400 mt-2">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Last sync:</span>
                        <span className="text-white">{integration.lastSync}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        {integration.status === 'connected' && (
                          <Button size="sm" variant="destructive" className="flex-1">
                            Disconnect
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Available Integrations</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">All Categories</Button>
                <Button variant="outline" size="sm">Popular</Button>
                <Button variant="outline" size="sm">New</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableIntegrations.map((integration) => (
                <Card key={integration.id} className="bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <integration.icon className={`h-6 w-6 ${integration.color}`} />
                      </div>
                      <Badge variant="secondary">{integration.category}</Badge>
                    </div>
                    <CardTitle className="text-white text-lg group-hover:text-blue-400 transition-colors">
                      {integration.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">API Endpoints</h2>
              <div className="flex gap-2">
                <Link href="/integrations/docs">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    API Docs
                  </Button>
                </Link>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Endpoint
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {apiEndpoints.map((endpoint) => (
                <Card key={endpoint.id} className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={
                          endpoint.method === 'GET' ? 'border-green-500 text-green-400' :
                          endpoint.method === 'POST' ? 'border-blue-500 text-blue-400' :
                          'border-yellow-500 text-yellow-400'
                        }>
                          {endpoint.method}
                        </Badge>
                        <div>
                          <h3 className="text-white font-medium">{endpoint.name}</h3>
                          <code className="text-gray-400 text-sm">{endpoint.path}</code>
                        </div>
                      </div>
                      <Badge variant={
                        endpoint.status === 'active' ? 'default' :
                        endpoint.status === 'maintenance' ? 'secondary' : 'destructive'
                      }>
                        {endpoint.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Total Calls:</span>
                        <p className="text-white font-medium">{endpoint.calls.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Call:</span>
                        <p className="text-white">{endpoint.lastCall}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Avg Response:</span>
                        <p className="text-white">245ms</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Success Rate:</span>
                        <p className="text-green-400">98.7%</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Logs
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <Code className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Webhook Management</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Webhook
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Active Webhooks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">GitHub Push Events</p>
                        <p className="text-gray-400 text-sm">https://api.example.com/webhooks/github</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Active
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Slack Events</p>
                        <p className="text-gray-400 text-sm">https://api.example.com/webhooks/slack</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Active
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Webhook Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Deliveries</span>
                      <span className="text-white font-medium">12,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="text-green-400 font-medium">99.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Avg Response Time</span>
                      <span className="text-white font-medium">145ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Failed Deliveries</span>
                      <span className="text-red-400 font-medium">98</span>
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
