'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, FileText, Folder, Code, Eye, Download, Upload, Trash2, Edit3, Play, Pause, RotateCcw, Settings, Brain, Zap, Shield, BarChart3, FileCode, Database, Network, Cpu, HardDrive, Monitor, Terminal, GitBranch, Search, Filter, SortAsc, Grid, List, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'

// Virtual File System Types
interface VirtualFile {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  size?: number
  created: Date
  modified: Date
  children?: VirtualFile[]
  metadata?: {
    securityScore?: number
    qualityScore?: number
    performanceScore?: number
    vulnerabilities?: Array<{
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      line?: number
    }>
    dependencies?: string[]
    testCoverage?: number
    documentation?: boolean
  }
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  files?: VirtualFile[]
  visualizations?: VisualizationData[]
  metadata?: {
    processingTime?: number
    tokensUsed?: number
    confidence?: number
    suggestions?: string[]
  }
}

interface VisualizationData {
  id: string
  type: 'code-flow' | 'dependency-graph' | 'security-analysis' | 'performance-metrics' | 'file-tree' | 'architecture-diagram'
  title: string
  data: any
  config?: any
}

interface FileSystemState {
  currentPath: string
  files: VirtualFile[]
  selectedFiles: string[]
  expandedFolders: string[]
  viewMode: 'grid' | 'list' | 'tree'
  sortBy: 'name' | 'modified' | 'size' | 'type'
  filter: string
}

