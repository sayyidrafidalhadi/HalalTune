import { useAuth } from '../store/AuthContext';
import { usePlayer } from '../store/PlayerContext';
import { motion } from 'framer-motion';

const RECENTS_MAX = 8;

export default function Recents({ onShowAll }) {
  const { allTracks, getRecentIds } = useAuth();
  const { currentTrack, playTrack, setCurrentQueue, setCurrentTrackIndex } = usePlayer();

  const recentIds = getRecentIds();
  if (recentIds.length === 0) return null;

  const recentTracks = recentIds
    .map((id) => allTracks.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, RECENTS_MAX);

  if (recentTracks.length === 0) return null;

  const handlePlay = (track, index) => {
    setCurrentQueue([...recentTracks]);
    setCurrentTrackIndex(index);
    playTrack([...recentTracks], index);
  };

  return (
    <div className="recents-section">
      <div className="recents-header">
        <span className="recents-title">Recents</span>
        <button className="recents-show-all" onClick={onShowAll}>Show all</button>
      </div>
      <div className="recents-strip">
        {recentTracks.map((track, index) => {
          const isPlaying = currentTrack && currentTrack.id === track.id;
          const ringIcon = isPlaying ? 'fa-pause' : 'fa-play';
          return (
            <motion.div
              key={track.id}
              className={`recents-card${isPlaying ? ' rc-playing' : ''}`}
              data-track-id={track.id}
              onClick={() => handlePlay(track, index)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              {track.coverArt ? (
                <div className="rc-art" style={{ backgroundImage: `url('${track.coverArt}')` }}>
                  <div className="rc-play-ring"><i className={`fa-solid ${ringIcon}`}></i></div>
                </div>
              ) : (
                <div className="rc-art rc-no-art">
                  <i className="fa-solid fa-music"></i>
                  <div className="rc-play-ring"><i className={`fa-solid ${ringIcon}`}></i></div>
                </div>
              )}
              <div className="rc-meta">
                <span className="rc-title">{track.title}</span>
                <span className="rc-artist">{track.artist}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
