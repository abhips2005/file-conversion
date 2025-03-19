"use client"

import { useState, useEffect } from "react"
import { Sparkles, Zap, FileSearch, AlertCircle } from "lucide-react"

interface AIInsightsProps {
  file: File
  theme?: string
}

export function AIInsights({ file, theme = "light" }: AIInsightsProps) {
  const [insights, setInsights] = useState<{
    quality: string
    suggestions: string[]
    warnings?: string[]
  } | null>(null)

  useEffect(() => {
    if (!file) return

    // Simulate AI analysis
    const generateInsights = () => {
      // Generate different insights based on file type
      if (file.type.startsWith("image/")) {
        return {
          quality: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
          suggestions: [
            "Convert to WebP for better web performance",
            "Optimize metadata for better SEO",
            "Apply smart compression to reduce file size",
          ],
          warnings: file.size > 2000000 ? ["Large image file may cause performance issues"] : undefined,
        }
      } else if (file.type.includes("pdf")) {
        return {
          quality: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
          suggestions: [
            "Extract text for better searchability",
            "Convert to DOCX for editing",
            "Optimize for mobile viewing",
          ],
          warnings: file.size > 5000000 ? ["Large PDF may be slow to process"] : undefined,
        }
      } else {
        return {
          quality: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
          suggestions: [
            "Convert to a more universal format",
            "Extract and index content",
            "Apply compression to reduce size",
          ],
        }
      }
    }

    setInsights(generateInsights())
  }, [file])

  if (!insights) return null

  return (
    <div
      className={`rounded-lg p-3 ${
        theme === "dark" ? "bg-gray-800/50 border border-white/10" : "bg-gray-50 border border-gray-200"
      }`}
    >
      <div className="flex items-center mb-2">
        <Sparkles className={`h-4 w-4 mr-2 ${theme === "dark" ? "text-purple-400" : "text-purple-500"}`} />
        <h3 className="text-sm font-medium">AI Insights</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <span className="text-xs mr-2">Quality:</span>
          <div
            className={`text-xs px-2 py-0.5 rounded-full ${
              insights.quality === "high"
                ? theme === "dark"
                  ? "bg-green-900/30 text-green-400"
                  : "bg-green-100 text-green-700"
                : insights.quality === "medium"
                  ? theme === "dark"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                  : theme === "dark"
                    ? "bg-red-900/30 text-red-400"
                    : "bg-red-100 text-red-700"
            }`}
          >
            {insights.quality.charAt(0).toUpperCase() + insights.quality.slice(1)}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-1">
            <FileSearch className="h-3 w-3 mr-1" />
            <span className="text-xs">Suggestions:</span>
          </div>
          <ul className="text-xs space-y-1">
            {insights.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <Zap className={`h-3 w-3 mr-1 mt-0.5 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {insights.warnings && insights.warnings.length > 0 && (
          <div>
            <div className="flex items-center mb-1">
              <AlertCircle className={`h-3 w-3 mr-1 ${theme === "dark" ? "text-amber-400" : "text-amber-500"}`} />
              <span className="text-xs">Warnings:</span>
            </div>
            <ul className="text-xs space-y-1">
              {insights.warnings.map((warning, index) => (
                <li
                  key={index}
                  className={`px-2 py-1 rounded ${
                    theme === "dark" ? "bg-amber-900/20 text-amber-400" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

