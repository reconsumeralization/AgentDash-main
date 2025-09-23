"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Label } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Separator } from "@/components/ui"
import { 
  X, Plus, Play, Pause, Save, Download, Upload, Copy, Trash2, 
  Edit, Settings, Eye, Code, FileText, Globe, Zap, Sparkles,
  ArrowRight, ArrowDown, ArrowUp, ArrowLeft, Target, Lightbulb,
  Star, Heart, TrendingUp, BarChart3, PieChart, Activity,
  MessageSquare, Clock, CheckCircle, AlertCircle, Layers,
  Network, Workflow, Palette, Monitor, Smartphone, Tablet,
  Shield, Lock, Unlock, RefreshCw, RotateCcw, Search,
  Filter, Database, Image, Video, Music, Archive,
  BookOpen, PenTool, Brush, Scissors, Crop, Move, Copy as CopyIcon,
  Maximize, Minimize, RotateCw, RotateCcw as RotateCcwIcon,
  ZoomIn, ZoomOut, Focus, EyeOff, Eye as EyeIcon, Brain,
  GitBranch, Terminal, Server, Cpu, MemoryStick, HardDrive,
  Wifi, WifiOff, Database as DatabaseIcon, Key, User, Users,
  Calendar, Timer, Hourglass, CheckCircle2, XCircle,
  AlertTriangle, Info, HelpCircle, ExternalLink, Link, Unlink
} from "lucide-react"

interface APIDocsGeneratorProps {
  isOpen: boolean
  onClose: () => void
}

interface APIEndpoint {
  id: string
  name: string
  path: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD"
  description: string
  summary: string
  tags: string[]
  parameters: APIParameter[]
  requestBody?: APIRequestBody
  responses: APIResponse[]
  examples: APIExample[]
  authentication: APIAuthentication
  rateLimit?: APIRateLimit
  version: string
  deprecated: boolean
  status: "draft" | "review" | "published" | "deprecated"
  createdAt: Date
  updatedAt: Date
}

interface APIParameter {
  name: string
  in: "query" | "path" | "header" | "cookie"
  description: string
  required: boolean
  type: "string" | "number" | "boolean" | "array" | "object"
  format?: string
  example?: any
  enum?: any[]
  default?: any
  min?: number
  max?: number
  pattern?: string
}

interface APIRequestBody {
  description: string
  required: boolean
  content: {
    [mediaType: string]: {
      schema: any
      example?: any
    }
  }
}

interface APIResponse {
  status: number
  description: string
  headers?: { [key: string]: any }
  content?: {
    [mediaType: string]: {
      schema: any
      example?: any
    }
  }
}

interface APIExample {
  name: string
  description: string
  request: {
    headers?: { [key: string]: string }
    body?: any
    query?: { [key: string]: string }
  }
  response: {
    status: number
    headers?: { [key: string]: string }
    body?: any
  }
}

interface APIAuthentication {
  type: "none" | "apiKey" | "bearer" | "basic" | "oauth2"
  name?: string
  in?: "header" | "query" | "cookie"
  scheme?: string
  bearerFormat?: string
  flows?: any
}

interface APIRateLimit {
  requests: number
  window: string
  burst?: number
}

interface APIDocumentation {
  id: string
  title: string
  description: string
  version: string
  baseUrl: string
  endpoints: APIEndpoint[]
  models: APIModel[]
  authentication: APIAuthentication
  rateLimits: APIRateLimit[]
  changelog: APIChangelog[]
  examples: APIExample[]
  status: "draft" | "review" | "published"
  createdAt: Date
  updatedAt: Date
}

interface APIModel {
  id: string
  name: string
  description: string
  properties: { [key: string]: any }
  required: string[]
  example?: any
}

interface APIChangelog {
  version: string
  date: Date
  changes: string[]
  breaking: boolean
}

const httpMethods = [
  { value: "GET", label: "GET", color: "bg-green-500", description: "Retrieve data" },
  { value: "POST", label: "POST", color: "bg-blue-500", description: "Create data" },
  { value: "PUT", label: "PUT", color: "bg-orange-500", description: "Update data" },
  { value: "DELETE", label: "DELETE", color: "bg-red-500", description: "Delete data" },
  { value: "PATCH", label: "PATCH", color: "bg-purple-500", description: "Partial update" },
  { value: "OPTIONS", label: "OPTIONS", color: "bg-gray-500", description: "Get options" },
  { value: "HEAD", label: "HEAD", color: "bg-gray-500", description: "Get headers" }
]

