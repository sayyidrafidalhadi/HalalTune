import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Music, Mic2, Album, ListMusic,
  Podcast, Flag, Users, Tags, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';
import { useAuth } from '@/hooks';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Music, label: 'Tracks', path: '/admin/tracks' },
  { icon: Mic2, label: 'Artists', path: '/admin/artists' },
  { icon: Album, label: 'Albums', path: '/admin/albums' },
  { icon: ListMusic, label: 'Playlists', path: '/admin/playlists' },
  { icon: Podcast, label: 'Podcasts', path: '/admin/podcasts' },
  { icon: Flag, label: 'Reports', path: '/admin/reports' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Tags, label: 'Categories', path: '/admin/categories' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { signOut } = useAuth();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      className="fixed left-0 top-0 h-screen bg-amoled border-r border-border z-50 flex flex-col"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold tracking-tight"
            >
              <span className="text-emerald">Halal</span>Tune
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-surface-hover hover:text-white group',
                isActive
                  ? 'bg-emerald/10 text-emerald border border-emerald/20'
                  : 'text-text-secondary'
              )
            }
          >
            <item.icon size={20} className="shrink-0" />
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={20} className="shrink-0" />
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
