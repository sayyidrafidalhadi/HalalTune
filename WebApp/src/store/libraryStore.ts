import { create } from 'zustand'
import type { Track, Playlist } from '@/types'

interface LibraryState {
  tracks: Track[]
  playlists: Playlist[]
  speedDialPicks: Track[]

  setTracks: (tracks: Track[]) => void
  addTracks: (tracks: Track[]) => void
  setPlaylists: (playlists: Playlist[]) => void
  addPlaylist: (playlist: Playlist) => void
  removePlaylist: (id: string) => void
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void
  setSpeedDialPicks: (picks: Track[]) => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
  tracks: [],
  playlists: [],
  speedDialPicks: [],

  setTracks: (tracks) => set({ tracks }),
  addTracks: (tracks) =>
    set((state) => ({
      tracks: [...state.tracks, ...tracks],
    })),

  setPlaylists: (playlists) => set({ playlists }),

  addPlaylist: (playlist) =>
    set((state) => ({
      playlists: [playlist, ...state.playlists],
    })),

  removePlaylist: (id) =>
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== id),
    })),

  updatePlaylist: (id, updates) =>
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  setSpeedDialPicks: (picks) => set({ speedDialPicks: picks }),
}))
