"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileIcon, FileTextIcon, ImageIcon, ArrowRight, Zap, RefreshCw, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface ConversionVisualizerProps {
  file: File
  isConverting: boolean
  progress: number
  theme?: string
  enhancementLevel: number
  onConvert: (fromFormat: string, toFormat: string) => void
}

export function ConversionVisualizer({
  file,
  isConverting,
  progress,
  theme = "light",
  enhancementLevel,
  onConvert,
}: ConversionVisualizerProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""

  // Determine available conversion targets based on file type
  const getConversionTargets = () => {
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      return ["pdf", "png", "jpg"]
    } else if (["pdf"].includes(fileExtension)) {
      return ["docx", "jpg", "png"]
    } else if (["doc", "docx"].includes(fileExtension)) {
      return ["pdf"]
    } else {
      return ["pdf", "jpg"]
    }
  }

  const targets = getConversionTargets().filter((t) => t !== fileExtension)

  useEffect(() => {
    if (targets.length > 0 && !selectedTarget) {
      setSelectedTarget(targets[0])
    }
  }, [targets])

  const getFormatIcon = (format: string) => {
    if (["jpg", "jpeg", "png", "gif"].includes(format.toLowerCase())) {
      return <ImageIcon className="h-6 w-6" />
    } else if (["pdf"].includes(format.toLowerCase())) {
      return <FileIcon className="h-6 w-6" />
    } else if (["doc", "docx"].includes(format.toLowerCase())) {
      return <FileTextIcon className="h-6 w-6" />
    } else {
      return <FileIcon className="h-6 w-6" />
    }
  }

  const handleConvert = () => {
    if (selectedTarget) {
      onConvert(fileExtension, selectedTarget)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-6 text-center">Conversion Studio</h2>

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-full mb-8">
          {/* Source file */}
          <motion.div
            className={`w-40 h-40 flex flex-col items-center justify-center rounded-2xl ${
              theme === "dark" ? "bg-gray-800/70 border border-white/10" : "bg-white border border-gray-200"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              {getFormatIcon(fileExtension)}
            </div>
            <p className="text-sm font-medium mb-1 truncate max-w-[90%]">{file.name}</p>
            <p className="text-xs text-muted-foreground">{fileExtension.toUpperCase()} Format</p>
          </motion.div>

          {/* Arrow */}
          <div className="mx-8 relative">
            {isConverting ? (
              <div className="flex flex-col items-center">
                <RefreshCw className={`h-8 w-8 animate-spin ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
                <div className="mt-2 w-24">
                  <Progress value={progress} className={theme === "dark" ? "bg-gray-700" : ""} />
                  <p className="text-xs text-center mt-1">{Math.round(progress)}%</p>
                </div>
              </div>
            ) : (
              <ArrowRight className={`h-8 w-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
            )}

            {/* Enhancement level indicators */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {Array.from({ length: enhancementLevel }).map((_, i) => (
                <Zap key={i} className={`h-4 w-4 ${theme === "dark" ? "text-yellow-400" : "text-yellow-500"}`} />
              ))}
            </div>
          </div>

          {/* Target format */}
          <motion.div
            className={`w-40 h-40 flex flex-col items-center justify-center rounded-2xl ${
              theme === "dark" ? "bg-gray-800/70 border border-white/10" : "bg-white border border-gray-200"
            } ${isConverting && progress === 100 ? "ring-2 ring-green-500" : ""}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isConverting && progress === 100 ? (
              <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                    theme === "dark" ? "bg-green-900/30" : "bg-green-100"
                  }`}
                >
                  <CheckCircle className={`h-8 w-8 ${theme === "dark" ? "text-green-400" : "text-green-500"}`} />
                </div>
                <p className="text-sm font-medium mb-1">Conversion Complete</p>
                <p className="text-xs text-muted-foreground">Ready to download</p>
              </motion.div>
            ) : (
              <>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                    theme === "dark" ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {selectedTarget && getFormatIcon(selectedTarget)}
                </div>
                <p className="text-sm font-medium mb-1">
                  {selectedTarget ? `${selectedTarget.toUpperCase()} Format` : "Select format"}
                </p>
                <p className="text-xs text-muted-foreground">Target format</p>
              </>
            )}
          </motion.div>
        </div>

        {/* Format selection */}
        {!isConverting && (
          <div className="mb-8">
            <p className="text-sm font-medium mb-3 text-center">Select Target Format</p>
            <div className="flex flex-wrap justify-center gap-2">
              {targets.map((format) => (
                <Button
                  key={format}
                  variant={selectedTarget === format ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTarget(format)}
                  className={`min-w-20 ${
                    selectedTarget === format && theme === "dark" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""
                  }`}
                >
                  {getFormatIcon(format)}
                  <span className="ml-2">{format.toUpperCase()}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center">
          {isConverting && progress === 100 ? (
            <Button
              onClick={() => window.location.reload()}
              className={`px-6 ${theme === "dark" ? "bg-gradient-to-r from-green-600 to-emerald-600" : ""}`}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Convert Another File
            </Button>
          ) : !isConverting ? (
            <Button
              onClick={handleConvert}
              disabled={!selectedTarget}
              className={`px-6 ${theme === "dark" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}`}
            >
              <Zap className="mr-2 h-4 w-4" />
              Start Conversion
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

