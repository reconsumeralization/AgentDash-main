"use client"

/**
 * Office 365 Management API Client
 * Based on Office 365 Management APIs overview
 * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-apis-overview
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Office365Config,
  Office365TokenResponse,
  ServiceHealthStatus,
  ServiceCommunicationsResponse,
  ActivityRecord,
  ManagementActivityResponse,
  Subscription,
  Office365Error,
  DateRange,
  PaginationOptions,
  FilterOptions,
  ApiResponse,
  PaginatedResponse,
  WebhookNotification,
  Office365ApiEndpoint,
  ActivityRecordType,
  WorkloadType
} from './office365-management-api-types'

// Office 365 Management API Client
class Office365ManagementApiClass {
  private config: Office365Config
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: Office365Config) {
    this.config = {
      baseUrl: 'https://manage.office.com/api/v1.0',
      ...config
    }
  }

  /**
   * Authenticate and get access token
   */
  async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const tokenUrl = `${Office365ApiEndpoint.AUTH_TOKEN}/${this.config.tenantId}/oauth2/v2.0/token`
    
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'https://manage.office.com/.default',
      grant_type: 'client_credentials'
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    })

    if (!response.ok) {
      const error: Office365Error = await response.json()
      throw new Error(`Authentication failed: ${error.error.message}`)
    }

    const tokenData: Office365TokenResponse = await response.json()
    this.accessToken = tokenData.access_token
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000 // 1 minute buffer

    return this.accessToken
  }

  /**
   * Make authenticated request to Office 365 Management API
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.authenticate()
    
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error: Office365Error = await response.json()
      throw new Error(`API request failed: ${error.error.message}`)
    }

    return response.json()
  }

  // Service Communications API Methods

  /**
   * Get service health status
   * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-service-communications-api-reference
   */
  async getServiceHealthStatus(): Promise<ServiceHealthStatus[]> {
    const response: ServiceCommunicationsResponse = await this.makeRequest('/ServiceComms/CurrentStatus')
    return response.value
  }

  /**
   * Get service health status for specific service
   */
  async getServiceHealthStatusForService(serviceName: string): Promise<ServiceHealthStatus[]> {
    const response: ServiceCommunicationsResponse = await this.makeRequest(`/ServiceComms/CurrentStatus?$filter=featureName eq '${serviceName}'`)
    return response.value
  }

  /**
   * Get service health history
   */
  async getServiceHealthHistory(dateRange?: DateRange): Promise<ServiceHealthStatus[]> {
    let endpoint = '/ServiceComms/History'
    if (dateRange) {
      endpoint += `?$filter=startTime ge ${dateRange.startTime} and endTime le ${dateRange.endTime}`
    }
    
    const response: ServiceCommunicationsResponse = await this.makeRequest(endpoint)
    return response.value
  }

  // Management Activity API Methods

  /**
   * Get activity records
   * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-reference
   */
  async getActivityRecords(
    contentType: string,
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    let endpoint = `/activity/feed/subscriptions/content?contentType=${contentType}`
    
    const params = new URLSearchParams()
    if (options.startTime) params.append('startTime', options.startTime)
    if (options.endTime) params.append('endTime', options.endTime)
    if (options.skip) params.append('$skip', options.skip.toString())
    if (options.top) params.append('$top', options.top.toString())
    
    if (params.toString()) {
      endpoint += `&${params.toString()}`
    }

    const response: ManagementActivityResponse[] = await this.makeRequest(endpoint)
    
    // Fetch actual content for each record
    const records: ActivityRecord[] = []
    for (const item of response) {
      try {
        const content = await this.getActivityRecordContent(item.contentUri)
        records.push(...content)
      } catch (error) {
        console.warn(`Failed to fetch content for ${item.contentId}:`, error)
      }
    }

    return records
  }

  /**
   * Get activity record content from content URI
   */
  async getActivityRecordContent(contentUri: string): Promise<ActivityRecord[]> {
    const token = await this.authenticate()
    
    const response = await fetch(contentUri, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get available content types
   */
  async getAvailableContentTypes(): Promise<string[]> {
    const response: any[] = await this.makeRequest('/activity/feed/subscriptions/content')
    return response.map((item: any) => item.contentType)
  }

  /**
   * Get subscriptions
   */
  async getSubscriptions(): Promise<Subscription[]> {
    const response: Subscription[] = await this.makeRequest('/activity/feed/subscriptions/list')
    return response
  }

  /**
   * Create subscription with webhook support
   * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-reference#start-a-subscription
   */
  async createSubscription(
    contentType: string, 
    webhookConfig?: {
      address: string
      authId?: string
      expiration?: string
    },
    publisherIdentifier?: string
  ): Promise<Subscription> {
    const endpoint = `/activity/feed/subscriptions/start?contentType=${contentType}`
    const body: any = {}
    
    if (webhookConfig) {
      body.webhook = webhookConfig
    }

    const headers: Record<string, string> = {}
    if (publisherIdentifier) {
      headers['PublisherIdentifier'] = publisherIdentifier
    }

    const response: Subscription = await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    })
    return response
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscription: Subscription): Promise<Subscription> {
    const response: Subscription = await this.makeRequest('/activity/feed/subscriptions/start', {
      method: 'POST',
      body: JSON.stringify(subscription)
    })
    return response
  }

  /**
   * Stop subscription
   * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-reference#stop-a-subscription
   */
  async stopSubscription(contentType: string, publisherIdentifier?: string): Promise<void> {
    const endpoint = `/activity/feed/subscriptions/stop?contentType=${contentType}`
    const headers: Record<string, string> = {}
    
    if (publisherIdentifier) {
      headers['PublisherIdentifier'] = publisherIdentifier
    }

    await this.makeRequest(endpoint, {
      method: 'POST',
      headers
    })
  }

  /**
   * List available content with pagination support
   * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-reference#list-available-content
   */
  async listAvailableContent(
    contentType: string,
    options: {
      startTime?: string
      endTime?: string
      nextPage?: string
      publisherIdentifier?: string
    } = {}
  ): Promise<{
    content: ManagementActivityResponse[]
    nextPage?: string
  }> {
    const params = new URLSearchParams()
    params.append('contentType', contentType)
    
    if (options.startTime) params.append('startTime', options.startTime)
    if (options.endTime) params.append('endTime', options.endTime)
    if (options.nextPage) params.append('nextPage', options.nextPage)

    const endpoint = `/activity/feed/subscriptions/content?${params.toString()}`
    const headers: Record<string, string> = {}
    
    if (options.publisherIdentifier) {
      headers['PublisherIdentifier'] = options.publisherIdentifier
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${await this.authenticate()}`,
        'Content-Type': 'application/json',
        ...headers
      }
    })

    if (!response.ok) {
      const error: Office365Error = await response.json()
      throw new Error(`API request failed: ${error.error.message}`)
    }

    const content: ManagementActivityResponse[] = await response.json()
    const nextPage = response.headers.get('NextPageUri') || undefined

    return { content, nextPage }
  }

  /**
   * Retrieve content by content URI
   * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-reference#retrieving-content
   */
  async retrieveContent(contentUri: string): Promise<ActivityRecord[]> {
    const token = await this.authenticate()
    
    const response = await fetch(contentUri, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error: Office365Error = await response.json()
      throw new Error(`Content retrieval failed: ${error.error.message}`)
    }

    return response.json()
  }

  /**
   * List notifications sent by webhook
   * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-reference#list-notifications
   */
  async listNotifications(
    options: {
      startTime?: string
      endTime?: string
      publisherIdentifier?: string
    } = {}
  ): Promise<{
    notifications: WebhookNotification[]
    nextPage?: string
  }> {
    const params = new URLSearchParams()
    
    if (options.startTime) params.append('startTime', options.startTime)
    if (options.endTime) params.append('endTime', options.endTime)

    const endpoint = `/activity/feed/subscriptions/notifications?${params.toString()}`
    const headers: Record<string, string> = {}
    
    if (options.publisherIdentifier) {
      headers['PublisherIdentifier'] = options.publisherIdentifier
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${await this.authenticate()}`,
        'Content-Type': 'application/json',
        ...headers
      }
    })

    if (!response.ok) {
      const error: Office365Error = await response.json()
      throw new Error(`API request failed: ${error.error.message}`)
    }

    const notifications: WebhookNotification[] = await response.json()
    const nextPage = response.headers.get('NextPageUri') || undefined

    return { notifications, nextPage }
  }

  /**
   * Retrieve resource friendly names for DLP sensitive types
   * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-reference#retrieve-resource-friendly-names
   */
  async getResourceFriendlyNames(
    objectType: 'DlpSensitiveType',
    options: {
      publisherIdentifier?: string
      acceptLanguage?: string
    } = {}
  ): Promise<Array<{ id: string; name: string }>> {
    const endpoint = `/activity/feed/subscriptions/resources/${objectType.toLowerCase()}`
    const headers: Record<string, string> = {}
    
    if (options.publisherIdentifier) {
      headers['PublisherIdentifier'] = options.publisherIdentifier
    }
    if (options.acceptLanguage) {
      headers['Accept-Language'] = options.acceptLanguage
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${await this.authenticate()}`,
        'Content-Type': 'application/json',
        ...headers
      }
    })

    if (!response.ok) {
      const error: Office365Error = await response.json()
      throw new Error(`API request failed: ${error.error.message}`)
    }

    return response.json()
  }

  // Utility Methods

  /**
   * Get activity records by workload
   */
  async getActivityRecordsByWorkload(
    workload: WorkloadType,
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    return this.getActivityRecords(workload, options)
  }

  /**
   * Get activity records by record type
   */
  async getActivityRecordsByType(
    recordType: ActivityRecordType,
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    const records = await this.getActivityRecords('Audit.General', options)
    return records.filter(record => record.RecordType === recordType)
  }

  /**
   * Get user activity
   */
  async getUserActivity(
    userId: string,
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    const records = await this.getActivityRecords('Audit.General', options)
    return records.filter(record => record.UserId === userId)
  }

  /**
   * Get admin activity
   */
  async getAdminActivity(
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    const records = await this.getActivityRecords('Audit.General', options)
    return records.filter(record => record.UserType === 1) // Admin user type
  }

  /**
   * Get failed operations
   */
  async getFailedOperations(
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    const records = await this.getActivityRecords('Audit.General', options)
    return records.filter(record => record.ResultStatus !== 'Success')
  }

  /**
   * Get operations by IP address
   */
  async getOperationsByIP(
    ipAddress: string,
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    const records = await this.getActivityRecords('Audit.General', options)
    return records.filter(record => record.ClientIP === ipAddress)
  }

  // Enhanced Compliance and Security Monitoring

  /**
   * Get LinkedIn-related activity from Office 365 audit logs
   * This helps correlate LinkedIn activities with enterprise audit data
   */
  async getLinkedInRelatedActivity(
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    const records = await this.getActivityRecords('Audit.General', options)
    
    // Filter for LinkedIn-related activities
    return records.filter(record => 
      record.Operation.toLowerCase().includes('linkedin') ||
      record.Workload.toLowerCase().includes('linkedin') ||
      (record.ExtendedProperties && record.ExtendedProperties.some(prop => 
        prop.Value && prop.Value.toLowerCase().includes('linkedin')
      ))
    )
  }

  /**
   * Get suspicious activities that might indicate automation or policy violations
   */
  async getSuspiciousActivities(
    options: PaginationOptions & FilterOptions = {}
  ): Promise<{
    massOperations: ActivityRecord[]
    unusualHours: ActivityRecord[]
    highFrequencyUsers: ActivityRecord[]
    failedOperations: ActivityRecord[]
  }> {
    const records = await this.getActivityRecords('Audit.General', options)
    
    // Group by user and operation to detect patterns
    const userOperationCounts: Record<string, Record<string, number>> = {}
    const ipCounts: Record<string, number> = {}
    const hourCounts: Record<number, number> = {}
    
    records.forEach(record => {
      // Count user operations
      if (!userOperationCounts[record.UserId]) {
        userOperationCounts[record.UserId] = {}
      }
      userOperationCounts[record.UserId][record.Operation] = 
        (userOperationCounts[record.UserId][record.Operation] || 0) + 1
      
      // Count IP usage
      ipCounts[record.ClientIP] = (ipCounts[record.ClientIP] || 0) + 1
      
      // Count by hour
      const hour = new Date(record.CreationTime).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })

    // Identify suspicious patterns
    const massOperations = records.filter(record => {
      const userOps = userOperationCounts[record.UserId]?.[record.Operation] || 0
      return userOps > 50 // More than 50 of the same operation
    })

    const unusualHours = records.filter(record => {
      const hour = new Date(record.CreationTime).getHours()
      return hour < 6 || hour > 22 // Outside normal business hours
    })

    const highFrequencyUsers = records.filter(record => {
      const userTotalOps = Object.values(userOperationCounts[record.UserId] || {}).reduce((a, b) => a + b, 0)
      return userTotalOps > 100 // More than 100 total operations
    })

    const failedOperations = records.filter(record => record.ResultStatus !== 'Success')

    return {
      massOperations,
      unusualHours,
      highFrequencyUsers,
      failedOperations
    }
  }

  /**
   * Get DLP (Data Loss Prevention) incidents
   */
  async getDLPIncidents(
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    return this.getActivityRecords('DLP.All', options)
  }

  /**
   * Get Azure Active Directory events for user authentication monitoring
   */
  async getAzureADEvents(
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    return this.getActivityRecords('Audit.AzureActiveDirectory', options)
  }

  /**
   * Get SharePoint events for content sharing monitoring
   */
  async getSharePointEvents(
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    return this.getActivityRecords('Audit.SharePoint', options)
  }

  /**
   * Get Exchange events for email activity monitoring
   */
  async getExchangeEvents(
    options: PaginationOptions & FilterOptions = {}
  ): Promise<ActivityRecord[]> {
    return this.getActivityRecords('Audit.Exchange', options)
  }

  /**
   * Cross-reference LinkedIn activities with Office 365 audit logs
   * This provides comprehensive compliance monitoring
   */
  async crossReferenceLinkedInActivity(
    linkedInActivities: any[], // LinkedIn API activities
    options: PaginationOptions & FilterOptions = {}
  ): Promise<{
    correlatedActivities: ActivityRecord[]
    suspiciousPatterns: ActivityRecord[]
    complianceViolations: ActivityRecord[]
  }> {
    const auditRecords = await this.getActivityRecords('Audit.General', options)
    const linkedInRecords = await this.getLinkedInRelatedActivity(options)
    
    // Correlate by user ID and timestamp
    const correlatedActivities: ActivityRecord[] = []
    const suspiciousPatterns: ActivityRecord[] = []
    const complianceViolations: ActivityRecord[] = []
    
    linkedInActivities.forEach(linkedInActivity => {
      // Find matching audit records
      const matchingRecords = auditRecords.filter(record => 
        record.UserId === linkedInActivity.userId &&
        Math.abs(new Date(record.CreationTime).getTime() - new Date(linkedInActivity.timestamp).getTime()) < 3600000 // Within 1 hour
      )
      
      correlatedActivities.push(...matchingRecords)
      
      // Check for suspicious patterns
      if (matchingRecords.length > 10) {
        suspiciousPatterns.push(...matchingRecords)
      }
      
      // Check for compliance violations
      const failedRecords = matchingRecords.filter(record => record.ResultStatus !== 'Success')
      if (failedRecords.length > 0) {
        complianceViolations.push(...failedRecords)
      }
    })

    return {
      correlatedActivities,
      suspiciousPatterns,
      complianceViolations
    }
  }

  // Analytics and Reporting

  /**
   * Get comprehensive activity summary with compliance metrics
   */
  async getActivitySummary(
    options: PaginationOptions & FilterOptions = {}
  ): Promise<{
    totalRecords: number
    byWorkload: Record<string, number>
    byOperation: Record<string, number>
    byUser: Record<string, number>
    byIP: Record<string, number>
    successRate: number
    complianceMetrics: {
      totalLinkedInActivities: number
      suspiciousActivities: number
      dlpIncidents: number
      failedOperations: number
    }
  }> {
    const [records, linkedInActivities, dlpIncidents, suspicious] = await Promise.all([
      this.getActivityRecords('Audit.General', options),
      this.getLinkedInRelatedActivity(options),
      this.getDLPIncidents(options),
      this.getSuspiciousActivities(options)
    ])
    
    const summary = {
      totalRecords: records.length,
      byWorkload: {} as Record<string, number>,
      byOperation: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      byIP: {} as Record<string, number>,
      successRate: 0,
      complianceMetrics: {
        totalLinkedInActivities: linkedInActivities.length,
        suspiciousActivities: suspicious.massOperations.length + suspicious.unusualHours.length + suspicious.highFrequencyUsers.length,
        dlpIncidents: dlpIncidents.length,
        failedOperations: suspicious.failedOperations.length
      }
    }

    let successCount = 0

    records.forEach(record => {
      // By workload
      summary.byWorkload[record.Workload] = (summary.byWorkload[record.Workload] || 0) + 1
      
      // By operation
      summary.byOperation[record.Operation] = (summary.byOperation[record.Operation] || 0) + 1
      
      // By user
      summary.byUser[record.UserId] = (summary.byUser[record.UserId] || 0) + 1
      
      // By IP
      summary.byIP[record.ClientIP] = (summary.byIP[record.ClientIP] || 0) + 1
      
      // Success rate
      if (record.ResultStatus === 'Success') {
        successCount++
      }
    })

    summary.successRate = records.length > 0 ? (successCount / records.length) * 100 : 0

    return summary
  }
}

// React Hook for Office 365 Management API
function useOffice365ManagementApiHook(config?: Office365Config) {
  const [api, setApi] = useState<Office365ManagementApiClass | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const initializeApi = useCallback((apiConfig: Office365Config) => {
    setApi(new Office365ManagementApiClass(apiConfig))
  }, [])

  const makeRequest = useCallback(async <T>(
    requestFn: (api: Office365ManagementApiClass) => Promise<T>
  ): Promise<T | null> => {
    if (!api) {
      setError(new Error('API not initialized'))
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const result = await requestFn(api)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [api])

  // Service Communications Methods
  const getServiceHealthStatus = useCallback(async () => {
    return makeRequest(api => api.getServiceHealthStatus())
  }, [makeRequest])

  const getServiceHealthStatusForService = useCallback(async (serviceName: string) => {
    return makeRequest(api => api.getServiceHealthStatusForService(serviceName))
  }, [makeRequest])

  const getServiceHealthHistory = useCallback(async (dateRange?: DateRange) => {
    return makeRequest(api => api.getServiceHealthHistory(dateRange))
  }, [makeRequest])

  // Management Activity Methods
  const getActivityRecords = useCallback(async (
    contentType: string,
    options?: PaginationOptions & FilterOptions
  ) => {
    return makeRequest(api => api.getActivityRecords(contentType, options))
  }, [makeRequest])

  const getActivityRecordsByWorkload = useCallback(async (
    workload: WorkloadType,
    options?: PaginationOptions & FilterOptions
  ) => {
    return makeRequest(api => api.getActivityRecordsByWorkload(workload, options))
  }, [makeRequest])

  const getActivityRecordsByType = useCallback(async (
    recordType: ActivityRecordType,
    options?: PaginationOptions & FilterOptions
  ) => {
    return makeRequest(api => api.getActivityRecordsByType(recordType, options))
  }, [makeRequest])

  const getUserActivity = useCallback(async (
    userId: string,
    options?: PaginationOptions & FilterOptions
  ) => {
    return makeRequest(api => api.getUserActivity(userId, options))
  }, [makeRequest])

  const getAdminActivity = useCallback(async (
    options?: PaginationOptions & FilterOptions
  ) => {
    return makeRequest(api => api.getAdminActivity(options))
  }, [makeRequest])

  const getFailedOperations = useCallback(async (
    options?: PaginationOptions & FilterOptions
  ) => {
    return makeRequest(api => api.getFailedOperations(options))
  }, [makeRequest])

  const getActivitySummary = useCallback(async (
    options?: PaginationOptions & FilterOptions
  ) => {
    return makeRequest(api => api.getActivitySummary(options))
  }, [makeRequest])

  // Subscription Methods
  const getSubscriptions = useCallback(async () => {
    return makeRequest(api => api.getSubscriptions())
  }, [makeRequest])

  const createSubscription = useCallback(async (
    contentType: string,
    webhookConfig?: {
      address: string
      authId?: string
      expiration?: string
    },
    publisherIdentifier?: string
  ) => {
    return makeRequest(api => api.createSubscription(contentType, webhookConfig, publisherIdentifier))
  }, [makeRequest])

  const stopSubscription = useCallback(async (contentType: string, publisherIdentifier?: string) => {
    return makeRequest(api => api.stopSubscription(contentType, publisherIdentifier))
  }, [makeRequest])

  const listAvailableContent = useCallback(async (
    contentType: string,
    options?: {
      startTime?: string
      endTime?: string
      nextPage?: string
      publisherIdentifier?: string
    }
  ) => {
    return makeRequest(api => api.listAvailableContent(contentType, options))
  }, [makeRequest])

  const retrieveContent = useCallback(async (contentUri: string) => {
    return makeRequest(api => api.retrieveContent(contentUri))
  }, [makeRequest])

  const listNotifications = useCallback(async (options?: {
    startTime?: string
    endTime?: string
    publisherIdentifier?: string
  }) => {
    return makeRequest(api => api.listNotifications(options))
  }, [makeRequest])

  const getResourceFriendlyNames = useCallback(async (
    objectType: 'DlpSensitiveType',
    options?: {
      publisherIdentifier?: string
      acceptLanguage?: string
    }
  ) => {
    return makeRequest(api => api.getResourceFriendlyNames(objectType, options))
  }, [makeRequest])

  // Enhanced Compliance Methods
  const getLinkedInRelatedActivity = useCallback(async (options?: PaginationOptions & FilterOptions) => {
    return makeRequest(api => api.getLinkedInRelatedActivity(options))
  }, [makeRequest])

  const getSuspiciousActivities = useCallback(async (options?: PaginationOptions & FilterOptions) => {
    return makeRequest(api => api.getSuspiciousActivities(options))
  }, [makeRequest])

  const getDLPIncidents = useCallback(async (options?: PaginationOptions & FilterOptions) => {
    return makeRequest(api => api.getDLPIncidents(options))
  }, [makeRequest])

  const getAzureADEvents = useCallback(async (options?: PaginationOptions & FilterOptions) => {
    return makeRequest(api => api.getAzureADEvents(options))
  }, [makeRequest])

  const getSharePointEvents = useCallback(async (options?: PaginationOptions & FilterOptions) => {
    return makeRequest(api => api.getSharePointEvents(options))
  }, [makeRequest])

  const getExchangeEvents = useCallback(async (options?: PaginationOptions & FilterOptions) => {
    return makeRequest(api => api.getExchangeEvents(options))
  }, [makeRequest])

  const crossReferenceLinkedInActivity = useCallback(async (
    linkedInActivities: any[],
    options?: PaginationOptions & FilterOptions
  ) => {
    return makeRequest(api => api.crossReferenceLinkedInActivity(linkedInActivities, options))
  }, [makeRequest])

  return {
    api,
    loading,
    error,
    initializeApi,
    // Service Communications
    getServiceHealthStatus,
    getServiceHealthStatusForService,
    getServiceHealthHistory,
    // Management Activity
    getActivityRecords,
    getActivityRecordsByWorkload,
    getActivityRecordsByType,
    getUserActivity,
    getAdminActivity,
    getFailedOperations,
    getActivitySummary,
    // Subscriptions
    getSubscriptions,
    createSubscription,
    stopSubscription,
    listAvailableContent,
    retrieveContent,
    listNotifications,
    getResourceFriendlyNames,
    // Enhanced Compliance & Security
    getLinkedInRelatedActivity,
    getSuspiciousActivities,
    getDLPIncidents,
    getAzureADEvents,
    getSharePointEvents,
    getExchangeEvents,
    crossReferenceLinkedInActivity
  }
}

// Utility Functions
class Office365UtilsClass {
  /**
   * Format activity record for display
   */
  static formatActivityRecord(record: ActivityRecord): {
    id: string
    operation: string
    user: string
    timestamp: string
    status: string
    workload: string
    ipAddress: string
  } {
    return {
      id: record.Id,
      operation: record.Operation,
      user: record.UserId,
      timestamp: new Date(record.CreationTime).toLocaleString(),
      status: record.ResultStatus,
      workload: record.Workload,
      ipAddress: record.ClientIP
    }
  }

  /**
   * Get workload display name
   */
  static getWorkloadDisplayName(workload: string): string {
    const workloadNames: Record<string, string> = {
      'Exchange': 'Exchange Online',
      'SharePoint': 'SharePoint Online',
      'AzureActiveDirectory': 'Azure Active Directory',
      'General': 'General',
      'DLP': 'Data Loss Prevention',
      'PowerBI': 'Power BI',
      'MicrosoftTeams': 'Microsoft Teams',
      'MicrosoftStream': 'Microsoft Stream',
      'Yammer': 'Yammer',
      'MicrosoftForms': 'Microsoft Forms',
      'ToDo': 'Microsoft To Do',
      'MicrosoftLaunchpad': 'Microsoft Launchpad',
      'Microsoft365Insights': 'Microsoft 365 Insights',
      'Microsoft365InsightsLearn': 'Microsoft 365 Learning Analytics',
      'Microsoft365InsightsLearnEdu': 'Microsoft 365 Education Analytics'
    }

    return workloadNames[workload] || workload
  }

  /**
   * Get record type display name
   */
  static getRecordTypeDisplayName(recordType: ActivityRecordType): string {
    const recordTypeNames: Record<ActivityRecordType, string> = {
      [ActivityRecordType.AZURE_ACTIVE_DIRECTORY]: 'Azure Active Directory',
      [ActivityRecordType.EXCHANGE_ADMIN]: 'Exchange Admin',
      [ActivityRecordType.EXCHANGE_MAILBOX]: 'Exchange Mailbox',
      [ActivityRecordType.SHAREPOINT]: 'SharePoint',
      [ActivityRecordType.GENERAL]: 'General',
      [ActivityRecordType.DLP]: 'Data Loss Prevention',
      [ActivityRecordType.AZURE_ACTIVE_DIRECTORY_STS_LOGIN]: 'Azure AD STS Login',
      [ActivityRecordType.COMPLIANCE_DLP]: 'Compliance DLP',
      [ActivityRecordType.SHAREPOINT_SHARING]: 'SharePoint Sharing',
      [ActivityRecordType.EXCHANGE_AGGREGATED_OPERATION]: 'Exchange Aggregated Operation',
      [ActivityRecordType.POWER_BI]: 'Power BI',
      [ActivityRecordType.MICROSOFT_TEAMS]: 'Microsoft Teams',
      [ActivityRecordType.MICROSOFT_TEAMS_EDISCOVERY]: 'Microsoft Teams eDiscovery',
      [ActivityRecordType.THREAT_INVESTIGATION]: 'Threat Investigation',
      [ActivityRecordType.MICROSOFT_TEAMS_SHARING]: 'Microsoft Teams Sharing',
      [ActivityRecordType.EXCHANGE_WORKLOAD]: 'Exchange Workload',
      [ActivityRecordType.MICROSOFT_STREAM]: 'Microsoft Stream',
      [ActivityRecordType.YAMMER]: 'Yammer',
      [ActivityRecordType.MICROSOFT_365_LEARNING_ANALYTICS]: 'Microsoft 365 Learning Analytics',
      [ActivityRecordType.POWER_QUERY]: 'Power Query',
      [ActivityRecordType.MICROSOFT_FORMS]: 'Microsoft Forms',
      [ActivityRecordType.TO_DO]: 'Microsoft To Do',
      [ActivityRecordType.MICROSOFT_LAUNCHPAD]: 'Microsoft Launchpad',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS]: 'Microsoft 365 Insights',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN]: 'Microsoft 365 Learning Insights',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU]: 'Microsoft 365 Education Insights',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT]: 'Education Student Insights',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER]: 'Education Teacher Insights',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN]: 'Education Admin Insights',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT]: 'Education Parent Insights',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST]: 'Education Guest Insights',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER]: 'Education Other Insights',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT_ACTIVITY]: 'Student Activity',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER_ACTIVITY]: 'Teacher Activity',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN_ACTIVITY]: 'Admin Activity',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT_ACTIVITY]: 'Parent Activity',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST_ACTIVITY]: 'Guest Activity',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER_ACTIVITY]: 'Other Activity',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT_ASSIGNMENT]: 'Student Assignment',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER_ASSIGNMENT]: 'Teacher Assignment',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN_ASSIGNMENT]: 'Admin Assignment',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT_ASSIGNMENT]: 'Parent Assignment',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST_ASSIGNMENT]: 'Guest Assignment',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER_ASSIGNMENT]: 'Other Assignment',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT_GRADE]: 'Student Grade',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER_GRADE]: 'Teacher Grade',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN_GRADE]: 'Admin Grade',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT_GRADE]: 'Parent Grade',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST_GRADE]: 'Guest Grade',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER_GRADE]: 'Other Grade',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT_ATTENDANCE]: 'Student Attendance',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER_ATTENDANCE]: 'Teacher Attendance',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN_ATTENDANCE]: 'Admin Attendance',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT_ATTENDANCE]: 'Parent Attendance',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST_ATTENDANCE]: 'Guest Attendance',
      [ActivityRecordType.MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER_ATTENDANCE]: 'Other Attendance'
    }

    return recordTypeNames[recordType] || `Unknown (${recordType})`
  }

  /**
   * Get service status color
   */
  static getServiceStatusColor(status: string): string {
    switch (status) {
      case 'ServiceOperational':
        return 'text-green-600'
      case 'ServiceDegradation':
        return 'text-yellow-600'
      case 'ServiceInterruption':
        return 'text-red-600'
      case 'ServiceRestored':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  /**
   * Get service status badge variant
   */
  static getServiceStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'ServiceOperational':
        return 'default'
      case 'ServiceDegradation':
        return 'secondary'
      case 'ServiceInterruption':
        return 'destructive'
      case 'ServiceRestored':
        return 'outline'
      default:
        return 'secondary'
    }
  }
}

// Export types and utilities
export type {
  Office365Config,
  ServiceHealthStatus,
  ActivityRecord,
  Subscription,
  DateRange,
  PaginationOptions,
  FilterOptions
}

// Export the classes and functions with proper names
export const Office365ManagementApi = Office365ManagementApiClass
export const Office365Utils = Office365UtilsClass
export const useOffice365ManagementApi = useOffice365ManagementApiHook

export {
  ActivityRecordType,
  WorkloadType,
  Office365ApiEndpoint
}