const authTypes = [
  { value: "none", label: "No Authentication", iconName: "Unlock" },
  { value: "apiKey", label: "API Key", iconName: "Key" },
  { value: "bearer", label: "Bearer Token", iconName: "Shield" },
  { value: "basic", label: "Basic Auth", iconName: "User" },
  { value: "oauth2", label: "OAuth 2.0", iconName: "Lock" }
]

// Function to get auth icon component by name
const getAuthIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Unlock": return Unlock;
    case "Key": return Key;
    case "Shield": return Shield;
    case "User": return User;
    case "Lock": return Lock;
    default: return Shield;
  }
}

const parameterTypes = [
  { value: "query", label: "Query Parameter", description: "URL query parameter" },
  { value: "path", label: "Path Parameter", description: "URL path parameter" },
  { value: "header", label: "Header", description: "HTTP header" },
  { value: "cookie", label: "Cookie", description: "HTTP cookie" }
]

const dataTypes = [
  { value: "string", label: "String", description: "Text data" },
  { value: "number", label: "Number", description: "Numeric data" },
  { value: "boolean", label: "Boolean", description: "True/false value" },
  { value: "array", label: "Array", description: "List of values" },
  { value: "object", label: "Object", description: "Key-value pairs" }
]

export function EnhancedAPIDocsGenerator({ isOpen, onClose }: APIDocsGeneratorProps) {
  const [documentations, setDocumentations] = useState<APIDocumentation[]>([])
  const [currentDoc, setCurrentDoc] = useState<APIDocumentation | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [previewMode, setPreviewMode] = useState<"swagger" | "redoc" | "postman">("swagger")
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  // Initialize with sample documentation
  useEffect(() => {
    const sampleDoc: APIDocumentation = {
      id: "api-doc-1",
      title: "AgentDash API",
      description: "Comprehensive API for AgentDash multi-agent orchestration platform",
      version: "1.0.0",
      baseUrl: "https://api.agentdash.com",
      endpoints: [
        {
          id: "endpoint-1",
          name: "Get Agents",
          path: "/api/v1/agents",
          method: "GET",
          description: "Retrieve a list of all available agents",
          summary: "List agents",
          tags: ["Agents"],
          parameters: [
            {
              name: "limit",
              in: "query",
              description: "Maximum number of agents to return",
              required: false,
              type: "number",
              default: 10,
              min: 1,
              max: 100
            },
            {
              name: "type",
              in: "query",
              description: "Filter by agent type",
              required: false,
              type: "string",
              enum: ["context", "expert", "research", "prompt"]
            }
          ],
          responses: [
            {
              status: 200,
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      agents: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Agent"
                        }
                      },
                      total: { type: "number" },
                      page: { type: "number" },
                      limit: { type: "number" }
                    }
                  },
                  example: {
                    agents: [
                      {
                        id: "agent-1",
                        name: "Context Analyzer",
                        type: "context",
                        status: "active",
                        capabilities: ["NLP", "Analysis"]
                      }
                    ],
                    total: 1,
                    page: 1,
                    limit: 10
                  }
                }
              }
            },
            {
              status: 401,
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string" },
                      message: { type: "string" }
                    }
                  }
                }
              }
            }
          ],
          examples: [
            {
              name: "Basic Request",
              description: "Get first 10 agents",
              request: {
                headers: {
                  "Authorization": "Bearer your-token-here"
                }
              },
              response: {
                status: 200,
                headers: {
                  "Content-Type": "application/json"
                },
                body: {
                  agents: [],
                  total: 0,
                  page: 1,
                  limit: 10
                }
              }
            }
          ],
          authentication: {
            type: "bearer",
            scheme: "bearer",
            bearerFormat: "JWT"
          },
          rateLimit: {
            requests: 100,
            window: "1m"
          },
          version: "1.0.0",
          deprecated: false,
          status: "published",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "endpoint-2",
          name: "Create Agent",
          path: "/api/v1/agents",
          method: "POST",
          description: "Create a new AI agent with specified configuration",
          summary: "Create agent",
          tags: ["Agents"],
          parameters: [],
          requestBody: {
            description: "Agent configuration",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    description: { type: "string" },
                    capabilities: { type: "array", items: { type: "string" } },
                    model: { type: "string" },
                    configuration: { type: "object" }
                  },
                  required: ["name", "type", "description"]
                },
                example: {
                  name: "Custom Agent",
                  type: "expert",
                  description: "Specialized agent for custom tasks",
                  capabilities: ["analysis", "reasoning"],
                  model: "gpt-4",
                  configuration: {
                    temperature: 0.7,
                    maxTokens: 4000
                  }
                }
              }
            }
          },
          responses: [
            {
              status: 201,
              description: "Agent created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Agent"
                  }
                }
              }
            },
            {
              status: 400,
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string" },
                      details: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          ],
          examples: [],
          authentication: {
            type: "bearer",
            scheme: "bearer",
            bearerFormat: "JWT"
          },
          rateLimit: {
            requests: 50,
            window: "1m"
          },
          version: "1.0.0",
          deprecated: false,
          status: "published",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      models: [
        {
          id: "model-1",
          name: "Agent",
          description: "AI agent representation",
          properties: {
            id: { type: "string", description: "Unique agent identifier" },
            name: { type: "string", description: "Agent name" },
            type: { type: "string", description: "Agent type" },
            status: { type: "string", enum: ["active", "inactive", "training"] },
            capabilities: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          },
          required: ["id", "name", "type", "status"],
          example: {
            id: "agent-1",
            name: "Context Analyzer",
            type: "context",
            status: "active",
            capabilities: ["NLP", "Analysis"],
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          }
        }
      ],
      authentication: {
        type: "bearer",
        scheme: "bearer",
        bearerFormat: "JWT"
      },
      rateLimits: [
        {
          requests: 1000,
          window: "1h"
        }
      ],
      changelog: [
        {
          version: "1.0.0",
          date: new Date(),
          changes: ["Initial API release", "Agent management endpoints"],
          breaking: false
        }
      ],
      examples: [],
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setDocumentations([sampleDoc])
    setCurrentDoc(sampleDoc)
  }, [])

  // Generate documentation
  const generateDocumentation = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    const generationSteps = [
      { progress: 20, message: "Analyzing API structure..." },
      { progress: 40, message: "Generating OpenAPI specification..." },
      { progress: 60, message: "Creating interactive documentation..." },
      { progress: 80, message: "Validating API endpoints..." },
      { progress: 100, message: "Documentation generated successfully!" }
    ]

    for (const step of generationSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setGenerationProgress(step.progress)
    }

    setIsGenerating(false)
    setGenerationProgress(0)
  }

  // Test endpoint
  const testEndpoint = async (endpoint: APIEndpoint) => {
    setIsTesting(true)
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResult = {
      endpoint: endpoint.name,
      method: endpoint.method,
      url: `${currentDoc?.baseUrl}${endpoint.path}`,
      status: "success",
      responseTime: Math.random() * 1000 + 100,
      statusCode: 200,
      response: {
        success: true,
        data: "Mock response data"
      }
    }

    setTestResults(prev => [...prev, mockResult])
    setIsTesting(false)
  }

  // Export documentation
  const exportDocumentation = (format: "openapi" | "postman" | "insomnia") => {
    // Implementation for exporting documentation
    console.log(`Exporting documentation as ${format}`)
  }

  const getMethodColor = (method: string) => {
    const methodInfo = httpMethods.find(m => m.value === method)
    return methodInfo ? methodInfo.color : "bg-gray-500"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800 border-green-200"
      case "review": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200"
      case "deprecated": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Main Panel */}
      <div className="relative w-full max-w-7xl mx-auto my-4 bg-card border border-border rounded-lg shadow-2xl">
        <div className="h-[calc(100vh-2rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Enhanced API Documentation Generator</h2>
                <p className="text-muted-foreground">Intelligent API documentation with testing and validation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={generateDocumentation} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Activity className="h-4 w-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1" />
                    Generate
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="p-4 border-b border-border bg-green-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-sm text-green-600 mt-1">
                    Generating API documentation... {generationProgress}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-80 border-r border-border flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="p-4 border-b border-border">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                    <TabsTrigger value="models">Models</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {/* API Information */}
                      {currentDoc && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">{currentDoc.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">{currentDoc.description}</p>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Version:</span>
                              <span className="font-medium">{currentDoc.version}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Base URL:</span>
                              <span className="font-medium font-mono text-xs">{currentDoc.baseUrl}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Status:</span>
                              <Badge className={`text-xs ${getStatusColor(currentDoc.status)}`}>
                                {currentDoc.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Endpoints:</span>
                              <span className="font-medium">{currentDoc.endpoints.length}</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Authentication */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Authentication</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            {currentDoc?.authentication.type === "bearer" && <Shield className="h-4 w-4 text-blue-500" />}
                            {currentDoc?.authentication.type === "apiKey" && <Key className="h-4 w-4 text-green-500" />}
                            {currentDoc?.authentication.type === "basic" && <User className="h-4 w-4 text-orange-500" />}
                            <span className="text-sm font-medium">
                              {authTypes.find(a => a.value === currentDoc?.authentication.type)?.label}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Rate Limits */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Rate Limits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {currentDoc?.rateLimits.map((limit, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Limit:</span>
                              <span className="font-medium">{limit.requests} requests</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Quick Actions */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button size="sm" variant="outline" className="w-full justify-start">
                            <Plus className="h-3 w-3 mr-2" />
                            Add Endpoint
                          </Button>
                          <Button size="sm" variant="outline" className="w-full justify-start">
                            <Code className="h-3 w-3 mr-2" />
                            Generate SDK
                          </Button>
                          <Button size="sm" variant="outline" className="w-full justify-start">
                            <Globe className="h-3 w-3 mr-2" />
                            Publish Docs
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="endpoints" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {currentDoc?.endpoints.map((endpoint) => (
                        <Card 
                          key={endpoint.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedEndpoint?.id === endpoint.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedEndpoint(endpoint)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`text-xs text-white ${getMethodColor(endpoint.method)}`}>
                                {endpoint.method}
                              </Badge>
                              <span className="text-sm font-medium truncate">{endpoint.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{endpoint.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono">{endpoint.path}</span>
                              <Badge className={`text-xs ${getStatusColor(endpoint.status)}`}>
                                {endpoint.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="models" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {currentDoc?.models.map((model) => (
                        <Card key={model.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{model.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{model.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {model.required.map((prop) => (
                                <Badge key={prop} variant="outline" className="text-xs">
                                  {prop}*
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">
                      {selectedEndpoint ? selectedEndpoint.name : "API Documentation"}
                    </h3>
                    {selectedEndpoint && (
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs text-white ${getMethodColor(selectedEndpoint.method)}`}>
                          {selectedEndpoint.method}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(selectedEndpoint.status)}`}>
                          {selectedEndpoint.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={previewMode} onValueChange={(value: any) => setPreviewMode(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="swagger">Swagger UI</SelectItem>
                        <SelectItem value="redoc">ReDoc</SelectItem>
                        <SelectItem value="postman">Postman</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedEndpoint && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => testEndpoint(selectedEndpoint)}
                        disabled={isTesting}
                      >
                        {isTesting ? (
                          <Activity className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  {selectedEndpoint ? (
                    <div className="space-y-6">
                      {/* Endpoint Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            {selectedEndpoint.name}
                          </CardTitle>
                          <p className="text-muted-foreground">{selectedEndpoint.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Method</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-xs text-white ${getMethodColor(selectedEndpoint.method)}`}>
                                  {selectedEndpoint.method}
                                </Badge>
                                <span className="text-sm font-mono">{selectedEndpoint.path}</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Version</Label>
                              <p className="text-sm">{selectedEndpoint.version}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Parameters */}
                      {selectedEndpoint.parameters.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Parameters</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedEndpoint.parameters.map((param, index) => (
                                <div key={index} className="border border-border rounded p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {param.in}
                                    </Badge>
                                    <span className="font-medium">{param.name}</span>
                                    {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{param.description}</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-muted-foreground">Type:</span>
                                      <span className="ml-1 font-medium">{param.type}</span>
                                    </div>
                                    {param.default && (
                                      <div>
                                        <span className="text-muted-foreground">Default:</span>
                                        <span className="ml-1 font-medium">{param.default}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Request Body */}
                      {selectedEndpoint.requestBody && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Request Body</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <p className="text-sm text-muted-foreground">{selectedEndpoint.requestBody.description}</p>
                              <div className="bg-muted p-3 rounded">
                                <pre className="text-xs overflow-x-auto">
                                  {JSON.stringify(selectedEndpoint.requestBody.content["application/json"]?.example, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Responses */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Responses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedEndpoint.responses.map((response, index) => (
                              <div key={index} className="border border-border rounded p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge 
                                    variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}
                                    className="text-xs"
                                  >
                                    {response.status}
                                  </Badge>
                                  <span className="text-sm font-medium">{response.description}</span>
                                </div>
                                {response.content && (
                                  <div className="bg-muted p-3 rounded mt-2">
                                    <pre className="text-xs overflow-x-auto">
                                      {JSON.stringify(response.content["application/json"]?.example, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Examples */}
                      {selectedEndpoint.examples.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Examples</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedEndpoint.examples.map((example, index) => (
                                <div key={index} className="border border-border rounded p-3">
                                  <h4 className="font-medium mb-2">{example.name}</h4>
                                  <p className="text-sm text-muted-foreground mb-3">{example.description}</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs font-medium">Request</Label>
                                      <div className="bg-muted p-2 rounded mt-1">
                                        <pre className="text-xs overflow-x-auto">
                                          {JSON.stringify(example.request, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium">Response</Label>
                                      <div className="bg-muted p-2 rounded mt-1">
                                        <pre className="text-xs overflow-x-auto">
                                          {JSON.stringify(example.response, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select an Endpoint</h3>
                      <p className="text-muted-foreground">
                        Choose an endpoint from the sidebar to view its documentation
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
