import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Music, Headphones,
} from 'lucide-react';
import { StatCard, Skeleton } from '@/components/ui';
import { useDashboardStats } from '@/hooks';
import { formatNumber } from '@/lib/utils';

export function AnalyticsPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-text-secondary text-sm mt-1">Detailed platform metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={isLoading ? '...' : formatNumber(stats?.total_users ?? 0)}
          icon={Users}
        />
        <StatCard
          title="Active Listeners"
          value={isLoading ? '...' : formatNumber(stats?.active_listeners ?? 0)}
          icon={Headphones}
        />
        <StatCard
          title="Streams Today"
          value={isLoading ? '...' : formatNumber(stats?.streams_today ?? 0)}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Tracks"
          value={isLoading ? '...' : formatNumber(stats?.total_tracks ?? 0)}
          icon={Music}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Stream Metrics</h2>
          <div className="h-64 flex items-center justify-center text-text-secondary">
            <p>Stream metrics chart will render here with Recharts</p>
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">User Retention</h2>
          <div className="h-64 flex items-center justify-center text-text-secondary">
            <p>Retention metrics chart will render here with Recharts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
