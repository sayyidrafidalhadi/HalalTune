import { create } from 'zustand'
import type { UserProfile, HistoryEntry } from '@/types'

interface AuthState {
  user: UserProfile | null
  loading: boolean
  localUserId: string
  likedSongIds: Set<string>
  historyList: HistoryEntry[]

  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setLikedSongIds: (ids: Set<string>) => void
  toggleLike: (trackId: string) => void
  setHistoryList: (history: HistoryEntry[]) => void
  addToHistory: (trackId: string) => void
  clearHistory: () => void
  isLiked: (trackId: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  localUserId:
    localStorage.getItem('halaltune_uid') ||
    'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
  likedSongIds: new Set(),
  historyList: [],

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ loading }),

  setLikedSongIds: (ids) => set({ likedSongIds: ids }),

  toggleLike: (trackId) => {
    const { likedSongIds, user } = get()
    if (!user) return

    const newSet = new Set(likedSongIds)
    if (newSet.has(trackId)) {
      newSet.delete(trackId)
    } else {
      newSet.add(trackId)
    }
    set({ likedSongIds: newSet })
  },

  setHistoryList: (history) => set({ historyList: history }),

  addToHistory: (trackId) => {
    set((state) => {
      const filtered = state.historyList.filter((e) => e.id !== trackId)
      const entry: HistoryEntry = { id: trackId, playedAt: Date.now() }
      return { historyList: [entry, ...filtered].slice(0, 50) }
    })
  },

  clearHistory: () => set({ historyList: [] }),

  isLiked: (trackId) => get().likedSongIds.has(trackId),
}))
