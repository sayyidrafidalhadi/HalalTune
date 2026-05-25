import { useAuth } from '../store/AuthContext';
import { usePlayer } from '../store/PlayerContext';
import { motion } from 'framer-motion';

export default function SpeedDial() {
  const { speedDialPicks, computeSpeedDial, allTracks } = useAuth();
  const { currentTrack, currentQueue, currentTrackIndex, playTrack, setCurrentQueue, setCurrentTrackIndex } = usePlayer();

  const picks = speedDialPicks.length > 0 ? speedDialPicks : computeSpeedDial(allTracks);
  if (picks.length === 0) return null;

  const handlePlay = (track, index) => {
    setCurrentQueue([...picks]);
    setCurrentTrackIndex(index);
    playTrack([...picks], index);
  };

  return (
    <div className="speed-dial-section">
      <div className="speed-dial-header">
        <div className="speed-dial-title-group">
          <span className="speed-dial-icon"><i className="fa-solid fa-bolt"></i></span>
          <span className="speed-dial-title">Speed Dial</span>
        </div>
      </div>
      <div className="speed-dial-grid">
        {picks.map((track, index) => {
          const isPlaying = currentTrack && currentTrack.id === track.id;
          return (
            <motion.div
              key={track.id}
              className={`speed-dial-card${isPlaying ? ' sd-playing' : ''}`}
              data-track-id={track.id}
              onClick={() => handlePlay(track, index)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div
                className={`sd-art${!track.coverArt ? ' sd-no-art' : ''}`}
                style={track.coverArt ? { backgroundImage: `url('${track.coverArt}')` } : {}}
              >
                {!track.coverArt && <i className="fa-solid fa-music sd-music-icon"></i>}
                <div className="sd-play-ring">
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                </div>
              </div>
              <div className="sd-info">
                <span className="sd-title">{track.title}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
