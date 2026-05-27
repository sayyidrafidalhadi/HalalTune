import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass rounded-xl p-5 hover:bg-white/[0.05] transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs flex items-center gap-1',
              trend.positive ? 'text-emerald' : 'text-red-400'
            )}>
              <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-text-muted">vs last month</span>
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-emerald/10 border border-emerald/20">
          <Icon size={22} className="text-emerald" />
        </div>
      </div>
    </motion.div>
  );
}
