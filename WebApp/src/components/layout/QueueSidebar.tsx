import { motion, AnimatePresence } from "framer-motion"
import { usePlayerStore } from "@/store/playerStore"
import { useUIStore } from "@/store/uiStore"
import { cn } from "@/lib/utils"

export default function QueueSidebar() {
  const { queueOpen, setQueueOpen } = useUIStore()
  const {
    currentQueue, currentTrackIndex, currentTrack,
    playTrack, removeFromQueue, clearQueue,
  } = usePlayerStore()

  const track = currentTrack()

  return (
    <AnimatePresence>
      {queueOpen && (
        <>
          {/* Desktop sidebar */}
          <motion.aside
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:flex flex-col w-[300px] bg-black/90 backdrop-blur-2xl border-l border-white/10 shrink-0 h-full"
          >
            <QueueContent />
          </motion.aside>

          {/* Mobile fullscreen overlay */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed inset-0 z-[400] lg:hidden flex flex-col bg-black"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider">Queue</h3>
              <div className="flex items-center gap-2">
                <button onClick={clearQueue} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Clear
                </button>
                <button onClick={() => setQueueOpen(false)} className="text-white/50 hover:text-white p-1" aria-label="Close queue">
                  <i className="fa-solid fa-xmark text-xl" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <QueueContent />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function QueueContent() {
  const { currentQueue, currentTrackIndex, currentTrack, playTrack, removeFromQueue, clearQueue } = usePlayerStore()
  const { setQueueOpen } = useUIStore()
  const track = currentTrack()

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 lg:flex hidden">
        <h3 className="text-sm font-bold uppercase tracking-wider">Queue</h3>
        <div className="flex items-center gap-2">
                <button onClick={clearQueue} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Clear
                </button>
                <button onClick={() => setQueueOpen(false)} className="text-white/50 hover:text-white p-1" aria-label="Close queue">
                  <i className="fa-solid fa-xmark" />
                </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30 text-sm gap-2">
            <i className="fa-solid fa-music text-2xl" />
            <p>Queue is empty</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {currentQueue.map((t, i) => {
              const isCurrent = i === currentTrackIndex
              return (
                <motion.div
                  key={`${t.id}-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors group",
                    isCurrent ? "bg-white/10" : "hover:bg-white/5"
                  )}
                  onClick={() => { playTrack(t); setQueueOpen(false) }}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg shrink-0 flex items-center justify-center overflow-hidden",
                    t.coverArt ? "" : "bg-white/5"
                  )}>
                    {t.coverArt ? (
                      <img src={t.coverArt} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-music text-white/20" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm truncate",
                      isCurrent ? "text-white font-medium" : "text-white"
                    )}>
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
            })}
          </div>
        )}
      </div>

      {track && (
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-xs text-white/30 truncate">
            Now playing: {track.title}
          </p>
        </div>
      )}
    </>
  )
}
