import { useState } from 'react';
import { Music, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Button, Modal, ConfirmDialog, StatusBadge, EmptyState } from '@/components/ui';
import { useTracks, useCreateTrack, useUpdateTrack, useDeleteTrack, useArtists, useCategories } from '@/hooks';
import { formatDuration, formatDate } from '@/lib/utils';
import type { Track } from '@/types';

export function TracksPage() {
  const { data: tracks, isLoading } = useTracks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { mutateAsync: createTrack } = useCreateTrack();
  const { mutateAsync: updateTrack } = useUpdateTrack();
  const { mutateAsync: deleteTrack } = useDeleteTrack();

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (track: Track) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center overflow-hidden">
            {track.cover_url ? (
              <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Music size={14} className="text-text-secondary" />
            )}
          </div>
          <div>
            <p className="text-white font-medium">{track.title}</p>
            <p className="text-xs text-text-secondary">{track.artist?.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'artist',
      header: 'Artist',
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
      key: 'is_halal',
      header: 'Status',
      render: (track: Track) => (
        <StatusBadge status={track.is_halal ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'is_published',
      header: 'Published',
      render: (track: Track) => (
        <StatusBadge status={track.is_published ? 'published' : 'draft'} />
      ),
    },
    {
      key: 'plays_count',
      header: 'Plays',
      sortable: true,
      render: (track: Track) => <span className="text-text-secondary">{track.plays_count.toLocaleString()}</span>,
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (track: Track) => <span className="text-text-secondary">{formatDate(track.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (track: Track) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEditingTrack(track); setModalOpen(true); }}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(track.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
          >
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
          <h1 className="text-2xl font-bold text-white">Tracks</h1>
          <p className="text-text-secondary text-sm mt-1">Manage all tracks in the platform</p>
        </div>
        <Button onClick={() => { setEditingTrack(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Track
        </Button>
      </div>

      {tracks?.length === 0 && !isLoading ? (
        <EmptyState
          icon={Music}
          title="No tracks yet"
          description="Start by adding your first track"
        />
      ) : (
        <DataTable
          columns={columns}
          data={tracks || []}
          keyExtractor={(t) => t.id}
          isLoading={isLoading}
          searchKeys={['title']}
        />
      )}

      <TrackFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTrack(null); }}
        track={editingTrack}
        onSave={async (data) => {
          if (editingTrack) {
            await updateTrack({ id: editingTrack.id, updates: data });
          } else {
            await createTrack(data);
          }
          setModalOpen(false);
          setEditingTrack(null);
        }}
      />

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
        message="Are you sure you want to delete this track? This action cannot be undone."
      />
    </div>
  );
}

function TrackFormModal({
  isOpen, onClose, track, onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  onSave: (data: Partial<Track>) => Promise<void>;
}) {
  const { data: artists } = useArtists();
  const { data: categories } = useCategories();
  const [form, setForm] = useState<Partial<Track>>(
    track || {
      title: '', artist_id: '', album_id: '', category_id: '',
      duration: 0, is_halal: true, is_published: false, tags: [], lyrics: '',
    }
  );
  const [saving, setSaving] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={track ? 'Edit Track' : 'Add Track'} size="lg">
      <form onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
      }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
            <input
              type="text" required
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Artist</label>
            <select
              value={form.artist_id || ''}
              onChange={(e) => setForm({ ...form, artist_id: e.target.value })}
              className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
            >
              <option value="">Select artist</option>
              {artists?.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
            <select
              value={form.category_id || ''}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
            >
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Duration (seconds)</label>
            <input
              type="number" required min={1}
              value={form.duration || 0}
              onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Audio URL</label>
            <input
              type="text"
              value={form.audio_url || ''}
              onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
              className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
              placeholder="Upload audio via media manager"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Cover URL</label>
            <input
              type="text"
              value={form.cover_url || ''}
              onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
              placeholder="Upload cover via media manager"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_halal ?? true}
              onChange={(e) => setForm({ ...form, is_halal: e.target.checked })}
              className="rounded border-border bg-surface"
            />
            <span className="text-sm text-white">Halal certified</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published ?? false}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="rounded border-border bg-surface"
            />
            <span className="text-sm text-white">Published</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Lyrics</label>
          <textarea
            rows={4}
            value={form.lyrics || ''}
            onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
            className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={saving}>
            {track ? 'Update Track' : 'Create Track'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
