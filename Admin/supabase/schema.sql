-- HalalTune Admin Database Schema (Migration)
-- Compatible with existing WebApp schema, only adds what's missing

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles enum (safe to create if not exists by checking first)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'moderator', 'creator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- NEW TABLES (only created if they don't exist)
-- ============================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist Tracks junction table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(uid) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES users(uid) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(uid) ON DELETE SET NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADD NEW COLUMNS TO EXISTING TABLES
-- ============================================================

-- Users table: existing uses (uid, display_name, email, photo_url, role, created_at, last_login)
-- Add admin columns if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_creator BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migrate role values to new enum if needed (safe cast)
ALTER TABLE users ALTER COLUMN role TYPE TEXT;

-- Tracks table: existing has (id, title, artist, url, cover_art, language, ...)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id) ON DELETE SET NULL;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES albums(id) ON DELETE SET NULL;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS lyrics TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_halal BOOLEAN DEFAULT TRUE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS plays_count INTEGER DEFAULT 0;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Artists table: existing has (id, name, image, bio, created_at)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(uid) ON DELETE SET NULL;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS monthly_listeners INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Albums table: existing has (id, title, artist_id, cover_art, release_year, created_at)
ALTER TABLE albums ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS track_count INTEGER DEFAULT 0;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS total_duration INTEGER DEFAULT 0;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS is_halal_certified BOOLEAN DEFAULT FALSE;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Playlists table: existing has (id, name, description, cover_art, is_public, owner_id, track_ids, created_at)
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(uid) ON DELETE CASCADE;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS track_count INTEGER DEFAULT 0;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill title from name if title is null
UPDATE playlists SET title = name WHERE title IS NULL AND name IS NOT NULL;

-- Podcasts table: existing has (id, title, host, cover_art, description, created_at)
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(uid) ON DELETE CASCADE;
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS episode_count INTEGER DEFAULT 0;
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Episodes table: existing has (id, podcast_id, title, audio_url, duration, episode_number, description, created_at)
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS plays_count INTEGER DEFAULT 0;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- INDEXES (IF NOT EXISTS)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_artist_id') THEN
    CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_album_id') THEN
    CREATE INDEX idx_tracks_album_id ON tracks(album_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_category_id') THEN
    CREATE INDEX idx_tracks_category_id ON tracks(category_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_is_halal') THEN
    CREATE INDEX idx_tracks_is_halal ON tracks(is_halal);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_is_published') THEN
    CREATE INDEX idx_tracks_is_published ON tracks(is_published);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_albums_artist_id') THEN
    CREATE INDEX idx_albums_artist_id ON albums(artist_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlists_user_id') THEN
    CREATE INDEX idx_playlists_user_id ON playlists(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlist_tracks_playlist_id') THEN
    CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlist_tracks_track_id') THEN
    CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_podcasts_author_id') THEN
    CREATE INDEX idx_podcasts_author_id ON podcasts(author_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_episodes_podcast_id') THEN
    CREATE INDEX idx_episodes_podcast_id ON episodes(podcast_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reports_reporter_id') THEN
    CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reports_status') THEN
    CREATE INDEX idx_reports_status ON reports(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analytics_events_event_type') THEN
    CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analytics_events_created_at') THEN
    CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_role') THEN
    CREATE INDEX idx_users_role ON users(role);
  END IF;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY (safe to re-run)
-- ============================================================
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (only if not exists)
-- ============================================================
DO $$ BEGIN
  -- Users policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all users') THEN
    CREATE POLICY "Admins can view all users" ON users FOR SELECT
      USING (EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND role IN ('superadmin', 'admin')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update users') THEN
    CREATE POLICY "Admins can update users" ON users FOR UPDATE
      USING (EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND role IN ('superadmin', 'admin')));
  END IF;

  -- Categories policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view categories') THEN
    CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage categories') THEN
    CREATE POLICY "Admins can manage categories" ON categories FOR ALL
      USING (EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND role IN ('superadmin', 'admin')));
  END IF;

  -- Reports policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reports') THEN
    CREATE POLICY "Users can create reports" ON reports FOR INSERT
      WITH CHECK (auth.uid() = reporter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own reports') THEN
    CREATE POLICY "Users can view own reports" ON reports FOR SELECT
      USING (auth.uid() = reporter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all reports') THEN
    CREATE POLICY "Admins can manage all reports" ON reports FOR ALL
      USING (EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND role IN ('superadmin', 'admin', 'moderator')));
  END IF;

  -- Analytics policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view analytics') THEN
    CREATE POLICY "Admins can view analytics" ON analytics_events FOR SELECT
      USING (EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND role IN ('superadmin', 'admin')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service can insert analytics') THEN
    CREATE POLICY "Service can insert analytics" ON analytics_events FOR INSERT WITH CHECK (TRUE);
  END IF;

  -- Playlist tracks policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage playlist tracks') THEN
    CREATE POLICY "Users can manage playlist tracks" ON playlist_tracks FOR ALL
      USING (EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND role IN ('superadmin', 'admin')))));
  END IF;
END $$;

-- ============================================================
-- TRIGGER for new user sync (safe to re-run)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (uid, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (uid) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
