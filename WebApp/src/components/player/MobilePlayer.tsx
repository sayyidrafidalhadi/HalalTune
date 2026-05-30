import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { cn, formatTime } from '@/lib/utils'
import Waveform from './Waveform'
import LyricsPanel from './LyricsPanel'

export default function MobilePlayer() {
  const location = useLocation()
  const { fsPlayerOpen, setFsPlayerOpen } = useUIStore()
  const {
    currentTrack: getCurrentTrack, isPlaying, currentTime, duration, progress,
    togglePlay, playNext, playPrev, setVolume, volume,
    repeatMode, cycleRepeatMode, toggleShuffle, isShuffle,
    setPlaybackSpeed, playbackSpeed,
  } = usePlayerStore()
  const [showLyrics, setShowLyrics] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const track = getCurrentTrack()
  if (!track || track.isQuran) return null
  if (['/profile', '/settings', '/search'].includes(location.pathname)) return null

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <AnimatePresence>
      {!fsPlayerOpen && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-[68px] left-2 right-2 z-[150] md:hidden"
        >
          <div
            className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
            onClick={() => setFsPlayerOpen(true)}
          >
            <div className="h-0.5 bg-white/10 w-full">
              <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex items-center gap-3 p-3">
              <div className={cn(
                'w-12 h-12 rounded-xl shrink-0 overflow-hidden',
                track.coverArt ? '' : 'bg-white/5 flex items-center justify-center'
              )}>
                {track.coverArt ? (
                  <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-music text-white/30" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{track.title}</h4>
                <p className="text-xs text-white/50 truncate">{track.artist}</p>
              </div>

              <motion.button
                onClick={(e) => { e.stopPropagation(); togglePlay() }}
                whileTap={{ scale: 0.85 }}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0"
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-sm ${isPlaying ? '' : 'ml-0.5'}`} />
              </motion.button>

              <button
                onClick={(e) => { e.stopPropagation(); playNext() }}
                className="text-white/70 p-1 shrink-0"
              >
                <i className="fa-solid fa-forward-step text-lg" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full screen mobile player — Apple Music style */}
      <AnimatePresence>
        {fsPlayerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed inset-0 z-[300] md:hidden flex flex-col bg-black"
          >
            {track.coverArt && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${track.coverArt})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black backdrop-blur-xl" />

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-2 pb-1 shrink-0">
                <button onClick={() => setFsPlayerOpen(false)} className="text-white/70 p-2 -ml-2">
                  <i className="fa-solid fa-chevron-down text-xl" />
                </button>
                <span className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">Now Playing</span>
                <div className="w-9" />
              </div>

              {/* Scrollable content area */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto px-5 scrollbar-none"
              >
                {/* Artwork */}
                <div className="flex justify-center pt-2 pb-4">
                  <motion.div
                    layoutId={`player-art-${track.id}`}
                    className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                  >
                    {track.coverArt ? (
                      <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <i className="fa-solid fa-music text-5xl text-white/20" />
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Track Info */}
                <div className="text-center mb-5">
                  <h2 className="text-lg font-bold truncate">{track.title}</h2>
                  <p className="text-sm text-white/50 truncate mt-0.5">{track.artist}</p>
                </div>

                {/* Progress */}
                <div className="mb-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={progress}
                    onChange={(e) => {
                      const pct = parseFloat(e.target.value)
                      const howl = window.__howlRef
                      if (howl?.state() === 'loaded') {
                        howl.seek((pct / 100) * howl.duration())
                      }
                    }}
                    className="w-full h-1 appearance-none bg-white/15 rounded-full cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                  <div className="flex justify-between text-[11px] text-white/40 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
                  </div>
                </div>

                {/* Waveform */}
                <div className="h-10 mb-3">
                  <Waveform barCount={32} />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6 mb-5">
                  <button onClick={toggleShuffle} className={cn('text-lg', isShuffle ? 'text-white' : 'text-white/30')}>
                    <i className="fa-solid fa-shuffle" />
                  </button>
                  <button onClick={playPrev} className="text-white/70 text-xl">
                    <i className="fa-solid fa-backward-step" />
                  </button>
                  <motion.button
                    onClick={togglePlay}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl shadow-xl"
                  >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} ${isPlaying ? '' : 'ml-1'}`} />
                  </motion.button>
                  <button onClick={playNext} className="text-white/70 text-xl">
                    <i className="fa-solid fa-forward-step" />
                  </button>
                  <button onClick={cycleRepeatMode} className={cn('text-lg', repeatMode !== 'off' ? 'text-white' : 'text-white/30')}>
                    <i className="fa-solid fa-repeat" />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 mb-6 max-w-[280px] mx-auto">
                  <i className="fa-solid fa-volume-off text-white/30 text-xs w-3 text-center" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 appearance-none bg-white/15 rounded-full cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                  <i className="fa-solid fa-volume-high text-white/30 text-xs w-3 text-center" />
                </div>

                {/* Speed selector */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                        s === playbackSpeed
                          ? 'bg-white/15 text-white border border-white/20'
                          : 'bg-white/5 text-white/40 border border-white/5'
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                {/* Lyrics toggle */}
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className="flex items-center gap-2 mx-auto mb-4 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <i className={`fa-solid fa-chevron-${showLyrics ? 'down' : 'up'} text-[10px]`} />
                  <span className="font-medium uppercase tracking-wider">{showLyrics ? 'Hide' : 'Show'} Lyrics</span>
                </button>

                {/* Lyrics panel */}
                <AnimatePresence>
                  {showLyrics && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-8"
                    >
                      <div className="h-[300px]">
                        <LyricsPanel />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom spacer for safe area */}
                <div className="h-4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}
