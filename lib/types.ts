import { LinkedInProfile, LinkedInConnection } from '../connectors/linkedin/linkedin-connector'

// Comprehensive TypeScript types and interfaces for DefConect Platform

// ========== UI Component Types ==========

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface DataTableColumn<T = any> {
  key: keyof T | string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  width?: string | number
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (items: number) => void
}

export interface SearchFilters {
  query?: string
  category?: string
  status?: string
  priority?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  [key: string]: any
}

// ========== API Response Types ==========

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    pagination?: PaginationProps
    timestamp: string
    version: string
  }
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    pagination: PaginationProps
    timestamp: string
    version: string
  }
}

// ========== Form Types ==========

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    custom?: (value: any) => string | null
  }
  helpText?: string
  disabled?: boolean
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}

// ========== Notification Types ==========

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// ========== Workflow Types ==========

export interface WorkflowStep {
  id: string
  name: string
  type: 'start' | 'end' | 'action' | 'condition' | 'parallel' | 'delay' | 'api' | 'ai' | 'human'
  config: Record<string, any>
  position: { x: number; y: number }
  inputs: string[]
  outputs: string[]
}

export interface WorkflowConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: 'default' | 'condition'
  condition?: string
  label?: string
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  steps: WorkflowStep[]
  connections: WorkflowConnection[]
  variables: WorkflowVariable[]
  tags: string[]
  isPublic: boolean
  usageCount: number
}

export interface WorkflowVariable {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date'
  defaultValue?: any
  required: boolean
  description?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    enum?: string[]
  }
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  completedAt?: string
  currentStep?: string
  progress: number
  inputs: Record<string, any>
  outputs: Record<string, any>
  error?: string
  logs: WorkflowLogEntry[]
}

export interface WorkflowLogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  stepId?: string
  data?: Record<string, any>
}

// ========== Chat & Message Types ==========

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agentType?: string
  linkedinStrategy?: boolean
  expertise?: string
  apiCalls?: Array<{
    endpoint: string
    method: string
    status: number
    duration: number
  }>
  codeBlocks?: Array<{
    language: string
    code: string
    description?: string
  }>
  attachments?: Array<{
    name: string
    url: string
    type: string
    size: number
  }>
  proactiveSuggestion?: string
  metadata?: Record<string, any>
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  isArchived?: boolean
}

export interface AgentActivity {
  id: string
  agentId: string
  type: 'processing' | 'completed' | 'error' | 'waiting'
  message: string
  timestamp: Date
  isActive?: boolean
  name?: string
  progress?: number
  action?: string
  subTasks?: Array<{
    name: string
    status: 'pending' | 'running' | 'complete' | 'failed'
    details?: string
  }>
  metadata?: Record<string, any>
}

export interface AgentProcess {
  id: string
  name?: string
  type: 'processing' | 'completed' | 'error' | 'waiting' | 'thinking' | 'api_call' | 'analysis' | 'response' | 'coding' | 'talking'
  status?: 'idle' | 'running' | 'completed' | 'failed'
  progress?: number
  startTime?: Date
  endTime?: Date
  currentStep?: string
  steps?: string[]
  content?: string
  timestamp?: Date
  metadata?: Record<string, any>
}

export interface UserGoals {
  linkedinStrategy: {
    "4StarGenerals": boolean
    networkOptimization: boolean
    automatedRecruitment: boolean
    tribeBuilding: boolean
    cherryPicking: boolean
    connectionLimits: boolean
    emailOutreach: boolean
  }
  businessGoals: {
    vcFunding: boolean
    aiInnovation: boolean
    executiveSearch: boolean
    platformBuilding: boolean
    [key: string]: boolean
  }
  personalGoals?: {
    learnAIPrompting?: boolean
    masterDataScience?: boolean
    buildAIProducts?: boolean
    networkWithAILeaders?: boolean
    contributeToOpenSource?: boolean
    writeTechnicalBlog?: boolean
    [key: string]: boolean | undefined
  }
  lastInteraction: Date
  activeFocus: string
}

