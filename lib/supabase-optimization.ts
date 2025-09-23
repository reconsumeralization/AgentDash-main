/**
 * Advanced Supabase Optimization and Value Maximization System
 * Comprehensive toolkit for leveraging Supabase's full potential including:
 * - Real-time subscriptions
 * - Edge functions
 * - Row Level Security (RLS)
 * - Advanced querying and indexing
 * - Vector embeddings and semantic search
 * - Storage optimization
 * - Analytics and monitoring
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import { errorHandler, ErrorCategory, ErrorSeverity } from './error-handling'
import { performanceMonitor, cache } from './performance-monitor'
import { strategicFramework, StrategicObjective, ProjectDomain } from './strategic-framework'

// ========== Advanced Supabase Configuration ==========

export interface AdvancedSupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
  realtime: {
    enabled: boolean
    heartbeatInterval: number
    reconnectDelay: number
    maxReconnectAttempts: number
  }
  storage: {
    buckets: StorageBucketConfig[]
    cdnOptimization: boolean
    imageTransformation: boolean
  }
  functions: {
    enabled: boolean
    region: string
    timeout: number
  }
  analytics: {
    enabled: boolean
    trackingEvents: string[]
    performanceMonitoring: boolean
  }
  vectorSearch: {
    enabled: boolean
    dimensions: number
    similarity: 'cosine' | 'euclidean' | 'dot_product'
  }
}

export interface StorageBucketConfig {
  name: string
  public: boolean
  allowedMimeTypes: string[]
  fileSizeLimit: number
  transformations: ImageTransformation[]
}

export interface ImageTransformation {
  name: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  resize?: 'fill' | 'fit' | 'cover'
}

// ========== Real-time Management ==========

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private subscriptions: Map<string, RealtimeSubscription> = new Map()
  private client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
    this.setupGlobalHandlers()
  }

  /**
   * Subscribe to real-time updates for strategic objectives
   */
  async subscribeToObjectives(
    userId: string,
    callback: (payload: RealtimePayload<StrategicObjective>) => void
  ): Promise<string> {
    const subscriptionId = `objectives_${userId}_${Date.now()}`

    try {
      const channel = this.client
        .channel(`objectives:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'strategic_objectives',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const perfLogger = performanceMonitor.createPerformanceLogger('realtime_objective_update')

            try {
              callback(payload as RealtimePayload<StrategicObjective>)
              perfLogger.finish({ event: payload.eventType, table: 'strategic_objectives' })
            } catch (error) {
              perfLogger.error(error as Error)
              errorHandler.logError(error as Error, {
                category: ErrorCategory.API,
                severity: ErrorSeverity.MEDIUM,
                context: { subscriptionId, userId, event: payload.eventType }
              })
            }
          }
        )
        .subscribe()

      this.channels.set(subscriptionId, channel)
      this.subscriptions.set(subscriptionId, {
        id: subscriptionId,
        channelName: `objectives:${userId}`,
        table: 'strategic_objectives',
        userId,
        createdAt: new Date(),
        isActive: true
      })

      return subscriptionId
    } catch (error) {
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
        context: { operation: 'subscribeToObjectives', userId }
      })
      throw error
    }
  }

  /**
   * Subscribe to agent activity updates
   */
  async subscribeToAgentActivity(
    agentId: string,
    callback: (payload: RealtimePayload<AgentActivity>) => void
  ): Promise<string> {
    const subscriptionId = `agent_${agentId}_${Date.now()}`

    const channel = this.client
      .channel(`agent_activity:${agentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_activities',
          filter: `agent_id=eq.${agentId}`
        },
        callback as any
      )
      .subscribe()

    this.channels.set(subscriptionId, channel)
    return subscriptionId
  }

  /**
   * Subscribe to workflow execution updates
   */
  async subscribeToWorkflowExecution(
    workflowId: string,
    callback: (payload: RealtimePayload<WorkflowExecution>) => void
  ): Promise<string> {
    const subscriptionId = `workflow_${workflowId}_${Date.now()}`

    const channel = this.client
      .channel(`workflow_execution:${workflowId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions',
          filter: `workflow_id=eq.${workflowId}`
        },
        callback as any
      )
      .subscribe()

    this.channels.set(subscriptionId, channel)
    return subscriptionId
  }

  /**
   * Unsubscribe from real-time updates
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const channel = this.channels.get(subscriptionId)
    if (channel) {
      await this.client.removeChannel(channel)
      this.channels.delete(subscriptionId)
      this.subscriptions.delete(subscriptionId)
    }
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): RealtimeSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.isActive)
  }

  /**
   * Setup global real-time error handlers
   */
  private setupGlobalHandlers(): void {
    this.client.realtime.onOpen(() => {
      errorHandler.log('info', 'Realtime connection opened', {
        category: 'realtime',
        data: { connectionId: this.client.realtime.accessToken }
      })
    })

    this.client.realtime.onClose(() => {
      errorHandler.log('warn', 'Realtime connection closed', {
        category: 'realtime'
      })
    })

    this.client.realtime.onError((error) => {
      errorHandler.logError(error as Error, {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        context: { source: 'realtime_connection' }
      })
    })
  }
}

// ========== Vector Search and Embeddings ==========

export class VectorSearchManager {
  private client: SupabaseClient
  private embeddingCache = new Map<string, number[]>()

  constructor(client: SupabaseClient) {
    this.client = client
  }

  /**
   * Store document embeddings for semantic search
   */
  async storeDocumentEmbedding(
    documentId: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content)

      await this.client
        .from('document_embeddings')
        .upsert({
          document_id: documentId,
          content,
          embedding,
          metadata,
          updated_at: new Date().toISOString()
        })

      // Cache the embedding
      this.embeddingCache.set(documentId, embedding)

      await errorHandler.log('info', `Document embedding stored: ${documentId}`, {
        category: 'vector_search',
        data: { documentId, contentLength: content.length }
      })
    } catch (error) {
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.AI,
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'storeDocumentEmbedding', documentId }
      })
      throw error
    }
  }

  /**
   * Perform semantic search
   */
  async semanticSearch(
    query: string,
    options: {
      limit?: number
      threshold?: number
      filter?: Record<string, any>
      includeMetadata?: boolean
    } = {}
  ): Promise<SemanticSearchResult[]> {
    const perfLogger = performanceMonitor.createPerformanceLogger('semantic_search')

    try {
      const {
        limit = 10,
        threshold = 0.7,
        filter = {},
        includeMetadata = true
      } = options

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query)

      // Build the RPC call for similarity search
      let rpcCall = this.client.rpc('semantic_search', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit
      })

      // Apply filters if provided
      if (Object.keys(filter).length > 0) {
        Object.entries(filter).forEach(([key, value]) => {
          rpcCall = rpcCall.eq(`metadata->${key}`, value)
        })
      }

      const { data, error } = await rpcCall

      if (error) throw error

      const results: SemanticSearchResult[] = data.map((item: any) => ({
        documentId: item.document_id,
        content: item.content,
        similarity: item.similarity,
        metadata: includeMetadata ? item.metadata : undefined
      }))

      await perfLogger.finish({
        queryLength: query.length,
        resultsCount: results.length,
        threshold,
        hasFilters: Object.keys(filter).length > 0
      })

      return results
    } catch (error) {
      await perfLogger.error(error as Error, { query: query.substring(0, 100) })
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.AI,
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'semanticSearch', queryLength: query.length }
      })
      throw error
    }
  }

  /**
   * Find similar objectives using vector search
   */
  async findSimilarObjectives(
    objectiveId: string,
    limit: number = 5
  ): Promise<StrategicObjective[]> {
    try {
      // Get the current objective's embedding
      const { data: currentObjective } = await this.client
        .from('strategic_objectives')
        .select('description, embedding')
        .eq('id', objectiveId)
        .single()

      if (!currentObjective?.embedding) {
        throw new Error('Objective embedding not found')
      }

      // Find similar objectives using cosine similarity
      const { data: similarObjectives } = await this.client.rpc('find_similar_objectives', {
        target_embedding: currentObjective.embedding,
        match_count: limit,
        exclude_id: objectiveId
      })

      return similarObjectives || []
    } catch (error) {
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.AI,
        severity: ErrorSeverity.LOW,
        context: { operation: 'findSimilarObjectives', objectiveId }
      })
      return []
    }
  }

  /**
   * Generate embedding for text (placeholder - integrate with OpenAI/etc)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = `embedding:${text.substring(0, 100)}`
    const cached = cache.get<number[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // In production, integrate with OpenAI Embeddings API
      // For demo, return a mock embedding
      const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() - 0.5)

      // Cache the result for 24 hours
      cache.set(cacheKey, mockEmbedding, 24 * 60 * 60 * 1000)

      return mockEmbedding
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error}`)
    }
  }
}

