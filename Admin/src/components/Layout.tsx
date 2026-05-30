import { Outlet, Navigate } from 'react-router-dom';
import { TopNav } from './ui';
import { useAuthStore } from '@/store';

export function Layout() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amoled flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-amoled text-white">
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-amoled/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold tracking-tight">
              <span className="text-emerald">Halal</span>Tune
            </span>
            <TopNav />
          </div>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
