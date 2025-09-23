import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SecurityHeaders, SecureLogger } from '@/lib'

// Visualization Types
interface VisualizationRequest {
  type: 'code-flow' | 'dependency-graph' | 'security-analysis' | 'performance-metrics' | 'file-tree' | 'architecture-diagram' | 'data-flow' | 'component-hierarchy' | 'api-endpoints' | 'database-schema'
  data: any
  config?: {
    interactive?: boolean
    animated?: boolean
    theme?: 'light' | 'dark'
    layout?: 'hierarchical' | 'force-directed' | 'circular' | 'grid'
    showLabels?: boolean
    showMetrics?: boolean
    highlightIssues?: boolean
    colorScheme?: 'default' | 'security' | 'performance' | 'quality'
  }
  context?: {
    language?: string
    framework?: string
    purpose?: string
    requirements?: string[]
  }
}

interface VisualizationResult {
  id: string
  type: string
  title: string
  data: any
  config: any
  metadata: {
    generatedAt: Date
    processingTime: number
    dataPoints: number
    complexity: 'low' | 'medium' | 'high'
    interactive: boolean
  }
}

// Validation schemas
const VisualizationRequestSchema = z.object({
  type: z.enum(['code-flow', 'dependency-graph', 'security-analysis', 'performance-metrics', 'file-tree', 'architecture-diagram', 'data-flow', 'component-hierarchy', 'api-endpoints', 'database-schema']),
  data: z.any(),
  config: z.object({
    interactive: z.boolean().optional(),
    animated: z.boolean().optional(),
    theme: z.enum(['light', 'dark']).optional(),
    layout: z.enum(['hierarchical', 'force-directed', 'circular', 'grid']).optional(),
    showLabels: z.boolean().optional(),
    showMetrics: z.boolean().optional(),
    highlightIssues: z.boolean().optional(),
    colorScheme: z.enum(['default', 'security', 'performance', 'quality']).optional()
  }).optional(),
  context: z.object({
    language: z.string().optional(),
    framework: z.string().optional(),
    purpose: z.string().optional(),
    requirements: z.array(z.string()).optional()
  }).optional()
})