// ========== Storage Optimization ==========

export class StorageManager {
  private client: SupabaseClient
  private buckets: Map<string, StorageBucketConfig> = new Map()

  constructor(client: SupabaseClient, bucketConfigs: StorageBucketConfig[]) {
    this.client = client
    bucketConfigs.forEach(config => {
      this.buckets.set(config.name, config)
    })
    this.initializeBuckets()
  }

  /**
   * Upload file with optimization
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options: {
      transform?: string
      cacheControl?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<FileUploadResult> {
    const perfLogger = performanceMonitor.createPerformanceLogger('file_upload')

    try {
      const bucketConfig = this.buckets.get(bucket)
      if (!bucketConfig) {
        throw new Error(`Bucket configuration not found: ${bucket}`)
      }

      // Validate file
      await this.validateFile(file, bucketConfig)

      // Apply transformations if needed
      const processedFile = await this.processFile(file, options.transform, bucketConfig)

      // Upload to Supabase Storage
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, processedFile, {
          cacheControl: options.cacheControl || '3600',
          upsert: true,
          metadata: options.metadata
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = this.client.storage
        .from(bucket)
        .getPublicUrl(path)

      const result: FileUploadResult = {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: urlData.publicUrl,
        size: processedFile.size,
        type: processedFile.type,
        metadata: options.metadata
      }

      await perfLogger.finish({
        bucket,
        fileSize: file.size,
        processedSize: processedFile.size,
        compressionRatio: processedFile.size / file.size
      })

      return result
    } catch (error) {
      await perfLogger.error(error as Error, { bucket, path })
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.FILE_SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'uploadFile', bucket, path }
      })
      throw error
    }
  }

  /**
   * Generate optimized image URLs
   */
  getOptimizedImageUrl(
    bucket: string,
    path: string,
    transformations: Partial<ImageTransformation>
  ): string {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path, {
        transform: {
          width: transformations.width,
          height: transformations.height,
          resize: transformations.resize || 'cover',
          format: transformations.format || 'webp',
          quality: transformations.quality || 80
        }
      })

