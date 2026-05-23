import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import firebase, { auth, db } from '../firebase';
import { searchYoutube } from '../utils/youtube';

const AuthContext = createContext(null);

const CATEGORIES = [
  { key: 'arabic', label: 'Arabic' },
  { key: 'malayalam', label: 'Malayalam' },
  { key: 'english', label: 'English' },
  { key: 'urdu', label: 'Urdu' },
  { key: 'others', label: 'Others' },
];

const HISTORY_MAX = 50;
const RECENTS_MAX = 8;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbTracks, setDbTracks] = useState([]);
  const [ytTracks, setYtTracks] = useState([]);
  const [likedSongIds, setLikedSongIds] = useState(new Set());
  const [historyList, setHistoryList] = useState([]);
  const [speedDialPicks, setSpeedDialPicks] = useState([]);

  const allTracks = [...dbTracks, ...ytTracks];
  const setAllTracks = setDbTracks;

  useEffect(() => {
    async function loadDefaultYtTracks() {
      try {
        const defaultYt = await searchYoutube('vocal only nasheeds');
        setYtTracks(defaultYt);
      } catch (err) {
        console.error('Failed to load default YouTube tracks:', err);
      }
    }
    loadDefaultYtTracks();
  }, []);

  const localUserId = localStorage.getItem('halaltune_uid') ||
    'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    if (!localStorage.getItem('halaltune_uid')) {
      localStorage.setItem('halaltune_uid', localUserId);
    }
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((fireUser) => {
      setUser(fireUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchAllTracks = useCallback(() => {
    return db.collection('songs').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
      const tracks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllTracks(tracks);
    }, () => {});
  }, []);

  const computeSpeedDial = useCallback((tracks) => {
    let pool = tracks.filter((t) => t.coverArt);
    if (pool.length < 3) pool = [...tracks];
    const maxStreams = Math.max(...pool.map((t) => t.streamCount || 0), 1);
    const weighted = pool.map((t) => ({
      track: t,
      score: Math.random() * 0.6 + ((t.streamCount || 0) / maxStreams) * 0.4,
    }));
    weighted.sort((a, b) => b.score - a.score);
    return weighted.slice(0, 9).map((w) => w.track);
  }, []);

  useEffect(() => {
    if (allTracks.length > 0) {
      setSpeedDialPicks(computeSpeedDial(allTracks));
    }
  }, [dbTracks, ytTracks, computeSpeedDial]);

  const getCategory = useCallback((track) => {
    if (track.language) return track.language.toLowerCase();
    if (track.isMalayalam === true) return 'malayalam';
    return 'others';
  }, []);

  const getTracksByCategory = useCallback((cat) => {
    return allTracks.filter((t) => getCategory(t) === cat);
  }, [allTracks, getCategory]);

  const getLikedTracks = useCallback(() => {
    return allTracks.filter((t) => likedSongIds.has(t.id));
  }, [allTracks, likedSongIds]);

  const toggleLike = useCallback((trackId) => {
    if (!user) return;
    const wasLiked = likedSongIds.has(trackId);
    const newLiked = new Set(likedSongIds);
    if (wasLiked) newLiked.delete(trackId);
    else newLiked.add(trackId);
    setLikedSongIds(newLiked);

    const uid = user.uid;
    const likeRef = db.collection('users').doc(uid).collection('likes').doc(trackId);
    const songRef = db.collection('songs').doc(trackId);
    if (wasLiked) {
      likeRef.delete().catch(() => {
        const revert = new Set(likedSongIds);
        revert.add(trackId);
        setLikedSongIds(revert);
      });
      songRef.update({ likeCount: firebase.firestore.FieldValue.increment(-1) }).catch(() => {});
    } else {
      likeRef.set({ addedAt: firebase.firestore.FieldValue.serverTimestamp() }).catch(() => {
        const revert = new Set(likedSongIds);
        revert.delete(trackId);
        setLikedSongIds(revert);
      });
      songRef.update({ likeCount: firebase.firestore.FieldValue.increment(1) }).catch(() => {});
    }
  }, [user, likedSongIds]);

  const addToHistory = useCallback((trackId) => {
    const entry = { id: trackId, playedAt: Date.now() };
    setHistoryList((prev) => {
      const filtered = prev.filter((e) => e.id !== trackId);
      const updated = [entry, ...filtered].slice(0, HISTORY_MAX);
      if (user) {
        db.collection('users').doc(user.uid).collection('history').doc(trackId).set({
          trackId,
          playedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }).catch(() => {});
      }
      return updated;
    });
  }, [user]);

  const getRecentIds = useCallback(() => {
    return historyList.slice(0, RECENTS_MAX).map((e) => e.id);
  }, [historyList]);

  const getHistoryIds = useCallback(() => {
    return historyList.map((e) => e.id);
  }, [historyList]);

  const clearHistory = useCallback(async () => {
    setHistoryList([]);
    if (user) {
      try {
        const snap = await db.collection('users').doc(user.uid).collection('history').get();
        const batch = db.batch();
        snap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      } catch {}
    }
  }, [user]);

  const loadHistoryFromFirestore = useCallback(async (uid) => {
    try {
      const snap = await db.collection('users').doc(uid).collection('history')
        .orderBy('playedAt', 'desc')
        .limit(HISTORY_MAX)
        .get();
      setHistoryList(snap.docs.map((doc) => ({
        id: doc.data().trackId,
        playedAt: doc.data().playedAt?.toMillis?.() || 0,
      })));
    } catch {
      setHistoryList([]);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, localUserId,
      allTracks, setAllTracks, fetchAllTracks,
      likedSongIds, setLikedSongIds, toggleLike, getLikedTracks,
      historyList, addToHistory, getRecentIds, getHistoryIds, clearHistory,
      loadHistoryFromFirestore,
      speedDialPicks, setSpeedDialPicks, computeSpeedDial,
      getCategory, getTracksByCategory,
      CATEGORIES,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
