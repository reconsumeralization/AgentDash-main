/**
 * Enhanced TypeScript Types and Interfaces
 * Extends and improves the existing type system with better validation, safety, and developer experience
 */

import { z } from 'zod'

// ========== Enhanced Base Types ==========

export type ID = string
export type Timestamp = string // ISO 8601 format
export type Email = string
export type URL = string

// ========== Validation Schemas ==========

export const EmailSchema = z.string().email()
export const URLSchema = z.string().url()
export const UUIDSchema = z.string().uuid()
export const TimestampSchema = z.string().datetime()

// ========== Enhanced Error Types ==========

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Timestamp
  requestId?: string
  stack?: string
}

export interface ValidationError extends ApiError {
  field: string
  value: any
  constraint: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    pagination?: PaginationMetadata
    rateLimit?: RateLimitInfo
    performance?: PerformanceMetadata
    version: string
    timestamp: Timestamp
  }
}

export interface PaginationMetadata {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Timestamp
  retryAfter?: number
}

export interface PerformanceMetadata {
  duration: number
  cacheHit: boolean
  dbQueries: number
  memoryUsage: number
}

// ========== Enhanced User Types ==========

export const UserRoleSchema = z.enum(['user', 'admin', 'moderator', 'analyst'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const UserStatusSchema = z.enum(['active', 'inactive', 'suspended', 'pending'])
export type UserStatus = z.infer<typeof UserStatusSchema>

export interface EnhancedUser {
  id: ID
  clerkId: string
  email: Email
  name: string
  avatarUrl?: URL
  linkedinProfile?: URL
  role: UserRole
  status: UserStatus
  preferences: UserPreferences
  subscription?: SubscriptionInfo
  lastLoginAt?: Timestamp
  emailVerifiedAt?: Timestamp
  onboardingCompleted: boolean
  featureFlags: Record<string, boolean>
  metadata: Record<string, any>
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationPreferences
  privacy: PrivacySettings
  accessibility: AccessibilitySettings
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  types: {
    agentUpdates: boolean
    workflowCompletions: boolean
    securityAlerts: boolean
    connectionRequests: boolean
    marketingEmails: boolean
  }
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'connections' | 'private'
  activityVisibility: 'public' | 'connections' | 'private'
  dataSharing: boolean
  analyticsOptOut: boolean
}

export interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReaderSupport: boolean
}

export interface SubscriptionInfo {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  cancelAtPeriodEnd: boolean
  features: string[]
  limits: Record<string, number>
}

// ========== Enhanced Agent Types ==========

export const AgentTypeSchema = z.enum([
  'context',
  'research',
  'expert',
  'analysis',
  'automation',
  'integration',
  'monitoring',
  'optimization'
])
export type AgentType = z.infer<typeof AgentTypeSchema>

export const AgentStatusSchema = z.enum([
  'idle',
  'running',
  'paused',
  'error',
  'training',
  'deployed',
  'archived'
])
export type AgentStatus = z.infer<typeof AgentStatusSchema>

export interface EnhancedAgent {
  id: ID
  userId: ID
  name: string
  description?: string
  type: AgentType
  status: AgentStatus
  model: AIModelConfig
  systemPrompt: string
  capabilities: AgentCapability[]
  configuration: AgentConfiguration
  performance: AgentPerformanceMetrics
  usage: AgentUsageStats
  dependencies: AgentDependency[]
  version: string
  isPublic: boolean
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  lastUsedAt?: Timestamp
}

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'custom'
  model: string
  version?: string
  parameters: {
    temperature?: number
    maxTokens?: number
    topP?: number
    frequencyPenalty?: number
    presencePenalty?: number
    stopSequences?: string[]
  }
  fallbackModel?: AIModelConfig
}

export interface AgentCapability {
  id: string
  name: string
  description: string
  category: 'input' | 'processing' | 'output' | 'integration'
  parameters: CapabilityParameter[]
  requiredPermissions: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export interface CapabilityParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file'
  required: boolean
  description: string
  defaultValue?: any
  validation?: ValidationRule
}

export interface ValidationRule {
  min?: number
  max?: number
  pattern?: string
  enum?: string[]
  custom?: string // Custom validation function name
}

