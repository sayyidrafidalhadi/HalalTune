import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { fetchYoutubeStreamUrl } from '../utils/youtube';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { addToHistory, allTracks, likedSongIds, toggleLike, getCategory } = useAuth();
  const audioRef = useRef(new Audio());
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fsOpen, setFsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const audio = audioRef.current;

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(audio._toastTimer);
    audio._toastTimer = setTimeout(() => setToastVisible(false), 3000);
  }, []);

  useEffect(() => {
    const onTime = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        setProgress(pct);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };
    const onEnd = () => {
      if (isRepeat) { audio.currentTime = 0; audio.play().catch(() => {}); }
      else playNext();
    };
    const onError = () => {
      setIsPlaying(false);
      showToast('Failed to load track. Check your connection.');
    };
    const onWaiting = () => setIsPlaying(false);
    const onPlaying = () => setIsPlaying(true);
    const onCanPlay = () => setIsPlaying(!audio.paused);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [isRepeat]);

  const currentTrack = currentQueue[currentTrackIndex] || null;
  const isLiked = currentTrack ? likedSongIds.has(currentTrack.id) : false;

  const playNextRef = useRef(null);
  const playPrevRef = useRef(null);

  const loadAndPlayAudio = useCallback(async (track) => {
    if (!track) return;
    addToHistory(track.id);
    try {
      let url = track.url;
      if (track.isYoutube || track.id.startsWith('yt_')) {
        showToast('Loading high-quality stream...');
        const ytId = track.youtubeId || track.id.replace('yt_', '');
        url = await fetchYoutubeStreamUrl(ytId);
      }
      audio.src = url;
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } catch (err) {
      showToast('Failed to load YouTube stream.');
      setIsPlaying(false);
      return;
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'HalalTune',
        artwork: [{ src: track.coverArt || 'icon.png', sizes: '512x512', type: 'image/png' }],
      });
      navigator.mediaSession.setActionHandler('play', () => {
        audio.play().catch(() => {});
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (playPrevRef.current) playPrevRef.current();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (playNextRef.current) playNextRef.current();
      });
      navigator.mediaSession.setActionHandler('seekto', (d) => {
        audio.currentTime = d.seekTime;
      });
    }
  }, [audio, addToHistory, showToast]);

  const playTrack = useCallback((queue, index) => {
    let targetQueue = currentQueue;
    let targetIndex = currentTrackIndex;
    if (queue !== undefined) {
      setCurrentQueue(queue);
      targetQueue = queue;
    }
    if (index !== undefined) {
      setCurrentTrackIndex(index);
      targetIndex = index;
    }
    const track = queue ? queue[index] : currentQueue[currentTrackIndex];
    if (track) {
      loadAndPlayAudio(track);
    }
  }, [currentQueue, currentTrackIndex, loadAndPlayAudio]);

  const playNext = useCallback(() => {
    setCurrentTrackIndex((prev) => {
      let next;
      if (isShuffle) next = Math.floor(Math.random() * currentQueue.length);
      else next = prev + 1 >= currentQueue.length ? 0 : prev + 1;
      const track = currentQueue[next];
      if (track) {
        loadAndPlayAudio(track);
      }
      return next;
    });
  }, [isShuffle, currentQueue, loadAndPlayAudio]);

  const playPrev = useCallback(() => {
    setCurrentTrackIndex((prev) => {
      let next;
      if (isShuffle) next = Math.floor(Math.random() * currentQueue.length);
      else next = prev - 1 < 0 ? currentQueue.length - 1 : prev - 1;
      const track = currentQueue[next];
      if (track) {
        loadAndPlayAudio(track);
      }
      return next;
    });
  }, [isShuffle, currentQueue, loadAndPlayAudio]);

  useEffect(() => {
    playNextRef.current = playNext;
    playPrevRef.current = playPrev;
  }, [playNext, playPrev]);

  const togglePlay = useCallback(() => {
    if (!audio.src) return;
    if (audio.paused) { audio.play().catch(() => setIsPlaying(false)); setIsPlaying(true); }
    else { audio.pause(); setIsPlaying(false); }
  }, [audio]);

  const seek = useCallback((pct) => {
    if (!audio.src || !audio.duration) return;
    audio.currentTime = (pct / 100) * audio.duration;
    setProgress(pct);
  }, [audio]);

  const playById = useCallback((trackId) => {
    const idx = allTracks.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      setCurrentQueue([...allTracks]);
      setCurrentTrackIndex(idx);
      playTrack([...allTracks], idx);
    }
  }, [allTracks, playTrack]);

  return (
    <PlayerContext.Provider value={{
      audio,
      currentQueue, setCurrentQueue,
      currentTrackIndex, setCurrentTrackIndex,
      currentTrack, isLiked,
      isShuffle, setIsShuffle,
      isRepeat, setIsRepeat,
      isPlaying, setIsPlaying,
      currentTime, duration, progress,
      fsOpen, setFsOpen,
      toastMsg, toastVisible, showToast,
      playTrack, playNext, playPrev, togglePlay, seek, playById, toggleLike, getCategory,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
