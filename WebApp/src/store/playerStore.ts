import { create } from 'zustand'
import type { Track, QueueState, RepeatMode, SleepTimerState } from '@/types'

function shuffleArray(length: number, currentIndex: number): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const pos = indices.indexOf(currentIndex)
  if (pos !== -1) {
    indices.splice(pos, 1)
    indices.unshift(currentIndex)
  }
  return indices
}

interface PlayerState {
  currentQueue: Track[]
  currentTrackIndex: number
  isPlaying: boolean
  isShuffle: boolean
  shuffleOrder: number[]
  shuffleIndex: number
  repeatMode: RepeatMode
  currentTime: number
  duration: number
  progress: number
  volume: number
  playbackSpeed: number
  sleepTimer: SleepTimerState
  queue: QueueState[]

  currentTrack: () => Track | null

  setQueue: (tracks: Track[], startIndex?: number) => void
  setCurrentTrackIndex: (index: number) => void
  setIsPlaying: (playing: boolean) => void
  togglePlay: () => void
  setIsShuffle: (shuffle: boolean) => void
  toggleShuffle: () => void
  setRepeatMode: (mode: RepeatMode) => void
  cycleRepeatMode: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setProgress: (progress: number) => void
  setVolume: (volume: number) => void
  setPlaybackSpeed: (speed: number) => void

  playNext: () => void
  playPrev: () => void
  playTrack: (track: Track) => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  reorderQueue: (from: number, to: number) => void

  setSleepTimer: (minutes: number) => void
  clearSleepTimer: () => void
}

