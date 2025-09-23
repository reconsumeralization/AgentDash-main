/**
 * Comprehensive Data Query and Transformation System
 * Flexible Supabase integration with advanced querying capabilities
 */

import { supabase } from './supabase'
import { PostgrestQueryBuilder, PostgrestFilterBuilder } from '@supabase/postgrest-js'

export interface QueryOptions {
  table: string
  select?: string
  filters?: Record<string, any>
  joins?: Array<{
    table: string
    foreignKey: string
    localKey?: string
    select?: string
  }>
  orderBy?: {
    column: string
    ascending?: boolean
  }
  limit?: number
  offset?: number
  single?: boolean
  count?: 'exact' | 'planned' | 'estimated'
  transformations?: Array<{
    type: 'map' | 'filter' | 'aggregate' | 'join' | 'group' | 'sort' | 'limit'
    config: any
  }>
}

export interface TransformationRule {
  id: string
  name: string
  description?: string
  source: string | QueryOptions
  transformations: Array<{
    type: 'map' | 'filter' | 'aggregate' | 'join' | 'group' | 'sort' | 'limit'
    config: any
  }>
  output?: {
    format: 'json' | 'csv' | 'xml'
    schema?: any
  }
}

export interface DataPipeline {
  id: string
  name: string
  description?: string
  steps: TransformationRule[]
  triggers?: {
    schedule?: string
    events?: string[]
    manual?: boolean
  }
  cache?: {
    enabled: boolean
    ttl: number
    key: string
  }
}

export class DataQuerySystem {
  private pipelines: Map<string, DataPipeline> = new Map()
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  /**
   * Execute a flexible query against Supabase
   */
  async executeQuery(options: QueryOptions): Promise<any> {
    try {
      let query: PostgrestQueryBuilder<any> = supabase.from(options.table)

      // Apply select
      if (options.select) {
        query = query.select(options.select)
      }

      // Apply filters
      if (options.filters) {
        query = this.applyFilters(query, options.filters)
      }

      // Apply joins
      if (options.joins) {
        for (const join of options.joins) {
          query = query.select(`${options.select || '*'}, ${join.table}:${join.table}(${join.select || '*'})`)
        }
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
      }

      // Execute query
      const { data, error, count } = await query

      if (error) throw error

      if (options.single) {
        return data?.[0] || null
      }

      return {
        data,
        count,
        metadata: {
          query: options,
          timestamp: new Date().toISOString(),
          executionTime: Date.now()
        }
      }

    } catch (error) {
      console.error('Query execution error:', error)
      throw error
    }
  }

