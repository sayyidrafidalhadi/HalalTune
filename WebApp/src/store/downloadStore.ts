import { create } from 'zustand'
import type { Track } from '@/types'

interface DownloadsState {
  downloadedIds: Set<string>
  downloadQueue: string[]
  setDownloadedIds: (ids: Set<string>) => void
  toggleDownload: (trackId: string) => void
  isDownloaded: (trackId: string) => boolean
  clearDownloads: () => void
}

function loadDownloads(): Set<string> {
  try {
    const raw = localStorage.getItem('halaltune_downloads')
    if (raw) return new Set(JSON.parse(raw))
  } catch {}
  return new Set()
}

function saveDownloads(ids: Set<string>) {
  localStorage.setItem('halaltune_downloads', JSON.stringify([...ids]))
}

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  downloadedIds: loadDownloads(),
  downloadQueue: [],

  setDownloadedIds: (ids) => {
    saveDownloads(ids)
    set({ downloadedIds: ids })
  },

  toggleDownload: (trackId) => {
    const { downloadedIds } = get()
    const newSet = new Set(downloadedIds)
    if (newSet.has(trackId)) {
      newSet.delete(trackId)
    } else {
      newSet.add(trackId)
    }
    saveDownloads(newSet)
    set({ downloadedIds: newSet })
  },

  isDownloaded: (trackId) => get().downloadedIds.has(trackId),

  clearDownloads: () => {
    saveDownloads(new Set())
    set({ downloadedIds: new Set() })
  },
}))
