import { useState } from 'react';
import { Tags, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Button, Modal, ConfirmDialog, EmptyState } from '@/components/ui';
import { useCategories } from '@/hooks';
import { formatDate } from '@/lib/utils';
import type { Category } from '@/types';

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSave = async (data: Partial<Category>) => {
    const { db } = await import('@/services');
    if (editingCategory) {
      await db.updateCategory(editingCategory.id, data);
    } else {
      await db.createCategory(data);
    }
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = async (id: string) => {
    const { db } = await import('@/services');
    await db.deleteCategory(id);
    setDeleteConfirm(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (c: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center">
            <Tags size={14} className="text-text-secondary" />
          </div>
          <p className="text-white font-medium">{c.name}</p>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (c: Category) => <span className="text-text-secondary">{c.slug}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (c: Category) => (
        <span className="text-text-secondary text-sm">{c.description || '-'}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (c: Category) => <span className="text-text-secondary">{formatDate(c.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (c: Category) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setEditingCategory(c); setModalOpen(true); }}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(c.id); }}
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
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-text-secondary text-sm mt-1">Manage content categories</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {categories?.length === 0 && !isLoading ? (
        <EmptyState icon={Tags} title="No categories yet" description="Create categories to organize content" />
      ) : (
        <DataTable
          columns={columns}
          data={categories || []}
          keyExtractor={(c) => c.id}
          isLoading={isLoading}
          searchKeys={['name']}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingCategory(null); }}
        title={editingCategory ? 'Edit Category' : 'Add Category'} size="sm">
        <CategoryForm category={editingCategory} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingCategory(null); }} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
      />
    </div>
  );
}

function CategoryForm({ category, onSave, onClose }: {
  category: Category | null;
  onSave: (data: Partial<Category>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Category>>(
    category || { name: '', slug: '', description: '' }
  );
  const [saving, setSaving] = useState(false);

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      setSaving(true);
      await onSave({ ...form, slug: form.slug || form.name?.toLowerCase().replace(/\s+/g, '-') });
      setSaving(false);
    }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
        <input type="text" required value={form.name || ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Slug</label>
        <input type="text" required value={form.slug || ''}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50"
          placeholder="Auto-generated from name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
        <textarea rows={2} value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50 resize-none" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" isLoading={saving}>{category ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