  /**
   * Apply complex filters to query
   */
  private applyFilters(
    query: PostgrestQueryBuilder<any>,
    filters: Record<string, any>
  ): PostgrestQueryBuilder<any> {
    let filteredQuery = query

    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        // Handle array filters (IN operations)
        filteredQuery = filteredQuery.in(key, value)
      } else if (typeof value === 'object' && value !== null) {
        // Handle complex filters
        const { operator, value: filterValue } = value

        switch (operator) {
          case 'eq':
            filteredQuery = filteredQuery.eq(key, filterValue)
            break
          case 'neq':
            filteredQuery = filteredQuery.neq(key, filterValue)
            break
          case 'gt':
            filteredQuery = filteredQuery.gt(key, filterValue)
            break
          case 'gte':
            filteredQuery = filteredQuery.gte(key, filterValue)
            break
          case 'lt':
            filteredQuery = filteredQuery.lt(key, filterValue)
            break
          case 'lte':
            filteredQuery = filteredQuery.lte(key, filterValue)
            break
          case 'like':
            filteredQuery = filteredQuery.like(key, `%${filterValue}%`)
            break
          case 'ilike':
            filteredQuery = filteredQuery.ilike(key, `%${filterValue}%`)
            break
          case 'contains':
            filteredQuery = filteredQuery.contains(key, filterValue)
            break
          case 'overlaps':
            filteredQuery = filteredQuery.overlaps(key, filterValue)
            break
          case 'range':
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              filteredQuery = filteredQuery.gte(key, filterValue[0]).lte(key, filterValue[1])
            }
            break
          default:
            // Default to equality
            filteredQuery = filteredQuery.eq(key, value)
        }
      } else {
        // Simple equality filter
        filteredQuery = filteredQuery.eq(key, value)
      }
    }

    return filteredQuery
  }

  /**
   * Execute a data transformation pipeline
   */
  async executePipeline(pipelineId: string, input?: any): Promise<any> {
    const pipeline = this.pipelines.get(pipelineId)
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`)
    }

    let currentData = input

    for (const step of pipeline.steps) {
      currentData = await this.executeTransformation(step, currentData)
    }

    return currentData
  }

  /**
   * Execute a single transformation rule
   */
  async executeTransformation(rule: TransformationRule, input?: any): Promise<any> {
    let data = input

    // Get source data if not provided
    if (!data && typeof rule.source === 'object') {
      data = await this.executeQuery(rule.source)
    }

    // Apply transformations
    for (const transformation of rule.transformations) {
      data = await this.applyTransformation(data, transformation)
    }

    // Format output if specified
    if (rule.output) {
      data = this.formatOutput(data, rule.output)
    }

    return data
  }

  /**
   * Apply a single transformation
   */
  private async applyTransformation(data: any, transformation: TransformationRule['transformations'][0]): Promise<any> {
    switch (transformation.type) {
      case 'map':
        return this.applyMapTransformation(data, transformation.config)

      case 'filter':
        return this.applyFilterTransformation(data, transformation.config)

      case 'aggregate':
        return this.applyAggregateTransformation(data, transformation.config)

      case 'join':
        return await this.applyJoinTransformation(data, transformation.config)

      case 'group':
        return this.applyGroupTransformation(data, transformation.config)

      case 'sort':
        return this.applySortTransformation(data, transformation.config)

      case 'limit':
        return this.applyLimitTransformation(data, transformation.config)

      default:
        return data
    }
  }

  /**
   * Map transformation
   */
  private applyMapTransformation(data: any, config: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.mapItem(item, config))
    }
    return this.mapItem(data, config)
  }

  /**
   * Filter transformation
   */
  private applyFilterTransformation(data: any, config: any): any {
    if (!Array.isArray(data)) return data

    return data.filter(item => {
      if (config.condition) {
        return this.evaluateCondition(item, config.condition)
      }
      return true
    })
  }

  /**
   * Aggregate transformation
   */
  private applyAggregateTransformation(data: any, config: any): any {
    if (!Array.isArray(data)) return data

    const result: Record<string, any> = {}

    for (const [key, aggregator] of Object.entries(config)) {
      switch (aggregator) {
        case 'count':
          result[key] = data.length
          break
        case 'sum':
          result[key] = data.reduce((sum, item) => sum + (item[key] || 0), 0)
          break
        case 'avg':
          result[key] = data.reduce((sum, item) => sum + (item[key] || 0), 0) / data.length
          break
        case 'min':
          result[key] = Math.min(...data.map(item => item[key] || 0))
          break
        case 'max':
          result[key] = Math.max(...data.map(item => item[key] || 0))
          break
        case 'distinct':
          result[key] = [...new Set(data.map(item => item[key]))]
          break
      }
    }

    return result
  }

  /**
   * Join transformation
   */
  private async applyJoinTransformation(data: any, config: any): Promise<any> {
    const { table, foreignKey, localKey = 'id', select } = config

    const ids = Array.isArray(data)
      ? data.map(item => item[localKey])
      : [data[localKey]]

    const { data: joinedData } = await supabase
      .from(table)
      .select(select || '*')
      .in(foreignKey, ids)

    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        [table]: joinedData?.filter(j => j[foreignKey] === item[localKey]) || []
      }))
    }

    return {
      ...data,
      [table]: joinedData || []
    }
  }

  /**
   * Group transformation
   */
  private applyGroupTransformation(data: any, config: any): any {
    if (!Array.isArray(data)) return data

    const { groupBy, aggregations } = config
    const groups: Record<string, any[]> = {}

    // Group data
    data.forEach(item => {
      const key = Array.isArray(groupBy)
        ? groupBy.map(field => item[field]).join('-')
        : item[groupBy]

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
    })

    // Apply aggregations
    const result: any[] = []
    for (const [key, groupData] of Object.entries(groups)) {
      const aggregated = { [groupBy]: key }

      if (aggregations) {
        Object.assign(aggregated, this.applyAggregateTransformation(groupData, aggregations))
      } else {
        aggregated.items = groupData
        aggregated.count = groupData.length
      }

      result.push(aggregated)
    }

    return result
  }

  /**
   * Sort transformation
   */
  private applySortTransformation(data: any, config: any): any {
    if (!Array.isArray(data)) return data

    const { field, direction = 'asc' } = config

    return data.sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]

      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  /**
   * Limit transformation
   */
  private applyLimitTransformation(data: any, config: any): any {
    if (!Array.isArray(data)) return data

    const { count, offset = 0 } = config
    return data.slice(offset, offset + count)
  }

  /**
   * Helper method to map individual items
   */
  private mapItem(item: any, mapping: Record<string, any>): any {
    if (typeof mapping === 'function') {
      return mapping(item)
    }

    const result: any = {}

    for (const [key, value] of Object.entries(mapping)) {
      if (typeof value === 'string') {
        result[key] = this.getNestedValue(item, value)
      } else if (typeof value === 'function') {
        result[key] = value(item)
      } else {
        result[key] = value
      }
    }

    return result
  }

  /**
   * Evaluate condition for filtering
   */
  private evaluateCondition(item: any, condition: any): boolean {
    if (typeof condition === 'function') {
      return condition(item)
    }

    if (typeof condition === 'string') {
      // Simple evaluation - in production, use a proper expression evaluator
      try {
        return new Function('item', `return ${condition}`)(item)
      } catch {
        return false
      }
    }

    return true
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Format output data
   */
  private formatOutput(data: any, output: TransformationRule['output']): any {
    if (!output) return data

    switch (output.format) {
      case 'csv':
        return this.convertToCSV(data)
      case 'xml':
        return this.convertToXML(data)
      default:
        return data
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    if (!Array.isArray(data) || data.length === 0) return ''

    const headers = Object.keys(data[0])
    const rows = data.map(item =>
      headers.map(header => JSON.stringify(item[header] || '')).join(',')
    )

    return [headers.join(','), ...rows].join('\n')
  }

  /**
   * Convert data to XML format
   */
  private convertToXML(data: any): string {
    const convertToXMLString = (obj: any, rootName = 'root'): string => {
      if (typeof obj !== 'object' || obj === null) {
        return `<${rootName}>${obj}</${rootName}>`
      }

      if (Array.isArray(obj)) {
        return obj.map(item => convertToXMLString(item, 'item')).join('')
      }

      let xml = `<${rootName}>`
      for (const [key, value] of Object.entries(obj)) {
        xml += convertToXMLString(value, key)
      }
      xml += `</${rootName}>`

      return xml
    }

    return `<?xml version="1.0" encoding="UTF-8"?><data>${convertToXMLString(data)}</data>`
  }

  /**
   * Cache management
   */
  private getCacheKey(pipelineId: string, input?: any): string {
    return `${pipelineId}-${JSON.stringify(input || {})}`
  }

  private getCachedResult(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCachedResult(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Register a data pipeline
   */
  registerPipeline(pipeline: DataPipeline): void {
    this.pipelines.set(pipeline.id, pipeline)
  }

  /**
   * Get registered pipelines
   */
  getPipelines(): DataPipeline[] {
    return Array.from(this.pipelines.values())
  }

  /**
   * Get pipeline by ID
   */
  getPipeline(id: string): DataPipeline | undefined {
    return this.pipelines.get(id)
  }

  /**
   * Remove pipeline
   */
  removePipeline(id: string): boolean {
    return this.pipelines.delete(id)
  }
}

// Singleton instance
export const dataQuerySystem = new DataQuerySystem()
