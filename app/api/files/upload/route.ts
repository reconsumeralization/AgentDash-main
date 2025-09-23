import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib"

// Rate limiting: 50 uploads per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

// File type restrictions
const ALLOWED_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf', 'text/plain', 'text/markdown',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Code files
  'application/json', 'application/javascript', 'text/javascript', 'text/typescript',
  'text/css', 'text/html', 'text/xml',
  // Archives
  'application/zip', 'application/x-zip-compressed',
]

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Maximum filename length
const MAX_FILENAME_LENGTH = 255

// Forbidden characters in filenames
const FORBIDDEN_CHARS = /[<>:"/\\|?*\x00-\x1f]/g

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(50, ip) // 50 uploads per minute
    } catch {
      return NextResponse.json(
        { error: "Upload rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    // Parse form data with error handling
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      )
    }

    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || ""

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      )
    }

    // Validate filename
    if (file.name.length > MAX_FILENAME_LENGTH) {
      return NextResponse.json(
        { error: "Filename too long" },
        { status: 400 }
      )
    }

    // Enhanced security: Check for forbidden characters and patterns
    if (FORBIDDEN_CHARS.test(file.name)) {
      return NextResponse.json(
        { error: "Filename contains invalid characters" },
        { status: 400 }
      )
    }

    // Additional security checks
    const lowerName = file.name.toLowerCase()
    if (lowerName.includes('..') || lowerName.includes('/') || lowerName.includes('\\')) {
      return NextResponse.json(
        { error: "Filename contains path traversal attempt" },
        { status: 400 }
      )
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com']
    for (const ext of suspiciousExtensions) {
      if (lowerName.endsWith(ext)) {
        return NextResponse.json(
          { error: "File type not allowed for security reasons" },
          { status: 400 }
        )
      }
    }

    // Validate folder path (prevent directory traversal)
    if (folder && (folder.includes('..') || folder.startsWith('/') || folder.includes('\\'))) {
      return NextResponse.json(
        { error: "Invalid folder path" },
        { status: 400 }
      )
    }

    // Sanitize folder path
    const sanitizedFolder = folder.replace(/\/+/g, '/').replace(/^\/|\/$/g, '')

    // Create folder structure in blob path
    const filePath = sanitizedFolder ? `${sanitizedFolder}/${file.name}` : file.name

    // Upload to Vercel Blob with timeout
    const uploadPromise = put(filePath, file, {
      access: "public",
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout')), 60000) // 60 second timeout
    )

    const blob = await Promise.race([uploadPromise, timeoutPromise]).catch(error => {
      console.error("Upload error:", error)
      if (error.message.includes('timeout')) {
        throw new Error('Upload timed out')
      }
      throw error
    }) as Awaited<ReturnType<typeof put>>

    // Log successful upload
    console.log(`File uploaded: ${filePath}, size: ${file.size} bytes, type: ${file.type}`)

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
      uploadedAt: new Date().toISOString(),
      metadata: {
        requestId: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ip: ip,
        userAgent: request.headers.get('user-agent'),
      },
    })

  } catch (error) {
    console.error("Upload error:", error)

    // Determine error type for appropriate response
    let status = 500
    let errorMessage = "Upload failed"

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        status = 408
        errorMessage = "Upload timed out"
      } else if (error.message.includes('validation')) {
        status = 400
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status }
    )
  }
}