    return data.publicUrl
  }

  /**
   * Bulk file operations
   */
  async bulkUpload(
    bucket: string,
    files: Array<{ path: string; file: File | Blob; metadata?: Record<string, any> }>
  ): Promise<FileUploadResult[]> {
    const results = await performanceMonitor.processBatch(
      files,
      async (fileData) => {
        return this.uploadFile(bucket, fileData.path, fileData.file, {
          metadata: fileData.metadata
        })
      },
      {
        batchSize: 5,
        concurrency: 3,
        onProgress: (processed, total) => {
          errorHandler.log('info', `Bulk upload progress: ${processed}/${total}`, {
            category: 'storage',
            data: { bucket, processed, total }
          })
        }
      }
    )

    return results.filter(Boolean) as FileUploadResult[]
  }

  /**
   * Initialize storage buckets
   */
  private async initializeBuckets(): Promise<void> {
    for (const [name, config] of this.buckets.entries()) {
      try {
        const { data: existingBuckets } = await this.client.storage.listBuckets()
        const bucketExists = existingBuckets?.some(b => b.name === name)

        if (!bucketExists) {
          await this.client.storage.createBucket(name, {
            public: config.public,
            allowedMimeTypes: config.allowedMimeTypes,
            fileSizeLimit: config.fileSizeLimit
          })

          await errorHandler.log('info', `Storage bucket created: ${name}`, {
            category: 'storage',
            data: { bucket: name, config }
          })
        }
      } catch (error) {
        await errorHandler.logError(error as Error, {
          category: ErrorCategory.INFRASTRUCTURE,
          severity: ErrorSeverity.MEDIUM,
          context: { operation: 'initializeBucket', bucket: name }
        })
      }
    }
  }

  private async validateFile(file: File | Blob, config: StorageBucketConfig): Promise<void> {
    if (file.size > config.fileSizeLimit) {
      throw new Error(`File size exceeds limit: ${file.size} > ${config.fileSizeLimit}`)
    }

    if (config.allowedMimeTypes.length > 0 && !config.allowedMimeTypes.includes(file.type)) {
      throw new Error(`File type not allowed: ${file.type}`)
    }
  }

  private async processFile(
    file: File | Blob,
    transformName?: string,
    config?: StorageBucketConfig
  ): Promise<File | Blob> {
    if (!transformName || !config) {
      return file
    }

    const transformation = config.transformations.find(t => t.name === transformName)
    if (!transformation) {
      return file
    }

    // Apply image transformations (would integrate with image processing library)
    // For now, return the original file
    return file
  }
}

