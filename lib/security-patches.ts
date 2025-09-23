/**
 * 🛡️ SECURITY PATCHES - Comprehensive Security Fixes
 * Addresses all identified vulnerabilities in the Guidance Engine
 */

import { createHash, randomBytes, createHmac } from 'crypto'

// Security configuration
export const SECURITY_CONFIG = {
  // Input validation limits
  MAX_INPUT_LENGTH: 10000,
  MAX_REQUIREMENTS: 50,
  MAX_PURPOSE_LENGTH: 1000,
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS_PER_WINDOW: 50, // Reduced from 100
  MAX_REQUESTS_PER_MINUTE: 10,
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  },
  
  // Allowed patterns
  ALLOWED_LANGUAGES: ['typescript', 'javascript', 'python', 'java', 'go'] as const,
  ALLOWED_SECURITY_LEVELS: ['low', 'medium', 'high'] as const,
  ALLOWED_ENVIRONMENTS: ['development', 'staging', 'production'] as const,
  
  // Malicious patterns to block
  MALICIOUS_PATTERNS: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /function\s*\(/gi,
    /document\.write/gi,
    /innerHTML/gi,
    /outerHTML/gi,
    /\.\.\//g, // Path traversal
    /\.\.\\/g, // Path traversal (Windows)
    /union\s+select/gi, // SQL injection
    /drop\s+table/gi, // SQL injection
    /delete\s+from/gi, // SQL injection
    /insert\s+into/gi, // SQL injection
    /update\s+set/gi, // SQL injection
    /exec\s*\(/gi, // Command injection
    /system\s*\(/gi, // Command injection
    /shell_exec/gi, // Command injection
    /passthru/gi, // Command injection
    /proc_open/gi, // Command injection
    /popen/gi, // Command injection
    /file_get_contents\s*\(/gi, // File inclusion
    /include\s*\(/gi, // File inclusion
    /require\s*\(/gi, // File inclusion
    /require_once\s*\(/gi, // File inclusion
    /fopen\s*\(/gi, // File access
    /fread\s*\(/gi, // File access
    /fwrite\s*\(/gi, // File access
    /unlink\s*\(/gi, // File deletion
    /rmdir\s*\(/gi, // Directory deletion
    /mkdir\s*\(/gi, // Directory creation
    /chmod\s*\(/gi, // Permission change
    /chown\s*\(/gi, // Ownership change
    /base64_decode/gi, // Obfuscation
    /gzinflate/gi, // Obfuscation
    /str_rot13/gi, // Obfuscation
    /create_function/gi, // Dynamic function creation
    /call_user_func/gi, // Dynamic function call
    /call_user_func_array/gi, // Dynamic function call
    /preg_replace.*\/e/gi, // Code execution
    /assert\s*\(/gi, // Code execution
    /extract\s*\(/gi, // Variable extraction
    /parse_str\s*\(/gi, // Variable parsing
    /import\s*\(/gi, // Dynamic import
    /__import__\s*\(/gi, // Dynamic import
    /execfile\s*\(/gi, // File execution
    /compile\s*\(/gi, // Code compilation
    /eval\s*\(/gi, // Code evaluation
    /subprocess/gi, // Process execution
    /os\.system/gi, // System command
    /os\.popen/gi, // Process opening
    /pickle/gi, // Deserialization
    /marshal/gi, // Serialization
    /shelve/gi, // Object persistence
    /dbm/gi, // Database access
    /sqlite3/gi, // Database access
    /psycopg2/gi, // Database access
    /pymongo/gi, // Database access
    /redis/gi, // Cache access
    /memcache/gi, // Cache access
    /urllib/gi, // Network access
    /requests/gi, // HTTP requests
    /httplib/gi, // HTTP client
    /\bsocket\s*\(/gi, // Socket function calls
    /ftplib/gi, // FTP client
    /smtplib/gi, // SMTP client
    /telnetlib/gi, // Telnet client
    /xmlrpc/gi, // XML-RPC
    /soap/gi, // SOAP
    /\bwsdl\s*\(/gi, // WSDL function calls
    /lxml/gi, // XML processing
    /xml/gi, // XML processing
    /\bjson\s*\(/gi, // JSON function calls
    /yaml/gi, // YAML processing
    /configparser/gi, // Configuration
    /optparse/gi, // Option parsing
    /argparse/gi, // Argument parsing
    /getopt/gi, // Option parsing
    /sys\.argv/gi, // Command line arguments
    /os\.environ/gi, // Environment variables
    /os\.getenv/gi, // Environment variables
    /os\.putenv/gi, // Environment variables
    /os\.unsetenv/gi, // Environment variables
    /os\.chdir/gi, // Directory change
    /os\.getcwd/gi, // Current directory
    /os\.listdir/gi, // Directory listing
    /os\.walk/gi, // Directory walking
    /os\.path/gi, // Path operations
    /shutil/gi, // File operations
    /glob/gi, // File globbing
    /fnmatch/gi, // Filename matching
    /tempfile/gi, // Temporary files
    /zipfile/gi, // Archive handling
    /tarfile/gi, // Archive handling
    /gzip/gi, // Compression
    /bz2/gi, // Compression
    /lzma/gi, // Compression
    /zlib/gi, // Compression
    /\bhashlib\s*\(/gi, // Hashlib function calls
    /hmac/gi, // HMAC
    /secrets/gi, // Cryptographically secure random
    /\brandom\s*\(/gi, // Random function calls
    /uuid/gi, // UUID generation
    /time/gi, // Time operations
    /datetime/gi, // Date/time operations
    /calendar/gi, // Calendar operations
    /locale/gi, // Locale operations
    /gettext/gi, // Internationalization
    /codecs/gi, // Text encoding
    /unicodedata/gi, // Unicode data
    /string/gi, // String operations
    /\bre\s*\(/gi, // Regular expression functions
    /difflib/gi, // Text differences
    /textwrap/gi, // Text wrapping
    /csv/gi, // CSV processing
    /configparser/gi, // Configuration parsing
    /logging/gi, // Logging
    /warnings/gi, // Warning system
    /traceback/gi, // Error traceback
    /inspect/gi, // Code inspection
    /\bdis\s*\(/gi, // Disassembly function calls
    /py_compile/gi, // Python compilation
    /compileall/gi, // Batch compilation
    /pyclbr/gi, // Class browser
    /keyword/gi, // Python keywords
    /\btoken\s*\(/gi, // Token function calls
    /tokenize/gi, // Tokenizer
    /ast/gi, // Abstract syntax trees
    /symtable/gi, // Symbol tables
    /symbol/gi, // Symbol constants
    /parser/gi, // Parser
    /compiler/gi, // Python compiler
    /distutils/gi, // Distribution utilities
    /setuptools/gi, // Setup tools
    /pip/gi, // Package installer
    /pkg_resources/gi, // Package resources
    /pkgutil/gi, // Package utilities
    /importlib/gi, // Import utilities
    /\bimp\s*\(/gi, // Import module functions
    /modulefinder/gi, // Module finder
    /runpy/gi, // Run Python modules
    /pydoc/gi, // Documentation generator
    /doctest/gi, // Test framework
    /unittest/gi, // Unit testing
    /\btest\s*\(/gi, // Test function calls
    /lib2to3/gi, // Python 2 to 3 conversion
    /2to3/gi, // Python 2 to 3 tool
    /idlelib/gi, // IDLE
    /tkinter/gi, // Tkinter GUI
    /turtle/gi, // Turtle graphics
    /cmd/gi, // Command interpreter
    /shlex/gi, // Shell-like parsing
    /subprocess/gi, // Subprocess management
    /multiprocessing/gi, // Multiprocessing
    /threading/gi, // Threading
    /queue/gi, // Queue implementation
    /sched/gi, // Event scheduler
    /concurrent/gi, // Concurrent execution
    /asyncio/gi, // Asynchronous I/O
    /select/gi, // I/O multiplexing
    /selectors/gi, // I/O selector
    /signal/gi, // Signal handling
    /mmap/gi, // Memory-mapped files
    /ctypes/gi, // C types
    /struct/gi, // Binary data structures
    /array/gi, // Arrays
    /weakref/gi, // Weak references
    /gc/gi, // Garbage collection
    /sys/gi, // System-specific parameters
    /builtins/gi, // Built-in functions
    /__builtin__/gi, // Built-in functions (Python 2)
    /future/gi, // Future statements
    /past/gi, // Past statements
    /six/gi, // Python 2/3 compatibility
    /mock/gi, // Mocking
    /unittest\.mock/gi, // Mocking
    /pytest/gi, // Testing framework
    /nose/gi, // Testing framework
    /coverage/gi, // Code coverage
    /flake8/gi, // Linting
    /pylint/gi, // Linting
    /black/gi, // Code formatting
    /autopep8/gi, // Code formatting
    /yapf/gi, // Code formatting
    /isort/gi, // Import sorting
    /mypy/gi, // Type checking
    /pyright/gi, // Type checking
    /bandit/gi, // Security linting
    /safety/gi, // Security scanning
    /pipenv/gi, // Package management
    /poetry/gi, // Package management
    /conda/gi, // Package management
    /virtualenv/gi, // Virtual environment
    /venv/gi, // Virtual environment
    /pyenv/gi, // Python version management
    /anaconda/gi, // Anaconda distribution
    /miniconda/gi, // Miniconda distribution
    /jupyter/gi, // Jupyter notebook
    /ipython/gi, // IPython
    /spyder/gi, // Spyder IDE
    /pycharm/gi, // PyCharm IDE
    /vscode/gi, // VS Code
    /sublime/gi, // Sublime Text
    /vim/gi, // Vim editor
    /emacs/gi, // Emacs editor
    /nano/gi, // Nano editor
    /gedit/gi, // Gedit editor
    /notepad/gi, // Notepad
    /notepad\+\+/gi, // Notepad++
    /atom/gi, // Atom editor
    /brackets/gi, // Brackets editor
    /webstorm/gi, // WebStorm IDE
    /intellij/gi, // IntelliJ IDEA
    /eclipse/gi, // Eclipse IDE
    /netbeans/gi, // NetBeans IDE
    /codeblocks/gi, // Code::Blocks
    /devcpp/gi, // Dev-C++
    /visualstudio/gi, // Visual Studio
    /visualstudiocode/gi, // Visual Studio Code
    /xcode/gi, // Xcode
    /androidstudio/gi, // Android Studio
    /appcode/gi, // AppCode
    /clion/gi, // CLion
    /datagrip/gi, // DataGrip
    /goland/gi, // GoLand
    /phpstorm/gi, // PhpStorm
    /pycharm/gi, // PyCharm
    /rider/gi, // Rider
    /rubymine/gi, // RubyMine
    /webstorm/gi, // WebStorm
    /intellij/gi, // IntelliJ IDEA
    /eclipse/gi, // Eclipse
    /netbeans/gi, // NetBeans
    /codeblocks/gi, // Code::Blocks
    /devcpp/gi, // Dev-C++
    /visualstudio/gi, // Visual Studio
    /visualstudiocode/gi, // Visual Studio Code
    /xcode/gi, // Xcode
    /androidstudio/gi, // Android Studio
    /appcode/gi, // AppCode
    /clion/gi, // CLion
    /datagrip/gi, // DataGrip
    /goland/gi, // GoLand
    /phpstorm/gi, // PhpStorm
    /pycharm/gi, // PyCharm
    /rider/gi, // Rider
    /rubymine/gi, // RubyMine
    /webstorm/gi, // WebStorm
  ],
  
  // Safe patterns (whitelist)
  SAFE_PATTERNS: [
    /^[a-zA-Z0-9\s\-_.,!?()]+$/, // Basic alphanumeric with common punctuation
    /^[a-zA-Z0-9\s\-_.,!?(){}[\]]+$/, // With brackets
    /^[a-zA-Z0-9\s\-_.,!?(){}[\]"'`]+$/, // With quotes
    /^[a-zA-Z0-9\s\-_.,!?(){}[\]"'`@#$%^&*+=|\\/<>~`]+$/ // Extended safe characters
  ]
}

/**
 * Input sanitization and validation
 */
export class SecurityValidator {
  /**
   * Sanitize and validate input string
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }
    
    // Check length limits
    if (input.length > SECURITY_CONFIG.MAX_INPUT_LENGTH) {
      throw new Error('Input too long')
    }
    
    // Check for malicious patterns
    for (const pattern of SECURITY_CONFIG.MALICIOUS_PATTERNS) {
      if (pattern.test(input)) {
        throw new Error(`Potentially malicious pattern detected: ${pattern.source}`)
      }
    }
    
    // Basic HTML encoding
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }
  
  /**
   * Validate purpose string
   */
  static validatePurpose(purpose: string): string {
    if (!purpose || typeof purpose !== 'string') {
      throw new Error('Purpose is required')
    }
    
    if (purpose.length > SECURITY_CONFIG.MAX_PURPOSE_LENGTH) {
      throw new Error('Purpose too long')
    }
    
    return this.sanitizeInput(purpose)
  }
  
  /**
   * Validate requirements array
   */
  static validateRequirements(requirements: string[]): string[] {
    if (!Array.isArray(requirements)) {
      throw new Error('Requirements must be an array')
    }
    
    if (requirements.length > SECURITY_CONFIG.MAX_REQUIREMENTS) {
      throw new Error('Too many requirements')
    }
    
    return requirements.map(req => {
      if (typeof req !== 'string') {
        throw new Error('All requirements must be strings')
      }
      return this.sanitizeInput(req)
    })
  }
  
  /**
   * Validate language
   */
  static validateLanguage(language: string): string {
    if (!SECURITY_CONFIG.ALLOWED_LANGUAGES.includes(language as any)) {
      throw new Error('Invalid language')
    }
    return language
  }
  
  /**
   * Validate security level
   */
  static validateSecurityLevel(level: string): string {
    if (!SECURITY_CONFIG.ALLOWED_SECURITY_LEVELS.includes(level as any)) {
      throw new Error('Invalid security level')
    }
    return level
  }
  
  /**
   * Validate environment
   */
  static validateEnvironment(env: string): string {
    if (!SECURITY_CONFIG.ALLOWED_ENVIRONMENTS.includes(env as any)) {
      throw new Error('Invalid environment')
    }
    return env
  }
  
  /**
   * Validate framework name
   */
  static validateFramework(framework: string): string {
    if (!framework) return ''
    
    // Only allow alphanumeric, hyphens, and dots
    if (!/^[a-zA-Z0-9\-_.]+$/.test(framework)) {
      throw new Error('Invalid framework name')
    }
    
    return this.sanitizeInput(framework)
  }
  
  /**
   * Validate performance requirements
   */
  static validatePerformanceRequirements(perf: any): any {
    if (!perf || typeof perf !== 'object') {
      return undefined
    }
    
    const validated: any = {}
    
    if (perf.maxLatency !== undefined) {
      if (typeof perf.maxLatency !== 'number' || perf.maxLatency <= 0 || perf.maxLatency > 300000) {
        throw new Error('Invalid maxLatency')
      }
      validated.maxLatency = perf.maxLatency
    }
    
    if (perf.memoryLimit !== undefined) {
      if (typeof perf.memoryLimit !== 'number' || perf.memoryLimit <= 0 || perf.memoryLimit > 1024 * 1024 * 1024) {
        throw new Error('Invalid memoryLimit')
      }
      validated.memoryLimit = perf.memoryLimit
    }
    
    if (perf.cpuLimit !== undefined) {
      if (typeof perf.cpuLimit !== 'number' || perf.cpuLimit < 1 || perf.cpuLimit > 100) {
        throw new Error('Invalid cpuLimit')
      }
      validated.cpuLimit = perf.cpuLimit
    }
    
    return validated
  }
  
  /**
   * Validate context object
   */
  static validateContext(context: any): any {
    if (!context || typeof context !== 'object') {
      return undefined
    }
    
    const validated: any = {}
    
    if (context.userId !== undefined) {
      if (typeof context.userId !== 'string' || !/^[a-zA-Z0-9\-_]+$/.test(context.userId)) {
        throw new Error('Invalid userId')
      }
      validated.userId = context.userId
    }
    
    if (context.projectId !== undefined) {
      if (typeof context.projectId !== 'string' || !/^[a-zA-Z0-9\-_]+$/.test(context.projectId)) {
        throw new Error('Invalid projectId')
      }
      validated.projectId = context.projectId
    }
    
    if (context.environment !== undefined) {
      validated.environment = this.validateEnvironment(context.environment)
    }
    
    return validated
  }
}

/**
 * Rate limiting with enhanced security
 */
export class SecureRateLimiter {
  private store = new Map<string, { count: number; resetTime: number; blocked: boolean }>()
  private blockedIPs = new Set<string>()
  
  /**
   * Check rate limit with enhanced security
   */
  checkRateLimit(ip: string, userAgent?: string): { allowed: boolean; remaining: number; resetTime: number; reason?: string } {
    const now = Date.now()
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW
    
    // Check if IP is blocked
    if (this.blockedIPs.has(ip)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
        reason: 'IP blocked due to suspicious activity'
      }
    }
    
    // Clean up old entries
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key)
      }
    }
    
    const key = `guidance:${ip}:${userAgent || 'unknown'}`
    const current = this.store.get(key)
    
    if (!current || current.resetTime < now) {
      // New window
      this.store.set(key, {
        count: 1,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
        blocked: false
      })
      
      return {
        allowed: true,
        remaining: SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW - 1,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW
      }
    }
    
    if (current.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        reason: 'Rate limit exceeded'
      }
    }
    
    if (current.count >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      // Block this IP for the rest of the window
      current.blocked = true
      this.blockedIPs.add(ip)
      
      // Auto-unblock after window expires
      setTimeout(() => {
        this.blockedIPs.delete(ip)
      }, SECURITY_CONFIG.RATE_LIMIT_WINDOW)
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        reason: 'Rate limit exceeded'
      }
    }
    
    // Increment counter
    current.count++
    this.store.set(key, current)
    
    return {
      allowed: true,
      remaining: SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW - current.count,
      resetTime: current.resetTime
    }
  }
  
  /**
   * Get rate limit info
   */
  getRateLimitInfo(ip: string, userAgent?: string): { remaining: number; resetTime: number; blocked: boolean } {
    const key = `guidance:${ip}:${userAgent || 'unknown'}`
    const current = this.store.get(key)
    
    if (!current) {
      return {
        remaining: SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW,
        resetTime: Date.now() + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
        blocked: false
      }
    }
    
    return {
      remaining: Math.max(0, SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW - current.count),
      resetTime: current.resetTime,
      blocked: current.blocked || this.blockedIPs.has(ip)
    }
  }
}

/**
 * Secure logging
 */
export class SecureLogger {
  /**
   * Log security event
   */
  static logSecurityEvent(event: string, details: any, ip?: string, userAgent?: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details: this.sanitizeLogDetails(details),
      ip: ip ? this.maskIP(ip) : undefined,
      userAgent: userAgent ? this.sanitizeUserAgent(userAgent) : undefined,
      severity: this.getSeverity(event)
    }
    
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry))
  }
  
  /**
   * Log error securely
   */
  static logError(error: Error, context?: any, ip?: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n') // Limit stack trace
      },
      context: this.sanitizeLogDetails(context),
      ip: ip ? this.maskIP(ip) : undefined,
      severity: 'error'
    }
    
    console.error('ERROR:', JSON.stringify(logEntry))
  }
  
  /**
   * Sanitize log details
   */
  private static sanitizeLogDetails(details: any): any {
    if (!details || typeof details !== 'object') {
      return details
    }
    
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(details)) {
      // Skip sensitive fields
      if (['password', 'token', 'secret', 'key', 'auth', 'credential'].some(sensitive => 
        key.toLowerCase().includes(sensitive)
      )) {
        sanitized[key] = '[REDACTED]'
        continue
      }
      
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value)
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeLogDetails(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
  
  /**
   * Mask IP address for privacy
   */
  private static maskIP(ip: string): string {
    if (!ip) return ''
    
    // IPv4
    if (ip.includes('.')) {
      const parts = ip.split('.')
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.xxx.xxx`
      }
    }
    
    // IPv6
    if (ip.includes(':')) {
      const parts = ip.split(':')
      if (parts.length >= 4) {
        return `${parts[0]}:${parts[1]}:xxxx:xxxx`
      }
    }
    
    return 'xxx.xxx.xxx.xxx'
  }
  
  /**
   * Sanitize user agent
   */
  private static sanitizeUserAgent(userAgent: string): string {
    if (!userAgent) return ''
    
    // Remove potentially sensitive information
    return userAgent
      .replace(/\([^)]*\)/g, '(redacted)')
      .replace(/\d+\.\d+/g, 'x.x')
      .substring(0, 100) // Limit length
  }
  
  /**
   * Get severity level
   */
  private static getSeverity(event: string): string {
    if (event.includes('attack') || event.includes('malicious') || event.includes('injection')) {
      return 'critical'
    }
    if (event.includes('rate_limit') || event.includes('blocked')) {
      return 'high'
    }
    if (event.includes('validation') || event.includes('invalid')) {
      return 'medium'
    }
    return 'low'
  }
  
  /**
   * Sanitize input for logging
   */
  private static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }
    
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .substring(0, 500) // Limit length
  }
}

/**
 * CSRF protection
 */
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>()
  
  /**
   * Generate CSRF token
   */
  static generateToken(sessionId: string): string {
    const token = randomBytes(32).toString('hex')
    const expires = Date.now() + (30 * 60 * 1000) // 30 minutes
    
    this.tokens.set(sessionId, { token, expires })
    
    // Clean up expired tokens
    this.cleanupExpiredTokens()
    
    return token
  }
  
  /**
   * Validate CSRF token
   */
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId)
    
    if (!stored || stored.expires < Date.now()) {
      return false
    }
    
    return stored.token === token
  }
  
  /**
   * Clean up expired tokens
   */
  private static cleanupExpiredTokens(): void {
    const now = Date.now()
    
    for (const [sessionId, data] of this.tokens.entries()) {
      if (data.expires < now) {
        this.tokens.delete(sessionId)
      }
    }
  }
}

/**
 * Input validation with enhanced security
 */
export class EnhancedValidator {
  /**
   * Validate and sanitize complete request
   */
  static validateRequest(request: any): any {
    try {
      const validated: any = {}
      
      // Validate language
      validated.language = SecurityValidator.validateLanguage(request.language || 'typescript')
      
      // Validate framework
      validated.framework = SecurityValidator.validateFramework(request.framework || '')
      
      // Validate purpose
      validated.purpose = SecurityValidator.validatePurpose(request.purpose || '')
      
      // Validate requirements
      validated.requirements = SecurityValidator.validateRequirements(request.requirements || [])
      
      // Validate security level
      validated.securityLevel = SecurityValidator.validateSecurityLevel(request.securityLevel || 'medium')
      
      // Validate performance requirements
      validated.performanceRequirements = SecurityValidator.validatePerformanceRequirements(request.performanceRequirements)
      
      // Validate boolean flags
      validated.accessibility = Boolean(request.accessibility)
      validated.testing = Boolean(request.testing)
      validated.documentation = Boolean(request.documentation)
      
      // Validate context
      validated.context = SecurityValidator.validateContext(request.context)
      
      return validated
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(`Validation failed: ${errorMessage}`)
    }
  }
}

/**
 * Security headers helper
 */
export class SecurityHeaders {
  /**
   * Get security headers
   */
  static getHeaders(): Record<string, string> {
    return { ...SECURITY_CONFIG.SECURITY_HEADERS }
  }
  
  /**
   * Add security headers to response
   */
  static addToResponse(response: Response): Response {
    const headers = this.getHeaders()
    
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value)
    }
    
    return response
  }
}

/**
 * Content Security Policy
 */
export class ContentSecurityPolicy {
  /**
   * Generate CSP header
   */
  static generate(trustedDomains: string[] = []): string {
    const domains = trustedDomains.length > 0 ? ` ${trustedDomains.join(' ')}` : ''
    
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
}
