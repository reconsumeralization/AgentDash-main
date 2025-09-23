import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
    const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]
  const projectId = formData.get('projectId') as string

  if (!files || files.length === 0 || !projectId) {
    return NextResponse.json({ error: 'Files and projectId are required.' }, { status: 400 })
  }

  try {
    const uploadedFiles = []

    for (const file of files) {
      const blob = await put(file.name, file, {
        access: 'public',
        multipart: true,
      })

      // Create a project file entry in the database
      const newFile = await db.createProjectFile(
        projectId,
        userId,
        {
          filename: file.name,
          original_filename: file.name,
          file_path: blob.pathname,
          file_size_bytes: file.size,
          file_type: file.type?.split('/')[0] || 'file',
          mime_type: file.type,
          description: `Uploaded file: ${file.name}`,
          tags: [],
          access_permissions: {},
        }
      )

      uploadedFiles.push({ blob, newFile })
    }

    return NextResponse.json({ uploadedFiles }, { status: 200 })
  } catch (error: any) {
    console.error('Error uploading files to project:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
