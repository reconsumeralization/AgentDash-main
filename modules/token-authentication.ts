/**
 * Token Authentication Module
 * Session-based secure token management for Zero Trust Data Access
 */

export interface SecureToken {
  id: string
  userId: string
  deviceId: string
  sessionId: string
  encryptionKey: string
  hmacKey: string
  permissions: TokenPermission[]
  metadata: TokenMetadata
  expiresAt: Date
  issuedAt: Date
  lastUsedAt: Date
  usageCount: number
  maxUsageCount?: number
  revoked: boolean
  revocationReason?: string
}

export interface TokenPermission {
  resourceType: 'file' | 'folder' | 'device' | 'api'
  resourceId: string
  actions: string[]
  conditions?: TokenCondition[]
}

export interface TokenCondition {
  type: 'time_window' | 'ip_range' | 'device_type' | 'location'
  value: any
  operator: 'equals' | 'in' | 'not_in' | 'between'
}

export interface TokenMetadata {
  ipAddress: string
  userAgent: string
  deviceFingerprint: string
  location?: {
    country: string
    city: string
    coordinates: [number, number]
  }
  riskScore: number
  mfaVerified: boolean
  deviceVerified: boolean
  sessionType: 'interactive' | 'api' | 'service'
}

export interface TokenRequest {
  userId: string
  deviceId: string
  permissions: TokenPermission[]
  sessionType: 'interactive' | 'api' | 'service'
  validityPeriod?: number // minutes
  maxUsageCount?: number
  metadata: Partial<TokenMetadata>
}

export interface TokenValidation {
  valid: boolean
  token?: SecureToken
  error?: string
  warnings?: string[]
  requiresRefresh?: boolean
}

export interface TokenSession {
  id: string
  userId: string
  deviceId: string
  tokens: SecureToken[]
  startedAt: Date
  lastActivity: Date
  activeTokens: number
  riskScore: number
  status: 'active' | 'suspended' | 'terminated'
}

export interface TokenAuditEvent {
  id: string
  timestamp: Date
  tokenId: string
  userId: string
  action: 'issued' | 'validated' | 'refreshed' | 'revoked' | 'expired' | 'used'
  ipAddress: string
  userAgent: string
  success: boolean
  details: Record<string, any>
}

export interface TokenAuthenticationInterface {
  // Token Lifecycle Management
  issueToken(request: TokenRequest): Promise<SecureToken>
  validateToken(tokenId: string, context?: TokenValidationContext): Promise<TokenValidation>
  refreshToken(tokenId: string): Promise<SecureToken>
  revokeToken(tokenId: string, reason: string): Promise<void>
  revokeUserTokens(userId: string, reason: string): Promise<number>

  // Session Management
  createSession(userId: string, deviceId: string): Promise<TokenSession>
  getActiveSessions(userId: string): Promise<TokenSession[]>
  terminateSession(sessionId: string, reason: string): Promise<void>

  // Token Encryption & Security
  encryptTokenData(data: any, key: string): Promise<string>
  decryptTokenData(encryptedData: string, key: string): Promise<any>
  rotateEncryptionKeys(): Promise<void>

  // Audit & Monitoring
  logTokenEvent(event: Omit<TokenAuditEvent, 'id' | 'timestamp'>): Promise<void>
  getTokenHistory(tokenId: string): Promise<TokenAuditEvent[]>
  detectTokenAnomalies(timeWindow: { start: Date, end: Date }): Promise<TokenAnomaly[]>

  // Risk Assessment
  assessTokenRisk(token: SecureToken, context: TokenValidationContext): Promise<TokenRiskAssessment>

  // Cleanup & Maintenance
  cleanupExpiredTokens(): Promise<number>
  cleanupRevokedTokens(olderThan: Date): Promise<number>
}

export interface TokenValidationContext {
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
    coordinates: [number, number]
  }
  deviceFingerprint: string
  requestedAction?: string
  resourceId?: string
}

export interface TokenAnomaly {
  type: 'unusual_location' | 'unusual_time' | 'unusual_device' | 'high_usage' | 'suspicious_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  tokenId: string
  description: string
  evidence: Record<string, any>
  timestamp: Date
}

