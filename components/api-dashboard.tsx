"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Badge } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Separator } from '@/components/ui'
import {
  Play,
  Settings,
  FileText,
  Database,
  Bot,
  GitBranch,
  Network,
  BarChart3,
  Search,
  Upload,
  Download,
  Bell,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Activity
} from 'lucide-react'

interface APIEndpoint {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  category: string
  description: string
  parameters?: any[]
  requestBody?: any
  responseSchema?: any
}

interface TestResult {
  endpoint: string
  method: string
  status: 'success' | 'error' | 'pending'
  responseTime: number
  response: any
  timestamp: string
}

export function APIDashboard() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('endpoints')
  const [userId, setUserId] = useState('demo-user-1')
  const [formData, setFormData] = useState<Record<string, any>>({})

  // Comprehensive list of all API endpoints
  const apiEndpoints: APIEndpoint[] = [
    // Agents API
    {
      id: 'agents-list',
      name: 'List Agents',
      method: 'GET',
      path: '/api/agents/gui?action=list&userId={userId}',
      category: 'Agents',
      description: 'Get all agents for a user',
      parameters: [
        { name: 'action', type: 'string', value: 'list', required: true },
        { name: 'userId', type: 'string', value: userId, required: true }
      ]
    },
    {
      id: 'agents-stats',
      name: 'Agent Statistics',
      method: 'GET',
      path: '/api/agents/gui?action=stats&userId={userId}',
      category: 'Agents',
      description: 'Get agent usage statistics'
    },
    {
      id: 'agents-create',
      name: 'Create Agent',
      method: 'POST',
      path: '/api/agents/gui',
      category: 'Agents',
      description: 'Create a new AI agent',
      requestBody: {
        action: 'create',
        userId: '{userId}',
        name: 'Test Agent',
        type: 'context',
        systemPrompt: 'You are a helpful assistant...',
        capabilities: ['chat', 'analysis']
      }
    },
    {
      id: 'agents-execute',
      name: 'Execute Agent',
      method: 'POST',
      path: '/api/agents/gui',
      category: 'Agents',
      description: 'Execute an agent with input',
      requestBody: {
        action: 'execute',
        userId: '{userId}',
        agentId: 'agent-123',
        input: 'Analyze this code for improvements...',
        context: { fileType: 'javascript' }
      }
    },

    // Workflows API
    {
      id: 'workflows-list',
      name: 'List Workflows',
      method: 'GET',
      path: '/api/workflows/gui?action=list&userId={userId}',
      category: 'Workflows',
      description: 'Get all workflows for a user'
    },
    {
      id: 'workflows-create',
      name: 'Create Workflow',
      method: 'POST',
      path: '/api/workflows/gui',
      category: 'Workflows',
      description: 'Create a new workflow',
      requestBody: {
        action: 'create',
        userId: '{userId}',
        name: 'Data Processing Workflow',
        description: 'Automated data processing pipeline',
        steps: [
          {
            id: 'step-1',
            type: 'data_ingestion',
            config: { source: 'api', format: 'json' }
          }
        ]
      }
    },
    {
      id: 'workflows-execute',
      name: 'Execute Workflow',
      method: 'POST',
      path: '/api/workflows/gui',
      category: 'Workflows',
      description: 'Execute a workflow',
      requestBody: {
        action: 'execute',
        userId: '{userId}',
        workflowId: 'workflow-123',
        input: { data: [], parameters: { batch_size: 100 } }
      }
    },

    // Integrations API
    {
      id: 'integrations-health',
      name: 'Integration Health',
      method: 'GET',
      path: '/api/integrations/manage?type=health',
      category: 'Integrations',
      description: 'Check integration health status'
    },
    {
      id: 'integrations-create',
      name: 'Create Integration',
      method: 'POST',
      path: '/api/integrations/manage',
      category: 'Integrations',
      description: 'Create a new integration instance',
      requestBody: {
        action: 'create_instance',
        definitionId: 'github',
        name: 'GitHub Integration',
        credentials: { token: 'ghp_...' },
        config: { repositories: ['repo1'] }
      }
    },

    // Dashboard Analytics
    {
      id: 'dashboard-overview',
      name: 'Dashboard Overview',
      method: 'GET',
      path: '/api/dashboard/analytics?userId={userId}&metric=overview',
      category: 'Analytics',
      description: 'Get dashboard overview metrics'
    },
    {
      id: 'dashboard-agents',
      name: 'Agent Metrics',
      method: 'GET',
      path: '/api/dashboard/analytics?userId={userId}&metric=agents',
      category: 'Analytics',
      description: 'Get agent performance metrics'
    },

    // Search API
    {
      id: 'search-basic',
      name: 'Basic Search',
      method: 'GET',
      path: '/api/search/advanced?q={query}&userId={userId}',
      category: 'Search',
      description: 'Search across all content types'
    },
    {
      id: 'search-advanced',
      name: 'Advanced Search',
      method: 'POST',
      path: '/api/search/advanced',
      category: 'Search',
      description: 'Advanced filtered search',
      requestBody: {
        query: 'machine learning',
        userId: '{userId}',
        filters: {
          categories: ['skill', 'project'],
          priorities: ['high']
        }
      }
    },

    // Data Export/Import
    {
      id: 'data-export-user',
      name: 'Export User Data',
      method: 'GET',
      path: '/api/data/export?userId={userId}&type=user_data&format=json',
      category: 'Data',
      description: 'Export complete user data'
    },
    {
      id: 'data-import-aspirations',
      name: 'Import Aspirations',
      method: 'POST',
      path: '/api/data/export',
      category: 'Data',
      description: 'Import aspiration data',
      requestBody: {
        action: 'import_aspirations',
        userId: '{userId}',
        aspirations: [
          {
            title: 'Learn React',
            category: 'skill',
            priority: 'high',
            status: 'active'
          }
        ]
      }
    },

    // Data Transformation
    {
      id: 'transform-query',
      name: 'Execute Query',
      method: 'POST',
      path: '/api/data/transform',
      category: 'Transform',
      description: 'Execute a data query',
      requestBody: {
        action: 'query',
        queryOptions: {
          table: 'users',
          select: 'id, name, created_at',
          filters: { created_at: { operator: 'gte', value: '2024-01-01' } },
          limit: 10
        }
      }
    },
    {
      id: 'transform-create-pipeline',
      name: 'Create Pipeline',
      method: 'POST',
      path: '/api/data/transform',
      category: 'Transform',
      description: 'Create a data transformation pipeline',
      requestBody: {
        action: 'create_pipeline',
        pipeline: {
          name: 'User Analytics Pipeline',
          description: 'Process user data',
          steps: [
            {
              source: { table: 'users' },
              transformations: [
                { type: 'filter', config: { condition: 'active == true' } }
              ]
            }
          ]
        }
      }
    },

    // Notifications
    {
      id: 'notifications-poll',
      name: 'Poll Notifications',
      method: 'GET',
      path: '/api/notifications/realtime?action=poll&userId={userId}',
      category: 'Notifications',
      description: 'Get pending notifications'
    },
    {
      id: 'notifications-send',
      name: 'Send Notification',
      method: 'POST',
      path: '/api/notifications/realtime',
      category: 'Notifications',
      description: 'Send a notification',
      requestBody: {
        action: 'send',
        userId: '{userId}',
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        priority: 'medium'
      }
    },

    // File Management
    {
      id: 'files-list',
      name: 'List Files',
      method: 'GET',
      path: '/api/files/list',
      category: 'Files',
      description: 'Get all files'
    },
    {
      id: 'files-upload',
      name: 'Upload File',
      method: 'POST',
      path: '/api/files/upload',
      category: 'Files',
      description: 'Upload a file'
    },

    // AI Selection
    {
      id: 'ai-select',
      name: 'AI Model Selection',
      method: 'POST',
      path: '/api/ai/select',
      category: 'AI',
      description: 'Select and execute AI model',
      requestBody: {
        task: 'Analyze this code',
        requirements: {
          type: 'code-generation',
          complexity: 'medium',
          speed: 'balanced'
        },
        execute: true
      }
    },

    // Document Processing
    {
      id: 'documents-process',
      name: 'Process Document',
      method: 'POST',
      path: '/api/documents/process',
      category: 'Documents',
      description: 'Process document with AI analysis',
      requestBody: {
        fileUrl: 'https://example.com/document.pdf',
        options: { extractText: true, aiAnalysis: true }
      }
    }
  ]

  const categories = [
    'Agents', 'Workflows', 'Integrations', 'Analytics',
    'Search', 'Data', 'Transform', 'Notifications',
    'Files', 'AI', 'Documents'
  ]

  const getEndpointsByCategory = (category: string) =>
    apiEndpoints.filter(endpoint => endpoint.category === category)

  const testEndpoint = async (endpoint: APIEndpoint) => {
    setIsLoading(true)
    const startTime = Date.now()

    try {
      let url = endpoint.path.replace('{userId}', userId)
      let options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      // Handle different request types
      if (endpoint.method === 'POST' && endpoint.requestBody) {
        let requestBody = endpoint.requestBody

        // Replace placeholders
        if (typeof requestBody === 'object') {
          requestBody = JSON.parse(JSON.stringify(requestBody).replace(/{userId}/g, userId))
        }

        // Apply form data if available
        if (formData[endpoint.id]) {
          requestBody = { ...requestBody, ...formData[endpoint.id] }
        }

        options.body = JSON.stringify(requestBody)
      }

      // Handle file uploads
      if (endpoint.id === 'files-upload') {
        // Create a test file
        const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
        const formDataObj = new FormData()
        formDataObj.append('file', testFile)

        options = {
          method: 'POST',
          body: formDataObj
        }
        delete options.headers
      }

      const response = await fetch(url, options)
      const responseTime = Date.now() - startTime

      let responseData
      try {
        responseData = await response.json()
      } catch {
        responseData = { message: 'Response received', status: response.status }
      }

      const result: TestResult = {
        endpoint: endpoint.name,
        method: endpoint.method,
        status: response.ok ? 'success' : 'error',
        responseTime,
        response: responseData,
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results

    } catch (error) {
      const result: TestResult = {
        endpoint: endpoint.name,
        method: endpoint.method,
        status: 'error',
        responseTime: Date.now() - startTime,
        response: { error: error instanceof Error ? error.message : 'Request failed' },
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => [result, ...prev.slice(0, 9)])
    }

    setIsLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Agents': return <Bot className="h-5 w-5" />
      case 'Workflows': return <GitBranch className="h-5 w-5" />
      case 'Integrations': return <Network className="h-5 w-5" />
      case 'Analytics': return <BarChart3 className="h-5 w-5" />
      case 'Search': return <Search className="h-5 w-5" />
      case 'Data': return <Database className="h-5 w-5" />
      case 'Transform': return <Zap className="h-5 w-5" />
      case 'Notifications': return <Bell className="h-5 w-5" />
      case 'Files': return <Upload className="h-5 w-5" />
      case 'AI': return <Bot className="h-5 w-5" />
      case 'Documents': return <FileText className="h-5 w-5" />
      default: return <Settings className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">API Testing Dashboard</h1>
            <p className="text-gray-400 mt-1">Test all API endpoints interactively</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">User ID:</label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-40 bg-black/20 border-white/10"
                placeholder="demo-user-1"
              />
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              Connected
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="test-results">Test Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map(category => (
                <Card key={category} className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category}
                      <Badge variant="secondary" className="ml-auto">
                        {getEndpointsByCategory(category).length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {getEndpointsByCategory(category).map(endpoint => (
                          <div
                            key={endpoint.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => setSelectedEndpoint(endpoint.id)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm text-white">{endpoint.name}</div>
                              <div className="text-xs text-gray-400">{endpoint.method}</div>
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                testEndpoint(endpoint)
                              }}
                              disabled={isLoading}
                              className="ml-2"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Endpoint Details */}
            {selectedEndpoint && (
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    {apiEndpoints.find(e => e.id === selectedEndpoint)?.name}
                  </CardTitle>
                  <CardDescription>
                    {apiEndpoints.find(e => e.id === selectedEndpoint)?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Method</label>
                      <div className="text-white font-mono">
                        {apiEndpoints.find(e => e.id === selectedEndpoint)?.method}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Path</label>
                      <div className="text-white font-mono text-sm break-all">
                        {apiEndpoints.find(e => e.id === selectedEndpoint)?.path}
                      </div>
                    </div>
                  </div>

                  {/* Request Body Editor */}
                  {apiEndpoints.find(e => e.id === selectedEndpoint)?.requestBody && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Request Body</label>
                      <Textarea
                        value={JSON.stringify(
                          apiEndpoints.find(e => e.id === selectedEndpoint)?.requestBody,
                          null,
                          2
                        )}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value)
                            setFormData(prev => ({
                              ...prev,
                              [selectedEndpoint]: parsed
                            }))
                          } catch {
                            // Invalid JSON, ignore
                          }
                        }}
                        className="bg-black/20 border-white/10 font-mono text-sm"
                        rows={8}
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      const endpoint = apiEndpoints.find(e => e.id === selectedEndpoint)
                      if (endpoint) testEndpoint(endpoint)
                    }}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Testing...' : 'Test Endpoint'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="test-results" className="space-y-6">
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index} className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        {result.endpoint}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.method}
                        </Badge>
                        <Badge variant="outline">
                          {result.responseTime}ms
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                      <pre className="bg-black/40 p-3 rounded text-sm overflow-x-auto max-h-48">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Total Endpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{apiEndpoints.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Tests Run</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{testResults.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {testResults.length > 0
                      ? Math.round((testResults.filter(r => r.status === 'success').length / testResults.length) * 100)
                      : 0
                    }%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {testResults.length > 0
                      ? Math.round(testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length)
                      : 0
                    }ms
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Endpoint Status Overview */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Endpoint Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map(category => {
                    const categoryEndpoints = getEndpointsByCategory(category)
                    const categoryResults = testResults.filter(r =>
                      categoryEndpoints.some(e => e.name === r.endpoint)
                    )

                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span className="text-white">{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {categoryResults.filter(r => r.status === 'success').length}/{categoryEndpoints.length}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
