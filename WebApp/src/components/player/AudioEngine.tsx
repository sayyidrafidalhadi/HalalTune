import { useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { usePlayerStore } from '@/store/playerStore'
import { useAuthStore } from '@/store/authStore'
import { APP_ICON } from '@/lib/constants'
import type { Track } from '@/types'

const STREAM_THRESHOLD = 30

function updateMediaSession(track: Track | null, isPlaying: boolean) {
  if (!('mediaSession' in navigator)) return

  if (!track) {
    navigator.mediaSession.playbackState = 'none'
    return
  }

  const isQuran = track.isQuran
  const title = isQuran ? `Ayah ${track.ayahNumber}` : track.title
  const artist = isQuran ? (track.surahName || 'Al-Quran') : track.artist
  const album = isQuran ? 'Al-Quran' : 'HalalTune'

  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist,
    album,
    artwork: [
      { src: track.coverArt || APP_ICON, sizes: '512x512', type: 'image/png' },
    ],
  })

  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

  navigator.mediaSession.setActionHandler('play', () => {
    usePlayerStore.getState().setIsPlaying(true)
  })
  navigator.mediaSession.setActionHandler('pause', () => {
    usePlayerStore.getState().setIsPlaying(false)
  })
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    usePlayerStore.getState().playPrev()
  })
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    usePlayerStore.getState().playNext()
  })
  navigator.mediaSession.setActionHandler('seekforward', () => {
    const howl = window.__howlRef
    if (howl?.state() === 'loaded') {
      howl.seek(Math.min(howl.seek() as number + 10, howl.duration()))
    }
  })
  navigator.mediaSession.setActionHandler('seekbackward', () => {
    const howl = window.__howlRef
    if (howl?.state() === 'loaded') {
      howl.seek(Math.max((howl.seek() as number) - 10, 0))
    }
  })
  navigator.mediaSession.setActionHandler('seekto', (details) => {
    if (details.seekTime != null) {
      const howl = window.__howlRef
      if (howl?.state() === 'loaded') {
        howl.seek(details.seekTime)
      }
    }
  })
}

export default function AudioEngine() {
  const howlRef = useRef<Howl | null>(null)
  const rafRef = useRef<number>(0)
  const seekTargetRef = useRef<number | null>(null)
  const streamLoggedRef = useRef(false)

  const currentQueue = usePlayerStore((s) => s.currentQueue)
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const playbackSpeed = usePlayerStore((s) => s.playbackSpeed)
  const repeatMode = usePlayerStore((s) => s.repeatMode)

  const track = currentQueue[currentTrackIndex]

  useEffect(() => {
    window.__howlRef = null
    streamLoggedRef.current = false
    updateMediaSession(track, isPlaying)

    if (!track?.url) {
      howlRef.current?.unload()
      howlRef.current = null
      nextTrackPreloader.current?.unload()
      nextTrackPreloader.current = null
      return
    }

    const howl = new Howl({
      src: [track.url],
      html5: true,
      volume: volume,
      rate: playbackSpeed,
      onplay: () => {
        usePlayerStore.getState().setIsPlaying(true)
        startRAF()
        navigator.mediaSession.playbackState = 'playing'
      },
      onpause: () => {
        usePlayerStore.getState().setIsPlaying(false)
        stopRAF()
        navigator.mediaSession.playbackState = 'paused'
      },
      onend: () => {
        usePlayerStore.getState().playNext()
      },
      onload: () => {
        usePlayerStore.getState().setDuration(howl.duration())
      },
      onloaderror: () => {
        usePlayerStore.getState().playNext()
      },
    })

    window.__howlRef = howl
    howlRef.current = howl
    howl.play()
    usePlayerStore.getState().setIsPlaying(true)

    preloadNext(currentQueue, currentTrackIndex)

    return () => {
      stopRAF()
      howl.unload()
      howlRef.current = null
      window.__howlRef = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, currentQueue])

  // Track history locally (skip for Quran tracks)
  useEffect(() => {
    streamLoggedRef.current = false
    let checkInterval: ReturnType<typeof setInterval> | null = null

    if (track && isPlaying && !track.isQuran) {
      checkInterval = setInterval(() => {
        const time = usePlayerStore.getState().currentTime
        if (!streamLoggedRef.current && time >= STREAM_THRESHOLD) {
          streamLoggedRef.current = true
          useAuthStore.getState().addToHistory(track.id)
        }
      }, 5000)
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [track?.id, isPlaying])

  useEffect(() => {
    const howl = howlRef.current
    if (!howl) return
    if (isPlaying && !howl.playing()) {
      howl.play()
    } else if (!isPlaying && howl.playing()) {
      howl.pause()
    }
  }, [isPlaying])

  // Sync positionState for lock screen progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (!('mediaSession' in navigator)) return
      const store = usePlayerStore.getState()
      const howl = window.__howlRef
      if (howl?.state() === 'loaded' && howl.playing()) {
        navigator.mediaSession.setPositionState({
          duration: howl.duration(),
          playbackRate: store.playbackSpeed,
          position: howl.seek() as number,
        })
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    howlRef.current?.volume(volume)
  }, [volume])

  useEffect(() => {
    howlRef.current?.rate(playbackSpeed)
  }, [playbackSpeed])

  useEffect(() => {
    if (seekTargetRef.current !== null) {
      const howl = howlRef.current
      if (howl && howl.state() === 'loaded') {
        howl.seek(seekTargetRef.current)
      }
      seekTargetRef.current = null
    }
  })

  function startRAF() {
    function tick() {
      const howl = howlRef.current
      if (howl && howl.playing()) {
        const time = howl.seek() as number
        const dur = howl.duration()
        const store = usePlayerStore.getState()
        store.setCurrentTime(time)
        if (dur > 0) store.setProgress((time / dur) * 100)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function stopRAF() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }

  useEffect(() => {
    const checkTimer = setInterval(() => {
      const { sleepTimer, isPlaying, setIsPlaying } = usePlayerStore.getState()
      if (sleepTimer.endTime && isPlaying && Date.now() >= sleepTimer.endTime) {
        setIsPlaying(false)
        usePlayerStore.getState().clearSleepTimer()
      }
    }, 1000)
    return () => clearInterval(checkTimer)
  }, [])

  return null
}

const nextTrackPreloader: { current: Howl | null } = { current: null }

function preloadNext(queue: Track[], currentIndex: number) {
  if (nextTrackPreloader.current) {
    nextTrackPreloader.current.unload()
    nextTrackPreloader.current = null
  }

  const nextIndex = currentIndex + 1
  if (nextIndex < queue.length && queue[nextIndex]?.url) {
    nextTrackPreloader.current = new Howl({
      src: [queue[nextIndex].url!],
      html5: true,
      volume: 0,
      preload: true,
    })
  }
}
