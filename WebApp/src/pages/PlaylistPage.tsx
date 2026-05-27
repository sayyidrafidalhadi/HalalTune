import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useLibraryStore } from "@/store/libraryStore"
import { usePlayerStore } from "@/store/playerStore"
import { useAuthStore } from "@/store/authStore"
import { cn, formatTime } from "@/lib/utils"
import { EmptyState } from "@/components/shared"
import { easings } from "@/lib/easings"
import type { Track } from "@/types"

function totalDuration(tracks: Track[]): string {
  const total = tracks.reduce((acc, t) => acc + (t.duration || 0), 0)
  const hours = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  return hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`
}

interface TrackRowProps {
  track: Track
  index: number
  isActive: boolean
  isPlaying: boolean
  onPlay: () => void
}

function TrackRow({ track, index, isActive, isPlaying, onPlay }: TrackRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.3, ease: easings }}
      onClick={onPlay}
      className={cn(
        "group grid grid-cols-[32px_1fr_auto_auto] md:grid-cols-[32px_1fr_1fr_auto_auto] gap-3 md:gap-4 items-center px-3 py-2 rounded-lg cursor-pointer transition-colors",
        isActive
          ? "bg-emerald-500/10"
          : "hover:bg-white/[0.04]"
      )}
    >
      {/* Number / Play button */}
      <div className="text-sm text-emerald-400/40 text-right tabular-nums group-hover:hidden">
        {isActive ? <i className="fa-solid fa-volume-high text-emerald-400 text-xs" /> : index + 1}
      </div>
      <div className="hidden group-hover:flex items-center justify-end text-sm text-emerald-400">
        <i className={`fa-solid ${isActive && isPlaying ? "fa-pause" : "fa-play"} text-xs ${isActive && isPlaying ? "" : "ml-0.5"}`} />
      </div>

      {/* Track info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "w-10 h-10 rounded shrink-0 overflow-hidden",
          track.coverArt ? "" : "bg-white/5 flex items-center justify-center"
        )}>
          {track.coverArt ? (
            <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
          ) : (
            <i className="fa-solid fa-music text-xs text-emerald-400/20" />
          )}
        </div>
        <div className="min-w-0">
          <p className={cn(
            "text-sm truncate font-medium",
            isActive ? "text-emerald-400" : "text-emerald-400 group-hover:text-emerald-400/90"
          )}>
            {track.title}
          </p>
          <p className="text-xs text-emerald-400/40 truncate md:hidden">{track.artist}</p>
        </div>
      </div>

      {/* Artist (desktop) */}
      <p className="hidden md:block text-sm text-emerald-400/40 truncate hover:text-emerald-400/70 transition-colors">
        {track.artist}
      </p>

      {/* Like */}
      <button
        onClick={(e) => { e.stopPropagation() }}
        className="text-emerald-400/20 hover:text-emerald-400/60 transition-colors opacity-0 group-hover:opacity-100"
      >
        <i className="fa-regular fa-heart text-xs" />
      </button>

      {/* Duration */}
      <span className="text-sm text-emerald-400/40 tabular-nums text-right">
        {track.duration ? formatTime(track.duration) : "--:--"}
      </span>
    </motion.div>
  )
}

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { playlists, tracks } = useLibraryStore()
  const { setQueue, currentTrack: getCurrentTrack, isPlaying } = usePlayerStore()
  const { isLiked, toggleLike } = useAuthStore()

  const playlist = playlists.find((p) => p.id === id)
  const playlistTracks = useMemo(
    () => tracks.filter((t) => playlist?.trackIds.includes(t.id)),
    [tracks, playlist]
  )
  const nowPlaying = getCurrentTrack()

  if (!playlist) {
    return (
      <EmptyState
        icon="fa-list"
        title="Playlist not found"
        action={{ label: "Go back", onClick: () => navigate(-1) }}
      />
    )
  }

  const liked = isLiked(playlist.id)
  const durationStr = totalDuration(playlistTracks)

  const handlePlayAll = (shuffle: boolean) => {
    setQueue(playlistTracks, 0)
  }

  return (
    <div className="pb-12">
      {/* Header with dynamic background */}
      <div className="relative -mx-4 md:-mx-8 -mt-4 md:-mt-6 mb-6 overflow-hidden">
        {/* Blurred gradient background */}
        <div className="absolute inset-0 h-[320px] md:h-[400px]">
          {playlist.coverArt ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${playlist.coverArt})`, filter: "blur(60px) saturate(1.4)" }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/60 via-emerald-900/40 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 md:px-8 pt-8 md:pt-12 pb-6 md:pb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-5 md:gap-8">
            {/* Giant cover art */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easings }}
              className={cn(
                "w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[300px] md:h-[300px] lg:w-[360px] lg:h-[360px] shrink-0 rounded-2xl overflow-hidden shadow-2xl mx-auto md:mx-0",
                "border border-white/[0.06]",
                playlist.coverArt ? "" : "bg-gradient-to-br from-emerald-600/30 via-emerald-800/20 to-black flex items-center justify-center"
              )}
            >
              {playlist.coverArt ? (
                <motion.img
                  src={playlist.coverArt}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.7, ease: easings }}
                />
              ) : (
                <i className="fa-solid fa-list text-6xl md:text-7xl text-emerald-400/10" />
              )}
            </motion.div>

            {/* Playlist info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: easings }}
              className="min-w-0 text-center md:text-left"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/50 mb-2">
                <i className="fa-solid fa-list mr-1.5" />
                Playlist
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold truncate mb-2 text-emerald-400 drop-shadow-lg">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-sm md:text-base text-emerald-400/50 max-w-lg line-clamp-2 mb-2">
                  {playlist.description}
                </p>
              )}
              <p className="text-sm text-emerald-400/40">
                <span className="text-emerald-400/70 font-medium">HalalTune</span>
                {" · "}{playlistTracks.length} track{playlistTracks.length !== 1 ? "s" : ""}
                {playlistTracks.length > 0 && ` · ${durationStr}`}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePlayAll(false)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-colors shadow-xl shadow-emerald-500/20"
                >
                  <i className="fa-solid fa-play text-sm" />
                  Play
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePlayAll(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-emerald-400 text-sm font-semibold hover:bg-white/20 transition-colors border border-white/10"
                >
                  <i className="fa-solid fa-shuffle text-sm" />
                  Shuffle
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleLike(playlist.id)}
                  className={cn(
                    "p-3 rounded-full transition-all border",
                    liked
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      : "bg-white/5 border-white/10 text-emerald-400/40 hover:text-emerald-400 hover:bg-white/10"
                  )}
                >
                  <i className={`fa-solid ${liked ? "fa-heart" : "fa-heart"} text-sm`} />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: playlist.name, url: window.location.href })
                    } else {
                      navigator.clipboard?.writeText(window.location.href)
                    }
                  }}
                  className="p-3 rounded-full bg-white/5 border border-white/10 text-emerald-400/40 hover:text-emerald-400 hover:bg-white/10 transition-all"
                >
                  <i className="fa-solid fa-arrow-up-from-bracket text-sm" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Track table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: easings }}
        className="px-0 md:px-2"
      >
        {/* Table header */}
        {playlistTracks.length > 0 && (
          <div className="grid grid-cols-[32px_1fr_auto_auto] md:grid-cols-[32px_1fr_1fr_auto_auto] gap-3 md:gap-4 items-center px-3 pb-2 mb-1 border-b border-white/[0.06] text-xs text-emerald-400/30 uppercase tracking-wider font-semibold">
            <span className="text-right">#</span>
            <span>Title</span>
            <span className="hidden md:block">Artist</span>
            <span />
            <span className="text-right">
              <i className="fa-regular fa-clock" />
            </span>
          </div>
        )}

        {/* Track rows */}
        <div className="space-y-0.5">
          {playlistTracks.length > 0 ? (
            playlistTracks.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i}
                isActive={nowPlaying?.id === track.id}
                isPlaying={isPlaying}
                onPlay={() => setQueue(playlistTracks, i)}
              />
            ))
          ) : (
            <EmptyState icon="fa-music" title="This playlist is empty" desc="Search for tracks to add" />
          )}
        </div>
      </motion.div>
    </div>
  )
}
