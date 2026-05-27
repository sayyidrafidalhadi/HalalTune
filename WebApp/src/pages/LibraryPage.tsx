import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useLibraryStore } from "@/store/libraryStore"
import { usePlayerStore } from "@/store/playerStore"
import { useAuthStore } from "@/store/authStore"
import { useDownloadsStore } from "@/store/downloadStore"
import { cn, formatTime } from "@/lib/utils"
import { EmptyState } from "@/components/shared"
import { easings } from "@/lib/easings"
import type { Track, Playlist } from "@/types"

type LibTab = "playlists" | "liked" | "downloads" | "history"

type SortKey = "recent" | "title-asc" | "title-desc" | "artist-asc" | "artist-desc" | "duration"

type ViewMode = "grid" | "list"

const TABS: { key: LibTab; label: string; icon: string }[] = [
  { key: "playlists", label: "Playlists", icon: "fa-list" },
  { key: "liked", label: "Liked", icon: "fa-heart" },
  { key: "downloads", label: "Downloads", icon: "fa-download" },
  { key: "history", label: "History", icon: "fa-clock-rotate-left" },
]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recently Added" },
  { key: "title-asc", label: "Title A-Z" },
  { key: "title-desc", label: "Title Z-A" },
  { key: "artist-asc", label: "Artist A-Z" },
  { key: "artist-desc", label: "Artist Z-A" },
  { key: "duration", label: "Duration" },
]

function sortTracks(tracks: Track[], key: SortKey): Track[] {
  const sorted = [...tracks]
  switch (key) {
    case "recent":
      return sorted.reverse()
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case "artist-asc":
      return sorted.sort((a, b) => a.artist.localeCompare(b.artist))
    case "artist-desc":
      return sorted.sort((a, b) => b.artist.localeCompare(a.artist))
    case "duration":
      return sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0))
    default:
      return sorted
  }
}

