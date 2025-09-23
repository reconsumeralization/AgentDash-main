/**
 * 🚀 NATIVE MCP EXTENSION REGISTRY
 * Manages and orchestrates MCP extensions for Gemini capabilities
 */

import { BaseMCPExtension, MCPExtensionConfig, MCPTool, MCPExecutionContext, MCPExtensionResult } from './native-mcp-extension'
import { AlgorithmicMCPExtension } from './native-mcp-extension'
import { CodeAnalysisMCPExtension, DevelopmentToolsMCPExtension } from './gemini-mcp-extensions'
import { AlgorithmicToolsMCPExtension } from './algorithmic-tools'
import { SocialMediaMCPExtension, LinkedInMCPExtension } from './social-media-mcp-extensions'

export interface ExtensionRegistryConfig {
  maxExtensions: number
  maxExecutionTime: number
  memoryLimit: number
  enableLogging: boolean
  enableMetrics: boolean
  securityMode: 'strict' | 'moderate' | 'permissive'
}

export interface ExtensionMetrics {
  extensionId: string
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  averageExecutionTime: number
  averageMemoryUsage: number
  lastExecution: string
  errorRate: number
}

export interface ExtensionExecutionLog {
  id: string
  extensionId: string
  toolName: string
  userId: string
  sessionId: string
  requestId: string
  timestamp: string
  executionTime: number
  memoryUsage: number
  success: boolean
  error?: string
  inputParams?: any
  outputData?: any
}

export class NativeMCPRegistry {
  private extensions: Map<string, BaseMCPExtension> = new Map()
  private config: ExtensionRegistryConfig
  private metrics: Map<string, ExtensionMetrics> = new Map()
  private executionLogs: ExtensionExecutionLog[] = []
  private isInitialized: boolean = false

  constructor(config: Partial<ExtensionRegistryConfig> = {}) {
    this.config = {
      maxExtensions: 50,
      maxExecutionTime: 30000, // 30 seconds
      memoryLimit: 100 * 1024 * 1024, // 100MB - reduced for demo
      enableLogging: true,
      enableMetrics: true,
      securityMode: 'moderate',
      ...config
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('🚀 Initializing Native MCP Extension Registry...')

      // Register built-in extensions
      await this.registerBuiltInExtensions()

      // Initialize all registered extensions
      await this.initializeAllExtensions()

      this.isInitialized = true
      console.log('✅ Native MCP Extension Registry initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Native MCP Extension Registry:', error)
      throw error
    }
  }

  // Extension Management
  async registerExtension(extension: BaseMCPExtension): Promise<void> {
    if (this.extensions.size >= this.config.maxExtensions) {
      throw new Error(`Maximum number of extensions (${this.config.maxExtensions}) reached`)
    }

    const config = extension.getStatus().config
    const extensionId = config.id

    if (this.extensions.has(extensionId)) {
      throw new Error(`Extension with ID '${extensionId}' is already registered`)
    }

    // Validate extension configuration
    this.validateExtensionConfig(config)

    // Initialize extension
    await extension.initialize()

    // Register extension
    this.extensions.set(extensionId, extension)

    // Initialize metrics
    this.initializeMetrics(extensionId)

    console.log(`✅ Extension registered: ${config.name} (${extensionId})`)
  }

  async unregisterExtension(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId)
    if (!extension) {
      throw new Error(`Extension '${extensionId}' not found`)
    }

