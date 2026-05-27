import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function getCategory(language?: string, isMalayalam?: boolean): string {
  if (language) return language.toLowerCase()
  if (isMalayalam) return "malayalam"
  return "others"
}

export const CATEGORIES = [
  { key: "arabic", label: "Arabic" },
  { key: "malayalam", label: "Malayalam" },
  { key: "english", label: "English" },
  { key: "urdu", label: "Urdu" },
  { key: "others", label: "Others" },
] as const

export const RECENTS_MAX = 8
export const HISTORY_MAX = 50
