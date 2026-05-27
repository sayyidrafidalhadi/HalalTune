import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  onSnapshot,
  type DocumentData,
  type QueryConstraint,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/firebase"
import type { Track, Playlist, UserProfile, HistoryEntry } from "@/types"

function handleFirestoreError(error: FirestoreError): never {
  console.error("[Firestore]", error.code, error.message)
  throw new Error(error.message)
}

// ── Collection references ──────────────────────────────────────────

export const collections = {
  users: collection(db, "users"),
  tracks: collection(db, "tracks"),
  artists: collection(db, "artists"),
  albums: collection(db, "albums"),
  playlists: collection(db, "playlists"),
  podcasts: collection(db, "podcasts"),
  episodes: collection(db, "episodes"),
  likes: collection(db, "likes"),
  history: collection(db, "history"),
  downloads: collection(db, "downloads"),
} as const

export function getDocRef(collectionName: string, docId: string) {
  return doc(db, collectionName, docId)
}

// ── Users ──────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid))
    if (!snap.exists()) return null
    return snap.data() as UserProfile
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true })
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

// ── Generic fetchers ───────────────────────────────────────────────

export async function fetchAll<T>(collectionName: string, ...constraints: QueryConstraint[]): Promise<T[]> {
  try {
    const q = constraints.length > 0 ? query(collection(db, collectionName), ...constraints) : collection(db, collectionName)
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[]
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

export async function fetchById<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const snap = await getDoc(doc(db, collectionName, docId))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as T
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

// ── Tracks ─────────────────────────────────────────────────────────

export function fetchTracks(...constraints: QueryConstraint[]): Promise<Track[]> {
  return fetchAll<Track>("tracks", ...constraints)
}

export function fetchTrackById(id: string): Promise<Track | null> {
  return fetchById<Track>("tracks", id)
}

export function fetchTracksByArtist(artistId: string): Promise<Track[]> {
  return fetchAll<Track>("tracks", where("artistId", "==", artistId), orderBy("createdAt", "desc"))
}

export function fetchRecentTracks(limitCount = 20): Promise<Track[]> {
  return fetchAll<Track>("tracks", orderBy("createdAt", "desc"), limit(limitCount))
}

export function fetchPopularTracks(limitCount = 20): Promise<Track[]> {
  return fetchAll<Track>("tracks", orderBy("streamCount", "desc"), limit(limitCount))
}

export function searchTracks(searchTerm: string): Promise<Track[]> {
  const term = searchTerm.toLowerCase()
  return fetchAll<Track>(
    "tracks",
    where("searchKeywords", "array-contains", term),
    limit(20),
  )
}

export async function incrementTrackStream(trackId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "tracks", trackId), { streamCount: increment(1) })
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

export async function createTrack(track: Omit<Track, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "tracks"), {
      ...track,
      createdAt: serverTimestamp(),
      streamCount: 0,
      likeCount: 0,
    })
    return docRef.id
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

// ── Playlists ──────────────────────────────────────────────────────

export function fetchUserPlaylists(uid: string): Promise<Playlist[]> {
  return fetchAll<Playlist>("playlists", where("ownerId", "==", uid), orderBy("createdAt", "desc"))
}

export async function createPlaylist(data: Omit<Playlist, "id" | "createdAt">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "playlists"), {
      ...data,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

export async function updatePlaylist(id: string, data: Partial<Playlist>): Promise<void> {
  try {
    await updateDoc(doc(db, "playlists", id), data)
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

export async function deletePlaylist(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "playlists", id))
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

// ── Likes ──────────────────────────────────────────────────────────

export async function toggleLike(userId: string, trackId: string): Promise<boolean> {
  try {
    const likeRef = doc(db, "likes", `${userId}_${trackId}`)
    const snap = await getDoc(likeRef)
    if (snap.exists()) {
      await deleteDoc(likeRef)
      await updateDoc(doc(db, "tracks", trackId), { likeCount: increment(-1) })
      return false
    } else {
      await setDoc(likeRef, { userId, trackId, createdAt: serverTimestamp() })
      await updateDoc(doc(db, "tracks", trackId), { likeCount: increment(1) })
      return true
    }
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

export async function fetchUserLikedTrackIds(userId: string): Promise<string[]> {
  try {
    const q = query(collection(db, "likes"), where("userId", "==", userId))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data().trackId)
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

export async function fetchLikedTracks(userId: string): Promise<Track[]> {
  const ids = await fetchUserLikedTrackIds(userId)
  if (ids.length === 0) return []
  const tracks: Track[] = []
  for (const id of ids) {
    const t = await fetchTrackById(id)
    if (t) tracks.push(t)
  }
  return tracks
}

// ── History ────────────────────────────────────────────────────────

export async function addToHistory(userId: string, trackId: string): Promise<void> {
  try {
    const historyRef = doc(db, "history", `${userId}_${trackId}`)
    await setDoc(historyRef, { userId, trackId, playedAt: serverTimestamp() })
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

export async function fetchUserHistory(userId: string, limitCount = 50): Promise<HistoryEntry[]> {
  try {
    const q = query(
      collection(db, "history"),
      where("userId", "==", userId),
      orderBy("playedAt", "desc"),
      limit(limitCount),
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.data().trackId, playedAt: d.data().playedAt?.toMillis() || Date.now() }))
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

// ── Downloads ──────────────────────────────────────────────────────

export async function fetchDownloadedTrackIds(userId: string): Promise<string[]> {
  try {
    const q = query(collection(db, "downloads"), where("userId", "==", userId))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data().trackId)
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

export async function toggleDownload(userId: string, trackId: string): Promise<boolean> {
  try {
    const dlRef = doc(db, "downloads", `${userId}_${trackId}`)
    const snap = await getDoc(dlRef)
    if (snap.exists()) {
      await deleteDoc(dlRef)
      return false
    } else {
      await setDoc(dlRef, { userId, trackId, createdAt: serverTimestamp() })
      return true
    }
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}

// ── Podcasts & Episodes ────────────────────────────────────────────

export function fetchPodcasts(...constraints: QueryConstraint[]) {
  return fetchAll("podcasts", ...constraints)
}

export function fetchEpisodes(podcastId: string) {
  return fetchAll("episodes", where("podcastId", "==", podcastId), orderBy("episodeNumber", "asc"))
}

// ── Artists & Albums ───────────────────────────────────────────────

export function fetchArtists(...constraints: QueryConstraint[]) {
  return fetchAll("artists", ...constraints)
}

export function fetchArtistById(id: string) {
  return fetchById("artists", id)
}

export function fetchAlbums(...constraints: QueryConstraint[]) {
  return fetchAll("albums", ...constraints)
}

export function fetchAlbumById(id: string) {
  return fetchById("albums", id)
}

// ── Realtime subscriptions ─────────────────────────────────────────

export function subscribeToCollection<T>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (error: Error) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe {
  const q = constraints.length > 0
    ? query(collection(db, collectionName), ...constraints)
    : collection(db, collectionName)

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[]
      onData(items)
    },
    (error) => {
      handleFirestoreError(error)
      onError?.(error)
    },
  )
}

// ── Counts ─────────────────────────────────────────────────────────

export async function getCollectionCount(collectionName: string, ...constraints: QueryConstraint[]): Promise<number> {
  try {
    const q = constraints.length > 0
      ? query(collection(db, collectionName), ...constraints)
      : collection(db, collectionName)
    const snap = await getCountFromServer(q)
    return snap.data().count
  } catch (e) {
    handleFirestoreError(e as FirestoreError)
  }
}
