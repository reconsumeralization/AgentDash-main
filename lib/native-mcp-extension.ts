/**
 * 🚀 NATIVE MCP EXTENSION SYSTEM
 * Lightweight MCP-like capabilities without full server deployment
 * Extends Gemini capabilities through native extensions
 */

export interface MCPExtensionConfig {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: 'algorithm' | 'data-processing' | 'utility' | 'integration' | 'security'
  capabilities: string[]
  dependencies?: string[]
  permissions: {
    fileSystem: boolean
    network: boolean
    database: boolean
    environment: boolean
  }
  settings: Record<string, any>
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
  outputSchema: {
    type: 'object'
    properties: Record<string, any>
  }
  execute: (params: any, context: MCPExecutionContext) => Promise<any>
}

export interface MCPExecutionContext {
  userId: string
  sessionId: string
  requestId: string
  permissions: string[]
  environment: 'development' | 'staging' | 'production'
  metadata: Record<string, any>
}

export interface MCPExtensionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  executionTime: number
  memoryUsage: number
  toolName: string
  timestamp: string
}

export abstract class BaseMCPExtension {
  protected config: MCPExtensionConfig
  protected tools: Map<string, MCPTool> = new Map()
  protected isInitialized: boolean = false

  constructor(config: MCPExtensionConfig) {
    this.config = config
    this.initializeTools()
  }

  // Abstract methods to be implemented by extensions
  abstract initializeTools(): void
  abstract validatePermissions(context: MCPExecutionContext): boolean
  abstract getCapabilities(): string[]

  // Core extension methods
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.onInitialize()
      this.isInitialized = true
      console.log(`✅ MCP Extension initialized: ${this.config.name}`)
    } catch (error) {
      console.error(`❌ Failed to initialize MCP Extension: ${this.config.name}`, error)
      throw error
    }
  }

  async executeTool(toolName: string, params: any, context: MCPExecutionContext): Promise<MCPExtensionResult> {
    const startTime = Date.now()
    const startMemory = process.memoryUsage().heapUsed

    try {
      // Validate permissions
      if (!this.validatePermissions(context)) {
        throw new Error(`Insufficient permissions for tool: ${toolName}`)
      }

      // Get tool
      const tool = this.tools.get(toolName)
      if (!tool) {
        throw new Error(`Tool not found: ${toolName}`)
      }

      // Validate input
      this.validateInput(params, tool.inputSchema)

      // Execute tool
      const result = await tool.execute(params, context)

      // Validate output
      this.validateOutput(result, tool.outputSchema)

      const executionTime = Date.now() - startTime
      const memoryUsage = process.memoryUsage().heapUsed - startMemory

      return {
        success: true,
        data: result,
        executionTime,
        memoryUsage,
        toolName,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      const memoryUsage = process.memoryUsage().heapUsed - startMemory

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
        memoryUsage,
        toolName,
        timestamp: new Date().toISOString()
      }
    }
  }

  getTool(toolName: string): MCPTool | undefined {
    return this.tools.get(toolName)
  }

  getAllTools(): MCPTool[] {
    return Array.from(this.tools.values())
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys())
  }

  // Utility methods
  protected addTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool)
  }

  protected validateInput(params: any, schema: any): void {
    // Basic validation - in production, use a proper validator like Ajv
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in params)) {
          throw new Error(`Required field missing: ${field}`)
        }
      }
    }
  }

  protected validateOutput(result: any, schema: any): void {
    // Basic output validation
    if (schema.type === 'object' && typeof result !== 'object') {
      throw new Error('Output does not match expected schema type')
    }
  }

  // Lifecycle hooks
  protected async onInitialize(): Promise<void> {
    // Override in subclasses for custom initialization
  }

  async onDestroy(): Promise<void> {
    // Override in subclasses for cleanup
    this.isInitialized = false
  }

  // Configuration methods
  updateSettings(settings: Record<string, any>): void {
    this.config.settings = { ...this.config.settings, ...settings }
  }

  getSettings(): Record<string, any> {
    return { ...this.config.settings }
  }

  // Status and health
  getStatus(): {
    initialized: boolean
    toolCount: number
    capabilities: string[]
    config: MCPExtensionConfig
  } {
    return {
      initialized: this.isInitialized,
      toolCount: this.tools.size,
      capabilities: this.getCapabilities(),
      config: this.config
    }
  }
}

/**
 * 🧮 ALGORITHMIC EXTENSION
 * Provides algorithmic tools like the skew heap implementation
 */
