import { useState } from 'react';
import { Music, Trash2, ExternalLink } from 'lucide-react';
import { useTracks, useDeleteTrack } from '@/hooks';
import { useAuthStore } from '@/store';
import { DataTable, Button, EmptyState, ConfirmDialog } from '@/components/ui';
import { formatDuration } from '@/lib/utils';
import type { Track } from '@/types';

export function TracksPage() {
  const { data: tracks, isLoading } = useTracks();
  const { mutateAsync: deleteTrack } = useDeleteTrack();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (track: Track) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center overflow-hidden shrink-0">
            {track.cover_url ? (
              <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Music size={14} className="text-text-secondary" />
            )}
          </div>
          <span className="text-white font-medium truncate max-w-[200px]">{track.title}</span>
        </div>
      ),
    },
    {
      key: 'artist',
      header: 'Artist',
      sortable: true,
      render: (track: Track) => (
        <span className="text-text-secondary">{track.artist?.name || '-'}</span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      sortable: true,
      render: (track: Track) => (
        <span className="text-text-secondary">{formatDuration(track.duration)}</span>
      ),
    },
    {
      key: 'audio_url',
      header: 'Audio',
      render: (track: Track) => (
        <a
          href={track.audio_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald hover:text-emerald/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} />
        </a>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-14',
      render: (track: Track) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(track.id); }}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tracks</h1>
          <p className="text-text-secondary text-sm mt-0.5">All uploaded nasheeds and tracks</p>
        </div>
        <a href="/admin/upload">
          <Button>Upload New Track</Button>
        </a>
      </div>

      {tracks?.length === 0 && !isLoading ? (
        <EmptyState
          icon={Music}
          title="No tracks yet"
          description="Upload your first nasheed or track"
          action={
            <a href="/admin/upload">
              <Button>Upload Track</Button>
            </a>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={tracks || []}
          keyExtractor={(t) => t.id}
          isLoading={isLoading}
          searchKeys={['title', 'artist']}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (deleteConfirm) {
            await deleteTrack(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Delete Track"
        message="Are you sure you want to delete this track?"
      />
    </div>
  );
}
