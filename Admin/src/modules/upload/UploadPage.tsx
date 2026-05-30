import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Music, ArrowLeft } from 'lucide-react';
import { FileUpload, Button } from '@/components/ui';
import { useCreateTrack } from '@/hooks';
import { db, uploadService } from '@/services';
import toast from 'react-hot-toast';

export function UploadPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: createTrack } = useCreateTrack();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !artistName || !audioUrl) {
      toast.error('Title, artist, and audio file are required');
      return;
    }

    setUploading(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const duration = 0;

      // Find or create artist
      const artists = await db.getArtists();
      let artistId = artists.find((a) => a.name.toLowerCase() === artistName.toLowerCase())?.id;
      if (!artistId) {
        const created = await db.createArtist({
          name: artistName,
          slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          bio: null,
          image_url: null,
          cover_url: null,
          user_id: null,
          is_verified: false,
          monthly_listeners: 0,
        });
        artistId = created.id;
      }

      await createTrack({
        title,
        slug,
        artist_id: artistId,
        audio_url: audioUrl,
        cover_url: coverUrl || null,
        duration,
        tags: [],
        category_id: null,
        album_id: null,
        lyrics: null,
        is_halal: true,
        is_published: true,
        release_date: null,
      });
      toast.success('Track uploaded successfully');
      setTitle('');
      setArtistName('');
      setAudioUrl('');
      setCoverUrl('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create track');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/tracks')} className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Track</h1>
          <p className="text-text-secondary text-sm mt-0.5">Add a new nasheed or Quran track</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 space-y-5"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Track Title *</label>
          <input
            type="text" required value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ya Nabi Salam Alayka"
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-emerald/50 transition-colors"
          />
        </div>

        {/* Artist */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Artist Name *</label>
          <input
            type="text" required value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="e.g. Maher Zain"
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-emerald/50 transition-colors"
          />
        </div>

        {/* Audio File */}
        <FileUpload
          accept="audio/*"
          label="Audio File *"
          type="audio"
          value={audioUrl}
          onChange={setAudioUrl}
        />

        {/* Cover Image */}
        <FileUpload
          accept="image/*"
          label="Cover Image (optional)"
          type="image"
          value={coverUrl}
          onChange={setCoverUrl}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button variant="secondary" type="button" onClick={() => navigate('/admin/tracks')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={uploading} disabled={!title || !artistName || !audioUrl}>
            <Upload size={16} /> Upload
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
