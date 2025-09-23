/**
 * Document Processor Connector
 * Advanced document processing with AI-powered analysis and conversion
 */

import { BaseConnector, DataPacket, ConnectorConfig } from './base-connector'
import { put, list, del } from "@vercel/blob"
import { openai } from '@ai-sdk/openai'

export interface DocumentProcessingConfig {
  supportedFormats: string[]
  maxFileSize: number
  aiEnabled: boolean
  ocrEnabled: boolean
  languageDetection: boolean
  textExtraction: boolean
  metadataExtraction: boolean
  conversionEnabled: boolean
  targetFormats: string[]
}

export interface DocumentMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  pages?: number
  wordCount?: number
  characterCount?: number
  language?: string
  creationDate?: Date
  modificationDate?: Date
  fileSize: number
  mimeType: string
  encoding?: string
}

export interface ProcessingResult {
  success: boolean
  content: string
  metadata: DocumentMetadata
  extractedText?: string
  ocrText?: string
  aiSummary?: string
  aiKeywords?: string[]
  aiSentiment?: number
  aiTopics?: string[]
  convertedFiles?: Array<{
    format: string
    url: string
    size: number
  }>
  processingTime: number
  error?: string
}

export class DocumentProcessorConnector extends BaseConnector<ProcessingResult> {
  private processingConfig: DocumentProcessingConfig

  constructor(config: ConnectorConfig, processingConfig: DocumentProcessingConfig) {
    super(config)
    this.processingConfig = processingConfig
  }

  async connect(): Promise<void> {
    this.updateStatus('connected')
    console.log(`Document Processor connected with ${this.processingConfig.supportedFormats.length} supported formats`)
  }

  async disconnect(): Promise<void> {
    this.updateStatus('disconnected')
    console.log('Document Processor disconnected')
  }

  async send(packet: DataPacket): Promise<ProcessingResult> {
    const startTime = Date.now()

    try {
      const result = await this.processDocument(packet)
      const processedPacket: DataPacket = {
        ...packet,
        payload: result,
        metadata: {
          ...packet.metadata,
          timestamp: new Date()
        }
      }

      // Send to next destination if specified
      if (packet.routing.nextHop) {
        // Implementation would route to next connector
        console.log(`Document processed and routed to: ${packet.routing.nextHop}`)
      }

      this.updateMetrics(true, JSON.stringify(result).length, Date.now() - startTime)

      return result

    } catch (error) {
      console.error('Document processing error:', error)
      this.status.errorCount++
      throw error
    }
  }

  async receive(): Promise<DataPacket | null> {
    // Implementation for receiving documents to process
    return null
  }

