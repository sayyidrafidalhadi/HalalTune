import { useState, useEffect } from 'react';
import firebase, { db } from '../firebase';
import { useAuth } from '../store/AuthContext';
import { usePlayer } from '../store/PlayerContext';

export default function PlaylistSelectModal({ track, onClose }) {
  const { user } = useAuth();
  const { showToast } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [plName, setPlName] = useState('');
  const [plDesc, setPlDesc] = useState('');
  const [plVis, setPlVis] = useState('public');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = db.collection('playlists')
      .where('ownerId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snap) => {
        setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    return () => unsub();
  }, [user]);

  const handleSelectPlaylist = async (playlist) => {
    if (!user) return;
    try {
      const plRef = db.collection('playlists').doc(playlist.id);

      if (playlist.tracks && playlist.tracks.includes(track.id)) {
        showToast('Song is already in "' + playlist.name + '"');
        onClose();
        return;
      }

      await plRef.update({
        tracks: firebase.firestore.FieldValue.arrayUnion(track.id),
        trackCount: firebase.firestore.FieldValue.increment(1),
        coverArt: playlist.coverArt || track.coverArt || '',
      });

      showToast('Added to ' + playlist.name);
      onClose();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!plName.trim()) {
      setCreateError('Please enter a name.');
      return;
    }
    if (!user) return;
    try {
      await db.collection('playlists').add({
        name: plName.trim(),
        description: plDesc.trim(),
        visibility: plVis,
        ownerId: user.uid,
        ownerName: user.displayName || 'User',
        tracks: [track.id],
        trackCount: 1,
        coverArt: track.coverArt || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      showToast('Created playlist and added song');
      onClose();
    } catch (err) {
      setCreateError(err.message);
    }
  };

  return (
    <div className="pl-select-overlay" onClick={onClose}>
      <div className="pl-select-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="pl-select-header">
          <h3>{isCreating ? 'Create Playlist' : 'Add to Playlist'}</h3>
          <button className="pl-select-close" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="pl-select-body">
          {isCreating ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                className="pl-input"
                placeholder="Playlist name"
                maxLength={60}
                value={plName}
                onChange={(e) => setPlName(e.target.value)}
              />
              <textarea
                className="pl-input pl-textarea"
                placeholder="Description (optional)"
                maxLength={200}
                rows={2}
                value={plDesc}
                onChange={(e) => setPlDesc(e.target.value)}
              ></textarea>

              <div className="pl-visibility-row" style={{ margin: '8px 0' }}>
                <span className="pl-vis-label">Visibility</span>
                <div className="pl-vis-toggle">
                  <button
                    className={`pl-vis-btn${plVis === 'public' ? ' active' : ''}`}
                    onClick={() => setPlVis('public')}
                  >
                    <i className="fa-solid fa-earth-asia"></i> Public
                  </button>
                  <button
                    className={`pl-vis-btn${plVis === 'private' ? ' active' : ''}`}
                    onClick={() => setPlVis('private')}
                  >
                    <i className="fa-solid fa-lock"></i> Private
                  </button>
                </div>
              </div>

              {createError && <p className="pl-error">{createError}</p>}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  className="yt-primary-btn"
                  style={{ background: 'transparent', color: '#fff', border: '1px solid #444', flex: 1 }}
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button
                  className="yt-primary-btn"
                  style={{ flex: 1 }}
                  onClick={handleCreateAndAdd}
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="pl-select-item pl-select-create-btn" onClick={() => setIsCreating(true)}>
                <i className="fa-solid fa-plus pl-select-item-icon" style={{ color: 'inherit' }}></i>
                <span>New playlist...</span>
              </button>

              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.2rem', color: '#888' }}></i>
                </div>
              )}

              {!loading && playlists.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', padding: '20px 0', fontSize: '0.9rem' }}>
                  No playlists yet. Create one above!
                </p>
              )}

              {!loading && playlists.map((pl) => (
                <button
                  key={pl.id}
                  className="pl-select-item"
                  onClick={() => handleSelectPlaylist(pl)}
                >
                  <i className="fa-solid fa-list-music pl-select-item-icon"></i>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>{pl.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{pl.trackCount || 0} songs</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
