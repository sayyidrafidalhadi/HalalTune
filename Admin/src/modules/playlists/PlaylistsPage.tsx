import { useState } from 'react';
import { ListMusic, Star, Trash2 } from 'lucide-react';
import { DataTable, Button, ConfirmDialog, StatusBadge, EmptyState } from '@/components/ui';
import { usePlaylists, usePlaylists as usePlaylistsData } from '@/hooks';
import { formatDate } from '@/lib/utils';
import type { Playlist } from '@/types';

export function PlaylistsPage() {
  const { data: playlists, isLoading } = usePlaylists();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (p: Playlist) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center overflow-hidden">
            {p.cover_url ? (
              <img src={p.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <ListMusic size={14} className="text-text-secondary" />
            )}
          </div>
          <div>
            <p className="text-white font-medium">{p.title}</p>
            <p className="text-xs text-text-secondary">{p.user?.display_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'is_featured',
      header: 'Featured',
      render: (p: Playlist) => p.is_featured ? <Star size={14} className="text-yellow-400" /> : null,
    },
    {
      key: 'is_public',
      header: 'Visibility',
      render: (p: Playlist) => <StatusBadge status={p.is_public ? 'published' : 'draft'} />,
    },
    {
      key: 'is_approved',
      header: 'Approved',
      render: (p: Playlist) => <StatusBadge status={p.is_approved ? 'published' : 'pending'} />,
    },
    {
      key: 'track_count',
      header: 'Tracks',
      render: (p: Playlist) => <span className="text-text-secondary">{p.track_count}</span>,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (p: Playlist) => <span className="text-text-secondary">{formatDate(p.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (p: Playlist) => (
        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id); }}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400">
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Playlists</h1>
          <p className="text-text-secondary text-sm mt-1">Manage featured and moderated playlists</p>
        </div>
      </div>

      {playlists?.length === 0 && !isLoading ? (
        <EmptyState icon={ListMusic} title="No playlists yet" />
      ) : (
        <DataTable
          columns={columns}
          data={playlists || []}
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
            await db.deletePlaylist(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist?"
      />
    </div>
  );
}
