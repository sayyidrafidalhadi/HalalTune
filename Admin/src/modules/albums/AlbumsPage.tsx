import { useState } from 'react';
import { Disc3, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Button, Modal, ConfirmDialog, StatusBadge, EmptyState } from '@/components/ui';
import { useAlbums, useCreateAlbum, useUpdateAlbum, useDeleteAlbum, useArtists } from '@/hooks';
import { formatDate } from '@/lib/utils';
import type { Album } from '@/types';

export function AlbumsPage() {
  const { data: albums, isLoading } = useAlbums();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { mutateAsync: createAlbum } = useCreateAlbum();
  const { mutateAsync: updateAlbum } = useUpdateAlbum();
  const { mutateAsync: deleteAlbum } = useDeleteAlbum();

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (album: Album) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center overflow-hidden">
            {album.cover_url ? (
              <img src={album.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Disc3 size={14} className="text-text-secondary" />
            )}
          </div>
          <div>
            <p className="text-white font-medium">{album.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'artist',
      header: 'Artist',
      render: (album: Album) => (
        <span className="text-text-secondary">{album.artist?.name || '-'}</span>
      ),
    },
    {
      key: 'track_count',
      header: 'Tracks',
      render: (album: Album) => (
        <span className="text-text-secondary">{album.track_count}</span>
      ),
    },
    {
      key: 'is_halal_certified',
      header: 'Halal',
      render: (album: Album) => (
        <StatusBadge status={album.is_halal_certified ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'release_date',
      header: 'Released',
      render: (album: Album) => (
        <span className="text-text-secondary">{album.release_date ? formatDate(album.release_date) : '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (album: Album) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setEditingAlbum(album); setModalOpen(true); }}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(album.id); }}
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
          <h1 className="text-2xl font-bold text-white">Albums</h1>
          <p className="text-text-secondary text-sm mt-1">Manage music albums</p>
        </div>
        <Button onClick={() => { setEditingAlbum(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Album
        </Button>
      </div>

      {albums?.length === 0 && !isLoading ? (
        <EmptyState icon={Disc3} title="No albums yet" description="Start by adding your first album" />
      ) : (
        <DataTable
          columns={columns}
          data={albums || []}
          keyExtractor={(a) => a.id}
          isLoading={isLoading}
          searchKeys={['title']}
        />
      )}

      <AlbumFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingAlbum(null); }}
        album={editingAlbum}
        onSave={async (data) => {
          if (editingAlbum) {
            await updateAlbum({ id: editingAlbum.id, updates: data });
          } else {
            await createAlbum(data);
          }
          setModalOpen(false);
          setEditingAlbum(null);
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (deleteConfirm) {
            await deleteAlbum(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Delete Album"
        message="Are you sure you want to delete this album? This action cannot be undone."
      />
    </div>
  );
}

function AlbumFormModal({ isOpen, onClose, album, onSave }: {
  isOpen: boolean; onClose: () => void; album: Album | null;
  onSave: (data: Partial<Album>) => Promise<void>;
}) {
  const { data: artists } = useArtists();
  const [form, setForm] = useState<Partial<Album>>(
    album || { title: '', artist_id: '', cover_url: '', is_halal_certified: false }
  );
  const [saving, setSaving] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={album ? 'Edit Album' : 'Add Album'} size="md">
      <form onSubmit={async (e) => {
        e.preventDefault(); setSaving(true);
        await onSave(form); setSaving(false);
      }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
          <input type="text" required value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Artist</label>
          <select value={form.artist_id || ''}
            onChange={(e) => setForm({ ...form, artist_id: e.target.value })}
            className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50">
            <option value="">Select artist</option>
            {artists?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Cover URL</label>
          <input type="text" value={form.cover_url || ''}
            onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
            className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_halal_certified ?? false}
            onChange={(e) => setForm({ ...form, is_halal_certified: e.target.checked })}
            className="rounded border-border bg-surface" />
          <span className="text-sm text-white">Halal certified</span>
        </label>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={saving}>{album ? 'Update Album' : 'Create Album'}</Button>
        </div>
      </form>
    </Modal>
  );
}
