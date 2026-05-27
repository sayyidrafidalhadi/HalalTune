import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  dismissed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  banned: 'bg-red-500/10 text-red-400 border-red-500/20',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  featured: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  superadmin: 'bg-red-500/10 text-red-400 border-red-500/20',
  admin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  moderator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  creator: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  user: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        statusStyles[status.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        className
      )}
    >
      {status}
    </span>
  );
}
