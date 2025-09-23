"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Badge } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import {
  FolderIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  UploadIcon,
  TrashIcon,
  EditIcon,
  SaveIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"

interface FileItem {
  url: string
  filename: string
  size: number
  type: string
  folder: string
  uploadedAt: string
}

interface FileSystem {
  [folder: string]: FileItem[]
}

export function VirtualFileSystem() {
  const [fileSystem, setFileSystem] = useState<FileSystem>({})
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [fileContent, setFileContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [currentFolder, setCurrentFolder] = useState("root")
  const [newFolderName, setNewFolderName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadFileSystem()
  }, [])

  const loadFileSystem = async () => {
    try {
      const response = await fetch("/api/files/list")
      const data = await response.json()
      setFileSystem(data.fileSystem || {})
    } catch (error) {
      console.error("Failed to load file system:", error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", currentFolder === "root" ? "" : currentFolder)

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        await loadFileSystem()
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (file: FileItem) => {
    setSelectedFile(file)
    setIsEditing(false)

    if (file.type === "document") {
      try {
        const response = await fetch(`/api/files/content?url=${encodeURIComponent(file.url)}`)
        const data = await response.json()
        setFileContent(data.content || "")
      } catch (error) {
        console.error("Failed to load file content:", error)
        setFileContent("")
      }
    } else {
      setFileContent("")
    }
  }

  const handleSaveContent = async () => {
    if (!selectedFile) return

    try {
      await fetch("/api/files/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: selectedFile.url,
          content: fileContent,
        }),
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save content:", error)
    }
  }

  const handleDeleteFile = async (file: FileItem) => {
    try {
      await fetch("/api/files/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: file.url }),
      })
      await loadFileSystem()
      if (selectedFile?.url === file.url) {
        setSelectedFile(null)
        setFileContent("")
      }
    } catch (error) {
      console.error("Failed to delete file:", error)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "video":
        return <VideoIcon className="w-4 h-4" />
      case "document":
        return <FileTextIcon className="w-4 h-4" />
      default:
        return <FileIcon className="w-4 h-4" />
    }
  }

  const filteredFiles = Object.entries(fileSystem).reduce((acc, [folder, files]) => {
    const filtered = files.filter((file) => file.filename.toLowerCase().includes(searchTerm.toLowerCase()))
    if (filtered.length > 0) {
      acc[folder] = filtered
    }
    return acc
  }, {} as FileSystem)

  return (
    <div className="h-full flex">
      {/* File Browser */}
      <div className="w-1/3 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" variant="outline">
              <SearchIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1" disabled={isLoading}>
              <label className="flex items-center gap-2 cursor-pointer">
                <UploadIcon className="w-4 h-4" />
                Upload
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </Button>
            <Button size="sm" variant="outline">
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {Object.entries(filteredFiles).map(([folder, files]) => (
              <div key={folder} className="mb-4">
                <div className="flex items-center gap-2 p-2 text-sm font-medium text-muted-foreground">
                  <FolderIcon className="w-4 h-4" />
                  {folder === "root" ? "Root" : folder}
                </div>

                <div className="ml-4 space-y-1">
                  {files.map((file) => (
                    <div
                      key={file.url}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                        selectedFile?.url === file.url ? "bg-accent" : ""
                      }`}
                      onClick={() => handleFileSelect(file)}
                    >
                      {getFileIcon(file.type)}
                      <span className="flex-1 text-sm truncate">{file.filename}</span>
                      <Badge variant="secondary" className="text-xs">
                        {file.type}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFile(file)
                        }}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* File Editor/Viewer */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedFile.filename}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
                  </p>
                </div>

                {selectedFile.type === "document" && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <Button size="sm" onClick={handleSaveContent}>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        <EditIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 p-4">
              {selectedFile.type === "image" && (
                <div className="flex items-center justify-center h-full">
                  <Image
                    src={selectedFile.url || "/placeholder.svg"}
                    alt={selectedFile.filename}
                    width={500}
                    height={500}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}

              {selectedFile.type === "video" && (
                <div className="flex items-center justify-center h-full">
                  <video src={selectedFile.url} controls className="max-w-full max-h-full rounded-lg shadow-lg" />
                </div>
              )}

              {selectedFile.type === "document" && (
                <div className="h-full">
                  {isEditing ? (
                    <textarea
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      className="w-full h-full p-4 border border-border rounded-lg bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your content here..."
                    />
                  ) : (
                    <div className="h-full p-4 border border-border rounded-lg bg-muted/50 font-mono text-sm whitespace-pre-wrap overflow-auto">
                      {fileContent || "No content available"}
                    </div>
                  )}
                </div>
              )}

              {!["image", "video", "document"].includes(selectedFile.type) && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <FileIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Preview not available for this file type</p>
                    <Button className="mt-4" asChild>
                      <a href={selectedFile.url} download={selectedFile.filename}>
                        Download File
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a file to view or edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
