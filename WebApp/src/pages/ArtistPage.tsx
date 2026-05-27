import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useLibraryStore } from "@/store/libraryStore"
import { usePlayerStore } from "@/store/playerStore"
import { cn } from "@/lib/utils"

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>()
  const { tracks } = useLibraryStore()
  const { setQueue, currentTrack } = usePlayerStore()

  const artistName = id?.replace(/-/g, " ") || ""
  const artistTracks = tracks.filter(
    (t) => t.artist.toLowerCase() === artistName.toLowerCase()
  )
  const nowPlaying = currentTrack()

  if (artistTracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
        <i className="fa-solid fa-user text-3xl" />
        <p className="text-sm">Artist not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end gap-6"
      >
        <div className="w-48 h-48 rounded-full shrink-0 bg-gradient-to-br from-emerald-900/30 to-black flex items-center justify-center overflow-hidden shadow-lg border-2 border-white/10">
          {artistTracks[0]?.coverArt ? (
            <img src={artistTracks[0].coverArt} alt="" className="w-full h-full object-cover" />
          ) : (
            <i className="fa-solid fa-user text-5xl text-white/20" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Artist</p>
          <h1 className="text-3xl md:text-4xl font-extrabold truncate mb-2">{artistName}</h1>
          <p className="text-sm text-white/50">{artistTracks.length} tracks</p>
        </div>
      </motion.div>

      <div className="space-y-1">
        {artistTracks.map((track) => {
          const isActive = nowPlaying?.id === track.id
          return (
            <motion.div
              key={track.id}
              onClick={() => setQueue(artistTracks, artistTracks.indexOf(track))}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group",
                isActive ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg shrink-0 flex items-center justify-center overflow-hidden",
                track.coverArt ? "" : "bg-white/5"
              )}>
                {track.coverArt ? (
                  <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-music text-white/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm truncate", isActive ? "text-emerald-400" : "text-white")}>
                  {track.title}
                </p>
                <p className="text-xs text-white/40 truncate">{track.artist}</p>
              </div>
              <button className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-play text-xs ml-0.5" />
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
