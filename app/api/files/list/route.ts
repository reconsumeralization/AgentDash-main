import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    // Organize files by folder structure
    const fileSystem = blobs.reduce((acc: any, blob) => {
      const pathParts = blob.pathname.split("/")
      const filename = pathParts.pop() || "unknown"
      const folder = pathParts.join("/") || "root"

      if (!acc[folder]) {
        acc[folder] = []
      }

      acc[folder].push({
        ...blob,
        filename,
        folder,
        type: getFileType(filename),
      })

      return acc
    }, {})

    return NextResponse.json({ fileSystem })
  } catch (error) {
    console.error("Error listing files:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}

function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return "image"
  if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(ext || "")) return "video"
  if (["mp3", "wav", "ogg", "aac", "flac"].includes(ext || "")) return "audio"
  if (["txt", "md", "json", "js", "ts", "tsx", "jsx", "css", "html"].includes(ext || "")) return "document"
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext || "")) return "office"

  return "file"
}