// ========== Agent Types ==========

export interface AgentCapability {
  id: string
  name: string
  description: string
  type: 'analysis' | 'generation' | 'communication' | 'automation' | 'integration'
  parameters: AgentParameter[]
  examples: string[]
}

export interface AgentParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description: string
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    enum?: string[]
  }
}

export interface AgentExecution {
  id: string
  agentId: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  completedAt?: string
  input: Record<string, any>
  output?: Record<string, any>
  error?: string
  tokensUsed?: number
  cost?: number
  metadata: Record<string, any>
}

// ========== Analytics Types ==========

export interface MetricData {
  timestamp: string
  value: number
  label?: string
  category?: string
}

export interface AnalyticsChart {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  data: MetricData[]
  xAxis: string
  yAxis: string
  config?: Record<string, any>
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'list'
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  config: Record<string, any>
  data?: any
}

// ========== Integration Types ==========

export interface IntegrationConfig {
  id: string
  name: string
  type: 'api' | 'webhook' | 'oauth' | 'database' | 'file'
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'configuring'
  config: Record<string, any>
  credentials: Record<string, string> // Encrypted in production
  permissions: string[]
  lastSync?: string
  errorMessage?: string
}

export interface WebhookConfig {
  id: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers: Record<string, string>
  secret?: string
  events: string[]
  active: boolean
  lastTriggered?: string
}

// ========== Settings Types ==========

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
    workflowUpdates: boolean
    agentCompletions: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'connections' | 'private'
    activityVisibility: 'public' | 'connections' | 'private'
    dataSharing: boolean
  }
  integrations: {
    autoSync: boolean
    syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  }
}

// ========== Error Types ==========

export interface AppError {
  id: string
  code: string
  message: string
  details?: Record<string, any>
  stack?: string
  timestamp: string
  userId?: string
  context?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved?: boolean
  resolvedAt?: string
  resolution?: string
}

// ========== Utility Types ==========

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type NonNullable<T> = T extends null | undefined ? never : T

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Keys>>
}[Keys]

export type ValueOf<T> = T[keyof T]

// ========== Event Types ==========

export interface AppEvent {
  id: string
  type: string
  timestamp: string
  userId?: string
  sessionId?: string
  data: Record<string, any>
  metadata?: Record<string, any>
}

export interface EventHandler<T = any> {
  (event: AppEvent & { data: T }): void | Promise<void>
}

// ========== Theme Types ==========

export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
    destructive: string
    success: string
    warning: string
  }
  fonts: {
    sans: string
    mono: string
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
}

// ========== File Upload Types ==========

export interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  uploadedBy: string
  metadata?: Record<string, any>
}

export interface UploadProgress {
  id: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

// ========== Search Types ==========

export interface SearchResult<T = any> {
  item: T
  score: number
  highlights: string[]
  matchedFields: string[]
}

export interface TemplateSearchFilters {
  query?: string
  type?: string[]
  category?: string[]
  status?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  author?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ========== Export/Import Types ==========

export interface ExportConfig {
  format: 'json' | 'csv' | 'xml' | 'pdf'
  includeMetadata: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: Record<string, any>
  fields?: string[]
}

export interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{
    row: number
    field?: string
    message: string
  }>
  warnings: string[]
}

export interface AspirationMatch {
  id: string
  user_id: string
  aspiration_id: string
  matched_user_id: string
  match_score: number
  match_reasons: string[]
  compatibility_factors: Record<string, number>
  created_at: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
}

// ========== LinkedIn Virtual Data Room Types ==========

export interface VDRConfig {
  name: string
  type: 'deal' | 'project' | 'partnership' | 'recruitment' | 'investment'
  linkedInCompanies: string[]
  autoInviteConnections: boolean
  aiInsights: boolean
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  expiryDate?: Date
  maxParticipants?: number
  storageProvider: 'qnap' | 'supabase' | 'local'
  encryptionEnabled: boolean
}

export interface DataRoom {
  id: string
  config: VDRConfig
  participants: VDRParticipant[]
  folders: VDRFolder[]
  documents: VDRDocument[]
  activities: VDRAuditLog[]
  insights: BusinessInsights
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'archived' | 'expired'
  healthScore: number
}

export interface VDRParticipant {
  id: string
  linkedInProfile: LinkedInProfile
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'guest'
  permissions: PermissionSet
  invitedAt: Date
  lastActivity: Date
  engagementScore: number
  relationshipStrength: number
}

export interface PermissionSet {
  view: boolean
  download: boolean
  upload: boolean
  invite: boolean
  aiSummary: boolean
  networkAccess: boolean
  export: boolean
  share: boolean
}

export interface VDRFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  permissions: PermissionSet
  metadata: {
    documentCount: number
    totalSize: number
    lastModified: Date
    confidentialityLevel: string
    tags: string[]
  }
  createdAt: Date
}

