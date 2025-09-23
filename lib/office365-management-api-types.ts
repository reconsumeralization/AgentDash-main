/**
 * Office 365 Management API Types
 * Based on Office 365 Management APIs overview
 * @see https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-apis-overview
 */

// Base API Configuration
export interface Office365Config {
  tenantId: string
  clientId: string
  clientSecret: string
  baseUrl?: string
}

// Authentication Types
export interface Office365TokenResponse {
  token_type: string
  expires_in: number
  access_token: string
  scope: string
}

export interface Office365AuthRequest {
  client_id: string
  client_secret: string
  scope: string
  grant_type: 'client_credentials'
}

// Service Communications API Types
export interface ServiceHealthStatus {
  id: string
  title: string
  status: 'ServiceOperational' | 'ServiceDegradation' | 'ServiceInterruption' | 'ServiceRestored'
  impactDescription: string
  affectedServices: string[]
  lastUpdatedTime: string
  startTime?: string
  endTime?: string
  isResolved: boolean
  incidentType: 'Advisory' | 'Incident'
  classification: 'Advisory' | 'Incident'
  featureGroup: string
  featureName: string
  id: string
  status: string
  title: string
  impactDescription: string
  affectedServices: string[]
  lastUpdatedTime: string
  startTime?: string
  endTime?: string
  isResolved: boolean
  incidentType: 'Advisory' | 'Incident'
  classification: 'Advisory' | 'Incident'
  featureGroup: string
  featureName: string
}

export interface ServiceCommunicationsResponse {
  value: ServiceHealthStatus[]
  '@odata.nextLink'?: string
}

// Management Activity API Types
export interface ActivityRecord {
  CreationTime: string
  Id: string
  Operation: string
  OrganizationId: string
  RecordType: number
  ResultStatus: string
  UserKey: string
  UserType: number
  Version: number
  Workload: string
  ClientIP: string
  ObjectId: string
  UserId: string
  AzureActiveDirectoryEventType: number
  ExtendedProperties: Array<{
    Name: string
    Value: string
  }>
  ModifiedProperties: Array<{
    Name: string
    NewValue: string
    OldValue: string
  }>
  Actor: Array<{
    ID: string
    Type: string
  }>
  ActorContextId: string
  ActorIpAddress: string
  InterSystemsId: string
  IntraSystemsId: string
  SupportTicketId: string
  Target: Array<{
    ID: string
    Type: string
  }>
  TargetUpdatedProperties: Array<{
    Name: string
    NewValue: string
    OldValue: string
  }>
}

export interface ManagementActivityResponse {
  contentUri: string
  contentType: string
  contentId: string
  contentCreated: string
  contentExpiration: string
}

export interface Subscription {
  contentType: string
  status: 'enabled' | 'disabled'
  webhook: {
    address: string
    authId: string
    expiration: string
  }
}

// API Endpoints and Operations
export enum Office365ApiEndpoint {
  SERVICE_COMMUNICATIONS = 'https://manage.office.com/api/v1.0',
  MANAGEMENT_ACTIVITY = 'https://manage.office.com/api/v1.0',
  AUTH_TOKEN = 'https://login.microsoftonline.com'
}

export enum ActivityRecordType {
  AZURE_ACTIVE_DIRECTORY = 0,
  EXCHANGE_ADMIN = 1,
  EXCHANGE_MAILBOX = 2,
  SHAREPOINT = 3,
  GENERAL = 4,
  DLP = 5,
  AZURE_ACTIVE_DIRECTORY_STS_LOGIN = 6,
  COMPLIANCE_DLP = 7,
  SHAREPOINT_SHARING = 8,
  EXCHANGE_AGGREGATED_OPERATION = 9,
  POWER_BI = 10,
  MICROSOFT_TEAMS = 11,
  MICROSOFT_TEAMS_EDISCOVERY = 12,
  THREAT_INVESTIGATION = 13,
  MICROSOFT_TEAMS_SHARING = 14,
  EXCHANGE_WORKLOAD = 15,
  MICROSOFT_STREAM = 16,
  YAMMER = 17,
  MICROSOFT_365_LEARNING_ANALYTICS = 18,
  POWER_QUERY = 19,
  MICROSOFT_FORMS = 20,
  TO_DO = 21,
  MICROSOFT_LAUNCHPAD = 22,
  MICROSOFT_365_INSIGHTS = 23,
  MICROSOFT_365_INSIGHTS_LEARN = 24,
  MICROSOFT_365_INSIGHTS_LEARN_EDU = 25,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT = 26,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER = 27,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN = 28,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT = 29,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST = 30,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER = 31,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT_ACTIVITY = 32,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER_ACTIVITY = 33,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN_ACTIVITY = 34,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT_ACTIVITY = 35,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST_ACTIVITY = 36,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER_ACTIVITY = 37,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT_ASSIGNMENT = 38,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER_ASSIGNMENT = 39,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN_ASSIGNMENT = 40,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT_ASSIGNMENT = 41,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST_ASSIGNMENT = 42,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER_ASSIGNMENT = 43,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT_GRADE = 44,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER_GRADE = 45,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN_GRADE = 46,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT_GRADE = 47,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST_GRADE = 48,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER_GRADE = 49,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_STUDENT_ATTENDANCE = 50,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_TEACHER_ATTENDANCE = 51,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_ADMIN_ATTENDANCE = 52,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_PARENT_ATTENDANCE = 53,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_GUEST_ATTENDANCE = 54,
  MICROSOFT_365_INSIGHTS_LEARN_EDU_OTHER_ATTENDANCE = 55
}

export enum WorkloadType {
  EXCHANGE = 'Exchange',
  SHAREPOINT = 'SharePoint',
  AZURE_ACTIVE_DIRECTORY = 'AzureActiveDirectory',
  GENERAL = 'General',
  DLP = 'DLP',
  POWER_BI = 'PowerBI',
  MICROSOFT_TEAMS = 'MicrosoftTeams',
  MICROSOFT_STREAM = 'MicrosoftStream',
  YAMMER = 'Yammer',
  MICROSOFT_FORMS = 'MicrosoftForms',
  TO_DO = 'ToDo',
  MICROSOFT_LAUNCHPAD = 'MicrosoftLaunchpad',
  MICROSOFT_365_INSIGHTS = 'Microsoft365Insights',
  MICROSOFT_365_INSIGHTS_LEARN = 'Microsoft365InsightsLearn',
  MICROSOFT_365_INSIGHTS_LEARN_EDU = 'Microsoft365InsightsLearnEdu'
}

// Error Types
export interface Office365Error {
  error: {
    code: string
    message: string
    innerError?: {
      'request-id': string
      date: string
    }
  }
}

// Utility Types
export interface DateRange {
  startTime: string
  endTime: string
}

export interface PaginationOptions {
  skip?: number
  top?: number
}

export interface FilterOptions {
  contentType?: string
  startTime?: string
  endTime?: string
  recordType?: ActivityRecordType
  workload?: WorkloadType
}

// Response Types
export interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface PaginatedResponse<T> {
  value: T[]
  '@odata.nextLink'?: string
  '@odata.count'?: number
}

// Webhook Types
export interface WebhookNotification {
  contentType: string
  contentId: string
  contentUri: string
  contentCreated: string
  contentExpiration: string
  notificationSentTime: string
  webhook: {
    address: string
    authId: string
    expiration: string
  }
}

// Export all types
export type {
  Office365Config,
  Office365TokenResponse,
  Office365AuthRequest,
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
  WebhookNotification
}
