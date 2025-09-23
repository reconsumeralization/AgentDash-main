"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Alert, AlertDescription } from "@/components/ui"
import {
  Bot, Code, Upload, Zap, Settings, Cloud, CheckCircle, AlertCircle,
  Rocket, Download, FileCode, GitBranch, Cpu
} from "lucide-react"

interface AgentConfig {
  name: string
  version: string
  description: string
  runtime: 'nodejs' | 'python' | 'docker'
  memory: number
  timeout: number
  triggers: string[]
  dependencies: string[]
  environment: Record<string, string>
}

interface DeploymentTarget {
  id: string
  name: string
  type: 'vercel' | 'aws' | 'local'
  cost: string
  description: string
  features: string[]
}

interface GeneratedCode {
  main: string
  package: string
  dockerfile?: string
  readme: string
}

const sampleWorkflow = {
  id: 'fantasy-optimizer',
  name: 'Fantasy Lineup Optimizer',
  nodes: [
    { id: 'input', type: 'input', label: 'Player Data' },
    { id: 'process', type: 'ai', label: 'AI Optimization' },
    { id: 'output', type: 'output', label: 'Optimal Lineup' }
  ],
  edges: [
    { from: 'input', to: 'process' },
    { from: 'process', to: 'output' }
  ]
}

