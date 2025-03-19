"use client"

import { Button } from "@/components/ui/button"
import { DownloadIcon, FileIcon, FileTextIcon, ImageIcon } from "lucide-react"
import { motion } from "framer-motion"

interface Conversion {
  id: string
  originalFile: string
  convertedFile: string
  fromFormat: string
  toFormat: string
  timestamp: Date
  downloadUrl?: string
  enhancementLevel?: number
  aiSuggestions?: string[]
}

interface ConversionHistoryProps {
  conversions: Conversion[]
  theme?: string
}

export function ConversionHistory({ conversions, theme = "light" }: ConversionHistoryProps) {
  if (conversions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No conversions yet</p>
      </div>
    )
  }

  const getFormatIcon = (format: string) => {
    if (["jpg", "jpeg", "png", "gif"].includes(format.toLowerCase())) {
      return <ImageIcon className="h-4 w-4" />
    } else if (["pdf"].includes(format.toLowerCase())) {
      return <FileIcon className="h-4 w-4" />
    } else if (["doc", "docx"].includes(format.toLowerCase())) {
      return <FileTextIcon className="h-4 w-4" />
    } else {
      return <FileIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-3">
      {conversions.map((conversion, index) => (
        <motion.div
          key={conversion.id}
          className={`border rounded-lg overflow-hidden ${theme === "dark" ? "border-white/10 bg-gray-800/30" : "border-gray-200"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div
            className={`px-3 py-2 flex justify-between items-center ${theme === "dark" ? "border-b border-white/10 bg-gray-800/50" : "border-b border-gray-100 bg-gray-50"}`}
          >
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium">Conversion {conversions.length - index}</span>
              {conversion.enhancementLevel && (
                <div
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    theme === "dark" ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {conversion.enhancementLevel === 1
                    ? "Standard"
                    : conversion.enhancementLevel === 2
                      ? "Enhanced"
                      : "Ultra"}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(conversion.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                  {getFormatIcon(conversion.fromFormat)}
                </div>
                <div className="text-xs">→</div>
                <div
                  className={`p-1.5 rounded ${theme === "dark" ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"}`}
                >
                  {getFormatIcon(conversion.toFormat)}
                </div>
              </div>

              {conversion.downloadUrl && (
                <Button size="sm" variant="ghost" className="h-8 px-2" asChild>
                  <a href={conversion.downloadUrl} download={conversion.convertedFile}>
                    <DownloadIcon size={14} className="mr-1" />
                    <span className="text-xs">Download</span>
                  </a>
                </Button>
              )}
            </div>

            <div className="text-xs truncate mb-1">
              <span className="font-medium">Original:</span> {conversion.originalFile}
            </div>
            <div className="text-xs truncate">
              <span className="font-medium">Converted:</span> {conversion.convertedFile}
            </div>

            {conversion.aiSuggestions && conversion.aiSuggestions.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-1">AI Suggestions:</div>
                <div className="text-xs space-y-1">
                  {conversion.aiSuggestions.slice(0, 2).map((suggestion, i) => (
                    <div
                      key={i}
                      className={`px-2 py-1 rounded ${
                        theme === "dark" ? "bg-gray-700/50 text-gray-300" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {suggestion}
                    </div>
                  ))}
                  {conversion.aiSuggestions.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{conversion.aiSuggestions.length - 2} more suggestions
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

