// Enhanced TypeScript utility types for better type safety

// ============================================================================
// UTILITY TYPES FOR BETTER TYPE INFERENCE
// ============================================================================

// Note: Optional, DeepPartial, and NonNullable are already exported from ./types.ts
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

// ============================================================================
// ENHANCED BASE TYPES
// ============================================================================

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  version?: number
}

export interface TimestampedEntity extends BaseEntity {
  lastModified: Date
  createdBy: string
  modifiedBy?: string
}

// ============================================================================
// STRICT VALIDATION TYPES
// ============================================================================

export type StrictString<T extends string> = T extends '' ? never : T
export type NonEmptyArray<T> = T[] & { 0: T }
export type PositiveNumber = number & { __brand: 'positive' }
export type Email = string & { __brand: 'email' }
export type URL = string & { __brand: 'url' }
export type ISO8601Date = string & { __brand: 'iso8601' }

// ============================================================================
// ENHANCED SOCIAL MEDIA TYPES
// ============================================================================

// Note: SocialPlatform is already exported from ./social-skins.ts
export type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error' | 'expired'
export type PerformanceRating = 'excellent' | 'good' | 'average' | 'poor'
export type UserRole = 'admin' | 'user' | 'moderator' | 'premium' | 'enterprise'
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'business' | 'enterprise'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'paused'

export interface EnhancedSocialProfile extends BaseEntity {
  platform: string // SocialPlatform from ./social-skins.ts
  profileId: StrictString<string>
  username: StrictString<string>
  displayName: StrictString<string>
  avatar?: URL
  bio?: string
  followers: PositiveNumber
  following: PositiveNumber
  isVerified: boolean
  isActive: boolean
  lastSync: Date
  connectionStatus: ConnectionStatus
}

// ============================================================================
// API RESPONSE TYPES WITH BETTER ERROR HANDLING
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

export interface ApiError {
  code: StrictString<string>
  message: StrictString<string>
  details?: Record<string, any>
  stack?: string
  timestamp: Date
}

export interface ApiMeta {
  timestamp: Date
  requestId: StrictString<string>
  version: StrictString<string>
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page: PositiveNumber
  limit: PositiveNumber
  total: PositiveNumber
  totalPages: PositiveNumber
  hasNext: boolean
  hasPrevious: boolean
}

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

export function isPositiveNumber(value: number): value is PositiveNumber {
  return value > 0
}

export function isValidEmail(value: string): value is Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

export function isValidURL(value: string): value is URL {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function isNonEmptyString<T extends string>(value: T): value is StrictString<T> {
  return value.trim().length > 0
}

export function createPositiveNumber(value: number): PositiveNumber {
  if (!isPositiveNumber(value)) {
    throw new Error(`Value ${value} is not a positive number`)
  }
  return value as PositiveNumber
}

export function createEmail(value: string): Email {
  if (!isValidEmail(value)) {
    throw new Error(`Value ${value} is not a valid email`)
  }
  return value as Email
}

export function createURL(value: string): URL {
  if (!isValidURL(value)) {
    throw new Error(`Value ${value} is not a valid URL`)
  }
  return value as URL
}

// ============================================================================
// TYPE GUARDS FOR RUNTIME VALIDATION
// ============================================================================

export function isBaseEntity(obj: any): obj is BaseEntity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  )
}

export function isTimestampedEntity(obj: any): obj is TimestampedEntity {
  return (
    isBaseEntity(obj) &&
    'lastModified' in obj &&
    obj.lastModified instanceof Date &&
    'createdBy' in obj &&
    typeof obj.createdBy === 'string'
  )
}

export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.success === 'boolean'
  )
}

export function isApiError(obj: any): obj is ApiError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.code === 'string' &&
    typeof obj.message === 'string' &&
    obj.timestamp instanceof Date
  )
}

// ============================================================================
// RESULT TYPE FOR BETTER ERROR HANDLING
// ============================================================================

export type Result<T, E = ApiError> = 
  | { success: true; data: T }
  | { success: false; error: E }

export function createSuccess<T>(data: T): Result<T> {
  return { success: true, data }
}

export function createError<E = ApiError>(error: E): Result<never, E> {
  return { success: false, error }
}

export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success
}

export function isError<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success
}

// ============================================================================
// ENHANCED CONFIGURATION TYPES
// ============================================================================

export interface StrictConfig {
  apiUrl: URL
  timeout: PositiveNumber
  retries: PositiveNumber
  enableLogging: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface DatabaseConfig {
  host: StrictString<string>
  port: PositiveNumber
  database: StrictString<string>
  username: StrictString<string>
  password: StrictString<string>
  ssl: boolean
  maxConnections: PositiveNumber
}

export interface AuthConfig {
  jwtSecret: StrictString<string>
  jwtExpiry: StrictString<string>
  refreshTokenExpiry: StrictString<string>
  bcryptRounds: PositiveNumber
}

// ============================================================================
// ENHANCED SOCIAL MEDIA SPECIFIC TYPES
// ============================================================================

export interface SentimentScore {
  overall: 'positive' | 'negative' | 'neutral'
  score: number // -1 to 1
  confidence: number // 0 to 1
}

export interface EngagementMetrics {
  likes: PositiveNumber
  comments: PositiveNumber
  shares: PositiveNumber
  saves: PositiveNumber
  clicks: PositiveNumber
  impressions: PositiveNumber
  reach: PositiveNumber
  engagementRate: number // 0 to 1
}

export interface PostContent {
  text: StrictString<string>
  images: NonEmptyArray<URL> | []
  videos: NonEmptyArray<URL> | []
  hashtags: NonEmptyArray<StrictString<string>> | []
  mentions: NonEmptyArray<StrictString<string>> | []
}

// ============================================================================
// EXPORT TYPES FOR CONVENIENCE
// ============================================================================

// All types are already exported above as individual interface/type declarations
