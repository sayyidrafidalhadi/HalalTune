import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { where, orderBy, limit, type QueryConstraint } from "firebase/firestore"
import {
  fetchTracks,
  fetchRecentTracks,
  fetchPopularTracks,
  fetchTrackById,
  fetchTracksByArtist,
  fetchUserPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  fetchUserLikedTrackIds,
  fetchLikedTracks,
  fetchUserHistory,
  addToHistory,
  fetchDownloadedTrackIds,
  toggleDownload as toggleDownloadInFirestore,
  toggleLike as toggleLikeInFirestore,
  fetchPodcasts,
  fetchEpisodes,
  fetchArtists,
  fetchArtistById,
  fetchAlbums,
  fetchAlbumById,
  incrementTrackStream,
  searchTracks,
} from "@/services/firestoreService"
import { useAuthStore } from "@/store/authStore"
import type { Track, Playlist } from "@/types"

const STALE = {
  SHORT: 1000 * 30,
  DEFAULT: 1000 * 60 * 2,
  LONG: 1000 * 60 * 10,
}

// ── Track Queries ──────────────────────────────────────────────────

export function useTracks(...constraints: QueryConstraint[]) {
  return useQuery({
    queryKey: ["tracks", ...constraints],
    queryFn: () => fetchTracks(...constraints),
    staleTime: STALE.DEFAULT,
  })
}

export function useRecentTracks(limitCount = 20) {
  return useQuery({
    queryKey: ["tracks", "recent", limitCount],
    queryFn: () => fetchRecentTracks(limitCount),
    staleTime: STALE.DEFAULT,
  })
}

export function usePopularTracks(limitCount = 20) {
  return useQuery({
    queryKey: ["tracks", "popular", limitCount],
    queryFn: () => fetchPopularTracks(limitCount),
    staleTime: STALE.DEFAULT,
  })
}

export function useTrackById(id: string | undefined) {
  return useQuery({
    queryKey: ["tracks", id],
    queryFn: () => (id ? fetchTrackById(id) : null),
    enabled: !!id,
    staleTime: STALE.LONG,
  })
}

export function useTracksByArtist(artistId: string | undefined) {
  return useQuery({
    queryKey: ["tracks", "artist", artistId],
    queryFn: () => (artistId ? fetchTracksByArtist(artistId) : []),
    enabled: !!artistId,
    staleTime: STALE.DEFAULT,
  })
}

export function useSearchTracks(searchTerm: string) {
  return useQuery({
    queryKey: ["tracks", "search", searchTerm],
    queryFn: () => searchTracks(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: STALE.SHORT,
  })
}

// ── Playlist Queries ───────────────────────────────────────────────

export function useUserPlaylists(uid: string | undefined) {
  return useQuery({
    queryKey: ["playlists", "user", uid],
    queryFn: () => (uid ? fetchUserPlaylists(uid) : []),
    enabled: !!uid,
    staleTime: STALE.DEFAULT,
  })
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Playlist, "id" | "createdAt">) => createPlaylist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] })
    },
  })
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Playlist> }) => updatePlaylist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] })
    },
  })
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] })
    },
  })
}

// ── Likes Queries ──────────────────────────────────────────────────

export function useLikedTrackIds(userId: string | undefined) {
  return useQuery({
    queryKey: ["likes", userId],
    queryFn: () => (userId ? fetchUserLikedTrackIds(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: STALE.SHORT,
  })
}

export function useLikedTracks(userId: string | undefined) {
  return useQuery({
    queryKey: ["likes", "tracks", userId],
    queryFn: () => (userId ? fetchLikedTracks(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: STALE.DEFAULT,
  })
}

export function useToggleLike() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (trackId: string) => toggleLikeInFirestore(user!.uid, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes"] })
    },
  })
}

// ── History Queries ────────────────────────────────────────────────

export function useUserHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ["history", userId],
    queryFn: () => (userId ? fetchUserHistory(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: STALE.SHORT,
  })
}

export function useAddToHistory() {
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (trackId: string) => addToHistory(user!.uid, trackId),
  })
}

// ── Downloads Queries ──────────────────────────────────────────────

export function useDownloadedTrackIds(userId: string | undefined) {
  return useQuery({
    queryKey: ["downloads", userId],
    queryFn: () => (userId ? fetchDownloadedTrackIds(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: STALE.SHORT,
  })
}

export function useToggleDownload() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (trackId: string) => toggleDownloadInFirestore(user!.uid, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] })
    },
  })
}

// ── Stream Count ───────────────────────────────────────────────────

export function useIncrementStream() {
  return useMutation({
    mutationFn: (trackId: string) => incrementTrackStream(trackId),
  })
}

// ── Podcast Queries ────────────────────────────────────────────────

export function usePodcasts(...constraints: QueryConstraint[]) {
  return useQuery({
    queryKey: ["podcasts", ...constraints],
    queryFn: () => fetchPodcasts(...constraints),
    staleTime: STALE.DEFAULT,
  })
}

export function useEpisodes(podcastId: string | undefined) {
  return useQuery({
    queryKey: ["episodes", podcastId],
    queryFn: () => (podcastId ? fetchEpisodes(podcastId) : Promise.resolve([])),
    enabled: !!podcastId,
    staleTime: STALE.DEFAULT,
  })
}

// ── Artist & Album Queries ─────────────────────────────────────────

export function useArtists(...constraints: QueryConstraint[]) {
  return useQuery({
    queryKey: ["artists", ...constraints],
    queryFn: () => fetchArtists(...constraints),
    staleTime: STALE.DEFAULT,
  })
}

export function useArtistById(id: string | undefined) {
  return useQuery({
    queryKey: ["artists", id],
    queryFn: () => (id ? fetchArtistById(id) : null),
    enabled: !!id,
    staleTime: STALE.LONG,
  })
}

export function useAlbums(...constraints: QueryConstraint[]) {
  return useQuery({
    queryKey: ["albums", ...constraints],
    queryFn: () => fetchAlbums(...constraints),
    staleTime: STALE.DEFAULT,
  })
}

export function useAlbumById(id: string | undefined) {
  return useQuery({
    queryKey: ["albums", id],
    queryFn: () => (id ? fetchAlbumById(id) : null),
    enabled: !!id,
    staleTime: STALE.LONG,
  })
}
