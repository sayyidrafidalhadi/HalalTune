import { useState } from 'react';
import { Podcast, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Button, Modal, ConfirmDialog, StatusBadge, EmptyState } from '@/components/ui';
import { usePodcasts, useCategories } from '@/hooks';
import { formatDate } from '@/lib/utils';
import type { Podcast as PodcastType } from '@/types';

export function PodcastsPage() {
  const { data: podcasts, isLoading } = usePodcasts();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (p: PodcastType) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center overflow-hidden">
            {p.cover_url ? (
              <img src={p.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Podcast size={14} className="text-text-secondary" />
            )}
          </div>
          <div>
            <p className="text-white font-medium">{p.title}</p>
            <p className="text-xs text-text-secondary">{p.author?.display_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p: PodcastType) => (
        <span className="text-text-secondary">{p.category?.name || '-'}</span>
      ),
    },
    {
      key: 'episode_count',
      header: 'Episodes',
      render: (p: PodcastType) => <span className="text-text-secondary">{p.episode_count}</span>,
    },
    {
      key: 'is_published',
      header: 'Status',
      render: (p: PodcastType) => (
        <StatusBadge status={p.is_published ? 'published' : 'draft'} />
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (p: PodcastType) => <span className="text-text-secondary">{formatDate(p.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (p: PodcastType) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); }}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Podcasts</h1>
          <p className="text-text-secondary text-sm mt-1">Manage podcasts and episodes</p>
        </div>
      </div>

      {podcasts?.length === 0 && !isLoading ? (
        <EmptyState icon={Podcast} title="No podcasts yet" />
      ) : (
        <DataTable
          columns={columns}
          data={podcasts || []}
          keyExtractor={(p) => p.id}
          isLoading={isLoading}
          searchKeys={['title']}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (deleteConfirm) {
            const { db } = await import('@/services');
            await db.deletePodcast(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Delete Podcast"
        message="Are you sure you want to delete this podcast?"
      />
    </div>
  );
}
