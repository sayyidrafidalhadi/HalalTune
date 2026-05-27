export interface Track {
  id: string
  title: string
  artist: string
  url?: string
  coverArt?: string
  language?: string
  isMalayalam?: boolean
  isYoutube?: boolean
  youtubeId?: string
  streamCount?: number
  likeCount?: number
  duration?: number
  createdAt?: number
}

export interface Playlist {
  id: string
  name: string
  description?: string
  coverArt?: string
  isPublic: boolean
  ownerId: string
  trackIds: string[]
  createdAt: number
}

export interface HistoryEntry {
  id: string
  playedAt: number
}

export interface UserProfile {
  uid: string
  displayName?: string
  email?: string
  photoURL?: string
}

export type Category = 'arabic' | 'malayalam' | 'english' | 'urdu' | 'others'

export type PageVariant =
  | 'home'
  | 'search'
  | 'library'
  | 'quran'
  | 'podcasts'
  | 'playlist'
  | 'artist'
  | 'album'
  | 'profile'
  | 'settings'

export interface QueueState {
  tracks: Track[]
  currentIndex: number
}

export type RepeatMode = 'off' | 'all' | 'one'

export interface SleepTimerState {
  endTime: number | null
  initialMinutes: number
}

export interface LyricsLine {
  time: number
  text: string
}
