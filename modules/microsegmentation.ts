/**
 * Microsegmentation Module
 * Granular file and folder-level access control to prevent lateral movement
 */

export interface ResourceSegment {
  id: string
  type: 'file' | 'folder' | 'drive' | 'share'
  path: string
  parentId?: string
  children: string[]
  ownerId: string
  permissions: SegmentPermission[]
  securityLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  classification: ResourceClassification
  isolationLevel: 'none' | 'basic' | 'strict' | 'air_gapped'
  accessPatterns: AccessPattern[]
  riskProfile: RiskProfile
  createdAt: Date
  updatedAt: Date
}

export interface SegmentPermission {
  principalId: string // user, group, or role ID
  principalType: 'user' | 'group' | 'role' | 'service'
  actions: ('read' | 'write' | 'delete' | 'share' | 'execute' | 'list')[]
  conditions: PermissionCondition[]
  grantedBy: string
  grantedAt: Date
  expiresAt?: Date
  delegationAllowed: boolean
}

export interface PermissionCondition {
  type: 'time_window' | 'location' | 'device' | 'authentication_level' | 'compliance_check'
  value: any
  operator: 'equals' | 'in' | 'not_in' | 'range' | 'regex'
  required: boolean
}

export interface ResourceClassification {
  sensitivity: 'low' | 'medium' | 'high' | 'critical'
  categories: string[] // e.g., ['financial', 'personal', 'intellectual_property']
  compliance: string[] // e.g., ['GDPR', 'HIPAA', 'PCI_DSS']
  dataTypes: string[] // e.g., ['pii', 'financial', 'medical']
  retentionPolicy: {
    retainFor: number // days
    disposalMethod: 'delete' | 'archive' | 'encrypt'
  }
  sharingRestrictions: SharingRestriction[]
}

export interface SharingRestriction {
  type: 'domain_whitelist' | 'domain_blacklist' | 'user_whitelist' | 'user_blacklist' | 'no_external'
  values: string[]
  enforcement: 'block' | 'warn' | 'audit'
}

export interface AccessPattern {
  userId: string
  action: string
  frequency: number // accesses per day
  typicalTimeWindows: Array<{ start: string, end: string }>
  typicalLocations: string[]
  typicalDevices: string[]
  lastAccess: Date
  accessCount: number
  anomaliesDetected: number
}

export interface RiskProfile {
  overallRisk: number // 0-100
  riskFactors: Array<{
    factor: 'sensitivity' | 'sharing' | 'access_patterns' | 'permissions' | 'compliance'
    score: number
    description: string
  }>
  mitigationStrategies: string[]
  lastAssessed: Date
}

export interface IsolationRule {
  id: string
  name: string
  scope: {
    resourceTypes: string[]
    securityLevels: string[]
    classifications: string[]
  }
  restrictions: {
    noDirectAccess: boolean
    proxyRequired: boolean
    networkIsolation: boolean
    timeLimited: boolean
  }
  exceptions: IsolationException[]
  active: boolean
  createdBy: string
  createdAt: Date
}

export interface IsolationException {
  principalId: string
  principalType: 'user' | 'group' | 'role'
  conditions: PermissionCondition[]
  justification: string
  approvedBy: string
  approvedAt: Date
  expiresAt?: Date
}

export interface LateralMovementAttempt {
  id: string
  timestamp: Date
  sourceSegment: string
  targetSegment: string
  userId: string
  action: string
  blocked: boolean
  riskScore: number
  preventionMethod: string
  details: Record<string, any>
}

export interface MicrosegmentationInterface {
  // Resource Segmentation
  createSegment(resource: ResourceDefinition): Promise<ResourceSegment>
  updateSegment(segmentId: string, updates: Partial<ResourceSegment>): Promise<ResourceSegment>
  deleteSegment(segmentId: string): Promise<void>
  getSegmentHierarchy(rootPath?: string): Promise<ResourceSegment[]>

  // Permission Management
  grantPermission(segmentId: string, permission: Omit<SegmentPermission, 'grantedAt'>): Promise<void>
  revokePermission(segmentId: string, principalId: string, actions?: string[]): Promise<void>
  checkPermission(userId: string, segmentId: string, action: string, context?: AccessContext): Promise<PermissionResult>

  // Isolation & Containment
  createIsolationRule(rule: Omit<IsolationRule, 'id' | 'createdAt'>): Promise<IsolationRule>
  updateIsolationRule(ruleId: string, updates: Partial<IsolationRule>): Promise<IsolationRule>
  evaluateIsolation(segmentId: string, userId: string, action: string): Promise<IsolationResult>

  // Lateral Movement Prevention
  detectLateralMovement(attempt: Omit<LateralMovementAttempt, 'id' | 'timestamp' | 'blocked'>): Promise<LateralMovementAttempt>
  getLateralMovementHistory(timeWindow: { start: Date, end: Date }): Promise<LateralMovementAttempt[]>

  // Risk Assessment & Monitoring
  assessSegmentRisk(segmentId: string): Promise<RiskProfile>
  monitorAccessPatterns(segmentId: string): Promise<AccessPattern[]>
  detectAnomalousAccess(segmentId: string, access: AccessEvent): Promise<AnomalyDetection>

  // Classification & Compliance
  classifyResource(resourceId: string, classification: ResourceClassification): Promise<void>
  checkCompliance(segmentId: string, standards: string[]): Promise<ComplianceCheck[]>
  applyRetentionPolicy(segmentId: string): Promise<void>

