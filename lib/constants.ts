// Application Constants for DefConect Platform

// ========== API Constants ==========

export const API_ROUTES = {
  ASPIRATIONS: '/api/aspirations',
  TRIBES: '/api/tribes',
  CONNECTIONS: '/api/connections',
  MATCHING: '/api/matching',
  CONTEXT: '/api/context',
  AGENTS: '/api/agents',
  WORKFLOWS: '/api/workflows',
  PROJECTS: '/api/projects',
  ANALYTICS: '/api/analytics',
  INTEGRATIONS: '/api/integrations'
} as const

export const API_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  LONG_RUNNING: 30000, // 30 seconds
  UPLOAD: 120000 // 2 minutes
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const

// ========== Business Logic Constants ==========

export const LINKEDIN_LIMITS = {
  CONNECTIONS: 30000,
  INVITATIONS_PER_WEEK: 20,
  MESSAGES_PER_CONNECTION: 15,
  SEARCH_RESULTS: 1000,
  PROFILE_VIEWS_PER_DAY: 80
} as const

export const ASPIRATION_CATEGORIES = [
  { value: 'career', label: 'Career Development', color: 'blue' },
  { value: 'skill', label: 'Skill Learning', color: 'green' },
  { value: 'project', label: 'Project Building', color: 'purple' },
  { value: 'cause', label: 'Social Impact', color: 'red' },
  { value: 'networking', label: 'Network Expansion', color: 'orange' }
] as const

export const ASPIRATION_PRIORITIES = [
  { value: 'low', label: 'Low Priority', color: 'gray' },
  { value: 'medium', label: 'Medium Priority', color: 'blue' },
  { value: 'high', label: 'High Priority', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' }
] as const

export const ASPIRATION_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'blue' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
] as const

// ========== Agent Constants ==========

export const AGENT_TYPES = [
  { value: 'context', label: 'Context Intelligence', description: 'Analyzes user goals and provides personalized insights' },
  { value: 'research', label: 'Research & Analysis', description: 'Gathers and analyzes data from various sources' },
  { value: 'expert', label: 'Expert Advisor', description: 'Provides strategic guidance and recommendations' },
  { value: 'analysis', label: 'Data Analysis', description: 'Processes and interprets complex datasets' },
  { value: 'linkedin', label: 'LinkedIn Strategy', description: 'Optimizes professional networking and relationship building' }
] as const

export const AGENT_MODELS = [
  { value: 'gpt-4', label: 'GPT-4', provider: 'OpenAI', contextWindow: 8192 },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI', contextWindow: 128000 },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic', contextWindow: 200000 },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'Anthropic', contextWindow: 200000 },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'Google', contextWindow: 32768 }
] as const

// ========== Workflow Constants ==========

export const WORKFLOW_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'blue' },
  { value: 'archived', label: 'Archived', color: 'gray' }
] as const

export const WORKFLOW_NODE_TYPES = [
  { value: 'start', label: 'Start', color: 'green', icon: 'Play' },
  { value: 'end', label: 'End', color: 'red', icon: 'Square' },
  { value: 'action', label: 'Action', color: 'blue', icon: 'Zap' },
  { value: 'condition', label: 'Condition', color: 'orange', icon: 'GitBranch' },
  { value: 'parallel', label: 'Parallel', color: 'purple', icon: 'Split' },
  { value: 'delay', label: 'Delay', color: 'gray', icon: 'Clock' },
  { value: 'api', label: 'API Call', color: 'cyan', icon: 'Globe' },
  { value: 'ai', label: 'AI Task', color: 'indigo', icon: 'Brain' },
  { value: 'human', label: 'Human Task', color: 'pink', icon: 'User' }
] as const

// ========== Project Constants ==========

export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning', color: 'blue' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'on-hold', label: 'On Hold', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
] as const

export const PROJECT_ROLES = [
  { value: 'founder', label: 'Founder', permissions: ['manage', 'edit', 'delete'] },
  { value: 'lead', label: 'Project Lead', permissions: ['edit', 'assign'] },
  { value: 'member', label: 'Team Member', permissions: ['view', 'comment'] },
  { value: 'observer', label: 'Observer', permissions: ['view'] }
] as const

// ========== Integration Constants ==========

