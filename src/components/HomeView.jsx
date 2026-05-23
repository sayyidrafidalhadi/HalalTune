import SpeedDial from './SpeedDial';
import Recents from './Recents';
import TrackList from './TrackList';
import { useAuth } from '../store/AuthContext';

export default function HomeView({ onShowAll, onOpenHistory }) {
  const { allTracks } = useAuth();

  return (
    <>
      <Recents onShowAll={onOpenHistory} />
      <SpeedDial />
      {allTracks.length > 0 && (
        <>
          <div className="section-title-row" style={{ marginTop: 8 }}>
            <h2 className="section-heading"><span className="section-dot"></span>All Songs</h2>
          </div>
          <TrackList tracks={allTracks} fullQueue={allTracks} currentTab="all" />
        </>
      )}
    </>
  );
}