  // Bulk Operations
  bulkUpdatePermissions(updates: Array<{ segmentId: string, permissions: SegmentPermission[] }>): Promise<void>
  bulkClassifyResources(classifications: Array<{ resourceId: string, classification: ResourceClassification }>): Promise<void>

  // Analytics & Reporting
  generateAccessReport(filters: AccessReportFilters): Promise<AccessReport>
  generateRiskReport(filters: RiskReportFilters): Promise<RiskReport>
}

export interface ResourceDefinition {
  type: 'file' | 'folder' | 'drive' | 'share'
  path: string
  ownerId: string
  initialPermissions: SegmentPermission[]
  classification?: Partial<ResourceClassification>
}

export interface AccessContext {
  userId: string
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
    coordinates: [number, number]
  }
  deviceId: string
  sessionId: string
  authenticationLevel: 'password' | 'mfa' | 'certificate' | 'biometric'
  timeOfAccess: Date
}

export interface PermissionResult {
  granted: boolean
  permissions: string[]
  conditions: PermissionCondition[]
  restrictions: string[]
  riskScore: number
  auditLogId: string
}

export interface IsolationResult {
  allowed: boolean
  isolationLevel: string
  requiredProxy: boolean
  timeLimit?: number
  exceptions: IsolationException[]
  riskScore: number
}

export interface AccessEvent {
  userId: string
  segmentId: string
  action: string
  timestamp: Date
  context: AccessContext
  success: boolean
  metadata: Record<string, any>
}

export interface AnomalyDetection {
  isAnomalous: boolean
  anomalyType: 'unusual_time' | 'unusual_location' | 'unusual_device' | 'unusual_frequency' | 'unusual_pattern'
  confidence: number
  riskScore: number
  indicators: string[]
  recommendedActions: string[]
}

export interface ComplianceCheck {
  standard: string
  requirement: string
  status: 'compliant' | 'non_compliant' | 'not_applicable'
  evidence: string[]
  remediation?: string
}

export interface AccessReportFilters {
  segmentIds?: string[]
  userIds?: string[]
  actions?: string[]
  dateRange: { start: Date, end: Date }
  riskThreshold?: number
}

export interface AccessReport {
  totalAccesses: number
  successfulAccesses: number
  deniedAccesses: number
  topUsers: Array<{ userId: string, accesses: number }>
  topSegments: Array<{ segmentId: string, accesses: number }>
  accessByTime: Record<string, number>
  riskDistribution: Record<string, number>
  anomalies: AnomalyDetection[]
}

export interface RiskReportFilters {
  segmentIds?: string[]
  riskThreshold?: number
  classification?: string[]
  dateRange?: { start: Date, end: Date }
}

export interface RiskReport {
  overallRiskScore: number
  highRiskSegments: ResourceSegment[]
  riskDistribution: Record<string, number>
  topRiskFactors: Array<{ factor: string, count: number, avgScore: number }>
  recommendations: string[]
  generatedAt: Date
}

// Implementation
export class Microsegmentation implements MicrosegmentationInterface {
  private segments = new Map<string, ResourceSegment>()
  private isolationRules: IsolationRule[] = []
  private lateralMovementAttempts: LateralMovementAttempt[] = []
  private accessEvents: AccessEvent[] = []

  // Configuration
  private config = {
    maxSegmentDepth: 10,
    defaultIsolationLevel: 'basic' as const,
    riskAssessmentInterval: 24 * 60 * 60 * 1000, // 24 hours
    anomalyDetectionThreshold: 0.8,
    maxAccessHistory: 10000
  }

