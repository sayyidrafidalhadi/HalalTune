import { supabase } from "@/supabase"
import type { Track, Playlist, HistoryEntry } from "@/types"

// ── Helpers ──────────────────────────────────────────────────────────

function handleError(error: unknown): never {
  const msg = error instanceof Error ? error.message : "Supabase error"
  console.error("[Supabase]", msg)
  throw new Error(msg)
}

function mapTrack(row: Record<string, unknown>): Track {
  return {
    id: row.id as string,
    title: row.title as string,
    artist: row.artist as string,
    url: (row.url as string) || undefined,
    coverArt: (row.cover_art as string) || (row.coverArt as string) || undefined,
    language: (row.language as string) || undefined,
    isMalayalam: (row.is_malayalam as boolean) || undefined,
    isYoutube: (row.is_youtube as boolean) || undefined,
    youtubeId: (row.youtube_id as string) || (row.youtubeId as string) || undefined,
    streamCount: (row.stream_count as number) || (row.streamCount as number) || 0,
    likeCount: (row.like_count as number) || (row.likeCount as number) || 0,
    duration: (row.duration as number) || undefined,
    createdAt: row.created_at ? new Date(row.created_at as string).getTime() : undefined,
  }
}

function mapPlaylist(row: Record<string, unknown>): Playlist {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    coverArt: (row.cover_art as string) || (row.coverArt as string) || undefined,
    isPublic: row.is_public as boolean,
    ownerId: (row.owner_id as string) || (row.ownerId as string),
    trackIds: (row.track_ids as string[]) || (row.trackIds as string[]) || [],
    createdAt: row.created_at ? new Date(row.created_at as string).getTime() : Date.now(),
  }
}

// ── Users ────────────────────────────────────────────────────────────

export async function getUserProfileFromDb(uid: string) {
  const { data, error } = await supabase.from("users").select("*").eq("uid", uid).single()
  if (error && error.code !== "PGRST116") handleError(error)
  return data
}

export async function updateUserProfile(uid: string, data: Record<string, unknown>) {
  const { error } = await supabase.from("users").upsert({ uid, ...data }).eq("uid", uid)
  if (error) handleError(error)
}

// ── Tracks ───────────────────────────────────────────────────────────

export async function fetchTracks(): Promise<Track[]> {
  const { data, error } = await supabase.from("tracks").select("*").order("created_at", { ascending: false })
  if (error) handleError(error)
  return (data || []).map(mapTrack)
}

export async function fetchTrackById(id: string): Promise<Track | null> {
  const { data, error } = await supabase.from("tracks").select("*").eq("id", id).single()
  if (error) {
    if (error.code === "PGRST116") return null
    handleError(error)
  }
  return data ? mapTrack(data) : null
}

export async function fetchTracksByArtist(artistId: string): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })
  if (error) handleError(error)
  return (data || []).map(mapTrack)
}

export async function fetchRecentTracks(limitCount = 20): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limitCount)
  if (error) handleError(error)
  return (data || []).map(mapTrack)
}

export async function fetchPopularTracks(limitCount = 20): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .order("stream_count", { ascending: false })
    .limit(limitCount)
  if (error) handleError(error)
  return (data || []).map(mapTrack)
}

export async function searchTracks(searchTerm: string): Promise<Track[]> {
  const term = `%${searchTerm.toLowerCase()}%`
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .or(`title.ilike.${term},artist.ilike.${term}`)
    .limit(20)
  if (error) handleError(error)
  return (data || []).map(mapTrack)
}

export async function incrementTrackStream(trackId: string): Promise<void> {
  const { error } = await supabase.rpc("increment_stream_count", { track_id: trackId })
  if (error) handleError(error)
}

// ── Playlists ────────────────────────────────────────────────────────

export async function fetchUserPlaylists(uid: string): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("owner_id", uid)
    .order("created_at", { ascending: false })
  if (error) handleError(error)
  return (data || []).map(mapPlaylist)
}

export async function createPlaylist(data: Omit<Playlist, "id" | "createdAt">): Promise<string> {
  const { data: row, error } = await supabase
    .from("playlists")
    .insert({
      name: data.name,
      description: data.description || null,
      cover_art: data.coverArt || null,
      is_public: data.isPublic,
      owner_id: data.ownerId,
      track_ids: data.trackIds,
    })
    .select("id")
    .single()
  if (error) handleError(error)
  return row.id as string
}

