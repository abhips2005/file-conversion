"use client"

import { useState, useEffect } from "react"
import { FileIcon, FileTextIcon, ImageIcon, FileArchiveIcon } from "lucide-react"

interface FilePreviewProps {
  file: File
  theme?: string
}

export function FilePreview({ file, theme = "light" }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) return

    // Create preview for image files
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [file])

  const getFileIcon = () => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />
    } else if (file.type.includes("pdf")) {
      return <FileIcon className="h-5 w-5" />
    } else if (file.type.includes("word") || file.type.includes("document")) {
      return <FileTextIcon className="h-5 w-5" />
    } else {
      return <FileArchiveIcon className="h-5 w-5" />
    }
  }

  const getFileSize = () => {
    const sizeInKB = file.size / 1024
    if (sizeInKB < 1024) {
      return `${Math.round(sizeInKB * 10) / 10} KB`
    } else {
      return `${Math.round((sizeInKB / 1024) * 10) / 10} MB`
    }
  }

  return (
    <div
      className={`rounded-lg overflow-hidden border ${theme === "dark" ? "border-white/10 bg-gray-800/30" : "border-gray-200 bg-gray-50"}`}
    >
      {preview ? (
        <div className="aspect-video relative overflow-hidden">
          <img src={preview || "/placeholder.svg"} alt={file.name} className="w-full h-full object-contain" />
        </div>
      ) : (
        <div
          className={`aspect-video flex items-center justify-center ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-100"}`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700/50" : "bg-white"}`}
          >
            {getFileIcon()}
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-sm truncate max-w-[200px]">{file.name}</h3>
          <span className="text-xs text-muted-foreground">{getFileSize()}</span>
        </div>
        <p className="text-xs text-muted-foreground">{file.type || "Unknown file type"}</p>
      </div>
    </div>
  )
}

