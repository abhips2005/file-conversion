"use client"

import type React from "react"

import { type ChangeEvent, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileUp } from "lucide-react"
import { motion } from "framer-motion"

interface FileUploaderProps {
  onChange: (file: File | null) => void
  theme?: string
  isLarge?: boolean
  maxSize?: number // in bytes
}

export function FileUploader({ onChange, theme = "light", isLarge = false, maxSize = 10 * 1024 * 1024 }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > maxSize) {
        alert(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`)
        return
      }
      onChange(file)
    } else {
      onChange(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.size > maxSize) {
        alert(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`)
        return
      }
      onChange(file)
      e.dataTransfer.clearData()
    }
  }

  if (isLarge) {
    return (
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          theme === "dark"
            ? "border-gray-700 hover:border-blue-500/50 bg-gray-800/30"
            : "border-gray-300 hover:border-blue-500/50 bg-gray-50/50"
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
        />
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <FileUp className={`h-8 w-8 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
        </motion.div>
        <p className="text-sm font-medium mb-1">Drag & Drop or Click to Upload</p>
        <p className="text-xs text-muted-foreground">Supports PDF, DOCX, JPG, PNG and more</p>
      </div>
    )
  }

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleClick}
        title="Upload file"
        className={`rounded-full ${theme === "dark" ? "border-white/20 bg-gray-800/50 hover:bg-gray-700/50" : ""}`}
      >
        <Upload size={18} />
      </Button>
    </>
  )
}