    try {
      await extension.onDestroy()
      this.extensions.delete(extensionId)
      this.metrics.delete(extensionId)
      console.log(`✅ Extension unregistered: ${extensionId}`)
    } catch (error) {
      console.error(`❌ Error unregistering extension ${extensionId}:`, error)
      throw error
    }
  }

  // Tool Execution
  async executeTool(
    extensionId: string,
    toolName: string,
    params: any,
    context: MCPExecutionContext
  ): Promise<MCPExtensionResult> {
    const startTime = Date.now()

    try {
      // Validate extension exists
      const extension = this.extensions.get(extensionId)
      if (!extension) {
        throw new Error(`Extension '${extensionId}' not found`)
      }

      // Security checks
      await this.performSecurityChecks(extensionId, toolName, params, context)

      // Execute tool
      const result = await extension.executeTool(toolName, params, context)

      // Update metrics
      this.updateMetrics(extensionId, result)

      // Log execution
      if (this.config.enableLogging) {
        this.logExecution(extensionId, toolName, params, result, context)
      }

      return result

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorResult: MCPExtensionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
        memoryUsage: 0,
        toolName,
        timestamp: new Date().toISOString()
      }

      // Update error metrics
      this.updateMetrics(extensionId, errorResult)

      // Log error
      if (this.config.enableLogging) {
        this.logExecution(extensionId, toolName, params, errorResult, context)
      }

      throw error
    }
  }

  // Discovery and Information
  getAvailableExtensions(): Array<{
    id: string
    name: string
    version: string
    description: string
    category: string
    capabilities: string[]
    toolCount: number
    status: any
  }> {
    return Array.from(this.extensions.entries()).map(([id, extension]) => {
      const status = extension.getStatus()
      return {
        id,
        name: status.config.name,
        version: status.config.version,
        description: status.config.description,
        category: status.config.category,
        capabilities: status.capabilities,
        toolCount: status.toolCount,
        status
      }
    })
  }

  getExtensionTools(extensionId: string): MCPTool[] {
    const extension = this.extensions.get(extensionId)
    if (!extension) {
      throw new Error(`Extension '${extensionId}' not found`)
    }
    return extension.getAllTools()
  }

  getAllTools(): Array<{
    extensionId: string
    extensionName: string
    tool: MCPTool
  }> {
    const allTools: Array<{
      extensionId: string
      extensionName: string
      tool: MCPTool
    }> = []

    for (const [extensionId, extension] of this.extensions.entries()) {
      const status = extension.getStatus()
      const tools = extension.getAllTools()
      
      for (const tool of tools) {
        allTools.push({
          extensionId,
          extensionName: status.config.name,
          tool
        })
      }
    }

    return allTools
  }

  // Metrics and Monitoring
  getExtensionMetrics(extensionId: string): ExtensionMetrics | undefined {
    return this.metrics.get(extensionId)
  }

  getAllMetrics(): ExtensionMetrics[] {
    return Array.from(this.metrics.values())
  }

  getExecutionLogs(limit: number = 100): ExtensionExecutionLog[] {
    return this.executionLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  getRegistryStatus(): {
    initialized: boolean
    extensionCount: number
    totalTools: number
    config: ExtensionRegistryConfig
    health: {
      healthyExtensions: number
      unhealthyExtensions: number
      totalExecutions: number
      errorRate: number
    }
  } {
    const extensions = Array.from(this.extensions.values())
    const allMetrics = Array.from(this.metrics.values())
    
    const totalExecutions = allMetrics.reduce((sum, m) => sum + m.totalExecutions, 0)
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.failedExecutions, 0)
    const errorRate = totalExecutions > 0 ? totalErrors / totalExecutions : 0

    return {
      initialized: this.isInitialized,
      extensionCount: this.extensions.size,
      totalTools: extensions.reduce((sum, ext) => sum + ext.getStatus().toolCount, 0),
      config: this.config,
      health: {
        healthyExtensions: extensions.filter(ext => ext.getStatus().initialized).length,
        unhealthyExtensions: extensions.filter(ext => !ext.getStatus().initialized).length,
        totalExecutions,
        errorRate
      }
    }
  }

  // Configuration Management
  updateConfig(newConfig: Partial<ExtensionRegistryConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('📝 Registry configuration updated')
  }

  getConfig(): ExtensionRegistryConfig {
    return { ...this.config }
  }

  // Private Methods
  private async registerBuiltInExtensions(): Promise<void> {
    // Register algorithmic extension
    const algorithmicExtension = new AlgorithmicMCPExtension()
    await this.registerExtension(algorithmicExtension)

    // Register advanced algorithmic tools extension
    const algorithmicToolsExtension = new AlgorithmicToolsMCPExtension()
    await this.registerExtension(algorithmicToolsExtension)

    // Register code analysis extension
    const codeAnalysisExtension = new CodeAnalysisMCPExtension()
    await this.registerExtension(codeAnalysisExtension)

    // Register development tools extension
    const developmentToolsExtension = new DevelopmentToolsMCPExtension()
    await this.registerExtension(developmentToolsExtension)

    // Register social media management extension
    const socialMediaExtension = new SocialMediaMCPExtension()
    await this.registerExtension(socialMediaExtension)

    // Register LinkedIn-specific extension
    const linkedInExtension = new LinkedInMCPExtension()
    await this.registerExtension(linkedInExtension)

    console.log('📦 Built-in extensions registered')
  }

  private async initializeAllExtensions(): Promise<void> {
    const initPromises = Array.from(this.extensions.values()).map(ext => ext.initialize())
    await Promise.all(initPromises)
    console.log('🔧 All extensions initialized')
  }

  private validateExtensionConfig(config: MCPExtensionConfig): void {
    if (!config.id || !config.name || !config.version) {
      throw new Error('Extension must have id, name, and version')
    }

    if (!config.capabilities || config.capabilities.length === 0) {
      throw new Error('Extension must have at least one capability')
    }

    // Security validation based on mode
    if (this.config.securityMode === 'strict') {
      if (config.permissions.fileSystem || config.permissions.network || config.permissions.database) {
        throw new Error('Strict security mode: File system, network, and database permissions not allowed')
      }
    }
  }

  private async performSecurityChecks(
    extensionId: string,
    toolName: string,
    params: any,
    context: MCPExecutionContext
  ): Promise<void> {
    // Execution time check
    if (this.config.maxExecutionTime > 0) {
      // This would be implemented with a timeout mechanism
    }

    // Memory usage check (disabled for demo)
    // if (this.config.memoryLimit > 0) {
    //   const currentMemory = process.memoryUsage().heapUsed
    //   if (currentMemory > this.config.memoryLimit) {
    //     throw new Error('Memory limit exceeded')
    //   }
    // }

    // Parameter validation
    this.validateToolParameters(extensionId, toolName, params)

    // Context validation
    this.validateExecutionContext(context)
  }

  private validateToolParameters(extensionId: string, toolName: string, params: any): void {
    const extension = this.extensions.get(extensionId)
    if (!extension) return

    const tool = extension.getTool(toolName)
    if (!tool) return

    // Basic parameter validation
    if (tool.inputSchema.required) {
      for (const field of tool.inputSchema.required) {
        if (!(field in params)) {
          throw new Error(`Required parameter missing: ${field}`)
        }
      }
    }
  }

  private validateExecutionContext(context: MCPExecutionContext): void {
    if (!context.userId || !context.sessionId || !context.requestId) {
      throw new Error('Invalid execution context: missing required fields')
    }
  }

  private initializeMetrics(extensionId: string): void {
    this.metrics.set(extensionId, {
      extensionId,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      lastExecution: new Date().toISOString(),
      errorRate: 0
    })
  }

  private updateMetrics(extensionId: string, result: MCPExtensionResult): void {
    const metrics = this.metrics.get(extensionId)
    if (!metrics) return

    metrics.totalExecutions++
    if (result.success) {
      metrics.successfulExecutions++
    } else {
      metrics.failedExecutions++
    }

    // Update averages
    metrics.averageExecutionTime = 
      (metrics.averageExecutionTime * (metrics.totalExecutions - 1) + result.executionTime) / 
      metrics.totalExecutions

    metrics.averageMemoryUsage = 
      (metrics.averageMemoryUsage * (metrics.totalExecutions - 1) + result.memoryUsage) / 
      metrics.totalExecutions

    metrics.lastExecution = result.timestamp
    metrics.errorRate = metrics.failedExecutions / metrics.totalExecutions
  }

  private logExecution(
    extensionId: string,
    toolName: string,
    params: any,
    result: MCPExtensionResult,
    context: MCPExecutionContext
  ): void {
    const logEntry: ExtensionExecutionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      extensionId,
      toolName,
      userId: context.userId,
      sessionId: context.sessionId,
      requestId: context.requestId,
      timestamp: result.timestamp,
      executionTime: result.executionTime,
      memoryUsage: result.memoryUsage,
      success: result.success,
      error: result.error,
      inputParams: this.config.enableLogging ? params : undefined,
      outputData: this.config.enableLogging && result.success ? result.data : undefined
    }

    this.executionLogs.push(logEntry)

    // Keep only last 1000 logs
    if (this.executionLogs.length > 1000) {
      this.executionLogs = this.executionLogs.slice(-1000)
    }
  }

  // Cleanup
  async destroy(): Promise<void> {
    console.log('🧹 Destroying Native MCP Extension Registry...')

    const destroyPromises = Array.from(this.extensions.values()).map(ext => ext.onDestroy())
    await Promise.all(destroyPromises)

    this.extensions.clear()
    this.metrics.clear()
    this.executionLogs = []
    this.isInitialized = false

    console.log('✅ Native MCP Extension Registry destroyed')
  }
}

// Global registry instance
export const nativeMCPRegistry = new NativeMCPRegistry()
