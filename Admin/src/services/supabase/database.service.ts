import { supabase } from './client';
import type {
  Track, Artist, Album, Playlist, Podcast, Episode,
  Report, Category, Profile, DashboardStats, TopTrack,
  TopArtist, RetentionMetric, StreamMetric,
} from '@/types';

function mapUser(data: Record<string, unknown>): Profile {
  return { id: data.uid as string, ...data } as unknown as Profile;
}

export const db = {
  // Users
  async getUsers() {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapUser);
  },

  async getUser(id: string) {
    const { data, error } = await supabase.from('users').select('*').eq('uid', id).single();
    if (error) throw error;
    if (!data) throw new Error('User not found');
    return mapUser(data);
  },

  async updateUser(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase.from('users').update(updates).eq('uid', id).select().single();
    if (error) throw error;
    if (!data) throw new Error('User not found');
    return mapUser(data);
  },

  // Tracks
  async getTracks() {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, artist:artists(*), album:albums(*), category:categories(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Track[];
  },

  async getTrack(id: string) {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, artist:artists(*), album:albums(*), category:categories(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Track;
  },

  async createTrack(track: Partial<Track>) {
    const { data, error } = await supabase.from('tracks').insert(track).select().single();
    if (error) throw error;
    return data as Track;
  },

  async updateTrack(id: string, updates: Partial<Track>) {
    const { data, error } = await supabase.from('tracks').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Track;
  },

  async deleteTrack(id: string) {
    const { error } = await supabase.from('tracks').delete().eq('id', id);
    if (error) throw error;
  },

  // Artists
  async getArtists() {
    const { data, error } = await supabase.from('artists').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Artist[];
  },

  async getArtist(id: string) {
    const { data, error } = await supabase.from('artists').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Artist;
  },

  async createArtist(artist: Partial<Artist>) {
    const { data, error } = await supabase.from('artists').insert(artist).select().single();
    if (error) throw error;
    return data as Artist;
  },

  async updateArtist(id: string, updates: Partial<Artist>) {
    const { data, error } = await supabase.from('artists').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Artist;
  },

  async deleteArtist(id: string) {
    const { error } = await supabase.from('artists').delete().eq('id', id);
    if (error) throw error;
  },

  // Albums
  async getAlbums() {
    const { data, error } = await supabase
      .from('albums')
      .select('*, artist:artists(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Album[];
  },

  async getAlbum(id: string) {
    const { data, error } = await supabase
      .from('albums')
      .select('*, artist:artists(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Album;
  },

  async createAlbum(album: Partial<Album>) {
    const { data, error } = await supabase.from('albums').insert(album).select().single();
    if (error) throw error;
    return data as Album;
  },

  async updateAlbum(id: string, updates: Partial<Album>) {
    const { data, error } = await supabase.from('albums').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Album;
  },

  async deleteAlbum(id: string) {
    const { error } = await supabase.from('albums').delete().eq('id', id);
    if (error) throw error;
  },

  // Playlists
  async getPlaylists() {
    const { data, error } = await supabase
      .from('playlists')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Playlist[];
  },

  async updatePlaylist(id: string, updates: Partial<Playlist>) {
    const { data, error } = await supabase.from('playlists').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Playlist;
  },

  async deletePlaylist(id: string) {
    const { error } = await supabase.from('playlists').delete().eq('id', id);
    if (error) throw error;
  },

  // Podcasts
  async getPodcasts() {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*, author:users(*), category:categories(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Podcast[];
  },

  async createPodcast(podcast: Partial<Podcast>) {
    const { data, error } = await supabase.from('podcasts').insert(podcast).select().single();
    if (error) throw error;
    return data as Podcast;
  },

  async updatePodcast(id: string, updates: Partial<Podcast>) {
    const { data, error } = await supabase.from('podcasts').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Podcast;
  },

  async deletePodcast(id: string) {
    const { error } = await supabase.from('podcasts').delete().eq('id', id);
    if (error) throw error;
  },

  // Episodes
  async getEpisodes(podcastId: string) {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .order('episode_number', { ascending: false });
    if (error) throw error;
    return data as Episode[];
  },

  async createEpisode(episode: Partial<Episode>) {
    const { data, error } = await supabase.from('episodes').insert(episode).select().single();
    if (error) throw error;
    return data as Episode;
  },

  async updateEpisode(id: string, updates: Partial<Episode>) {
    const { data, error } = await supabase.from('episodes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Episode;
  },

  async deleteEpisode(id: string) {
    const { error } = await supabase.from('episodes').delete().eq('id', id);
    if (error) throw error;
  },

  // Reports
  async getReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*, reporter:users!reporter_id(*), reported_user:users!reported_user_id(*), track:tracks(*), reviewer:users!reviewed_by(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Report[];
  },

  async updateReport(id: string, updates: Partial<Report>) {
    const { data, error } = await supabase.from('reports').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Report;
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return data as Category[];
  },

  async createCategory(category: Partial<Category>) {
    const { data, error } = await supabase.from('categories').insert(category).select().single();
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  // Dashboard / Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const [users, tracks, artists, albums, playlists, podcasts, reports, streams] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('tracks').select('*', { count: 'exact', head: true }),
      supabase.from('artists').select('*', { count: 'exact', head: true }),
      supabase.from('albums').select('*', { count: 'exact', head: true }),
      supabase.from('playlists').select('*', { count: 'exact', head: true }),
      supabase.from('podcasts').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'stream'),
    ]);

    return {
      total_users: users.count || 0,
      active_listeners: Math.floor((users.count || 0) * 0.3),
      streams_today: streams.count || 0,
      total_tracks: tracks.count || 0,
      total_artists: artists.count || 0,
      total_albums: albums.count || 0,
      total_playlists: playlists.count || 0,
      total_podcasts: podcasts.count || 0,
      pending_reports: reports.count || 0,
    };
  },

  async getTopTracks(limit = 10): Promise<TopTrack[]> {
    const { data, error } = await supabase
      .from('tracks')
      .select('id, title, plays_count, artist:artists(name), cover_url')
      .order('plays_count', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as unknown as TopTrack[];
  },

  async getTopArtists(limit = 10): Promise<TopArtist[]> {
    const { data, error } = await supabase
      .from('artists')
      .select('id, name, monthly_listeners, image_url')
      .order('monthly_listeners', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as TopArtist[];
  },

  async getRetentionMetrics(days = 30): Promise<RetentionMetric[]> {
    const { data, error } = await supabase
      .rpc('get_retention_metrics', { days_param: days });
    if (error) throw error;
    return data as RetentionMetric[];
  },

  async getStreamMetrics(days = 30): Promise<StreamMetric[]> {
    const { data, error } = await supabase
      .rpc('get_stream_metrics', { days_param: days });
    if (error) throw error;
    return data as StreamMetric[];
  },
};