function generateShuffleOrder(
  queue: Track[],
  currentIdx: number,
  oldShuffleOrder: number[],
  oldShuffleIndex: number,
): { shuffleOrder: number[]; shuffleIndex: number } {
  const order = shuffleArray(queue.length, currentIdx)
  return { shuffleOrder: order, shuffleIndex: 0 }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentQueue: [],
  currentTrackIndex: -1,
  isPlaying: false,
  isShuffle: false,
  shuffleOrder: [],
  shuffleIndex: 0,
  repeatMode: 'off',
  currentTime: 0,
  duration: 0,
  progress: 0,
  volume: 0.7,
  playbackSpeed: 1,
  sleepTimer: { endTime: null, initialMinutes: 0 },
  queue: [],

  currentTrack: () => {
    const { currentQueue, currentTrackIndex } = get()
    if (currentTrackIndex >= 0 && currentTrackIndex < currentQueue.length) {
      return currentQueue[currentTrackIndex]
    }
    return null
  },

  setQueue: (tracks, startIndex = 0) => {
    const state = get()
    const order = state.isShuffle
      ? shuffleArray(tracks.length, startIndex)
      : []
    set({
      currentQueue: tracks,
      currentTrackIndex: startIndex,
      currentTime: 0,
      duration: 0,
      progress: 0,
      isPlaying: true,
      shuffleOrder: order,
      shuffleIndex: 0,
    })
  },

  setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsShuffle: (shuffle) => {
    const { currentQueue, currentTrackIndex } = get()
    if (shuffle) {
      const order = shuffleArray(currentQueue.length, currentTrackIndex)
      set({ isShuffle: true, shuffleOrder: order, shuffleIndex: 0 })
    } else {
      set({ isShuffle: false, shuffleOrder: [], shuffleIndex: 0 })
    }
  },

  toggleShuffle: () => {
    const { isShuffle } = get()
    get().setIsShuffle(!isShuffle)
  },

  setRepeatMode: (mode) => set({ repeatMode: mode }),

  cycleRepeatMode: () => {
    const { repeatMode } = get()
    const modes: RepeatMode[] = ['off', 'all', 'one']
    const idx = modes.indexOf(repeatMode)
    set({ repeatMode: modes[(idx + 1) % modes.length] })
  },

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setProgress: (progress) => set({ progress }),

  setVolume: (volume) => set({ volume }),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  playNext: () => {
    const { currentQueue, currentTrackIndex, isShuffle, shuffleOrder, shuffleIndex, repeatMode } = get()
    if (currentQueue.length === 0) return

    if (repeatMode === 'one') {
      set({ currentTime: 0, duration: 0, progress: 0 })
      return
    }

    let nextIndex: number
    if (isShuffle && shuffleOrder.length > 0) {
      const nextShuffleIdx = shuffleIndex + 1
      if (nextShuffleIdx < shuffleOrder.length) {
        nextIndex = shuffleOrder[nextShuffleIdx]
        set({ currentTrackIndex: nextIndex, shuffleIndex: nextShuffleIdx, currentTime: 0, duration: 0, progress: 0, isPlaying: true })
        return
      } else if (repeatMode === 'all') {
        const order = shuffleArray(currentQueue.length, shuffleOrder[0])
        set({ currentTrackIndex: order[0], shuffleOrder: order, shuffleIndex: 0, currentTime: 0, duration: 0, progress: 0, isPlaying: true })
        return
      } else {
        set({ isPlaying: false })
        return
      }
    }

    nextIndex = currentTrackIndex + 1
    if (nextIndex >= currentQueue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0
      } else {
        set({ isPlaying: false })
        return
      }
    }

    set({ currentTrackIndex: nextIndex, currentTime: 0, duration: 0, progress: 0, isPlaying: true })
  },

  playPrev: () => {
    const { currentQueue, currentTrackIndex, isShuffle, shuffleOrder, shuffleIndex, currentTime } = get()
    if (currentQueue.length === 0) return

    if (currentTime > 3) {
      set({ currentTime: 0, progress: 0 })
      return
    }

    let prevIndex: number
    if (isShuffle && shuffleOrder.length > 0) {
      const prevShuffleIdx = shuffleIndex - 1
      if (prevShuffleIdx >= 0) {
        prevIndex = shuffleOrder[prevShuffleIdx]
        set({ currentTrackIndex: prevIndex, shuffleIndex: prevShuffleIdx, currentTime: 0, duration: 0, progress: 0, isPlaying: true })
        return
      } else {
        prevIndex = shuffleOrder[shuffleOrder.length - 1]
        set({ currentTrackIndex: prevIndex, shuffleIndex: shuffleOrder.length - 1, currentTime: 0, duration: 0, progress: 0, isPlaying: true })
        return
      }
    }

    prevIndex = currentTrackIndex - 1
    if (prevIndex < 0) {
      prevIndex = currentQueue.length - 1
    }

    set({ currentTrackIndex: prevIndex, currentTime: 0, duration: 0, progress: 0, isPlaying: true })
  },

  playTrack: (track) => {
    const { currentQueue } = get()
    const idx = currentQueue.findIndex((t) => t.id === track.id)
    if (idx !== -1) {
      const { isShuffle } = get()
      let order = get().shuffleOrder
      let sIdx = get().shuffleIndex
      if (isShuffle) {
        order = shuffleArray(currentQueue.length, idx)
        sIdx = 0
      }
      set({
        currentTrackIndex: idx,
        currentTime: 0,
        duration: 0,
        progress: 0,
        isPlaying: true,
        shuffleOrder: order,
        shuffleIndex: sIdx,
      })
    }
  },

  addToQueue: (track) => {
    set((state) => ({
      currentQueue: [...state.currentQueue, track],
    }))
  },

  removeFromQueue: (index) => {
    set((state) => {
      const newQueue = state.currentQueue.filter((_, i) => i !== index)
      let newIndex = state.currentTrackIndex
      if (index < state.currentTrackIndex) {
        newIndex--
      } else if (index === state.currentTrackIndex) {
        newIndex = Math.min(newIndex, newQueue.length - 1)
      }
      const newOrder = state.shuffleOrder
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i))
      return { currentQueue: newQueue, currentTrackIndex: newIndex, shuffleOrder: newOrder }
    })
  },

  clearQueue: () => set({
    currentQueue: [],
    currentTrackIndex: -1,
    isPlaying: false,
    shuffleOrder: [],
    shuffleIndex: 0,
  }),

  reorderQueue: (from, to) => {
    set((state) => {
      const newQueue = [...state.currentQueue]
      const [moved] = newQueue.splice(from, 1)
      newQueue.splice(to, 0, moved)

      let newIndex = state.currentTrackIndex
      if (from === state.currentTrackIndex) {
        newIndex = to
      } else {
        if (from < state.currentTrackIndex && to >= state.currentTrackIndex) newIndex--
        else if (from > state.currentTrackIndex && to <= state.currentTrackIndex) newIndex++
      }

      return { currentQueue: newQueue, currentTrackIndex: newIndex }
    })
  },

  setSleepTimer: (minutes) => {
    const endTime = Date.now() + minutes * 60 * 1000
    set({ sleepTimer: { endTime, initialMinutes: minutes } })
  },

  clearSleepTimer: () => {
    set({ sleepTimer: { endTime: null, initialMinutes: 0 } })
  },
}))
