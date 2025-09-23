import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SecurityHeaders, SecureLogger } from '@/lib'

// Virtual File System Types
interface VirtualFile {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  size?: number
  created: Date
  modified: Date
  children?: VirtualFile[]
  metadata?: {
    securityScore?: number
    qualityScore?: number
    performanceScore?: number
    vulnerabilities?: Array<{
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      line?: number
    }>
    dependencies?: string[]
    testCoverage?: number
    documentation?: boolean
  }
}

interface FileSystemOperation {
  type: 'create' | 'read' | 'update' | 'delete' | 'move' | 'copy' | 'list'
  path: string
  content?: string
  metadata?: any
}

// In-memory file system storage (in production, this would be a database)
let virtualFileSystem: VirtualFile[] = [
  {
    id: 'root',
    name: 'Workspace',
    type: 'folder',
    created: new Date(),
    modified: new Date(),
    children: [
      {
        id: 'examples',
        name: 'Examples',
        type: 'folder',
        created: new Date(),
        modified: new Date(),
        children: []
      },
      {
        id: 'generated',
        name: 'Generated Code',
        type: 'folder',
        created: new Date(),
        modified: new Date(),
        children: []
      },
      {
        id: 'visualizations',
        name: 'Visualizations',
        type: 'folder',
        created: new Date(),
        modified: new Date(),
        children: []
      }
    ]
  }
]

