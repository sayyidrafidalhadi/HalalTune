import { motion } from 'framer-motion';
import {
  Users, Music, Mic2, Disc3, ListMusic, Podcast,
  Flag, BarChart3, TrendingUp, Headphones,
} from 'lucide-react';
import { StatCard } from '@/components/ui';
import { useDashboardStats, useTopTracks, useTopArtists } from '@/hooks';
import { formatNumber } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Users, Music, Mic2, Disc3, ListMusic, Podcast, Flag, Headphones,
};

const statConfig = [
  { key: 'total_users', icon: 'Users', label: 'Total Users' },
  { key: 'active_listeners', icon: 'Headphones', label: 'Active Listeners' },
  { key: 'streams_today', icon: 'TrendingUp', label: 'Streams Today' },
  { key: 'total_tracks', icon: 'Music', label: 'Total Tracks' },
  { key: 'total_artists', icon: 'Mic2', label: 'Total Artists' },
  { key: 'total_albums', icon: 'Disc3', label: 'Total Albums' },
  { key: 'total_playlists', icon: 'ListMusic', label: 'Total Playlists' },
  { key: 'pending_reports', icon: 'Flag', label: 'Pending Reports' },
];

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Overview of your HalalTune ecosystem</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfig.map((cfg, i) => {
          const Icon = iconMap[cfg.icon as keyof typeof iconMap] || BarChart3;
          return (
            <motion.div
              key={cfg.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StatCard
                title={cfg.label}
                value={isLoading ? '...' : formatNumber((stats as Record<string, number>)?.[cfg.key] ?? 0)}
                icon={Icon as React.ComponentType<{ size?: number }>}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopTracksWidget />
        <TopArtistsWidget />
      </div>
    </div>
  );
}

function TopTracksWidget() {
  const { data: tracks, isLoading } = useTopTracks();

  return (
    <div className="glass rounded-xl p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Top Tracks</h2>
      <div className="space-y-3">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-surface-hover rounded-lg animate-pulse" />
        ))}
        {tracks?.map((track, i) => (
          <div key={track.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <span className="w-6 text-center text-sm font-medium text-text-muted">{i + 1}</span>
            <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center overflow-hidden">
              {track.cover_url ? (
                <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Music size={16} className="text-text-secondary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{track.title}</p>
              <p className="text-xs text-text-secondary truncate">{track.artist_name}</p>
            </div>
            <span className="text-sm text-text-secondary">{formatNumber(track.plays_count)} plays</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopArtistsWidget() {
  const { data: artists, isLoading } = useTopArtists();

  return (
    <div className="glass rounded-xl p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Top Artists</h2>
      <div className="space-y-3">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-surface-hover rounded-lg animate-pulse" />
        ))}
        {artists?.map((artist, i) => (
          <div key={artist.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <span className="w-6 text-center text-sm font-medium text-text-muted">{i + 1}</span>
            <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center overflow-hidden">
              {artist.image_url ? (
                <img src={artist.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Mic2 size={16} className="text-text-secondary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{artist.name}</p>
            </div>
            <span className="text-sm text-text-secondary">{formatNumber(artist.monthly_listeners)} listeners</span>
          </div>
        ))}
      </div>
    </div>
  );
}