export interface AgentConfiguration {
  maxConcurrentTasks: number
  timeoutMs: number
  retryAttempts: number
  rateLimits: RateLimitConfig
  securitySettings: SecurityConfig
  integrations: IntegrationConfig[]
  monitoring: MonitoringConfig
}

export interface RateLimitConfig {
  requestsPerMinute: number
  tokensPerDay: number
  concurrentRequests: number
}

export interface SecurityConfig {
  sandboxed: boolean
  allowedDomains: string[]
  forbiddenPatterns: string[]
  requireApproval: boolean
  auditLevel: 'none' | 'basic' | 'detailed'
}

export interface MonitoringConfig {
  metricsEnabled: boolean
  loggingLevel: 'error' | 'warn' | 'info' | 'debug'
  alertThresholds: AlertThreshold[]
}

export interface AlertThreshold {
  metric: string
  operator: '>' | '<' | '=' | '>=' | '<='
  value: number
  action: 'log' | 'notify' | 'pause' | 'terminate'
}

export interface AgentPerformanceMetrics {
  averageResponseTime: number
  successRate: number
  errorRate: number
  tokensUsed: number
  cost: number
  reliability: number
  userSatisfaction: number
  lastCalculatedAt: Timestamp
}

export interface AgentUsageStats {
  totalExecutions: number
  totalRuntime: number
  activeUsers: number
  popularCapabilities: string[]
  commonErrors: string[]
  usageTrends: UsageTrend[]
}

export interface UsageTrend {
  period: string
  executions: number
  avgDuration: number
  successRate: number
}

export interface AgentDependency {
  type: 'agent' | 'service' | 'data' | 'model'
  identifier: string
  version?: string
  required: boolean
  status: 'available' | 'unavailable' | 'degraded'
}

// ========== Enhanced Workflow Types ==========

export const WorkflowStatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'completed',
  'failed',
  'cancelled',
  'archived'
])
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>

export interface EnhancedWorkflow {
  id: ID
  userId: ID
  name: string
  description?: string
  status: WorkflowStatus
  definition: WorkflowDefinition
  triggers: WorkflowTrigger[]
  schedule?: WorkflowSchedule
  execution: WorkflowExecution
  permissions: WorkflowPermissions
  analytics: WorkflowAnalytics
  version: string
  isTemplate: boolean
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface WorkflowDefinition {
  version: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables: WorkflowVariable[]
  errorHandling: ErrorHandlingConfig
}

export interface WorkflowNode {
  id: string
  type: 'start' | 'end' | 'task' | 'condition' | 'parallel' | 'delay' | 'human'
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
  agent?: AgentReference
  timeout?: number
  retryPolicy?: RetryPolicy
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  condition?: string
  label?: string
  weight?: number
}

export interface WorkflowVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  value?: any
  isSecret: boolean
  description?: string
  validation?: ValidationRule
}

export interface ErrorHandlingConfig {
  strategy: 'fail_fast' | 'continue' | 'retry' | 'fallback'
  maxRetries: number
  retryDelay: number
  fallbackNode?: string
  notifications: string[]
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event' | 'api'
  config: Record<string, any>
  isActive: boolean
}

export interface WorkflowSchedule {
  type: 'cron' | 'interval' | 'one_time'
  expression: string
  timezone: string
  nextRun?: Timestamp
  lastRun?: Timestamp
}

export interface WorkflowExecution {
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt?: Timestamp
  completedAt?: Timestamp
  currentNode?: string
  progress: number
  variables: Record<string, any>
  logs: WorkflowLog[]
  metrics: ExecutionMetrics
}

export interface WorkflowLog {
  id: string
  timestamp: Timestamp
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  nodeId?: string
  data?: Record<string, any>
}

export interface ExecutionMetrics {
  duration: number
  nodesExecuted: number
  nodesSkipped: number
  nodesFailed: number
  resourceUsage: ResourceUsage
}

export interface ResourceUsage {
  cpuTime: number
  memoryPeak: number
  tokensUsed: number
  apiCalls: number
  cost: number
}

