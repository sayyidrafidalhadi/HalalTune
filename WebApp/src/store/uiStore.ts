import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  fsPlayerOpen: boolean
  searchOpen: boolean
  queueOpen: boolean
  profileOpen: boolean
  historyOpen: boolean
  playlistSelectTrackId: string | null
  toastMessage: string
  toastVisible: boolean

  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setFsPlayerOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setQueueOpen: (open: boolean) => void
  toggleQueue: () => void
  setProfileOpen: (open: boolean) => void
  setHistoryOpen: (open: boolean) => void
  setPlaylistSelectTrackId: (id: string | null) => void
  showToast: (message: string) => void
  hideToast: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  fsPlayerOpen: false,
  searchOpen: false,
  queueOpen: false,
  profileOpen: false,
  historyOpen: false,
  playlistSelectTrackId: null,
  toastMessage: '',
  toastVisible: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setFsPlayerOpen: (open) => set({ fsPlayerOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setQueueOpen: (open) => set({ queueOpen: open }),
  toggleQueue: () => set((state) => ({ queueOpen: !state.queueOpen })),
  setProfileOpen: (open) => set({ profileOpen: open }),
  setHistoryOpen: (open) => set({ historyOpen: open }),
  setPlaylistSelectTrackId: (id) => set({ playlistSelectTrackId: id }),
  showToast: (message) => set({ toastMessage: message, toastVisible: true }),
  hideToast: () => set({ toastVisible: false }),
}))
