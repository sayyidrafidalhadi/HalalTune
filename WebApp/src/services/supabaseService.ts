import type { Track, Playlist, HistoryEntry } from "@/types"
import { useLibraryStore } from "@/store/libraryStore"

const PLAYLISTS_KEY = "halaltune_playlists"
const LIKES_KEY = "halaltune_likes"
const HISTORY_KEY = "halaltune_history"
const DOWNLOADS_KEY = "halaltune_downloads"

function getStore<T>(key: string): Record<string, T> {
  try { return JSON.parse(localStorage.getItem(key) || "{}") } catch { return {} }
}
function setStore<T>(key: string, data: Record<string, T>) {
  localStorage.setItem(key, JSON.stringify(data))
}

function getAllTracks(): Track[] {
  return useLibraryStore.getState().tracks
}

// ── Tracks (from library store) ──────────────────────────────────────

export async function fetchTracks(): Promise<Track[]> {
  return getAllTracks()
}

export async function fetchTrackById(id: string): Promise<Track | null> {
  return getAllTracks().find((t) => t.id === id) || null
}

export async function fetchTracksByArtist(artistId: string): Promise<Track[]> {
  return getAllTracks().filter((t) => t.artist === artistId)
}

export async function fetchRecentTracks(limitCount = 20): Promise<Track[]> {
  return getAllTracks().slice(0, limitCount)
}

export async function fetchPopularTracks(limitCount = 20): Promise<Track[]> {
  return [...getAllTracks()].sort((a, b) => (b.streamCount || 0) - (a.streamCount || 0)).slice(0, limitCount)
}

export async function searchTracks(searchTerm: string): Promise<Track[]> {
  const term = searchTerm.toLowerCase()
  return getAllTracks().filter(
    (t) => t.title.toLowerCase().includes(term) || t.artist.toLowerCase().includes(term)
  ).slice(0, 20)
}

export async function incrementTrackStream(trackId: string): Promise<void> {
  return
}

export async function getUserProfileFromDb(uid: string) {
  return null
}

export async function updateUserProfile(uid: string, data: Record<string, unknown>) {}

// ── Playlists ────────────────────────────────────────────────────────

export async function fetchUserPlaylists(uid: string): Promise<Playlist[]> {
  const all = getStore<Playlist>(PLAYLISTS_KEY)
  return Object.values(all).filter((p) => p.ownerId === uid).sort((a, b) => b.createdAt - a.createdAt)
}

export async function createPlaylist(data: Omit<Playlist, "id" | "createdAt">): Promise<string> {
  const all = getStore<Playlist>(PLAYLISTS_KEY)
  const id = crypto.randomUUID()
  all[id] = { ...data, id, createdAt: Date.now() }
  setStore(PLAYLISTS_KEY, all)
  return id
}

export async function updatePlaylist(id: string, data: Partial<Playlist>): Promise<void> {
  const all = getStore<Playlist>(PLAYLISTS_KEY)
  if (all[id]) Object.assign(all[id], data)
  setStore(PLAYLISTS_KEY, all)
}

export async function deletePlaylist(id: string): Promise<void> {
  const all = getStore<Playlist>(PLAYLISTS_KEY)
  delete all[id]
  setStore(PLAYLISTS_KEY, all)
}

// ── Likes ────────────────────────────────────────────────────────────

export async function toggleLike(userId: string, trackId: string): Promise<boolean> {
  const all = getStore<string[]>(LIKES_KEY)
  const userLikes = all[userId] || []
  const idx = userLikes.indexOf(trackId)
  if (idx >= 0) {
    userLikes.splice(idx, 1)
    all[userId] = userLikes
    setStore(LIKES_KEY, all)
    return false
  }
  all[userId] = [...userLikes, trackId]
  setStore(LIKES_KEY, all)
  return true
}

export async function fetchUserLikedTrackIds(userId: string): Promise<string[]> {
  const all = getStore<string[]>(LIKES_KEY)
  return all[userId] || []
}

export async function fetchLikedTracks(userId: string): Promise<Track[]> {
  const ids = await fetchUserLikedTrackIds(userId)
  return getAllTracks().filter((t) => ids.includes(t.id))
}

// ── History ──────────────────────────────────────────────────────────

export async function addToHistory(userId: string, trackId: string): Promise<void> {
  const all = getStore<{ trackId: string; playedAt: number }[]>(HISTORY_KEY)
  const entries = all[userId] || []
  entries.unshift({ trackId, playedAt: Date.now() })
  if (entries.length > 200) entries.length = 200
  all[userId] = entries
  setStore(HISTORY_KEY, all)
}

export async function fetchUserHistory(userId: string, limitCount = 50): Promise<HistoryEntry[]> {
  const all = getStore<{ trackId: string; playedAt: number }[]>(HISTORY_KEY)
  return (all[userId] || []).slice(0, limitCount).map((e) => ({ id: e.trackId, playedAt: e.playedAt }))
}

// ── Downloads ────────────────────────────────────────────────────────

export async function fetchDownloadedTrackIds(userId: string): Promise<string[]> {
  const all = getStore<string[]>(DOWNLOADS_KEY)
  return all[userId] || []
}

export async function toggleDownload(userId: string, trackId: string): Promise<boolean> {
  const all = getStore<string[]>(DOWNLOADS_KEY)
  const userDownloads = all[userId] || []
  const idx = userDownloads.indexOf(trackId)
  if (idx >= 0) {
    userDownloads.splice(idx, 1)
    all[userId] = userDownloads
    setStore(DOWNLOADS_KEY, all)
    return false
  }
  all[userId] = [...userDownloads, trackId]
  setStore(DOWNLOADS_KEY, all)
  return true
}

// ── Podcasts & Episodes ──────────────────────────────────────────────

export async function fetchPodcasts() { return [] }
export async function fetchEpisodes(podcastId: string) { return [] }

// ── Artists & Albums ─────────────────────────────────────────────────

export async function fetchArtists() { return [] }
export async function fetchArtistById(id: string) { return null }
export async function fetchAlbums() { return [] }
export async function fetchAlbumById(id: string) { return null }