export interface TokenRiskAssessment {
  overallRisk: number // 0-100
  riskFactors: Array<{
    factor: string
    score: number
    evidence: string
  }>
  recommendations: string[]
  requiresAdditionalVerification: boolean
}

// Implementation
export class TokenAuthentication implements TokenAuthenticationInterface {
  private activeTokens = new Map<string, SecureToken>()
  private tokenSessions = new Map<string, TokenSession>()
  private auditEvents: TokenAuditEvent[] = []
  private encryptionKeys = new Map<string, { key: string, expiresAt: Date }>()

  // Configuration
  private config = {
    tokenValidityMinutes: 60,
    maxTokensPerSession: 10,
    maxSessionsPerUser: 5,
    keyRotationHours: 24,
    enableAnomalyDetection: true,
    riskThreshold: 70
  }

  async issueToken(request: TokenRequest): Promise<SecureToken> {
    // Generate unique token ID
    const tokenId = this.generateSecureId()

    // Generate encryption keys
    const encryptionKey = await this.generateEncryptionKey()
    const hmacKey = await this.generateHMACKey()

    // Create session if not exists
    let session = this.getUserSession(request.userId, request.deviceId)
    if (!session) {
      session = await this.createSession(request.userId, request.deviceId)
    }

    // Check session limits
    if (session.tokens.length >= this.config.maxTokensPerSession) {
      throw new Error('Maximum tokens per session exceeded')
    }

    // Generate token metadata
    const metadata: TokenMetadata = {
      ipAddress: request.metadata.ipAddress || '',
      userAgent: request.metadata.userAgent || '',
      deviceFingerprint: request.metadata.deviceFingerprint || '',
      location: request.metadata.location,
      riskScore: request.metadata.riskScore || 0,
      mfaVerified: request.metadata.mfaVerified || false,
      deviceVerified: request.metadata.deviceVerified || false,
      sessionType: request.sessionType
    }

    // Create token
    const token: SecureToken = {
      id: tokenId,
      userId: request.userId,
      deviceId: request.deviceId,
      sessionId: session.id,
      encryptionKey,
      hmacKey,
      permissions: request.permissions,
      metadata,
      expiresAt: new Date(Date.now() + (request.validityPeriod || this.config.tokenValidityMinutes) * 60 * 1000),
      issuedAt: new Date(),
      lastUsedAt: new Date(),
      usageCount: 0,
      maxUsageCount: request.maxUsageCount,
      revoked: false
    }

    // Store token
    this.activeTokens.set(tokenId, token)
    session.tokens.push(token)
    session.activeTokens++

    // Log token issuance
    await this.logTokenEvent({
      tokenId,
      userId: request.userId,
      action: 'issued',
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      success: true,
      details: { sessionId: session.id, permissionsCount: request.permissions.length }
    })

    return token
  }

  async validateToken(tokenId: string, context?: TokenValidationContext): Promise<TokenValidation> {
    const token = this.activeTokens.get(tokenId)

    if (!token) {
      await this.logTokenEvent({
        tokenId,
        userId: '',
        action: 'validated',
        ipAddress: context?.ipAddress || '',
        userAgent: context?.userAgent || '',
        success: false,
        details: { error: 'Token not found' }
      })
      return { valid: false, error: 'Token not found' }
    }

    // Check if revoked
    if (token.revoked) {
      return { valid: false, error: 'Token has been revoked' }
    }

    // Check expiration
    if (new Date() > token.expiresAt) {
      await this.revokeToken(tokenId, 'Token expired')
      return { valid: false, error: 'Token expired' }
    }

    // Check usage limits
    if (token.maxUsageCount && token.usageCount >= token.maxUsageCount) {
      await this.revokeToken(tokenId, 'Usage limit exceeded')
      return { valid: false, error: 'Usage limit exceeded' }
    }

    // Validate context if provided
    if (context) {
      const contextValidation = await this.validateTokenContext(token, context)
      if (!contextValidation.valid) {
        return contextValidation
      }
    }

    // Assess risk
    const riskAssessment = await this.assessTokenRisk(token, context || {} as TokenValidationContext)

    // Update token usage
    token.usageCount++
    token.lastUsedAt = new Date()

    // Check if refresh is needed (close to expiration)
    const timeToExpiry = token.expiresAt.getTime() - Date.now()
    const requiresRefresh = timeToExpiry < 10 * 60 * 1000 // 10 minutes

    const warnings: string[] = []
    if (riskAssessment.overallRisk > this.config.riskThreshold) {
      warnings.push('High risk score detected')
    }
    if (requiresRefresh) {
      warnings.push('Token expires soon')
    }

    // Log validation
    await this.logTokenEvent({
      tokenId,
      userId: token.userId,
      action: 'validated',
      ipAddress: context?.ipAddress || '',
      userAgent: context?.userAgent || '',
      success: true,
      details: { riskScore: riskAssessment.overallRisk, usageCount: token.usageCount }
    })

    return {
      valid: true,
      token,
      warnings: warnings.length > 0 ? warnings : undefined,
      requiresRefresh
    }
  }