export interface WorkflowPermissions {
  visibility: 'private' | 'team' | 'organization' | 'public'
  canEdit: string[]
  canExecute: string[]
  canView: string[]
}

export interface WorkflowAnalytics {
  totalExecutions: number
  successRate: number
  averageDuration: number
  costPerExecution: number
  popularPaths: string[]
  bottlenecks: string[]
  lastAnalyzedAt: Timestamp
}

// ========== Enhanced Knowledge Base Types ==========

export interface EnhancedKnowledgeBase {
  id: ID
  userId: ID
  name: string
  description?: string
  category: KnowledgeCategory
  type: 'personal' | 'shared' | 'public' | 'enterprise'
  configuration: KnowledgeBaseConfig
  access: AccessControl
  statistics: KnowledgeBaseStats
  indexing: IndexingConfig
  version: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const KnowledgeCategorySchema = z.enum([
  'general',
  'technical',
  'business',
  'personal',
  'project',
  'research',
  'training',
  'documentation'
])
export type KnowledgeCategory = z.infer<typeof KnowledgeCategorySchema>

export interface KnowledgeBaseConfig {
  autoIndexing: boolean
  duplicateDetection: boolean
  versionControl: boolean
  encryption: boolean
  retentionPolicy: RetentionPolicy
  searchSettings: SearchConfig
}

export interface RetentionPolicy {
  enabled: boolean
  duration: number // days
  archiveBeforeDelete: boolean
  exemptTags: string[]
}

export interface SearchConfig {
  indexTypes: ('text' | 'semantic' | 'visual')[]
  languages: string[]
  synonyms: Record<string, string[]>
  boostFactors: Record<string, number>
}

export interface AccessControl {
  owner: ID
  collaborators: Collaborator[]
  teams: string[]
  shareSettings: ShareSettings
}

export interface Collaborator {
  userId: ID
  role: 'viewer' | 'editor' | 'admin'
  permissions: string[]
  addedAt: Timestamp
  addedBy: ID
}

export interface ShareSettings {
  publicAccess: boolean
  requireAuthentication: boolean
  allowDownload: boolean
  watermark: boolean
  expiresAt?: Timestamp
}

export interface KnowledgeBaseStats {
  totalItems: number
  totalSize: number
  itemsByType: Record<string, number>
  lastAccessed: Timestamp
  accessCount: number
  searchQueries: number
  popularItems: string[]
}

export interface IndexingConfig {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  lastIndexed: Timestamp
  nextScheduled?: Timestamp
  vectorModel: string
  chunkSize: number
  overlapSize: number
  progress: number
}

// ========== Enhanced Integration Types ==========

export interface EnhancedIntegration {
  id: ID
  userId: ID
  name: string
  type: IntegrationType
  provider: string
  status: IntegrationStatus
  configuration: IntegrationConfiguration
  authentication: AuthenticationConfig
  capabilities: IntegrationCapability[]
  monitoring: IntegrationMonitoring
  health: HealthStatus
  usage: IntegrationUsage
  version: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const IntegrationTypeSchema = z.enum([
  'api',
  'webhook',
  'oauth',
  'database',
  'file_system',
  'cloud_storage',
  'email',
  'messaging',
  'social_media',
  'productivity',
  'analytics'
])
export type IntegrationType = z.infer<typeof IntegrationTypeSchema>

export const IntegrationStatusSchema = z.enum([
  'connected',
  'disconnected',
  'error',
  'configuring',
  'authenticating',
  'testing',
  'deprecated'
])
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>

export interface IntegrationConfiguration {
  endpoint?: URL
  apiVersion?: string
  timeout: number
  retryPolicy: RetryPolicy
  rateLimits: RateLimitConfig
  dataMapping: DataMapping[]
  filters: IntegrationFilter[]
}

export interface RetryPolicy {
  maxAttempts: number
  backoffStrategy: 'linear' | 'exponential' | 'custom'
  baseDelay: number
  maxDelay: number
  jitter: boolean
}

export interface DataMapping {
  source: string
  target: string
  transformation?: string
  required: boolean
  defaultValue?: any
}

export interface IntegrationFilter {
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'regex'
  value: any
  exclude?: boolean
}

export interface AuthenticationConfig {
  type: 'api_key' | 'oauth1' | 'oauth2' | 'basic' | 'bearer' | 'custom'
  credentials: Record<string, string> // Encrypted
  scopes: string[]
  expiresAt?: Timestamp
  refreshToken?: string
}

export interface IntegrationCapability {
  name: string
  type: 'read' | 'write' | 'execute' | 'webhook'
  description: string
  parameters: CapabilityParameter[]
  rateLimit?: number
  cost?: number
}

export interface IntegrationMonitoring {
  healthChecks: HealthCheck[]
  alerts: IntegrationAlert[]
  metrics: IntegrationMetrics
  logs: IntegrationLog[]
}

export interface HealthCheck {
  name: string
  endpoint?: string
  method: string
  expectedStatus: number
  interval: number
  timeout: number
  lastCheck?: Timestamp
  status: 'healthy' | 'unhealthy' | 'unknown'
}

export interface IntegrationAlert {
  type: 'error_rate' | 'latency' | 'quota' | 'auth_failure'
  threshold: number
  action: 'notify' | 'disable' | 'retry'
  enabled: boolean
  lastTriggered?: Timestamp
}

export interface IntegrationMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageLatency: number
  dataTransferred: number
  quotaUsed: number
  lastCalculated: Timestamp
}

export interface IntegrationLog {
  timestamp: Timestamp
  level: 'info' | 'warn' | 'error'
  operation: string
  duration: number
  status: number
  error?: string
  metadata?: Record<string, any>
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  lastChecked: Timestamp
  issues: HealthIssue[]
  uptime: number
}

export interface HealthIssue {
  type: 'authentication' | 'network' | 'quota' | 'configuration'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  firstOccurred: Timestamp
  lastOccurred: Timestamp
  count: number
}

export interface IntegrationUsage {
  requestsToday: number
  requestsThisMonth: number
  quotaLimit: number
  quotaUsed: number
  costToday: number
  costThisMonth: number
  popularEndpoints: string[]
}

// ========== Utility Types ==========

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type WithTimestamps<T> = T & {
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type WithMetadata<T> = T & {
  metadata: Record<string, any>
}

export type EntityWithRelations<T, R extends Record<string, any>> = T & R

// ========== Type Guards ==========

export function isApiError(error: any): error is ApiError {
  return error && typeof error.code === 'string' && typeof error.message === 'string'
}

export function isValidationError(error: any): error is ValidationError {
  return isApiError(error) && typeof error.field === 'string'
}

export function hasTimestamps(obj: any): obj is WithTimestamps<any> {
  return obj && typeof obj.createdAt === 'string' && typeof obj.updatedAt === 'string'
}

// ========== Schema Validation ==========

export const EnhancedUserSchema = z.object({
  id: UUIDSchema,
  clerkId: z.string(),
  email: EmailSchema,
  name: z.string().min(1).max(100),
  avatarUrl: URLSchema.optional(),
  linkedinProfile: URLSchema.optional(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  onboardingCompleted: z.boolean(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema
})

export const AgentConfigurationSchema = z.object({
  maxConcurrentTasks: z.number().min(1).max(100),
  timeoutMs: z.number().min(1000).max(300000),
  retryAttempts: z.number().min(0).max(5),
  rateLimits: z.object({
    requestsPerMinute: z.number().min(1),
    tokensPerDay: z.number().min(1),
    concurrentRequests: z.number().min(1)
  })
})

export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'end', 'task', 'condition', 'parallel', 'delay', 'human']),
  name: z.string().min(1),
  config: z.record(z.any()),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
})

// ========== Factory Functions ==========

export function createApiResponse<T>(
  data: T,
  meta?: Partial<ApiResponse<T>['meta']>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...meta
    }
  }
}

export function createApiError(
  code: string,
  message: string,
  details?: Record<string, any>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  }
}

export function createValidationError(
  field: string,
  value: any,
  constraint: string
): ValidationError {
  return {
    code: 'VALIDATION_ERROR',
    message: `Validation failed for field '${field}': ${constraint}`,
    field,
    value,
    constraint,
    timestamp: new Date().toISOString()
  }
}