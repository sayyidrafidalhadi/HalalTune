import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './store/AuthContext';
import { usePlayer } from './store/PlayerContext';
import { db } from './firebase';
import { motion, AnimatePresence } from 'framer-motion';

import IntroScreen from './components/IntroScreen';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import MiniPlayer from './components/MiniPlayer';
import FullScreenPlayer from './components/FullScreenPlayer';
import SearchOverlay from './components/SearchOverlay';
import ProfileModal from './components/ProfileModal';
import HistoryPage from './components/HistoryPage';
import PlaylistView from './components/PlaylistView';
import { PrivacyPage, TermsPage } from './components/LegalPages';
import Toast from './components/Toast';
import HomeView from './components/HomeView';
import CategoriesView from './components/CategoriesView';
import LikedView from './components/LikedView';
import LibraryView from './components/LibraryView';
import PlaylistSelectModal from './components/PlaylistSelectModal';

export default function App() {
  const { user, loading, allTracks, fetchAllTracks, setAllTracks, likedSongIds, setLikedSongIds,
    historyList, loadHistoryFromFirestore, computeSpeedDial, setSpeedDialPicks } = useAuth();
  const { fsOpen, setFsOpen, setCurrentQueue, setCurrentTrackIndex, playTrack, audio } = usePlayer();
  const authLoading = useRef(true);

  const [screen, setScreen] = useState('loading'); // loading | intro | auth | app
  const [currentTab, setCurrentTab] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [playlistView, setPlaylistView] = useState(null); // { playlist, open }
  const [playlistSelectTrack, setPlaylistSelectTrack] = useState(null);

  let _unsubLikes = useRef(null);
  let _unsubTracks = useRef(null);
  let appInitialised = useRef(false);

  // Auth state resolved
  useEffect(() => {
    if (!loading) {
      authLoading.current = false;
    }
  }, [loading]);

  useEffect(() => {
    if (user && !appInitialised.current) {
      appInitialised.current = true;
      setScreen('app');

      // Likes listener
      _unsubLikes.current = db.collection('users').doc(user.uid).collection('likes').onSnapshot(
        (snap) => {
          const newSet = new Set();
          snap.forEach((doc) => newSet.add(doc.id));
          setLikedSongIds(newSet);
        },
        () => {}
      );

      // Fetch tracks + history
      loadHistoryFromFirestore(user.uid);

      if (!_unsubTracks.current) {
        _unsubTracks.current = db.collection('songs').orderBy('createdAt', 'desc').onSnapshot(
          (snapshot) => {
            const tracks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setAllTracks(tracks);
            setSpeedDialPicks(computeSpeedDial(tracks));
            restoreSession(tracks);
          },
          () => {}
        );
      }
    } else if (user === null && !loading) {
      appInitialised.current = false;
      if (_unsubLikes.current) { _unsubLikes.current(); _unsubLikes.current = null; }
      if (_unsubTracks.current) { _unsubTracks.current(); _unsubTracks.current = null; }
      setAllTracks([]);
      setLikedSongIds(new Set());
      setScreen(localStorage.getItem('ht_intro_done') ? 'auth' : 'intro');
    }
  }, [user, loading]);

  const restoreSession = useCallback((tracks) => {
    try {
      const raw = sessionStorage.getItem('ht_session');
      if (!raw || !tracks.length) return;
      const s = JSON.parse(raw);
      const queue = s.queue.map((id) => tracks.find((t) => t.id === id)).filter(Boolean);
      if (!queue.length) return;
      setCurrentQueue(queue);
      const idx = Math.min(s.qIdx, queue.length - 1);
      setCurrentTrackIndex(idx);
      const track = queue[idx];
      if (track) {
        audio.src = track.url;
        audio.currentTime = s.position || 0;
      }
    } catch {}
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('ht_intro_done', '1');
    setScreen('auth');
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const handleOpenHistory = () => setHistoryOpen(true);

  const handleOpenPlaylistView = (pl) => {
    setPlaylistView({ playlist: pl, open: true });
  };

  const handleClosePlaylistView = () => {
    setPlaylistView({ playlist: null, open: false });
  };

  useEffect(() => {
    const handleOpen = (e) => {
      setPlaylistSelectTrack(e.detail.track);
    };
    window.addEventListener('ht-open-playlist-select', handleOpen);
    return () => window.removeEventListener('ht-open-playlist-select', handleOpen);
  }, []);



  if (screen === 'loading') {
    return (
      <div className="auth-loading-screen" style={{ display: 'flex' }}>
        <img src="icon.png" alt="HalalTune" className="filtered-icon auth-loading-logo" />
        <div className="auth-loading-spinner"></div>
      </div>
    );
  }

  if (screen === 'intro') {
    return <IntroScreen onGetStarted={handleGetStarted} />;
  }

  if (screen === 'auth') {
    return <AuthScreen />;
  }

  // Main app
  const renderView = () => {
    const pageVariants = {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.8, 0.25, 1] } },
      exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } }
    };

    let viewComponent;
    switch (currentTab) {
      case 'all':
        viewComponent = <HomeView onOpenHistory={handleOpenHistory} />;
        break;
      case 'categories':
        viewComponent = <CategoriesView />;
        break;
      case 'liked':
        viewComponent = <LikedView />;
        break;
      case 'library':
        viewComponent = <LibraryView openPlaylistView={handleOpenPlaylistView} />;
        break;
      default:
        viewComponent = <HomeView onOpenHistory={handleOpenHistory} />;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ width: '100%', height: '100%' }}
        >
          {viewComponent}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="yt-app-layout" style={{ display: 'flex', opacity: 1 }}>
      <Sidebar currentTab={currentTab} onTabChange={handleTabChange} onProfileOpen={() => setProfileOpen(true)} />

      <main className="yt-main-content">
        <TopBar onSearchOpen={() => setSearchOpen(true)} />

        <div className="yt-content-area" id="content-area">
          {renderView()}
        </div>
      </main>

      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} user={user} onProfileOpen={() => setProfileOpen(true)} />

      <MiniPlayer onOpenFs={() => setFsOpen(true)} />
      <AnimatePresence>
        {fsOpen && <FullScreenPlayer />}
      </AnimatePresence>
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {profileOpen && (
          <ProfileModal
            onClose={() => setProfileOpen(false)}
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenPrivacy={() => setPrivacyOpen(true)}
            onOpenTerms={() => setTermsOpen(true)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {historyOpen && <HistoryPage onClose={() => setHistoryOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {privacyOpen && <PrivacyPage onClose={() => setPrivacyOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {termsOpen && <TermsPage onClose={() => setTermsOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {playlistView?.open && (
          <PlaylistView
            playlist={playlistView.playlist}
            onClose={handleClosePlaylistView}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {playlistSelectTrack && (
          <PlaylistSelectModal
            track={playlistSelectTrack}
            onClose={() => setPlaylistSelectTrack(null)}
          />
        )}
      </AnimatePresence>
      <Toast />
    </div>
  );
}
