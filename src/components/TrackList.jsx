import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { usePlayer } from '../store/PlayerContext';
import { motion } from 'framer-motion';
import firebase, { db } from '../firebase';

const CATEGORIES = [
  { key: 'arabic', label: 'Arabic' },
  { key: 'malayalam', label: 'Malayalam' },
  { key: 'english', label: 'English' },
  { key: 'urdu', label: 'Urdu' },
  { key: 'others', label: 'Others' },
];

function escHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function TrackList({ tracks, fullQueue, currentTab: tab, playlist }) {
  const { likedSongIds, toggleLike, getCategory } = useAuth();
  const { currentTrack, playTrack } = usePlayer();
  const [activeMenu, setActiveMenu] = useState(null);

  if (!tracks || tracks.length === 0) {
    return <p style={{ textAlign: 'center', color: '#aaa', marginTop: 20 }}>No tracks found.</p>;
  }

  const handlePlay = (track, index) => {
    const queue = fullQueue || tracks;
    playTrack([...queue], index);
  };

  return (
    <div className="yt-track-list">
      {tracks.map((track, index) => {
        const isPlaying = currentTrack && currentTrack.id === track.id;
        const isLiked = likedSongIds.has(track.id);
        const catKey = getCategory(track);
        const catMeta = CATEGORIES.find((c) => c.key === catKey);
        const badge = (tab === 'all' || tab === 'categories') && catMeta
          ? `<span class="lang-badge lang-badge-${catKey}">${catMeta.label.substring(0, 3).toUpperCase()}</span>`
          : '';

        return (
          <motion.div
            key={track.id}
            className={`yt-list-item${isPlaying ? ' active' : ''}`}
            onClick={(e) => {
              if (e.target.closest('.list-like-btn') || e.target.closest('.yt-context-menu-container')) return;
              handlePlay(track, index);
            }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ position: 'relative' }}
          >
            <div className="yt-list-art-wrapper">
              {track.coverArt
                ? <img src={track.coverArt} loading="lazy" alt="" />
                : <i className="fa-solid fa-music"></i>}
              <div className="yt-list-play-overlay">
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </div>
            </div>
            <div className="yt-list-meta">
              <h3>{escHtml(track.title)}</h3>
              <p>{escHtml(track.artist)}</p>
            </div>
            <div className="yt-list-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {badge && <span dangerouslySetInnerHTML={{ __html: badge }} />}
              <button
                className={`list-like-btn${isLiked ? ' liked' : ''}`}
                data-id={track.id}
                aria-label="Like"
                onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
              >
                <i className={`${isLiked ? 'fa-solid liked' : 'fa-regular'} fa-heart`}></i>
              </button>

              <div className="yt-context-menu-container">
                <button
                  className="yt-context-menu-trigger"
                  aria-label="More options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === track.id ? null : track.id);
                  }}
                >
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
                {activeMenu === track.id && (
                  <TrackContextMenu
                    track={track}
                    playlist={playlist}
                    onClose={() => setActiveMenu(null)}
                  />
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function TrackContextMenu({ track, playlist, onClose }) {
  const { currentQueue, currentTrackIndex, setCurrentQueue, showToast } = usePlayer();
  const { likedSongIds, toggleLike } = useAuth();

  useEffect(() => {
    const handleOutsideClick = () => onClose();
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [onClose]);

  const handlePlayNext = (e) => {
    e.stopPropagation();
    onClose();
    if (!currentQueue || currentQueue.length === 0) {
      setCurrentQueue([track]);
      showToast('Playing track: ' + track.title);
      return;
    }
    const newQueue = [...currentQueue];
    // Remove duplication of same song in queue close by if applicable, or just splice
    newQueue.splice(currentTrackIndex + 1, 0, track);
    setCurrentQueue(newQueue);
    showToast('Will play next: ' + track.title);
  };

  const handleAddToQueue = (e) => {
    e.stopPropagation();
    onClose();
    const newQueue = [...currentQueue];
    newQueue.push(track);
    setCurrentQueue(newQueue);
    showToast('Added to queue: ' + track.title);
  };

  const handleLikeToggle = (e) => {
    e.stopPropagation();
    toggleLike(track.id);
    onClose();
  };

  const handleAddToPlaylist = (e) => {
    e.stopPropagation();
    onClose();
    window.dispatchEvent(new CustomEvent('ht-open-playlist-select', { detail: { track } }));
  };

  const handleRemoveFromPlaylist = async (e) => {
    e.stopPropagation();
    onClose();
    if (!playlist) return;
    try {
      const plRef = db.collection('playlists').doc(playlist.id);
      await plRef.update({
        tracks: firebase.firestore.FieldValue.arrayRemove(track.id),
        trackCount: firebase.firestore.FieldValue.increment(-1),
      });
      showToast('Removed from playlist');
    } catch (err) {
      showToast('Failed to remove track: ' + err.message);
    }
  };

  const isLiked = likedSongIds.has(track.id);

  return (
    <div className="yt-context-menu" onClick={(e) => e.stopPropagation()}>
      <button className="yt-context-menu-item" onClick={handlePlayNext}>
        <i className="fa-solid fa-square-caret-right"></i> Play Next
      </button>
      <button className="yt-context-menu-item" onClick={handleAddToQueue}>
        <i className="fa-solid fa-list-music"></i> Add to Queue
      </button>
      <button className="yt-context-menu-item" onClick={handleLikeToggle}>
        <i className={`fa-solid ${isLiked ? 'fa-heart-crack' : 'fa-heart'}`}></i> {isLiked ? 'Unlike' : 'Like'}
      </button>
      <button className="yt-context-menu-item" onClick={handleAddToPlaylist}>
        <i className="fa-solid fa-folder-plus"></i> Add to Playlist
      </button>
      {playlist && (
        <button className="yt-context-menu-item" onClick={handleRemoveFromPlaylist} style={{ color: '#ff4444' }}>
          <i className="fa-solid fa-trash-can" style={{ color: '#ff4444' }}></i> Remove
        </button>
      )}
    </div>
  );
}