export default function GuidanceChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'system',
      content: 'Welcome to the Guidance Engine Chat Interface! I can help you generate code, manage files, create visualizations, and build complex systems. What would you like to work on today?',
      timestamp: new Date(),
      metadata: { confidence: 1.0 }
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fileSystem, setFileSystem] = useState<FileSystemState>({
    currentPath: '/',
    files: [
      {
        id: 'root',
        name: 'Workspace',
        type: 'folder',
        created: new Date(),
        modified: new Date(),
        children: [
          {
            id: 'examples',
            name: 'Examples',
            type: 'folder',
            created: new Date(),
            modified: new Date(),
            children: []
          },
          {
            id: 'generated',
            name: 'Generated Code',
            type: 'folder',
            created: new Date(),
            modified: new Date(),
            children: []
          },
          {
            id: 'visualizations',
            name: 'Visualizations',
            type: 'folder',
            created: new Date(),
            modified: new Date(),
            children: []
          }
        ]
      }
    ],
    selectedFiles: [],
    expandedFolders: ['root'],
    viewMode: 'tree',
    sortBy: 'name',
    filter: ''
  })
  
  const [activeTab, setActiveTab] = useState('chat')
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null)
  const [visualizations, setVisualizations] = useState<VisualizationData[]>([])
  const [aiMode, setAiMode] = useState<'creative' | 'analytical' | 'optimization' | 'security'>('creative')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // AI Processing Functions
  const processUserInput = async (userInput: string) => {
    setIsLoading(true)
    
    try {
      // Analyze input for file operations, code generation, or visualization requests
      const analysis = await analyzeInput(userInput)
      
      let response: ChatMessage
      
      switch (analysis.type) {
        case 'code-generation':
          response = await handleCodeGeneration(userInput, analysis)
          break
        case 'file-operation':
          response = await handleFileOperation(userInput, analysis)
          break
        case 'visualization':
          response = await handleVisualization(userInput, analysis)
          break
        case 'system-query':
          response = await handleSystemQuery(userInput, analysis)
          break
        default:
          response = await handleGeneralQuery(userInput, analysis)
      }
      
      setMessages(prev => [...prev, response])
      
      // Update file system if files were created/modified
      if (response.files && response.files.length > 0) {
        updateFileSystem(response.files)
      }
      
      // Update visualizations if created
      if (response.visualizations && response.visualizations.length > 0) {
        setVisualizations(prev => [...prev, ...response.visualizations!])
      }
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        metadata: { confidence: 0 }
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeInput = async (input: string) => {
    // AI-powered input analysis
    const codeKeywords = ['create', 'generate', 'build', 'implement', 'write', 'code', 'function', 'class', 'api', 'component']
    const fileKeywords = ['file', 'folder', 'directory', 'save', 'load', 'open', 'create', 'delete', 'move', 'copy']
    const vizKeywords = ['visualize', 'graph', 'chart', 'diagram', 'flow', 'architecture', 'dependencies', 'show', 'display']
    const systemKeywords = ['status', 'help', 'info', 'settings', 'config', 'system']
    
    const lowerInput = input.toLowerCase()
    
    if (codeKeywords.some(keyword => lowerInput.includes(keyword))) {
      return { type: 'code-generation', confidence: 0.9, context: input }
    } else if (fileKeywords.some(keyword => lowerInput.includes(keyword))) {
      return { type: 'file-operation', confidence: 0.8, context: input }
    } else if (vizKeywords.some(keyword => lowerInput.includes(keyword))) {
      return { type: 'visualization', confidence: 0.8, context: input }
    } else if (systemKeywords.some(keyword => lowerInput.includes(keyword))) {
      return { type: 'system-query', confidence: 0.7, context: input }
    } else {
      return { type: 'general', confidence: 0.6, context: input }
    }
  }

  const handleCodeGeneration = async (input: string, analysis: any): Promise<ChatMessage> => {
    const response = await fetch('/api/guidance/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'typescript',
        framework: 'Next.js',
        purpose: input,
        requirements: extractRequirements(input),
        securityLevel: 'high',
        accessibility: true,
        testing: true,
        documentation: true
      })
    })
    
    if (!response.ok) {
      throw new Error('Code generation failed')
    }
    
    const result = await response.json()
    
    // Create virtual file from generated code
    const generatedFile: VirtualFile = {
      id: `generated-${Date.now()}`,
      name: `generated-code-${Date.now()}.ts`,
      type: 'file',
      content: result.code,
      language: 'typescript',
      size: result.code.length,
      created: new Date(),
      modified: new Date(),
      metadata: {
        securityScore: result.securityScore,
        qualityScore: result.qualityScore,
        performanceScore: result.performanceScore,
        vulnerabilities: result.vulnerabilities,
        dependencies: result.dependencies,
        testCoverage: result.testCoverage,
        documentation: true
      }
    }
    
    return {
      id: `msg-${Date.now()}`,
      type: 'assistant',
      content: `I've generated the code for you! Here's what I created:\n\n**Security Score:** ${result.securityScore}/100\n**Quality Score:** ${result.qualityScore}/100\n**Performance Score:** ${result.performanceScore}/100\n\n${result.vulnerabilities?.length > 0 ? `\n**Vulnerabilities Found:** ${result.vulnerabilities.length}\n` : ''}The code has been saved to your workspace.`,
      timestamp: new Date(),
      files: [generatedFile],
      visualizations: [
        {
          id: `viz-${Date.now()}`,
          type: 'code-flow',
          title: 'Code Structure Analysis',
          data: result.code,
          config: { showMetrics: true, highlightIssues: true }
        }
      ],
      metadata: {
        processingTime: result.processingTime,
        confidence: 0.95
      }
    }
  }

  const handleFileOperation = async (input: string, analysis: any): Promise<ChatMessage> => {
    // AI-powered file operations
    if (input.toLowerCase().includes('create') && input.toLowerCase().includes('file')) {
      const fileName = extractFileName(input) || `new-file-${Date.now()}.txt`
      const newFile: VirtualFile = {
        id: `file-${Date.now()}`,
        name: fileName,
        type: 'file',
        content: '',
        created: new Date(),
        modified: new Date()
      }
      
      return {
        id: `msg-${Date.now()}`,
        type: 'assistant',
        content: `I've created the file "${fileName}" in your workspace. You can now edit it or add content.`,
        timestamp: new Date(),
        files: [newFile],
        metadata: { confidence: 0.9 }
      }
    }
    
    return {
      id: `msg-${Date.now()}`,
      type: 'assistant',
      content: 'I can help you with file operations like creating, editing, deleting, and organizing files. What specific file operation would you like to perform?',
      timestamp: new Date(),
      metadata: { confidence: 0.8 }
    }
  }

  const handleVisualization = async (input: string, analysis: any): Promise<ChatMessage> => {
    // Create appropriate visualization based on input
    const vizType = determineVisualizationType(input)
    const vizData = await generateVisualizationData(vizType, input)
    
    const visualization: VisualizationData = {
      id: `viz-${Date.now()}`,
      type: vizType,
      title: `Visualization: ${vizType.replace('-', ' ').toUpperCase()}`,
      data: vizData,
      config: { interactive: true, animated: true }
    }
    
    return {
      id: `msg-${Date.now()}`,
      type: 'assistant',
      content: `I've created a ${vizType.replace('-', ' ')} visualization for you. This will help you understand the structure and relationships in your code.`,
      timestamp: new Date(),
      visualizations: [visualization],
      metadata: { confidence: 0.9 }
    }
  }

  const handleSystemQuery = async (input: string, analysis: any): Promise<ChatMessage> => {
    const systemInfo = {
      totalFiles: countFiles(fileSystem.files),
      totalSize: calculateTotalSize(fileSystem.files),
      lastActivity: new Date(),
      aiMode,
      activeVisualizations: visualizations.length
    }
    
    return {
      id: `msg-${Date.now()}`,
      type: 'assistant',
      content: `**System Status:**\n- Total Files: ${systemInfo.totalFiles}\n- Total Size: ${formatBytes(systemInfo.totalSize)}\n- AI Mode: ${aiMode}\n- Active Visualizations: ${systemInfo.activeVisualizations}\n- Last Activity: ${systemInfo.lastActivity.toLocaleTimeString()}`,
      timestamp: new Date(),
      metadata: { confidence: 1.0 }
    }
  }

  const handleGeneralQuery = async (input: string, analysis: any): Promise<ChatMessage> => {
    return {
      id: `msg-${Date.now()}`,
      type: 'assistant',
      content: `I understand you're asking about "${input}". I can help you with code generation, file management, creating visualizations, or answering technical questions. Could you be more specific about what you'd like me to help you with?`,
      timestamp: new Date(),
      metadata: { confidence: 0.7 }
    }
  }

  // Helper Functions
  const extractRequirements = (input: string): string[] => {
    // Simple requirement extraction - in a real system, this would be more sophisticated
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)
    return sentences.slice(0, 5) // Limit to 5 requirements
  }

  const extractFileName = (input: string): string | null => {
    const match = input.match(/["']([^"']+)["']/)
    return match ? match[1] : null
  }

  const determineVisualizationType = (input: string): VisualizationData['type'] => {
    const lowerInput = input.toLowerCase()
    if (lowerInput.includes('dependency') || lowerInput.includes('import')) return 'dependency-graph'
    if (lowerInput.includes('security') || lowerInput.includes('vulnerability')) return 'security-analysis'
    if (lowerInput.includes('performance') || lowerInput.includes('speed')) return 'performance-metrics'
    if (lowerInput.includes('architecture') || lowerInput.includes('structure')) return 'architecture-diagram'
    if (lowerInput.includes('file') || lowerInput.includes('folder')) return 'file-tree'
    return 'code-flow'
  }

  const generateVisualizationData = async (type: VisualizationData['type'], context: string): Promise<any> => {
    // Generate mock visualization data based on type
    switch (type) {
      case 'code-flow':
        return {
          nodes: [
            { id: '1', label: 'Entry Point', type: 'start' },
            { id: '2', label: 'Processing', type: 'process' },
            { id: '3', label: 'Output', type: 'end' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3' }
          ]
        }
      case 'dependency-graph':
        return {
          nodes: [
            { id: 'react', label: 'React', type: 'library' },
            { id: 'next', label: 'Next.js', type: 'framework' },
            { id: 'typescript', label: 'TypeScript', type: 'language' }
          ],
          edges: [
            { from: 'next', to: 'react' },
            { from: 'next', to: 'typescript' }
          ]
        }
      case 'security-analysis':
        return {
          vulnerabilities: [
            { type: 'XSS', severity: 'high', count: 2 },
            { type: 'SQL Injection', severity: 'medium', count: 1 },
            { type: 'CSRF', severity: 'low', count: 3 }
          ],
          securityScore: 75
        }
      case 'performance-metrics':
        return {
          metrics: [
            { name: 'Load Time', value: 1.2, unit: 's' },
            { name: 'Memory Usage', value: 45, unit: 'MB' },
            { name: 'CPU Usage', value: 12, unit: '%' }
          ]
        }
      case 'file-tree':
        return {
          tree: fileSystem.files,
          expanded: fileSystem.expandedFolders
        }
      case 'architecture-diagram':
        return {
          components: [
            { name: 'Frontend', type: 'React' },
            { name: 'API', type: 'Next.js' },
            { name: 'Database', type: 'PostgreSQL' }
          ],
          connections: [
            { from: 'Frontend', to: 'API' },
            { from: 'API', to: 'Database' }
          ]
        }
      default:
        return {}
    }
  }

  const updateFileSystem = (newFiles: VirtualFile[]) => {
    setFileSystem(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }))
  }

  const countFiles = (files: VirtualFile[]): number => {
    return files.reduce((count, file) => {
      if (file.type === 'file') count++
      if (file.children) count += countFiles(file.children)
      return count
    }, 0)
  }

  const calculateTotalSize = (files: VirtualFile[]): number => {
    return files.reduce((size, file) => {
      if (file.type === 'file' && file.size) size += file.size
      if (file.children) size += calculateTotalSize(file.children)
      return size
    }, 0)
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    await processUserInput(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderFileTree = (files: VirtualFile[], level = 0) => {
    return files.map(file => (
      <div key={file.id} className="ml-4">
        <div 
          className={`flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-gray-100 ${selectedFile?.id === file.id ? 'bg-blue-100' : ''}`}
          onClick={() => setSelectedFile(file)}
        >
          {file.type === 'folder' ? <Folder className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          <span className="text-sm">{file.name}</span>
          {file.metadata?.securityScore && (
            <Badge variant={file.metadata.securityScore > 80 ? 'default' : 'destructive'} className="text-xs">
              {file.metadata.securityScore}
            </Badge>
          )}
        </div>
        {file.children && fileSystem.expandedFolders.includes(file.id) && renderFileTree(file.children, level + 1)}
      </div>
    ))
  }

  const renderVisualization = (viz: VisualizationData) => {
    switch (viz.type) {
      case 'code-flow':
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                {viz.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto max-h-64">
                  {typeof viz.data === 'string' ? viz.data : JSON.stringify(viz.data, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )
      case 'security-analysis':
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {viz.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {viz.data.vulnerabilities?.map((vuln: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="font-medium">{vuln.type}</span>
                    <Badge variant={vuln.severity === 'high' ? 'destructive' : 'secondary'}>
                      {vuln.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      case 'performance-metrics':
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {viz.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {viz.data.metrics?.map((metric: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{metric.name}</span>
                      <span>{metric.value} {metric.unit}</span>
                    </div>
                    <Progress value={(metric.value / 100) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      default:
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{viz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(viz.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - File System */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Guidance Engine</h2>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
            <Button size="sm" variant="outline">
              <Folder className="w-4 h-4 mr-1" />
              New Folder
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={fileSystem.viewMode === 'tree' ? 'default' : 'outline'}
              onClick={() => setFileSystem(prev => ({ ...prev, viewMode: 'tree' }))}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant={fileSystem.viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setFileSystem(prev => ({ ...prev, viewMode: 'grid' }))}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          <div className="space-y-1">
            {renderFileTree(fileSystem.files)}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Files: {countFiles(fileSystem.files)}</div>
            <div>Size: {formatBytes(calculateTotalSize(fileSystem.files))}</div>
            <div>AI Mode: {aiMode}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="visualizations" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visualizations
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl p-4 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : message.type === 'system'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {message.files && message.files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-sm font-medium">Generated Files:</div>
                          {message.files.map((file) => (
                            <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{file.name}</span>
                              {file.metadata?.securityScore && (
                                <Badge variant={file.metadata.securityScore > 80 ? 'default' : 'destructive'}>
                                  Security: {file.metadata.securityScore}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.visualizations && message.visualizations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-sm font-medium">Visualizations:</div>
                          {message.visualizations.map((viz) => (
                            <div key={viz.id} className="p-2 bg-gray-50 rounded">
                              {renderVisualization(viz)}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                        {message.metadata?.processingTime && ` • ${message.metadata.processingTime}ms`}
                        {message.metadata?.confidence && ` • Confidence: ${Math.round(message.metadata.confidence * 100)}%`}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me to generate code, create files, or visualize data..."
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant={aiMode === 'creative' ? 'default' : 'outline'}
                  onClick={() => setAiMode('creative')}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Creative
                </Button>
                <Button 
                  size="sm" 
                  variant={aiMode === 'analytical' ? 'default' : 'outline'}
                  onClick={() => setAiMode('analytical')}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Analytical
                </Button>
                <Button 
                  size="sm" 
                  variant={aiMode === 'optimization' ? 'default' : 'outline'}
                  onClick={() => setAiMode('optimization')}
                >
                  <Cpu className="w-4 h-4 mr-1" />
                  Optimization
                </Button>
                <Button 
                  size="sm" 
                  variant={aiMode === 'security' ? 'default' : 'outline'}
                  onClick={() => setAiMode('security')}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Security
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="flex-1 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">File Manager</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Search className="w-4 h-4 mr-1" />
                    Search
                  </Button>
                  <Button size="sm" variant="outline">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </Button>
                  <Button size="sm" variant="outline">
                    <SortAsc className="w-4 h-4 mr-1" />
                    Sort
                  </Button>
                </div>
              </div>
              
              {selectedFile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {selectedFile.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedFile.content && (
                        <div>
                          <h4 className="font-medium mb-2">Content:</h4>
                          <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-64">
                            {selectedFile.content}
                          </pre>
                        </div>
                      )}
                      
                      {selectedFile.metadata && (
                        <div>
                          <h4 className="font-medium mb-2">Metadata:</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedFile.metadata.securityScore && (
                              <div>
                                <span className="text-sm text-gray-600">Security Score:</span>
                                <div className="text-lg font-semibold">{selectedFile.metadata.securityScore}/100</div>
                              </div>
                            )}
                            {selectedFile.metadata.qualityScore && (
                              <div>
                                <span className="text-sm text-gray-600">Quality Score:</span>
                                <div className="text-lg font-semibold">{selectedFile.metadata.qualityScore}/100</div>
                              </div>
                            )}
                            {selectedFile.metadata.performanceScore && (
                              <div>
                                <span className="text-sm text-gray-600">Performance Score:</span>
                                <div className="text-lg font-semibold">{selectedFile.metadata.performanceScore}/100</div>
                              </div>
                            )}
                            {selectedFile.metadata.testCoverage && (
                              <div>
                                <span className="text-sm text-gray-600">Test Coverage:</span>
                                <div className="text-lg font-semibold">{selectedFile.metadata.testCoverage}%</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="visualizations" className="flex-1 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Visualizations</h3>
                <Button size="sm" variant="outline">
                  <Maximize2 className="w-4 h-4 mr-1" />
                  Fullscreen
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visualizations.map((viz) => (
                  <div key={viz.id}>
                    {renderVisualization(viz)}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="flex-1 p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">System Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5" />
                      File System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Files:</span>
                        <span className="font-medium">{countFiles(fileSystem.files)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Size:</span>
                        <span className="font-medium">{formatBytes(calculateTotalSize(fileSystem.files))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Path:</span>
                        <span className="font-medium">{fileSystem.currentPath}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Mode:</span>
                        <Badge variant="outline">{aiMode}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Visualizations:</span>
                        <span className="font-medium">{visualizations.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chat Messages:</span>
                        <span className="font-medium">{messages.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          // Handle file upload
          console.log('Files selected:', e.target.files)
        }}
      />
    </div>
  )
}