  async refreshToken(tokenId: string): Promise<SecureToken> {
    const existingToken = this.activeTokens.get(tokenId)

    if (!existingToken) {
      throw new Error('Token not found')
    }

    // Create new token with same permissions but fresh keys
    const newToken = await this.issueToken({
      userId: existingToken.userId,
      deviceId: existingToken.deviceId,
      permissions: existingToken.permissions,
      sessionType: existingToken.metadata.sessionType,
      validityPeriod: this.config.tokenValidityMinutes,
      metadata: existingToken.metadata
    })

    // Revoke old token
    await this.revokeToken(tokenId, 'Token refreshed')

    // Log refresh
    await this.logTokenEvent({
      tokenId: newToken.id,
      userId: newToken.userId,
      action: 'refreshed',
      ipAddress: newToken.metadata.ipAddress,
      userAgent: newToken.metadata.userAgent,
      success: true,
      details: { oldTokenId: tokenId }
    })

    return newToken
  }

  async revokeToken(tokenId: string, reason: string): Promise<void> {
    const token = this.activeTokens.get(tokenId)

    if (token) {
      token.revoked = true
      token.revocationReason = reason

      // Update session
      const session = this.tokenSessions.get(token.sessionId)
      if (session) {
        session.activeTokens = Math.max(0, session.activeTokens - 1)
        session.tokens = session.tokens.filter(t => t.id !== tokenId)
      }

      // Log revocation
      await this.logTokenEvent({
        tokenId,
        userId: token.userId,
        action: 'revoked',
        ipAddress: token.metadata.ipAddress,
        userAgent: token.metadata.userAgent,
        success: true,
        details: { reason }
      })
    }
  }

  async revokeUserTokens(userId: string, reason: string): Promise<number> {
    const userTokens = Array.from(this.activeTokens.values())
      .filter(token => token.userId === userId && !token.revoked)

    let revokedCount = 0
    for (const token of userTokens) {
      await this.revokeToken(token.id, reason)
      revokedCount++
    }

    return revokedCount
  }

  async createSession(userId: string, deviceId: string): Promise<TokenSession> {
    // Check session limits
    const userSessions = Array.from(this.tokenSessions.values())
      .filter(session => session.userId === userId && session.status === 'active')

    if (userSessions.length >= this.config.maxSessionsPerUser) {
      // Terminate oldest session
      const oldestSession = userSessions.sort((a, b) =>
        a.startedAt.getTime() - b.startedAt.getTime()
      )[0]
      await this.terminateSession(oldestSession.id, 'Session limit exceeded')
    }

    const session: TokenSession = {
      id: this.generateSecureId(),
      userId,
      deviceId,
      tokens: [],
      startedAt: new Date(),
      lastActivity: new Date(),
      activeTokens: 0,
      riskScore: 0,
      status: 'active'
    }

    this.tokenSessions.set(session.id, session)
    return session
  }

  async getActiveSessions(userId: string): Promise<TokenSession[]> {
    return Array.from(this.tokenSessions.values())
      .filter(session => session.userId === userId && session.status === 'active')
  }

  async terminateSession(sessionId: string, reason: string): Promise<void> {
    const session = this.tokenSessions.get(sessionId)

    if (session) {
      session.status = 'terminated'

      // Revoke all session tokens
      for (const token of session.tokens) {
        if (!token.revoked) {
          await this.revokeToken(token.id, reason)
        }
      }

      session.tokens = []
      session.activeTokens = 0
    }
  }

