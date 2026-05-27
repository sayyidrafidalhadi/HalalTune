import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn, formatTime } from '@/lib/utils'
import { SPEEDS } from '@/lib/constants'
import Waveform from '@/components/player/Waveform'
import LyricsPanel from '@/components/player/LyricsPanel'
import SleepTimer from '@/components/player/SleepTimer'

type Tab = 'playing' | 'queue' | 'lyrics'

export default function FullScreenPlayer() {
  const { fsPlayerOpen, setFsPlayerOpen, setQueueOpen } = useUIStore()
  const {
    currentTrack: getCurrentTrack, isPlaying, currentTime, duration, progress,
    volume, playbackSpeed, repeatMode, currentQueue, currentTrackIndex,
    togglePlay, playNext, playPrev, setVolume,
    setPlaybackSpeed, cycleRepeatMode, toggleShuffle, isShuffle,
    playTrack, removeFromQueue, clearQueue,
  } = usePlayerStore()
  const { isLiked, toggleLike } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('playing')
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showSleepTimer, setShowSleepTimer] = useState(false)
  const progressRef = useRef<HTMLInputElement>(null)

  const track = getCurrentTrack()
  if (!track) return null

  const liked = isLiked(track.id)

  const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value)
    const howl = window.__howlRef
    if (howl?.state() === 'loaded') {
      const seekTime = (pct / 100) * howl.duration()
      howl.seek(seekTime)
    }
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const howl = window.__howlRef
    if (howl?.state() === 'loaded') {
      const seekTime = pct * howl.duration()
      howl.seek(seekTime)
    }
  }, [])

  const repeatIcon = repeatMode === 'one' ? 'fa-repeat text-white' : 'fa-repeat'
  const repeatClass = repeatMode !== 'off' ? 'text-white' : 'text-white/50'

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'playing', label: 'Now Playing', icon: 'fa-music' },
    { key: 'queue', label: 'Queue', icon: 'fa-list' },
    { key: 'lyrics', label: 'Lyrics', icon: 'fa-file-lines' },
  ]

  return (
    <AnimatePresence>
      {fsPlayerOpen && (
        <motion.div
          initial={{ y: '100vh' }}
          animate={{ y: 0 }}
          exit={{ y: '100vh' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-[300] flex flex-col will-change-transform"
        >
          {/* Dynamic blurred background */}
          <div className="absolute inset-0 bg-black" />
          {track.coverArt && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: `url(${track.coverArt})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black backdrop-blur-2xl" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <button
                onClick={() => setFsPlayerOpen(false)}
                className="text-white/70 hover:text-white p-2"
                aria-label="Close full screen player"
              >
                <i className="fa-solid fa-chevron-down text-xl" />
              </button>
              <span className="text-xs font-medium text-white/50 uppercase tracking-widest">Now Playing</span>
              <button
                onClick={() => { setFsPlayerOpen(false); setQueueOpen(true) }}
                className="text-white/70 hover:text-white p-2"
                aria-label="Open queue"
              >
                <i className="fa-solid fa-list text-lg" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row lg:items-center overflow-hidden px-4 lg:px-8">
              {/* Left: Artwork + Waveform */}
              <div className="lg:w-1/2 lg:pr-8 flex flex-col items-center">
                {/* Album Art */}
                <motion.div
                  layoutId={`player-art-${track.id}`}
                  className={cn(
                    'w-full max-w-[320px] lg:max-w-[400px] aspect-square rounded-2xl overflow-hidden mb-4 lg:mb-6',
                    'shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-white/10',
                    track.coverArt ? '' : 'bg-white/5 flex items-center justify-center'
                  )}
                >
                  {track.coverArt ? (
                    <motion.img
                      src={track.coverArt}
                      alt=""
                      className="w-full h-full object-cover"
                      animate={{ scale: isPlaying ? 1 : 1.02 }}
                      transition={{ duration: 0.5 }}
                    />
                  ) : (
                    <i className="fa-solid fa-music text-6xl text-white/20" />
                  )}
                </motion.div>

                {/* Waveform */}
                <div className="w-full max-w-[320px] lg:max-w-[400px] h-12 mb-2">
                  <Waveform barCount={48} />
                </div>

                {/* Track Info */}
                <div className="w-full max-w-[320px] lg:max-w-[400px] text-center mb-2">
                  <h2 className="text-xl lg:text-2xl font-bold truncate">{track.title}</h2>
                  <p className="text-sm lg:text-base text-white/60 truncate mt-1">{track.artist}</p>
                </div>
              </div>

              {/* Right: Tab content */}
              <div className="lg:w-1/2 lg:pl-8 flex flex-col flex-1 min-h-0">
                {activeTab === 'playing' && (
                  <div className="flex flex-col justify-center flex-1 py-4">
                    {/* Progress Bar */}
                    <div className="w-full mb-2">
                      <div
                        className="relative w-full h-2 bg-white/10 rounded-full cursor-pointer group"
                        onClick={handleSeek}
                      >
                        <div
                          className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-white transition-colors"
                          style={{ width: `${progress}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          style={{ left: `${progress}%`, marginLeft: '-8px' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-white/50 mt-1.5">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex items-center justify-center gap-4 lg:gap-6 mb-4">
                      <button
                        onClick={toggleShuffle}
                        className={cn('text-lg transition-colors', isShuffle ? 'text-white' : 'text-white/50 hover:text-white')}
                        aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
                      >
                        <i className="fa-solid fa-shuffle" />
                      </button>

                      <button onClick={playPrev} className="text-white/70 hover:text-white text-xl lg:text-2xl" aria-label="Previous track">
                        <i className="fa-solid fa-backward-step" />
                      </button>

                      <motion.button
                        onClick={togglePlay}
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white text-black flex items-center justify-center text-xl lg:text-2xl hover:scale-105 active:scale-95 transition-transform shadow-xl will-change-transform"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} ${isPlaying ? '' : 'ml-1'}`} />
                      </motion.button>

                      <button onClick={playNext} className="text-white/70 hover:text-white text-xl lg:text-2xl" aria-label="Next track">
                        <i className="fa-solid fa-forward-step" />
                      </button>

                      <button
                        onClick={cycleRepeatMode}
                        className={cn('text-lg transition-colors relative', repeatClass)}
                        aria-label={repeatMode === 'one' ? 'Repeat one' : repeatMode === 'all' ? 'Repeat all' : 'Repeat off'}
                      >
                        <i className="fa-solid fa-repeat" />
                        {repeatMode === 'one' && (
                          <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white">1</span>
                        )}
                        {repeatMode === 'all' && (
                          <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white">A</span>
                        )}
                      </button>
                    </div>

                    {/* Secondary Controls */}
                    <div className="flex items-center justify-between px-2 lg:px-4">
                      {/* Volume */}
                      <div className="flex items-center gap-2 group">
                        <i className="fa-solid fa-volume-high text-white/40 text-xs w-4 text-center" />
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-20 lg:w-24 h-1 appearance-none bg-white/20 rounded-full cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                            [&::-webkit-slider-thumb]:opacity-0 hover:[&::-webkit-slider-thumb]:opacity-100
                            [&::-webkit-slider-thumb]:transition-opacity"
                        />
                      </div>

                      {/* Playback Speed */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-semibold transition-colors border',
                            showSpeedMenu ? 'bg-white/20 border-white/40 text-white' : 'bg-white/10 border-white/10 text-white/70 hover:text-white'
                          )}
                        >
                          {playbackSpeed}x
                        </button>
                        <AnimatePresence>
                          {showSpeedMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.95 }}
                              className="absolute bottom-full mb-2 right-0 bg-[#1a1a1e] border border-white/10 rounded-xl p-1.5 shadow-2xl"
                            >
                              {SPEEDS.map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false) }}
                                  className={cn(
                                    'block w-full text-left px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                                    speed === playbackSpeed ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                                  )}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Like */}
                      <button
                        onClick={() => toggleLike(track.id)}
                        className={cn('text-lg transition-colors', liked ? 'text-white' : 'text-white/50 hover:text-white')}
                        aria-label={liked ? 'Unlike' : 'Like'}
                      >
                        <i className={`fa-solid ${liked ? 'fa-heart' : 'fa-heart'}`} />
                      </button>

                      {/* Sleep Timer */}
                      <button
                        onClick={() => setShowSleepTimer(!showSleepTimer)}
                        className={cn('text-lg transition-colors', showSleepTimer ? 'text-white' : 'text-white/50 hover:text-white')}
                        aria-label="Sleep timer"
                      >
                        <i className="fa-solid fa-bed" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'queue' && (
                  <div className="flex-1 flex flex-col min-h-0 py-4">
                    <div className="flex items-center justify-between px-2 mb-3">
                      <span className="text-sm text-white/50">Up next ({currentQueue.length} tracks)</span>
                      <button onClick={clearQueue} className="text-xs text-white/40 hover:text-white/70">
                        Clear
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 px-2">
                      {currentQueue.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/30 text-sm gap-2">
                          <i className="fa-solid fa-music text-2xl" />
                          <p>Queue is empty</p>
                        </div>
                      ) : (
                        currentQueue.map((t, i) => {
                          const isCurrent = i === currentTrackIndex
                          return (
                            <motion.div
                              key={`${t.id}-${i}`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors group',
                                isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                              )}
                              onClick={() => playTrack(t)}
                            >
                              <div className={cn(
                                'w-10 h-10 rounded-lg shrink-0 flex items-center justify-center overflow-hidden',
                                t.coverArt ? '' : 'bg-white/5'
                              )}>
                                {t.coverArt ? (
                                  <img src={t.coverArt} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <i className="fa-solid fa-music text-white/20" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn('text-sm truncate', isCurrent ? 'text-white font-medium' : 'text-white')}>
                                  {t.title}
                                </p>
                                <p className="text-xs text-white/40 truncate">{t.artist}</p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeFromQueue(i) }}
                                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/70 transition-all p-1"
                              >
                                <i className="fa-solid fa-xmark text-xs" />
                              </button>
                            </motion.div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'lyrics' && (
                  <div className="flex-1 min-h-0 py-4">
                    <LyricsPanel />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Tabs */}
            <div className="flex items-center justify-center gap-1 px-4 pb-4 pt-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all',
                    activeTab === tab.key
                      ? 'bg-white text-black'
                      : 'text-white/50 hover:text-white'
                  )}
                >
                  <i className={`fa-solid ${tab.icon} text-xs`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Timer modal overlay */}
          <AnimatePresence>
            {showSleepTimer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                onClick={() => setShowSleepTimer(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#1a1a1e] border border-white/10 rounded-2xl w-[320px] shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SleepTimer onClose={() => setShowSleepTimer(false)} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