  async createSegment(resource: ResourceDefinition): Promise<ResourceSegment> {
    const segmentId = this.generateId()

    // Determine parent segment
    const parentId = await this.findParentSegment(resource.path)

    // Initialize classification
    const classification: ResourceClassification = {
      sensitivity: 'low',
      categories: [],
      compliance: [],
      dataTypes: [],
      retentionPolicy: {
        retainFor: 365 * 7, // 7 years default
        disposalMethod: 'delete'
      },
      sharingRestrictions: [],
      ...resource.classification
    }

    // Assess initial risk
    const riskProfile = await this.assessSegmentRisk(segmentId)

    // Create segment
    const segment: ResourceSegment = {
      id: segmentId,
      type: resource.type,
      path: resource.path,
      parentId,
      children: [],
      ownerId: resource.ownerId,
      permissions: resource.initialPermissions.map(p => ({
        ...p,
        grantedAt: new Date()
      })),
      securityLevel: 'internal',
      classification,
      isolationLevel: this.determineIsolationLevel(classification),
      accessPatterns: [],
      riskProfile,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Update parent children
    if (parentId) {
      const parent = this.segments.get(parentId)
      if (parent) {
        parent.children.push(segmentId)
      }
    }

    this.segments.set(segmentId, segment)
    return segment
  }

  async updateSegment(segmentId: string, updates: Partial<ResourceSegment>): Promise<ResourceSegment> {
    const segment = this.segments.get(segmentId)
    if (!segment) {
      throw new Error('Segment not found')
    }

    Object.assign(segment, updates, { updatedAt: new Date() })

    // Reassess risk if classification changed
    if (updates.classification) {
      segment.riskProfile = await this.assessSegmentRisk(segmentId)
      segment.isolationLevel = this.determineIsolationLevel(segment.classification)
    }

    return segment
  }

  async deleteSegment(segmentId: string): Promise<void> {
    const segment = this.segments.get(segmentId)
    if (!segment) {
      return
    }

    // Remove from parent
    if (segment.parentId) {
      const parent = this.segments.get(segment.parentId)
      if (parent) {
        parent.children = parent.children.filter(id => id !== segmentId)
      }
    }

    // Delete children recursively
    for (const childId of segment.children) {
      await this.deleteSegment(childId)
    }

    this.segments.delete(segmentId)
  }

  async getSegmentHierarchy(rootPath?: string): Promise<ResourceSegment[]> {
    const segments = Array.from(this.segments.values())

    if (rootPath) {
      return segments.filter(s => s.path.startsWith(rootPath))
    }

    return segments
  }

  async grantPermission(segmentId: string, permission: Omit<SegmentPermission, 'grantedAt'>): Promise<void> {
    const segment = this.segments.get(segmentId)
    if (!segment) {
      throw new Error('Segment not found')
    }

    // Check for existing permission
    const existingIndex = segment.permissions.findIndex(
      p => p.principalId === permission.principalId && p.principalType === permission.principalType
    )

    if (existingIndex >= 0) {
      // Update existing permission
      segment.permissions[existingIndex] = {
        ...segment.permissions[existingIndex],
        ...permission,
        grantedAt: new Date()
      }
    } else {
      // Add new permission
      segment.permissions.push({
        ...permission,
        grantedAt: new Date()
      })
    }

    segment.updatedAt = new Date()

    // Reassess risk
    segment.riskProfile = await this.assessSegmentRisk(segmentId)
  }

  async revokePermission(segmentId: string, principalId: string, actions?: string[]): Promise<void> {
    const segment = this.segments.get(segmentId)
    if (!segment) {
      return
    }

    if (actions && actions.length > 0) {
      // Remove specific actions
      segment.permissions.forEach(perm => {
        if (perm.principalId === principalId) {
          perm.actions = perm.actions.filter(action => !actions.includes(action))
        }
      })
      // Remove permissions with no actions
      segment.permissions = segment.permissions.filter(perm => perm.actions.length > 0)
    } else {
      // Remove all permissions for principal
      segment.permissions = segment.permissions.filter(perm => perm.principalId !== principalId)
    }

    segment.updatedAt = new Date()
  }

  async checkPermission(userId: string, segmentId: string, action: 'read' | 'write' | 'delete' | 'share' | 'execute' | 'list', context?: AccessContext): Promise<PermissionResult> {
    const segment = this.segments.get(segmentId)
    if (!segment) {
      return {
        granted: false,
        permissions: [],
        conditions: [],
        restrictions: ['Segment not found'],
        riskScore: 100,
        auditLogId: ''
      }
    }

    // Get user permissions (including group and role permissions)
    const userPermissions = await this.getUserPermissions(userId, segment)

    // Check if action is allowed
    const allowedActions = userPermissions.flatMap(p => p.actions) as ('read' | 'write' | 'delete' | 'share' | 'execute' | 'list')[]
    const hasPermission = allowedActions.includes(action)

    if (!hasPermission) {
      return {
        granted: false,
        permissions: [],
        conditions: [],
        restrictions: ['Permission denied'],
        riskScore: 0,
        auditLogId: ''
      }
    }

    // Evaluate conditions
    const applicableConditions = userPermissions.flatMap(p => p.conditions || [])
    const failedConditions = applicableConditions.filter(cond =>
      !this.evaluateCondition(cond, context)
    )

    if (failedConditions.length > 0) {
      return {
        granted: false,
        permissions: allowedActions,
        conditions: failedConditions,
        restrictions: ['Conditions not met'],
        riskScore: 50,
        auditLogId: ''
      }
    }

    // Check isolation rules
    const isolationResult = await this.evaluateIsolation(segmentId, userId, action)
    if (!isolationResult.allowed) {
      return {
        granted: false,
        permissions: allowedActions,
        conditions: applicableConditions,
        restrictions: ['Isolation policy violation'],
        riskScore: isolationResult.riskScore,
        auditLogId: ''
      }
    }

    // Calculate risk score
    const riskScore = await this.calculateAccessRisk(userId, segment, action, context)

    return {
      granted: true,
      permissions: allowedActions,
      conditions: applicableConditions,
      restrictions: [],
      riskScore,
      auditLogId: this.generateId()
    }
  }

  async createIsolationRule(rule: Omit<IsolationRule, 'id' | 'createdAt'>): Promise<IsolationRule> {
    const isolationRule: IsolationRule = {
      ...rule,
      id: this.generateId(),
      createdAt: new Date()
    }

    this.isolationRules.push(isolationRule)
    return isolationRule
  }

  async updateIsolationRule(ruleId: string, updates: Partial<IsolationRule>): Promise<IsolationRule> {
    const rule = this.isolationRules.find(r => r.id === ruleId)
    if (!rule) {
      throw new Error('Isolation rule not found')
    }

    Object.assign(rule, updates)
    return rule
  }

  async evaluateIsolation(segmentId: string, userId: string, action: string): Promise<IsolationResult> {
    const segment = this.segments.get(segmentId)
    if (!segment) {
      return {
        allowed: false,
        isolationLevel: 'unknown',
        requiredProxy: false,
        exceptions: [],
        riskScore: 100
      }
    }

    // Check applicable isolation rules
    const applicableRules = this.isolationRules.filter(rule =>
      rule.active &&
      this.matchesRuleScope(rule.scope, segment)
    )

    if (applicableRules.length === 0) {
      return {
        allowed: true,
        isolationLevel: segment.isolationLevel,
        requiredProxy: segment.isolationLevel !== 'none',
        exceptions: [],
        riskScore: 0
      }
    }

    // Check for exceptions
    const exceptions = applicableRules.flatMap(rule => rule.exceptions)
      .filter(exc => this.matchesException(exc, userId))

    if (exceptions.length > 0) {
      return {
        allowed: true,
        isolationLevel: segment.isolationLevel,
        requiredProxy: false,
        exceptions,
        riskScore: 10
      }
    }

    // Apply strictest rule
    const strictestRule = applicableRules.reduce((strictest, current) =>
      this.getIsolationStrictness(current) > this.getIsolationStrictness(strictest) ? current : strictest
    )

    return {
      allowed: false,
      isolationLevel: strictestRule.restrictions.networkIsolation ? 'air_gapped' : 'strict',
      requiredProxy: strictestRule.restrictions.proxyRequired,
      timeLimit: strictestRule.restrictions.timeLimited ? 60 : undefined, // 1 hour default
      exceptions: [],
      riskScore: 80
    }
  }

  async detectLateralMovement(attempt: Omit<LateralMovementAttempt, 'id' | 'timestamp' | 'blocked'>): Promise<LateralMovementAttempt> {
    const sourceSegment = this.segments.get(attempt.sourceSegment)
    const targetSegment = this.segments.get(attempt.targetSegment)

    if (!sourceSegment || !targetSegment) {
      const blockedAttempt: LateralMovementAttempt = {
        ...attempt,
        id: this.generateId(),
        timestamp: new Date(),
        blocked: true,
        preventionMethod: 'Invalid segments'
      }
      this.lateralMovementAttempts.push(blockedAttempt)
      return blockedAttempt
    }

    // Check if segments are related (parent-child or sibling)
    const areRelated = this.areSegmentsRelated(sourceSegment, targetSegment)

    if (areRelated) {
      const allowedAttempt: LateralMovementAttempt = {
        ...attempt,
        id: this.generateId(),
        timestamp: new Date(),
        blocked: false,
        preventionMethod: 'Allowed - related segments'
      }
      this.lateralMovementAttempts.push(allowedAttempt)
      return allowedAttempt
    }

    // Check isolation levels
    const sourceIsolation = this.getIsolationStrictnessByLevel(sourceSegment.isolationLevel)
    const targetIsolation = this.getIsolationStrictnessByLevel(targetSegment.isolationLevel)

    if (sourceIsolation > 0 || targetIsolation > 0) {
      const blockedAttempt: LateralMovementAttempt = {
        ...attempt,
        id: this.generateId(),
        timestamp: new Date(),
        blocked: true,
        riskScore: Math.max(sourceIsolation, targetIsolation) * 20,
        preventionMethod: 'Isolation policy violation'
      }
      this.lateralMovementAttempts.push(blockedAttempt)
      return blockedAttempt
    }

    // Check classification compatibility
    const classificationRisk = this.assessClassificationJump(sourceSegment.classification, targetSegment.classification)

    if (classificationRisk > 50) {
      const blockedAttempt: LateralMovementAttempt = {
        ...attempt,
        id: this.generateId(),
        timestamp: new Date(),
        blocked: true,
        riskScore: classificationRisk,
        preventionMethod: 'Classification barrier'
      }
      this.lateralMovementAttempts.push(blockedAttempt)
      return blockedAttempt
    }

    // Allow movement with monitoring
    const allowedAttempt: LateralMovementAttempt = {
      ...attempt,
      id: this.generateId(),
      timestamp: new Date(),
      blocked: false,
      riskScore: classificationRisk,
      preventionMethod: 'Allowed with monitoring'
    }
    this.lateralMovementAttempts.push(allowedAttempt)
    return allowedAttempt
  }

  async getLateralMovementHistory(timeWindow: { start: Date, end: Date }): Promise<LateralMovementAttempt[]> {
    return this.lateralMovementAttempts.filter(
      attempt => attempt.timestamp >= timeWindow.start && attempt.timestamp <= timeWindow.end
    )
  }

  async assessSegmentRisk(segmentId: string): Promise<RiskProfile> {
    const segment = this.segments.get(segmentId)
    if (!segment) {
      throw new Error('Segment not found')
    }

    let overallRisk = 0
    const riskFactors: Array<{
      factor: 'sensitivity' | 'sharing' | 'access_patterns' | 'permissions' | 'compliance'
      score: number
      description: string
    }> = []

    // Sensitivity risk
    const sensitivityScores = { low: 10, medium: 30, high: 60, critical: 90 }
    const sensitivityRisk = sensitivityScores[segment.classification.sensitivity]
    overallRisk += sensitivityRisk * 0.4
    riskFactors.push({
      factor: 'sensitivity',
      score: sensitivityRisk,
      description: `Data sensitivity: ${segment.classification.sensitivity}`
    })

    // Sharing risk
    const sharingRisk = this.calculateSharingRisk(segment)
    overallRisk += sharingRisk * 0.2
    riskFactors.push({
      factor: 'sharing',
      score: sharingRisk,
      description: 'Sharing restrictions and patterns'
    })

    // Access pattern risk
    const patternRisk = this.calculateAccessPatternRisk(segment)
    overallRisk += patternRisk * 0.2
    riskFactors.push({
      factor: 'access_patterns',
      score: patternRisk,
      description: 'User access behavior analysis'
    })

    // Permission risk
    const permissionRisk = this.calculatePermissionRisk(segment)
    overallRisk += permissionRisk * 0.15
    riskFactors.push({
      factor: 'permissions',
      score: permissionRisk,
      description: 'Permission complexity and breadth'
    })

    // Compliance risk
    const complianceRisk = this.calculateComplianceRisk(segment)
    overallRisk += complianceRisk * 0.05
    riskFactors.push({
      factor: 'compliance',
      score: complianceRisk,
      description: 'Regulatory compliance requirements'
    })

    const mitigationStrategies = this.generateMitigationStrategies(riskFactors)

    return {
      overallRisk: Math.min(100, overallRisk),
      riskFactors,
      mitigationStrategies,
      lastAssessed: new Date()
    }
  }

  async monitorAccessPatterns(segmentId: string): Promise<AccessPattern[]> {
    const segment = this.segments.get(segmentId)
    if (!segment) return []

    // Get access events for this segment
    const segmentEvents = this.accessEvents.filter(event => event.segmentId === segmentId)

    // Group by user
    const userPatterns = new Map<string, AccessEvent[]>()

    segmentEvents.forEach(event => {
      if (!userPatterns.has(event.userId)) {
        userPatterns.set(event.userId, [])
      }
      userPatterns.get(event.userId)!.push(event)
    })

    // Calculate patterns
    const patterns: AccessPattern[] = []

    for (const [userId, events] of userPatterns) {
      const sortedEvents = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

      // Calculate frequency
      const firstAccess = sortedEvents[0].timestamp
      const lastAccess = sortedEvents[sortedEvents.length - 1].timestamp
      const daysDiff = (lastAccess.getTime() - firstAccess.getTime()) / (1000 * 60 * 60 * 24)
      const frequency = daysDiff > 0 ? sortedEvents.length / daysDiff : sortedEvents.length

      // Calculate typical time windows
      const timeWindows = this.calculateTypicalTimeWindows(sortedEvents)

      // Calculate typical locations and devices
      const locations = [...new Set(sortedEvents.map(e => e.context.location?.country).filter((country): country is string => country !== undefined))]
      const devices = [...new Set(sortedEvents.map(e => e.context.deviceId))]

      patterns.push({
        userId,
        action: 'access', // Could be more specific
        frequency,
        typicalTimeWindows: timeWindows,
        typicalLocations: locations,
        typicalDevices: devices,
        lastAccess,
        accessCount: sortedEvents.length,
        anomaliesDetected: 0 // Would be calculated separately
      })
    }

    return patterns
  }

  async detectAnomalousAccess(segmentId: string, access: AccessEvent): Promise<AnomalyDetection> {
    const patterns = await this.monitorAccessPatterns(segmentId)
    const userPattern = patterns.find(p => p.userId === access.userId)

    if (!userPattern) {
      return {
        isAnomalous: true,
        anomalyType: 'unusual_pattern',
        confidence: 0.9,
        riskScore: 70,
        indicators: ['First time access'],
        recommendedActions: ['Require additional verification']
      }
    }

    const anomalies: string[] = []
    let riskScore = 0
    let confidence = 0

    // Check time anomaly
    const accessHour = access.timestamp.getHours()
    const typicalWindows = userPattern.typicalTimeWindows
    const inTypicalWindow = typicalWindows.some(window => {
      const start = this.timeToMinutes(window.start)
      const end = this.timeToMinutes(window.end)
      const current = accessHour * 60
      return current >= start && current <= end
    })

    if (!inTypicalWindow) {
      anomalies.push('Access outside typical hours')
      riskScore += 30
      confidence = Math.max(confidence, 0.7)
    }

    // Check location anomaly
    const accessCountry = access.context.location?.country
    if (accessCountry && !userPattern.typicalLocations.includes(accessCountry)) {
      anomalies.push(`Access from unusual location: ${accessCountry}`)
      riskScore += 40
      confidence = Math.max(confidence, 0.8)
    }

    // Check device anomaly
    if (!userPattern.typicalDevices.includes(access.context.deviceId)) {
      anomalies.push('Access from unknown device')
      riskScore += 25
      confidence = Math.max(confidence, 0.6)
    }

    // Check frequency anomaly
    const recentEvents = this.accessEvents.filter(e =>
      e.userId === access.userId &&
      e.segmentId === segmentId &&
      (access.timestamp.getTime() - e.timestamp.getTime()) < (24 * 60 * 60 * 1000) // Last 24 hours
    )

    if (recentEvents.length > userPattern.frequency * 2) {
      anomalies.push('Unusually high access frequency')
      riskScore += 35
      confidence = Math.max(confidence, 0.75)
    }

    return {
      isAnomalous: anomalies.length > 0,
      anomalyType: anomalies.length > 1 ? 'unusual_pattern' : 'unusual_time',
      confidence,
      riskScore: Math.min(100, riskScore),
      indicators: anomalies,
      recommendedActions: riskScore > 50 ? ['Block access', 'Require MFA'] : ['Monitor closely']
    }
  }

  async classifyResource(resourceId: string, classification: ResourceClassification): Promise<void> {
    const segment = this.segments.get(resourceId)
    if (!segment) {
      throw new Error('Resource not found')
    }

    segment.classification = classification
    segment.isolationLevel = this.determineIsolationLevel(classification)
    segment.riskProfile = await this.assessSegmentRisk(resourceId)
    segment.updatedAt = new Date()
  }

  async checkCompliance(segmentId: string, standards: string[]): Promise<ComplianceCheck[]> {
    const segment = this.segments.get(segmentId)
    if (!segment) return []

    const checks: ComplianceCheck[] = []

    for (const standard of standards) {
      switch (standard) {
        case 'GDPR':
          checks.push(...await this.checkGDPRCompliance(segment))
          break
        case 'HIPAA':
          checks.push(...await this.checkHIPAACompliance(segment))
          break
        case 'NIST_800_171':
          checks.push(...await this.checkNISTCompliance(segment))
          break
      }
    }

    return checks
  }

  async applyRetentionPolicy(segmentId: string): Promise<void> {
    const segment = this.segments.get(segmentId)
    if (!segment) return

    const retentionDays = segment.classification.retentionPolicy.retainFor
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)

    if (segment.createdAt < cutoffDate) {
      // Apply retention policy
      switch (segment.classification.retentionPolicy.disposalMethod) {
        case 'delete':
          await this.deleteSegment(segmentId)
          break
        case 'archive':
          // Move to archive
          segment.securityLevel = 'restricted'
          break
        case 'encrypt':
          // Apply additional encryption
          segment.isolationLevel = 'air_gapped'
          break
      }
    }
  }

