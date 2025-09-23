/**
 * 🚀 MCP EXTENSION MANAGER
 * UI component for managing and configuring MCP extensions
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Switch } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { 
  Play, 
  Square, 
  Settings, 
  Code, 
  Shield, 
  Wrench, 
  BarChart3, 
  Clock, 
  HardDrive,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface MCPExtension {
  id: string
  name: string
  version: string
  description: string
  category: string
  capabilities: string[]
  toolCount: number
  status: {
    initialized: boolean
    toolCount: number
    capabilities: string[]
    config: any
  }
}

interface MCPTool {
  extensionId: string
  extensionName: string
  tool: {
    name: string
    description: string
    inputSchema: any
    outputSchema: any
  }
}

interface ExecutionResult {
  success: boolean
  data?: any
  error?: string
  executionTime: number
  memoryUsage: number
  toolName: string
  timestamp: string
}

export function MCPExtensionManager() {
  const [extensions, setExtensions] = useState<MCPExtension[]>([])
  const [tools, setTools] = useState<MCPTool[]>([])
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [toolParams, setToolParams] = useState<string>('{}')
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load extensions and tools
  useEffect(() => {
    loadExtensions()
  }, [])

  const loadExtensions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/mcp-extensions')
      const data = await response.json()

      if (data.success) {
        setExtensions(data.data.extensions)
        setTools(data.data.tools)
      } else {
        setError(data.error || 'Failed to load extensions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const executeTool = async () => {
    if (!selectedExtension || !selectedTool) {
      setError('Please select an extension and tool')
      return
    }

    try {
      setIsExecuting(true)
      setError(null)
      setExecutionResult(null)

      let params
      try {
        params = JSON.parse(toolParams)
      } catch (err) {
        setError('Invalid JSON in parameters')
        return
      }

      const response = await fetch('/api/mcp-extensions/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extensionId: selectedExtension,
          toolName: selectedTool,
          params,
          context: {
            userId: 'demo-user',
            sessionId: 'demo-session',
            requestId: `req_${Date.now()}`,
            permissions: ['fileSystem', 'development'],
            environment: 'development',
            metadata: {}
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setExecutionResult(data.data)
      } else {
        setError(data.error || 'Tool execution failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsExecuting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'algorithm':
        return <Code className="h-4 w-4" />
      case 'security':
        return <Shield className="h-4 w-4" />
      case 'utility':
        return <Wrench className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getStatusIcon = (initialized: boolean) => {
    return initialized ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MCP extensions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MCP Extensions</h1>
          <p className="text-gray-600">Manage and execute native MCP extensions for Gemini CLI</p>
        </div>
        <Button onClick={loadExtensions} variant="outline">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="extensions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="extensions">Extensions</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="execute">Execute</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="extensions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {extensions.map((extension) => (
              <Card key={extension.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(extension.category)}
                      <CardTitle className="text-lg">{extension.name}</CardTitle>
                    </div>
                    {getStatusIcon(extension.status.initialized)}
                  </div>
                  <CardDescription>{extension.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Version:</span>
                      <Badge variant="secondary">{extension.version}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tools:</span>
                      <Badge variant="outline">{extension.toolCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <Badge variant="outline">{extension.category}</Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-gray-600">Capabilities:</span>
                      <div className="flex flex-wrap gap-1">
                        {extension.capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tools.map((toolInfo) => (
              <Card key={`${toolInfo.extensionId}-${toolInfo.tool.name}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{toolInfo.tool.name}</CardTitle>
                    <Badge variant="outline">{toolInfo.extensionName}</Badge>
                  </div>
                  <CardDescription>{toolInfo.tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Input Schema:</Label>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(toolInfo.tool.inputSchema, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Output Schema:</Label>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(toolInfo.tool.outputSchema, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="execute" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tool Execution</CardTitle>
                <CardDescription>Execute tools from MCP extensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="extension-select">Extension</Label>
                  <Select value={selectedExtension || ''} onValueChange={setSelectedExtension}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an extension" />
                    </SelectTrigger>
                    <SelectContent>
                      {extensions.map((extension) => (
                        <SelectItem key={extension.id} value={extension.id}>
                          {extension.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tool-select">Tool</Label>
                  <Select value={selectedTool || ''} onValueChange={setSelectedTool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tool" />
                    </SelectTrigger>
                    <SelectContent>
                      {tools
                        .filter(tool => tool.extensionId === selectedExtension)
                        .map((toolInfo) => (
                          <SelectItem key={toolInfo.tool.name} value={toolInfo.tool.name}>
                            {toolInfo.tool.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="params">Parameters (JSON)</Label>
                  <Textarea
                    id="params"
                    value={toolParams}
                    onChange={(e) => setToolParams(e.target.value)}
                    placeholder='{"param1": "value1", "param2": "value2"}'
                    rows={6}
                  />
                </div>

                <Button 
                  onClick={executeTool} 
                  disabled={isExecuting || !selectedExtension || !selectedTool}
                  className="w-full"
                >
                  {isExecuting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Tool
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Execution Result</CardTitle>
                <CardDescription>Results from tool execution</CardDescription>
              </CardHeader>
              <CardContent>
                {executionResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {executionResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {executionResult.success ? 'Success' : 'Failed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{executionResult.executionTime}ms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-gray-500" />
                        <span>{executionResult.memoryUsage} bytes</span>
                      </div>
                    </div>

                    {executionResult.error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{executionResult.error}</AlertDescription>
                      </Alert>
                    )}

                    {executionResult.data && (
                      <div>
                        <Label className="text-sm font-medium">Result Data:</Label>
                        <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-x-auto max-h-64">
                          {JSON.stringify(executionResult.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Execute a tool to see results here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extension Metrics</CardTitle>
              <CardDescription>Performance and usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{extensions.length}</div>
                  <div className="text-sm text-gray-600">Extensions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {extensions.filter(ext => ext.status.initialized).length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Wrench className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{tools.length}</div>
                  <div className="text-sm text-gray-600">Tools</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Settings className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {extensions.reduce((sum, ext) => sum + ext.capabilities.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Capabilities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
