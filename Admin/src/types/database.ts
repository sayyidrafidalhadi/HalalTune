export type UserRole = 'superadmin' | 'admin' | 'moderator' | 'creator' | 'user';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_banned: boolean;
  is_verified_creator: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  image_url: string | null;
  cover_url: string | null;
  user_id: string | null;
  is_verified: boolean;
  monthly_listeners: number;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  artist_id: string;
  release_date: string | null;
  track_count: number;
  total_duration: number;
  is_halal_certified: boolean;
  created_at: string;
  updated_at: string;
  artist?: Artist;
  tracks?: Track[];
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  audio_url: string;
  cover_url: string | null;
  duration: number;
  artist_id: string;
  album_id: string | null;
  category_id: string | null;
  lyrics: string | null;
  tags: string[];
  is_halal: boolean;
  is_published: boolean;
  plays_count: number;
  release_date: string | null;
  created_at: string;
  updated_at: string;
  artist?: Artist;
  album?: Album;
  category?: Category;
}

export interface Playlist {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  user_id: string;
  is_featured: boolean;
  is_public: boolean;
  is_approved: boolean;
  track_count: number;
  created_at: string;
  updated_at: string;
  user?: Profile;
  tracks?: Track[];
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_id: string;
  position: number;
  added_at: string;
  track?: Track;
}

export interface Podcast {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  author_id: string;
  category_id: string | null;
  is_published: boolean;
  episode_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: Category;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  podcast_id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: number;
  cover_url: string | null;
  episode_number: number | null;
  is_published: boolean;
  plays_count: number;
  created_at: string;
  updated_at: string;
  podcast?: Podcast;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  track_id: string | null;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
  reported_user?: Profile;
  track?: Track;
  reviewer?: Profile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  track_id: string | null;
  artist_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_listeners: number;
  streams_today: number;
  total_tracks: number;
  total_artists: number;
  total_albums: number;
  total_playlists: number;
  total_podcasts: number;
  pending_reports: number;
}

export interface TopTrack {
  id: string;
  title: string;
  plays_count: number;
  artist_name: string;
  cover_url: string | null;
}

export interface TopArtist {
  id: string;
  name: string;
  monthly_listeners: number;
  image_url: string | null;
}

export interface RetentionMetric {
  date: string;
  new_users: number;
  active_users: number;
  retention_rate: number;
}

export interface StreamMetric {
  date: string;
  streams: number;
  unique_listeners: number;
}
