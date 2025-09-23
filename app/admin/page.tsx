"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Navigation, BreadcrumbNavigation } from "@/components/navigation"
import {
  Shield,
  Users,
  Activity,
  Settings,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Server,
  Lock,
  Key,
  Eye,
  UserCheck,
  FileText,
  Zap
} from "lucide-react"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const systemStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalAgents: 456,
    activeAgents: 234,
    apiCalls: 45678,
    errorRate: 0.02,
    uptime: 99.9
  }

  const recentActivities = [
    {
      id: "1",
      user: "john.doe@example.com",
      action: "Created new agent",
      timestamp: "2 minutes ago",
      type: "success"
    },
    {
      id: "2",
      user: "sarah.smith@example.com",
      action: "Updated workflow configuration",
      timestamp: "5 minutes ago",
      type: "info"
    },
    {
      id: "3",
      user: "mike.johnson@example.com",
      action: "Failed login attempt",
      timestamp: "8 minutes ago",
      type: "warning"
    },
    {
      id: "4",
      user: "admin@agentdash.com",
      action: "System backup completed",
      timestamp: "15 minutes ago",
      type: "success"
    }
  ]

  const systemHealth = [
    {
      name: "API Gateway",
      status: "healthy",
      uptime: 99.9,
      responseTime: 45
    },
    {
      name: "Database",
      status: "healthy",
      uptime: 99.8,
      responseTime: 12
    },
    {
      name: "File Storage",
      status: "warning",
      uptime: 98.5,
      responseTime: 89
    },
    {
      name: "AI Models",
      status: "healthy",
      uptime: 99.7,
      responseTime: 234
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
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">System monitoring, user management, and platform administration</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
            <Button size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Security Audit
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">{systemStats.totalUsers.toLocaleString()}</div>
                  <div className="text-xs text-green-400">+12% from last month</div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">{systemStats.activeUsers.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)}% of total</div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    API Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">{systemStats.apiCalls.toLocaleString()}</div>
                  <div className="text-xs text-blue-400">+8% from last hour</div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    System Uptime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">{systemStats.uptime}%</div>
                  <Progress value={systemStats.uptime} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* System Health & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemHealth.map((service, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            service.status === 'healthy' ? 'bg-green-400' :
                            service.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          <span className="text-white">{service.name}</span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-400">{service.uptime}% uptime</div>
                          <div className="text-gray-500">{service.responseTime}ms</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-400' :
                          activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                        }`} />
                        <div className="flex-1">
                          <div className="text-white text-sm">{activity.action}</div>
                          <div className="text-gray-400 text-xs">{activity.user} • {activity.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">User Management</h2>
                <p className="text-gray-400">Manage user accounts, permissions, and access</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Users
                </Button>
                <Button size="sm">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">user{i + 1}@example.com</div>
                          <div className="text-gray-400 text-sm">Last active: {Math.floor(Math.random() * 24)} hours ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={
                          Math.random() > 0.5 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        }>
                          {Math.random() > 0.5 ? 'Active' : 'Premium'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Database Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Records</span>
                    <span className="text-white">1,247,893</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Connections</span>
                    <span className="text-white">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Query Performance</span>
                    <span className="text-green-400">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Storage Used</span>
                    <span className="text-white">2.4 GB / 10 GB</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">API Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Requests</span>
                    <span className="text-white">45,678</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg Response Time</span>
                    <span className="text-white">127ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Error Rate</span>
                    <span className="text-red-400">0.02%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Throughput</span>
                    <span className="text-white">1,247 req/min</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  <div className="text-green-400">[INFO] System startup completed</div>
                  <div className="text-blue-400">[INFO] Database connection established</div>
                  <div className="text-yellow-400">[WARN] High memory usage detected</div>
                  <div className="text-green-400">[INFO] Backup completed successfully</div>
                  <div className="text-blue-400">[INFO] API rate limits reset</div>
                  <div className="text-green-400">[INFO] User authentication successful</div>
                  <div className="text-red-400">[ERROR] Failed to connect to external service</div>
                  <div className="text-green-400">[INFO] System health check passed</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Security Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Failed Logins (24h)</span>
                    <span className="text-red-400">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Active Sessions</span>
                    <span className="text-white">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Security Alerts</span>
                    <span className="text-yellow-400">3</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Access Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Admin Users</span>
                    <span className="text-white">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">API Keys</span>
                    <span className="text-white">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Permissions</span>
                    <span className="text-white">156</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">GDPR Status</span>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Data Encryption</span>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Audit Logs</span>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Daily Active Users</span>
                        <span className="text-white">892 / 1,000</span>
                      </div>
                      <Progress value={89.2} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">API Usage</span>
                        <span className="text-white">78% / 100%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Storage Used</span>
                        <span className="text-white">24% / 100%</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Avg Response Time</span>
                      <span className="text-white">127ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">99th Percentile</span>
                      <span className="text-white">450ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Error Rate</span>
                      <span className="text-green-400">0.02%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Uptime (30d)</span>
                      <span className="text-green-400">99.9%</span>
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