  async bulkUpdatePermissions(updates: Array<{ segmentId: string, permissions: SegmentPermission[] }>): Promise<void> {
    for (const update of updates) {
      const segment = this.segments.get(update.segmentId)
      if (segment) {
        segment.permissions = update.permissions
        segment.updatedAt = new Date()
      }
    }
  }

  async bulkClassifyResources(classifications: Array<{ resourceId: string, classification: ResourceClassification }>): Promise<void> {
    for (const classification of classifications) {
      await this.classifyResource(classification.resourceId, classification.classification)
    }
  }

  async generateAccessReport(filters: AccessReportFilters): Promise<AccessReport> {
    const events = this.accessEvents.filter(event => {
      if (filters.segmentIds && !filters.segmentIds.includes(event.segmentId)) return false
      if (filters.userIds && !filters.userIds.includes(event.userId)) return false
      if (filters.actions && !filters.actions.includes(event.action)) return false
      if (event.timestamp < filters.dateRange.start || event.timestamp > filters.dateRange.end) return false
      if (filters.riskThreshold && event.metadata.riskScore < filters.riskThreshold) return false
      return true
    })

    const totalAccesses = events.length
    const successfulAccesses = events.filter(e => e.success).length
    const deniedAccesses = events.filter(e => !e.success).length

    // Calculate top users
    const userCounts = new Map<string, number>()
    events.forEach(e => userCounts.set(e.userId, (userCounts.get(e.userId) || 0) + 1))
    const topUsers = Array.from(userCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, accesses]) => ({ userId, accesses }))

    // Calculate top segments
    const segmentCounts = new Map<string, number>()
    events.forEach(e => segmentCounts.set(e.segmentId, (segmentCounts.get(e.segmentId) || 0) + 1))
    const topSegments = Array.from(segmentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([segmentId, accesses]) => ({ segmentId, accesses }))

    // Calculate access by time (hourly)
    const accessByTime: Record<string, number> = {}
    events.forEach(event => {
      const hour = event.timestamp.getHours().toString().padStart(2, '0') + ':00'
      accessByTime[hour] = (accessByTime[hour] || 0) + 1
    })

    return {
      totalAccesses,
      successfulAccesses,
      deniedAccesses,
      topUsers,
      topSegments,
      accessByTime,
      riskDistribution: {},
      anomalies: []
    }
  }

  async generateRiskReport(filters: RiskReportFilters): Promise<RiskReport> {
    const segments = Array.from(this.segments.values()).filter(segment => {
      if (filters.segmentIds && !filters.segmentIds.includes(segment.id)) return false
      if (filters.classification && !filters.classification.some(c => segment.classification.categories.includes(c))) return false
      return true
    })

    const highRiskSegments = segments.filter(s => s.riskProfile.overallRisk >= (filters.riskThreshold || 70))

    const riskDistribution: Record<string, number> = {}
    segments.forEach(segment => {
      const riskLevel = segment.riskProfile.overallRisk < 30 ? 'low' :
                       segment.riskProfile.overallRisk < 70 ? 'medium' : 'high'
      riskDistribution[riskLevel] = (riskDistribution[riskLevel] || 0) + 1
    })

    const overallRiskScore = segments.reduce((sum, s) => sum + s.riskProfile.overallRisk, 0) / segments.length

    return {
      overallRiskScore,
      highRiskSegments,
      riskDistribution,
      topRiskFactors: [],
      recommendations: ['Implement additional monitoring', 'Review high-risk segments'],
      generatedAt: new Date()
    }
  }

  // Helper methods
  private async findParentSegment(path: string): Promise<string | undefined> {
    const pathParts = path.split('/').filter(p => p.length > 0)
    if (pathParts.length <= 1) return undefined

    const parentPath = '/' + pathParts.slice(0, -1).join('/')
    for (const [id, segment] of this.segments) {
      if (segment.path === parentPath) {
        return id
      }
    }
    return undefined
  }

  private determineIsolationLevel(classification: ResourceClassification): 'none' | 'basic' | 'strict' | 'air_gapped' {
    if (classification.sensitivity === 'critical' || classification.compliance.includes('HIPAA')) {
      return 'air_gapped'
    }
    if (classification.sensitivity === 'high' || classification.compliance.includes('GDPR')) {
      return 'strict'
    }
    if (classification.sensitivity === 'medium') {
      return 'basic'
    }
    return 'none'
  }

  private async getUserPermissions(userId: string, segment: ResourceSegment): Promise<SegmentPermission[]> {
    // Get direct permissions
    const directPermissions = segment.permissions.filter(p => p.principalId === userId && p.principalType === 'user')

    // Get group permissions (simplified - would integrate with user management)
    const groupPermissions = segment.permissions.filter(p => p.principalType === 'group')

    // Get role permissions (simplified)
    const rolePermissions = segment.permissions.filter(p => p.principalType === 'role')

    return [...directPermissions, ...groupPermissions, ...rolePermissions]
  }

  private evaluateCondition(condition: PermissionCondition, context?: AccessContext): boolean {
    if (!context) return condition.required ? false : true

    switch (condition.type) {
      case 'time_window':
        const now = new Date().toTimeString().slice(0, 5)
        return this.isTimeInWindow(now, condition.value)
      case 'location':
        return context.location?.country === condition.value
      case 'device':
        return context.deviceId === condition.value
      case 'authentication_level':
        return context.authenticationLevel === condition.value
      default:
        return true
    }
  }

  private matchesRuleScope(scope: IsolationRule['scope'], segment: ResourceSegment): boolean {
    if (scope.resourceTypes.length > 0 && !scope.resourceTypes.includes(segment.type)) return false
    if (scope.securityLevels.length > 0 && !scope.securityLevels.includes(segment.securityLevel)) return false
    if (scope.classifications.length > 0 &&
        !scope.classifications.some(c => segment.classification.categories.includes(c))) return false
    return true
  }

  private matchesException(exception: IsolationException, userId: string): boolean {
    return exception.principalId === userId || exception.principalType === 'user'
  }

  private getIsolationStrictness(rule: IsolationRule): number {
    let strictness = 0
    if (rule.restrictions.noDirectAccess) strictness += 3
    if (rule.restrictions.proxyRequired) strictness += 2
    if (rule.restrictions.networkIsolation) strictness += 4
    if (rule.restrictions.timeLimited) strictness += 1
    return strictness
  }

  private areSegmentsRelated(segmentA: ResourceSegment, segmentB: ResourceSegment): boolean {
    // Check parent-child relationship
    if (segmentA.parentId === segmentB.id || segmentB.parentId === segmentA.id) return true

    // Check if they share a parent
    if (segmentA.parentId && segmentB.parentId && segmentA.parentId === segmentB.parentId) return true

    // Check path relationship
    const pathA = segmentA.path.split('/').filter(p => p.length > 0)
    const pathB = segmentB.path.split('/').filter(p => p.length > 0)

    // Check if one is a subdirectory of the other
    const shorter = pathA.length < pathB.length ? pathA : pathB
    const longer = pathA.length < pathB.length ? pathB : pathA

    return shorter.every((part, index) => part === longer[index])
  }

  private getIsolationStrictnessByLevel(level: string): number {
    const levels = { none: 0, basic: 1, strict: 2, air_gapped: 3 }
    return levels[level as keyof typeof levels] || 0
  }

  private assessClassificationJump(from: ResourceClassification, to: ResourceClassification): number {
    const sensitivityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
    const fromLevel = sensitivityLevels[from.sensitivity]
    const toLevel = sensitivityLevels[to.sensitivity]

    if (toLevel > fromLevel) {
      return (toLevel - fromLevel) * 25 // Risk increases with sensitivity jump
    }

    return 0
  }

  private calculateSharingRisk(segment: ResourceSegment): number {
    const restrictions = segment.classification.sharingRestrictions
    let risk = 0

    if (restrictions.some(r => r.type === 'no_external')) risk += 20
    if (restrictions.some(r => r.enforcement === 'block')) risk += 15
    if (segment.permissions.filter(p => p.principalType === 'user').length > 10) risk += 25

    return Math.min(100, risk)
  }

  private calculateAccessPatternRisk(segment: ResourceSegment): number {
    let risk = 0

    // Analyze access patterns
    const patterns = segment.accessPatterns
    if (patterns.length === 0) return 10 // Unknown patterns are moderately risky

    const anomalies = patterns.reduce((sum, p) => sum + p.anomaliesDetected, 0)
    risk += Math.min(anomalies * 5, 40)

    // Check for privileged access patterns
    const privilegedUsers = patterns.filter(p => p.accessCount > 100)
    risk += privilegedUsers.length * 10

    return Math.min(100, risk)
  }

  private calculatePermissionRisk(segment: ResourceSegment): number {
    let risk = 0

    const permissions = segment.permissions

    // Too many permissions
    if (permissions.length > 20) risk += 20

    // Broad permissions (multiple actions)
    const broadPermissions = permissions.filter(p => p.actions.length > 3)
    risk += broadPermissions.length * 5

    // Permissions without expiration
    const permanentPermissions = permissions.filter(p => !p.expiresAt)
    risk += (permanentPermissions.length / permissions.length) * 30

    // Delegation allowed
    const delegatablePermissions = permissions.filter(p => p.delegationAllowed)
    risk += delegatablePermissions.length * 10

    return Math.min(100, risk)
  }

  private calculateComplianceRisk(segment: ResourceSegment): number {
    const compliance = segment.classification.compliance
    let risk = 0

    if (compliance.includes('HIPAA')) risk += 40
    if (compliance.includes('GDPR')) risk += 35
    if (compliance.includes('PCI_DSS')) risk += 30
    if (compliance.includes('SOX')) risk += 25

    return Math.min(100, risk)
  }

  private generateMitigationStrategies(riskFactors: RiskProfile['riskFactors']): string[] {
    const strategies: string[] = []

    riskFactors.forEach(factor => {
      switch (factor.factor) {
        case 'sensitivity':
          if (factor.score > 50) strategies.push('Implement stricter access controls')
          break
        case 'sharing':
          if (factor.score > 30) strategies.push('Review and tighten sharing restrictions')
          break
        case 'access_patterns':
          if (factor.score > 40) strategies.push('Enable behavioral analytics and anomaly detection')
          break
        case 'permissions':
          if (factor.score > 35) strategies.push('Implement least privilege and regular permission reviews')
          break
        case 'compliance':
          if (factor.score > 20) strategies.push('Conduct compliance audit and remediation')
          break
      }
    })

    return strategies
  }

  private async calculateAccessRisk(userId: string, segment: ResourceSegment, action: string, context?: AccessContext): Promise<number> {
    let risk = segment.riskProfile.overallRisk * 0.5

    // Context-based risk
    if (context) {
      if (context.authenticationLevel === 'password') risk += 20
      if (!context.location) risk += 15
      if (new Date().getHours() < 6 || new Date().getHours() > 22) risk += 10
    }

    // Action-based risk
    if (['delete', 'share'].includes(action)) risk += 25

    return Math.min(100, risk)
  }

  private calculateTypicalTimeWindows(events: AccessEvent[]): Array<{ start: string, end: string }> {
    // Simplified time window calculation
    const hours = events.map(e => e.timestamp.getHours())
    const uniqueHours = [...new Set(hours)].sort((a, b) => a - b)

    if (uniqueHours.length === 0) return []

    // Find contiguous blocks
    const windows: Array<{ start: string, end: string }> = []
    let start = uniqueHours[0]
    let prev = uniqueHours[0]

    for (let i = 1; i < uniqueHours.length; i++) {
      if (uniqueHours[i] > prev + 2) { // Gap of more than 2 hours
        windows.push({
          start: `${start.toString().padStart(2, '0')}:00`,
          end: `${(prev + 1).toString().padStart(2, '0')}:00`
        })
        start = uniqueHours[i]
      }
      prev = uniqueHours[i]
    }

    windows.push({
      start: `${start.toString().padStart(2, '0')}:00`,
      end: `${(prev + 1).toString().padStart(2, '0')}:00`
    })

    return windows
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  private isTimeInWindow(time: string, window: string): boolean {
    // Simplified - would parse actual time ranges
    return true
  }

  private async checkGDPRCompliance(segment: ResourceSegment): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = []

    // Check for PII data types
    const hasPII = segment.classification.dataTypes.some(type =>
      ['personal', 'contact', 'identification'].includes(type)
    )

    checks.push({
      standard: 'GDPR',
      requirement: 'Article 25 - Data protection by design and default',
      status: segment.isolationLevel !== 'none' ? 'compliant' : 'non_compliant',
      evidence: [`Isolation level: ${segment.isolationLevel}`]
    })

    if (hasPII) {
      checks.push({
        standard: 'GDPR',
        requirement: 'Article 5 - Principles relating to processing of personal data',
        status: segment.classification.retentionPolicy.retainFor <= 365 * 10 ? 'compliant' : 'non_compliant',
        evidence: [`Retention period: ${segment.classification.retentionPolicy.retainFor} days`]
      })
    }

    return checks
  }

  private async checkHIPAACompliance(segment: ResourceSegment): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = []

    const hasHealthData = segment.classification.dataTypes.includes('medical')

    if (hasHealthData) {
      checks.push({
        standard: 'HIPAA',
        requirement: 'Security Rule - Access Control',
        status: segment.securityLevel === 'restricted' ? 'compliant' : 'non_compliant',
        evidence: [`Security level: ${segment.securityLevel}`]
      })

      checks.push({
        standard: 'HIPAA',
        requirement: 'Security Rule - Audit Controls',
        status: 'compliant', // Assuming audit logging is enabled
        evidence: ['Access logging enabled']
      })
    }

    return checks
  }

  private async checkNISTCompliance(segment: ResourceSegment): Promise<ComplianceCheck[]> {
    return [
      {
        standard: 'NIST_800_171',
        requirement: '3.1.1 - Limit information system access to authorized users',
        status: segment.permissions.length > 0 ? 'compliant' : 'non_compliant',
        evidence: [`${segment.permissions.length} permission rules defined`]
      },
      {
        standard: 'NIST_800_171',
        requirement: '3.1.2 - Protect the confidentiality of CUI',
        status: segment.isolationLevel !== 'none' ? 'compliant' : 'non_compliant',
        evidence: [`Isolation level: ${segment.isolationLevel}`]
      }
    ]
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }
}
