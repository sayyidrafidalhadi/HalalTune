import { NavLink } from 'react-router-dom';
import { Upload, Music, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';

const links = [
  { icon: Music, label: 'Tracks', path: '/admin/tracks' },
  { icon: Upload, label: 'Upload', path: '/admin/upload' },
];

export function TopNav() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <div className="flex items-center gap-1">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-emerald/10 text-emerald'
                : 'text-text-secondary hover:bg-surface-hover hover:text-white'
            )
          }
        >
          <link.icon size={16} />
          {link.label}
        </NavLink>
      ))}
      <div className="ml-4 pl-4 border-l border-border flex items-center gap-3">
        <span className="text-xs text-text-secondary truncate max-w-[120px]">{user?.email}</span>
        <button
          onClick={signOut}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