  async encryptTokenData(data: any, key: string): Promise<string> {
    // Implementation would use AES-GCM encryption
    const jsonData = JSON.stringify(data)
    // In production, use proper encryption library
    return Buffer.from(jsonData).toString('base64')
  }

  async decryptTokenData(encryptedData: string, key: string): Promise<any> {
    // Implementation would decrypt AES-GCM encrypted data
    const jsonData = Buffer.from(encryptedData, 'base64').toString()
    return JSON.parse(jsonData)
  }

  async rotateEncryptionKeys(): Promise<void> {
    // Generate new master keys
    const newKey = await this.generateEncryptionKey()
    const expiresAt = new Date(Date.now() + this.config.keyRotationHours * 60 * 60 * 1000)

    this.encryptionKeys.set('current', { key: newKey, expiresAt })

    // Re-encrypt all active tokens with new keys
    for (const [tokenId, token] of this.activeTokens) {
      if (!token.revoked) {
        token.encryptionKey = await this.generateEncryptionKey()
        token.hmacKey = await this.generateHMACKey()
      }
    }
  }

  async logTokenEvent(event: Omit<TokenAuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: TokenAuditEvent = {
      ...event,
      id: this.generateSecureId(),
      timestamp: new Date()
    }

    this.auditEvents.push(auditEvent)

    // Keep only last 10000 events (configurable)
    if (this.auditEvents.length > 10000) {
      this.auditEvents = this.auditEvents.slice(-10000)
    }
  }

  async getTokenHistory(tokenId: string): Promise<TokenAuditEvent[]> {
    return this.auditEvents.filter(event => event.tokenId === tokenId)
  }

  async detectTokenAnomalies(timeWindow: { start: Date, end: Date }): Promise<TokenAnomaly[]> {
    const anomalies: TokenAnomaly[] = []
    const relevantEvents = this.auditEvents.filter(event =>
      event.timestamp >= timeWindow.start && event.timestamp <= timeWindow.end
    )

    // Group events by token
    const tokenEvents = new Map<string, TokenAuditEvent[]>()
    relevantEvents.forEach(event => {
      if (!tokenEvents.has(event.tokenId)) {
        tokenEvents.set(event.tokenId, [])
      }
      tokenEvents.get(event.tokenId)!.push(event)
    })

    // Analyze each token's activity
    for (const [tokenId, events] of tokenEvents) {
      const token = this.activeTokens.get(tokenId)
      if (!token) continue

      // Check for unusual locations
      const locations = events
        .filter(e => e.details.location)
        .map(e => e.details.location)
      const uniqueCountries = [...new Set(locations.map(l => l.country))]

      if (uniqueCountries.length > 3) {
        anomalies.push({
          type: 'unusual_location',
          severity: 'high',
          tokenId,
          description: `Token used from ${uniqueCountries.length} different countries`,
          evidence: { countries: uniqueCountries, eventsCount: events.length },
          timestamp: new Date()
        })
      }

      // Check for high usage
      const usageEvents = events.filter(e => e.action === 'validated' && e.success)
      if (usageEvents.length > 100) { // Configurable threshold
        anomalies.push({
          type: 'high_usage',
          severity: 'medium',
          tokenId,
          description: `Unusually high token usage: ${usageEvents.length} validations`,
          evidence: { validations: usageEvents.length, timeWindow },
          timestamp: new Date()
        })
      }

      // Check for unusual timing
      const nightTimeUsage = usageEvents.filter(event => {
        const hour = event.timestamp.getHours()
        return hour < 6 || hour > 22
      })

      if (nightTimeUsage.length > usageEvents.length * 0.3) {
        anomalies.push({
          type: 'unusual_time',
          severity: 'low',
          tokenId,
          description: `High percentage of nighttime usage: ${(nightTimeUsage.length / usageEvents.length * 100).toFixed(1)}%`,
          evidence: { nightTimeEvents: nightTimeUsage.length, totalEvents: usageEvents.length },
          timestamp: new Date()
        })
      }
    }

    return anomalies
  }