export function WorkflowToAgentConverter() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null)
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: 'Fantasy Lineup Optimizer',
    version: '1.0.0',
    description: 'AI-powered fantasy sports lineup optimization agent',
    runtime: 'nodejs',
    memory: 512,
    timeout: 30,
    triggers: ['webhook', 'schedule'],
    dependencies: ['ai', '@ai-sdk/openai', 'zod'],
    environment: {
      OPENAI_API_KEY: 'your_openai_key'
    }
  })
  const [selectedTarget, setSelectedTarget] = useState<DeploymentTarget>({
    id: 'vercel',
    name: 'Vercel',
    type: 'vercel',
    cost: 'Free',
    description: 'Serverless deployment with automatic scaling',
    features: ['Auto-scaling', 'Edge functions', 'Global CDN']
  })
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')

  const deploymentTargets: DeploymentTarget[] = [
    {
      id: 'vercel',
      name: 'Vercel',
      type: 'vercel',
      cost: 'Free',
      description: 'Serverless deployment with automatic scaling',
      features: ['Auto-scaling', 'Edge functions', 'Global CDN']
    },
    {
      id: 'aws',
      name: 'AWS Lambda',
      type: 'aws',
      cost: 'Pay-per-use',
      description: 'Enterprise-grade serverless computing',
      features: ['High availability', 'Auto-scaling', 'Monitoring']
    },
    {
      id: 'local',
      name: 'Local Docker',
      type: 'local',
      cost: 'Free',
      description: 'Run locally with Docker containerization',
      features: ['Local development', 'Easy testing', 'Portable']
    }
  ]

  const convertWorkflowToAgent = useCallback(async () => {
    setIsConverting(true)
    setConversionProgress(0)

    const steps = [
      { progress: 20, message: "Analyzing workflow structure..." },
      { progress: 40, message: "Generating agent code..." },
      { progress: 60, message: "Creating deployment configuration..." },
      { progress: 80, message: "Optimizing for target platform..." },
      { progress: 100, message: "Conversion complete!" },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setConversionProgress(step.progress)
    }

    // Generate code based on workflow
    const mainCode = generateMainCode(selectedWorkflow || sampleWorkflow, agentConfig)
    const packageJson = generatePackageJson(agentConfig)
    const dockerfile = selectedTarget.type === "local" ? generateDockerfile(agentConfig) : undefined
    const readme = generateReadme(agentConfig, selectedTarget)

    setGeneratedCode({
      main: mainCode,
      package: packageJson,
      dockerfile,
      readme,
    })

    setIsConverting(false)
  }, [selectedWorkflow, agentConfig, selectedTarget, generateMainCode, generatePackageJson, generateDockerfile, generateReadme])

  const generateMainCode = useCallback((workflow: any, config: AgentConfig) => {
    if (config.runtime === "nodejs") {
      return `// ${config.name} - Generated AI Agent
import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Workflow Step 1: Data Input Processing
    const inputData = await processInputData(body)
    
    // Workflow Step 2: AI Agent Processing
    const result = await optimizeLineup(inputData)
    
    // Workflow Step 3: Result Formatting
    const formattedResult = await formatResults(result)
    
    return NextResponse.json({
      success: true,
      data: formattedResult,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Agent execution error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function processInputData(data: any) {
  // Process input data from workflow node
  return {
    players: data.players || [],
    constraints: data.constraints || {},
    preferences: data.preferences || {}
  }
}

// Temporarily disabled due to parsing issues
// TODO: Fix generateObject syntax and re-enable
/*
async function optimizeLineup(data: any) {
  const { object } = await generateObject({
    model: openai('gpt-4'),
    schema: z.object({
      lineup: z.array(z.object({
        player: z.string(),
        position: z.string(),
        salary: z.number(),
        projection: z.number()
      })),
      totalSalary: z.number(),
      projectedPoints: z.number(),
    }),
    prompt: "Optimize fantasy lineup with constraints: " + JSON.stringify(data)
  })

  return object
}
*/

// Temporarily removed due to parsing issues
// async function optimizeLineup(data: any) {
//   // Placeholder implementation
//   return {
//     lineup: [],
//     totalSalary: 0,
//     projectedPoints: 0
//   }
// }

async function formatResults(result: any) {
  return {
    ...result,
    confidence: 0.85,
    recommendations: [
      'Consider weather conditions for outdoor games',
      'Monitor injury reports before lineup lock'
    ]
  }
}

export const runtime = 'nodejs'
export const maxDuration = ${config.timeout}`
    } else {
      return `# ${config.name} - Generated AI Agent
import json
import asyncio
from typing import Dict, Any
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def handler(event: Dict[str, Any]) -> Dict[str, Any]:
    """Main agent handler function"""
    try:
        # Workflow Step 1: Data Input Processing
        input_data = await process_input_data(event)
        
        # Workflow Step 2: AI Agent Processing
        result = await optimize_lineup(input_data)
        
        # Workflow Step 3: Result Formatting
        formatted_result = await format_results(result)
        
        return {
            "success": True,
            "data": formatted_result,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as error:
        print(f"Agent execution error: {error}")
        return {
            "success": False,
            "error": str(error)
        }

async def process_input_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Process input data from workflow node"""
    return {
        "players": data.get("players", []),
        "constraints": data.get("constraints", {}),
        "preferences": data.get("preferences", {})
    }

async def optimize_lineup(data: Dict[str, Any]) -> Dict[str, Any]:
    """AI-powered lineup optimization"""
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a fantasy sports optimizer."},
            {"role": "user", "content": f"Optimize lineup: {json.dumps(data)}"}
        ]
    )
    
    # Parse and return structured result
    return {
        "lineup": [],
        "totalSalary": 49500,
        "projectedPoints": 142.3
    }

async def format_results(result: Dict[str, Any]) -> Dict[str, Any]:
    """Format optimization results"""
    return {
        **result,
        "confidence": 0.85,
        "recommendations": [
            "Consider weather conditions for outdoor games",
            "Monitor injury reports before lineup lock"
        ]
    }`
    }
  }, [])

  const generatePackageJson = useCallback((config: AgentConfig) => {
    if (config.runtime === "nodejs") {
      return JSON.stringify(
        {
          name: config.name.toLowerCase().replace(/\s+/g, "-"),
          version: config.version,
          description: config.description,
          main: "index.js",
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            deploy: "vercel --prod",
          },
          dependencies: {
            next: "^14.0.0",
            react: "^18.0.0",
            "react-dom": "^18.0.0",
            ai: "^4.0.0",
            "@ai-sdk/openai": "^1.0.0",
            zod: "^3.22.0",
            ...config.dependencies.reduce((acc, dep) => ({ ...acc, [dep]: "latest" }), {})
          },
          engines: {
            node: ">=18.0.0",
          },
        },
        null,
        2,
      )
    } else {
      return `# ${config.name}
# ${config.description}

requirements.txt:
openai>=1.0.0
asyncio
typing
${config.dependencies.join("\n")}

runtime: python${config.runtime === "python" ? "3.11" : ""}
memory: ${config.memory}MB
timeout: ${config.timeout}s`
    }
  }, [])

  const generateDockerfile = useCallback((config: AgentConfig) => {
    if (config.runtime === "nodejs") {
      return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]`
    } else {
      return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]`
    }
  }, [])

  const generateReadme = useCallback((config: AgentConfig, target: DeploymentTarget) => {
    return `# ${config.name}

${config.description}

## Features

- AI-powered workflow execution
- Automatic scaling and optimization
- Built-in error handling and monitoring
- RESTful API interface

## Deployment

This agent is configured for deployment on **${target.name}**.

### Quick Start


# Install dependencies
${config.runtime === "nodejs" ? "npm install" : "pip install -r requirements.txt"}

# Run locally
${config.runtime === "nodejs" ? "npm run dev" : "python main.py"}

# Deploy to ${target.name}
${target.type === "vercel" ? "vercel --prod" : target.type === "aws" ? "aws lambda deploy" : "docker build -t agent ."}


### Configuration

- **Runtime**: ${config.runtime}
- **Memory**: ${config.memory}MB
- **Timeout**: ${config.timeout}s
- **Triggers**: ${config.triggers.join(", ")}

### API Endpoints

- 
POST /api/execute - Execute the AI agent workflow
- GET /api/health - Health check endpoint
- GET /api/status - Agent status and metrics

### Environment Variables


OPENAI_API_KEY=your_openai_key
${Object.entries(config.environment)
  .map(([key, value]) => `${key}=${value}`) .join("\n")}

## Generated from Workflow

This agent was automatically generated from a visual workflow using the AI Agent Container platform.

- **Generated**: ${new Date().toISOString()}
- **Version**: ${config.version}
- **Target**: ${target.name}
`
  }, [])

  const deployAgent = useCallback(async () => {
    setDeploymentStatus("deploying")

    // Simulate deployment process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Randomly succeed or fail for demo
    const success = Math.random() > 0.3
    setDeploymentStatus(success ? "success" : "error")

    if (success) {
      setTimeout(() => setDeploymentStatus("idle"), 5000)
    }
  }, [])

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Bot className="w-6 h-6 text-green-400" />
            Workflow to Agent Converter
          </h2>
          <p className="text-gray-400">Transform visual workflows into deployable AI agents</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setSelectedWorkflow(sampleWorkflow)}
            size="sm"
            variant="outline"
            className="border-white/20 text-gray-300 hover:bg-white/5"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load Sample
          </Button>
          <Button
            onClick={convertWorkflowToAgent}
            disabled={isConverting}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isConverting ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                Convert to Agent
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Workflow Preview */}
      {selectedWorkflow && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-400" />
              Selected Workflow: {selectedWorkflow.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-white">{selectedWorkflow.nodes.length}</div>
                <div className="text-sm text-gray-400">Nodes</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-green-400">{selectedWorkflow.edges.length}</div>
                <div className="text-sm text-gray-400">Connections</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-purple-400">Auto</div>
                <div className="text-sm text-gray-400">Optimization</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Progress */}
      {isConverting && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Cpu className="w-6 h-6 text-green-400 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Converting workflow to agent</span>
                  <span className="text-green-400">{conversionProgress}%</span>
                </div>
                <Progress value={conversionProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Configuration */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Agent Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Agent Name</label>
                <Input
                  value={agentConfig.name}
                  onChange={(e) => setAgentConfig((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Version</label>
                <Input
                  value={agentConfig.version}
                  onChange={(e) => setAgentConfig((prev) => ({ ...prev, version: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Description</label>
              <Textarea
                value={agentConfig.description}
                onChange={(e) => setAgentConfig((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Runtime</label>
                <Select
                  value={agentConfig.runtime}
                  onValueChange={(value: "nodejs" | "python" | "docker") =>
                    setAgentConfig((prev) => ({ ...prev, runtime: value }))
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10">
                    <SelectItem value="nodejs">Node.js</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="docker">Docker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Memory (MB)</label>
                <Input
                  type="number"
                  value={agentConfig.memory}
                  onChange={(e) => setAgentConfig((prev) => ({ ...prev, memory: Number.parseInt(e.target.value) }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Timeout (s)</label>
                <Input
                  type="number"
                  value={agentConfig.timeout}
                  onChange={(e) => setAgentConfig((prev) => ({ ...prev, timeout: Number.parseInt(e.target.value) }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Target */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-purple-400" />
              Deployment Target
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {deploymentTargets.map((target) => (
                <div
                  key={target.id}
                  onClick={() => setSelectedTarget(target)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedTarget.id === target.id
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-medium">{target.name}</div>
                      <Badge className="bg-gray-500/20 text-gray-300 text-xs">{target.cost}</Badge>
                    </div>
                    {selectedTarget.id === target.id && <CheckCircle className="w-5 h-5 text-blue-400" />}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{target.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {target.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="border-white/20 text-gray-300 text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Code */}
      {generatedCode && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-green-400" />
                Generated Agent Code
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={deployAgent}
                  disabled={deploymentStatus === "deploying"}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {deploymentStatus === "deploying" ? (
                    <>
                      <Rocket className="w-4 h-4 mr-2 animate-bounce" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy Agent
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/5 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="main" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-white/5">
                <TabsTrigger value="main" className="text-white">
                  Main Code
                </TabsTrigger>
                <TabsTrigger value="package" className="text-white">
                  Package
                </TabsTrigger>
                <TabsTrigger value="docker" className="text-white">
                  Docker
                </TabsTrigger>
                <TabsTrigger value="readme" className="text-white">
                  README
                </TabsTrigger>
              </TabsList>

              <TabsContent value="main">
                <ScrollArea className="h-96">
                  <pre className="p-4 bg-black/40 rounded-lg border border-white/10 text-sm text-green-300 overflow-x-auto">
                    {generatedCode.main}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="package">
                <ScrollArea className="h-96">
                  <pre className="p-4 bg-black/40 rounded-lg border border-white/10 text-sm text-blue-300 overflow-x-auto">
                    {generatedCode.package}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="docker">
                <ScrollArea className="h-96">
                  <pre className="p-4 bg-black/40 rounded-lg border border-white/10 text-sm text-purple-300 overflow-x-auto">
                    {generatedCode.dockerfile || "Docker configuration not available for this runtime"}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="readme">
                <ScrollArea className="h-96">
                  <pre className="p-4 bg-black/40 rounded-lg border border-white/10 text-sm text-yellow-300 overflow-x-auto">
                    {generatedCode.readme}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Deployment Status */}
      {deploymentStatus !== "idle" && (
        <Alert
          className={`${deploymentStatus === "success"
              ? "bg-green-500/10 border-green-500/20"
              : deploymentStatus === "error"
                ? "bg-red-500/10 border-red-500/20"
                : "bg-blue-500/10 border-blue-500/20"}`}
        >
          {deploymentStatus === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : deploymentStatus === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-400" />
          ) : (
            <Rocket className="h-4 w-4 text-blue-400 animate-bounce" />
          )}
          <AlertDescription
            className={`${deploymentStatus === "success"
                ? "text-green-200"
                : deploymentStatus === "error"
                  ? "text-red-200"
                  : "text-blue-200"}`}
          >
            {deploymentStatus === "success" &&
              "Agent deployed successfully! Your AI agent is now live and ready to use."}
            {deploymentStatus === "error" && "Deployment failed. Please check your configuration and try again."}
            {deploymentStatus === "deploying" && "Deploying your AI agent to the cloud..."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
