import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Music,
  Image as ImageIcon,
  X,
  Check,
  Info,
  Play,
  Pause,
  CloudUpload,
  Tag,
  ShieldCheck,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

import { uploadToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Metadata states
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("Nasheed (Vocals Only)");
  const [description, setDescription] = useState("");
  const [artwork, setArtwork] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const audioFile = newFiles.find(f => f.type.startsWith('audio/'));
      if (audioFile) {
        setAudioPreview(URL.createObjectURL(audioFile));
      }
    }
  };

  const startUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(10); // Start
    
    try {
      // 1. Upload Audio
      const audioFile = files[0];
      const audioResult = await uploadToCloudinary(audioFile, "video");
      setProgress(50);

      // 2. Upload Artwork if exists
      let artworkUrl = "";
      if (artwork) {
        const artworkResult = await uploadToCloudinary(artwork, "image");
        artworkUrl = artworkResult.secure_url;
      }
      setProgress(80);

      // 3. Save to Firestore
      await addDoc(collection(db, "tracks"), {
        title,
        artist,
        category,
        description,
        audioUrl: audioResult.secure_url,
        artworkUrl,
        duration: audioResult.duration,
        format: audioResult.format,
        createdAt: serverTimestamp(),
        status: "pending",
        halalVerified: false
      });

      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setFiles([]);
        setAudioPreview(null);
        setTitle("");
        setArtist("");
        setDescription("");
        setArtwork(null);
      }, 1000);

    } catch (err: any) {
      alert("Upload failed: " + err.message);
      setUploading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="secondary" className="mb-4">Creator Studio</Badge>
          <h1 className="text-3xl lg:text-5xl font-black tracking-tighter">Upload Content</h1>
          <p className="text-white/40 mt-3 text-base lg:text-lg font-medium">Distribute your nasheeds and recitations globally.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all text-sm lg:text-base">
            Save Draft
          </button>
          <button 
            disabled={files.length === 0 || uploading || !title || !artist}
            onClick={startUpload}
            className="flex-1 md:flex-none px-8 py-3 rounded-2xl bg-primary text-black font-black cinematic-shadow hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 text-sm lg:text-base"
          >
            {uploading ? "Uploading..." : "Publish Content"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <div 
            className={cn(
              "relative border-2 border-dashed rounded-[32px] p-12 transition-all group",
              files.length > 0 ? "border-primary/50 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
            )}
          >
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <CloudUpload className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Drag and drop your audio files</h3>
                <p className="text-white/40 text-sm mt-1">High-quality WAV, MP3, or FLAC (Max 50MB)</p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-3"
              >
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-white/5">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{file.name}</p>
                        <p className="text-[10px] text-white/40">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <Tag className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Content Metadata</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 ml-1">Track Title</label>
                <Input placeholder="Enter track title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 ml-1">Artist / Reciter</label>
                <Input placeholder="e.g. Maher Zain" value={artist} onChange={(e) => setArtist(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 ml-1">Category</label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Nasheed (Vocals Only)</option>
                  <option>Quran Recitation</option>
                  <option>Islamic Lecture</option>
                  <option>Dua / Azkar</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 ml-1">Language</label>
                <Input placeholder="e.g. Arabic, English" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white/60 ml-1">Description</label>
              <textarea 
                placeholder="Tell listeners about this content..."
                className="w-full min-h-[120px] rounded-2xl border border-white/10 bg-white/5 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold">Halal Verification Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["No Musical Instruments", "Pure Vocals", "Educational", "Child Friendly", "Inspirational"].map(tag => (
                  <button key={tag} className="px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all">
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6">
            <h3 className="text-xl font-bold">Track Artwork</h3>
            <div className="aspect-square w-full max-w-[300px] mx-auto relative group">
              <div className={cn(
                "absolute inset-0 rounded-[40px] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center group-hover:bg-white/[0.05] transition-all overflow-hidden",
                artwork && "border-solid border-primary/50 bg-primary/5"
              )}>
                {artwork ? (
                  <img src={URL.createObjectURL(artwork)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-white/20 mb-2" />
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Upload Cover</p>
                  </>
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*" 
                  onChange={(e) => e.target.files && setArtwork(e.target.files[0])}
                />
              </div>
            </div>
          </div>

          <div className="bg-amoled-elevated border border-white/10 rounded-[32px] p-8 space-y-6 relative overflow-hidden group">
            <h3 className="text-xl font-bold relative z-10">Audio Preview</h3>
            {audioPreview ? (
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-black cinematic-shadow hover:scale-110 active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                  </button>
                  <div className="flex-1 space-y-2">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ x: isPlaying ? "100%" : "0%" }}
                        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                        className="h-full w-full bg-primary/50"
                      />
                    </div>
                  </div>
                </div>
                <audio ref={audioRef} src={audioPreview} onEnded={() => setIsPlaying(false)} className="hidden" />
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center border border-white/5 rounded-2xl bg-black/20 italic text-white/20 text-sm">
                Upload audio to preview
              </div>
            )}
          </div>

          {uploading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/10 border border-primary/20 rounded-[32px] p-8 space-y-4"
            >
              <div className="h-3 w-full bg-primary/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary"
                />
              </div>
              <p className="text-right text-[10px] font-black text-primary">{Math.round(progress)}% COMPLETE</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
