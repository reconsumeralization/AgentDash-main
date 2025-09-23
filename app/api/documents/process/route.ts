import { type NextRequest, NextResponse } from "next/server"
import { DocumentProcessorConnector, DocumentProcessingConfig, ProcessingResult } from "@/connectors/document-processor-connector"
import { rateLimit } from "@/lib"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

const processingConfig: DocumentProcessingConfig = {
  supportedFormats: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/html',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp'
  ],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  aiEnabled: true,
  ocrEnabled: true,
  languageDetection: true,
  textExtraction: true,
  metadataExtraction: true,
  conversionEnabled: true,
  targetFormats: ['application/pdf', 'text/plain', 'text/html']
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(10, ip) // 10 document processing requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const url = formData.get("url") as string | null
    const options = JSON.parse((formData.get("options") as string) || "{}")

    // Input validation
    if (!file && !url) {
      return NextResponse.json(
        { error: "Either file or URL must be provided" },
        { status: 400 }
      )
    }

    // Validate URL format if provided
    if (url) {
      try {
        new URL(url)
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        )
      }

      // Security check for URLs
      if (url.includes('..') || url.includes('localhost') || url.includes('127.0.0.1')) {
        return NextResponse.json(
          { error: "Invalid URL for security reasons" },
          { status: 400 }
        )
      }
    }

    // Validate options structure
    if (typeof options !== 'object' || Array.isArray(options)) {
      return NextResponse.json(
        { error: "Options must be a valid JSON object" },
        { status: 400 }
      )
    }

    let fileUrl: string
    let fileName: string

    if (file) {
      // Upload file to blob storage first
      const { put } = await import("@vercel/blob")
      const blob = await put(`processing-${Date.now()}-${file.name}`, file, { access: "public" })
      fileUrl = blob.url
      fileName = file.name
    } else {
      fileUrl = url!
      fileName = url!.split('/').pop() || 'unknown'
    }

    // Create document processor
    const connectorConfig = {
      id: `doc-processor-${Date.now()}`,
      name: 'Document Processor',
      type: 'file' as const,
      direction: 'inbound' as const,
      protocol: 'http' as const,
      auth: { type: 'none' as const },
      rateLimit: { requests: 10, period: 60, strategy: 'fixed' as const },
      retry: { maxAttempts: 3, backoff: 'exponential' as const, baseDelay: 1000 },
      timeout: 120000, // 2 minutes for document processing
      healthCheck: { enabled: true, interval: 300 }
    }

    const processor = new DocumentProcessorConnector(connectorConfig, processingConfig)

    // Process the document
    const result: ProcessingResult = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Document processing timeout'))
      }, 120000)

      processor.send({
        id: `process-${Date.now()}`,
        source: 'api',
        destination: 'document-processor',
        type: 'document_processing',
        format: 'json',
        payload: {
          fileUrl,
          fileName,
          options
        },
        metadata: {
          timestamp: new Date(),
          correlationId: `corr-${Date.now()}`,
          priority: 'medium',
          tags: ['document', 'processing'],
          headers: {}
        },
        routing: {
          path: ['document-processor'],
          finalDestination: 'document-processor'
        }
      }).then((result: ProcessingResult) => {
        clearTimeout(timeout)
        resolve(result)
      }).catch((error) => {
        clearTimeout(timeout)
        reject(error)
      })
    })

    return NextResponse.json({
      success: true,
      result,
      processingId: `proc-${Date.now()}`,
      timestamp: new Date().toISOString()
    })

    } catch (error: any) {
    console.error("Document processing error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Document processing failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Return supported formats and capabilities
  return NextResponse.json({
    supportedFormats: processingConfig.supportedFormats,
    maxFileSize: processingConfig.maxFileSize,
    capabilities: {
      aiEnabled: processingConfig.aiEnabled,
      ocrEnabled: processingConfig.ocrEnabled,
      languageDetection: processingConfig.languageDetection,
      textExtraction: processingConfig.textExtraction,
      metadataExtraction: processingConfig.metadataExtraction,
      conversionEnabled: processingConfig.conversionEnabled
    },
    targetFormats: processingConfig.targetFormats
  })
}
