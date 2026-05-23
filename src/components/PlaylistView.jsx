import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from '../store/AuthContext';
import TrackList from './TrackList';
import { motion } from 'framer-motion';

function escHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function PlaylistView({ playlist, onClose }) {
  const { user, allTracks } = useAuth();
  const [activePlaylist, setActivePlaylist] = useState(playlist);
  const [trackObjs, setTrackObjs] = useState([]);

  useEffect(() => {
    if (!playlist?.id) return;
    const unsub = db.collection('playlists').doc(playlist.id).onSnapshot((doc) => {
      if (doc.exists) {
        const data = { id: doc.id, ...doc.data() };
        setActivePlaylist(data);
        const ids = data.tracks || [];
        setTrackObjs(ids.map((id) => allTracks.find((t) => t.id === id)).filter(Boolean));
      }
    });
    return () => unsub();
  }, [playlist.id, allTracks]);

  if (!playlist) return null;

  const isOwner = user && activePlaylist.ownerId === user.uid;
  const visText = activePlaylist.visibility === 'private' ? '🔒 Private' : '🌐 Public';

  const handleDelete = () => {
    if (!isOwner) return;
    if (confirm('Delete playlist "' + activePlaylist.name + '"?')) {
      db.collection('playlists').doc(activePlaylist.id).delete().then(() => {
        onClose();
      });
    }
  };

  return (
    <motion.div 
      className="legal-page" 
      style={{ display: 'flex' }}
      initial={{ x: '100%', opacity: 0.95 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.95 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
    >
      <div className="legal-header">
        <button className="legal-back-btn" onClick={onClose} aria-label="Back"><i className="fa-solid fa-arrow-left"></i></button>
        <h2 id="plv-title">{activePlaylist.name}</h2>
        {isOwner && (
          <button className="legal-back-btn" style={{ marginLeft: 'auto' }} onClick={handleDelete} aria-label="Delete playlist">
            <i className="fa-solid fa-trash-can" style={{ color: '#ff4444' }}></i>
          </button>
        )}
      </div>
      <div className="plv-meta">
        <div className="plv-meta-inner">
          <span>{visText} · {activePlaylist.trackCount || 0} songs</span>
          {activePlaylist.description && <p>{escHtml(activePlaylist.description)}</p>}
        </div>
      </div>
      <div className="yt-track-list" style={{ padding: '0 14px 80px' }}>
        {trackObjs.length > 0
          ? <TrackList tracks={trackObjs} fullQueue={trackObjs} currentTab="playlist" playlist={activePlaylist} />
          : <p style={{ textAlign: 'center', color: '#555', padding: '30px 0' }}>This playlist is empty.</p>}
      </div>
    </motion.div>
  );
}
