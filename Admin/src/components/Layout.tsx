import { Outlet } from 'react-router-dom';
import { Sidebar, Navbar, CommandPalette } from './ui';
import { useUIStore } from '@/store';

export function Layout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-amoled text-white">
      <Sidebar />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
      >
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