// Validation schemas
const FileSystemOperationSchema = z.object({
  type: z.enum(['create', 'read', 'update', 'delete', 'move', 'copy', 'list']),
  path: z.string().min(1).max(500),
  content: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

const FileSystemRequestSchema = z.object({
  operation: FileSystemOperationSchema,
  options: z.object({
    recursive: z.boolean().optional(),
    includeMetadata: z.boolean().optional(),
    filter: z.string().optional()
  }).optional()
})

// File System Operations
class VirtualFileSystemManager {
  private files: VirtualFile[] = virtualFileSystem

  async createFile(path: string, content: string, metadata?: any): Promise<VirtualFile> {
    const pathParts = path.split('/').filter(p => p)
    const fileName = pathParts.pop() || 'untitled'
    const folderPath = pathParts.join('/')
    
    const newFile: VirtualFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: fileName,
      type: 'file',
      content,
      size: content.length,
      created: new Date(),
      modified: new Date(),
      metadata: {
        ...metadata,
        language: this.detectLanguage(fileName),
        securityScore: await this.analyzeSecurity(content),
        qualityScore: await this.analyzeQuality(content),
        performanceScore: await this.analyzePerformance(content)
      }
    }

    if (folderPath) {
      const parentFolder = this.findFileByPath(folderPath)
      if (parentFolder && parentFolder.type === 'folder') {
        if (!parentFolder.children) parentFolder.children = []
        parentFolder.children.push(newFile)
        parentFolder.modified = new Date()
      } else {
        this.files.push(newFile)
      }
    } else {
      this.files.push(newFile)
    }

    return newFile
  }

  async createFolder(path: string): Promise<VirtualFile> {
    const pathParts = path.split('/').filter(p => p)
    const folderName = pathParts.pop() || 'untitled'
    const parentPath = pathParts.join('/')
    
    const newFolder: VirtualFile = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: folderName,
      type: 'folder',
      created: new Date(),
      modified: new Date(),
      children: []
    }

    if (parentPath) {
      const parentFolder = this.findFileByPath(parentPath)
      if (parentFolder && parentFolder.type === 'folder') {
        if (!parentFolder.children) parentFolder.children = []
        parentFolder.children.push(newFolder)
        parentFolder.modified = new Date()
      } else {
        this.files.push(newFolder)
      }
    } else {
      this.files.push(newFolder)
    }

    return newFolder
  }

  async readFile(path: string): Promise<VirtualFile | null> {
    return this.findFileByPath(path)
  }

  async updateFile(path: string, content: string, metadata?: any): Promise<VirtualFile | null> {
    const file = this.findFileByPath(path)
    if (file && file.type === 'file') {
      file.content = content
      file.size = content.length
      file.modified = new Date()
      
      if (metadata) {
        file.metadata = {
          ...file.metadata,
          ...metadata,
          securityScore: await this.analyzeSecurity(content),
          qualityScore: await this.analyzeQuality(content),
          performanceScore: await this.analyzePerformance(content)
        }
      }
      
      return file
    }
    return null
  }

  async deleteFile(path: string): Promise<boolean> {
    const file = this.findFileByPath(path)
    if (file) {
      // Remove from parent or root
      const parent = this.findParentFile(file.id)
      if (parent && parent.children) {
        parent.children = parent.children.filter(f => f.id !== file.id)
        parent.modified = new Date()
      } else {
        this.files = this.files.filter(f => f.id !== file.id)
      }
      return true
    }
    return false
  }

  async listFiles(path: string = '/', recursive: boolean = false): Promise<VirtualFile[]> {
    const file = path === '/' ? { children: this.files } : this.findFileByPath(path)
    
    if (!file || (file as any).type !== 'folder') {
      return []
    }

    if (!recursive) {
      return file.children || []
    }

    const allFiles: VirtualFile[] = []
    const collectFiles = (files: VirtualFile[]) => {
      for (const f of files) {
        allFiles.push(f)
        if (f.children) {
          collectFiles(f.children)
        }
      }
    }

    if (file.children) {
      collectFiles(file.children)
    }

    return allFiles
  }

  async moveFile(sourcePath: string, targetPath: string): Promise<boolean> {
    const sourceFile = this.findFileByPath(sourcePath)
    if (!sourceFile) return false

    // Remove from source location
    await this.deleteFile(sourcePath)

    // Add to target location
    const targetParts = targetPath.split('/').filter(p => p)
    const targetFileName = targetParts.pop() || sourceFile.name
    const targetFolderPath = targetParts.join('/')

    if (targetFolderPath) {
      const targetFolder = this.findFileByPath(targetFolderPath)
      if (targetFolder && targetFolder.type === 'folder') {
        if (!targetFolder.children) targetFolder.children = []
        sourceFile.name = targetFileName
        targetFolder.children.push(sourceFile)
        targetFolder.modified = new Date()
      }
    } else {
      sourceFile.name = targetFileName
      this.files.push(sourceFile)
    }

    return true
  }

  async copyFile(sourcePath: string, targetPath: string): Promise<VirtualFile | null> {
    const sourceFile = this.findFileByPath(sourcePath)
    if (!sourceFile) return null

    const targetParts = targetPath.split('/').filter(p => p)
    const targetFileName = targetParts.pop() || sourceFile.name
    const targetFolderPath = targetParts.join('/')

    const copiedFile: VirtualFile = {
      ...sourceFile,
      id: `${sourceFile.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: targetFileName,
      created: new Date(),
      modified: new Date()
    }

    if (targetFolderPath) {
      const targetFolder = this.findFileByPath(targetFolderPath)
      if (targetFolder && targetFolder.type === 'folder') {
        if (!targetFolder.children) targetFolder.children = []
        targetFolder.children.push(copiedFile)
        targetFolder.modified = new Date()
      }
    } else {
      this.files.push(copiedFile)
    }

    return copiedFile
  }

  // Helper methods
  private findFileByPath(path: string): VirtualFile | null {
    if (path === '/') {
      return { id: 'root', name: 'Workspace', type: 'folder', children: this.files, created: new Date(), modified: new Date() }
    }

    const pathParts = path.split('/').filter(p => p)
    let current: VirtualFile[] = this.files

    for (const part of pathParts) {
      const found = current.find(f => f.name === part)
      if (!found) return null
      
      if (found.type === 'folder' && found.children) {
        current = found.children
      } else if (part === pathParts[pathParts.length - 1]) {
        return found
      } else {
        return null
      }
    }

    return null
  }

  private findParentFile(fileId: string): VirtualFile | null {
    const findParent = (files: VirtualFile[]): VirtualFile | null => {
      for (const file of files) {
        if (file.children) {
          if (file.children.some(child => child.id === fileId)) {
            return file
          }
          const found = findParent(file.children)
          if (found) return found
        }
      }
      return null
    }

    return findParent(this.files)
  }

  private detectLanguage(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'ps1': 'powershell',
      'dockerfile': 'dockerfile'
    }
    return languageMap[ext || ''] || 'text'
  }

  private async analyzeSecurity(content: string): Promise<number> {
    // Simple security analysis based on common patterns
    let score = 100
    const securityIssues = [
      { pattern: /eval\s*\(/g, penalty: 20 },
      { pattern: /innerHTML/g, penalty: 15 },
      { pattern: /document\.write/g, penalty: 15 },
      { pattern: /innerHTML/g, penalty: 10 },
      { pattern: /console\.log/g, penalty: 5 },
      { pattern: /debugger/g, penalty: 10 },
      { pattern: /password\s*=\s*['"]/g, penalty: 25 },
      { pattern: /secret\s*=\s*['"]/g, penalty: 25 },
      { pattern: /key\s*=\s*['"]/g, penalty: 20 }
    ]

    for (const issue of securityIssues) {
      const matches = content.match(issue.pattern)
      if (matches) {
        score -= matches.length * issue.penalty
      }
    }

    return Math.max(0, Math.min(100, score))
  }

  private async analyzeQuality(content: string): Promise<number> {
    // Simple quality analysis based on code structure
    let score = 0
    const lines = content.split('\n')
    
    // Check for documentation
    if (content.includes('/**') || content.includes('//')) score += 20
    
    // Check for error handling
    if (content.includes('try') && content.includes('catch')) score += 20
    
    // Check for type annotations (TypeScript)
    if (content.includes(': string') || content.includes(': number')) score += 20
    
    // Check for consistent formatting
    const indentedLines = lines.filter(line => line.startsWith('  ') || line.startsWith('\t')).length
    if (indentedLines / lines.length > 0.5) score += 20
    
    // Check for meaningful variable names
    const variablePattern = /(const|let|var)\s+[a-zA-Z_][a-zA-Z0-9_]*/g
    const variables = content.match(variablePattern) || []
    const meaningfulVars = variables.filter(v => v.length > 3).length
    if (meaningfulVars / variables.length > 0.7) score += 20

    return Math.min(100, score)
  }

  private async analyzePerformance(content: string): Promise<number> {
    // Simple performance analysis
    let score = 100
    
    // Check for performance anti-patterns
    const performanceIssues = [
      { pattern: /for\s*\(\s*var\s+/g, penalty: 10 },
      { pattern: /document\.getElementById/g, penalty: 5 },
      { pattern: /innerHTML\s*=/g, penalty: 15 },
      { pattern: /eval\s*\(/g, penalty: 25 },
      { pattern: /setTimeout\s*\(\s*0/g, penalty: 10 }
    ]

    for (const issue of performanceIssues) {
      const matches = content.match(issue.pattern)
      if (matches) {
        score -= matches.length * issue.penalty
      }
    }

    return Math.max(0, Math.min(100, score))
  }

  getFileSystem(): VirtualFile[] {
    return this.files
  }
}

const fsManager = new VirtualFileSystemManager()

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `fs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let body
    try {
      body = await request.json()
    } catch (error) {
      SecureLogger.logSecurityEvent('invalid_json', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip,
        userAgent
      }, ip, userAgent)
      
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400, headers: SecurityHeaders.getHeaders() }
      )
    }

    const validationResult = FileSystemRequestSchema.safeParse(body)
    if (!validationResult.success) {
      SecureLogger.logSecurityEvent('validation_failed', {
        errors: validationResult.error.errors,
        ip,
        userAgent
      }, ip, userAgent)
      
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400, headers: SecurityHeaders.getHeaders() }
      )
    }

    const { operation, options = {} } = validationResult.data
    let result: any

    switch (operation.type) {
      case 'create':
        if (operation.content) {
          result = await fsManager.createFile(operation.path, operation.content, operation.metadata)
        } else {
          result = await fsManager.createFolder(operation.path)
        }
        break
      
      case 'read':
        result = await fsManager.readFile(operation.path)
        break
      
      case 'update':
        if (!operation.content) {
          return NextResponse.json(
            { error: 'Content is required for update operation' },
            { status: 400, headers: SecurityHeaders.getHeaders() }
          )
        }
        result = await fsManager.updateFile(operation.path, operation.content, operation.metadata)
        break
      
      case 'delete':
        result = await fsManager.deleteFile(operation.path)
        break
      
      case 'move':
        const moveTarget = operation.metadata?.targetPath
        if (!moveTarget) {
          return NextResponse.json(
            { error: 'Target path is required for move operation' },
            { status: 400, headers: SecurityHeaders.getHeaders() }
          )
        }
        result = await fsManager.moveFile(operation.path, moveTarget)
        break
      
      case 'copy':
        const copyTarget = operation.metadata?.targetPath
        if (!copyTarget) {
          return NextResponse.json(
            { error: 'Target path is required for copy operation' },
            { status: 400, headers: SecurityHeaders.getHeaders() }
          )
        }
        result = await fsManager.copyFile(operation.path, copyTarget)
        break
      
      case 'list':
        result = await fsManager.listFiles(operation.path, options.recursive)
        break
      
      default:
        return NextResponse.json(
          { error: 'Unsupported operation type' },
          { status: 400, headers: SecurityHeaders.getHeaders() }
        )
    }

    const processingTime = Date.now() - startTime

    SecureLogger.logSecurityEvent('filesystem_operation', {
      operation: operation.type,
      path: operation.path,
      success: true,
      processingTime,
      ip,
      userAgent
    }, ip, userAgent)

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        requestId,
        processingTime,
        timestamp: new Date().toISOString(),
        operation: operation.type,
        path: operation.path
      }
    }, { headers: SecurityHeaders.getHeaders() })

  } catch (error) {
    const processingTime = Date.now() - startTime
    
    SecureLogger.logError(error as Error, {
      requestId,
      processingTime,
      operation: 'filesystem'
    }, request.headers.get('x-forwarded-for') || 'unknown')

    return NextResponse.json(
      { 
        error: 'Internal server error',
        requestId,
        processingTime
      },
      { status: 500, headers: SecurityHeaders.getHeaders() }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const path = url.searchParams.get('path') || '/'
    const recursive = url.searchParams.get('recursive') === 'true'

    const files = await fsManager.listFiles(path, recursive)
    const totalFiles = fsManager.getFileSystem().length

    return NextResponse.json({
      success: true,
      data: {
        files,
        totalFiles,
        currentPath: path,
        recursive
      },
      metadata: {
        timestamp: new Date().toISOString(),
        operation: 'list'
      }
    }, { headers: SecurityHeaders.getHeaders() })

  } catch (error) {
    SecureLogger.logError(error as Error, {
      operation: 'filesystem_list'
    }, request.headers.get('x-forwarded-for') || 'unknown')

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SecurityHeaders.getHeaders() }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...SecurityHeaders.getHeaders(),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}
