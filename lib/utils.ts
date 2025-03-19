import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// File conversion utilities
export const supportedConversions = {
  pdf: ["docx", "jpg", "png"],
  docx: ["pdf"],
  jpg: ["pdf", "png"],
  jpeg: ["pdf", "png"],
  png: ["pdf", "jpg"],
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || ""
}

export function isConversionSupported(fromFormat: string, toFormat: string): boolean {
  const normalizedFrom = fromFormat.toLowerCase()
  const normalizedTo = toFormat.toLowerCase()

  return supportedConversions[normalizedFrom as keyof typeof supportedConversions]?.includes(normalizedTo) || false
}