  async assessTokenRisk(token: SecureToken, context: TokenValidationContext): Promise<TokenRiskAssessment> {
    let overallRisk = 0
    const riskFactors: Array<{
      factor: string
      score: number
      evidence: string
    }> = []

    // Location consistency
    if (context.location && token.metadata.location) {
      const distance = this.calculateDistance(
        context.location.coordinates,
        token.metadata.location.coordinates
      )

      if (distance > 1000) { // More than 1000km from original location
        const risk = Math.min(distance / 100, 50) // Cap at 50
        overallRisk += risk
        riskFactors.push({
          factor: 'location_change',
          score: risk,
          evidence: `Location changed by ${distance.toFixed(0)}km`
        })
      }
    }

    // Time-based risk
    const timeSinceIssued = Date.now() - token.issuedAt.getTime()
    const timeSinceLastUsed = Date.now() - token.lastUsedAt.getTime()

    if (timeSinceLastUsed > 24 * 60 * 60 * 1000) { // No usage for 24 hours
      overallRisk += 20
      riskFactors.push({
        factor: 'dormant_usage',
        score: 20,
        evidence: 'Token unused for 24+ hours'
      })
    }

    // Device consistency
    if (context.deviceFingerprint !== token.metadata.deviceFingerprint) {
      overallRisk += 30
      riskFactors.push({
        factor: 'device_change',
        score: 30,
        evidence: 'Device fingerprint changed'
      })
    }

    // IP consistency
    if (context.ipAddress !== token.metadata.ipAddress) {
      overallRisk += 15
      riskFactors.push({
        factor: 'ip_change',
        score: 15,
        evidence: 'IP address changed'
      })
    }

    // Usage frequency
    const usageRate = token.usageCount / (timeSinceIssued / (60 * 1000)) // per minute
    if (usageRate > 10) { // More than 10 uses per minute
      overallRisk += 25
      riskFactors.push({
        factor: 'high_frequency',
        score: 25,
        evidence: `High usage rate: ${usageRate.toFixed(1)} uses/minute`
      })
    }

    const recommendations: string[] = []
    if (overallRisk > 70) {
      recommendations.push('Require additional authentication')
      recommendations.push('Limit token permissions')
    } else if (overallRisk > 50) {
      recommendations.push('Monitor token activity closely')
    }

    return {
      overallRisk: Math.min(100, overallRisk),
      riskFactors,
      recommendations,
      requiresAdditionalVerification: overallRisk > this.config.riskThreshold
    }
  }

  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date()
    let cleanedCount = 0

    for (const [tokenId, token] of this.activeTokens) {
      if (now > token.expiresAt) {
        this.activeTokens.delete(tokenId)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  async cleanupRevokedTokens(olderThan: Date): Promise<number> {
    let cleanedCount = 0

    for (const [tokenId, token] of this.activeTokens) {
      if (token.revoked && token.expiresAt < olderThan) {
        this.activeTokens.delete(tokenId)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  // Helper methods
  private getUserSession(userId: string, deviceId: string): TokenSession | undefined {
    return Array.from(this.tokenSessions.values())
      .find(session => session.userId === userId && session.deviceId === deviceId && session.status === 'active')
  }

  private async validateTokenContext(token: SecureToken, context: TokenValidationContext): Promise<TokenValidation> {
    // Check IP restrictions
    if (token.permissions.some(p => p.conditions?.some(c => c.type === 'ip_range'))) {
      // Implementation would check IP against allowed ranges
    }

    // Check time restrictions
    if (token.permissions.some(p => p.conditions?.some(c => c.type === 'time_window'))) {
      const now = new Date().toTimeString().slice(0, 5)
      // Implementation would check time against allowed windows
    }

    return { valid: true, token }
  }

  private async generateEncryptionKey(): Promise<string> {
    // In production, use crypto.randomBytes
    return 'enc_key_' + this.generateSecureId()
  }

  private async generateHMACKey(): Promise<string> {
    // In production, use crypto.randomBytes
    return 'hmac_key_' + this.generateSecureId()
  }

  private generateSecureId(): string {
    // In production, use crypto.randomUUID or similar
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    // Haversine formula for distance calculation
    const [lat1, lon1] = coord1
    const [lat2, lon2] = coord2

    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
}