export interface VDRDocument {
  id: string
  name: string
  type: 'financial' | 'legal' | 'technical' | 'strategic' | 'hr' | 'presentation'
  fileUrl: string
  fileSize: number
  mimeType: string
  folderId: string
  uploadedBy: string
  permissions: PermissionSet
  metadata: {
    description?: string
    tags: string[]
    confidentialityLevel: string
    version: number
    checksum: string
    linkedInEntities?: string[]
    aiAnalysis?: ContentAnalysis
  }
  createdAt: Date
  lastAccessed: Date
}

export interface VDRAuditLog {
  id: string
  userId: string
  action: 'view' | 'download' | 'upload' | 'delete' | 'invite' | 'permission_change' | 'create' | 'archive'
  targetId: string
  targetType: 'document' | 'folder' | 'participant'
  details: Record<string, any>
  timestamp: Date
  ipAddress: string
  userAgent: string
}

export interface BusinessInsights {
  participantNetwork: NetworkAnalysis
  dealProbability: number
  riskAssessment: RiskAssessment
  engagementMetrics: EngagementMetrics
  timelineOptimization: TimelineSuggestion[]
  competitiveIntelligence: CompetitiveAlert[]
  generatedAt: Date
}

export interface NetworkAnalysis {
  connectionStrength: number
  mutualConnections: LinkedInConnection[]
  industryOverlap: string[]
  potentialConflicts: ConflictAlert[]
  networkReach: number
  keyInfluencers: string[]
  relationshipMap: RelationshipNode[]
  generatedAt: Date
}

export interface RelationshipNode {
  profileId: string
  name: string
  strength: number
  connections: string[]
  influence: number
}

export interface ConflictAlert {
  type: 'competition' | 'regulatory' | 'personal' | 'business'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  involvedParties: string[]
  mitigation: string[]
}

export interface RiskAssessment {
  overallScore: number
  categories: {
    regulatory: number
    financial: number
    operational: number
    reputational: number
    security: number
  }
  identifiedRisks: RiskItem[]
  mitigationStrategies: string[]
}

export interface RiskItem {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  probability: number
  impact: number
  mitigation: string[]
}

export interface EngagementMetrics {
  totalViews: number
  uniqueVisitors: number
  averageSessionDuration: number
  documentDownloads: number
  participantInteractions: ParticipantInteraction[]
  engagementTrend: number
  lastCalculated: Date
}

export interface ParticipantInteraction {
  participantId: string
  views: number
  downloads: number
  uploads: number
  comments: number
  lastActivity: Date
  engagementScore: number
}

export interface TimelineSuggestion {
  stage: string
  suggestedDate: Date
  confidence: number
  reasoning: string
  dependencies: string[]
  risks: string[]
}

export interface CompetitiveAlert {
  type: 'new_competitor' | 'price_change' | 'product_launch' | 'partnership'
  description: string
  impact: 'low' | 'medium' | 'high'
  source: string
  dateDetected: Date
  recommendations: string[]
}

