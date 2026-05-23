import { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import TrackList from './TrackList';

const CATEGORIES = [
  { key: 'arabic', label: 'Arabic' },
  { key: 'malayalam', label: 'Malayalam' },
  { key: 'english', label: 'English' },
  { key: 'urdu', label: 'Urdu' },
  { key: 'others', label: 'Others' },
];
const PREVIEW_COUNT = 5;

export default function CategoriesView() {
  const { getTracksByCategory } = useAuth();
  const [seeAll, setSeeAll] = useState({});

  const toggleSeeAll = (key) => {
    setSeeAll((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasAnything = CATEGORIES.some((cat) => getTracksByCategory(cat.key).length > 0);

  if (!hasAnything) {
    return (
      <div className="dl-empty">
        <i className="fa-solid fa-layer-group dl-empty-icon"></i>
        <p>No tracks in the library yet.</p>
        <p style={{ fontSize: '.8rem', color: '#555' }}>Songs uploaded by the admin will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {CATEGORIES.map((cat) => {
        const tracks = getTracksByCategory(cat.key);
        if (tracks.length === 0) return null;
        const visible = seeAll[cat.key] ? tracks : tracks.slice(0, PREVIEW_COUNT);

        return (
          <div key={cat.key} className="song-section" id={`section-${cat.key}`}>
            <div className="section-title-row">
              <h2 className="section-heading">
                <span className={`section-dot cat-dot-${cat.key}`}></span>{cat.label}
              </h2>
              {tracks.length > PREVIEW_COUNT && (
                <button className="section-see-all" onClick={() => toggleSeeAll(cat.key)}>
                  {seeAll[cat.key] ? 'Show Less' : 'See All'}
                </button>
              )}
            </div>
            <div className="yt-track-list section-track-list">
              <TrackList tracks={visible} fullQueue={tracks} currentTab="categories" />
            </div>
          </div>
        );
      })}
    </>
  );
}