export const INTEGRATION_PROVIDERS = [
  { value: 'linkedin', label: 'LinkedIn', category: 'social', oauth: true },
  { value: 'slack', label: 'Slack', category: 'communication', oauth: true },
  { value: 'notion', label: 'Notion', category: 'productivity', oauth: true },
  { value: 'github', label: 'GitHub', category: 'development', oauth: true },
  { value: 'google-calendar', label: 'Google Calendar', category: 'productivity', oauth: true },
  { value: 'stripe', label: 'Stripe', category: 'payment', apiKey: true },
  { value: 'mailchimp', label: 'Mailchimp', category: 'marketing', apiKey: true },
  { value: 'hubspot', label: 'HubSpot', category: 'crm', oauth: true },
  { value: 'salesforce', label: 'Salesforce', category: 'crm', oauth: true },
  { value: 'zapier', label: 'Zapier', category: 'automation', apiKey: true }
] as const

// ========== UI Constants ==========

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070
} as const

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700
} as const

// ========== File Upload Constants ==========

export const FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  code: ['text/plain', 'application/json', 'application/javascript', 'text/javascript', 'text/typescript']
} as const

export const MAX_FILE_SIZES = {
  images: 10 * 1024 * 1024, // 10MB
  documents: 25 * 1024 * 1024, // 25MB
  spreadsheets: 25 * 1024 * 1024, // 25MB
  presentations: 50 * 1024 * 1024, // 50MB
  archives: 100 * 1024 * 1024, // 100MB
  code: 5 * 1024 * 1024 // 5MB
} as const

// ========== Notification Constants ==========

export const NOTIFICATION_TYPES = [
  { value: 'success', label: 'Success', icon: 'CheckCircle', color: 'green' },
  { value: 'error', label: 'Error', icon: 'XCircle', color: 'red' },
  { value: 'warning', label: 'Warning', icon: 'AlertTriangle', color: 'yellow' },
  { value: 'info', label: 'Info', icon: 'Info', color: 'blue' },
  { value: 'achievement', label: 'Achievement', icon: 'Trophy', color: 'gold' }
] as const

// ========== Search Constants ==========

export const SEARCH_OPERATORS = [
  { value: 'contains', label: 'Contains', symbol: '~' },
  { value: 'equals', label: 'Equals', symbol: '=' },
  { value: 'startsWith', label: 'Starts with', symbol: '^' },
  { value: 'endsWith', label: 'Ends with', symbol: '$' },
  { value: 'greaterThan', label: 'Greater than', symbol: '>' },
  { value: 'lessThan', label: 'Less than', symbol: '<' },
  { value: 'between', label: 'Between', symbol: '<>' }
] as const

// ========== Validation Constants ==========

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
} as const

// ========== Time Constants ==========

export const TIME_ZONES = [
  { value: 'UTC', label: 'UTC', offset: 0 },
  { value: 'EST', label: 'Eastern Time', offset: -5 },
  { value: 'PST', label: 'Pacific Time', offset: -8 },
  { value: 'GMT', label: 'Greenwich Mean Time', offset: 0 },
  { value: 'CET', label: 'Central European Time', offset: 1 },
  { value: 'JST', label: 'Japan Standard Time', offset: 9 },
  { value: 'IST', label: 'India Standard Time', offset: 5.5 }
] as const

export const DATE_FORMATS = {
  short: 'MM/dd/yyyy',
  medium: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  full: 'EEEE, MMMM dd, yyyy',
  iso: 'yyyy-MM-dd',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm'
} as const

// ========== Feature Flags ==========

export const FEATURE_FLAGS = {
  AI_INSIGHTS: true,
  ADVANCED_ANALYTICS: true,
  BULK_ACTIONS: true,
  CUSTOM_WORKFLOWS: true,
  INTEGRATIONS: true,
  MOBILE_APP: false,
  PREMIUM_FEATURES: false,
  TEAM_COLLABORATION: true,
  THIRD_PARTY_INTEGRATIONS: true,
  WEBHOOKS: true
} as const

// ========== Error Messages ==========

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
  QUOTA_EXCEEDED: 'You have exceeded your usage quota.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.'
} as const

// ========== Success Messages ==========

export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Item deleted successfully.',
  CREATED: 'Item created successfully.',
  UPDATED: 'Item updated successfully.',
  UPLOADED: 'File uploaded successfully.',
  SENT: 'Message sent successfully.',
  CONNECTED: 'Connection established successfully.',
  DISCONNECTED: 'Connection terminated successfully.'
} as const
