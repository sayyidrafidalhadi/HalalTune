import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, limit, where, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Track, Artist, Album, Playlist, Podcast, Episode,
  Report, Category, Profile, DashboardStats, TopTrack,
  TopArtist, RetentionMetric, StreamMetric,
} from '@/types';

function docToData<T>(snap: { id: string; data: () => Record<string, unknown> }): T {
  return { id: snap.id, ...snap.data() } as unknown as T;
}

async function getCollection<T>(name: string, orderField?: string, dir: 'asc' | 'desc' = 'desc'): Promise<T[]> {
  const ref = collection(db, name);
  const q = orderField ? query(ref, orderBy(orderField, dir)) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<T>(d));
}

export const db_ = {
  // Users
  async getUsers() { return getCollection<Profile>('users', 'created_at'); },
  async getUser(id: string) {
    const snap = await getDoc(doc(db, 'users', id));
    if (!snap.exists()) throw new Error('User not found');
    return docToData<Profile>(snap);
  },
  async updateUser(id: string, updates: Partial<Profile>) {
    await updateDoc(doc(db, 'users', id), { ...updates, updated_at: new Date().toISOString() });
    return this.getUser(id);
  },

  // Tracks
  async getTracks() {
    const tracks = await getCollection<Track>('tracks', 'created_at');
    return Promise.all(tracks.map(async (t) => ({
      ...t,
      artist: t.artist_id ? await this.getArtist(t.artist_id).catch(() => undefined) : undefined,
      album: t.album_id ? await this.getAlbum(t.album_id).catch(() => undefined) : undefined,
      category: t.category_id ? await this.getCategory(t.category_id).catch(() => undefined) : undefined,
    })));
  },
  async getTrack(id: string) {
    const snap = await getDoc(doc(db, 'tracks', id));
    if (!snap.exists()) throw new Error('Track not found');
    const t = docToData<Track>(snap);
    return {
      ...t,
      artist: t.artist_id ? await this.getArtist(t.artist_id).catch(() => undefined) : undefined,
      album: t.album_id ? await this.getAlbum(t.album_id).catch(() => undefined) : undefined,
      category: t.category_id ? await this.getCategory(t.category_id).catch(() => undefined) : undefined,
    };
  },
  async createTrack(track: Partial<Track>) {
    const ref = await addDoc(collection(db, 'tracks'), { ...track, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    return this.getTrack(ref.id);
  },
  async updateTrack(id: string, updates: Partial<Track>) {
    await updateDoc(doc(db, 'tracks', id), { ...updates, updated_at: new Date().toISOString() });
    return this.getTrack(id);
  },
  async deleteTrack(id: string) { await deleteDoc(doc(db, 'tracks', id)); },

  // Artists
  async getArtists() { return getCollection<Artist>('artists', 'created_at'); },
  async getArtist(id: string) {
    const snap = await getDoc(doc(db, 'artists', id));
    if (!snap.exists()) throw new Error('Artist not found');
    return docToData<Artist>(snap);
  },
  async createArtist(artist: Partial<Artist>) {
    const ref = await addDoc(collection(db, 'artists'), { ...artist, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    return this.getArtist(ref.id);
  },
  async updateArtist(id: string, updates: Partial<Artist>) {
    await updateDoc(doc(db, 'artists', id), { ...updates, updated_at: new Date().toISOString() });
    return this.getArtist(id);
  },
  async deleteArtist(id: string) { await deleteDoc(doc(db, 'artists', id)); },

  // Albums
  async getAlbums() {
    const albums = await getCollection<Album>('albums', 'created_at');
    return Promise.all(albums.map(async (a) => ({
      ...a,
      artist: a.artist_id ? await this.getArtist(a.artist_id).catch(() => undefined) : undefined,
    })));
  },
  async getAlbum(id: string) {
    const snap = await getDoc(doc(db, 'albums', id));
    if (!snap.exists()) throw new Error('Album not found');
    const a = docToData<Album>(snap);
    return { ...a, artist: a.artist_id ? await this.getArtist(a.artist_id).catch(() => undefined) : undefined };
  },
  async createAlbum(album: Partial<Album>) {
    const ref = await addDoc(collection(db, 'albums'), { ...album, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    return this.getAlbum(ref.id);
  },
  async updateAlbum(id: string, updates: Partial<Album>) {
    await updateDoc(doc(db, 'albums', id), { ...updates, updated_at: new Date().toISOString() });
    return this.getAlbum(id);
  },
  async deleteAlbum(id: string) { await deleteDoc(doc(db, 'albums', id)); },

  // Playlists
  async getPlaylists() {
    const playlists = await getCollection<Playlist>('playlists', 'created_at');
    return Promise.all(playlists.map(async (p) => ({
      ...p,
      user: p.user_id ? await this.getUser(p.user_id).catch(() => undefined) : undefined,
    })));
  },
  async updatePlaylist(id: string, updates: Partial<Playlist>) {
    await updateDoc(doc(db, 'playlists', id), { ...updates, updated_at: new Date().toISOString() });
    return this.getPlaylist(id);
  },
  async getPlaylist(id: string) {
    const snap = await getDoc(doc(db, 'playlists', id));
    if (!snap.exists()) throw new Error('Playlist not found');
    const p = docToData<Playlist>(snap);
    return { ...p, user: p.user_id ? await this.getUser(p.user_id).catch(() => undefined) : undefined };
  },
  async deletePlaylist(id: string) { await deleteDoc(doc(db, 'playlists', id)); },

  // Podcasts
  async getPodcasts() {
    const podcasts = await getCollection<Podcast>('podcasts', 'created_at');
    return Promise.all(podcasts.map(async (p) => ({
      ...p,
      author: p.author_id ? await this.getUser(p.author_id).catch(() => undefined) : undefined,
      category: p.category_id ? await this.getCategory(p.category_id).catch(() => undefined) : undefined,
    })));
  },
  async createPodcast(podcast: Partial<Podcast>) {
    const ref = await addDoc(collection(db, 'podcasts'), { ...podcast, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    return this.getPodcast(ref.id);
  },
  async getPodcast(id: string) {
    const snap = await getDoc(doc(db, 'podcasts', id));
    if (!snap.exists()) throw new Error('Podcast not found');
    const p = docToData<Podcast>(snap);
    return {
      ...p,
      author: p.author_id ? await this.getUser(p.author_id).catch(() => undefined) : undefined,
      category: p.category_id ? await this.getCategory(p.category_id).catch(() => undefined) : undefined,
    };
  },
  async updatePodcast(id: string, updates: Partial<Podcast>) {
    await updateDoc(doc(db, 'podcasts', id), { ...updates, updated_at: new Date().toISOString() });
    return this.getPodcast(id);
  },
  async deletePodcast(id: string) { await deleteDoc(doc(db, 'podcasts', id)); },

  // Episodes
  async getEpisodes(podcastId: string) {
    const ref = collection(db, 'episodes');
    const q = query(ref, where('podcast_id', '==', podcastId), orderBy('episode_number', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<Episode>(d));
  },
  async createEpisode(episode: Partial<Episode>) {
    const ref = await addDoc(collection(db, 'episodes'), { ...episode, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    return ref.id;
  },
  async updateEpisode(id: string, updates: Partial<Episode>) {
    await updateDoc(doc(db, 'episodes', id), { ...updates, updated_at: new Date().toISOString() });
  },
  async deleteEpisode(id: string) { await deleteDoc(doc(db, 'episodes', id)); },

  // Reports
  async getReports() {
    const reports = await getCollection<Report>('reports', 'created_at');
    return Promise.all(reports.map(async (r) => ({
      ...r,
      reporter: r.reporter_id ? await this.getUser(r.reporter_id).catch(() => undefined) : undefined,
      reported_user: r.reported_user_id ? await this.getUser(r.reported_user_id).catch(() => undefined) : undefined,
      reviewer: r.reviewed_by ? await this.getUser(r.reviewed_by).catch(() => undefined) : undefined,
      track: r.track_id ? await this.getTrack(r.track_id).catch(() => undefined) : undefined,
    })));
  },
  async updateReport(id: string, updates: Partial<Report>) {
    await updateDoc(doc(db, 'reports', id), { ...updates, updated_at: new Date().toISOString() });
  },

  // Categories
  async getCategories() {
    const ref = collection(db, 'categories');
    const q = query(ref, orderBy('name'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<Category>(d));
  },
  async getCategory(id: string) {
    const snap = await getDoc(doc(db, 'categories', id));
    if (!snap.exists()) throw new Error('Category not found');
    return docToData<Category>(snap);
  },
  async createCategory(category: Partial<Category>) {
    const ref = await addDoc(collection(db, 'categories'), { ...category, created_at: new Date().toISOString() });
    return this.getCategory(ref.id);
  },
  async updateCategory(id: string, updates: Partial<Category>) {
    await updateDoc(doc(db, 'categories', id), { ...updates, updated_at: new Date().toISOString() });
    return this.getCategory(id);
  },
  async deleteCategory(id: string) { await deleteDoc(doc(db, 'categories', id)); },

  // Dashboard / Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const [users, tracks, artists, albums, playlists, podcasts] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'tracks')),
      getDocs(collection(db, 'artists')),
      getDocs(collection(db, 'albums')),
      getDocs(collection(db, 'playlists')),
      getDocs(collection(db, 'podcasts')),
    ]);
    return {
      total_users: users.size,
      active_listeners: Math.floor(users.size * 0.3),
      streams_today: 0,
      total_tracks: tracks.size,
      total_artists: artists.size,
      total_albums: albums.size,
      total_playlists: playlists.size,
      total_podcasts: podcasts.size,
      pending_reports: 0,
    };
  },

  async getTopTracks(lim = 10): Promise<TopTrack[]> {
    const ref = collection(db, 'tracks');
    const q = query(ref, orderBy('plays_count', 'desc'), limit(lim));
    const snap = await getDocs(q);
    return Promise.all(snap.docs.map(async (d) => {
      const t = d.data();
      const artist = t.artist_id ? await this.getArtist(t.artist_id as string).catch(() => null) : null;
      return { id: d.id, title: t.title as string, plays_count: (t.plays_count as number) || 0, artist_name: artist?.name || '', cover_url: (t.cover_url as string) || null };
    }));
  },

  async getTopArtists(lim = 10): Promise<TopArtist[]> {
    const ref = collection(db, 'artists');
    const q = query(ref, orderBy('monthly_listeners', 'desc'), limit(lim));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const a = d.data();
      return { id: d.id, name: a.name as string, monthly_listeners: (a.monthly_listeners as number) || 0, image_url: (a.image_url as string) || null };
    });
  },

  async getRetentionMetrics(_days = 30): Promise<RetentionMetric[]> { return []; },
  async getStreamMetrics(_days = 30): Promise<StreamMetric[]> { return []; },
};
