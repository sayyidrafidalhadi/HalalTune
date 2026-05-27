import { useState, useMemo, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLibraryStore } from "@/store/libraryStore"
import { usePlayerStore } from "@/store/playerStore"
import { useAuthStore } from "@/store/authStore"
import { cn, CATEGORIES, getCategory, formatTime } from "@/lib/utils"
import { useDebounce } from "@/hooks"
import { EmptyState } from "@/components/shared"
import { easings } from "@/lib/easings"
import type { Track } from "@/types"

const TRENDING_SEARCHES = [
  "Surah Yaseen", "Quran", "Nasheed", "Peaceful", "Arabic",
  "Mishary Rashid", "Islamic", "Dhikr", "Dua", "Sleep",
]

const BROWSE_CARDS = [
  { label: "Arabic Nasheeds", cat: "arabic", icon: "fa-star-and-crescent", gradient: "from-emerald-600 to-teal-800" },
  { label: "Malayalam", cat: "malayalam", icon: "fa-language", gradient: "from-blue-600 to-indigo-800" },
  { label: "English", cat: "english", icon: "fa-globe", gradient: "from-purple-600 to-violet-800" },
  { label: "Urdu", cat: "urdu", icon: "fa-book-open", gradient: "from-amber-600 to-orange-800" },
  { label: "Peaceful", cat: null, icon: "fa-spa", gradient: "from-teal-500 to-emerald-800" },
  { label: "Spiritual", cat: null, icon: "fa-moon", gradient: "from-indigo-500 to-purple-800" },
]

type ResultTab = "tracks" | "artists" | "playlists"

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="text-white">{part}</span>
    ) : (
      part
    )
  )
}

function getTopResult(tracks: Track[], query: string): Track | null {
  if (!query.trim()) return null
  const q = query.toLowerCase()
  const scored = tracks
    .map((t) => {
      let score = 0
      const title = t.title.toLowerCase()
      const artist = t.artist.toLowerCase()
      if (title === q) score += 100
      else if (title.startsWith(q)) score += 80
      else if (title.includes(q)) score += 50
      if (artist === q) score += 60
      else if (artist.startsWith(q)) score += 40
      else if (artist.includes(q)) score += 20
      if (t.streamCount) score += Math.min(t.streamCount / 1000, 10)
      return { track: t, score }
    })
    .sort((a, b) => b.score - a.score)
  return scored[0]?.score > 0 ? scored[0].track : null
}

interface TrackCardProps {
  track: Track
  index: number
  isActive: boolean
  isPlaying: boolean
  query: string
  onPlay: (track: Track) => void
}

function TrackCard({ track, index, isActive, isPlaying, query, onPlay }: TrackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35, ease: easings }}
      onClick={() => onPlay(track)}
      className={cn(
        "group relative flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all",
        isActive ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/5 border border-transparent"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-lg shrink-0 flex items-center justify-center overflow-hidden shadow-lg",
        track.coverArt ? "" : "bg-gradient-to-br from-white/5 to-white/10"
      )}>
        {track.coverArt ? (
          <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
        ) : (
          <i className="fa-solid fa-music text-white/30 text-lg" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
            <i className={`fa-solid ${isActive && isPlaying ? "fa-pause" : "fa-play"} text-black text-xs ${isActive && isPlaying ? "" : "ml-0.5"}`} />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isActive ? "text-white" : "text-white")}>
          {highlightMatch(track.title, query)}
        </p>
        <p className="text-xs text-white/40 truncate mt-0.5">
          {highlightMatch(track.artist, query)} {track.duration ? `· ${formatTime(track.duration)}` : ""}
        </p>
      </div>
      {track.streamCount && (
        <span className="text-[10px] text-white/20 hidden md:block">{track.streamCount.toLocaleString()} streams</span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onPlay(track) }}
        className="md:hidden w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
      >
        <i className={`fa-solid ${isActive && isPlaying ? "fa-pause" : "fa-play"} text-xs ${isActive && isPlaying ? "" : "ml-0.5"}`} />
      </button>
    </motion.div>
  )
}

interface ArtistCardProps {
  name: string
  count: number
  index: number
  query: string
  onSelect: (name: string) => void
}

