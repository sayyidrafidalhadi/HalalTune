import { useState, useEffect, useRef, useCallback } from 'react';
import firebase, { db } from '../firebase';
import { useAuth } from '../store/AuthContext';
import TrackList from './TrackList';

function escHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function LibraryView({ openPlaylistView }) {
  const { user, allTracks, getLikedTracks } = useAuth();
  const [subTab, setSubTab] = useState('downloads');
  const bubbleRef = useRef(null);
  const navRef = useRef(null);

  const [playlists, setPlaylists] = useState([]);
  const [loadingPl, setLoadingPl] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [plName, setPlName] = useState('');
  const [plDesc, setPlDesc] = useState('');
  const [plVis, setPlVis] = useState('public');
  const [plError, setPlError] = useState('');
  const [showAddToPl, setShowAddToPl] = useState(false);

  const positionBubble = useCallback((animate) => {
    if (!navRef.current || !bubbleRef.current) return;
    const active = navRef.current.querySelector('.lib-liquid-btn.active');
    if (!active) return;
    if (animate) bubbleRef.current.classList.add('animated');
    bubbleRef.current.style.width = active.offsetWidth + 'px';
    bubbleRef.current.style.height = active.offsetHeight + 'px';
    bubbleRef.current.style.transform = 'translateX(' + active.offsetLeft + 'px)';
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => positionBubble(false));
  }, [subTab]);

  const loadPlaylists = useCallback(async () => {
    if (!user) return;
    setLoadingPl(true);
    try {
      const snap = await db.collection('playlists')
        .where('ownerId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();
      setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {}
    setLoadingPl(false);
  }, [user]);

  const createPlaylist = async () => {
    if (!plName.trim()) { setPlError('Please enter a name.'); return; }
    if (!user) return;
    try {
      await db.collection('playlists').add({
        name: plName.trim(), description: plDesc.trim(),
        visibility: plVis, ownerId: user.uid,
        ownerName: user.displayName || 'User',
        tracks: [], trackCount: 0, coverArt: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setShowCreate(false);
      setPlName('');
      setPlDesc('');
      setSubTab('playlists');
      loadPlaylists();
    } catch (err) {
      setPlError(err.message);
    }
  };

  useEffect(() => {
    if (subTab === 'playlists') loadPlaylists();
  }, [subTab]);

  const downloads = JSON.parse(localStorage.getItem('ht_downloads') || '[]');
  const downloadTracks = downloads.map((d) => ({
    id: d.id, title: d.title, artist: d.artist,
    coverArt: d.coverArt, url: d.url, language: d.language,
  }));

  const likedTracks = getLikedTracks();

  return (
    <>
      <div className="lib-liquid-nav-wrap">
        <div className="lib-liquid-nav" id="lib-liquid-nav" ref={navRef}>
          <div className="lib-liquid-bubble" id="lib-liquid-bubble" ref={bubbleRef}></div>
          {['downloads', 'playlists', 'liked'].map((tab) => (
            <button
              key={tab}
              className={`lib-liquid-btn${subTab === tab ? ' active' : ''}`}
              data-sub={tab}
              onClick={() => {
                setSubTab(tab);
                requestAnimationFrame(() => positionBubble(true));
              }}
            >
              {tab === 'downloads' ? 'Downloads' : tab === 'playlists' ? 'Playlists' : 'Liked'}
            </button>
          ))}
        </div>
      </div>

      {subTab === 'downloads' && (
        downloadTracks.length === 0 ? (
          <div className="dl-empty">
            <i className="fa-solid fa-arrow-down-to-line dl-empty-icon"></i>
            <p>No downloaded songs yet.</p>
            <p style={{ fontSize: '.8rem', color: '#555' }}>Tap ⋮ on any song to save it for offline.</p>
          </div>
        ) : (
          <TrackList tracks={downloadTracks} fullQueue={downloadTracks} currentTab="library" />
        )
      )}

      {subTab === 'liked' && (
        likedTracks.length === 0 ? (
          <div className="dl-empty">
            <i className="fa-solid fa-heart dl-empty-icon" style={{ color: '#ef4444' }}></i>
            <p>No liked songs yet.</p>
            <p style={{ fontSize: '.8rem', color: '#555' }}>Tap the heart on any song to save it here.</p>
          </div>
        ) : (
          <TrackList tracks={likedTracks} fullQueue={likedTracks} currentTab="library" />
        )
      )}

      {subTab === 'playlists' && (
        <>
          <div className="pl-create-row">
            <button className="pl-create-btn" onClick={() => setShowCreate(true)}>
              <i className="fa-solid fa-plus"></i> Create Playlist
            </button>
          </div>
          {loadingPl && <div className="pl-loading"><i className="fa-solid fa-spinner fa-spin"></i></div>}
          {playlists.length > 0 && (
            <>
              <div className="section-title-row">
                <h2 className="section-heading"><span className="section-dot"></span>My Playlists</h2>
              </div>
              <div className="pl-grid">
                {playlists.map((pl) => (
                  <div key={pl.id} className="pl-card" onClick={() => openPlaylistView(pl, playlists)}>
                    {pl.coverArt
                      ? <img src={pl.coverArt} className="pl-card-art" alt="" />
                      : <div className="pl-card-art pl-card-art-fallback"><i className="fa-solid fa-music"></i></div>}
                    <div className="pl-card-info">
                      <span className="pl-card-name">
                        {escHtml(pl.name)}
                        {pl.visibility === 'private' && <i className="fa-solid fa-lock pl-vis-icon"></i>}
                      </span>
                      <span className="pl-card-meta">{pl.trackCount || 0} songs</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {!loadingPl && playlists.length === 0 && (
            <div className="dl-empty">
              <i className="fa-solid fa-list-music dl-empty-icon"></i>
              <p>No playlists yet.</p>
              <p style={{ fontSize: '.8rem', color: '#555' }}>Create your first playlist above.</p>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <div className="modal-pl-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="modal-pl-sheet">
            <div className="modal-pl-header">
              <h3>New Playlist</h3>
              <button className="modal-pl-close" onClick={() => setShowCreate(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-pl-body">
              <input type="text" className="pl-input" placeholder="Playlist name" maxLength={60}
                value={plName} onChange={(e) => setPlName(e.target.value)} />
              <textarea className="pl-input pl-textarea" placeholder="Description (optional)" maxLength={200} rows={2}
                value={plDesc} onChange={(e) => setPlDesc(e.target.value)}></textarea>
              <div className="pl-visibility-row">
                <span className="pl-vis-label">Visibility</span>
                <div className="pl-vis-toggle">
                  <button className={`pl-vis-btn${plVis === 'public' ? ' active' : ''}`} onClick={() => setPlVis('public')}>
                    <i className="fa-solid fa-earth-asia"></i> Public
                  </button>
                  <button className={`pl-vis-btn${plVis === 'private' ? ' active' : ''}`} onClick={() => setPlVis('private')}>
                    <i className="fa-solid fa-lock"></i> Private
                  </button>
                </div>
              </div>
              {plError && <p className="pl-error">{plError}</p>}
              <button className="yt-primary-btn" style={{ marginTop: 14 }} onClick={createPlaylist}>Create Playlist</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
