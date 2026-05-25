import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Play,
  ShieldCheck,
  UserPlus,
  Trash2,
  ChevronRight,
  ExternalLink,
  Loader2
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

// Mock Data
const moderationItems = [
  {
    id: "TRK-001",
    type: "track",
    title: "Mercy to Mankind",
    creator: "Zain Bhikha",
    status: "pending",
    category: "Nasheed",
    date: "2024-05-20",
    risk: "low"
  },
  {
    id: "TRK-002",
    type: "track",
    title: "Path of Light",
    creator: "New Artist",
    status: "flagged",
    category: "Sufi",
    date: "2024-05-21",
    risk: "high"
  },
  {
    id: "USR-001",
    type: "creator",
    title: "Ahmed Al-Fadi",
    creator: "Self",
    status: "pending",
    category: "Creator Application",
    date: "2024-05-22",
    risk: "medium"
  },
  {
    id: "REP-001",
    type: "report",
    title: "Copyright Claim",
    creator: "Unknown",
    status: "urgent",
    category: "User Report",
    date: "2024-05-23",
    risk: "high"
  }
];

import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export function Moderation() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);

  React.useEffect(() => {
    const q = query(collection(db, "tracks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'track' // Defaulting to track for now
      }));
      setItems(fetchedItems);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "tracks", id), {
        status: "approved",
        halalVerified: true
      });
      setIsDetailModalOpen(false);
    } catch (err) {
      alert("Approval failed");
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("Are you sure you want to delete this track?")) {
      try {
        await deleteDoc(doc(db, "tracks", id));
        setIsDetailModalOpen(false);
      } catch (err) {
        alert("Rejection failed");
      }
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedItems(prev => 
      prev.length === items.length ? [] : items.map(i => i.id)
    );
  };

  const handleOpenDetail = (item: any) => {
    setActiveItem(item);
    setIsDetailModalOpen(true);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'flagged': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
            Moderation Hub
          </h1>
          <p className="text-white/40 mt-2 font-medium">Manage track approvals and community safety.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all w-64"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Approval Queue", count: items.filter(i => i.status === 'pending').length, icon: ShieldCheck, color: "text-emerald-500" },
          { label: "Total Tracks", count: items.length, icon: Play, color: "text-primary" },
          { label: "Creator Requests", count: 0, icon: UserPlus, color: "text-blue-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-all group">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/40">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        {selectedItems.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between"
          >
            <span className="text-sm font-bold text-primary">{selectedItems.length} items selected</span>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:opacity-90 transition-opacity">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve All
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:opacity-90 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected
              </button>
            </div>
          </motion.div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input 
                  type="checkbox" 
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-white/10 bg-white/5 checked:bg-primary"
                />
              </TableHead>
              <TableHead>Item Details</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-white/40 font-medium tracking-widest uppercase text-[10px]">Loading track queue...</p>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <p className="text-white/40 font-medium">No tracks found in the moderation queue.</p>
                </TableCell>
              </TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id} className="group cursor-pointer" onClick={() => handleOpenDetail(item)}>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="rounded border-white/10 bg-white/5 checked:bg-primary"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                      {item.artworkUrl ? <img src={item.artworkUrl} className="w-full h-full object-cover" /> : <Play className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-xs text-white/40">{item.artist}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium uppercase tracking-wider text-white/40">{item.type}</span>
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
                    getStatusStyle(item.status)
                  )}>
                    {item.status}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.halalVerified ? 'bg-emerald-500' : 'bg-amber-500'
                    )} />
                    <span className="text-xs capitalize">{item.halalVerified ? 'Verified' : 'Pending'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-white/40" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        title="Moderation Review"
      >
        {activeItem && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                {activeItem.artworkUrl ? <img src={activeItem.artworkUrl} className="w-full h-full object-cover" /> : <Play className="w-6 h-6 text-primary" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold">{activeItem.title}</h4>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold border uppercase",
                    getStatusStyle(activeItem.status)
                  )}>
                    {activeItem.status}
                  </span>
                </div>
                <p className="text-white/40 mt-1">By {activeItem.artist} • {activeItem.category}</p>
                <div className="flex items-center gap-4 mt-4 text-xs">
                  <a href={activeItem.audioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> Listen Track
                  </a>
                  <span className="text-white/20">|</span>
                  <span className="text-white/40 italic">ID: {activeItem.id}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Moderator Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleApprove(activeItem.id)}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 text-black font-bold hover:opacity-90 transition-opacity"
                >
                  <CheckCircle2 className="w-5 h-5" /> Approve Item
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors">
                  <ShieldCheck className="w-5 h-5" /> Halal Verify
                </button>
              </div>
              <button 
                onClick={() => handleReject(activeItem.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
              >
                <XCircle className="w-5 h-5" /> Reject & Remove
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
