import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar, Navbar, CommandPalette } from './ui';
import { useAuthStore } from '@/store';
import { useUIStore } from '@/store';

export function Layout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  if (isLoading) {
    return (
      <div className="h-screen bg-amoled flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

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
