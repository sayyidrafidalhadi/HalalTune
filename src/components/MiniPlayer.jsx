import { usePlayer } from '../store/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MiniPlayer({ onOpenFs }) {
  const {
    currentTrack, isPlaying, progress, togglePlay, playNext, playPrev,
    setCurrentQueue, setCurrentTrackIndex, currentQueue, currentTrackIndex, audio,
  } = usePlayer();

  const handleClick = (e) => {
    if (window.innerWidth <= 768 && !e.target.closest('button') && !e.target.closest('input')) {
      onOpenFs();
    }
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.footer
        className="yt-bottom-player"
        id="mini-player"
        onClick={handleClick}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      >
        <div className="yt-player-content">
          <div className="yt-player-info">
            <motion.div 
              className="yt-player-art" 
              id="player-art"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {currentTrack.coverArt
                ? <img src={currentTrack.coverArt} alt="" />
                : <i className="fa-solid fa-music"></i>}
            </motion.div>
            <div className="yt-player-text">
              <h4 id="player-title">{currentTrack.title}</h4>
              <p id="player-artist">{currentTrack.artist}</p>
            </div>
            
            {/* Spotify Soundwave Animation */}
            {isPlaying && (
              <div className="sound-wave" style={{ marginLeft: '16px' }}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
          <div className="yt-player-controls">
            <motion.button 
              className="yt-ctrl-btn desktop-only" 
              onClick={(e) => { e.stopPropagation(); playPrev(); }}
              whileHover={{ scale: 1.15, color: '#fff' }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-solid fa-backward-step"></i>
            </motion.button>
            
            <motion.button 
              className="yt-ctrl-play" 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ marginLeft: isPlaying ? 0 : '3px' }}></i>
            </motion.button>
            
            <motion.button 
              className="yt-ctrl-btn" 
              onClick={(e) => { e.stopPropagation(); playNext(); }}
              whileHover={{ scale: 1.15, color: '#fff' }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-solid fa-forward-step"></i>
            </motion.button>
          </div>
        </div>
        <div className="yt-player-progress-container">
          <input
            type="range"
            className="yt-slider"
            value={progress}
            max="100"
            onChange={(e) => {
              if (!audio.src || !audio.duration) return;
              const pct = parseFloat(e.target.value);
              audio.currentTime = (pct / 100) * audio.duration;
            }}
          />
        </div>
      </motion.footer>
    </AnimatePresence>
  );
}