// ========== Analytics and Monitoring ==========

export class SupabaseAnalytics {
  private client: SupabaseClient
  private eventQueue: AnalyticsEvent[] = []
  private isProcessing = false

  constructor(client: SupabaseClient) {
    this.client = client
    this.startEventProcessor()
  }

  /**
   * Track user action
   */
  async trackEvent(
    event: Omit<AnalyticsEvent, 'id' | 'timestamp'>
  ): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    }

    this.eventQueue.push(analyticsEvent)

    // Process immediately for critical events
    if (event.category === 'error' || event.category === 'security') {
      await this.processEventQueue()
    }
  }

  /**
   * Track objective progress
   */
  async trackObjectiveProgress(
    objectiveId: string,
    userId: string,
    progress: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      userId,
      category: 'objective',
      action: 'progress_update',
      label: objectiveId,
      value: progress,
      metadata: {
        objectiveId,
        previousProgress: metadata?.previousProgress,
        milestone: metadata?.milestone,
        ...metadata
      }
    })
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalyticsDashboard(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<AnalyticsDashboard> {
    const hours = timeframe === 'day' ? 24 : timeframe === 'week' ? 168 : 720
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    try {
      const [events, users, objectives] = await Promise.all([
        this.getEventMetrics(since),
        this.getUserMetrics(since),
        this.getObjectiveMetrics(since)
      ])

      return {
        timeframe,
        events,
        users,
        objectives,
        performance: await this.getPerformanceMetrics(since),
        realtime: this.getRealtimeMetrics()
      }
    } catch (error) {
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.ANALYTICS,
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'getAnalyticsDashboard', timeframe }
      })
      throw error
    }
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      const events = this.eventQueue.splice(0, 100) // Process in batches of 100

      if (events.length > 0) {
        const { error } = await this.client
          .from('analytics_events')
          .insert(events.map(event => ({
            id: event.id,
            user_id: event.userId,
            category: event.category,
            action: event.action,
            label: event.label,
            value: event.value,
            metadata: event.metadata,
            timestamp: event.timestamp.toISOString()
          })))

        if (error) {
          // Re-queue events on error
          this.eventQueue.unshift(...events)
          throw error
        }
      }
    } catch (error) {
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.ANALYTICS,
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'processEventQueue', queueSize: this.eventQueue.length }
      })
    } finally {
      this.isProcessing = false
    }
  }

  private startEventProcessor(): void {
    setInterval(() => {
      this.processEventQueue()
    }, 5000) // Process every 5 seconds
  }

  private async getEventMetrics(since: string): Promise<any> {
    const { data } = await this.client
      .from('analytics_events')
      .select('category, action, timestamp')
      .gte('timestamp', since)

    return {
      total: data?.length || 0,
      byCategory: this.groupBy(data || [], 'category'),
      byAction: this.groupBy(data || [], 'action')
    }
  }

  private async getUserMetrics(since: string): Promise<any> {
    const { data } = await this.client
      .from('analytics_events')
      .select('user_id, timestamp')
      .gte('timestamp', since)

    const uniqueUsers = new Set(data?.map(d => d.user_id) || [])

    return {
      activeUsers: uniqueUsers.size,
      totalEvents: data?.length || 0,
      avgEventsPerUser: uniqueUsers.size > 0 ? (data?.length || 0) / uniqueUsers.size : 0
    }
  }

  private async getObjectiveMetrics(since: string): Promise<any> {
    const { data } = await this.client
      .from('strategic_objectives')
      .select('domain, status, created_at, updated_at')
      .gte('updated_at', since)

    return {
      updated: data?.length || 0,
      byDomain: this.groupBy(data || [], 'domain'),
      byStatus: this.groupBy(data || [], 'status')
    }
  }

  private async getPerformanceMetrics(since: string): Promise<any> {
    // Get performance data from our monitoring system
    const metrics = performanceMonitor.getPerformanceMetrics(24 * 60 * 60 * 1000)

    return {
      averageResponseTime: metrics.averageDuration,
      totalOperations: metrics.totalOperations,
      slowestOperations: metrics.slowestOperations.slice(0, 5),
      cacheStats: performanceMonitor.getCacheStats()
    }
  }

  private getRealtimeMetrics(): any {
    // Would integrate with RealtimeManager to get active connections
    return {
      activeConnections: 0,
      activeSubscriptions: 0,
      messagesPerSecond: 0
    }
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key])
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

