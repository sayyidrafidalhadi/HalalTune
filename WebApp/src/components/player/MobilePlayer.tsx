import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { cn, formatTime } from '@/lib/utils'
import Waveform from './Waveform'
import SleepTimer from './SleepTimer'

export default function MobilePlayer() {
  const { fsPlayerOpen, setFsPlayerOpen } = useUIStore()
  const {
    currentTrack: getCurrentTrack, isPlaying, currentTime, duration, progress,
    togglePlay, playNext, playPrev, setVolume, volume,
    repeatMode, cycleRepeatMode, toggleShuffle, isShuffle,
    setPlaybackSpeed, playbackSpeed,
  } = usePlayerStore()
  const [showExtras, setShowExtras] = useState(false)

  const track = getCurrentTrack()
  if (!track || track.isQuran) return null

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
            {/* Progress bar */}
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

      {/* Full screen mobile player (overlays when fsPlayerOpen) */}
      <AnimatePresence>
        {fsPlayerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed inset-0 z-[300] md:hidden flex flex-col bg-black"
          >
            {/* Background */}
            {track.coverArt && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${track.coverArt})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black backdrop-blur-xl" />

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <button onClick={() => setFsPlayerOpen(false)} className="text-white/70 p-2">
                  <i className="fa-solid fa-chevron-down text-xl" />
                </button>
                <span className="text-xs font-medium text-white/50 uppercase tracking-widest">Now Playing</span>
                <div className="w-10" />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
                {/* Artwork */}
                <motion.div
                  layoutId={`player-art-${track.id}`}
                  className="w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden mb-6 shadow-2xl border border-white/10"
                >
                  {track.coverArt ? (
                    <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <i className="fa-solid fa-music text-5xl text-white/20" />
                    </div>
                  )}
                </motion.div>

                {/* Track Info */}
                <div className="w-full max-w-[300px] text-center mb-4">
                  <h2 className="text-lg font-bold truncate">{track.title}</h2>
                  <p className="text-sm text-white/60 truncate mt-0.5">{track.artist}</p>
                </div>

                {/* Waveform */}
                <div className="w-full max-w-[300px] h-10 mb-4">
                  <Waveform barCount={32} />
                </div>

                {/* Progress */}
                <div className="w-full max-w-[300px] mb-2">
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
                    className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between w-full max-w-[300px] mb-4">
                  <button onClick={toggleShuffle} className={cn('text-lg', isShuffle ? 'text-white' : 'text-white/50')}>
                    <i className="fa-solid fa-shuffle" />
                  </button>
                  <button onClick={playPrev} className="text-white/70 text-xl">
                    <i className="fa-solid fa-backward-step" />
                  </button>
                  <motion.button
                    onClick={togglePlay}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-xl shadow-xl"
                  >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} ${isPlaying ? '' : 'ml-1'}`} />
                  </motion.button>
                  <button onClick={playNext} className="text-white/70 text-xl">
                    <i className="fa-solid fa-forward-step" />
                  </button>
                  <button onClick={cycleRepeatMode} className={cn('text-lg', repeatMode !== 'off' ? 'text-white' : 'text-white/50')}>
                    <i className="fa-solid fa-repeat" />
                  </button>
                </div>

                {/* Extras toggle */}
                <button
                  onClick={() => setShowExtras(!showExtras)}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <i className={`fa-solid fa-chevron-${showExtras ? 'down' : 'up'} text-xs`} />
                  <span>{showExtras ? 'Hide' : 'Show'} more controls</span>
                </button>

                {/* Volume & Speed (collapsible) */}
                <AnimatePresence>
                  {showExtras && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="w-full max-w-[300px] overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        {/* Volume */}
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-volume-high text-white/40 text-xs w-4 text-center" />
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1 appearance-none bg-white/20 rounded-full cursor-pointer
                              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                          />
                        </div>

                        {/* Speed */}
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-gauge-high text-white/40 text-xs w-4 text-center" />
                          <div className="flex gap-1.5 flex-wrap">
                            {SPEEDS.map((s) => (
                              <button
                                key={s}
                                onClick={() => setPlaybackSpeed(s)}
                                className={cn(
                                  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                                  s === playbackSpeed
                                    ? 'bg-white/20 text-white border border-white/30'
                                    : 'bg-white/10 text-white/60 border border-white/10'
                                )}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}
