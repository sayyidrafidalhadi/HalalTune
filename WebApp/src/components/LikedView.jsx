import { useAuth } from '../store/AuthContext';
import TrackList from './TrackList';

export default function LikedView() {
  const { getLikedTracks } = useAuth();
  const tracks = getLikedTracks();

  return (
    <>
      <div className="section-title-row" style={{ marginBottom: 12 }}>
        <h2 className="section-heading"><span className="section-dot"></span>Liked Songs</h2>
      </div>
      <TrackList tracks={tracks} fullQueue={tracks} currentTab="liked" />
    </>
  );
}