// ========== Advanced Query Builder ==========

export class AdvancedQueryBuilder {
  private client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  /**
   * Build complex analytical queries with caching
   */
  async getObjectiveAnalytics(filters: {
    userId?: string
    domain?: ProjectDomain
    dateRange?: { start: Date; end: Date }
    includeCompleted?: boolean
  }): Promise<ObjectiveAnalytics> {
    const cacheKey = `objective_analytics:${JSON.stringify(filters)}`
    const cached = cache.get<ObjectiveAnalytics>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      let query = this.client
        .from('strategic_objectives')
        .select(`
          *,
          objective_progress (
            progress,
            updated_at
          ),
          objective_milestones (
            id,
            name,
            target_date,
            status,
            completed_at
          ),
          risk_assessments (
            category,
            probability,
            impact,
            risk_level
          )
        `)

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters.domain) {
        query = query.eq('domain', filters.domain)
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString())
      }
      if (!filters.includeCompleted) {
        query = query.neq('status', 'completed')
      }

      const { data, error } = await query

      if (error) throw error

      const analytics = this.processObjectiveData(data || [])

      // Cache for 15 minutes
      cache.set(cacheKey, analytics, 15 * 60 * 1000)

      return analytics
    } catch (error) {
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'getObjectiveAnalytics', filters }
      })
      throw error
    }
  }

  /**
   * Get strategic insights using advanced aggregation
   */
  async getStrategicInsights(userId: string): Promise<StrategicInsights> {
    try {
      const { data, error } = await this.client.rpc('get_strategic_insights', {
        p_user_id: userId
      })

      if (error) throw error

      return data
    } catch (error) {
      await errorHandler.logError(error as Error, {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'getStrategicInsights', userId }
      })
      throw error
    }
  }

  private processObjectiveData(data: any[]): ObjectiveAnalytics {
    const totalObjectives = data.length
    const completedObjectives = data.filter(obj => obj.status === 'completed').length
    const completionRate = totalObjectives > 0 ? completedObjectives / totalObjectives : 0

    // Calculate average progress
    const totalProgress = data.reduce((sum, obj) => {
      const latestProgress = obj.objective_progress?.[0]?.progress || 0
      return sum + latestProgress
    }, 0)
    const averageProgress = totalObjectives > 0 ? totalProgress / totalObjectives : 0

    // Risk analysis
    const risks = data.flatMap(obj => obj.risk_assessments || [])
    const riskDistribution = risks.reduce((acc, risk) => {
      acc[risk.risk_level] = (acc[risk.risk_level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Milestone analysis
    const milestones = data.flatMap(obj => obj.objective_milestones || [])
    const upcomingMilestones = milestones
      .filter(m => m.status === 'planned' && new Date(m.target_date) > new Date())
      .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())

    return {
      totalObjectives,
      completedObjectives,
      completionRate,
      averageProgress,
      riskDistribution,
      upcomingMilestones: upcomingMilestones.slice(0, 5),
      domainDistribution: this.groupBy(data, 'domain'),
      statusDistribution: this.groupBy(data, 'status')
    }
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key])
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

// ========== Type Definitions ==========

export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  old: T | null
  new: T | null
  schema: string
  table: string
  commit_timestamp: string
}

export interface RealtimeSubscription {
  id: string
  channelName: string
  table: string
  userId?: string
  createdAt: Date
  isActive: boolean
}

export interface AgentActivity {
  id: string
  agentId: string
  type: string
  status: string
  timestamp: Date
  data: Record<string, any>
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: string
  progress: number
  currentStep?: string
  startedAt: Date
  completedAt?: Date
}

export interface SemanticSearchResult {
  documentId: string
  content: string
  similarity: number
  metadata?: Record<string, any>
}

export interface FileUploadResult {
  path: string
  fullPath: string
  publicUrl: string
  size: number
  type: string
  metadata?: Record<string, any>
}

export interface AnalyticsEvent {
  id: string
  userId?: string
  category: string
  action: string
  label?: string
  value?: number
  metadata?: Record<string, any>
  timestamp: Date
}

export interface AnalyticsDashboard {
  timeframe: string
  events: any
  users: any
  objectives: any
  performance: any
  realtime: any
}

export interface ObjectiveAnalytics {
  totalObjectives: number
  completedObjectives: number
  completionRate: number
  averageProgress: number
  riskDistribution: Record<string, number>
  upcomingMilestones: any[]
  domainDistribution: Record<string, number>
  statusDistribution: Record<string, number>
}

export interface StrategicInsights {
  trendingDomains: string[]
  riskFactors: any[]
  opportunities: any[]
  recommendations: string[]
  predictedOutcomes: any[]
}

// ========== Factory Function ==========

export function createOptimizedSupabaseClient(config: AdvancedSupabaseConfig): {
  client: SupabaseClient
  realtime: RealtimeManager
  vectorSearch: VectorSearchManager
  storage: StorageManager
  analytics: SupabaseAnalytics
  queryBuilder: AdvancedQueryBuilder
} {
  const client = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-client-info': 'agentdash-v1.0'
      }
    }
  })

  const realtime = new RealtimeManager(client)
  const vectorSearch = new VectorSearchManager(client)
  const storage = new StorageManager(client, config.storage.buckets)
  const analytics = new SupabaseAnalytics(client)
  const queryBuilder = new AdvancedQueryBuilder(client)

  return {
    client,
    realtime,
    vectorSearch,
    storage,
    analytics,
    queryBuilder
  }
}