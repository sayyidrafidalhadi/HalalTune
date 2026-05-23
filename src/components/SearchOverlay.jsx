import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import TrackList from './TrackList';
import { motion } from 'framer-motion';
import { searchYoutube, isLocalBackendActive } from '../utils/youtube';

const SEARCH_HISTORY_MAX = 10;

function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem('ht_search_history') || '[]'); } catch { return []; }
}
function addSearchHistory(term) {
  if (!term.trim()) return;
  let hist = getSearchHistory().filter((h) => h.toLowerCase() !== term.toLowerCase());
  hist.unshift(term.trim());
  if (hist.length > SEARCH_HISTORY_MAX) hist = hist.slice(0, SEARCH_HISTORY_MAX);
  localStorage.setItem('ht_search_history', JSON.stringify(hist));
}
function removeSearchHistory(term) {
  const hist = getSearchHistory().filter((h) => h !== term);
  localStorage.setItem('ht_search_history', JSON.stringify(hist));
}

export default function SearchOverlay({ onClose }) {
  const { allTracks } = useAuth();
  const [term, setTerm] = useState('');
  const [ytResults, setYtResults] = useState([]);
  const [isSearchingYt, setIsSearchingYt] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setTerm('');
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    if (isLocalBackendActive() === false) {
      setIsBackendOffline(true);
    } else {
      setIsBackendOffline(false);
    }
  }, [ytResults, isSearchingYt]);

  const localTracks = allTracks.filter((t) => !t.isYoutube && !t.id.startsWith('yt_'));

  const localResults = term.trim()
    ? localTracks.filter((t) =>
        t.title.toLowerCase().includes(term.toLowerCase()) ||
        t.artist.toLowerCase().includes(term.toLowerCase()) ||
        (t.language || '').toLowerCase().includes(term.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (!term.trim()) {
      setYtResults([]);
      setIsSearchingYt(false);
      return;
    }

    setIsSearchingYt(true);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchYoutube(term);
        setYtResults(results);
      } catch (err) {
        console.error('Failed to search YouTube:', err);
      } finally {
        setIsSearchingYt(false);
      }
    }, 600);

    return () => clearTimeout(debounceTimer.current);
  }, [term]);

  const hist = getSearchHistory();

  const recentArtTracks = !term.trim()
    ? hist.map((h) => allTracks.find((t) =>
        t.title.toLowerCase().includes(h.toLowerCase()) ||
        t.artist.toLowerCase().includes(h.toLowerCase())
      )).filter(Boolean).slice(0, 6)
    : [];

  return (
    <motion.div
      className="search-overlay search-overlay-open"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.22, ease: [0.25, 0.8, 0.25, 1] }}
      style={{ display: 'flex' }}
    >
      <div className="search-overlay-bar">
        <button className="search-back-btn" onClick={onClose}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="search-overlay-input-wrap">
          <i className="fa-solid fa-magnifying-glass search-overlay-icon"></i>
          <input
            ref={inputRef}
            type="text"
            className="search-overlay-input"
            placeholder="Search songs, artists..."
            autoComplete="off"
            spellCheck="false"
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              if (e.target.value.trim()) addSearchHistory(e.target.value.trim());
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && term.trim()) {
                addSearchHistory(term.trim());
                inputRef.current?.blur();
              }
            }}
          />
          {term && (
            <button className="search-clear-btn" onClick={() => setTerm('')}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>
      <div className="search-overlay-body">
        {!term.trim() ? (
          <>
            {recentArtTracks.length > 0 && (
              <>
                <div className="so-recent-label">Recent searches</div>
                <div className="so-art-row">
                  {recentArtTracks.map((t) => (
                    <div key={t.id} className="so-art-card" onClick={() => setTerm(t.title)}>
                      {t.coverArt
                        ? <img src={t.coverArt} className="so-art-img" alt="" />
                        : <div className="so-art-img so-art-fallback"><i className="fa-solid fa-music"></i></div>}
                      <span className="so-art-label">{t.title}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {hist.length > 0 && hist.map((h) => (
              <div key={h} className="so-history-row" onClick={() => setTerm(h)}>
                <i className="fa-solid fa-clock-rotate-left so-history-icon"></i>
                <span className="so-history-term">{h}</span>
                <button className="so-history-remove" onClick={(e) => { e.stopPropagation(); removeSearchHistory(h); }}>
                  <i className="fa-solid fa-arrow-up-left"></i>
                </button>
              </div>
            ))}
            {hist.length === 0 && <p className="so-empty">Search for songs or artists</p>}
          </>
        ) : (
          (localResults.length > 0 || ytResults.length > 0 || isSearchingYt) ? (
            <>
              {localResults.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div className="so-results-label">Local Songs</div>
                  <TrackList tracks={localResults} fullQueue={localResults} currentTab="search" />
                </div>
              )}
              {isSearchingYt && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0' }}>
                  <div className="auth-loading-spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }}></div>
                  <span style={{ color: '#aaa', fontSize: '13px' }}>Searching YouTube...</span>
                </div>
              )}
              {!isSearchingYt && ytResults.length > 0 && (
                <div>
                  <div className="so-results-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-brands fa-youtube" style={{ color: '#FF0000', fontSize: '16px' }}></i> YouTube Search
                  </div>
                  <TrackList tracks={ytResults} fullQueue={ytResults} currentTab="search" />
                </div>
              )}
              {!isSearchingYt && ytResults.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', gap: '16px' }}>
                  {localResults.length === 0 && <p className="so-empty" style={{ margin: 0 }}>No results found</p>}
                  {isBackendOffline && (
                    <div className="backend-offline-warning" style={{
                      padding: '16px',
                      background: 'rgba(255, 193, 7, 0.05)',
                      border: '1px solid rgba(255, 193, 7, 0.15)',
                      borderRadius: '12px',
                      maxWidth: '420px',
                      color: '#e0a800',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      textAlign: 'center'
                    }}>
                      <i className="fa-solid fa-circle-info" style={{ marginRight: '8px', fontSize: '14px' }}></i>
                      <strong>Enable YouTube Search & Playback</strong>
                      <p style={{ margin: '6px 0 0 0', color: '#aaa', fontSize: '12px' }}>
                        To search and stream the entire YouTube library instantly, start the local Python server:
                        <code style={{ display: 'block', background: '#111', padding: '6px', borderRadius: '6px', margin: '6px 0 2px 0', fontFamily: 'monospace', color: '#ffc107', border: '1px solid #222' }}>
                          python server.py
                        </code>
                      </p>
                    </div>
                  )}
                </div>
              )}
              {!isSearchingYt && ytResults.length > 0 && isBackendOffline && (
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                  <div className="backend-offline-warning" style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    maxWidth: '420px',
                    color: '#aaa',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    textAlign: 'center'
                  }}>
                    <span style={{ color: '#e0a800', fontWeight: 'bold' }}>Note:</span> YouTube search is offline. Run <code style={{ color: '#ffc107', background: '#111', padding: '2px 6px', borderRadius: '4px' }}>python server.py</code> to enable streaming.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', gap: '16px' }}>
              <p className="so-empty" style={{ margin: 0 }}>No results found</p>
              {isBackendOffline && (
                <div className="backend-offline-warning" style={{
                  padding: '16px',
                  background: 'rgba(255, 193, 7, 0.05)',
                  border: '1px solid rgba(255, 193, 7, 0.15)',
                  borderRadius: '12px',
                  maxWidth: '420px',
                  color: '#e0a800',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  textAlign: 'center'
                }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: '8px', fontSize: '14px' }}></i>
                  <strong>Enable YouTube Search & Playback</strong>
                  <p style={{ margin: '6px 0 0 0', color: '#aaa', fontSize: '12px' }}>
                    To search and stream the entire YouTube library instantly, start the local Python server:
                    <code style={{ display: 'block', background: '#111', padding: '6px', borderRadius: '6px', margin: '6px 0 2px 0', fontFamily: 'monospace', color: '#ffc107', border: '1px solid #222' }}>
                      python server.py
                    </code>
                  </p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