function ArtistCard({ name, count, index, query, onSelect }: ArtistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35, ease: easings }}
      onClick={() => onSelect(name)}
      className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-all"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform shadow-lg">
        <i className="fa-solid fa-user text-2xl text-white/60" />
      </div>
      <p className="text-sm font-medium text-center truncate w-full">{highlightMatch(name, query)}</p>
      <p className="text-xs text-white/40">{count} tracks</p>
    </motion.div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<ResultTab>("tracks")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { tracks, playlists } = useLibraryStore()
  const { setQueue, isPlaying, currentTrack: getCurrentTrack } = usePlayerStore()
  const { historyList } = useAuthStore()

  const nowPlaying = getCurrentTrack()
  const debouncedQuery = useDebounce(query, 150)

  const filteredByCategory = useMemo(() => {
    if (!activeCategory) return tracks
    return tracks.filter((t) => getCategory(t.language, t.isMalayalam) === activeCategory)
  }, [tracks, activeCategory])

  const filteredByQuery = useMemo(() => {
    if (!debouncedQuery.trim()) return filteredByCategory
    const q = debouncedQuery.toLowerCase()
    return filteredByCategory.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    )
  }, [filteredByCategory, debouncedQuery])

  const topResult = useMemo(() => getTopResult(filteredByQuery, debouncedQuery), [filteredByQuery, debouncedQuery])

  const artists = useMemo(() => {
    const map = new Map<string, number>()
    filteredByQuery.forEach((t) => {
      map.set(t.artist, (map.get(t.artist) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
  }, [filteredByQuery])

  const filteredPlaylists = useMemo(() => {
    if (!debouncedQuery.trim()) return playlists.slice(0, 8)
    const q = debouncedQuery.toLowerCase()
    return playlists.filter((p) =>
      p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [playlists, debouncedQuery])

  const excludesTopResult = useMemo(() => {
    if (!topResult) return filteredByQuery
    return filteredByQuery.filter((t) => t.id !== topResult.id)
  }, [filteredByQuery, topResult])

  const hasNoResults = debouncedQuery.trim() && filteredByQuery.length === 0

  const handlePlayTrack = useCallback((track: Track) => {
    setQueue(tracks, tracks.indexOf(track))
  }, [tracks, setQueue])

  const handlePlayAll = useCallback(() => {
    if (excludesTopResult.length > 0 || topResult) {
      setQueue(filteredByQuery, 0)
    }
  }, [filteredByQuery, setQueue])

  const handleArtistSelect = useCallback((artist: string) => {
    setQuery(artist)
    setActiveTab("tracks")
    inputRef.current?.focus()
  }, [])

  const trending = TRENDING_SEARCHES

  return (
    <div className="pb-8 max-w-5xl mx-auto">
      <div className="space-y-6">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-5 tracking-tight">
            Search
          </h1>

          {/* Search Input */}
          <div className="relative max-w-2xl group">
            <div className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-transparent opacity-0 transition-opacity duration-300",
              isFocused && "opacity-100"
            )} />
            <div className="relative flex items-center">
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-white/30 text-lg z-10" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="What do you want to listen to?"
                className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all text-base"
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 p-1"
                  >
                    <i className="fa-solid fa-xmark text-lg" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Category Chips (always visible when no query) */}
        <AnimatePresence mode="wait">
          {!debouncedQuery.trim() ? (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Category filter chips */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35, ease: easings }}
                className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1"
              >
                <button
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                    !activeCategory
                      ? "bg-white text-black shadow-lg"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5"
                  )}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 border",
                      activeCategory === cat.key
                        ? "bg-white text-black border-white shadow-lg"
                        : "bg-white/5 text-white/60 hover:bg-white/10 border-white/5"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </motion.div>

              {/* Trending searches */}
              <section>
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Trending Searches</h2>
                <div className="flex flex-wrap gap-2">
                  {trending.map((term, i) => (
                    <motion.button
                      key={term}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.03, duration: 0.3, ease: easings }}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
                    >
                      {term}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Browse all - category cards */}
              <section>
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Browse All</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {BROWSE_CARDS.map((card, i) => (
                    <motion.button
                      key={card.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.04, duration: 0.4, ease: easings }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (card.cat) {
                          setActiveCategory(card.cat)
                        }
                        setQuery(card.label)
                      }}
                      className={cn(
                        "relative h-24 rounded-2xl overflow-hidden p-4 text-left group cursor-pointer",
                        "bg-gradient-to-br",
                        card.gradient
                      )}
                    >
                      <span className="relative z-10 text-sm font-bold text-white drop-shadow-lg">{card.label}</span>
                      <i className={cn(
                        "fa-solid absolute -bottom-2 -right-2 text-5xl text-white/10 group-hover:text-white/20 transition-all group-hover:scale-110",
                        card.icon
                      )} />
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Recently played */}
              {historyList.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Recent Searches</h2>
                  <div className="flex flex-wrap gap-2">
                    {historyList.slice(0, 6).map((entry, i) => {
                      const t = tracks.find((tr) => tr.id === entry.id)
                      if (!t) return null
                      return (
                        <motion.button
                          key={entry.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.03, duration: 0.3, ease: easings }}
                          onClick={() => handlePlayTrack(t)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                          <i className="fa-solid fa-clock-rotate-left text-[10px]" />
                          <span className="truncate max-w-[120px]">{t.title}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easings }}
                className="flex gap-1 rounded-2xl bg-white/[0.03] p-1 border border-white/[0.06] w-fit"
              >
                {[
                  { key: "tracks" as ResultTab, label: "Tracks", icon: "fa-music" },
                  { key: "artists" as ResultTab, label: "Artists", icon: "fa-user" },
                  { key: "playlists" as ResultTab, label: "Playlists", icon: "fa-list" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                      activeTab === tab.key
                        ? "bg-white text-black shadow-lg"
                        : "text-white/40 hover:text-white/70"
                    )}
                  >
                    <i className={`fa-solid ${tab.icon}`} />
                    {tab.label}
                  </button>
                ))}
              </motion.div>

              {/* Results */}
              {hasNoResults ? (
                <EmptyState
                  icon="fa-magnifying-glass"
                  title={`No results for "${query}"`}
                  desc="Check the spelling or try a different search term"
                />
              ) : (
                <>
                  {/* Top Result */}
                  {activeTab === "tracks" && topResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: easings }}
                    >
                      <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Top Result</h2>
                      <motion.div
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handlePlayTrack(topResult)}
                        className={cn(
                          "relative p-5 rounded-2xl overflow-hidden cursor-pointer group",
                          "bg-gradient-to-br from-emerald-500/15 via-emerald-600/5 to-transparent",
                          "border border-emerald-500/20",
                          "hover:from-emerald-500/20 hover:via-emerald-600/8 hover:to-transparent",
                          "transition-all"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shadow-2xl shrink-0",
                            topResult.coverArt ? "" : "bg-gradient-to-br from-emerald-600/30 to-emerald-800/20 flex items-center justify-center"
                          )}>
                            {topResult.coverArt ? (
                              <img src={topResult.coverArt} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <i className="fa-solid fa-music text-3xl text-white/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl md:text-2xl font-bold truncate">
                              {highlightMatch(topResult.title, debouncedQuery)}
                            </h3>
                            <p className="text-sm text-white/50 mt-1 truncate">
                              {highlightMatch(topResult.artist, debouncedQuery)}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePlayTrack(topResult) }}
                                className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors"
                              >
                                <i className={`fa-solid ${nowPlaying?.id === topResult.id && isPlaying ? "fa-pause" : "fa-play"} text-xs`} />
                                {nowPlaying?.id === topResult.id && isPlaying ? "Pause" : "Play"}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation() }}
                                className="p-2 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
                              >
                                <i className="fa-regular fa-heart" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Play all button when tracks tab */}
                  {activeTab === "tracks" && filteredByQuery.length > 1 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handlePlayAll}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <i className="fa-solid fa-play text-xs" />
                      Play All ({filteredByQuery.length} tracks)
                    </motion.button>
                  )}

                  {/* Tracks Tab */}
                  {activeTab === "tracks" && (
                    <div className="space-y-0.5">
                      {excludesTopResult.map((track, i) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          index={i}
                          isActive={nowPlaying?.id === track.id}
                          isPlaying={isPlaying}
                          query={debouncedQuery}
                          onPlay={handlePlayTrack}
                        />
                      ))}
                    </div>
                  )}

                  {/* Artists Tab */}
                  {activeTab === "artists" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {artists.length > 0 ? artists.map((artist, i) => (
                        <ArtistCard
                          key={artist.name}
                          name={artist.name}
                          count={artist.count}
                          index={i}
                          query={debouncedQuery}
                          onSelect={handleArtistSelect}
                        />
                      )) : (
                        <div className="col-span-full">
                          <EmptyState icon="fa-user" title="No artists found" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Playlists Tab */}
                  {activeTab === "playlists" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredPlaylists.length > 0 ? filteredPlaylists.map((playlist, i) => (
                        <motion.div
                          key={playlist.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.35, ease: easings }}
                          whileHover={{ y: -4 }}
                          className="group p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-all"
                        >
                          <div className={cn(
                            "w-full aspect-square rounded-xl overflow-hidden mb-3 shadow-lg",
                            playlist.coverArt ? "" : "bg-gradient-to-br from-emerald-600/20 to-emerald-800/10 flex items-center justify-center"
                          )}>
                            {playlist.coverArt ? (
                              <img src={playlist.coverArt} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <i className="fa-solid fa-list text-3xl text-white/30" />
                            )}
                          </div>
                          <p className="text-sm font-medium truncate">{highlightMatch(playlist.name, debouncedQuery)}</p>
                          <p className="text-xs text-white/40 truncate mt-0.5">
                            {playlist.description || `${playlist.trackIds?.length || 0} tracks`}
                          </p>
                        </motion.div>
                      )) : (
                        <div className="col-span-full">
                          <EmptyState icon="fa-list" title="No playlists found" />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
