// Social Media Type Validators for Enhanced Type Safety

import { 
  StrictString, 
  PositiveNumber, 
  Email, 
  URL,
  isPositiveNumber,
  isValidEmail,
  isValidURL,
  isNonEmptyString,
  createPositiveNumber,
  createEmail,
  createURL,
  Result,
  createSuccess,
  createError,
  ApiError
} from './type-utils'
import { SocialPost, SocialAccount, PostContent, PostEngagement } from './social-media-types'

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export interface ValidationError extends ApiError {
  field: string
  value: any
  expectedType: string
}

export function createValidationError(
  field: string, 
  value: any, 
  expectedType: string,
  message?: string
): ValidationError {
  return {
    code: 'VALIDATION_ERROR',
    message: message || `Invalid ${field}: expected ${expectedType}, got ${typeof value}`,
    field,
    value,
    expectedType,
    timestamp: new Date()
  }
}

// ============================================================================
// SOCIAL ACCOUNT VALIDATORS
// ============================================================================

export function validateSocialAccount(data: any): Result<SocialAccount, ValidationError> {
  if (!data || typeof data !== 'object') {
    return createError(createValidationError('data', data, 'object', 'Social account data must be an object'))
  }

  // Validate required string fields
  if (!isNonEmptyString(data.id)) {
    return createError(createValidationError('id', data.id, 'non-empty string'))
  }

  if (!isNonEmptyString(data.platform)) {
    return createError(createValidationError('platform', data.platform, 'non-empty string'))
  }

  if (!isNonEmptyString(data.username)) {
    return createError(createValidationError('username', data.username, 'non-empty string'))
  }

  if (!isNonEmptyString(data.displayName)) {
    return createError(createValidationError('displayName', data.displayName, 'non-empty string'))
  }

  // Validate profile picture URL if provided
  if (data.profilePicture && !isValidURL(data.profilePicture)) {
    return createError(createValidationError('profilePicture', data.profilePicture, 'valid URL'))
  }

  // Validate numeric fields
  if (!isPositiveNumber(data.followers)) {
    return createError(createValidationError('followers', data.followers, 'positive number'))
  }

  if (!isPositiveNumber(data.following)) {
    return createError(createValidationError('following', data.following, 'positive number'))
  }

  // Validate boolean fields
  if (typeof data.isVerified !== 'boolean') {
    return createError(createValidationError('isVerified', data.isVerified, 'boolean'))
  }

  if (typeof data.isActive !== 'boolean') {
    return createError(createValidationError('isActive', data.isActive, 'boolean'))
  }

  // Validate date fields
  if (!(data.lastSync instanceof Date) && !Date.parse(data.lastSync)) {
    return createError(createValidationError('lastSync', data.lastSync, 'Date'))
  }

  // Validate permissions array
  if (!Array.isArray(data.permissions)) {
    return createError(createValidationError('permissions', data.permissions, 'array'))
  }

  const validatedAccount: SocialAccount = {
    id: data.id,
    platform: data.platform,
    username: data.username,
    displayName: data.displayName,
    profilePicture: data.profilePicture || '',
    followers: createPositiveNumber(data.followers),
    following: createPositiveNumber(data.following),
    isVerified: data.isVerified,
    isActive: data.isActive,
    lastSync: data.lastSync instanceof Date ? data.lastSync : new Date(data.lastSync),
    permissions: data.permissions,
    metadata: data.metadata || {}
  }

  return createSuccess(validatedAccount)
}

// ============================================================================
// POST CONTENT VALIDATORS
// ============================================================================

