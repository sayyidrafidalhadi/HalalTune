import { useState } from 'react';
import { Mic2, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Button, Modal, ConfirmDialog, EmptyState, StatusBadge } from '@/components/ui';
import { useArtists, useCreateArtist, useUpdateArtist, useDeleteArtist } from '@/hooks';
import { formatNumber, formatDate } from '@/lib/utils';
import type { Artist } from '@/types';

export function ArtistsPage() {
  const { data: artists, isLoading } = useArtists();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { mutateAsync: createArtist } = useCreateArtist();
  const { mutateAsync: updateArtist } = useUpdateArtist();
  const { mutateAsync: deleteArtist } = useDeleteArtist();

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (artist: Artist) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-hover flex items-center justify-center overflow-hidden">
            {artist.image_url ? (
              <img src={artist.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Mic2 size={14} className="text-text-secondary" />
            )}
          </div>
          <div>
            <p className="text-white font-medium">{artist.name}</p>
            <p className="text-xs text-text-secondary">{artist.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'is_verified',
      header: 'Verified',
      render: (artist: Artist) => (
        <StatusBadge status={artist.is_verified ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'monthly_listeners',
      header: 'Listeners',
      sortable: true,
      render: (artist: Artist) => (
        <span className="text-text-secondary">{formatNumber(artist.monthly_listeners)}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (artist: Artist) => (
        <span className="text-text-secondary">{formatDate(artist.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (artist: Artist) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEditingArtist(artist); setModalOpen(true); }}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(artist.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400"
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
          <h1 className="text-2xl font-bold text-white">Artists</h1>
          <p className="text-text-secondary text-sm mt-1">Manage artists and creators</p>
        </div>
        <Button onClick={() => { setEditingArtist(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Artist
        </Button>
      </div>

      {artists?.length === 0 && !isLoading ? (
        <EmptyState icon={Mic2} title="No artists yet" description="Start by adding your first artist" />
      ) : (
        <DataTable
          columns={columns}
          data={artists || []}
          keyExtractor={(a) => a.id}
          isLoading={isLoading}
          searchKeys={['name']}
        />
      )}

      <ArtistFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingArtist(null); }}
        artist={editingArtist}
        onSave={async (data) => {
          if (editingArtist) {
            await updateArtist({ id: editingArtist.id, updates: data });
          } else {
            await createArtist(data);
          }
          setModalOpen(false);
          setEditingArtist(null);
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (deleteConfirm) {
            await deleteArtist(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Delete Artist"
        message="Are you sure you want to delete this artist? This action cannot be undone."
      />
    </div>
  );
}

function ArtistFormModal({
  isOpen, onClose, artist, onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist | null;
  onSave: (data: Partial<Artist>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Artist>>(
    artist || { name: '', bio: '', image_url: '', cover_url: '', is_verified: false }
  );
  const [saving, setSaving] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={artist ? 'Edit Artist' : 'Add Artist'} size="md">
      <form onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
      }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
          <input
            type="text" required
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
          <textarea
            rows={3}
            value={form.bio || ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Image URL</label>
            <input
              type="text"
              value={form.image_url || ''}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Cover URL</label>
            <input
              type="text"
              value={form.cover_url || ''}
              onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_verified ?? false}
            onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
            className="rounded border-border bg-surface"
          />
          <span className="text-sm text-white">Verified artist</span>
        </label>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={saving}>
            {artist ? 'Update Artist' : 'Create Artist'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
