import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where, setDoc, Timestamp } from 'firebase/firestore';
import type { Track, Playlist, HistoryEntry } from '@/types';
import { useLibraryStore } from '@/store/libraryStore';

const firebaseConfig = {
  apiKey: "AIzaSyB2ZpsWlcZX9B75X2wLn5u_GQM21v0LEtU",
  authDomain: "halaltune-736b6.firebaseapp.com",
  projectId: "halaltune-736b6",
  storageBucket: "halaltune-736b6.firebasestorage.app",
  messagingSenderId: "316147520878",
  appId: "1:316147520878:web:7f2d26508b278fb7a31d7f",
};

const app = initializeApp(firebaseConfig, 'halaltune-webapp');
const db = getFirestore(app);

async function getById<T>(collectionName: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as T;
}

// ── Tracks (from library store + Firestore fallback) ───────────────────

function mapFirestoreDoc(d: { id: string; data: () => Record<string, unknown> }): Track {
  const data = d.data();
  return {
    id: d.id,
    title: (data.title as string) || '',
    artist: (data.artist_name as string) || (data.artist as string) || '',
    url: (data.audio_url as string) || (data.url as string) || '',
    coverArt: (data.cover_url as string) || (data.coverArt as string) || undefined,
    streamCount: (data.plays_count as number) || 0,
    likeCount: 0,
    duration: (data.duration as number) || 0,
    createdAt: data.created_at ? new Date(data.created_at as string).getTime() : Date.now(),
  };
}

export async function fetchTracks(): Promise<Track[]> {
  const local = useLibraryStore.getState().tracks;
  if (local.length > 0) return local;
  const snap = await getDocs(collection(db, 'tracks'));
  return snap.docs.map(mapFirestoreDoc);
}

export async function fetchAndSetTracks(): Promise<void> {
  const snap = await getDocs(collection(db, 'tracks'));
  const mapped = snap.docs.map(mapFirestoreDoc);
  useLibraryStore.getState().setTracks(mapped);
}

export async function fetchTrackById(id: string): Promise<Track | null> {
  const local = useLibraryStore.getState().tracks.find((t) => t.id === id);
  if (local) return local;
  const snap = await getDoc(doc(db, 'tracks', id));
  if (!snap.exists()) return null;
  return mapFirestoreDoc(snap);
}

export async function fetchTracksByArtist(artistId: string): Promise<Track[]> {
  const local = useLibraryStore.getState().tracks.filter((t) => t.artist === artistId);
  if (local.length > 0) return local;
  const q = query(collection(db, 'tracks'), where('artist_id', '==', artistId));
  const snap = await getDocs(q);
  return snap.docs.map(mapFirestoreDoc);
}

export async function fetchRecentTracks(limitCount = 20): Promise<Track[]> {
  const local = useLibraryStore.getState().tracks;
  if (local.length > 0) return local.slice(0, limitCount);
  const q = query(collection(db, 'tracks'), orderBy('created_at', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(mapFirestoreDoc);
}

export async function fetchPopularTracks(limitCount = 20): Promise<Track[]> {
  const local = useLibraryStore.getState().tracks;
  if (local.length > 0) return [...local].sort((a, b) => (b.streamCount || 0) - (a.streamCount || 0)).slice(0, limitCount);
  const q = query(collection(db, 'tracks'), orderBy('plays_count', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(mapFirestoreDoc);
}

export async function searchTracks(searchTerm: string): Promise<Track[]> {
  const term = searchTerm.toLowerCase();
  const local = useLibraryStore.getState().tracks;
  if (local.length > 0) {
    return local.filter((t) => t.title.toLowerCase().includes(term) || t.artist.toLowerCase().includes(term)).slice(0, 20);
  }
  const snap = await getDocs(collection(db, 'tracks'));
  return snap.docs
    .map(mapFirestoreDoc)
    .filter((t) => t.title.toLowerCase().includes(term) || t.artist.toLowerCase().includes(term))
    .slice(0, 20);
}

export async function incrementTrackStream(_trackId: string): Promise<void> {
  // Stream counting intentionally no-op for now
}

export async function getUserProfileFromDb(uid: string) {
  return getById('users', uid);
}

export async function updateUserProfile(uid: string, data: Record<string, unknown>) {
  await setDoc(doc(db, 'users', uid), { ...data, updated_at: new Date().toISOString() }, { merge: true });
}

// ── Playlists ──────────────────────────────────────────────────────────

export async function fetchUserPlaylists(uid: string): Promise<Playlist[]> {
  const q = query(collection(db, 'playlists'), where('ownerId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Playlist));
}

export async function createPlaylist(data: Omit<Playlist, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'playlists'), { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function updatePlaylist(id: string, data: Partial<Playlist>) {
  await updateDoc(doc(db, 'playlists', id), { ...data });
}

export async function deletePlaylist(id: string) {
  await deleteDoc(doc(db, 'playlists', id));
}

// ── Likes ──────────────────────────────────────────────────────────────

export async function toggleLike(userId: string, trackId: string): Promise<boolean> {
  const likeId = `${userId}_${trackId}`;
  const snap = await getDoc(doc(db, 'likes', likeId));
  if (snap.exists()) {
    await deleteDoc(doc(db, 'likes', likeId));
    return false;
  }
  await setDoc(doc(db, 'likes', likeId), { userId, trackId, createdAt: Timestamp.now() });
  return true;
}

export async function fetchUserLikedTrackIds(userId: string): Promise<string[]> {
  const q = query(collection(db, 'likes'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().trackId as string);
}

export async function fetchLikedTracks(userId: string): Promise<Track[]> {
  const ids = await fetchUserLikedTrackIds(userId);
  if (ids.length === 0) return [];
  const local = useLibraryStore.getState().tracks;
  return local.filter((t) => ids.includes(t.id));
}

// ── History ────────────────────────────────────────────────────────────

export async function addToHistory(userId: string, trackId: string): Promise<void> {
  const ref = await addDoc(collection(db, 'history'), {
    userId,
    trackId,
    playedAt: Timestamp.now(),
  });
}

export async function fetchUserHistory(userId: string, limitCount = 50): Promise<HistoryEntry[]> {
  const q = query(collection(db, 'history'), where('userId', '==', userId), orderBy('playedAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: data.trackId as string, playedAt: (data.playedAt as Timestamp).toMillis() };
  });
}

// ── Downloads ──────────────────────────────────────────────────────────

export async function fetchDownloadedTrackIds(userId: string): Promise<string[]> {
  const q = query(collection(db, 'downloads'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().trackId as string);
}

export async function toggleDownload(userId: string, trackId: string): Promise<boolean> {
  const dlId = `${userId}_${trackId}`;
  const snap = await getDoc(doc(db, 'downloads', dlId));
  if (snap.exists()) {
    await deleteDoc(doc(db, 'downloads', dlId));
    return false;
  }
  await setDoc(doc(db, 'downloads', dlId), { userId, trackId, createdAt: Timestamp.now() });
  return true;
}

// ── Podcasts & Episodes (deprecated, kept for interface compatibility) ──

export async function fetchPodcasts() { return []; }
export async function fetchEpisodes(_podcastId: string) { return []; }

// ── Artists & Albums (deprecated, kept for interface compatibility) ────

export async function fetchArtists() { return []; }
export async function fetchArtistById(_id: string) { return null; }
export async function fetchAlbums() { return []; }
export async function fetchAlbumById(_id: string) { return null; }