export async function updatePlaylist(id: string, data: Partial<Playlist>): Promise<void> {
  const payload: Record<string, unknown> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.description !== undefined) payload.description = data.description
  if (data.coverArt !== undefined) payload.cover_art = data.coverArt
  if (data.isPublic !== undefined) payload.is_public = data.isPublic
  if (data.trackIds !== undefined) payload.track_ids = data.trackIds
  const { error } = await supabase.from("playlists").update(payload).eq("id", id)
  if (error) handleError(error)
}

export async function deletePlaylist(id: string): Promise<void> {
  const { error } = await supabase.from("playlists").delete().eq("id", id)
  if (error) handleError(error)
}

// ── Likes ────────────────────────────────────────────────────────────

export async function toggleLike(userId: string, trackId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("track_id", trackId)
    .maybeSingle()

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id)
    await supabase.rpc("decrement_like_count", { track_id: trackId })
    return false
  } else {
    await supabase.from("likes").insert({ user_id: userId, track_id: trackId })
    await supabase.rpc("increment_like_count", { track_id: trackId })
    return true
  }
}

export async function fetchUserLikedTrackIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("likes")
    .select("track_id")
    .eq("user_id", userId)
  if (error) handleError(error)
  return (data || []).map((r) => r.track_id as string)
}

export async function fetchLikedTracks(userId: string): Promise<Track[]> {
  const ids = await fetchUserLikedTrackIds(userId)
  if (ids.length === 0) return []
  const { data, error } = await supabase.from("tracks").select("*").in("id", ids)
  if (error) handleError(error)
  return (data || []).map(mapTrack)
}

// ── History ──────────────────────────────────────────────────────────

export async function addToHistory(userId: string, trackId: string): Promise<void> {
  const { error } = await supabase.from("history").insert({
    user_id: userId,
    track_id: trackId,
    played_at: new Date().toISOString(),
  })
  if (error) handleError(error)
}

export async function fetchUserHistory(userId: string, limitCount = 50): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from("history")
    .select("track_id, played_at")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(limitCount)
  if (error) handleError(error)
  return (data || []).map((r) => ({
    id: r.track_id as string,
    playedAt: new Date(r.played_at as string).getTime(),
  }))
}

// ── Downloads ────────────────────────────────────────────────────────

export async function fetchDownloadedTrackIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("downloads")
    .select("track_id")
    .eq("user_id", userId)
  if (error) handleError(error)
  return (data || []).map((r) => r.track_id as string)
}

export async function toggleDownload(userId: string, trackId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("downloads")
    .select("id")
    .eq("user_id", userId)
    .eq("track_id", trackId)
    .maybeSingle()

  if (existing) {
    await supabase.from("downloads").delete().eq("id", existing.id)
    return false
  } else {
    await supabase.from("downloads").insert({ user_id: userId, track_id: trackId })
    return true
  }
}

// ── Podcasts & Episodes ──────────────────────────────────────────────

export async function fetchPodcasts() {
  const { data, error } = await supabase.from("podcasts").select("*")
  if (error) handleError(error)
  return data || []
}

export async function fetchEpisodes(podcastId: string) {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("podcast_id", podcastId)
    .order("episode_number", { ascending: true })
  if (error) handleError(error)
  return data || []
}

// ── Artists & Albums ─────────────────────────────────────────────────

export async function fetchArtists() {
  const { data, error } = await supabase.from("artists").select("*")
  if (error) handleError(error)
  return data || []
}

export async function fetchArtistById(id: string) {
  const { data, error } = await supabase.from("artists").select("*").eq("id", id).single()
  if (error) {
    if (error.code === "PGRST116") return null
    handleError(error)
  }
  return data
}

export async function fetchAlbums() {
  const { data, error } = await supabase.from("albums").select("*")
  if (error) handleError(error)
  return data || []
}

export async function fetchAlbumById(id: string) {
  const { data, error } = await supabase.from("albums").select("*").eq("id", id).single()
  if (error) {
    if (error.code === "PGRST116") return null
    handleError(error)
  }
  return data
}
