"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui"
import {
  FileText,
  Code,
  Download,
  Copy,
  Eye,
  Settings,
  Zap,
  Globe,
  CheckCircle,
  AlertCircle,
  Terminal,
  Webhook,
  Key,
  Shield,
} from "lucide-react"

interface APIEndpoint {
  id: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  description: string
  parameters: Parameter[]
  requestBody?: RequestBody
  responses: Response[]
  authentication: "none" | "api-key" | "bearer" | "oauth"
  rateLimit?: string
  category: string
}

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
  example?: string
  enum?: string[]
}

interface RequestBody {
  contentType: string
  schema: any
  example: any
}

interface Response {
  status: number
  description: string
  schema?: any
  example?: any
}

interface WorkflowAPI {
  id: string
  name: string
  version: string
  description: string
  baseUrl: string
  endpoints: APIEndpoint[]
  authentication: {
    type: string
    description: string
    example?: string
  }
  rateLimit: {
    requests: number
    window: string
  }
  sdks: string[]
}

const sampleWorkflowAPIs: WorkflowAPI[] = [
  {
    id: "fantasy-sports-api",
    name: "Fantasy Sports Optimizer API",
    version: "1.0.0",
    description: "API for optimizing fantasy sports lineups with advanced analytics",
    baseUrl: "https://api.fantasy-optimizer.ai/v1",
    authentication: {
      type: "API Key",
      description: "Include your API key in the Authorization header",
      example: "Authorization: Bearer your-api-key-here",
    },
    rateLimit: {
      requests: 1000,
      window: "1 hour",
    },
    sdks: ["JavaScript", "Python", "cURL"],
    endpoints: [
      {
        id: "optimize-lineup",
        method: "POST",
        path: "/optimize/lineup",
        description: "Generate optimal fantasy lineup based on constraints and preferences",
        category: "Optimization",
        authentication: "api-key",
        rateLimit: "100 requests/hour",
        parameters: [
          {
            name: "sport",
            type: "string",
            required: true,
            description: "Sport type (nfl, nba, mlb, nhl)",
            enum: ["nfl", "nba", "mlb", "nhl"],
          },
          {
            name: "slate",
            type: "string",
            required: true,
            description: "Contest slate identifier",
            example: "main-slate-2024-01-15",
          },
        ],
        requestBody: {
          contentType: "application/json",
          schema: {
            type: "object",
            properties: {
              budget: { type: "number", description: "Salary cap budget" },
              preferences: {
                type: "object",
                properties: {
                  riskLevel: { type: "string", enum: ["conservative", "balanced", "aggressive"] },
                  stackTeams: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
          example: {
            budget: 50000,
            preferences: {
              riskLevel: "balanced",
              stackTeams: ["KC", "BUF"],
            },
          },
        },
        responses: [
          {
            status: 200,
            description: "Optimized lineup generated successfully",
            schema: {
              type: "object",
              properties: {
                lineup: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      player: { type: "string" },
                      position: { type: "string" },
                      salary: { type: "number" },
                      projection: { type: "number" },
                    },
                  },
                },
                totalSalary: { type: "number" },
                projectedPoints: { type: "number" },
                confidence: { type: "number" },
              },
            },
            example: {
              lineup: [
                {
                  player: "Josh Allen",
                  position: "QB",
                  salary: 8500,
                  projection: 24.5,
                },
              ],
              totalSalary: 49800,
              projectedPoints: 142.3,
              confidence: 0.87,
            },
          },
          {
            status: 400,
            description: "Invalid request parameters",
            example: {
              error: "Invalid sport type",
              message: "Sport must be one of: nfl, nba, mlb, nhl",
            },
          },
        ],
      },
    ],
  },
]

export function APIDocumentationGenerator() {
  const [selectedAPI, setSelectedAPI] = useState<WorkflowAPI>(sampleWorkflowAPIs[0])
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>(sampleWorkflowAPIs[0].endpoints[0])
  const [activeTab, setActiveTab] = useState("overview")
  const [generatingDocs, setGeneratingDocs] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [customization, setCustomization] = useState({
    theme: "dark",
    includeExamples: true,
    includeSDKs: true,
    includeRateLimit: true,
  })

  const generateDocumentation = useCallback(async () => {
    setGeneratingDocs(true)
    // Simulate documentation generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGeneratingDocs(false)
    setShowPreview(true)
  }, [])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
  }, [])

  const getMethodColor = (method: string) => {
    const colors = {
      GET: "bg-green-500/20 text-green-200",
      POST: "bg-blue-500/20 text-blue-200",
      PUT: "bg-yellow-500/20 text-yellow-200",
      DELETE: "bg-red-500/20 text-red-200",
      PATCH: "bg-purple-500/20 text-purple-200",
    }
    return colors[method as keyof typeof colors] || "bg-gray-500/20 text-gray-200"
  }

  const generateCurlExample = (endpoint: APIEndpoint) => {
    let curl = `curl -X ${endpoint.method} "${selectedAPI.baseUrl}${endpoint.path}"`

    if (endpoint.authentication !== "none") {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY"`
    }

    curl += ` \\\n  -H "Content-Type: application/json"`

    if (endpoint.requestBody) {
      curl += ` \\\n  -d '${JSON.stringify(endpoint.requestBody.example, null, 2)}'`
    }

    return curl
  }

  const generateJavaScriptExample = (endpoint: APIEndpoint) => {
    return `const response = await fetch('${selectedAPI.baseUrl}${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },${endpoint.requestBody ? `\n  body: JSON.stringify(${JSON.stringify(endpoint.requestBody.example, null, 2)}),` : ""}
});

const data = await response.json();
console.log(data);`
  }

  const generatePythonExample = (endpoint: APIEndpoint) => {
    return `import requests

url = "${selectedAPI.baseUrl}${endpoint.path}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}${endpoint.requestBody ? `\ndata = ${JSON.stringify(endpoint.requestBody.example, null, 2).replace(/"/g, "'")}` : ""}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers${endpoint.requestBody ? ", json=data" : ""})
print(response.json())`
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            API Documentation Generator
          </h2>
          <p className="text-gray-400">Generate comprehensive API documentation for your workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/5 bg-transparent"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Documentation Settings</DialogTitle>
                <DialogDescription className="text-gray-400">Customize your API documentation output</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Theme</label>
                  <Select
                    value={customization.theme}
                    onValueChange={(value) => setCustomization((prev) => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10">
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Add more customization options */}
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={generateDocumentation}
            disabled={generatingDocs}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {generatingDocs ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Docs
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - API Selection */}
        <div className="lg:col-span-1">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">APIs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64">
                {sampleWorkflowAPIs.map((api) => (
                  <div
                    key={api.id}
                    onClick={() => setSelectedAPI(api)}
                    className={`p-3 cursor-pointer border-b border-white/10 hover:bg-white/5 ${
                      selectedAPI.id === api.id ? "bg-blue-500/20" : ""
                    }`}
                  >
                    <div className="text-white font-medium text-sm">{api.name}</div>
                    <div className="text-xs text-gray-400">v{api.version}</div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 mt-4">
            <CardHeader>
              <CardTitle className="text-white text-sm">Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-48">
                {selectedAPI.endpoints.map((endpoint) => (
                  <div
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`p-3 cursor-pointer border-b border-white/10 hover:bg-white/5 ${
                      selectedEndpoint.id === endpoint.id ? "bg-green-500/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${getMethodColor(endpoint.method)}`}>{endpoint.method}</Badge>
                    </div>
                    <div className="text-white text-sm font-mono">{endpoint.path}</div>
                    <div className="text-xs text-gray-400 mt-1">{endpoint.description}</div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Documentation Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-sm">
              <TabsTrigger value="overview" className="text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="endpoints" className="text-white">
                Endpoints
              </TabsTrigger>
              <TabsTrigger value="authentication" className="text-white">
                Auth
              </TabsTrigger>
              <TabsTrigger value="examples" className="text-white">
                Examples
              </TabsTrigger>
              <TabsTrigger value="sdks" className="text-white">
                SDKs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      {selectedAPI.name}
                    </CardTitle>
                    <Badge className="bg-blue-500/20 text-blue-200">v{selectedAPI.version}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">{selectedAPI.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-lg font-bold text-white">{selectedAPI.endpoints.length}</div>
                      <div className="text-sm text-gray-400">Endpoints</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-lg font-bold text-green-400">{selectedAPI.rateLimit.requests}</div>
                      <div className="text-sm text-gray-400">Requests/{selectedAPI.rateLimit.window}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-lg font-bold text-purple-400">{selectedAPI.sdks.length}</div>
                      <div className="text-sm text-gray-400">SDK Languages</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Base URL</h4>
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <code className="text-blue-300 font-mono text-sm flex-1">{selectedAPI.baseUrl}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(selectedAPI.baseUrl)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-4">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-green-400" />
                    {selectedEndpoint.method} {selectedEndpoint.path}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-300">{selectedEndpoint.description}</p>

                  {/* Parameters */}
                  {selectedEndpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Parameters</h4>
                      <div className="space-y-2">
                        {selectedEndpoint.parameters.map((param, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-blue-300 font-mono text-sm">{param.name}</code>
                              <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 text-xs">
                                {param.type}
                              </Badge>
                              {param.required && <Badge className="bg-red-500/20 text-red-200 text-xs">required</Badge>}
                            </div>
                            <p className="text-sm text-gray-400">{param.description}</p>
                            {param.example && (
                              <div className="mt-2">
                                <code className="text-green-300 text-xs">Example: {param.example}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body */}
                  {selectedEndpoint.requestBody && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Request Body</h4>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-500/20 text-blue-200 text-xs">
                            {selectedEndpoint.requestBody.contentType}
                          </Badge>
                        </div>
                        <pre className="text-sm text-green-300 overflow-x-auto">
                          {JSON.stringify(selectedEndpoint.requestBody.example, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Responses */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Responses</h4>
                    <div className="space-y-3">
                      {selectedEndpoint.responses.map((response, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`text-xs ${
                                response.status < 300
                                  ? "bg-green-500/20 text-green-200"
                                  : response.status < 400
                                    ? "bg-yellow-500/20 text-yellow-200"
                                    : "bg-red-500/20 text-red-200"
                              }`}
                            >
                              {response.status}
                            </Badge>
                            <span className="text-white text-sm">{response.description}</span>
                          </div>
                          {response.example && (
                            <pre className="text-sm text-blue-300 overflow-x-auto">
                              {JSON.stringify(response.example, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{selectedAPI.authentication.type}</span>
                  </div>
                  <p className="text-gray-300">{selectedAPI.authentication.description}</p>

                  {selectedAPI.authentication.example && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Example</h4>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <code className="text-green-300 text-sm">{selectedAPI.authentication.example}</code>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-yellow-200 font-medium">Rate Limiting</div>
                      <div className="text-yellow-300 text-sm">
                        {selectedAPI.rateLimit.requests} requests per {selectedAPI.rateLimit.window}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-400" />
                    Code Examples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="curl" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 bg-white/5">
                      <TabsTrigger value="curl" className="text-white">
                        cURL
                      </TabsTrigger>
                      <TabsTrigger value="javascript" className="text-white">
                        JavaScript
                      </TabsTrigger>
                      <TabsTrigger value="python" className="text-white">
                        Python
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="curl">
                      <div className="relative">
                        <pre className="p-4 bg-black/40 rounded-lg border border-white/10 text-sm text-green-300 overflow-x-auto">
                          {generateCurlExample(selectedEndpoint)}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(generateCurlExample(selectedEndpoint))}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="javascript">
                      <div className="relative">
                        <pre className="p-4 bg-black/40 rounded-lg border border-white/10 text-sm text-blue-300 overflow-x-auto">
                          {generateJavaScriptExample(selectedEndpoint)}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(generateJavaScriptExample(selectedEndpoint))}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="python">
                      <div className="relative">
                        <pre className="p-4 bg-black/40 rounded-lg border border-white/10 text-sm text-yellow-300 overflow-x-auto">
                          {generatePythonExample(selectedEndpoint)}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(generatePythonExample(selectedEndpoint))}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sdks" className="space-y-4">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-400" />
                    SDK Libraries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedAPI.sdks.map((sdk, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                        <div className="text-white font-medium mb-2">{sdk}</div>
                        <Button size="sm" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200">
                          <Download className="w-4 h-4 mr-1" />
                          Install
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-200 font-medium">Coming Soon</span>
                    </div>
                    <p className="text-blue-300 text-sm">
                      Auto-generated SDKs for Go, Ruby, PHP, and more languages will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl bg-black/90 backdrop-blur-sm border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Documentation Preview
            </DialogTitle>
            <DialogDescription className="text-gray-400">Preview of your generated API documentation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-medium">Documentation Generated Successfully!</div>
                <div className="text-sm text-gray-400">Ready to export or publish</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-white/20 text-gray-300 bg-transparent">
                  <Download className="w-4 h-4 mr-1" />
                  Export HTML
                </Button>
                <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-200">
                  <Globe className="w-4 h-4 mr-1" />
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
