import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { cn, formatTime } from '@/lib/utils'
import Waveform from '@/components/player/Waveform'

function QuranMiniPlayer({ track, isPlaying, togglePlay }: {
  track: NonNullable<ReturnType<ReturnType<typeof usePlayerStore>['currentTrack']>>
  isPlaying: boolean
  togglePlay: () => void
}) {
  const { setFsPlayerOpen } = useUIStore()
  const isBismillah = track.ayahNumber === 0

  return (
    <div className="flex items-center justify-between h-full px-2 md:px-6 gap-2">
      <div
        className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
        onClick={() => setFsPlayerOpen(true)}
      >
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg shrink-0 bg-white/10 flex items-center justify-center">
          <i className="fa-solid fa-quran text-white/60 text-xs md:text-sm" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs md:text-sm font-medium truncate max-w-[120px] md:max-w-[200px]">
            {track.surahName || 'Al-Quran'}
          </h4>
          <p className="text-[10px] md:text-xs text-white/50 truncate max-w-[120px] md:max-w-[200px]">
            {isBismillah ? 'Bismillah' : `Ayah ${track.ayahNumber}`}
          </p>
        </div>
      </div>

      {track.arabicText && (
        <p className="hidden md:block text-xs text-white/40 truncate max-w-[160px] text-right font-arabic" dir="rtl">
          {track.arabicText.slice(0, 40)}...
        </p>
      )}

      <motion.button
        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0"
        onClick={(e) => { e.stopPropagation(); togglePlay() }}
        whileTap={{ scale: 0.9 }}
      >
        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[10px] md:text-sm ${isPlaying ? '' : 'ml-0.5'}`} />
      </motion.button>
    </div>
  )
}

export default function MiniPlayer() {
  const {
    currentTrack: getCurrentTrack, isPlaying, progress, currentTime, duration,
    togglePlay, playNext, playPrev,
  } = usePlayerStore()
  const { setFsPlayerOpen } = useUIStore()

  const track = getCurrentTrack()
  if (!track) return null

  return (
    <AnimatePresence>
      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="fixed bottom-0 left-0 w-full z-[200] md:bottom-0 md:left-sidebar md:w-[calc(100%-250px)]
                   md:h-player-desktop h-player-mobile
                   md:bg-surface md:border-t md:border-white/10
                   md:rounded-none
                   md:bottom-0
                   max-md:bottom-bottom-nav
                   max-md:left-3 max-md:right-3 max-md:w-auto
                   max-md:h-player-mobile max-md:rounded-2xl
                   max-md:bg-black/70 max-md:backdrop-blur-xl
                   max-md:border max-md:border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div
            className="h-full bg-white transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {track.isQuran ? (
          <QuranMiniPlayer track={track} isPlaying={isPlaying} togglePlay={togglePlay} />
        ) : (
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            {/* Left: Cover + Info */}
            <div
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={() => setFsPlayerOpen(true)}
            >
              <div className={cn(
                'w-10 h-10 md:w-12 md:h-12 rounded-lg shrink-0 flex items-center justify-center overflow-hidden',
                track.coverArt ? '' : 'bg-white/5'
              )}>
                {track.coverArt ? (
                  <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-music text-white/30" />
                )}
              </div>
              <div className="min-w-0 flex-1 hidden md:block">
                <h4 className="text-sm font-medium truncate max-w-[200px]">{track.title}</h4>
                <p className="text-xs text-white/50 truncate max-w-[200px]">{track.artist}</p>
              </div>
              <div className="w-20 h-8 md:hidden">
                <Waveform barCount={24} />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 flex-1 max-w-[300px]">
              <span className="text-xs text-white/40 w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
              <div className="flex-1 h-8">
                <Waveform barCount={36} />
              </div>
              <span className="text-xs text-white/40 w-10 tabular-nums">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <motion.button
                className="hidden md:flex text-white/70 hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); playPrev() }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fa-solid fa-backward-step text-lg" />
              </motion.button>

              <motion.button
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); togglePlay() }}
                whileTap={{ scale: 0.9 }}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-sm ${isPlaying ? '' : 'ml-0.5'}`} />
              </motion.button>

              <motion.button
                className="hidden md:flex text-white/70 hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); playNext() }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fa-solid fa-forward-step text-lg" />
              </motion.button>
            </div>
          </div>
        )}
      </motion.footer>
    </AnimatePresence>
  )
}