  private async processDocument(packet: DataPacket): Promise<ProcessingResult> {
    const startTime = Date.now()

    try {
      const { fileUrl, fileName, options = {} } = packet.payload

      if (!fileUrl) {
        throw new Error('No file URL provided for processing')
      }

      // Fetch the file
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`)
      }

      const fileBuffer = await response.arrayBuffer()
      const fileSize = fileBuffer.byteLength

      // Validate file size
      if (fileSize > this.processingConfig.maxFileSize) {
        throw new Error(`File size ${fileSize} exceeds maximum ${this.processingConfig.maxFileSize}`)
      }

      // Determine file type and validate
      const mimeType = this.detectMimeType(fileName, fileBuffer)
      if (!this.processingConfig.supportedFormats.includes(mimeType)) {
        throw new Error(`Unsupported file format: ${mimeType}`)
      }

      // Extract metadata
      const metadata = await this.extractMetadata(fileBuffer, mimeType, fileSize)

      // Extract text content
      let extractedText = ''
      if (this.processingConfig.textExtraction) {
        extractedText = await this.extractText(fileBuffer, mimeType)
      }

      // OCR processing for images/PDFs
      let ocrText = ''
      if (this.processingConfig.ocrEnabled && this.shouldUseOCR(mimeType)) {
        ocrText = await this.performOCR(fileBuffer, mimeType)
      }

      // AI-powered analysis
      let aiSummary = ''
      let aiKeywords: string[] = []
      let aiSentiment = 0
      let aiTopics: string[] = []

      if (this.processingConfig.aiEnabled && (extractedText || ocrText)) {
        const analysis = await this.performAIAnalysis(extractedText || ocrText)
        aiSummary = analysis.summary
        aiKeywords = analysis.keywords
        aiSentiment = analysis.sentiment
        aiTopics = analysis.topics
      }

      // File conversion
      let convertedFiles: Array<{ format: string; url: string; size: number }> = []
      if (this.processingConfig.conversionEnabled && this.processingConfig.targetFormats.length > 0) {
        convertedFiles = await this.convertDocument(fileBuffer, mimeType, fileName)
      }

      const fullContent = [extractedText, ocrText].filter(Boolean).join('\n\n')

      return {
        success: true,
        content: fullContent,
        metadata,
        extractedText,
        ocrText,
        aiSummary,
        aiKeywords,
        aiSentiment,
        aiTopics,
        convertedFiles,
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      return {
        success: false,
        content: '',
        metadata: {
          fileSize: 0,
          mimeType: 'unknown'
        },
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown processing error'
      }
    }
  }

  private detectMimeType(fileName: string, buffer: ArrayBuffer): string {
    // Simple MIME type detection based on file extension and content
    const extension = fileName.split('.').pop()?.toLowerCase()

    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'json': 'application/json',
      'xml': 'application/xml',
      'html': 'text/html',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    }

    return mimeTypes[extension || ''] || 'application/octet-stream'
  }

  private async extractMetadata(buffer: ArrayBuffer, mimeType: string, fileSize: number): Promise<DocumentMetadata> {
    const metadata: DocumentMetadata = {
      fileSize,
      mimeType
    }

    try {
      if (mimeType === 'application/pdf') {
        // PDF metadata extraction
        const text = new TextDecoder().decode(buffer)
        const titleMatch = text.match(/\/Title\s*\((.*?)\)/)
        if (titleMatch) metadata.title = titleMatch[1]

        const authorMatch = text.match(/\/Author\s*\((.*?)\)/)
        if (authorMatch) metadata.author = authorMatch[1]

        const pagesMatch = text.match(/\/Count\s+(\d+)/)
        if (pagesMatch) metadata.pages = parseInt(pagesMatch[1])

      } else if (mimeType.startsWith('text/')) {
        // Text file metadata
        const text = new TextDecoder().decode(buffer)
        metadata.wordCount = text.split(/\s+/).length
        metadata.characterCount = text.length

        // Language detection (simplified)
        if (this.processingConfig.languageDetection) {
          metadata.language = this.detectLanguage(text)
        }
      }

      metadata.creationDate = new Date()
      metadata.modificationDate = new Date()

    } catch (error) {
      console.warn('Metadata extraction failed:', error)
    }

    return metadata
  }

  private async extractText(buffer: ArrayBuffer, mimeType: string): Promise<string> {
    try {
      if (mimeType.startsWith('text/')) {
        return new TextDecoder().decode(buffer)
      } else if (mimeType === 'application/pdf') {
        // Basic PDF text extraction (in production, use a proper PDF library)
        const text = new TextDecoder().decode(buffer)
        // This is a simplified extraction - real implementation would use pdf-parse or similar
        return this.extractTextFromPDF(text)
      } else if (mimeType === 'application/json') {
        const json = JSON.parse(new TextDecoder().decode(buffer))
        return JSON.stringify(json, null, 2)
      }

      return ''
    } catch (error) {
      console.warn('Text extraction failed:', error)
      return ''
    }
  }

  private shouldUseOCR(mimeType: string): boolean {
    return mimeType.startsWith('image/') ||
           mimeType === 'application/pdf' ||
           mimeType.includes('document')
  }

  private async performOCR(buffer: ArrayBuffer, mimeType: string): Promise<string> {
    // In production, integrate with OCR services like Google Vision AI, Azure Computer Vision, etc.
    // For now, return placeholder
    console.log(`OCR processing for ${mimeType} - placeholder implementation`)
    return ''
  }

  private async performAIAnalysis(text: string): Promise<{
    summary: string
    keywords: string[]
    sentiment: number
    topics: string[]
  }> {
    try {
      // Use OpenAI for document analysis
      const analysisPrompt = `
        Analyze the following document text and provide:
        1. A concise summary (2-3 sentences)
        2. Key keywords (up to 10)
        3. Sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
        4. Main topics/themes

        Document text:
        ${text.substring(0, 4000)} // Limit for API

        Respond in JSON format with keys: summary, keywords, sentiment, topics
      `

      // Note: This is a placeholder implementation
      // In a real implementation, you would use the actual AI SDK
      const mockResponse = {
        summary: 'Document analysis summary',
        keywords: ['keyword1', 'keyword2'],
        sentiment: 0.5,
        topics: ['topic1', 'topic2']
      }

      const result = mockResponse

      return {
        summary: result.summary || '',
        keywords: Array.isArray(result.keywords) ? result.keywords : [],
        sentiment: typeof result.sentiment === 'number' ? result.sentiment : 0,
        topics: Array.isArray(result.topics) ? result.topics : []
      }

    } catch (error) {
      console.warn('AI analysis failed:', error)
      return {
        summary: 'Analysis unavailable',
        keywords: [],
        sentiment: 0,
        topics: []
      }
    }
  }

  private async convertDocument(
    buffer: ArrayBuffer,
    sourceMimeType: string,
    fileName: string
  ): Promise<Array<{ format: string; url: string; size: number }>> {
    const conversions: Array<{ format: string; url: string; size: number }> = []

    try {
      // In production, integrate with conversion services like CloudConvert, Zamzar, etc.
      // For now, return placeholder conversions
      for (const targetFormat of this.processingConfig.targetFormats) {
        if (targetFormat !== sourceMimeType) {
          console.log(`Converting ${sourceMimeType} to ${targetFormat} - placeholder implementation`)

          // Simulate conversion by storing the original file with new extension
          const newFileName = fileName.replace(/\.[^/.]+$/, `.${targetFormat.split('/')[1]}`)
          const blob = new Blob([buffer], { type: targetFormat })

          // Upload converted file
          const result = await put(newFileName, blob, { access: 'public' })

          conversions.push({
            format: targetFormat,
            url: result.url,
            size: buffer.byteLength
          })
        }
      }
    } catch (error) {
      console.warn('Document conversion failed:', error)
    }

    return conversions
  }

  private extractTextFromPDF(rawText: string): string {
    // Very basic PDF text extraction - in production use pdf-parse
    // This is just a placeholder implementation
    try {
      // Remove PDF-specific formatting
      let text = rawText.replace(/\/[A-Z][a-zA-Z0-9]*/g, '') // Remove PDF commands
      text = text.replace(/\([^)]*\)/g, '') // Remove parentheses
      text = text.replace(/\\n/g, '\n') // Fix newlines
      text = text.replace(/\s+/g, ' ') // Normalize whitespace

      return text.trim()
    } catch {
      return rawText
    }
  }

  private detectLanguage(text: string): string {
    // Simple language detection - in production use a proper language detection library
    const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with']
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no']

    const englishCount = englishWords.filter(word => text.toLowerCase().includes(word)).length
    const spanishCount = spanishWords.filter(word => text.toLowerCase().includes(word)).length

    if (englishCount > spanishCount) return 'en'
    if (spanishCount > englishCount) return 'es'

    return 'unknown'
  }
}