export function validatePostContent(data: any): Result<PostContent, ValidationError> {
  if (!data || typeof data !== 'object') {
    return createError(createValidationError('data', data, 'object', 'Post content data must be an object'))
  }

  // Validate text content
  if (!isNonEmptyString(data.text)) {
    return createError(createValidationError('text', data.text, 'non-empty string'))
  }

  // Validate arrays
  if (!Array.isArray(data.images)) {
    return createError(createValidationError('images', data.images, 'array'))
  }

  if (!Array.isArray(data.videos)) {
    return createError(createValidationError('videos', data.videos, 'array'))
  }

  if (!Array.isArray(data.links)) {
    return createError(createValidationError('links', data.links, 'array'))
  }

  if (!Array.isArray(data.hashtags)) {
    return createError(createValidationError('hashtags', data.hashtags, 'array'))
  }

  if (!Array.isArray(data.mentions)) {
    return createError(createValidationError('mentions', data.mentions, 'array'))
  }

  // Validate image URLs
  for (let i = 0; i < data.images.length; i++) {
    const image = data.images[i]
    if (!image.url || !isValidURL(image.url)) {
      return createError(createValidationError(`images[${i}].url`, image.url, 'valid URL'))
    }
  }

  // Validate video URLs
  for (let i = 0; i < data.videos.length; i++) {
    const video = data.videos[i]
    if (!video.url || !isValidURL(video.url)) {
      return createError(createValidationError(`videos[${i}].url`, video.url, 'valid URL'))
    }
  }

  // Validate link URLs
  for (let i = 0; i < data.links.length; i++) {
    const link = data.links[i]
    if (!link.url || !isValidURL(link.url)) {
      return createError(createValidationError(`links[${i}].url`, link.url, 'valid URL'))
    }
  }

  // Validate hashtags are non-empty strings
  for (let i = 0; i < data.hashtags.length; i++) {
    const hashtag = data.hashtags[i]
    if (!isNonEmptyString(hashtag)) {
      return createError(createValidationError(`hashtags[${i}]`, hashtag, 'non-empty string'))
    }
  }

  // Validate mentions are non-empty strings
  for (let i = 0; i < data.mentions.length; i++) {
    const mention = data.mentions[i]
    if (!isNonEmptyString(mention)) {
      return createError(createValidationError(`mentions[${i}]`, mention, 'non-empty string'))
    }
  }

  const validatedContent: PostContent = {
    text: data.text,
    images: data.images,
    videos: data.videos,
    links: data.links,
    hashtags: data.hashtags,
    mentions: data.mentions,
    location: data.location,
    poll: data.poll
  }

  return createSuccess(validatedContent)
}

// ============================================================================
// POST ENGAGEMENT VALIDATORS
// ============================================================================

export function validatePostEngagement(data: any): Result<PostEngagement, ValidationError> {
  if (!data || typeof data !== 'object') {
    return createError(createValidationError('data', data, 'object', 'Post engagement data must be an object'))
  }

  // Validate all numeric fields are positive numbers
  const numericFields = [
    'likes', 'comments', 'shares', 'saves', 'clicks', 
    'impressions', 'reach', 'engagementRate'
  ]

  for (const field of numericFields) {
    if (typeof data[field] !== 'number' || data[field] < 0) {
      return createError(createValidationError(field, data[field], 'non-negative number'))
    }
  }

  // Validate engagement rate is between 0 and 1
  if (data.engagementRate > 1) {
    return createError(createValidationError('engagementRate', data.engagementRate, 'number between 0 and 1'))
  }

  // Validate lastUpdated is a valid date
  if (!(data.lastUpdated instanceof Date) && !Date.parse(data.lastUpdated)) {
    return createError(createValidationError('lastUpdated', data.lastUpdated, 'Date'))
  }

  const validatedEngagement: PostEngagement = {
    likes: data.likes,
    comments: data.comments,
    shares: data.shares,
    saves: data.saves,
    clicks: data.clicks,
    impressions: data.impressions,
    reach: data.reach,
    engagementRate: data.engagementRate,
    lastUpdated: data.lastUpdated instanceof Date ? data.lastUpdated : new Date(data.lastUpdated)
  }

  return createSuccess(validatedEngagement)
}

// ============================================================================
// SOCIAL POST VALIDATORS
// ============================================================================

