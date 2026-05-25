import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Music, 
  Search,
  Plus,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Mic2,
  Image as ImageIcon
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

import { uploadToCloudinary } from "@/lib/cloudinary";
import { addDoc, serverTimestamp } from "firebase/firestore";

export function Artists() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // New Artist Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, "artists"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArtists(docs);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleCreateArtist = async () => {
    if (!name) return;
    setUploading(true);
    try {
      let photoUrl = "";
      if (photo) {
        const result = await uploadToCloudinary(photo, "image");
        photoUrl = result.secure_url;
      }

      await addDoc(collection(db, "artists"), {
        name,
        email,
        bio,
        photoUrl,
        isVerified: false,
        followerCount: 0,
        trackCount: 0,
        createdAt: serverTimestamp()
      });

      setIsModalOpen(false);
      setName("");
      setEmail("");
      setBio("");
      setPhoto(null);
    } catch (err) {
      alert("Failed to create artist");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
            Artist Management
          </h1>
          <p className="text-white/40 mt-2 font-medium">Manage verified creators and their profiles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-black cinematic-shadow hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" /> Add New Artist
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Tracks</TableHead>
              <TableHead>Followers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing Artists...</p>
                </TableCell>
              </TableRow>
            ) : artists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <Mic2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 font-medium">No artists found in the database.</p>
                </TableCell>
              </TableRow>
            ) : artists.map((artist) => (
              <TableRow key={artist.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 overflow-hidden flex items-center justify-center">
                      {artist.photoUrl ? <img src={artist.photoUrl} className="w-full h-full object-cover" /> : <Mic2 className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-primary transition-colors">{artist.name}</p>
                      <p className="text-xs text-white/40">{artist.email || 'No email provided'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={artist.isVerified ? "halal" : "secondary"}>
                    {artist.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{artist.trackCount || 0}</TableCell>
                <TableCell className="font-medium">{artist.followerCount || 0}</TableCell>
                <TableCell className="text-right">
                  <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <MoreVertical className="w-4 h-4 text-white/40" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Artist">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative group w-24 h-24">
              <div className="w-full h-full rounded-[32px] border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                {photo ? <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-white/20" />}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => e.target.files && setPhoto(e.target.files[0])}
                />
              </div>
              <p className="text-[10px] text-center font-bold text-white/40 uppercase mt-2">Profile Photo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Artist Name</label>
              <Input placeholder="e.g. Maher Zain" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email</label>
              <Input placeholder="artist@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Biography</label>
            <textarea 
              className="w-full h-24 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm focus:border-primary/50 outline-none transition-all resize-none"
              placeholder="Tell us about the artist..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button 
            onClick={handleCreateArtist}
            disabled={uploading || !name}
            className="w-full py-4 rounded-2xl bg-primary text-black font-black cinematic-shadow hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {uploading ? "Uploading to Cloudinary..." : "Register Artist"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
