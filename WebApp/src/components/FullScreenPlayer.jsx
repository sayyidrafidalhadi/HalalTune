import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import { usePlayer } from '../store/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';

function escHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export default function FullScreenPlayer() {
  const { likedSongIds, toggleLike, getCategory, allTracks } = useAuth();
  const {
    audio, currentTrack, currentQueue, currentTrackIndex, isPlaying, isShuffle, isRepeat,
    currentTime, duration, progress, fsOpen, setFsOpen,
    setIsShuffle, setIsRepeat, togglePlay, playNext, playPrev,
    setCurrentQueue, setCurrentTrackIndex,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState(null); // null | 'queue' | 'lyrics' | 'related'
  const [lyricsHtml, setLyricsHtml] = useState('');
  const [queueHtml, setQueueHtml] = useState('');
  const [relatedHtml, setRelatedHtml] = useState('');

  const isLiked = currentTrack ? likedSongIds.has(currentTrack.id) : false;
  const [showOptions, setShowOptions] = useState(false);

  // YTM Overhaul States
  const [playMode, setPlayMode] = useState('audio'); // 'audio' | 'video'
  const [sheetState, setSheetState] = useState('minimized'); // 'minimized' | 'medium' | 'expanded'
  const [activeSheetTab, setActiveSheetTab] = useState('queue'); // 'queue' | 'lyrics' | 'related'

  const videoStartTimeRef = useRef(null);
  const videoStartProgressRef = useRef(0);

  useEffect(() => {
    if (playMode === 'video' && isPlaying) {
      audio.pause();
      videoStartTimeRef.current = Date.now();
      videoStartProgressRef.current = audio.currentTime;
    } else if (playMode === 'audio') {
      if (videoStartTimeRef.current !== null) {
        const elapsed = (Date.now() - videoStartTimeRef.current) / 1000;
        const newTime = Math.min(videoStartProgressRef.current + elapsed, duration || audio.duration || 0);
        audio.currentTime = newTime;
        videoStartTimeRef.current = null;
        if (isPlaying) {
          audio.play().catch(() => {});
        }
      }
    }
  }, [playMode, isPlaying]);

  useEffect(() => {
    setPlayMode('audio');
    videoStartTimeRef.current = null;
  }, [currentTrack]);

  const updateQueue = useCallback(() => {
    let html = '<div class="q-title-header">Up Next</div>';
    if (!currentQueue.length || currentTrackIndex >= currentQueue.length - 1) {
      html += '<p class="lyrics-msg">End of queue.</p>';
    } else {
      for (let i = currentTrackIndex + 1, count = 0; i < currentQueue.length && count < 15; i++, count++) {
        const t = currentQueue[i];
        html += `<div class="q-item" data-qi="${i}">
          ${t.coverArt ? `<img src="${t.coverArt}" class="q-item-art">` : `<div class="q-item-art"><i class="fa-solid fa-music"></i></div>`}
          <div class="q-item-info"><span class="q-item-title">${escHtml(t.title)}</span><span class="q-item-artist">${escHtml(t.artist)}</span></div>
        </div>`;
      }
    }
    setQueueHtml(html);
  }, [currentQueue, currentTrackIndex]);

  const fetchLyrics = useCallback(async () => {
    if (!currentTrack) { setLyricsHtml('<p class="lyrics-msg">No track selected.</p>'); return; }
    setLyricsHtml('<p class="lyrics-msg">Searching for lyrics...</p>');
    const catKey = getCategory(currentTrack);

    if (catKey === 'malayalam') {
      const redirectUrl = currentTrack.lyricsRedirectUrl || '';
      const hasUrl = !!redirectUrl;
      const tag = hasUrl ? 'button' : 'div';
      const clickable = hasUrl ? 'thirunabi-chip thirunabi-chip-active' : 'thirunabi-chip';
      const arrowHtml = hasUrl ? '<i class="fa-solid fa-arrow-up-right-from-square tc-client-arrow"></i>' : '';
      setLyricsHtml(`<div class="thirunabi-chip-wrapper">
        <${tag} class="${clickable}"${hasUrl ? ' id="tc-chip"' : ''}>
          <div class="tc-client-icon"><i class="fa-solid fa-mosque"></i></div>
          <div class="tc-client-text">
            <span class="tc-client-title">Thirunabi Madh</span>
            <span class="tc-client-desc">${hasUrl ? 'Tap to open lyrics in Thirunabi Madh' : 'Lyrics available on Thirunabi Madh app'}</span>
          </div>
          ${arrowHtml}
        </${tag}>
        <p class="tc-client-note">Malayalam lyrics are provided by our partner app</p>
      </div>`);
      return;
    }

    if (currentTrack.lyrics && currentTrack.lyrics.trim()) {
      const badge = currentTrack.lyricsProvider
        ? `<div class="lyrics-provider-badge"><i class="fa-solid fa-music"></i> Lyrics provided by ${escHtml(currentTrack.lyricsProvider)}</div>`
        : '';
      setLyricsHtml(badge + `<pre class="lyrics-text">${escHtml(currentTrack.lyrics)}</pre>`);
      return;
    }

    try {
      const res = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(currentTrack.artist)}&track_name=${encodeURIComponent(currentTrack.title)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.plainLyrics) {
        setLyricsHtml(
          '<a href="https://lrclib.net" target="_blank" rel="noopener" class="lyrics-provider-badge"><i class="fa-solid fa-music"></i> Lyrics provided by LRCLib</a>' +
          `<pre class="lyrics-text">${escHtml(data.plainLyrics)}</pre>`
        );
      } else {
        setLyricsHtml('<p class="lyrics-msg">Lyrics not available for this track.</p>');
      }
    } catch {
      setLyricsHtml('<p class="lyrics-msg">Lyrics not available for this track.</p>');
    }
  }, [currentTrack, getCategory]);

  const updateRelated = useCallback(() => {
    if (!currentTrack) { setRelatedHtml(''); return; }
    let related = allTracks.filter((t) => t.artist === currentTrack.artist && t.id !== currentTrack.id);
    if (!related.length) related = allTracks.filter((t) => t.id !== currentTrack.id).sort(() => 0.5 - Math.random()).slice(0, 5);
    let html = '<div class="q-title-header">More Like This</div>';
    related.forEach((t) => {
      html += `<div class="q-item" data-related-id="${t.id}">
        ${t.coverArt ? `<img src="${t.coverArt}" class="q-item-art">` : `<div class="q-item-art"><i class="fa-solid fa-music"></i></div>`}
        <div class="q-item-info"><span class="q-item-title">${escHtml(t.title)}</span><span class="q-item-artist">${escHtml(t.artist)}</span></div>
      </div>`;
    });
    setRelatedHtml(html);
  }, [currentTrack, allTracks]);

  useEffect(() => {
    if (currentTrack) {
      updateQueue();
      fetchLyrics();
      updateRelated();
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!fsOpen) setActiveTab(null);
  }, [fsOpen]);

  useEffect(() => {
    if (activeTab === 'queue') updateQueue();
    if (activeTab === 'related') updateRelated();
    if (activeTab === 'lyrics') fetchLyrics();
  }, [activeTab, currentTrackIndex]);

  const handleTabToggle = (tab) => {
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      setActiveTab(tab);
    }
  };

  const handleQueueItem = (e) => {
    const item = e.target.closest('.q-item');
    if (!item) return;
    const idx = parseInt(item.dataset.qi);
    if (!isNaN(idx)) {
      setCurrentTrackIndex(idx);
      setCurrentQueue([...currentQueue]);
    }
  };

  const handleRelatedItem = (e) => {
    const item = e.target.closest('.q-item');
    if (!item || !item.dataset.relatedId) return;
    const id = item.dataset.relatedId;
    const idx = allTracks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      setCurrentQueue([...allTracks]);
      setCurrentTrackIndex(idx);
    }
  };

  const handleDownload = async () => {
    if (!currentTrack) return;
    const DL_CACHE = 'halaltune-downloads-v1';
    const DL_STORE = 'ht_downloads';
    try {
      const meta = JSON.parse(localStorage.getItem(DL_STORE) || '[]');
      if (meta.some((d) => d.id === currentTrack.id)) {
        const cache = await caches.open(DL_CACHE);
        await cache.delete(currentTrack.url);
        localStorage.setItem(DL_STORE, JSON.stringify(meta.filter((d) => d.id !== currentTrack.id)));
        alert('Removed from downloads');
        setShowOptions(false);
        return;
      }
      const cache = await caches.open(DL_CACHE);
      const response = await fetch(currentTrack.url);
      if (!response.ok) throw new Error('Network error');
      await cache.put(currentTrack.url, response);
      meta.unshift({
        id: currentTrack.id, title: currentTrack.title, artist: currentTrack.artist,
        coverArt: currentTrack.coverArt || '', url: currentTrack.url,
        language: currentTrack.language || '', savedAt: Date.now(),
      });
      localStorage.setItem(DL_STORE, JSON.stringify(meta));
      alert('✓ Saved for offline');
      setShowOptions(false);
    } catch {
      alert('Download failed');
    }
  };

  return (
    <>
      <motion.div
        className="fs-player"
        id="full-screen-player"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
        style={{ top: 0 }}
      >
        <div className="fs-header">
          <button className="fs-icon-btn" onClick={() => setFsOpen(false)}>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
          <button className="fs-icon-btn" onClick={() => setShowOptions(!showOptions)}>
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
        
        <div className={`fs-main-area${activeTab ? ' fs-tabs-active' : ''}`}>
          <AnimatePresence mode="wait">
            {!activeTab ? (
              <motion.div
                key="artwork"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: isPlaying ? 1.04 : 0.98,
                  boxShadow: isPlaying 
                    ? '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 120px rgba(255, 0, 0, 0.2)' 
                    : '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 100px rgba(255, 0, 0, 0.05)'
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  scale: { type: 'spring', damping: 15, stiffness: 100 },
                  default: { duration: 0.25, ease: 'easeOut' }
                }}
                className="fs-art-wrapper"
                id="fs-artwork-view"
              >
                {currentTrack?.coverArt ? (
                  <img src={currentTrack.coverArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="fs-art-placeholder"><i className="fa-solid fa-music"></i></div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="fs-tab-content-wrapper"
              >
                {activeTab === 'queue' && (
                  <div className="fs-scrollable-content" onClick={handleQueueItem} dangerouslySetInnerHTML={{ __html: queueHtml }} />
                )}
                {activeTab === 'lyrics' && (
                  <div className="fs-scrollable-content" dangerouslySetInnerHTML={{ __html: lyricsHtml }} />
                )}
                {activeTab === 'related' && (
                  <div className="fs-scrollable-content" onClick={handleRelatedItem} dangerouslySetInnerHTML={{ __html: relatedHtml }} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="fs-track-details">
          <div className="fs-info">
            <h2 id="fs-player-title">{currentTrack?.title || 'No track selected'}</h2>
            <p id="fs-player-artist">{currentTrack?.artist || '--'}</p>
          </div>
          <button className={`fs-like-btn${isLiked ? ' liked' : ''}`} onClick={() => currentTrack && toggleLike(currentTrack.id)}>
            <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
          </button>
        </div>

        <div className="fs-progress-wrapper">
          <input type="range" className="yt-slider" id="fs-progress-bar"
            value={progress} max="100"
            onChange={(e) => {
              if (!audio.src || !audio.duration) return;
              audio.currentTime = (parseFloat(e.target.value) / 100) * audio.duration;
            }}
          />
          <div className="fs-time-row">
            <span id="fs-current-time">{formatTime(currentTime)}</span>
            <span id="fs-total-time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="fs-controls">
          <button className={`fs-secondary-control${isShuffle ? ' active' : ''}`}
            onClick={() => setIsShuffle(!isShuffle)}>
            <i className="fa-solid fa-shuffle"></i>
          </button>
          <button className="fs-main-control" onClick={playPrev}>
            <i className="fa-solid fa-backward-step"></i>
          </button>
          <button className="fs-play-circle" onClick={togglePlay}>
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          <button className="fs-main-control" onClick={playNext}>
            <i className="fa-solid fa-forward-step"></i>
          </button>
          <button className={`fs-secondary-control${isRepeat ? ' active' : ''}`}
            onClick={() => setIsRepeat(!isRepeat)}>
            <i className="fa-solid fa-repeat"></i>
          </button>
        </div>

        <div className="fs-bubble-tabs">
          {['queue', 'lyrics', 'related'].map((tab) => (
            <button key={tab} className={`fs-bubble-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => handleTabToggle(tab)}>
              {tab === 'queue' ? 'Up Next' : tab === 'lyrics' ? 'Lyrics' : 'Related'}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showOptions && (
          <motion.div 
            className="options-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowOptions(false); }}
            style={{ display: 'flex' }}
          >
            <motion.div 
              className="options-content"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              <button onClick={handleDownload}>
                <i className="fa-solid fa-arrow-down-to-line"></i>
                <span>Download for offline</span>
              </button>
              <button onClick={() => { if (currentTrack) { const shareUrl = window.location.origin + window.location.pathname + '#song/' + currentTrack.id; navigator.clipboard?.writeText(shareUrl).then(() => alert('Link copied!')).catch(() => {}); } setShowOptions(false); }}>
                <i className="fa-solid fa-share-nodes"></i> Share Track
              </button>
              <button onClick={() => setShowOptions(false)} style={{ color: '#ff4d4d' }}>
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
