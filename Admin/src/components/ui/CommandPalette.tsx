import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command } from 'lucide-react';
import { useUIStore } from '@/store';
import {
  LayoutDashboard, Music, Mic2, Album, ListMusic,
  Podcast, Flag, Users, Tags, BarChart3, Settings,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard, Music, Mic2, Album, ListMusic,
  Podcast, Flag, Users, Tags, BarChart3, Settings,
};

const items = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
  { label: 'Tracks', path: '/admin/tracks', icon: 'Music' },
  { label: 'Artists', path: '/admin/artists', icon: 'Mic2' },
  { label: 'Albums', path: '/admin/albums', icon: 'Album' },
  { label: 'Playlists', path: '/admin/playlists', icon: 'ListMusic' },
  { label: 'Podcasts', path: '/admin/podcasts', icon: 'Podcast' },
  { label: 'Reports', path: '/admin/reports', icon: 'Flag' },
  { label: 'Users', path: '/admin/users', icon: 'Users' },
  { label: 'Categories', path: '/admin/categories', icon: 'Tags' },
  { label: 'Analytics', path: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    },
    [commandPaletteOpen, setCommandPaletteOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex].path);
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-lg glass rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={18} className="text-text-secondary" />
              <input
                autoFocus
                type="text"
                placeholder="Search pages..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyNavigation}
                className="flex-1 bg-transparent text-white placeholder-text-muted focus:outline-none text-sm"
              />
              <kbd className="px-1.5 py-0.5 text-xs rounded border border-border bg-surface-hover text-text-secondary">
                <Command size={12} className="inline" />K
              </kbd>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto">
              {filtered.map((item, i) => {
                const Icon = iconMap[item.icon];
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      i === selectedIndex
                        ? 'bg-emerald/10 text-emerald'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-white'
                    }`}
                  >
                    {Icon && <Icon size={16} />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="px-3 py-8 text-center text-text-secondary text-sm">No results found</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