export class AlgorithmicMCPExtension extends BaseMCPExtension {
  constructor() {
    super({
      id: 'algorithmic-tools',
      name: 'Algorithmic Tools',
      version: '1.0.0',
      description: 'Provides algorithmic tools and data structures',
      author: 'AgentDash',
      category: 'algorithm',
      capabilities: ['tree-operations', 'sorting', 'searching', 'graph-algorithms'],
      permissions: {
        fileSystem: false,
        network: false,
        database: false,
        environment: false
      },
      settings: {
        maxExecutionTime: 5000,
        memoryLimit: 100 * 1024 * 1024 // 100MB
      }
    })
  }

  initializeTools(): void {
    // Skew Heap Operations
    this.addTool({
      name: 'skew_heap_operations',
      description: 'Perform operations on skew heaps including insertion reversal',
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['find_candidates', 'reverse_insertion', 'validate_structure'],
            description: 'The operation to perform'
          },
          tree: {
            type: 'object',
            description: 'Tree structure with nodes containing L, R, P properties'
          },
          nodeId: {
            type: 'number',
            description: 'Node ID for operations that require it'
          }
        },
        required: ['operation', 'tree']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            description: 'Operation result'
          },
          candidates: {
            type: 'array',
            items: { type: 'number' },
            description: 'Candidate nodes (for find_candidates operation)'
          },
          newRoot: {
            type: 'number',
            description: 'New root after operation'
          }
        }
      },
      execute: async (params, context) => {
        return this.executeSkewHeapOperation(params)
      }
    })

    // Sorting Algorithms
    this.addTool({
      name: 'sort_array',
      description: 'Sort an array using various algorithms',
      inputSchema: {
        type: 'object',
        properties: {
          array: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array to sort'
          },
          algorithm: {
            type: 'string',
            enum: ['quicksort', 'mergesort', 'heapsort', 'insertionsort'],
            description: 'Sorting algorithm to use'
          }
        },
        required: ['array', 'algorithm']
      },
      outputSchema: {
        type: 'object',
        properties: {
          sortedArray: {
            type: 'array',
            items: { type: 'number' }
          },
          comparisons: {
            type: 'number',
            description: 'Number of comparisons made'
          },
          swaps: {
            type: 'number',
            description: 'Number of swaps made'
          }
        }
      },
      execute: async (params, context) => {
        return this.executeSorting(params)
      }
    })

    // Graph Algorithms
    this.addTool({
      name: 'graph_shortest_path',
      description: 'Find shortest path in a graph using Dijkstra or BFS',
      inputSchema: {
        type: 'object',
        properties: {
          graph: {
            type: 'object',
            description: 'Graph representation (adjacency list)'
          },
          start: {
            type: 'string',
            description: 'Start node'
          },
          end: {
            type: 'string',
            description: 'End node'
          },
          algorithm: {
            type: 'string',
            enum: ['dijkstra', 'bfs', 'dfs'],
            description: 'Algorithm to use'
          }
        },
        required: ['graph', 'start', 'end', 'algorithm']
      },
      outputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'array',
            items: { type: 'string' }
          },
          distance: {
            type: 'number'
          },
          visited: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      execute: async (params, context) => {
        return this.executeGraphAlgorithm(params)
      }
    })
  }

  validatePermissions(context: MCPExecutionContext): boolean {
    // Algorithmic tools don't need special permissions
    return true
  }

  getCapabilities(): string[] {
    return this.config.capabilities
  }

  // Algorithm implementations
  private executeSkewHeapOperation(params: any): any {
    const { operation, tree, nodeId } = params

    switch (operation) {
      case 'find_candidates':
        return this.findCandidates(tree)
      case 'reverse_insertion':
        return this.reverseInsertion(tree, nodeId)
      case 'validate_structure':
        return this.validateSkewHeapStructure(tree)
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }

  private findCandidates(tree: any): any {
    // Implementation of the skew heap candidate finding algorithm
    // This would contain the C++ logic translated to TypeScript
    const candidates: number[] = []
    
    // Find vk - highest node on left spine without right child
    let vk = 0
    let curr = tree.root || 1
    
    while (curr && tree.nodes[curr]) {
      if (!tree.nodes[curr].R) {
        vk = curr
        break
      }
      curr = tree.nodes[curr].L
    }

    if (vk === 0) {
      return { candidates: [], result: 'No candidates found' }
    }

    candidates.push(vk)

    // Check v_{k+1} (left child of vk)
    const vkPlus1 = tree.nodes[vk]?.L
    if (vkPlus1 && !tree.nodes[vkPlus1]?.L && !tree.nodes[vkPlus1]?.R) {
      candidates.push(vkPlus1)
    }

    return { candidates, result: 'Candidates found successfully' }
  }

  private reverseInsertion(tree: any, nodeId: number): any {
    // Implementation of the skew heap insertion reversal
    if (!tree.nodes[nodeId]) {
      throw new Error(`Node ${nodeId} not found`)
    }

    const node = tree.nodes[nodeId]
    const w = node.L
    const px = node.P

    // Remove x, promote w
    if (px === 0) {
      tree.root = w
      if (w) tree.nodes[w].P = 0
    } else {
      tree.nodes[px].L = w
      if (w) tree.nodes[w].P = px
    }

    // Clear x's connections
    tree.nodes[nodeId] = { L: 0, R: 0, P: 0 }

    // Swap children along path from px to root
    let curr = px
    while (curr !== 0) {
      const temp = tree.nodes[curr].L
      tree.nodes[curr].L = tree.nodes[curr].R
      tree.nodes[curr].R = temp
      curr = tree.nodes[curr].P
    }

    return { 
      newRoot: tree.root, 
      result: 'Insertion reversed successfully',
      modifiedTree: tree
    }
  }

  private validateSkewHeapStructure(tree: any): any {
    // Validate that the tree structure is a valid skew heap
    const errors: string[] = []
    
    // Check basic tree properties
    for (const [nodeId, node] of Object.entries(tree.nodes)) {
      if (node.L && !tree.nodes[node.L]) {
        errors.push(`Node ${nodeId} has invalid left child`)
      }
      if (node.R && !tree.nodes[node.R]) {
        errors.push(`Node ${nodeId} has invalid right child`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      result: errors.length === 0 ? 'Valid skew heap structure' : 'Invalid structure found'
    }
  }

  private executeSorting(params: any): any {
    const { array, algorithm } = params
    let comparisons = 0
    let swaps = 0

    const sortedArray = [...array]

    switch (algorithm) {
      case 'quicksort':
        ({ comparisons, swaps } = this.quickSort(sortedArray, 0, sortedArray.length - 1))
        break
      case 'mergesort':
        ({ comparisons, swaps } = this.mergeSort(sortedArray))
        break
      case 'heapsort':
        ({ comparisons, swaps } = this.heapSort(sortedArray))
        break
      case 'insertionsort':
        ({ comparisons, swaps } = this.insertionSort(sortedArray))
        break
      default:
        throw new Error(`Unknown sorting algorithm: ${algorithm}`)
    }

    return {
      sortedArray,
      comparisons,
      swaps,
      algorithm
    }
  }

  private quickSort(arr: number[], low: number, high: number): { comparisons: number; swaps: number } {
    let comparisons = 0
    let swaps = 0

    if (low < high) {
      const pivotIndex = this.partition(arr, low, high, comparisons, swaps)
      const left = this.quickSort(arr, low, pivotIndex - 1)
      const right = this.quickSort(arr, pivotIndex + 1, high)
      
      comparisons += left.comparisons + right.comparisons
      swaps += left.swaps + right.swaps
    }

    return { comparisons, swaps }
  }

  private partition(arr: number[], low: number, high: number, comparisons: number, swaps: number): number {
    const pivot = arr[high]
    let i = low - 1

    for (let j = low; j < high; j++) {
      comparisons++
      if (arr[j] <= pivot) {
        i++
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]]
          swaps++
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    swaps++

    return i + 1
  }

  private mergeSort(arr: number[]): { comparisons: number; swaps: number } {
    let comparisons = 0
    let swaps = 0

    if (arr.length <= 1) {
      return { comparisons, swaps }
    }

    const mid = Math.floor(arr.length / 2)
    const left = arr.slice(0, mid)
    const right = arr.slice(mid)

    const leftResult = this.mergeSort(left)
    const rightResult = this.mergeSort(right)

    comparisons += leftResult.comparisons + rightResult.comparisons
    swaps += leftResult.swaps + rightResult.swaps

    const merged = this.merge(left, right, comparisons, swaps)
    arr.splice(0, arr.length, ...merged)

    return { comparisons, swaps }
  }

  private merge(left: number[], right: number[], comparisons: number, swaps: number): number[] {
    const result: number[] = []
    let i = 0, j = 0

    while (i < left.length && j < right.length) {
      comparisons++
      if (left[i] <= right[j]) {
        result.push(left[i])
        i++
      } else {
        result.push(right[j])
        j++
      }
    }

    return result.concat(left.slice(i)).concat(right.slice(j))
  }

  private heapSort(arr: number[]): { comparisons: number; swaps: number } {
    let comparisons = 0
    let swaps = 0

    // Build max heap
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      this.heapify(arr, arr.length, i, comparisons, swaps)
    }

    // Extract elements from heap
    for (let i = arr.length - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]]
      swaps++
      this.heapify(arr, i, 0, comparisons, swaps)
    }

    return { comparisons, swaps }
  }

  private heapify(arr: number[], n: number, i: number, comparisons: number, swaps: number): void {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2

    if (left < n) {
      comparisons++
      if (arr[left] > arr[largest]) {
        largest = left
      }
    }

    if (right < n) {
      comparisons++
      if (arr[right] > arr[largest]) {
        largest = right
      }
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]]
      swaps++
      this.heapify(arr, n, largest, comparisons, swaps)
    }
  }

  private insertionSort(arr: number[]): { comparisons: number; swaps: number } {
    let comparisons = 0
    let swaps = 0

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i]
      let j = i - 1

      while (j >= 0) {
        comparisons++
        if (arr[j] > key) {
          arr[j + 1] = arr[j]
          swaps++
          j--
        } else {
          break
        }
      }

      arr[j + 1] = key
    }

    return { comparisons, swaps }
  }

  private executeGraphAlgorithm(params: any): any {
    const { graph, start, end, algorithm } = params

    switch (algorithm) {
      case 'dijkstra':
        return this.dijkstra(graph, start, end)
      case 'bfs':
        return this.bfs(graph, start, end)
      case 'dfs':
        return this.dfs(graph, start, end)
      default:
        throw new Error(`Unknown graph algorithm: ${algorithm}`)
    }
  }

  private dijkstra(graph: any, start: string, end: string): any {
    const distances: Record<string, number> = {}
    const previous: Record<string, string | null> = {}
    const visited = new Set<string>()
    const queue: Array<{ node: string; distance: number }> = []

    // Initialize distances
    for (const node in graph) {
      distances[node] = node === start ? 0 : Infinity
      previous[node] = null
    }

    queue.push({ node: start, distance: 0 })

    while (queue.length > 0) {
      queue.sort((a, b) => a.distance - b.distance)
      const { node, distance } = queue.shift()!

      if (visited.has(node)) continue
      visited.add(node)

      if (node === end) break

      for (const neighbor in graph[node]) {
        const newDistance = distance + graph[node][neighbor]
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance
          previous[neighbor] = node
          queue.push({ node: neighbor, distance: newDistance })
        }
      }
    }

    // Reconstruct path
    const path: string[] = []
    let current = end
    while (current !== null) {
      path.unshift(current)
      current = previous[current]!
    }

    return {
      path: path.length > 1 ? path : [],
      distance: distances[end],
      visited: Array.from(visited)
    }
  }

  private bfs(graph: any, start: string, end: string): any {
    const queue: string[] = [start]
    const visited = new Set<string>()
    const previous: Record<string, string | null> = { [start]: null }

    while (queue.length > 0) {
      const current = queue.shift()!
      visited.add(current)

      if (current === end) break

      for (const neighbor in graph[current]) {
        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          previous[neighbor] = current
          queue.push(neighbor)
        }
      }
    }

    // Reconstruct path
    const path: string[] = []
    let current = end
    while (current !== null) {
      path.unshift(current)
      current = previous[current]!
    }

    return {
      path: path.length > 1 ? path : [],
      distance: path.length - 1,
      visited: Array.from(visited)
    }
  }

  private dfs(graph: any, start: string, end: string): any {
    const visited = new Set<string>()
    const path: string[] = []

    const dfsHelper = (node: string): boolean => {
      if (node === end) {
        path.push(node)
        return true
      }

      visited.add(node)
      path.push(node)

      for (const neighbor in graph[node]) {
        if (!visited.has(neighbor)) {
          if (dfsHelper(neighbor)) {
            return true
          }
        }
      }

      path.pop()
      return false
    }

    const found = dfsHelper(start)

    return {
      path: found ? path : [],
      distance: found ? path.length - 1 : -1,
      visited: Array.from(visited)
    }
  }
}