class VisualizationEngine {
  async generateVisualization(request: VisualizationRequest): Promise<VisualizationResult> {
    const startTime = Date.now()
    
    let visualizationData: any
    let complexity: 'low' | 'medium' | 'high' = 'low'
    
    switch (request.type) {
      case 'code-flow':
        visualizationData = await this.generateCodeFlow(request.data, request.config)
        complexity = 'medium'
        break
      
      case 'dependency-graph':
        visualizationData = await this.generateDependencyGraph(request.data, request.config)
        complexity = 'high'
        break
      
      case 'security-analysis':
        visualizationData = await this.generateSecurityAnalysis(request.data, request.config)
        complexity = 'medium'
        break
      
      case 'performance-metrics':
        visualizationData = await this.generatePerformanceMetrics(request.data, request.config)
        complexity = 'low'
        break
      
      case 'file-tree':
        visualizationData = await this.generateFileTree(request.data, request.config)
        complexity = 'low'
        break
      
      case 'architecture-diagram':
        visualizationData = await this.generateArchitectureDiagram(request.data, request.config)
        complexity = 'high'
        break
      
      case 'data-flow':
        visualizationData = await this.generateDataFlow(request.data, request.config)
        complexity = 'medium'
        break
      
      case 'component-hierarchy':
        visualizationData = await this.generateComponentHierarchy(request.data, request.config)
        complexity = 'medium'
        break
      
      case 'api-endpoints':
        visualizationData = await this.generateApiEndpoints(request.data, request.config)
        complexity = 'medium'
        break
      
      case 'database-schema':
        visualizationData = await this.generateDatabaseSchema(request.data, request.config)
        complexity = 'high'
        break
      
      default:
        throw new Error(`Unsupported visualization type: ${request.type}`)
    }
    
    const processingTime = Date.now() - startTime
    
    return {
      id: `viz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: request.type,
      title: this.generateTitle(request.type, request.context),
      data: visualizationData,
      config: {
        interactive: request.config?.interactive ?? true,
        animated: request.config?.animated ?? true,
        theme: request.config?.theme ?? 'light',
        layout: request.config?.layout ?? 'hierarchical',
        showLabels: request.config?.showLabels ?? true,
        showMetrics: request.config?.showMetrics ?? true,
        highlightIssues: request.config?.highlightIssues ?? true,
        colorScheme: request.config?.colorScheme ?? 'default'
      },
      metadata: {
        generatedAt: new Date(),
        processingTime,
        dataPoints: this.countDataPoints(visualizationData),
        complexity,
        interactive: request.config?.interactive ?? true
      }
    }
  }
  
  private async generateCodeFlow(code: string, config?: any): Promise<any> {
    // Parse code and generate flow diagram
    const lines = code.split('\n')
    const nodes: any[] = []
    const edges: any[] = []
    
    let nodeId = 1
    const functionMap = new Map<string, number>()
    
    // Extract functions and their relationships
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Function definitions
      const functionMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*[=\(]/)
      if (functionMatch) {
        const funcName = functionMatch[1]
        const node = {
          id: nodeId.toString(),
          label: funcName,
          type: 'function',
          line: i + 1,
          color: this.getColorByType('function', config?.colorScheme)
        }
        nodes.push(node)
        functionMap.set(funcName, nodeId)
        nodeId++
      }
      
      // Function calls
      const callMatch = line.match(/(\w+)\s*\(/)
      if (callMatch && functionMap.has(callMatch[1])) {
        const calledFunc = callMatch[1]
        const callerFunc = this.findCurrentFunction(lines, i)
        if (callerFunc && functionMap.has(callerFunc)) {
          edges.push({
            from: functionMap.get(callerFunc)!.toString(),
            to: functionMap.get(calledFunc)!.toString(),
            type: 'call',
            line: i + 1
          })
        }
      }
    }
    
    return {
      nodes,
      edges,
      layout: config?.layout || 'hierarchical',
      metadata: {
        totalFunctions: nodes.length,
        totalCalls: edges.length,
        complexity: this.calculateComplexity(nodes.length, edges.length)
      }
    }
  }
  
  private async generateDependencyGraph(dependencies: any, config?: any): Promise<any> {
    const nodes: any[] = []
    const edges: any[] = []
    
    // Create nodes for dependencies
    Object.entries(dependencies).forEach(([name, version], index) => {
      nodes.push({
        id: index.toString(),
        label: name,
        type: 'dependency',
        version: version,
        color: this.getColorByType('dependency', config?.colorScheme),
        size: this.calculateDependencySize(name, version)
      })
    })
    
    // Create edges based on dependency relationships
    // This is a simplified version - in reality, you'd parse package.json or similar
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (this.hasDependency(nodes[i].label, nodes[j].label)) {
          edges.push({
            from: i.toString(),
            to: j.toString(),
            type: 'depends-on',
            weight: 1
          })
        }
      }
    }
    
    return {
      nodes,
      edges,
      layout: config?.layout || 'force-directed',
      metadata: {
        totalDependencies: nodes.length,
        totalRelationships: edges.length,
        circularDependencies: this.findCircularDependencies(nodes, edges)
      }
    }
  }
  
  private async generateSecurityAnalysis(securityData: any, config?: any): Promise<any> {
    const vulnerabilities = securityData.vulnerabilities || []
    const nodes: any[] = []
    const edges: any[] = []
    
    // Create nodes for different vulnerability types
    const vulnTypes = [...new Set(vulnerabilities.map((v: any) => v.type))]
    vulnTypes.forEach((type, index) => {
      const vulnsOfType = vulnerabilities.filter((v: any) => v.type === type)
      nodes.push({
        id: index.toString(),
        label: type,
        type: 'vulnerability',
        count: vulnsOfType.length,
        severity: this.getHighestSeverity(vulnsOfType),
        color: this.getSeverityColor(this.getHighestSeverity(vulnsOfType)),
        size: vulnsOfType.length * 10
      })
    })
    
    // Add security score node
    nodes.push({
      id: 'security-score',
      label: 'Security Score',
      type: 'metric',
      value: securityData.securityScore || 0,
      color: this.getScoreColor(securityData.securityScore || 0),
      size: 50
    })
    
    return {
      nodes,
      edges,
      layout: config?.layout || 'circular',
      metadata: {
        totalVulnerabilities: vulnerabilities.length,
        securityScore: securityData.securityScore || 0,
        riskLevel: this.calculateRiskLevel(vulnerabilities),
        recommendations: this.generateSecurityRecommendations(vulnerabilities)
      }
    }
  }
  
  private async generatePerformanceMetrics(metrics: any, config?: any): Promise<any> {
    const nodes: any[] = []
    const edges: any[] = []
    
    // Create nodes for different metrics
    Object.entries(metrics).forEach(([metric, value], index) => {
      nodes.push({
        id: index.toString(),
        label: metric,
        type: 'metric',
        value: value,
        color: this.getPerformanceColor(metric, value),
        size: this.calculateMetricSize(value)
      })
    })
    
    return {
      nodes,
      edges,
      layout: config?.layout || 'grid',
      metadata: {
        totalMetrics: nodes.length,
        averagePerformance: this.calculateAveragePerformance(metrics),
        bottlenecks: this.identifyBottlenecks(metrics)
      }
    }
  }
  
  private async generateFileTree(files: any, config?: any): Promise<any> {
    const nodes: any[] = []
    const edges: any[] = []
    
    const processFile = (file: any, parentId: string | null = null, depth = 0) => {
      const nodeId = `file-${file.id}`
      nodes.push({
        id: nodeId,
        label: file.name,
        type: file.type,
        size: file.size || 0,
        color: this.getFileTypeColor(file.type, file.language),
        depth,
        metadata: file.metadata
      })
      
      if (parentId) {
        edges.push({
          from: parentId,
          to: nodeId,
          type: 'contains'
        })
      }
      
      if (file.children) {
        file.children.forEach((child: any) => processFile(child, nodeId, depth + 1))
      }
    }
    
    files.forEach((file: any) => processFile(file))
    
    return {
      nodes,
      edges,
      layout: config?.layout || 'hierarchical',
      metadata: {
        totalFiles: nodes.filter(n => n.type === 'file').length,
        totalFolders: nodes.filter(n => n.type === 'folder').length,
        maxDepth: Math.max(...nodes.map(n => n.depth))
      }
    }
  }
  
  private async generateArchitectureDiagram(components: any, config?: any): Promise<any> {
    const nodes: any[] = []
    const edges: any[] = []
    
    // Create nodes for different architectural components
    const componentTypes = ['frontend', 'backend', 'database', 'api', 'service', 'middleware']
    
    componentTypes.forEach((type, index) => {
      const componentsOfType = components.filter((c: any) => c.type === type)
      if (componentsOfType.length > 0) {
        nodes.push({
          id: index.toString(),
          label: type.charAt(0).toUpperCase() + type.slice(1),
          type: 'component',
          count: componentsOfType.length,
          color: this.getComponentColor(type),
          size: componentsOfType.length * 20
        })
      }
    })
    
    // Create edges based on component relationships
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (this.hasArchitecturalRelationship(nodes[i].label, nodes[j].label)) {
          edges.push({
            from: i.toString(),
            to: j.toString(),
            type: 'communicates-with',
            weight: 2
          })
        }
      }
    }
    
    return {
      nodes,
      edges,
      layout: config?.layout || 'hierarchical',
      metadata: {
        totalComponents: nodes.length,
        totalConnections: edges.length,
        architectureType: this.determineArchitectureType(nodes, edges)
      }
    }
  }
  
  private async generateDataFlow(data: any, config?: any): Promise<any> {
    // Implementation for data flow visualization
    return {
      nodes: [],
      edges: [],
      layout: config?.layout || 'hierarchical',
      metadata: {}
    }
  }
  
  private async generateComponentHierarchy(components: any, config?: any): Promise<any> {
    // Implementation for component hierarchy visualization
    return {
      nodes: [],
      edges: [],
      layout: config?.layout || 'hierarchical',
      metadata: {}
    }
  }
  
  private async generateApiEndpoints(endpoints: any, config?: any): Promise<any> {
    // Implementation for API endpoints visualization
    return {
      nodes: [],
      edges: [],
      layout: config?.layout || 'hierarchical',
      metadata: {}
    }
  }
  
  private async generateDatabaseSchema(schema: any, config?: any): Promise<any> {
    // Implementation for database schema visualization
    return {
      nodes: [],
      edges: [],
      layout: config?.layout || 'hierarchical',
      metadata: {}
    }
  }
  
  // Helper methods
  private generateTitle(type: string, context?: any): string {
    const titles: Record<string, string> = {
      'code-flow': 'Code Flow Analysis',
      'dependency-graph': 'Dependency Graph',
      'security-analysis': 'Security Analysis',
      'performance-metrics': 'Performance Metrics',
      'file-tree': 'File System Structure',
      'architecture-diagram': 'System Architecture',
      'data-flow': 'Data Flow Diagram',
      'component-hierarchy': 'Component Hierarchy',
      'api-endpoints': 'API Endpoints',
      'database-schema': 'Database Schema'
    }
    
    let title = titles[type] || 'Visualization'
    
    if (context?.framework) {
      title += ` - ${context.framework}`
    }
    
    return title
  }
  
  private countDataPoints(data: any): number {
    if (data.nodes && Array.isArray(data.nodes)) {
      return data.nodes.length
    }
    return 0
  }
  
  private getColorByType(type: string, colorScheme?: string): string {
    const colorSchemes: Record<string, Record<string, string>> = {
      default: {
        function: '#3B82F6',
        dependency: '#10B981',
        vulnerability: '#EF4444',
        metric: '#8B5CF6',
        file: '#6B7280',
        folder: '#F59E0B'
      },
      security: {
        function: '#1F2937',
        dependency: '#374151',
        vulnerability: '#DC2626',
        metric: '#059669',
        file: '#4B5563',
        folder: '#7C2D12'
      },
      performance: {
        function: '#1E40AF',
        dependency: '#0D9488',
        vulnerability: '#DC2626',
        metric: '#7C3AED',
        file: '#475569',
        folder: '#D97706'
      },
      quality: {
        function: '#059669',
        dependency: '#0891B2',
        vulnerability: '#DC2626',
        metric: '#7C2D12',
        file: '#4B5563',
        folder: '#CA8A04'
      }
    }
    
    const scheme = colorSchemes[colorScheme || 'default'] || colorSchemes.default
    return scheme[type] || '#6B7280'
  }
  
  private getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626'
    }
    return colors[severity] || '#6B7280'
  }
  
  private getScoreColor(score: number): string {
    if (score >= 80) return '#10B981'
    if (score >= 60) return '#F59E0B'
    if (score >= 40) return '#EF4444'
    return '#DC2626'
  }
  
  private getPerformanceColor(metric: string, value: any): string {
    // Simple performance color coding
    if (typeof value === 'number') {
      if (value < 100) return '#10B981' // Good
      if (value < 500) return '#F59E0B' // Warning
      return '#EF4444' // Poor
    }
    return '#6B7280'
  }
  
  private getFileTypeColor(type: string, language?: string): string {
    if (type === 'folder') return '#F59E0B'
    
    const languageColors: Record<string, string> = {
      typescript: '#3178C6',
      javascript: '#F7DF1E',
      python: '#3776AB',
      java: '#ED8B00',
      go: '#00ADD8',
      rust: '#DEA584',
      html: '#E34F26',
      css: '#1572B6',
      json: '#000000'
    }
    
    return languageColors[language || ''] || '#6B7280'
  }
  
  private getComponentColor(type: string): string {
    const colors: Record<string, string> = {
      frontend: '#3B82F6',
      backend: '#10B981',
      database: '#8B5CF6',
      api: '#F59E0B',
      service: '#EF4444',
      middleware: '#6B7280'
    }
    return colors[type] || '#6B7280'
  }
  
  private calculateComplexity(functions: number, calls: number): string {
    const ratio = calls / functions
    if (ratio < 2) return 'low'
    if (ratio < 5) return 'medium'
    return 'high'
  }
  
  private calculateDependencySize(name: string, version: any): number {
    // Simple size calculation based on name length and version
    return Math.min(50, Math.max(10, name.length * 2))
  }
  
  private hasDependency(dep1: string, dep2: string): boolean {
    // Simplified dependency relationship detection
    const commonDeps = ['react', 'next', 'typescript', 'node']
    return commonDeps.some(dep => dep1.includes(dep) || dep2.includes(dep))
  }
  
  private findCircularDependencies(nodes: any[], edges: any[]): string[] {
    // Simplified circular dependency detection
    return []
  }
  
  private getHighestSeverity(vulnerabilities: any[]): string {
    const severities = ['low', 'medium', 'high', 'critical']
    const highest = vulnerabilities.reduce((max, vuln) => {
      const currentIndex = severities.indexOf(vuln.severity)
      const maxIndex = severities.indexOf(max)
      return currentIndex > maxIndex ? vuln.severity : max
    }, 'low')
    return highest
  }
  
  private calculateRiskLevel(vulnerabilities: any[]): string {
    const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length
    
    if (criticalCount > 0) return 'critical'
    if (highCount > 2) return 'high'
    if (vulnerabilities.length > 5) return 'medium'
    return 'low'
  }
  
  private generateSecurityRecommendations(vulnerabilities: any[]): string[] {
    const recommendations: string[] = []
    
    if (vulnerabilities.some(v => v.type === 'xss')) {
      recommendations.push('Implement proper input sanitization and output encoding')
    }
    
    if (vulnerabilities.some(v => v.type === 'sql-injection')) {
      recommendations.push('Use parameterized queries and prepared statements')
    }
    
    if (vulnerabilities.some(v => v.type === 'csrf')) {
      recommendations.push('Implement CSRF tokens and same-site cookies')
    }
    
    return recommendations
  }
  
  private calculateMetricSize(value: any): number {
    if (typeof value === 'number') {
      return Math.min(50, Math.max(10, value / 10))
    }
    return 20
  }
  
  private calculateAveragePerformance(metrics: any): number {
    const values = Object.values(metrics).filter(v => typeof v === 'number') as number[]
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }
  
  private identifyBottlenecks(metrics: any): string[] {
    const bottlenecks: string[] = []
    
    Object.entries(metrics).forEach(([metric, value]) => {
      if (typeof value === 'number') {
        if (metric.toLowerCase().includes('time') && value > 1000) {
          bottlenecks.push(`${metric} is too high: ${value}ms`)
        }
        if (metric.toLowerCase().includes('memory') && value > 100) {
          bottlenecks.push(`${metric} usage is high: ${value}MB`)
        }
      }
    })
    
    return bottlenecks
  }
  
  private hasArchitecturalRelationship(comp1: string, comp2: string): boolean {
    const relationships: Record<string, string[]> = {
      'Frontend': ['Backend', 'Api'],
      'Backend': ['Database', 'Api', 'Service'],
      'Database': ['Backend'],
      'Api': ['Frontend', 'Backend'],
      'Service': ['Backend', 'Api'],
      'Middleware': ['Backend', 'Api']
    }
    
    return relationships[comp1]?.includes(comp2) || relationships[comp2]?.includes(comp1) || false
  }
  
  private determineArchitectureType(nodes: any[], edges: any[]): string {
    if (edges.length === 0) return 'monolithic'
    if (nodes.length > 5) return 'microservices'
    return 'layered'
  }
  
  private findCurrentFunction(lines: string[], lineIndex: number): string | null {
    // Find the function that contains the given line
    for (let i = lineIndex; i >= 0; i--) {
      const line = lines[i].trim()
      const functionMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*[=\(]/)
      if (functionMatch) {
        return functionMatch[1]
      }
    }
    return null
  }
}

const vizEngine = new VisualizationEngine()

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let body
    try {
      body = await request.json()
    } catch (error) {
      SecureLogger.logSecurityEvent('invalid_json', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip,
        userAgent
      }, ip, userAgent)
      
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400, headers: SecurityHeaders.getHeaders() }
      )
    }

    const validationResult = VisualizationRequestSchema.safeParse(body)
    if (!validationResult.success) {
      SecureLogger.logSecurityEvent('validation_failed', {
        errors: validationResult.error.errors,
        ip,
        userAgent
      }, ip, userAgent)
      
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400, headers: SecurityHeaders.getHeaders() }
      )
    }

    const result = await vizEngine.generateVisualization({
      type: validationResult.data.type,
      data: validationResult.data.data,
      config: validationResult.data.config
    })
    const processingTime = Date.now() - startTime

    SecureLogger.logSecurityEvent('visualization_generated', {
      type: result.type,
      complexity: result.metadata.complexity,
      dataPoints: result.metadata.dataPoints,
      processingTime,
      ip,
      userAgent
    }, ip, userAgent)

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        requestId,
        processingTime,
        timestamp: new Date().toISOString()
      }
    }, { headers: SecurityHeaders.getHeaders() })

  } catch (error) {
    const processingTime = Date.now() - startTime
    
    SecureLogger.logError(error as Error, {
      requestId,
      processingTime,
      operation: 'visualization'
    }, request.headers.get('x-forwarded-for') || 'unknown')

    return NextResponse.json(
      { 
        error: 'Internal server error',
        requestId,
        processingTime
      },
      { status: 500, headers: SecurityHeaders.getHeaders() }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    
    const availableTypes = [
      'code-flow',
      'dependency-graph', 
      'security-analysis',
      'performance-metrics',
      'file-tree',
      'architecture-diagram',
      'data-flow',
      'component-hierarchy',
      'api-endpoints',
      'database-schema'
    ]

    return NextResponse.json({
      success: true,
      data: {
        availableTypes,
        supportedFormats: ['json', 'svg', 'png'],
        features: [
          'interactive',
          'animated',
          'themes',
          'layouts',
          'color-schemes'
        ]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }, { headers: SecurityHeaders.getHeaders() })

  } catch (error) {
    SecureLogger.logError(error as Error, {
      operation: 'visualization_info'
    }, request.headers.get('x-forwarded-for') || 'unknown')

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SecurityHeaders.getHeaders() }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...SecurityHeaders.getHeaders(),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}