function PlaylistCard({ playlist, index }: { playlist: Playlist; index: number }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.3, ease: easings }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/playlist/${playlist.id}`)}
      className="group cursor-pointer"
    >
      <div className={cn(
        "w-full aspect-square rounded-2xl overflow-hidden mb-2.5 relative shadow-lg",
        playlist.coverArt ? "" : "bg-gradient-to-br from-emerald-600/20 via-emerald-800/10 to-black flex items-center justify-center"
      )}>
        {playlist.coverArt ? (
          <img src={playlist.coverArt} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <i className="fa-solid fa-list text-4xl text-emerald-400/15" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <i className="fa-solid fa-play text-sm ml-0.5" />
          </motion.div>
        </div>
      </div>
      <p className="text-sm font-semibold truncate px-0.5">{playlist.name}</p>
      <p className="text-xs text-emerald-400/40 truncate px-0.5">{playlist.trackIds.length} tracks</p>
    </motion.div>
  )
}

function TrackGridItem({ track, index, isActive, isPlaying, onPlay }: {
  track: Track; index: number; isActive: boolean; isPlaying: boolean; onPlay: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3, ease: easings }}
      whileHover={{ y: -4 }}
      onClick={onPlay}
      className="group cursor-pointer"
    >
      <div className={cn(
        "w-full aspect-square rounded-2xl overflow-hidden mb-2.5 relative shadow-lg",
        track.coverArt ? "" : "bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center"
      )}>
        {track.coverArt ? (
          <img src={track.coverArt} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <i className="fa-solid fa-music text-3xl text-emerald-400/15" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <i className={`fa-solid ${isActive && isPlaying ? "fa-pause" : "fa-play"} text-sm ${isActive && isPlaying ? "" : "ml-0.5"}`} />
          </div>
        </div>
        {isActive && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-[9px] font-bold text-black">
            NOW
          </div>
        )}
      </div>
      <p className={cn("text-sm font-medium truncate px-0.5", isActive ? "text-emerald-400" : "text-emerald-400")}>{track.title}</p>
      <p className="text-xs text-emerald-400/40 truncate px-0.5">{track.artist}</p>
    </motion.div>
  )
}

function TrackListItem({ track, index, isActive, isPlaying, onPlay }: {
  track: Track; index: number; isActive: boolean; isPlaying: boolean; onPlay: () => void
}) {
  const { likedSongIds } = useAuthStore()
  const { downloadedIds } = useDownloadsStore()
  const liked = likedSongIds.has(track.id)
  const downloaded = downloadedIds.has(track.id)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015, duration: 0.25, ease: easings }}
      onClick={onPlay}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
        isActive ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/[0.04] border border-transparent"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg shrink-0 overflow-hidden",
        track.coverArt ? "" : "bg-white/5 flex items-center justify-center"
      )}>
        {track.coverArt ? (
          <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
        ) : (
          <i className="fa-solid fa-music text-xs text-emerald-400/20" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm truncate font-medium", isActive ? "text-emerald-400" : "text-emerald-400 group-hover:text-emerald-400/90")}>
          {track.title}
        </p>
        <p className="text-xs text-emerald-400/40 truncate">{track.artist}</p>
      </div>
      <div className="flex items-center gap-2.5">
        {downloaded && <i className="fa-solid fa-circle-check text-emerald-400/60 text-xs" />}
        {liked && <i className="fa-solid fa-heart text-emerald-400/60 text-xs" />}
        <span className="text-xs text-emerald-400/30 tabular-nums">{track.duration ? formatTime(track.duration) : "--:--"}</span>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <i className={`fa-solid ${isActive && isPlaying ? "fa-pause" : "fa-play"} text-[10px] ${isActive && isPlaying ? "" : "ml-0.5"}`} />
        </div>
      </div>
    </motion.div>
  )
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<LibTab>("playlists")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("recent")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showSort, setShowSort] = useState(false)

  const { tracks, playlists } = useLibraryStore()
  const { setQueue, currentTrack: getCurrentTrack, isPlaying } = usePlayerStore()
  const { likedSongIds, historyList } = useAuthStore()
  const { downloadedIds } = useDownloadsStore()

  const nowPlaying = getCurrentTrack()

  const likedTracks = useMemo(() => tracks.filter((t) => likedSongIds.has(t.id)), [tracks, likedSongIds])
  const downloadedTracks = useMemo(() => tracks.filter((t) => downloadedIds.has(t.id)), [tracks, downloadedIds])

  const historyTracks = useMemo(() => {
    const map = new Map<string, Track & { playedAt: number }>()
    historyList.forEach((entry) => {
      const t = tracks.find((tr) => tr.id === entry.id)
      if (t) map.set(t.id, { ...t, playedAt: entry.playedAt })
    })
    return Array.from(map.values()).sort((a, b) => b.playedAt - a.playedAt)
  }, [tracks, historyList])

  const searchedPlaylists = useMemo(() => {
    if (!search.trim()) return playlists
    const q = search.toLowerCase()
    return playlists.filter((p) => p.name.toLowerCase().includes(q))
  }, [playlists, search])

  const filterAndSort = useCallback((items: Track[]) => {
    let filtered = items
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = items.filter(
        (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      )
    }
    return sortTracks(filtered, sortKey)
  }, [search, sortKey])

  const sortedLiked = useMemo(() => filterAndSort(likedTracks), [likedTracks, filterAndSort])
  const sortedDownloads = useMemo(() => filterAndSort(downloadedTracks), [downloadedTracks, filterAndSort])
  const sortedHistory = useMemo(() => filterAndSort(historyTracks), [historyTracks, filterAndSort])

  const handlePlay = useCallback((trackList: Track[], index: number) => {
    setQueue(trackList, index)
  }, [setQueue])

  const showSearch = activeTab !== "playlists" || searchedPlaylists.length > 0
  const currentCount =
    activeTab === "playlists" ? searchedPlaylists.length :
    activeTab === "liked" ? sortedLiked.length :
    activeTab === "downloads" ? sortedDownloads.length :
    sortedHistory.length

  return (
    <div className="pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easings }}
        className="mb-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <i className="fa-solid fa-books text-emerald-400 text-sm" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Library</h1>
          </div>
        </div>
        <p className="text-emerald-400/40 text-sm ml-11">{currentCount} item{currentCount !== 1 ? "s" : ""}</p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl bg-white/[0.03] p-1 border border-white/[0.06] w-fit mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
              activeTab === tab.key ? "bg-white text-black shadow-lg" : "text-emerald-400/40 hover:text-emerald-400/70"
            )}
          >
            <i className={`fa-solid ${tab.icon} text-xs`} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search + Controls */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/25 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/5 border border-white/10 text-emerald-400 text-sm placeholder:text-emerald-400/25 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/20 hover:text-emerald-400/50">
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-white/5 border border-white/10 text-xs text-emerald-400/50 hover:text-emerald-400 hover:border-white/20 transition-all"
          >
            <i className="fa-solid fa-arrow-down-wide-short text-xs" />
            <span className="hidden sm:inline">{SORT_OPTIONS.find((o) => o.key === sortKey)?.label}</span>
          </button>
          <AnimatePresence>
            {showSort && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                className="absolute right-0 top-full mt-1.5 z-20 bg-[#1a1a1e] border border-white/10 rounded-xl p-1.5 shadow-2xl min-w-[160px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortKey(opt.key); setShowSort(false) }}
                    className={cn(
                      "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      sortKey === opt.key ? "bg-emerald-500/15 text-emerald-400" : "text-emerald-400/60 hover:bg-white/5 hover:text-emerald-400"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid/List toggle */}
        <div className="flex rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={cn("p-2.5 transition-colors", viewMode === "grid" ? "bg-white/10 text-emerald-400" : "text-emerald-400/30 hover:text-emerald-400/60")}
          >
            <i className="fa-solid fa-grid-2 text-sm" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn("p-2.5 transition-colors", viewMode === "list" ? "bg-white/10 text-emerald-400" : "text-emerald-400/30 hover:text-emerald-400/60")}
          >
            <i className="fa-solid fa-list text-sm" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Playlists Tab */}
        {activeTab === "playlists" && (
          <motion.div
            key="playlists"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {searchedPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {searchedPlaylists.map((pl, i) => (
                  <PlaylistCard key={pl.id} playlist={pl} index={i} />
                ))}
              </div>
            ) : search.trim() ? (
              <EmptyState icon="fa-search" title="No playlists found" desc="Try a different search term" />
            ) : (
              <EmptyState icon="fa-list" title="No playlists yet" desc="Create your first playlist to organize your nasheeds" />
            )}
          </motion.div>
        )}

        {/* Liked Tab */}
        {activeTab === "liked" && (
          <motion.div
            key="liked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {sortedLiked.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sortedLiked.map((t, i) => (
                    <TrackGridItem
                      key={t.id} track={t} index={i}
                      isActive={nowPlaying?.id === t.id} isPlaying={isPlaying}
                      onPlay={() => handlePlay(sortedLiked, i)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 pb-2 mb-1 border-b border-white/[0.06] text-xs text-emerald-400/30 uppercase tracking-wider font-semibold">
                    <span>Title</span>
                    <span className="flex items-center gap-6">
                      <span className="w-6" />
                      <span><i className="fa-regular fa-clock" /></span>
                      <span className="w-8" />
                    </span>
                  </div>
                  {sortedLiked.map((t, i) => (
                    <TrackListItem
                      key={t.id} track={t} index={i}
                      isActive={nowPlaying?.id === t.id} isPlaying={isPlaying}
                      onPlay={() => handlePlay(sortedLiked, i)}
                    />
                  ))}
                </div>
              )
            ) : (
              <EmptyState icon="fa-heart" title="No liked tracks" desc="Tap the heart icon on any track to save it here" />
            )}
          </motion.div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <motion.div
            key="downloads"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {sortedDownloads.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sortedDownloads.map((t, i) => (
                    <TrackGridItem
                      key={t.id} track={t} index={i}
                      isActive={nowPlaying?.id === t.id} isPlaying={isPlaying}
                      onPlay={() => handlePlay(sortedDownloads, i)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 pb-2 mb-1 border-b border-white/[0.06] text-xs text-emerald-400/30 uppercase tracking-wider font-semibold">
                    <span>Title</span>
                    <span className="flex items-center gap-6">
                      <span className="w-6" />
                      <span><i className="fa-regular fa-clock" /></span>
                      <span className="w-8" />
                    </span>
                  </div>
                  {sortedDownloads.map((t, i) => (
                    <TrackListItem
                      key={t.id} track={t} index={i}
                      isActive={nowPlaying?.id === t.id} isPlaying={isPlaying}
                      onPlay={() => handlePlay(sortedDownloads, i)}
                    />
                  ))}
                </div>
              )
            ) : (
              <EmptyState icon="fa-download" title="No downloads" desc="Download tracks to listen offline anytime" />
            )}
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {sortedHistory.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sortedHistory.map((t, i) => (
                    <TrackGridItem
                      key={t.id} track={t} index={i}
                      isActive={nowPlaying?.id === t.id} isPlaying={isPlaying}
                      onPlay={() => handlePlay(sortedHistory, i)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 pb-2 mb-1 border-b border-white/[0.06] text-xs text-emerald-400/30 uppercase tracking-wider font-semibold">
                    <span>Title</span>
                    <span className="flex items-center gap-6">
                      <span className="w-6" />
                      <span><i className="fa-regular fa-clock" /></span>
                      <span className="w-8" />
                    </span>
                  </div>
                  {sortedHistory.map((t, i) => (
                    <TrackListItem
                      key={t.id} track={t} index={i}
                      isActive={nowPlaying?.id === t.id} isPlaying={isPlaying}
                      onPlay={() => handlePlay(sortedHistory, i)}
                    />
                  ))}
                </div>
              )
            ) : (
              <EmptyState icon="fa-clock-rotate-left" title="No history" desc="Tracks you play will appear here" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