export interface ContentAnalysis {
  documentType: 'financial' | 'legal' | 'technical' | 'strategic' | 'hr'
  keyEntities: Entity[]
  sentimentScore: number
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  linkedInRelevantProfiles: string[]
  suggestedTags: string[]
  executiveSummary?: string
  riskFactors?: string[]
  opportunities?: string[]
}

export interface Entity {
  type: 'person' | 'organization' | 'location' | 'date' | 'currency' | 'percentage'
  value: string
  confidence: number
  context: string[]
}

export interface ILinkedInVDRCore {
  createDataRoom(config: VDRConfig): Promise<DataRoom>
  addLinkedInContext(roomId: string, participants: LinkedInProfile[]): Promise<void>
  generateInsights(roomId: string): Promise<BusinessInsights>
  updateParticipantPermissions(roomId: string, participantId: string, permissions: PermissionSet): Promise<void>
  addDocument(roomId: string, document: Omit<VDRDocument, 'id' | 'createdAt' | 'lastAccessed'>): Promise<VDRDocument>
  archiveDataRoom(roomId: string): Promise<void>
  getAuditTrail(roomId: string): Promise<VDRAuditLog[]>
}

// ========== Smart Permissions Module ==========

export interface ISmartPermissions {
  calculatePermissions(user: LinkedInProfile, context: BusinessContext): PermissionSet
  suggestAccess(roomId: string, candidateProfile: LinkedInProfile): AccessRecommendation
  autoApprove(request: AccessRequest): Promise<boolean>
  getPermissionHistory(userId: string): PermissionHistory[]
}

export interface BusinessContext {
  dealType: string
  industry: string
  relationshipStrength: number
  confidentialityLevel: string
  timeSensitivity: 'low' | 'medium' | 'high' | 'critical'
  stakeholderRole: string
}

export interface AccessRecommendation {
  recommendedPermissions: PermissionSet
  confidence: number
  reasoning: string[]
  risks: string[]
  alternatives: PermissionSet[]
}

export interface AccessRequest {
  id: string
  userId: string
  roomId: string
  requestedPermissions: PermissionSet
  businessJustification: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  status: 'pending' | 'approved' | 'denied' | 'escalated'
}

export interface PermissionHistory {
  id: string
  userId: string
  roomId: string
  oldPermissions: PermissionSet
  newPermissions: PermissionSet
  changedBy: string
  reason: string
  timestamp: Date
}

// ========== Network Intelligence Module ==========

export interface INetworkIntelligence {
  analyzeParticipantNetwork(profiles: LinkedInProfile[]): Promise<NetworkAnalysis>
  suggestKeyStakeholders(dealType: string, industry: string): Promise<StakeholderSuggestions>
  identifyInfluencers(context: BusinessContext): Promise<InfluencerMap>
  trackRelationshipChanges(roomId: string): Promise<RelationshipDelta[]>
  getNetworkHealthScore(roomId: string): number
}

export interface StakeholderSuggestions {
  primary: LinkedInProfile[]
  secondary: LinkedInProfile[]
  influencers: LinkedInProfile[]
  gatekeepers: LinkedInProfile[]
  endUsers: LinkedInProfile[]
  confidence: number
  reasoning: string[]
}

export interface InfluencerMap {
  nodes: InfluencerNode[]
  edges: InfluencerEdge[]
  centrality: Record<string, number>
  clusters: InfluencerCluster[]
}

export interface InfluencerNode {
  profileId: string
  name: string
  influence: number
  connections: number
  activity: number
  expertise: string[]
}

export interface InfluencerEdge {
  from: string
  to: string
  strength: number
  type: 'professional' | 'personal' | 'industry' | 'influence'
}

export interface InfluencerCluster {
  id: string
  name: string
  members: string[]
  theme: string
  influence: number
}

export interface RelationshipDelta {
  profileId: string
  changeType: 'new_connection' | 'lost_connection' | 'strength_increase' | 'strength_decrease'
  oldValue?: number
  newValue?: number
  timestamp: Date
  context: string
}

