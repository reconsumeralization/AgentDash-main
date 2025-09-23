// Knowledge Base Types and Interfaces

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  type: 'general' | 'domain-specific' | 'project-specific' | 'personal'
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  isPublic: boolean
  isActive: boolean
  metadata: {
    totalFiles: number
    totalSize: number
    lastAccessed?: Date
    accessCount: number
    version: string
  }
  settings: {
    autoIndex: boolean
    allowPublicAccess: boolean
    requireApproval: boolean
    maxFileSize: number
    allowedFileTypes: string[]
  }
  attachedAgents: string[] // Agent IDs that have access to this KB
  permissions: KnowledgeBasePermissions
}

export interface KnowledgeBasePermissions {
  read: string[] // User IDs
  write: string[] // User IDs
  admin: string[] // User IDs
  public: boolean
}

export interface KnowledgeBaseItem {
  id: string
  knowledgeBaseId: string
  name: string
  type: 'file' | 'text' | 'url' | 'chat-history' | 'profile-data' | 'api-data'
  source: 'upload' | 'file-manager' | 'chat-history' | 'user-profile' | 'api' | 'web-scrape'
  content: string | File | URL
  metadata: {
    size?: number
    mimeType?: string
    encoding?: string
    language?: string
    extractedText?: string
    summary?: string
    keywords?: string[]
    entities?: string[]
    sentiment?: 'positive' | 'negative' | 'neutral'
    confidence?: number
    lastIndexed?: Date
    version: string
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
  isProcessed: boolean
  isIndexed: boolean
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped'
  processingError?: string
  attachments: KnowledgeBaseAttachment[]
}

export interface KnowledgeBaseAttachment {
  id: string
  itemId: string
  agentId: string
  attachmentType: 'full-access' | 'read-only' | 'contextual' | 'conditional'
  conditions?: AttachmentCondition[]
  priority: number
  createdAt: Date
  createdBy: string
  isActive: boolean
}

export interface AttachmentCondition {
  type: 'user-role' | 'project-context' | 'time-based' | 'content-match' | 'agent-capability'
  operator: 'equals' | 'contains' | 'matches' | 'greater-than' | 'less-than' | 'in-range'
  value: any
  description: string
}

export interface Agent {
  id: string
  name: string
  description: string
  type: 'assistant' | 'specialist' | 'analyst' | 'researcher' | 'writer' | 'developer' | 'custom'
  capabilities: string[]
  personality: {
    tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'technical'
    expertise: string[]
    communication_style: 'concise' | 'detailed' | 'conversational' | 'analytical'
  }
  knowledgeBases: AgentKnowledgeBase[]
  settings: {
    autoAttachKB: boolean
    maxKBItems: number
    kbSelectionStrategy: 'intelligent' | 'manual' | 'hybrid'
    contextWindow: number
    responseLength: 'short' | 'medium' | 'long'
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  usage: {
    totalInteractions: number
    lastUsed?: Date
    averageRating: number
    totalRating: number
  }
}

export interface AgentKnowledgeBase {
  knowledgeBaseId: string
  attachmentType: 'full-access' | 'read-only' | 'contextual' | 'conditional'
  priority: number
  conditions?: AttachmentCondition[]
  isActive: boolean
  attachedAt: Date
  attachedBy: string
}

export interface KnowledgeBaseSearchResult {
  item: KnowledgeBaseItem
  relevanceScore: number
  matchedTerms: string[]
  snippet: string
  highlights: {
    field: string
    text: string
    position: number
  }[]
}

export interface KnowledgeBaseUploadSource {
  type: 'file-upload' | 'file-manager' | 'chat-history' | 'user-profile' | 'api' | 'web-url'
  sourceId?: string
  sourceName: string
  sourceUrl?: string
  metadata?: Record<string, any>
}

export interface KnowledgeBaseProcessingJob {
  id: string
  itemId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt?: Date
  completedAt?: Date
  error?: string
  steps: {
    name: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    result?: any
    error?: string
  }[]
}

export interface KnowledgeBaseAnalytics {
  knowledgeBaseId: string
  period: 'day' | 'week' | 'month' | 'year'
  metrics: {
    totalAccesses: number
    uniqueUsers: number
    mostAccessedItems: Array<{
      itemId: string
      name: string
      accessCount: number
    }>
    searchQueries: Array<{
      query: string
      count: number
      successRate: number
    }>
    agentUsage: Array<{
      agentId: string
      agentName: string
      usageCount: number
      averageRating: number
    }>
  }
  generatedAt: Date
}

export interface IntelligentKBSelection {
  agentId: string
  context: {
    userQuery: string
    userRole: string
    projectContext?: string
    conversationHistory?: string[]
    currentTask?: string
  }
  selectedKnowledgeBases: Array<{
    knowledgeBaseId: string
    relevanceScore: number
    reasoning: string
    suggestedAttachmentType: 'full-access' | 'read-only' | 'contextual' | 'conditional'
  }>
  confidence: number
  generatedAt: Date
}

// Utility types
export type KnowledgeBaseItemType = KnowledgeBaseItem['type']
export type KnowledgeBaseSource = KnowledgeBaseItem['source']
export type AttachmentType = KnowledgeBaseAttachment['attachmentType']
export type AgentType = Agent['type']
export type ProcessingStatus = KnowledgeBaseProcessingJob['status']

// Constants
export const KNOWLEDGE_BASE_TYPES = {
  GENERAL: 'general',
  DOMAIN_SPECIFIC: 'domain-specific',
  PROJECT_SPECIFIC: 'project-specific',
  PERSONAL: 'personal'
} as const

export const ITEM_TYPES = {
  FILE: 'file',
  TEXT: 'text',
  URL: 'url',
  CHAT_HISTORY: 'chat-history',
  PROFILE_DATA: 'profile-data',
  API_DATA: 'api-data'
} as const

export const SOURCE_TYPES = {
  UPLOAD: 'upload',
  FILE_MANAGER: 'file-manager',
  CHAT_HISTORY: 'chat-history',
  USER_PROFILE: 'user-profile',
  API: 'api',
  WEB_SCRAPE: 'web-scrape'
} as const

export const ATTACHMENT_TYPES = {
  FULL_ACCESS: 'full-access',
  READ_ONLY: 'read-only',
  CONTEXTUAL: 'contextual',
  CONDITIONAL: 'conditional'
} as const

export const AGENT_TYPES = {
  ASSISTANT: 'assistant',
  SPECIALIST: 'specialist',
  ANALYST: 'analyst',
  RESEARCHER: 'researcher',
  WRITER: 'writer',
  DEVELOPER: 'developer',
  CUSTOM: 'custom'
} as const

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/html',
  'application/json',
  'application/xml',
  'text/xml'
]
