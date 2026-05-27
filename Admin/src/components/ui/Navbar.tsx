import { useAuthStore, useUIStore } from '@/store';
import { Search, Command } from 'lucide-react';

export function Navbar() {
  const { user } = useAuthStore();
  const { setCommandPaletteOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-amoled/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-white hover:border-emerald/30 transition-all w-72"
        >
          <Search size={16} />
          <span className="text-sm">Search anything...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-xs rounded border border-border bg-surface-hover">
            <Command size={12} className="inline" />K
          </kbd>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.display_name}</p>
              <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald/20 border border-emerald/30 flex items-center justify-center text-emerald text-sm font-semibold">
              {user?.display_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
