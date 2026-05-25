import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Tag,
  Plus,
  MoreVertical,
  Loader2,
  FolderOpen,
  Edit2,
  Trash2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", slug: "" });

  useEffect(() => {
    const q = query(collection(db, "categories"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(docs);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleCreate = async () => {
    if (!newCategory.name) return;
    try {
      await addDoc(collection(db, "categories"), {
        ...newCategory,
        createdAt: serverTimestamp(),
        itemCount: 0
      });
      setIsModalOpen(false);
      setNewCategory({ name: "", description: "", slug: "" });
    } catch (err) {
      alert("Failed to create category");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
            Category Manager
          </h1>
          <p className="text-white/40 mt-2 font-medium">Organize content into discoverable groups.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-black cinematic-shadow hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" /> Create Category
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Indexing Categories...</p>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <FolderOpen className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 font-medium">No categories defined yet.</p>
                </TableCell>
              </TableRow>
            ) : categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-bold text-white">{cat.name}</TableCell>
                <TableCell className="text-white/40 font-mono text-xs">{cat.slug}</TableCell>
                <TableCell className="text-white/60 text-sm max-w-xs truncate">{cat.description || 'No description'}</TableCell>
                <TableCell className="font-medium text-primary">{cat.itemCount || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
                      <Edit2 className="w-4 h-4 text-white/40" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Category">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Category Name</label>
            <Input 
              placeholder="e.g. Morning Nasheeds" 
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Slug</label>
            <Input 
              placeholder="morning-nasheeds" 
              value={newCategory.slug}
              onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              className="w-full h-32 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm outline-none focus:border-primary/50 transition-all resize-none"
              placeholder="Describe what belongs here..."
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
            />
          </div>
          <button 
            onClick={handleCreate}
            className="w-full py-4 rounded-2xl bg-primary text-black font-black cinematic-shadow hover:opacity-90 transition-opacity"
          >
            Create Category
          </button>
        </div>
      </Modal>
    </div>
  );
}
