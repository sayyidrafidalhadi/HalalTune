import { useAuth } from '../store/AuthContext';
import { usePlayer } from '../store/PlayerContext';
import { motion } from 'framer-motion';

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

export default function HistoryPage({ onClose }) {
  const { allTracks, getHistoryIds, getCategory, clearHistory } = useAuth();
  const { currentTrack, playTrack, setCurrentQueue, setCurrentTrackIndex } = usePlayer();

  const ids = getHistoryIds();
  const tracks = ids.map((id) => allTracks.find((t) => t.id === id)).filter(Boolean);

  const handlePlay = (track, index) => {
    setCurrentQueue([...tracks]);
    setCurrentTrackIndex(index);
    playTrack([...tracks], index);
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
        <button className="legal-back-btn" onClick={onClose}><i className="fa-solid fa-arrow-left"></i></button>
        <h2>History</h2>
        <button className="history-clear-btn" title="Clear history" onClick={clearHistory}>
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>
      <div className="history-list">
        {tracks.length === 0 ? (
          <p className="history-empty">No listening history yet. Play a song to get started.</p>
        ) : (
          tracks.map((track, index) => {
            const isPlaying = currentTrack && currentTrack.id === track.id;
            const catKey = getCategory(track);
            const catMeta = CATEGORIES.find((c) => c.key === catKey);
            const badgeHtml = catMeta
              ? `<span class="history-lang-badge history-lang-${catKey}">${catMeta.label}</span>`
              : '';

            return (
              <div
                key={track.id + index}
                className={`history-item${isPlaying ? ' history-item-active' : ''}`}
                onClick={() => handlePlay(track, index)}
              >
                {track.coverArt
                  ? <img src={track.coverArt} className="history-item-art" loading="lazy" alt="" />
                  : <div className="history-item-art history-item-art-fallback"><i className="fa-solid fa-music"></i></div>}
                <div className="history-item-meta">
                  <span className="history-item-title">{escHtml(track.title)}</span>
                  <span className="history-item-artist">{escHtml(track.artist)}</span>
                  {badgeHtml && <span dangerouslySetInnerHTML={{ __html: badgeHtml }} />}
                </div>
                <div className="history-item-actions">
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} history-play-icon`}></i>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