// ========== Content Intelligence Module ==========

export interface IContentIntelligence {
  analyzeUploadedContent(file: File, context: BusinessContext): Promise<ContentAnalysis>
  generateExecutiveSummary(roomId: string): Promise<ExecutiveSummary>
  identifyKeyPersons(documents: VDRDocument[]): PersonEntity[]
  suggestFollowUpActions(analysis: ContentAnalysis): ActionItem[]
  detectDocumentSimilarity(doc1: VDRDocument, doc2: VDRDocument): SimilarityScore
  extractFinancialMetrics(document: VDRDocument): FinancialMetrics
}

export interface ExecutiveSummary {
  keyPoints: string[]
  risks: string[]
  opportunities: string[]
  recommendations: string[]
  confidence: number
  generatedAt: Date
  sourceDocuments: string[]
}

export interface PersonEntity {
  name: string
  role: string
  organization: string
  linkedinUrl?: string
  confidence: number
  context: string[]
  relationships: PersonRelationship[]
}

export interface PersonRelationship {
  relatedPerson: string
  relationshipType: string
  strength: number
  context: string
}

export interface ActionItem {
  id: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  dueDate?: Date
  dependencies: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

export interface SimilarityScore {
  score: number // 0-100
  reasons: string[]
  sharedEntities: Entity[]
  sharedThemes: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export interface FinancialMetrics {
  revenue?: CurrencyValue
  profit?: CurrencyValue
  assets?: CurrencyValue
  liabilities?: CurrencyValue
  marketCap?: CurrencyValue
  growthRate?: PercentageValue
  keyRatios: Record<string, number>
  trends: FinancialTrend[]
}

export interface CurrencyValue {
  amount: number
  currency: string
  confidence: number
}

export interface PercentageValue {
  value: number
  confidence: number
  timeframe?: string
}

export interface FinancialTrend {
  metric: string
  direction: 'increasing' | 'decreasing' | 'stable'
  magnitude: number
  timeframe: string
  confidence: number
}

// ========== Deal Flow Module ==========

export interface IDealFlow {
  createDealPipeline(type: DealType): DealPipeline
  trackProgress(dealId: string): DealProgress
  suggestNextSteps(dealId: string, context: BusinessContext): ActionPlan
  connectToLinkedInSales(): Promise<void>
  getDealHealthScore(dealId: string): number
  generateDealReport(dealId: string): DealReport
}

export type DealType = 'm&a' | 'investment' | 'partnership' | 'joint_venture' | 'asset_sale' | 'licensing'

export interface DealPipeline {
  id: string
  type: DealType
  stages: DealStage[]
  participants: LinkedInProfile[]
  documents: VDRDocument[]
  timeline: Timeline
  healthScore: number
  createdAt: Date
  updatedAt: Date
}

export interface DealStage {
  id: string
  name: string
  description: string
  order: number
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
  startDate?: Date
  endDate?: Date
  dependencies: string[]
  deliverables: string[]
  responsibleParty?: string
  progress: number // 0-100
}

export interface Timeline {
  plannedStart: Date
  plannedEnd: Date
  actualStart?: Date
  actualEnd?: Date
  milestones: Milestone[]
  criticalPath: string[]
  slippage: number // days
}

export interface Milestone {
  id: string
  name: string
  plannedDate: Date
  actualDate?: Date
  status: 'pending' | 'achieved' | 'delayed' | 'cancelled'
  dependencies: string[]
  importance: 'low' | 'medium' | 'high' | 'critical'
}

export interface DealProgress {
  overallProgress: number
  stageProgress: Record<string, number>
  blockers: Blocker[]
  nextMilestones: Milestone[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  estimatedCompletion: Date
}

export interface Blocker {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  affectedStages: string[]
  responsibleParty?: string
  resolution?: string
  createdAt: Date
}

export interface ActionPlan {
  immediate: ActionItem[]
  shortTerm: ActionItem[]
  longTerm: ActionItem[]
  priorities: string[]
  dependencies: string[]
  risks: string[]
  successMetrics: string[]
}

export interface DealReport {
  executiveSummary: string
  progressMetrics: Record<string, any>
  participantEngagement: EngagementMetrics
  documentActivity: DocumentActivity
  riskAssessment: RiskAssessment
  recommendations: string[]
  generatedAt: Date
}

export interface DocumentActivity {
  totalDocuments: number
  activeDocuments: number
  recentUploads: VDRDocument[]
  topViewed: VDRDocument[]
  reviewStatus: Record<string, number>
  completionRate: number
}

// ========== Compliance Engine Module ==========

export interface IComplianceEngine {
  validateAccess(user: LinkedInProfile, document: VDRDocument): ComplianceCheck
  auditTrail(roomId: string): AuditLog[]
  ensureDataSovereignty(region: string): Promise<boolean>
  linkedInPrivacyCompliance(): ComplianceStatus
  checkRegulatoryRequirements(dealType: DealType, jurisdiction: string): RegulatoryCheck
  generateComplianceReport(roomId: string): ComplianceReport
}

export interface ComplianceCheck {
  approved: boolean
  reason: string
  requiredActions: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  violations: ComplianceViolation[]
  recommendations: string[]
}

export interface ComplianceViolation {
  regulation: string
  severity: 'minor' | 'major' | 'critical'
  description: string
  remediation: string[]
  deadline?: Date
}

export interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  action: string
  resource: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  complianceFlags: string[]
}

export interface ComplianceStatus {
  overall: 'compliant' | 'non_compliant' | 'under_review'
  linkedInTerms: boolean
  gdprCompliance: boolean
  ccpaCompliance: boolean
  industrySpecific: Record<string, boolean>
  lastChecked: Date
  nextReview: Date
}

export interface RegulatoryCheck {
  jurisdiction: string
  applicableRegulations: string[]
  requirements: RegulatoryRequirement[]
  complianceLevel: number
  gaps: string[]
  remediation: string[]
}

export interface RegulatoryRequirement {
  regulation: string
  requirement: string
  status: 'met' | 'partial' | 'not_met'
  evidence: string[]
  deadline?: Date
}

export interface ComplianceReport {
  period: {
    start: Date
    end: Date
  }
  overallScore: number
  violations: ComplianceViolation[]
  correctiveActions: CorrectiveAction[]
  trends: ComplianceTrend[]
  recommendations: string[]
}

export interface CorrectiveAction {
  id: string
  violation: string
  action: string
  status: 'pending' | 'in_progress' | 'completed'
  dueDate: Date
  responsibleParty: string
}

export interface ComplianceTrend {
  metric: string
  previousValue: number
  currentValue: number
  trend: 'improving' | 'stable' | 'declining'
  significance: 'low' | 'medium' | 'high'
}

// ========== AI Agent Module ==========

export interface IAIAgent {
  processNaturalLanguageQuery(query: string, context: VDRContext): Promise<AgentResponse>
  scheduleAutomatedTasks(roomId: string): Promise<void>
  generateInsights(data: VDRData): BusinessInsights
  proactiveNotifications(userId: string): Notification[]
  analyzeSentiment(text: string): SentimentAnalysis
  suggestOptimizations(roomId: string): OptimizationSuggestion[]
}

export interface VDRContext {
  roomId: string
  userId: string
  userRole: string
  currentView: string
  recentActions: VDRAuditLog[]
  participantProfiles: LinkedInProfile[]
  activeDocuments: VDRDocument[]
}

export interface AgentResponse {
  answer: string
  suggestedActions: Action[]
  relevantDocuments: VDRDocument[]
  linkedInConnections: LinkedInProfile[]
  confidence: number
  sources: string[]
  followUpQuestions: string[]
}

export interface Action {
  type: 'view_document' | 'invite_participant' | 'schedule_meeting' | 'update_permissions' | 'generate_report'
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  data: Record<string, any>
  reasoning: string
}

export interface VDRData {
  rooms: DataRoom[]
  participants: VDRParticipant[]
  documents: VDRDocument[]
  activities: VDRAuditLog[]
  insights: BusinessInsights
}

export interface Notification {
  id: string
  type: 'deal_progress' | 'document_upload' | 'participant_join' | 'deadline' | 'risk_alert' | 'opportunity'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionable: boolean
  actionUrl?: string
  createdAt: Date
  expiresAt?: Date
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative'
  score: number // -1 to 1
  confidence: number
  keyPhrases: string[]
  emotions: Record<string, number>
  context: string
}

export interface OptimizationSuggestion {
  type: 'process' | 'permissions' | 'timeline' | 'communication' | 'risk_mitigation'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  implementation: string[]
  expectedBenefit: string
}

// ========== LinkedIn Auth Module ==========

export interface ILinkedInAuth {
  authenticateUser(linkedInToken: string): Promise<AuthResult>
  validateProfessionalCredentials(profile: LinkedInProfile): Promise<boolean>
  enableMFA(): Promise<void>
  auditLoginAttempts(): AuditLog[]
  refreshToken(refreshToken: string): Promise<TokenRefreshResult>
  validateSession(sessionId: string): Promise<boolean>
}

export interface AuthResult {
  success: boolean
  userId?: string
  profile?: LinkedInProfile
  tokens?: AuthTokens
  error?: string
  requiresMFA?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
  scope: string[]
}

export interface TokenRefreshResult {
  success: boolean
  tokens?: AuthTokens
  error?: string
}

// ========== Security Modules ==========

export interface IEncryption {
  encryptDocument(doc: VDRDocument, participants: LinkedInProfile[]): Promise<EncryptedDocument>
  decryptDocument(encryptedDoc: EncryptedDocument, userId: string): Promise<VDRDocument>
  keyRotation(): Promise<void>
  quantumResistantEncryption(): Promise<void>
  validateEncryption(docId: string): Promise<boolean>
}

export interface EncryptedDocument {
  id: string
  encryptedData: string
  encryptionKey: string
  algorithm: string
  keyVersion: string
  participants: string[]
  createdAt: Date
}

export interface IBehavioralSecurity {
  analyzeUserBehavior(userId: string, actions: UserAction[]): SecurityRisk
  detectAnomalies(roomId: string): Anomaly[]
  preventDataExfiltration(userId: string): PreventionStatus
  generateSecurityReport(roomId: string): SecurityReport
  updateBehaviorBaseline(userId: string): Promise<void>
}

export interface UserAction {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: Date
  metadata: Record<string, any>
  riskScore?: number
}

export interface SecurityRisk {
  level: 'low' | 'medium' | 'high' | 'critical'
  score: number
  factors: RiskFactor[]
  recommendations: string[]
  incidentId?: string
}

export interface RiskFactor {
  type: 'timing' | 'frequency' | 'unusual_access' | 'data_volume' | 'location'
  description: string
  severity: number
  evidence: string[]
}

export interface Anomaly {
  id: string
  type: 'behavioral' | 'access' | 'data' | 'network'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedUsers: string[]
  affectedResources: string[]
  detectedAt: Date
  confidence: number
}

export interface PreventionStatus {
  blocked: boolean
  reason: string
  actions: string[]
  timestamp: Date
}

export interface SecurityReport {
  period: {
    start: Date
    end: Date
  }
  overallRisk: number
  incidents: SecurityIncident[]
  anomalies: Anomaly[]
  blockedActions: BlockedAction[]
  recommendations: string[]
}

export interface SecurityIncident {
  id: string
  type: string
  severity: string
  description: string
  affectedUsers: string[]
  response: string
  resolved: boolean
  timestamp: Date
}

export interface BlockedAction {
  id: string
  userId: string
  action: string
  reason: string
  timestamp: Date
  riskLevel: string
}
