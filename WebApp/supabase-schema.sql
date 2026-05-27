-- Run this in Supabase SQL Editor to create all required tables

-- Users (profile data linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  role TEXT DEFAULT 'listener',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  url TEXT,
  cover_art TEXT,
  language TEXT,
  is_malayalam BOOLEAN DEFAULT FALSE,
  is_youtube BOOLEAN DEFAULT FALSE,
  youtube_id TEXT,
  stream_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  duration REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artists
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Albums
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  cover_art TEXT,
  release_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_art TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Podcasts
CREATE TABLE IF NOT EXISTS public.podcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  host TEXT,
  cover_art TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Episodes
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT,
  duration REAL,
  episode_number INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- History
CREATE TABLE IF NOT EXISTS public.history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Downloads
CREATE TABLE IF NOT EXISTS public.downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- RPC functions for atomic counters
CREATE OR REPLACE FUNCTION increment_stream_count(track_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.tracks SET stream_count = stream_count + 1 WHERE id = track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_like_count(track_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.tracks SET like_count = like_count + 1 WHERE id = track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_like_count(track_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.tracks SET like_count = GREATEST(0, like_count - 1) WHERE id = track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Allow public read access for content tables
CREATE POLICY "Public read" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.episodes FOR SELECT USING (true);

-- Users can read/update their own profile
CREATE POLICY "Users read own" ON public.users FOR SELECT USING (uid = auth.uid());
CREATE POLICY "Users insert own" ON public.users FOR INSERT WITH CHECK (uid = auth.uid());
CREATE POLICY "Users update own" ON public.users FOR UPDATE USING (uid = auth.uid());

-- Playlists: owners can CRUD, others can read public
CREATE POLICY "Public read playlists" ON public.playlists FOR SELECT USING (is_public OR owner_id = auth.uid());
CREATE POLICY "Owners insert playlists" ON public.playlists FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update playlists" ON public.playlists FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners delete playlists" ON public.playlists FOR DELETE USING (owner_id = auth.uid());

-- Likes/History/Downloads: users can CRUD their own
CREATE POLICY "Users manage likes" ON public.likes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage history" ON public.history FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage downloads" ON public.downloads FOR ALL USING (user_id = auth.uid());