export function validateSocialPost(data: any): Result<SocialPost, ValidationError> {
  if (!data || typeof data !== 'object') {
    return createError(createValidationError('data', data, 'object', 'Social post data must be an object'))
  }

  // Validate required string fields
  if (!isNonEmptyString(data.id)) {
    return createError(createValidationError('id', data.id, 'non-empty string'))
  }

  if (!isNonEmptyString(data.platform)) {
    return createError(createValidationError('platform', data.platform, 'non-empty string'))
  }

  if (!isNonEmptyString(data.accountId)) {
    return createError(createValidationError('accountId', data.accountId, 'non-empty string'))
  }

  // Validate status
  const validStatuses = ['draft', 'scheduled', 'published', 'failed', 'deleted']
  if (!validStatuses.includes(data.status)) {
    return createError(createValidationError('status', data.status, `one of: ${validStatuses.join(', ')}`))
  }

  // Validate content
  const contentResult = validatePostContent(data.content)
  if (!contentResult.success) {
    return contentResult
  }

  // Validate engagement
  const engagementResult = validatePostEngagement(data.engagement)
  if (!engagementResult.success) {
    return engagementResult
  }

  // Validate dates
  if (!(data.createdAt instanceof Date) && !Date.parse(data.createdAt)) {
    return createError(createValidationError('createdAt', data.createdAt, 'Date'))
  }

  if (!(data.updatedAt instanceof Date) && !Date.parse(data.updatedAt)) {
    return createError(createValidationError('updatedAt', data.updatedAt, 'Date'))
  }

  // Validate optional scheduled date
  if (data.scheduledAt && !(data.scheduledAt instanceof Date) && !Date.parse(data.scheduledAt)) {
    return createError(createValidationError('scheduledAt', data.scheduledAt, 'Date'))
  }

  // Validate optional published date
  if (data.publishedAt && !(data.publishedAt instanceof Date) && !Date.parse(data.publishedAt)) {
    return createError(createValidationError('publishedAt', data.publishedAt, 'Date'))
  }

  const validatedPost: SocialPost = {
    id: data.id,
    platform: data.platform,
    accountId: data.accountId,
    content: contentResult.data,
    status: data.status,
    scheduledAt: data.scheduledAt ? (data.scheduledAt instanceof Date ? data.scheduledAt : new Date(data.scheduledAt)) : undefined,
    publishedAt: data.publishedAt ? (data.publishedAt instanceof Date ? data.publishedAt : new Date(data.publishedAt)) : undefined,
    engagement: engagementResult.data,
    metadata: data.metadata || {},
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt)
  }

  return createSuccess(validatedPost)
}

// ============================================================================
// BATCH VALIDATION HELPERS
// ============================================================================

export function validateSocialAccounts(accounts: any[]): Result<SocialAccount[], ValidationError[]> {
  if (!Array.isArray(accounts)) {
    return createError([createValidationError('accounts', accounts, 'array')])
  }

  const validatedAccounts: SocialAccount[] = []
  const errors: ValidationError[] = []

  for (let i = 0; i < accounts.length; i++) {
    const result = validateSocialAccount(accounts[i])
    if (result.success) {
      validatedAccounts.push(result.data)
    } else {
      errors.push({
        ...result.error,
        field: `accounts[${i}].${result.error.field}`
      })
    }
  }

  if (errors.length > 0) {
    return createError(errors)
  }

  return createSuccess(validatedAccounts)
}

export function validateSocialPosts(posts: any[]): Result<SocialPost[], ValidationError[]> {
  if (!Array.isArray(posts)) {
    return createError([createValidationError('posts', posts, 'array')])
  }

  const validatedPosts: SocialPost[] = []
  const errors: ValidationError[] = []

  for (let i = 0; i < posts.length; i++) {
    const result = validateSocialPost(posts[i])
    if (result.success) {
      validatedPosts.push(result.data)
    } else {
      errors.push({
        ...result.error,
        field: `posts[${i}].${result.error.field}`
      })
    }
  }

  if (errors.length > 0) {
    return createError(errors)
  }

  return createSuccess(validatedPosts)
}

// ============================================================================
// VALIDATION MIDDLEWARE HELPER
// ============================================================================

export function createValidationMiddleware<T>(
  validator: (data: any) => Result<T, ValidationError>
) {
  return (data: any): T => {
    const result = validator(data)
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`)
    }
    return result.data
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { ValidationError }
