/**
 * Comprehensive Error Handling and Logging System
 * Provides structured error handling, logging, and monitoring for the AgentDash platform
 */

import { supabase } from './supabase'

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  API = 'api',
  DATABASE = 'database',
  AUTH = 'auth',
  AGENT = 'agent',
  WORKFLOW = 'workflow',
  INTEGRATION = 'integration',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  VALIDATION = 'validation',
  NETWORK = 'network',
  FILE_SYSTEM = 'file_system',
  EXTERNAL_SERVICE = 'external_service',
  AI = 'ai',
  INFRASTRUCTURE = 'infrastructure',
  ANALYTICS = 'analytics'
}

export interface ErrorDetails {
  id: string
  message: string
  category: ErrorCategory
  severity: ErrorSeverity
  code?: string
  stack?: string
  userId?: string
  sessionId?: string
  requestId?: string
  context?: Record<string, any>
  timestamp: Date
  resolved?: boolean
  resolution?: string
  tags?: string[]
}

export interface LogEntry {
  id: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  category: string
  userId?: string
  sessionId?: string
  requestId?: string
  data?: Record<string, any>
  timestamp: Date
  source?: string
  performance?: {
    duration?: number
    memory?: number
    cpu?: number
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: ErrorDetails[] = []
  private logQueue: LogEntry[] = []
  private isProcessingQueue = false
  private readonly maxQueueSize = 1000
  private readonly batchSize = 50
  private readonly flushInterval = 5000 // 5 seconds

  private constructor() {
    this.startQueueProcessor()
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Log an error with structured data
   */
  async logError(error: Error | string, details: Partial<ErrorDetails> = {}): Promise<string> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const errorDetails: ErrorDetails = {
      id: errorId,
      message: error instanceof Error ? error.message : error,
      category: details.category || ErrorCategory.API,
      severity: details.severity || ErrorSeverity.MEDIUM,
      code: details.code,
      stack: error instanceof Error ? error.stack : undefined,
      userId: details.userId,
      sessionId: details.sessionId,
      requestId: details.requestId,
      context: details.context,
      timestamp: new Date(),
      tags: details.tags || []
    }

    // Add to queue for batch processing
    this.errorQueue.push(errorDetails)

    // Immediate console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${errorDetails.severity.toUpperCase()}] ${errorDetails.category}: ${errorDetails.message}`, {
        id: errorId,
        stack: errorDetails.stack,
        context: errorDetails.context
      })
    }

    // Critical errors get immediate processing
    if (errorDetails.severity === ErrorSeverity.CRITICAL) {
      await this.processErrorQueue()
    }

    return errorId
  }

  /**
   * Log structured information
   */
  async log(level: LogEntry['level'], message: string, data: Partial<LogEntry> = {}): Promise<string> {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const logEntry: LogEntry = {
      id: logId,
      level,
      message,
      category: data.category || 'general',
      userId: data.userId,
      sessionId: data.sessionId,
      requestId: data.requestId,
      data: data.data,
      timestamp: new Date(),
      source: data.source,
      performance: data.performance
    }

    this.logQueue.push(logEntry)

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
      console[logMethod](`[${level.toUpperCase()}] ${message}`, data.data)
    }

    return logId
  }

  /**
   * Create a performance logger
   */
  createPerformanceLogger(operation: string, context?: Record<string, any>) {
    const startTime = performance.now()
    const startMemory = process.memoryUsage().heapUsed

    return {
      finish: async (additionalData?: Record<string, any>) => {
        const duration = performance.now() - startTime
        const memoryDelta = process.memoryUsage().heapUsed - startMemory

        await this.log('info', `Performance: ${operation}`, {
          category: 'performance',
          data: {
            operation,
            duration: Math.round(duration),
            memoryDelta,
            ...context,
            ...additionalData
          },
          performance: {
            duration,
            memory: memoryDelta
          }
        })

        return { duration, memoryDelta }
      },
      error: async (error: Error, additionalData?: Record<string, any>) => {
        const duration = performance.now() - startTime

        await this.logError(error, {
          category: ErrorCategory.PERFORMANCE,
          severity: ErrorSeverity.MEDIUM,
          context: {
            operation,
            duration: Math.round(duration),
            ...context,
            ...additionalData
          }
        })
      }
    }
  }

  /**
   * Wrap async functions with error handling
   */
  wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: { operation: string; category?: ErrorCategory; severity?: ErrorSeverity }
  ): T {
    return (async (...args: Parameters<T>) => {
      const perfLogger = this.createPerformanceLogger(context.operation)

      try {
        const result = await fn(...args)
        await perfLogger.finish()
        return result
      } catch (error) {
        await this.logError(error as Error, {
          category: context.category || ErrorCategory.API,
          severity: context.severity || ErrorSeverity.MEDIUM,
          context: {
            operation: context.operation,
            args: args.length <= 5 ? args : '[too many args]'
          }
        })
        throw error
      }
    }) as T
  }

  /**
   * API response wrapper with error handling
   */
  async apiResponse<T>(
    operation: () => Promise<T>,
    context: { endpoint: string; method: string; userId?: string }
  ): Promise<{ data?: T; error?: string; success: boolean }> {
    const perfLogger = this.createPerformanceLogger(`API ${context.method} ${context.endpoint}`)

    try {
      const data = await operation()
      await perfLogger.finish({ userId: context.userId })

      return { data, success: true }
    } catch (error) {
      const errorId = await this.logError(error as Error, {
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        userId: context.userId,
        context: {
          endpoint: context.endpoint,
          method: context.method
        }
      })

      await perfLogger.error(error as Error, { errorId })

      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
    }
  }

  /**
   * Database operation wrapper
   */
  async dbOperation<T>(
    operation: () => Promise<T>,
    context: { table: string; operation: string; userId?: string }
  ): Promise<T> {
    const perfLogger = this.createPerformanceLogger(`DB ${context.operation} ${context.table}`)

    try {
      const result = await operation()
      await perfLogger.finish({ table: context.table, userId: context.userId })
      return result
    } catch (error) {
      await this.logError(error as Error, {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        userId: context.userId,
        context
      })

      await perfLogger.error(error as Error, context)
      throw error
    }
  }

  /**
   * Process error and log queues in batches
   */
  private async processErrorQueue(): Promise<void> {
    if (this.isProcessingQueue) return
    this.isProcessingQueue = true

    try {
      // Process errors
      if (this.errorQueue.length > 0) {
        const errorsToProcess = this.errorQueue.splice(0, this.batchSize)

        // Store errors in database if not in demo mode
        const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
                          !process.env.NEXT_PUBLIC_SUPABASE_URL

        if (!isDemoMode && errorsToProcess.length > 0) {
          try {
            await supabase.from('error_logs').insert(
              errorsToProcess.map(err => ({
                id: err.id,
                message: err.message,
                category: err.category,
                severity: err.severity,
                code: err.code,
                stack: err.stack,
                user_id: err.userId,
                session_id: err.sessionId,
                request_id: err.requestId,
                context: err.context,
                timestamp: err.timestamp.toISOString(),
                tags: err.tags
              }))
            )
          } catch (dbError) {
            console.error('Failed to store errors in database:', dbError)
          }
        }
      }

      // Process logs
      if (this.logQueue.length > 0) {
        const logsToProcess = this.logQueue.splice(0, this.batchSize)

        const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
                          !process.env.NEXT_PUBLIC_SUPABASE_URL

        if (!isDemoMode && logsToProcess.length > 0) {
          try {
            await supabase.from('application_logs').insert(
              logsToProcess.map(log => ({
                id: log.id,
                level: log.level,
                message: log.message,
                category: log.category,
                user_id: log.userId,
                session_id: log.sessionId,
                request_id: log.requestId,
                data: log.data,
                timestamp: log.timestamp.toISOString(),
                source: log.source,
                performance_data: log.performance
              }))
            )
          } catch (dbError) {
            console.error('Failed to store logs in database:', dbError)
          }
        }
      }
    } catch (error) {
      console.error('Error processing queue:', error)
    } finally {
      this.isProcessingQueue = false
    }
  }

  /**
   * Start the queue processor
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.errorQueue.length > 0 || this.logQueue.length > 0) {
        this.processErrorQueue()
      }
    }, this.flushInterval)

    // Cleanup on exit
    if (typeof process !== 'undefined') {
      process.on('exit', () => this.processErrorQueue())
      process.on('SIGINT', () => this.processErrorQueue())
      process.on('SIGTERM', () => this.processErrorQueue())
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Browser error handling
      window.addEventListener('error', (event) => {
        this.logError(event.error || event.message, {
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.logError(event.reason, {
          category: ErrorCategory.API,
          severity: ErrorSeverity.HIGH,
          context: { type: 'unhandled_promise_rejection' }
        })
      })
    } else if (typeof process !== 'undefined') {
      // Node.js error handling
      process.on('uncaughtException', (error) => {
        this.logError(error, {
          category: ErrorCategory.API,
          severity: ErrorSeverity.CRITICAL,
          context: { type: 'uncaught_exception' }
        })
      })

      process.on('unhandledRejection', (reason, promise) => {
        this.logError(reason as Error, {
          category: ErrorCategory.API,
          severity: ErrorSeverity.HIGH,
          context: { type: 'unhandled_rejection', promise: promise.toString() }
        })
      })
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStats(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{
    total: number
    byCategory: Record<ErrorCategory, number>
    bySeverity: Record<ErrorSeverity, number>
    trends: Array<{ timestamp: string; count: number }>
  }> {
    const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
                      !process.env.NEXT_PUBLIC_SUPABASE_URL

    if (isDemoMode) {
      return {
        total: 12,
        byCategory: {
          [ErrorCategory.API]: 5,
          [ErrorCategory.DATABASE]: 2,
          [ErrorCategory.AUTH]: 1,
          [ErrorCategory.AGENT]: 3,
          [ErrorCategory.WORKFLOW]: 1,
          [ErrorCategory.INTEGRATION]: 0,
          [ErrorCategory.PERFORMANCE]: 0,
          [ErrorCategory.SECURITY]: 0,
          [ErrorCategory.VALIDATION]: 0,
          [ErrorCategory.NETWORK]: 0,
          [ErrorCategory.FILE_SYSTEM]: 0,
          [ErrorCategory.EXTERNAL_SERVICE]: 0,
          [ErrorCategory.AI]: 0,
          [ErrorCategory.INFRASTRUCTURE]: 0,
          [ErrorCategory.ANALYTICS]: 0
        },
        bySeverity: {
          [ErrorSeverity.LOW]: 3,
          [ErrorSeverity.MEDIUM]: 6,
          [ErrorSeverity.HIGH]: 2,
          [ErrorSeverity.CRITICAL]: 1
        },
        trends: [
          { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), count: 8 },
          { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), count: 4 }
        ]
      }
    }

    try {
      const { data: errors } = await supabase
        .from('error_logs')
        .select('category, severity, timestamp')
        .gte('timestamp', new Date(Date.now() - (timeframe === 'hour' ? 60 * 60 * 1000 : timeframe === 'day' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)).toISOString())

      if (!errors) {
        return {
          total: 0,
          byCategory: {} as Record<ErrorCategory, number>,
          bySeverity: {} as Record<ErrorSeverity, number>,
          trends: []
        }
      }

      const byCategory = errors.reduce((acc, err) => {
        acc[err.category as ErrorCategory] = (acc[err.category as ErrorCategory] || 0) + 1
        return acc
      }, {} as Record<ErrorCategory, number>)

      const bySeverity = errors.reduce((acc, err) => {
        acc[err.severity as ErrorSeverity] = (acc[err.severity as ErrorSeverity] || 0) + 1
        return acc
      }, {} as Record<ErrorSeverity, number>)

      return {
        total: errors.length,
        byCategory,
        bySeverity,
        trends: [] // Would implement time-series aggregation
      }
    } catch (error) {
      console.error('Failed to get error stats:', error)
      return {
        total: 0,
        byCategory: {} as Record<ErrorCategory, number>,
        bySeverity: {} as Record<ErrorSeverity, number>,
        trends: []
      }
    }
  }

  /**
   * Clear old logs and errors
   */
  async cleanup(olderThanDays: number = 30): Promise<void> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

    const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
                      !process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!isDemoMode) {
      try {
        await Promise.all([
          supabase.from('error_logs').delete().lt('timestamp', cutoffDate.toISOString()),
          supabase.from('application_logs').delete().lt('timestamp', cutoffDate.toISOString())
        ])
      } catch (error) {
        console.error('Failed to cleanup old logs:', error)
      }
    }
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Convenience functions
export const logError = (error: Error | string, details?: Partial<ErrorDetails>) =>
  errorHandler.logError(error, details)

export const logInfo = (message: string, data?: Record<string, any>) =>
  errorHandler.log('info', message, { data })

export const logWarn = (message: string, data?: Record<string, any>) =>
  errorHandler.log('warn', message, { data })

export const logDebug = (message: string, data?: Record<string, any>) =>
  errorHandler.log('debug', message, { data })

export const createPerformanceLogger = (operation: string, context?: Record<string, any>) =>
  errorHandler.createPerformanceLogger(operation, context)

export const wrapAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: { operation: string; category?: ErrorCategory; severity?: ErrorSeverity }
) => errorHandler.wrapAsync(fn, context)

export const apiResponse = <T>(
  operation: () => Promise<T>,
  context: { endpoint: string; method: string; userId?: string }
) => errorHandler.apiResponse(operation, context)

export const dbOperation = <T>(
  operation: () => Promise<T>,
  context: { table: string; operation: string; userId?: string }
) => errorHandler.dbOperation(operation, context)