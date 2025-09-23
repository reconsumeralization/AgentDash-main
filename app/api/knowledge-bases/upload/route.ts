import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const knowledgeBaseId = formData.get('knowledgeBaseId') as string
    const userId = formData.get('userId') as string
    const title = formData.get('title') as string
    const tags = formData.get('tags') as string
    const sourceType = formData.get('sourceType') as string || 'upload'

    if (!file || !knowledgeBaseId || !userId || !title) {
      return NextResponse.json({ 
        error: 'File, knowledge base ID, user ID, and title are required' 
      }, { status: 400 })
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    })

    // Determine content type based on file extension
    const getContentType = (filename: string): string => {
      const ext = filename.split('.').pop()?.toLowerCase()
      switch (ext) {
        case 'pdf': return 'pdf'
        case 'doc': return 'doc'
        case 'docx': return 'docx'
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif': return 'image'
        case 'mp4':
        case 'avi':
        case 'mov': return 'video'
        case 'mp3':
        case 'wav':
        case 'm4a': return 'audio'
        case 'md': return 'markdown'
        case 'txt': return 'text'
        default: return 'file_upload'
      }
    }

    const contentType = getContentType(file.name)
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : []

    // Create knowledge base item
    const { data, error } = await supabase
      .from('knowledge_base_items')
      .insert({
        knowledge_base_id: knowledgeBaseId,
        user_id: userId,
        title: title,
        content_type: contentType,
        source_type: sourceType as any,
        source_url: blob.url,
        file_path: blob.pathname,
        file_size_bytes: file.size,
        metadata: {
          originalName: file.name,
          mimeType: file.type,
          uploadedAt: new Date().toISOString()
        },
        tags: tagArray,
        is_processed: false,
        processing_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating knowledge base item:', error)
      return NextResponse.json({ error: 'Failed to create knowledge base item' }, { status: 500 })
    }

    // Update knowledge base stats
    await supabase.rpc('increment_knowledge_base_stats', {
      kb_id: knowledgeBaseId,
      size_delta: file.size
    })

    return NextResponse.json({ 
      item: data,
      blob: {
        url: blob.url,
        pathname: blob.pathname
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/knowledge-bases/upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
